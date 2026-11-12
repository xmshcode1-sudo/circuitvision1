/* CircuitVision — Student Club: accounts, project showcase, comments, likes, leaderboard, progress sync. */
(function () {
  "use strict";
  var S = CV.store, C = CV.cloud, root = document.getElementById("club-root"), tab = "feed";
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function when(t) { try { return new Date(t).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return t; } }
  var MODES = { time: "سباق الوقت", ten: "10 أسئلة", daily: "تحدي اليوم" }, LEVELS = { dc: "أساسيات DC", req: "المقاومة المكافئة", an: "طرق التحليل", th: "ثيفنن ونورتن", ac: "التيار المتردد", pw: "القدرة في AC", mix: "شامل" };
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  function head() { return '<header class="cl-head"><span class="eyebrow ltr" style="justify-self:start">Student Club</span><h1>النادي الطلابي</h1><p>اعرض مشاريعك، وعلّق على مشاريع زملائك، ونافس في لوحة صدارة التحديات. حسابك يحفظ تقدمك ويزامنه بين أجهزتك.</p></header>'; }

  function notConfigured() {
    root.innerHTML = head() + '<div class="pending card"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><p><b>النادي غير مفعّل على هذه النسخة</b>يحتاج حسابات حقيقية (Supabase). بعد الإعداد تعمل هنا: الحسابات، معرض المشاريع، التعليقات والإعجابات، لوحة صدارة التحديات، ومزامنة التقدم بين الأجهزة.</p></div>' +
      '<details class="card cl-setup"><summary>خطوات التفعيل (للمؤسس)</summary><ol><li>أنشئ مشروعًا مجانيًا في supabase.com.</li><li>من SQL Editor شغّل الملف <span class="ltr mono">supabase/schema.sql</span>.</li><li>Authentication → Providers: فعّل Email.</li><li>من Project Settings → API انسخ Project URL و anon key إلى <span class="ltr mono">js/config.js</span>.</li><li>انشر الموقع على Vercel.</li></ol></details>';
  }

  function auth() {
    root.innerHTML = head() + '<section class="card cl-auth"><div class="cl-tabs" role="tablist"><button type="button" role="tab" class="tl on" data-m="in" aria-selected="true">تسجيل الدخول</button><button type="button" role="tab" class="tl" data-m="up" aria-selected="false">حساب جديد</button></div>' +
      '<form id="auth" novalidate><div class="field" id="f-name-w" hidden><label for="f-name">اسمك في النادي</label><input class="input" id="f-name" autocomplete="nickname" maxlength="40"></div>' +
      '<div class="field"><label for="f-email">البريد الإلكتروني</label><input class="input" id="f-email" type="email" autocomplete="email" dir="ltr"></div>' +
      '<div class="field"><label for="f-pw">كلمة المرور</label><input class="input" id="f-pw" type="password" autocomplete="current-password" dir="ltr" minlength="6"></div>' +
      '<p class="cl-err" id="auth-err" hidden role="alert"></p><button type="submit" class="btn btn-primary" id="auth-go">دخول</button></form>' +
      '<p class="muted" style="font-size:13px;margin:0">بدون حساب يبقى تقدمك محفوظًا في هذا المتصفح فقط.</p></section>';
    var mode = "in";
    root.querySelectorAll("[data-m]").forEach(function (b) { b.addEventListener("click", function () { mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); }); $("f-name-w").hidden = mode !== "up"; $("auth-go").textContent = mode === "up" ? "أنشئ الحساب" : "دخول"; $("f-pw").autocomplete = mode === "up" ? "new-password" : "current-password"; }); });
    var prof = S.get().profile; if (prof && prof.name) $("f-name").value = prof.name;
    $("auth").addEventListener("submit", function (e) {
      e.preventDefault();
      var em = $("f-email").value.trim(), pw = $("f-pw").value, nm = $("f-name").value.trim(), er = $("auth-err");
      er.hidden = true;
      if (!/^\S+@\S+\.\S+$/.test(em)) { er.textContent = "اكتب بريدًا صحيحًا."; er.hidden = false; return; }
      if (pw.length < 6) { er.textContent = "كلمة المرور 6 أحرف على الأقل."; er.hidden = false; return; }
      if (mode === "up" && nm.length < 2) { er.textContent = "اكتب اسمًا من حرفين على الأقل."; er.hidden = false; return; }
      $("auth-go").disabled = true;
      (mode === "up" ? C.signUp(em, pw, nm) : C.signIn(em, pw)).then(function (r) {
        if (r && r.needsConfirm) { er.textContent = "أرسلنا رسالة تأكيد إلى بريدك. أكّدها ثم سجّل الدخول."; er.hidden = false; $("auth-go").disabled = false; return; }
        render();
      }, function (x) { er.textContent = x.message; er.hidden = false; $("auth-go").disabled = false; });
    });
  }

  function shell() {
    root.innerHTML = head() + '<div class="cl-bar card"><span>أهلًا، <b>' + esc(C.name()) + '</b></span><span style="flex:1"></span><button type="button" class="btn btn-ghost btn-sm" id="out">تسجيل الخروج</button></div>' +
      '<div class="cl-tabs" role="tablist">' + [["feed", "معرض المشاريع"], ["board", "لوحة الصدارة"], ["me", "حسابي والمزامنة"]].map(function (t) { return '<button type="button" role="tab" class="tl' + (t[0] === tab ? " on" : "") + '" data-t="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>'; }).join("") + '</div><div id="cl-body"></div>';
    $("out").addEventListener("click", function () { C.signOut().then(render); });
    root.querySelectorAll("[data-t]").forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.t; shell(); }); });
    ({ feed: feed, board: board, me: me })[tab]();
  }

  /* ---------- feed ---------- */
  function feed() {
    var body = $("cl-body"), done = Object.keys(S.get().projects).filter(function (k) { return S.get().projects[k].completedAt && CV.projects && CV.projects[k]; });
    body.innerHTML = '<section class="card cl-new"><b>شارك مشروعًا</b><form id="np" novalidate>' +
      '<div class="field"><label for="np-proj">المشروع</label><select class="select" id="np-proj"><option value="">بدون ربط بمشروع</option>' + done.map(function (k) { return '<option value="' + k + '">' + CV.projects[k].ar + '</option>'; }).join("") + '</select></div>' +
      '<div class="field"><label for="np-t">العنوان</label><input class="input" id="np-t" maxlength="120"></div>' +
      '<div class="field"><label for="np-b">ماذا بنيت؟ وماذا تعلمت؟ (يمكنك لصق تقرير المشروع)</label><textarea class="input" id="np-b" rows="4" maxlength="4000"></textarea></div>' +
      '<p class="cl-err" id="np-err" hidden role="alert"></p><div class="pb-actions"><button type="submit" class="btn btn-primary btn-sm">انشر</button></div></form>' +
      (done.length ? "" : '<p class="muted" style="margin:0;font-size:13px">المشاريع التي تنجزها في <a class="lk" href="academy.html">أكاديمية المشاريع</a> تظهر هنا لتربط منشورك بها.</p>') + '</section><div id="posts" class="cl-posts"><p class="muted">جارٍ التحميل…</p></div>';
    $("np-proj").addEventListener("change", function () { var p = CV.projects[this.value]; if (p && !$("np-t").value) $("np-t").value = p.ar; });
    $("np").addEventListener("submit", function (e) {
      e.preventDefault(); var t = $("np-t").value.trim(), b = $("np-b").value.trim(), er = $("np-err"); er.hidden = true;
      if (t.length < 3 || !b) { er.textContent = "اكتب عنوانًا (3 أحرف على الأقل) ووصفًا."; er.hidden = false; return; }
      C.addPost({ project_id: $("np-proj").value, title: t, body: b }).then(function () { $("np-t").value = ""; $("np-b").value = ""; loadPosts(); }, function (x) { er.textContent = x.message; er.hidden = false; });
    });
    loadPosts();
  }
  function loadPosts() {
    var box = $("posts");
    C.posts().then(function (posts) {
      var ids = posts.map(function (p) { return p.id; });
      return Promise.all([C.comments(ids), C.likes(ids)]).then(function (x) { drawPosts(posts, x[0], x[1]); });
    }).catch(function (x) { box.innerHTML = '<p class="cl-err">' + esc(x.message) + '</p>'; });
  }
  function drawPosts(posts, comments, likes) {
    var box = $("posts"), me = C.user().id;
    if (!posts.length) { box.innerHTML = '<p class="muted">لا توجد منشورات بعد. كن أول من يشارك مشروعًا.</p>'; return; }
    box.innerHTML = posts.map(function (p) {
      var cs = comments.filter(function (c) { return c.post_id === p.id; }), ls = likes.filter(function (l) { return l.post_id === p.id; }), mine = ls.some(function (l) { return l.user_id === me; });
      var proj = p.project_id && CV.projects && CV.projects[p.project_id];
      return '<article class="card cl-post" data-id="' + p.id + '"><header><b>' + esc(p.title) + '</b><span class="muted">' + esc(p.author ? p.author.display_name : "") + ' · ' + when(p.created_at) + '</span></header>' +
        (proj ? '<a class="chip chip-src" href="academy.html#' + p.project_id + '">مشروع: ' + proj.ar + '</a>' : "") +
        '<p class="cl-text">' + esc(p.body).replace(/\n/g, "<br>") + '</p>' +
        '<div class="cl-act"><button type="button" class="tl' + (mine ? " on" : "") + '" data-like="' + (mine ? 0 : 1) + '" aria-pressed="' + mine + '">♥ ' + ls.length + '</button><span class="muted">' + cs.length + ' تعليق</span>' + (p.user_id === me ? '<span style="flex:1"></span><button type="button" class="btn btn-ghost btn-sm danger" data-del>احذف</button>' : "") + '</div>' +
        '<div class="cl-cm">' + cs.map(function (c) { return '<p><b>' + esc(c.author ? c.author.display_name : "") + ':</b> ' + esc(c.body) + '</p>'; }).join("") +
        '<form class="cl-cf" novalidate><input class="input" maxlength="1000" placeholder="اكتب تعليقًا…" aria-label="تعليق"><button type="submit" class="btn btn-ghost btn-sm">علّق</button></form></div></article>';
    }).join("");
    box.querySelectorAll(".cl-post").forEach(function (a) {
      var id = +a.dataset.id;
      a.querySelector("[data-like]").addEventListener("click", function () { C.like(id, this.dataset.like === "1").then(loadPosts, loadPosts); });
      var d = a.querySelector("[data-del]");
      if (d) d.addEventListener("click", function () {
        if (d.dataset.sure) { C.deletePost(id).then(loadPosts); return; }
        d.dataset.sure = "1"; d.textContent = "تأكيد الحذف؟";
        setTimeout(function () { if (d.isConnected) { delete d.dataset.sure; d.textContent = "احذف"; } }, 4000);
      });
      a.querySelector(".cl-cf").addEventListener("submit", function (e) { e.preventDefault(); var i = this.querySelector("input"), t = i.value.trim(); if (!t) return; C.addComment(id, t).then(loadPosts); });
    });
  }

  /* ---------- leaderboard ---------- */
  function board() {
    var body = $("cl-body");
    body.innerHTML = '<section class="card cl-lb"><div class="cl-row"><div class="field"><label for="lb-m">التحدي</label><select class="select" id="lb-m">' + Object.keys(MODES).map(function (k) { return '<option value="' + k + '">' + MODES[k] + '</option>'; }).join("") + '</select></div>' +
      '<div class="field" id="lb-lw"><label for="lb-l">المستوى</label><select class="select" id="lb-l">' + Object.keys(LEVELS).map(function (k) { return '<option value="' + k + '">' + LEVELS[k] + '</option>'; }).join("") + '</select></div></div><div id="lb"></div>' +
      '<p class="muted" style="font-size:13px;margin:0">النقاط تُحسب في متصفح الطالب ثم تُرسل، لذلك هي نتائج مُبلَّغ عنها ذاتيًا. أفضل نتيجة لكل طالب فقط. <a class="lk" href="challenges.html">ابدأ تحديًا</a></p></section>';
    function load() {
      var m = $("lb-m").value; $("lb-lw").hidden = m === "daily";
      $("lb").innerHTML = '<p class="muted">جارٍ التحميل…</p>';
      C.leaderboard(m, $("lb-l").value, today()).then(function (rows) {
        var me = C.user().id;
        $("lb").innerHTML = rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>الطالب</th><th>النقاط</th><th>الصحيحة</th><th>التاريخ</th></tr></thead><tbody>' + rows.map(function (r, i) {
          return '<tr' + (r.user_id === me ? ' class="me"' : "") + '><td class="mono">' + (i + 1) + '</td><td>' + esc(r.author ? r.author.display_name : "") + '</td><td class="mono">' + r.score + '</td><td class="mono">' + r.correct + '/' + r.total + '</td><td class="ltr">' + esc(r.day) + '</td></tr>';
        }).join("") + '</tbody></table></div>' : '<p class="muted">لا توجد نتائج بعد' + (m === "daily" ? " لتحدي اليوم" : " في هذا المستوى") + '.</p>';
      }, function (x) { $("lb").innerHTML = '<p class="cl-err">' + esc(x.message) + '</p>'; });
    }
    $("lb-m").addEventListener("change", load); $("lb-l").addEventListener("change", load); load();
  }

  /* ---------- account & sync ---------- */
  function me() {
    var body = $("cl-body"), local = S.get();
    body.innerHTML = '<section class="card cl-me"><b>مزامنة التقدم</b><div id="sync"><p class="muted">جارٍ فحص بيانات حسابك…</p></div></section>';
    C.pullProgress().then(function (cloud) {
      var lc = (Object.keys(local.lessons).length) + " درس، " + Object.keys(local.practice).length + " تمرين، " + Object.keys(local.projects).filter(function (k) { return local.projects[k].completedAt; }).length + " مشروع";
      var h = '<dl class="rd"><div class="rw"><dt>هذا الجهاز</dt><dd>' + lc + (local.savedAt ? " · " + when(local.savedAt) : "") + '</dd></div>';
      if (cloud) { var d = cloud.data || {}; h += '<div class="rw"><dt>حسابك</dt><dd>' + Object.keys(d.lessons || {}).length + " درس، " + Object.keys(d.practice || {}).length + " تمرين · " + when(cloud.updated_at) + '</dd></div>'; }
      else h += '<div class="rw"><dt>حسابك</dt><dd>لا توجد بيانات بعد</dd></div>';
      h += '</dl>' + (C.switched ? '<p class="cl-err">آخر من استخدم هذا المتصفح حساب آخر؛ بيانات هذا الجهاز قد لا تكون لك. نزّل بيانات حسابك بدل رفعها.</p>' : "") + '<div class="pb-actions">' + '<button type="button" class="btn btn-primary btn-sm" id="push">ارفع بيانات هذا الجهاز إلى حسابي</button>' + (cloud ? '<button type="button" class="btn btn-ghost btn-sm" id="pull">استبدل بيانات هذا الجهاز ببيانات حسابي</button>' : "") + '</div>' +
        '<label class="gp-check"><input type="checkbox" id="auto"' + (C.autoSync() ? " checked" : "") + '> مزامنة تلقائية من هذا الجهاز (يرفع كل تقدم جديد إلى حسابك)</label><p class="muted" id="sync-st" style="margin:0;font-size:13px" aria-live="polite"></p>';
      $("sync").innerHTML = h;
      $("push").addEventListener("click", function () { C.pushProgress(S.get()).then(function () { C.setAutoSync(true); $("auto").checked = true; $("sync-st").textContent = "✓ رُفعت بياناتك، والمزامنة التلقائية مفعّلة."; }, function (x) { $("sync-st").textContent = x.message; }); });
      if (cloud) $("pull").addEventListener("click", function () {
        var b = this; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "تأكيد: ستُستبدل بيانات هذا الجهاز"; return; }
        S.importData(cloud.data); C.setAutoSync(true); $("sync-st").textContent = "✓ نُزّلت بيانات حسابك إلى هذا الجهاز."; me();
      });
      $("auto").addEventListener("change", function () { C.setAutoSync(this.checked); });
    }, function (x) { $("sync").innerHTML = '<p class="cl-err">' + esc(x.message) + '</p>'; });
  }

  function render() {
    if (!C.configured()) return notConfigured();
    root.innerHTML = head() + '<p class="muted">جارٍ الاتصال…</p>';
    C.ready().then(function (c) { if (!c) { root.innerHTML = head() + '<p class="cl-err">تعذّر الاتصال بخادم الحسابات. تحقق من الإنترنت ومن إعدادات js/config.js.</p>'; return; } if (C.user()) shell(); else auth(); });
  }
  render();
})();
