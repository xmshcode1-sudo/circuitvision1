/* CircuitVision — local student data store.
   Step 1 keeps the student's profile and progress in this browser only (localStorage).
   It will be replaced by Supabase accounts later; the shape below is what the
   database tables will mirror (profiles, lesson_progress, question_attempts, projects). */
(function () {
  "use strict";
  var KEY = "circuitvision.v1";

  function empty() {
    return {
      version: 1,
      profile: null,               // { name, createdAt }
      settings: { theme: "system" }, // system | dark | light
      lessons: {},                 // lessonId -> { completedAt }
      questions: {},               // questionId -> { attempts, solvedAt }
      projects: {},                // projectId -> { design: {}, steps: { stepId: true }, measured: {}, notes, completedAt }
      activity: [],                // [{ type, label, at }] newest first, max 20
      practice: {},                // lessonId -> { steps: { stepId: { solved, attempts, hints } } }
      quiz: {},                    // lessonId -> { qIndex: true when answered correctly }
      mistakes: [],                // [{ type, lessonId, stepId, at }] newest first, max 300
      notebook: [],                // [{ id, title, type, lesson, project, body, createdAt, updatedAt }] newest first
      portfolio: {},               // { headline, about, links: [{ label, url }] }
      labs: {},                    // lessonId -> { steps: { i: true }, answers: { i: value }, completedAt }
      challenges: { best: {}, runs: [], daily: {} } // best: "mode:level" -> {score, at}; runs: last 30; daily: date -> {score}
    };
  }

  var memory = null; // fallback when storage is blocked

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.version === 1) { var e = empty(); for (var k in e) if (!(k in data)) data[k] = e[k]; return data; }
      }
    } catch (e) { /* storage blocked or corrupt */ }
    return memory || empty();
  }

  var saveHooks = [];
  function save(data) {
    memory = data;
    data.savedAt = new Date().toISOString();
    var ok; try { localStorage.setItem(KEY, JSON.stringify(data)); ok = true; } catch (e) { ok = false; }
    saveHooks.forEach(function (f) { try { f(data); } catch (e) {} });
    return ok;
  }

  function storageWorks() {
    try { localStorage.setItem(KEY + ".probe", "1"); localStorage.removeItem(KEY + ".probe"); return true; }
    catch (e) { return false; }
  }

  function log(data, type, label) {
    data.activity.unshift({ type: type, label: label, at: new Date().toISOString() });
    data.activity = data.activity.slice(0, 20);
  }

  var api = {
    get: load,
    onSave: function (f) { saveHooks.push(f); },
    importData: function (d) { // replace everything with a snapshot (e.g. from the student's account)
      if (!d || d.version !== 1) return false;
      var e = empty(); for (var k in e) if (!(k in d)) d[k] = e[k];
      memory = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (x) {}
      return true;
    },
    storageWorks: storageWorks,
    setProfile: function (name) {
      var d = load();
      var isNew = !d.profile;
      d.profile = { name: name, createdAt: (d.profile && d.profile.createdAt) || new Date().toISOString() };
      log(d, "profile", isNew ? "أنشأت ملفك على المنصة" : "حدّثت اسمك");
      save(d);
      return d;
    },
    setTheme: function (theme) {
      var d = load(); d.settings.theme = theme; save(d); api.applyTheme(); return d;
    },
    saveNote: function (n) {
      var d = load(), now = new Date().toISOString(), ex = n.id && d.notebook.filter(function (x) { return x.id === n.id; })[0];
      if (ex) { for (var k in n) ex[k] = n[k]; ex.updatedAt = now; }
      else { n.id = "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); n.createdAt = n.updatedAt = now; d.notebook.unshift(n); log(d, "note", "دفتر: " + n.title); }
      save(d); return n.id;
    },
    deleteNote: function (id) { var d = load(); d.notebook = d.notebook.filter(function (x) { return x.id !== id; }); save(d); },
    savePortfolio: function (p) { var d = load(); d.portfolio = Object.assign(d.portfolio || {}, p); save(d); },
    saveChallenge: function (run) {
      var d = load(), c = d.challenges, k = run.mode + ":" + run.level, b = c.best[k], isBest = !b || run.score > b.score;
      if (isBest) c.best[k] = { score: run.score, correct: run.correct, at: run.at };
      c.runs.unshift(run); c.runs = c.runs.slice(0, 30);
      if (run.mode === "daily") c.daily[run.date] = { score: run.score, correct: run.correct };
      log(d, "challenge", "تحدٍّ: " + run.score + " نقطة"); save(d); return isBest;
    },
    project: function (id) { var d = load(); return d.projects[id] || {}; },
    saveProject: function (id, patch) {
      var d = load(), p = d.projects[id] || (d.projects[id] = {});
      for (var k in patch) {
        if (patch[k] && typeof patch[k] === "object" && !Array.isArray(patch[k])) { p[k] = p[k] || {}; for (var j in patch[k]) p[k][j] = patch[k][j]; }
        else p[k] = patch[k];
      }
      if (!p.startedAt) p.startedAt = new Date().toISOString();
      save(d); return p;
    },
    completeProject: function (id, label) {
      var d = load(), p = d.projects[id] || (d.projects[id] = {});
      if (!p.completedAt) { p.completedAt = new Date().toISOString(); log(d, "project", label || id); save(d); }
      return d;
    },
    labExp: function (id) { return load().labs[id] || null; },
    saveLabExp: function (id, st, label) {
      var d = load(), cur = d.labs[id] || {}; d.labs[id] = { steps: st.steps || {}, answers: st.answers || {}, completedAt: cur.completedAt || null };
      if (st.done && !cur.completedAt) { d.labs[id].completedAt = new Date().toISOString(); log(d, "lab", label || id); }
      save(d); return d.labs[id];
    },
    resetLabExp: function (id) { var d = load(); delete d.labs[id]; save(d); },
    completeLesson: function (lessonId, label) {
      var d = load();
      if (!d.lessons[lessonId]) { d.lessons[lessonId] = { completedAt: new Date().toISOString() }; log(d, "lesson", label || lessonId); save(d); }
      return d;
    },
    recordAttempt: function (lessonId, stepId, solved, mistakeType) {
      var d = load();
      var p = d.practice[lessonId] || (d.practice[lessonId] = { steps: {} });
      var st = p.steps[stepId] || (p.steps[stepId] = { solved: false, attempts: 0, hints: 0 });
      st.attempts++;
      if (solved) st.solved = true;
      if (mistakeType) {
        d.mistakes.unshift({ type: mistakeType, lessonId: lessonId, stepId: stepId, at: new Date().toISOString() });
        d.mistakes = d.mistakes.slice(0, 300);
      }
      save(d); return d;
    },
    recordHint: function (lessonId, stepId) {
      var d = load();
      var p = d.practice[lessonId] || (d.practice[lessonId] = { steps: {} });
      var st = p.steps[stepId] || (p.steps[stepId] = { solved: false, attempts: 0, hints: 0 });
      st.hints++; save(d); return st.hints;
    },
    mistakeCount: function (type) {
      return load().mistakes.filter(function (m) { return m.type === type; }).length;
    },
    recordQuestion: function (qid) {
      var d = load(); if (!d.questions[qid]) { d.questions[qid] = { solvedAt: new Date().toISOString() }; save(d); } return d;
    },
    recordQuiz: function (lessonId, qIndex) {
      var d = load(); (d.quiz[lessonId] || (d.quiz[lessonId] = {}))[qIndex] = true; save(d); return d;
    },
    reset: function () { memory = null; try { localStorage.removeItem(KEY); } catch (e) {} return empty(); },
    applyTheme: function () {
      var t = load().settings.theme;
      var root = document.documentElement;
      if (t === "dark" || t === "light") root.setAttribute("data-theme", t);
      else root.removeAttribute("data-theme");
    },
    /* Progress = completed lessons / lessons that are actually published.
       Returns null when no lessons are published yet, so the UI never shows a fake %. */
    courseProgress: function (course, data) {
      data = data || load();
      var total = 0, done = 0;
      course.chapters.forEach(function (ch) {
        ch.lessons.forEach(function (l) { if (l.published) { total++; if (data.lessons[l.id]) done++; } });
      });
      return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : null };
    },
    overall: function (courses, data) {
      data = data || load();
      var total = 0, done = 0;
      courses.forEach(function (c) { var p = api.courseProgress(c, data); total += p.total; done += p.done; });
      return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : null };
    }
  };

  window.CV = window.CV || {};
  window.CV.store = api;
  api.applyTheme();
})();
