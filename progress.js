/* CircuitVision — Project Academy progress and report, shared by academy.html and the Beyond Theory club.
   Everything is read from the student's own store and computed by the project's simulator; nothing is invented. */
(function () {
  "use strict";
  var CV = window.CV, S = CV.store;
  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent; }
  function lid(p) { return "proj-" + p.id; }
  function simValues(p) {
    var st = S.project(p.id), v = {};
    p.sim.controls.forEach(function (c) { v[c.id] = st.design && st.design[c.id] !== undefined ? st.design[c.id] : c.def; });
    return v;
  }
  function defaults(p) { var v = {}; p.sim.controls.forEach(function (c) { v[c.id] = c.def; }); return v; }
  function progress(p) {
    var st = S.project(p.id), pr = (S.get().practice[lid(p)] || { steps: {} }).steps;
    var design = p.design.steps.every(function (s) { return pr[s.id] && pr[s.id].solved; });
    var r = p.sim.compute(simValues(p)), sim = design && !r.error && r.checks.every(function (c) { return c.ok; });
    var built = p.build.every(function (_, i) { return st.steps && st.steps[i]; });
    var tested = !!(st.measured && Object.keys(st.measured).some(function (k) { return st.measured[k] != null; }));
    var doc = !!(st.notes && st.notes.trim());
    var started = !!st.startedAt || Object.keys(pr).length > 0;
    return { design: design, sim: sim, build: built, test: tested, doc: doc, done: !!st.completedAt, started: started, count: [design, sim, built, tested, doc].filter(Boolean).length };
  }
  function report(p, g) {
    g = g || progress(p);
    var st = S.project(p.id), v = simValues(p), r = p.sim.compute(v), m = st.measured || {}, prof = S.get().profile, L = [];
    L.push("تقرير مشروع: " + p.ar + " (" + p.en + ")");
    if (prof && prof.name) L.push("الطالب: " + prof.name);
    L.push("التاريخ: " + new Date().toLocaleDateString("ar-SA-u-nu-latn"));
    L.push("");
    L.push("المواصفات:"); p.idea.specs.forEach(function (s) { L.push("- " + plain(s)); });
    L.push("");
    L.push("التصميم المختار:"); (r.design || []).forEach(function (s) { L.push("- " + plain(s)); });
    L.push("خطوات التصميم: " + (g.design ? "مكتملة وصحيحة" : "غير مكتملة"));
    L.push("");
    if (!r.error) {
      L.push("نتائج المحاكاة:"); r.readings.forEach(function (x) { L.push("- " + plain(x[0]) + ": " + plain(x[1])); });
      L.push("الشروط:"); r.checks.forEach(function (c) { L.push((c.ok ? "  ✓ " : "  ✗ ") + plain(c.t)); });
      L.push("");
    }
    var have = p.test.quantities.filter(function (q) { return m[q.id] != null; });
    if (have.length) {
      L.push("القياسات على الدائرة الحقيقية:");
      have.forEach(function (q) { var unit = q.units[q.units.length > 1 ? 1 : 0].l, f = unit === "°" ? function (x) { return CV.num(x) + "°"; } : function (x) { return CV.ac.si(x, unit); }; L.push("- " + plain(q.label) + ": المتوقع " + f(r.expected[q.id]) + "، المقاس " + f(m[q.id])); });
    } else L.push("القياسات على الدائرة الحقيقية: لم تُقس.");
    L.push("");
    L.push("الملاحظات:"); L.push(st.notes && st.notes.trim() ? st.notes.trim() : "—");
    L.push("");
    L.push("الحالة: " + (g.done ? "منجز" : "قيد العمل") + " · CircuitVision");
    return L.join("\n");
  }
  /* the circuit the student designed (or the default one), drawn by the same renderer as the lessons */
  function figure(p, aria) {
    var r = p.sim.compute(simValues(p));
    return CV.draw.render(r.circuit || p.sim.compute(defaults(p)).circuit, { aria: aria || p.ar });
  }
  CV.projectKit = { progress: progress, report: report, simValues: simValues, defaults: defaults, figure: figure, plain: plain, lid: lid };
})();
