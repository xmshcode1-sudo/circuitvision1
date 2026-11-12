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
      client.auth.onAuthStateChange(function (_e, session) { user = session ? session.user : null; profile = null; emit(); });
      return loadProfile().then(function () { return client; });
    }).catch(function () { client = null; return null; });
    return loading;
  }
  function markUser() { try { var prev = localStorage.getItem("cv.lastUser"); if (user) { api.switched = !!prev && prev !== user.id; localStorage.setItem("cv.lastUser", user.id); } } catch (e) {} }
  function emit() { markUser(); listeners.forEach(function (f) { try { f(user); } catch (e) {} }); }
  function loadProfile() {
    if (!client || !user) { profile = null; return Promise.resolve(null); }
    return client.from("profiles").select("id,display_name").eq("id", user.id).maybeSingle().then(function (r) { profile = r.data || null; return profile; });
  }
  function err(r) { if (r && r.error) throw new Error(msg(r.error)); return r; }
  function msg(e) {
    var m = (e && (e.message || e.error_description)) || "";
    if (/Invalid login/i.test(m)) return "البريد أو كلمة المرور غير صحيحة.";
    if (/already registered|already exists/i.test(m)) return "هذا البريد مسجّل مسبقًا. سجّل الدخول.";
    if (/Password should be/i.test(m)) return "كلمة المرور قصيرة: 6 أحرف على الأقل.";
    if (/Email not confirmed/i.test(m)) return "أكّد بريدك من الرسالة التي وصلتك ثم سجّل الدخول.";
    if (/duplicate key|one_daily/i.test(m)) return "سجّلت نتيجة تحدي اليوم مسبقًا.";
    return "تعذّر الاتصال بالخادم. حاول مرة أخرى.";
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
    signOut: function () { return ready().then(function (c) { return c.auth.signOut(); }).then(function () { user = null; profile = null; emit(); }); },

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
  if (configured()) ready();
  CV.cloud = api;
})();
