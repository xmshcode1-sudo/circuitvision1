/* CircuitVision — sinusoidal steady-state (phasor) solver.
   Same grid circuit model as mna.js, plus:
     L  inductor (value in H)        C  capacitor (value in F)
     V / I sources carry `value` (amplitude) and `phase` (degrees): value∠phase
     c.omega  angular frequency in rad/s
   Phasors use AMPLITUDE (peak) values, as in Nilsson's Chapter 9.
   Everything is solved with complex Modified Nodal Analysis. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};

  /* ---------- complex numbers ---------- */
  var C = {
    c: function (re, im) { return { re: re, im: im || 0 }; },
    add: function (a, b) { return { re: a.re + b.re, im: a.im + b.im }; },
    sub: function (a, b) { return { re: a.re - b.re, im: a.im - b.im }; },
    mul: function (a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; },
    div: function (a, b) { var d = b.re * b.re + b.im * b.im; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }; },
    scale: function (a, k) { return { re: a.re * k, im: a.im * k }; },
    neg: function (a) { return { re: -a.re, im: -a.im }; },
    conj: function (a) { return { re: a.re, im: -a.im }; },
    abs: function (a) { return Math.hypot(a.re, a.im); },
    arg: function (a) { return Math.atan2(a.im, a.re) * 180 / Math.PI; },
    polar: function (m, deg) { var r = deg * Math.PI / 180; return { re: m * Math.cos(r), im: m * Math.sin(r) }; },
    close: function (a, b, rel) { var s = Math.max(C.abs(b), 1e-12); return C.abs(C.sub(a, b)) <= (rel || 0.01) * s; }
  };

  function impedance(e, w, opt) {
    if (e.type === "R") return C.c(e.value, 0);
    if (e.type === "L") return C.c(0, (opt && opt.noOmega ? 1 : w) * e.value);
    if (e.type === "C") { var x = 1 / (w * e.value); return C.c(0, opt && opt.capSign ? x : -x); }
    return null;
  }
  function srcPhasor(e) { return C.polar(e.value, e.phase || 0); }

  function solveLinear(A, z) {
    var n = z.length, i, j, k, M = A.map(function (row, r) { return row.map(function (v) { return { re: v.re, im: v.im }; }).concat([z[r]]); });
    for (k = 0; k < n; k++) {
      var piv = k;
      for (i = k + 1; i < n; i++) if (C.abs(M[i][k]) > C.abs(M[piv][k])) piv = i;
      if (C.abs(M[piv][k]) < 1e-12) return null;
      var t = M[k]; M[k] = M[piv]; M[piv] = t;
      for (i = k + 1; i < n; i++) {
        var f = C.div(M[i][k], M[k][k]);
        if (f.re === 0 && f.im === 0) continue;
        for (j = k; j <= n; j++) M[i][j] = C.sub(M[i][j], C.mul(f, M[k][j]));
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = M[i][n]; for (j = i + 1; j < n; j++) s = C.sub(s, C.mul(M[i][j], x[j])); x[i] = C.div(s, M[i][i]); }
    return x;
  }

  /* opt: { noOmega, capSign } produce deliberately wrong models used to recognise student mistakes */
  function solve(c, opt) {
    var w = c.omega, nodes = CV.mna.buildNodes(c), N = nodes.count;
    var els = c.edges.filter(function (e) { return e.type !== "W"; });
    var byName = {}; els.forEach(function (e) { if (e.name) byName[e.name] = e; });
    var vs = els.filter(function (e) { return e.type === "V" || e.type === "VCVS" || e.type === "CCVS"; });
    var M = N + vs.length, A = [], z = [], r;
    for (r = 0; r < M; r++) { A.push([]); for (var q = 0; q < M; q++) A[r].push(C.c(0)); z.push(C.c(0)); }
    function nd(p) { return nodes.of(p); }
    function add(rw, cl, v) { if (rw >= 0 && cl >= 0) A[rw][cl] = C.add(A[rw][cl], v); }
    for (var s = 0; s < els.length; s++) if (els[s].type !== "T" && nd(els[s].a) === nd(els[s].b)) return { ok: false, reason: "shorted" };
    function ctrl(e) { var ce = byName[e.ctrl]; return { c: nd(ce.a), d: nd(ce.b), Z: impedance(ce, w, opt) }; }
    els.forEach(function (e) {
      var a = nd(e.a), b = nd(e.b), Z = impedance(e, w, opt);
      if (Z) { var y = C.div(C.c(1), Z); add(a, a, y); add(b, b, y); add(a, b, C.neg(y)); add(b, a, C.neg(y)); }
      else if (e.type === "I") { var I = srcPhasor(e); if (e.dir !== "ab") I = C.neg(I); if (a >= 0) z[a] = C.sub(z[a], I); if (b >= 0) z[b] = C.add(z[b], I); }
      else if (e.type === "VCCS" || e.type === "CCCS") {
        var cn = ctrl(e), g = e.type === "VCCS" ? C.c(e.value) : C.div(C.c(e.value), cn.Z);
        if (e.dir === "ba") g = C.neg(g);
        add(a, cn.c, g); add(a, cn.d, C.neg(g)); add(b, cn.c, C.neg(g)); add(b, cn.d, g);
      }
    });
    vs.forEach(function (e, i) {
      var a = nd(e.a), b = nd(e.b), row = N + i, sg = e.plus === "a" ? 1 : -1;
      add(a, row, C.c(1)); add(b, row, C.c(-1)); add(row, a, C.c(1)); add(row, b, C.c(-1));
      if (e.type === "V") z[row] = C.scale(srcPhasor(e), sg);
      else { var cn = ctrl(e), k = e.type === "VCVS" ? C.c(e.value) : C.div(C.c(e.value), cn.Z); add(row, cn.c, C.scale(k, -sg)); add(row, cn.d, C.scale(k, sg)); }
    });
    var x = solveLinear(A, z);
    if (!x) return { ok: false, reason: "singular" };
    function volt(p) { var i = nd(p); return i < 0 ? C.c(0) : x[i]; }
    var out = [], res = {};
    els.forEach(function (e) {
      if (e.type === "T") return;
      var v = C.sub(volt(e.a), volt(e.b)), i, Z = impedance(e, w, opt);
      if (Z) i = C.div(v, Z);
      else if (e.type === "I") i = e.dir === "ab" ? srcPhasor(e) : C.neg(srcPhasor(e));
      else if (vs.indexOf(e) > -1) i = x[N + vs.indexOf(e)];
      else { var ce = byName[e.ctrl], vc = C.sub(volt(ce.a), volt(ce.b)), g2 = e.type === "VCCS" ? C.c(e.value) : C.div(C.c(e.value), impedance(ce, w, opt)); i = C.mul(g2, vc); if (e.dir !== "ab") i = C.neg(i); }
      var it = { edge: e, v: v, i: i, s: C.mul(v, C.conj(i)) };
      out.push(it); if (e.name) res[e.name] = it;
    });
    return { ok: true, volt: volt, elements: out, byName: res, nodes: nodes };
  }

  /* Port quantities: Zeq (no sources), Thévenin (v_oc, i_sc, Z_th) */
  function port(c, opt) {
    var p = c.edges.filter(function (e) { return e.type === "T"; })[0];
    function variant(fn) { var k = { rows: c.rows, cols: c.cols, omega: c.omega, ground: c.ground, edges: c.edges.map(function (e) { var o = {}; for (var q in e) o[q] = e[q]; return fn(o) || o; }) }; return k; }
    var open = variant(function (e) { if (e.type === "T") { e.type = "I"; e.value = 0; e.phase = 0; e.dir = "ba"; e.name = "__p"; } });
    var so = solve(open, opt); if (!so.ok) return null;
    var voc = C.sub(so.volt(p.a), so.volt(p.b));
    var sh = variant(function (e) { if (e.type === "T") { e.type = "V"; e.value = 0; e.phase = 0; e.plus = "a"; e.name = "__sc"; } });
    var ss = solve(sh, opt); if (!ss.ok) return null;
    var isc = ss.byName.__sc.i;
    var test = variant(function (e) { if (e.type === "T") { e.type = "I"; e.value = 1; e.phase = 0; e.dir = "ba"; e.name = "__t"; } else if (e.type === "V" || e.type === "I") { e.value = 0; } });
    var st = solve(test, opt); if (!st.ok) return null;
    var zth = C.sub(st.volt(p.a), st.volt(p.b));
    return { voc: voc, isc: isc, zth: zth, open: so };
  }

  /* Mesh currents: the relation between branch and mesh currents has real ±1 coefficients,
     so real and imaginary parts can be solved separately with the DC routine. */
  function meshes(c, sol) {
    var re = CV.analysis.meshes(c, { elements: sol.elements.map(function (it) { return { edge: it.edge, i: it.i.re }; }) });
    var im = CV.analysis.meshes(c, { elements: sol.elements.map(function (it) { return { edge: it.edge, i: it.i.im }; }) });
    if (!re || !im) return null;
    return re.map(function (m, k) { return { at: m.at, text: m.text, name: m.name, value: C.c(m.value, im[k].value) }; });
  }

  /* ---------- formatting ---------- */
  var PRE = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"]];
  function si(v, unit) {
    var a = Math.abs(v);
    if (a === 0) return "0 " + unit;
    for (var i = 0; i < PRE.length; i++) if (a >= PRE[i][0] * 0.9999) return CV.num(v / PRE[i][0]) + " " + PRE[i][1] + unit;
    return CV.num(v) + " " + unit;
  }
  function polarStr(z, unit) {
    var m = C.abs(z), d = C.arg(z);
    if (m < 1e-12) return "0" + (unit ? " " + unit : "");
    return CV.num(m) + "∠" + CV.num(Math.abs(d) < 1e-9 ? 0 : d) + "°" + (unit ? " " + unit : "");
  }
  function rectStr(z, unit) {
    var re = Math.abs(z.re) < 1e-12 ? 0 : z.re, im = Math.abs(z.im) < 1e-12 ? 0 : z.im;
    var s = (re !== 0 || im === 0 ? CV.num(re) : "") + (im !== 0 ? (re !== 0 ? (im < 0 ? " − j" : " + j") : (im < 0 ? "−j" : "j")) + CV.num(Math.abs(im)) : "");
    return s + (unit ? " " + unit : "");
  }


  /* ================= AC question generator ================= */
  var OMEGAS = [100, 200, 250, 400, 500, 1000, 2000, 5000];
  var XS = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
  var PHASES = [0, 0, 30, 45, 60, 90, -30, -45, -60, -90];
  var AMPS_V = [10, 12, 20, 24, 30, 40, 50, 60, 100], AMPS_I = [1, 2, 3, 4, 5, 10];
  function cleanC(z) { function ok(x) { var s = Math.abs(x) < 1 ? x * 1000 : x; return Math.abs(s * 2 - Math.round(s * 2)) < 1e-6; } return ok(z.re) && ok(z.im); }
  function niceC(z) { var m = C.abs(z); return m >= 0.05 && m <= 2000; }

  function generate(opts) {
    var Gi = CV.gen._internal, seed = opts.seed >>> 0, kinds = opts.kinds || [opts.kind];
    for (var attempt = 1; attempt < 700; attempt++) {
      var R = CV.gen.rng(seed + attempt * 7919), kind = R.pick(kinds);
      var fams = (opts.families || ["loop", "ladder", "grid"]).filter(function (f) { return !(kind === "acZ" && f === "pair"); });
      var fam = R.pick(fams), c = Gi.FAMILIES[fam](R, { single: kind === "acZ" });
      var w = R.pick(OMEGAS); c.omega = w;
      var port = kind === "acZ" || kind === "acVth" || kind === "acZth" || kind === "acPmax";
      if (port) {
        var col = kind === "acZ" ? 0 : c.cols - 1;
        var cand = c.edges.filter(function (e) { return e.a[0] !== e.b[0] && e.a[1] === col; });
        var pe = R.pick(cand); pe.type = "T"; delete pe.value; delete pe.plus; delete pe.dir;
        if (kind === "acZ") c.edges.forEach(function (e) { if (e.type === "V" || e.type === "I") { e.type = "R"; e.value = R.pick(Gi.RV); delete e.plus; delete e.dir; } });
        else if (!c.edges.some(function (e) { return e.type === "V" || e.type === "I"; })) { var rr = R.pick(c.edges.filter(function (e) { return e.type === "R"; })); if (!rr) continue; Gi.addSource(rr, R, "V"); }
      }
      // turn resistors into R, L or C; give sources a phase
      var reactive = 0;
      c.edges.forEach(function (e) {
        if (e.type === "R") { var u = R(); if (u < 0.32) { e.type = "L"; e.value = R.pick(XS) / w; reactive++; } else if (u < 0.62) { e.type = "C"; e.value = 1 / (w * R.pick(XS)); reactive++; } }
        else if (e.type === "V") { e.value = R.pick(AMPS_V); e.phase = R.pick(PHASES); }
        else if (e.type === "I") { e.value = R.pick(AMPS_I); e.phase = R.pick(PHASES); }
      });
      if (!reactive) continue;
      if (opts.dependent && !port && !Gi.makeDependent(c, R)) continue;
      Gi.nameAll(c);
      c.edges.forEach(function (e) { if (e.type === "L") e.name = e.name.replace(/^R/, "L"); if (e.type === "C") e.name = e.name.replace(/^R/, "C"); });
      // renumber per type in reading order
      var cnt = { L: 0, C: 0, R: 0 };
      c.edges.filter(function (e) { return e.type === "R" || e.type === "L" || e.type === "C"; })
        .sort(function (x, y) { return (x.a[0] + x.b[0]) - (y.a[0] + y.b[0]) || (x.a[1] + x.b[1]) - (y.a[1] + y.b[1]); })
        .forEach(function (e) { e.name = e.type + (++cnt[e.type]); });
      if (c.edges.filter(function (e) { return e.type === "R" || e.type === "L" || e.type === "C"; }).length < 2) continue;
      var g = null;
      try { g = build(c, kind, R); } catch (err) { g = null; }
      if (!g) continue;
      if (attempt < 450 && !cleanC(g.question.z)) { c.edges.forEach(function (e) { delete e.asked; }); delete c.nodeLabels; delete c.meshLabels; continue; }
      c.seed = seed; c.attempt = attempt;
      g.seed = seed; g.family = fam; g.acq = true;
      return g;
    }
    return null;
  }

  function build(c, kind, R) {
    var g = { circuit: c }, q;
    if (kind === "acPmax") {
      var pp = port(c); if (!pp || C.abs(pp.voc) < 1e-6 || pp.zth.re < 0.05) return null;
      g.port = pp;
      var pm0 = C.abs(pp.voc) * C.abs(pp.voc) / (8 * pp.zth.re);
      if (pm0 < 0.01 || pm0 > 5000) return null;
      g.question = { kind: kind, z: C.c(pm0), value: pm0, unit: "W", el: "ab" };
      return g;
    }
    if (kind === "acZ" || kind === "acVth" || kind === "acZth") {
      var pr = port(c); if (!pr) return null;
      g.port = pr;
      if (kind !== "acZ" && C.abs(pr.voc) < 1e-6) return null;
      var z = kind === "acVth" ? pr.voc : pr.zth;
      if (!niceC(z) || (kind !== "acVth" && pr.zth.re < -1e-9)) return null;
      q = { kind: kind, z: z, unit: kind === "acVth" ? "V" : "Ω", el: "ab" };
    } else {
      var sol = solve(c); if (!sol.ok) return null;
      // no idle branches: every passive element must carry current
      if (sol.elements.some(function (it) { return /^[RLC]$/.test(it.edge.type) && C.abs(it.i) < 1e-9; })) return null;
      g.solution = sol;
      if (kind === "acVN") {
        var nl = CV.analysis.nodeLabels(c); if (nl.length < 1) return null;
        nl.forEach(function (n) { n.value = sol.volt(n.at); });
        var cn = nl.filter(function (n) { return niceC(n.value); }); if (!cn.length) return null;
        var pk = R.pick(cn); c.nodeLabels = nl; c.showGround = true; c.askedNode = pk.name; g.nodes = nl;
        q = { kind: kind, z: pk.value, unit: "V", el: pk.name, label: pk.text };
      } else if (kind === "acIM") {
        var ms = meshes(c, sol); if (!ms || ms.length < 2) return null;
        var cm = ms.filter(function (m) { return niceC(m.value); }); if (!cm.length) return null;
        var pm = R.pick(cm); c.meshLabels = ms; c.askedMesh = pm.name; g.meshes = ms;
        q = { kind: kind, z: pm.value, unit: "A", el: pm.name, label: pm.text };
      } else if (kind === "acP" || kind === "acQ" || kind === "acS") {
        var cands = sol.elements.filter(function (it) {
          if (!niceC(it.i)) return false;
          if (kind === "acQ") return it.edge.type === "L" || it.edge.type === "C";
          if (kind === "acS") return it.edge.type === "V" || it.edge.type === "I";
          return it.edge.type === "R" || it.edge.type === "V" || it.edge.type === "I";
        });
        if (!cands.length) return null;
        var tp = R.pick(cands), src = tp.edge.type === "V" || tp.edge.type === "I";
        var Sabs = C.scale(tp.s, 0.5), Sdel = C.scale(tp.s, -0.5);
        tp.edge.asked = "p";
        g.target = tp;
        if (kind === "acS") {
          if (!niceC(Sdel) || Math.abs(Sdel.re) < 0.05 * C.abs(Sdel)) return null;
          g.question = { kind: kind, z: Sdel, unit: "VA", el: tp.edge.name, src: true, phasor: true, value: C.abs(Sdel) };
          return g;
        }
        var val = kind === "acQ" ? Sabs.im : (src ? Sdel.re : Sabs.re);
        if (Math.abs(val) < 0.01 || Math.abs(val) > 5000) return null;
        g.question = { kind: kind, z: C.c(val), value: val, unit: kind === "acQ" ? "VAR" : "W", el: tp.edge.name, src: src };
        return g;
      } else {
        var passive = sol.elements.filter(function (it) { return /^[RLC]$/.test(it.edge.type) && niceC(it.i) && niceC(it.v); });
        if (!passive.length) return null;
        var t = R.pick(passive), isI = kind === "acI";
        t.edge.asked = isI ? "iR" : "vR";
        q = { kind: kind, z: isI ? t.i : t.v, unit: isI ? "A" : "V", el: t.edge.name };
      }
    }
    q.phasor = true; q.value = C.abs(q.z);
    g.question = q;
    return g;
  }

  function wrongModel(g, opt) {
    var q = g.question, c = g.circuit;
    try {
      if (q.kind === "acPmax") { var pq = port(c, opt); return pq && pq.zth.re > 0 ? C.c(C.abs(pq.voc) * C.abs(pq.voc) / (8 * pq.zth.re)) : null; }
      if (q.kind === "acP" || q.kind === "acQ" || q.kind === "acS") { var sw = solve(c, opt); if (!sw.ok) return null; var it = sw.byName[q.el], sh = C.scale(it.s, q.src ? -0.5 : 0.5); return q.kind === "acS" ? sh : C.c(q.kind === "acQ" ? C.scale(it.s, 0.5).im : sh.re); }
      if (q.kind === "acZ" || q.kind === "acVth" || q.kind === "acZth") { var p = port(c, opt); return p && (q.kind === "acVth" ? p.voc : p.zth); }
      var s = solve(c, opt); if (!s.ok) return null;
      if (q.kind === "acVN") { var n = g.nodes.filter(function (x) { return x.name === q.el; })[0]; return s.volt(n.at); }
      if (q.kind === "acIM") { var m = meshes(c, s); return m && m.filter(function (x) { return x.name === q.el; })[0].value; }
      return q.kind === "acI" ? s.byName[q.el].i : s.byName[q.el].v;
    } catch (e) { return null; }
  }

  var POWER = { acP: 1, acQ: 1, acS: 1, acPmax: 1 };
  function powerDistractors(g) {
    var q = g.question, out = [], ans = q.z;
    function add(v, type, why) {
      if (!v || !isFinite(v.re) || !isFinite(v.im) || C.close(v, ans) || C.abs(v) < 1e-3 * C.abs(ans)) return;
      if (type !== "sign" && C.close(v, C.neg(ans))) return;
      if (out.some(function (o) { return C.close(q.phasor ? o.value : C.c(o.value), v); })) return;
      out.push({ value: q.phasor ? v : v.re, type: type, why: why });
    }
    var half = "نسيت معامل <span class='ltr'>½</span>. الفيزورات هنا بالقيمة <b>العظمى</b>، فالقدرة <span class='ltr'>P = ½·V<sub>m</sub>I<sub>m</sub>cos(θ<sub>v</sub> − θ<sub>i</sub>)</span>. (لو حوّلت إلى rms أولًا تختفي ½: <span class='ltr'>P = V<sub>rms</sub>I<sub>rms</sub>cos θ</span>.)";
    if (q.kind === "acPmax") {
      add(C.scale(ans, 2), "formula", "استخدمت <span class='ltr'>|V<sub>Th</sub>|²/(4R<sub>Th</sub>)</span> مع فيزور بالقيمة العظمى. مع القيمة العظمى: <span class='ltr'>P<sub>max</sub> = |V<sub>Th</sub>|²/(8R<sub>Th</sub>)</span>، ومع rms: <span class='ltr'>|V<sub>Th,rms</sub>|²/(4R<sub>Th</sub>)</span>.");
      var zt = g.port.zth; if (Math.abs(zt.im) > 1e-6) add(C.c(C.abs(g.port.voc) * C.abs(g.port.voc) * zt.re / (8 * C.abs(zt) * C.abs(zt))), "conceptual", "هذه قدرة حمل يساوي <span class='ltr'>Z<sub>Th</sub></span> نفسها. أقصى نقل يحتاج <span class='ltr'>Z<sub>L</sub> = Z<sub>Th</sub>*</span> (المرافق) لتلغي المفاعلة.");
      return out;
    }
    var t = g.target, Sh = C.scale(t.s, q.src ? -0.5 : 0.5);
    if (q.kind === "acS") {
      add(C.scale(ans, 2), "formula", half.replace("P = ½·V<sub>m</sub>I<sub>m</sub>cos(θ<sub>v</sub> − θ<sub>i</sub>)", "S = ½·V·I*"));
      add(C.conj(ans), "formula", "استخدمت <span class='ltr'>V*·I</span> بدل <span class='ltr'>V·I*</span>، فانعكست إشارة الجزء التخيلي Q. القدرة المركبة <span class='ltr'>S = ½·V·I*</span>.");
      add(C.neg(ans), "sign", "هذه القدرة التي <b>يمتصها</b> المصدر باصطلاح الإشارة السالب. المطلوب القدرة التي <b>يُسلّمها</b> المصدر للدائرة.");
      add(C.scale(ans, 1 / Math.SQRT2), "unit", "قسمت على √2 مرة زائدة. إما أن تحوّل V و I إلى rms ثم <span class='ltr'>S = V<sub>rms</sub>I<sub>rms</sub>*</span>، أو تستخدم القيم العظمى مع ½ — ليس الاثنين معًا.");
    } else {
      add(C.scale(ans, 2), "formula", half);
      add(C.c(C.abs(Sh)), "conceptual", q.kind === "acQ" ? "هذه القدرة الظاهرية <span class='ltr'>|S|</span>، لا القدرة الردية. <span class='ltr'>Q = ½·V<sub>m</sub>I<sub>m</sub>sin(θ<sub>v</sub> − θ<sub>i</sub>)</span>." : "هذه القدرة الظاهرية <span class='ltr'>|S| = ½·V<sub>m</sub>I<sub>m</sub></span>، بدون معامل القدرة. اضرب في <span class='ltr'>cos(θ<sub>v</sub> − θ<sub>i</sub>)</span>.");
      add(C.c(q.kind === "acQ" ? Sh.re : Sh.im), "conceptual", q.kind === "acQ" ? "هذا الجزء الحقيقي من S (القدرة المتوسطة P). المطلوب الجزء التخيلي Q." : "هذا الجزء التخيلي من S (القدرة الردية Q). القدرة المتوسطة هي الجزء الحقيقي.");
      add(C.scale(ans, 1 / Math.SQRT2), "unit", "قسمت على √2 مرة زائدة: إما rms بدون ½، أو قيم عظمى مع ½.");
      if (q.kind === "acQ") add(C.neg(ans), "sign", "إشارة Q معكوسة. الملف يمتص قدرة ردية موجبة <span class='ltr'>(Q > 0)</span>، والمكثف سالبة <span class='ltr'>(Q < 0)</span>.");
      else if (q.src) add(C.neg(ans), "sign", "هذه القدرة التي يمتصها المصدر (باصطلاح الإشارة). المطلوب القدرة التي يُسلّمها.");
    }
    if (g.circuit.edges.some(function (e) { return e.type === "C"; })) add(wrongModel(g, { capSign: true }), "sign", "استخدمت ممانعة المكثف بإشارة موجبة. الصحيح <span class='ltr'>Z<sub>C</sub> = −j/(ωC)</span>.");
    if (g.circuit.edges.some(function (e) { return e.type === "L"; })) add(wrongModel(g, { noOmega: true }), "formula", "نسيت ضرب L في ω. ممانعة الملف <span class='ltr'>Z<sub>L</sub> = jωL</span>.");
    return out;
  }

  function distractors(g) {
    var q = g.question, out = [];
    if (POWER[q.kind]) return powerDistractors(g);
    function add(v, type, why) { if (!v || !isFinite(v.re) || !isFinite(v.im) || C.close(v, q.z) || C.close(v, C.conj(q.z))) return; if (out.some(function (o) { return C.close(o.value, v); })) return; out.push({ value: v, type: type, why: why }); }
    if (g.circuit.edges.some(function (e) { return e.type === "C"; })) add(wrongModel(g, { capSign: true }), "sign", "استخدمت ممانعة المكثف بإشارة موجبة. الصحيح <span class='ltr'>Z<sub>C</sub> = −j/(ωC)</span>.");
    if (g.circuit.edges.some(function (e) { return e.type === "L"; })) add(wrongModel(g, { noOmega: true }), "formula", "نسيت ضرب L في ω. ممانعة الملف <span class='ltr'>Z<sub>L</sub> = jωL</span>.");
    if (g.nodes) g.nodes.forEach(function (n) { if (n.name !== q.el) add(n.value, "substitution", "هذه قيمة جهد العقدة <span class='ltr'>" + n.text + "</span>."); });
    if (g.meshes) g.meshes.forEach(function (m) { if (m.name !== q.el) { add(m.value, "substitution", "هذا تيار الحلقة <span class='ltr'>" + m.text + "</span>."); } });
    if (g.solution && (q.kind === "acI" || q.kind === "acV")) g.solution.elements.forEach(function (it) { if (it.edge.name !== q.el && /^[RLC]$/.test(it.edge.type)) add(q.kind === "acI" ? it.i : it.v, "substitution", "هذه قيمة العنصر <span class='ltr'>" + it.edge.name + "</span> وليس <span class='ltr'>" + q.el + "</span>."); });
    return out;
  }

  function steps(g) {
    var q = g.question, L = [], u = q.unit;
    L.push("ممانعات العناصر عند <span class='ltr'>ω = " + g.circuit.omega + " rad/s</span>: " + g.circuit.edges.filter(function (e) { return /^[RLC]$/.test(e.type); }).map(function (e) { return "<span class='eq-i'>Z<sub>" + e.name + "</sub> = " + rectStr(impedance(e, g.circuit.omega)) + " Ω</span>"; }).join("، "));
    if (q.kind === "acPmax") {
      var zt = g.port.zth, vth = g.port.voc;
      L.push("<span class='eq-i'>V<sub>Th</sub> = " + polarStr(vth, "V") + "</span>، <span class='eq-i'>Z<sub>Th</sub> = " + rectStr(zt) + " Ω</span>");
      L.push("أقصى نقل عندما <span class='eq-i'>Z<sub>L</sub> = Z<sub>Th</sub>* = " + rectStr(C.conj(zt)) + " Ω</span>");
      L.push("<span class='eq-i'>P<sub>max</sub> = |V<sub>Th</sub>|² / (8R<sub>Th</sub>) = " + CV.num(C.abs(vth)) + "² / (8 × " + CV.num(zt.re) + ") = " + si(q.value, "W") + "</span>");
      return L;
    }
    if (POWER[q.kind]) {
      var t = g.target, Sh = C.scale(t.s, q.src ? -0.5 : 0.5);
      L.push("<span class='eq-i'>" + t.edge.name + ": V = " + polarStr(t.v, "V") + " , I = " + polarStr(t.i, "A") + "</span> <span class='muted'>(اتجاه I من الطرف + للجهد)</span>");
      L.push((q.src ? "القدرة المُسلَّمة من المصدر: <span class='eq-i'>S = −½·V·I*</span>" : "القدرة الممتصة: <span class='eq-i'>S = ½·V·I*</span>") + " = <span class='eq-i'>" + rectStr(Sh, "VA") + "</span>");
      if (q.kind === "acP") L.push("<span class='eq-i'>P = Re{S} = " + si(q.value, "W") + "</span>");
      else if (q.kind === "acQ") L.push("<span class='eq-i'>Q = Im{S} = " + si(q.value, "VAR") + "</span>" + (t.edge.type === "L" ? " (ملف: Q موجبة)" : " (مكثف: Q سالبة)"));
      else L.push("<span class='eq-i'>S = " + rectStr(q.z, "VA") + " = " + polarStr(q.z, "VA") + "</span>، <span class='eq-i'>pf = cos(" + CV.num(C.arg(q.z)) + "°) = " + CV.num(Math.abs(Math.cos(C.arg(q.z) * Math.PI / 180))) + "</span>");
      return L;
    }
    if (q.kind === "acZ") L.push("المقاومة المكافئة بين a و b: <span class='eq-i'>Z = " + rectStr(q.z) + " = " + polarStr(q.z) + " Ω</span>");
    else if (q.kind === "acVth" || q.kind === "acZth") { L.push("<span class='eq-i'>V<sub>Th</sub> = " + polarStr(g.port.voc, "V") + "</span>"); L.push("<span class='eq-i'>Z<sub>Th</sub> = " + rectStr(g.port.zth) + " Ω</span>"); }
    else if (g.nodes) L.push(g.nodes.map(function (n) { return "<span class='eq-i'>" + n.text + " = " + polarStr(n.value, "V") + "</span>"; }).join("، "));
    else if (g.meshes) L.push(g.meshes.map(function (m) { return "<span class='eq-i'>" + m.text + " = " + polarStr(m.value, "A") + "</span>"; }).join("، "));
    else L.push(g.solution.elements.filter(function (it) { return /^[RLC]$/.test(it.edge.type); }).map(function (it) { return "<span class='eq-i'>" + it.edge.name + ": V = " + polarStr(it.v, "V") + " , I = " + polarStr(it.i, "A") + "</span>"; }).join("<br>"));
    L.push("الإجابة: <span class='eq-i'>" + polarStr(q.z, u) + " = " + rectStr(q.z, u) + "</span>");
    return L;
  }

  CV.ac = { generate: generate, distractors: distractors, steps: steps, C: C, solve: solve, port: port, meshes: meshes, impedance: impedance, si: si, polar: polarStr, rect: rectStr };
  if (typeof module !== "undefined") module.exports = CV.ac;
})(typeof window !== "undefined" ? window : globalThis);
