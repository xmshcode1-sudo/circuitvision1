/* CircuitVision — the MATLAB hub (matlab.html): "MATLAB from Zero" series and the script of every lesson.
   #ml-<id> opens one script (video, code, output, figures, project idea). */
(function () {
  "use strict";
  var I = CV.matlabIndex || {}, V = CV.mlView, root = document.getElementById("ml-root");
  var esc = V.esc;
  var COURSES = [["intro", "MATLAB من الصفر", "سبع حلقات لمن لم يستخدم MATLAB قط: من أول أمر إلى مشروع كامل."], ["circuits-1", "الدوائر الكهربائية 1", "سكربت لكل درس من دروس Circuits 1 يحل مثال الدرس ويتحقق منه، ثم فكرة مشروع."], ["signals-systems", "الإشارات والنظم", "سكربت لكل درس من دروس الإشارات والنظم: الالتفاف، فورييه، لابلاس، Z، وأخذ العيّنات."]];
  function ids(course) { return Object.keys(I).filter(function (k) { return I[k].course === course; }).sort(function (a, b) { return order(a) - order(b); }); }
  function order(k) {   // follow the course order of the lessons
    var L = I[k].lesson, n = 0, found = -1;
    if (!L) return +I[k].level || 0;
    (CV.courses || []).forEach(function (c) { c.chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { if (l.id === L) found = n; n++; }); }); });
    return found;
  }
  function chapterOf(k) {
    var L = I[k].lesson, out = null;
    (CV.courses || []).forEach(function (c) { c.chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { if (l.id === L) out = ch.ar; }); }); });
    return out;
  }
  function card(k) {
    var x = I[k], dur = CV.videoDur && CV.videoDur[k];
    return '<a class="card ml-item" href="#' + k + '"><span class="n">' + esc(x.lesson || ("الحلقة " + x.level)) + '</span><b>' + esc(x.ar) + '</b><span class="ltr">' + esc(x.title) + '</span><span>' + x.n + " أقسام · " + x.figs + " رسوم" + (x.checks ? " · " + x.checks + " اختبار" : "") + (dur ? " · فيديو " + dur : "") + "</span></a>";
  }
  function index(tab) {
    tab = tab || "intro";
    document.title = "MATLAB — CircuitVision";
    var c = COURSES.filter(function (x) { return x[0] === tab; })[0], list = ids(tab), html = "", last = null;
    list.forEach(function (k) { var ch = chapterOf(k); if (ch && ch !== last) { html += '</div><h3 class="ml-chap">' + esc(ch) + '</h3><div class="ml-list">'; last = ch; } html += card(k); });
    root.innerHTML = '<div class="lg-head"><span class="code">MATLAB</span><h1>MATLAB للمهندس</h1><p>كل سكربت هنا شُغّل فعلًا، وما تراه من مخرجات ورسوم هو ناتجه، وكل رقم من أمثلة الدروس عليه اختبار تلقائي. حمّل السكربت وشغّله في MATLAB، وغيّر القيم بنفسك.</p></div>' +
      '<div class="ml-tabs" role="tablist">' + COURSES.map(function (x) { return '<button type="button" role="tab" data-t="' + x[0] + '" aria-selected="' + (x[0] === tab) + '">' + esc(x[1]) + " (" + ids(x[0]).length + ")</button>"; }).join("") + "</div>" +
      '<p class="muted">' + esc(c[2]) + "</p>" + '<div class="ml-list">' + html + "</div>";
    Array.prototype.forEach.call(root.querySelectorAll("[data-t]"), function (b) { b.onclick = function () { history.replaceState(null, "", "#" + b.dataset.t); index(b.dataset.t); }; });
  }
  function one(id) {
    var x = I[id], list = ids(x.course), i = list.indexOf(id);
    document.title = x.ar + " — MATLAB — CircuitVision";
    root.innerHTML = '<nav class="crumbs"><a href="#' + x.course + '">MATLAB</a><span>›</span><span>' + esc(COURSES.filter(function (c) { return c[0] === x.course; })[0][1]) + "</span></nav>" +
      '<div id="ml-one"></div>' +
      (x.lesson ? '<p><a class="btn btn-ghost btn-sm" href="lesson.html#' + x.lesson + '">افتح الدرس ' + esc(x.lesson) + "</a></p>" : "") +
      '<div class="lg-pn" style="display:flex;justify-content:space-between;gap:8px">' + (i > 0 ? '<a class="btn btn-ghost" href="#' + list[i - 1] + '">→ ' + esc(I[list[i - 1]].ar) + "</a>" : "<span></span>") + (i < list.length - 1 ? '<a class="btn btn-ghost" href="#' + list[i + 1] + '">' + esc(I[list[i + 1]].ar) + " ←</a>" : "") + "</div>";
    V.load(id, document.getElementById("ml-one"), { video: !!(CV.videoDur && CV.videoDur[id]) });
  }
  function route() {
    var h = location.hash.slice(1);
    if (I[h]) one(h); else index(COURSES.some(function (c) { return c[0] === h; }) ? h : "intro");
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route); route();
})();
