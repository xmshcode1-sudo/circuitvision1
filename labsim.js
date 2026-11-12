/* CircuitVision — Smart Lab circuit model and solver.
   A lab circuit is a grid of junction points with user elements on edges between neighbouring points.
   It is translated into the engine's element set (engine/mna.js for DC, engine/ac.js for the generator's
   frequency) and solved. Real-world parts use simple, stated models:
     LED  — off (open) or on (V_f in series with 10 Ω), state found by iteration
     LDR  — R = R_dark · (R_light / R_dark)^(light/100)   (log interpolation between two measured values)
     NTC  — R = R25 · exp[B (1/T − 1/298.15)]
     GEN  — ideal sine source with internal resistance R_s
     AM   — ammeter: 0 V source (ideal, no voltage drop)
     DEP  — linear dependent source (VCVS/CCVS/VCCS/CCCS); control = voltage across / current a→b through a resistive part
     Arduino Uno pins — 5V source; outputs = 0/5 V behind 25 Ω; PWM = its average voltage; INPUT_PULLUP = 35 kΩ to 5 V
   Every node also gets 1 GΩ to ground so unconnected parts do not make the equations unsolvable. */
(function (root) {
  "use strict";
  var CV = root.CV, C = CV.ac.C;
  var LED_VF = { red: 2.0, yellow: 2.1, blue: 3.0, white: 3.0 };
  var LED_R = 10, PIN_R = 25, PULLUP = 35000, GMIN = 1e9;
  var PINS = { "5V": [0, 0], D13: [1, 0], D9: [2, 0], D2: [3, 0], A0: [4, 0], A1: [5, 0], GND: [6, 0] };
  var PIN_NUM = { 13: "D13", 9: "D9", 2: "D2", 14: "A0", 15: "A1" };

  function ldrR(e, light) { return e.rdark * Math.pow(e.rlight / e.rdark, Math.max(0, Math.min(100, light)) / 100); }
  function ntcR(e, temp) { return e.r25 * Math.exp(e.beta * (1 / (temp + 273.15) - 1 / 298.15)); }
  function key(p) { return p.join(","); }
  var dcRes = function (e) { return e.k === "LDR" ? ldrR(e, 50) : e.k === "NTC" ? e.r25 : e.value; };

  /* Build engine edges. mode: "dc" | "ac". Returns { edges, map: id -> {edge, sign}, ground } */
  function build(lab, mode, ledOn, pins) {
    var out = [], map = {}, env = lab.env || { light: 50, temp: 25 }, ac = mode === "ac";
    function push(e) { out.push(e); return e; }
    function series(id, plusEnd, other, rv, src) {
      // plusEnd —R— virtual —V(+ at virtual)— other ; returns the V edge, oriented virtual→other
      var vn = ["v" + id, 0];
      push({ a: plusEnd, b: vn, type: "R", value: rv });
      return push({ a: vn, b: other, type: "V", value: src.value, phase: src.phase || 0, plus: "a" });
    }
    lab.edges.forEach(function (e) {
      var a = e.a, b = e.b, k = e.k, plusA = e.plus !== "b", pe = plusA ? a : b, oe = plusA ? b : a, h;
      if (k === "W") map[e.id] = { wire: push({ a: a, b: b, type: "W" }) };
      else if (k === "LAMP") map[e.id] = { edge: push({ a: a, b: b, type: "R", value: e.vr * e.vr / e.pr, name: e.id }), sign: 1 };
      else if (k === "DEP") map[e.id] = { edge: push({ a: a, b: b, type: e.dk, value: e.gain, ctrl: e.ctrl, plus: e.plus || "a", dir: e.dir || "ab", dep: true }), sign: 1 };
      else if (k === "PIR") { h = series(e.id, pe, oe, 100, { value: !ac && env.motion ? 3.3 : 0 }); map[e.id] = { edge: h, sign: plusA ? 1 : -1 }; }
      else if (k === "R") map[e.id] = { edge: push({ a: a, b: b, type: "R", value: e.value, name: e.id }), sign: 1 };
      else if (k === "LDR") map[e.id] = { edge: push({ a: a, b: b, type: "R", value: ldrR(e, env.light), name: e.id }), sign: 1 };
      else if (k === "NTC") map[e.id] = { edge: push({ a: a, b: b, type: "R", value: ntcR(e, env.temp), name: e.id }), sign: 1 };
      else if (k === "C") { if (ac) map[e.id] = { edge: push({ a: a, b: b, type: "C", value: e.value }), sign: 1 }; }
      else if (k === "L") map[e.id] = { edge: push(ac ? { a: a, b: b, type: "L", value: e.value } : { a: a, b: b, type: "V", value: 0, plus: "a" }), sign: 1 };
      else if (k === "V") map[e.id] = { edge: push({ a: a, b: b, type: "V", value: ac ? 0 : e.value, plus: e.plus || "a" }), sign: 1 };
      else if (k === "I") { if (!ac) map[e.id] = { edge: push({ a: a, b: b, type: "I", value: e.value, dir: e.dir || "ab" }), sign: 1 }; }
      else if (k === "AM") map[e.id] = { edge: push({ a: a, b: b, type: "V", value: 0, plus: "a" }), sign: 1 };
      else if (k === "SW") { if (e.closed) map[e.id] = { wire: push({ a: a, b: b, type: "W" }) }; }
      else if (k === "GEN") { h = series(e.id, pe, oe, e.rs, { value: ac ? e.amp : 0, phase: e.phase || 0 }); map[e.id] = { edge: h, sign: plusA ? 1 : -1 }; }
      else if (k === "LED") { if (!ac && ledOn[e.id]) { h = series(e.id, pe, oe, LED_R, { value: LED_VF[e.color] || 2 }); map[e.id] = { edge: h, sign: plusA ? 1 : -1 }; } }
    });
    var ground = lab.arduino ? PINS.GND : lab.ground;
    if (lab.arduino) {
      push({ a: PINS["5V"], b: PINS.GND, type: "V", value: ac ? 0 : 5, plus: "a", name: "__5v" });
      Object.keys(PIN_NUM).forEach(function (n) {
        var nm = PIN_NUM[n], st = pins && pins[n], p = PINS[nm];
        if (!st) return;
        if (st.mode === "OUTPUT") { var vv = st.pwm != null ? st.pwm / 255 * 5 : (st.out ? 5 : 0); map["__" + nm] = { edge: series("p" + nm, p, PINS.GND, PIN_R, { value: ac ? 0 : vv }), sign: 1 }; }
        else if (st.mode === "INPUT_PULLUP" || (st.mode === "INPUT" && st.out)) push({ a: PINS["5V"], b: p, type: "R", value: PULLUP });
      });
    }
    return { edges: out, map: map, ground: ground };
  }

  /* Solve one mode; adds GMIN, drops elements shorted by wires, reports shorted sources */
  function solveMode(lab, mode, ledOn, pins, omega) {
    var b = build(lab, mode, ledOn, pins), c = { rows: lab.rows, cols: lab.cols, ground: b.ground, omega: omega, edges: b.edges };
    var nodes = CV.mna.buildNodes(c), rep = {}, gid = nodes.of(b.ground);
    b.edges.forEach(function (e) { [e.a, e.b].forEach(function (p) { var i = nodes.of(p); if (i !== gid && rep[i] === undefined) rep[i] = p; }); });
    var shorted = [];
    c.edges = b.edges.filter(function (e) {
      if (e.type === "W" || nodes.of(e.a) !== nodes.of(e.b)) return true;
      if (e.type === "V" && Math.abs(e.value) > 1e-12) shorted.push(e);
      return false;
    });
    if (shorted.length) return { ok: false, error: "short" };
    var named = {}; c.edges.forEach(function (e) { if (e.name) named[e.name] = 1; });
    if (c.edges.some(function (e) { return e.dep && !named[e.ctrl]; })) return { ok: false, error: "ctrl" };
    Object.keys(rep).forEach(function (i) { c.edges.push({ a: rep[i], b: b.ground, type: "R", value: GMIN }); });
    var s; try { s = mode === "ac" ? CV.ac.solve(c) : CV.mna.solve(c); } catch (err) { return { ok: false, error: "invalid" }; }
    if (!s.ok) return { ok: false, error: s.reason === "singular" ? "singular" : "invalid" };
    var byEdge = new Map(); s.elements.forEach(function (it) { byEdge.set(it.edge, it); });
    wireCurrents(c, nodes, s, byEdge, mode === "ac");
    return { ok: true, s: s, map: b.map, byEdge: byEdge, ground: b.ground };
  }

  /* Ideal wires carry no equation of their own, so their currents come from KCL: inside each electrical
     node the wires form a small network; element currents enter it at points, and we split them over the
     wires as if every wire had the same tiny resistance (exact for trees; a fair split for wire loops). */
  function wireCurrents(c, nodes, s, byEdge, complex) {
    var groups = {};
    c.edges.forEach(function (e) { if (e.type === "W") { var g = nodes.of(e.a); (groups[g] = groups[g] || []).push(e); } });
    Object.keys(groups).forEach(function (g) {
      var ws = groups[g], idx = {}, pts = [];
      ws.forEach(function (w) { [w.a, w.b].forEach(function (p) { var k = key(p); if (idx[k] === undefined) { idx[k] = pts.length; pts.push(k); } }); });
      var n = pts.length, injR = new Array(n).fill(0), injI = new Array(n).fill(0);
      s.elements.forEach(function (it) {
        var ia = idx[key(it.edge.a)], ib = idx[key(it.edge.b)], re = complex ? it.i.re : it.i, im = complex ? it.i.im : 0;
        if (ia !== undefined) { injR[ia] -= re; injI[ia] -= im; }
        if (ib !== undefined) { injR[ib] += re; injI[ib] += im; }
      });
      var A = []; for (var i = 0; i < n; i++) A.push(new Array(n).fill(0));
      ws.forEach(function (w) { var x = idx[key(w.a)], y = idx[key(w.b)]; A[x][x] += 1; A[y][y] += 1; A[x][y] -= 1; A[y][x] -= 1; });
      var phR = lap(A, injR), phI = complex ? lap(A, injI) : null;
      ws.forEach(function (w) {
        var x = idx[key(w.a)], y = idx[key(w.b)], r = phR ? phR[x] - phR[y] : 0;
        byEdge.set(w, { edge: w, i: complex ? C.c(r, phI ? phI[x] - phI[y] : 0) : r });
      });
    });
  }
  function lap(A, z) { // Laplacian solve with point 0 fixed at 0 (rows/cols 1..n-1)
    var n = z.length; if (n < 2) return [0];
    var M = []; for (var i = 1; i < n; i++) M.push(A[i].slice(1).concat([z[i]]));
    var m = n - 1, k, j;
    for (k = 0; k < m; k++) {
      var piv = k; for (i = k + 1; i < m; i++) if (Math.abs(M[i][k]) > Math.abs(M[piv][k])) piv = i;
      if (Math.abs(M[piv][k]) < 1e-12) return null;
      var t = M[k]; M[k] = M[piv]; M[piv] = t;
      for (i = k + 1; i < m; i++) { var fct = M[i][k] / M[k][k]; for (j = k; j <= m; j++) M[i][j] -= fct * M[k][j]; }
    }
    var x = new Array(m);
    for (i = m - 1; i >= 0; i--) { var sm = M[i][m]; for (j = i + 1; j < m; j++) sm -= M[i][j] * x[j]; x[i] = sm / M[i][i]; }
    return [0].concat(x);
  }

  function genFreq(lab) { var g = lab.edges.filter(function (e) { return e.k === "GEN"; }); return g.length ? g[0].freq : null; }

  /* PWM: the pin switches between 0 and 5 V; average the two quasi-static states by the duty cycle
     (what a DC meter reads, and the average LED current) */
  function solve(lab, pins) {
    var pw = null;
    if (pins) Object.keys(pins).forEach(function (n) { var s = pins[n]; if (s.mode === "OUTPUT" && s.pwm != null && s.pwm > 0 && s.pwm < 255) pw = n; });
    if (!pw) return solveOnce(lab, pins);
    var d = pins[pw].pwm / 255, hi = JSON.parse(JSON.stringify(pins)), lo = JSON.parse(JSON.stringify(pins));
    hi[pw].pwm = 255; lo[pw].pwm = 0;
    var H = solveOnce(lab, hi), Lo = solveOnce(lab, lo);
    if (!H.ok) return H; if (!Lo.ok) return Lo;
    var el = {};
    Object.keys(H.el).forEach(function (id) {
      var a = H.el[id], b = Lo.el[id], o = {};
      for (var k in a) o[k] = typeof a[k] === "number" ? d * a[k] + (1 - d) * b[k] : a[k];
      if ("on" in a) o.on = a.on || b.on;
      el[id] = o;
    });
    var pinI = {}; Object.keys(H.pinI).forEach(function (k) { pinI[k] = d * H.pinI[k] + (1 - d) * (Lo.pinI[k] || 0); });
    return { ok: true, pwm: { pin: pw, duty: d }, dcV: function (p) { return d * H.dcV(p) + (1 - d) * Lo.dcV(p); }, acV: H.acV, ac: H.ac, el: el, pinI: pinI,
      warn: H.warn.concat(["PWM على " + pw + " بنسبة " + Math.round(d * 100) + "%: القراءات هنا متوسطات زمنية (ما يقرؤه ملتيميتر DC)."]), ground: H.ground };
  }

  /* One solve: DC (with LED iteration) + AC at the generator frequency. */
  function solveOnce(lab, pins) {
    var warn = [], leds = lab.edges.filter(function (e) { return e.k === "LED"; }), on = {}, dc, it;
    leds.forEach(function (e) { on[e.id] = true; });
    for (it = 0; it < 12; it++) {
      dc = solveMode(lab, "dc", on, pins);
      if (!dc.ok) break;
      var changed = false;
      leds.forEach(function (e) {
        var plusA = e.plus !== "b", va = dc.s.volt(e.a), vb = dc.s.volt(e.b), vf = (plusA ? va - vb : vb - va);
        if (on[e.id]) { var r = dc.byEdge.get(dc.map[e.id].edge); if (r && r.i < 0) { on[e.id] = false; changed = true; } }
        else if (vf > (LED_VF[e.color] || 2) + 1e-6) { on[e.id] = true; changed = true; }
      });
      if (!changed) break;
    }
    if (!dc.ok) return { ok: false, error: dc.error };
    var gens = lab.edges.filter(function (e) { return e.k === "GEN"; }), ac = null, f = genFreq(lab);
    if (gens.length) {
      if (gens.some(function (g) { return g.freq !== f; })) warn.push("أكثر من مولد بترددات مختلفة: المحاكاة تستخدم تردد المولد الأول فقط.");
      if (leds.length) warn.push("الـ LED عنصر غير خطي: مع مولد الإشارة نحسب جزء الإشارة المتغيرة كأن الـ LED مفتوح. النتيجة تقريبية.");
      ac = solveMode(lab, "ac", {}, pins, 2 * Math.PI * f);
      if (!ac.ok) return { ok: false, error: ac.error };
      ac.f = f; ac.omega = 2 * Math.PI * f;
    }
    function dcV(p) { var v = dc.s.volt(p); return isFinite(v) ? v : 0; }            // a point on no edge floats → 0 V (like GMIN)
    function acV(p) { var v = ac ? ac.s.volt(p) : null; return v && isFinite(v.re) ? v : C.c(0); }
    var el = {};
    lab.edges.forEach(function (e) {
      var v = dcV(e.a) - dcV(e.b), m = dc.map[e.id], i = 0;
      if (e.k === "R" || e.k === "LDR" || e.k === "NTC" || e.k === "LAMP") i = v / dc.map[e.id].edge.value;
      else if (m && m.wire) { var rw = dc.byEdge.get(m.wire); i = rw ? rw.i : 0; }
      else if (m) { var r = dc.byEdge.get(m.edge); i = r ? r.i * m.sign : 0; }
      var o = { v: v, i: i, p: v * i };
      if (e.k === "LDR" || e.k === "NTC") o.r = dc.map[e.id].edge.value;
      if (e.k === "LED") o.on = !!on[e.id];
      if (ac) {
        var va = C.sub(acV(e.a), acV(e.b)), am = ac.map[e.id], ia = C.c(0);
        if (am && am.wire) { var rw2 = ac.byEdge.get(am.wire); if (rw2) ia = rw2.i; }
        else if (am && am.edge) { var ra = ac.byEdge.get(am.edge); if (ra) ia = am.edge.type === "R" || am.edge.type === "C" || am.edge.type === "L" ? ra.i : C.scale(ra.i, am.sign); }
        o.vac = va; o.iac = ia;
      }
      el[e.id] = o;
    });
    var pinI = {};
    if (lab.arduino) Object.keys(PIN_NUM).forEach(function (n) { var m = dc.map["__" + PIN_NUM[n]]; if (m) { var r = dc.byEdge.get(m.edge); pinI[PIN_NUM[n]] = r ? -r.i : 0; } });
    if (lab.arduino) {
      Object.keys(PINS).forEach(function (nm) { if (nm === "5V" || nm === "GND") return; var v = dcV(PINS[nm]); if (v > 5.5 || v < -0.5) warn.push("⚠ جهد " + CV.num(v) + " V على المنفذ " + nm + ": خارج المسموح (0 إلى 5 V) وقد يتلف الـ Arduino."); });
      Object.keys(pinI).forEach(function (nm) { if (Math.abs(pinI[nm]) > 0.02) warn.push("⚠ تيار المنفذ " + nm + " = " + CV.ac.si(Math.abs(pinI[nm]), "A") + ": أكبر من 20 mA الموصى بها (الحد الأقصى 40 mA)."); });
      var r5 = dc.s.byName.__5v; if (r5 && -r5.i > 0.5) warn.push("⚠ الحمل على منفذ 5V يسحب " + CV.ac.si(-r5.i, "A") + ": أكبر مما يتحمله منفذ USB (500 mA).");
    }
    lab.edges.forEach(function (e) { if (e.k === "LAMP" && el[e.id].p > 1.3 * e.pr) warn.push("⚠ اللمبة تأخذ " + CV.ac.si(el[e.id].p, "W") + ": أعلى من تصنيفها " + CV.ac.si(e.pr, "W") + "؛ في الواقع قد تحترق."); });
    leds.forEach(function (e) { if (el[e.id].i > 0.03) warn.push("⚠ تيار الـ LED " + CV.ac.si(el[e.id].i, "A") + ": أكبر من حد القطعة النموذجي (20 mA)؛ في الواقع قد يحترق."); });
    lab.edges.forEach(function (e) { if ((e.k === "R" || e.k === "LDR" || e.k === "NTC") && el[e.id].p > 0.25) warn.push("⚠ المقاومة " + CV.ac.si(dcRes(e), "Ω") + " تبدد " + CV.ac.si(el[e.id].p, "W") + ": أكثر من 1/4 W."); });
    return { ok: true, dcV: dcV, acV: acV, ac: ac ? { f: ac.f, omega: ac.omega } : null, el: el, pinI: pinI, warn: warn, ground: dc.ground };
  }

  /* v(t) at a node: DC + AC */
  function vAt(res, p, t) { var a = res.acV(p); return res.dcV(p) + (res.ac ? C.abs(a) * Math.cos(res.ac.omega * t + C.arg(a) * Math.PI / 180) : 0); }

  root.CV.labsim = { solve: solve, vAt: vAt, PINS: PINS, PIN_NUM: PIN_NUM, LED_VF: LED_VF, ldrR: ldrR, ntcR: ntcR };
  if (typeof module !== "undefined") module.exports = root.CV.labsim;
})(typeof window !== "undefined" ? window : globalThis);
