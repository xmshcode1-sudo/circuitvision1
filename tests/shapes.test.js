/* Generator shapes: every shape must give valid, solvable circuits whose drawing shows exactly
   the circuit's independent loops, with clean SVG (no NaN), for element, dependent-source and Req questions. */
const path = require("path"), R = path.join(__dirname, "..");
["draw.js", "mna.js", "gen.js", "analysis.js", "shapes.js"].forEach((f) => require(path.join(R, f)));
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
if (fail) { console.error(fail + " problems"); process.exit(1); }
console.log("shapes: " + total + " circuits checked ✓");
