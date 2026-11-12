/* CircuitVision — Engineering Notebook: the student's own notes, calculations, measurements and corrected mistakes.
   Every line with arithmetic is checked by mathcheck.js (the same checker as the solution workspace). */
(function () {
  "use strict";
  var S = CV.store, M = CV.mathcheck, root = document.getElementById("nb-root"), $ = function (id) { return document.getElementById(id); };
  var TYPES = { note: "ملاحظة", calc: "حساب", meas: "قياس", fix: "خطأ وتصحيح" };
  var flt = { type: "", q: "" }, editing = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function when(t) { try { return new Date(t).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return t; } }
  function lessonName(id) { return CV.lessons && CV.lessons[id] ? CV.lessons[id].ar : id; }
  var lessons = []; CV.courses[0].chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { if (CV.lessons[l.id]) lessons.push([l.id, CV.lessons[l.id].ar, ch.ar]); }); });
  function check(text) {
    var r = M.checkLines(text).filter(function (x) { return x.status !== "skip"; });
    if (!r.length) return "";
    return '<ul class="nb-chk">' + r.map(function (x) { return '<li class="' + x.status + '"><span class="mk">' + (x.status === "ok" ? "✓" : "✗") + '</span><span class="ltr mono">' + esc(x.text) + '</span>' + (x.status === "err" ? ' <span class="nb-why">← <span class="ltr">' + esc(x.left) + '</span> = <span class="ltr">' + CV.num(x.expected) + '</span></span>' : "") + '</li>'; }).join("") + '</ul>';
  }

  function render() {
    var d = S.get(), notes = d.notebook || [];
    var pending = mistakesToDoc(d);
    root.innerHTML = '<header class="nb-head"><span class="eyebrow ltr" style="justify-self:start">Engineering Notebook</span><h1>دفتر المهندس</h1><p>وثّق ملاحظاتك وحساباتك وقياساتك، وخصوصًا أخطاءك وكيف صحّحتها. كل سطر فيه عملية حسابية يُفحص تلقائيًا.</p></header>' +
      '<div class="nb-grid"><section class="card nb-form" id="nb-form"></section><aside class="nb-side">' +
      (pending.length ? '<section class="card nb-mis"><b>من أخطائك الأخيرة</b><p class="muted" style="margin:0;font-size:13px">توثيق الخطأ وتصحيحه من أقوى طرق التعلم.</p><ul>' + pending.map(function (m, i) { return '<li><span>' + esc(m.label) + '</span><button type="button" class="btn btn-ghost btn-sm" data-mis="' + i + '">وثّق التصحيح</button></li>'; }).join("") + '</ul></section>' : "") +
      '<section class="card nb-help"><b>كيف تكتب حسابًا يُفحص؟</b><p class="muted" style="margin:0;font-size:13px">سطر لكل خطوة، بعلامة =، مثل:</p><pre class="ltr mono">R = 12 + 6∥3 = 14 Ω\ni = 28 / 14 = 2 A</pre><p class="muted" style="margin:0;font-size:13px">يفهم البادئات (mA، kΩ) و ∥ للتوازي. الأسطر التي فيها رموز بلا أرقام لا تُفحص.</p></section></aside></div>' +
      '<div class="nb-bar"><div class="field"><label for="nb-ft">النوع</label><select class="select" id="nb-ft"><option value="">الكل</option>' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + (flt.type === k ? " selected" : "") + '>' + TYPES[k] + '</option>'; }).join("") + '</select></div><div class="field"><label for="nb-q">بحث</label><input class="input" id="nb-q" value="' + esc(flt.q) + '"></div><span class="muted" id="nb-count"></span></div>' +
      '<div id="nb-list" class="nb-list"></div>';
    form(editing);
    $("nb-ft").addEventListener("change", function () { flt.type = this.value; list(); });
    $("nb-q").addEventListener("input", function () { flt.q = this.value; list(); });
    root.querySelectorAll("[data-mis]").forEach(function (b) { b.addEventListener("click", function () { var m = pending[+b.dataset.mis]; form({ type: "fix", src: m.src, lesson: m.lesson, title: m.title, body: "ما الخطأ؟\n" + m.why + "\n\nلماذا حدث؟\n\nالتصحيح:\n" }); $("nb-form").scrollIntoView({ behavior: "smooth", block: "start" }); }); });
    list();
  }
  function mistakesToDoc(d) {
    var seen = {}, out = [], documented = {};
    (d.notebook || []).forEach(function (n) { if (n.type === "fix" && n.src) documented[n.src] = 1; });
    (d.mistakes || []).forEach(function (m) {
      var key = m.lessonId + "|" + m.stepId; if (seen[key] || documented[key] || out.length >= 5) return; seen[key] = 1;
      var lid = String(m.lessonId).replace(/^quiz:/, "").replace(/:\d+$/, ""), t = CV.feedback.TYPES[m.type];
      var place = CV.lessons[lid] ? lessonName(lid) : /^proj-/.test(lid) && CV.projects && CV.projects[lid.slice(5)] ? CV.projects[lid.slice(5)].ar : lid === "generator" || lid === "challenge" || /^bank-gen/.test(lid) ? "تمرين مولّد" : lid;
      out.push({ src: key, lesson: CV.lessons[lid] ? lid : "", title: (t ? t.ar : "خطأ") + " في " + place, label: (t ? t.ar : "خطأ") + " · " + place, why: t ? "نوع الخطأ حسب Smart Feedback: " + t.ar + "." : "" });
    });
    return out;
  }
  function form(n) {
    n = n || {};
    var box = $("nb-form");
    box.innerHTML = '<b>' + (n.id ? "تعديل الإدخال" : "إدخال جديد") + '</b><form id="nf" novalidate>' +
      '<div class="nb-row"><div class="field"><label for="nf-type">النوع</label><select class="select" id="nf-type">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + ((n.type || "note") === k ? " selected" : "") + '>' + TYPES[k] + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label for="nf-lesson">الدرس (اختياري)</label><select class="select" id="nf-lesson"><option value="">—</option>' + lessons.map(function (l) { return '<option value="' + l[0] + '"' + (n.lesson === l[0] ? " selected" : "") + '>' + l[1] + '</option>'; }).join("") + '</select></div></div>' +
      '<div class="field"><label for="nf-title">العنوان</label><input class="input" id="nf-title" maxlength="120" value="' + esc(n.title || "") + '"></div>' +
      '<div class="field"><label for="nf-body">المحتوى</label><textarea class="input nb-body" id="nf-body" rows="8" dir="auto">' + esc(n.body || "") + '</textarea></div><div id="nf-chk"></div>' +
      '<p class="cl-err" id="nf-err" hidden role="alert"></p><div class="pb-actions"><button type="submit" class="btn btn-primary btn-sm">' + (n.id ? "احفظ التعديل" : "احفظ في الدفتر") + '</button>' + (n.id || n.title ? '<button type="button" class="btn btn-ghost btn-sm" id="nf-cancel">إلغاء</button>' : "") + '</div></form>';
    var body = $("nf-body");
    function live() { body.value = M.prettify ? keepCaret(body, M.prettify) : body.value; $("nf-chk").innerHTML = check(body.value); }
    body.addEventListener("input", live); live();
    if ($("nf-cancel")) $("nf-cancel").addEventListener("click", function () { editing = null; form(null); });
    $("nf").addEventListener("submit", function (e) {
      e.preventDefault();
      var t = $("nf-title").value.trim(), b = body.value.trim();
      if (!t || !b) { $("nf-err").textContent = "اكتب عنوانًا ومحتوى."; $("nf-err").hidden = false; return; }
      S.saveNote({ id: n.id, title: t, type: $("nf-type").value, lesson: $("nf-lesson").value, body: b, src: n.src });
      editing = null; render();
    });
  }
  function keepCaret(el, f) { var v = el.value, nv = f(v); if (nv === v) return v; var pos = el.selectionStart - (v.length - nv.length); el.value = nv; try { el.setSelectionRange(pos, pos); } catch (e) {} return nv; }
  function list() {
    var notes = (S.get().notebook || []).filter(function (n) { return (!flt.type || n.type === flt.type) && (!flt.q || (n.title + " " + n.body).toLowerCase().indexOf(flt.q.toLowerCase()) > -1); });
    $("nb-count").textContent = notes.length + " إدخال";
    $("nb-list").innerHTML = notes.length ? notes.map(function (n) {
      return '<article class="card nb-item" data-id="' + n.id + '"><header><span class="chip chip-src">' + TYPES[n.type] + '</span><b>' + esc(n.title) + '</b><span class="muted">' + when(n.updatedAt) + '</span></header>' +
        (n.lesson ? '<a class="lk" href="lesson.html#' + n.lesson + '">' + esc(lessonName(n.lesson)) + '</a>' : "") +
        '<div class="nb-text" dir="auto">' + esc(n.body).replace(/\n/g, "<br>") + '</div>' + check(n.body) +
        '<div class="pb-actions"><button type="button" class="btn btn-ghost btn-sm" data-ed>تعديل</button><button type="button" class="btn btn-ghost btn-sm danger" data-del>احذف</button></div></article>';
    }).join("") : '<p class="muted">' + ((S.get().notebook || []).length ? "لا توجد إدخالات بهذا البحث." : "دفترك فارغ. ابدأ بأول ملاحظة أو حساب.") + '</p>';
    $("nb-list").querySelectorAll(".nb-item").forEach(function (a) {
      var id = a.dataset.id, n = S.get().notebook.filter(function (x) { return x.id === id; })[0];
      a.querySelector("[data-ed]").addEventListener("click", function () { editing = n; form(n); $("nb-form").scrollIntoView({ behavior: "smooth", block: "start" }); });
      var del = a.querySelector("[data-del]");
      del.addEventListener("click", function () { if (!del.dataset.sure) { del.dataset.sure = 1; del.textContent = "تأكيد الحذف؟"; setTimeout(function () { if (del.isConnected) { delete del.dataset.sure; del.textContent = "احذف"; } }, 4000); return; } S.deleteNote(id); list(); });
    });
  }
  render();
})();
