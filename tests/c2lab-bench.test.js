/* Circuits 2 lab: the bench (clab-sim with the ready circuits of c2lab.js) must read what the tables expect, within 2 %,
   and every ready circuit must pass the wiring check. */
"use strict";
global.window = global; global.CV = {};
require("../clab-sim.js"); require("../clab-check.js"); require("../c2lab.js");
var S = CV.clabSim, K = CV.clabCheck, L = CV.c2lab.list;
function sol(e, pi, li, extra) { var Lx = e.procs[pi].layouts[li]; var st = K.stateFor(Lx, extra || {}, false); var opt = { only: e.inst };
  var term = (extra && extra.fgTerm) || Lx.set.fgTerm; if (term) { st.inst.fg.vpp = 10; var s0 = S.solve(st, opt), a = S.mag(S.vBetween(s0, "fg.out", "fg.com").ac); st.inst.fg.vpp = 10 * (term / 2) / a; }
  return { s: S.solve(st, opt), r: S.read(st, opt), st: st }; }
function row(T, r) { return T.model(r); }
var out = [];
// e1
var x = sol(L[0], 0, 0), v = S.vNode(x.s, "sc.1"), w = x.s.w;
[0.47, 1, 2.5].forEach(function (t) { out.push(["e1 vc " + t, S.at(v, w, t * 1e-3 - 1e-6), row(L[0].procs[0].tables[0], t).meas]); });
x = sol(L[1], 0, 0); v = S.vNode(x.s, "sc.1"); w = x.s.w;
[2.97, 4].forEach(function (t) { out.push(["e2 vc " + t, S.at(v, w, t * 1e-3), row(L[1].procs[0].tables[0], t).meas]); });
// e3
var e3 = L[2];
x = sol(e3, 0, 0); out.push(["e3 I1dc", x.r.d1.val, row(e3.procs[0].tables[0], "1").I]);
x = sol(e3, 0, 1); out.push(["e3 I2dc", x.r.d1.val, row(e3.procs[0].tables[0], "2").I]);
x = sol(e3, 1, 0); out.push(["e3 I1ac", x.r.d1.val, row(e3.procs[1].tables[0], "1").I]);
x = sol(e3, 1, 1); out.push(["e3 I2ac", x.r.d1.val, row(e3.procs[1].tables[0], "2").I]);
x = sol(e3, 2, 0); out.push(["e3 V2", x.r.d2.val, row(e3.procs[2].tables[0], "M").V2]);
x = sol(e3, 3, 0); out.push(["e3 VT", x.r.d1.val, row(e3.procs[3].tables[0], "—").VT]);
x = sol(e3, 4, 0); out.push(["e3 Iaid", x.r.d1.val, row(e3.procs[4].tables[0], "aiding").I]);
x = sol(e3, 4, 1); out.push(["e3 Iopp", x.r.d1.val, row(e3.procs[4].tables[0], "opposing").I]);
// e4: overshoot peak & period from samples
[0, 1, 2].forEach(function (li) { x = sol(L[3], 0, li); v = S.vNode(x.s, "sc.1"); w = x.s.w; var T = 2 * Math.PI / w, mx = -9, tmx = 0, prev = null, ups = [];
  for (var k = 0; k < 4000; k++) { var t = k / 4000 * T / 2, y = S.at(v, w, t); if (y > mx) { mx = y; tmx = t; } if (prev !== null && prev < 3 && y >= 3) ups.push(t); prev = y; }
  out.push(["e4 L" + (li + 1) + " max", mx, li === 0 ? NaN : 3]); if (li === 0) out.push(["e4 period µs", (ups[2] - ups[1]) * 1e6, row(L[3].procs[0].tables[0]).dt]); });
// e5
[0, 1, 2].forEach(function (pi) { [7.5, 12, 15].forEach(function (f) { x = sol(L[4], pi, 0, { fg: { f: f * 1000 } }); var m = row(L[4].procs[pi].tables[0], f); out.push(["e5 R" + pi + " VR " + f, x.r.d1.val, m.VR]); out.push(["e5 R" + pi + " VC " + f, x.r.d2.val, m.VC]); }); });
// e6
x = sol(L[5], 0, 0); out.push(["e6 I 1k mA", x.r.d2.val * 1e3, row(L[5].procs[0].tables[0], "الكلي").I]);
[2.4, 3.8, 6, 9].forEach(function (f) { x = sol(L[5], 1, 0, { fg: { f: f * 1000 } }); var T = f < 6 ? L[5].procs[1].tables[1] : L[5].procs[1].tables[0]; out.push(["e6 I " + f, x.r.d2.val * 1e3, row(T, f).I]); });
// e7
[[0, [0.5, 3, 20]], [1, [0.5, 2, 12]]].forEach(function (q) { q[1].forEach(function (f) { x = sol(L[6], q[0], 0, { fg: { f: f * 1000 } }); var vo = S.acRms(S.vBetween(x.s, "sc.2", "sc.2g")), ph = (S.ang(S.vBetween(x.s, "sc.2", "sc.2g").ac) - S.ang(S.vBetween(x.s, "fg.out", "fg.com").ac)) * 180 / Math.PI; var m = row(L[6].procs[q[0]].tables[0], f); out.push(["e7 p" + q[0] + " Vo " + f, vo, m.Vo]); out.push(["e7 p" + q[0] + " th " + f, ph, m.th]); }); });
// e8
[2, 27, 100].forEach(function (f) { x = sol(L[7], 0, 0, { fg: { f: f * 1000 } }); var vo = S.acRms(S.vBetween(x.s, "sc.2", "sc.2g")); out.push(["e8 Vo " + f, vo, L[7].H(f).m * 5 / (2 * Math.SQRT2)]); });
// e9: V1, I1(=Vsense/10), V2
[0, 1, 2, 3].forEach(function (pi) { x = sol(L[8], pi, 0); var V1 = S.vBetween(x.s, "t:1:1", "t:2:1").ac, V2 = S.vBetween(x.s, "t:1:3", "t:2:3").ac, T = L[8].procs[pi].tables[0];
  out.push(["e9 p" + (pi + 1) + " |V1|", S.mag(V1) / Math.SQRT2, row(T, "V1").m]); out.push(["e9 p" + (pi + 1) + " |V2|", S.mag(V2) / Math.SQRT2, row(T, "V2").m]); });
// e10
x = sol(L[9], 0, 0); out.push(["e10 IA", x.r.d1.val, 1.27]); out.push(["e10 VAB", x.r.d2.val, 219.97]);
x = sol(L[9], 1, 0); out.push(["e10 PA", x.r.wm.p, 161.29]); out.push(["e10 tot", x.r.wm.tot, 483.87]);
var bad = 0; out.forEach(function (o) { var d = isFinite(o[2]) ? Math.abs(o[1] - o[2]) / Math.max(Math.abs(o[2]), 0.05) : 0; if (d > 0.02) { bad++; console.log("FAIL: " + o[0] + "  bench " + (+o[1].toPrecision(5)) + "  table " + (+(+o[2]).toPrecision(5))); } });
var wired = 0, nl = 0;
L.forEach(function (e) { e.procs.forEach(function (p) { p.layouts.forEach(function (Lx) { nl++; var r = K.wiringReport(e, Lx, K.stateFor(Lx, {}, false)); if (r.ok) wired++; else { bad++; console.log("FAIL wiring " + e.id + " " + p.id + " " + Lx.id + ": " + r.msgs.map(function (m) { return m.t; }).join(" | ")); } }); }); });
console.log("Circuits 2 bench: " + (out.length - 0) + " readings agree with the tables, " + wired + "/" + nl + " ready circuits pass the wiring check" + (bad ? " — " + bad + " FAILED" : ""));
if (bad) process.exit(1);
