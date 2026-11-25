/* extra multimeters of the free lab (d3–d6): an ammeter or voltmeter moved to an extra meter is still the same circuit,
   and its reading is the same as on the original meter */
const CV = require("./load.js"), K = CV.clabCheck, S = CV.clabSim, X = CV.clabExps;
let fails = 0;
function check(name, ok) { if (!ok) { fails++; console.log("FAIL", name); } }
const exp = (id) => X.list.find((e) => e.id === id);
let n = 0, nz = 0;
X.list.forEach((e) => e.procs.forEach((p) => (p.layouts || []).forEach((L) => {
  if (e.inst.indexOf("mn") > -1) return;
  ["d1", "d2"].forEach((d) => {
    if (!L.leads.some((l) => l.some((q) => q.indexOf(d + ".") === 0))) return;
    const to = d === "d1" ? "d3" : "d4", s = K.stateFor(L, {}, false);
    const st = JSON.parse(JSON.stringify(s));
    st.leads = st.leads.map((l) => l.map((q) => (q.indexOf(d + ".") === 0 ? to + q.slice(2) : q)));
    st.inst[to] = JSON.parse(JSON.stringify(st.inst[d])); st.inst[d] = S.defaults()[d]; st.xm = [to];
    const free = e.inst.filter((k) => k !== d).concat([]);
    const ef = Object.assign({}, e, { inst: e.inst.indexOf(d) > -1 && true ? e.inst.concat() : e.inst });
    const orig = K.wiringReport(e, L, s), moved = K.wiringReport(ef, L, st);
    check(e.id + "/" + p.id + "/" + L.id + " " + d + "→" + to + " (" + (orig.ok ? "ok" : "bad") + " vs " + (moved.ok ? "ok" : "bad") + ")", orig.ok === moved.ok);
    // same reading on the extra meter
    const r0 = S.read(s, { only: e.inst }), r1 = S.read(st, { only: e.inst.concat([to]) });
    check(e.id + "/" + p.id + " reading " + d + "→" + to, r0[d].text === r1[to].text); if (/[1-9]/.test(r1[to].text)) nz++;
    n++;
  });
})));
console.log(fails ? fails + " FAILED" : "extra meters: " + n + " moved-meter cases ✓ (" + nz + " with a non-zero reading)");
process.exit(fails ? 1 : 0);
