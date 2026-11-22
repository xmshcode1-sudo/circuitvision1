/* CircuitVision — accounts and cloud sync (Supabase).
   CV.cloud.ready() resolves to the client when js/config.js has a Supabase URL + anon key; otherwise to null,
   and every page keeps working with browser-only storage. supabase-js is loaded only when configured. */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  var cfg = window.CV_CONFIG || {}, client = null, loading = null, user = null, profile = null, listeners = [];
  var SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";

  function configured() { return !!(window.CV_SUPABASE_MOCK || (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY)); }
  function loadSdk() {
    return new Promise(function (res, rej) {
      if (window.supabase && window.supabase.createClient) return res();
      var s = document.createElement("script"); s.src = SDK; s.onload = function () { res(); }; s.onerror = function () { rej(new Error("sdk")); };
      document.head.appendChild(s);
    });
  }
  function ready() {
    if (!configured()) return Promise.resolve(null);
    if (loading) return loading;
    loading = (window.CV_SUPABASE_MOCK ? Promise.resolve() : loadSdk()).then(function () {
      client = window.CV_SUPABASE_MOCK || window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      return client.auth.getSession();
    }).then(function (r) {
      user = r && r.data && r.data.session ? r.data.session.user : null;
      client.auth.onAuthStateChange(function (_e, session) {
        var was = user && user.id; user = session ? session.user : null;
        if ((user && user.id) !== was) { profile = null; access = null; loadProfile().then(loadAccess).then(emit); } else emit();
      });
      return loadProfile().then(loadAccess).then(function () { return client; });
    }).catch(function () { client = null; return null; });
    return loading;
  }
  function markUser() { try { var prev = localStorage.getItem("cv.lastUser"); if (user) { api.switched = !!prev && prev !== user.id; localStorage.setItem("cv.lastUser", user.id); } } catch (e) {} }
  function emit() { markUser(); listeners.forEach(function (f) { try { f(user); } catch (e) {} }); }
  function loadProfile() {
    if (!client || !user) { profile = null; return Promise.resolve(null); }
    return client.from("profiles").select("id,display_name").eq("id", user.id).maybeSingle().then(function (r) { profile = r.data || null; return profile; });
  }
  /* what this student may open: { admin, blocked, subs: [{course_id, ends_at}], courses: [...], announcements: [...] } */
  var access = null, accessListeners = [];
  function loadAccess() {
    if (!client || !user) { access = null; return Promise.resolve(null); }
    return client.rpc("my_access").then(function (r) { access = r && !r.error ? r.data : null; accessListeners.forEach(function (f) { try { f(access); } catch (e) {} }); return access; }, function () { access = null; return null; });
  }
  function err(r) { if (r && r.error) throw new Error(msg(r.error)); return r; }
  function msg(e) {
    var m = (e && (e.message || e.error_description)) || "";
    if (/Invalid login/i.test(m)) return "البريد أو كلمة المرور غير صحيحة.";
    if (/already registered|already exists/i.test(m)) return "هذا البريد مسجّل مسبقًا. سجّل الدخول.";
    if (/Password should be/i.test(m)) return "كلمة المرور قصيرة: 6 أحرف على الأقل.";
    if (/Email not confirmed/i.test(m)) return "أكّد بريدك من الرسالة التي وصلتك ثم سجّل الدخول.";
    if (/duplicate key|one_daily/i.test(m)) return "سجّلت نتيجة تحدي اليوم مسبقًا.";
    if (/expired|invalid.*(otp|token)|token.*(invalid|expired)|otp/i.test(m)) return "الكود غير صحيح أو انتهت صلاحيته. اطلب كودًا جديدًا.";
    if (/not authorized/i.test(m)) return "تعذّر إرسال الكود لهذا البريد الآن: خدمة البريد في المنصة قيد الإعداد. حاول لاحقًا.";
    if (/rate limit|security purposes|too many/i.test(m)) return "طلبات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.";
    if (/same.*password|different from the old/i.test(m)) return "اختر كلمة مرور مختلفة عن القديمة.";
    if (/valid email|invalid.*email|email.*invalid/i.test(m)) return "اكتب بريدًا إلكترونيًا صحيحًا.";
    if (/signups not allowed|signup.*disabled/i.test(m)) return "التسجيل مغلق مؤقتًا.";
    return "تعذّر الاتصال بالخادم. حاول مرة أخرى.";
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }

  /* ---------- the gate: every page except the home page and login needs a signed-in account ---------- */
  var PAGE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (PAGE && PAGE.indexOf(".") < 0) PAGE += ".html";
  var PUBLIC = { "index.html": 1, "login.html": 1 };
  /* pages that belong to one paid course; the first lesson of each chapter stays open in the lab and the academy */
  var PAGE_COURSE = { "practice.html": "circuits-1", "bank.html": "circuits-1", "tutor.html": "circuits-1", "challenges.html": "circuits-1",
    "realworld.html": "circuits-1", "lab.html": "circuits-1", "academy.html": "circuits-1", "trainer.html": "logic-design" };
  function pageNeeds() {
    var c = PAGE_COURSE[PAGE], h = decodeURIComponent(location.hash.slice(1));
    if (!c) return null;
    if (PAGE === "lab.html" && /^exp\d+$/.test(h) && api.labFree(+h.slice(3))) return null;
    if (PAGE === "academy.html" && /^c\d-/.test(h) && api.freeLesson(h)) return null;
    return c;
  }
  function mainEl() { return document.getElementById("main") || document.querySelector("main"); }
  function onDom(f) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", f); else f(); }
  function gate() {
    if (!configured() || PUBLIC[PAGE] || window.CV_NO_GATE) return;
    document.documentElement.classList.add("cv-gate");
    ready().then(function (c) {
      if (!c) return onDom(function () { screen("تعذّر الاتصال بخادم الحسابات", "تحقق من الإنترنت ثم أعد المحاولة.", '<button type="button" class="btn btn-primary" onclick="location.reload()">أعد المحاولة</button>'); });
      if (!user) { location.replace("login.html?next=" + encodeURIComponent(PAGE + location.search + location.hash)); return; }
      if (!access) return onDom(function () { screen("تعذّر تحميل بيانات حسابك", "حدّث الصفحة بعد قليل.", '<button type="button" class="btn btn-primary" onclick="location.reload()">حدّث الصفحة</button>'); });
      if (access.blocked) return onDom(function () { screen("حسابك موقوف", "تواصل مع إدارة المنصة لمعرفة السبب.", '<button type="button" class="btn btn-ghost" id="cv-out">تسجيل الخروج</button>'); outBtn(); });
      if (access.approval === "rejected") return onDom(function () { screen("لم تتم الموافقة على حسابك", "تواصل مع إدارة المنصة إذا كنت تعتقد أن هذا خطأ.", '<button type="button" class="btn btn-ghost" id="cv-out">تسجيل الخروج</button>'); outBtn(); });
      if (access.approval !== "approved") return onDom(function () {
        screen("حسابك بانتظار موافقة الإدارة", "استلمنا طلبك يا " + api.name() + ". تُفتح لك المنصة بعد أن يوافق مدير المنصة على حسابك؛ حدّث الصفحة لاحقًا.", '<button type="button" class="btn btn-primary" onclick="location.reload()">تحقق الآن</button><button type="button" class="btn btn-ghost" id="cv-out">تسجيل الخروج</button>'); outBtn();
      });
      if (!access.admin && api.hiddenPages().indexOf(PAGE) > -1) return onDom(function () {
        screen("هذه الصفحة غير متاحة حاليًا", "تُفتح قريبًا. تقدر تكمل من لوحة الطالب.", '<a class="btn btn-primary" href="dashboard.html">لوحة الطالب</a>');
      });
      onDom(pass);
    });
  }
  function outBtn() { var b = document.getElementById("cv-out"); if (b) b.onclick = function () { api.signOut().then(function () { location.replace("login.html"); }); }; }
  function screen(title, text, actions) {
    document.documentElement.classList.remove("cv-gate");
    /* a full-screen layer over the page (the page's own scripts keep their elements, so nothing breaks underneath) */
    Array.prototype.forEach.call(document.body.children, function (el) { el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true"); });
    var d = document.createElement("div"); d.className = "cv-screen"; d.setAttribute("role", "alertdialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = '<section class="card cv-lock"><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p><div class="cv-lock-cta">' + actions + '</div></section>';
    document.body.appendChild(d);
  }
  function pass() {
    document.documentElement.classList.remove("cv-gate");
    navExtras(); announce(); pageLock(); hideLinks();
    window.addEventListener("hashchange", pageLock);
    api.onChange(function (u) { if (!u) location.replace("login.html"); });
  }
  var locked = false;
  function pageLock() {
    var need = pageNeeds(), main = mainEl(); if (!main) return;
    var shouldLock = !!need && !api.can(need);
    if (shouldLock === locked) return;
    locked = shouldLock;
    Array.prototype.forEach.call(main.children, function (el) { if (!el.classList.contains("mobile-top") && !el.classList.contains("cv-ann")) { if (shouldLock) { el.dataset.cvHid = el.hidden ? "1" : "0"; el.hidden = true; } else if (el.dataset.cvHid) { el.hidden = el.dataset.cvHid === "1"; delete el.dataset.cvHid; } } });
    var box = document.getElementById("cv-page-lock");
    if (shouldLock) { box = document.createElement("div"); box.id = "cv-page-lock"; box.innerHTML = api.lockHtml(need, "هذه الأداة"); main.appendChild(box); }
    else if (box) box.remove();
  }
  /* pages the admin has hidden for now (admin panel → «الصفحات»): students lose every link to them; the admin keeps them, marked */
  function hideLinks() {
    var hid = api.hiddenPages(); if (!hid.length) return;
    var admin = !!(access && access.admin);
    function sweep() {
      document.querySelectorAll("a[href]").forEach(function (a) {
        if (a.dataset.cvHidden) return;
        var page = (a.getAttribute("href") || "").split(/[?#]/)[0];
        if (hid.indexOf(page) < 0) return;
        a.dataset.cvHidden = "1";
        if (admin) { if (a.classList.contains("nv")) { a.insertAdjacentHTML("beforeend", '<span class="soon">مخفية</span>'); a.title = "مخفية عن الطلاب. تغيّرها من لوحة الإدارة ← الصفحات"; } return; }
        if (a.classList.contains("nv") || a.classList.contains("btn") || a.closest(".card") === a) a.hidden = true;
        else { var t = document.createElement("span"); t.textContent = a.textContent; a.replaceWith(t); }   // a link inside a sentence keeps its words
      });
    }
    sweep();
    try { new MutationObserver(sweep).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }
  function navExtras() {
    var nav = document.getElementById("nav"); if (!nav || nav.querySelector(".cv-acc")) return;
    var ic = function (id) { return CV.shell && CV.shell.icon ? CV.shell.icon(id) : ""; };
    var html = '<div class="cv-acc">' + (api.subscriptionsOn() ? '<a class="nv' + (PAGE === "pay.html" ? ' active' : '') + '" href="pay.html">' + ic("pay") + '<span class="lbl">اشتراكاتي</span></a>' : '') +
      (access && access.admin ? '<a class="nv' + (PAGE === "admin.html" ? ' active' : '') + '" href="admin.html">' + ic("admin") + '<span class="lbl">لوحة الإدارة</span></a>' : '') +
      '<button type="button" class="nv" id="cv-signout">' + ic("logout") + '<span class="lbl">تسجيل الخروج</span><span class="soon cv-who">' + esc(api.name()) + '</span></button></div>';
    var sw = nav.querySelector(".lang-box") || nav.querySelector(".lang-sw");
    if (sw) sw.insertAdjacentHTML("beforebegin", html); else nav.insertAdjacentHTML("beforeend", html);
    document.getElementById("cv-signout").addEventListener("click", function () { api.signOut().then(function () { location.replace("login.html"); }); });
  }
  function announce() {
    var main = mainEl(), list = (access && access.announcements) || [];
    if (!main || !list.length) return;
    var seen = {}; try { seen = JSON.parse(localStorage.getItem("cv.ann.seen") || "{}"); } catch (e) {}
    list.filter(function (a) { return !seen[a.id]; }).slice(0, 2).forEach(function (a) {
      var d = document.createElement("div"); d.className = "cv-ann"; d.setAttribute("role", "status");
      d.innerHTML = '<span>' + esc(a.body) + '</span><button type="button" class="btn btn-ghost btn-sm">إخفاء</button>';
      d.querySelector("button").onclick = function () { seen[a.id] = 1; try { localStorage.setItem("cv.ann.seen", JSON.stringify(seen)); } catch (e) {} d.remove(); };
      var top = main.querySelector(".mobile-top");
      if (top) top.insertAdjacentElement("afterend", d); else main.insertBefore(d, main.firstChild);
    });
  }

  var api = {
    configured: configured, ready: ready,
    user: function () { return user; }, profile: function () { return profile; },
    name: function () { return profile ? profile.display_name : user ? (user.email || "").split("@")[0] : ""; },
    onChange: function (f) { listeners.push(f); },
    signUp: function (email, password, name) {
      return ready().then(function (c) { return c.auth.signUp({ email: email, password: password, options: { data: { display_name: name } } }); }).then(err)
        .then(function (r) { user = r.data && r.data.session ? r.data.user : null; return loadProfile().then(function () { emit(); return { needsConfirm: !user }; }); });
    },
    signIn: function (email, password) {
      return ready().then(function (c) { return c.auth.signInWithPassword({ email: email, password: password }); }).then(err)
        .then(function (r) { user = r.data.user; return loadProfile().then(function () { emit(); return user; }); });
    },
    signOut: function () { return ready().then(function (c) { return c.auth.signOut(); }).then(function () { user = null; profile = null; access = null; emit(); }); },
    /* e-mail code: the "Confirm signup" and "Reset password" e-mail templates show {{ .Token }} (a 6-digit code) */
    verifySignup: function (email, code) {
      return ready().then(function (c) { return c.auth.verifyOtp({ email: email, token: code, type: "signup" }); }).then(err)
        .then(function (r) { user = r.data.user; return loadProfile().then(loadAccess).then(function () { emit(); return user; }); });
    },
    resendSignup: function (email) { return ready().then(function (c) { return c.auth.resend({ type: "signup", email: email }); }).then(err); },
    sendReset: function (email) { return ready().then(function (c) { return c.auth.resetPasswordForEmail(email); }).then(err); },
    verifyReset: function (email, code, password) {
      return ready().then(function (c) {
        return c.auth.verifyOtp({ email: email, token: code, type: "recovery" }).then(err).then(function () { return c.auth.updateUser({ password: password }); }).then(err);
      }).then(function (r) { user = r.data.user; return loadProfile().then(loadAccess).then(function () { emit(); return user; }); });
    },
    /* subscriptions */
    access: function () { return access; },
    hiddenPages: function () { return (access && access.hidden_pages) || []; },
    setPageHidden: function (page, hidden) { return ready().then(function (c) { return c.rpc("admin_set_page", { p_page: page, p_hidden: !!hidden }); }).then(err).then(loadAccess); },
    reloadAccess: function () { return ready().then(loadAccess); },
    onAccess: function (f) { accessListeners.push(f); },
    course: function (id) { return ((access && access.courses) || []).filter(function (c) { return c.id === id; })[0] || null; },
    sub: function (id) { return ((access && access.subs) || []).filter(function (s) { return s.course_id === id && new Date(s.ends_at) > new Date(); })[0] || null; },
    subscriptionsOn: function () { return (window.CV_CONFIG || {}).SUBSCRIPTIONS !== false; },
    can: function (id) {
      if (!configured()) return true;                       // no accounts configured: the site runs open (development copy)
      if (!access || access.blocked || (access.approval && access.approval !== "approved")) return false;
      if (!api.subscriptionsOn()) return true;             // subscriptions switched off: an approved account opens everything
      if (access.admin) return true;
      var c = api.course(id);
      if (!c || !c.is_paid) return true;
      return !!api.sub(id);
    },
    freeLesson: function (lessonId) { return /-1$/.test(lessonId); },
    /* lesson id -> Circuits 1 bench experiment (lab.html#expN), following the university lab manual */
    LAB_OF: { "c1-elements-1": 1, "c1-elements-2": 1, "c1-elements-3": 2, "c1-resistive-3": 3, "c1-resistive-4": 3, "c1-resistive-5": 3,
      "c1-techniques-1": 4, "c1-techniques-2": 4, "c1-techniques-3": 4, "c1-techniques-4": 5, "c1-techniques-5": 5, "c1-techniques-6": 5,
      "c1-techniques-9": 6, "c1-techniques-10": 6, "c1-techniques-11": 6, "c1-power-6": 6, "c1-techniques-12": 7,
      "c1-sinusoidal-1": 8, "c1-sinusoidal-2": 8, "c1-sinusoidal-3": 8, "c1-sinusoidal-9": 8, "c1-sinusoidal-4": 9, "c1-sinusoidal-6": 9, "c1-power-7": 10 },
    labFree: function (n) { for (var k in api.LAB_OF) if (api.LAB_OF[k] === n && api.freeLesson(k)) return true; return false; },   // the first lesson of every chapter is the free sample
    courseOf: function (lessonId) { return /^ss-/.test(lessonId) ? "signals-systems" : /^ld-/.test(lessonId) ? "logic-design" : /^c2-/.test(lessonId) ? "circuits-2" : "circuits-1"; },
    canLesson: function (lessonId) { return api.freeLesson(lessonId) || api.can(api.courseOf(lessonId)); },
    price: function (id) { var c = api.course(id); return c ? (c.price_halalas / 100).toFixed(2) : "9.99"; },
    freeNote: function (id) { return id === "logic-design" ? "تجربة Lab#1 مجانية كاملة." : "الدرس الأول من كل فصل مجاني لتجربة المنصة."; },
    lockHtml: function (courseId, what) {
      var c = api.course(courseId), name = c ? c.name_ar : "المقرر";
      if (window.CV && CV.bi && CV.bi.mode && CV.bi.mode() === "en") {   // English-first: the card in English (Arabic names have no dictionary entry)
        var co = (CV.allCourses || []).filter(function (x) { return x.id === courseId; })[0], wEn = { "هذا الدرس": "This lesson", "هذه الأداة": "This tool", "هذه التجربة": "This experiment" }[what] || "This part";
        return '<section class="card cv-lock no-bi" role="region" aria-label="Subscribers only" dir="ltr"><span class="cv-lock-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>' +
          '<h2>' + wEn + ' is for subscribers of ' + esc(co ? co.code : "the course") + '</h2>' +
          '<p>The subscription is <b>' + api.price(courseId) + '</b> SAR for one month, and opens every lesson and tool of the course. ' + (courseId === "logic-design" ? "Lab#1 is fully free to try." : "The first lesson of every chapter is free to try the platform.") + '</p>' +
          '<div class="cv-lock-cta"><a class="btn btn-primary" href="pay.html?course=' + encodeURIComponent(courseId) + '">Subscribe now</a><a class="btn btn-ghost" href="dashboard.html">Dashboard</a></div></section>';
      }
      return '<section class="card cv-lock" role="region" aria-label="محتوى للمشتركين"><span class="cv-lock-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>' +
        '<h2>' + (what || "هذا الجزء") + ' للمشتركين في ' + esc(name) + '</h2>' +
        '<p>الاشتراك <b class="ltr">' + api.price(courseId) + '</b> ريال لمدة شهر، ويفتح كل دروس المقرر وأدواته. ' + api.freeNote(courseId) + '</p>' +
        '<div class="cv-lock-cta"><a class="btn btn-primary" href="pay.html?course=' + encodeURIComponent(courseId) + '">اشترك الآن</a><a class="btn btn-ghost" href="dashboard.html">لوحة الطالب</a></div></section>';
    },
    /* calls to our own /api endpoints carry the student's session so the server can check it */
    authFetch: function (url, opts) {
      opts = Object.assign({}, opts || {}); opts.headers = Object.assign({}, opts.headers || {});
      if (!configured()) return fetch(url, opts);
      return ready().then(function (c) { return c ? c.auth.getSession() : null; }).then(function (r) {
        var s = r && r.data && r.data.session; if (s) opts.headers.Authorization = "Bearer " + s.access_token;
        return fetch(url, opts);
      }, function () { return fetch(url, opts); });
    },
    client: function () { return client; },

    /* progress sync: whole local store as one snapshot */
    pullProgress: function () { return ready().then(function (c) { return c.from("progress").select("data,updated_at").eq("user_id", user.id).maybeSingle(); }).then(err).then(function (r) { return r.data; }); },
    pushProgress: function (data) { return ready().then(function (c) { return c.from("progress").upsert({ user_id: user.id, data: data, updated_at: new Date().toISOString() }); }).then(err); },

    /* club */
    posts: function () {
      return ready().then(function (c) { return c.from("club_posts").select("id,user_id,project_id,title,body,report,image_path,created_at,author:profiles(display_name)").order("created_at", { ascending: false }).limit(200); }).then(err).then(function (r) { return r.data || []; });
    },
    addPost: function (p) { return ready().then(function (c) { return c.from("club_posts").insert({ user_id: user.id, project_id: p.project_id || null, title: p.title, body: p.body, report: p.report || null, image_path: p.image_path || null }); }).then(err); },
    deletePost: function (id, imagePath) {
      return ready().then(function (c) {
        return c.from("club_posts").delete().eq("id", id).eq("user_id", user.id).then(err).then(function () { if (imagePath) return c.storage.from("club").remove([imagePath]).then(function () {}, function () {}); });
      });
    },
    /* photos of the real build: private bucket "club", each student writes only to their own folder */
    uploadPhoto: function (blob) {
      var path = user.id + "/" + Date.now() + ".jpg";
      return ready().then(function (c) { return c.storage.from("club").upload(path, blob, { contentType: "image/jpeg", upsert: false }); }).then(function (r) {
        if (r && r.error) throw new Error(/size|large/i.test(r.error.message || "") ? "الصورة كبيرة جدًا (الحد 2 MB)." : "تعذّر رفع الصورة. حاول مرة أخرى.");
        return path;
      });
    },
    photoUrls: function (paths) {
      if (!paths.length) return Promise.resolve({});
      return ready().then(function (c) { return c.storage.from("club").createSignedUrls(paths, 3600); }).then(function (r) {
        var out = {}; ((r && r.data) || []).forEach(function (x) { if (x.signedUrl) out[x.path] = x.signedUrl; }); return out;
      }, function () { return {}; });
    },
    comments: function (ids) {
      if (!ids.length) return Promise.resolve([]);
      return ready().then(function (c) { return c.from("club_comments").select("id,post_id,user_id,body,created_at,author:profiles(display_name)").in("post_id", ids).order("created_at", { ascending: true }); }).then(err).then(function (r) { return r.data || []; });
    },
    addComment: function (postId, body) { return ready().then(function (c) { return c.from("club_comments").insert({ post_id: postId, user_id: user.id, body: body }); }).then(err); },
    likes: function (ids) {
      if (!ids.length) return Promise.resolve([]);
      return ready().then(function (c) { return c.from("club_likes").select("post_id,user_id").in("post_id", ids); }).then(err).then(function (r) { return r.data || []; });
    },
    like: function (postId, on) {
      return ready().then(function (c) { return on ? c.from("club_likes").insert({ post_id: postId, user_id: user.id }) : c.from("club_likes").delete().eq("post_id", postId).eq("user_id", user.id); }).then(err);
    },
    /* challenges */
    submitScore: function (run) {
      return ready().then(function (c) { return c.from("challenge_scores").insert({ user_id: user.id, mode: run.mode, level: run.level, score: run.score, correct: run.correct, total: run.total, day: run.date }); }).then(err);
    },
    leaderboard: function (mode, level, day) {
      return ready().then(function (c) {
        var q = c.from("challenge_scores").select("score,correct,total,day,created_at,user_id,author:profiles(display_name)").eq("mode", mode);
        if (mode !== "daily") q = q.eq("level", level); else q = q.eq("day", day);
        return q.order("score", { ascending: false }).limit(200);
      }).then(err).then(function (r) { // best score per student
        var seen = {}, out = []; (r.data || []).forEach(function (x) { if (!seen[x.user_id]) { seen[x.user_id] = 1; out.push(x); } }); return out.slice(0, 20);
      });
    }
  };
  /* auto-sync: after the student has chosen how to merge on this device, every local save is pushed (debounced) */
  var syncT = 0;
  api.syncKey = function () { return user ? "cv.sync." + user.id : ""; };
  api.autoSync = function () { try { return !!user && localStorage.getItem(api.syncKey()) === "on"; } catch (e) { return false; } };
  api.setAutoSync = function (on) { try { if (user) localStorage.setItem(api.syncKey(), on ? "on" : "off"); } catch (e) {} };
  if (CV.store && CV.store.onSave) CV.store.onSave(function (d) {
    if (!api.autoSync()) return;
    clearTimeout(syncT); pendingPush = true; syncT = setTimeout(flush, 1500);
  });
  var pendingPush = false;
  function flush() { if (!pendingPush || !api.autoSync()) return; pendingPush = false; clearTimeout(syncT); api.pushProgress(CV.store.get()).then(function () { api.lastPush = new Date(); }, function () { pendingPush = true; }); }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);
  CV.cloud = api;
  gate();
  if (configured()) ready();
})();
