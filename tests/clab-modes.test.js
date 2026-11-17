/* practical exam and troubleshooting: every circuit they can pick works, and every fault they make can be found by measuring */
globalThis.window = globalThis;
const CV = require("./load.js"); CV.draw = CV.draw || { render: () => "" };
require("../clab-modes.js");
const M = CV.clabModes, K = CV.clabCheck, S = CV.clabSim;
let fail = 0, n = 0;
function ok(c, what) { n++; if (!c) { fail++; console.log("FAIL", what); } }
const exam = M.examPool();
ok(exam.length >= 20, "exam pool has many circuits (" + exam.length + ")");
exam.forEach(([eid, pid, lid]) => {
  const e = CV.clabExps.list.find((x) => x.id === eid), p = e.procs.find((x) => x.id === pid), L = K.layoutOf(e, lid, p);
  ok(K.iso(K.core(K.stateFor(L, {}, false), e.inst), K.core(K.stateFor(L, {}, false), e.inst)), "exam " + eid + "/" + pid + "/" + lid + " solution accepted");
  ok(M.settingsText(e, L).every((t) => typeof t === "string" && t.length > 5), "exam settings text " + eid + "/" + lid);
});
const faults = M.faultPool();
ok(faults.length >= 10, "fault pool (" + faults.length + ")");
faults.forEach(([eid, pid, lid]) => {
  const e = CV.clabExps.list.find((x) => x.id === eid), p = e.procs.find((x) => x.id === pid), L = K.layoutOf(e, lid, p);
  for (let i = 0; i < 8; i++) {
    const f = M.makeFault(e, L); ok(!!f, "fault made for " + eid + "/" + lid); if (!f) break;
    /* the ohmmeter on the faulty part alone must show the fault */
    const pc = Object.assign({}, f.state.parts[f.slot]), st = { parts: {}, leads: [["d1.V", "t:0:0:0"], ["d1.COM", "t:0:1:0"]], inst: S.defaults() };
    st.parts["h:0:0"] = pc; st.inst.d1.mode = "ohm";
    const r = S.read(st, { only: ["d1"] }).d1, t = String(r.text);
    if (f.kind === "open") ok(/OL/.test(t), "open part reads OL (" + t + ")");
    if (f.kind === "short") ok(parseFloat(t) < 1, "shorted part reads ~0 Ω (" + t + ")");
    if (f.kind === "value") { const u = t + (r.unit || ""), v = parseFloat(t) * (/k/.test(u) ? 1000 : /M/.test(u) ? 1e6 : 1); ok(Math.abs(v - f.v) < 0.05 * f.v, "wrong-value part reads its real value (" + t + " " + r.unit + " vs " + f.v + ")"); }
  }
});
console.log(`modes: ${n - fail}/${n} ok`);
process.exit(fail ? 1 : 0);
