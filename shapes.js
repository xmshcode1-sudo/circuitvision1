/* CircuitVision — circuit SHAPES for the generator (load after gen.js).
   Each shape is a fixed drawing (points in pixels, edges between them) with a known number of
   independent loops. The generator places sources, resistors and wires on its edges at random,
   then gen.js solves it with the MNA engine and rejects anything invalid — so every value and
   every answer comes from the solver, never from a guess.
   Edges may be slanted (triangles, polygons, wheels, cube) or curved wires on a circle (arc).
   Shapes are registered as extra generator families: CV.gen.generate({ families: ["hexagon"] }). */
(function (root) {
  "use strict";
  var CV = root.CV, Gi = CV.gen._internal;
  var GX = CV.draw.GAP_X, GY = CV.draw.GAP_Y;

  function poly(n, r, cx, cy, rot) {
    var out = [];
    for (var k = 0; k < n; k++) { var a = ((rot === undefined ? -90 : rot) + 360 / n * k) * Math.PI / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return out;
  }
  function ring(ids) { var e = []; for (var i = 0; i < ids.length; i++) e.push([ids[i], ids[(i + 1) % ids.length]]); return e; }
  function named(list, prefix) { var o = {}; list.forEach(function (p, i) { o[prefix + i] = p; }); return o; }
  function ids(n, prefix) { var a = []; for (var i = 0; i < n; i++) a.push(prefix + i); return a; }
  function merge(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }

  /* Every shape: pts {id: [x, y] px}, edges [[p, q, opts?]], meshes, ar/en names, short note.
     opts: { fixed: "W" } keeps a wire there, { arc: "id" } draws the wire as an arc around that point,
     { port: true } may become the open terminals a–b of an equivalent-resistance question. */
  var SHAPES = {
    square: { ar: "مربع", en: "Square", note: "حلقة واحدة، 8 فروع", build: function () {
      var p = { a: [0, 0], b: [170, 0], c: [340, 0], d: [340, 170], e: [340, 340], f: [170, 340], g: [0, 340], h: [0, 170] };
      return { pts: p, edges: ring(["a", "b", "c", "d", "e", "f", "g", "h"]).map(function (e, i) { return i === 7 ? e.concat([{ port: true }]) : e; }) };
    } },
    rect: { ar: "مستطيل", en: "Rectangle", note: "حلقة واحدة طويلة", build: function () {
      var p = { a: [0, 0], b: [170, 0], c: [340, 0], d: [510, 0], e: [510, 230], f: [340, 230], g: [170, 230], h: [0, 230] };
      return { pts: p, edges: ring(["a", "b", "c", "d", "e", "f", "g", "h"]).map(function (e, i) { return i === 7 ? e.concat([{ port: true }]) : e; }) };
    } },
    circle: { ar: "دائري", en: "Circle", note: "عناصر على محيط دائرة", build: function () {
      var cx = 200, cy = 200, r = 200, th = 19, p = { o: [cx, cy] }, e = [], angs = [-90, 0, 90, 180];
      function at(a) { a = a * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
      angs.forEach(function (a, i) { p["s" + i] = at(a - th); p["t" + i] = at(a + th); e.push(["s" + i, "t" + i, i === 3 ? { port: true } : {}]); });
      angs.forEach(function (a, i) { e.push(["t" + i, "s" + ((i + 1) % 4), { fixed: "W", arc: "o" }]); });
      return { pts: p, edges: e, center: "o", hidden: ["o"] };
    } },
    triangle: { ar: "مثلث", en: "Triangle", note: "حلقة واحدة، أضلاع مائلة", build: function () {
      var p = { a: [230, 0], b: [460, 380], c: [230, 380], d: [0, 380], m: [115, 190], n: [345, 190] };
      return { pts: p, edges: [["a", "n"], ["n", "b"], ["b", "c"], ["c", "d"], ["d", "m", { port: true }], ["m", "a"]] };
    } },
    pentagon: { ar: "خماسي", en: "Pentagon", note: "حلقة واحدة، 5 أضلاع", build: function () {
      var P = poly(5, 210, 220, 215); return { pts: named(P, "p"), edges: ring(ids(5, "p")).map(function (e, i) { return i === 3 ? e.concat([{ port: true }]) : e; }) };
    } },
    hexagon: { ar: "سداسي", en: "Hexagon", note: "حلقة واحدة، 6 أضلاع", build: function () {
      var P = poly(6, 210, 220, 210); return { pts: named(P, "p"), edges: ring(ids(6, "p")).map(function (e, i) { return i === 4 ? e.concat([{ port: true }]) : e; }) };
    } },
    octagon: { ar: "ثماني", en: "Octagon", note: "حلقة واحدة، 8 أضلاع", build: function () {
      var P = poly(8, 230, 240, 235, -112.5); return { pts: named(P, "p"), edges: ring(ids(8, "p")).map(function (e, i) { return i === 5 ? e.concat([{ port: true }]) : e; }) };
    } },
    house: { ar: "شكل بيت", en: "House", note: "حلقتان: سقف مثلث فوق مستطيل", build: function () {
      var p = { t: [200, 0], l: [0, 200], r: [400, 200], bl: [0, 430], bm: [200, 430], br: [400, 430] };
      return { pts: p, edges: [["t", "l"], ["t", "r"], ["l", "r"], ["l", "bl", { port: true }], ["r", "br"], ["bl", "bm"], ["bm", "br"]] };
    } },
    bridge: { ar: "معيّن (قنطرة)", en: "Bridge (diamond)", note: "3 حلقات، قنطرة ويتستون", build: function () {
      var p = { s1: [0, 0], s2: [0, 380], t: [320, 0], l: [110, 190], r: [530, 190], b: [320, 380] };
      return { pts: p, edges: [["s1", "t"], ["s1", "s2", { port: true }], ["s2", "b"], ["t", "l"], ["t", "r"], ["l", "b"], ["r", "b"], ["l", "r"]] };
    } },
    tri_center: { ar: "مثلث بمركز (Δ و Y)", en: "Triangle with centre (Δ–Y)", note: "3 حلقات، دلتا ونجمة معًا", build: function () {
      var P = poly(3, 270, 250, 280), p = named(P, "p"); p.o = [250, 280];
      return { pts: p, edges: ring(ids(3, "p")).map(function (e, i) { return i === 2 ? e.concat([{ port: true }]) : e; }).concat([["p0", "o"], ["p1", "o"], ["p2", "o"]]), center: "o" };
    } },
    sq_diag: { ar: "مربع بأقطار", en: "Square with diagonals", note: "4 حلقات حول عقدة في المركز", build: function () {
      var p = { a: [0, 0], b: [420, 0], c: [420, 420], d: [0, 420], o: [210, 210] };
      return { pts: p, edges: [["a", "b"], ["b", "c"], ["c", "d"], ["d", "a", { port: true }], ["a", "o"], ["b", "o"], ["c", "o"], ["d", "o"]], center: "o" };
    } },
    wheel5: { ar: "خماسي بمركز", en: "Pentagon wheel", note: "5 حلقات (عجلة)", build: function () {
      var P = poly(5, 250, 260, 255), p = named(P, "p"); p.o = [260, 255];
      return { pts: p, edges: ring(ids(5, "p")).map(function (e, i) { return i === 3 ? e.concat([{ port: true }]) : e; }).concat(ids(5, "p").map(function (k) { return [k, "o"]; })), center: "o" };
    } },
    nested: { ar: "مربع داخل مربع", en: "Square in a square", note: "5 حلقات", build: function () {
      var p = { A: [0, 0], B: [540, 0], C: [540, 440], D: [0, 440], a: [150, 120], b: [390, 120], c: [390, 320], d: [150, 320] };
      return { pts: p, edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A", { port: true }], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "a"], ["A", "a"], ["B", "b"], ["C", "c"], ["D", "d"]] };
    } },
    wheel6: { ar: "سداسي بمركز", en: "Hexagon wheel", note: "6 حلقات (عجلة)", build: function () {
      var P = poly(6, 260, 260, 260), p = named(P, "p"); p.o = [260, 260];
      return { pts: p, edges: ring(ids(6, "p")).map(function (e, i) { return i === 4 ? e.concat([{ port: true }]) : e; }).concat(ids(6, "p").map(function (k) { return [k, "o"]; })), center: "o" };
    } },
    cube: { ar: "مكعب", en: "Cube", note: "5 حلقات، 12 فرعًا (الخطوط الخلفية أسلاك)", build: function () {
      // front face, back face shifted up-right; the two hidden back edges stay wires so no element sits on a crossing
      var p = { f0: [0, 240], f1: [360, 240], f2: [360, 600], f3: [0, 600], b0: [260, 0], b1: [620, 0], b2: [620, 360], b3: [260, 360] };
      return { pts: p, edges: [["f0", "f1"], ["f1", "f2"], ["f2", "f3"], ["f3", "f0", { port: true }], ["b0", "b1"], ["b1", "b2"], ["b2", "b3", { fixed: "W" }], ["b3", "b0", { fixed: "W" }],
        ["f0", "b0"], ["f1", "b1"], ["f2", "b2"], ["f3", "b3"]], center: [310, 300],
        embed: { b0: [0, 0], b1: [600, 0], b2: [600, 600], b3: [0, 600], f0: [150, 150], f1: [450, 150], f2: [450, 450], f3: [150, 450] } };
    } },
    ladder5: { ar: "سلّم طويل", en: "Long ladder", note: "5 حلقات متتالية", build: function () {
      var p = {}, e = [], n = 6, dx = 150, hgt = 240;
      for (var i = 0; i < n; i++) { p["t" + i] = [i * dx, 0]; p["b" + i] = [i * dx, hgt]; e.push(["t" + i, "b" + i, i === 0 ? { port: true } : {}]); }
      for (i = 0; i < n - 1; i++) { e.push(["t" + i, "t" + (i + 1)]); e.push(["b" + i, "b" + (i + 1)]); }
      return { pts: p, edges: e, center: [(n - 1) * dx / 2, hgt / 2] };
    } },
    grid23: { ar: "شبكة ٢×٣", en: "2×3 mesh grid", note: "6 حلقات", build: function () {
      var p = {}, e = [], R = 3, C = 4, dx = 190, dy = 170, r, c;
      for (r = 0; r < R; r++) for (c = 0; c < C; c++) p["n" + r + c] = [c * dx, r * dy];
      for (r = 0; r < R; r++) for (c = 0; c < C - 1; c++) e.push(["n" + r + c, "n" + r + (c + 1)]);
      for (r = 0; r < R - 1; r++) for (c = 0; c < C; c++) e.push(["n" + r + c, "n" + (r + 1) + c, c === 0 ? { port: true } : {}]);
      return { pts: p, edges: e };
    } }
  };
  var ORDER = Object.keys(SHAPES);

  function U(xy) { return [Math.round(xy[1] / GY * 1e6) / 1e6, Math.round(xy[0] / GX * 1e6) / 1e6]; } // px → [row, col]
  function K(p) { return p[0] + "," + p[1]; }

  /* geometry → an empty circuit (all edges blank), cached per shape */
  var cache = {};
  function geometry(id) {
    if (cache[id]) return cache[id];
    var d = SHAPES[id].build(), pts = d.pts, maxX = 0, maxY = 0, n = 0, sx = 0, sy = 0;
    Object.keys(pts).forEach(function (k) { maxX = Math.max(maxX, pts[k][0]); maxY = Math.max(maxY, pts[k][1]); if ((d.hidden || []).indexOf(k) < 0) { sx += pts[k][0]; sy += pts[k][1]; n++; } });
    var edges = d.edges.map(function (t) {
      var A = pts[t[0]], B = pts[t[1]], o = t[2] || {};
      if (A[1] > B[1] + 1e-6 || (Math.abs(A[1] - B[1]) < 1e-6 && A[0] > B[0])) { var x = A; A = B; B = x; } // a = top (then left) end
      var e = { a: U(A), b: U(B) };
      if (o.fixed) e.fixed = o.fixed;
      if (o.arc) e.arc = U(pts[o.arc]);
      if (o.port) e.port = true;
      return e;
    });
    var used = {}; edges.forEach(function (e) { used[K(e.a)] = e.a; used[K(e.b)] = e.b; });
    var V = Object.keys(used).length;
    var ground = Object.keys(used).map(function (k) { return used[k]; }).sort(function (p, q) { return q[0] - p[0] || p[1] - q[1]; })[0];
    var cen = typeof d.center === "string" ? pts[d.center] : d.center || [sx / n, sy / n];
    var embed = null;
    if (d.embed) { embed = {}; Object.keys(d.embed).forEach(function (k) { embed[K(U(pts[k]))] = d.embed[k]; }); }
    cache[id] = { rows: maxY / GY + 1, cols: maxX / GX + 1, edges: edges, ground: ground, center: U(cen), meshes: edges.length - V + 1, embed: embed };
    return cache[id];
  }

  /* electrical independent loops: non-wire branches − nodes (wires merged) + 1 */
  function electricalLoops(c) {
    var par = {}, f = function (k) { if (par[k] === undefined) par[k] = k; while (par[k] !== k) k = par[k] = par[par[k]]; return k; };
    var B = 0;
    c.edges.forEach(function (e) { f(K(e.a)); f(K(e.b)); if (e.type === "W") { var x = f(K(e.a)), y = f(K(e.b)); if (x !== y) par[x] = y; } else if (e.type !== "T") B++; });
    var roots = {}; Object.keys(par).forEach(function (k) { roots[f(k)] = 1; });
    return B - Object.keys(roots).length + 1;
  }

  function addRes(e, R) { e.type = "R"; e.value = R.pick(Gi.RV); }

  function family(id) {
    return function (R, o) {
      o = o || {};
      var G = geometry(id), c;
      for (var tries = 0; tries < 30; tries++) {
        c = { shape: id, embed: G.embed, rows: G.rows, cols: G.cols, ground: G.ground, center: G.center, meshes: G.meshes, family: id,
          edges: G.edges.map(function (e) { var x = { a: e.a, b: e.b }; if (e.arc) x.arc = e.arc; if (e.port) x.port = true; if (e.fixed) x.fixed = e.fixed; return x; }) };
        var free = c.edges.filter(function (e) { return !e.fixed; });
        c.edges.forEach(function (e) { if (e.fixed) e.type = e.fixed; });
        var nSrc = o.single ? 1 : (G.meshes >= 3 ? (R() < 0.5 ? 1 : 2) : R.int(1, 2));
        var pick = R.shuffle(free), k;
        for (k = 0; k < nSrc; k++) {
          var kind = "V";
          if (G.meshes === 1) { if (o.allowI && k === 1) kind = "I"; }
          else if (R() < 0.3) kind = "I";
          Gi.addSource(pick[k], R, kind);
        }
        var pW = G.meshes === 1 ? 0.12 : 0.15;
        for (; k < pick.length; k++) { if (tries < 20 && R() < pW) pick[k].type = "W"; else addRes(pick[k], R); }
        if (electricalLoops(c) === G.meshes) break; // a ring of bare wires would hide a loop the student can see
      }
      return c;
    };
  }
  ORDER.forEach(function (id) { Gi.FAMILIES[id] = family(id); });

  /* KVL steps for single-loop shapes: walk the ring clockwise (as seen on screen) */
  function steps(gen) {
    var c = gen.circuit, sol = gen.solution, q = gen.question, fmt = CV.fmt;
    if (c.meshes !== 1 || q.kind === "Req" || c.edges.some(function (e) { return /^(CC|VC)/.test(e.type); })) return null;
    var adj = {};
    c.edges.forEach(function (e) { (adj[K(e.a)] = adj[K(e.a)] || []).push(e); (adj[K(e.b)] = adj[K(e.b)] || []).push(e); });
    var seq = [], cur = c.edges[0].a, prev = null, area = 0;
    for (var s = 0; s < c.edges.length; s++) {
      var e = adj[K(cur)].filter(function (x) { return x !== prev; })[0];
      if (!e) return null;
      var along = K(e.a) === K(cur), nxt = along ? e.b : e.a;
      area += cur[1] * nxt[0] - nxt[1] * cur[0]; // shoelace with x = col, y = row (y down: > 0 is clockwise)
      seq.push({ e: e, along: along }); prev = e; cur = nxt;
    }
    if (area < 0) seq.forEach(function (x) { x.along = !x.along; });
    var cw = seq.filter(function (x) { return x.e.type !== "W"; });
    var iCW = cw.filter(function (x) { return x.e.type === "R"; }).map(function (x) { return x.along ? sol.byName[x.e.name].i : -sol.byName[x.e.name].i; })[0];
    var lines = ["الدائرة حلقة واحدة مهما كان شكلها (" + SHAPES[c.shape].ar + ")، فكل العناصر يمر بها <b>نفس التيار</b>. نفرض تيار الحلقة <span class='eq-i'>i</span> مع عقارب الساعة."];
    var hasI = c.edges.filter(function (e) { return e.type === "I"; });
    if (hasI.length) lines.push("مصدر التيار <span class='ltr'>" + hasI[0].name + "</span> يفرض تيار الحلقة مباشرة: <span class='eq-i'>i = " + fmt(iCW, "A") + "</span> (بإشارة حسب اتجاه سهمه مقارنة بعقارب الساعة).");
    else {
      var rise = 0, rs = 0, terms = [];
      cw.forEach(function (x) {
        if (x.e.type === "V") { var plusAhead = (x.e.plus === "b") === x.along; rise += plusAhead ? x.e.value : -x.e.value; terms.push((plusAhead ? "+" : "−") + x.e.value); }
        if (x.e.type === "R") rs += x.e.value;
      });
      lines.push("KVL حول الحلقة: مجموع ارتفاعات الجهد في المصادر = مجموع الهبوط في المقاومات: <span class='eq-i'>" + terms.join(" ").replace(/^\+/, "") + " = i × " + rs + "</span>");
      lines.push("<span class='eq-i'>i = " + CV.num(rise) + " / " + rs + " = " + fmt(iCW, "A") + "</span>");
    }
    var asked = cw.filter(function (x) { return x.e.name === q.el; })[0];
    if (asked && asked.e.type === "R" && q.kind !== "pR")
      lines.push("سهم المرجع في <span class='ltr'>" + q.el + "</span> " + (asked.along ? "مع عقارب الساعة، فتياره <span class='eq-i'>+i</span>." : "<b>عكس</b> عقارب الساعة، فتياره بالنسبة لسهمه <span class='eq-i'>−i</span>."));
    lines.push(Gi.finalLine(gen));
    return lines;
  }

  /* ---------- meshes of a shape: faces of its planar drawing ----------
     Faces are found by walking half-edges around each vertex in angle order (the cube uses a planar
     embedding of itself, front face inside the back face). Each inner face is a mesh; its current runs
     the same way round as the walk, and branch currents give the mesh currents by propagation from
     the outer face (current 0). Output matches analysis.meshes: [{ at, value, text, name, ccw }] plus
     edgeFaces [{ e, p, m }] with i_ab = I(p) − I(m). */
  /* where to draw a mesh arrow: the point inside the loop farthest from every wire, element and label */
  function segDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1);
    t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function inside(p, poly) {
    var r = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) r = !r;
    }
    return r;
  }
  function clearSpot(c, poly) {
    var d = function (p) { return [p[1] * GX, p[0] * GY]; }, cen = d(c.center), segs = [], marks = [];
    c.edges.forEach(function (e) {
      var A = d(e.a), B = d(e.b); segs.push([A, B]);
      if (e.type === "W") return;
      var L = Math.hypot(B[0] - A[0], B[1] - A[1]), nx = (B[1] - A[1]) / L, ny = -(B[0] - A[0]) / L, m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      var od = (m[0] - cen[0]) * nx + (m[1] - cen[1]) * ny, sd = Math.abs(od) < 2 ? 1 : od > 0 ? 1 : -1;
      marks.push([m[0] + nx * sd * 36, m[1] + ny * sd * 36]);
    });
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, best = null, bs = -1;
    poly.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
    var ax = 0, ay = 0; poly.forEach(function (q) { ax += q[0]; ay += q[1]; }); ax /= poly.length; ay /= poly.length;
    for (var i = 1; i < 24; i++) for (var j = 1; j < 24; j++) {
      var p = [x0 + (x1 - x0) * i / 24, y0 + (y1 - y0) * j / 24];
      if (!inside(p, poly)) continue;
      var sc = Infinity;
      segs.forEach(function (sg) { sc = Math.min(sc, segDist(p, sg[0], sg[1])); });
      marks.forEach(function (m) { sc = Math.min(sc, Math.hypot(p[0] - m[0], p[1] - m[1]) * 0.75); });
      sc = Math.min(sc, 60) - Math.hypot(p[0] - ax, p[1] - ay) * 0.02; // among equally clear points, stay near the middle
      if (sc > bs) { bs = sc; best = p; }
    }
    return best || [ax, ay];
  }
  var SUBN = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  function meshes(c, sol) {
    var E = c.edges.filter(function (e) { return e.type !== "T"; });
    var xy = function (p) { var k = K(p); return c.embed && c.embed[k] ? c.embed[k] : [p[1] * GX, p[0] * GY]; };
    var dxy = function (p) { return [p[1] * GX, p[0] * GY]; };
    var out = {}, P = {};
    E.forEach(function (e, i) {
      [[e.a, e.b, "f"], [e.b, e.a, "r"]].forEach(function (h) {
        var u = K(h[0]), A = xy(h[0]), B = xy(h[1]);
        P[u] = h[0];
        (out[u] = out[u] || []).push({ id: i + h[2], e: e, from: u, to: K(h[1]), ang: Math.atan2(B[1] - A[1], B[0] - A[0]) });
      });
    });
    Object.keys(out).forEach(function (k) { out[k].sort(function (x, y) { return x.ang - y.ang; }); });
    var face = {}, list = [];
    Object.keys(out).forEach(function (k) {
      out[k].forEach(function (h0) {
        if (face[h0.id] !== undefined) return;
        var f = { hs: [], area: 0, darea: 0 }, h = h0;
        for (var guard = 0; guard < 400 && face[h.id] === undefined; guard++) {
          face[h.id] = list.length; f.hs.push(h);
          var A = xy(P[h.from]), B = xy(P[h.to]), dA = dxy(P[h.from]), dB = dxy(P[h.to]);
          f.area += A[0] * B[1] - B[0] * A[1]; f.darea += dA[0] * dB[1] - dB[0] * dA[1];
          var ring2 = out[h.to], j = ring2.findIndex(function (x) { return x.to === h.from && x.e === h.e; });
          h = ring2[(j + 1) % ring2.length];
        }
        list.push(f);
      });
    });
    if (list.length < 2) return null;
    // the walk goes round inner faces counter-clockwise (area < 0) and round the outer face the other way;
    // a single ring gives two faces of equal size, so the clockwise one (area > 0) is the outer face
    var outer = 0; list.forEach(function (f, i) { var a = Math.abs(f.area), b = Math.abs(list[outer].area); if (a > b * (1 + 1e-9) || (a > b * (1 - 1e-9) && f.area > 0 && list[outer].area <= 0)) outer = i; });
    // every edge: the face that walks it a→b (p) and the face that walks it b→a (m)
    var rel = E.map(function (e, i) { return { e: e, p: face[i + "f"], m: face[i + "r"] }; });
    var cur = new Map(); sol.elements.forEach(function (it) { cur.set(it.edge, it.i); });
    var unknown = E.filter(function (e) { return !cur.has(e); });
    for (var g2 = 0; unknown.length && g2 < 200; g2++) {
      var progress = false;
      for (var u = 0; u < unknown.length; u++) {
        var wE = unknown[u];
        if ([wE.a, wE.b].some(function (pt) {
          var at = E.filter(function (e) { return K(e.a) === K(pt) || K(e.b) === K(pt); });
          var unk = at.filter(function (e) { return !cur.has(e); });
          if (unk.length !== 1 || unk[0] !== wE) return false;
          var leaving = 0; at.forEach(function (e) { if (e !== wE) leaving += K(e.a) === K(pt) ? cur.get(e) : -cur.get(e); });
          cur.set(wE, K(wE.a) === K(pt) ? -leaving : leaving); return true;
        })) { unknown.splice(u, 1); u--; progress = true; }
      }
      if (!progress) return null;
    }
    var I = {}; I[outer] = 0;
    for (var pass = 0; pass < 60; pass++) {
      var changed = false;
      rel.forEach(function (x) {
        var i = cur.get(x.e);
        if (x.p in I && !(x.m in I)) { I[x.m] = I[x.p] - i; changed = true; }
        else if (x.m in I && !(x.p in I)) { I[x.p] = i + I[x.m]; changed = true; }
      });
      if (!changed) break;
    }
    if (rel.some(function (x) { return !(x.p in I) || !(x.m in I) || Math.abs(I[x.p] - I[x.m] - cur.get(x.e)) > 1e-6 * (1 + Math.abs(cur.get(x.e))); })) return null;
    var ms = [];
    list.forEach(function (f, i) {
      if (i === outer) return;
      var spot = clearSpot(c, f.hs.map(function (h) { return dxy(P[h.from]); }));
      ms.push({ f: i, at: [spot[1] / GY, spot[0] / GX], value: I[i], ccw: f.darea < 0 });
    });
    ms.sort(function (x, y) { return (Math.round(x.at[0] * 4) - Math.round(y.at[0] * 4)) || (x.at[1] - y.at[1]); });
    // mesh currents are taken clockwise (as in the textbook), so reverse the counter-clockwise walk
    var nameOf = {}, res = ms.map(function (m, i) { nameOf[m.f] = "i" + (i + 1); return { at: m.at, value: -m.value, text: "i" + SUBN[i + 1], name: "i" + (i + 1), ccw: !m.ccw }; });
    res.edgeFaces = rel.map(function (x) { return { e: x.e, p: nameOf[x.m] || null, m: nameOf[x.p] || null }; });
    return res;
  }

  CV.shapes = { meshes: meshes, LIST: ORDER, SHAPES: SHAPES, geometry: geometry, meshesOf: function (id) { return geometry(id).meshes; }, electricalLoops: electricalLoops, steps: steps,
    name: function (id) { return SHAPES[id] && SHAPES[id].ar; } };
})(typeof window !== "undefined" ? window : globalThis);
