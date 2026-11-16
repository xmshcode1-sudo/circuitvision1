/* numbers: every table row evaluates to a finite value, and the circuits of the manual give the textbook answers (nominal parts) */
const CV = require("./load.js"), K = CV.clabCheck;
let fail = 0, n = 0;
const exp = (id) => CV.clabExps.list.find((e) => e.id === id);
CV.clabExps.list.forEach((e) => e.procs.forEach((p) => (p.tables || []).forEach((t) => (t.rows || []).forEach((r) => {
  if (!r.q) return; n++;
  let v; try { v = K.evalQ(e, K.layoutOf(e, r.L, p), r.q, r.set || {}, true); } catch (x) { v = NaN; }
  if (!isFinite(v)) { fail++; console.log("FAIL not finite:", e.id, p.id, t.title, r.label); }
}))));
function near(name, got, want, tol) { n++; if (Math.abs(got - want) > (tol || 0.005) * Math.abs(want)) { fail++; console.log("FAIL", name, "got", got, "want", want); } }
function row(eid, pid, label) {
  const e = exp(eid), p = e.procs.find((x) => x.id === pid); let r = null;
  (p.tables || []).forEach((t) => t.rows.forEach((x) => { if (x.label === label) r = x; }));
  if (!r) { n++; fail++; console.log("FAIL row not found:", eid, pid, label); return NaN; }
  return K.evalQ(e, K.layoutOf(e, r.L, p), r.q, r.set || {}, true);
}
/* Lab 6 (Thevenin): Vs = 15 V, R1 = 470, R2 = 1k, R3 = 2.2k, R4 = 3.3k */
const Vth = 15 * 1000 / 1470, Rth = 2200 + 470 * 1000 / 1470;
near("exp6 VTh", row("exp6", "p1", "VTh = Voc"), Vth);
near("exp6 Isc", row("exp6", "p1", "Isc"), Vth / Rth, 0.01);
near("exp6 I4", row("exp6", "p1", "I4 في الدائرة الأصلية"), Vth / (Rth + 3300));
near("exp6 I4 (equivalent)", row("exp6", "p1", "I4 في مكافئ ثيفنن"), Vth / (Rth + 3300), 0.01);
console.log(`values: ${n - fail}/${n} ok`);
process.exit(fail ? 1 : 0);
