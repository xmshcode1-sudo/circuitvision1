/* Generator shapes: every shape must give valid, solvable circuits whose drawing shows exactly
   the circuit's independent loops, with clean SVG (no NaN), for element, dependent-source and Req questions. */
const path = require("path"), R = path.join(__dirname, "..");
["draw.js", "mna.js", "gen.js", "analysis.js", "ac.js", "mathcheck.js", "stepcheck.js", "shapes.js"].forEach((f) => require(path.join(R, f)));
const CV = globalThis.CV, S = CV.shapes;
let fail = 0, total = 0;
const bad = (m) => { fail++; console.error("✗ " + m); };
const expect = { square: 1, rect: 1, circle: 1, triangle: 1, pentagon: 1, hexagon: 1, octagon: 1, house: 2, bridge: 3, tri_center: 3, sq_diag: 4, wheel5: 5, nested: 5, wheel6: 6, cube: 5, ladder5: 5, grid23: 6 };
S.LIST.forEach((id) => {
  if (S.meshesOf(id) !== expect[id]) bad(id + ": loops " + S.meshesOf(id) + " ≠ " + expect[id]);
  let ok = 0, dep = 0, req = 0;
  for (let s = 1; s <= 60; s++) {
    const g = CV.gen.generate({ seed: s * 101, families: [id] });
    total++;
    if (!g) { bad(id + " seed " + s + ": no circuit"); continue; }
    const c = g.circuit, sol = CV.mna.solve(c);
    if (!sol.ok) bad(id + " seed " + s + ": not solvable");
    if (Math.abs(sol.powerSum) > 1e-6) bad(id + " seed " + s + ": power not balanced");
    if (S.electricalLoops(c) !== c.meshes) bad(id + " seed " + s + ": loops drawn " + c.meshes + " vs electrical " + S.electricalLoops(c));
    const svg = CV.draw.render(c);
    if (/NaN|undefined|Infinity/.test(svg)) bad(id + " seed " + s + ": bad SVG");
    if (c.meshes === 1 && !c.edges.some((e) => /^(CC|VC)/.test(e.type))) {
      const st = CV.gen.steps(g);
      if (!st || st.length < 3) bad(id + " seed " + s + ": no KVL steps");
      // the loop current in the steps must be the solver's
    }
    // mesh currents (clockwise) must rebuild every branch current: i_ab = I(p) − I(m)
    const M = CV.analysis.meshes(c, sol);
    if (!M || M.length !== c.meshes) bad(id + " seed " + s + ": meshes " + (M && M.length));
    else {
      const by = {}; M.forEach((m) => (by[m.name] = m.value));
      M.edgeFaces.forEach((x) => { const it = sol.elements.find((t) => t.edge === x.e); const ib = (x.p ? by[x.p] : 0) - (x.m ? by[x.m] : 0); if (it && Math.abs(it.i - ib) > 1e-6 * (1 + Math.abs(ib))) bad(id + " seed " + s + ": mesh currents do not give " + x.e.name); });
    }
    ok++;
    if (S.meshesOf(id) >= 2) {
      const d = CV.gen.generate({ seed: s * 101, families: [id], dependent: true });
      if (d) { dep++; if (/NaN|undefined/.test(CV.draw.render(d.circuit))) bad(id + " dep svg"); }
    }
    const q = CV.gen.generate({ seed: s * 101, families: [id], req: true });
    if (q) {
      req++;
      const v = CV.gen.reqValue(q.circuit);
      if (Math.abs(v - q.question.value) > 1e-6 * Math.max(1, v)) bad(id + " req mismatch");
      if (/NaN|undefined/.test(CV.draw.render(q.circuit))) bad(id + " req svg");
    }
  }
  console.log((id + "            ").slice(0, 12), "loops", S.meshesOf(id), " circuits", ok, " dependent", dep, " Req", req);
  if (S.meshesOf(id) >= 2 && dep < 20) bad(id + ": too few dependent-source circuits (" + dep + ")");
});
/* node-voltage, mesh-current, Thévenin and superposition questions work on every multi-loop shape */
S.LIST.filter((id) => S.meshesOf(id) >= 2).forEach((id) => ["vN", "iM", "Vth", "Rth", "sup"].forEach((k) => {
  let n = 0; for (let s = 1; s <= 6; s++) { const g = CV.gen.generate({ seed: s * 53, kinds: [k], kind: k, families: [id] }); if (g && !/NaN|undefined/.test(CV.draw.render(g.circuit))) n++; }
  if (n < 5) bad(id + " " + k + ": only " + n + "/6");
}));

/* the written solution is checked line by line on shapes too (house, seed 11: R1 = 40 Ω in the roof, Vs = 6 V in the ceiling) */
{
  const g = CV.gen.generate({ seed: 11, families: ["house"] }), ctx = CV.stepcheck.contextFor(g.circuit);
  const L = ["40*i1 - 6 = 0", "i1 = 0.15", "6 + 4*i2 + 24*i2 + 20*i2 = 0", "40*i1 + 6 = 0", "6 + 4*i2 + 20*i2 = 0"], want = ["ok", "ok", "ok", "err", "err"];
  const r = CV.stepcheck.check(L.join("\n"), ctx);
  r.lines.forEach((l, i) => { if (l.status !== want[i]) bad("step check '" + L[i] + "': " + l.status + " ≠ " + want[i]); });
  if (!/R4/.test(String(r.lines[4].msg || "").replace(/<[^>]+>/g, ""))) bad("step check did not name the missing R4");
  /* every step names its law: KVL where it is used right, and where it was aimed at but went wrong */
  [0, 2, 3, 4].forEach((i) => { if (!r.lines[i].law || r.lines[i].law.id !== "kvl") bad("step " + (i + 1) + " law: " + (r.lines[i].law && r.lines[i].law.id)); });
  if (r.lines[1].law) bad("a bare value got a law card");
  if (!r.summary.laws.some((x) => x.id === "kvl" && x.n === 2)) bad("summary of laws used");
  const e = g.circuit.edges.filter((x) => x.name === "R1")[0], so = ctx.sol.byName.R1;
  const r2 = CV.stepcheck.check(["i_R1 = v_R1/R1 = " + so.i, "p_R1 = i_R1^2*R1 = " + so.p, "v_R1 = Vs*R2/(R1+R2)"].join("\n"), ctx);
  ["ohm", "power", "vdiv"].forEach((id, i) => { if (!r2.lines[i].law || r2.lines[i].law.id !== id) bad("law of '" + r2.lines[i].text + "': " + (r2.lines[i].law && r2.lines[i].law.id) + " ≠ " + id); });
  if (!e || CV.stepcheck.vocab(ctx).indexOf("i1") < 0 || CV.stepcheck.vocab(ctx).indexOf("Vs") < 0) bad("vocab misses the circuit's names");
}
if (fail) { console.error(fail + " problems"); process.exit(1); }
console.log("shapes: " + total + " circuits checked ✓");
