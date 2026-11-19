/* CircuitVision — Electric Circuits I Lab page (lab.html).
   Index of the ten labs → one lab: objective, equipment, short background, pre-lab (checked), procedures with their
   schematic and tables (checked against the simulator), and the bench at the bottom with «تحقق من توصيلي» and «اعرض الحل». */
(function () {
  "use strict";
  var VIDEO = { 1: "3:58", 2: "3:36", 3: "3:14", 4: "2:33", 5: "2:58", 6: "4:16", 7: "3:46", 8: "3:03", 9: "3:11", 10: "1:57" };   // clab-lab<n>.mp4: explainer videos made from this page's own bench and solutions (tools/videos)
  var S = CV.clabSim, X = CV.clabExps, EXP = X.list, KEY = "cv-clab-progress";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bd(s) { return String(s).replace(/([A-Za-z0-9][A-Za-z0-9 .,=+−\-–/×·()′'∥ΩµθπωΔ²√]*[A-Za-z0-9)Ω²′'])/g, '<span class="ltr">$1</span>'); }
  function prog() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function mark(e, k) { var p = prog(); p[e] = p[e] || {}; p[e][k] = 1; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (x) {} }
  function isDone(e, k) { var p = prog(); return !!(p[e] && p[e][k]); }
  function items(e) { var k = []; e.prelab.forEach(function (_, i) { k.push("pre" + i); }); e.procs.forEach(function (p) { (p.tables || []).forEach(function (_, i) { k.push(p.id + "t" + i); }); if (p.layouts && p.layouts.length && e.inst.indexOf("mn") < 0) k.push(p.id + "w"); }); return k; }
  function count(e) { var k = items(e); return { t: k.length, d: k.filter(function (x) { return isDone(e.id, x); }).length }; }

  var K = CV.clabCheck, RMS = K.RMS, MODE = K.MODE;
  var layoutOf = K.layoutOf;
  var deepSet = K.deepSet;
  var stateFor = K.stateFor;
  var solveL = K.solveL;
  var elByLabel = K.elByLabel;
  var node = K.node;
  var evalQ = K.evalQ;
  var scaled = K.scaled;
  var close = K.close;
  var num = K.num;
  var core = K.core;
  var same = K.same;
  var iso = K.iso;
  var partName = K.partName;
  var relations = K.relations;
  var openEnds = K.openEnds;
  var meters = K.meters;
  var elementsWith = K.elementsWith;
  var wiringReport = K.wiringReport;
  /* ---------- rendering ---------- */
  var root = $("#cl-root"), bench = null, cur = null;
  function route() {
    var id = location.hash.slice(1), e = EXP.filter(function (x) { return x.id === id; })[0];
    if (bench) { bench.destroy(); bench = null; }
    var M = CV.clabModes; if (M) M.leave();
    var rp = document.getElementById("cl-report"); if (rp) { rp.remove(); document.documentElement.classList.remove("rp-open"); }
    if (M && M.route(id, root)) { window.scrollTo(0, 0); return; }
    if (id === "free" && CV.clabFree) {
      bench = CV.clabFree.show(root, { key: "c1-free", code: "EE · Electric Circuits I Lab", title: "معمل الدوائر الكهربائية", exps: EXP,
        inst: ["ps", "fg", "sc", "d1", "d2", "rb", "lb", "cb"],
        kit: CV.clabFree.kitFrom(X.PIECES, [
          { id: "C1n", t: "C", v: 1e-9, name: "1 nF" }, { id: "C10n", t: "C", v: 10e-9, name: "10 nF" }, { id: "C100n", t: "C", v: 0.1e-6, name: "0.1 µF" },
          { id: "C1u", t: "C", v: 1e-6, name: "1 µF" }, { id: "C10u", t: "C", v: 10e-6, name: "10 µF" },
          { id: "L10m", t: "L", v: 10e-3, name: "10 mH" }, { id: "L100m", t: "L", v: 0.1, name: "100 mH" }]) });
      window.scrollTo(0, 0); return;
    }
    if (e) showExp(e); else showIndex();
    window.scrollTo(0, 0);
  }
  function showIndex() {
    var oldRef = document.getElementById("lg-ref"); if (oldRef) oldRef.remove();
    document.title = "معمل الدوائر الكهربائية — CircuitVision";
    root.innerHTML = '<div class="lg-head"><span class="code">EE · Electric Circuits I Lab</span><h1>معمل الدوائر الكهربائية</h1>' +
      '<p>التجارب العشر في كتيب معمل القسم، على طاولة تشبه طاولة المعمل: لوحة التوصيل والقطع، مصدر الجهد بقناتين، ملتيميتران، مولد الإشارة، الأوسيلوسكوب، وصناديق المقاومات والمحاثة. تركّب الدائرة بنفسك وتقيس، والمنصة تتحقق من توصيلك وقراءاتك.</p>' +
      '<div class="lg-cta"><a class="btn btn-primary" href="#exp1">ابدأ بالتجربة 1</a><a class="btn btn-ghost" href="#free">🧪 المعمل الحر</a></div></div>' +
      '<div class="lg-grid">' + EXP.map(function (e) { var c = count(e); return '<a class="card lg-card" href="#' + e.id + '"><span class="n' + (c.d === c.t && c.t ? " ok" : "") + '">' + e.n + '</span><div><b class="ltr lg-sheet">Experiment #' + e.n + ': ' + esc(e.en) + '</b><span>' + esc(e.title) + '</span><span class="pg">' + (c.d ? c.d + " من " + c.t : "") + '</span></div></a>'; }).join("") + '</div>' + (CV.clabModes ? CV.clabModes.indexHtml() : "");
    if (CV.clabModes) CV.clabModes.wireIndex(root);
  }
  function showExp(e) {
    cur = e;
    document.title = "التجربة " + e.n + ": " + e.title + " — CircuitVision";
    var c = count(e), i = EXP.indexOf(e);
    var nav = '<nav class="lg-tabs" aria-label="التجارب">' + EXP.map(function (x) { return '<a href="#' + x.id + '" class="' + (x === e ? "cur" : "") + '"' + (x === e ? ' aria-current="page"' : "") + '><span class="n">' + x.n + '</span><span>' + esc(x.title.split(" ").slice(0, 3).join(" ")) + '</span></a>'; }).join("") + '</nav>';
    var pre = e.prelab.map(function (t, k) { return taskView(e, t, k); }).join("");
    var procs = e.procs.map(function (p, k) { return procView(e, p, k); }).join("");
    var oldRef = document.getElementById("lg-ref"); if (oldRef) oldRef.remove();
    root.innerHTML = nav +
      '<div class="lg-head"><span class="code">EE · Electric Circuits I Lab</span><h1 class="ltr lg-sheet">Experiment #' + e.n + ': ' + esc(e.en) + '</h1><span class="lg-ar">' + esc(e.title) + '</span><span class="pg">' + c.d + ' من ' + c.t + ' مكتملة</span>' +
      '<div class="lg-cta"><button type="button" class="btn btn-ghost btn-sm" id="cl-report-btn">📄 تقرير المعمل (PDF)</button>' + (e.inst.indexOf("mn") < 0 ? '<a class="btn btn-ghost btn-sm" href="#exam-' + e.id + '">⏱ اختبار عملي</a>' : "") + (CV.clabModes && CV.clabModes.faultPool(e.id).length ? '<a class="btn btn-ghost btn-sm" href="#fault-' + e.id + '">🔧 تدريب الأعطال</a>' : "") + '</div></div>' +
      '<div class="lg-top"><section class="card lg-sec"><h2>الأهداف</h2><ul>' + e.objective.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + '</ul></section>' +
      '<section class="card lg-sec"><h2>الأدوات</h2><ul>' + e.equipment.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + '</ul>' + (e.note ? '<p class="lg-note">' + bd(esc(e.note)) + '</p>' : "") + '</section></div>' +
      (VIDEO[e.n] ? '<section class="card lg-sec lg-video"><h2>شرح التجربة بالفيديو <span class="muted small ltr">' + VIDEO[e.n] + '</span></h2><video controls playsinline preload="none" poster="clab-lab' + e.n + '.jpg" src="clab-lab' + e.n + '.mp4"></video><p class="muted small">نفس الطاولة اللي تحت: تركيب الدائرة قطعة قطعة وسلك سلك، ثم ضبط الأجهزة، ثم كل قراءة في الجدول والجهاز موصول في مكانه الصحيح.</p></section>' : '') +
      '<section class="card lg-sec"><h2>الخلفية باختصار</h2><ul class="lg-steps">' + e.theory.map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul></section>' +
      '<h2 class="lg-h">التحضير (Pre-Lab)</h2>' + pre +
      '<h2 class="lg-h">خطوات التجربة</h2>' + procs +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2>' +
      '<div class="lg-bench-bar"><label>الدائرة: <select id="cl-lay" class="select">' + e.procs.map(function (p) { return (p.layouts || []).map(function (L) { return '<option value="' + p.id + "/" + L.id + '">' + esc(p.title.replace(/^الإجراء [0-9 ()تابع]*:\s*/, "")) + (p.layouts.length > 1 ? " · " + esc(L.name) : "") + '</option>'; }).join(""); }).join("") + '</select></label>' +
      (e.inst.indexOf("mn") < 0 ? '<button type="button" class="btn btn-primary btn-sm" id="cl-check">تحقق من توصيلي</button>' : "") + '<button type="button" class="btn btn-ghost btn-sm" id="cl-sol">اعرض الحل على الطاولة</button><button type="button" class="btn btn-ghost btn-sm" id="cl-ref-open">📐 الرسمة</button></div>' +
      '<div class="lg-out" id="cl-out" aria-live="polite"></div><div id="cl-bench"></div></section>' +
      '<div class="lg-pn">' + (i > 0 ? '<a class="btn btn-ghost" href="#' + EXP[i - 1].id + '">→ التجربة ' + EXP[i - 1].n + '</a>' : "<span></span>") + (i < EXP.length - 1 ? '<a class="btn btn-ghost" href="#' + EXP[i + 1].id + '">التجربة ' + EXP[i + 1].n + ' ←</a>' : "") + '</div>';
    bench = CV.clabBench.mount($("#cl-bench"), { key: e.id, inst: e.inst, kit: e.kit, fullEl: $("#bench") });
    wire(e);
    if (CV.clabModes) { CV.clabModes.keepAnswers(e, root); $("#cl-report-btn").addEventListener("click", function () { CV.clabModes.report(e, root); }); }
  }
  /* reference drawing of the selected circuit, pinned top-right like the logic lab; the student can hide it */
  var REF_KEY = "cv-clab-ref-min";
  function refPanel(e, open, quiet) {
    var box = document.getElementById("lg-ref"), sel = $("#cl-lay"); if (!sel) return;
    var v = sel.value.split("/"), k = -1, p = null, L = null;
    e.procs.forEach(function (x, i) { if (x.id === v[0]) k = i; });
    if (k >= 0) { p = e.procs[k]; L = (p.layouts || []).filter(function (x) { return x.id === v[1]; })[0]; }
    var fp = null; for (var i = k; i >= 0 && !fp; i--) if (e.procs[i].fig) fp = e.procs[i];
    if (!fp) { if (box) box.remove(); return; }
    if (!box) {
      box = document.createElement("aside"); box.id = "lg-ref"; box.className = "lg-ref"; box.setAttribute("aria-label", "الرسمة المرجعية");
      document.body.appendChild(box);
      box.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-ref]"); if (!b) return;
        var min = b.dataset.ref === "min"; box.classList.toggle("min", min);
        try { localStorage.setItem(REF_KEY, min ? "1" : "0"); } catch (x) {}
      });
    }
    var min; try { min = localStorage.getItem(REF_KEY) === "1"; } catch (x) { min = false; }
    if (open) { min = false; try { localStorage.setItem(REF_KEY, "0"); } catch (x) {} }
    if (quiet && !open) min = true;
    box.classList.toggle("min", min);
    box.innerHTML = '<button type="button" class="lg-ref-pill" data-ref="open" aria-label="أظهر الرسمة المرجعية">📐 الرسمة</button>' +
      '<div class="lg-ref-card"><div class="lg-ref-h"><div><b>' + bd(esc(p.title)) + '</b>' + (L && p.layouts.length > 1 ? '<span>' + bd(esc(L.name)) + '</span>' : "") + '</div><button type="button" class="lg-ref-x" data-ref="min" aria-label="أخفِ الرسمة" title="أخفِ">×</button></div>' +
      '<div class="lg-ref-b"><div class="lg-ref-fig">' + CV.draw.render(fp.fig, { aria: "مخطط " + fp.title }) + '</div>' +
      '<p class="lg-ref-note">' + (fp === p ? "رسمة الدائرة من كتيب المعمل." : "رسمة الدائرة من «" + esc(fp.title) + "» في كتيب المعمل.") + '</p></div></div>';
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
      var p = e.procs.filter(function (x) { return x.id === b.dataset.go; })[0]; $("#cl-lay").value = p.id + "/" + p.layouts[0].id; $("#cl-out").innerHTML = ""; refPanel(e, true); $("#bench").scrollIntoView({ behavior: "smooth" }); }); });
    $("#cl-lay").addEventListener("change", function () { $("#cl-out").innerHTML = ""; refPanel(e, false); });
    $("#cl-ref-open").addEventListener("click", function () { refPanel(e, true); });
    refPanel(e, false, true);
    var ck = $("#cl-check"); if (ck) ck.addEventListener("click", function () {
      var v = $("#cl-lay").value.split("/"), p = e.procs.filter(function (x) { return x.id === v[0]; })[0], L = layoutOf(e, v[1], p), r = wiringReport(e, L, bench.state()), out = $("#cl-out");
      var list = r.msgs.map(function (m) { return '<li class="' + m.lvl + '">' + m.t + '</li>'; }).join("");
      if (r.ok) { out.className = "lg-out ok"; out.innerHTML = "✓ توصيلك مطابق للدائرة: " + esc(p.title) + (p.layouts.length > 1 ? " · " + esc(L.name) : "") + "، والأجهزة في أماكنها. الحين شغّل المصدر وقِس." + (list ? '<ul class="cl-fix">' + list + "</ul>" : ""); mark(e.id, p.id + "w");
        var w = root.querySelector('#' + e.id + '-' + p.id + ' .cl-wok'); if (w) { w.classList.add("ok"); w.textContent = "✓ التوصيل صحيح"; } return; }
      out.className = "lg-out bad";
      out.innerHTML = "<b>فيه ملاحظات على التوصيل:</b><ul class=\"cl-fix\">" + list + "</ul><span class='muted small'>قارن مع الرسمة (📐 فوق يمين). كل مربع في اللوحة عقدة واحدة.</span>";
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
