/* the wiring check accepts any electrically equivalent circuit, not only the manual's board, and still rejects wrong ones */
const CV = require("./load.js"), K = CV.clabCheck;
let fail = 0, n = 0;
function check(name, rep, ok, re) {
  n++; const text = rep.msgs.map((m) => m.t).join(" | ");
  const pass = rep.ok === ok && (!re || re.test(text));
  if (!pass) { fail++; console.log("FAIL", name, "→ ok=" + rep.ok, text || "(no message)"); }
}
const exp = (id) => CV.clabExps.list.find((e) => e.id === id);
const R = (v, id) => ({ t: "R", v: v, id: id || "R" + v });
const W = { t: "W", id: "W" };

/* reduce(): series, parallel, and parts that carry no current */
(function () {
  const s = (k, v, a, b) => ({ k, v, a, b, pol: 0 }), src = { k: "PS", a: "p", b: "n", pol: 1 };
  const one = [src, s("R", 100, "p", "n")];
  const eq = (x, y) => K.equiv(x, y);
  n++; if (!eq(one, [src, s("R", 50, "p", "m"), s("R", 50, "m", "n")])) { fail++; console.log("FAIL series 50+50 = 100"); }
  n++; if (!eq(one, [src, s("R", 200, "p", "n"), s("R", 200, "n", "p")])) { fail++; console.log("FAIL parallel 200∥200 = 100"); }
  n++; if (!eq(one, [src, s("R", 100, "p", "n"), s("R", 470, "n", "x")])) { fail++; console.log("FAIL a part with a free end is ignored"); }
  n++; if (eq(one, [src, s("R", 100, "p", "n"), s("R", 100, "p", "n")])) { fail++; console.log("FAIL 100∥100 must not equal 100"); }
  n++; if (eq(one, [src, s("R", 100, "p", "m"), s("C", 1e-6, "m", "n")])) { fail++; console.log("FAIL R+C must not equal R"); }
  n++; if (!eq([src, s("C", 2e-6, "p", "n")], [src, s("C", 1e-6, "p", "n"), s("C", 1e-6, "p", "n")])) { fail++; console.log("FAIL C in parallel add"); }
  n++; if (!eq([src, s("C", 0.5e-6, "p", "n")], [src, s("C", 1e-6, "p", "m"), s("C", 1e-6, "m", "n")])) { fail++; console.log("FAIL C in series"); }
})();

/* Lab 1, Ohm's law: R = 100 Ω between fields (2,3) and (2,4) */
(function () {
  const e = exp("exp1"), p = e.procs.find((x) => x.id === "p2"), L = p.layouts[0], base = () => { const s = K.stateFor(L, {}, false); s.inst.ps.on = true; return s; };
  let s = base(); s.parts = { "h:2:3": R(200, "R200a"), "h:2:3:a": R(200, "R200b") };
  check("two 200 Ω in parallel for 100 Ω", K.wiringReport(e, L, s), true, /مكافئ/);
  s = base(); s.parts = { "v:2:3": R(50, "R50a"), "h:3:3": R(50, "R50b"), "v:2:4": W };
  check("two 50 Ω in series along another path", K.wiringReport(e, L, s), true, /مكافئ/);
  s = base(); s.parts["h:0:0"] = R(220, "R220a"); s.parts["h:2:4"] = R(470, "R470a");
  check("extra parts left on the board (one end touching the circuit)", K.wiringReport(e, L, s), true);
  s = base(); s.parts["h:2:3:a"] = R(100, "R100~2");
  check("a second 100 Ω copy in parallel is a different circuit", K.wiringReport(e, L, s), false);
  s = base(); s.parts = { "h:2:3": R(100, "R100~3") };
  check("another copy of the same block in the same place", K.wiringReport(e, L, s), true);
})();

/* every ready circuit of the manual is still accepted exactly */
let ready = 0;
CV.clabExps.list.forEach((e) => e.procs.forEach((p) => (p.layouts || []).forEach((L) => {
  ready++; const r = K.wiringReport(e, L, K.stateFor(L, {}, false));
  n++; if (!r.ok) { fail++; console.log("FAIL ready circuit", e.id, p.id, L.id); }
  n++; if (r.msgs.some((m) => /مكافئ/.test(m.t))) { fail++; console.log("FAIL ready circuit marked as only equivalent", e.id, p.id, L.id); }
})));

/* the free lab checks the same circuits with every instrument of the course on the desk */
require("../clab-free.js"); require("../c2lab.js");
[[CV.clabExps.list, ["ps", "d1", "d2", "fg", "sc", "rb", "lb", "cb"]], [CV.c2lab.list, ["ps", "d1", "d2", "fg", "sc", "rb", "lb", "cb", "va", "cc", "tp", "wm"]]].forEach(([list, inst]) => {
  CV.clabFree.forFree(list, inst).forEach((e) => e.procs.forEach((p) => (p.layouts || []).forEach((L) => {
    ready++; n++; if (!K.wiringReport(e, L, K.stateFor(L, {}, false)).ok) { fail++; console.log("FAIL free bench", e.id, p.id, L.id); }
  })));
});

console.log(fail ? fail + " of " + n + " failed" : "equivalence: " + n + "/" + n + " ok (" + ready + " ready circuits)");
process.exit(fail ? 1 : 0);
