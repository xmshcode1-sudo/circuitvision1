/* CircuitVision — smart calculator (floating panel on the study pages).
   1) Expressions with complex numbers: 3+j4, 10∠30, SI prefixes (4.7k, 2.2µ, 10mA), the parallel operator ∥,
      √, ^, sin/cos/tan (degrees or radians), ln, log, abs, ang, re, im, conj, ans and named memories (x = 5).
   2) Linear system solver (2–4 unknowns, real or complex coefficients) for node and mesh equations.
   It is a calculator only: it never sees or solves the problem on the page. */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  /* ---------- complex arithmetic ---------- */
  function C(re, im) { return { re: re, im: im || 0 }; }
  var add = function (a, b) { return C(a.re + b.re, a.im + b.im); }, sub = function (a, b) { return C(a.re - b.re, a.im - b.im); };
  var mul = function (a, b) { return C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); };
  function div(a, b) { var d = b.re * b.re + b.im * b.im; if (d === 0) throw err("قسمة على صفر"); return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
  var abs = function (a) { return Math.hypot(a.re, a.im); }, arg = function (a) { return Math.atan2(a.im, a.re); };
  function isReal(a) { return Math.abs(a.im) <= 1e-12 * Math.max(1, Math.abs(a.re)); }
  function expc(a) { var r = Math.exp(a.re); return C(r * Math.cos(a.im), r * Math.sin(a.im)); }
  function lnc(a) { if (abs(a) === 0) throw err("لوغاريتم الصفر غير معرّف"); return C(Math.log(abs(a)), arg(a)); }
  function pow(a, b) {
    if (isReal(b) && Number.isInteger(b.re) && Math.abs(b.re) <= 64) { var r = C(1), n = Math.abs(b.re); for (var i = 0; i < n; i++) r = mul(r, a); return b.re < 0 ? div(C(1), r) : r; }
    if (isReal(a) && isReal(b) && a.re >= 0) return C(Math.pow(a.re, b.re));
    if (abs(a) === 0) return C(0);
    return expc(mul(b, lnc(a)));
  }
  function sqrtc(a) { if (isReal(a) && a.re >= 0) return C(Math.sqrt(a.re)); var r = Math.sqrt(abs(a)), t = arg(a) / 2; return C(r * Math.cos(t), r * Math.sin(t)); }
  function par(a, b) { var s = add(a, b); if (abs(s) === 0) throw err("مجموع المقاومتين المتوازيتين صفر"); return div(mul(a, b), s); }
  function err(m) { var e = new Error(m); e.calc = true; return e; }

  /* ---------- parser ---------- */
  var PREFIX = { p: 1e-12, n: 1e-9, "µ": 1e-6, "μ": 1e-6, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  var UNITS = "Ω|ohm|VAR|VA|Hz|V|A|W|F|H|S|s";
  var NUM = new RegExp("^(\\d+\\.?\\d*|\\.\\d+)(e[-+]?\\d+)?(?:\\s?(p|n|µ|μ|u|m|k|K|M|G)?(" + UNITS + ")(?![A-Za-z])|(p|n|µ|μ|u|m|k|K|M|G)(?![A-Za-z(]))?");
  function normalize(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); }).replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/٫/g, ".").replace(/(\d),(\d)/g, "$1.$2").replace(/[×·⋅]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/π/g, "pi").replace(/∥|\|\|/g, "∥").replace(/°/g, "");
  }
  function lex(s) {
    var t = [], i = 0, m;
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if ((m = NUM.exec(s.slice(i)))) {
        var v = parseFloat(m[1] + (m[2] || "")), p = m[3] || m[5]; if (p) v *= PREFIX[p];
        t.push({ k: "num", v: v }); i += m[0].length; continue;
      }
      if ((m = /^[A-Za-z_][A-Za-z_0-9]*/.exec(s.slice(i)))) {
        var w = m[0];
        if (/^j\d/.test(w)) { t.push({ k: "id", v: "j" }); i += 1; continue; }   // j4 → j·4
        t.push({ k: "id", v: w }); i += w.length; continue;
      }
      if ("+-*/^()∥∠,=√".indexOf(ch) > -1) { t.push({ k: ch }); i++; continue; }
      throw err("رمز غير مفهوم: " + ch);
    }
    return t;
  }
  var FN = {
    sqrt: function (a) { return sqrtc(a); }, abs: function (a) { return C(abs(a)); }, mag: function (a) { return C(abs(a)); },
    ang: function (a, o) { return C(o.deg ? arg(a) * 180 / Math.PI : arg(a)); }, arg: function (a, o) { return FN.ang(a, o); },
    re: function (a) { return C(a.re); }, im: function (a) { return C(a.im); }, conj: function (a) { return C(a.re, -a.im); },
    ln: function (a) { return lnc(a); }, log: function (a) { return div(lnc(a), C(Math.LN10)); }, exp: function (a) { return expc(a); },
    sin: function (a, o) { return C(Math.sin(realArg(a, "sin") * (o.deg ? Math.PI / 180 : 1))); },
    cos: function (a, o) { return C(Math.cos(realArg(a, "cos") * (o.deg ? Math.PI / 180 : 1))); },
    tan: function (a, o) { return C(Math.tan(realArg(a, "tan") * (o.deg ? Math.PI / 180 : 1))); },
    asin: function (a, o) { return C(Math.asin(realArg(a, "asin")) * (o.deg ? 180 / Math.PI : 1)); },
    acos: function (a, o) { return C(Math.acos(realArg(a, "acos")) * (o.deg ? 180 / Math.PI : 1)); },
    atan: function (a, o) { return C(Math.atan(realArg(a, "atan")) * (o.deg ? 180 / Math.PI : 1)); }
  };
  function realArg(a, f) { if (!isReal(a)) throw err(f + " يحتاج عددًا حقيقيًا"); return a.re; }
  function parse(src, o) {
    o = o || {}; var vars = o.vars || {}, t = lex(normalize(src)), i = 0, assign = null;
    if (t.length > 2 && t[0].k === "id" && t[1].k === "=") { assign = t[0].v; if (FN[assign] || /^(j|pi|e|ans)$/.test(assign)) throw err("لا يمكن استخدام «" + assign + "» اسمًا للذاكرة"); i = 2; }
    if (t.some(function (x, k) { return x.k === "=" && k !== 1; }) || (t[1] && t[1].k === "=" && !assign)) throw err("للحفظ اكتب: اسم = قيمة");
    function peek() { return t[i]; }
    function eat(k) { if (t[i] && t[i].k === k) return t[i++]; return null; }
    function expr() { var v = parallel(); for (;;) { if (eat("+")) v = add(v, parallel()); else if (eat("-")) v = sub(v, parallel()); else return v; } }
    function parallel() { var v = term(); while (eat("∥")) v = par(v, term()); return v; }
    function startsPrimary(x) { return x && (x.k === "num" || x.k === "id" || x.k === "(" || x.k === "√"); }
    function term() { var v = polar(); for (;;) { if (eat("*")) v = mul(v, polar()); else if (eat("/")) v = div(v, polar()); else if (startsPrimary(peek())) v = mul(v, polar()); else return v; } }
    function polar() { var v = unary(); if (eat("∠")) { var a = unary(); if (!isReal(a)) throw err("الزاوية بعد ∠ يجب أن تكون حقيقية"); var th = a.re * Math.PI / 180; if (!isReal(v)) throw err("المقدار قبل ∠ يجب أن يكون حقيقيًا"); v = C(v.re * Math.cos(th), v.re * Math.sin(th)); } return v; }
    function unary() { if (eat("-")) return mul(C(-1), unary()); if (eat("+")) return unary(); if (eat("√")) return sqrtc(unary()); return power(); }
    function power() { var b = primary(); if (eat("^")) return pow(b, unary()); return b; }
    function primary() {
      var x = t[i++];
      if (!x) throw err("التعبير ناقص");
      if (x.k === "num") return C(x.v);
      if (x.k === "(") { var v = expr(); if (!eat(")")) throw err("قوس غير مغلق"); return v; }
      if (x.k === "id") {
        var w = x.v;
        if (FN[w]) { if (!eat("(")) { return FN[w](power(), o); } var a = expr(); if (!eat(")")) throw err("قوس غير مغلق بعد " + w); return FN[w](a, o); }
        if (w === "j") return C(0, 1);
        if (w === "pi") return C(Math.PI);
        if (w === "e") return C(Math.E);
        if (w === "ans") { if (!o.ans) throw err("لا توجد نتيجة سابقة"); return o.ans; }
        if (vars[w]) return vars[w];
        throw err("«" + w + "» غير معرّف. لحفظ قيمة اكتب: " + w + " = 5");
      }
      throw err("رمز في غير مكانه: " + x.k);
    }
    if (i >= t.length) throw err("اكتب تعبيرًا");
    var v = expr();
    if (i < t.length) throw err(t[i].k === ")" ? "قوس إغلاق زائد" : "التعبير غير مكتمل");
    if (!isFinite(v.re) || !isFinite(v.im)) throw err("النتيجة غير معرّفة");
    return { value: v, assign: assign };
  }

  /* ---------- formatting ---------- */
  function sig(x, n) { if (x === 0) return "0"; var s = Number(x.toPrecision(n || 6)); var a = Math.abs(s); return a !== 0 && (a < 1e-4 || a >= 1e9) ? s.toExponential((n || 6) - 1).replace(/\.?0+e/, "e") : String(s); }
  function eng(x) {
    if (x === 0 || !isFinite(x)) return null; var a = Math.abs(x);
    var P = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
    for (var k = 0; k < P.length; k++) if (a >= P[k][0] * 0.9999995) return P[k][1] ? sig(x / P[k][0], 4) + " " + P[k][1] : null;
    return null;
  }
  function clean(v) { var s = Math.max(abs(v), 1e-300); return C(Math.abs(v.re) < 1e-12 * s ? 0 : v.re, Math.abs(v.im) < 1e-12 * s ? 0 : v.im); }
  function fmt(v, deg) {
    v = clean(v);
    if (v.im === 0) { var e = eng(v.re); return { main: sig(v.re), sub: e ? "= " + e : "", plain: sig(v.re, 8) }; }
    var rect = (v.re !== 0 ? sig(v.re) + (v.im < 0 ? " − j" : " + j") + sig(Math.abs(v.im)) : (v.im < 0 ? "−j" : "j") + sig(Math.abs(v.im)));
    var a = arg(v) * (deg ? 180 / Math.PI : 1);
    return { main: rect, sub: "= " + sig(abs(v)) + " ∠ " + sig(a, 5) + (deg ? "°" : " rad"), plain: rect.replace(/ /g, "").replace("−", "-") };
  }

  /* ---------- linear solver (complex Gaussian elimination, partial pivoting) ---------- */
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, k) { return r.slice().concat([b[k]]); });
    var scale = 0; M.forEach(function (r) { r.forEach(function (z) { scale = Math.max(scale, abs(z)); }); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (abs(M[r][c]) > abs(M[p][c])) p = r;
      if (abs(M[p][c]) <= 1e-12 * Math.max(scale, 1e-300)) throw err("المعادلات غير مستقلة (المصفوفة مفردة): إما لا يوجد حل أو توجد حلول كثيرة. راجع المعادلات.");
      var tmp = M[c]; M[c] = M[p]; M[p] = tmp;
      for (r = 0; r < n; r++) if (r !== c) { var f = div(M[r][c], M[c][c]); for (var k = c; k <= n; k++) M[r][k] = sub(M[r][k], mul(f, M[c][k])); }
    }
    return M.map(function (r, k) { return div(r[n], r[k]); });
  }

  CV.calc = { parse: parse, fmt: fmt, solve: solve, C: C };
  if (typeof document === "undefined") return;

  /* ---------- UI ---------- */
  var KEY = "cv.calc.v1";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function store(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  var S = load(); S.hist = S.hist || []; S.vars = S.vars || {}; S.deg = S.deg !== false; S.n = S.n || 2; S.grid = S.grid || {};
  var vars = {}; Object.keys(S.vars).forEach(function (k) { vars[k] = C(S.vars[k][0], S.vars[k][1]); });
  var ans = S.ans ? C(S.ans[0], S.ans[1]) : null, target = null, panel, tab = S.tab || "expr";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function persist() { S.vars = {}; Object.keys(vars).forEach(function (k) { S.vars[k] = [vars[k].re, vars[k].im]; }); S.ans = ans ? [ans.re, ans.im] : null; S.tab = tab; store(S); }

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5"/></svg>';
  var KEYS = [["7", "8", "9", "÷", "(", ")"], ["4", "5", "6", "×", "∥", "∠"], ["1", "2", "3", "−", "j", "^"], ["0", ".", "ans", "+", "√", "²"], ["k", "m", "µ", "n", "M", "π"], ["sin(", "cos(", "tan(", "abs(", "ang(", "conj("]];

  function build() {
    var fab = document.createElement("button");
    fab.type = "button"; fab.className = "calc-fab"; fab.id = "calc-fab"; fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "calc-panel");
    fab.innerHTML = ICON + '<span>الحاسبة</span>';
    panel = document.createElement("section");
    panel.className = "calc-panel"; panel.id = "calc-panel"; panel.hidden = true; panel.setAttribute("aria-label", "الحاسبة الذكية");
    document.body.appendChild(panel); document.body.appendChild(fab);
    fab.addEventListener("click", function () { toggle(panel.hidden); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { toggle(false); fab.focus(); } });
    document.addEventListener("focusin", function (e) {
      var el = e.target;
      if (panel.contains(el)) return;
      if (el.tagName === "INPUT" && /^(text|number|search|)$/.test(el.type || "") && !el.readOnly && !el.disabled) { target = el; refreshInsert(); }
      else if (el.tagName === "TEXTAREA" && !el.readOnly) { target = el; refreshInsert(); }
    });
    render();
  }
  function toggle(open) {
    panel.hidden = !open; document.getElementById("calc-fab").setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { refreshInsert(); var f = panel.querySelector(tab === "expr" ? "#calc-in" : ".calc-grid input"); if (f && matchMedia("(pointer: fine)").matches) f.focus(); }
  }
  function render() {
    panel.innerHTML = '<header class="calc-h"><b>الحاسبة الذكية</b><div class="calc-tabs" role="tablist"><button type="button" role="tab" data-tab="expr" aria-selected="' + (tab === "expr") + '">حاسبة</button><button type="button" role="tab" data-tab="sys" aria-selected="' + (tab === "sys") + '">حل معادلات</button></div>' +
      '<button type="button" class="calc-x" aria-label="أغلق الحاسبة">×</button></header><div class="calc-b">' + (tab === "expr" ? exprView() : sysView()) + '</div>';
    panel.querySelector(".calc-x").addEventListener("click", function () { toggle(false); });
    panel.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.tab; persist(); render(); toggle(true); }); });
    if (tab === "expr") wireExpr(); else wireSys();
    refreshInsert();
  }
  function insertBtn(val, label) { return '<button type="button" class="btn btn-ghost btn-sm calc-ins" data-ins="' + esc(val) + '" disabled>' + (label || "أدخل في الإجابة") + '</button>'; }
  function refreshInsert() {
    if (!panel) return; var ok = target && document.body.contains(target);
    panel.querySelectorAll(".calc-ins").forEach(function (b) { b.disabled = !ok; b.title = ok ? "يضع الرقم في آخر خانة كتبت فيها" : "انقر أولًا على خانة الإجابة في الصفحة"; });
  }
  function doInsert(v) {
    if (!target || !document.body.contains(target)) return;
    if (target.tagName === "TEXTAREA") { var p = target.selectionStart || target.value.length; target.value = target.value.slice(0, p) + v + target.value.slice(target.selectionEnd || p); }
    else target.value = v;
    target.dispatchEvent(new Event("input", { bubbles: true })); target.dispatchEvent(new Event("change", { bubbles: true }));
    target.focus();
  }

  /* expression tab */
  function exprView() {
    return '<div class="calc-scr"><input id="calc-in" class="calc-in" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" placeholder="12/(2k∥3k)" aria-label="التعبير" value="' + esc(S.last || "") + '">' +
      '<div class="calc-out" aria-live="polite"><b class="ltr" id="calc-main"></b><span class="ltr" id="calc-sub"></span><span class="calc-err" id="calc-err"></span></div></div>' +
      '<div class="calc-row"><button type="button" class="btn btn-primary btn-sm" id="calc-eq">=</button>' + insertBtn("", "أدخل الناتج في الإجابة") +
      '<button type="button" class="calc-mode" id="calc-deg" aria-pressed="' + S.deg + '">' + (S.deg ? "DEG" : "RAD") + '</button><button type="button" class="calc-mode" id="calc-del" aria-label="احذف حرفًا">⌫</button><button type="button" class="calc-mode" id="calc-ac">AC</button></div>' +
      '<div class="calc-keys">' + KEYS.map(function (r) { return r.map(function (k) { return '<button type="button" data-k="' + esc(k) + '" class="' + (/^[0-9.]$/.test(k) ? "n" : /[(]$/.test(k) && k.length > 1 ? "f" : "o") + '">' + esc(k.length > 1 ? k.replace("(", "") : k) + '</button>'; }).join(""); }).join("") + '</div>' +
      (Object.keys(vars).length ? '<div class="calc-vars"><span class="muted">الذاكرة:</span>' + Object.keys(vars).map(function (k) { return '<button type="button" data-k="' + esc(k) + '" class="chip-v"><span class="ltr">' + esc(k) + ' = ' + esc(fmt(vars[k], S.deg).main) + '</span></button>'; }).join("") + '<button type="button" class="calc-link" id="calc-clrv">امسح</button></div>' : "") +
      (S.hist.length ? '<div class="calc-hist"><div class="calc-hh"><span class="muted">السجل</span><button type="button" class="calc-link" id="calc-clrh">امسح</button></div><ol>' + S.hist.map(function (h, k) { return '<li><button type="button" data-h="' + k + '"><span class="ltr q">' + esc(h.q) + '</span><span class="ltr a">= ' + esc(h.a) + '</span></button></li>'; }).join("") + '</ol></div>' : "") +
      '<details class="calc-help"><summary>ماذا تفهم الحاسبة؟</summary><ul><li><span class="ltr">4.7k · 2.2µ · 10mA · 3MΩ</span> البادئات والوحدات</li><li><span class="ltr">2k ∥ 3k</span> التوازي = حاصل الضرب ÷ المجموع</li><li><span class="ltr">3+4j · 10∠30</span> أعداد مركبة وفيزورات (الزاوية بالدرجات)</li><li><span class="ltr">abs( ) · ang( ) · re( ) · im( ) · conj( )</span> للمركبات</li><li><span class="ltr">x = 5</span> يحفظ قيمة باسم تستخدمه لاحقًا، و <span class="ltr">ans</span> آخر ناتج</li></ul></details>';
  }
  function wireExpr() {
    var inp = panel.querySelector("#calc-in");
    function preview(commit) {
      var q = inp.value.trim(), m = panel.querySelector("#calc-main"), s = panel.querySelector("#calc-sub"), e = panel.querySelector("#calc-err"), ins = panel.querySelector(".calc-ins");
      S.last = inp.value;
      if (!q) { m.textContent = ""; s.textContent = ""; e.textContent = ""; ins.dataset.ins = ""; persist(); return; }
      try {
        var r = parse(q, { deg: S.deg, vars: vars, ans: ans }), f = fmt(r.value, S.deg);
        m.textContent = (r.assign ? r.assign + " = " : "") + f.main; s.textContent = f.sub; e.textContent = ""; ins.dataset.ins = f.plain;
        if (commit) {
          if (r.assign) vars[r.assign] = r.value;
          ans = r.value; S.hist.unshift({ q: q, a: (r.assign ? r.assign + " = " : "") + f.main }); S.hist = S.hist.slice(0, 15); persist();
          var keep = inp.value; render(); var ni = panel.querySelector("#calc-in"); ni.value = keep; S.last = keep; panel.querySelector("#calc-main").textContent = (r.assign ? r.assign + " = " : "") + f.main; panel.querySelector("#calc-sub").textContent = f.sub; panel.querySelector(".calc-ins").dataset.ins = f.plain; refreshInsert(); ni.focus(); ni.select();
          return;
        }
      } catch (x) {
        if (!x.calc) throw x;
        m.textContent = ""; s.textContent = ""; ins.dataset.ins = ""; e.textContent = commit ? x.message : (/ناقص|غير مكتمل|قوس غير مغلق|اكتب تعبيرًا/.test(x.message) ? "" : x.message);
      }
      persist();
    }
    function put(k) {
      var a = inp.selectionStart == null ? inp.value.length : inp.selectionStart, b = inp.selectionEnd == null ? a : inp.selectionEnd;
      var txt = k;
      if (a === 0 && b === inp.value.length && b > 0 && /^[×÷−+^∥²]$/.test(k) && ans) txt = "ans" + k;   // after "=", an operator continues from the result
      inp.value = inp.value.slice(0, a) + txt + inp.value.slice(b); var p = a + txt.length; inp.focus(); try { inp.setSelectionRange(p, p); } catch (e) {} preview(false);
    }
    inp.addEventListener("input", function () { preview(false); });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); preview(true); } });
    panel.querySelector("#calc-eq").addEventListener("click", function () { preview(true); });
    panel.querySelector("#calc-ac").addEventListener("click", function () { inp.value = ""; preview(false); inp.focus(); });
    panel.querySelector("#calc-del").addEventListener("click", function () { var a = inp.selectionStart, b = inp.selectionEnd; if (a === b && a > 0) { inp.value = inp.value.slice(0, a - 1) + inp.value.slice(b); a--; } else inp.value = inp.value.slice(0, a) + inp.value.slice(b); inp.focus(); try { inp.setSelectionRange(a, a); } catch (e) {} preview(false); });
    panel.querySelector("#calc-deg").addEventListener("click", function () { S.deg = !S.deg; persist(); var keep = inp.value; render(); panel.querySelector("#calc-in").value = keep; wireExprPreview(); });
    panel.querySelectorAll(".calc-keys [data-k], .calc-vars [data-k]").forEach(function (b) { b.addEventListener("click", function () { put(b.dataset.k); }); });
    panel.querySelectorAll("[data-h]").forEach(function (b) { b.addEventListener("click", function () { inp.value = S.hist[+b.dataset.h].q; preview(false); inp.focus(); }); });
    var ch = panel.querySelector("#calc-clrh"); if (ch) ch.addEventListener("click", function () { S.hist = []; persist(); render(); });
    var cv = panel.querySelector("#calc-clrv"); if (cv) cv.addEventListener("click", function () { vars = {}; persist(); render(); });
    panel.querySelector(".calc-ins").addEventListener("click", function () { if (this.dataset.ins) doInsert(this.dataset.ins); });
    wireExprPreview = function () { preview(false); };
    preview(false);
  }
  var wireExprPreview = function () {};

  /* system tab */
  var SUB = ["₁", "₂", "₃", "₄"];
  function sysView() {
    var n = S.n, h = '<p class="calc-note">اكتب معاملات معادلات العقد أو الحلقات. كل خانة تقبل تعبيرًا: <span class="ltr">1/2k + 1/3k</span> أو <span class="ltr">5∠30</span> أو <span class="ltr">−j4</span>.</p>' +
      '<div class="calc-row"><label class="muted" for="calc-n">عدد المجاهيل</label><select class="select calc-sel" id="calc-n">' + [2, 3, 4].map(function (k) { return '<option' + (k === n ? " selected" : "") + '>' + k + '</option>'; }).join("") + '</select><button type="button" class="calc-link" id="calc-gclr">امسح الخانات</button></div>' +
      '<div class="calc-gwrap"><table class="calc-grid" dir="ltr"><tbody>';
    for (var r = 0; r < n; r++) {
      h += "<tr>";
      for (var c = 0; c < n; c++) h += '<td><input data-r="' + r + '" data-c="' + c + '" value="' + esc(S.grid[r + "," + c] || "") + '" aria-label="معامل x' + (c + 1) + ' في المعادلة ' + (r + 1) + '" autocomplete="off" spellcheck="false"><span>x' + SUB[c] + (c < n - 1 ? " +" : "") + '</span></td>';
      h += '<td class="eq">=</td><td><input data-r="' + r + '" data-c="b" value="' + esc(S.grid[r + ",b"] || "") + '" aria-label="الطرف الأيمن للمعادلة ' + (r + 1) + '" autocomplete="off" spellcheck="false"></td></tr>';
    }
    return h + '</tbody></table></div><div class="calc-row"><button type="button" class="btn btn-primary btn-sm" id="calc-solve">حل</button><span class="calc-err" id="calc-serr" role="status"></span></div><div id="calc-sres"></div>';
  }
  function wireSys() {
    panel.querySelector("#calc-n").addEventListener("change", function () { S.n = +this.value; persist(); render(); });
    panel.querySelector("#calc-gclr").addEventListener("click", function () { S.grid = {}; persist(); render(); });
    panel.querySelectorAll(".calc-grid input").forEach(function (i) {
      i.addEventListener("input", function () { S.grid[i.dataset.r + "," + i.dataset.c] = i.value; persist(); i.classList.remove("bad"); });
      i.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run(); } });
    });
    panel.querySelector("#calc-solve").addEventListener("click", run);
    function run() {
      var n = S.n, A = [], b = [], bad = null, er = panel.querySelector("#calc-serr"), out = panel.querySelector("#calc-sres");
      er.textContent = ""; out.innerHTML = "";
      for (var r = 0; r < n && !bad; r++) {
        A.push([]);
        for (var c = 0; c <= n; c++) {
          var key = c === n ? "b" : c, inp = panel.querySelector('.calc-grid input[data-r="' + r + '"][data-c="' + key + '"]'), q = inp.value.trim();
          try { var v = q === "" ? C(0) : parse(q, { deg: S.deg, vars: vars, ans: ans }).value; if (c === n) b.push(v); else A[r].push(v); }
          catch (x) { if (!x.calc) throw x; bad = [inp, x.message]; break; }
        }
      }
      if (bad) { bad[0].classList.add("bad"); bad[0].focus(); er.textContent = bad[1]; return; }
      if (A.some(function (row) { return row.every(function (z) { return abs(z) === 0; }); })) { er.textContent = "إحدى المعادلات كل معاملاتها صفر. أكمل الخانات (الخانة الفارغة تُعتبر صفرًا)."; return; }
      try {
        var x = solve(A, b), res = 0, scale = 0;
        A.forEach(function (row, k) { var s = C(0); row.forEach(function (z, c) { s = add(s, mul(z, x[c])); scale = Math.max(scale, abs(mul(z, x[c]))); }); res = Math.max(res, abs(sub(s, b[k]))); scale = Math.max(scale, abs(b[k])); });
        out.innerHTML = '<ul class="calc-sol">' + x.map(function (z, k) { var f = fmt(z, S.deg); return '<li><span class="ltr"><b>x' + SUB[k] + ' = ' + esc(f.main) + '</b> ' + esc(f.sub) + '</span>' + insertBtn(f.plain, "أدخل") + '</li>'; }).join("") + '</ul>' +
          '<p class="calc-note">' + (res <= 1e-9 * Math.max(scale, 1e-300) ? "تحققتُ: التعويض في المعادلات يعطي الطرف الأيمن." : "تنبيه: الحل غير دقيق عدديًا؛ المعادلات قريبة من الاعتماد على بعضها.") + ' الحاسبة تحل المعادلات التي كتبتها، فتأكد أن المعادلات نفسها صحيحة.</p>';
        out.querySelectorAll(".calc-ins").forEach(function (bt) { bt.addEventListener("click", function () { doInsert(bt.dataset.ins); }); });
        x.forEach(function (z, k) { vars["x" + (k + 1)] = z; }); persist();
        refreshInsert();
      } catch (e2) { if (!e2.calc) throw e2; er.textContent = e2.message; }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
