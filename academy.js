/* CircuitVision — Project Academy page.
   #<project-id> opens a project; otherwise the catalogue. Each project runs through six stages:
   idea → design (Smart Feedback) → simulation (engine) → build → test (compare real readings) → documentation. */
(function () {
  "use strict";
  var S = CV.store, F = CV.feedback, root = document.getElementById("academy-root");
  var STAGES = [["idea", "الفكرة", "Idea"], ["design", "التصميم", "Design"], ["sim", "المحاكاة", "Simulation"], ["build", "التنفيذ", "Build"], ["test", "الاختبار", "Test"], ["doc", "التوثيق", "Documentation"]];
  var lessonTitle = {};
  CV.courses.forEach(function (c) { c.chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { lessonTitle[l.id] = l.en; }); }); });
  function arTitle(id) { return CV.lessons && CV.lessons[id] ? CV.lessons[id].ar : lessonTitle[id] || id; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent; }
  function lid(p) { return "proj-" + p.id; }
  /* Keep "20 mA", "30°C", "0–80°C" left-to-right inside Arabic text */
  var QTY = /(−?\d+(?:\.\d+)?(?:\s?[–-]\s?\d+(?:\.\d+)?)?\s?(?:°C|°|%|dB|[GMkmµn]?(?:VAR|VA|Hz|Ω|A|V|W|F|K))(?![A-Za-z]))/g;
  function fixBidi(el) {
    if (!el) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: function (t) {
      for (var p = t.parentNode; p && p !== el; p = p.parentNode) { if (p.nodeName === "svg" || p.nodeName === "PRE" || p.nodeName === "TEXTAREA" || p.nodeName === "SELECT" || p.nodeName === "OPTION" || (p.classList && (p.classList.contains("ltr") || p.classList.contains("mono") || p.classList.contains("eq-i")))) return NodeFilter.FILTER_REJECT; }
      QTY.lastIndex = 0; return QTY.test(t.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
    var list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(function (t) {
      var frag = document.createDocumentFragment(), s = t.nodeValue, last = 0; QTY.lastIndex = 0; var m;
      while ((m = QTY.exec(s))) { if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index))); var sp = document.createElement("span"); sp.className = "ltr"; sp.textContent = m[0]; frag.appendChild(sp); last = m.index + m[0].length; }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }

  /* ---------- progress (shared with the Beyond Theory club) ---------- */
  var K = CV.projectKit, simValues = K.simValues, progress = K.progress;

  /* ---------- catalogue ---------- */
  function catalogue() {
    document.title = "أكاديمية المشاريع — CircuitVision";
    var total = CV.projectOrder.length, done = CV.projectOrder.filter(function (id) { return progress(CV.projects[id]).done; }).length;
    var chapters = CV.courses[0].chapters.map(function (ch) {
      var ids = ch.lessons.map(function (l) { return l.id; }).filter(function (id) { return CV.projects[id]; });
      if (!ids.length) return "";
      var cards = ids.map(function (id) {
        var p = CV.projects[id], g = progress(p);
        return '<a class="pj card" href="#' + p.id + '"><div class="pj-top"><span class="chip chip-plan">' + p.level + '</span>' + (g.done ? '<span class="chip chip-ok">منجز</span>' : g.count ? '<span class="chip chip-build">' + g.count + ' من 5 مراحل</span>' : '') + '</div>' +
          '<div class="pj-fig">' + K.figure(p) + '</div>' +
          '<b>' + p.ar + '</b><span class="ltr pj-en">' + p.en + '</span><p>' + p.summary + '</p>' +
          '<div class="pj-ls"><span>الدرس: ' + arTitle(p.lesson) + '</span></div></a>';
      }).join("");
      var n = ids.filter(function (id) { return progress(CV.projects[id]).done; }).length;
      return '<section class="pj-ch" id="ch-' + ch.id + '"><div class="pj-chh"><h2>' + ch.ar + '</h2><span class="muted">' + n + ' من ' + ids.length + ' منجز</span></div><div class="pj-grid">' + cards + '</div></section>';
    }).join("");
    root.innerHTML =
      '<header class="a-head"><span class="eyebrow ltr" style="justify-self:start">Project Academy</span><h1>أكاديمية المشاريع</h1>' +
      '<p>لكل درس في Circuits 1 مشروع يطبّق فكرته بالضبط: تصمم بالحساب، تحاكي، تبني على لوحة تجارب بأجهزة المعمل، تقيس، وتوثق. كل رقم يحسبه محرك الحل نفسه المستخدم في الدروس والمعمل.</p>' +
      '<p class="muted" style="margin:0">أنجزت ' + done + ' من ' + total + ' مشروعًا.</p></header>' +
      '<ol class="stages card">' + STAGES.map(function (s, i) { return '<li><span class="n">' + (i + 1) + '</span><b>' + s[1] + '</b><span class="ltr">' + s[2] + '</span></li>'; }).join("") + '</ol>' +
      '<a class="bt-band card" href="club.html"><span class="bt-band-mk ltr">Beyond Theory</span><span class="bt-band-t"><b>أنجزت مشروعًا؟ اعرضه في النادي</b>انشر صورة الدائرة التي بنيتها مع تقرير المشروع، وشاهد ما بناه زملاؤك في كل مشروع.</span><span class="bt-band-go">افتح النادي ←</span></a>' +
      chapters + '<p class="muted" style="margin:0;font-size:13px">مشاريع Circuits 2 لم تُبنَ بعد.</p>';
    fixBidi(root);
  }
  var defaults = K.defaults;

  /* ---------- project ---------- */
  function project(p) {
    document.title = p.ar + " — CircuitVision";
    var st = S.project(p.id);
    root.innerHTML =
      '<nav class="crumbs"><a href="#">أكاديمية المشاريع</a><span>/</span><span>' + p.ar + '</span></nav>' +
      '<header class="a-head"><h1>' + p.ar + '</h1><span class="ltr en">' + p.en + '</span><div class="l-meta"><span>المستوى: ' + p.level + '</span><span>يعتمد على: ' + p.lessons.map(function (l) { return '<a class="lk" href="lesson.html#' + l + '">' + arTitle(l) + '</a>'; }).join("، ") + '</span></div></header>' +
      '<div class="l-grid"><div class="l-body">' +
      sec("idea", "1. الفكرة", "Idea", '<div class="prose">' + p.idea.html + '<div class="callout"><b>مواصفات التصميم</b><ul class="ticks">' + p.idea.specs.map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ul></div></div>') +
      sec("design", "2. التصميم", "Design", '<div id="pj-design"></div>') +
      sec("sim", "3. المحاكاة", "Simulation", '<p class="muted">' + p.sim.intro + ' <a class="lk" href="lab.html#proj" id="to-lab">ابنِها في المعمل الذكي على لوحة التجارب ←</a></p><form class="sim-ctl" id="sim-ctl" novalidate></form><div id="sim-out"></div>') +
      sec("build", "4. التنفيذ", "Build", '<div class="bld"><div><b class="sub">القطع المطلوبة</b><div class="tbl-wrap"><table class="tbl"><thead><tr><th>القطعة</th><th>العدد</th></tr></thead><tbody>' + p.parts.map(function (x) { return "<tr><td>" + x[0] + "</td><td>" + x[1] + "</td></tr>"; }).join("") + '</tbody></table></div></div>' +
        '<div class="safety"><b>السلامة</b><ul>' + p.safety.map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ul></div></div>' +
        '<b class="sub">خطوات البناء <span class="muted">(بقيم تصميمك في المحاكاة؛ الجديد في كل خطوة مُبرز بالبرتقالي)</span></b><ol class="chk" id="bld-steps"></ol>') +
      sec("test", "5. الاختبار", "Test", '<p class="muted">' + p.test.intro + ' (اختياري إذا لم تبنِ الدائرة.)</p><form class="meas" id="meas" novalidate></form><div id="meas-out"></div>') +
      sec("doc", "6. التوثيق", "Documentation", '<label class="sub" for="pj-notes">ملاحظاتك (ما الذي تعلمته؟ ما الذي اختلف عن المتوقع؟)</label><textarea class="input notes" id="pj-notes" rows="4" placeholder="اكتب ملاحظاتك هنا…">' + esc(st.notes || "") + '</textarea><b class="sub">تقرير المشروع</b><pre class="report" id="report" dir="rtl"></pre><div class="pb-actions"><button type="button" class="btn btn-ghost btn-sm" id="copy-rep">نسخ التقرير</button><span class="muted" id="copy-st" aria-live="polite"></span></div>') +
      '<div class="finish card" id="finish"></div>' +
      '</div><aside class="l-aside"><div class="req card"><b>مراحل المشروع</b><ul id="req"></ul></div></aside></div>';

    F.renderProblem(document.getElementById("pj-design"), p.design, lid(p), { onChange: refresh, focus: false, title: p.ar });
    fixBidi(root);
    buildSim(p); buildTest(p); buildSteps(p);
    document.getElementById("bld-steps").addEventListener("change", function (e) { var cb = e.target.closest("input[data-i]"); if (!cb) return; var o = {}; o[cb.dataset.i] = cb.checked; S.saveProject(p.id, { steps: o }); refresh(); });
    var notes = document.getElementById("pj-notes");
    notes.addEventListener("input", function () { S.saveProject(p.id, { notes: notes.value }); refresh(); });
    document.getElementById("to-lab").addEventListener("click", function () { try { sessionStorage.setItem("cv.projlab", JSON.stringify({ name: "مشروع: " + p.ar, lab: p.labFor(simValues(p)) })); } catch (x) {} });
    document.getElementById("copy-rep").addEventListener("click", function () {
      var txt = document.getElementById("report").textContent, stEl = document.getElementById("copy-st");
      function fallback() { var r = document.createRange(); r.selectNodeContents(document.getElementById("report")); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); stEl.textContent = "حدّدت النص؛ انسخه يدويًا."; }
      try { navigator.clipboard.writeText(txt).then(function () { stEl.textContent = "نُسخ التقرير."; }, fallback); } catch (e) { fallback(); }
    });

    function refresh() {
      var g = progress(p);
      var items = [["design", "التصميم: كل الخطوات صحيحة", g.design], ["sim", "المحاكاة: كل الشروط محققة (بعد التصميم)", g.sim], ["build", "التنفيذ: خطوات البناء", g.build], ["test", "الاختبار: قراءات حقيقية", g.test], ["doc", "التوثيق: ملاحظاتك", g.doc]];
      document.getElementById("req").innerHTML = items.map(function (x) { return '<li class="' + (x[2] ? "ok" : "") + '"><a href="#' + p.id + '" data-go="' + x[0] + '">' + x[1] + '</a></li>'; }).join("");
      var canFinish = g.design && g.sim, fin = document.getElementById("finish");
      var peers = '<a class="btn btn-ghost btn-sm" href="club.html#p-' + p.id + '">عروض الزملاء لهذا المشروع</a>';
      fin.innerHTML = g.done ? '<p>✓ أنجزت هذا المشروع. اعرضه في نادي Beyond Theory مع صورة دائرتك، وسيُرفق تقرير المشروع تلقائيًا.</p><div class="pb-actions"><a class="btn btn-primary btn-sm" href="club.html#share-' + p.id + '">اعرض مشروعك في Beyond Theory</a>' + peers + '</div>'
        : '<p>' + (canFinish ? "التصميم والمحاكاة مكتملان. " + (g.test ? "" : "لم تُدخل قياسات حقيقية؛ سيظهر ذلك في التقرير. ") : "يُحتسب المشروع منجزًا بعد إكمال التصميم وتحقيق كل شروط المحاكاة.") + '</p><div class="pb-actions"><button type="button" class="btn btn-primary btn-sm" id="fin-btn"' + (canFinish ? "" : " disabled") + '>أنهيت المشروع</button>' + peers + '</div>';
      var fb = document.getElementById("fin-btn");
      if (fb) fb.addEventListener("click", function () { S.completeProject(p.id, "أنجزت مشروع: " + p.ar); refresh(); });
      document.getElementById("report").textContent = report(p, g);
    }
    root._refresh = refresh;
    refresh();
    root.querySelector("#req").addEventListener("click", function (e) { var a = e.target.closest("[data-go]"); if (!a) return; e.preventDefault(); var t = document.getElementById("s-" + a.dataset.go); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }

  var bsT = 0;
  function buildSteps(p) {
    var st = S.project(p.id), steps = p.buildFor(simValues(p)), box = document.getElementById("bld-steps");
    box.innerHTML = steps.map(function (s, i) { return '<li><label><input type="checkbox" data-i="' + i + '"' + (st.steps && st.steps[i] ? " checked" : "") + '><span><b class="bn">' + (i + 1) + '</b> ' + s.t + '</span></label><div class="bb-wrap">' + p.picture(steps, i, "الخطوة " + (i + 1) + ": " + plain(s.t)) + '</div></li>'; }).join("");
  }
  function sec(id, title, en, body) { return '<section class="l-sec card" id="s-' + id + '"><div class="sec-h"><h2>' + title + '</h2><span class="en ltr">' + en + '</span></div>' + body + '</section>'; }

  /* ---------- simulation ---------- */
  function buildSim(p) {
    var form = document.getElementById("sim-ctl"), v = simValues(p);
    form.innerHTML = p.sim.controls.map(function (c) {
      var id = "sc-" + c.id, val = v[c.id], inp;
      if (c.type === "select") inp = '<select class="select" id="' + id + '" data-k="' + c.id + '" dir="ltr">' + c.options.map(function (o) { return '<option value="' + o.v + '"' + (String(o.v) === String(val) ? " selected" : "") + '>' + o.l + '</option>'; }).join("") + '</select>';
      else if (c.type === "range") inp = '<div class="rng"><input type="range" id="' + id + '" data-k="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + val + '"><output class="mono" for="' + id + '">' + val + '</output></div>';
      else inp = '<input class="input" type="number" inputmode="decimal" id="' + id + '" data-k="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + val + '" dir="ltr">';
      return '<div class="field"><label for="' + id + '">' + c.label + '</label>' + inp + '</div>';
    }).join("") + '<button type="button" class="btn btn-ghost btn-sm" id="sim-reset">القيم الافتراضية</button>';
    form.addEventListener("input", function (e) {
      var k = e.target.dataset.k; if (!k) return;
      var o = {}; o[k] = e.target.value; S.saveProject(p.id, { design: o });
      if (e.target.type === "range") e.target.parentNode.querySelector("output").textContent = e.target.value;
      drawSim(p); if (root._refresh) root._refresh(); refreshTest(p); clearTimeout(bsT); bsT = setTimeout(function () { buildSteps(p); }, 250);
    });
    document.getElementById("sim-reset").addEventListener("click", function () { S.saveProject(p.id, { design: defaults(p) }); buildSim(p); drawSim(p); if (root._refresh) root._refresh(); refreshTest(p); buildSteps(p); });
    drawSim(p);
  }
  function drawSim(p) {
    var r = p.sim.compute(simValues(p)), out = document.getElementById("sim-out");
    if (r.error) { out.innerHTML = '<p class="fb fb-info">' + r.error + '</p>'; return; }
    out.innerHTML = '<div class="sim-grid"><div class="lfig">' + CV.draw.render(r.circuit, { aria: "دائرة المشروع بالقيم المختارة" }) + '</div>' +
      '<div class="sim-side"><dl class="rd">' + r.readings.map(function (x) { return '<div class="rw"><dt>' + x[0] + '</dt><dd class="' + (/[\u0600-\u06FF]/.test(x[1]) ? "" : "ltr mono") + '">' + x[1] + '</dd></div>'; }).join("") + '</dl></div></div>' +
      '<ul class="checks">' + r.checks.map(function (c) { return '<li class="' + (c.ok ? "ok" : "bad") + '"><span class="mk">' + (c.ok ? "✓" : "✗") + '</span>' + c.t + '</li>'; }).join("") + '</ul>' +
      (r.checks.every(function (c) { return c.ok; }) ? '<p class="gp-ok">✓ تصميمك يحقق كل الشروط.</p>' : '<p class="muted">غيّر القيم حتى تتحقق كل الشروط.</p>');
    fixBidi(out);
  }

  /* ---------- test ---------- */
  function buildTest(p) {
    var st = S.project(p.id), m = st.measured || {}, form = document.getElementById("meas");
    form.innerHTML = '<div class="meas-grid">' + p.test.quantities.map(function (q) {
      var saved = m[q.id], u = q.units, ui = q.def || 0, shown = "";
      if (saved != null) { shown = String(Number((saved / u[ui].f).toPrecision(6))); }
      return '<div class="field"><label for="m-' + q.id + '">' + q.label + '</label><div class="pb-row"><input class="input pb-input" id="m-' + q.id + '" data-q="' + q.id + '" inputmode="decimal" dir="ltr" value="' + shown + '" autocomplete="off"><select class="select pb-unit" id="m-' + q.id + '-u" dir="ltr">' + u.map(function (x, i) { return '<option value="' + i + '"' + (i === ui ? " selected" : "") + '>' + x.l + '</option>'; }).join("") + '</select></div></div>';
    }).join("") + '</div><div class="pb-actions"><button type="submit" class="btn btn-primary btn-sm">قارن بالمتوقع</button></div>';
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var o = {}, bad = false;
      p.test.quantities.forEach(function (q) {
        var raw = document.getElementById("m-" + q.id).value.trim();
        if (!raw) { o[q.id] = null; return; }
        var x = F.parseNumber(raw); if (isNaN(x)) { bad = true; return; }
        o[q.id] = x * q.units[+document.getElementById("m-" + q.id + "-u").value].f;
      });
      if (bad) { document.getElementById("meas-out").innerHTML = '<p class="fb fb-info">اكتب أرقامًا فقط، مثل 2.95 أو 13.1، واختر الوحدة.</p>'; return; }
      S.saveProject(p.id, { measured: o }); refreshTest(p); if (root._refresh) root._refresh();
    });
    refreshTest(p);
  }
  function refreshTest(p) {
    var out = document.getElementById("meas-out"); if (!out) return;
    var m = (S.project(p.id).measured) || {}, v = simValues(p), r = p.sim.compute(v);
    var have = p.test.quantities.filter(function (q) { return m[q.id] != null; });
    if (!have.length || r.error) { out.innerHTML = ""; return; }
    var rows = have.map(function (q) {
      var ex = r.expected[q.id], me = m[q.id], unit = q.units[q.units.length > 1 ? 1 : 0].l;
      var diff = Math.abs(ex) > 1e-9 ? (me - ex) / Math.abs(ex) : null, ok = diff === null ? Math.abs(me - ex) < 0.02 : Math.abs(diff) <= p.test.tol;
      var u = unit === "°" ? function (x) { return CV.num(x) + "°"; } : function (x) { return CV.ac.si(x, unit.replace(/^m/, "")); };
      return '<tr><td>' + q.label + '</td><td class="ltr mono">' + u(ex) + '</td><td class="ltr mono">' + u(me) + '</td><td class="ltr mono">' + (diff === null ? "—" : (diff >= 0 ? "+" : "−") + Math.abs(diff * 100).toFixed(1) + "%") + '</td><td>' + (ok ? '<span class="ok-t">✓ ضمن ±' + Math.round(p.test.tol * 100) + '%</span>' : '<span class="bad-t">✗ خارج ±' + Math.round(p.test.tol * 100) + '%</span>') + '</td></tr>';
    }).join("");
    var notes = p.test.analyze(m, v, r);
    out.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكمية</th><th>المتوقع</th><th>المقاس</th><th>الفرق</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      (notes.length ? '<ul class="ana">' + notes.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>' : "") +
      '<p class="muted"><b>أسباب شائعة للفرق:</b> ' + p.test.causes.join(" · ") + '</p>';
    fixBidi(out);
  }

  var report = K.report;

  /* ---------- routing ---------- */
  function route() {
    var id = location.hash.replace(/^#/, ""), p = CV.projects[id];
    if (p) project(p); else catalogue();
    window.scrollTo(0, 0);
  }
  // Smart Feedback "review" links point to lessons
  root.addEventListener("click", function (e) {
    var a = e.target.closest(".fb-review"); if (!a) return;
    e.preventDefault(); location.href = "lesson.html#" + a.dataset.lesson;
  });
  window.addEventListener("hashchange", route);
  route();
})();
