/* CircuitVision — Signals and Systems (EE 3010): builds a lesson for lesson.html from one compact description, and the scenes of
   its explainer video from the same description (so the video always says what the lesson says).
   The content follows the course lectures (Faroq Razzaz, EE 3010) chapter by chapter; every number in an example or exercise is
   either from the lecture or computed here in code. */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {}, L = CV.lessons = CV.lessons || {}, V = CV.ssVideo = CV.ssVideo || {};
  var CHAP = {};   // lesson id prefix → chapter title (for the video cards)
  function fig(p, cap) { return "<figure class='lfig sp-fig'>" + CV.sp.plot(p) + (cap ? "<figcaption>" + cap + "</figcaption>" : "") + "</figure>"; }
  /* Arabic words inside a left-to-right equation are isolated, so the numbers around them keep their order. */
  function iso(t) { return String(t).replace(/ {2,}/g, " &emsp; ").replace(/[\u0600-\u06FF][\u0600-\u06FF\s،]*[\u0600-\u06FF]|[\u0600-\u06FF]/g, function (w) { return "<bdi dir='rtl'>" + w + "</bdi>"; }); }
  function eqs(list) { return list.map(function (e) { return typeof e === "string" ? "<div class='eq'>" + iso(e) + "</div>" : "<div class='eq'>" + iso(e.eq) + (e.n ? "<small class='eq-n'>" + e.n + "</small>" : "") + "</div>"; }).join(""); }
  function lesson(s) {
    var secs = [];
    var figs = (s.figs || []).map(function (f) { return f.plot ? f : { plot: f }; });
    secs.push({ id: "concept", title: "الفكرة", en: "Concept", html: s.idea.map(function (p) { return "<p>" + p + "</p>"; }).join("") });
    if (figs.length || s.widget) secs.push({ id: "diagram", title: s.widget ? "جرّبها بنفسك" : "بالرسم", en: s.widget ? "Interactive" : "Plots",
      html: figs.map(function (f) { return fig(f.plot, f.cap); }).join("") + (s.widget ? "<div class='sigw' data-sigw='" + JSON.stringify(s.widget).replace(/'/g, "&#39;") + "'></div>" : "") });
    if (s.terms) secs.push({ id: "terms", title: "المصطلحات", en: "Terminology", html: "<dl class='terms'>" + s.terms.map(function (t) { return "<dt>" + t[0] + "</dt><dd>" + t[1] + "</dd>"; }).join("") + "</dl>" });
    secs.push({ id: "laws", title: "القوانين", en: "Equations", html: eqs(s.laws) + (s.lawsNote ? "<p>" + s.lawsNote + "</p>" : "") });
    if (s.when) secs.push({ id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'>" + s.when.map(function (w) { return "<li>" + w + "</li>"; }).join("") + "</ul>" });
    secs.push({ id: "example", title: "أمثلة محلولة", en: "Worked Examples", html: s.ex.map(function (e, i) {
      return "<p class='q'><b>مثال " + (i + 1) + ":</b> " + e.q + "</p>" + (e.fig ? fig(e.fig) : "") + "<ol class='steps'>" + e.s.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" + (e.after ? fig(e.after) : "");
    }).join("") });
    if (s.real) secs.push({ id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>" + s.real + "</p>" });
    L[s.id] = { id: s.id, ar: s.ar, en: s.en, minutes: s.min || 25, objectives: s.obj, sections: secs, quiz: s.quiz, practice: s.practice, video: "ss-" + s.id.replace(/^ss-/, "") + ".mp4", course: "signals-systems", lab: null };
    V[s.id] = scenes(s, figs);
    return L[s.id];
  }
  /* ---------- video scenes (rendered by tools/videos/ss-studio.html) ---------- */
  function strip(h) { return String(h).replace(/<span class='ltr'>|<\/span>/g, ""); }
  function scenes(s, figs) {
    var out = [], ch = s.chapter || "";
    out.push({ kind: "card", eyebrow: "تحليل الإشارات والنظم EE 3010 · " + ch, title: s.ar, en: s.en, lines: s.obj, dur: 6 });
    s.idea.forEach(function (p, i) {
      var f = figs[i] || null;
      out.push({ kind: "slide", title: i === 0 ? "الفكرة" : "الفكرة (تابع)", html: "<p>" + p + "</p>", plot: f ? f.plot : null, cap: f ? f.cap : "", dur: Math.min(13, 5 + strip(p).length / 22) });
    });
    for (var k = s.idea.length; k < figs.length; k++) out.push({ kind: "slide", title: "بالرسم", html: figs[k].cap ? "<p>" + figs[k].cap + "</p>" : "", plot: figs[k].plot, dur: 6 });
    (s.anim || []).forEach(function (a) {
      for (var f = 0; f < a.frames; f++) out.push({ kind: "slide", title: a.title, html: (a.html ? (typeof a.html === "function" ? a.html(f) : a.html) : ""), plot: a.plot(f), dur: a.dur / a.frames, still: f > 0 });
    });
    out.push({ kind: "slide", title: "القوانين", html: eqs(s.laws), dur: 5 + s.laws.length * 2.2 });
    s.ex.forEach(function (e, i) {
      var shown = [];
      out.push({ kind: "slide", title: "مثال " + (i + 1), html: "<p>" + e.q + "</p>", plot: e.fig || null, dur: 5 + strip(e.q).length / 30 });
      e.s.forEach(function (st, j) {
        shown.push(st); var vis = shown.slice(-5);
        out.push({ kind: "slide", title: "مثال " + (i + 1) + " · الخطوة " + (j + 1) + " من " + e.s.length, html: "<ol class='steps' start='" + (shown.length - vis.length + 1) + "'>" + vis.map(function (x, q) { return "<li" + (q === vis.length - 1 ? " class='now'" : "") + ">" + x + "</li>"; }).join("") + "</ol>", plot: (j === e.s.length - 1 && e.after) ? e.after : e.fig || null, dur: 4 + strip(st).length / 26 });
      });
    });
    if (s.when) out.push({ kind: "slide", title: "متى نستخدمه؟", html: "<ul class='ticks'>" + s.when.map(function (w) { return "<li>" + w + "</li>"; }).join("") + "</ul>", dur: 4 + s.when.length * 2.5 });
    out.push({ kind: "card", eyebrow: "انتهى الشرح", title: s.ar, en: "حل التمرين والاختبار القصير في صفحة الدرس", lines: [], dur: 4 });
    return out;
  }
  /* small helpers for the content files */
  function U(list) { return list.map(function (u) { return { l: u[0], f: u[1] }; }); }
  var NONE = U([["—", 1]]), SEC = U([["ms", 1e-3], ["s", 1]]), RADS = U([["rad/s", 1]]), RAD = U([["rad", 1]]);
  function step(id, label, symbol, answer, o) { var x = { id: id, label: label, symbol: symbol, answer: answer, units: (o && o.units) || NONE, unitDefault: (o && o.ud) || 0, hints: (o && o.hints) || [], solution: (o && o.sol) || "", diagnose: (o && o.diag) || [] }; if (o && o.tol) x.tol = o.tol; return x; }
  function choice(id, label, options, o) { return { id: id, label: label, kind: "choice", options: options, hints: (o && o.hints) || [], solution: (o && o.sol) || "" }; }
  function q(text, opts) { return { q: text, options: opts.map(function (o) { return { t: o[0], correct: o[1] === true, type: o[1] === true ? undefined : o[1], why: o[2] }; }) }; }
  CV.ss = { lesson: lesson, fig: fig, step: step, choice: choice, q: q, U: U, NONE: NONE, SEC: SEC, RADS: RADS, RAD: RAD };
})();
