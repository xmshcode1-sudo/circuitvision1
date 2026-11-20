/* Scenes of the Circuits 1 lesson videos (c1-*.mp4), built from the lessons themselves (c1-*.js), so the video says exactly what
   the lesson page says: objectives, the idea with the lesson's own circuit drawings, the laws, every worked example step by step,
   and the real-world note. Rendered by lesson-studio.html + lesson-render.py. */
(function () {
  "use strict";
  var CV = window.CV, V = CV.ssVideo = CV.ssVideo || {}, L = CV.lessons;
  var CH = { variables: "الفصل 1: متغيرات الدائرة", elements: "الفصل 2: عناصر الدائرة", resistive: "الفصل 3: دوائر المقاومات", techniques: "الفصل 4: طرق تحليل الدوائر", sinusoidal: "الفصل 5: الحالة الجيبية المستقرة", power: "الفصل 6: القدرة في الحالة الجيبية" };
  function strip(h) { return String(h).replace(/<[^>]+>/g, ""); }
  function dur(h, b) { return Math.min(18, (b || 4) + strip(h).length / 18); }
  function dom(h) { var d = document.createElement("div"); d.innerHTML = h; return d; }
  function board(list, cur) { return "<div class='bd'>" + list.map(function (x, k) { return "<div class='bd-i" + (k === cur ? " now" : "") + "'>" + x + "</div>"; }).join("") + "</div>"; }
  Object.keys(L).filter(function (id) { return /^c1-/.test(id) && L[id].sections; }).forEach(function (id) {
    var l = L[id], out = [], sec = {}; l.sections.forEach(function (s) { sec[s.id] = s; });
    var ch = CH[id.split("-")[1]] || "";
    var allFigs = []; l.sections.forEach(function (s) { [].forEach.call(dom(s.html).querySelectorAll(".lfig"), function (f) { allFigs.push(f.outerHTML); }); });
    var lawsHtml = sec.laws ? [].map.call(dom(sec.laws.html).querySelectorAll(".eq"), function (e) { return e.outerHTML; }).slice(0, 6) : [];
    var lawsB = lawsHtml.length ? "<div class='bd eqb'>" + lawsHtml.join("") + "</div>" : "";
    out.push({ kind: "card", eyebrow: "الدوائر الكهربائية 1 · " + ch, title: l.ar, en: l.en, lines: (l.objectives || []).slice(0, 5), dur: 6 });
    if (sec.concept) {
      var d = dom(sec.concept.html), ps = [].map.call(d.querySelectorAll("p, li"), function (p) { return p.innerHTML; }).filter(function (t) { return strip(t).trim().length > 10; });
      var cf = [].map.call(d.querySelectorAll(".lfig"), function (f) { return f.outerHTML; });
      ps.slice(0, 6).forEach(function (p, i) { out.push({ title: i ? "الفكرة (تابع)" : "الفكرة", text: "<p>" + p + "</p>", vis: cf[i] || cf[0] || allFigs[0] || lawsB, dur: dur(p, 4) }); });
    }
    if (lawsB) out.push({ title: "القوانين", sub: lawsHtml.length + " علاقات", text: "<p>هذه العلاقات التي يقوم عليها الدرس، وتجدها كاملة في صفحة الدرس.</p>", vis: lawsB, dur: 4 + lawsHtml.length * 2.5 });
    if (false && sec.when) { var w = [].map.call(dom(sec.when.html).querySelectorAll("li"), function (x) { return x.innerHTML; }); if (w.length) out.push({ title: "متى نستخدمه؟", text: "<ul>" + w.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>", vis: allFigs[0] || lawsB, dur: dur(w.join(" "), 4) }); }
    if (sec.example) {
      var ex = dom(sec.example.html), n = 0, q = null, fg = null;
      [].forEach.call(ex.children, function (el) {
        if (el.classList.contains("lfig") || el.querySelector && el.querySelector(".lfig") && el.tagName !== "OL") { fg = el.classList.contains("lfig") ? el.outerHTML : el.querySelector(".lfig").outerHTML; if (q) out[out.length - 1].vis = fg; return; }
        if (el.tagName === "P" && strip(el.innerHTML).trim()) { n++; q = el.innerHTML; fg = null; out.push({ title: "مثال " + n, text: "<p>" + q + "</p>", vis: board(["<p>" + q + "</p>"], 0), dur: dur(q, 5) }); return; }
        if (el.tagName === "OL" || el.tagName === "UL") {
          var st = [].map.call(el.children, function (li) { return li.innerHTML; });
          st.forEach(function (s, j) {
            var from = Math.max(0, j - 4);
            out.push({ title: "مثال " + Math.max(n, 1), sub: "الخطوة " + (j + 1) + " من " + st.length, text: "<p>" + s + "</p>",
              vis: fg || board(st.slice(from, j + 1).map(function (x, k) { return "<div class='n'>" + (from + k + 1) + "</div>" + x; }), j - from), dur: dur(s, 4) });
          });
        }
      });
    }
    if (false && sec.realworld) out.push({ title: "في الواقع", text: sec.realworld.html, vis: allFigs[allFigs.length - 1] || lawsB, dur: dur(sec.realworld.html, 4) });
    out.push({ kind: "card", eyebrow: "انتهى الدرس", title: l.ar, en: "حل التمرين والاختبار في بنك الأسئلة", lines: ["وجرّب سكربت MATLAB الخاص بالدرس"], dur: 4 });
    V[id] = out;
  });
})();
