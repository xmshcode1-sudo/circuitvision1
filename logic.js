/* CircuitVision — Logic Design Lab page: the six EE2111 experiments, each with its explanation, the student's own
   exercises (the sheet's tables, expressions and questions, checked on the spot) and wiring tasks checked on the
   IC trainer by running the circuit through every input combination. */
(function () {
  "use strict";
  var LAB = CV.logicLab, EXP = LAB.experiments, KEY = "cv-logic-progress";
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
    if (e && !free(e)) showLocked(e); else if (e) showExp(e); else showIndex();
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
      '<p>تجارب المعمل الست كما في أوراق القسم. كل تجربة: الهدف والقطع، ثم الشرح خطوة بخطوة، ثم تحلّها بنفسك: تكمل جداولها، وتوصّلها على جهاز IC Trainer مطابق لجهاز المعمل، والموقع يفحص توصيلك بتجربة كل حالات المداخل.</p>' +
      '<div class="lg-cta"><a class="btn btn-primary" href="#exp1">ابدأ بـ Lab#1</a><a class="btn btn-ghost" href="trainer.html">الجهاز للتجريب الحر</a></div></div>' +
      '<div class="lg-grid">' + EXP.map(function (e) { var c = count(e); return '<a class="card lg-card" href="#' + e.id + '"><span class="n">' + (free(e) ? e.n : "🔒") + '</span><div><b class="ltr lg-sheet">Lab#' + e.n + ': ' + esc(e.en) + '</b><span>' + esc(e.title) + '</span><span class="chips ltr">' + e.chips.join(" · ") + '</span><span class="pg">' + c.d + ' من ' + c.t + ' تمارين</span></div></a>'; }).join("") + '</div>' +
      '<p class="muted small">ما زالت دروس النظرية لمقرر Logic Design قيد الإعداد؛ هذه الصفحة للجزء العملي.</p>';
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
    root.innerHTML = nav +
      '<div class="lg-head"><span class="code">EE2111 · Logic Design Lab</span><h1 class="ltr lg-sheet">Lab#' + e.n + ': ' + esc(e.en) + '</h1><span class="lg-ar">' + esc(e.title) + '</span><span class="pg">' + c.d + ' من ' + c.t + ' تمارين محلولة</span></div>' +
      '<div class="lg-top"><section class="card lg-sec"><h2>الهدف</h2><ul>' + e.objective.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + '</ul></section>' +
      '<section class="card lg-sec"><h2>المتطلبات</h2><p class="muted">جهاز IC Trainer، وأسلاك، والدوائر التالية (اضغط أي دائرة لترى أرجلها):</p><div class="lg-chips">' + chipsHtml + '</div>' + (e.note ? '<p class="lg-note">' + bd(e.note) + '</p>' : "") + '</section></div>' +
      '<h2 class="lg-h">الشرح خطوة بخطوة</h2>' + parts +
      '<h2 class="lg-h">حلّها بنفسك</h2><p class="muted">هذي جداول وأسئلة التجربة من الورقة. أكمل كل واحد ثم اضغط «تحقق». تمارين التوصيل تحلّها على الجهاز تحت.</p>' + tasks +
      '<section class="card lg-sec lg-bench" id="bench"><h2>الجهاز</h2>' +
      (builds.length ? '<div class="lg-bench-bar"><label>التمرين: <select id="lg-task" class="select">' + builds.map(function (t) { return '<option value="' + t.id + '">' + esc(t.title) + '</option>'; }).join("") + '</select></label>' +
        '<button type="button" class="btn btn-primary btn-sm" id="lg-check">تحقق من توصيلي</button><button type="button" class="btn btn-ghost btn-sm" id="lg-sol">اعرض الحل على الجهاز</button><button type="button" class="btn btn-ghost btn-sm" id="lg-new">لوحة فارغة</button></div><div id="lg-task-note" class="lg-note"></div><div id="lg-out" class="lg-out" aria-live="polite"></div>' : "") +
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
      var go = $("[data-go]", el); if (go) go.addEventListener("click", function () { $("#lg-task").value = t.id; showTaskNote(); $("#bench").scrollIntoView({ behavior: "smooth" }); });
      var ck = $("[data-check]", el); if (ck) ck.addEventListener("click", function () { check(e, t, el); });
      el.querySelectorAll("[data-k]").forEach(function (b) { b.addEventListener("click", function () { var x = $("[data-x]", el), p = x.selectionStart == null ? x.value.length : x.selectionStart; x.value = x.value.slice(0, p) + b.dataset.k + x.value.slice(x.selectionEnd == null ? p : x.selectionEnd); x.focus(); try { x.setSelectionRange(p + 1, p + 1); } catch (er) {} }); });
    });
    root.querySelectorAll("[data-demo]").forEach(function (b) {
      b.addEventListener("click", function () { var p = e.parts.filter(function (x) { return x.id === b.dataset.demo; })[0]; load(p.demo); $("#bench").scrollIntoView({ behavior: "smooth" }); });
    });
    var sel = $("#lg-task"); if (!sel) return;
    sel.addEventListener("change", showTaskNote); showTaskNote();
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
      mark(e.id, t.id, 1); out.className = "lg-out ok"; out.innerHTML = "توصيلك صحيح ✓ القلّاب مرّ بكل الخطوات: " + t.steps.map(function (s) { return s.say; }).filter(Boolean).map(esc).join(" ← ") + ".";
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

  window.addEventListener("hashchange", route);
  if (CV.cloud && CV.cloud.configured()) CV.cloud.ready().then(function () { if (CV.cloud.access()) route(); });
  route();
})();
