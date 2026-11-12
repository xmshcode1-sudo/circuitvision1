/* CircuitVision — My Portfolio: an engineering record built only from the student's real activity
   (completed lessons, projects with their design values and measurements, challenge scores, notebook). */
(function () {
  "use strict";
  var S = CV.store, root = document.getElementById("pf-root"), $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function plain(h) { var d = document.createElement("div"); d.innerHTML = String(h || ""); return d.textContent.replace(/\s+/g, " ").trim(); }
  function day(t) { try { return new Date(t).toLocaleDateString("ar-SA-u-nu-latn", { dateStyle: "medium" }); } catch (e) { return t; } }
  var MODES = { time: "سباق الوقت", ten: "10 أسئلة", daily: "تحدي اليوم" }, LEVELS = { dc: "أساسيات DC", req: "المقاومة المكافئة", an: "طرق التحليل", th: "ثيفنن ونورتن", ac: "التيار المتردد", pw: "القدرة في AC", mix: "شامل" };

  function data() {
    var d = S.get(), c1 = CV.courses[0];
    var chapters = c1.chapters.map(function (ch) { var n = ch.lessons.filter(function (l) { return d.lessons[l.id] && d.lessons[l.id].completedAt; }).length; return { ar: ch.ar, en: ch.en, done: n, total: ch.lessons.length }; });
    var projects = Object.keys(d.projects).filter(function (k) { return d.projects[k].completedAt && CV.projects && CV.projects[k]; }).map(function (k) {
      var p = CV.projects[k], st = d.projects[k], v = {};
      p.sim.controls.forEach(function (c) { v[c.id] = st.design && st.design[c.id] !== undefined ? st.design[c.id] : c.def; });
      var r = p.sim.compute(v), measured = st.measured && Object.keys(st.measured).some(function (q) { return st.measured[q] != null; });
      return { id: k, ar: p.ar, en: p.en, at: st.completedAt, design: (r.design || []).map(plain), checks: r.checks ? r.checks.filter(function (c) { return c.ok; }).length + "/" + r.checks.length : "", measured: measured, notes: st.notes || "" };
    });
    var best = (d.challenges && d.challenges.best) || {};
    var challenges = Object.keys(best).map(function (k) { var a = k.split(":"); return { mode: MODES[a[0]] || a[0], level: LEVELS[a[1]] || a[1], score: best[k].score, correct: best[k].correct }; }).sort(function (a, b) { return b.score - a.score; });
    var mistakes = {}; (d.mistakes || []).forEach(function (m) { mistakes[m.type] = (mistakes[m.type] || 0) + 1; });
    var fixes = (d.notebook || []).filter(function (n) { return n.type === "fix"; }).length;
    var lessonsDone = chapters.reduce(function (a, c) { return a + c.done; }, 0), total = chapters.reduce(function (a, c) { return a + c.total; }, 0);
    return { d: d, chapters: chapters, projects: projects, challenges: challenges, mistakes: mistakes, fixes: fixes, notes: (d.notebook || []).length, lessonsDone: lessonsDone, total: total, solved: Object.keys(d.questions || {}).length };
  }

  function text(x) {
    var pf = x.d.portfolio || {}, name = x.d.profile && x.d.profile.name, L = [];
    L.push((name || "طالب") + (pf.headline ? " — " + pf.headline : ""));
    if (pf.about) L.push(pf.about);
    L.push("");
    L.push("Circuits 1 (CircuitVision): " + x.lessonsDone + "/" + x.total + " درسًا مكتملًا");
    x.chapters.forEach(function (c) { if (c.done) L.push("- " + c.ar + " (" + c.en + "): " + c.done + "/" + c.total); });
    if (x.projects.length) { L.push(""); L.push("مشاريع منجزة:"); x.projects.forEach(function (p) { L.push("- " + p.ar + " (" + p.en + ")" + (p.design.length ? ": " + p.design.join("، ") : "") + (p.measured ? " — بُنيت وقيست على دائرة حقيقية" : " — تصميم ومحاكاة") ); }); }
    if (x.challenges.length) { L.push(""); L.push("أفضل نتائج التحديات:"); x.challenges.slice(0, 5).forEach(function (c) { L.push("- " + c.mode + " · " + c.level + ": " + c.score + " نقطة"); }); }
    L.push(""); L.push("أسئلة محلولة في المولّد والبنك: " + x.solved + " · إدخالات دفتر المهندس: " + x.notes + " (منها " + x.fixes + " توثيق خطأ وتصحيحه)");
    (pf.links || []).forEach(function (l) { if (l.url) L.push((l.label || "رابط") + ": " + l.url); });
    L.push(""); L.push("هذا الملف مولّد من نشاطي الفعلي في منصة CircuitVision.");
    return L.join("\n");
  }

  function render() {
    var x = data(), pf = x.d.portfolio || {}, name = x.d.profile && x.d.profile.name;
    root.innerHTML = '<header class="pf-head"><span class="eyebrow ltr" style="justify-self:start">My Portfolio</span><h1>ملف الإنجاز</h1><p>ملف هندسي يُبنى من نشاطك الحقيقي فقط: الدروس المكتملة، المشاريع بقيم تصميمك وقياساتك، نتائج التحديات، ودفترك. استخدمه في السيرة الذاتية أو التدريب التعاوني.</p></header>' +
      '<section class="card pf-me"><div class="pf-id"><b class="pf-name">' + esc(name || "اكتب اسمك في الإعدادات") + '</b>' + (name ? "" : ' <a class="lk" href="dashboard.html#prefs">الإعدادات</a>') + '</div>' +
      '<form id="pf-f" class="pf-form" novalidate><div class="field"><label for="pf-h">عنوان قصير</label><input class="input" id="pf-h" maxlength="90" placeholder="مثال: طالب هندسة كهربائية — السنة الثانية" value="' + esc(pf.headline || "") + '"></div>' +
      '<div class="field"><label for="pf-a">نبذة</label><textarea class="input" id="pf-a" rows="3" maxlength="600" placeholder="ماذا تحب في الهندسة؟ ما الذي تبحث عنه؟">' + esc(pf.about || "") + '</textarea></div>' +
      '<div class="pf-links">' + [0, 1].map(function (i) { var l = (pf.links || [])[i] || {}; return '<div class="field"><label for="pf-l' + i + '">رابط ' + (i + 1) + ' (اختياري)</label><div class="pb-row"><input class="input" id="pf-ln' + i + '" placeholder="LinkedIn" value="' + esc(l.label || "") + '" style="max-width:120px"><input class="input" id="pf-l' + i + '" dir="ltr" placeholder="https://" value="' + esc(l.url || "") + '"></div></div>'; }).join("") + '</div>' +
      '<p class="muted" id="pf-st" style="margin:0;font-size:13px" aria-live="polite"></p></form></section>' +
      '<div class="pf-stats">' + [[x.lessonsDone + "/" + x.total, "دروس Circuits 1"], [x.projects.length, "مشاريع منجزة"], [x.solved, "أسئلة محلولة"], [x.notes, "إدخالات الدفتر"]].map(function (s) { return '<div class="card"><b class="mono">' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join("") + '</div>' +
      '<section class="card pf-sec"><h2>المهارات حسب الفصل</h2><div class="pf-bars">' + x.chapters.map(function (c) { var pct = Math.round(c.done / c.total * 100); return '<div class="pf-bar"><span>' + c.ar + '</span><div class="pf-track" role="img" aria-label="' + c.done + ' من ' + c.total + '"><i style="width:' + pct + '%"></i></div><span class="mono">' + c.done + '/' + c.total + '</span></div>'; }).join("") + '</div><p class="muted" style="margin:0;font-size:13px">الدرس يُحتسب مكتملًا بعد حل تمرينه وأسئلة اختباره.</p></section>' +
      '<section class="card pf-sec"><h2>المشاريع</h2>' + (x.projects.length ? x.projects.map(function (p) { return '<article class="pf-proj"><header><b>' + esc(p.ar) + '</b><span class="ltr en">' + esc(p.en) + '</span><span class="muted">' + day(p.at) + '</span></header><p>' + esc(p.design.join(" · ")) + '</p><div class="pf-tags"><span class="chip chip-ok">شروط المحاكاة ' + p.checks + '</span>' + (p.measured ? '<span class="chip chip-src">قيست على دائرة حقيقية</span>' : '<span class="chip chip-plan">بدون قياس حقيقي</span>') + '</div>' + (p.notes ? '<p class="muted">' + esc(p.notes.slice(0, 220)) + (p.notes.length > 220 ? "…" : "") + '</p>' : "") + '</article>'; }).join("") : '<p class="muted">لا توجد مشاريع منجزة بعد. <a class="lk" href="academy.html">ابدأ مشروعًا</a></p>') + '</section>' +
      '<div class="pf-cols"><section class="card pf-sec"><h2>أفضل نتائج التحديات</h2>' + (x.challenges.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التحدي</th><th>المستوى</th><th>النقاط</th></tr></thead><tbody>' + x.challenges.slice(0, 6).map(function (c) { return '<tr><td>' + c.mode + '</td><td>' + c.level + '</td><td class="mono">' + c.score + '</td></tr>'; }).join("") + '</tbody></table></div>' : '<p class="muted">لم تخض تحديًا بعد. <a class="lk" href="challenges.html">التحديات</a></p>') + '</section>' +
      '<section class="card pf-sec"><h2>التعلم من الأخطاء</h2>' + (Object.keys(x.mistakes).length ? '<ul class="pf-mis">' + Object.keys(x.mistakes).sort(function (a, b) { return x.mistakes[b] - x.mistakes[a]; }).map(function (t) { return '<li><span>' + (CV.feedback.TYPES[t] ? CV.feedback.TYPES[t].ar : "غير مصنف") + '</span><span class="mono">' + x.mistakes[t] + '</span></li>'; }).join("") + '</ul><p class="muted" style="margin:0;font-size:13px">وثّقت ' + x.fixes + ' تصحيحًا في <a class="lk" href="notebook.html">دفتر المهندس</a>.</p>' : '<p class="muted">لا أخطاء مسجلة بعد.</p>') + '</section></div>' +
      '<section class="card pf-sec"><h2>نسخة نصية للسيرة الذاتية</h2><pre class="pf-text" id="pf-text" dir="rtl"></pre><div class="pb-actions"><button type="button" class="btn btn-primary btn-sm" id="pf-copy">نسخ</button><span class="muted" id="pf-cst" aria-live="polite"></span></div>' +
      '<p class="muted" style="margin:0;font-size:13px">الملف خاص بك ومحفوظ في متصفحك' + (CV.cloud && CV.cloud.configured() ? " ويُزامَن مع حسابك" : "") + '. صفحة عامة قابلة للمشاركة لم تُبنَ بعد.</p></section>';
    $("pf-text").textContent = text(x);
    var t = 0;
    $("pf-f").addEventListener("input", function () {
      clearTimeout(t); t = setTimeout(function () {
        var links = [0, 1].map(function (i) { return { label: $("pf-ln" + i).value.trim(), url: $("pf-l" + i).value.trim() }; }).filter(function (l) { return l.url; });
        var bad = links.filter(function (l) { return !/^https:\/\/\S+\.\S+/.test(l.url); });
        $("pf-st").textContent = bad.length ? "الروابط يجب أن تبدأ بـ https://" : "✓ حُفظ";
        S.savePortfolio({ headline: $("pf-h").value.trim(), about: $("pf-a").value.trim(), links: links.filter(function (l) { return bad.indexOf(l) < 0; }) });
        $("pf-text").textContent = text(data());
      }, 400);
    });
    $("pf-copy").addEventListener("click", function () {
      var st = $("pf-cst"), el = $("pf-text");
      function fb() { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = "حدّدت النص؛ انسخه يدويًا."; }
      try { navigator.clipboard.writeText(el.textContent).then(function () { st.textContent = "✓ نُسخ"; }, fb); } catch (e) { fb(); }
    });
  }
  render();
})();
