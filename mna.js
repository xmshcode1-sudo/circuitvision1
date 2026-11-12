/* CircuitVision — DC circuit solver (Modified Nodal Analysis).
   Circuits are drawn on a grid of junction points; every edge between two neighbouring
   points holds one element:
     W  wire                         R  resistor (value Ω)
     V  independent voltage source   I  independent current source
     VCVS / CCVS / VCCS / CCCS       dependent sources controlled by a resistor (ctrl)
   Edge orientation: `a` is the top/left end, `b` the bottom/right end.
   Reference direction for every element's current: a → b (through the element).
   Voltage v_ab = v(a) − v(b). Power absorbed (passive sign convention): p = v_ab · i_ab.
   V sources: `plus` = "a" or "b" marks the + terminal. I sources: `dir` = "ab" or "ba"
   is the arrow direction. Dependent sources follow the same fields.
   Control quantities (for CCxS / VCxS): the controlling resistor's current i_ab or voltage v_ab. */
(function (root) {
  "use strict";

  function key(p) { return p[0] + "," + p[1]; }

  /* Union-find over junction points joined by wires → electrical nodes. */
  function buildNodes(circuit) {
    var parent = {};
    function find(k) { if (parent[k] === undefined) parent[k] = k; while (parent[k] !== k) { parent[k] = parent[parent[k]]; k = parent[k]; } return k; }
    function union(x, y) { var a = find(x), b = find(y); if (a !== b) parent[a] = b; }
    circuit.edges.forEach(function (e) { find(key(e.a)); find(key(e.b)); if (e.type === "W") union(key(e.a), key(e.b)); });
    var ids = {}, n = 0;
    var gKey = find(key(circuit.ground || [circuit.rows - 1, 0]));
    ids[gKey] = -1; // ground
    Object.keys(parent).forEach(function (k) { var r = find(k); if (ids[r] === undefined) ids[r] = n++; });
    return { count: n, of: function (p) { return ids[find(key(p))]; } };
  }

  function solveLinear(A, z) {
    var n = z.length, i, j, k;
    var M = A.map(function (row, r) { return row.slice().concat([z[r]]); });
    var scale = 0; M.forEach(function (row) { row.forEach(function (v) { scale = Math.max(scale, Math.abs(v)); }); });
    for (k = 0; k < n; k++) {
      var piv = k;
      for (i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[piv][k])) piv = i;
      if (Math.abs(M[piv][k]) < 1e-10 * Math.max(1, scale)) return null; // singular: invalid circuit
      var t = M[k]; M[k] = M[piv]; M[piv] = t;
      for (i = k + 1; i < n; i++) {
        var f = M[i][k] / M[k][k];
        if (f === 0) continue;
        for (j = k; j <= n; j++) M[i][j] -= f * M[k][j];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      var s = M[i][n];
      for (j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }

  /* Returns { ok, nodes, elements: [{ edge, v, i, p }], byName } or { ok:false, reason } */
  function solve(circuit) {
    var nodes = buildNodes(circuit), N = nodes.count;
    var els = circuit.edges.filter(function (e) { return e.type !== "W"; });
    var byName = {}; els.forEach(function (e) { if (e.name) byName[e.name] = e; });
    var vsrc = els.filter(function (e) { return e.type === "V" || e.type === "VCVS" || e.type === "CCVS"; });
    var M = N + vsrc.length;
    if (M === 0) return { ok: false, reason: "empty" };
    var A = [], z = [], r, c;
    for (r = 0; r < M; r++) { A.push(new Array(M).fill(0)); z.push(0); }
    function nd(p) { return nodes.of(p); }
    function addA(row, col, v) { if (row >= 0 && col >= 0) A[row][col] += v; }
    function ctrlNodes(e) {
      var ce = byName[e.ctrl];
      if (!ce || ce.type !== "R") throw new Error("control must be a resistor: " + e.ctrl);
      return { c: nd(ce.a), d: nd(ce.b), R: ce.value };
    }
    // Shorted elements (both ends on one node) make questions meaningless; report them.
    for (var s = 0; s < els.length; s++) if (nd(els[s].a) === nd(els[s].b)) return { ok: false, reason: "shorted", edge: els[s] };

    els.forEach(function (e) {
      var a = nd(e.a), b = nd(e.b), g, k;
      if (e.type === "R") {
        g = 1 / e.value;
        addA(a, a, g); addA(b, b, g); addA(a, b, -g); addA(b, a, -g);
      } else if (e.type === "I") {
        var I = e.dir === "ab" ? e.value : -e.value; // current a→b inside the source
        if (a >= 0) z[a] -= I; if (b >= 0) z[b] += I;
      } else if (e.type === "VCCS" || e.type === "CCCS") {
        var cn = ctrlNodes(e);
        g = e.type === "VCCS" ? e.value : e.value / cn.R; // i_ab = g · v_ctrl
        if (e.dir === "ba") g = -g;
        addA(a, cn.c, g); addA(a, cn.d, -g); addA(b, cn.c, -g); addA(b, cn.d, g);
      }
    });
    vsrc.forEach(function (e, idx) {
      var a = nd(e.a), b = nd(e.b), row = N + idx, sgn = e.plus === "a" ? 1 : -1, k;
      addA(a, row, 1); addA(b, row, -1);            // branch current a→b leaves node a
      addA(row, a, 1); addA(row, b, -1);            // v_a − v_b = …
      if (e.type === "V") z[row] = sgn * e.value;
      else {
        var cn = ctrlNodes(e);
        k = e.type === "VCVS" ? e.value : e.value / cn.R;  // (v+ − v−) = k · v_ctrl
        addA(row, cn.c, -sgn * k); addA(row, cn.d, sgn * k);
      }
    });

    var x = solveLinear(A, z);
    if (!x || x.some(function (v) { return !isFinite(v); })) return { ok: false, reason: "singular" };
    function volt(p) { var i = nd(p); return i < 0 ? 0 : x[i]; }

    var out = [], res = {};
    els.forEach(function (e) {
      var v = volt(e.a) - volt(e.b), i;
      if (e.type === "R") i = v / e.value;
      else if (e.type === "I") i = e.dir === "ab" ? e.value : -e.value;
      else if (e.type === "V" || e.type === "VCVS" || e.type === "CCVS") i = x[N + vsrc.indexOf(e)];
      else {
        var ce = byName[e.ctrl], vc = volt(ce.a) - volt(ce.b);
        var g2 = e.type === "VCCS" ? e.value : e.value / ce.value;
        i = (e.dir === "ab" ? 1 : -1) * g2 * vc;
      }
      var item = { edge: e, v: v, i: i, p: v * i };
      out.push(item); if (e.name) res[e.name] = item;
    });
    var sumP = out.reduce(function (s, it) { return s + it.p; }, 0);
    return { ok: true, nodes: nodes, volt: volt, elements: out, byName: res, powerSum: sumP };
  }

  root.CV = root.CV || {};
  root.CV.mna = { solve: solve, buildNodes: buildNodes };
  if (typeof module !== "undefined") module.exports = root.CV.mna;
})(typeof window !== "undefined" ? window : globalThis);
