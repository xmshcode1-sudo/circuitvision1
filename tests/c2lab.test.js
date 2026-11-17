/* Circuits 2 lab: every table must be consistent (the solution passes its own check), and the key numbers
   are recomputed here independently (hand formulas from the manual and the textbook). */
"use strict";
global.window = global; global.CV = {};
require("../c2lab.js");
var L = CV.c2lab.list, pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.log("FAIL:", m); } }
function near(a, b, t) { return Math.abs(a - b) <= (t || 0.003) * Math.max(1, Math.abs(b)); }
ok(L.length === 10, "ten experiments");
L.forEach(function (e, i) {
  ok(e.n === i + 1 && e.prelab.length && e.procs.length, e.id + " shape");
  e.prelab.forEach(function (t) { ok(isFinite(t.a) && t.u.length && t.sol, e.id + " prelab " + t.q.slice(0, 20)); });
  e.procs.forEach(function (p) {
    ok(p.fig && p.steps.length && p.tables.length, e.id + p.id + " has fig, steps, tables");
    if (p.inst) { var st = {}; (p.inst.controls || []).forEach(function (c) { st[c.k] = c.def; }); var r = p.inst.read(st); ok(r.meters.length > 0, e.id + p.id + " meters"); }
    p.tables.forEach(function (T) { T.rows.forEach(function (r) { var m = T.model(r); T.cols.forEach(function (c) { if (c.k && c.src !== "row") ok(m[c.k] !== undefined && (typeof m[c.k] !== "number" || isFinite(m[c.k])), e.id + " " + T.title + " " + c.k); }); }); });
  });
});
function pre(e, k) { return L[e - 1].prelab[k].a; }
var tau = 10e3 * 0.047e-6;
ok(near(pre(1, 1), 0.47e-3) && near(pre(1, 4), 10 - 20 * Math.exp(-2.5 / 0.47)) && near(pre(1, 4), 9.902, 0.001), "exp1 prelab");
var t1 = L[0].procs[0].tables[0];
ok(near(t1.model(0.47).cal, 10 * (1 - Math.exp(-1))) && near(t1.model(0.47).meas, 6.34, 0.002), "exp1 table (meas from the periodic waveform)");
var sq = CV.c2lab.rcSquare(0, 10, 200, tau); ok(near(sq.V0, 10 * Math.exp(-2.5 / 0.47) / (1 + Math.exp(-2.5 / 0.47)), 1e-9) && near(sq.at(5e-3 - 1e-12), sq.V0, 1e-6), "rc square periodic");
ok(near(pre(2, 2), -2.680, 0.002), "exp2 vC(T/2+τ)");
ok(near(L[2].procs[4].tables[1].model("—").k, 0.92, 0.01), "exp3 k recovered from the readings");
ok(near(pre(4, 0), 316227.77) && near(pre(4, 1), 6324.56) && near(pre(4, 3), 316069.6), "exp4 ω0, Rc, ωd");
ok(near(pre(5, 0), 12030.98) && near(pre(5, 1), 13.2288) && near(pre(5, 3), 3.8423e-3, 0.002), "exp5");
var s5 = L[4].procs[0].tables[1].model("—"); ok(near(s5.f2 - s5.f1, 100 / 0.0175 / (2 * Math.PI)) && near(Math.sqrt(s5.f1 * s5.f2), s5.f0), "exp5 bandwidth and geometric mean");
ok(near(pre(6, 0), 3804.53) && near(pre(6, 3), 3091.09) && near(pre(6, 4), 17.05e-3, 0.002), "exp6");
ok(near(pre(7, 0), 3183.1) && near(pre(7, 2), 1591.55) && near(pre(7, 3), -11.82, 0.002), "exp7");
var lp = L[6].procs[0].tables[0].model("cut"); ok(near(lp.g, -3.01, 0.01) && near(Math.abs(lp.th), 45, 0.02), "exp7 at cut-off: −3 dB, −45°");
ok(near(pre(8, 0), 10610.3) && near(pre(8, 1), 72343.2) && near(pre(8, 3), 27705.3), "exp8 formulas");
ok(near(20 * Math.log10(L[7].peak.m), -1.915, 0.005) && near(L[7].edges[0], 7.831, 0.005) && near(L[7].edges[1], 98.02, 0.005), "exp8 loaded circuit");
var Z = L[8].Z; ok(near(Z.z11.re, 2000) && near(Z.z11.im, 109.956) && near(Z.z21.im, 109.956), "exp9 z");
var C = CV.c2lab.Cx, I = C.mul(L[8].Y.y11, Z.z11); var chk = C.add(I, C.mul(L[8].Y.y12, Z.z21)); ok(near(chk.re, 1, 1e-9) && Math.abs(chk.im) < 1e-12, "exp9 Y = Z⁻¹");
ok(near(pre(10, 2), 1452) && near(pre(10, 5), 483.87), "exp10");
console.log("Circuits 2 lab: " + pass + "/" + (pass + fail) + " checks passed");
if (fail) process.exit(1);
