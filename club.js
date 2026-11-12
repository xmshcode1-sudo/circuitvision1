/* CircuitVision — Beyond Theory, the student club.
   Linked to the Project Academy: each academy project is a track; a finished project can be shown here with a photo
   of the real build and its academy report attached. Also: comments, likes, challenge leaderboard, progress sync.
   Routes: #share-<project-id> opens the composer for that project, #p-<project-id> filters the gallery. */
(function () {
  "use strict";
  var S = CV.store, C = CV.cloud, K = CV.projectKit, root = document.getElementById("club-root");
  var tab = "feed", filter = "all", sort = "new", pendingShare = null, cache = null;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function when(t) { try { return new Date(t).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return t; } }
  var MODES = { time: "سباق الوقت", ten: "10 أسئلة", daily: "تحدي اليوم" }, LEVELS = { dc: "أساسيات DC", req: "المقاومة المكافئة", an: "طرق التحليل", th: "ثيفنن ونورتن", ac: "التيار المتردد", pw: "القدرة في AC", mix: "شامل" };
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  var order = CV.projectOrder || [], P = CV.projects || {};
  function doneIds() { return order.filter(function (id) { return K.progress(P[id]).done; }); }
  var thumbs = {};
  function thumb(id) { if (!thumbs[id]) { var p = P[id]; thumbs[id] = CV.draw.render(p.sim.compute(K.defaults(p)).circuit, { aria: "مخطط " + p.ar }); } return thumbs[id]; }

  /* ---------- routing ---------- */
  function readHash() {
    var h = location.hash.replace(/^#/, ""), m;
    if ((m = /^share-(.+)$/.exec(h)) && P[m[1]]) { pendingShare = m[1]; tab = "feed"; filter = "all"; }
    else if ((m = /^p-(.+)$/.exec(h)) && P[m[1]]) { filter = m[1]; tab = "feed"; }
  }

  /* ---------- hero ---------- */
  var MOTIF = '<svg class="bt-motif" viewBox="0 0 420 120" aria-hidden="true">' +
    '<path class="bt-th" d="M10 60h70l8-16 14 32 14-32 14 32 14-32 8 16h48"/>' +
    '<text class="bt-cap" x="70" y="104">R = 220 Ω</text>' +
    '<path class="bt-pr" d="M230 60h44"/><rect class="bt-body" x="274" y="44" width="92" height="32" rx="14"/>' +
    '<rect x="292" y="44" width="8" height="32" fill="#d9413a"/><rect x="308" y="44" width="8" height="32" fill="#d9413a"/><rect x="324" y="44" width="8" height="32" fill="#6b3d1f"/><rect x="348" y="44" width="6" height="32" fill="#c8a64b"/>' +
    '<path class="bt-pr" d="M366 60h44"/><text class="bt-cap" x="320" y="104">أحمر · أحمر · بني</text>' +
    '<path class="bt-arrow" d="M196 60h22m-7-7 7 7-7 7"/></svg>';
  function hero() {
    return '<header class="bt-hero card"><div class="bt-hero-t"><span class="bt-word ltr">Beyond Theory</span><h1>ما بعد النظرية</h1>' +
      '<p>نادي CircuitVision العملي. تصمّم الدائرة وتحاكيها في أكاديمية المشاريع، ثم تبنيها بيدك، وتعرضها هنا مع صورتها وتقريرها ليراها زملاؤك ويعلّقوا عليها.</p>' +
      '<ol class="bt-flow"><li><span>1</span>الدرس</li><li><span>2</span>التصميم والمحاكاة</li><li><span>3</span>البناء والقياس</li><li class="on"><span>4</span>العرض في النادي</li></ol></div>' +
      MOTIF + '<div class="bt-stats" id="bt-stats" hidden></div></header>';
  }
  function stats(posts) {
    var el = $("bt-stats"); if (!el) return;
    var members = {}, projs = {}; posts.forEach(function (p) { members[p.user_id] = 1; if (p.project_id && P[p.project_id]) projs[p.project_id] = 1; });
    var more = posts.length >= 200 ? "+" : "";
    el.innerHTML = '<div><b class="mono">' + posts.length + more + '</b><span>عرض منشور</span></div><div><b class="mono">' + Object.keys(members).length + more + '</b><span>عضو عرض مشروعًا</span></div><div><b class="mono">' + Object.keys(projs).length + ' / ' + order.length + '</b><span>مشروع من الأكاديمية معروض</span></div>';
    el.hidden = false;
  }

  /* ---------- academy tracks ---------- */
  function tracks(counts) {
    var signed = !!(C.configured() && C.user());
    return '<section class="bt-tracks" id="bt-tracks"><div class="bt-sh"><h2>مشاريع الأكاديمية</h2><a class="lk" href="academy.html">أكاديمية المشاريع ←</a></div><div class="bt-tgrid">' +
      order.map(function (id) {
        var p = P[id], g = K.progress(p), n = counts ? counts[id] || 0 : null;
        var segs = [g.design, g.sim, g.build, g.test, g.doc].map(function (x, i) { return '<i class="' + (x ? "on" : "") + '" title="' + ["التصميم", "المحاكاة", "التنفيذ", "الاختبار", "التوثيق"][i] + '"></i>'; }).join("");
        var state = g.done ? '<span class="chip chip-ok">منجز</span>' : g.count ? '<span class="chip chip-build">' + g.count + ' من 5</span>' : '<span class="chip">لم تبدأ</span>';
        var act = g.done ? '<button type="button" class="btn btn-primary btn-sm" data-share="' + id + '">اعرض مشروعك</button>'
          : '<a class="btn btn-ghost btn-sm" href="academy.html#' + id + '">' + (g.started || g.count ? "أكمل في الأكاديمية" : "ابدأ في الأكاديمية") + '</a>';
        var peers = signed && n ? '<button type="button" class="btn btn-ghost btn-sm" data-filter="' + id + '">العروض (' + n + ')</button>' : "";
        return '<article class="bt-track card' + (filter === id ? " cur" : "") + '"><div class="bt-tfig">' + thumb(id) + '</div><div class="bt-tt"><div class="bt-tmeta"><span class="chip chip-plan">' + p.level + '</span>' + state + (n != null ? '<span class="muted bt-n">' + (n ? n + " عرض في النادي" : "لا عروض بعد") + '</span>' : "") + '</div>' +
          '<b>' + p.ar + '</b><div class="bt-seg" aria-label="مراحلك في المشروع: ' + g.count + ' من 5">' + segs + '</div><div class="bt-tact">' + act + peers + '</div></div></article>';
      }).join("") + '</div></section>';
  }
  function bindTracks(scope) {
    scope = scope || root;
    scope.querySelectorAll("[data-share]").forEach(function (b) { b.addEventListener("click", function () { pendingShare = b.dataset.share; tab = "feed"; filter = "all"; if (C.user()) shell(); else authNeeded("سجّل الدخول لتعرض مشروعك في النادي."); }); });
    scope.querySelectorAll("[data-filter]").forEach(function (b) { b.addEventListener("click", function () { filter = b.dataset.filter; tab = "feed"; shell(); var g = $("bt-gallery"); if (g) g.scrollIntoView({ behavior: "smooth", block: "start" }); }); });
  }

  /* ---------- not configured / auth ---------- */
  function notConfigured() {
    root.innerHTML = hero() + tracks(null) + '<div class="pending card"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><p><b>النادي غير مفعّل على هذه النسخة</b>يحتاج حسابات حقيقية (Supabase). يعمل على الموقع المنشور: الحسابات، عرض المشاريع بالصور والتقارير، التعليقات والإعجابات، لوحة الصدارة، ومزامنة التقدم.</p></div>';
    bindTracks();
  }
  function auth(note) {
    root.innerHTML = hero() + tracks(null) + '<section class="card cl-auth" id="cl-auth"><b class="bt-ah">ادخل النادي</b><p class="muted" style="margin:0;font-size:13.5px">الحساب يلزم لعرض مشاريعك ورؤية عروض زملائك. بدون حساب يبقى تقدمك محفوظًا في هذا المتصفح فقط.</p>' +
      '<div class="cl-tabs" role="tablist"><button type="button" role="tab" class="tl on" data-m="in" aria-selected="true">تسجيل الدخول</button><button type="button" role="tab" class="tl" data-m="up" aria-selected="false">حساب جديد</button></div>' +
      '<form id="auth" novalidate><div class="field" id="f-name-w" hidden><label for="f-name">اسمك في النادي</label><input class="input" id="f-name" autocomplete="nickname" maxlength="40"></div>' +
      '<div class="field"><label for="f-email">البريد الإلكتروني</label><input class="input" id="f-email" type="email" autocomplete="email" dir="ltr"></div>' +
      '<div class="field"><label for="f-pw">كلمة المرور</label><input class="input" id="f-pw" type="password" autocomplete="current-password" dir="ltr" minlength="6"></div>' +
      '<p class="cl-err" id="auth-err"' + (note ? "" : " hidden") + ' role="alert">' + esc(note || "") + '</p><button type="submit" class="btn btn-primary" id="auth-go">دخول</button></form></section>';
    bindTracks();
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
  function authNeeded(msg) { auth(msg); var a = $("cl-auth"); if (a) { a.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { $("f-email").focus({ preventScroll: true }); }, 400); } }

  /* ---------- signed-in shell ---------- */
  function counts() {
    if (!cache) return null;
    var n = {}; cache.posts.forEach(function (p) { if (p.project_id) n[p.project_id] = (n[p.project_id] || 0) + 1; }); return n;
  }
  function shell() {
    root.innerHTML = hero() + tracks(counts()) +
      '<div class="cl-bar card"><span>أهلًا، <b>' + esc(C.name()) + '</b></span><span style="flex:1"></span><button type="button" class="btn btn-ghost btn-sm" id="out">تسجيل الخروج</button></div>' +
      '<div class="cl-tabs" role="tablist" id="bt-gallery">' + [["feed", "معرض المشاريع"], ["board", "لوحة الصدارة"], ["me", "حسابي والمزامنة"]].map(function (t) { return '<button type="button" role="tab" class="tl' + (t[0] === tab ? " on" : "") + '" data-t="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>'; }).join("") + '</div><div id="cl-body"></div>';
    if (cache) stats(cache.posts);
    bindTracks();
    $("out").addEventListener("click", function () { cache = null; C.signOut().then(render); });
    root.querySelectorAll("[data-t]").forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.t; shell(); }); });
    ({ feed: feed, board: board, me: me })[tab]();
  }

  /* ---------- gallery ---------- */
  function feed() {
    var body = $("cl-body");
    var opts = '<option value="all">كل المشاريع</option>' + order.map(function (id) { return '<option value="' + id + '"' + (filter === id ? " selected" : "") + '>' + P[id].ar + '</option>'; }).join("") + '<option value="free"' + (filter === "free" ? " selected" : "") + '>مشاريع حرة (خارج الأكاديمية)</option>';
    body.innerHTML = '<div class="bt-tools"><div class="field"><label for="f-filter">عرض</label><select class="select" id="f-filter">' + opts + '</select></div>' +
      '<div class="field"><label for="f-sort">الترتيب</label><select class="select" id="f-sort"><option value="new">الأحدث</option><option value="top"' + (sort === "top" ? " selected" : "") + '>الأكثر إعجابًا</option></select></div>' +
      '<span style="flex:1"></span><button type="button" class="btn btn-primary btn-sm" id="np-open" aria-expanded="false" aria-controls="np-box">شارك مشروعًا</button></div>' +
      '<section class="card cl-new" id="np-box" hidden></section><div id="posts" class="cl-posts"><p class="muted">جارٍ التحميل…</p></div>';
    $("f-filter").addEventListener("change", function () { filter = this.value; shell(); });
    $("f-sort").addEventListener("change", function () { sort = this.value; drawPosts(); });
    $("np-open").addEventListener("click", function () { var box = $("np-box"); if (box.hidden) composer(null); else { box.hidden = true; this.setAttribute("aria-expanded", "false"); } });
    if (pendingShare) { var id = pendingShare; pendingShare = null; composer(id); try { history.replaceState(null, "", location.pathname); } catch (e) {} }
    if (cache) drawPosts(); else loadPosts();
  }

  function composer(projectId) {
    var box = $("np-box"), done = doneIds(), photo = null;
    $("np-open").setAttribute("aria-expanded", "true");
    if (projectId && done.indexOf(projectId) < 0) projectId = null;
    box.hidden = false;
    box.innerHTML = '<div class="bt-sh"><b>اعرض مشروعًا</b><button type="button" class="btn btn-ghost btn-sm" id="np-x">إغلاق</button></div><form id="np" novalidate>' +
      '<div class="field"><label for="np-proj">المشروع</label><select class="select" id="np-proj"><option value="">مشروع حر (بدون ربط بالأكاديمية)</option>' + done.map(function (k) { return '<option value="' + k + '"' + (k === projectId ? " selected" : "") + '>' + P[k].ar + '</option>'; }).join("") + '</select>' +
      (done.length ? "" : '<p class="muted" style="margin:4px 0 0;font-size:13px">المشاريع التي تنهيها في <a class="lk" href="academy.html">أكاديمية المشاريع</a> تظهر هنا، ويُرفق تقريرها مع عرضك.</p>') + '</div>' +
      '<div id="np-rep" hidden><label class="gp-check"><input type="checkbox" id="np-rep-on" checked> أرفق تقرير المشروع من الأكاديمية (التصميم، نتائج المحاكاة، قياساتك، ملاحظاتك)</label><details class="bt-rep"><summary>معاينة التقرير</summary><pre class="report" id="np-rep-t" dir="rtl"></pre></details></div>' +
      '<div class="field"><label for="np-t">العنوان</label><input class="input" id="np-t" maxlength="120"></div>' +
      '<div class="field"><label for="np-b">ماذا بنيت؟ وما الذي اختلف عن المحاكاة؟</label><textarea class="input" id="np-b" rows="4" maxlength="4000"></textarea></div>' +
      '<div class="field"><span class="lbl-like">صورة الدائرة التي بنيتها (اختياري)</span><div class="bt-photo"><label class="btn btn-ghost btn-sm" for="np-ph">اختر صورة أو صوّر</label><input type="file" id="np-ph" accept="image/*" hidden><div id="np-prev" class="bt-prev" hidden></div></div><p class="muted" style="margin:4px 0 0;font-size:12.5px">تُصغَّر الصورة قبل الرفع، ولا يراها إلا أعضاء النادي المسجلون.</p></div>' +
      '<p class="cl-err" id="np-err" hidden role="alert"></p><div class="pb-actions"><button type="submit" class="btn btn-primary btn-sm" id="np-go">انشر في النادي</button><span class="muted" id="np-st" aria-live="polite"></span></div></form>';
    function syncProj() {
      var id = $("np-proj").value, p = P[id];
      $("np-rep").hidden = !p;
      if (p) { $("np-rep-t").textContent = K.report(p); if (!$("np-t").value || $("np-t").dataset.auto) { $("np-t").value = p.ar; $("np-t").dataset.auto = "1"; } }
    }
    $("np-t").addEventListener("input", function () { delete this.dataset.auto; });
    $("np-proj").addEventListener("change", syncProj); syncProj();
    $("np-x").addEventListener("click", function () { box.hidden = true; $("np-open").setAttribute("aria-expanded", "false"); });
    $("np-ph").addEventListener("change", function () {
      var f = this.files && this.files[0], pv = $("np-prev"), er = $("np-err"); er.hidden = true;
      if (!f) return;
      shrink(f).then(function (b) {
        photo = b; var u = URL.createObjectURL(b);
        pv.innerHTML = '<img src="' + u + '" alt="معاينة الصورة"><button type="button" class="btn btn-ghost btn-sm" id="np-ph-x">أزل الصورة</button>'; pv.hidden = false;
        $("np-ph-x").addEventListener("click", function () { photo = null; pv.hidden = true; pv.innerHTML = ""; $("np-ph").value = ""; URL.revokeObjectURL(u); });
      }, function (x) { er.textContent = x.message; er.hidden = false; });
    });
    $("np").addEventListener("submit", function (e) {
      e.preventDefault();
      var pid = $("np-proj").value, t = $("np-t").value.trim(), b = $("np-b").value.trim(), er = $("np-err"), go = $("np-go"), st = $("np-st"); er.hidden = true;
      if (t.length < 3 || !b) { er.textContent = "اكتب عنوانًا (3 أحرف على الأقل) ووصفًا لما بنيته."; er.hidden = false; return; }
      var rep = pid && P[pid] && $("np-rep-on").checked ? K.report(P[pid]).slice(0, 8000) : null;
      go.disabled = true; st.textContent = photo ? "جارٍ رفع الصورة…" : "جارٍ النشر…";
      (photo ? C.uploadPhoto(photo) : Promise.resolve(null)).then(function (path) {
        st.textContent = "جارٍ النشر…";
        return C.addPost({ project_id: pid, title: t, body: b, report: rep, image_path: path });
      }).then(function () { box.hidden = true; $("np-open").setAttribute("aria-expanded", "false"); filter = pid || "all"; cache = null; shell(); },
        function (x) { er.textContent = x.message; er.hidden = false; go.disabled = false; st.textContent = ""; });
    });
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function shrink(file) {
    return new Promise(function (res, rej) {
      if (!/^image\//.test(file.type || "image/")) return rej(new Error("اختر ملف صورة."));
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement("canvas");
        cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u);
        cv.toBlob(function (b) { b && b.size <= 2097152 ? res(b) : rej(new Error("تعذّر تجهيز الصورة. جرّب صورة أخرى.")); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("تعذّر قراءة الصورة. جرّب صورة بصيغة JPG أو PNG.")); };
      img.src = u;
    });
  }

  function loadPosts() {
    C.posts().then(function (posts) {
      var ids = posts.map(function (p) { return p.id; }), paths = posts.map(function (p) { return p.image_path; }).filter(Boolean);
      return Promise.all([C.comments(ids), C.likes(ids), C.photoUrls(paths)]).then(function (x) {
        cache = { posts: posts, comments: x[0], likes: x[1], urls: x[2] };
        if (!$("posts")) return;
        stats(posts);   // update in place so an open composer keeps what the student typed
        var t = $("bt-tracks"), w = document.createElement("div"); w.innerHTML = tracks(counts()); t.replaceWith(w.firstChild); bindTracks($("bt-tracks"));
        drawPosts();
      });
    }).catch(function (x) { var box = $("posts"); if (box) box.innerHTML = '<p class="cl-err">' + esc(x.message) + '</p>'; });
  }
  function refreshPosts() { cache = null; loadPosts(); }

  function drawPosts() {
    var box = $("posts"); if (!box || !cache) return;
    var me = C.user().id, c = cache;
    var likeN = {}; c.likes.forEach(function (l) { likeN[l.post_id] = (likeN[l.post_id] || 0) + 1; });
    var list = c.posts.filter(function (p) { return filter === "all" ? true : filter === "free" ? !(p.project_id && P[p.project_id]) : p.project_id === filter; });
    if (sort === "top") list = list.slice().sort(function (a, b) { return (likeN[b.id] || 0) - (likeN[a.id] || 0) || (a.created_at < b.created_at ? 1 : -1); });
    if (!list.length) {
      var canShare = P[filter] && doneIds().indexOf(filter) > -1;
      box.innerHTML = '<div class="card bt-empty"><p>' + (filter === "all" ? "لا توجد عروض بعد. كن أول من يعرض مشروعًا بناه." : "لا توجد عروض في هذا القسم بعد.") + '</p>' +
        (canShare ? '<button type="button" class="btn btn-primary btn-sm" id="em-share">اعرض مشروعك فيه</button>' : P[filter] ? '<a class="btn btn-ghost btn-sm" href="academy.html#' + filter + '">ابنِ هذا المشروع في الأكاديمية</a>' : "") + '</div>';
      var es = $("em-share"); if (es) es.addEventListener("click", function () { composer(filter); });
      return;
    }
    box.innerHTML = list.map(function (p) {
      var cs = c.comments.filter(function (x) { return x.post_id === p.id; }), ls = c.likes.filter(function (l) { return l.post_id === p.id; }), mine = ls.some(function (l) { return l.user_id === me; });
      var proj = p.project_id && P[p.project_id], url = p.image_path && c.urls[p.image_path];
      var media = url ? '<a class="bt-ph" href="' + esc(url) + '" target="_blank" rel="noopener"><img src="' + esc(url) + '" alt="صورة الدائرة: ' + esc(p.title) + '" loading="lazy"></a>'
        : proj ? '<div class="bt-ph bt-ph-sch"><div>' + thumb(p.project_id) + '</div><span class="muted">مخطط المشروع في الأكاديمية · لم تُرفق صورة</span></div>' : "";
      return '<article class="card bt-post" data-id="' + p.id + '">' + media + '<div class="bt-pbody">' +
        (proj ? '<a class="chip chip-src" href="academy.html#' + p.project_id + '">مشروع الأكاديمية: ' + proj.ar + '</a>' : '<span class="chip">مشروع حر</span>') +
        '<header><b>' + esc(p.title) + '</b><span class="muted">' + esc(p.author ? p.author.display_name : "") + ' · ' + when(p.created_at) + '</span></header>' +
        '<p class="cl-text">' + esc(p.body).replace(/\n/g, "<br>") + '</p>' +
        (p.report ? '<details class="bt-rep"><summary>تقرير المشروع من الأكاديمية</summary><pre class="report" dir="rtl">' + esc(p.report) + '</pre></details>' : "") +
        '<div class="cl-act"><button type="button" class="tl' + (mine ? " on" : "") + '" data-like="' + (mine ? 0 : 1) + '" aria-pressed="' + mine + '" aria-label="إعجاب">♥ ' + ls.length + '</button><span class="muted">' + cs.length + ' تعليق</span>' +
        (proj ? '<a class="lk bt-try" href="academy.html#' + p.project_id + '">ابنِه بنفسك ←</a>' : "") +
        (p.user_id === me ? '<span style="flex:1"></span><button type="button" class="btn btn-ghost btn-sm danger" data-del>احذف</button>' : "") + '</div>' +
        '<div class="cl-cm">' + cs.map(function (x) { return '<p><b>' + esc(x.author ? x.author.display_name : "") + ':</b> ' + esc(x.body) + '</p>'; }).join("") +
        '<form class="cl-cf" novalidate><input class="input" maxlength="1000" placeholder="اكتب تعليقًا أو سؤالًا عن الدائرة…" aria-label="تعليق"><button type="submit" class="btn btn-ghost btn-sm">علّق</button></form></div></div></article>';
    }).join("");
    box.querySelectorAll(".bt-post").forEach(function (a) {
      var id = +a.dataset.id, post = c.posts.filter(function (p) { return p.id === id; })[0];
      a.querySelector("[data-like]").addEventListener("click", function () { this.disabled = true; C.like(id, this.dataset.like === "1").then(refreshPosts, refreshPosts); });
      var d = a.querySelector("[data-del]");
      if (d) d.addEventListener("click", function () {
        if (d.dataset.sure) { d.disabled = true; C.deletePost(id, post.image_path).then(refreshPosts, refreshPosts); return; }
        d.dataset.sure = "1"; d.textContent = "تأكيد الحذف؟";
        setTimeout(function () { if (d.isConnected) { delete d.dataset.sure; d.textContent = "احذف"; } }, 4000);
      });
      a.querySelector(".cl-cf").addEventListener("submit", function (e) { e.preventDefault(); var i = this.querySelector("input"), t = i.value.trim(); if (!t) return; i.disabled = true; C.addComment(id, t).then(refreshPosts, function () { i.disabled = false; }); });
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
        S.importData(cloud.data); C.setAutoSync(true); $("sync-st").textContent = "✓ نُزّلت بيانات حسابك إلى هذا الجهاز."; shell();
      });
      $("auto").addEventListener("change", function () { C.setAutoSync(this.checked); });
    }, function (x) { $("sync").innerHTML = '<p class="cl-err">' + esc(x.message) + '</p>'; });
  }

  function render() {
    if (!C.configured()) return notConfigured();
    root.innerHTML = hero() + '<p class="muted">جارٍ الاتصال…</p>';
    C.ready().then(function (c) {
      if (!c) { root.innerHTML = hero() + tracks(null) + '<p class="cl-err">تعذّر الاتصال بخادم الحسابات. تحقق من الإنترنت ثم أعد تحميل الصفحة.</p>'; bindTracks(); return; }
      if (C.user()) shell(); else auth(pendingShare ? "سجّل الدخول لتعرض مشروعك في النادي." : "");
    });
  }
  readHash();
  window.addEventListener("hashchange", function () { readHash(); if (C.configured() && C.user()) shell(); else render(); });
  render();
})();
