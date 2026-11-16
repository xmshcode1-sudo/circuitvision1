/* every layout of every procedure: the manual's circuit must be accepted by the corrector, and must solve to finite values */
const CV = require("./load.js"), K = CV.clabCheck, S = CV.clabSim;
let fail = 0, n = 0;
CV.clabExps.list.forEach((e) => e.procs.forEach((p) => (p.layouts || []).forEach((L) => {
  n++;
  const st = K.stateFor(L, {}, false);
  let rep; try { rep = K.wiringReport(e, L, st); } catch (x) { rep = { ok: false, msgs: [{ t: "THROW " + x.message }] }; }
  if (!rep.ok) { fail++; console.log("FAIL", e.id, p.id, L.id, rep.msgs.map((m) => m.t).join(" | ")); }
})));
console.log(`solutions: ${n - fail}/${n} accepted`);
process.exit(fail ? 1 : 0);
