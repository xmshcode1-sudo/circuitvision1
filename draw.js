/* CircuitVision — schematic renderer for grid circuits (see mna.js for the model).
   Draws resistors, independent and dependent sources, junction dots, and the reference
   arrow / polarity of the element a question asks about. Colors come from CSS classes. */
(function (root) {
  "use strict";
  root.CV = root.CV || {};

  /* Number formatting shared by the engine and the UI. */
  root.CV.num = function (v) {
    if (!isFinite(v)) return "—";
    if (Math.abs(v) < 1e-12) return "0";
    var s = Math.abs(v) >= 1000 ? v.toFixed(1) : Number(v.toPrecision(4)).toString();
    return s.replace("-", "−");
  };
  root.CV.fmt = function (v, unit) {
    var a = Math.abs(v), p = "", s = v;
    if (a !== 0 && a < 1) { s = v * 1e3; p = "m"; }
    if (a >= 1e3) { s = v / 1e3; p = "k"; }
    return root.CV.num(s) + " " + p + unit;
  };

  var GAP_X = 160, GAP_Y = 140, PAD_X = 96, PAD_Y = 64, BODY = 30;

  function pt(p) { return [PAD_X + p[1] * GAP_X, PAD_Y + p[0] * GAP_Y]; }
  function f(n) { return Math.round(n * 10) / 10; }

  function valueLabel(e) {
    var n = root.CV.num;
    if (e.vtext !== undefined) return e.vtext;
    switch (e.type) {
      case "R": return root.CV.ac && e.value >= 1000 ? root.CV.ac.si(e.value, "Ω") : n(e.value) + " Ω";
      case "L": return root.CV.ac ? root.CV.ac.si(e.value, "H") : n(e.value) + " H";
      case "C": return root.CV.ac ? root.CV.ac.si(e.value, "F") : n(e.value) + " F";
      case "V": return e.phase !== undefined ? n(e.value) + "∠" + n(e.phase) + "° V" : n(e.value) + " V";
      case "I": return e.phase !== undefined ? n(e.value) + "∠" + n(e.phase) + "° A" : n(e.value) + " A";
      case "CCCS": return n(e.value) + " iₓ";
      case "CCVS": return n(e.value) + " iₓ";
      case "VCVS": return n(e.value) + " vₓ";
      case "VCCS": return n(e.value) + " vₓ";
    }
    return "";
  }

  function render(c, opts) {
    opts = opts || {};
    var W = PAD_X * 2 + (c.cols - 1) * GAP_X, H = PAD_Y * 2 + (c.rows - 1) * GAP_Y + (c.showGround ? 8 : 0);
    var out = [], labels = [], deg = {};
    c.edges.forEach(function (e) { [e.a, e.b].forEach(function (p) { var k = p.join(","); deg[k] = (deg[k] || 0) + 1; }); });

    c.edges.forEach(function (e) {
      var A = pt(e.a), B = pt(e.b), h = e.a[0] === e.b[0];
      var ux = h ? 1 : 0, uy = h ? 0 : 1, nx = h ? 0 : 1, ny = h ? -1 : 0; // n points up (h) or right (v)
      var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      function P(t, s) { return [mx + ux * t + nx * s, my + uy * t + ny * s]; }
      function L(p, q, cls) { out.push('<line class="' + (cls || "sc-w") + '" x1="' + f(p[0]) + '" y1="' + f(p[1]) + '" x2="' + f(q[0]) + '" y2="' + f(q[1]) + '"/>'); }
      if (e.sw) { // push button / switch: open or closed lever between two contacts
        L(A, P(-16, 0)); L(P(16, 0), B);
        out.push('<circle class="sc-term" cx="' + f(P(-16, 0)[0]) + '" cy="' + f(P(-16, 0)[1]) + '" r="3.5"/><circle class="sc-term" cx="' + f(P(16, 0)[0]) + '" cy="' + f(P(16, 0)[1]) + '" r="3.5"/>');
        L(P(-16, 0), e.closed ? P(16, -2) : P(12, 16 * (h ? -1 : 1)), "sc-sw");
        if (e.label) labels.push('<text class="sc-val" x="' + f(P(0, h ? -24 : 0)[0] + (h ? 0 : 24)) + '" y="' + f(P(0, h ? -24 : 0)[1] + 4) + '" text-anchor="' + (h ? "middle" : "start") + '">' + e.label + '</text>');
        return;
      }
      if (e.am) { // ammeter
        L(A, P(-14, 0)); L(P(14, 0), B);
        out.push('<circle class="sc-src" cx="' + f(mx) + '" cy="' + f(my) + '" r="14"/><text class="sc-am" x="' + f(mx) + '" y="' + f(my + 5) + '" text-anchor="middle">A</text>');
        if (e.label) labels.push('<text class="sc-val" x="' + f(P(0, 0)[0] + (h ? 0 : 22)) + '" y="' + f(P(0, 0)[1] + (h ? -22 : 4)) + '" text-anchor="' + (h ? "middle" : "start") + '">' + e.label + '</text>');
        return;
      }
      if (e.type === "W") { L(A, B); return; }
      if (e.type === "T") { // open terminals a (at the a-end) and b
        L(A, P(-15, 0)); L(P(15, 0), B);
        [[-11, "a"], [11, "b"]].forEach(function (t) {
          var cp = P(t[0], 0), lp = P(t[0], h ? 14 : (e.a[1] === 0 ? 14 : -14));
          out.push('<circle class="sc-term" cx="' + f(cp[0]) + '" cy="' + f(cp[1]) + '" r="4.5"/>');
          labels.push('<text class="sc-tlbl" x="' + f(lp[0]) + '" y="' + f(lp[1] + 5) + '" text-anchor="middle">' + t[1] + '</text>');
        });
        return;
      }
      L(A, P(-BODY, 0)); L(P(BODY, 0), B);
      var cls = e.asked ? " sc-asked" : "";
      if (e.type === "R" && e.lamp) { // incandescent lamp: circle with a cross
        out.push('<circle class="sc-src' + cls + '" cx="' + f(mx) + '" cy="' + f(my) + '" r="16"/>');
        L([mx - 11, my - 11], [mx + 11, my + 11], "sc-lampx"); L([mx - 11, my + 11], [mx + 11, my - 11], "sc-lampx");
      } else if (e.type === "R") {
        var pts = [P(-BODY, 0)], zig = 6, amp = 9;
        for (var i = 0; i < zig; i++) pts.push(P(-BODY + (i + 0.5) * (2 * BODY / zig), i % 2 ? -amp : amp));
        pts.push(P(BODY, 0));
        out.push('<polyline class="sc-r' + cls + '" points="' + pts.map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '"/>');
      } else if (e.type === "L") {
        // four coil loops on the side opposite the label
        var side = (h ? -1 : (e.a[1] === 0 ? 1 : -1)), dd = "M" + f(P(-BODY, 0)[0]) + " " + f(P(-BODY, 0)[1]);
        for (var k = 0; k < 4; k++) { var p2 = P(-BODY + (k + 1) * (BODY / 2), 0), mid = P(-BODY + (k + 0.5) * (BODY / 2), side * 11);
          dd += " Q" + f(mid[0]) + " " + f(mid[1]) + " " + f(p2[0]) + " " + f(p2[1]); }
        out.push('<path class="sc-r' + cls + '" d="' + dd + '"/>');
      } else if (e.type === "C") {
        L(P(-BODY, 0), P(-5, 0)); L(P(5, 0), P(BODY, 0));
        L(P(-5, -14), P(-5, 14), "sc-plate" + cls); L(P(5, -14), P(5, 14), "sc-plate" + cls);
      } else if (e.gen) {
        out.push('<circle class="sc-src' + cls + '" cx="' + f(mx) + '" cy="' + f(my) + '" r="17"/>');
        var sp = []; for (var q = 0; q <= 16; q++) { var tt = q / 16; sp.push(f(mx - 10 + tt * 20) + "," + f(my - 6 * Math.sin(tt * 2 * Math.PI))); }
        out.push('<polyline class="sc-sine" points="' + sp.join(" ") + '"/>');
      } else if (e.led) {
        // LED: triangle pointing from anode (the + end) to cathode, bar at the cathode, two light arrows
        var sg = e.plus === "a" ? 1 : -1;
        L(P(-BODY, 0), P(BODY, 0));
        var tri = [P(-sg * 10, -12), P(-sg * 10, 12), P(sg * 10, 0)];
        out.push('<polygon class="sc-led' + cls + '" points="' + tri.map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '"/>');
        L(P(sg * 10, -12), P(sg * 10, 12), "sc-plate" + cls);
        var ls = h ? -1 : 1;
        [[-3, 0], [5, 0]].forEach(function (o) { var a0 = P(o[0], ls * 16), a1 = P(o[0] + 8, ls * 26); L(a0, a1, "sc-arr-l"); out.push('<circle class="sc-arr" cx="' + f(a1[0]) + '" cy="' + f(a1[1]) + '" r="2"/>'); });
      } else if (e.type === "V" || e.type === "I") {
        out.push('<circle class="sc-src' + cls + '" cx="' + f(mx) + '" cy="' + f(my) + '" r="18"/>');
      } else {
        var d = [P(-20, 0), P(0, 20), P(20, 0), P(0, -20)];
        out.push('<polygon class="sc-dep' + cls + '" points="' + d.map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '"/>');
      }
      // Source markings
      if (e.variable) { var v0 = P(-BODY + 2, 17), v1 = P(BODY - 2, -17), dx = v1[0] - v0[0], dy = v1[1] - v0[1], dl = Math.hypot(dx, dy); dx /= dl; dy /= dl; L(v0, v1, "sc-arr-l"); var vt = [v1[0] + dx * 4, v1[1] + dy * 4], vw1 = [v1[0] - dx * 5 - dy * 4, v1[1] - dy * 5 + dx * 4], vw2 = [v1[0] - dx * 5 + dy * 4, v1[1] - dy * 5 - dx * 4]; out.push('<polygon class="sc-arr" points="' + [vt, vw1, vw2].map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '"/>'); }
      if (!e.led && !e.gen && (e.type === "V" || e.type === "VCVS" || e.type === "CCVS")) {
        var sp = e.plus === "a" ? -1 : 1;
        var pp = P(sp * 9, 0), mm = P(-sp * 9, 0);
        out.push('<text class="sc-sign" x="' + f(pp[0]) + '" y="' + f(pp[1] + 5) + '" text-anchor="middle">+</text>');
        out.push('<text class="sc-sign" x="' + f(mm[0]) + '" y="' + f(mm[1] + 5) + '" text-anchor="middle">−</text>');
      }
      if (e.type === "I" || e.type === "CCCS" || e.type === "VCCS") {
        var sd = e.dir === "ab" ? 1 : -1, t0 = P(-sd * 10, 0), t1 = P(sd * 10, 0);
        L(t0, t1, "sc-arr-l");
        var tip = P(sd * 12, 0), w1 = P(sd * 4, 5), w2 = P(sd * 4, -5);
        out.push('<polygon class="sc-arr" points="' + [tip, w1, w2].map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '"/>');
      }
      // Reference arrow for the asked/control current: on the lead before the body, a → b
      var showI = e.asked === "iR" || !!e.ilabel || (e.isCtrl && c.edges.some(function (x) { return x.ctrl === e.name && /^CC/.test(x.type); }));
      var showV = e.asked === "vR" || !!e.vlabel || (e.isCtrl && c.edges.some(function (x) { return x.ctrl === e.name && /^VC/.test(x.type); }));
      var ctrlName = e.isCtrl ? "ₓ" : "";
      if (showI) {
        var at = -BODY - 22, tp = P(at + 7, 0), b1 = P(at - 5, 6), b2 = P(at - 5, -6);
        out.push('<polygon class="sc-iref" points="' + [tp, b1, b2].map(function (p) { return f(p[0]) + "," + f(p[1]); }).join(" ") + '"/>');
        var leftC = !h && e.a[1] === 0;
        var il = P(at, h ? -20 : (leftC ? 14 : -14));
        labels.push('<text class="sc-ilbl" x="' + f(il[0]) + '" y="' + f(il[1] + (h ? 0 : 5)) + '" text-anchor="' + (h ? "middle" : leftC ? "start" : "end") + '">' + (e.ilabel || "i" + ctrlName) + '</text>');
      }
      if (showV) {
        // polarity on the side opposite the name label: below horizontal parts, inside the loop for vertical ones
        var side = h ? -20 : (!h && e.a[1] === 0 ? 18 : -18);
        var pa = P(-BODY + 4, side), pb = P(BODY - 4, side);
        labels.push('<text class="sc-vpol" x="' + f(pa[0]) + '" y="' + f(pa[1] + 6) + '" text-anchor="middle">+</text>');
        labels.push('<text class="sc-vpol" x="' + f(pb[0]) + '" y="' + f(pb[1] + 6) + '" text-anchor="middle">−</text>');
        var vl = P(0, h ? -22 : side * 1.25);
        labels.push('<text class="sc-ilbl" x="' + f(vl[0]) + '" y="' + f(vl[1] + 6) + '" text-anchor="middle">' + (e.vlabel || "v" + ctrlName) + '</text>');
      }
      // Name and value: above horizontal elements, right of vertical ones (left on the left edge)
      var leftCol = !h && e.a[1] === 0;
      var bottomRow = h && e.a[0] === c.rows - 1 && c.rows > 1;
      var lx = h ? mx : mx + (leftCol ? -26 : 26), ly = h ? (bottomRow ? my + 30 : my - 40) : my - 4;
      var anchor = h ? "middle" : leftCol ? "end" : "start";
      labels.push('<text class="sc-name' + cls + '" x="' + f(lx) + '" y="' + f(ly) + '" text-anchor="' + anchor + '">' + (e.type === "CCCS" || e.type === "CCVS" || e.type === "VCVS" || e.type === "VCCS" ? "" : e.name) + '</text>');
      labels.push('<text class="sc-val" x="' + f(lx) + '" y="' + f(ly + (h ? 16 : 17)) + '" text-anchor="' + anchor + '">' + valueLabel(e) + '</text>');
    });
    // Ground symbol under the reference node
    if (c.showGround) {
      var gp = pt(c.ground || [c.rows - 1, 0]), gx = gp[0], gy = gp[1];
      out.push('<line class="sc-w" x1="' + gx + '" y1="' + gy + '" x2="' + gx + '" y2="' + (gy + 16) + '"/>');
      [[14, 16], [9, 21], [4, 26]].forEach(function (g) { out.push('<line class="sc-gnd" x1="' + (gx - g[0]) + '" y1="' + (gy + g[1]) + '" x2="' + (gx + g[0]) + '" y2="' + (gy + g[1]) + '"/>'); });
    }
    // Node voltage labels
    (c.nodeLabels || []).forEach(function (nl) {
      var p = pt(nl.at), asked = c.askedNode === nl.name;
      out.push('<circle class="sc-nd' + (asked ? " on" : "") + '" cx="' + p[0] + '" cy="' + p[1] + '" r="5.5"/>');
      labels.push('<text class="sc-ndl' + (asked ? " on" : "") + '" x="' + (p[0] + 9) + '" y="' + (p[1] - 10) + '">' + nl.text + '</text>');
    });
    // Mesh currents: clockwise arrows in the centre of each mesh
    (c.meshLabels || []).forEach(function (m) {
      var p0 = pt(m.at), cx = p0[0] + GAP_X * 0.7, cy = p0[1] + GAP_Y / 2 - 4, r = 20, asked = c.askedMesh === m.name;
      var a0 = -Math.PI * 0.85, a1 = Math.PI * 0.55;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      out.push('<path class="sc-mesh' + (asked ? " on" : "") + '" d="M' + f(x0) + ' ' + f(y0) + ' A' + r + ' ' + r + ' 0 1 1 ' + f(x1) + ' ' + f(y1) + '"/>');
      var tx = -Math.sin(a1), ty = Math.cos(a1); // clockwise tangent (SVG y down)
      var tip = [x1 + tx * 7, y1 + ty * 7], bl = [x1 - tx * 2 + Math.cos(a1) * 5, y1 - ty * 2 + Math.sin(a1) * 5], br = [x1 - tx * 2 - Math.cos(a1) * 5, y1 - ty * 2 - Math.sin(a1) * 5];
      out.push('<polygon class="sc-mesh-h' + (asked ? " on" : "") + '" points="' + [tip, bl, br].map(function (q) { return f(q[0]) + "," + f(q[1]); }).join(" ") + '"/>');
      labels.push('<text class="sc-ndl' + (asked ? " on" : "") + '" x="' + f(cx) + '" y="' + f(cy + 5) + '" text-anchor="middle">' + m.text + '</text>');
    });
    Object.keys(deg).forEach(function (k) {
      if (deg[k] >= 3) { var p = pt(k.split(",").map(Number)); out.push('<circle class="sc-dot" cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>'); }
    });
    if (c.omega) labels.push('<text class="sc-omega" x="' + (W - 8) + '" y="18" text-anchor="end">ω = ' + c.omega + ' rad/s</text>');
    return '<svg class="sc" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.aria || "مخطط دائرة كهربائية") + '" style="max-width:' + W + 'px">' + out.join("") + labels.join("") + '</svg>';
  }

  root.CV.draw = { render: render, pt: pt, GAP_X: GAP_X, GAP_Y: GAP_Y, PAD_X: PAD_X, PAD_Y: PAD_Y };
})(typeof window !== "undefined" ? window : globalThis);
