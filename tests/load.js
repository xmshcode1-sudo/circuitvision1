/* loads the lab modules in node (they attach to globalThis.CV) */
const path = require("path"), root = path.join(__dirname, "..");
["clab-sim.js", "clab-exps.js", "clab-check.js"].forEach((f) => require(path.join(root, f)));
module.exports = globalThis.CV;
