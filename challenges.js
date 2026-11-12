/* CircuitVision — Challenges: timed and scored runs of engine-generated circuits.
   Every question is generated and solved by the engine (same generator as the practice page).
   Scoring: 10 points for a correct answer, −3 for each wrong try and −2 for each hint before it (minimum 2).
   Daily challenge: 5 questions whose seeds come from today's date, so every student gets the same circuits today.
   Scores are kept in this browser; a shared leaderboard needs student accounts (not built yet). */
(function () {
  "use strict";
  var S = CV.store, root = document.getElementById("ch-root"), $ = function (id) { return document.getElementById(id); };
  var LEVELS = [
    { id: "dc", ar: "أساسيات DC", d: "تيار وجهد وقدرة في دوائر بأشكال مختلفة", cfg: { families: ["loop", "pair", "ladder", "grid"], types: ["iR", "vR", "pR", "pSrc"] } },
    { id: "req", ar: "المقاومة المكافئة", d: "توالي وتوازي و Δ-Y", cfg: { req: true, families: ["ladder", "grid"] } },
    { id: "an", ar: "طرق التحليل", d: "جهود العقد وتيارات الحلقات والتراكب", cfg: { kinds: ["vN", "iM", "sup"], families: ["ladder", "grid"] } },
    { id: "th", ar: "ثيفنن ونورتن", d: "V<sub>Th</sub> و R<sub>Th</sub> و I<sub>N</sub> وأقصى قدرة", cfg: { kinds: ["Vth", "Rth", "In", "Pmax"], families: ["ladder", "grid"] } },
    { id: "ac", ar: "التيار المتردد", d: "فيزورات وممانعات", cfg: { ackinds: ["acI", "acV", "acZ", "acVN", "acIM"], families: ["loop", "ladder", "grid"] } },
    { id: "pw", ar: "القدرة في AC", d: "P و Q و S وأقصى نقل", cfg: { ackinds: ["acP", "acQ", "acS", "acPmax"], families: ["loop", "ladder", "grid"] } },
    { id: "mix", ar: "شامل", d: "سؤال من كل المستويات بالتناوب", mix: true }
  ];
  var MODES = [
    { id: "time", ar: "سباق الوقت", d: "أكبر عدد من النقاط في 5 دقائق. يمكنك تخطي السؤال.", secs: 300 },
    { id: "ten", ar: "10 أسئلة", d: "عشرة أسئلة بلا وقت محدد؛ نسجّل زمنك." , count: 10 },
    { id: "daily", ar: "تحدي اليوم", d: "5 أسئلة شاملة، نفس الدوائر لكل الطلاب اليوم. محاولة واحدة.", count: 5, daily: true }
  ];
  var run = null, timer = 0;
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 900000 + 100000; }
  function lvl(id) { return LEVELS.filter(function (l) { return l.id === id; })[0]; }
  function fmtT(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  /* ---------- home ---------- */
  function home() {
    clearInterval(timer); run = null;
    var c = S.get().challenges || { best: {}, runs: [], daily: {} }, done = c.daily[today()];
    root.innerHTML =
      '<header class="c-head"><span class="eyebrow ltr" style="justify-self:start">Challenges</span><h1>التحديات</h1><p>دوائر يولّدها المحرك ويحلها قبل عرضها، مع Smart Feedback. 10 نقاط للإجابة الصحيحة، تنقص 3 لكل محاولة خاطئة و 2 لكل تلميح (أقل شيء 2).</p></header>' +
      '<div class="c-modes">' + MODES.map(function (m) {
        var dis = m.daily && done;
        return '<label class="c-mode card' + (dis ? " off" : "") + '"><input type="radio" name="mode" value="' + m.id + '"' + (m.id === "time" ? " checked" : "") + (dis ? " disabled" : "") + '><b>' + m.ar + '</b><span>' + m.d + '</span>' + (m.daily ? '<span class="chip ' + (done ? "chip-ok" : "chip-build") + '">' + (done ? "أنجزته اليوم: " + done.score + " نقطة" : "متاح اليوم") + '</span>' : "") + '</label>';
      }).join("") + '</div>' +
      '<div class="card c-lv" id="lvbox"><b>المستوى</b><div class="c-lvs">' + LEVELS.map(function (l, i) {
        var best = c.best["time:" + l.id], b10 = c.best["ten:" + l.id];
        return '<label class="c-l"><input type="radio" name="lv" value="' + l.id + '"' + (i === 0 ? " checked" : "") + '><span><b>' + l.ar + '</b><small>' + l.d + '</small>' + (best || b10 ? '<small class="c-best">أفضل: ' + (best ? best.score + " (وقت)" : "") + (best && b10 ? " · " : "") + (b10 ? b10.score + " (10 أسئلة)" : "") + '</small>' : "") + '</span></label>';
      }).join("") + '</div></div>' +
      '<div class="c-go"><button type="button" class="btn btn-primary" id="go">ابدأ التحدي</button></div>' +
      (c.runs.length ? '<section class="card c-hist"><b>آخر محاولاتك</b><div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>النوع</th><th>المستوى</th><th>النقاط</th><th>الصحيحة</th></tr></thead><tbody>' + c.runs.slice(0, 8).map(function (r) {
        return '<tr><td class="ltr">' + r.at.slice(0, 10) + '</td><td>' + MODES.filter(function (m) { return m.id === r.mode; })[0].ar + '</td><td>' + (lvl(r.level) || { ar: "شامل" }).ar + '</td><td class="mono">' + r.score + '</td><td class="mono">' + r.correct + '/' + r.total + '</td></tr>';
      }).join("") + '</tbody></table></div></section>' : "") +
      '<div class="pending card"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/></svg></span><p><b>لوحة الصدارة بين الطلاب</b>' + (CV.cloud && CV.cloud.configured() ? 'في <a class="lk" href="club.html">النادي الطلابي</a>؛ سجّل الدخول لتُرسل نتائجك إليها.' : 'تعمل بعد تفعيل الحسابات (Supabase). نتائجك الآن محفوظة في هذا المتصفح.') + '</p></div>';
    function syncLv() { var m = root.querySelector("input[name=mode]:checked").value; $("lvbox").hidden = m === "daily"; }
    root.querySelectorAll("input[name=mode]").forEach(function (r) { r.addEventListener("change", syncLv); }); syncLv();
    $("go").addEventListener("click", function () {
      var m = MODES.filter(function (x) { return x.id === root.querySelector("input[name=mode]:checked").value; })[0];
      start(m, m.daily ? "mix" : root.querySelector("input[name=lv]:checked").value);
    });
  }

  /* ---------- run ---------- */
  function start(mode, level) {
    run = { mode: mode, level: level, i: 0, score: 0, correct: 0, skipped: 0, items: [], t0: Date.now(), date: today(), mistakes: {} };
    root.innerHTML = '<div class="c-bar card"><b>' + mode.ar + ' · ' + lvl(level).ar + '</b><span class="c-stat">السؤال <span class="mono" id="c-n"></span></span><span class="c-stat">النقاط <span class="mono" id="c-s">0</span></span><span class="c-stat" id="c-tw">' + (mode.secs ? 'الوقت <span class="mono" id="c-t"></span>' : 'الزمن <span class="mono" id="c-t"></span>') + '</span><span style="flex:1"></span><button type="button" class="btn btn-ghost btn-sm" id="c-quit">إنهاء</button></div>' +
      '<section class="card c-q"><div id="c-q"></div><div class="c-act"><button type="button" class="btn btn-ghost btn-sm" id="c-skip">تخطَّ</button><button type="button" class="btn btn-primary btn-sm" id="c-next" hidden>السؤال التالي ←</button></div></section>';
    $("c-quit").addEventListener("click", finish);
    $("c-skip").addEventListener("click", function () { record(false, true); nextQ(); });
    $("c-next").addEventListener("click", nextQ);
    timer = setInterval(tick, 250); tick();
    nextQ();
  }
  function tick() {
    if (!run) return;
    var el = (Date.now() - run.t0) / 1000;
    if (run.mode.secs) { var left = run.mode.secs - el; $("c-t").textContent = fmtT(left); $("c-tw").classList.toggle("warn", left < 30); if (left <= 0) finish(); }
    else $("c-t").textContent = fmtT(el);
  }
  function nextQ() {
    if (run.mode.count && run.items.length >= run.mode.count) return finish();
    var n = run.items.length, L = lvl(run.level);
    if (L.mix) L = LEVELS[n % (LEVELS.length - 1)];
    var seed = run.mode.daily ? hash(run.date + ":" + n) : Math.floor(Math.random() * 900000) + 100000;
    var cur = { level: L.id, seed: seed, wrong: 0, hints: 0, done: false, types: [] };
    run.cur = cur;
    $("c-n").textContent = (n + 1) + (run.mode.count ? "/" + run.mode.count : "");
    $("c-next").hidden = true; $("c-skip").hidden = false;
    var ctrl = CV.practice.mount($("c-q"), Object.assign({}, L.cfg, { seed: seed, hideNew: true, noSolution: true, noAutoHint: true, noTutor: true, lessonId: "challenge",
      onAttempt: function (r, g, st) {
        if (cur.done) return;
        if (r.status === "correct") { cur.hints = st.hints; record(true); }
        else if (r.status === "wrong") { cur.wrong++; if (r.type) { cur.types.push(r.type); run.mistakes[r.type] = (run.mistakes[r.type] || 0) + 1; } }
      } }));
    cur.ctrl = ctrl;
    if (!ctrl.state.gen) { record(false, true); setTimeout(nextQ, 0); }
  }
  function record(ok, skipped) {
    var cur = run.cur; if (!cur || cur.done) return; cur.done = true;
    var pts = ok ? Math.max(2, 10 - 3 * cur.wrong - 2 * (cur.ctrl ? cur.ctrl.state.hints : cur.hints)) : 0;
    run.score += pts; if (ok) run.correct++; if (skipped) run.skipped++;
    run.items.push({ level: cur.level, seed: cur.seed, ok: ok, skipped: !!skipped, pts: pts, wrong: cur.wrong, q: cur.ctrl && cur.ctrl.state.gen ? cur.ctrl.state.gen.question.kind : "" });
    $("c-s").textContent = run.score;
    if (ok) { $("c-next").hidden = false; $("c-skip").hidden = true; if (run.mode.count && run.items.length >= run.mode.count) $("c-next").textContent = "النتيجة ←"; }
  }
  function finish() {
    if (!run) return; clearInterval(timer);
    if (run.cur && !run.cur.done && run.cur.wrong) { var c0 = run.cur; c0.done = true; run.items.push({ level: c0.level, seed: c0.seed, ok: false, skipped: false, pts: 0, wrong: c0.wrong }); }
    var r = run, secs = Math.round((Date.now() - r.t0) / 1000), total = r.items.length;
    var rec = { mode: r.mode.id, level: r.level, score: r.score, correct: r.correct, total: total, secs: secs, at: new Date().toISOString(), date: r.date };
    var isBest = total ? S.saveChallenge(rec) : false;
    var top = Object.keys(r.mistakes).sort(function (a, b) { return r.mistakes[b] - r.mistakes[a]; });
    run = null;
    root.innerHTML = '<section class="card c-res"><span class="eyebrow">النتيجة</span><h1 class="mono">' + rec.score + ' <small>نقطة</small></h1>' + (isBest && rec.score > 0 ? '<p class="gp-ok">✓ أفضل نتيجة لك في هذا التحدي!</p>' : "") +
      '<div class="c-sum"><div><b class="mono">' + rec.correct + '/' + total + '</b><span>صحيحة</span></div><div><b class="mono">' + fmtT(secs) + '</b><span>الزمن</span></div><div><b class="mono">' + r.skipped + '</b><span>متخطاة</span></div></div>' +
      (top.length ? '<p><b>أكثر أخطائك في هذا التحدي:</b> ' + top.map(function (t) { return (CV.feedback.TYPES[t] ? CV.feedback.TYPES[t].ar : t) + " (" + r.mistakes[t] + ")"; }).join("، ") + '</p>' : "") +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>المستوى</th><th>دائرة رقم</th><th>النتيجة</th><th>النقاط</th></tr></thead><tbody>' + r.items.map(function (it, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + lvl(it.level).ar + '</td><td class="mono">' + it.seed + '</td><td>' + (it.ok ? "✓" + (it.wrong ? " بعد " + it.wrong + " محاولة خاطئة" : "") : it.skipped ? "متخطى" : "✗") + '</td><td class="mono">' + it.pts + '</td></tr>';
      }).join("") + '</tbody></table></div>' +
      '<div class="c-act"><button type="button" class="btn btn-primary btn-sm" id="again">تحدٍّ جديد</button></div></section>';
    $("again").addEventListener("click", home);
    if (total && CV.cloud && CV.cloud.configured()) CV.cloud.ready().then(function (c) {
      var box = document.createElement("p"); box.className = "muted"; box.style.margin = "0";
      $("again").parentNode.before(box);
      if (!c || !CV.cloud.user()) { box.innerHTML = '<a class="lk" href="club.html">سجّل الدخول في النادي</a> لتظهر نتائجك في لوحة الصدارة.'; return; }
      CV.cloud.submitScore(rec).then(function () { box.innerHTML = '✓ سُجّلت نتيجتك في <a class="lk" href="club.html">لوحة الصدارة</a>.'; }, function (x) { box.textContent = x.message; });
    });
  }
  CV.challengeState = function () { return run; }; // read-only view of the current run (used by tests)
  home();
})();
