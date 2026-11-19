/* CircuitVision — Circuits 1 lab: expected values and the wiring corrector (no DOM, runs in the browser and in the node tests).
   CV.clabCheck: layoutOf, stateFor, solveL, evalQ, core, iso, meters, wiringReport. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {}, S = CV.clabSim, X = CV.clabExps;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* ---------- expected values: solve a layout with the parts' actual values (measured) or their nominal values (calculated) ---------- */
  function layoutOf(e, ref, proc) {
    var m = /^(\w+)\/(\w+)$/.exec(ref || ""), p = proc;
    if (m) { p = e.procs.filter(function (x) { return x.id === m[1]; })[0]; ref = m[2]; }
    var ls = p.layouts || []; return ls.filter(function (l) { return l.id === ref; })[0] || ls[0];
  }
  function deepSet(t, s) { Object.keys(s || {}).forEach(function (k) { if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) { t[k] = t[k] || {}; deepSet(t[k], s[k]); } else t[k] = s[k]; }); }
  function stateFor(L, rowSet, nominal) {
    var st = { parts: JSON.parse(JSON.stringify(L.parts || {})), leads: JSON.parse(JSON.stringify(L.leads || [])), inst: S.defaults() };
    deepSet(st.inst, L.set || {}); deepSet(st.inst, rowSet || {});
    if (nominal) Object.keys(st.parts).forEach(function (k) { if (st.parts[k].t === "R") st.parts[k].tol = 0; });
    return st;
  }
  function solveL(e, L, rowSet, nominal) {
    var st = stateFor(L, rowSet, nominal), opt = { only: e.inst };
    var term = (rowSet && rowSet.fgTerm) || (L.set && L.set.fgTerm);
    if (term) {   // set the generator so that its terminals show the wanted Vpp under load
      st.inst.fg.vpp = 10; var s0 = S.solve(st, opt), a = S.mag(S.vBetween(s0, "fg.out", "fg.com").ac);
      if (a > 0) st.inst.fg.vpp = 10 * (term / 2) / a;
    }
    return S.solve(st, opt);
  }
  function elByLabel(sol, L, lb) {
    var lbl = L.lbl || {};
    return sol.net.els.filter(function (x) { return x.lb === lb || lbl[x.id] === lb; })[0];
  }
  function node(L, n) { return (L.nodes || {})[n] || n; }
  var RMS = Math.SQRT1_2;
  function evalQ(e, L, q, rowSet, nominal) {
    if (q[0] === "act") { var pc = X.PIECES[q[1]]; return nominal ? pc.v : S.actual(Object.assign({ id: q[1] }, pc)); }
    var sol = solveL(e, L, rowSet, nominal), ac = !!sol.ac, v, i, el;
    switch (q[0]) {
      case "V": el = elByLabel(sol, L, q[1]); if (!el) return NaN; v = { dc: sol.dc.V[el.na].re - sol.dc.V[el.nb].re, ac: sol.ac ? S.sub(sol.ac.V[el.na], sol.ac.V[el.nb]) : null };
        return ac ? S.mag(v.ac) * RMS : v.dc;
      case "I": el = elByLabel(sol, L, q[1]); if (!el) return NaN; i = S.iElem(sol, el); return ac ? S.mag(i.ac) * RMS : i.dc;
      case "Iel": el = S.elById(sol, q[1]); if (!el) return NaN; i = S.iElem(sol, el); return ac ? S.mag(i.ac) * RMS : i.dc;
      case "N": v = S.vBetween(sol, node(L, q[1]), node(L, q[2] || "gnd")); return ac ? S.mag(v.ac) * RMS : v.dc;
      case "Vt": v = S.vBetween(sol, node(L, q[1]), node(L, q[2])); return ac ? S.mag(v.ac) * RMS : v.dc;
      case "Ips": var o = sol.net.els.filter(function (x) { return x.id === "ps." + q[1]; })[0]; if (!o) return NaN;
        return sol.cc[o.id] !== undefined ? sol.cc[o.id] : -(sol.dc.Iv[o.id] ? sol.dc.Iv[o.id].re : 0);
      case "Ifg": el = S.elById(sol, "fg.r"); return el ? S.mag(S.iElem(sol, el).ac) * RMS : NaN;
      case "amp": return S.mag(S.vNode(sol, q[1]).ac);
      case "T": return sol.f ? 1 / sol.f : NaN;
      case "f": return sol.f;
      case "phase": var a1 = S.vBetween(sol, q[1][0], q[1][1]).ac, a2 = S.vBetween(sol, q[2][0], q[2][1]).ac, d = (S.ang(a1) - S.ang(a2)) * 180 / Math.PI;
        while (d > 180) d -= 360; while (d < -180) d += 360; return d;
      case "Z": var vz = S.mag(S.vBetween(sol, q[1][0], q[1][1]).ac); el = elByLabel(sol, L, q[2]); return vz / S.mag(S.iElem(sol, el).ac);
      case "mn": var m = sol.state && S.read(sol.state, { only: e.inst }).mn; return m ? m[q[1]] : NaN;
    }
    return NaN;
  }
  var SCALE = { mA: 1000, mW: 1000, ms: 1000, "µF": 1, V: 1, A: 1, "Ω": 1, Hz: 1, "°": 1, "": 1, W: 1, VA: 1, VAR: 1, "%": 1, "rad/s": 1, kΩ: 0.001 };
  function scaled(x, unit) { return x * (SCALE[unit] === undefined ? 1 : SCALE[unit]); }
  function close(got, want, unit, tol) {
    if (!isFinite(got) || !isFinite(want)) return false;
    var abs = { V: 0.01, mA: 0.05, A: 0.0005, "Ω": 0.6, Hz: 1, "°": 1.5, ms: 0.01, mW: 0.05, W: 0.1, "": 0.01, "%": 0.01, VA: 0.2, VAR: 0.2, "µF": 0.02, "rad/s": 1 }[unit];
    return Math.abs(got - want) <= Math.max((tol || 0.025) * Math.abs(want), abs === undefined ? 0.01 : abs);
  }
  function num(s) { s = String(s || "").trim().replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/[,،]/g, ".").replace(/−/g, "-"); return s === "" ? NaN : +s; }

  /* ---------- wiring check: the student's circuit must be the same graph as the solution's ---------- */
  function core(state, inst, ov) {
    ov = ov || {};
    var net = S.build(state, { only: inst, allSrc: true }), par = {};
    function f(k) { if (par[k] === undefined) par[k] = k; while (par[k] !== k) { par[k] = par[par[k]]; k = par[k]; } return k; }
    function u(a, b) { var x = f(a), y = f(b); if (x !== y) par[x] = y; }
    var els = [];
    net.els.forEach(function (e) {
      if ((ov.open || {})[e.id]) return;
      if ((ov.wire || {})[e.id]) { u(e.na, e.nb); return; }
      if (/\.sh$/.test(e.id) || e.id === "mn.meter") { u(e.na, e.nb); return; }          // ammeters (and the power meter) are wires
      if (/\.vin$|^sc\.|^fg\.gnd$|^fg\.r$/.test(e.id)) return;                        // voltmeters, scope, generator internals: not part of the circuit
      if (e.id === "fg") { els.push({ k: "FG", a: e.na, b: e.nb, pol: 1 }); return; }
      if (e.k === "X") { els.push({ k: "K1", a: e.na, b: e.nb, pol: 0, id: e.id }); els.push({ k: "K2", a: e.nc, b: e.nd, pol: 0, id: e.id }); return; }
      if (e.k === "V") { els.push({ k: e.src === "mn" ? "MN" : e.src === "va" ? "VA" : e.src === "tp" ? "TP" : "PS", a: e.na, b: e.nb, pol: 1 }); return; }
      if (e.k === "R" && e.box && e.nom === 0) { u(e.na, e.nb); return; }
      els.push({ k: e.k, v: e.k === "R" ? (e.nom || e.r) : e.k === "L" ? e.l : e.c, a: e.na, b: e.nb, pol: 0, id: e.id });
    });
    // the generator's 50 Ω sits between fg.int and fg.out: treat the FG as a source between fg.out and fg.com
    var fgr = net.els.filter(function (e) { return e.id === "fg.r"; })[0];
    if (fgr) u(fgr.na, fgr.nb);
    els.forEach(function (x) { x.a = f(x.a); x.b = f(x.b); });
    els = els.filter(function (x) { return x.a !== x.b || x.k === "PS" || x.k === "VA" || x.k === "TP"; });
    // drop parts hanging in the air (both ends touch nothing else)
    var deg = {}; els.forEach(function (x) { deg[x.a] = (deg[x.a] || 0) + 1; deg[x.b] = (deg[x.b] || 0) + 1; });
    return els.filter(function (x) { return deg[x.a] > 1 || deg[x.b] > 1; });
  }
  function same(x, y) { return x.k === y.k && (x.v === undefined || Math.abs(x.v - y.v) <= 0.005 * Math.max(1e-12, Math.abs(x.v))); }
  function iso(T, U) {
    if (T.length !== U.length) return false;
    var used = [], mT = {}, mU = {};
    T = T.slice().sort(function (a, b) { return (a.k + a.v) < (b.k + b.v) ? -1 : 1; });
    function bind(t, u, ok) {
      if (mT[t] === undefined && mU[u] === undefined) { mT[t] = u; mU[u] = t; ok.push([t, u]); return true; }
      return mT[t] === u;
    }
    function go(i) {
      if (i === T.length) return true;
      var t = T[i];
      for (var j = 0; j < U.length; j++) {
        if (used[j] || !same(t, U[j])) continue;
        var orient = t.pol ? [[U[j].a, U[j].b]] : [[U[j].a, U[j].b], [U[j].b, U[j].a]];
        for (var o = 0; o < orient.length; o++) {
          var added = [];
          if (bind(t.a, orient[o][0], added) && bind(t.b, orient[o][1], added)) { used[j] = 1; if (go(i + 1)) return true; used[j] = 0; }
          added.forEach(function (p) { delete mT[p[0]]; delete mU[p[1]]; });
        }
      }
      return false;
    }
    return go(0);
  }
  /* ---------- electrical equivalence: the student does not have to copy the manual's board ----------
     Both circuits are reduced the same way before comparing: parts that carry no current (an end touching nothing else) go,
     parts in parallel between the same two points become one, and parts in series through a point nothing else touches become one
     (R and L add; C in parallel add). So 1 kΩ + 1 kΩ in series is accepted for 2 kΩ, two 2.2 kΩ in parallel for 1.1 kΩ, extra parts
     left on the board are ignored, and the order of parts along a branch does not matter. Meters are left out here; what each meter
     reads is still compared with the manual afterwards, so a meter on the wrong point is still caught. */
  var PASSIVE = { R: 1, L: 1, C: 1 };
  function reduce(list) {
    var els = list.map(function (x) { return { k: x.k, v: x.v, a: x.a, b: x.b, pol: x.pol }; }), changed = true, guard = 0;
    function degs() { var d = {}; els.forEach(function (x) { d[x.a] = (d[x.a] || 0) + 1; d[x.b] = (d[x.b] || 0) + 1; }); return d; }
    while (changed && guard++ < 500) {
      changed = false;
      // 1) no current: a passive part with an end that touches nothing else, or both ends on the same point
      var d = degs(), keep = els.filter(function (x) { return !(PASSIVE[x.k] && (x.a === x.b || d[x.a] === 1 || d[x.b] === 1)); });
      if (keep.length !== els.length) { els = keep; changed = true; continue; }
      // 2) parallel: same kind between the same two points
      for (var i = 0; i < els.length && !changed; i++) for (var j = i + 1; j < els.length && !changed; j++) {
        var x = els[i], y = els[j];
        if (!PASSIVE[x.k] || x.k !== y.k) continue;
        if (!((x.a === y.a && x.b === y.b) || (x.a === y.b && x.b === y.a))) continue;
        x.v = x.k === "C" ? x.v + y.v : 1 / (1 / x.v + 1 / y.v); els.splice(j, 1); changed = true;
      }
      if (changed) continue;
      // 3) series: two parts of the same kind meeting at a point that nothing else touches
      d = degs();
      for (var n in d) {
        if (d[n] !== 2) continue;
        var two = els.filter(function (x) { return String(x.a) === n || String(x.b) === n; });
        if (two.length !== 2 || !PASSIVE[two[0].k] || two[0].k !== two[1].k) continue;
        var p = two[0], q = two[1], pe = String(p.a) === n ? p.b : p.a, qe = String(q.a) === n ? q.b : q.a;
        p.v = p.k === "C" ? 1 / (1 / p.v + 1 / q.v) : p.v + q.v; p.a = pe; p.b = qe;
        els.splice(els.indexOf(q), 1); changed = true; break;
      }
    }
    return els;
  }
  function equiv(T, U) { return iso(T, U) || iso(reduce(T), reduce(U)); }
  /* ---------- the corrector: compare the student's bench with the manual's circuit and say exactly what is off ---------- */
  function partName(x) { var si = S.si; return x.k === "R" ? "مقاومة " + si(x.v, "Ω") : x.k === "L" ? "ملف " + si(x.v, "H") : x.k === "C" ? "مكثف " + si(x.v, "F") : x.k === "PS" ? "المصدر المستمر" : x.k === "FG" ? "مولد الإشارة" : x.k === "MN" ? "مصدر المتردد" : x.k === "VA" ? "الفارياك" : x.k === "TP" ? "طور من المصدر ثلاثي الطور" : x.k === "K1" ? "الملف 1 (1000 لفة)" : x.k === "K2" ? "الملف 2 (500 لفة)" : x.k; }
  function relations(list) {   // which parts sit in parallel (same two nodes) or in series (share a node nothing else touches)
    var deg = {}, rel = {};
    list.forEach(function (x) { deg[x.a] = (deg[x.a] || 0) + 1; deg[x.b] = (deg[x.b] || 0) + 1; });
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
      var x = list[i], y = list[j], nx = partName(x), ny = partName(y), pair = [nx, ny].sort().join(" | "), k = null;
      if ((x.a === y.a && x.b === y.b) || (x.a === y.b && x.b === y.a)) k = "par";
      else [x.a, x.b].forEach(function (n) { if ((n === y.a || n === y.b) && deg[n] === 2) k = "ser"; });
      if (k) rel[k + "\u0001" + pair] = (rel[k + "\u0001" + pair] || 0) + 1;
    }
    return rel;
  }
  function openEnds(list) { var deg = {}, out = []; list.forEach(function (x) { deg[x.a] = (deg[x.a] || 0) + 1; deg[x.b] = (deg[x.b] || 0) + 1; }); list.forEach(function (x) { if (["PS", "FG", "MN", "VA", "TP"].indexOf(x.k) < 0 && (deg[x.a] === 1 || deg[x.b] === 1)) out.push(partName(x)); }); return out; }

  var JACK = { d1: { A: "A" }, d2: { mA: "mA", "10A": "10A" } }, DNAME = { d1: "الملتيميتر الأصفر (Fluke)", d2: "الملتيميتر الأزرق (PeakTech)" };
  function meters(state) {   // how each multimeter is wired: as an ammeter (A), a voltmeter (V), an ohmmeter (Ω), half wired, or not used
    var out = {};
    ["d1", "d2"].forEach(function (d) {
      var t = {}; (state.leads || []).forEach(function (l) { l.forEach(function (p) { if (p.indexOf(d + ".") === 0) t[p.slice(3)] = 1; }); });
      var cur = Object.keys(JACK[d]).filter(function (j) { return t[j]; })[0], n = Object.keys(t).length, mode = state.inst[d].mode;
      if (!n) return;
      if (n === 1) { out[d] = { role: "half", mode: mode }; return; }
      if (cur && t.COM) out[d] = { role: "A", jack: cur, mode: mode };
      else if (t.V && t.COM) out[d] = { role: mode === "ohm" ? "Ω" : "V", mode: mode };
      else out[d] = { role: "odd", mode: mode };
    });
    return out;
  }
  function elementsWith(sol, what, val) {   // name the parts whose current (or voltage) equals the wanted meter reading
    var si = S.si, names = [];
    sol.net.els.forEach(function (x) {
      if (x.k !== "R" && x.k !== "L" && x.k !== "C") return; if (x.box && !x.nom && !x.r) return; if (!x.piece && ["rb", "lb", "cb"].indexOf(x.id) < 0) return;
      var v = what === "A" ? S.iElem(sol, x) : { dc: sol.dc.V[x.na].re - sol.dc.V[x.nb].re, ac: sol.ac ? S.sub(sol.ac.V[x.na], sol.ac.V[x.nb]) : null };
      var m = Math.max(Math.abs(v.dc), v.ac ? S.mag(v.ac) * RMS : 0);
      if (Math.abs(m - Math.abs(val)) <= Math.max(0.01 * Math.abs(val), what === "A" ? 2e-5 : 2e-3)) names.push(x.lb ? x.lb + " (" + si(x.nom || x.r, "Ω") + ")" : (x.id === "rb" ? "صندوق المقاومات" : x.id === "lb" ? "صندوق المحاثة" : x.id === "cb" ? "صندوق المكثفات" : partName({ k: x.k, v: x.k === "R" ? x.nom : x.k === "L" ? x.l : x.c })));
    });
    return names.slice(0, 3);
  }
  function wiringReport(e, L, state) {
    var msgs = [], bad = false, si = S.si;
    function say(lvl, t) { msgs.push({ lvl: lvl, t: t }); if (lvl === "bad") bad = true; }
    // 2) the meters: are they wired the right way, and do they measure what the manual asks?
    var sol = stateFor(L, {}, false), mw = meters(sol), mg = meters(state), ROLE = { A: "أميتر", V: "فولتميتر", "Ω": "أوميتر" };
    if (e.inst.indexOf("mn") > -1) mg = {};
    var want = core(stateFor(L, {}, false), e.inst), gotCore = core(state, e.inst), exact = iso(want, gotCore), whole = exact || equiv(want, gotCore);
    Object.keys(mg).forEach(function (d) {
      var m = mg[d];
      if (m.role === "half") say("bad", DNAME[d] + " موصول بسلك واحد بس: الجهاز يحتاج سلكين (COM ومدخل القياس).");
      if (m.role === "odd") say("bad", DNAME[d] + " موصول بين مدخلين غلط: لازم واحد من السلكين في COM.");
      if (m.role === "A") {
        var o = {}; o[d + "." + m.jack + ".sh"] = 1;
        if (!whole && equiv(want, core(state, e.inst, { open: o }))) say("bad", DNAME[d] + " مستخدم أميتر لكنه موصول <b>توازي</b>: الأميتر مقاومته شبه صفر، فيقصر اللي بين طرفيه. افتح الدائرة في مكان القياس وحطّه <b>توالي</b>.");
        if (!/^(a|ma)/.test(m.mode)) say("bad", "سلك " + DNAME[d] + " في مدخل التيار (" + m.jack + ") والمفتاح على غير التيار: حوّل المفتاح على A.");
      }
      if (m.role === "V") {
        var wv = {}; wv[d + ".vin"] = 1;
        if (!whole && equiv(want, core(state, e.inst, { wire: wv }))) say("bad", DNAME[d] + " مستخدم فولتميتر لكنه موصول <b>توالي</b>: مقاومته كبيرة جدًا فيوقف التيار. الفولتميتر يركب <b>توازي</b> على القطعة اللي تبي جهدها.");
      }
    });
    if (bad) return { ok: false, msgs: msgs };
    // 1) the circuit itself (meters left out)
    var got = core(state, e.inst);
    if (!whole) {
      var tally = function (list) { var t = {}; list.forEach(function (x) { var k = partName(x); t[k] = (t[k] || 0) + 1; }); return t; };
      var a = tally(want), b = tally(got);
      Object.keys(a).forEach(function (k) { var n = a[k] - (b[k] || 0); if (n > 0) say("bad", "ناقص: <b>" + esc(k) + "</b>" + (n > 1 ? " ×" + n : "") + "."); });
      Object.keys(b).forEach(function (k) { var n = b[k] - (a[k] || 0); if (n > 0) say("bad", "زيادة (ما هي في الدائرة المطلوبة): <b>" + esc(k) + "</b>" + (n > 1 ? " ×" + n : "") + "."); });
      var oe = openEnds(got).filter(function (n) { return openEnds(want).indexOf(n) < 0; });
      oe.slice(0, 2).forEach(function (n) { say("bad", "طرف <b>" + esc(n) + "</b> مفتوح: ما هو موصول بأي شيء ثاني، فما يمر فيها تيار."); });
      if (!msgs.length) {
        var rw = relations(want), rg = relations(got), shown = 0;
        Object.keys(rw).forEach(function (k) { if (shown > 2 || (rg[k] || 0) >= rw[k]) return; var q = k.split("\u0001"), pr = q[1].split(" | ");
          say("bad", "المفروض <b>" + esc(pr[0]) + "</b> و<b>" + esc(pr[1]) + "</b> يكونون على " + (q[0] === "par" ? "التوازي (نفس النقطتين)" : "التوالي (طرف مشترك ما يتفرع)") + "، وفي توصيلك مو كذا."); shown++; });
        if (!shown) say("bad", "القطع صحيحة، لكن الترتيب مختلف عن الرسمة: قارن كل عقدة في الرسمة بالمربع اللي يقابلها على اللوحة (كل مربع عقدة واحدة).");
      }
      return { ok: false, msgs: msgs };
    }
    if (!exact) say("info", "توصيلك مختلف عن رسمة الكتيب لكنه مكافئ كهربائيًا (نفس الدائرة بعد جمع القطع اللي على التوالي والتوازي وتجاهل القطع اللي ما يمر فيها تيار). ✓");
    if (e.inst.indexOf("mn") > -1) return { ok: true, msgs: msgs };
    var need = {}, have = {};
    Object.keys(mw).forEach(function (d) { need[mw[d].role] = (need[mw[d].role] || 0) + 1; });
    Object.keys(mg).forEach(function (d) { have[mg[d].role] = (have[mg[d].role] || 0) + 1; });
    Object.keys(need).forEach(function (r) { if (ROLE[r] && (have[r] || 0) < need[r]) say("bad", "ناقص <b>" + ROLE[r] + "</b>: هذي الخطوة تقيس " + (r === "A" ? "تيارًا، فركّب ملتيميتر توالي (سلك في A أو mA وسلك في COM)" : r === "V" ? "جهدًا، فركّب ملتيميتر توازي (سلك في V وسلك في COM)" : "مقاومة، فالمصدر مفصول والملتيميتر على Ω") + "."); });
    if (bad) return { ok: false, msgs: msgs };
    // 3) same settings as the manual, then compare what each meter would read
    var ref = solveL(e, L, {}, false), test = { parts: JSON.parse(JSON.stringify(state.parts)), leads: JSON.parse(JSON.stringify(state.leads)), inst: JSON.parse(JSON.stringify(ref.state.inst)) };
    if (test.inst.ps && state.inst.ps) test.inst.ps.mode = state.inst.ps.mode || "normal";   // the SERIES / PARALLEL switch is the student's choice
    var used = {};
    Object.keys(mg).forEach(function (d) {
      var m = mg[d], sd = Object.keys(mw).filter(function (x) { return mw[x].role === m.role && !used[x]; })[0]; if (!sd) return;
      used[sd] = 1; test.inst[d].mode = ref.state.inst[sd].mode; test.inst[d].blown = {};
      m.vs = sd;
    });
    var rr = S.read(test, { only: e.inst }), rs = S.read(JSON.parse(JSON.stringify(ref.state)), { only: e.inst }), ts = S.solve(ref.state, { only: e.inst });
    Object.keys(mg).forEach(function (d) {
      var m = mg[d]; if (!m.vs || m.role === "Ω") return;
      var g = rr[d].val, w = rs[m.vs].val; if (!isFinite(g) || !isFinite(w)) return;
      var tol = Math.max(0.03 * Math.abs(w), m.role === "A" ? 5e-5 : 0.02);
      if (Math.abs(Math.abs(g) - Math.abs(w)) > tol) {
        var who = elementsWith(ts, m.role, w);
        say("bad", DNAME[d] + " موصول صح كـ" + ROLE[m.role] + "، لكن في مكان غير المطلوب" + (who.length ? ": المطلوب " + (m.role === "A" ? "التيار المار في " : "الجهد على ") + "<b>" + who.map(esc).join(" أو ") + "</b>" : "") + ".");
      } else if (!rs[m.vs].ac && Math.abs(w) > tol && g * w < 0) say("info", DNAME[d] + " بيقرأ بالسالب: السلكان معكوسان (الأحمر على الطرف الموجب). ما يضر الجهاز، بس اعكسهم عشان تسجل القراءة صح.");
      if (state.inst[d].mode !== ref.state.inst[m.vs].mode) say("info", "مفتاح " + DNAME[d] + " على وضع غير المطلوب لهذي الخطوة: المطلوب <b>" + esc(MODE[ref.state.inst[m.vs].mode] || ref.state.inst[m.vs].mode) + "</b>.");
    });
    // 4) the supply / generator settings the manual uses
    if (ref.state.inst.ps && ref.state.inst.ps.on && !state.inst.ps.on) say("info", "التوصيل صح، والمصدر للحين مطفي: شغّل OUTPUT واضبط الجهد على المطلوب.");
    return { ok: !bad, msgs: msgs };
  }
  var MODE = { vdc: "V⎓", vac: "V~", mv: "mV", ohm: "Ω", adc: "A⎓", aac: "A~", madc: "mA⎓", maac: "mA~", off: "OFF" };

  CV.clabCheck = { layoutOf: layoutOf, deepSet: deepSet, stateFor: stateFor, solveL: solveL, elByLabel: elByLabel, node: node, evalQ: evalQ, scaled: scaled, close: close, num: num, core: core, same: same, iso: iso, reduce: reduce, equiv: equiv, partName: partName, relations: relations, openEnds: openEnds, meters: meters, elementsWith: elementsWith, wiringReport: wiringReport, MODE: MODE, RMS: RMS };
})(typeof window !== "undefined" ? window : globalThis);
