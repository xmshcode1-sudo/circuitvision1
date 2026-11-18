/* Scenes of the MATLAB videos (ml-*.mp4): a MATLAB-like desktop (Editor, Command Window, Figure) built from matlab-data.js,
   i.e. from the scripts and from what they really printed and drew. Rendered by lesson-studio.html + lesson-render.py. */
(function () {
  "use strict";
  var CV = window.CV, M = CV.matlab || {}, V = CV.ssVideo = CV.ssVideo || {}, L = CV.lessons = CV.lessons || {}, H = CV.mlView;
  var esc = H.esc;
  function strip(h) { return String(h).replace(/<[^>]+>/g, ""); }
  var COURSE = { intro: "MATLAB من الصفر", "circuits-1": "MATLAB · الدوائر الكهربائية 1", "signals-systems": "MATLAB · الإشارات والنظم" };
  /* the desktop: editor with line numbers (current section highlighted), command window, optional figure window */
  function desk(m, k, run) {
    var lines = [], start = [], cur = m.sections[k];
    m.sections.forEach(function (s, j) { start[j] = lines.length; lines.push("%% " + s.t); s.code.split("\n").forEach(function (l) { lines.push(l); }); lines.push(""); });
    var a = start[k], b = a + cur.code.split("\n").length, rows = 13;
    var from = Math.max(0, Math.min(a - 1, lines.length - rows)); if (b - from > rows) from = a;
    var view = lines.slice(from, from + rows);
    var code = H.hl(view.join("\n")).split("\n").map(function (l, i) { var n = from + i, on = n >= a && n <= b; return '<div class="ln' + (on ? " on" : "") + '"><span class="no">' + (n + 1) + "</span>" + (l || " ") + "</div>"; }).join("");
    var out = run ? (cur.out || "") : "", outL = out ? out.split("\n").slice(0, 7) : [];
    return '<div class="mld">' +
      '<div class="mle"><div class="mlt"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>Editor — ' + esc(m.id) + '.m</div><div class="mlc">' + code + "</div></div>" +
      '<div class="mlw"><div class="mlt">Command Window</div><pre>' + (run ? ">> " + (cur.project ? "% project section" : "% Run Section (Ctrl+Enter)") + "\n" + esc(outL.join("\n")) + (out.split("\n").length > 7 ? "\n…" : "") + (out ? "" : "(no printed output)") : ">> ") + "</pre></div>" +
      (run && cur.fig ? '<div class="mlf"><div class="mlt">Figure 1</div><img src="../../' + cur.fig + '"></div>' : "") + "</div>";
  }
  function arText(lines) { return H.ar(lines); }
  Object.keys(M).forEach(function (id) {
    var m = M[id], out = [], crs = COURSE[m.course] || "MATLAB";
    L[id] = L[id] || { id: id }; L[id].course = "matlab";
    var lt = m.lesson ? ((CV.mlTitles || {})[m.lesson] || (L[m.lesson] && (L[m.lesson].ar || L[m.lesson].title)) || "") : "";
    out.push({ kind: "card", eyebrow: crs + (m.lesson ? " · " + strip(lt || m.lesson) : " · الحلقة " + m.level), title: m.ar, en: m.title, lines: m.sections.filter(function (s) { return !s.project; }).map(function (s) { return "<bdi dir=\"ltr\">" + esc(s.t) + "</bdi>"; }).slice(0, 6), dur: 6 });
    if (m.course === "intro" && m.level === "1") out.push({ title: "قبل أن نبدأ", text: "<p>نكتب الأوامر في نافذة الأوامر أو في ملف سكربت. كل قسم يبدأ بـ %% ونشغّله وحده بـ Ctrl+Enter.</p><p>كل ما تراه من مخرجات ورسوم في هذا المقطع هو ناتج التشغيل الفعلي للسكربت.</p>", vis: desk(m, 0, false), dur: 7 });
    m.sections.forEach(function (s, k) {
      var t = (s.project ? "مشروع: " : "") + "القسم " + (k + 1) + " من " + m.sections.length;
      out.push({ title: s.project ? "من السكربت إلى مشروع" : esc(s.t), sub: s.project ? esc(s.t) : t, text: arText(s.ar), vis: desk(m, k, false), dur: Math.min(22, 5 + strip(s.ar.join(" ")).length / 16 + s.code.split("\n").length * 0.35) });
      if (s.out || s.fig) out.push({ title: "النتيجة", sub: esc(s.t), text: arText(s.ar.slice(-1)) + (s.fig ? "<p>الرسم في نافذة Figure من تشغيل القسم نفسه.</p>" : "") + (s.out ? "<p>نافذة الأوامر تطبع ما في fprintf: قارن الأرقام بالدرس.</p>" : "") + (s.project ? "<p>غيّر القيم في هذا القسم وشغّله مرة أخرى: هذه بداية مشروعك.</p>" : ""), vis: desk(m, k, true), dur: Math.min(16, 6 + (s.out ? s.out.split("\n").length * 0.6 : 0) + (s.fig ? 3 : 0)) });
    });
    out.push({ kind: "card", eyebrow: "انتهى", title: m.ar, en: "حمّل السكربت " + id + ".m من صفحة MATLAB أو من الدرس، وشغّله بنفسك", lines: [m.checks ? "فيه " + m.checks + " اختبارًا يتأكد من أرقام الدرس" : "شغّله وغيّر القيم"], dur: 4 });
    V[id] = out;
  });
})();
