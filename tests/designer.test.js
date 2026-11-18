/* «صمّم دائرتك»: designs become exercises only when the solver accepts them, and the reasons given are right. */
const path = require("path"), R = path.join(__dirname, "..");
globalThis.window = globalThis;
["draw.js", "mna.js", "gen.js", "analysis.js", "ac.js", "mathcheck.js", "stepcheck.js", "shapes.js", "designer.js"].forEach((f) => require(path.join(R, f)));
const CV = globalThis.CV, D = CV.designer;
let fail = 0; const bad = (m) => { fail++; console.error("✗ " + m); }, ok = (c, m) => { if (!c) bad(m); };
const slot = (d, a, b) => d.slots.findIndex((s) => String(s.a) === String(a) && String(s.b) === String(b));
const put = (d, a, b, el) => { const i = slot(d, a, b); if (i < 0) throw new Error("no slot " + a + "→" + b); d.slots[i].el = el; };

// 1. one loop on the empty grid: Vs 12 V (+ at top) left, 4 Ω top, 2 Ω right, wire bottom → i = 2 A clockwise
let d = D.template("grid3x3");
ok(D.check(d).idle, "empty design is idle");
put(d, [0, 0], [1, 0], { type: "V", value: 12, plus: "a" }); put(d, [0, 0], [0, 1], { type: "R", value: 4 }); put(d, [0, 1], [1, 1], { type: "R", value: 2 }); put(d, [1, 0], [1, 1], { type: "W" });
let c = D.check(d);
ok(c.ok && c.loops === 1, "single loop accepted: " + c.msg);
ok(c.ok && Math.abs(c.sol.byName.R1.i - 2) < 1e-9, "loop current 2 A");
// the step checker knows the mesh current of a designed circuit
const ctx = CV.stepcheck.contextFor(c.open);
ok(ctx.meshes.length === 1, "designed circuit has its mesh for the step checker");

// 2. a dangling resistor
const d2 = JSON.parse(JSON.stringify(d)); put(d2, [0, 1], [0, 2], { type: "R", value: 5 });
c = D.check(d2); ok(!c.ok && /معلّق/.test(c.msg), "dangling resistor reported: " + c.msg);

// 3. a resistor shorted by a wire in parallel
const d3 = D.template("grid3x3");
put(d3, [0, 0], [1, 0], { type: "V", value: 12, plus: "a" }); put(d3, [0, 0], [0, 1], { type: "R", value: 4 }); put(d3, [0, 1], [1, 1], { type: "R", value: 2 }); put(d3, [1, 0], [1, 1], { type: "W" });
put(d3, [0, 1], [0, 2], { type: "W" }); put(d3, [0, 2], [1, 2], { type: "W" }); put(d3, [1, 1], [1, 2], { type: "W" });
c = D.check(d3); ok(!c.ok && /مقصور/.test(c.msg), "shorted resistor reported: " + c.msg);

// 4. two different voltage sources in parallel
const d4 = D.template("grid3x3");
put(d4, [0, 0], [1, 0], { type: "V", value: 12, plus: "a" }); put(d4, [0, 1], [1, 1], { type: "V", value: 5, plus: "a" }); put(d4, [0, 0], [0, 1], { type: "W" }); put(d4, [1, 0], [1, 1], { type: "W" });
put(d4, [0, 1], [0, 2], { type: "R", value: 3 }); put(d4, [0, 2], [1, 2], { type: "R", value: 3 }); put(d4, [1, 1], [1, 2], { type: "W" });
c = D.check(d4); ok(!c.ok && /لا يمكن حل/.test(c.msg), "parallel voltage sources reported: " + c.msg);

// 5. separate parts
const d5 = JSON.parse(JSON.stringify(d)); put(d5, [1, 2], [2, 2], { type: "R", value: 5 });
c = D.check(d5); ok(!c.ok, "separate part rejected");

// 6. equivalent resistance: a–b on the left, 6 Ω top, 3 Ω ∥ 6 Ω → 6 + 2 = 8 Ω; with a voltage source inside it is shorted
const d6 = D.template("grid3x3");
put(d6, [0, 0], [1, 0], { type: "T" }); put(d6, [0, 0], [0, 1], { type: "R", value: 6 }); put(d6, [0, 1], [1, 1], { type: "R", value: 3 });
put(d6, [1, 0], [1, 1], { type: "W" }); put(d6, [0, 1], [0, 2], { type: "R", value: 6 }); put(d6, [0, 2], [1, 2], { type: "W" }); put(d6, [1, 1], [1, 2], { type: "W" });
c = D.check(d6); ok(c.ok, "Req design accepted: " + c.msg);
let r = D.reqOf(c); ok(r && Math.abs(r.value - 8) < 1e-9 && r.red.ok, "Rab = 8 Ω with reduction steps");
put(d6, [0, 2], [1, 2], { type: "V", value: 9, plus: "a" });
c = D.check(d6); r = D.reqOf(c); ok(c.ok && r && Math.abs(r.value - 8) < 1e-9, "a voltage source is a wire for Rab");

// 7. on a shape: a hexagon with a source and three resistors
const d7 = D.template("hexagon"); d7.slots[0].el = { type: "V", value: 10, plus: "a" }; d7.slots[2].el = { type: "R", value: 5 }; d7.slots[3].el = { type: "R", value: 5 };
c = D.check(d7); ok(c.ok && c.loops === 1 && Math.abs(Math.abs(c.sol.byName.R1.i) - 1) < 1e-9, "hexagon design: |i| = 1 A");
ok(!/NaN|undefined/.test(CV.draw.render(c.c)), "hexagon design draws");

// 8. every generated exercise can be loaded into the designer and solves to the same values
let n = 0;
["loop", "pair", "ladder", "grid"].concat(CV.shapes.LIST).forEach((f) => {
  for (let s = 1; s <= 4; s++) {
    const g = CV.gen.generate({ seed: s * 97, families: [f] }); if (!g) continue;
    const x = D.check(D.fromCircuit(g.circuit)); n++;
    if (!x.ok) { bad(f + " seed " + s + ": copied circuit rejected: " + x.msg); continue; }
    g.solution.elements.forEach((it) => { const y = x.sol.byName[it.edge.name]; if (!y || Math.abs(y.i - it.i) > 1e-9 * (1 + Math.abs(it.i))) bad(f + " seed " + s + ": " + it.edge.name + " differs"); });
  }
});
if (fail) { console.error(fail + " problems"); process.exit(1); }
console.log("designer: all checks ✓ (" + n + " generated circuits copied into the designer)");
