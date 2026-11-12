/* CircuitVision — drawing and editing the breadboard (SVG).
   Placing a part: pick it from the parts box, tap the hole for its first leg, then the hole for the second.
   Wires and instrument cables the same way (a cable starts at an instrument jack on the bench strip).
   Hovering or picking a hole lights every hole that is already connected to it (the board's strips + wires).
   With Select: tap a part to edit it; drag a lit leg end to move that leg; drag the body to move the whole part. */
(function () {
  "use strict";
  var B = CV.bench, si = CV.ac.si;
  var P = 18, BX = 22, JY = 8, BY = 118;
  var RY = { "T+": 18, "T-": 18 + P };
  "abcde".split("").forEach(function (r, i) { RY[r] = 18 + 3 * P + i * P; });
  "fghij".split("").forEach(function (r, i) { RY[r] = 18 + 9 * P + i * P; });
  RY["B+"] = RY.j + 2 * P; RY["B-"] = RY["B+"] + P;
  var BOARD_H = RY["B-"] + 18;
  var LEDC = { red: "#ff4040", yellow: "#ffd23b", blue: "#3b8bff", white: "#f2f2ff", green: "#3ddc6a" };
  var WIRE = { red: "#d7262a", black: "#25272b", yellow: "#e8b400", green: "#1f9d55", blue: "#2563eb", orange: "#f07c1a", white: "#e9edf3", cyan: "#14b8c4" };

  /* bench strip with the instrument jacks */
  var GROUPS = [
    { t: "مزود الجهد", ch: [{ s: "CH1", j: [["PS1+", "+", "red"], ["PS1-", "−", "black"]] }, { s: "CH2", j: [["PS2+", "+", "red"], ["PS2-", "−", "black"]] }, { s: "CH3", j: [["PS3+", "+", "red"], ["PS3-", "−", "black"]] }] },
    { t: "مولد الإشارة", ch: [{ s: "CH1", j: [["FG1", "∿", "yellow"], ["FG1g", "⏚", "black"]] }, { s: "CH2", j: [["FG2", "∿", "cyan"], ["FG2g", "⏚", "black"]] }] },
    { t: "الأوسيلوسكوب", ch: [{ s: "CH1", j: [["S1", "مجس", "yellow"], ["S1g", "⏚", "black"]] }, { s: "CH2", j: [["S2", "مجس", "cyan"], ["S2g", "⏚", "black"]] }] },
    { t: "ملتيميتر 1", ch: [{ j: [["M1V", "VΩ", "red"], ["M1C", "COM", "black"], ["M1A", "A", "red"]] }] },
    { t: "ملتيميتر 2", ch: [{ j: [["M2V", "VΩ", "red"], ["M2C", "COM", "black"], ["M2A", "A", "red"]] }] }
  ];
  var ARD_GROUP = { t: "Arduino UNO", ch: [{ j: B.ARD_PINS.map(function (n) { return ["ARD" + n, n, n === "GND" ? "black" : n === "5V" ? "red" : "orange"]; }) }] };
  var JX = {}, BAR_W = 0;
  var lastGroups = [];
  function layoutJacks(ard, only) {
    JX = {}; var x = 10, gs = GROUPS.concat(ard ? [ARD_GROUP] : []), out = [];
    if (only) gs = gs.filter(function (g) { return g.ch.some(function (c) { return c.j.some(function (j) { return only[j[0]]; }); }); });
    gs.forEach(function (g) {
      var g0 = x, chs = [];
      g.ch.forEach(function (c) { var c0 = x; c.j.forEach(function (j) { JX[j[0]] = [x + 14, JY + 60]; x += 29; }); chs.push({ s: c.s, x0: c0, x1: x, j: c.j }); x += 6; });
      out.push({ t: g.t, x0: g0, x1: x - 6, ch: chs });
      x += 14;
    });
    BAR_W = x; lastGroups = out; return out;
  }

  var st = { tool: "select", first: null, hover: null, drag: null, sel: null, color: "auto", labels: true, flow: true };
  var host, cb, bench, solved, svg;

  function pos(p) {
    var q = B.parse(p);
    if (q.kind === "hole") return [BX + q.col * P, BY + RY[q.row]];
    if (q.kind === "rail") return [BX + q.col * P, BY + RY[q.side + q.pol]];
    return JX[p] || [0, 0];
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- names ---------- */
  var PREFIX = { R: "R", LED: "LED", LDR: "LDR", NTC: "NTC", C: "C", L: "L", BAT: "B", SW: "S", AM: "A", LAMP: "X", PIR: "PIR", DEP: "D" };
  function names(b) {
    var cnt = {}, out = {};
    b.parts.forEach(function (p) { var k = PREFIX[p.k]; if (!k) return; cnt[k] = (cnt[k] || 0) + 1; out[p.id] = p.tag && p.k !== "W" ? p.tag : k + cnt[k]; });
    for (var i = 1; i <= B.PS_N; i++) out["ps" + i] = "CH" + i + " للمزود";
    for (i = 1; i <= B.FG_N; i++) out["fg" + i] = "CH" + i + " للمولد";
    return out;
  }

  /* ---------- drawing ---------- */
  function boardSvg(cols, lit) {
    var W = BX + (cols + 1) * P, o = '<rect class="bb-board" x="' + (BX - 6) + '" y="' + BY + '" width="' + (W - BX + 12 - P) + '" height="' + BOARD_H + '" rx="10"/>';
    o += '<rect class="bb-gap" x="' + (BX) + '" y="' + (BY + RY.e + P * 0.62) + '" width="' + (W - BX - P) + '" height="' + (P * 0.76) + '" rx="3"/>';
    [["T+", "T-"], ["B+", "B-"]].forEach(function (pr) {
      pr.forEach(function (r) {
        var y = BY + RY[r] + (r[1] === "+" ? -P * 0.55 : P * 0.55);
        o += '<line class="bb-rail ' + (r[1] === "+" ? "p" : "m") + '" x1="' + (BX + P * 0.5) + '" x2="' + (W - P * 0.5) + '" y1="' + y + '" y2="' + y + '"/>';
        o += '<text class="bb-rl ' + (r[1] === "+" ? "p" : "m") + '" x="' + (BX - 1) + '" y="' + (BY + RY[r] + 4) + '">' + (r[1] === "+" ? "+" : "−") + '</text>';
      });
    });
    "abcdefghij".split("").forEach(function (r) { o += '<text class="bb-rowl" x="' + (BX + P * 0.25) + '" y="' + (BY + RY[r] + 3.5) + '">' + r + '</text>'; });
    for (var c = 1; c <= cols; c++) {
      if (c === 1 || c % 5 === 0) { o += '<text class="bb-coll" x="' + (BX + c * P) + '" y="' + (BY + RY.a - P * 0.7) + '">' + c + '</text><text class="bb-coll" x="' + (BX + c * P) + '" y="' + (BY + RY.j + P * 0.95) + '">' + c + '</text>'; }
      "abcdefghij".split("").forEach(function (r) { o += hole(r + c, lit); });
      ["T+", "T-", "B+", "B-"].forEach(function (r) { if (c % 6) o += hole(r[0] + r[1] + c, lit); });
    }
    return o;
  }
  function hole(p, lit) { var q = pos(p), cls = lit && lit[B.strip(p)] ? " lit" : ""; return '<rect class="bb-h' + cls + '" x="' + f(q[0] - 3.2) + '" y="' + f(q[1] - 3.2) + '" width="6.4" height="6.4" rx="1.2"/>'; }

  function jackBar(groups, lit) {
    var o = '<rect class="jb-bg" x="4" y="' + JY + '" width="' + (BAR_W - 8) + '" height="98" rx="10"/>';
    groups.forEach(function (G) {
      o += '<rect class="jb-dev" x="' + (G.x0 - 2) + '" y="' + (JY + 6) + '" width="' + (G.x1 - G.x0 + 4) + '" height="86" rx="7"/>';
      o += '<text class="jb-t" x="' + ((G.x0 + G.x1) / 2) + '" y="' + (JY + 21) + '">' + G.t + '</text>';
      G.ch.forEach(function (c) {
        if (c.s) o += '<text class="jb-s" x="' + ((c.x0 + c.x1) / 2) + '" y="' + (JY + 38) + '">' + c.s + '</text>';
        c.j.forEach(function (j) {
          var q = JX[j[0]], l = lit && lit[B.strip(j[0])];
          o += '<g class="jk' + (l ? " lit" : "") + '" data-jack="' + j[0] + '"><circle class="jk-o" cx="' + q[0] + '" cy="' + q[1] + '" r="9.5"/><circle class="jk-i ' + j[2] + '" cx="' + q[0] + '" cy="' + q[1] + '" r="6.5"/><circle class="jk-c" cx="' + q[0] + '" cy="' + q[1] + '" r="2.4"/>' +
            '<text class="jk-l" x="' + q[0] + '" y="' + (q[1] + 24) + '">' + j[1] + '</text></g>';
        });
      });
    });
    return o;
  }

  function partBody(p, d, x, nm) {
    var k = p.k, o = "", bl;
    function legs(b) { var h = Math.max(0, (d - b) / 2); return '<line class="pt-leg" x1="' + (-d / 2) + '" y1="0" x2="' + (-d / 2 + h) + '" y2="0"/><line class="pt-leg" x1="' + (d / 2 - h) + '" y1="0" x2="' + (d / 2) + '" y2="0"/>'; }
    if (k === "R" || k === "LDR" && false) {
      bl = Math.max(14, Math.min(d - 8, 50)); var bd = B.bands(p.value);
      o += legs(bl) + '<rect class="pt-r" x="' + (-bl / 2) + '" y="-5.2" width="' + bl + '" height="10.4" rx="5"/>';
      if (bd) { var n = bd.list.length, sp = bl * 0.62 / (n - 1); bd.list.forEach(function (c, i) { var bx = -bl * 0.34 + i * sp + (i === n - 1 ? sp * 0.35 : 0); o += '<rect x="' + f(bx - 1.6) + '" y="-5.2" width="3.2" height="10.4" fill="' + c[1] + '"/>'; }); }
    } else if (k === "LED") {
      var on = x && x.on && x.i > 1e-5, kk = on ? Math.min(1, x.i / 0.015) : 0, col = LEDC[p.color] || LEDC.red;
      o += legs(14) + (on ? '<circle cx="0" cy="0" r="' + f(10 + 14 * kk) + '" fill="' + col + '" opacity="' + (0.25 + 0.45 * kk).toFixed(2) + '" class="pt-glow"/>' : "") +
        '<circle cx="0" cy="0" r="7.5" fill="' + col + '" class="pt-led' + (on ? " on" : "") + '"/><path d="M5 -5.6 A7.5 7.5 0 0 1 5 5.6" class="pt-flat"/><text class="pt-pol" x="' + (-d / 2 + 4) + '" y="-5">+</text>';
    } else if (k === "C") {
      if (p.value >= 1e-6) { bl = Math.max(14, Math.min(d - 8, 24)); o += legs(bl) + '<rect class="pt-ce" x="' + (-bl / 2) + '" y="-7" width="' + bl + '" height="14" rx="3"/><rect class="pt-ces" x="' + (bl / 2 - 4) + '" y="-7" width="4" height="14"/>'; }
      else o += legs(12) + '<ellipse class="pt-cc" cx="0" cy="0" rx="6" ry="7.5"/>';
    } else if (k === "L") {
      bl = Math.max(16, Math.min(d - 8, 34)); o += legs(bl) + '<rect class="pt-l" x="' + (-bl / 2) + '" y="-6" width="' + bl + '" height="12" rx="6"/>';
      for (var i = 1; i < 5; i++) o += '<line class="pt-lw" x1="' + f(-bl / 2 + i * bl / 5) + '" x2="' + f(-bl / 2 + i * bl / 5) + '" y1="-6" y2="6"/>';
    } else if (k === "LDR") { o += legs(14) + '<circle class="pt-ldr" cx="0" cy="0" r="7.5"/><path class="pt-ldrz" d="M-4 -3h8l-8 2h8l-8 2h8"/>'; }
    else if (k === "NTC") { o += legs(12) + '<circle class="pt-ntc" cx="0" cy="0" r="6"/>'; }
    else if (k === "BAT") { bl = Math.max(22, Math.min(d - 6, 46)); o += legs(bl) + '<rect class="pt-bat" x="' + (-bl / 2) + '" y="-9" width="' + bl + '" height="18" rx="3"/><rect class="pt-batc" x="' + (-bl / 2) + '" y="-9" width="6" height="18" rx="2"/><text class="pt-batl" x="' + (-bl / 2 + 9) + '" y="4">+</text>'; }
    else if (k === "SW") { o += legs(16) + '<rect class="pt-sw" x="-8" y="-8" width="16" height="16" rx="2"/><circle class="pt-swb' + (p.closed ? " on" : "") + '" cx="0" cy="0" r="5"/>'; }
    else if (k === "LAMP") { var lp = x ? Math.max(0, Math.min(1.2, x.p / p.pr)) : 0; o += legs(16) + (lp > 0.02 ? '<circle cx="0" cy="0" r="' + f(12 + 20 * lp) + '" fill="#ffc94a" opacity="' + Math.min(0.75, 0.15 + 0.5 * lp).toFixed(2) + '" class="pt-glow"/>' : "") + '<circle class="pt-lamp" cx="0" cy="0" r="9"/><path class="pt-fil" d="M-4 2 q2 -6 4 0 q2 6 4 0"/>'; }
    else if (k === "PIR") { o += legs(18) + '<rect class="pt-pcb" x="-10" y="-10" width="20" height="20" rx="2"/><circle class="pt-dome" cx="0" cy="0" r="7"/>'; }
    else if (k === "AM") { o += legs(26) + '<rect class="pt-am" x="-13" y="-9" width="26" height="18" rx="3"/><rect class="pt-aml" x="-10" y="-6" width="20" height="12" rx="1.5"/>'; }
    else if (k === "DEP") { o += legs(30) + '<rect class="pt-ic" x="-15" y="-9" width="30" height="18" rx="2"/><circle class="pt-icd" cx="-11" cy="-5" r="1.6"/>'; }
    return o;
  }
  function wirePath(a, b, sag) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, k = Math.min(18, L * 0.22) * (sag || 1);
    var mx = (a[0] + b[0]) / 2 - dy / L * k, my = (a[1] + b[1]) / 2 + dx / L * k - (sag ? 0 : 0);
    return "M" + f(a[0]) + " " + f(a[1]) + " Q" + f(mx) + " " + f(my) + " " + f(b[0]) + " " + f(b[1]);
  }
  function wireColor(p) {
    if (p.color && WIRE[p.color]) return WIRE[p.color];
    return WIRE.blue;
  }
  function partLabel(p, x, nm) {
    if (p.k === "W") return "";
    var v = p.k === "R" ? si(p.value, "Ω") : p.k === "C" ? si(p.value, "F") : p.k === "L" ? si(p.value, "H") : p.k === "BAT" ? si(p.value, "V") : p.k === "LED" ? "" : p.k === "LAMP" ? si(p.vr, "V") : p.k === "DEP" ? p.dk : "";
    if (p.k === "AM") v = !x ? "—" : Math.abs(x.i) < 1e-9 && x.iac && CV.ac.C.abs(x.iac) > 1e-12 ? "~" + si(CV.ac.C.abs(x.iac) / Math.SQRT2, "A") + " rms" : si(Math.abs(x.i) < 1e-9 ? 0 : x.i, "A");
    return (nm[p.id] || "") + (v ? " " + v : "");
  }

  function render() {
    if (!host || !bench) return;
    var r = markup(bench, solved, { width: Math.round(Math.max(320, (host.clientWidth || 900) - 2) * st.zoom) });
    host.innerHTML = r.svg; svg = host.firstChild;
    var tip = document.getElementById("bb-tip");
    if (tip) tip.textContent = r.focus ? B.holeName(r.focus) + (r.lit ? " · موصول بـ " + countLit(r.lit, bench) : "") : "";
  }
  /* the SVG for a bench. o.still: a picture (build steps) — no hover, selection or handles; o.mark: ids to highlight */
  function markup(b, solved, o) {
    o = o || {}; var still = !!o.still, mark = o.mark || {}, dim = !!o.dim;
    var groups = o.keepJacks ? lastGroups : layoutJacks(b.inst.ard), W = Math.max(BAR_W, BX + (b.cols + 1) * P + 8), H = BY + BOARD_H + 8;
    var res = solved && solved.res && solved.res.ok ? solved.res : null, nm = names(b);
    // which conductors to light: the hovered/picked point's net
    var lit = null, focus = still ? null : st.first || st.hover;
    if (focus) {
      var u = B.connectivity(b, false), n = u.find(B.strip(focus)); lit = {};
      u.keys().forEach(function (k) { if (u.find(k) === n) lit[k] = 1; }); lit[B.strip(focus)] = 1;
    }
    var out = '<svg class="bb-svg" viewBox="0 0 ' + W + ' ' + H + '"' + (o.width ? ' width="' + o.width + '"' : "") + ' role="' + (still ? "img" : "application") + '" aria-label="' + esc(o.aria || "لوحة التجارب والأجهزة") + '">';
    out += jackBar(groups, lit) + boardSvg(b.cols, lit);
    // parts on the board first, cables last (on top)
    var parts = b.parts.slice().sort(function (x, y) { return (x.k === "W" ? 1 : 0) - (y.k === "W" ? 1 : 0); });
    var flow = '<g class="flow">', labels = "";
    parts.forEach(function (p) {
      if (!p.legs[0] || !p.legs[1]) return;
      var A = pos(p.legs[0]), C = pos(p.legs[1]), d = Math.hypot(C[0] - A[0], C[1] - A[1]), ang = Math.atan2(C[1] - A[1], C[0] - A[0]) * 180 / Math.PI;
      var x = res && res.el[p.id], sel = (!still && st.sel === p.id ? " sel" : "") + (mark[p.id] ? " new" : dim ? " old" : ""), warn = solved && solved.c.warn.some(function (w) { return w.part === p.id; }) ? " bad" : "";
      if (p.k === "W") {
        var jack = B.parse(p.legs[0]).kind === "jack" || B.parse(p.legs[1]).kind === "jack";
        var col = wireColor(p), path = wirePath(A, C, jack ? 1.6 : 1);
        out += '<g class="pt wire' + sel + '" data-id="' + p.id + '"><path class="w-hit" d="' + path + '"/><path class="w-sh" d="' + path + '"/><path class="w" d="' + path + '" stroke="' + col + '"/>' +
          '<circle class="w-end" cx="' + f(A[0]) + '" cy="' + f(A[1]) + '" r="3.4" fill="' + col + '"/><circle class="w-end" cx="' + f(C[0]) + '" cy="' + f(C[1]) + '" r="3.4" fill="' + col + '"/></g>';
      } else {
        out += '<g class="pt' + sel + warn + '" data-id="' + p.id + '" transform="translate(' + f((A[0] + C[0]) / 2) + ' ' + f((A[1] + C[1]) / 2) + ') rotate(' + f(ang) + ')"><rect class="pt-hit" x="' + f(-d / 2 - 4) + '" y="-11" width="' + f(d + 8) + '" height="22" rx="8"/>' + partBody(p, d, x, nm) + '</g>';
        if (still || st.labels) { var t = partLabel(p, x, nm), mx = (A[0] + C[0]) / 2, my = (A[1] + C[1]) / 2, horiz = Math.abs(C[1] - A[1]) < Math.abs(C[0] - A[0]); if (t) labels += '<text class="pt-name' + (p.k === "AM" ? " am" : "") + '" x="' + f(horiz ? mx : mx + 13) + '" y="' + f(horiz ? my - 13 : my + 3) + '" text-anchor="' + (horiz ? "middle" : "start") + '">' + esc(t) + '</text>'; }
      }
      if (!still && st.flow && x) { var dc = x.i || 0, amp = res.ac && x.iac ? CV.ac.C.abs(x.iac) : 0; if (Math.abs(dc) > 1e-6 || amp > 1e-6) flow += '<path class="flow-dot" d="M' + f(A[0]) + ' ' + f(A[1]) + ' L' + f(C[0]) + ' ' + f(C[1]) + '" data-dc="' + dc + '" data-amp="' + amp + '" data-ph="' + (x.iac ? CV.ac.C.arg(x.iac) : 0) + '"/>'; }
      if (x && p.k === "LED" && x.i > 0.03) labels += '<text class="pt-burn" x="' + f((A[0] + C[0]) / 2 + 10) + '" y="' + f((A[1] + C[1]) / 2 - 10) + '">⚠</text>';
    });
    out += flow + '</g>' + labels;
    // leg handles of the selected part
    var sp = b.parts.filter(function (p) { return p.id === st.sel; })[0];
    if (sp && !still && st.tool === "select") sp.legs.forEach(function (l, i) { if (l) { var q = pos(l); out += '<circle class="leg-h" data-leg="' + i + '" cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="8"/>'; } });
    // rubber band while placing
    if (!still && st.first && st.hover) { var a1 = pos(st.first), h1 = pos(st.hover); out += '<path class="rubber" d="' + wirePath(a1, h1, 1) + '"/>'; }
    if (!still && st.drag && st.drag.to) { var dq = pos(st.drag.to); out += '<circle class="drop" cx="' + f(dq[0]) + '" cy="' + f(dq[1]) + '" r="7"/>'; }
    if (focus) { var fq = pos(focus); out += '<circle class="focus" cx="' + f(fq[0]) + '" cy="' + f(fq[1]) + '" r="6.5"/>'; }
    out += '</svg>';
    return { svg: out, focus: focus, lit: lit };
  }
  function countLit(lit, b) {
    var n = 0; Object.keys(lit).forEach(function (k) { if (/^[UL]\d+$/.test(k)) n += 5; else if (/^[TB][+-]$/.test(k)) n += 0; else n++; });
    var rails = Object.keys(lit).filter(function (k) { return /^[TB][+-]$/.test(k); }).length;
    return (n ? n + " ثقوب" : "") + (rails ? (n ? " + " : "") + (rails === 1 ? "خط تغذية" : rails + " خطوط تغذية") : "");
  }

  /* ---------- hit testing ---------- */
  function svgPt(ev) { var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [(ev.clientX - r.left) / r.width * vb.width, (ev.clientY - r.top) / r.height * vb.height]; }
  function nearest(xy, free) {
    var x = xy[0], y = xy[1], best = null, bd = 1e9;
    if (y < BY - 4) { Object.keys(JX).forEach(function (j) { var q = JX[j], d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = j; } }); return bd < 20 ? best : null; }
    var col = Math.round((x - BX) / P); if (col < 1 || col > bench.cols) return null;
    var ry = y - BY;
    Object.keys(RY).forEach(function (r) { var d = Math.abs(RY[r] - ry); if (d < bd) { bd = d; best = r; } });
    if (bd > P * 0.62 || Math.abs(BX + col * P - x) > P * 0.62) return null;
    if (best.length === 2 && !(col % 6)) return null; // gaps in the rails
    return best.length === 2 ? best[0] + best[1] + col : best + col;
  }
  function occupied(p, except) {
    if (B.parse(p).kind === "jack") return false; // cables can stack on a jack
    return bench.parts.some(function (q) { return q !== except && (q.legs[0] === p || q.legs[1] === p); });
  }

  function autoColor(a) {
    if (st.color !== "auto") return st.color;
    var j = B.JACKS[a]; if (!j) return "blue";
    if (j.pol === "-" || j.pol === "C" || j.pin === "GND") return "black";
    if (j.dev === "fg" || j.dev === "sc") return j.ch === 2 ? "cyan" : "yellow";
    return "red";
  }
  function place(p) {
    if (!st.first) { if (occupied(p)) { cb.flash("هذا الثقب فيه رجل قطعة أو طرف سلك. اختر ثقبًا فارغًا."); return; } st.first = p; render(); return; }
    if (p === st.first) { st.first = null; render(); return; }
    if (occupied(p)) { cb.flash("هذا الثقب مشغول. اختر ثقبًا فارغًا."); return; }
    var k = st.tool, a = st.first, part = { id: cb.newId(), k: k, legs: [a, p] }, d = B.KIND[k].def || {};
    for (var q in d) part[q] = d[q];
    if (k === "W") { if (B.parse(p).kind === "jack" && B.parse(a).kind !== "jack") part.legs = [p, a]; part.color = autoColor(part.legs[0]); if (B.parse(part.legs[0]).kind === "jack") part.lead = true; }
    if (k !== "W" && (B.parse(a).kind === "jack" || B.parse(p).kind === "jack")) { cb.flash("القطع تُركّب في لوحة التجارب. الأجهزة توصلها بسلك من مقبسها."); st.first = null; render(); return; }
    st.first = null; bench.parts.push(part); st.sel = k === "W" ? null : part.id; cb.changed(true);
  }

  function bind() {
    host.addEventListener("pointermove", function (ev) {
      if (!svg) return;
      var p = nearest(svgPt(ev));
      if (st.drag) { st.drag.to = p; st.drag.moved = true; render(); return; }
      if (p !== st.hover) { st.hover = p; render(); }
    });
    host.addEventListener("pointerleave", function () { if (!st.drag && st.hover) { st.hover = null; render(); } });
    host.addEventListener("pointerdown", function (ev) {
      if (!svg) return;
      var t = ev.target, xy = svgPt(ev), p = nearest(xy);
      if (st.tool === "select") {
        var h = t.closest && t.closest(".leg-h");
        if (h) { ev.preventDefault(); st.drag = { leg: +h.dataset.leg, id: st.sel, to: null }; try { host.setPointerCapture(ev.pointerId); } catch (e) {} return; }
        var g = t.closest && t.closest(".pt");
        if (g && g.dataset.id === st.sel && g.classList.contains("pt") && !g.classList.contains("wire")) { ev.preventDefault(); st.drag = { body: true, id: st.sel, start: p, to: null }; try { host.setPointerCapture(ev.pointerId); } catch (e) {} return; }
      }
    });
    host.addEventListener("pointerup", function (ev) {
      if (!svg) return;
      if (st.drag) {
        var dr = st.drag, part = bench.parts.filter(function (q) { return q.id === dr.id; })[0]; st.drag = null;
        if (part && dr.moved && dr.to) {
          if (dr.leg !== undefined) {
            var other = part.legs[1 - dr.leg];
            if (dr.to === other || occupied(dr.to, part)) cb.flash("لا يمكن: الثقب مشغول.");
            else if (part.k !== "W" && B.parse(dr.to).kind === "jack") cb.flash("القطع تُركّب في اللوحة فقط.");
            else { part.legs[dr.leg] = dr.to; cb.changed(true); return; }
          } else if (dr.body && dr.start) { moveBody(part, dr.start, dr.to); return; }
        }
        render(); return;
      }
      var t = ev.target, p = nearest(svgPt(ev));
      if (st.tool === "select" || st.tool === "DEL") {
        var g = t.closest && t.closest(".pt");
        if (!g) { if (st.tool === "select" && st.sel) { st.sel = null; cb.select(null); render(); } return; }
        var id = g.dataset.id, part2 = bench.parts.filter(function (q) { return q.id === id; })[0];
        if (st.tool === "DEL") { bench.parts = bench.parts.filter(function (q) { return q.id !== id; }); if (st.sel === id) st.sel = null; cb.changed(true); return; }
        if (part2 && part2.k === "SW" && st.sel === id) { part2.closed = !part2.closed; cb.changed(true); return; }
        st.sel = id; cb.select(id); render(); return;
      }
      if (p) place(p);
    });
  }
  function moveBody(part, from, to) {
    var a = B.parse(from), b = B.parse(to);
    if (a.kind === "jack" || b.kind === "jack") { render(); return; }
    var dc = b.col - a.col, ROWS = ["T+", "T-", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "B+", "B-"];
    function rowOf(q) { return q.kind === "hole" ? q.row : q.side + q.pol; }
    var dr = ROWS.indexOf(rowOf(b)) - ROWS.indexOf(rowOf(a));
    var nl = part.legs.map(function (l) {
      var q = B.parse(l); if (q.kind === "jack") return null;
      var r = ROWS[ROWS.indexOf(rowOf(q)) + dr], c = q.col + dc; if (!r || c < 1 || c > bench.cols) return null;
      if (r.length === 2 && !(c % 6)) return null;
      return r.length === 2 ? r[0] + r[1] + c : r + c;
    });
    if (nl.some(function (l) { return !l || occupied(l, part); })) { cb.flash("لا يمكن نقلها هنا: ثقب مشغول أو خارج اللوحة."); render(); return; }
    part.legs = nl; cb.changed(true);
  }

  var api = {
    init: function (el, callbacks) { host = el; cb = callbacks; st.zoom = 1; bind(); },
    set: function (b, s) { bench = b; solved = s; render(); },
    render: render,
    tool: function (t) { st.tool = t; st.first = null; if (t !== "select") st.sel = null; render(); },
    color: function (c) { st.color = c; },
    zoom: function (z) { st.zoom = z; render(); },
    labels: function (on) { st.labels = on; render(); },
    flow: function (on) { st.flow = on; render(); },
    select: function (id) { st.sel = id; st.tool = "select"; render(); },
    selected: function () { return st.sel; },
    cancel: function () { st.first = null; render(); },
    names: names, WIRE: WIRE, LEDC: LEDC,
    picture: function (b, opt) {
      // a build-step picture: only the instruments it uses, and the board cut to the columns in use
      var used = {}, maxc = 12; (opt.full || b).parts.forEach(function (p) { p.legs.forEach(function (l) { if (!l) return; var q = B.parse(l); if (q.kind === "jack") used[l] = 1; else maxc = Math.max(maxc, q.col); }); });
      var c = JSON.parse(JSON.stringify(b)); c.cols = Math.min(b.cols, maxc + 3);
      layoutJacks(b.inst.ard, used);
      var svg = markup(c, opt && opt.solved, Object.assign({ still: true, keepJacks: true }, opt || {})).svg;
      layoutJacks(bench ? bench.inst.ard : false);
      return svg;
    }
  };
  CV.benchView = api;
})();
