/* CircuitVision — AI Tutor client.
   CV.tutor.open(context) opens a chat drawer; CV.tutor.mount(el, getContext) renders an inline chat.
   context = { key, title, problem, facts, attempt } — `facts` are engine-computed values (the only numbers the
   tutor may rely on). Replies come from POST /api/tutor (Gemini on the server; the key never reaches the page). */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  var store = {};
  try { store = JSON.parse(sessionStorage.getItem("cv.tutor") || "{}"); } catch (e) {}
  function keep() { try { sessionStorage.setItem("cv.tutor", JSON.stringify(store)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code class='ltr'>$1</code>").replace(/\n/g, "<br>"); }
  function plain(h) { var d = document.createElement("div"); d.innerHTML = String(h || ""); return d.textContent.replace(/\s+/g, " ").trim(); }

  function chat(box, getCtx) {
    var ctx = getCtx(), key = ctx.key || "general", hist = store[key] = store[key] || [];
    box.classList.add("tt");
    box.innerHTML = '<div class="tt-log" aria-live="polite"></div>' +
      '<form class="tt-form"><textarea class="input tt-in" rows="1" placeholder="' + esc(ctx.placeholder || "اكتب سؤالك…") + '" aria-label="سؤالك للمعلم"></textarea><button type="submit" class="btn btn-primary btn-sm">إرسال</button></form>' +
      '<p class="tt-note">المعلم يشرح ويوجّه، والأرقام الصحيحة تأتي من محرك الحل فقط. قد يخطئ في الشرح؛ تحقق دائمًا بنفسك.</p>';
    var log = box.querySelector(".tt-log"), form = box.querySelector(".tt-form"), inp = box.querySelector(".tt-in");
    function draw(pending) {
      log.innerHTML = (hist.length ? "" : '<p class="tt-empty">' + (ctx.empty || ((ctx.title ? "أنا معك في: <b>" + esc(ctx.title) + "</b>. " : "") + "اسأل عن أي خطوة، وسأوجّهك بدل أن أحل عنك.")) + '</p>') +
        hist.map(function (m) { return '<div class="tt-m tt-' + m.role + '">' + fmt(m.text) + '</div>'; }).join("") + (pending ? '<div class="tt-m tt-tutor tt-wait">يكتب…</div>' : "");
      log.scrollTop = log.scrollHeight;
    }
    function grow() { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight + 2, 160) + "px"; }
    inp.addEventListener("input", grow);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = inp.value.trim(); if (!t) return;
      inp.value = ""; grow(); hist.push({ role: "user", text: t }); keep(); draw(true);
      var btn = form.querySelector("button"); btn.disabled = true;
      var c = getCtx();
      fetch("/api/tutor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist.filter(function (m) { return m.role !== "sys"; }).slice(-12), context: { title: c.title, problem: c.problem, facts: c.facts, attempt: c.attempt } }) })
        .then(function (r) { return r.json().catch(function () { return { error: r.status === 404 ? "nosrv" : "bad" }; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
        .then(function (x) {
          if (x.ok && x.j.reply) hist.push({ role: "tutor", text: x.j.reply });
          else hist.push({ role: "sys", text: x.j && x.j.error && x.j.error !== "nosrv" && x.j.error !== "bad" ? x.j.error : "المعلم الذكي يعمل بعد نشر الموقع على Vercel مع مفتاح Gemini؛ هذه النسخة بلا خادم." });
        }, function () { hist.push({ role: "sys", text: "المعلم الذكي يعمل بعد نشر الموقع على Vercel مع مفتاح Gemini؛ هذه النسخة بلا خادم." }); })
        .then(function () { keep(); btn.disabled = false; draw(false); });
    });
    draw(false);
  }

  var drawer = null, curCtx = null;
  function open(ctx) {
    curCtx = ctx;
    if (!drawer) {
      drawer = document.createElement("aside");
      drawer.className = "tt-drawer"; drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-label", "المعلم الذكي");
      document.body.appendChild(drawer);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer && !drawer.hidden) drawer.hidden = true; });
    }
    drawer.hidden = false;
    drawer.innerHTML = '<div class="tt-h"><b>المعلم الذكي</b><span class="tt-t">' + esc(ctx.title || "") + '</span><button type="button" class="btn btn-ghost btn-sm tt-x" aria-label="إغلاق">✕</button></div><div class="tt-body"></div>';
    drawer.querySelector(".tt-x").addEventListener("click", function () { drawer.hidden = true; });
    chat(drawer.querySelector(".tt-body"), function () { return curCtx; });
    setTimeout(function () { var i = drawer.querySelector(".tt-in"); if (i) i.focus(); }, 30);
  }

  /* context builders ------------------------------------------------------- */
  function fromProblem(problem, lessonId, title) {
    var facts = problem.steps.map(function (s, i) {
      var ans = "";
      if (s.kind === "choice") ans = (s.options.filter(function (o) { return o.correct; })[0] || {}).t || "";
      else if (s.kind === "phasor") ans = CV.ac ? CV.ac.polar(s.answer, s.units ? s.units.filter(function (u) { return u.f === 1; })[0].l : "") + " = " + CV.ac.rect(s.answer) : "";
      else { var u = (s.units || []).filter(function (x) { return x.f === 1; })[0]; ans = CV.num(s.answer) + " " + (u ? u.l : ""); }
      return "الخطوة " + (i + 1) + ": " + plain(s.label) + " ← الإجابة الصحيحة: " + plain(ans) + (s.solution ? " (الحل: " + plain(s.solution) + ")" : "");
    }).join("\n");
    return { key: "p:" + lessonId, title: title, problem: plain(problem.prompt), facts: facts };
  }
  function fromGenerated(g, qText) {
    var facts = [];
    try {
      var q = g.question;
      facts.push("الإجابة الصحيحة: " + (q.phasor ? CV.ac.polar(q.z, q.unit) + " = " + CV.ac.rect(q.z, q.unit) : CV.fmt(q.value, q.unit)));
      var st = CV.gen.steps(g); if (st) facts.push("خطوات حل المحرك: " + st.map(plain).join(" | "));
      if (g.solution && g.solution.elements && !g.acq) facts.push("قيم العناصر (v, i, p ممتصة): " + g.solution.elements.map(function (it) { return it.edge.name + ": v=" + CV.num(it.v) + " V, i=" + CV.num(it.i) + " A, p=" + CV.num(it.p) + " W"; }).join("؛ "));
      facts.push("عناصر الدائرة: " + g.circuit.edges.filter(function (e) { return e.type !== "W" && e.type !== "T"; }).map(function (e) { return (e.name || e.type) + " (" + e.type + (e.value !== undefined ? " = " + e.value : "") + ")"; }).join("، "));
    } catch (e) {}
    return { key: "g:" + g.family + "-" + g.seed, title: "دائرة مولّدة رقم " + g.seed, problem: plain(qText), facts: facts.join("\n") };
  }

  function clear(key) { delete store[key]; keep(); }
  CV.tutor = { open: open, mount: chat, clear: clear, fromProblem: fromProblem, fromGenerated: fromGenerated };
})();
