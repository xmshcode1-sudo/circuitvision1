/* MATLAB scripts: index, data, downloads and figures agree; every Circuits 1 and Signals lesson has its script;
   the downloadable .m has no hidden %check lines; the viewer renders every script. */
const fs = require("fs"), path = require("path"), assert = require("assert");
const root = path.join(__dirname, "..");
global.window = global; window.CV = {};
require(path.join(root, "matlab-index.js")); require(path.join(root, "matlab-view.js"));
const I = window.CV.matlabIndex, ids = Object.keys(I);
let n = 0;
function ok(c, m) { assert.ok(c, m); n++; }
ok(ids.length >= 87, "87 scripts");
for (const id of ids) {
  const e = I[id], d = JSON.parse(fs.readFileSync(path.join(root, "matlab/data", id + ".json"), "utf8"));
  ok(d.id === id && d.sections.length === e.n, id + ": sections");
  ok(fs.existsSync(path.join(root, "matlab", id + ".m")), id + ": source");
  const dl = fs.readFileSync(path.join(root, d.file), "utf8");
  ok(!/%check:/.test(dl), id + ": download has no %check");
  ok(d.sections.some(s => s.project), id + ": has a project section");
  let figs = 0;
  for (const s of d.sections) {
    ok(s.ar && s.ar.length, id + " " + s.t + ": Arabic explanation");
    ok(!/\bNaN\b|CHECK FAILED|^error:/m.test(s.out || ""), id + " " + s.t + ": clean output");
    if (s.fig) { figs++; ok(fs.existsSync(path.join(root, s.fig)), id + ": " + s.fig); }
  }
  ok(figs === e.figs, id + ": figure count");
  ok(window.CV.mlView.render(d, {}).indexOf("ml-sec") > 0, id + ": renders");
}
const lessonIds = new Set(ids.map(i => I[i].lesson).filter(Boolean));
const src = fs.readdirSync(root).filter(f => /^(c1-(elements|power|resistive|sinusoidal|techniques|variables)|ss-ch\d)\.js$/.test(f)).map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
const all = new Set([...src.matchAll(/(?:L\["|id:\s*")((?:c1|ss)-[\w-]+?-\d+)"/g)].map(m => m[1]));
for (const l of all) ok(lessonIds.has(l), l + ": has a MATLAB script");
ok(ids.filter(i => I[i].course === "intro").length >= 7, "intro series");
console.log("matlab: " + ids.length + " scripts, " + all.size + " lessons covered, " + n + " checks passed");
