/* CircuitVision — Question Bank.
   Sources (each question shows where it comes from):
     lesson   — the worked practice problem of each lesson (written for CircuitVision, numbers checked by the engine)
     quiz     — the lesson's multiple-choice questions
     project  — the design steps of Project Academy projects
     gen      — the lesson's circuit generator: a new, engine-solved circuit every time
     textbook — problems from Nilsson / Sadiku, ONLY when supplied by the founder (js/bank/textbook.js); never written from memory
   Progress is shared with the lessons and projects (same storage keys). */
(function () {
  "use strict";
  var S = CV.store, F = CV.feedback, root = document.getElementById("bank-root");
  var SRC = { lesson: "مسألة درس", quiz: "اختيار من متعدد", project: "مسألة تصميم", gen: "تمرين مولّد", textbook: "من الكتاب" };
  var DIFF = ["سهل", "متوسط", "صعب"];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function plain(h) { var d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " ").trim(); }
  function diff(n) { return n <= 2 ? 0 : n <= 4 ? 1 : 2; }

  /* ---------- catalogue ---------- */
  var Q = [], chapterOf = {}, course = CV.courses[0];
  course.chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { chapterOf[l.id] = ch; }); });
  course.chapters.forEach(function (ch) {
    ch.lessons.forEach(function (l) {
      var L = CV.lessons[l.id]; if (!L) return;
      if (L.practice) Q.push({ id: "p-" + l.id, src: "lesson", lesson: l.id, ch: ch.id, title: L.ar, text: L.practice.prompt, steps: L.practice.steps.length, problem: L.practice, lid: l.id });
      (L.quiz || []).forEach(function (q, i) {
        Q.push({ id: "q-" + l.id + "-" + i, src: "quiz", lesson: l.id, ch: ch.id, title: L.ar, text: q.q, steps: 1, quiz: i, lid: "quiz:" + l.id + ":" + i,
          problem: { prompt: "", steps: [{ id: "s1", kind: "choice", label: q.q, options: q.options.map(function (o) { return { t: o.t, correct: o.correct, type: o.type, why: o.why }; }), hints: [], solution: (q.options.filter(function (o) { return o.correct; })[0] || {}).why || "" }] } });
      });
      if (L.generator) Q.push({ id: "g-" + l.id, src: "gen", lesson: l.id, ch: ch.id, title: L.ar, text: L.generator.title, steps: 0, gen: L.generator, lid: "bank-gen-" + l.id });
    });
  });
  (CV.projectOrder || []).forEach(function (pid) {
    var p = CV.projects[pid], ch = chapterOf[p.lessons[0]];
    Q.push({ id: "d-" + pid, src: "project", lesson: p.lessons[0], ch: ch ? ch.id : "", title: p.ar, text: p.design.prompt, steps: p.design.steps.length, problem: p.design, lid: "proj-" + pid, project: pid });
  });
  (CV.textbook || []).forEach(function (t) {
    Q.push({ id: "t-" + t.id, src: "textbook", lesson: t.lesson, ch: chapterOf[t.lesson] ? chapterOf[t.lesson].id : "", title: t.book + " · " + t.number, text: t.problem.prompt, steps: t.problem.steps.length, problem: t.problem, lid: "tb:" + t.id, ref: t.book + "، المسألة " + t.number });
  });

  function status(q) {
    if (q.src === "gen") { var n = Object.keys((S.get().practice[q.lid] || { steps: {} }).steps).filter(function (k) { return S.get().practice[q.lid].steps[k].solved; }).length; return n ? "solved" : "new"; }
    var pr = (S.get().practice[q.lid] || { steps: {} }).steps, ids = q.problem.steps.map(function (s) { return s.id; });
    var solved = ids.every(function (id) { return pr[id] && pr[id].solved; }), tried = ids.some(function (id) { return pr[id] && pr[id].attempts; });
    var wrong = S.get().mistakes.some(function (m) { return m.lessonId === q.lid; });
    return solved ? (wrong ? "solved-after" : "solved") : wrong ? "wrong" : tried ? "started" : "new";
  }
  var ST = { "new": ["لم تحلّه", "chip-plan"], started: ["بدأت فيه", "chip-build"], wrong: ["أخطأت فيه", "chip-bad"], solved: ["محلول", "chip-ok"], "solved-after": ["محلول بعد خطأ", "chip-ok"] };

  /* ---------- filters ---------- */
  var F0 = { ch: "", src: "", diff: "", st: "", q: "" }, flt = Object.assign({}, F0);
  try { var sv = JSON.parse(sessionStorage.getItem("cv.bank.f")); if (sv) flt = Object.assign(flt, sv); } catch (e) {}
  function match(q) {
    if (flt.ch && q.ch !== flt.ch) return false;
    if (flt.src && q.src !== flt.src) return false;
    if (flt.diff !== "" && (q.src === "gen" || String(diff(q.steps)) !== flt.diff)) return false;
    var s = status(q);
    if (flt.st === "todo" && /solved/.test(s)) return false;
    if (flt.st === "wrong" && s !== "wrong" && s !== "solved-after") return false;
    if (flt.st === "solved" && !/solved/.test(s)) return false;
    if (flt.q && (plain(q.title + " " + q.text)).toLowerCase().indexOf(flt.q.toLowerCase()) < 0) return false;
    return true;
  }

  function list() {
    document.title = "بنك الأسئلة — CircuitVision";
    var counts = {}; Q.forEach(function (q) { counts[q.src] = (counts[q.src] || 0) + 1; });
    var solvedN = Q.filter(function (q) { return /solved/.test(status(q)); }).length;
    root.innerHTML =
      '<header class="b-head"><span class="eyebrow ltr" style="justify-self:start">Question Bank</span><h1>بنك الأسئلة</h1>' +
      '<p>كل أسئلة Circuits 1 في مكان واحد، مع Smart Feedback في كل سؤال. تقدمك هنا هو نفسه في الدروس والمشاريع.</p></header>' +
      '<div class="b-stats">' + [["كل الأسئلة", Q.filter(function (q) { return q.src !== "gen"; }).length], ["محلولة", solvedN], ["مسائل الدروس", counts.lesson || 0], ["اختيار من متعدد", counts.quiz || 0], ["مسائل تصميم", counts.project || 0], ["مولّدات (لا نهائية)", counts.gen || 0]].map(function (x) { return '<div class="card"><b class="mono">' + x[1] + '</b><span>' + x[0] + '</span></div>'; }).join("") + '</div>' +
      '<form class="b-flt card" id="flt" role="search" onsubmit="return false">' +
      sel("ch", "الفصل", [["", "كل الفصول"]].concat(course.chapters.map(function (c, i) { return [c.id, (i + 1) + ". " + c.ar]; }))) +
      sel("src", "المصدر", [["", "كل المصادر"]].concat(Object.keys(SRC).map(function (k) { return [k, SRC[k]]; }))) +
      sel("diff", "الصعوبة", [["", "الكل"], ["0", "سهل"], ["1", "متوسط"], ["2", "صعب"]]) +
      sel("st", "الحالة", [["", "الكل"], ["todo", "لم أحلّه"], ["wrong", "أخطأت فيه"], ["solved", "محلول"]]) +
      '<div class="field"><label for="f-q">بحث</label><input class="input" id="f-q" value="' + esc(flt.q) + '" placeholder="مثال: ثيفنن، مكثف…"></div>' +
      '<div class="b-act"><button type="button" class="btn btn-primary btn-sm" id="rnd">سؤال عشوائي</button><button type="button" class="btn btn-ghost btn-sm" id="clr">مسح الفلاتر</button></div></form>' +
      '<p class="muted b-note">الصعوبة حسب عدد الخطوات: خطوة أو خطوتان سهل، 3–4 متوسط، 5 فأكثر صعب.</p>' +
      '<div id="b-list" class="b-list"></div>' +
      '<div class="pending card"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6M8 11h6"/></svg></span><p><b>مسائل الكتب (Nilsson 10e و Sadiku 5e)</b>' +
      ((counts.textbook || 0) ? counts.textbook + " مسألة مضافة." : "لم تُضف بعد. لا نكتب مسائل منسوبة للكتب من الذاكرة؛ تُضاف فقط من نص المسألة الأصلي برقمها، ثم تظهر هنا مع اسم الكتاب ورقم المسألة.") + '</p></div>';
    ["ch", "src", "diff", "st"].forEach(function (k) { $("f-" + k).addEventListener("change", function () { flt[k] = this.value; keep(); draw(); }); });
    $("f-q").addEventListener("input", function () { flt.q = this.value; keep(); draw(); });
    $("clr").addEventListener("click", function () { flt = Object.assign({}, F0); keep(); list(); });
    $("rnd").addEventListener("click", function () {
      var pool = Q.filter(match), todo = pool.filter(function (q) { return !/solved/.test(status(q)); }), pick = (todo.length ? todo : pool);
      if (!pick.length) return; location.hash = pick[Math.floor(Math.random() * pick.length)].id;
    });
    draw();
  }
  function $(id) { return document.getElementById(id); }
  function keep() { try { sessionStorage.setItem("cv.bank.f", JSON.stringify(flt)); } catch (e) {} }
  function sel(k, label, opts) { return '<div class="field"><label for="f-' + k + '">' + label + '</label><select class="select" id="f-' + k + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(flt[k]) === o[0] ? " selected" : "") + '>' + o[1] + '</option>'; }).join("") + '</select></div>'; }
  function draw() {
    var items = Q.filter(match), box = $("b-list");
    if (!items.length) { box.innerHTML = '<p class="muted">لا توجد أسئلة بهذه الفلاتر.</p>'; return; }
    var byCh = {}; items.forEach(function (q) { (byCh[q.ch] = byCh[q.ch] || []).push(q); });
    box.innerHTML = '<p class="muted" style="margin:0">' + items.length + ' سؤال</p>' + course.chapters.filter(function (c) { return byCh[c.id]; }).map(function (c) {
      return '<section class="b-ch"><h2>' + c.ar + ' <span class="ltr en">' + c.en + '</span></h2><div class="b-grid">' + byCh[c.id].map(card).join("") + '</div></section>';
    }).join("");
  }
  function card(q) {
    var st = q.src === "gen" ? null : ST[status(q)], t = plain(q.text);
    return '<a class="bq card" href="#' + q.id + '"><div class="bq-top"><span class="chip chip-src">' + SRC[q.src] + '</span>' + (q.src !== "gen" ? '<span class="chip chip-plan">' + DIFF[diff(q.steps)] + (q.steps > 1 ? " · " + q.steps + " خطوات" : "") + '</span>' : '<span class="chip chip-plan">دوائر جديدة كل مرة</span>') + (st ? '<span class="chip ' + st[1] + '">' + st[0] + '</span>' : "") + '</div>' +
      '<b>' + q.title + '</b><p>' + esc(t.length > 140 ? t.slice(0, 140) + "…" : t) + '</p></a>';
  }

  /* ---------- one question ---------- */
  function show(q) {
    document.title = q.title + " — بنك الأسئلة";
    var ch = course.chapters.filter(function (c) { return c.id === q.ch; })[0], idx = Q.filter(match), pos = idx.indexOf(q);
    var prev = pos > 0 ? idx[pos - 1] : null, next = pos > -1 && pos < idx.length - 1 ? idx[pos + 1] : null;
    var back = q.src === "project" ? '<a class="lk" href="academy.html#' + q.project + '">افتح المشروع كاملًا</a>' : q.lesson ? '<a class="lk" href="lesson.html#' + q.lesson + '">راجع الدرس: ' + CV.lessons[q.lesson].ar + '</a>' : "";
    root.innerHTML = '<nav class="crumbs"><a href="#">بنك الأسئلة</a><span>/</span><span>' + (ch ? ch.ar : "") + '</span></nav>' +
      '<header class="b-head"><div class="bq-top"><span class="chip chip-src">' + SRC[q.src] + '</span>' + (q.ref ? '<span class="chip chip-plan">' + q.ref + '</span>' : "") + '</div><h1>' + q.title + '</h1><p>' + back + '</p></header>' +
      '<section class="card b-q" id="b-q"></section>' +
      '<nav class="b-nav">' + (prev ? '<a class="btn btn-ghost btn-sm" href="#' + prev.id + '">→ السابق</a>' : "<span></span>") + '<a class="btn btn-ghost btn-sm" href="#">كل الأسئلة</a>' + (next ? '<a class="btn btn-primary btn-sm" href="#' + next.id + '">التالي ←</a>' : "<span></span>") + '</nav>';
    var box = $("b-q");
    if (q.src === "gen") { box.innerHTML = '<p class="muted">' + q.gen.title + '. كل سؤال هنا دائرة جديدة يحلها المحرك قبل عرضها.</p><div id="gen"></div>'; CV.practice.mount($("gen"), Object.assign({}, q.gen, { lessonId: q.lid })); return; }
    F.renderProblem(box, q.problem, q.lid, { onChange: function (s) { if (q.src === "quiz" && s && s.solved) S.recordQuiz(q.lesson, q.quiz); }, focus: false, title: q.title });
  }

  function route() {
    var id = location.hash.replace(/^#/, ""), q = Q.filter(function (x) { return x.id === id; })[0];
    if (q) show(q); else list();
    window.scrollTo(0, 0);
  }
  root.addEventListener("click", function (e) { var a = e.target.closest(".fb-review"); if (!a) return; e.preventDefault(); location.href = "lesson.html#" + a.dataset.lesson; });
  window.addEventListener("hashchange", route);
  route();
})();
