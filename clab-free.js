/* CircuitVision — the free lab (lab.html#free for Circuits 1, lab2.html#free for Circuits 2).
   The same bench as the experiments, with every instrument of the course on the desk and a drawer that never runs out.
   The student builds anything. To check a circuit, they pick any circuit from the course's experiments; the corrector
   (clab-check.js) accepts any electrically equivalent wiring, not only the manual's board.
   CV.clabFree.show(root, cfg) → bench api; cfg = { key, code, title, exps, inst, kit, rbDigits } */
(function () {
  "use strict";
  var root0 = typeof window !== "undefined" ? window : globalThis, CV = root0.CV = root0.CV || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var NAMES = { ps: "مصدر الجهد المستمر بقناتين", d1: "ملتيميتر Fluke", d2: "ملتيميتر PeakTech", fg: "مولد الإشارة", sc: "الأوسيلوسكوب",
    rb: "صندوق المقاومات", lb: "صندوق المحاثة", cb: "صندوق المكثفات", va: "الـ Variac", cc: "الملفان المقترنان", tp: "مصدر ثلاثي الطور", wm: "الواتميتر" };

  function show(root, cfg) {
    var K = CV.clabCheck, S = CV.clabSim;
    document.title = "المعمل الحر — " + cfg.title + " — CircuitVision";
    var exps = forFree(cfg.exps, cfg.inst);   // checked with every instrument on the desk
    var opts = exps.map(function (e) {
      var ls = []; e.procs.forEach(function (p) { (p.layouts || []).forEach(function (L) { ls.push('<option value="' + e.id + "/" + p.id + "/" + L.id + '">' + esc(p.title.replace(/^(الإجراء|الخطوات)[^:]*:\s*/, "")) + (p.layouts.length > 1 ? " · " + esc(L.name) : "") + "</option>"); }); });
      return ls.length ? '<optgroup label="التجربة ' + e.n + ": " + esc(e.title) + '">' + ls.join("") + "</optgroup>" : "";
    }).join("");
    root.innerHTML = '<p style="margin:0 0 10px"><a class="btn btn-ghost btn-sm" href="#">→ كل التجارب</a></p>' +
      '<div class="lg-head"><span class="code">' + esc(cfg.code) + '</span><h1>المعمل الحر</h1>' +
      '<p>طاولة كاملة فيها كل أجهزة المعمل: ' + cfg.inst.map(function (k) { return NAMES[k]; }).filter(Boolean).join("، ") + '. الدرج فيه مقاومة ومكثف وملف، خذ منها العدد اللي تحتاجه، وكل قطعة تكتب قيمتها بنفسك: اضغطها على اللوحة ثم «القيمة» (مثل 3.3k أو 47n أو 2.5m). تحتاج أكثر من فولتميتر أو أميتر؟ زر «ملتيميتر إضافي» تحت يضيف لين 4 أجهزة.</p></div>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>الطاولة</h2>' +
      '<p class="muted small">تبي تتأكد من دائرة من التجارب؟ اخترها وتحقق. ما يلزم تركّبها مثل رسمة الكتيب: أي توصيل مكافئ كهربائيًا ينقبل (مثل مقاومتين على التوالي بدل وحدة بقيمتهما، أو ترتيب ثاني على اللوحة).</p>' +
      '<div class="lg-bench-bar"><label>قارن بدائرة: <select id="fr-lay" class="select">' + opts + '</select></label>' +
      '<button type="button" class="btn btn-primary btn-sm" id="fr-check">تحقق من توصيلي</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="fr-sol">ركّبها على الطاولة</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="fr-clear">امسح الطاولة</button></div>' +
      '<div class="lg-bench-bar"><span class="muted small">أجهزة القياس:</span>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="fr-addf">＋ ملتيميتر Fluke</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="fr-addp">＋ ملتيميتر PeakTech</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="fr-delm">− إزالة آخر ملتيميتر إضافي</button><span class="muted small" id="fr-mcount"></span></div>' +
      '<div class="lg-out" id="fr-out" aria-live="polite"></div><div id="fr-bench"></div></section>';
    var bench = CV.clabBench.mount($("#fr-bench"), { key: cfg.key, inst: cfg.inst, kit: cfg.kit, fullEl: $("#bench"), edit: true, extraMeters: true });
    if (cfg.rbDigits && bench.state().inst.rb && bench.state().inst.rb.d.length !== cfg.rbDigits) bench.set({ rb: { d: new Array(cfg.rbDigits).fill(0) } });
    var out = $("#fr-out");
    function mbtn() {
      var m = bench.meters(), nf = m.filter(function (d) { return d === "d3" || d === "d5"; }).length, np = m.length - nf;
      $("#fr-addf").disabled = nf >= 2; $("#fr-addp").disabled = np >= 2; $("#fr-delm").disabled = !m.length;
      $("#fr-mcount").textContent = m.length ? "(" + m.length + " إضافي)" : "";
    }
    $("#fr-addf").onclick = function () { bench.addMeter("f"); mbtn(); };
    $("#fr-addp").onclick = function () { bench.addMeter("p"); mbtn(); };
    $("#fr-delm").onclick = function () { bench.removeMeter(); mbtn(); };
    mbtn();
    function pick() {
      var v = $("#fr-lay").value.split("/"), e = exps.filter(function (x) { return x.id === v[0]; })[0];
      var p = e.procs.filter(function (x) { return x.id === v[1]; })[0], L = p.layouts.filter(function (x) { return x.id === v[2]; })[0];
      return { e: e, p: p, L: L };
    }
    $("#fr-check").onclick = function () {
      var x = pick(), r = K.wiringReport(x.e, x.L, bench.state());
      out.className = "lg-out " + (r.ok ? "ok" : "bad");
      out.innerHTML = (r.ok ? "التوصيل صحيح لدائرة «" + esc(x.p.title) + "» ✓" : "") + (r.msgs.length ? "<ul>" + r.msgs.map(function (m) { return "<li>" + m.t + "</li>"; }).join("") + "</ul>" : "");
    };
    $("#fr-sol").onclick = function () {
      var x = pick(), set = JSON.parse(JSON.stringify(x.L.set || {})), term = set.fgTerm; delete set.fgTerm;
      if (term) { var s = K.solveL(x.e, x.L, {}, false); set.fg = set.fg || {}; set.fg.vpp = Math.round(s.state.inst.fg.vpp * 1000) / 1000; }
      bench.load({ parts: x.L.parts, leads: x.L.leads, set: set }); mbtn();
      out.className = "lg-out"; out.textContent = "هذي دائرة «" + x.p.title + "» من الكتيب على الطاولة. عدّل عليها أو ركّبها بطريقتك وتحقق.";
    };
    $("#fr-clear").onclick = function () { bench.reset(); mbtn(); if (cfg.rbDigits) bench.set({ rb: { d: new Array(cfg.rbDigits).fill(0) } }); out.className = "lg-out"; out.textContent = ""; };
    return bench;
  }
  /* parts for the free drawer: one R, one power R, one C and one L whose value the student types, and a switch */
  var ADJ = [{ id: "Radj", t: "R", v: 1000, tol: 0, adj: true, tl: "مقاومة ✎" }, { id: "Rpow", t: "R", v: 100, tol: 0, adj: true, pmax: 400, tl: "مقاومة قدرة ✎" },
    { id: "Cadj", t: "C", v: 1e-6, adj: true, tl: "مكثف ✎" }, { id: "Ladj", t: "L", v: 10e-3, adj: true, tl: "ملف ✎" }, { id: "SW", t: "S", on: false, tl: "مفتاح" }];
  function kitFrom() {   // one part of each kind: the student types its value (the lab's fixed blocks are no longer in the drawer)
    return JSON.parse(JSON.stringify(ADJ));
  }
  function forFree(exps, inst) {   // the experiments as the free bench checks them (also used by the tests)
    return exps.filter(function (e) { return e.inst.indexOf("mn") < 0; }).map(function (e) {
      var u = inst.slice(); e.inst.forEach(function (k) { if (u.indexOf(k) < 0) u.push(k); }); return Object.assign({}, e, { inst: u });
    });
  }
  CV.clabFree = { show: show, kitFrom: kitFrom, forFree: forFree };
})();
