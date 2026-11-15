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
      if ("+-*/^()∥∠,=√ᴇ".indexOf(ch) > -1) { t.push({ k: ch }); i++; continue; }
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
    function power() { var b = primary(); while (eat("ᴇ")) b = mul(b, pow(C(10), unary())); if (eat("^")) return pow(b, unary()); return b; } // 2.4ᴇ9 is one number: 2.4×10⁹
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
    if (a >= 1e12 || a < 1e-12) return null;
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
  /* the keypad, laid out like a classic scientific calculator: each key has a main action and, printed above it,
     a SHIFT action (gold, left) and an ALPHA letter (red, right). Every action is real; keys without one have no label. */
  function K(main, act, sh, shAct, al, cls) { return { m: main, a: act, s: sh || "", sa: shAct, al: al || "", c: cls || "" }; }
  var FROWS = [
    [K("▭⁄▭", "#frac", "x⁻¹", "#inv"), K("√", "#sqrt", "Re", "re("), K("x²", "#sq", "x³", "#cube"), K("xⁿ", "#pow", "Im", "im("), K("log", "log(", "10ˣ", "#tenx"), K("ln", "ln(", "eˣ", "#ex")],
    [K("(−)", "-", "∠", "∠", "A"), K("∥", "∥", "conj", "conj(", "B"), K("Abs", "abs(", "Arg", "ang(", "C"), K("sin", "sin(", "sin⁻¹", "asin(", "D"), K("cos", "cos(", "cos⁻¹", "acos(", "E"), K("tan", "tan(", "tan⁻¹", "atan(", "F")],
    [K("RCL", "#rcl", "STO", "#sto"), K("j", "j", "ENG", "#eng"), K("(", "("), K(")", ")", "", null, "X"), K("S⇔D", "#sd", "", null, "Y"), K("M+", "#m+", "M−", "#m-", "M")]
  ];
  var NROWS = [
    [K("7", "7", "k", "k", "", "n"), K("8", "8", "M", "M", "", "n"), K("9", "9", "G", "G", "", "n"), K("DEL", "#del", "", null, "", "g"), K("AC", "#ac", "OFF", "#off", "", "g")],
    [K("4", "4", "m", "m", "", "n"), K("5", "5", "µ", "µ", "", "n"), K("6", "6", "n", "n", "", "n"), K("×", "×", "", null, "", "n"), K("÷", "÷", "", null, "", "n")],
    [K("1", "1", "p", "p", "", "n"), K("2", "2", "", null, "", "n"), K("3", "3", "", null, "", "n"), K("+", "+", "", null, "", "n"), K("−", "−", "", null, "", "n")],
    [K("0", "0", "", null, "", "n"), K(".", ".", "", null, "", "n"), K("×10ˣ", "#sci", "π", "π", "e", "n"), K("Ans", "ans", "", null, "", "n"), K("=", "#eq", "", null, "", "n")]
  ];
  var ALPHA_VAL = { A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", X: "X", Y: "Y", M: "M", e: "e" };
  function keyHtml(k, id) {
    return '<button type="button" class="cx-k ' + k.c + '" data-key="' + id + '" aria-label="' + esc(k.m) + (k.s ? " · SHIFT " + esc(k.s) : "") + '">' +
      '<span class="cx-lab"><i class="s">' + esc(k.s) + '</i><i class="a">' + esc(k.al) + '</i></span><b>' + esc(k.m) + '</b></button>';
  }

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
    var keys = {}, html = "";
    FROWS.forEach(function (r, i) { r.forEach(function (k, j) { keys["f" + i + j] = k; }); });
    NROWS.forEach(function (r, i) { r.forEach(function (k, j) { keys["n" + i + j] = k; }); });
    keys.mode = K("MODE", "#mode", "SETUP", "#setup"); keys.on = K("ON", "#ac");
    KEYMAP = keys;
    html = '<div class="cx" dir="ltr">' +
      '<div class="cx-brand"><b>CircuitVision</b><span>fx-CV · Phasor edition</span></div>' +
      '<div class="cx-lcd"><div class="cx-ind"><i id="cx-s">S</i><i id="cx-a">A</i><i id="cx-m">M</i><i id="cx-eng">ENG</i><i id="cx-cx">CMPLX</i><i id="cx-dr" class="on">' + (S.deg ? "D" : "R") + '</i></div>' +
      '<div id="calc-in" class="cx-in" dir="ltr" tabindex="0" role="textbox" aria-label="التعبير"></div>' +
      '<div class="cx-menu" id="cx-menu" hidden></div>' +
      '<div class="calc-out" aria-live="polite"><b id="calc-main"></b><span id="calc-sub"></span><span class="calc-err" id="calc-err"></span></div></div>' +
      '<div class="cx-top">' + keyHtml(K("SHIFT", "#shift", "", null, "", "shift"), "shift") + keyHtml(K("ALPHA", "#alpha", "", null, "", "alpha"), "alpha") +
      '<div class="cx-pad"><button type="button" class="u" data-key="up" aria-label="التعبير السابق">▲</button><button type="button" class="l" data-key="left" aria-label="يسار">◀</button><button type="button" class="r" data-key="right" aria-label="يمين">▶</button><button type="button" class="d" data-key="down" aria-label="التعبير التالي">▼</button></div>' +
      keyHtml(K("MODE", "#mode", "SETUP", "#setup", "", "sm"), "mode") + keyHtml(K("ON", "#ac", "", null, "", "sm"), "on") + '</div>' +
      '<div class="cx-f">' + Object.keys(keys).filter(function (k) { return k[0] === "f"; }).map(function (k) { return keyHtml(keys[k], k); }).join("") + '</div>' +
      '<div class="cx-n">' + Object.keys(keys).filter(function (k) { return k[0] === "n"; }).map(function (k) { return keyHtml(keys[k], k); }).join("") + '</div></div>' +
      '<div class="calc-row">' + insertBtn("", "أدخل الناتج في الإجابة") + '</div>' +
      (Object.keys(vars).length ? '<div class="calc-vars"><span class="muted">الذاكرة:</span>' + Object.keys(vars).map(function (k) { return '<button type="button" data-k="' + esc(k) + '" class="chip-v"><span class="ltr">' + esc(k) + ' = ' + esc(fmt(vars[k], S.deg).main) + '</span></button>'; }).join("") + '<button type="button" class="calc-link" id="calc-clrv">امسح</button></div>' : "") +
      (S.hist.length ? '<details class="calc-hist"><summary class="calc-hh"><span class="muted">السجل (' + S.hist.length + ')</span></summary><ol>' + S.hist.map(function (h, k) { return '<li><button type="button" data-h="' + k + '"><span class="ltr q">' + esc(h.q) + '</span><span class="ltr a">= ' + esc(h.a) + '</span></button></li>'; }).join("") + '</ol><button type="button" class="calc-link" id="calc-clrh">امسح السجل</button></details>' : "") +
      '<details class="calc-help"><summary>كيف أستخدمها؟</summary><ul>' +
      '<li><b>▭⁄▭</b> كسر: البسط فوق والمقام تحت، والأسهم ▲▼ تنقلك بينهما و ▶ تطلعك منه. نفس الشي مع الأس و √ و ×10ˣ: اضغط ▶ لتطلع منها.</li>' +
      '<li><b>SHIFT</b> ثم مفتاح: الوظيفة المكتوبة فوقه بالذهبي (مثل <span class="ltr">sin⁻¹</span> و <span class="ltr">∠</span> و π). <b>ALPHA</b> ثم مفتاح: الحرف الأحمر (متغيرات A–F و X و Y و M).</li>' +
      '<li>البادئات: SHIFT مع <span class="ltr">7 8 9</span> = <span class="ltr">k M G</span>، ومع <span class="ltr">4 5 6</span> = <span class="ltr">m µ n</span>، ومع 1 = p. مثال: <span class="ltr">4.7k ∥ 2.2k</span>.</li>' +
      '<li>المفتاح <b>j</b> للعدد التخيلي، و SHIFT ثم (−) يعطي ∠ للفيزور: <span class="ltr">10∠30</span>.</li>' +
      '<li><b>S⇔D</b> يبدّل عرض الناتج المركب بين <span class="ltr">a + jb</span> و <span class="ltr">r∠θ</span>. و SHIFT ثم j = <b>ENG</b> لعرض الناتج بالبادئات.</li>' +
      '<li><b>SHIFT RCL</b> (STO) ثم ALPHA وحرف: يحفظ آخر ناتج. <b>M+</b> يضيف الناتج للذاكرة M.</li>' +
      '<li><b>MODE</b>: 1 حاسبة، 2 حل معادلات (EQN). <b>SHIFT MODE</b>: الزوايا بالدرجات أو الراديان. ▲▼ تعيد التعبيرات السابقة.</li></ul></details>';
    return html;
  }
  var KEYMAP = {}, SHOWN = null;

  /* ---------- the natural display: an expression is a row of items; a fraction, power, root or ×10ˣ holds rows of its own ----------
     item: {t:"c", v:"7"} (one key's text, deleted as a whole) · {t:"frac", n:[], d:[]} · {t:"pow", e:[]} · {t:"sqrt", a:[]} · {t:"sci", e:[]} */
  var SLOTS = { frac: ["n", "d"], pow: ["e"], sqrt: ["a"], sci: ["e"] };
  function ser(row) { // to the text the parser reads; open brackets in a box close at its end, as on a real calculator
    var out = row.map(function (it) {
      if (it.t === "c") return it.v;
      if (it.t === "frac") return "((" + ser(it.n) + ")/(" + ser(it.d) + "))";
      if (it.t === "pow") return "^(" + ser(it.e) + ")";
      if (it.t === "sqrt") return "√(" + ser(it.a) + ")";
      return "ᴇ(" + ser(it.e) + ")";
    }).join(""), open = (out.match(/\(/g) || []).length - (out.match(/\)/g) || []).length;
    return out + (open > 0 ? new Array(open + 1).join(")") : "");
  }
  function empty(row) { return !row.length; }
  function findParent(root, row) { // → { row: parent row, i: index of the item, it: item, slot } or null at the top
    var res = null;
    (function walk(r) { r.forEach(function (it, i) { (SLOTS[it.t] || []).forEach(function (sl) { if (res) return; if (it[sl] === row) res = { row: r, i: i, it: it, slot: sl }; else walk(it[sl]); }); }); })(root);
    return res;
  }
  var LABEL = { ans: "Ans", "sin(": "sin(", asin: "sin⁻¹(" };
  function txt(v) { return v === "ans" ? "Ans" : v === "asin(" ? "sin⁻¹(" : v === "acos(" ? "cos⁻¹(" : v === "atan(" ? "tan⁻¹(" : v === "ang(" ? "Arg(" : v === "abs(" ? "Abs(" : v; }
  function draw(row, cur) {
    var h = "", here = function (k) { return cur && cur.row === row && cur.i === k ? '<span class="cx-cur"></span>' : ""; };
    row.forEach(function (it, k) {
      h += here(k);
      if (it.t === "c") h += "<span>" + esc(txt(it.v)) + "</span>";
      else if (it.t === "frac") h += '<span class="cx-fr"><span class="nu">' + slot(it.n, cur) + '</span><span class="de">' + slot(it.d, cur) + "</span></span>";
      else if (it.t === "pow") h += '<sup class="cx-sup">' + slot(it.e, cur) + "</sup>";
      else if (it.t === "sqrt") h += '<span class="cx-sq"><span class="rad">√</span><span class="ar">' + slot(it.a, cur) + "</span></span>";
      else h += '<span>×10</span><sup class="cx-sup">' + slot(it.e, cur) + "</sup>";
    });
    return h + here(row.length);
  }
  function slot(row, cur) { return empty(row) ? (cur && cur.row === row ? '<span class="cx-cur"></span>' : "") + '<span class="cx-box"></span>' : draw(row, cur); }
  function prettyNum(t) { return String(t).replace(/(-?\d+(?:\.\d+)?)e([+-]?)(\d+)/g, function (m, a, sg, d) { var SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" }; return a + "×10" + ((sg === "-" ? "-" : "") + d).split("").map(function (c) { return SUP[c]; }).join(""); }); }

  function wireExpr() {
    var box = panel.querySelector("#calc-in"), shift = false, alpha = false, pending = null, menu = null, hpos = -1;
    var root = S.tree && Array.isArray(S.tree) ? S.tree : [], cur = { row: root, i: root.length }, done = false;
    if (SHOWN && SHOWN.tree) { root = SHOWN.tree; cur = { row: root, i: root.length }; done = true; }
    function ind() {
      panel.querySelector("#cx-s").classList.toggle("on", shift); panel.querySelector("#cx-a").classList.toggle("on", alpha || !!pending);
      panel.querySelector("#cx-m").classList.toggle("on", !!vars.M && (vars.M.re !== 0 || vars.M.im !== 0)); panel.querySelector("#cx-eng").classList.toggle("on", !!S.eng);
      panel.querySelector("#cx-dr").textContent = S.deg ? "D" : "R";
      panel.querySelector(".cx-k.shift").classList.toggle("armed", shift); panel.querySelector(".cx-k.alpha").classList.toggle("armed", alpha);
    }
    function paint() { box.innerHTML = draw(root, done ? null : cur) || ""; var c = box.querySelector(".cx-cur"); if (c && c.scrollIntoView) try { c.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {} }
    function show(v, assign) {
      var m = panel.querySelector("#calc-main"), sb = panel.querySelector("#calc-sub"), ins = panel.querySelector(".calc-ins"), f = fmt(v, S.deg), c = clean(v);
      var main = f.main, sub2 = f.sub;
      if (c.im !== 0 && S.polar) { sub2 = "= " + f.main; main = f.sub.replace(/^= /, ""); }
      if (c.im === 0 && S.eng) { var e3 = engExp(c.re); if (e3) main = e3; }
      m.textContent = (assign ? assign + " = " : "") + prettyNum(main); sb.textContent = prettyNum(sub2); ins.dataset.ins = f.plain;
      panel.querySelector("#cx-cx").classList.toggle("on", c.im !== 0);
    }
    function clearOut() { panel.querySelector("#calc-main").textContent = ""; panel.querySelector("#calc-sub").textContent = ""; panel.querySelector(".calc-ins").dataset.ins = ""; panel.querySelector("#cx-cx").classList.remove("on"); }
    function preview(commit) {
      var q = ser(root), e = panel.querySelector("#calc-err");
      S.tree = root; paint();
      if (!root.length) { clearOut(); e.textContent = ""; persist(); return; }
      try {
        var r = parse(q, { deg: S.deg, vars: vars, ans: ans });
        e.textContent = ""; show(r.value, r.assign);
        if (commit) {
          if (r.assign) vars[r.assign] = r.value;
          ans = r.value; S.hist.unshift({ q: q, a: (r.assign ? r.assign + " = " : "") + fmt(r.value, S.deg).main, tree: JSON.parse(JSON.stringify(root)) }); S.hist = S.hist.slice(0, 15); hpos = -1;
          SHOWN = { tree: root, v: r.value, assign: r.assign }; persist(); render(); toggle(true);
          return;
        }
      } catch (x) {
        if (!x.calc) throw x;
        clearOut(); e.textContent = commit ? x.message : (/ناقص|غير مكتمل|قوس غير مغلق|اكتب تعبيرًا/.test(x.message) ? "" : x.message);
      }
      persist();
    }
    function fresh(withAns) { root = withAns ? [{ t: "c", v: "ans" }] : []; cur = { row: root, i: root.length }; done = false; SHOWN = null; }
    function startEdit(isOp) { if (done) fresh(isOp); SHOWN = null; }
    function ins(item, into) { // put an item at the cursor; `into` = the slot the cursor goes to
      cur.row.splice(cur.i, 0, item);
      if (into) cur = { row: item[into], i: item[into].length }; else cur.i++;
    }
    function put(v) { startEdit(/^[×÷−+∥]$/.test(v)); ins({ t: "c", v: v }); preview(false); }
    function struct(kind) {
      startEdit(kind === "pow" || kind === "sq" || kind === "cube" || kind === "inv");
      if (kind === "frac") { // digits just typed become the numerator, as on newer calculators
        var k = cur.i; while (k > 0 && cur.row[k - 1].t === "c" && /^[0-9.]$/.test(cur.row[k - 1].v)) k--;
        var it = { t: "frac", n: cur.row.splice(k, cur.i - k), d: [] }; cur.i = k; cur.row.splice(k, 0, it);
        cur = it.n.length ? { row: it.d, i: 0 } : { row: it.n, i: 0 };
      } else if (kind === "sqrt") ins({ t: "sqrt", a: [] }, "a");
      else if (kind === "sci") ins({ t: "sci", e: [] }, "e");
      else if (kind === "pow") ins({ t: "pow", e: [] }, "e");
      else if (kind === "sq" || kind === "cube") ins({ t: "pow", e: [{ t: "c", v: kind === "sq" ? "2" : "3" }] });
      else if (kind === "inv") ins({ t: "pow", e: [{ t: "c", v: "−" }, { t: "c", v: "1" }] });
      else if (kind === "tenx") { ins({ t: "c", v: "10" }); ins({ t: "pow", e: [] }, "e"); }
      else if (kind === "ex") { ins({ t: "c", v: "e" }); ins({ t: "pow", e: [] }, "e"); }
      preview(false);
    }
    function moveRight() {
      if (done) { done = false; cur = { row: root, i: 0 }; return; }
      if (cur.i < cur.row.length) { var it = cur.row[cur.i], sl = SLOTS[it.t]; if (sl) cur = { row: it[sl[0]], i: 0 }; else cur.i++; return; }
      var p = findParent(root, cur.row); if (!p) return;
      if (p.it.t === "frac" && p.slot === "n") cur = { row: p.it.d, i: 0 }; else cur = { row: p.row, i: p.i + 1 };
    }
    function moveLeft() {
      if (done) { done = false; cur = { row: root, i: root.length }; return; }
      if (cur.i > 0) { var it = cur.row[cur.i - 1], sl = SLOTS[it.t]; if (sl) { var last = it[sl[sl.length - 1]]; cur = { row: last, i: last.length }; } else cur.i--; return; }
      var p = findParent(root, cur.row); if (!p) return;
      if (p.it.t === "frac" && p.slot === "d") cur = { row: p.it.n, i: p.it.n.length }; else cur = { row: p.row, i: p.i };
    }
    function vert(dir) { // ▲▼ inside a fraction move between numerator and denominator; elsewhere they recall history
      var p = findParent(root, cur.row), r = cur.row;
      while (p && p.it.t !== "frac") { r = p.row; p = findParent(root, p.row); }
      if (p && !done) { var to = dir === "up" ? p.it.n : p.it.d; if (to !== r && !(p.slot === (dir === "up" ? "n" : "d"))) { cur = { row: to, i: Math.min(cur.i, to.length) }; return true; } }
      return false;
    }
    function del() {
      if (done) { fresh(false); preview(false); return; }
      if (cur.i > 0) {
        var it = cur.row[cur.i - 1], sl = SLOTS[it.t];
        if (!sl || sl.every(function (k) { return empty(it[k]); })) { cur.row.splice(cur.i - 1, 1); cur.i--; }
        else moveLeft(); // step into a box that still has content
      } else {
        var p = findParent(root, cur.row);
        if (p) { if (SLOTS[p.it.t].every(function (k) { return empty(p.it[k]); })) { p.row.splice(p.i, 1); cur = { row: p.row, i: p.i }; } else moveLeft(); }
      }
      preview(false);
    }
    function setMenu(kind) {
      menu = kind; var el = panel.querySelector("#cx-menu");
      if (!kind) { el.hidden = true; return; }
      el.innerHTML = kind === "mode" ? "<span>1:COMP</span><span>2:EQN</span>" : "<span>1:Deg</span><span>2:Rad</span>";
      el.hidden = false;
    }
    function press(id) {
      var k = KEYMAP[id], act;
      if (id === "shift") { shift = !shift; alpha = false; ind(); return; }
      if (id === "alpha") { alpha = pending ? true : !alpha; if (!alpha) pending = null; shift = false; ind(); return; }
      if (id === "left") { moveLeft(); paint(); return; }
      if (id === "right") { moveRight(); paint(); return; }
      if (id === "up" || id === "down") {
        if (vert(id)) { paint(); return; }
        if (!S.hist.length) return;
        hpos = Math.max(-1, Math.min(S.hist.length - 1, hpos + (id === "up" ? 1 : -1)));
        var h = hpos < 0 ? null : S.hist[hpos];
        root = h && h.tree ? JSON.parse(JSON.stringify(h.tree)) : h ? h.q.split("").map(function (c) { return { t: "c", v: c }; }) : [];
        cur = { row: root, i: root.length }; done = false; SHOWN = null; preview(false); return;
      }
      if (menu) {
        var d = k && /^[12]$/.test(k.m) ? k.m : null, mk = menu; setMenu(null);
        if (d && mk === "mode" && d === "2") { tab = "sys"; persist(); render(); toggle(true); return; }
        if (d && mk === "setup") { S.deg = d === "1"; persist(); ind(); SHOWN = null; preview(false); }
        return;
      }
      if (!k) return;
      if (alpha) {
        alpha = false; ind(); var L = k.al; if (!L) return;
        if (pending) { var nm = ALPHA_VAL[L]; pending = null; if (!ans) { panel.querySelector("#calc-err").textContent = "لا يوجد ناتج لحفظه بعد."; ind(); return; } vars[nm] = ans; persist(); render(); toggle(true); return; }
        startEdit(false); var prev = cur.row[cur.i - 1]; if (prev && (prev.t !== "c" || /[0-9.)]$/.test(prev.v))) ins({ t: "c", v: "×" }); // 2×M, never read as a prefix
        put(ALPHA_VAL[L]); return;
      }
      act = shift ? k.sa : k.a; shift = false; ind();
      if (act == null) return;
      if (act[0] !== "#") { put(act); return; }
      switch (act) {
        case "#eq": preview(true); return;
        case "#del": del(); return;
        case "#ac": fresh(false); hpos = -1; preview(false); return;
        case "#off": toggle(false); return;
        case "#mode": setMenu("mode"); return;
        case "#setup": setMenu("setup"); return;
        case "#frac": case "#sqrt": case "#sci": case "#pow": case "#sq": case "#cube": case "#inv": case "#tenx": case "#ex": struct(act.slice(1)); return;
        case "#sd": S.polar = !S.polar; persist(); redisplay(); return;
        case "#eng": S.eng = !S.eng; persist(); ind(); redisplay(); return;
        case "#rcl": alpha = true; ind(); return;
        case "#sto": pending = "sto"; alpha = true; ind(); return;
        case "#m+": case "#m-": {
          if (!ans) { panel.querySelector("#calc-err").textContent = "احسب ناتجًا أولًا ثم اضغط M+."; return; }
          vars.M = (act === "#m+" ? add : sub)(vars.M || C(0), ans); persist(); render(); toggle(true); return;
        }
      }
    }
    function redisplay() { if (done && SHOWN) { paint(); show(SHOWN.v, SHOWN.assign); } else preview(false); }
    panel.querySelectorAll(".cx [data-key]").forEach(function (b) { b.addEventListener("click", function () { press(b.dataset.key); }); });
    var KB = { "*": "×", "/": "#frac", "-": "−", "^": "#pow", "x": "×" };
    box.addEventListener("keydown", function (e) { // a hardware keyboard types into the display
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var key = e.key;
      if (key === "Enter" || key === "=") { e.preventDefault(); preview(true); return; }
      if (key === "Backspace") { e.preventDefault(); del(); return; }
      if (key === "ArrowLeft") { e.preventDefault(); moveLeft(); paint(); return; }
      if (key === "ArrowRight") { e.preventDefault(); moveRight(); paint(); return; }
      if (key === "ArrowUp" || key === "ArrowDown") { e.preventDefault(); press(key === "ArrowUp" ? "up" : "down"); return; }
      if (key === "Escape") return;
      if (key.length !== 1) return;
      e.preventDefault();
      var m = KB[key] || key;
      if (m[0] === "#") { struct(m.slice(1)); return; }
      put(m);
    });
    panel.querySelectorAll(".calc-vars [data-k]").forEach(function (b) { b.addEventListener("click", function () { put(b.dataset.k); }); });
    panel.querySelectorAll("[data-h]").forEach(function (b) { b.addEventListener("click", function () { var h = S.hist[+b.dataset.h]; root = h.tree ? JSON.parse(JSON.stringify(h.tree)) : h.q.split("").map(function (c) { return { t: "c", v: c }; }); cur = { row: root, i: root.length }; done = false; SHOWN = null; preview(false); }); });
    var ch = panel.querySelector("#calc-clrh"); if (ch) ch.addEventListener("click", function () { S.hist = []; persist(); render(); toggle(true); });
    var cv = panel.querySelector("#calc-clrv"); if (cv) cv.addEventListener("click", function () { vars = {}; persist(); render(); toggle(true); });
    panel.querySelector(".calc-ins").addEventListener("click", function () { if (this.dataset.ins) doInsert(this.dataset.ins); });
    ind();
    if (done && SHOWN) { paint(); show(SHOWN.v, SHOWN.assign); } else preview(false);
  }
  function engExp(x) { // engineering notation: mantissa 1–999 and a power of ten that is a multiple of 3
    if (x === 0 || !isFinite(x)) return null; var p = Math.floor(Math.log10(Math.abs(x)) / 3) * 3; if (p === 0) return null;
    var SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
    return sig(x / Math.pow(10, p), 6) + "×10" + String(p).split("").map(function (d) { return SUP[d]; }).join("");
  }

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
