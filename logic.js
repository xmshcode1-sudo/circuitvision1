/* CircuitVision — Logic Design Lab page: the seven EE2111 experiments, each with its explanation, the student's own
   exercises (the sheet's tables, expressions and questions, checked on the spot) and wiring tasks checked on the
   IC trainer by running the circuit through every input combination. */
(function () {
  "use strict";
  var LAB = CV.logicLab, EXP = LAB.experiments, KEY = "cv-logic-progress";
  var VIDEO = { 1: "6:48", 2: "4:34", 3: "6:48", 4: "7:02", 5: "7:26", 6: "4:13", 7: "8:12" };
  var SUB = { 7: 1 };   // videos in English with Arabic subtitles (logic-lab<n>.ar.vtt), shown by default   // logic-lab<n>.mp4, made from this page's own trainer and solutions
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function bd(s) { // Latin names inside Arabic text kept in their own direction (A على a، S على LED a)
    return String(s).split(/([A-Za-z0-9][A-Za-z0-9_'’⊕+=<>·̄\-]*(?: [A-Za-z0-9][A-Za-z0-9_'’⊕+=<>·̄\-]*)*)/).map(function (p, i) { return i % 2 ? '<bdi dir="ltr">' + esc(p) + "</bdi>" : esc(p); }).join("");
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function prog() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function mark(exp, task, ok) { var p = prog(); p[exp] = p[exp] || {}; if (ok) p[exp][task] = 1; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  function done(exp, task) { var p = prog(); return !!(p[exp] && p[exp][task]); }

  /* ---------- wiring lists: endpoints → holes, and in words ---------- */
  function holesFor(wires) {
    var cnt = {};
    function pick(ep) {
      var k = cnt[ep] = (cnt[ep] || 0) + 1, m;
      if (ep === "V5") return "p5t" + ((k * 2 + 1) % 41);
      if (ep === "G0") return "gnd" + (k * 2 % 37);
      if ((m = /^sw:([a-i])$/.exec(ep))) return "sw" + m[1] + (k % 2);
      if ((m = /^led:([a-h])$/.exec(ep))) return "led" + m[1] + (k % 2);
      if (ep === "pls") return "pls" + (k % 2);
      if ((m = /^(\d+)\.(\d+)$/.exec(ep))) return "s" + m[1] + "p" + m[2] + (k % 2 ? "a" : "b");
      return ep;
    }
    return wires.map(function (w) { return [pick(w[0]), pick(w[1])]; });
  }
  function epName(ep, chips) {
    var m;
    if (ep === "V5") return "+5V";
    if (ep === "G0") return "0V";
    if ((m = /^sw:([a-h])$/.exec(ep))) return "المفتاح " + m[1];
    if (ep === "sw:i") return "مفتاح H/L السفلي";
    if ((m = /^led:([a-h])$/.exec(ep))) return "LED " + m[1];
    if (ep === "pls") return "زر النبضة ⎍";
    if ((m = /^(\d+)\.(\d+)$/.exec(ep))) { var c = CV.chips.get(chips[m[1]]); return "الرجل " + m[2] + " (" + (c ? c.labels[m[2]] : "") + ") في المقبس " + m[1]; }
    return ep;
  }
  function wiringList(sol) {
    var items = Object.keys(sol.chips).map(function (s) { return "<li>ركّب <b class='ltr'>" + sol.chips[s] + "</b> في المقبس " + s + ".</li>"; });
    sol.wires.forEach(function (w) { items.push("<li>" + esc(epName(w[0], sol.chips)) + " ← → " + esc(epName(w[1], sol.chips)) + "</li>"); });
    return "<ol class='lg-wl'>" + items.join("") + "</ol>";
  }

  /* ---------- Boolean expressions typed by the student ---------- */
  function parseExpr(src, vars) {
    var s = String(src).replace(/[’`´]/g, "'").replace(/\s+/g, ""), i = 0, names = vars.slice().sort(function (a, b) { return b.length - a.length; });
    function err(m) { var e = new Error(m); e.user = true; throw e; }
    function bin(op, a, b) { return function (v) { return op(a(v), b(v)); }; }
    function neg(a) { return function (v) { return a(v) ? 0 : 1; }; }
    function OR(a, b) { return a | b; } function AND(a, b) { return a & b; } function XOR(a, b) { return a ^ b; }
    function orE() { var l = xorE(); while (s[i] === "+" || s[i] === "|") { i++; l = bin(OR, l, xorE()); } return l; }
    function xorE() { var l = andE(); while (s[i] === "⊕" || s[i] === "^") { i++; l = bin(XOR, l, andE()); } return l; }
    function starts() { return i < s.length && /[A-Za-z01(~!¬]/.test(s[i]); }
    function andE() { var l = notE(); for (;;) { if (s[i] && "·.*&".indexOf(s[i]) > -1) i++; else if (!starts()) break; l = bin(AND, l, notE()); } return l; }
    function notE() { if (s[i] === "~" || s[i] === "!" || s[i] === "¬") { i++; return neg(notE()); } var p = prim(); while (s[i] === "'") { i++; p = neg(p); } return p; }
    function konst(c) { return function () { return c; }; }
    function varf(n) { return function (v) { return v[n]; }; }
    function prim() {
      if (s[i] === "(") { i++; var e = orE(); if (s[i] !== ")") err("قوس غير مغلق."); i++; return e; }
      if (s[i] === "0" || s[i] === "1") return konst(+s[i++]);
      for (var k = 0; k < names.length; k++) if (s.substr(i, names[k].length) === names[k]) { i += names[k].length; used[names[k]] = 1; return varf(names[k]); }
      if (/[A-Za-z]/.test(s[i] || "")) err("المتغير «" + s[i] + "» غير موجود في هذا السؤال. المتغيرات: " + vars.join(" و ") + ".");
      err(i >= s.length ? "التعبير ناقص." : "لم أفهم الرمز «" + s[i] + "».");
    }
    var used = {};
    if (!s) err("اكتب التعبير أولًا.");
    var f = orE(); if (i < s.length) err("لم أفهم الرمز «" + s[i] + "».");
    return { f: f, used: Object.keys(used) };
  }

  /* ---------- rendering ---------- */
  var root = $("#lg-root"), trainer = null, cur = null;
  function route() {
    var id = location.hash.slice(1), e = EXP.filter(function (x) { return x.id === id; })[0];
    if (trainer) { trainer.destroy(); trainer = null; }
    clearInterval(mTimer); mTimer = 0; var oldRef = document.getElementById("lg-ref"); if (oldRef) oldRef.remove();
    var mm = /^(free|exam|fault)(?:-(exp\d+))?$/.exec(id);
    if (mm) showMode(mm[1], mm[2]);
    else if (e && !free(e)) showLocked(e); else if (e) showExp(e); else showIndex();
    window.scrollTo(0, 0);
  }
  /* subscriptions: Lab#1 is the free sample; the other labs need the Logic Design subscription */
  function free(e) { return e.n === 1 || !CV.cloud || CV.cloud.can("logic-design"); }
  function showLocked(e) {
    document.title = "Lab#" + e.n + ": " + e.en + " — CircuitVision";
    root.innerHTML = '<div class="lg-head"><span class="code ltr">Lab#' + e.n + ': ' + esc(e.en) + '</span><h1>' + esc(e.title) + '</h1></div>' + CV.cloud.lockHtml("logic-design", "هذه التجربة") +
      '<p><a class="btn btn-ghost btn-sm" href="#exp1">جرّب Lab#1 مجانًا</a></p>';
  }
  function count(e) { var t = e.tasks.length, d = e.tasks.filter(function (x) { return done(e.id, x.id); }).length; return { t: t, d: d }; }
  function showIndex() {
    document.title = "معمل التصميم المنطقي — CircuitVision";
    root.innerHTML = '<div class="lg-head"><span class="code">EE2111 · Logic Design Lab</span><h1>معمل التصميم المنطقي</h1>' +
      '<p>تجارب المعمل السبع كما في أوراق القسم. كل تجربة: الهدف والقطع، ثم الشرح خطوة بخطوة، ثم تحلّها بنفسك: تكمل جداولها، وتوصّلها على جهاز IC Trainer مطابق لجهاز المعمل، والموقع يفحص توصيلك بتجربة كل حالات المداخل.</p>' +
      '<div class="lg-cta"><a class="btn btn-primary" href="#exp1">ابدأ بـ Lab#1</a><a class="btn btn-ghost" href="#free">🧪 المعمل الحر</a></div></div>' +
      '<div class="lg-grid">' + EXP.map(function (e) { var c = count(e); return '<a class="card lg-card" href="#' + e.id + '"><span class="n">' + (free(e) ? e.n : "🔒") + '</span><div><b class="ltr lg-sheet">Lab#' + e.n + ': ' + esc(e.en) + '</b><span>' + esc(e.title) + '</span><span class="chips ltr">' + e.chips.join(" · ") + '</span><span class="pg">' + c.d + ' من ' + c.t + ' تمارين</span></div></a>'; }).join("") + '</div>' +
      '<p class="muted small">ما زالت دروس النظرية لمقرر Logic Design قيد الإعداد؛ هذه الصفحة للجزء العملي.</p>';
    root.insertAdjacentHTML("beforeend", modeCards());
    wireModeCards();
  }
  function showExp(e) {
    cur = e;
    document.title = "Lab#" + e.n + ": " + e.en + " — CircuitVision";
    var c = count(e), i = EXP.indexOf(e);
    var nav = '<nav class="lg-tabs" aria-label="التجارب">' + EXP.map(function (x) { return '<a href="#' + x.id + '" class="' + (x === e ? "cur" : "") + '"' + (x === e ? ' aria-current="page"' : "") + '><span class="n">' + x.n + '</span><span class="ltr">Lab#' + x.n + ': ' + esc(x.en) + '</span></a>'; }).join("") + '</nav>';
    var chipsHtml = e.chips.map(function (id) { var ch = CV.chips.get(id); return '<details class="lg-chip"><summary><b class="ltr">' + id + '</b> <span>' + esc(ch.ar) + '</span></summary>' + pinout(id) + '</details>'; }).join("");
    var parts = e.parts.map(function (p, k) {
      return '<section class="card lg-sec" id="' + e.id + '-' + p.id + '"><h2><span class="n">' + (k + 1) + '</span>' + esc(p.title) + '</h2><ol class="lg-steps">' + p.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ol>' +
        (p.table ? tableView(p.table.cols, p.table.rows) : "") +
        (p.demo ? '<div class="lg-demo"><b>خطوات التوصيل</b>' + wiringList(p.demo) + '<button type="button" class="btn btn-ghost btn-sm" data-demo="' + p.id + '">اعرض هذا التوصيل على الجهاز ↓</button></div>' : "") + '</section>';
    }).join("");
    var tasks = e.tasks.map(function (t, k) { return taskView(e, t, k); }).join("");
    var builds = e.tasks.filter(function (t) { return t.type === "build" || t.type === "seq"; });
    var oldRef = document.getElementById("lg-ref"); if (oldRef) oldRef.remove();
    root.innerHTML = nav +
      '<div class="lg-head"><span class="code">EE2111 · Logic Design Lab</span><h1 class="ltr lg-sheet">Lab#' + e.n + ': ' + esc(e.en) + '</h1><span class="lg-ar">' + esc(e.title) + '</span><span class="pg">' + c.d + ' من ' + c.t + ' تمارين محلولة</span><div class="lg-cta">' + (boardTasks(null, e.id).length ? '<a class="btn btn-ghost btn-sm" href="#exam-' + e.id + '">⏱ اختبار عملي</a>' : "") + (boardTasks(["build"], e.id).length ? '<a class="btn btn-ghost btn-sm" href="#fault-' + e.id + '">🔧 تدريب الأعطال</a>' : "") + '<a class="btn btn-ghost btn-sm" href="#free">🧪 المعمل الحر</a></div></div>' +
      '<div class="lg-top"><section class="card lg-sec"><h2>الهدف</h2><ul>' + e.objective.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + '</ul></section>' +
      '<section class="card lg-sec"><h2>المتطلبات</h2><p class="muted">جهاز IC Trainer، وأسلاك، والدوائر التالية (اضغط أي دائرة لترى أرجلها):</p><div class="lg-chips">' + chipsHtml + '</div>' + (e.note ? '<p class="lg-note">' + bd(e.note) + '</p>' : "") + '</section></div>' +
      (VIDEO[e.n] ? '<section class="card lg-sec lg-video"><h2>شرح التجربة بالفيديو <span class="muted small ltr">' + VIDEO[e.n] + '</span></h2><video controls playsinline preload="none" poster="logic-lab' + e.n + '.jpg" src="logic-lab' + e.n + '.mp4">' + (SUB[e.n] ? '<track kind="subtitles" srclang="ar" label="العربية" src="logic-lab' + e.n + '.ar.vtt" default>' : '') + '</video><p class="muted small">نفس الجهاز اللي تحت: التوصيل سلك سلك، ثم تجربة كل الحالات وقراءة الـ LED.</p></section>' : '') +
      '<h2 class="lg-h">الشرح خطوة بخطوة</h2>' + parts +
      '<h2 class="lg-h">حلّها بنفسك</h2><p class="muted">هذي جداول وأسئلة التجربة من الورقة. أكمل كل واحد ثم اضغط «تحقق». تمارين التوصيل تحلّها على الجهاز تحت.</p>' + tasks +
      '<section class="card lg-sec lg-bench" id="bench"><h2>الجهاز</h2>' +
      (builds.length ? '<div class="lg-bench-bar"><label>التمرين: <select id="lg-task" class="select">' + builds.map(function (t) { return '<option value="' + t.id + '">' + esc(t.title) + '</option>'; }).join("") + '</select></label>' +
        '<button type="button" class="btn btn-primary btn-sm" id="lg-check">تحقق من توصيلي</button><button type="button" class="btn btn-ghost btn-sm" id="lg-sol">اعرض الحل على الجهاز</button><button type="button" class="btn btn-ghost btn-sm" id="lg-new">لوحة فارغة</button><button type="button" class="btn btn-ghost btn-sm" id="lg-ref-open">الرسمة المرجعية</button></div><div id="lg-task-note" class="lg-note"></div><div id="lg-out" class="lg-out" aria-live="polite"></div>' : "") +
      '<div id="lg-tr"></div></section>' +
      '<div class="lg-pn">' + (i > 0 ? '<a class="btn btn-ghost" href="#' + EXP[i - 1].id + '">→ Lab#' + EXP[i - 1].n + '</a>' : "<span></span>") + (i < EXP.length - 1 ? '<a class="btn btn-ghost" href="#' + EXP[i + 1].id + '">Lab#' + EXP[i + 1].n + ' ←</a>' : "") + '</div>';
    trainer = CV.trainer.mount($("#lg-tr"), { key: e.id });
    wireTasks(e);
  }
  function pinout(id) {
    var c = CV.chips.get(id), half = c.pins / 2, rows = "";
    for (var i = 1; i <= half; i++) rows += '<tr><td>' + i + '</td><td>' + esc(c.labels[i]) + '</td><td class="ic"></td><td>' + esc(c.labels[c.pins + 1 - i]) + '</td><td>' + (c.pins + 1 - i) + '</td></tr>';
    return '<table class="lg-pin ltr"><tbody>' + rows + '</tbody></table>';
  }
  function tableView(cols, rows) {
    return '<div class="lg-tw"><table class="lg-t ltr"><thead><tr>' + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + '</tr></thead><tbody>' + rows.map(function (r) { return "<tr>" + r.map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>"; }).join("") + '</tbody></table></div>';
  }
  function head(e, t, k) { return '<div class="lg-th"><span class="n' + (done(e.id, t.id) ? " ok" : "") + '">' + (k + 1) + '</span><b>' + esc(t.title) + '</b></div>'; }
  function taskView(e, t, k) {
    var h = '<section class="card lg-task" id="t-' + t.id + '" data-t="' + t.id + '">' + head(e, t, k);
    if (t.type === "table") {
      var nin = t.nin;
      h += '<div class="lg-tw"><table class="lg-t ltr lg-fill"><thead><tr>' + t.cols.map(function (c, j) { return '<th' + (j >= nin ? ' class="o"' : "") + '>' + esc(c) + '</th>'; }).join("") + '</tr></thead><tbody>' +
        t.rows.map(function (r, i) {
          return "<tr>" + r.map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + t.cols.slice(nin).map(function (_, j) {
            var col = nin + j, opts = t.options && t.options[col];
            if (opts) return '<td class="o"><select data-r="' + i + '" data-c="' + col + '"><option value=""></option>' + opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join("") + '</select></td>';
            if (t.text) return '<td class="o"><input data-r="' + i + '" data-c="' + col + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="' + esc(t.cols[col]) + ' — السطر ' + (i + 1) + '"></td>';
            return '<td class="o"><button type="button" class="bit" data-r="' + i + '" data-c="' + col + '" aria-label="' + esc(t.cols[col]) + ' — السطر ' + (i + 1) + '">·</button></td>';
          }).join("") + "</tr>";
        }).join("") + '</tbody></table></div>' + (t.text ? "" : '<p class="muted small">اضغط الخانة لتبدّل بين 0 و 1' + (t.accept ? ' و X' : "") + '.</p>');
    } else if (t.type === "expr") {
      h += '<div class="lg-expr"><input class="input ltr" data-x autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="مثال للصيغة فقط: a\'b + c(d⊕e)" aria-label="التعبير"><span class="lg-keys">' + ["'", "⊕", "+", "(", ")"].map(function (k) { return '<button type="button" class="btn btn-ghost btn-sm" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join("") + '</span></div><p class="muted small">المتغيرات: <span class="ltr">' + t.vars.join(", ") + "</span> · اكتب ' للنفي (مثل y') و + لـ OR والكتابة المتجاورة لـ AND و ⊕ أو ^ لـ XOR.</p>";
    } else if (t.type === "mcq") {
      h += '<div class="lg-mcq">' + t.options.map(function (o, j) { return '<button type="button" class="btn btn-ghost btn-sm" data-o="' + j + '">' + esc(o) + '</button>'; }).join("") + '</div>';
    } else if (t.type === "pins") {
      h += '<div class="lg-pins">' + t.rows.map(function (r, i) { return '<label><span>' + esc(r[0]) + '</span><input class="input ltr" data-p="' + i + '" inputmode="numeric" autocomplete="off" placeholder="' + (r[1].length > 1 ? "مثل 4, 3" : "رقم") + '"></label>'; }).join("") + '</div><p class="muted small">اكتب الأرقام بالترتيب، تفصل بينها فاصلة.</p>';
    } else if (t.type === "build" || t.type === "seq") {
      var io = (t.inputs || []).map(function (x) { return '<li><span class="ltr">' + esc(x[1]) + '</span> ← ' + (x[0] === "i" ? "مفتاح H/L السفلي" : "المفتاح " + x[0]) + '</li>'; }).join("") +
        (t.outputs || []).map(function (x) { return '<li><span class="ltr">' + esc(x[1]) + '</span> → LED ' + x[0] + '</li>'; }).join("") +
        (t.type === "seq" ? '<li>CLK ← زر النبضة ⎍</li>' : "");
      h += (t.note ? '<p>' + bd(t.note) + '</p>' : "") + (io ? '<ul class="lg-io">' + io + '</ul>' : "") + '<button type="button" class="btn btn-primary btn-sm" data-go>ابدأ على الجهاز ↓</button>';
      return h + '<div class="lg-res" aria-live="polite"></div></section>';
    }
    return h + '<div class="lg-act"><button type="button" class="btn btn-primary btn-sm" data-check>تحقق</button></div><div class="lg-res" aria-live="polite"></div></section>';
  }

  /* ---------- checking ---------- */
  function norm(v) { return String(v).trim().replace(/[’`´]/g, "'").replace(/\s+/g, "").toLowerCase(); }
  function res(el, ok, html) { var r = $(".lg-res", el); r.className = "lg-res " + (ok ? "ok" : "bad"); r.innerHTML = html; if (ok) { var n = $(".lg-th .n", el); if (n) n.classList.add("ok"); } }
  function wireTasks(e) {
    root.querySelectorAll(".lg-task").forEach(function (el) {
      var t = e.tasks.filter(function (x) { return x.id === el.dataset.t; })[0];
      el.querySelectorAll("button.bit").forEach(function (b) {
        var cyc = t.accept ? ["·", "0", "1", "X"] : ["·", "0", "1"];
        b.addEventListener("click", function () { var k = (cyc.indexOf(b.textContent) + 1) % cyc.length; b.textContent = cyc[k]; b.classList.remove("bad", "good"); });
      });
      el.querySelectorAll(".lg-mcq [data-o]").forEach(function (b) {
        b.addEventListener("click", function () {
          var ok = +b.dataset.o === t.answer;
          el.querySelectorAll(".lg-mcq [data-o]").forEach(function (x) { x.classList.remove("good", "bad"); });
          b.classList.add(ok ? "good" : "bad");
          res(el, ok, (ok ? "صحيح ✓ " : "ليست هذه. ") + esc(ok ? t.why || "" : "فكّر مرة ثانية" + (t.why ? "، أو جرّبها على الجهاز." : ".")));
          if (ok) mark(e.id, t.id, 1);
        });
      });
      var go = $("[data-go]", el); if (go) go.addEventListener("click", function () { $("#lg-task").value = t.id; showTaskNote(); refPanel(e, t, true); $("#bench").scrollIntoView({ behavior: "smooth" }); });
      var ck = $("[data-check]", el); if (ck) ck.addEventListener("click", function () { check(e, t, el); });
      el.querySelectorAll("[data-k]").forEach(function (b) { b.addEventListener("click", function () { var x = $("[data-x]", el), p = x.selectionStart == null ? x.value.length : x.selectionStart; x.value = x.value.slice(0, p) + b.dataset.k + x.value.slice(x.selectionEnd == null ? p : x.selectionEnd); x.focus(); try { x.setSelectionRange(p + 1, p + 1); } catch (er) {} }); });
    });
    root.querySelectorAll("[data-demo]").forEach(function (b) {
      b.addEventListener("click", function () { var p = e.parts.filter(function (x) { return x.id === b.dataset.demo; })[0]; load(p.demo); $("#bench").scrollIntoView({ behavior: "smooth" }); });
    });
    var sel = $("#lg-task"); if (!sel) return;
    sel.addEventListener("change", function () { showTaskNote(); refPanel(e, curTask(), false); }); showTaskNote(); refPanel(e, curTask(), false, true);
    var rb = $("#lg-ref-open"); if (rb) rb.addEventListener("click", function () { refPanel(e, curTask(), true); });
    $("#lg-check").addEventListener("click", function () { var t = curTask(); boardCheck(e, t); });
    var solBtn = $("#lg-sol");
    solBtn.addEventListener("click", function () {
      clearTimeout(solBtn._t);
      if (!solBtn.dataset.sure) { solBtn.dataset.sure = "1"; solBtn.textContent = "سيمسح توصيلك — اضغط مرة ثانية"; solBtn._t = setTimeout(function () { delete solBtn.dataset.sure; solBtn.textContent = "اعرض الحل على الجهاز"; }, 3500); return; }
      delete solBtn.dataset.sure; solBtn.textContent = "اعرض الحل على الجهاز";
      var t = curTask(); load(t.sol); $("#lg-out").className = "lg-out"; $("#lg-out").innerHTML = "<b>هذا حلّ واحد صحيح، وفيه خطوات التوصيل:</b>" + wiringList(t.sol) + "<p class='muted small'>جرّب المفاتيح وراقب الـ LED، ثم امسح اللوحة وحاول توصيلها بنفسك.</p>";
    });
    $("#lg-new").addEventListener("click", function () { trainer.reset(); $("#lg-out").innerHTML = ""; });
  }
  /* ---------- reference drawing: a small panel pinned top-right while the student wires (the sheet's figure, no answers) ---------- */
  var REF_KEY = "cv-logic-ref-min";
  function refPanel(e, t, open, quiet) {
    var box = document.getElementById("lg-ref"), fig = t && CV.logicFigs ? CV.logicFigs.get(e.id, t) : null;
    if (!fig) { if (box) box.remove(); return; }
    if (!box) {
      box = document.createElement("aside"); box.id = "lg-ref"; box.className = "lg-ref"; box.setAttribute("aria-label", "الرسمة المرجعية");
      document.body.appendChild(box);
      box.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-ref]"); if (!b) return;
        var min = b.dataset.ref === "min"; box.classList.toggle("min", min);
        try { localStorage.setItem(REF_KEY, min ? "1" : "0"); } catch (x) {}
      });
    }
    var min; try { min = localStorage.getItem(REF_KEY) === "1"; } catch (x) { min = false; }
    if (open) { min = false; try { localStorage.setItem(REF_KEY, "0"); } catch (x) {} }
    if (quiet && !open) min = true;
    box.classList.toggle("min", min);
    box.innerHTML = '<button type="button" class="lg-ref-pill" data-ref="open" aria-label="أظهر الرسمة المرجعية">📐 الرسمة</button>' +
      '<div class="lg-ref-card"><div class="lg-ref-h"><div><b>' + esc(fig.title) + '</b><span>' + bd(t.title) + '</span></div><button type="button" class="lg-ref-x" data-ref="min" aria-label="أخفِ الرسمة" title="أخفِ">×</button></div>' +
      '<div class="lg-ref-b">' + (fig.svg ? '<div class="lg-ref-fig">' + fig.svg + '</div>' : "") +
      fig.chips.map(function (id) { var c = CV.chips.get(id); return '<details class="lg-ref-ic"' + (fig.svg ? "" : " open") + '><summary>أرجل <span class="ltr">' + id + '</span>' + (c ? ' · ' + esc(c.ar) : "") + '</summary>' + CV.logicFigs.pinout(id) + '</details>'; }).join("") +
      '<p class="lg-ref-note">مرجع من ورقة التجربة، بدون الحل.</p></div></div>';
  }
  function curTask() { var id = $("#lg-task").value; return cur.tasks.filter(function (x) { return x.id === id; })[0]; }
  function showTaskNote() { var t = curTask(); if (!t) return; $("#lg-task-note").innerHTML = bd(t.note || ""); $("#lg-out").innerHTML = ""; }
  function load(sol) {
    trainer.reset();
    Object.keys(sol.chips).forEach(function (s) { trainer.state.chips[s] = sol.chips[s]; });
    holesFor(sol.wires).forEach(function (w) { trainer.addWire(w[0], w[1]); });
    Object.keys(sol.chips).forEach(function (s) { trainer.placeChip(s, sol.chips[s]); });
  }
  function check(e, t, el) {
    if (t.type === "table") {
      var bad = 0, empty = 0, all = t.rows, fns = [t.answer].concat((t.alts || []).map(function (a) { return a.fn; })), pick = 0;
      if (fns.length > 1) {   // several correct readings (e.g. DEMUX1 or DEMUX2 of the 74155): grade against the one the student followed
        var score = fns.map(function (fn) { var s = 0; all.forEach(function (r, i) { fn(r, i, all).forEach(function (w, j) { var f = el.querySelector('[data-r="' + i + '"][data-c="' + (t.nin + j) + '"]'), v = f.tagName === "BUTTON" ? f.textContent : f.value; if (v !== "·" && v !== "" && norm(w) !== norm(v)) s++; }); }); return s; });
        pick = score.indexOf(Math.min.apply(null, score));
      }
      all.forEach(function (r, i) {
        var want = fns[pick](r, i, all);
        want.forEach(function (w, j) {
          var col = t.nin + j, f = el.querySelector('[data-r="' + i + '"][data-c="' + col + '"]'), v = f.tagName === "BUTTON" ? f.textContent : f.value;
          if (v === "·" || v === "") { empty++; f.classList.remove("good", "bad"); return; }
          var acc = (t.accept && t.accept[i + "," + col]) || [w], ok = acc.some(function (a) { return norm(a) === norm(v); });
          f.classList.toggle("good", ok); f.classList.toggle("bad", !ok); if (!ok) bad++;
        });
      });
      if (empty) return res(el, false, "باقي " + empty + " خانة فاضية.");
      if (bad) return res(el, false, "فيه " + bad + " خانة خطأ (باللون الأحمر). راجعها" + (t.type === "table" && t.nin <= 4 ? "، أو وصّل الدائرة على الجهاز وجرّب نفس المداخل." : "."));
      mark(e.id, t.id, 1); return res(el, true, "الجدول صحيح ✓" + (pick ? " " + esc(t.alts[pick - 1].say) : t.say ? " " + esc(t.say) : ""));
    }
    if (t.type === "expr") {
      var inp = $("[data-x]", el), p;
      try { p = parseExpr(inp.value, t.vars); } catch (x) { if (!x.user) throw x; return res(el, false, esc(x.message)); }
      if (t.only) { var extra = p.used.filter(function (u) { return t.vars.indexOf(u) < 0; }); if (extra.length) return res(el, false, "استخدم " + t.vars.join(" و ") + " فقط."); }
      var n = t.vars.length;
      for (var m = 0; m < (1 << n); m++) {
        var env = {}; t.vars.forEach(function (v, i) { env[v] = (m >> (n - 1 - i)) & 1; });
        var got = p.f(env), want = t.fn(env) ? 1 : 0;
        if (got !== want) return res(el, false, "تعبيرك لا يطابق: عند " + t.vars.map(function (v) { return v + " = " + env[v]; }).join("، ") + " يعطي " + got + " والصحيح " + want + ".");
      }
      mark(e.id, t.id, 1); return res(el, true, "صحيح ✓ تعبيرك يطابق الدالة في كل الحالات." + (t.why ? " " + esc(t.why) : ""));
    }
    if (t.type === "pins") {
      var wrong = 0;
      t.rows.forEach(function (r, i) {
        var f = el.querySelector('[data-p="' + i + '"]'), got = (f.value.match(/\d+/g) || []).map(Number), ok = got.length === r[1].length && got.every(function (x, k) { return x === r[1][k]; });
        f.classList.toggle("good", ok); f.classList.toggle("bad", !ok); if (!ok) wrong++;
      });
      if (wrong) return res(el, false, wrong + " سطر غير صحيح. افتح أرجل الدائرة في «المتطلبات» فوق.");
      mark(e.id, t.id, 1); return res(el, true, "أرقام الأرجل صحيحة ✓");
    }
  }
  function boardCheck(e, t) {
    var out = $("#lg-out"), el = root.querySelector('[data-t="' + t.id + '"]');
    trainer.update();
    var errs = trainer.issues().filter(function (x) { return x.sev === "err" || /مطفأ/.test(x.t); });
    if (errs.length) { out.className = "lg-out bad"; out.innerHTML = "<b>قبل الفحص:</b><ul>" + errs.map(function (x) { return "<li>" + esc(x.t) + "</li>"; }).join("") + "</ul>"; return; }
    var outs = t.probes ? t.probes : (t.outputs || []).map(function (o) { return o[0]; }), names = t.probes ? t.probes.map(function (p) { return p.name; }) : (t.outputs || []).map(function (o) { return o[1]; });
    if (t.type === "seq") {
      var got = trainer.sequence(t.steps, outs), k;
      for (k = 0; k < t.steps.length; k++) {
        var w = t.steps[k].want, g = got[k];
        if (!w.every(function (x, j) { return x === g[j]; })) {
          var how = t.steps.slice(0, k + 1).map(function (s) { return s.say; }).filter(Boolean).pop() || "";
          out.className = "lg-out bad";
          out.innerHTML = "توقف الفحص عند الخطوة " + (k + 1) + (how ? " (" + esc(how) + ")" : "") + ": المتوقع " + names.map(function (n, j) { return n + " = " + w[j]; }).join("، ") + "، والموجود " + names.map(function (n, j) { return n + " = " + lv(g[j]); }).join("، ") + ".";
          return;
        }
      }
      mark(e.id, t.id, 1); out.className = "lg-out ok"; out.innerHTML = "توصيلك صحيح ✓ الدائرة مرّت بكل الخطوات: " + t.steps.map(function (s) { return s.say; }).filter(Boolean).map(esc).join(" ← ") + ".";
      if (el) res(el, true, "تم على الجهاز ✓"); return;
    }
    var ins = t.inputs.map(function (x) { return x[0]; }), rows = trainer.table(ins, outs, t.fn), bad = rows.filter(function (r) { return !r.ok; });
    var okMsg = function (extra) { mark(e.id, t.id, 1); out.className = "lg-out ok"; out.innerHTML = "توصيلك صحيح ✓ جرّبت كل الحالات (" + rows.length + ") وكلها تطابق." + (extra || ""); if (el) res(el, true, "تم على الجهاز ✓"); };
    if (!bad.length) return okMsg();
    if (!t.probes) {
      var fl = flexMatch(t);
      if (fl) return okMsg(" " + (fl.say ? esc(fl.say) + " " : "") + (fl.moved ? "وصّلتها على مفاتيح أو LED غير المقترحة، ولا مشكلة: " + fl.map + "." : ""));
    }
    var floating = bad.some(function (r) { return r.got.some(function (v) { return v === null; }); });
    out.className = "lg-out bad";
    out.innerHTML = "<b>" + bad.length + " من " + rows.length + " حالة لا تطابق.</b>" + (floating ? " فيه مخرج غير موصول (عائم): تأكد أن الـ LED موصول بمخرج البوابة." : "") + "<ul>" + bad.slice(0, 6).map(function (r) {
      var diff = r.want.map(function (w, j) { return w !== null && w !== r.got[j] ? names[j] + ": المتوقع " + w + " والموجود " + lv(r.got[j]) : null; }).filter(Boolean);
      return "<li>عند " + t.inputs.map(function (x, j) { return x[1] + " = " + r.in[j]; }).join("، ") + " ← " + diff.join("؛ ") + "</li>";
    }).join("") + "</ul>" + (bad.length > 6 ? "<p class='muted small'>و" + (bad.length - 6) + " حالات أخرى.</p>" : "");
  }
  /* the circuit may be right but on other switches/LEDs than the suggested ones, or follow another correct reading (t.alts):
     try every way the wired switches can carry the inputs, and look for an LED that shows each output */
  function flexMatch(t) {
    var u = trainer.used(), k = t.inputs.length, m = t.outputs.length, fns = [{ fn: t.fn }].concat(t.alts || []);
    var sws = u.sw.length >= k && u.sw.length <= 6 ? u.sw : null, leds = u.led.length >= m ? u.led : null;
    if (!sws || !leds) return null;
    var perms = [];
    (function rec(cur, left) { if (cur.length === k) { perms.push(cur.slice()); return; } left.forEach(function (s, i) { cur.push(s); rec(cur, left.slice(0, i).concat(left.slice(i + 1))); cur.pop(); }); })([], sws);
    for (var pi = 0; pi < perms.length; pi++) {
      var P = perms[pi], rows = trainer.table(P, leds, function () { return leds.map(function () { return null; }); });
      for (var fi = 0; fi < fns.length; fi++) {
        var want = rows.map(function (r) { return fns[fi].fn(r.in); }), taken = {}, assign = [];
        var okAll = t.outputs.every(function (o, j) {
          for (var li = 0; li < leds.length; li++) {
            if (taken[li]) continue;
            if (rows.every(function (r, ri) { var w = want[ri][j]; return w === null || w === r.got[li]; })) { taken[li] = 1; assign.push(leds[li]); return true; }
          }
          return false;
        });
        if (okAll) {
          var moved = P.some(function (s, i) { return s !== t.inputs[i][0]; }) || assign.some(function (l, j) { return l !== t.outputs[j][0]; });
          return { say: fi ? fns[fi].say : "", moved: moved,
            map: t.inputs.map(function (x, i) { return x[1] + " على المفتاح " + P[i]; }).concat(t.outputs.map(function (o, j) { return o[1] + " على LED " + assign[j]; })).join("، ") };
        }
      }
    }
    return null;
  }
  function lv(v) { return v === null || v === undefined ? "عائم" : v; }

  /* ======================= free lab, practical exam and troubleshooting (#free, #exam, #fault) =======================
     All on the same trainer. Every check runs the circuit through all its input combinations (trainer.table / sequence),
     exactly like «تحقق من توصيلي» in the experiments. Only the labs the student can open are used. */
  var mTimer = 0, EXAM_K = "cv-logic-exam", EXAM_LOG = "cv-logic-exam-log", FAULT_K = "cv-logic-fault", FAULT_LOG = "cv-logic-fault-log";
  function mls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (x) { return null; } }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function boardTasks(types, only) {
    var out = [];
    EXP.forEach(function (e) { if (!free(e) || (only && e.id !== only)) return; e.tasks.forEach(function (t) { if ((types || ["build", "seq"]).indexOf(t.type) > -1 && t.sol) out.push({ e: e, t: t }); }); });
    return out;
  }
  function findTask(eid, tid) { var e = EXP.filter(function (x) { return x.id === eid; })[0], t = e && e.tasks.filter(function (x) { return x.id === tid; })[0]; return t ? { e: e, t: t } : null; }
  function ioList(t) {
    return (t.inputs || []).map(function (x) { return '<li><span class="ltr">' + esc(x[1]) + '</span> ← ' + (x[0] === "i" ? "مفتاح H/L السفلي" : "المفتاح " + x[0]) + '</li>'; }).join("") +
      (t.outputs || []).map(function (x) { return '<li><span class="ltr">' + esc(x[1]) + '</span> → LED ' + x[0] + '</li>'; }).join("") + (t.type === "seq" ? '<li>CLK ← زر النبضة ⎍</li>' : "");
  }
  /* how much of a task the board passes: { ok, done, total, err } */
  function grade(t) {
    trainer.update();
    var errs = trainer.issues().filter(function (x) { return x.sev === "err" || /مطفأ/.test(x.t); });
    if (errs.length) return { ok: false, done: 0, total: 1, err: errs.map(function (x) { return x.t; }) };
    var outs = t.probes ? t.probes : (t.outputs || []).map(function (o) { return o[0]; });
    if (t.type === "seq") {
      var got = trainer.sequence(t.steps, outs), k = 0;
      while (k < t.steps.length && t.steps[k].want.every(function (x, j) { return x === got[k][j]; })) k++;
      return { ok: k === t.steps.length, done: k, total: t.steps.length };
    }
    var rows = trainer.table(t.inputs.map(function (x) { return x[0]; }), outs, t.fn), good = rows.filter(function (r) { return r.ok; }).length;
    if (good < rows.length && !t.probes && flexMatch(t)) good = rows.length;
    return { ok: good === rows.length, done: good, total: rows.length };
  }
  function modeHead(code, title, sub) { return '<nav class="lg-tabs"><a href="#">← معمل التصميم المنطقي</a></nav><div class="lg-head"><span class="code">EE2111 · Logic Design Lab · ' + code + '</span><h1>' + title + '</h1>' + (sub ? '<span class="lg-ar">' + sub + '</span>' : "") + '</div>'; }
  function figHtml(e, t) { var f = CV.logicFigs ? CV.logicFigs.get(e.id, t) : null; return f && f.svg ? '<div class="cl-fig md-fig">' + f.svg + '</div>' : ""; }
  function showMode(id, only) {
    if (id === "free") return showFree();
    if (id === "exam") return showLExam(only);
    return showLFault(only);
  }
  function showFree() {
    var list = boardTasks();
    document.title = "المعمل الحر — معمل التصميم المنطقي — CircuitVision";
    root.innerHTML = modeHead("Free lab", "المعمل الحر", "") +
      '<section class="card lg-sec lg-bench" id="bench"><h2>الجهاز</h2><p class="muted small">ركّب أي دائرة تبيها بأي شرائح. وتبي تتأكد من دائرة من التجارب؟ اخترها وتحقق: أي توصيل يعطي نفس الجدول ينقبل، حتى لو على مفاتيح أو LED غير المقترحة.</p>' +
      '<div class="lg-bench-bar"><label>قارن بتمرين: <select id="lg-task" class="select">' + EXP.filter(free).map(function (e) { var ts = list.filter(function (x) { return x.e === e; }); return ts.length ? '<optgroup label="Lab#' + e.n + ': ' + esc(e.title) + '">' + ts.map(function (x) { return '<option value="' + e.id + "/" + x.t.id + '">' + esc(x.t.title) + '</option>'; }).join("") + '</optgroup>' : ""; }).join("") + '</select></label>' +
      '<button type="button" class="btn btn-primary btn-sm" id="fr-check">تحقق من توصيلي</button><button type="button" class="btn btn-ghost btn-sm" id="fr-ref">📐 الرسمة</button><button type="button" class="btn btn-ghost btn-sm" id="fr-clear">امسح الجهاز</button></div>' +
      '<p class="muted small" id="lg-task-note"></p><div class="lg-out" id="lg-out" aria-live="polite"></div><div id="lg-tr"></div></section>';
    trainer = CV.trainer.mount($("#lg-tr"), { key: "logic-free" });
    function sel() { var v = $("#lg-task").value.split("/"); return findTask(v[0], v[1]); }
    function note() { var x = sel(); if (!x) return; $("#lg-task-note").innerHTML = bd(x.t.note || ""); $("#lg-out").innerHTML = ""; refPanel(x.e, x.t, false, true); }
    $("#lg-task").addEventListener("change", note); note();
    $("#fr-check").onclick = function () { var x = sel(); if (x) { cur = x.e; boardCheck(x.e, x.t); } };
    $("#fr-ref").onclick = function () { var x = sel(); if (x) refPanel(x.e, x.t, true); };
    $("#fr-clear").onclick = function () { trainer.reset(); $("#lg-out").innerHTML = ""; };
  }
  function showLExam(only) {
    var c = mls(EXAM_K), pool = boardTasks(null, only);
    if (!pool.length) { root.innerHTML = modeHead("Practical exam", "اختبار عملي", "") + '<p>لا توجد مهمة توصيل في هذه التجربة.</p>'; return; }
    if (!c || c.done || !findTask(c.e, c.t) || (c.only || "") !== (only || "")) { var x0 = rnd(pool); c = { e: x0.e.id, t: x0.t.id, only: only || "", start: Date.now(), mins: +(mls("cv-logic-exam-mins") || 20), done: false, fresh: true }; mls(EXAM_K, c); }
    var x = findTask(c.e, c.t), e = x.e, t = x.t;
    document.title = "اختبار عملي — معمل التصميم المنطقي — CircuitVision";
    root.innerHTML = modeHead("Practical exam", "اختبار عملي", "Lab#" + e.n + ": " + esc(e.title)) +
      '<section class="card lg-sec md-bar"><div class="md-timer" id="md-timer" aria-live="off"></div><p class="muted small">وصّل الدائرة على الجهاز، ثم «سلّم». ما فيه «اعرض الحل» ولا تحقق قبل التسليم. الدرجة من عدد الحالات اللي تطابق.</p></section>' +
      '<section class="card lg-sec"><h2>المهمة</h2><b>' + bd(t.title) + '</b>' + (t.note ? '<p>' + bd(t.note) + '</p>' : "") + figHtml(e, t) + '<ul class="lg-io">' + ioList(t) + '</ul>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-submit">سلّم</button><button type="button" class="btn btn-ghost" id="md-new">مهمة ثانية</button></div><div class="lg-res" id="md-res" aria-live="polite"></div></section>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>الجهاز</h2><div id="lg-tr"></div></section>';
    trainer = CV.trainer.mount($("#lg-tr"), { key: "logic-exam" });
    if (c.fresh) { trainer.reset(); c.fresh = false; mls(EXAM_K, c); }
    function submit(auto) {
      if (c.done && !auto) return;
      clearInterval(mTimer);
      var g = grade(t), score = g.err ? 0 : Math.round(100 * g.done / g.total);
      c.done = true; c.score = score; mls(EXAM_K, c);
      var log = mls(EXAM_LOG) || []; log.unshift({ e: e.id, t: t.id, score: score, at: Date.now() }); mls(EXAM_LOG, log.slice(0, 30));
      if (score === 100) mark(e.id, t.id, 1);
      var r = $("#md-res"); r.className = "lg-res " + (score >= 60 ? "ok" : "bad");
      r.innerHTML = '<div class="md-score"><b class="ltr">' + score + ' / 100</b>' + (auto ? '<span>(انتهى الوقت وسُلّم تلقائيًا)</span>' : "") + '</div>' +
        (g.err ? "<b>الجهاز فيه مشكلة تمنع الفحص:</b><ul>" + g.err.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>"
          : "<p>" + (t.type === "seq" ? "مرّت الدائرة بـ " + g.done + " من " + g.total + " خطوة." : g.done + " من " + g.total + " حالة تطابق.") + "</p>") +
        '<details><summary>توصيل صحيح للمقارنة</summary>' + wiringList(t.sol) + '</details>';
      $("#md-submit").disabled = true;
    }
    function tick() {
      var left = c.start + c.mins * 60000 - Date.now(), el = $("#md-timer"); if (!el) return;
      if (left <= 0) { el.textContent = "انتهى الوقت"; submit(true); return; }
      var m = Math.floor(left / 60000), s2 = Math.floor(left % 60000 / 1000);
      el.innerHTML = '<span>الوقت المتبقي</span><b class="ltr">' + m + ":" + (s2 < 10 ? "0" : "") + s2 + '</b>'; el.classList.toggle("low", left < 120000);
    }
    $("#md-submit").onclick = function () { submit(false); };
    $("#md-new").onclick = function () { c.done = true; mls(EXAM_K, c); route(); };
    if (c.done) { $("#md-submit").disabled = true; $("#md-res").className = "lg-res"; $("#md-res").textContent = "سلّمت هذه المهمة ودرجتك " + c.score + " / 100. اضغط «مهمة ثانية» لاختبار جديد."; }
    else { mTimer = setInterval(tick, 1000); tick(); }
  }
  /* a fault: the right wiring of a task with one wire missing, or one end moved to another pin of the same chip */
  function mutate(sol) {
    var w = sol.wires, k = Math.floor(Math.random() * w.length), a = w[k], kind = Math.random() < 0.45 ? "miss" : "move";
    function chipEnd(ep) { return /^\d+\.\d+$/.test(ep); }
    if (/^(V5|G0)$/.test(a[0]) || /^(V5|G0)$/.test(a[1])) return null;
    var nw = w.slice(), say;
    if (kind === "miss") { nw.splice(k, 1); say = "السلك بين «" + epName(a[0], sol.chips) + "» و«" + epName(a[1], sol.chips) + "» ناقص."; }
    else {
      var j = chipEnd(a[1]) ? 1 : chipEnd(a[0]) ? 0 : -1; if (j < 0) return null;
      var m = /^(\d+)\.(\d+)$/.exec(a[j]), c = CV.chips.get(sol.chips[m[1]]); if (!c) return null;
      var pins = []; for (var p2 = 1; p2 <= c.pins; p2++) if (p2 !== +m[2] && !/^(VCC|GND|NC)$/i.test(String(c.labels[p2]))) pins.push(p2);
      if (!pins.length) return null;
      var to = m[1] + "." + rnd(pins), na = a.slice(); na[j] = to; nw[k] = na;
      say = "طرف السلك اللي المفروض على «" + epName(a[j], sol.chips) + "» موصول على «" + epName(to, sol.chips) + "»، والطرف الثاني على «" + epName(a[1 - j], sol.chips) + "».";
    }
    return { sol: { chips: sol.chips, wires: nw }, say: say };
  }
  function showLFault(only) {
    var c = mls(FAULT_K), pool = boardTasks(["build"], only);
    document.title = "تدريب الأعطال — معمل التصميم المنطقي — CircuitVision";
    root.innerHTML = modeHead("Troubleshooting", "تدريب الأعطال", "") + '<section class="card lg-sec" id="md-task"></section>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>الجهاز</h2><div class="lg-out" id="lg-out" aria-live="polite"></div><div id="lg-tr"></div></section>';
    trainer = CV.trainer.mount($("#lg-tr"), { key: "logic-fault" });
    if (!c || c.done || !findTask(c.e, c.t) || (c.only || "") !== (only || "")) {
      c = null;
      for (var i = 0; i < 40 && !c; i++) {
        var x0 = rnd(pool), f = mutate(x0.t.sol); if (!f) continue;
        load(f.sol); var g = grade(x0.t);
        if (!g.ok) c = { e: x0.e.id, t: x0.t.id, only: only || "", sol: f.sol, say: f.say, tries: 0, done: false };
      }
      if (!c) { $("#md-task").innerHTML = "<p>تعذّر تجهيز عطل الآن. حدّث الصفحة.</p>"; return; }
      mls(FAULT_K, c);
    }
    var x = findTask(c.e, c.t), e = x.e, t = x.t;
    $("#md-task").innerHTML = '<h2>المهمة</h2><p>الدائرة على الجهاز تحت مركّبة ومشغّلة، لكن فيها <b>خطأ واحد في التوصيل</b>: سلك ناقص، أو سلك طرفه على رجل غلط. جرّب المفاتيح وراقب الـ LED، لقِ الخطأ وصلّحه، ثم «تحقق».</p>' +
      '<b>Lab#' + e.n + ' · ' + bd(t.title) + '</b>' + (t.note ? '<p>' + bd(t.note) + '</p>' : "") + figHtml(e, t) + '<ul class="lg-io">' + ioList(t) + '</ul>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-check">تحقق</button><button type="button" class="btn btn-ghost" id="md-reset">أرجع الدائرة مثل البداية</button><button type="button" class="btn btn-ghost" id="md-new">عطل جديد</button></div><div class="lg-res" id="md-res" aria-live="polite"></div>';
    if (!c.loaded) { load(c.sol); c.loaded = true; mls(FAULT_K, c); }
    $("#md-check").onclick = function () {
      var g = grade(t), r = $("#md-res");
      if (g.ok) {
        if (!c.done) { c.done = true; mls(FAULT_K, c); var log = mls(FAULT_LOG) || []; log.unshift({ e: e.id, ok: true, at: Date.now() }); mls(FAULT_LOG, log.slice(0, 50)); }
        r.className = "lg-res ok"; r.innerHTML = "✓ صلّحتها! الدائرة الحين تطابق في كل الحالات. العطل كان: " + esc(c.say); return;
      }
      c.tries++; mls(FAULT_K, c); r.className = "lg-res bad";
      r.innerHTML = (g.err ? "الجهاز فيه مشكلة: " + esc(g.err[0]) : (t.type === "seq" ? g.done + " من " + g.total + " خطوة" : g.done + " من " + g.total + " حالة") + " تطابق.") +
        (c.tries >= 3 ? ' <button type="button" class="btn btn-ghost btn-sm" id="md-show">اعرض العطل</button>' : " باقي " + (3 - c.tries) + " محاولة قبل ما يظهر زر «اعرض العطل».");
      var sh = $("#md-show"); if (sh) sh.onclick = function () { r.innerHTML = "العطل: " + esc(c.say); if (!c.done) { c.done = true; mls(FAULT_K, c); var log = mls(FAULT_LOG) || []; log.unshift({ e: e.id, ok: false, at: Date.now() }); mls(FAULT_LOG, log.slice(0, 50)); } };
    };
    $("#md-reset").onclick = function () { load(c.sol); $("#md-res").innerHTML = ""; };
    $("#md-new").onclick = function () { c.done = true; mls(FAULT_K, c); route(); };
    if (c.done) { $("#md-res").className = "lg-res"; $("#md-res").innerHTML = "العطل كان: " + esc(c.say) + ' <span class="muted">اضغط «عطل جديد» لتدريب ثاني.</span>'; }
  }
function labOpts(types, id) { return '<label class="md-f">التجربة <select class="select" id="' + id + '"><option value="">أي تجربة (عشوائي)</option>' + EXP.filter(function (e) { return boardTasks(types, e.id).length; }).map(function (e) { return '<option value="' + e.id + '">Lab#' + e.n + ": " + esc(e.title) + "</option>"; }).join("") + '</select></label>'; }
  function modeCards() {
    var log = mls(EXAM_LOG) || [], flog = mls(FAULT_LOG) || [];
    return '<div class="md-grid">' +
      '<section class="card lg-sec md-card"><h2>⏱ اختبار عملي</h2><p>مهمة توصيل عشوائية من التجارب، ووقت محدد، وبدون «اعرض الحل». الدرجة من عدد الحالات اللي تطابق.</p>' +
      labOpts(null, "md-exp") +
      '<label class="md-f">الوقت <select class="select" id="md-mins">' + [10, 15, 20, 30].map(function (m) { return '<option value="' + m + '"' + (+(mls("cv-logic-exam-mins") || 20) === m ? " selected" : "") + '>' + m + ' دقيقة</option>'; }).join("") + '</select></label>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-go-exam">ابدأ الاختبار</button></div>' +
      (log.length ? '<p class="muted small">آخر درجاتك: <span class="ltr">' + log.slice(0, 5).map(function (x) { return x.score; }).join(" · ") + "</span></p>" : "") + '</section>' +
      '<section class="card lg-sec md-card"><h2>🔧 تدريب الأعطال</h2><p>دائرة مركّبة فيها خطأ توصيل واحد: سلك ناقص أو طرفه على رجل غلط. تجرّب المفاتيح وتلقاه وتصلّحه.</p>' +
      labOpts(["build"], "md-fexp") +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-go-fault">ابدأ التدريب</button></div>' +
      (flog.length ? '<p class="muted small">صلّحت ' + flog.filter(function (x) { return x.ok; }).length + " من " + flog.length + " أعطال.</p>" : "") + '</section>' +
      '<section class="card lg-sec md-card"><h2>🧪 المعمل الحر</h2><p>الجهاز بكل الشرائح، تركّب أي دائرة، وتقدر تتحقق منها مقابل أي تمرين توصيل من التجارب.</p><div class="lg-act"><a class="btn btn-primary" href="#free">افتح المعمل الحر</a><a class="btn btn-ghost" href="trainer.html">الجهاز فقط</a></div></section></div>';
  }
  function wireModeCards() {
    var a = $("#md-go-exam"); if (!a) return;
    a.onclick = function () { mls("cv-logic-exam-mins", +$("#md-mins").value); var c = mls(EXAM_K); if (c) { c.done = true; mls(EXAM_K, c); } var v = $("#md-exp").value; location.hash = v ? "exam-" + v : "exam"; };
    $("#md-go-fault").onclick = function () { var c = mls(FAULT_K); if (c) { c.done = true; mls(FAULT_K, c); } var v = $("#md-fexp").value; location.hash = v ? "fault-" + v : "fault"; };
  }

  window.addEventListener("hashchange", route);
  if (CV.cloud && CV.cloud.configured()) CV.cloud.ready().then(function () { if (CV.cloud.access()) route(); });
  route();
})();
