/* CircuitVision — Electric Circuits I Lab page (lab.html).
   Index of the ten labs → one lab: objective, equipment, short background, pre-lab (checked), procedures with their
   schematic and tables (checked against the simulator), and the bench at the bottom with «تحقق من توصيلي» and «اعرض الحل». */
(function () {
  "use strict";
  var S = CV.clabSim, X = CV.clabExps, EXP = X.list, KEY = "cv-clab-progress";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bd(s) { return String(s).replace(/([A-Za-z0-9][A-Za-z0-9 .,=+−\-–/×·()′'∥ΩµθπωΔ²√]*[A-Za-z0-9)Ω²′'])/g, '<span class="ltr">$1</span>'); }
  function prog() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function mark(e, k) { var p = prog(); p[e] = p[e] || {}; p[e][k] = 1; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (x) {} }
  function isDone(e, k) { var p = prog(); return !!(p[e] && p[e][k]); }
  function items(e) { var k = []; e.prelab.forEach(function (_, i) { k.push("pre" + i); }); e.procs.forEach(function (p) { (p.tables || []).forEach(function (_, i) { k.push(p.id + "t" + i); }); if (p.layouts && p.layouts.length && e.inst.indexOf("mn") < 0) k.push(p.id + "w"); }); return k; }
  function count(e) { var k = items(e); return { t: k.length, d: k.filter(function (x) { return isDone(e.id, x); }).length }; }

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
  function core(state, inst) {
    var net = S.build(state, { only: inst, allSrc: true }), par = {};
    function f(k) { if (par[k] === undefined) par[k] = k; while (par[k] !== k) { par[k] = par[par[k]]; k = par[k]; } return k; }
    function u(a, b) { var x = f(a), y = f(b); if (x !== y) par[x] = y; }
    var els = [];
    net.els.forEach(function (e) {
      if (/\.sh$/.test(e.id) || e.id === "mn.meter") { u(e.na, e.nb); return; }          // ammeters (and the power meter) are wires
      if (/\.vin$|^sc\.|^fg\.gnd$|^fg\.r$/.test(e.id)) return;                        // voltmeters, scope, generator internals: not part of the circuit
      if (e.id === "fg") { els.push({ k: "FG", a: e.na, b: e.nb, pol: 1 }); return; }
      if (e.k === "V") { els.push({ k: e.src === "mn" ? "MN" : "PS", a: e.na, b: e.nb, pol: 1 }); return; }
      if (e.k === "R" && e.box && e.nom === 0) { u(e.na, e.nb); return; }
      els.push({ k: e.k, v: e.k === "R" ? (e.nom || e.r) : e.k === "L" ? e.l : e.c, a: e.na, b: e.nb, pol: 0, id: e.id });
    });
    // the generator's 50 Ω sits between fg.int and fg.out: treat the FG as a source between fg.out and fg.com
    var fgr = net.els.filter(function (e) { return e.id === "fg.r"; })[0];
    if (fgr) u(fgr.na, fgr.nb);
    els.forEach(function (x) { x.a = f(x.a); x.b = f(x.b); });
    els = els.filter(function (x) { return x.a !== x.b || x.k === "PS"; });
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
  function wiringReport(e, L, state) {
    var want = core(stateFor(L, {}, false), e.inst), got = core(state, e.inst);
    if (iso(want, got)) return { ok: true };
    function tally(list) { var t = {}; list.forEach(function (x) { var k = x.k === "R" ? CV.clabBench.si(x.v, "Ω") : x.k === "L" ? "ملف " + CV.clabBench.si(x.v, "H") : x.k === "C" ? "مكثف " + CV.clabBench.si(x.v, "F") : x.k === "PS" ? "قناة مصدر مستمر" : x.k === "FG" ? "مولد الإشارة" : x.k; t[k] = (t[k] || 0) + 1; }); return t; }
    var a = tally(want), b = tally(got), miss = [], extra = [];
    Object.keys(a).forEach(function (k) { if ((b[k] || 0) < a[k]) miss.push(k + (a[k] - (b[k] || 0) > 1 ? " ×" + (a[k] - (b[k] || 0)) : "")); });
    Object.keys(b).forEach(function (k) { if ((a[k] || 0) < b[k]) extra.push(k); });
    return { ok: false, miss: miss, extra: extra };
  }

  /* ---------- rendering ---------- */
  var root = $("#cl-root"), bench = null, cur = null;
  function route() {
    var id = location.hash.slice(1), e = EXP.filter(function (x) { return x.id === id; })[0];
    if (bench) { bench.destroy(); bench = null; }
    if (e) showExp(e); else showIndex();
    window.scrollTo(0, 0);
  }
  function showIndex() {
    document.title = "معمل الدوائر الكهربائية — CircuitVision";
    root.innerHTML = '<div class="lg-head"><span class="code">EE · Electric Circuits I Lab</span><h1>معمل الدوائر الكهربائية</h1>' +
      '<p>التجارب العشر في كتيب معمل القسم، على طاولة تشبه طاولة المعمل: لوحة التوصيل والقطع، مصدر الجهد بقناتين، ملتيميتران، مولد الإشارة، الأوسيلوسكوب، وصناديق المقاومات والمحاثة. تركّب الدائرة بنفسك وتقيس، والمنصة تتحقق من توصيلك وقراءاتك.</p>' +
      '<div class="lg-cta"><a class="btn btn-primary" href="#exp1">ابدأ بالتجربة 1</a></div></div>' +
      '<div class="lg-grid">' + EXP.map(function (e) { var c = count(e); return '<a class="card lg-card" href="#' + e.id + '"><span class="n' + (c.d === c.t && c.t ? " ok" : "") + '">' + e.n + '</span><div><b class="ltr lg-sheet">Experiment #' + e.n + ': ' + esc(e.en) + '</b><span>' + esc(e.title) + '</span><span class="pg">' + (c.d ? c.d + " من " + c.t : "") + '</span></div></a>'; }).join("") + '</div>';
  }
  function showExp(e) {
    cur = e;
    document.title = "التجربة " + e.n + ": " + e.title + " — CircuitVision";
    var c = count(e), i = EXP.indexOf(e);
    var nav = '<nav class="lg-tabs" aria-label="التجارب">' + EXP.map(function (x) { return '<a href="#' + x.id + '" class="' + (x === e ? "cur" : "") + '"' + (x === e ? ' aria-current="page"' : "") + '><span class="n">' + x.n + '</span><span>' + esc(x.title.split(" ").slice(0, 3).join(" ")) + '</span></a>'; }).join("") + '</nav>';
    var pre = e.prelab.map(function (t, k) { return taskView(e, t, k); }).join("");
    var procs = e.procs.map(function (p, k) { return procView(e, p, k); }).join("");
    root.innerHTML = nav +
      '<div class="lg-head"><span class="code">EE · Electric Circuits I Lab</span><h1 class="ltr lg-sheet">Experiment #' + e.n + ': ' + esc(e.en) + '</h1><span class="lg-ar">' + esc(e.title) + '</span><span class="pg">' + c.d + ' من ' + c.t + ' مكتملة</span></div>' +
      '<div class="lg-top"><section class="card lg-sec"><h2>الأهداف</h2><ul>' + e.objective.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + '</ul></section>' +
      '<section class="card lg-sec"><h2>الأدوات</h2><ul>' + e.equipment.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + '</ul>' + (e.note ? '<p class="lg-note">' + bd(esc(e.note)) + '</p>' : "") + '</section></div>' +
      '<section class="card lg-sec"><h2>الخلفية باختصار</h2><ul class="lg-steps">' + e.theory.map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul></section>' +
      '<h2 class="lg-h">التحضير (Pre-Lab)</h2>' + pre +
      '<h2 class="lg-h">خطوات التجربة</h2>' + procs +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2>' +
      '<div class="lg-bench-bar"><label>الدائرة: <select id="cl-lay" class="select">' + e.procs.map(function (p) { return (p.layouts || []).map(function (L) { return '<option value="' + p.id + "/" + L.id + '">' + esc(p.title.replace(/^الإجراء [0-9 ()تابع]*:\s*/, "")) + (p.layouts.length > 1 ? " · " + esc(L.name) : "") + '</option>'; }).join(""); }).join("") + '</select></label>' +
      (e.inst.indexOf("mn") < 0 ? '<button type="button" class="btn btn-primary btn-sm" id="cl-check">تحقق من توصيلي</button>' : "") + '<button type="button" class="btn btn-ghost btn-sm" id="cl-sol">اعرض الحل على الطاولة</button></div>' +
      '<div class="lg-out" id="cl-out" aria-live="polite"></div><div id="cl-bench"></div></section>' +
      '<div class="lg-pn">' + (i > 0 ? '<a class="btn btn-ghost" href="#' + EXP[i - 1].id + '">→ التجربة ' + EXP[i - 1].n + '</a>' : "<span></span>") + (i < EXP.length - 1 ? '<a class="btn btn-ghost" href="#' + EXP[i + 1].id + '">التجربة ' + EXP[i + 1].n + ' ←</a>' : "") + '</div>';
    bench = CV.clabBench.mount($("#cl-bench"), { key: e.id, inst: e.inst, kit: e.kit });
    wire(e);
  }
  function taskView(e, t, k) {
    var id = "pre" + k;
    return '<section class="card lg-sec lg-task" data-pre="' + k + '"><div class="lg-th"><span class="n' + (isDone(e.id, id) ? " ok" : "") + '">' + (k + 1) + '</span><p>' + bd(esc(t.q)) + '</p></div>' +
      '<div class="cl-fields">' + t.fields.map(function (f, j) { return '<label class="cl-f"><span>' + bd(esc(f.label)) + '</span><span class="cl-in"><input class="input ltr" inputmode="decimal" autocomplete="off" data-f="' + j + '"><span class="ltr">' + esc(f.unit) + '</span></span></label>'; }).join("") + '</div>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary btn-sm" data-cpre>تحقق</button></div><div class="lg-res" aria-live="polite"></div></section>';
  }
  function procView(e, p, k) {
    var fig = p.fig ? '<div class="cl-fig">' + CV.draw.render(p.fig, { aria: "مخطط " + p.title }) + '</div>' : "";
    return '<section class="card lg-sec" id="' + e.id + '-' + p.id + '"><h2><span class="n">' + (k + 1) + '</span>' + bd(esc(p.title)) + '</h2>' +
      '<div class="cl-proc">' + fig + '<ol class="lg-steps">' + p.steps.map(function (s) { return "<li>" + bd(esc(s)) + "</li>"; }).join("") + '</ol></div>' +
      (p.layouts && p.layouts.length ? '<div class="lg-cta"><button type="button" class="btn btn-ghost btn-sm" data-go="' + p.id + '">ركّبها على الطاولة ↓</button>' + (e.inst.indexOf("mn") < 0 ? '<span class="cl-wok' + (isDone(e.id, p.id + "w") ? " ok" : "") + '">' + (isDone(e.id, p.id + "w") ? "✓ التوصيل صحيح" : "") + '</span>' : "") + '</div>' : "") +
      (p.tables || []).map(function (t, j) { return tableView(e, p, t, j); }).join("") + '</section>';
  }
  function tableView(e, p, t, j) {
    var id = p.id + "t" + j, head, rows;
    if (t.kind === "pair") {
      head = '<tr><th></th><th>' + esc(t.a) + '</th><th>' + esc(t.b) + '</th>' + (t.power ? '<th>P4 = V4·I4 (mW)</th>' : "") + '</tr>';
      rows = t.rows.map(function (r, i) { return '<tr data-r="' + i + '"><td class="l">' + bd(esc(r.label)) + '</td><td><input class="input ltr" inputmode="decimal" data-a></td><td><input class="input ltr" inputmode="decimal" data-b></td>' + (t.power ? '<td class="cl-p ltr" data-p></td>' : "") + '</tr>'; }).join("");
    } else if (t.kind === "pf") {
      head = '<tr><th>C</th><th>V (V)</th><th>I (A)</th><th>P (W)</th><th>PF</th></tr>';
      rows = t.rows.map(function (r, i) { return '<tr data-r="' + i + '"><td class="l">' + bd(esc(r.label)) + '</td>' + ["v", "i", "p", "pf"].map(function (k) { return '<td><input class="input ltr" inputmode="decimal" data-k="' + k + '"></td>'; }).join("") + '</tr>'; }).join("");
    } else {
      var mc = t.kind === "mc";
      head = '<tr><th></th><th>' + esc(t.meas || "المقاس") + '</th>' + (mc ? '<th>' + esc(t.calc || "المحسوب") + '</th><th>% الخطأ</th>' : "") + '</tr>';
      rows = t.rows.map(function (r, i) {
        if (r.sum) return '<tr data-r="' + i + '" class="cl-sum"><td class="l">' + bd(esc(r.label)) + '</td><td class="ltr" data-sm></td>' + (mc ? '<td class="ltr" data-sc></td><td></td>' : "") + '</tr>';
        return '<tr data-r="' + i + '"><td class="l">' + bd(esc(r.label)) + ' <span class="u ltr">' + esc(r.unit || "") + '</span></td><td><input class="input ltr" inputmode="decimal" data-m></td>' + (mc ? '<td><input class="input ltr" inputmode="decimal" data-c></td><td class="cl-e ltr" data-e></td>' : "") + '</tr>';
      }).join("");
    }
    return '<div class="cl-tbl" data-t="' + id + '" data-p="' + p.id + '" data-j="' + j + '"><b>' + bd(esc(t.title)) + (isDone(e.id, id) ? ' <span class="cl-ok">✓</span>' : "") + '</b><div class="lg-tw"><table class="lg-t cl-t">' + head + rows + '</table></div>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary btn-sm" data-ct>تحقق من الجدول</button></div><div class="lg-res" aria-live="polite"></div>' + (t.plot ? '<div class="cl-plot"></div>' : "") + '</div>';
  }
  function res(el, ok, html) { var r = $(".lg-res", el); r.className = "lg-res " + (ok ? "ok" : "bad"); r.innerHTML = html; }

  /* ---------- checking ---------- */
  function wire(e) {
    root.querySelectorAll("[data-pre]").forEach(function (el) {
      var t = e.prelab[+el.dataset.pre];
      $("[data-cpre]", el).addEventListener("click", function () {
        var bad = 0, empty = 0;
        t.fields.forEach(function (f, j) {
          var inp = $('[data-f="' + j + '"]', el), got = num(inp.value), want = f.ans !== undefined ? f.ans : scaled(evalQ(e, layoutOf(e, f.L), f.q, null, true), f.unit);
          inp.classList.remove("good", "bad"); if (isNaN(got)) { empty++; return; }
          var ok = f.q ? close(Math.abs(got), Math.abs(want), f.unit, 0.012) : close(got, want, f.unit, 0.012); inp.classList.add(ok ? "good" : "bad"); if (!ok) bad++;
        });
        if (empty) return res(el, false, "أكمل كل الخانات أولًا.");
        if (bad) return res(el, false, bad + " من الإجابات غير صحيحة (المعلَّمة بالأحمر). راجع الحساب والوحدات.");
        res(el, true, "صحيح ✓"); mark(e.id, "pre" + el.dataset.pre); $(".n", el).classList.add("ok");
      });
    });
    root.querySelectorAll(".cl-tbl").forEach(function (el) {
      var p = e.procs.filter(function (x) { return x.id === el.dataset.p; })[0], t = p.tables[+el.dataset.j];
      el.addEventListener("input", function () { liveTable(e, p, t, el); });
      $("[data-ct]", el).addEventListener("click", function () { checkTable(e, p, t, el); });
    });
    root.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () {
      var p = e.procs.filter(function (x) { return x.id === b.dataset.go; })[0]; $("#cl-lay").value = p.id + "/" + p.layouts[0].id; $("#cl-out").innerHTML = ""; $("#bench").scrollIntoView({ behavior: "smooth" }); }); });
    var ck = $("#cl-check"); if (ck) ck.addEventListener("click", function () {
      var v = $("#cl-lay").value.split("/"), p = e.procs.filter(function (x) { return x.id === v[0]; })[0], L = layoutOf(e, v[1], p), r = wiringReport(e, L, bench.state()), out = $("#cl-out");
      if (r.ok) { out.className = "lg-out ok"; out.innerHTML = "✓ توصيلك مطابق للدائرة: " + esc(p.title) + (p.layouts.length > 1 ? " · " + esc(L.name) : "") + ". الحين شغّل المصدر وقِس."; mark(e.id, p.id + "w");
        var w = root.querySelector('#' + e.id + '-' + p.id + ' .cl-wok'); if (w) { w.classList.add("ok"); w.textContent = "✓ التوصيل صحيح"; } return; }
      out.className = "lg-out bad";
      out.innerHTML = "التوصيل غير مطابق للدائرة المطلوبة." + (r.miss.length ? "<br>ناقص: " + r.miss.map(function (x) { return '<span class="ltr">' + esc(x) + "</span>"; }).join("، ") : "") + (r.extra.length ? "<br>زيادة أو في غير مكانها: " + r.extra.map(function (x) { return '<span class="ltr">' + esc(x) + "</span>"; }).join("، ") : "") +
        (!r.miss.length && !r.extra.length ? "<br>القطع صحيحة، لكن طريقة التوصيل مختلفة: راجع أي طرف متصل بأي عقدة (كل مربع في اللوحة عقدة واحدة)." : "") + "<br><span class='muted small'>الأميتر يُحسب سلكًا، والفولتميتر والأوسيلوسكوب لا يدخلان في المقارنة.</span>";
    });
    $("#cl-sol").addEventListener("click", function () {
      var v = $("#cl-lay").value.split("/"), p = e.procs.filter(function (x) { return x.id === v[0]; })[0], L = layoutOf(e, v[1], p), set = JSON.parse(JSON.stringify(L.set || {}));
      if (set.fgTerm) { var s = solveL(e, L, {}, false); set.fg.vpp = +s.state.inst.fg.vpp.toFixed(2); delete set.fgTerm; }
      bench.load({ parts: L.parts, leads: L.leads, set: set });
      var out = $("#cl-out"); out.className = "lg-out"; out.textContent = "هذا توصيل صحيح للدائرة. جرّب تفكّه وتركّبه بنفسك ثم «تحقق من توصيلي».";
    });
  }
  function liveTable(e, p, t, el) {
    el.querySelectorAll("tr[data-r]").forEach(function (tr) {
      var r = t.rows[+tr.dataset.r];
      if (r && r.sum) {
        var sm = 0, sc = 0, okm = true, okc = true;
        r.sum.forEach(function (k) { var row = el.querySelector('tr[data-r="' + k + '"]'), m = num($("[data-m]", row) && $("[data-m]", row).value), c = num($("[data-c]", row) && $("[data-c]", row).value); if (isNaN(m)) okm = false; else sm += m; if (isNaN(c)) okc = false; else sc += c; });
        $("[data-sm]", tr).textContent = okm ? +sm.toFixed(4) : ""; var scel = $("[data-sc]", tr); if (scel) scel.textContent = okc ? +sc.toFixed(4) : "";
        return;
      }
      var m = $("[data-m]", tr), c = $("[data-c]", tr), er = $("[data-e]", tr);
      if (m && c && er) { var a = num(m.value), b = num(c.value); er.textContent = isNaN(a) || isNaN(b) || !b ? "" : (Math.abs(a - b) / Math.abs(b) * 100).toFixed(2) + "%"; }
      var pa = $("[data-a]", tr), pb = $("[data-b]", tr), pp = $("[data-p]", tr);
      if (pp) { var x = num(pa.value), y = num(pb.value); pp.textContent = isNaN(x) || isNaN(y) ? "" : (x * y).toFixed(2); }
    });
    if (t.plot) plot(t, el);
  }
  function checkTable(e, p, t, el) {
    var bad = 0, empty = 0, n = 0;
    function mark1(inp, ok) { inp.classList.remove("good", "bad"); inp.classList.add(ok ? "good" : "bad"); if (!ok) bad++; n++; }
    el.querySelectorAll("tr[data-r]").forEach(function (tr) {
      var r = t.rows[+tr.dataset.r]; if (!r || r.sum) return;
      var L = layoutOf(e, r.L, p);
      if (t.kind === "pair") {
        [["a", r.qa, r.ua], ["b", r.qb, r.ub]].forEach(function (z) { var inp = $("[data-" + z[0] + "]", tr), got = num(inp.value); if (isNaN(got)) { empty++; return; } mark1(inp, close(Math.abs(got), Math.abs(scaled(evalQ(e, L, z[1], r.set, false), z[2])), z[2])); });
        return;
      }
      if (t.kind === "pf") {
        var st = stateFor(L, r.set, false), rd = S.read(st, { only: e.inst }).mn;
        [["v", rd.v, "V"], ["i", rd.i, "A"], ["p", rd.p, "W"], ["pf", rd.pf, ""]].forEach(function (z) { var inp = $('[data-k="' + z[0] + '"]', tr), got = num(inp.value); if (isNaN(got)) { empty++; return; } mark1(inp, close(got, z[1], z[2], 0.02)); });
        return;
      }
      var m = $("[data-m]", tr), c = $("[data-c]", tr), gm = num(m.value);
      if (isNaN(gm)) empty++; else { var wm = scaled(evalQ(e, L, r.q, r.set, false), r.unit); mark1(m, t.signed ? close(gm, wm, r.unit, r.tol) : close(Math.abs(gm), Math.abs(wm), r.unit, r.tol)); }
      if (c) { var gc = num(c.value); if (isNaN(gc)) empty++; else { var wc = scaled(evalQ(e, L, r.q, r.set, true), r.unit); mark1(c, t.signed ? close(gc, wc, r.unit, 0.012) : close(Math.abs(gc), Math.abs(wc), r.unit, 0.012)); } }
    });
    if (empty) return res(el, false, "أكمل الجدول أولًا (" + empty + " خانة فاضية).");
    if (bad) return res(el, false, bad + " من " + n + " قيم بعيدة عن المتوقع (بالأحمر). المقاس يُقارن بما تقرأه الأجهزة على الطاولة، والمحسوب بالقيم الاسمية للقطع.");
    res(el, true, "الجدول صحيح ✓ الفرق بين المقاس والمحسوب سببه تفاوت قيم القطع الحقيقية."); mark(e.id, el.dataset.t);
    var b = $("b", el); if (b && !$(".cl-ok", b)) b.insertAdjacentHTML("beforeend", ' <span class="cl-ok">✓</span>');
  }
  function plot(t, el) {
    var pts = [];
    el.querySelectorAll("tr[data-r]").forEach(function (tr) {
      var r = t.rows[+tr.dataset.r], x, y;
      if (t.kind === "pf") { x = r.c; y = num($('[data-k="pf"]', tr).value); }
      else { var a = num($("[data-a]", tr).value), b = num($("[data-b]", tr).value); if (t.plot.x === "r") { x = r.r; y = a * b; } else { x = a; y = b; } }
      if (isFinite(x) && isFinite(y)) pts.push([x, y]);
    });
    var box = $(".cl-plot", el); if (pts.length < 2) { box.innerHTML = ""; return; }
    var W = 460, H = 260, L = 48, B = 34, xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min(0, Math.min.apply(null, xs)), x1 = Math.max.apply(null, xs) || 1, y0 = Math.min(0, Math.min.apply(null, ys)), y1 = Math.max.apply(null, ys) || 1;
    function X(v) { return L + (v - x0) / (x1 - x0) * (W - L - 12); } function Y(v) { return H - B - (v - y0) / (y1 - y0) * (H - B - 12); }
    pts.sort(function (a, b) { return a[0] - b[0]; });
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="cl-plot-svg"><line class="ax" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - 8) + '" y2="' + (H - B) + '"/><line class="ax" x1="' + L + '" y1="8" x2="' + L + '" y2="' + (H - B) + '"/>' +
      '<polyline class="ln" points="' + pts.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>' + pts.map(function (p) { return '<circle class="pt" cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="3.5"/>'; }).join("") +
      [0, 0.5, 1].map(function (k) { var v = x0 + k * (x1 - x0); return '<text class="tk" x="' + X(v).toFixed(1) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + +v.toFixed(2) + '</text>'; }).join("") +
      [0, 0.5, 1].map(function (k) { var v = y0 + k * (y1 - y0); return '<text class="tk" x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + +v.toFixed(2) + '</text>'; }).join("") +
      '<text class="tl" x="' + (W - 8) + '" y="' + (H - 4) + '" text-anchor="end">' + esc(t.plot.xl) + '</text><text class="tl" x="' + (L + 4) + '" y="16">' + esc(t.plot.yl) + '</text></svg>';
    box.innerHTML = s;
  }

  window.addEventListener("hashchange", route);
  route();
  CV.clab = { evalQ: evalQ, wiringReport: wiringReport, core: core, layoutOf: layoutOf, solveL: solveL };
})();
