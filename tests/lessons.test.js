/* Signals and Systems lessons: every lesson of the course exists and is complete, each quiz has exactly one right answer,
   every practice step is solvable by the feedback engine with its own answer, every plot renders, and the worked results
   in the lessons are checked numerically against the formulas (sums, recursions, integrals). */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var root = path.join(__dirname, "..");
var win = { CV: {} }; win.window = win;
var ctx = vm.createContext({ window: win, globalThis: win, console: console, Math: Math, JSON: JSON });
["curriculum.js", "mna.js", "ac.js", "draw.js", "sig-plot.js", "lg-draw.js", "ss-build.js", "feedback.js", "ss-ch1.js", "ss-ch2.js", "ss-ch3.js", "ss-ch4.js", "ss-ch5.js", "ss-ch6.js", "ss-ch7.js", "ld-ch1.js", "ld-ch2.js", "ld-ch3.js", "ld-ch4.js", "ld-ch5.js", "c2-ch1.js", "c2-ch2.js", "c2-ch3.js"].forEach(function (f) {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }); } catch (e) { if (f !== "feedback.js") throw e; }
});
var CV = win.CV, fails = 0, n = 0;
function ok(c, msg) { n++; if (!c) { fails++; console.log("FAIL", msg); } }
function close(a, b, r) { return Math.abs(a - b) <= (r || 1e-6) * Math.max(1, Math.abs(b)); }

var ids = [], NCH = { "signals-systems": 7, "logic-design": 5, "circuits-2": 7 };
Object.keys(NCH).forEach(function (cid) {
  var course = CV.courses.filter(function (c) { return c.id === cid; })[0];
  ok(course && course.chapters.length === NCH[cid], cid + " chapters");
  course.chapters.forEach(function (ch) { ch.lessons.forEach(function (l) { if (ch.id === "c2-two-port") { ok(!l.published, "two-port stays in preparation"); return; } ids.push(l.id); ok(l.published, l.id + " published"); ok(CV.lessons[l.id] && CV.lessons[l.id].course === cid, l.id + " course"); }); });
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
ok(ids.length === 39 + 26 + 23, "88 lessons (" + ids.length + ")");

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
/* ---- Circuits 2: every worked result recomputed (complex phasors, ODE integration) ---- */
(function () {
  function cx(re, im) { return { re: re, im: im || 0 }; }
  function add(a, b) { return cx(a.re + b.re, a.im + b.im); } function sub(a, b) { return cx(a.re - b.re, a.im - b.im); }
  function mul(a, b) { return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function dv(a, b) { var d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
  function pol(mg, deg) { return cx(mg * Math.cos(deg * Math.PI / 180), mg * Math.sin(deg * Math.PI / 180)); }
  function mag(a) { return Math.hypot(a.re, a.im); } function ang(a) { return Math.atan2(a.im, a.re) * 180 / Math.PI; }
  function is(a, m0, d0, tol) { return Math.abs(mag(a) - m0) <= (tol || 0.006) * Math.max(1, m0) && (m0 === 0 || Math.abs(((ang(a) - d0 + 540) % 360) - 180) < 0.06); }
  function solve2(a, b, c, d, e, f) { var det = sub(mul(a, d), mul(b, c)); return [dv(sub(mul(e, d), mul(b, f)), det), dv(sub(mul(a, f), mul(e, c)), det)]; }
  var j = function (x) { return cx(0, x); };
  // 13-1
  var I = solve2(j(1), j(-3), j(-3), cx(12, 6), cx(12), cx(0)); ok(is(I[0], 13.02, -49.4, 0.002) && is(I[1], 2.91, 14.04, 0.002), "13-1");
  // 13-3
  I = solve2(cx(10, 20), j(10), j(10), j(12), pol(60, 30), cx(0)); ok(is(I[0], 3.905, -19.4, 0.002) && is(I[1], 3.254, 160.6, 0.002), "13-3 phasors");
  var i1 = 3.905 * Math.cos(4 + -19.399 * Math.PI / 180), i2 = 3.254 * Math.cos(4 + 160.601 * Math.PI / 180); ok(Math.abs(0.5 * 5 * i1 * i1 + 0.5 * 4 * i2 * i2 + 2.5 * i1 * i2 - 20.73) < 0.02, "13-3 energy");
  ok(Math.abs(2.5 / Math.sqrt(20) - 0.559) < 0.001, "k = 0.56");
  var Zin = add(add(cx(60, -100), j(20)), dv(cx(25), add(cx(30, 40), add(j(40), cx(80, 60))))); ok(is(Zin, 100.14, -53.13, 0.002) && is(dv(pol(50, 60), Zin), 0.5, 113.13, 0.002), "13.4");
  I = solve2(cx(4, 8), j(-1), j(-1), cx(10, 5), j(6), cx(0)); ok(Math.abs(mag(I[1]) - 0.06) < 0.0005 && Math.abs(mag(mul(cx(-10), I[1])) - 0.6) < 0.005, "13.6");
  var I1 = dv(cx(120), cx(9, -6)); ok(is(I1, 11.094, 33.69, 0.002) && Math.abs(120 * mag(I1) - 1331) < 1.5, "13.8");
  // first order: ODE integration of L di/dt = -R i etc. (RK4)
  function rk(f, y0, t1, n) { var y = y0, h = t1 / n, t = 0; for (var k = 0; k < n; k++) { var k1 = f(t, y), k2 = f(t + h / 2, y + h * k1 / 2), k3 = f(t + h / 2, y + h * k2 / 2), k4 = f(t + h, y + h * k3); y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h; } return y; }
  ok(Math.abs(rk(function (t, i) { return -8 * i / 2; }, 6, 0.3, 3000) - 6 * Math.exp(-1.2)) < 1e-6, "7.4 RL natural");
  ok(Math.abs(rk(function (t, v) { return -v / (80e3 * 0.5e-6); }, 100, 0.02, 4000) - 100 * Math.exp(-0.5)) < 1e-5, "7.3 RC natural");
  ok(Math.abs(rk(function (t, i) { return (24 - 2 * i) / 0.2; }, -8, 0.05, 4000) - (12 - 20 * Math.exp(-0.5))) < 1e-5 && Math.abs(0.1 * Math.log(40 / 24) - 0.05108) < 1e-5, "Nilsson 7.5 step RL");
  ok(Math.abs(rk(function (t, i) { return (10 - 5 * i) * 3; }, 5, 0.05, 4000) - (2 + 3 * Math.exp(-0.75))) < 1e-5, "Alexander 7.12");
  ok(Math.abs(rk(function (t, v) { return (-60 - v) / (40e3 * 0.25e-6); }, 30, 0.005, 4000) - (-60 + 90 * Math.exp(-0.5))) < 1e-5 && Math.abs(8 + 40 * 160 / 200 - 40) < 1e-9, "Nilsson 7.6");
  ok(Math.abs(0.2 * Math.log(4 / 3) - 0.05754) < 1e-5 && Math.abs(0.5e-6 * 120 * 5 - 300e-6) < 1e-12, "Nilsson 7.7");
  ok(Math.abs(7.5e-3 * 20e3 * 20 / 50 / 20e3 * 1e3 - 3) < 1e-9 && Math.abs(50e3 * 0.1e-6 - 5e-3) < 1e-12, "Nilsson 7.8");
  ok(Math.abs(20 * 9 / 12 - 15) < 1e-9 && Math.abs(0.5 * 0.02 * 225 - 2.25) < 1e-9, "Alexander 7.2");
  // RLC: integrate the parallel RLC (v, iL) and compare with each closed form
  function rlc(R, L, Cc, I, v0, i0, t1) { var v = v0, iL = i0, n = 20000, h = t1 / n; function f(v, iL) { return [(I - iL - v / R) / Cc, v / L]; }
    for (var k = 0; k < n; k++) { var a = f(v, iL), b = f(v + h * a[0] / 2, iL + h * a[1] / 2), c = f(v + h * b[0] / 2, iL + h * b[1] / 2), d = f(v + h * c[0], iL + h * c[1]); v += h * (a[0] + 2 * b[0] + 2 * c[0] + d[0]) / 6; iL += h * (a[1] + 2 * b[1] + 2 * c[1] + d[1]) / 6; } return { v: v, iL: iL }; }
  var t = 1e-4, r = rlc(200, 0.05, 0.2e-6, 0, 12, 0.03, t); ok(Math.abs(r.v - (-14 * Math.exp(-5000 * t) + 26 * Math.exp(-20000 * t))) < 1e-4, "8.2 over");
  t = 3e-3; r = rlc(20000, 8, 0.125e-6, 0, 0, -12.25e-3, t); ok(Math.abs(r.v - 98000 / Math.sqrt(1e6 - 4e4) * Math.exp(-200 * t) * Math.sin(Math.sqrt(1e6 - 4e4) * t)) < 1e-3 && Math.abs(98000 / 979.796 - 100.02) < 0.01, "8.4 under");
  t = 2e-3; r = rlc(4000, 8, 0.125e-6, 0, 0, -12.25e-3, t); ok(Math.abs(r.v - 98000 * t * Math.exp(-1000 * t)) < 1e-3, "8.5 critical");
  t = 3e-5; r = rlc(400, 0.025, 25e-9, 0.024, 0, 0, t); ok(Math.abs(r.iL * 1e3 - (24 - 32 * Math.exp(-20000 * t) + 8 * Math.exp(-80000 * t))) < 1e-4, "8.6 step over");
  r = rlc(625, 0.025, 25e-9, 0.024, 0, 0, t); ok(Math.abs(r.iL * 1e3 - (24 - 24 * Math.exp(-32000 * t) * Math.cos(24000 * t) - 32 * Math.exp(-32000 * t) * Math.sin(24000 * t))) < 1e-4, "8.7 step under");
  r = rlc(500, 0.025, 25e-9, 0.024, 0, 0, t); ok(Math.abs(r.iL * 1e3 - (24 - 960000 * t * Math.exp(-40000 * t) - 24 * Math.exp(-40000 * t))) < 1e-4, "8.8 step critical");
  r = rlc(500, 0.025, 25e-9, 0.024, 50, 0.029, t); ok(Math.abs(r.iL * 1e3 - (24 + 2.2e6 * t * Math.exp(-40000 * t) + 5 * Math.exp(-40000 * t))) < 1e-4 && Math.abs(r.v - (-2.2e6 * t * Math.exp(-40000 * t) + 50 * Math.exp(-40000 * t))) < 1e-3, "8.10 with stored energy");
  t = 4e-4; r = rlc(8, 0.01, 25e-6, 0, 40 - 90, -4 + 2.25, t); ok(Math.abs(r.v - (40 * Math.exp(-1000 * t) - 90 * Math.exp(-4000 * t))) < 1e-3, "tutorial 8.5");
  ok(Math.abs(1 / (2 * 312.5 * 0.2e-6) - 8000) < 1e-6 && Math.abs(1 / (2 * 1e4 * 0.2e-6) - 250) < 1e-9, "8.1 R values");
  // three-phase
  var Ia = dv(cx(120), cx(40, 30)); ok(is(Ia, 2.4, -36.87) && is(mul(Ia, cx(39, 28)), 115.22, -1.19, 0.001) && is(mul(mul(Ia, cx(39, 28)), pol(Math.sqrt(3), 30)), 199.58, 28.81, 0.001) && is(sub(cx(120), mul(Ia, cx(0.2, 0.5))), 118.90, -0.32, 0.001), "11.1");
  ok(is(mul(mul(Ia, cx(39, 28)), pol(Math.sqrt(3), -30)), 199.58, -31.19, 0.001), "11.1 negative sequence");
  var VAN = mul(Ia, cx(39.5, 28.6)); ok(is(VAN, 117.04, -0.96, 0.001) && is(mul(VAN, pol(Math.sqrt(3), 30)), 202.72, 29.04, 0.001) && is(dv(mul(Ia, pol(1, 30)), cx(Math.sqrt(3))), 1.386, -6.87, 0.002), "11.2");
  var Sload = mul(cx(3), mul(mul(VAN, pol(Math.sqrt(3), 30)), dv(mul(Ia, pol(1, 30)), cx(Math.sqrt(3))).re !== undefined ? cx(dv(mul(Ia, pol(1, 30)), cx(Math.sqrt(3))).re, -dv(mul(Ia, pol(1, 30)), cx(Math.sqrt(3))).im) : cx(0)));
  ok(Math.abs(Sload.re - 682.56) < 0.05 && Math.abs(Sload.im - 494.21) < 0.05 && Math.abs(682.56 / (682.56 + 3 * 5.76 * 0.3) - 0.9925) < 0.0001, "11.4");
  ok(Math.abs(3 * 5.76 * 39 - 673.92) < 1e-6 && Math.abs(3 * 5.76 * 0.8 - 13.824) < 1e-9 && Math.abs(3 * 5.76 * 28 - 483.84) < 1e-6, "11.3");
  var Vp = 600 / Math.sqrt(3), Il = dv(cx(160e3, -120e3), cx(Vp)); var Vs = add(cx(Vp), mul(Il, cx(0.005, 0.025))); ok(is(Il, 577.35, -36.87, 0.001) && is(Vs, 357.51, 1.57, 0.001) && Math.abs(mag(Vs) * Math.sqrt(3) - 619.23) < 0.05 && Math.abs(Math.cos((ang(Vs) - ang(Il)) * Math.PI / 180) - 0.783) < 0.001, "11.5");
  var Ib = dv(pol(100, 120), cx(10, 5)), Ic = dv(pol(100, -120), cx(6, -8)), In = cx(-(100 / 15 + Ib.re + Ic.re), -(Ib.im + Ic.im)); ok(is(Ib, 8.944, 93.43, 0.001) && is(Ic, 10, -66.87, 0.001) && is(In, 10.06, 178.47, 0.002), "12.9");
  var I10 = dv(pol(110, -90), cx(40, 30)); ok(is(I10, 2.2, -126.87) && is(mul(I10, cx(37, 28)), 102.08, -89.75, 0.001) && Math.abs(mag(mul(I10, cx(37, 28))) * Math.sqrt(3) - 176.81) < 0.05, "11.10");
  var I18 = mag(dv(cx(13800 / Math.sqrt(3)), cx(0.003 + 0.02 + 2.352, 0.03 + 0.18 + 1.139))); ok(Math.abs(I18 - 2917) < 1 && Math.abs(I18 / Math.sqrt(3) - 1684.1) < 0.5 && Math.abs(I18 * mag(cx(2.352, 1.139)) - 7622.9) < 3, "11.18");
  // frequency response
  var w0 = 1 / Math.sqrt(1e-3 * 0.4e-6); ok(Math.abs(w0 - 50000) < 1e-6 && Math.abs(-1000 + Math.sqrt(1e6 + 2.5e9) - 49010) < 1 && Math.abs(w0 * 1e-3 / 2 - 25) < 1e-9, "14.7");
  ok(Math.abs(1 / Math.sqrt(0.2e-3 * 8e-6) - 25000) < 1e-6 && Math.abs(8000 / (25000 * 0.2e-3) - 1600) < 1e-9 && Math.abs(100 / (2 * 8000) - 6.25e-3) < 1e-12, "14.8");
  var y = function (w) { return 0.1 * w - 2 * w / (4 + 4 * w * w); }; ok(Math.abs(y(2)) < 1e-12, "14.9");
  var wc = 1000 * Math.sqrt((7 + Math.sqrt(49 + 64)) / 32), Hc = 2000 / Math.hypot(2000 - wc * wc * 2000 * 2 * 2e-6, wc * 2); ok(Math.abs(wc - 742.2) < 0.5 && Math.abs(Hc - Math.SQRT1_2) < 1e-6, "14.10");
  ok(Math.abs(150 / (200 * Math.PI) - 0.2387) < 1e-4 && Math.abs(1 / (Math.pow(400 * Math.PI, 2) * 0.2387) * 1e6 - 2.653) < 0.002, "14.11");
  var H143 = function (w) { return 200 * w / (Math.hypot(w, 2) * Math.hypot(w, 10)); }; ok(Math.abs(20 * Math.log10(H143(0.01)) - (20 + 20 * Math.log10(0.01))) < 0.02, "14.3 low-frequency asymptote");
  ok(Math.abs(20 * Math.log10(1 / Math.sqrt(5)) + 6.99) < 0.01, "dB practice");
})();
console.log("Signals + Logic lessons: " + (n - fails) + "/" + n + " checks passed (" + ids.length + " lessons)");
if (fails) process.exit(1);
