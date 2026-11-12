/* CircuitVision — the lab bench: a breadboard with real parts and a station of real instruments.
   This file is the model only (no drawing):
     • board geometry: holes a–j × columns, four power rails; which holes are joined inside the board
     • bench state: parts and wires on the board, cables from instrument jacks, instrument settings
     • compile(bench)  → the solver's circuit (js/lab/labsim.js format) + what every instrument is connected to
     • convert(lab)    → lays an older grid circuit (examples, guided experiments) out on the breadboard
     • bands(value)    → resistor colour code
   Instrument models (stated on the page too):
     power supply — 3 floating channels, constant voltage until the current limit, then constant current
     function generator — 2 channels, output impedance 50 Ω (or ideal, for theory experiments)
     multimeter — V: 10 MΩ input; A: 0.05 Ω shunt, 10 A fuse; Ω: measured with the circuit unpowered
     oscilloscope — 1 MΩ inputs, each probe measures tip minus its ground clip */
(function (root) {
  "use strict";
  var CV = root.CV;
  var ROWS = "abcdefghij", COLS = 50;
  var PS_N = 3, FG_N = 2, DMM_N = 2;
  var ARD_PINS = ["5V", "GND", "D13", "D9", "D2", "A0", "A1"];

  /* ---------- geometry ---------- */
  // point ids: "c12" (row c, column 12), "T+12" "T-12" "B+12" "B-12" (rails), or an instrument jack (see JACKS)
  function parse(p) {
    var m = /^([a-j])(\d+)$/.exec(p); if (m) return { kind: "hole", row: m[1], col: +m[2] };
    m = /^([TB])([+-])(\d+)$/.exec(p); if (m) return { kind: "rail", side: m[1], pol: m[2], col: +m[3] };
    return { kind: "jack", id: p };
  }
  function strip(p) { // the conductor inside the board that a point belongs to
    var q = parse(p);
    if (q.kind === "hole") return (ROWS.indexOf(q.row) < 5 ? "U" : "L") + q.col;
    if (q.kind === "rail") return q.side + q.pol;
    return "J:" + p;
  }
  function holeName(p) {
    var q = parse(p);
    if (q.kind === "hole") return q.row + q.col;
    if (q.kind === "rail") return (q.pol === "+" ? "الخط الأحمر" : "الخط الأزرق") + (q.side === "T" ? " العلوي" : " السفلي") + " " + q.col;
    return (JACKS[p] && JACKS[p].ar) || p;
  }
  var JACKS = {};
  (function () {
    for (var i = 1; i <= PS_N; i++) { JACKS["PS" + i + "+"] = { ar: "مزود الجهد CH" + i + " (+)", dev: "ps", ch: i, pol: "+" }; JACKS["PS" + i + "-"] = { ar: "مزود الجهد CH" + i + " (−)", dev: "ps", ch: i, pol: "-" }; }
    for (i = 1; i <= FG_N; i++) { JACKS["FG" + i] = { ar: "مولد الإشارة CH" + i + " (الإشارة)", dev: "fg", ch: i, pol: "+" }; JACKS["FG" + i + "g"] = { ar: "مولد الإشارة CH" + i + " (الأرضي)", dev: "fg", ch: i, pol: "-" }; }
    for (i = 1; i <= 2; i++) { JACKS["S" + i] = { ar: "مجس الأوسيلوسكوب CH" + i, dev: "sc", ch: i, pol: "+" }; JACKS["S" + i + "g"] = { ar: "مشبك أرضي مجس CH" + i, dev: "sc", ch: i, pol: "-" }; }
    for (i = 1; i <= DMM_N; i++) { JACKS["M" + i + "V"] = { ar: "الملتيميتر " + i + " (VΩ)", dev: "dmm", ch: i, pol: "V" }; JACKS["M" + i + "C"] = { ar: "الملتيميتر " + i + " (COM)", dev: "dmm", ch: i, pol: "C" }; JACKS["M" + i + "A"] = { ar: "الملتيميتر " + i + " (A)", dev: "dmm", ch: i, pol: "A" }; }
    ARD_PINS.forEach(function (n) { JACKS["ARD" + n] = { ar: "Arduino " + n, dev: "ard", pin: n }; });
  })();

  /* ---------- parts ---------- */
  var KIND = {
    W: { ar: "سلك توصيل" }, R: { ar: "مقاومة", def: { value: 1000 } }, LED: { ar: "LED", def: { color: "red" } },
    C: { ar: "مكثف", def: { value: 100e-9 } }, L: { ar: "ملف", def: { value: 10e-3 } },
    LDR: { ar: "مقاومة ضوئية LDR", def: { rdark: 50000, rlight: 1000 } }, NTC: { ar: "ثرمستور NTC", def: { r25: 10000, beta: 3950 } },
    BAT: { ar: "بطارية", def: { value: 9 } }, SW: { ar: "مفتاح ضغط", def: { closed: false } }, LAMP: { ar: "لمبة", def: { vr: 6, pr: 0.5 } },
    PIR: { ar: "حساس حركة PIR", def: {} }, AM: { ar: "أميتر لوحة", def: {} },
    DEP: { ar: "وحدة مصدر تابع", def: { dk: "CCCS", gain: 100, ctrl: null, dir: "ab", plus: "a" } }
  };
  function blank() {
    var b = { v: 2, cols: COLS, parts: [], env: { light: 50, temp: 25 }, inst: { ps: [], fg: [], dmm: [], sc: null, ard: false } };
    for (var i = 0; i < PS_N; i++) b.inst.ps.push({ on: false, v: 5, ilim: 1 });
    for (i = 0; i < FG_N; i++) b.inst.fg.push({ on: false, wave: "sine", freq: 1000, vpp: 2, offset: 0, phase: 0, rs: 50 });
    for (i = 0; i < DMM_N; i++) b.inst.dmm.push({ mode: "VDC" });
    b.inst.sc = { ch: [{ on: true, vdiv: 1, coup: "DC", pos: 0 }, { on: true, vdiv: 1, coup: "DC", pos: 0 }], tdiv: 2e-4, trig: { src: 0, level: 0, slope: "+" }, run: true };
    return b;
  }
  function fixup(b) { // fill instrument defaults into older/partial saves
    var d = blank();
    b.inst = b.inst || {}; ["ps", "fg", "dmm"].forEach(function (k) { b.inst[k] = (b.inst[k] || []).slice(0, d.inst[k].length); for (var i = 0; i < d.inst[k].length; i++) b.inst[k][i] = Object.assign({}, d.inst[k][i], b.inst[k][i] || {}); });
    b.inst.sc = Object.assign({}, d.inst.sc, b.inst.sc || {}); b.inst.sc.ch = [0, 1].map(function (i) { return Object.assign({}, d.inst.sc.ch[i], (b.inst.sc.ch || [])[i] || {}); }); b.inst.sc.trig = Object.assign({}, d.inst.sc.trig, b.inst.sc.trig || {});
    b.env = Object.assign({ light: 50, temp: 25 }, b.env || {}); b.parts = b.parts || []; b.cols = b.cols || COLS; return b;
  }

  /* ---------- connectivity (strips + wires + closed switches, for highlighting) ---------- */
  function unionFind() {
    var parent = {};
    function f(k) { if (parent[k] === undefined) parent[k] = k; while (parent[k] !== k) k = parent[k] = parent[parent[k]]; return k; }
    return { find: f, join: function (x, y) { var a = f(x), c = f(y); if (a !== c) parent[a] = c; }, keys: function () { return Object.keys(parent); } };
  }
  function connectivity(b, withSwitches) {
    var u = unionFind();
    b.parts.forEach(function (p) { if (!p.legs[0] || !p.legs[1]) return; u.find(strip(p.legs[0])); u.find(strip(p.legs[1])); if (p.k === "W" || (withSwitches && p.k === "SW" && p.closed)) u.join(strip(p.legs[0]), strip(p.legs[1])); });
    return u;
  }

  /* ---------- compile: bench → solver circuit ---------- */
  var FG_FIRST = { sine: 1, square: 4 / Math.PI, triangle: 8 / (Math.PI * Math.PI) };
  function compile(b, opt) {
    opt = opt || {};
    var u = connectivity(b, false), used = {}, edges = [], warn = [], info = { jacks: {}, dmm: [], ps: [], fg: [], sc: [] };
    function net(p) { var s = u.find(strip(p)); used[s] = 1; return [s]; }
    function connected(p) { // is anything else on this point's conductor?
      var s = u.find(strip(p)), n = 0;
      b.parts.forEach(function (q) { q.legs.forEach(function (l) { if (l && u.find(strip(l)) === s) n++; }); });
      return n >= 2 || (n >= 1 && parse(p).kind !== "jack");
    }
    var jackAt = {}; // jack → is a cable plugged in
    b.parts.forEach(function (p) { p.legs.forEach(function (l) { if (l && parse(l).kind === "jack") jackAt[l] = true; }); });
    function plugged(j) { return !!jackAt[j]; }

    b.parts.forEach(function (p) {
      if (!p.legs[0] || !p.legs[1]) return;
      var a = net(p.legs[0]), c = net(p.legs[1]), e = { id: p.id, k: p.k, a: a, b: c }, k;
      for (k in p) if (k !== "id" && k !== "k" && k !== "legs") e[k] = p[k];
      if (p.k === "BAT") { e.k = "V"; e.bat = true; e.plus = "a"; }
      if (p.k === "LED" || p.k === "PIR") e.plus = "a";
      if (p.k !== "W" && a[0] === c[0]) warn.push({ part: p.id, t: "short" });
      edges.push(e);
    });
    // power supply channels
    b.inst.ps.forEach(function (ch, i) {
      var n = i + 1, jp = "PS" + n + "+", jm = "PS" + n + "-", st = { n: n, plugged: plugged(jp) && plugged(jm) };
      info.ps.push(st);
      if (!ch.on || !st.plugged) return;
      var e = { id: "ps" + n, k: "V", a: net(jp), b: net(jm), value: ch.v, plus: "a", inst: "ps", ch: n };
      if (ch.tag) e.tag = ch.tag;
      if (opt.cc && opt.cc[n]) { e.k = "I"; e.value = ch.ilim; e.dir = "ba"; delete e.plus; }
      edges.push(e);
    });
    // function generator channels: the solver gets the fundamental; instruments.js adds the harmonics of square/triangle
    b.inst.fg.forEach(function (ch, i) {
      var n = i + 1, jo = "FG" + n, jg = "FG" + n + "g", st = { n: n, plugged: plugged(jo) && plugged(jg) };
      info.fg.push(st);
      if (!ch.on || !st.plugged) return;
      var out = net(jo), gnd = net(jg), mid = ch.offset ? ["fgm" + n] : gnd;
      var e = { id: "fg" + n, k: "GEN", a: out, b: mid, amp: ch.vpp / 2 * FG_FIRST[ch.wave || "sine"], freq: ch.freq, phase: ch.phase || 0, rs: ch.rs > 0 ? ch.rs : 0.01, plus: "a", inst: "fg", ch: n, wave: ch.wave };
      if (ch.tag) e.tag = ch.tag;
      edges.push(e);
      if (ch.offset) edges.push({ id: "fgo" + n, k: "V", a: mid, b: gnd, value: ch.offset, plus: "a", inst: "fgo" });
    });
    // multimeters
    var probes = { vp: null, vn: null, ch1: null, ch2: null };
    b.inst.dmm.forEach(function (m, i) {
      var n = i + 1, jv = "M" + n + "V", jc = "M" + n + "C", ja = "M" + n + "A", st = { n: n, mode: m.mode, v: plugged(jv), c: plugged(jc), a: plugged(ja) };
      info.dmm.push(st);
      if (st.a && st.c && !m.blown) edges.push({ id: "dmm" + n + "a", k: "R", a: net(ja), b: net(jc), value: 0.05, name: "dmm" + n + "a", inst: "dmmA" });
      if (st.v && st.c && m.mode !== "OHM") {
        edges.push({ id: "dmm" + n + "v", k: "R", a: net(jv), b: net(jc), value: 10e6, inst: "dmmV" });
        if (!probes.vp && /^V/.test(m.mode)) { probes.vp = net(jv); probes.vn = net(jc); }
      }
    });
    // oscilloscope inputs (1 MΩ each)
    [1, 2].forEach(function (n) {
      var jt = "S" + n, jg = "S" + n + "g", st = { n: n, tip: plugged(jt), clip: plugged(jg) };
      info.sc.push(st);
      if (st.tip) { var tp = net(jt), gp = st.clip ? net(jg) : null; probes["ch" + n] = tp; st.ref = gp; if (gp) edges.push({ id: "sc" + n, k: "R", a: tp, b: gp, value: 1e6, inst: "sc" }); }
    });
    // Arduino header → the solver's fixed pin points
    var ard = !!b.inst.ard;
    if (ard) ARD_PINS.forEach(function (pin) { var j = "ARD" + pin; if (plugged(j)) edges.push({ id: "ard" + pin, k: "W", a: net(j), b: CV.labsim.PINS[pin], inst: "ard" }); });
    // reference node: blue top rail, else the first supply's (−), else anything
    var ground = null;
    if (used[u.find("T-")]) ground = [u.find("T-")];
    else if (used[u.find("B-")]) ground = [u.find("B-")];
    else { for (var i = 1; i <= PS_N && !ground; i++) if (plugged("PS" + i + "-")) ground = net("PS" + i + "-"); }
    if (!ground) { var any = Object.keys(used)[0]; ground = any ? [any] : ["none"]; }
    // aliases for circuits converted from the old grid (guided experiments refer to grid points)
    var alias = {};
    if (b.alias) Object.keys(b.alias).forEach(function (g) { alias[g] = u.find(strip(b.alias[g])); });
    var lab = { rows: 7, cols: 7, arduino: ard, ground: ground, env: b.env, edges: edges, probes: probes, alias: alias, bench: true };
    return { lab: lab, info: info, warn: warn, net: function (p) { return u.find(strip(p)); }, connected: connected, plugged: plugged };
  }

  /* ---------- solve with supply current limits ---------- */
  function solve(b, pins) {
    var cc = {}, c, res, tries = 0;
    for (;;) {
      c = compile(b, { cc: cc }); res = CV.labsim.solve(c.lab, pins);
      if (!res.ok || tries++ > PS_N) break;
      var flip = false;
      b.inst.ps.forEach(function (ch, i) {
        var n = i + 1, x = res.el["ps" + n]; if (!x) return;
        if (!cc[n]) { var iout = -x.i; if (iout > ch.ilim * 1.0001) { cc[n] = true; flip = true; } }
        else { var vout = x.v; if (vout > ch.v) { cc[n] = false; flip = true; } } // the load wants less current than the limit: back to CV
      });
      if (!flip) break;
    }
    // the meters' fuses
    var blown = false;
    if (res.ok) b.inst.dmm.forEach(function (m, i) { var x = res.el["dmm" + (i + 1) + "a"]; if (x && Math.abs(x.i) > 10) { m.blown = true; blown = true; } });
    if (blown) return solve(b, pins);
    return { c: c, res: res, cc: cc };
  }

  /* ---------- ohmmeter: sources off, 1 mA test current between the leads ---------- */
  function ohms(b, n) {
    var jv = "M" + n + "V", jc = "M" + n + "C";
    var c0 = compile(b), r0 = CV.labsim.solve(c0.lab, null);
    if (!c0.plugged(jv) || !c0.plugged(jc)) return { state: "open" };
    var vp = c0.net(jv), vn = c0.net(jc);
    if (vp === vn) return { state: "ok", r: 0 };
    // is the part being measured powered? (voltage between the leads with the meter open)
    if (r0.ok) { var vo = r0.dcV([vp]) - r0.dcV([vn]); if (Math.abs(vo) > 1e-3 || (r0.ac && CV.ac.C.abs(CV.ac.C.sub(r0.acV([vp]), r0.acV([vn]))) > 1e-3)) return { state: "live", v: vo }; }
    var lab = JSON.parse(JSON.stringify(c0.lab));
    lab.edges = lab.edges.filter(function (e) { return e.inst !== "dmmV" && e.inst !== "dmmA" && e.inst !== "sc" && e.inst !== "ard"; }).map(function (e) {
      if (e.k === "V" || e.k === "AM") return { id: e.id, k: "W", a: e.a, b: e.b };
      if (e.k === "I" || e.k === "PIR" || e.k === "DEP") return null;
      if (e.k === "GEN") return { id: e.id, k: "R", a: e.a, b: e.b, value: e.rs };
      if (e.k === "C") return null; // DC: open
      if (e.k === "LED") return null; // reverse-biased by the test current or below V_f: treated as open
      return e;
    }).filter(Boolean);
    lab.edges.push({ id: "ohm_t", k: "I", a: [vn], b: [vp], value: 1e-3, dir: "ab" });
    lab.arduino = false; lab.ground = [vn];
    var r = CV.labsim.solve(lab, null); if (!r.ok) return { state: "err" };
    var R = (r.dcV([vp]) - r.dcV([vn])) / 1e-3;
    return R > 40e6 ? { state: "OL" } : { state: "ok", r: R };
  }

  /* ---------- resistor colour code ---------- */
  var BAND = [["black", "#1b1b1b"], ["brown", "#7a4a1e"], ["red", "#d33a2c"], ["orange", "#f07c1a"], ["yellow", "#f2d02b"], ["green", "#2f9e44"], ["blue", "#2d6cdf"], ["violet", "#8b4fd6"], ["grey", "#8a8f98"], ["white", "#f4f4f4"]];
  var GOLD = ["gold", "#c9a227"], SILVER = ["silver", "#c0c4cc"];
  var BAND_AR = { black: "أسود", brown: "بني", red: "أحمر", orange: "برتقالي", yellow: "أصفر", green: "أخضر", blue: "أزرق", violet: "بنفسجي", grey: "رمادي", white: "أبيض", gold: "ذهبي", silver: "فضي" };
  function bands(R) {
    if (!(R > 0)) return null;
    function code(digits) {
      var e = Math.floor(Math.log10(R)) - (digits - 1), m = Math.round(R / Math.pow(10, e));
      if (m >= Math.pow(10, digits)) { m = Math.round(m / 10); e++; }
      var ds = String(m).split("").map(Number);
      if (e < -2 || e > 9) return null;
      var mult = e === -1 ? GOLD : e === -2 ? SILVER : BAND[e];
      return { b: ds.map(function (d) { return BAND[d]; }).concat([mult]), exact: Math.abs(m * Math.pow(10, e) - R) <= R * 1e-9, value: m * Math.pow(10, e) };
    }
    var two = code(2);
    if (two && two.exact) return { list: two.b.concat([GOLD]), exact: true, value: two.value, tol: "±5%" };
    var three = code(3);
    return { list: three.b.concat([BAND[1]]), exact: three.exact, value: three.value, tol: "±1%" };
  }

  /* ---------- convert an old grid circuit onto the breadboard ---------- */
  function convert(L) {
    var b = blank(), u = unionFind(), K = function (p) { return p.join(","); };
    b.env = Object.assign({ light: 50, temp: 25 }, L.env || {});
    b.inst.ard = !!L.arduino;
    L.edges.forEach(function (e) { u.find(K(e.a)); u.find(K(e.b)); if (e.k === "W" && !e.tag) u.join(K(e.a), K(e.b)); }); // a tagged wire stays a real jumper (experiments replace it)
    var PINS = CV.labsim.PINS, pinNet = {};
    if (L.arduino) Object.keys(PINS).forEach(function (n) { pinNet[n] = u.find(K(PINS[n])); });
    var gnd = u.find(K(L.arduino ? PINS.GND : L.ground || [L.rows - 1, 0]));
    // what has to be connected to each net
    var need = {}, order = [];
    function want(n) { if (n === gnd) return; if (!need[n]) { need[n] = 0; order.push(n); } need[n]++; }
    var board = [], ps = [], fg = [];
    L.edges.forEach(function (e) {
      if (e.k === "W" && !e.tag) return;
      var na = u.find(K(e.a)), nb = u.find(K(e.b));
      if (e.k === "V" && !e.bat) ps.push(e); else if (e.k === "I") ps.push(e); else if (e.k === "GEN") fg.push(e); else board.push(e);
      want(na); want(nb);
    });
    var pr = L.probes || {};
    ["vp", "vn", "ch1", "ch2"].forEach(function (k) { if (pr[k]) want(u.find(K(pr[k]))); });
    if (L.arduino) Object.keys(pinNet).forEach(function (n) { var pk = K(PINS[n]); if (n !== "GND" && L.edges.some(function (e) { return K(e.a) === pk || K(e.b) === pk; })) want(pinNet[n]); });
    // columns: nets in the order parts meet them, 2 free columns between nets
    var cols = {}, col = 3, free = {};
    order.forEach(function (n) {
      var m = Math.max(1, Math.ceil((need[n] - 2) / 3)); cols[n] = [];
      for (var i = 0; i < m; i++) { cols[n].push(col); free[col] = ["a", "b", "c", "d", "e"]; col++; }
      for (i = 0; i + 1 < cols[n].length; i++) { var c1 = cols[n][i], c2 = cols[n][i + 1]; take(c1, "e"); take(c2, "e"); b.parts.push({ id: "j" + c1, k: "W", legs: ["e" + c1, "e" + c2], color: "green" }); }
      col += 3;
    });
    if (col > b.cols) b.cols = Math.min(63, col + 1);
    function take(c, row) { var i = free[c].indexOf(row); if (i < 0) return null; free[c].splice(i, 1); return row + c; }
    function holeIn(n, row) { // a free hole in net n, preferring a row
      if (n === gnd) return null;
      var cs = cols[n];
      for (var i = 0; i < cs.length; i++) if (row && free[cs[i]].indexOf(row) > -1) return take(cs[i], row);
      for (i = 0; i < cs.length; i++) if (free[cs[i]].length) return take(cs[i], free[cs[i]][0]);
      return null;
    }
    var railUsed = {};
    function railHole(c) { c = Math.max(1, Math.min(b.cols, c)); while (railUsed[c]) c++; railUsed[c] = 1; return "T-" + c; }
    function place(na, nb) { // two holes for a part between nets na, nb
      if (na === gnd && nb === gnd) { var r1 = railHole(2); return [r1, railHole(+r1.slice(2) + 3)]; }
      if (na === gnd || nb === gnd) {
        var other = na === gnd ? nb : na, h = holeIn(other, "a") || holeIn(other), hg = railHole(parse(h).col);
        return na === gnd ? [hg, h] : [h, hg];
      }
      var rows = ["b", "d", "c", "e", "a"];
      for (var i = 0; i < rows.length; i++) {
        var ca = cols[na].filter(function (c) { return free[c].indexOf(rows[i]) > -1; }), cb = cols[nb].filter(function (c) { return free[c].indexOf(rows[i]) > -1; });
        if (ca.length && cb.length) return [take(ca[0], rows[i]), take(cb[0], rows[i])];
      }
      return [holeIn(na), holeIn(nb)];
    }
    board.forEach(function (e) {
      var na = u.find(K(e.a)), nb = u.find(K(e.b)), legs = place(na, nb), p = { id: e.id, k: e.k === "V" ? "BAT" : e.k, legs: legs };
      if (e.k === "W") p.color = "orange";
      for (var k in e) if (["id", "k", "a", "b", "bat", "plus"].indexOf(k) < 0) p[k] = e[k];
      // polarity is carried by leg order: leg 0 is + (battery), anode (LED), OUT (PIR), and a for dependent sources
      if ((e.k === "V" || e.k === "LED" || e.k === "PIR") && e.plus === "b") p.legs = [legs[1], legs[0]];
      if (e.k === "DEP") p.plus = e.plus || "a";
      b.parts.push(p);
    });
    function lead(jack, n, color) {
      var h = n === gnd ? railHole(3) : holeIn(n, "a") || holeIn(n);
      if (h) b.parts.push({ id: "c" + jack, k: "W", legs: [jack, h], color: color, lead: true });
    }
    ps.slice(0, PS_N).forEach(function (e, i) {
      var n = i + 1, ch = b.inst.ps[i], na = u.find(K(e.a)), nb = u.find(K(e.b));
      if (e.k === "V") { var plusA = e.plus !== "b"; ch.v = e.value; ch.ilim = 3; ch.on = true; lead("PS" + n + "+", plusA ? na : nb, "red"); lead("PS" + n + "-", plusA ? nb : na, "black"); }
      else { var toB = (e.dir || "ab") === "ab"; ch.v = 30; ch.ilim = e.value; ch.on = true; lead("PS" + n + "+", toB ? nb : na, "red"); lead("PS" + n + "-", toB ? na : nb, "black"); ch.isrc = true; }
      if (e.tag) ch.tag = e.tag;
      ch.src = e.id;
    });
    fg.slice(0, FG_N).forEach(function (e, i) {
      var n = i + 1, ch = b.inst.fg[i], na = u.find(K(e.a)), nb = u.find(K(e.b)), plusA = e.plus !== "b";
      ch.on = true; ch.wave = e.wave || "sine"; ch.vpp = 2 * e.amp; ch.freq = e.freq; ch.phase = e.phase || 0; ch.rs = e.rs > 0.05 ? e.rs : 0; ch.offset = 0;
      if (e.tag) ch.tag = e.tag; ch.src = e.id;
      lead("FG" + n, plusA ? na : nb, "yellow"); lead("FG" + n + "g", plusA ? nb : na, "black");
    });
    if (pr.vp && pr.vn) { b.inst.dmm[0].mode = fg.length ? "VAC" : "VDC"; lead("M1V", u.find(K(pr.vp)), "red"); lead("M1C", u.find(K(pr.vn)), "black"); }
    if (pr.ch1) { lead("S1", u.find(K(pr.ch1)), "yellow"); lead("S1g", gnd, "black"); }
    if (pr.ch2) { lead("S2", u.find(K(pr.ch2)), "cyan"); lead("S2g", gnd, "black"); }
    if (fg.length) { var f0 = fg[0].freq; b.inst.sc.tdiv = niceT(2 / f0 / 10); var amp = Math.max.apply(null, fg.map(function (e) { return e.amp; })); b.inst.sc.ch.forEach(function (c) { c.vdiv = niceV(amp / 3); }); }
    if (L.arduino) Object.keys(pinNet).forEach(function (n) {
      var nn = pinNet[n]; if (n === "GND") { lead("ARDGND", gnd, "black"); return; }
      if (need[nn] !== undefined) lead("ARD" + n, nn, n === "5V" ? "red" : "orange");
    });
    // grid point → a hole of its net, so experiments that name grid points still work
    b.alias = {};
    u.keys().forEach(function (k) {
      var n = u.find(k);
      if (n === gnd) b.alias[k] = "T-1";
      else if (cols[n]) b.alias[k] = "a" + cols[n][0];
    });
    return b;
  }
  var VSTEPS = [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];
  var TSTEPS = []; [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1].forEach(function (d) { TSTEPS.push(d, 2 * d, 5 * d); }); TSTEPS.push(1);
  function niceV(v) { return VSTEPS.filter(function (s) { return s >= v; })[0] || 10; }
  function niceT(t) { return TSTEPS.filter(function (s) { return s >= t; })[0] || 1; }

  CV.bench = { ROWS: ROWS, COLS: COLS, PS_N: PS_N, FG_N: FG_N, DMM_N: DMM_N, ARD_PINS: ARD_PINS, JACKS: JACKS, KIND: KIND, BAND_AR: BAND_AR,
    parse: parse, strip: strip, holeName: holeName, blank: blank, fixup: fixup, connectivity: connectivity, compile: compile, solve: solve, ohms: ohms, bands: bands, convert: convert,
    VSTEPS: VSTEPS, TSTEPS: TSTEPS, niceV: niceV, niceT: niceT, FG_FIRST: FG_FIRST };
})(typeof window !== "undefined" ? window : globalThis);
