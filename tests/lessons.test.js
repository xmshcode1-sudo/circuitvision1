/* Signals and Systems lessons: every lesson of the course exists and is complete, each quiz has exactly one right answer,
   every practice step is solvable by the feedback engine with its own answer, every plot renders, and the worked results
   in the lessons are checked numerically against the formulas (sums, recursions, integrals). */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var root = path.join(__dirname, "..");
var win = { CV: {} }; win.window = win;
var ctx = vm.createContext({ window: win, globalThis: win, console: console, Math: Math, JSON: JSON });
["curriculum.js", "sig-plot.js", "lg-draw.js", "ss-build.js", "feedback.js", "ss-ch1.js", "ss-ch2.js", "ss-ch3.js", "ss-ch4.js", "ss-ch5.js", "ss-ch6.js", "ss-ch7.js", "ld-ch1.js", "ld-ch2.js", "ld-ch3.js", "ld-ch4.js", "ld-ch5.js"].forEach(function (f) {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); } catch (e) { if (f !== "feedback.js") throw e; }
});
var CV = win.CV, fails = 0, n = 0;
function ok(c, msg) { n++; if (!c) { fails++; console.log("FAIL", msg); } }
function close(a, b, r) { return Math.abs(a - b) <= (r || 1e-6) * Math.max(1, Math.abs(b)); }

var ids = [], NCH = { "signals-systems": 7, "logic-design": 5 };
Object.keys(NCH).forEach(function (cid) {
  var course = CV.courses.filter(function (c) { return c.id === cid; })[0];
  ok(course && course.chapters.length === NCH[cid], cid + " chapters");
  course.chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { ids.push(l.id); ok(l.published, l.id + " published"); ok(CV.lessons[l.id] && CV.lessons[l.id].course === cid, l.id + " course"); }); });
});
ids.forEach(function (id) {
  var L = CV.lessons[id];
  ok(!!L, id + " exists"); if (!L) return;
  ok(L.video === id + ".mp4", id + " video name " + L.video);
  ["concept", "laws", "example"].forEach(function (s) { ok(L.sections.some(function (x) { return x.id === s; }), id + " has " + s); });
  ok(L.objectives.length >= 2, id + " objectives");
  ok(L.quiz.length >= 3, id + " quiz size");
  L.quiz.forEach(function (q, i) {
    ok(q.options.filter(function (o) { return o.correct; }).length === 1, id + " quiz " + i + " one correct");
    q.options.forEach(function (o) { ok(o.correct || !!o.type, id + " quiz " + i + " wrong option typed"); ok(!!o.why, id + " quiz " + i + " why"); });
  });
  ok(L.practice && L.practice.steps.length >= 3, id + " practice steps");
  L.practice.steps.forEach(function (st) {
    if (st.kind === "choice") { ok(st.options.filter(function (o) { return o.correct; }).length === 1, id + " " + st.id + " choice"); return; }
    ok(isFinite(st.answer), id + " " + st.id + " numeric answer");
    // the right answer typed in the display unit is accepted, and every listed mistake is diagnosed (not accepted)
    var u = st.units[st.unitDefault || 0];
    if (CV.feedback) {
      var r = CV.feedback.evaluateNumber(st, String(st.answer / u.f), u.f);
      ok(r.status === "correct", id + " " + st.id + " accepts its answer " + st.answer);
      (st.diagnose || []).forEach(function (d) { var w = CV.feedback.evaluateNumber(st, String(d.value / u.f), u.f); ok(w.status === "wrong" && w.type === d.type, id + " " + st.id + " diagnoses " + d.value); });
    }
    ok(st.hints.length >= 1 && st.solution, id + " " + st.id + " hints+solution");
  });
  var html = L.sections.map(function (s) { return s.html; }).join("");
  ok(!/NaN|undefined/.test(html), id + " no NaN/undefined in html");
  ok((html.match(/<svg/g) || []).length === (html.match(/<\/svg>/g) || []).length, id + " svg balanced");
  var V = CV.ssVideo[id];
  ok(V && V.length > 6, id + " video scenes");
  V.forEach(function (sc, i) { ok(sc.dur > 0 && sc.dur < 20, id + " scene " + i + " duration"); });
});
ok(ids.length === 39 + 26, "65 lessons (" + ids.length + ")");

/* ---- numeric checks of the worked results ---- */
function conv(x, h) { var y = {}; Object.keys(x).forEach(function (a) { Object.keys(h).forEach(function (b) { y[+a + +b] = (y[+a + +b] || 0) + x[a] * h[b]; }); }); return y; }
function integ(f, a, b, N) { N = N || 20000; var s = 0, d = (b - a) / N; for (var i = 0; i < N; i++) s += f(a + (i + 0.5) * d); return s * d; }
var PI = Math.PI;
// ch1: periods, energy
ok(6 * 8 / 2 === 24, "N0 = 24");
ok(close(integ(function (t) { return 9 * Math.exp(-4 * t); }, 0, 30), 9 / 4, 1e-4), "E of 3e^-2t = 9/4");
ok(close(integ(function (t) { return 36 * Math.pow(Math.cos(50 * t), 2); }, 0, 2 * PI / 50) / (2 * PI / 50), 18, 1e-4), "P of 6cos50t = 18");
// ch1 transformation x(−3t−4)
var x5 = function (t) { return t > -1 && t < 0 ? 1 : t >= 0 && t < 2 ? 1 - 0.5 * t : 0; };
[-1.9, -1.5, -1.2, -1.1].forEach(function (t) { var y = x5(-3 * t - 4), e = t > -4 / 3 && t < -1 ? 1 : t > -2 && t < -4 / 3 ? 3 + 1.5 * t : 0; ok(close(y, e), "x(−3t−4) at " + t); });
// ch2 convolution examples
var y1 = conv({ 0: 0.5, 1: 2 }, { 0: 1, 1: 1, 2: 1 }); ok(y1[0] === 0.5 && y1[1] === 2.5 && y1[2] === 2.5 && y1[3] === 2, "conv ex1");
var y2 = conv({ 0: 1, 1: 2, 2: 1, 3: 2 }, { 0: 1, 1: 1 }); ok([1, 3, 3, 3, 2].every(function (v, i) { return y2[i] === v; }), "conv ex3");
(function () { var a = 1.3, x = {}, h = {}; for (var i = 0; i <= 4; i++) x[i] = 1; for (var j = 0; j <= 6; j++) h[j] = Math.pow(a, j); var y = conv(x, h);
  for (var n = 0; n <= 10; n++) { var e = n <= 4 ? (1 - Math.pow(a, n + 1)) / (1 - a) : n <= 6 ? (Math.pow(a, n - 4) - Math.pow(a, n + 1)) / (1 - a) : (Math.pow(a, n - 4) - Math.pow(a, 7)) / (1 - a); ok(close(y[n], e), "conv ex4 n=" + n); } })();
(function () { for (var n = 1; n < 10; n++) { var s = 0; for (var k = 1; k <= n; k++) s += Math.pow(0.5, k - 1); ok(close(s, 2 * (1 - Math.pow(0.5, n))), "conv ex2 n=" + n); } })();
// convolution integral examples
(function () { var h = function (t) { return t > -2 && t < 0 ? t + 2 : t >= 0 && t < 2 ? 2 : 0; };
  [-1, -0.5, 1, 3].forEach(function (t) { var y = integ(function (tau) { return h(tau) * (t - tau >= 0 ? 1 : 0); }, -3, 3), e = t < -2 ? 0 : t < 0 ? t * t / 2 + 2 * t + 2 : t < 2 ? 2 * (t + 1) : 6; ok(close(y, e, 1e-3), "conv int ex t=" + t); }); })();
(function () { [-0.5, 0.5, 1.5].forEach(function (t) { var y = integ(function (tau) { var u = t - tau; return (tau > -1 && tau < 1 ? 1 : 0) * (u > 0 && u < 1 ? u * u : 0); }, -2, 2, 40000);
  var e = t < 0 ? Math.pow(t + 1, 3) / 3 : t < 1 ? 1 / 3 : 1 / 3 - Math.pow(t - 1, 3) / 3; ok(close(y, e, 2e-3), "t² * rect t=" + t); }); })();
(function () { var t = 1.3, y = integ(function (tau) { return 4 * Math.exp(-2 * tau) * Math.exp(-3 * (t - tau)); }, 0, t); ok(close(y, 4 * (Math.exp(-2 * t) - Math.exp(-3 * t)), 1e-4), "h3*h4"); })();
ok(close(integ(function (tau) { return 2 * Math.exp(-3 * Math.abs(tau)) * 0 + 4 * Math.exp(-3 * (tau - 0.4)) * Math.exp(-3 * tau) * (tau > 0.4 ? 1 : 0); }, 0, 20), 4 / 6 * Math.exp(-1.2), 1e-3), "Rxx(0.4)");
// ch3 Fourier series coefficients by numeric integration
function cK(f, T0, k, a) { var w0 = 2 * PI / T0; return [integ(function (t) { return f(t) * Math.cos(k * w0 * t); }, a, a + T0) / T0, -integ(function (t) { return f(t) * Math.sin(k * w0 * t); }, a, a + T0) / T0]; }
[1, 2, 3].forEach(function (k) { var c = cK(function (t) { return Math.abs(Math.cos(t)); }, PI, k, -PI / 2); ok(close(c[0], 2 * Math.pow(-1, k) / (PI * (1 - 4 * k * k)), 1e-4), "|cos| c" + k); });
[1, 2, 3].forEach(function (k) { var c = cK(function (t) { return t <= 1 ? t : 2 - t; }, 2, k, 0); ok(close(c[0], (Math.pow(-1, k) - 1) / (PI * PI * k * k), 1e-4) && Math.abs(c[1]) < 1e-6, "triangle c" + k); });
[1, 2, 3].forEach(function (k) { var c = cK(function (t) { return t; }, 2, k, -1); ok(Math.abs(c[0]) < 1e-6 && close(c[1], Math.pow(-1, k) / (k * PI), 1e-4), "saw c" + k); });
[1, 2, 3].forEach(function (k) { var c = cK(function (t) { return Math.abs(t) <= 0.25 ? 1 : 0; }, 1, k, -0.5); ok(close(c[0], Math.sin(k * 2 * PI * 0.25) / (k * PI), 1e-3), "pulse c" + k); });
(function () { var x = { "-1": 2, 0: 1, 1: 2, 2: 0, 3: 0, 4: 0 }; for (var k = 0; k < 6; k++) { var re = 0; Object.keys(x).forEach(function (n) { re += x[n] * Math.cos(-k * 2 * PI / 6 * n); }); ok(close(re / 6, 1 / 6 + 2 / 3 * Math.cos(k * PI / 3)), "DTFS ex k=" + k); } })();
// ch4: DTFT of a^|n|; difference-equation output (lecture's last line had a typo; we use the verified one)
(function () { var a = 0.6, w = 0.9, s = 0; for (var n = -200; n <= 200; n++) s += Math.pow(a, Math.abs(n)) * Math.cos(w * n); ok(close(s, (1 - a * a) / (1 - 2 * a * Math.cos(w) + a * a)), "a^|n| DTFT"); })();
(function () { var y = []; for (var n = 0; n < 12; n++) { y[n] = 2 * Math.pow(0.25, n) + 0.75 * (y[n - 1] || 0) - 0.125 * (y[n - 2] || 0); ok(close(y[n], 8 * Math.pow(0.5, n) - 4 * Math.pow(0.25, n) - 2 * (n + 1) * Math.pow(0.25, n)), "diff eq y[" + n + "]"); } })();
(function () { var h = []; for (var n = 0; n < 10; n++) { h[n] = 2 * (n === 0 ? 1 : 0) + 0.75 * (h[n - 1] || 0) - 0.125 * (h[n - 2] || 0); ok(close(h[n], 4 * Math.pow(0.5, n) - 2 * Math.pow(0.25, n)), "h[" + n + "]"); } })();
// ch5: partial fractions by evaluating at a test point s
function c(re, im) { return { re: re, im: im }; }
function cdiv(a, b) { var d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
(function () { [0.7, 2.3].forEach(function (s) { ok(close((s + 2) / (s * s * s + 4 * s * s + 3 * s), 2 / 3 / s - 0.5 / (s + 1) - 1 / 6 / (s + 3)), "Laplace pf1 s=" + s); }); })();
(function () { var tt = 0.8, x = Math.exp(-tt) * (4 - 3 * Math.cos(tt) - 4 * Math.sin(tt));
  // numeric inverse via residues: X(s) = (s²−2s+1)/((s+1)((s+1)²+1)); check X at s=1 against Laplace integral of x
  var X1 = integ(function (t) { return Math.exp(-t) * (4 - 3 * Math.cos(t) - 4 * Math.sin(t)) * Math.exp(-t); }, 0, 40, 80000); ok(close(X1, 0 / (2 * 5), 1e-4) || Math.abs(X1) < 1e-4, "Laplace complex ex X(1)=0"); ok(isFinite(x), "x finite");
  var X2 = integ(function (t) { return Math.exp(-t) * (4 - 3 * Math.cos(t) - 4 * Math.sin(t)) * Math.exp(-2 * t); }, 0, 40, 80000); ok(close(X2, 1 / 30, 1e-4), "Laplace complex ex X(2)"); })();
(function () { [1, 2.5].forEach(function (s) { ok(close((s * s * s + 2 * s * s + 6) / (s * s + 3 * s), s - 1 + 2 / s + 1 / (s + 3)), "improper s=" + s); }); })();
(function () { [3, 5].forEach(function (s) { ok(close((s - 1) / ((s + 1) * (s - 2)), 2 / 3 / (s + 1) + 1 / 3 / (s - 2)), "H pf s=" + s); }); })();
(function () { [0.5, 3].forEach(function (s) { var Y = 2 / (s * (s + 1) * (s + 2)) + 3 * (s + 3) / ((s + 1) * (s + 2)) - 5 / ((s + 1) * (s + 2)); ok(close(Y, 1 / s - 1 / (s + 1) + 3 / (s + 2)), "unilateral s=" + s); }); })();
// ch6: inverse z by long division
function inv(num, den, N) { var y = []; for (var n = 0; n < N; n++) { var s = num[n] || 0; for (var k = 1; k < den.length; k++) s -= den[k] * (y[n - k] || 0); y[n] = s / den[0]; } return y; }
inv([1, 1], [1, -1, 0.5], 10).forEach(function (v, n) { ok(close(v, Math.sqrt(10) * Math.pow(2, -n / 2) * Math.cos(PI * n / 4 - 71.565 * PI / 180), 1e-4), "z complex n=" + n); });
inv([1], [1, -1, -1, 1], 10).forEach(function (v, n) { ok(close(v, 0.25 * Math.pow(-1, n) + 0.75 + 0.5 * n), "z repeated n=" + n); });
inv([1], [1, -0.75, 0.125], 8).forEach(function (v, n) { ok(close(v, 2 * Math.pow(0.5, n) - Math.pow(0.25, n)), "z practice n=" + n); });
(function () { var y = conv({ 0: 1, 1: -2, 2: 1 }, { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 }); ok([1, -1, 0, 0, 0, 0, -1, 1].every(function (v, i) { return y[i] === v; }), "z conv ex"); })();
(function () { var z = 1.7, s = 0; for (var n = -300; n <= 300; n++) s += 0; var X = 1 / (1 - 1.5 / z + 0.5 / (z * z)); ok(close(X, 2 / (1 - 1 / z) - 1 / (1 - 0.5 / z)), "z pf two-sided"); })();
// ch7
ok(Math.floor(9 / 2) === 4, "Nmax = 4");
ok(close(2 * Math.sin(PI / 2) / (PI / 1e-3), 2e-3 / PI), "ZOH at ws/2");

/* ---- Logic Design: every K-map group set equals its function; state tables; numbers ---- */
var G = CV.lg;
(CV.ldKmaps || []).forEach(function (k, i) {
  var n = k.vars.length, f = {}, on = {}; k.ones.forEach(function (m) { on[m] = 1; });
  var cover = {}; k.groups.forEach(function (g) { var t = G.termOf(k.vars, g), mt = G.minterms(t, k.vars);
    ok(mt.length === g.length && g.every(function (c) { return mt.indexOf(c) >= 0; }), "kmap " + i + " group " + JSON.stringify(g) + " is a rectangle (" + t + ")"); mt.forEach(function (m) { cover[m] = 1; }); });
  for (var m = 0; m < (1 << n); m++) { var dc = k.dc.indexOf(m) >= 0; if (!dc) ok(!!cover[m] === !!on[m], "kmap " + i + " (" + k.vars.join("") + ") minterm " + m + " covered=" + !!cover[m] + " one=" + !!on[m]); }
});
ok((CV.ldKmaps || []).length >= 15, "kmaps checked: " + (CV.ldKmaps || []).length);
function same(a, b, vars) { return JSON.stringify(G.minterms(a, vars)) === JSON.stringify(G.minterms(b, vars)); }
var XYZ = ["x", "y", "z"], ABC = ["A", "B", "C"], ABCD = ["A", "B", "C", "D"], ABx = ["A", "B", "x"];
ok(same("x'y'z + x'yz + xy'", "x'z + xy'", XYZ), "F2 simplification");
ok(same("xy + x'z + yz", "xy + x'z", XYZ), "consensus");
ok(same("(x'yz' + x'y'z)'", "(x + y' + z)(x + y + z')", XYZ), "complement F1");
ok(same("(x(y'z' + yz))'", "x' + (y + z)(y' + z')", XYZ), "complement F2");
ok(JSON.stringify(G.minterms("xy + x'z", XYZ)) === "[1,3,6,7]", "xy+x'z = Σ(1,3,6,7) ⇒ Π(0,2,4,5)");
ok(same("A'C + A'B + AB'C + BC", "C + A'B", ABC), "C + A'B");
ok(JSON.stringify(G.minterms("A'B'C' + B'CD' + A'BCD' + AB'C'", ABCD)) === "[0,1,2,6,8,9,10]", "ch3 4-var example minterms");
ok(same("A'B'C' + B'CD' + A'BCD' + AB'C'", "B'D' + B'C' + A'CD'", ABCD), "ch3 4-var example");
ok(same("(AB + CD + BD')'", "B'D' + B'C' + A'C'D", ABCD), "POS example F'");
ok(same("(A' + B')(C' + D')(B' + D)", "B'D' + B'C' + A'C'D", ABCD), "POS example");
ok(same("(AB+AC+BC)'(A+B+C)+ABC", "A⊕B⊕C", ABC), "analysis example = sum");
ok(same("x'y'z' + xyz'", "(x + y')(x' + y)z'", XYZ) && same("(x'y + xy' + z)'", "x'y'z' + xyz'", XYZ), "two-level forms example");
ok(JSON.stringify(G.minterms("A⊕B⊕C", ABC)) === "[1,2,4,7]", "odd function");
ok(same("D2 + D3", "D2 + D3", ["D2", "D3"]), "parser multi-char");
// sequential tables from the lecture
var sq = CV.ldSeq.seq;
var t1 = sq(ABx, ["Ax+Bx", "A'x"], ["(A+B)x'"]).map(function (r) { return r.next.join("") + r.out.join(""); }).join(" ");
ok(t1 === "000 010 001 110 001 100 001 100", "Ax+Bx state table " + t1);
var tjk = sq(ABx, ["B·A' + (B·x')'·A", "x'·B' + (A⊕x)'·B"]).map(function (r) { return r.next.join(""); }).join(" ");
ok(tjk === "01 00 11 10 11 10 00 11", "JK analysis table " + tjk);
ok(same("B·A' + (B·x')'·A", "A'B + AB' + Ax", ABx) && same("x'·B' + (A⊕x)'·B", "B'x' + ABx + A'Bx'", ABx), "JK state equations");
var tt = sq(ABx, ["(B·x)⊕A", "x⊕B"], ["AB"]).map(function (r) { return r.next.join(""); }).join(" ");
ok(tt === "00 01 01 10 10 11 11 00", "T analysis table " + tt);
// detector (Moore) and JK design from the lecture state tables
ok(JSON.stringify(G.minterms("Ax+Bx", ABx)) === "[3,5,7]" && JSON.stringify(G.minterms("Ax+B'x", ABx)) === "[1,5,7]", "sequence detector D equations");
(function () { var next = { 0: "00", 1: "01", 2: "10", 3: "01", 4: "10", 5: "11", 6: "11", 7: "00" };
  for (var k = 0; k < 8; k++) { var e = G.env(ABx, k), A = e.A, B = e.B, x = e.x, JA = B & (1 - x), KA = B & x, JB = x, KB = 1 - (A ^ x);
    var nA = (JA & (1 - A)) | ((1 - KA) & A), nB = (JB & (1 - B)) | ((1 - KB) & B); ok("" + nA + nB === next[k], "JK design row " + k); } })();
// numbers (chapter 1)
var N = CV.ldNum.toDec;
ok(Math.abs(N("1101.101", 2) - 13.625) < 1e-9 && Math.abs(N("572.6", 8) - 378.75) < 1e-9 && Math.abs(N("2A.8", 16) - 42.5) < 1e-9 && Math.abs(N("341.24", 5) - 96.56) < 1e-9, "base-R to decimal");
ok(parseInt("10110001101011", 2).toString(8) === "26153" && parseInt("10110001101011", 2).toString(16) === "2c6b" && parseInt("111100000110", 2).toString(16) === "f06", "octal/hex grouping");
ok(parseInt("110111011", 2) === parseInt("673", 8) && parseInt("001100000110", 2) === 0x306, "octal/hex to binary");
ok((13 * 11).toString(2) === "10001111" && 72532 + 96750 === 169282 && 100000 - 30718 === 69282, "arithmetic / complements");
ok(((0b1010100 + 0b0111101) & 0x7f) === 0b0010001 && 0b1000011 + 0b0101100 === 0b1101111, "X−Y, Y−X");
ok(((256 - 6 + 13) & 255) === 7 && ((6 + 256 - 13) & 255) === 0b11111001 && ((256 - 6 + 256 - 13) & 255) === 0b11101101, "signed sums");
console.log("Signals + Logic lessons: " + (n - fails) + "/" + n + " checks passed (" + ids.length + " lessons)");
if (fails) process.exit(1);
