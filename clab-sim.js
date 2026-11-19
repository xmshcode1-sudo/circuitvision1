/* CircuitVision — Circuits 1 lab: the electrical model of the bench.
   The bench state (parts on the plug-in board, banana leads, instrument settings) becomes a netlist that is solved
   with complex nodal analysis twice: once for DC (the supply channels) and once for AC (the function generator or the mains).
   Instruments are modelled as they behave on the real bench:
     - DC supply (2 × 0–16 V / 0–5 A): ideal source in CV mode; when the load asks for more than the current knob it goes to CC.
     - Digital multimeters: V input 10 MΩ; the A jack is ALWAYS a shunt to COM (leads left in the A jack short whatever they touch);
       the mA jack has a fuse; Ω injects a test current and is wrong on a powered circuit; AC ranges read true RMS of the AC part.
     - Function generator: sine source with 50 Ω output impedance, its black lead is earthed.
     - Oscilloscope: 1 MΩ inputs; both ground clips are earthed (a clip on a different node from the generator's black lead = short).
   Resistor blocks have their own actual values (within tolerance), so measured and calculated values differ a little, as in the lab. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};

  /* ---------- complex numbers ---------- */
  function cx(re, im) { return { re: re, im: im || 0 }; }
  function add(a, b) { return cx(a.re + b.re, a.im + b.im); }
  function sub(a, b) { return cx(a.re - b.re, a.im - b.im); }
  function mul(a, b) { return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function div(a, b) { var d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
  function mag(a) { return Math.hypot(a.re, a.im); }
  function ang(a) { return Math.atan2(a.im, a.re); }
  var Z0 = cx(0, 0);

  /* ---------- nodal analysis with voltage sources (complex) ---------- */
  function solveMNA(N, els, w) {
    var vs = els.filter(function (e) { return e.k === "V"; }), xs = els.filter(function (e) { return e.k === "X"; }), M = N + vs.length + 2 * xs.length, A = [], b = [], i, j;
    for (i = 0; i < M; i++) { A.push([]); b.push(cx(0, 0)); for (j = 0; j < M; j++) A[i].push(cx(0, 0)); }
    function stamp(a, c, y) { if (a > 0) A[a - 1][a - 1] = add(A[a - 1][a - 1], y); if (c > 0) A[c - 1][c - 1] = add(A[c - 1][c - 1], y); if (a > 0 && c > 0) { A[a - 1][c - 1] = sub(A[a - 1][c - 1], y); A[c - 1][a - 1] = sub(A[c - 1][a - 1], y); } }
    for (i = 1; i < N + 1; i++) A[i - 1][i - 1] = add(A[i - 1][i - 1], cx(1e-12, 0));   // gmin: floating parts stay solvable
    els.forEach(function (e) {
      if (e.k === "R") stamp(e.a, e.b, cx(1 / e.r, 0));
      else if (e.k === "L") stamp(e.a, e.b, w ? div(cx(1, 0), cx(0, w * e.l)) : cx(1e6, 0));
      else if (e.k === "C") { if (w) stamp(e.a, e.b, cx(0, w * e.c)); }
      else if (e.k === "I") { if (e.a > 0) b[e.a - 1] = sub(b[e.a - 1], e.i); if (e.b > 0) b[e.b - 1] = add(b[e.b - 1], e.i); }
    });
    vs.forEach(function (e, k) {
      var x = N + k;
      if (e.a > 0) { A[e.a - 1][x] = add(A[e.a - 1][x], cx(1, 0)); A[x][e.a - 1] = add(A[x][e.a - 1], cx(1, 0)); }
      if (e.b > 0) { A[e.b - 1][x] = sub(A[e.b - 1][x], cx(1, 0)); A[x][e.b - 1] = sub(A[x][e.b - 1], cx(1, 0)); }
      b[x] = e.v;
    });
    /* coupled coils: branch currents i1 (a→b inside coil 1) and i2 (c→d inside coil 2); v_ab = z11 i1 + z12 i2, v_cd = z12 i1 + z22 i2 */
    xs.forEach(function (e, k) {
      var x1 = N + vs.length + 2 * k, x2 = x1 + 1;
      [[e.a, x1, 1], [e.b, x1, -1], [e.c, x2, 1], [e.d, x2, -1]].forEach(function (q) { if (q[0] > 0) { A[q[0] - 1][q[1]] = add(A[q[0] - 1][q[1]], cx(q[2], 0)); A[q[1]][q[0] - 1] = add(A[q[1]][q[0] - 1], cx(q[2], 0)); } });
      A[x1][x1] = sub(A[x1][x1], e.z11); A[x1][x2] = sub(A[x1][x2], e.z12); A[x2][x1] = sub(A[x2][x1], e.z12); A[x2][x2] = sub(A[x2][x2], e.z22);
    });
    // Gaussian elimination with partial pivoting
    for (i = 0; i < M; i++) {
      var p = i, best = mag(A[i][i]);
      for (j = i + 1; j < M; j++) { var m = mag(A[j][i]); if (m > best) { best = m; p = j; } }
      if (best < 1e-30) continue;
      if (p !== i) { var t = A[i]; A[i] = A[p]; A[p] = t; var tb = b[i]; b[i] = b[p]; b[p] = tb; }
      for (j = i + 1; j < M; j++) {
        if (!A[j][i].re && !A[j][i].im) continue;
        var f = div(A[j][i], A[i][i]);
        for (var k2 = i; k2 < M; k2++) A[j][k2] = sub(A[j][k2], mul(f, A[i][k2]));
        b[j] = sub(b[j], mul(f, b[i]));
      }
    }
    var x2 = []; for (i = M - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < M; j++) s = sub(s, mul(A[i][j], x2[j])); x2[i] = mag(A[i][i]) < 1e-30 ? cx(0, 0) : div(s, A[i][i]); }
    var V = [cx(0, 0)].concat(x2.slice(0, N)), I = {};
    vs.forEach(function (e, k) { I[e.id] = x2[N + k]; });   // current entering the + terminal from the circuit
    xs.forEach(function (e, k) { I[e.id + ".1"] = x2[N + vs.length + 2 * k]; I[e.id + ".2"] = x2[N + vs.length + 2 * k + 1]; });
    return { V: V, Iv: I };
  }

  /* ---------- parts ---------- */
  /* actual value of a physical block: fixed per piece id, within ±tol of nominal */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
  function actual(piece) {
    if (!piece) return null;
    if (piece.t !== "R") return piece.v;
    var tol = piece.tol === undefined ? 0.008 : piece.tol;
    return piece.v * (1 + (hash(piece.id) * 2 - 1) * tol * 0.9);
  }

  /* ---------- the instruments: terminals and their electrical model ---------- */
  var DMM = {
    d1: { name: "Fluke 115", jacks: { A: { shunt: 0.03, fuse: 11 } }, modes: ["off", "vac", "vdc", "mv", "ohm", "aac", "adc"] },
    d2: { name: "PeakTech 2000", jacks: { "10A": { shunt: 0.01, fuse: 10 }, mA: { shunt: 1.0, fuse: 0.2 } }, modes: ["off", "vdc", "vac", "ohm", "madc", "maac", "adc", "aac"] }
  };
  function ps0() { return { on: false, mode: "normal", m: { v: 0, i: 0.5 }, s: { v: 0, i: 0.5 } }; }
  function defaults() {
    return {
      ps: ps0(), fg: { on: false, f: 1000, vpp: 0, w: "sin" },
      va: { on: false, v: 0 }, tp: { on: false }, wm: { tot: false }, pm: { pg: 0 }, r1: { x: 1000 }, r2: { x: 1000 }, r3: { x: 1000 },
      d1: { mode: "off" }, d2: { mode: "off", fuse: true },
      sc: { on: true, c1: { vd: 2, cp: "DC", on: true }, c2: { vd: 2, cp: "DC", on: true }, td: 0.0002, x1: 3, x2: 5, cur: false, math: false, meas: true },
      rb: { d: [0, 1, 0, 0] }, lb: { d: [1, 7, 5] }, cb: { d: [0, 0] }, mn: { on: false }
    };
  }
  function rbValue(s) { var d = s.rb.d, v = 0; for (var i = 0; i < d.length; i++) v = v * 10 + d[i]; return v; }
  function lbValue(s) { var d = s.lb.d; return (d[0] * 10 + d[1] + d[2] * 0.1) * 1e-3; }
  function cbValue(s) { var d = s.cb.d; return (d[0] + d[1] * 0.1) * 1e-6; }
  /* the lamp of Lab 10: a fluorescent tube with its magnetic ballast, modelled as R + L
     (an approximate model chosen so its power factor is low, as such loads are; not a measurement) */
  var LAMP = { r: 228, l: 1.618 };
  /* Circuits 2, Lab 3: the two coupled coils on an iron core (1000 and 500 turns). The manual measures these, it does not give them;
     these are the virtual bench's values. AC resistance = 1.15 × DC resistance, as the manual assumes. Dots: terminal 1 of coil 1 and
     terminal B of coil 2 (the student finds the second one in Procedure 3). */
  var COILS = { r1: 11.6, r2: 3.1, l1: 0.42, l2: 0.105, k: 0.92, skin: 1.15 };
  COILS.m = COILS.k * Math.sqrt(COILS.l1 * COILS.l2);
  /* Circuits 2, Lab 10: the bench's three-phase extra-low-voltage transformer (LD), as in the university lab: two star outputs with
     one neutral, printed on its panel as 23 V / 40 V (L1, L2, L3, N → tp.A, tp.B, tp.C, tp.N) and 6 V / 10 V (tp.a, tp.b, tp.c),
     Imax 4 A in star. 60 Hz, sequence L1 L2 L3. The panel values are nominal; the model uses the phase voltages 23 V and 6 V. */
  var TP = { v: 23, vlo: 6, f: 60, imax: 4 };
  /* Circuits 2, Lab 10: the three load rheostats (1000 Ω, 0.57 A each). Terminals a (red) and b (black) are the two ends of the
     winding, w (yellow) is the slider: R(a–w) = x and R(w–b) = 1000 − x. */
  var RH = { r: 1000, imax: 0.57 };

  /* ---------- netlist ---------- */
  function build(state, opt) {
    opt = opt || {};
    var inst = state.inst, parent = {};
    function find(k) { if (parent[k] === undefined) parent[k] = k; while (parent[k] !== k) { parent[k] = parent[parent[k]]; k = parent[k]; } return k; }
    function union(a, b) { var x = find(a), y = find(b); if (x !== y) parent[x] = y; }
    function tileOf(p) { var m = /^t:(\d+):(\d+)/.exec(p); if (m) return "t:" + m[1] + ":" + m[2]; m = /^rail:(\d)/.exec(p); return m ? "rail:" + m[1] : p; }
    // leads and bridges merge points
    (state.leads || []).forEach(function (l) { union(tileOf(l[0]), tileOf(l[1])); });
    var parts = state.parts || {}, els = [];
    Object.keys(parts).forEach(function (slot) {
      var pc = parts[slot], m = /^([hv]):(\d+):(\d+)(?::[ab])?$/.exec(slot); if (!m || !pc) return;
      var r = +m[2], c = +m[3], a = "t:" + r + ":" + c, b = m[1] === "h" ? "t:" + r + ":" + (c + 1) : "t:" + (r + 1) + ":" + c;
      /* a hidden fault (troubleshooting practice): broken inside (open), shorted inside, or a block whose real value is not its label */
      var fl = pc.fault;
      if (pc.t === "W" || (fl && fl.k === "short")) union(a, b);
      else if (fl && fl.k === "open") return;
      else { var fv = fl && fl.k === "value" ? fl.v : null;
        els.push({ k: pc.t, a: a, b: b, r: pc.t === "R" ? (fv || actual(pc)) : 0, nom: pc.v, pmax: pc.pmax, l: pc.t === "L" ? (fv || pc.v) : 0, c: pc.t === "C" ? (fv || pc.v) : 0, id: slot, piece: pc.id, lb: pc.lb }); }
    });
    var use = opt.only || null;
    function on(k) { return !use || use.indexOf(k) > -1; }
    // supply: channels m and s
    /* tracking switch of the dual supply: NORMAL = two independent channels; SERIES = slave(+) is tied inside the case to master(−)
       and the slave follows the master's voltage knob; PARALLEL = the two outputs are tied together, the master knobs rule and the
       available current doubles. */
    if (on("ps")) {
      var pmode = inst.ps.mode || "normal", live = (inst.ps.on || opt.allSrc) && !opt.dead;
      union("ps.m.e", "earth"); union("ps.s.e", "earth");
      if (pmode === "series") union("ps.s+", "ps.m-");
      if (pmode === "parallel") { union("ps.s+", "ps.m+"); union("ps.s-", "ps.m-"); }
      if (live) {
        els.push({ k: "V", a: "ps.m+", b: "ps.m-", dc: inst.ps.m.v, id: "ps.m", ilim: pmode === "parallel" ? 2 * inst.ps.m.i : inst.ps.m.i, src: "ps" });
        if (pmode !== "parallel") els.push({ k: "V", a: "ps.s+", b: "ps.s-", dc: pmode === "series" ? inst.ps.m.v : inst.ps.s.v, id: "ps.s", ilim: pmode === "series" ? inst.ps.m.i : inst.ps.s.i, src: "ps" });
      }
    }
    if (on("fg")) {
      els.push({ k: "R", a: "fg.com", b: "earth", r: 0.01, id: "fg.gnd" });
      if ((inst.fg.on || opt.allSrc) && !opt.dead) { var fge = { k: "V", a: "fg.int", b: "fg.com", ac: inst.fg.vpp / 2, f: inst.fg.f, id: "fg", src: "fg", sq: inst.fg.w === "sq" }; if (inst.fg.off) { fge.dc = inst.fg.off; fge.ilim = 1; } els.push(fge); els.push({ k: "R", a: "fg.int", b: "fg.out", r: 50, id: "fg.r" }); }
    }
    if (on("mn") && inst.mn) {   // mains panel with its power meter; output L/N, the lamp hard-wired after it
      if ((inst.mn.on || opt.allSrc) && !opt.dead) els.push({ k: "V", a: "mn.Li", b: "mn.N", ac: 220 * Math.SQRT2, f: 60, id: "mn", src: "mn" });
      els.push({ k: "R", a: "mn.Li", b: "mn.L", r: 0.05, id: "mn.meter" });
      els.push({ k: "R", a: "mn.L", b: "lamp.m", r: LAMP.r, id: "lamp.r" }); els.push({ k: "L", a: "lamp.m", b: "mn.N", l: LAMP.l, id: "lamp.l" });
      union("lamp.a", "mn.L"); union("lamp.b", "mn.N");
    }
    if (on("va") && inst.va) {   // variac: adjustable 60 Hz AC, output floating
      if ((inst.va.on || opt.allSrc) && !opt.dead) els.push({ k: "V", a: "va.L", b: "va.N", ac: inst.va.v * Math.SQRT2, f: 60, id: "va", src: "va" });
    }
    if (on("cc")) els.push({ k: "X", a: "cc.1", b: "cc.1'", c: "cc.B", d: "cc.A", id: "cc" });
    if (on("tp") && inst.tp) {   // three-phase supply: A, B, C and the neutral N (earthed)
      union("tp.N", "earth");
      union("tp.n", "tp.N");   // the two stars share the neutral (drawn joined on the panel)
      if ((inst.tp.on || opt.allSrc) && !opt.dead) [["A", 0], ["B", -120], ["C", 120]].forEach(function (q) {
        els.push({ k: "V", a: "tp." + q[0], b: "tp.N", ac: TP.v * Math.SQRT2, ph: q[1], f: TP.f, id: "tp." + q[0], src: "tp" });
        var lo = q[0].toLowerCase(); els.push({ k: "V", a: "tp." + lo, b: "tp.N", ac: TP.vlo * Math.SQRT2, ph: q[1], f: TP.f, id: "tp." + lo, src: "tp" });
      });
    }
    if (on("pm")) {   // the MFA-2001 power meter panel: L1 L2 L3 N in (left) → out (right); a current sensor in each line, N straight through
      ["1", "2", "3"].forEach(function (k) { els.push({ k: "R", a: "pm." + k, b: "pm." + k + "'", r: 0.005, id: "pm." + k + ".sh" }); });
      union("pm.N", "pm.N'");
    }
    ["r1", "r2", "r3"].forEach(function (k) {
      if (!on(k)) return; var x = Math.min(RH.r, Math.max(0, inst[k] ? inst[k].x : RH.r));
      els.push({ k: "R", a: k + ".a", b: k + ".w", r: Math.max(x, 0.05), nom: x, id: k + ".aw", rh: k });
      els.push({ k: "R", a: k + ".w", b: k + ".b", r: Math.max(RH.r - x, 0.05), nom: RH.r - x, id: k + ".wb", rh: k });
    });
    if (on("wm")) { els.push({ k: "R", a: "wm.I", b: "wm.I'", r: 0.005, id: "wm.sh" }); els.push({ k: "R", a: "wm.V", b: "wm.V'", r: 10e6, id: "wm.vin" }); }
    if (on("sc")) { els.push({ k: "R", a: "sc.1", b: "earth", r: 1e6, id: "sc.1r" }); els.push({ k: "R", a: "sc.2", b: "earth", r: 1e6, id: "sc.2r" });
      els.push({ k: "R", a: "sc.1g", b: "earth", r: 0.01, id: "sc.1gr" }); els.push({ k: "R", a: "sc.2g", b: "earth", r: 0.01, id: "sc.2gr" }); }
    ["d1", "d2"].forEach(function (d) {
      if (!on(d)) return;
      els.push({ k: "R", a: d + ".V", b: d + ".COM", r: 10e6, id: d + ".vin" });
      Object.keys(DMM[d].jacks).forEach(function (j) {
        var J = DMM[d].jacks[j], blown = inst[d].blown && inst[d].blown[j];
        if (!blown) els.push({ k: "R", a: d + "." + j, b: d + ".COM", r: J.shunt, id: d + "." + j + ".sh", meter: d, jack: j });
      });
    });
    if (on("rb")) { var rv = rbValue(inst); els.push({ k: "R", a: "rb.a", b: "rb.b", r: Math.max(rv, 0.01), nom: rv, id: "rb", box: 1 }); }
    if (on("lb")) els.push({ k: "L", a: "lb.a", b: "lb.b", l: lbValue(inst), id: "lb", box: 1 });
    if (on("cb")) { var cv = cbValue(inst); if (cv > 0) els.push({ k: "C", a: "cb.a", b: "cb.b", c: cv, id: "cb", box: 1 }); }
    // number the nodes; earth is node 0 when present, else the first node
    var names = {}, N = 0;
    function idx(p) { var r = find(p); if (names[r] === undefined) names[r] = r === find("earth") ? 0 : ++N; return names[r]; }
    find("earth"); names[find("earth")] = 0;
    els.forEach(function (e) { e.na = idx(e.a); e.nb = idx(e.b); if (e.k === "X") { e.nc = idx(e.c); e.nd = idx(e.d); } });
    return { els: els, N: N, node: function (p) { var r = find(tileOf(p)); return names[r] === undefined ? -1 : names[r]; }, find: find, tileOf: tileOf };
  }

  function solveAt(net, w, srcFilter, ccState, srcVal) {
    var els = net.els.map(function (e) {
      var o = { k: e.k, a: e.na, b: e.nb, r: e.r, l: e.l, c: e.c, id: e.id };
      if (e.k === "X") {
        var C2 = COILS, sk = w ? C2.skin : 1;
        return { k: "X", a: e.na, b: e.nb, c: e.nc, d: e.nd, id: e.id, z11: cx(C2.r1 * sk, w * C2.l1), z12: cx(0, w * C2.m), z22: cx(C2.r2 * sk, w * C2.l2) };
      }
      if (e.k === "V") {
        var active = srcFilter(e);
        if (ccState && ccState[e.id] !== undefined && w === 0) return { k: "I", a: e.na, b: e.nb, i: cx(-ccState[e.id], 0), id: e.id };   // CC: current source out of +
        if (srcVal && w) { o.v = active ? srcVal(e) : cx(0, 0); return o; }
        var amp = w === 0 ? (e.dc || 0) : (e.ac || 0), ph = w === 0 ? 0 : (e.ph || 0) * Math.PI / 180;
        o.v = active ? cx(amp * Math.cos(ph), amp * Math.sin(ph)) : cx(0, 0);
      }
      return o;
    });
    return solveMNA(net.N, els, w);
  }

  /* full solution: DC with the supply's CV/CC behaviour, AC at the generator (or mains) frequency */
  function solve(state, opt) {
    var net = build(state, opt), cc = {}, dc, k;
    for (k = 0; k < 3; k++) {
      dc = solveAt(net, 0, function (e) { return e.dc !== undefined; }, cc);
      var changed = false;
      net.els.forEach(function (e) {
        if (e.k !== "V" || e.dc === undefined) return;
        if (cc[e.id] !== undefined) {   // in CC: back to CV if the terminal voltage would exceed the set voltage
          var vt = dc.V[e.na].re - dc.V[e.nb].re;
          if (vt > e.dc + 1e-9) { delete cc[e.id]; changed = true; }
        } else {
          var iOut = -(dc.Iv[e.id] ? dc.Iv[e.id].re : 0);
          if (iOut > e.ilim + 1e-9) { cc[e.id] = e.ilim; changed = true; }
          else if (iOut < -e.ilim - 1e-9) { cc[e.id] = -e.ilim; changed = true; }
        }
      });
      if (!changed) break;
    }
    var acSrc = net.els.filter(function (e) { return e.k === "V" && e.ac; })[0], w = acSrc ? 2 * Math.PI * acSrc.f : 0;
    var ac = null, h = null;
    if (acSrc && acSrc.sq) {
      /* square wave = offset + Σ (4A/πn) sin(nωt), n odd: the circuit is linear, so each harmonic is solved as a phasor and the
         waveforms are summed back. The Lanczos factor smooths the edges (a real generator's edge is not infinitely fast either). */
      h = [];
      for (var n = 1; n <= NH; n += 2) {
        var sg = Math.sin(Math.PI * n / (NH + 2)) / (Math.PI * n / (NH + 2)), bn = 4 * acSrc.ac / (Math.PI * n) * sg;
        h.push({ n: n, s: solveAt(net, n * w, function (e) { return e === acSrc; }, null, function (e) { return e === acSrc ? cx(0, -bn) : cx(0, 0); }) });
      }
      ac = h[0].s;
    } else ac = acSrc ? solveAt(net, w, function (e) { return !!e.ac; }) : null;
    return { net: net, dc: dc, ac: ac, h: h, w: w, f: acSrc ? acSrc.f : 0, cc: cc, state: state, opt: opt };
  }

  var NH = 255;   // odd harmonics up to the 255th for the square wave
  /* ---------- quantities ---------- */
  function vNode(sol, p) { var n = sol.net.node(p), o = { dc: n < 0 ? 0 : sol.dc.V[n].re, ac: n < 0 || !sol.ac ? Z0 : sol.ac.V[n] };
    if (sol.h) o.h = sol.h.map(function (q) { return n < 0 ? Z0 : q.s.V[n]; });
    return o; }
  function vBetween(sol, p, q) { var a = vNode(sol, p), b = vNode(sol, q), o = { dc: a.dc - b.dc, ac: sub(a.ac, b.ac) }; if (a.h) o.h = a.h.map(function (x, k) { return sub(x, b.h[k]); }); return o; }
  /* RMS of the AC part (true RMS, all harmonics) */
  function acRms(v) { if (v.h) { var s2 = 0; v.h.forEach(function (x) { s2 += x.re * x.re + x.im * x.im; }); return Math.sqrt(s2 / 2); } return mag(v.ac) / Math.SQRT2; }
  /* the value at time t of a quantity {dc, ac, h} (w = fundamental angular frequency) */
  function at(v, w, t) { var y = v.dc || 0; if (v.h) v.h.forEach(function (x, k) { var n = 2 * k + 1; y += mag(x) * Math.cos(n * w * t + ang(x)); }); else if (w) y += mag(v.ac) * Math.cos(w * t + ang(v.ac)); return y; }
  function elById(sol, id) { return sol.net.els.filter(function (e) { return e.id === id; })[0]; }
  /* current through an element from its a end to its b end */
  function iElem(sol, e) {
    var vdc = sol.dc.V[e.na].re - sol.dc.V[e.nb].re, vac = sol.ac ? sub(sol.ac.V[e.na], sol.ac.V[e.nb]) : Z0;
    if (e.k === "R") { var o = { dc: vdc / e.r, ac: div(vac, cx(e.r, 0)) }; if (sol.h) o.h = sol.h.map(function (q) { return div(sub(q.s.V[e.na], q.s.V[e.nb]), cx(e.r, 0)); }); return o; }
    if (e.k === "L") return { dc: vdc * 1e6, ac: sol.w ? div(vac, cx(0, sol.w * e.l)) : Z0 };
    if (e.k === "C") return { dc: 0, ac: sol.w ? mul(vac, cx(0, sol.w * e.c)) : Z0 };
    return { dc: 0, ac: Z0 };
  }
  function supplyOut(sol, ch) {   // terminal voltage and output current of a supply channel
    var e = elById(sol, "ps." + ch); if (!e) return { v: 0, i: 0, cc: false };
    var v = sol.dc.V[e.na].re - sol.dc.V[e.nb].re, i;
    if (sol.cc[e.id] !== undefined) i = sol.cc[e.id]; else i = -(sol.dc.Iv[e.id] ? sol.dc.Iv[e.id].re : 0);
    return { v: v, i: i, cc: sol.cc[e.id] !== undefined };
  }

  /* resistance seen between two points with every source off (what an ohmmeter would read on a dead circuit) */
  function ohms(state, p, q, exclude, opt) {
    var net = build(state, { dead: true, only: opt && opt.only });
    var els = net.els.filter(function (e) { return !exclude || exclude.indexOf(e.id.split(".")[0]) < 0; })
      .map(function (e) { if (e.k === "X") return { k: "X", a: e.na, b: e.nb, c: e.nc, d: e.nd, id: e.id, z11: cx(COILS.r1, 0), z12: Z0, z22: cx(COILS.r2, 0) }; return { k: e.k, a: e.na, b: e.nb, r: e.r, l: e.l, c: e.c, id: e.id }; });
    var a = net.node(p), b = net.node(q);
    if (a < 0 || b < 0 || a === b) return a === b && a >= 0 ? 0 : Infinity;
    els.push({ k: "I", a: b, b: a, i: cx(1e-3, 0), id: "test" });
    var s = solveMNA(net.N, els, 0), r = (s.V[a].re - s.V[b].re) / 1e-3;
    return r > 1e9 ? Infinity : r;
  }

  /* ---------- meter readings and warnings ---------- */
  function dmmReading(sol, d) {
    var st = sol.state.inst[d], mode = st.mode, J = DMM[d].jacks;
    if (mode === "off" || !elById(sol, d + ".vin")) return { text: "", mode: mode };
    function jackCurrent(j) { var e = elById(sol, d + "." + j + ".sh"); return e ? iElem(sol, e) : { dc: 0, ac: Z0 }; }
    if (mode === "vdc" || mode === "mv") { var v = vBetween(sol, d + ".V", d + ".COM").dc; return { val: v, unit: mode === "mv" ? "mV" : "V", text: fmtV(mode === "mv" ? v * 1000 : v, mode === "mv" ? "mV" : "V", d), ac: false, mode: mode }; }
    if (mode === "vac") { var va = acRms(vBetween(sol, d + ".V", d + ".COM")); return { val: va, unit: "V", text: fmtV(va, "V", d), ac: true, mode: mode }; }
    if (mode === "ohm") {
      var live = anyLive(sol, d);
      if (live) return { val: NaN, unit: "Ω", text: "- - - -", warn: "live", mode: mode };
      var r = ohms(sol.state, d + ".V", d + ".COM", [d], sol.opt);
      return { val: r, unit: "Ω", text: r === Infinity ? "OL" : fmtR(r, d), mode: mode };
    }
    var jack = mode === "madc" || mode === "maac" ? "mA" : (J.A ? "A" : "10A"), cur = jackCurrent(jack), isAc = mode === "aac" || mode === "maac";
    var val = isAc ? acRms(cur) : cur.dc, blown = st.blown && st.blown[jack];
    if (blown) return { val: 0, unit: "A", text: jack === "mA" ? "0.00" : "0.000", mode: mode, fuse: jack };
    return { val: val, unit: "A", text: jack === "mA" ? fmtMA(val * 1000) : fmtA(val), ac: isAc, mode: mode, jack: jack };
  }
  function anyLive(sol, d) {   // is a powered source connected to the meter's network?
    var live = sol.net.els.some(function (e) { return e.k === "V" && ((e.dc && Math.abs(e.dc) > 1e-6) || e.ac); });
    if (!live) return false;
    var v = vBetween(sol, d + ".V", d + ".COM"); return Math.abs(v.dc) > 1e-4 || mag(v.ac) > 1e-4;
  }
  /* displays: digits and ranges like the meters on the bench */
  function fix(x, n) { return (Math.abs(x) < 0.5 * Math.pow(10, -n) ? 0 : x).toFixed(n); }
  function fmtV(v, unit, d) {
    var a = Math.abs(v);
    if (unit === "mV") return a >= 600 ? "OL" : fix(v, 1);
    if (d === "d2") return a < 2 ? fix(v, 3) : a < 20 ? fix(v, 2) : a < 200 ? fix(v, 1) : fix(v, 0);
    return a < 6 ? fix(v, 3) : a < 60 ? fix(v, 2) : a < 600 ? fix(v, 1) : fix(v, 0);
  }
  function fmtA(i) { var a = Math.abs(i); return a >= 10 ? "OL" : fix(i, 3); }
  function fmtMA(m) { var a = Math.abs(m); return a >= 200 ? "OL" : a < 20 ? fix(m, 2) : fix(m, 1); }
  function fmtR(r, d) {
    if (d === "d2") { if (r < 200) return fix(r, 1); if (r < 2000) return fix(r, 0); if (r < 20000) return fix(r / 1000, 2) + "k"; if (r < 200000) return fix(r / 1000, 1) + "k"; if (r < 2e6) return fix(r / 1000, 0) + "k"; return "OL"; }
    if (r < 600) return fix(r, 1); if (r < 6000) return fix(r / 1000, 3) + "k"; if (r < 60000) return fix(r / 1000, 2) + "k"; if (r < 600000) return fix(r / 1000, 1) + "k"; if (r < 6e6) return fix(r / 1e6, 3) + "M"; if (r < 40e6) return fix(r / 1e6, 2) + "M"; return "OL";
  }

  /* everything the bench shows at once, plus the problems a lab instructor would point at */
  function read(state, opt) {
    var s = solve(state, opt), warn = [], out = { sol: s, warn: warn };
    // fuses: a shunt carrying more than its fuse blows it, then solve again
    var again = false;
    ["d1", "d2"].forEach(function (d) {
      Object.keys(DMM[d].jacks).forEach(function (j) {
        var e = elById(s, d + "." + j + ".sh"); if (!e) return;
        var i = iElem(s, e), peak = Math.max(Math.abs(i.dc), mag(i.ac));
        if (peak > DMM[d].jacks[j].fuse) { state.inst[d].blown = state.inst[d].blown || {}; state.inst[d].blown[j] = true; again = true; warn.push({ k: "fuse", d: d, j: j }); }
      });
    });
    if (again) { s = solve(state, opt); out.sol = s; }
    out.ps = { m: supplyOut(s, "m"), s: supplyOut(s, "s") };
    ["m", "s"].forEach(function (ch) { var o = out.ps[ch]; if (o.cc && Math.abs(o.v) < 0.3) warn.push({ k: "short", ch: ch }); else if (o.cc) warn.push({ k: "cc", ch: ch }); });
    out.d1 = dmmReading(s, "d1"); out.d2 = dmmReading(s, "d2");
    ["d1", "d2"].forEach(function (d) {
      var st = state.inst[d], used = (state.leads || []).filter(function (l) { return l.some(function (p) { return Object.keys(DMM[d].jacks).some(function (j) { return p === d + "." + j; }); }); }).length;
      if (used && !/(^a|^ma)/.test(st.mode)) warn.push({ k: "leadAlert", d: d });
      if (out[d].warn === "live") warn.push({ k: "ohmLive", d: d });
      if (/(^a|^ma)/.test(st.mode) && !used && st.mode !== "off") warn.push({ k: "noJack", d: d });
    });
    // resistor power
    s.net.els.forEach(function (e) {
      if (e.k !== "R" || !e.piece) return;
      var i = iElem(s, e), p = e.r * (i.dc * i.dc + mag(i.ac) * mag(i.ac) / 2);
      if (p > (e.pmax || 2)) warn.push({ k: "hot", id: e.id, nom: e.nom, p: p, pmax: e.pmax || 2 });
    });
    // rheostats past 0.57 A, the transformer past 4 A per line
    var rhw = {};
    s.net.els.forEach(function (e) { if (!e.rh) return; var i = iElem(s, e), ir = Math.sqrt(i.dc * i.dc + mag(i.ac) * mag(i.ac) / 2); if (ir > RH.imax && (!rhw[e.rh] || ir > rhw[e.rh])) rhw[e.rh] = ir; });
    Object.keys(rhw).forEach(function (k) { warn.push({ k: "rheo", id: k, i: rhw[k] }); });
    s.net.els.forEach(function (e) { if (e.src !== "tp" || !s.ac) return; var ir = mag(s.ac.Iv[e.id] || Z0) / Math.SQRT2; if (ir > TP.imax) warn.push({ k: "tpmax", id: e.id, i: ir }); });
    // earth loop through the scope or generator ground
    ["sc.1gr", "sc.2gr", "fg.gnd"].forEach(function (id) {
      var e = elById(s, id); if (!e) return; var i = iElem(s, e);
      if (Math.abs(i.dc) > 0.005 || mag(i.ac) > 0.005) warn.push({ k: "earth", id: id });
    });
    var fs = {}; s.net.els.forEach(function (e) { if (e.k === "V" && e.ac) fs[e.f] = 1; });
    if (Object.keys(fs).length > 1) warn.push({ k: "twoAC" });
    out.sc = scope(s);
    out.mn = mains(s);
    out.wm = watt(s);
    out.pm = pmeter(s);
    return out;
  }

  /* oscilloscope: each channel = DC level + sine (phasor) measured from the tip to earth */
  function scope(sol) {
    var st = sol.state.inst.sc; if (!st || !elById(sol, "sc.1r")) return null;
    function ch(n) { var v = vNode(sol, "sc." + n), c = st["c" + n]; return { dc: c.cp === "AC" ? 0 : c.cp === "GND" ? 0 : v.dc, ac: c.cp === "GND" ? Z0 : v.ac, h: c.cp === "GND" ? null : v.h, cp: c.cp, on: c.on, vd: c.vd }; }
    return { c1: ch(1), c2: ch(2), f: sol.f, w: sol.w };
  }
  function mains(sol) {
    var e = elById(sol, "mn.meter"); if (!e || !sol.ac) return null;
    var i = iElem(sol, e).ac, v = sub(vNode(sol, "mn.L").ac, vNode(sol, "mn.N").ac);
    var S = mul(v, cx(i.re, -i.im)); S = cx(S.re / 2, S.im / 2);
    var Vr = mag(v) / Math.SQRT2, Ir = mag(i) / Math.SQRT2, P = S.re, pf = Vr * Ir > 0 ? P / (Vr * Ir) : 0;
    return { v: Vr, i: Ir, p: P, q: S.im, pf: pf };
  }

  /* wattmeter: P = Re(V·I*) of its voltage and current coils; the Σ key shows the total power the three-phase supply delivers */
  function watt(sol) {
    var sh = elById(sol, "wm.sh"); if (!sh || !sol.ac) return null;
    var i = iElem(sol, sh).ac, v = vBetween(sol, "wm.V", "wm.V'").ac, S1 = mul(v, cx(i.re, -i.im)), tot = 0;
    sol.net.els.forEach(function (e) { if (e.src !== "tp") return; var vv = sub(sol.ac.V[e.na], sol.ac.V[e.nb]), ii = sol.ac.Iv[e.id] || Z0; tot += -mul(vv, cx(ii.re, -ii.im)).re / 2; });
    return { p: S1.re / 2, tot: tot };
  }
  /* the power meter panel: per line the rms voltage to N, the rms current, P, Q and cos φ; and the sums */
  function pmeter(sol) {
    if (!elById(sol, "pm.1.sh") || !sol.ac) return null;
    var ph = ["1", "2", "3"].map(function (k) {
      var i = iElem(sol, elById(sol, "pm." + k + ".sh")).ac, v = vBetween(sol, "pm." + k, "pm.N").ac, S1 = mul(v, cx(i.re, -i.im));
      var V = mag(v) / Math.SQRT2, I = mag(i) / Math.SQRT2, P = S1.re / 2, Q = S1.im / 2;
      return { v: V, i: I, p: P, q: Q, pf: V * I > 1e-9 ? P / (V * I) : 0 };
    });
    var P = 0, Q = 0, Sa = 0; ph.forEach(function (x) { P += x.p; Q += x.q; Sa += x.v * x.i; });
    return { ph: ph, p: P, q: Q, pf: Sa > 1e-9 ? P / Sa : 0 };
  }
  function si(v, u) {
    var a = Math.abs(v), p = a >= 1e6 ? [1e6, "M"] : a >= 1e3 ? [1e3, "k"] : a >= 1 || a === 0 ? [1, ""] : a >= 1e-3 ? [1e-3, "m"] : a >= 1e-6 ? [1e-6, "µ"] : [1e-9, "n"];
    var n = v / p[0]; return (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1).replace(/\.0$/, "") : n.toFixed(2).replace(/\.?0+$/, "")) + " " + p[1] + u;
  }
  CV.clabSim = {
    si: si,
    cx: cx, add: add, sub: sub, mul: mul, div: div, mag: mag, ang: ang,
    solveMNA: solveMNA, build: build, solve: solve, read: read, vNode: vNode, vBetween: vBetween, iElem: iElem, elById: elById,
    ohms: ohms, actual: actual, defaults: defaults, rbValue: rbValue, lbValue: lbValue, cbValue: cbValue, DMM: DMM, LAMP: LAMP, COILS: COILS, TP: TP, RH: RH, acRms: acRms, at: at, NH: NH,
    fmtV: fmtV, fmtA: fmtA, fmtMA: fmtMA, fmtR: fmtR
  };
})(typeof window !== "undefined" ? window : globalThis);
