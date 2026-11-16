/* CircuitVision — Logic Design Lab: reference drawings for the wiring tasks, redrawn from the course sheets.
   Each drawing shows only what the sheet gives (the circuit or the block to wire, and the pinout of every chip used);
   where the sheet leaves the design to the student (Lab#2, the 74151 functions, the 1-to-8 demux) it shows the blocks only.
   CV.logicFigs.get(expId, taskId) → { title, svg, chips: [id…] } or null. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};

  /* ---------- drawing kit (gates point right; sizes in SVG units) ---------- */
  function D() { this.s = []; }
  D.prototype.add = function (x) { this.s.push(x); return this; };
  D.prototype.wire = function (pts) { this.s.push('<polyline class="lf-w" points="' + pts.map(function (p) { return p[0] + "," + p[1]; }).join(" ") + '"/>'); return this; };
  D.prototype.dot = function (x, y) { this.s.push('<circle class="lf-dot" cx="' + x + '" cy="' + y + '" r="3"/>'); return this; };
  D.prototype.pin = function (x, y) { this.s.push('<circle class="lf-pin" cx="' + x + '" cy="' + y + '" r="3.2"/>'); return this; };
  D.prototype.text = function (t, x, y, anchor, cls) { this.s.push('<text class="' + (cls || "lf-t") + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '">' + esc(t) + '</text>'); return this; };
  D.prototype.rect = function (x, y, w, h, cls) { this.s.push('<rect class="' + (cls || "lf-b") + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>'); return this; };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* gate(type, x, y, n): body 50×40 (taller for more inputs); returns input points and the output point */
  D.prototype.gate = function (type, x, y, n) {
    n = n || (type === "NOT" ? 1 : 2);
    var h = Math.max(40, n * 16 + 8), ins = [], i, out, s = "", inv = /^N/.test(type) && type !== "NOT" || type === "NOT";
    if (type === "NOT") {
      s = '<path class="lf-g" d="M' + x + ' ' + (y + 4) + 'L' + (x + 30) + ' ' + (y + 20) + 'L' + x + ' ' + (y + 36) + 'Z"/>';
      this.s.push(s + '<circle class="lf-g" cx="' + (x + 34) + '" cy="' + (y + 20) + '" r="4"/>');
      return { in: [[x, y + 20]], out: [x + 38, y + 20] };
    }
    var cy = y + h / 2;
    for (i = 0; i < n; i++) ins.push([x, y + (h / (n + 1)) * (i + 1)]);
    if (type === "AND" || type === "NAND") {
      s = '<path class="lf-g" d="M' + x + ' ' + y + 'h26a' + (h / 2) + ' ' + (h / 2) + ' 0 0 1 0 ' + h + 'h-26z"/>';
      out = x + 26 + h / 2;
    } else {
      var off = type === "XOR" || type === "XNOR" ? 7 : 0, bx = x + off;
      s = '<path class="lf-g" d="M' + bx + ' ' + y + 'q34 0 54 ' + (h / 2) + 'q-20 ' + (h / 2) + ' -54 ' + (h / 2) + 'q13 ' + (-h / 2) + ' 0 ' + (-h) + 'z"/>';
      if (off) s += '<path class="lf-g lf-open" d="M' + x + ' ' + y + 'q13 ' + (h / 2) + ' 0 ' + h + '"/>';
      out = bx + 54;
      ins = ins.map(function (p) { var t = (p[1] - y) / h; return [x + 26 * t * (1 - t), p[1]]; });   // touch the back curve
    }
    this.s.push(s);
    if (inv) { this.s.push('<circle class="lf-g" cx="' + (out + 4) + '" cy="' + cy + '" r="4"/>'); out += 8; }
    return { in: ins, out: [out, cy] };
  };
  /* a labelled block with named pins on its left, right, top or bottom (pin: [label, side, bubble]) */
  D.prototype.block = function (x, y, w, h, title, pins, sub) {
    this.rect(x, y, w, h);
    this.text(title, x + w / 2, y + h / 2 + (sub ? -4 : 5), "middle", "lf-bt");
    if (sub) this.text(sub, x + w / 2, y + h / 2 + 14, "middle", "lf-sm");
    var P = {}, self = this, side = { l: [], r: [], t: [], b: [] };
    pins.forEach(function (p) { side[p[1]].push(p); });
    ["l", "r"].forEach(function (k) {
      side[k].forEach(function (p, i) {
        var py = y + (h / (side[k].length + 1)) * (i + 1), px = k === "l" ? x : x + w, ex = k === "l" ? x - 22 : x + w + 22;
        if (p[2]) { self.s.push('<circle class="lf-g" cx="' + (k === "l" ? x - 4 : x + w + 4) + '" cy="' + py + '" r="4"/>'); px += k === "l" ? -8 : 8; }
        self.wire([[px, py], [ex, py]]);
        self.text(p[0], k === "l" ? x + 6 : x + w - 6, py + 4, k === "l" ? "start" : "end", "lf-sm");
        P[p[0]] = [ex, py];
      });
    });
    ["t", "b"].forEach(function (k) {
      side[k].forEach(function (p, i) {
        var px = x + (w / (side[k].length + 1)) * (i + 1), py = k === "t" ? y : y + h, ey = k === "t" ? y - 20 : y + h + 20;
        if (p[2]) { self.s.push('<circle class="lf-g" cx="' + px + '" cy="' + (k === "t" ? y - 4 : y + h + 4) + '" r="4"/>'); py += k === "t" ? -8 : 8; }
        self.wire([[px, py], [px, ey]]);
        self.text(p[0], px, k === "t" ? y + 15 : y + h - 7, "middle", "lf-sm");
        P[p[0]] = [px, ey];
      });
    });
    return P;
  };
  D.prototype.svg = function (w, h) { return '<svg class="lf-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + this.s.join("") + '</svg>'; };

  function inLabel(d, t, p, x0) { d.pin(x0, p[1]).wire([[x0, p[1]], p]).text(t, x0 - 8, p[1] + 5, "end"); }
  function outLabel(d, t, p, x1) { d.wire([p, [x1, p[1]]]).pin(x1, p[1]).text(t, x1 + 8, p[1] + 5, "start"); }

  /* ---------- the drawings ---------- */
  function single(type, outName) {
    return function () {
      var d = new D(), g = d.gate(type, 130, 30, type === "NOT" ? 1 : 2);
      if (type === "NOT") inLabel(d, "A", g.in[0], 50);
      else [["A", -14], ["B", 14]].forEach(function (r, i) { var y = g.in[i][1] + r[1]; d.pin(50, y).text(r[0], 42, y + 5, "end").wire([[50, y], [100, y], [100, g.in[i][1]], g.in[i]]); });
      outLabel(d, "Y", g.out, 270);
      return d.svg(340, 100);
    };
  }
  var F = {};
  F["exp1:demo"] = single("AND"); F["exp1:or"] = single("OR"); F["exp1:not"] = single("NOT"); F["exp1:nand"] = single("NAND");
  F["exp1:nor"] = single("NOR"); F["exp1:xor"] = single("XOR");
  F["exp1:nandnot"] = function () {
    var d = new D(), g = d.gate("NAND", 140, 30);
    d.pin(50, 50).wire([[50, 50], [110, 50]]).text("A", 42, 55, "end").dot(110, 50);
    d.wire([[110, 50], [110, g.in[0][1]], g.in[0]]).wire([[110, 50], [110, g.in[1][1]], g.in[1]]);
    outLabel(d, "Y", g.out, 280); return d.svg(350, 100);
  };
  F["exp1:c1b"] = function () {
    var d = new D(), g1 = d.gate("NOR", 130, 20), g2 = d.gate("NAND", 130, 110), g3 = d.gate("XOR", 270, 64);
    d.pin(40, 34).text("A", 32, 39, "end").pin(40, 64).text("B", 32, 69, "end");
    d.wire([[40, 34], g1.in[0]]).wire([[40, 64], [100, 64], [100, g1.in[1][1]], g1.in[1]]);
    d.dot(80, 34).wire([[80, 34], [80, g2.in[0][1]], g2.in[0]]).dot(100, 64).wire([[100, 64], [100, g2.in[1][1]], g2.in[1]]);
    d.wire([g1.out, [235, g1.out[1]], [235, g3.in[0][1]], g3.in[0]]).wire([g2.out, [235, g2.out[1]], [235, g3.in[1][1]], g3.in[1]]);
    d.text("C", 222, g1.out[1] - 6).text("D", 222, g2.out[1] - 6);
    outLabel(d, "E", g3.out, 400); return d.svg(450, 170);
  };
  F["exp1:c2b"] = function () {
    var d = new D(), g1 = d.gate("NAND", 120, 90), g2 = d.gate("NAND", 260, 30);
    d.pin(40, g2.in[0][1]).text("A", 32, g2.in[0][1] + 5, "end").wire([[40, g2.in[0][1]], g2.in[0]]);
    d.pin(40, 110).text("B", 32, 115, "end").wire([[40, 110], [95, 110]]).dot(95, 110).wire([[95, 110], [95, g1.in[0][1]], g1.in[0]]).wire([[95, 110], [95, g1.in[1][1]], g1.in[1]]);
    d.wire([g1.out, [230, g1.out[1]], [230, g2.in[1][1]], g2.in[1]]).text("C", 215, g1.out[1] - 6);
    outLabel(d, "D", g2.out, 400); return d.svg(450, 150);
  };
  function fnBox(fn, ins, design) {
    return function () {
      var d = new D(), P = d.block(110, 20, 230, 40 + ins.length * 22, fn, ins.map(function (v) { return [v, "l"]; }).concat([["F", "r"]]), design);
      ins.forEach(function (v) { d.pin(P[v][0], P[v][1]).text(v, P[v][0] - 8, P[v][1] + 5, "end"); }); d.pin(P.F[0], P.F[1]);
      return d.svg(420, 80 + ins.length * 22);
    };
  }
  F["exp2:nand"] = fnBox("F = x'yt + xyt + yz' + y'z", ["y", "z", "t"], "صمّمها ببوابات NAND فقط");
  F["exp2:nor"] = fnBox("F = x'yt + xyt + yz' + y'z", ["y", "z", "t"], "صمّمها ببوابات NOR فقط");
  F["exp3:fab"] = function () {
    var d = new D(), P = d.block(150, 40, 130, 90, "Full Adder", [["A", "t"], ["B", "t"], ["Cin", "r"], ["S", "b"], ["Cout", "l"]], "الجامع الكامل");
    return d.svg(430, 190);
  };
  function chipBlock(id, name, left, right, top, bot) {
    return function () {
      var c = CV.chips.get(id), lab = function (p) { return c.labels[p] + " (" + p + ")"; };
      var pins = left.map(function (p) { return [lab(p), "l"]; }).concat(right.map(function (p) { return [lab(p), "r", c.labels[p].indexOf("̄") > -1]; }));
      var h = Math.max(left.length, right.length) * 26 + 30, d = new D();
      d.block(110, 30, 230, h, name || id, pins, c.en);
      return d.svg(450, h + 60);
    };
  }
  F["exp3:b83"] = chipBlock("7483", "7483", [1, 3, 8, 10, 16, 4, 7, 11, 13], [9, 6, 2, 15, 14]);
  F["exp3:b85"] = chipBlock("7485", "7485", [15, 13, 12, 10, 1, 14, 11, 9, 2, 3, 4], [5, 6, 7]);
  F["exp3:bas"] = function () {
    var d = new D(), c = CV.chips.get("7483"), x0 = 250, by = 20, bh = 340;
    d.rect(x0, by, 120, bh).text("7483", x0 + 60, by + bh / 2, "middle", "lf-bt");
    var aP = [1, 3, 8, 10], bP = [16, 4, 7, 11], sP = [15, 2, 6, 9];
    aP.forEach(function (p, i) { var y = by + 20 + i * 22; d.wire([[x0 - 30, y], [x0, y]]).text(c.labels[p], x0 + 6, y + 4, "start", "lf-sm"); });
    d.text("A", x0 - 40, by + 58, "end");
    bP.forEach(function (p, i) {
      var y = by + 130 + i * 50, g = d.gate("XOR", x0 - 100, y - 20);
      d.wire([g.out, [x0, g.out[1]]]).text(c.labels[p], x0 + 6, g.out[1] + 4, "start", "lf-sm");
      d.pin(x0 - 150, g.in[0][1]).wire([[x0 - 150, g.in[0][1]], g.in[0]]).text("B" + (3 - i), x0 - 158, g.in[0][1] + 4, "end", "lf-sm");
      d.wire([[x0 - 125, g.in[1][1]], g.in[1]]).dot(x0 - 125, g.in[1][1]);
    });
    d.wire([[x0 - 125, by + 106], [x0 - 125, by + bh + 20], [x0 + 40, by + bh + 20], [x0 + 40, by + bh]]).text("C0 (13)", x0 + 46, by + bh - 6, "start", "lf-sm");
    d.pin(x0 - 125, by + bh + 20).text("M", x0 - 133, by + bh + 25, "end");
    sP.forEach(function (p, i) { var y = by + 40 + i * 26; d.wire([[x0 + 120, y], [x0 + 150, y]]).pin(x0 + 150, y).text(c.labels[p], x0 + 114, y + 4, "end", "lf-sm").text("S" + (3 - i), x0 + 158, y + 4, "start"); });
    d.wire([[x0 + 120, by + 180], [x0 + 150, by + 180]]).pin(x0 + 150, by + 180).text("C4", x0 + 114, by + 184, "end", "lf-sm").text("Co", x0 + 158, by + 184, "start");
    d.text("M = 0 → A + B      M = 1 → A − B", 260, by + bh + 46, "middle", "lf-sm");
    return d.svg(470, by + bh + 60);
  };
  function decoder(d, x, y, title, ins, outs, en, bubbleOut) {
    return d.block(x, y, 110, Math.max(outs.length * 20 + 10, 90), title, ins.map(function (v) { return [v, "l"]; }).concat(outs.map(function (v) { return [v, "r", bubbleOut]; })).concat(en ? [[en, "b"]] : []));
  }
  F["exp4:b138"] = function () {
    var d = new D(), P = d.block(120, 20, 190, 190, "74138", [["A", "l"], ["B", "l"], ["C", "l"], ["G1", "l"], ["G2A", "l", 1], ["G2B", "l", 1]].concat([0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return ["Y" + i, "r", 1]; })), "3 → 8");
    return d.svg(430, 230);
  };
  F["exp4:bfa"] = function () {
    var d = new D(), P = decoder(d, 90, 20, "3 × 8", ["x  2²", "y  2¹", "Cin  2⁰"], ["0", "1", "2", "3", "4", "5", "6", "7"]);
    var gS = d.gate("OR", 300, 40, 4), gC = d.gate("OR", 300, 130, 4);
    [1, 2, 4, 7].forEach(function (k, i) { d.wire([P[String(k)], [270 - i * 6, P[String(k)][1]], [270 - i * 6, gS.in[i][1]], gS.in[i]]); });
    [3, 5, 6, 7].forEach(function (k, i) { var bx = 240 - i * 6; d.wire([P[String(k)], [bx, P[String(k)][1]], [bx, gC.in[i][1]], gC.in[i]]); if (k === 7) d.dot(bx, P["7"][1]); });
    outLabel(d, "S", gS.out, 400); outLabel(d, "Cout", gC.out, 400);
    return d.svg(470, 220);
  };
  F["exp4:bf"] = function () {
    var d = new D(); decoder(d, 140, 20, "3 × 8", ["x  2²", "y  2¹", "z  2⁰"], ["0", "1", "2", "3", "4", "5", "6", "7"]);
    d.text("F = x'yz' + xyz + x'y'z' + xy'", 200, 205, "middle", "lf-sm"); return d.svg(430, 220);
  };
  F["exp4:b16"] = function () {
    var d = new D(), A = decoder(d, 200, 15, "3 × 8", ["2²", "2¹", "2⁰"], ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7"], "E"),
      B = decoder(d, 200, 225, "3 × 8", ["2²", "2¹", "2⁰"], ["D8", "D9", "D10", "D11", "D12", "D13", "D14", "D15"], "E");
    ["b", "c", "d"].forEach(function (v, i) { d.pin(60, 40 + i * 30).wire([[60, 40 + i * 30], [100, 40 + i * 30]]).text(v, 52, 45 + i * 30, "end"); });
    d.pin(60, 160).wire([[60, 160], [100, 160]]).text("a", 52, 165, "end");
    return d.svg(400, 440);
  };
  F["exp4:bpe"] = function () {
    var d = new D(), n = d.gate("NOT", 150, 66), a = d.gate("AND", 230, 80), oy = d.gate("OR", 340, 30), ox = d.gate("OR", 260, 150), ov = d.gate("OR", 340, 210, 3);
    var y3 = 40, y2 = 86, y1 = 120, y0 = 250;
    [["D3", y3], ["D2", y2], ["D1", y1], ["D0", y0]].forEach(function (r) { d.pin(40, r[1]).text(r[0], 32, r[1] + 5, "end"); });
    d.wire([[40, y3], oy.in[0]]).wire([[40, y2], n.in[0]]).wire([n.out, [n.out[0] + 4, n.out[1]], [n.out[0] + 4, a.in[0][1]], a.in[0]]);
    d.wire([[40, y1], [215, y1], [215, a.in[1][1]], a.in[1]]).wire([a.out, [315, a.out[1]], [315, oy.in[1][1]], oy.in[1]]);
    d.dot(110, y3).wire([[110, y3], [110, ox.in[0][1]], ox.in[0]]).dot(130, y2).wire([[130, y2], [130, ox.in[1][1]], ox.in[1]]);
    d.dot(ox.out[0] + 20, ox.out[1]).wire([[ox.out[0] + 20, ox.out[1]], [ox.out[0] + 20, ov.in[0][1]], ov.in[0]]);
    d.dot(90, y1).wire([[90, y1], [90, ov.in[1][1]], ov.in[1]]).wire([[40, y0], [300, y0], [300, ov.in[2][1]], ov.in[2]]);
    outLabel(d, "y", oy.out, 450); outLabel(d, "x", ox.out, 450); outLabel(d, "V", ov.out, 450);
    return d.svg(500, 280);
  };
  F["exp5:b21"] = function () {
    var d = new D(), a1 = d.gate("AND", 170, 20), a2 = d.gate("AND", 170, 110), o = d.gate("OR", 290, 64), n = d.gate("NOT", 90, 160);
    d.pin(40, a1.in[0][1]).text("I0", 32, a1.in[0][1] + 5, "end").wire([[40, a1.in[0][1]], a1.in[0]]);
    d.pin(40, a2.in[0][1]).text("I1", 32, a2.in[0][1] + 5, "end").wire([[40, a2.in[0][1]], a2.in[0]]);
    d.pin(40, 180).text("S", 32, 185, "end").wire([[40, 180], n.in[0]]).dot(65, 180);
    d.wire([n.out, [140, 180], [140, a1.in[1][1]], a1.in[1]]).wire([[65, 180], [65, 205], [155, 205], [155, a2.in[1][1]], a2.in[1]]);
    d.wire([a1.out, [260, a1.out[1]], [260, o.in[0][1]], o.in[0]]).wire([a2.out, [260, a2.out[1]], [260, o.in[1][1]], o.in[1]]);
    outLabel(d, "Y", o.out, 420); return d.svg(470, 220);
  };
  function mux(vars) {
    return function () {
      var d = new D(), lines = ["1", "0"].concat(vars);
      lines.forEach(function (v, i) { var x = 40 + i * 26; d.wire([[x, 30], [x, 250]]).text(v, x, 22); });
      var P = d.block(250, 30, 100, 200, "8:1", [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return ["I" + i, "l"]; }).concat([["S2", "b"], ["S1", "b"], ["S0", "b"], ["F", "r"]]), "MUX");
      d.text("1 = VCC · 0 = GND", 120, 275, "middle", "lf-sm");
      return d.svg(420, 285);
    };
  }
  F["exp5:b151a"] = mux(["x", "y", "z"]); F["exp5:b151b"] = mux(["x", "y", "z", "t"]);
  function c155() {
    var d = new D();
    d.block(110, 20, 220, 150, "74155", [["1C (1)", "l"], ["1G (2)", "l", 1], ["A (13)", "l"], ["B (3)", "l"], ["1Y0 (7)", "r", 1], ["1Y1 (6)", "r", 1], ["1Y2 (5)", "r", 1], ["1Y3 (4)", "r", 1]], "DEMUX 1");
    d.block(110, 220, 220, 150, "", [["2C (15)", "l", 1], ["2G (14)", "l", 1], ["A (13)", "l"], ["B (3)", "l"], ["2Y0 (9)", "r", 1], ["2Y1 (10)", "r", 1], ["2Y2 (11)", "r", 1], ["2Y3 (12)", "r", 1]], "DEMUX 2");
    return d.svg(430, 400);
  }
  F["exp5:b155"] = c155; F["exp5:b18"] = c155;
  F["exp6:bd"] = function () {
    var d = new D(); d.block(160, 40, 110, 110, "D", [["D", "l"], ["CLK ▷", "l"], ["Q", "r"], ["Q̄", "r", 1], ["PRE", "t", 1], ["CLR", "b", 1]], "7474");
    return d.svg(430, 200);
  };
  F["exp6:bjk"] = function () {
    var d = new D(); d.block(160, 40, 110, 120, "JK", [["J", "l"], ["CLK ▷", "l", 1], ["K", "l"], ["Q", "r"], ["Q̄", "r", 1], ["PRE", "t", 1], ["CLR", "b", 1]], "7476");
    return d.svg(430, 210);
  };

  /* pinout of a chip, drawn from chips.js (same labels the trainer uses) */
  function pinout(id) {
    var c = CV.chips.get(id); if (!c) return "";
    var half = c.pins / 2, pitch = 22, w = 120, h = half * pitch + 16, x = 130, y = 26, d = new D();
    d.rect(x, y, w, h, "lf-ic").add('<path class="lf-notch" d="M' + (x + w / 2 - 10) + ' ' + y + 'a10 10 0 0 0 20 0"/>');
    d.text(id, x + w / 2, y + h / 2 + 5, "middle", "lf-bt");
    for (var i = 0; i < half; i++) {
      var py = y + 16 + i * pitch, pl = i + 1, pr = c.pins - i;
      d.wire([[x - 14, py], [x, py]]).text(pl, x - 18, py + 4, "end", "lf-sm").text(c.labels[pl], x - 40, py + 4, "end", "lf-sm lf-lab");
      d.wire([[x + w, py], [x + w + 14, py]]).text(pr, x + w + 18, py + 4, "start", "lf-sm").text(c.labels[pr], x + w + 40, py + 4, "start", "lf-sm lf-lab");
    }
    return d.svg(380, h + 40);
  }

  var TITLES = { "exp2:nand": "الدالة المطلوبة", "exp2:nor": "الدالة المطلوبة", "exp5:b151a": "الناخب 74151 (8:1)", "exp5:b151b": "الناخب 74151 (8:1)", "exp5:b18": "الدائرة 74155" };
  CV.logicFigs = {
    get: function (expId, task) {
      var f = F[expId + ":" + task.id];
      var chips = task.sol ? Object.keys(task.sol.chips).map(function (s) { return task.sol.chips[s]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }) : [];
      if (!f && !chips.length) return null;
      return { title: TITLES[expId + ":" + task.id] || "رسمة الدائرة", svg: f ? f() : "", chips: chips };
    },
    pinout: pinout
  };
})(typeof window !== "undefined" ? window : globalThis);
