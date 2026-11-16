/* the corrector must catch the mistakes students actually make, and say which one */
const CV = require("./load.js"), K = CV.clabCheck, S = CV.clabSim;
let fail = 0, n = 0;
function check(name, rep, ok, re) {
  n++; const text = rep.msgs.map((m) => m.t).join(" | ");
  const pass = rep.ok === ok && (!re || re.test(text));
  if (!pass) { fail++; console.log("FAIL", name, "→ ok=" + rep.ok, text || "(no message)"); }
}
const clone = (x) => JSON.parse(JSON.stringify(x));
const exp = (id) => CV.clabExps.list.find((e) => e.id === id);

/* --- Lab 1, Ohm's law: supply → ammeter → R → supply, voltmeter across R --- */
(function () {
  const e = exp("exp1"), p = e.procs.find((x) => x.id === "p2"), L = p.layouts[0], base = () => K.stateFor(L, {}, false);
  let s = base(); check("correct", K.wiringReport(e, L, s), true);
  s = base(); s.leads = [["ps.m+", "t:2:3:3"], ["t:2:4:5", "ps.m-"], ["d1.A", "t:2:3:0"], ["d1.COM", "t:2:4:2"], ["d2.V", "t:2:3:1"], ["d2.COM", "t:2:4:1"]];
  check("ammeter in parallel", K.wiringReport(e, L, s), false, /توازي/);
  s = base(); s.leads = [["ps.m+", "d2.V"], ["d2.COM", "t:2:3:3"], ["t:2:4:5", "ps.m-"]];
  check("voltmeter in series", K.wiringReport(e, L, s), false, /توالي/);
  s = base(); s.leads = s.leads.map((l) => l[0] === "d2.V" ? ["d2.COM", l[1]] : l[0] === "d2.COM" ? ["d2.V", l[1]] : l);
  s.inst.ps.on = true; check("voltmeter leads reversed", K.wiringReport(e, L, s), true, /معكوس/);
  s = base(); s.inst.d1.mode = "vdc"; check("lead in A jack, dial not on A", K.wiringReport(e, L, s), false, /المفتاح/);
  s = base(); s.inst.d2.mode = "vac"; check("voltmeter on the wrong function", K.wiringReport(e, L, s), true, /وضع غير المطلوب/);
  s = base(); s.inst.ps.on = false; check("supply off", K.wiringReport(e, L, s), true, /مطفي/);
  s = base(); s.parts = {}; check("part missing", K.wiringReport(e, L, s), false, /ناقص/);
  s = base(); s.parts["h:2:3"].v = 1000; s.parts["h:2:3"].id = "R1ka"; check("wrong value", K.wiringReport(e, L, s), false, /ناقص|زيادة/);
  s = base(); s.leads = s.leads.filter((l) => l[1] !== "ps.m-"); check("return lead missing (open circuit)", K.wiringReport(e, L, s), false);
  s = base(); s.leads = s.leads.filter((l) => l[0] !== "d2.COM"); check("meter with one lead", K.wiringReport(e, L, s), false, /سلك واحد/);
  s = base(); s.leads = s.leads.filter((l) => !/^d2\./.test(l[0])); check("voltmeter not connected", K.wiringReport(e, L, s), false, /فولتميتر/);
  s = base(); s.parts["h:2:5"] = { t: "R", v: 220, id: "R220a" }; s.parts["h:2:4"] = { t: "W", id: "W" }; s.leads = s.leads.map((l) => l[0] === "t:2:4:5" ? ["t:2:6:5", "ps.m-"] : l);
  check("extra part in series", K.wiringReport(e, L, s), false, /زيادة/);
})();

/* --- Lab 2, KCL: two resistors that must be in parallel, wired in series instead --- */
(function () {
  const e = exp("exp2"), p = e.procs.find((x) => x.id === "p2"), L = p.layouts[0], s = K.stateFor(L, {}, false);
  check("exp2 KCL correct", K.wiringReport(e, L, clone(s)), true);
  const rs = Object.keys(s.parts).filter((k) => s.parts[k].t === "R");
  const t = clone(s); t.parts = {}; t.parts["h:0:0"] = s.parts[rs[0]]; t.parts["h:0:1"] = s.parts[rs[1]];
  t.leads = [["ps.m+", "d1.A"], ["d1.COM", "t:0:0:0"], ["ps.m-", "ps.s+"], ["ps.s-", "t:0:2:0"]];
  check("series instead of parallel", K.wiringReport(e, L, t), false, /توازي|مختلف/);
  const u = clone(s); u.leads = u.leads.filter((l) => !(l[0] === "ps.m-" && l[1] === "ps.s+")); u.inst.ps.mode = "series";
  check("30 V with the SERIES switch instead of a lead", K.wiringReport(e, L, u), true);
})();

/* --- instrument behaviour --- */
(function () {
  const st = { parts: { "h:0:0": { t: "R", v: 100, id: "R100" } }, leads: [["ps.m+", "t:0:0:0"], ["t:0:1:0", "ps.m-"]], inst: S.defaults() };
  st.inst.ps.on = true; st.inst.ps.m = { v: 10, i: 0.05 };
  let r = S.read(clone(st), { only: ["ps", "d1", "d2"] });
  n++; if (!(r.ps.m.cc && Math.abs(r.ps.m.i - 0.05) < 1e-6 && Math.abs(r.ps.m.v - 5) < 0.2)) { fail++; console.log("FAIL current limit (CC)", r.ps.m); }
  const sr = clone(st); sr.inst.ps.mode = "series"; sr.inst.ps.m = { v: 8, i: 1 }; sr.leads = [["ps.m+", "t:0:0:0"], ["t:0:1:0", "ps.s-"]];
  r = S.read(sr, { only: ["ps", "d1", "d2"] });
  n++; if (Math.abs(r.ps.m.i - 0.16) > 0.004) { fail++; console.log("FAIL series tracking: expected 16 V across 100 Ω", r.ps); }
  const pr = clone(st); pr.inst.ps.mode = "parallel"; pr.inst.ps.m = { v: 10, i: 0.04 };
  r = S.read(pr, { only: ["ps", "d1", "d2"] });
  n++; if (!(r.ps.m.cc && Math.abs(r.ps.m.i - 0.08) < 1e-6)) { fail++; console.log("FAIL parallel mode doubles the current limit", r.ps.m); }
  const fu = clone(st); fu.inst.ps.m = { v: 10, i: 1 }; fu.inst.d2.mode = "madc"; fu.leads = [["ps.m+", "d2.mA"], ["d2.COM", "ps.m-"]];
  r = S.read(fu, { only: ["ps", "d1", "d2"] });
  n++; if (!r.warn.some((w) => w.k === "fuse")) { fail++; console.log("FAIL mA fuse must blow on a short", r.warn); }
  const fg = { parts: { "h:0:0": { t: "R", v: 50, id: "x" } }, leads: [["fg.out", "t:0:0:0"], ["t:0:1:0", "fg.com"]], inst: S.defaults() };
  fg.inst.fg = { on: true, f: 1000, vpp: 10 };
  const sol = S.solve(fg, { only: ["fg", "sc", "d1"] }), a = S.mag(S.vBetween(sol, "fg.out", "fg.com").ac);
  n++; if (Math.abs(a - 2.5) > 0.01) { fail++; console.log("FAIL generator 50 Ω output: 10 Vpp open → 5 Vpp into 50 Ω, got amplitude", a); }
})();
console.log(`mistakes: ${n - fail}/${n} behave as expected`);
process.exit(fail ? 1 : 0);
