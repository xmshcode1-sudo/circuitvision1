/* CircuitVision — Electric Circuits 2 Lab page (lab2.html).
   Index of the ten experiments → one experiment: objectives, equipment, video, short background, notes on the manual,
   pre-lab (checked), and each procedure with its schematic, the virtual instruments, the tables (checked) and the plot of the student's readings. */
(function () {
  "use strict";
  var X = CV.c2lab, EXP = X.list, KEY = "cv-c2lab-progress", sig = X.sig;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bd(s) { return String(s).split(/(<[^>]*>)/).map(function (part) { return part.charAt(0) === "<" ? part : part.replace(/(\(?[−-]?[A-Za-z0-9τ][A-Za-z0-9τ .,=+−\-–/×·()′'∥ΩµθπωΔ²√₀₁₂]*[A-Za-z0-9τ)Ω²′'₀₁₂])/g, '<span class="ltr">$1</span>'); }).join(""); }
  function prog() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function mark(e, k) { var p = prog(); p[e] = p[e] || {}; p[e][k] = 1; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (x) {} }
  function isDone(e, k) { var p = prog(); return !!(p[e] && p[e][k]); }
  function items(e) { var k = []; e.prelab.forEach(function (_, i) { k.push("pre" + i); }); e.procs.forEach(function (p) { p.tables.forEach(function (_, i) { k.push(p.id + "t" + i); }); }); return k; }
  function count(e) { var k = items(e); return { t: k.length, d: k.filter(function (x) { return isDone(e.id, x); }).length }; }
  function num(s) { s = String(s == null ? "" : s).trim().replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace("٫", ".").replace(",", ".").replace("−", "-"); if (s === "") return NaN; return Number(s); }
  function fmt(v) { if (typeof v !== "number") return String(v); if (v === 0) return "0"; var a = Math.abs(v); return String(a >= 1e5 ? Math.round(v) : sig(v, a >= 1000 ? 5 : 4)); }
  function close(x, v, tol, abs) { return Math.abs(x - v) <= Math.max(tol * Math.abs(v), abs == null ? 0.01 : abs); }
  function videoDur(e) { var L = CV.lessons && CV.lessons["c2lab" + e.n]; return L && L.videoDur; }

  var root = $("#cl-root"), bench = null;
  function route() {
    if (bench) { bench.destroy(); bench = null; }
    var oldRef = document.getElementById("lg-ref"); if (oldRef) oldRef.remove();
    var id = location.hash.slice(1), e = EXP.filter(function (x) { return x.id === id; })[0];
    if (e) showExp(e); else showIndex();
    window.scrollTo(0, 0);
  }
  function showIndex() {
    document.title = "معمل الدوائر الكهربائية 2 — CircuitVision";
    root.innerHTML = '<div class="lg-head"><span class="code">EE 2020 · Electric Circuits II Lab</span><h1>معمل الدوائر الكهربائية 2</h1>' +
      '<p>التجارب العشر في كتيب معمل المقرر EE 2020: شحن المكثف وتفريغه، الملفات المقترنة، RLC، الرنين، المرشحات، شبكات المنفذين، وثلاثي الطور. لكل تجربة: التحضير، والخطوات، وأجهزة افتراضية تقرأ منها، وجداول تتحقق منها المنصة، ورسم لقراءاتك، وفيديو شرح.</p>' +
      '<p class="lg-note">التوصيل الحر للقطع على لوحة التوصيل لتجارب الدوائر 2: قيد الإعداد. الأجهزة هنا موصولة جاهزة كما في رسمة كل إجراء.</p>' +
      '<div class="lg-cta"><a class="btn btn-primary" href="#c2e1">ابدأ بالتجربة 1</a></div></div>' +
      '<div class="lg-grid">' + EXP.map(function (e) { var c = count(e); return '<a class="card lg-card" href="#' + e.id + '"><span class="n' + (c.d === c.t && c.t ? " ok" : "") + '">' + e.n + '</span><div><b class="ltr lg-sheet">Experiment #' + e.n + ': ' + esc(e.en) + '</b><span>' + esc(e.title) + '</span><span class="pg">' + (c.d ? c.d + " من " + c.t : "") + '</span></div></a>'; }).join("") + '</div>';
  }

  /* ---------- pre-lab ---------- */
  function preView(e, t, k) {
    var done = isDone(e.id, "pre" + k);
    return '<section class="card lg-task" data-pre="' + k + '"><div class="lg-th"><span class="n' + (done ? " ok" : "") + '">' + (k + 1) + '</span><b>' + bd(t.q) + '</b></div>' +
      '<div class="lg-act"><input class="input c2-in" inputmode="decimal" aria-label="الجواب" style="max-width:160px"><select class="select c2-u" style="width:auto;flex:none" aria-label="الوحدة">' + t.u.map(function (u, i) { return '<option value="' + i + '">' + esc(u[0]) + '</option>'; }).join("") + '</select>' +
      '<button type="button" class="btn btn-primary btn-sm c2-chk">تحقق</button><button type="button" class="btn btn-ghost btn-sm c2-sol">الحل</button></div><div class="lg-res" aria-live="polite"></div></section>';
  }
  function wirePre(e, sec, t, k) {
    var res = $(".lg-res", sec);
    $(".c2-chk", sec).onclick = function () {
      var x = num($(".c2-in", sec).value), f = t.u[+$(".c2-u", sec).value][1];
      if (!isFinite(x)) { res.className = "lg-res bad"; res.textContent = "اكتب رقمًا."; return; }
      if (close(x * f, t.a, t.tol || 0.01, Math.abs(t.a) * 1e-6)) { res.className = "lg-res ok"; res.innerHTML = "صحيح ✓ " + bd(t.sol); mark(e.id, "pre" + k); $(".n", sec).classList.add("ok"); head(e); }
      else { var r = x * f / t.a; res.className = "lg-res bad"; res.textContent = "غير صحيح." + (r > 0 && (Math.abs(Math.log10(r) - Math.round(Math.log10(r))) < 0.01) && Math.round(Math.log10(r)) !== 0 ? " الرقم قريب لكن انتبه للوحدة." : ""); }
    };
    $(".c2-sol", sec).onclick = function () { res.className = "lg-res"; res.innerHTML = bd(t.sol); };
  }

  /* ---------- instruments ---------- */
  function instView(p) {
    var I = p.inst; if (!I) return "";
    return '<div class="c2-inst"><div class="c2-ctl">' + (I.controls || []).map(function (c) {
      if (c.opts) return '<label>' + esc(c.label) + ' <select class="select" data-k="' + c.k + '">' + c.opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(c.def) ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></label>';
      return '<label>' + esc(c.label) + ' <input class="input" type="number" data-k="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.def + '"><input type="range" data-r="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.def + '" aria-label="' + esc(c.label) + '"></label>';
    }).join("") + '</div><div class="c2-meters"></div><div class="c2-scope"></div></div>';
  }
  function wireInst(p, box) {
    var I = p.inst; if (!I) return;
    function upd() {
      var st = {}; (I.controls || []).forEach(function (c) { var el = $('[data-k="' + c.k + '"]', box); var v = el.value; if (!c.opts) { v = Math.min(c.max, Math.max(c.min, num(v))); if (!isFinite(v)) v = c.def; } st[c.k] = v; });
      var r = I.read(st);
      $(".c2-meters", box).innerHTML = r.meters.map(function (m) { return '<div class="c2-m"><span>' + bd(esc(m[0])) + '</span><b class="ltr">' + esc(typeof m[1] === "number" ? fmt(m[1]) : m[1]) + (m[2] ? ' <small>' + esc(m[2]) + '</small>' : "") + '</b></div>'; }).join("");
      var sc = $(".c2-scope", box);
      if (r.scope) { var s = r.scope; s.w = 560; s.h = 240; s.left = 46; sc.innerHTML = '<div class="c2-scr">' + CV.sp.plot(s) + '<span class="c2-leg"><i class="c1"></i>CH1 <i class="c2"></i>CH2</span></div>'; } else sc.innerHTML = "";
    }
    (I.controls || []).forEach(function (c) {
      var el = $('[data-k="' + c.k + '"]', box), rg = $('[data-r="' + c.k + '"]', box);
      el.addEventListener("input", function () { if (rg) rg.value = el.value; upd(); }); el.addEventListener("change", upd);
      if (rg) rg.addEventListener("input", function () { el.value = rg.value; upd(); });
    });
    upd();
  }

  /* ---------- tables ---------- */
  function tableView(e, p, T, ti) {
    var done = isDone(e.id, p.id + "t" + ti);
    return '<div class="cl-tbl" data-t="' + ti + '"><b>' + bd(esc(T.title)) + (done ? ' <span class="cl-ok">✓</span>' : "") + '</b><div class="lg-tw"><table class="lg-t cl-t lg-fill"><thead><tr>' + T.cols.map(function (c) { return '<th>' + bd(esc(c.h)) + (c.src === "meas" ? '<br><small class="muted">من الأجهزة</small>' : c.src === "calc" ? '<br><small class="muted">احسب</small>' : "") + '</th>'; }).join("") + '</tr></thead><tbody>' +
      T.rows.map(function (r, ri) { var m = T.model(r); return '<tr data-r="' + ri + '">' + T.cols.map(function (c) {
        if (c.src === "row") return '<td class="l ltr">' + esc(typeof m[c.k] === "number" ? fmt(m[c.k]) : m[c.k] === undefined ? r : m[c.k]) + '</td>';
        if (c.src === "%") return '<td class="c2-pc">—</td>';
        if (c.src === "choice") return '<td class="o"><select data-k="' + c.k + '"><option value=""></option>' + c.opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join("") + '</select></td>';
        return '<td class="o"><input inputmode="decimal" data-k="' + c.k + '" aria-label="' + esc(c.h) + '"></td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div><div class="lg-act"><button type="button" class="btn btn-primary btn-sm c2-tchk">تحقق من الجدول</button><button type="button" class="btn btn-ghost btn-sm c2-tsol">اعرض الحل</button></div><div class="lg-res" aria-live="polite"></div></div>';
  }
  function wireTable(e, p, T, ti, box, onChange) {
    function pct(tr) { T.cols.forEach(function (c, ci) { if (c.src !== "%") return; var a = num($('[data-k="' + c.of[0] + '"]', tr).value), b = num($('[data-k="' + c.of[1] + '"]', tr).value), td = tr.children[ci]; td.textContent = isFinite(a) && isFinite(b) && a !== 0 ? (Math.abs(a - b) / Math.abs(a) * 100).toFixed(2) + "%" : "—"; }); }
    $$("tbody tr", box).forEach(function (tr) { $$("input,select", tr).forEach(function (inp) { inp.addEventListener("input", function () { inp.classList.remove("good", "bad"); pct(tr); onChange(); }); }); });
    var res = $(".lg-res", box);
    $(".c2-tchk", box).onclick = function () {
      var bad = 0, empty = 0;
      $$("tbody tr", box).forEach(function (tr) {
        var m = T.model(T.rows[+tr.dataset.r]);
        $$("[data-k]", tr).forEach(function (inp) {
          var k = inp.dataset.k, v = m[k], col = T.cols.filter(function (c) { return c.k === k; })[0], ok;
          if (inp.value === "") { empty++; inp.classList.remove("good", "bad"); return; }
          if (col.src === "choice") ok = inp.value === v;
          else { var x = num(inp.value); ok = isFinite(x) && (T.angAbs && col.k === "a" ? Math.abs(x - v) <= T.angAbs : close(x, v, T.tol || 0.02)); }
          inp.classList.toggle("good", ok); inp.classList.toggle("bad", !ok); if (!ok) bad++;
        });
      });
      if (!bad && !empty) { res.className = "lg-res ok"; res.textContent = "الجدول صحيح ✓"; mark(e.id, p.id + "t" + ti); head(e); }
      else { res.className = "lg-res bad"; res.textContent = (bad ? bad + " خانة تحتاج مراجعة (بالأحمر). " : "") + (empty ? empty + " خانة فارغة." : "") + " القياس: من شاشة الجهاز عند نفس الإعداد. الحساب: من القانون في الخلفية."; }
    };
    $(".c2-tsol", box).onclick = function () {
      $$("tbody tr", box).forEach(function (tr) { var m = T.model(T.rows[+tr.dataset.r]); $$("[data-k]", tr).forEach(function (inp) { var v = m[inp.dataset.k]; inp.value = typeof v === "number" ? fmt(v) : v; inp.classList.remove("good", "bad"); }); pct(tr); });
      res.className = "lg-res"; res.textContent = "هذه القيم من نموذج الدائرة نفسه. جرّب أن تقرأها بنفسك من الأجهزة فوق."; onChange();
    };
  }
  /* ---------- plot of the student's entries ---------- */
  function plotView(p) { return p.plot ? '<div class="cl-plot c2-plot"></div>' : ""; }
  function drawPlot(p, sec) {
    var P = p.plot; if (!P) return; var box = $(".c2-plot", sec), sets = [];
    var tabs = [P.table].concat(P.also != null ? [P.also] : []);
    P.ys.forEach(function (yk, yi) {
      var pts = [];
      tabs.forEach(function (ti) { var T = p.tables[ti]; $$('.cl-tbl[data-t="' + ti + '"] tbody tr', sec).forEach(function (tr) { var r = T.rows[+tr.dataset.r], m = T.model(r), xv = typeof m[P.x] === "number" ? m[P.x] : (r === "cut" ? null : num(r)), inp = $('[data-k="' + yk + '"]', tr), y = inp ? num(inp.value) : NaN; if (xv != null && isFinite(y)) pts.push([P.logx ? Math.log10(xv) : xv, y]); }); });
      pts.sort(function (a, b) { return a[0] - b[0]; }); sets.push(pts);
    });
    var all = [].concat.apply([], sets);
    if (all.length < 2) { box.innerHTML = '<p class="muted small">اكتب قراءاتك في الجدول ليظهر الرسم هنا.</p>'; return; }
    var xs = all.map(function (q) { return q[0]; }), ys = all.map(function (q) { return q[1]; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), py = (y1 - y0) * 0.08 || 1;
    var spec = { w: 520, h: 240, left: 48, x: [x0, x1 === x0 ? x0 + 1 : x1], y: [y0 - py, y1 + py], xl: P.xl, yl: P.yl, items: sets.map(function (pts, i) { return { pts: pts, c: i + 1 }; }) };
    if (P.logx) { spec.xt = [-1, 0, 1, 2, 3].filter(function (k) { return k >= x0 - 1e-9 && k <= x1 + 1e-9; }); spec.xf = function (v) { return String(+Math.pow(10, v).toPrecision(2)); }; spec.xl = P.xl + " (لوغاريتمي)"; }
    box.innerHTML = '<div class="c2-scr">' + CV.sp.plot(spec) + (P.names ? '<span class="c2-leg">' + P.names.map(function (n, i) { return '<i class="c' + (i + 1) + '"></i>' + esc(n); }).join(" ") + '</span>' : "") + '</div>';
  }

  function head(e) { var c = count(e), el = $(".lg-head .pg"); if (el) el.textContent = c.d + " من " + c.t + " مكتملة"; }
  function showExp(e) {
    document.title = "التجربة " + e.n + ": " + e.title + " — CircuitVision";
    var c = count(e), i = EXP.indexOf(e), vd = videoDur(e);
    var nav = '<nav class="lg-tabs" aria-label="التجارب">' + EXP.map(function (x) { return '<a href="#' + x.id + '" class="' + (x === e ? "cur" : "") + '"' + (x === e ? ' aria-current="page"' : "") + '><span class="n">' + x.n + '</span><span>' + esc(x.title.split(" ").slice(0, 3).join(" ")) + '</span></a>'; }).join("") + '</nav>';
    root.innerHTML = nav +
      '<div class="lg-head"><span class="code">EE 2020 · Electric Circuits II Lab</span><h1 class="ltr lg-sheet">Experiment #' + e.n + ': ' + esc(e.en) + '</h1><span class="lg-ar">' + esc(e.title) + '</span><span class="pg">' + c.d + ' من ' + c.t + ' مكتملة</span></div>' +
      '<div class="lg-top"><section class="card lg-sec"><h2>الأهداف</h2><ul>' + e.objective.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + '</ul></section>' +
      '<section class="card lg-sec"><h2>الأدوات</h2><ul>' + e.equipment.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + '</ul></section></div>' +
      (vd ? '<section class="card lg-sec lg-video"><h2>شرح التجربة بالفيديو <span class="muted small ltr">' + vd + '</span></h2><video controls playsinline preload="none" poster="c2lab' + e.n + '.jpg" src="c2lab' + e.n + '.mp4"></video><p class="muted small">من نفس الصفحة: الرسمة، والتحضير، وضبط الأجهزة، وكل قراءة في الجدول.</p></section>' : '<section class="card lg-sec"><h2>شرح التجربة بالفيديو</h2><p class="muted">قيد الإعداد</p></section>') +
      '<section class="card lg-sec"><h2>الخلفية باختصار</h2><ul class="lg-steps">' + e.theory.map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul></section>' +
      (e.note ? '<section class="card lg-sec"><h2>ملاحظات على الكتيب والطاولة الافتراضية</h2><p class="lg-note">' + bd(esc(e.note)) + '</p></section>' : "") +
      '<h2 class="lg-h">التحضير (Pre-Lab)</h2>' + e.prelab.map(function (t, k) { return preView(e, t, k); }).join("") +
      '<h2 class="lg-h">خطوات التجربة</h2>' + e.procs.map(function (p, k) {
        return '<section class="card lg-sec c2-proc" data-p="' + k + '"><h2>' + bd(esc(p.title)) + '</h2><div class="cl-proc"><div class="cl-fig">' + CV.draw.render(p.fig, { aria: "رسمة الدائرة" }) + '</div><ol class="lg-steps">' + p.steps.map(function (s) { return "<li>" + bd(s) + "</li>"; }).join("") + '</ol></div>' +
          (p.layouts && p.layouts.length ? '<div class="lg-act"><button type="button" class="btn btn-ghost btn-sm c2-tobench" data-lay="' + p.id + "/" + p.layouts[0].id + '">ركّبها على طاولة المعمل ↓</button></div>' : "") +
          '<h3 class="c2-h3">قراءة سريعة من الأجهزة</h3>' + instView(p) + '<h3 class="c2-h3">الجداول</h3>' + p.tables.map(function (T, ti) { return tableView(e, p, T, ti); }).join("") + plotView(p) + '</section>';
      }).join("") +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2><p class="muted small">نفس طاولة معمل الدوائر 1 مع أجهزة الدوائر 2. ركّب الدائرة بنفسك واقرأ من الأجهزة، أو اعرض الحل على الطاولة.</p>' +
      '<div class="lg-bench-bar"><label>الدائرة: <select id="cl-lay" class="select">' + e.procs.map(function (p) { return p.layouts.map(function (L) { return '<option value="' + p.id + "/" + L.id + '">' + esc(p.title.replace(/^الإجراء[^:]*:\s*|^الخطوات[^:]*:\s*/, "")) + (p.layouts.length > 1 ? " · " + esc(L.name) : "") + '</option>'; }).join(""); }).join("") + '</select></label>' +
      '<button type="button" class="btn btn-primary btn-sm" id="cl-check">تحقق من توصيلي</button><button type="button" class="btn btn-ghost btn-sm" id="cl-sol">اعرض الحل على الطاولة</button><button type="button" class="btn btn-ghost btn-sm" id="cl-ref-open">📐 الرسمة</button></div>' +
      '<div class="lg-out" id="cl-out" aria-live="polite"></div><div id="cl-bench"></div></section>' +
      '<div class="lg-pn">' + (i > 0 ? '<a class="btn btn-ghost" href="#' + EXP[i - 1].id + '">→ التجربة ' + EXP[i - 1].n + '</a>' : '<a class="btn btn-ghost" href="#">→ كل التجارب</a>') + (i < EXP.length - 1 ? '<a class="btn btn-ghost" href="#' + EXP[i + 1].id + '">التجربة ' + EXP[i + 1].n + ' ←</a>' : "") + '</div>';
    e.prelab.forEach(function (t, k) { wirePre(e, $('[data-pre="' + k + '"]', root), t, k); });
    e.procs.forEach(function (p, k) {
      var sec = $('.c2-proc[data-p="' + k + '"]', root);
      wireInst(p, $(".c2-inst", sec) || sec);
      p.tables.forEach(function (T, ti) { wireTable(e, p, T, ti, $('.cl-tbl[data-t="' + ti + '"]', sec), function () { drawPlot(p, sec); }); });
      drawPlot(p, sec);
    });
    wireBench(e);
  }
  function layout(e, v) { var q = v.split("/"), p = e.procs.filter(function (x) { return x.id === q[0]; })[0]; return { p: p, L: p.layouts.filter(function (x) { return x.id === q[1]; })[0] }; }
  /* the drawing of the selected circuit, pinned at the top corner while the student builds it (as in the Circuits 1 and logic labs) */
  var REF_KEY = "cv-c2lab-ref-min";
  function refPanel(e, open, quiet) {
    var box = document.getElementById("lg-ref"), sel = $("#cl-lay"); if (!sel) return;
    var v = sel.value.split("/"), k = -1, p = null, L = null;
    e.procs.forEach(function (x, i) { if (x.id === v[0]) k = i; });
    if (k >= 0) { p = e.procs[k]; L = (p.layouts || []).filter(function (x) { return x.id === v[1]; })[0]; }
    var fp = null; for (var i = k; i >= 0 && !fp; i--) if (e.procs[i].fig) fp = e.procs[i];
    if (!fp) { if (box) box.remove(); return; }
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
      '<div class="lg-ref-card"><div class="lg-ref-h"><div><b>' + bd(esc(p.title)) + '</b>' + (L && p.layouts.length > 1 ? '<span>' + bd(esc(L.name)) + '</span>' : "") + '</div><button type="button" class="lg-ref-x" data-ref="min" aria-label="أخفِ الرسمة" title="أخفِ">×</button></div>' +
      '<div class="lg-ref-b"><div class="lg-ref-fig">' + CV.draw.render(fp.fig, { aria: "مخطط " + fp.title }) + '</div>' +
      '<p class="lg-ref-note">' + (fp === p ? "رسمة الدائرة من كتيب المعمل." : "رسمة الدائرة من «" + esc(fp.title) + "» في كتيب المعمل.") + '</p></div></div>';
  }
  function wireBench(e) {
    var host = $("#cl-bench"); if (!host || !CV.clabBench) return;
    bench = CV.clabBench.mount(host, { key: "c2-" + e.id, inst: e.inst, kit: e.kit, fullEl: $("#bench") });
    if (e.inst.indexOf("rb") > -1 && bench.state().inst.rb.d.length !== 5) bench.set({ rb: { d: [0, 0, 0, 0, 0] } });
    var K = CV.clabCheck, out = $("#cl-out");
    $("#cl-check").onclick = function () {
      var x = layout(e, $("#cl-lay").value), r = K.wiringReport(e, x.L, bench.state());
      if (!r.ok) {   // maybe the student built another circuit of the same procedure (e.g. opposing instead of aiding)
        var alt = x.p.layouts.filter(function (L) { return L !== x.L && K.wiringReport(e, L, bench.state()).ok; })[0];
        if (alt) r = { ok: false, msgs: [{ lvl: "bad", t: "توصيلك يطابق دائرة «" + esc(alt.name) + "»، والمختارة «" + esc(x.L.name) + "». " + (e.inst.indexOf("cc") > -1 ? "الفرق في اتجاه طرفي أحد الملفين: اعكس طرفي الملف 2." : "راجع الفرق بينهما في الرسمة.") }] };
      }
      out.className = "lg-out " + (r.ok ? "ok" : "bad");
      out.innerHTML = (r.ok ? "التوصيل صحيح ✓" + (r.msgs.length ? "" : " والأجهزة في أماكنها. الحين اقرأ واكتب في الجدول.") : "") + (r.msgs.length ? "<ul>" + r.msgs.map(function (m) { return "<li>" + m.t + "</li>"; }).join("") + "</ul>" : "");
    };
    $("#cl-sol").onclick = function () {
      var x = layout(e, $("#cl-lay").value), set = JSON.parse(JSON.stringify(x.L.set || {})), term = set.fgTerm; delete set.fgTerm;
      if (term) { var r = K.solveL(e, x.L, {}, false); set.fg = set.fg || {}; set.fg.vpp = Math.round(r.state.inst.fg.vpp * 1000) / 1000; }
      bench.load({ parts: x.L.parts, leads: x.L.leads, set: set });
      out.className = "lg-out"; out.textContent = "هذي دائرة «" + x.L.name + "» على الطاولة" + (term ? "، والمولد مضبوط بحيث يكون جهد طرفيه المطلوب تحت الحمل (مقاومته الداخلية 50 Ω)." : ".");
    };
    $$(".c2-tobench").forEach(function (b) { b.onclick = function () { $("#cl-lay").value = b.dataset.lay; $("#cl-sol").click(); refPanel(e, true); $("#bench").scrollIntoView({ behavior: "smooth" }); }; });
    $("#cl-lay").addEventListener("change", function () { refPanel(e, false); });
    $("#cl-ref-open").onclick = function () { refPanel(e, true); };
    refPanel(e, false, true);
  }
  window.addEventListener("hashchange", route);
  if (document.readyState === "complete") route(); else window.addEventListener("load", route);
})();
