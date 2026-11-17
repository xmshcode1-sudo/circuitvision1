/* CircuitVision — Logic Design lessons: drawings and a Boolean evaluator.
   CV.lg.expr(src)            parse "x'y + xy'(z ⊕ w)" → { vars, f(env) }       (' = NOT, + = OR, juxtaposition/· = AND, ⊕ = XOR)
   CV.lg.minterms(src, vars)  list of minterm numbers of an expression over the given variable order
   CV.lg.tt(vars, cols, opts) truth table HTML; cols = [{ h: "F", f: "x'y+z" | [0,1,…] }]
   CV.lg.kmap(vars, ones, opt) K-map SVG (2, 3 or 4 variables, Gray order); opt = { dc: [], groups: [{ cells: [m…], c: 1..4, label }], zeros: true }
   CV.lg.gates(spec)          two-level circuit SVG: { terms: [["x","y'"],…], out: "F", kind: "AND-OR"|"OR-AND"|"NAND-NAND"|"NOR-NOR" }
   CV.lg.block(spec)          a labelled block: { name, ins: [..], outs: [..], w, h }
   CV.lg.state(spec)          state diagram: { nodes: [{ id, x, y, label }], edges: [{ a, b, label, bend }] }
   CV.lg.timing(spec)         timing diagram: { rows: [{ name, bits: [0,1,…] }], clk: true }
   Colours are classes (lg-*), so plots follow the site theme and the dark video studio. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function r(v) { return Math.round(v * 10) / 10; }

  /* ---------------- Boolean expressions ---------------- */
  function expr(src) {
    var s = String(src).replace(/\s+/g, "").replace(/[’′]/g, "'").replace(/·|\./g, "*"), i = 0, vars = {};
    function peek() { return s[i]; }
    function orE() { var a = xorE(); while (peek() === "+") { i++; var b = xorE(); a = (function (p, q) { return function (e) { return p(e) | q(e); }; })(a, b); } return a; }
    function xorE() { var a = andE(); while (peek() === "⊕" || peek() === "^") { i++; var b = andE(); a = (function (p, q) { return function (e) { return p(e) ^ q(e); }; })(a, b); } return a; }
    function andE() { var a = notE(); while (i < s.length && (peek() === "*" || /[A-Za-z0-9(]/.test(peek()))) { if (peek() === "*") i++; var b = notE(); a = (function (p, q) { return function (e) { return p(e) & q(e); }; })(a, b); } return a; }
    function notE() { var a = atom(); while (peek() === "'") { i++; a = (function (p) { return function (e) { return 1 - p(e); }; })(a); } return a; }
    function atom() {
      var c = peek();
      if (c === "(") { i++; var a = orE(); if (peek() !== ")") throw new Error("missing ) in " + src); i++; return a; }
      if (c === "0" || c === "1") { i++; return function () { return +c; }; }
      if (/[A-Za-z]/.test(c)) { i++; var name = c; while (/[0-9]/.test(peek() || "")) { name += peek(); i++; } vars[name] = 1; return function (e) { return e[name] ? 1 : 0; }; }
      throw new Error("bad char '" + c + "' in " + src);
    }
    var f = orE(); if (i < s.length) throw new Error("trailing '" + s.slice(i) + "' in " + src);
    return { vars: Object.keys(vars), f: f };
  }
  function env(vars, m) { var e = {}, n = vars.length; vars.forEach(function (v, k) { e[v] = (m >> (n - 1 - k)) & 1; }); return e; }
  function minterms(src, vars) { var E = expr(src), out = []; for (var m = 0; m < (1 << vars.length); m++) if (E.f(env(vars, m))) out.push(m); return out; }
  function bits(m, n) { var s = ""; for (var k = n - 1; k >= 0; k--) s += (m >> k) & 1; return s; }

  /* ---------------- truth table ---------------- */
  function tt(vars, cols, o) {
    o = o || {};
    var n = vars.length, h = '<table class="lgt' + (o.small ? " sm" : "") + '"><thead><tr>' + (o.m ? "<th>m</th>" : "") + vars.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") + cols.map(function (c, k) { return "<th" + (k === 0 ? ' class="sep"' : "") + ">" + c.h + "</th>"; }).join("") + "</tr></thead><tbody>";
    var fs = cols.map(function (c) { if (Array.isArray(c.f)) return function (m) { return c.f[m]; }; var E = expr(c.f); return function (m) { return E.f(env(vars, m)); }; });
    for (var m = 0; m < (1 << n); m++) {
      var hl = o.hl && o.hl.indexOf(m) >= 0;
      h += "<tr" + (hl ? ' class="on"' : "") + ">" + (o.m ? '<td class="mi">' + m + "</td>" : "") + bits(m, n).split("").map(function (b) { return "<td>" + b + "</td>"; }).join("") + fs.map(function (f, k) { var v = f(m); return "<td class=\"v" + (k === 0 ? " sep" : "") + "\">" + (v === "x" || v === "X" ? "X" : v) + "</td>"; }).join("") + "</tr>";
    }
    return h + "</tbody></table>";
  }
  /* a plain table: header row + rows (strings) */
  function table(head, rows, o) {
    o = o || {};
    return '<table class="lgt' + (o.small ? " sm" : "") + '"><thead><tr>' + head.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (row, i) { return "<tr" + (o.hl && o.hl.indexOf(i) >= 0 ? ' class="on"' : "") + ">" + row.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }

  /* ---------------- K-map ---------------- */
  var GRAY = { 1: [0, 1], 2: [0, 1, 3, 2] };
  function kmLayout(n) { return n === 2 ? { rb: 1, cb: 1 } : n === 3 ? { rb: 1, cb: 2 } : { rb: 2, cb: 2 }; }
  function cellOf(n, m) { var L = kmLayout(n), row = m >> L.cb, col = m & ((1 << L.cb) - 1); return [GRAY[L.rb].indexOf(row), GRAY[L.cb].indexOf(col)]; }
  function runs(idx, size) {      // contiguous runs on a ring of length size
    var s = idx.slice().sort(function (a, b) { return a - b; }), set = {}; s.forEach(function (v) { set[v] = 1; });
    if (s.length === size) return [[0, size - 1]];
    var out = [], start = null;
    for (var k = 0; k < size; k++) { if (set[k] && start === null) start = k; if (!set[k] && start !== null) { out.push([start, k - 1]); start = null; } }
    if (start !== null) out.push([start, size - 1]);
    return out;
  }
  function kmap(vars, ones, o) {
    o = o || {};
    var n = vars.length, L = kmLayout(n), R = 1 << L.rb, C = 1 << L.cb, cw = 74, ch = 60, x0 = 112, y0 = 74;
    var W = x0 + C * cw + 30, H = y0 + R * ch + 34, s = [];
    var rv = vars.slice(0, L.rb).join(""), cv = vars.slice(L.rb).join("");
    s.push('<svg class="lgk" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="K-map">');
    s.push('<line class="lgk-d" x1="' + (x0 - 46) + '" y1="' + (y0 - 46) + '" x2="' + x0 + '" y2="' + y0 + '"/>');
    s.push('<text class="lgk-v" x="' + (x0 - 40) + '" y="' + (y0 - 8) + '" text-anchor="middle">' + esc(rv) + "</text>");
    s.push('<text class="lgk-v" x="' + (x0 - 8) + '" y="' + (y0 - 36) + '" text-anchor="end">' + esc(cv) + "</text>");
    for (var c = 0; c < C; c++) s.push('<text class="lgk-h" x="' + (x0 + c * cw + cw / 2) + '" y="' + (y0 - 12) + '" text-anchor="middle">' + bits(GRAY[L.cb][c], L.cb) + "</text>");
    for (var q = 0; q < R; q++) s.push('<text class="lgk-h" x="' + (x0 - 12) + '" y="' + (y0 + q * ch + ch / 2 + 6) + '" text-anchor="end">' + bits(GRAY[L.rb][q], L.rb) + "</text>");
    var mark = {}; (ones || []).forEach(function (m) { mark[m] = "1"; }); (o.dc || []).forEach(function (m) { mark[m] = "X"; });
    (o.groups || []).forEach(function (g) {
      var rs = {}, cs = {}; g.cells.forEach(function (m) { var p = cellOf(n, m); rs[p[0]] = 1; cs[p[1]] = 1; });
      runs(Object.keys(rs).map(Number), R).forEach(function (rr) {
        runs(Object.keys(cs).map(Number), C).forEach(function (cc) {
          var pad = 6 + (g.inset || 0);
          s.push('<rect class="lgk-g lg-c' + (g.c || 1) + '" x="' + (x0 + cc[0] * cw + pad) + '" y="' + (y0 + rr[0] * ch + pad) + '" width="' + ((cc[1] - cc[0] + 1) * cw - 2 * pad) + '" height="' + ((rr[1] - rr[0] + 1) * ch - 2 * pad) + '" rx="14"/>');
        });
      });
    });
    for (var m = 0; m < (1 << n); m++) {
      var p = cellOf(n, m), x = x0 + p[1] * cw, y = y0 + p[0] * ch, v = mark[m] || (o.zeros ? "0" : "");
      s.push('<rect class="lgk-c" x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '"/>');
      s.push('<text class="lgk-m" x="' + (x + 5) + '" y="' + (y + 13) + '">m' + m + "</text>");
      if (v) s.push('<text class="lgk-x' + (v === "X" ? " dc" : v === "0" ? " z" : "") + '" x="' + (x + cw / 2) + '" y="' + (y + ch / 2 + 10) + '" text-anchor="middle">' + v + "</text>");
    }
    s.push("</svg>");
    var legend = (o.groups || []).filter(function (g) { return g.label; }).map(function (g) { return '<span class="lgk-lg lg-b' + (g.c || 1) + '">' + esc(g.label) + "</span>"; }).join("");
    return '<div class="lgk-w">' + s.join("") + (legend ? '<div class="lgk-legend">' + legend + "</div>" : "") + "</div>";
  }
  /* the product term of a group of minterms (for tests and labels) */
  function termOf(vars, cells) {
    var n = vars.length, out = "";
    vars.forEach(function (v, k) { var b = cells.map(function (m) { return (m >> (n - 1 - k)) & 1; }); if (b.every(function (x) { return x === b[0]; })) out += v + (b[0] ? "" : "'"); });
    return out || "1";
  }

  /* ---------------- gate symbols ---------------- */
  function gate(type, x, y, h, cls) {
    var w = 66, cy = y + h / 2, inv = /^N|NOT/.test(type) && type !== "OR", d, out = x + w;
    cls = cls || "lgg";
    if (type === "NOT" || type === "BUF") { d = "M" + x + " " + (cy - 18) + "L" + (x + 40) + " " + cy + "L" + x + " " + (cy + 18) + "Z"; out = x + 40; }
    else if (/AND/.test(type)) d = "M" + x + " " + y + "H" + (x + 34) + "A" + (h / 2) + " " + (h / 2) + " 0 0 1 " + (x + 34) + " " + (y + h) + "H" + x + "Z", out = x + 34 + h / 2;
    else d = "M" + x + " " + y + "Q" + (x + 50) + " " + y + " " + (x + 70) + " " + cy + "Q" + (x + 50) + " " + (y + h) + " " + x + " " + (y + h) + "Q" + (x + 16) + " " + cy + " " + x + " " + y + "Z", out = x + 70;
    var s = '<path class="' + cls + '" d="' + d + '"/>';
    if (/XOR|XNOR/.test(type)) s += '<path class="lgw" d="M' + (x - 9) + " " + y + "Q" + (x + 7) + " " + cy + " " + (x - 9) + " " + (y + h) + '"/>';
    if (inv || type === "NOT") { s += '<circle class="' + cls + '" cx="' + (out + 5) + '" cy="' + cy + '" r="5"/>'; out += 10; }
    return { svg: s, out: [out, cy] };
  }
  /* inputs are listed (literal labels) on the left of each first-level gate, like the course slides */
  function gates(sp) {
    var kind = sp.kind || "AND-OR", k1 = kind.split("-")[0], k2 = kind.split("-")[1], terms = sp.terms, g = 20, s = [], ys = [];
    var hs = terms.map(function (t) { return Math.max(44, t.length * 22 + 6); }), H = hs.reduce(function (a, b) { return a + b + g; }, 30), W = 470, y = 20, outs = [];
    terms.forEach(function (t, k) {
      if (t.length === 1 && !sp.single) {              // a single literal goes straight to the second level
        var yy = y + hs[k] / 2; s.push('<text class="lgl" x="60" y="' + (yy + 6) + '" text-anchor="end">' + esc(t[0]) + '</text><line class="lgw" x1="66" y1="' + yy + '" x2="200" y2="' + yy + '"/>'); outs.push([200, yy]);
      } else {
        var G = gate(k1, 100, y, hs[k]); s.push(G.svg);
        t.forEach(function (lit, j) { var yy = y + (hs[k] / (t.length + 1)) * (j + 1); s.push('<text class="lgl" x="60" y="' + (yy + 6) + '" text-anchor="end">' + esc(lit) + '</text><line class="lgw" x1="66" y1="' + yy + '" x2="100" y2="' + yy + '"/>'); });
        outs.push(G.out);
      }
      y += hs[k] + g;
    });
    var h2 = Math.max(54, outs.length * 20 + 14), y2 = (H - h2) / 2, G2 = gate(k2, 300, y2, h2);
    outs.forEach(function (o, j) { var yy = y2 + (h2 / (outs.length + 1)) * (j + 1), mx = 250 + (j - outs.length / 2) * 4; s.push('<polyline class="lgw" points="' + o[0] + "," + o[1] + " " + mx + "," + o[1] + " " + mx + "," + yy + " 300," + yy + '"/>'); });
    if (outs.length === 1) { s = s.filter(function () { return true; }); }
    s.push(G2.svg, '<line class="lgw" x1="' + G2.out[0] + '" y1="' + G2.out[1] + '" x2="' + (G2.out[0] + 34) + '" y2="' + G2.out[1] + '"/><text class="lgl o" x="' + (G2.out[0] + 40) + '" y="' + (G2.out[1] + 6) + '">' + esc(sp.out || "F") + "</text>");
    return '<svg class="lgc" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(kind) + '">' + s.join("") + "</svg>";
  }
  /* a gallery of single gates with their names (for the gates lesson) */
  function gateRow(types) {
    var per = 4, s = [], W = Math.min(types.length, per) * 150, rows = Math.ceil(types.length / per);
    types.forEach(function (t, k) { var x = (k % per) * 150 + 30, oy = Math.floor(k / per) * 120, G = gate(t, x, 20, 50); s.push('<g transform="translate(0 ' + oy + ')">'); s.push(G.svg, '<line class="lgw" x1="' + (x - 22) + '" y1="' + (t === "NOT" || t === "BUF" ? 45 : 32) + '" x2="' + x + '" y2="' + (t === "NOT" || t === "BUF" ? 45 : 32) + '"/>');
      if (t !== "NOT" && t !== "BUF") s.push('<line class="lgw" x1="' + (x - 22) + '" y1="58" x2="' + x + '" y2="58"/>');
      s.push('<line class="lgw" x1="' + G.out[0] + '" y1="45" x2="' + (G.out[0] + 18) + '" y2="45"/><text class="lgl" x="' + (x + 36) + '" y="100" text-anchor="middle">' + t + "</text></g>"); });
    return '<svg class="lgc" viewBox="0 0 ' + W + " " + (rows * 120) + '" role="img" aria-label="gates">' + s.join("") + "</svg>";
  }

  /* ---------------- blocks (adders, decoders, MUX, flip-flops) ---------------- */
  function block(sp) {
    var ins = sp.ins || [], outs = sp.outs || [], n = Math.max(ins.length, outs.length, 2), w = sp.w || 150, h = sp.h || Math.max(90, n * 30 + 20), x = 110, y = 20, s = [];
    s.push('<rect class="lgb" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10"/><text class="lgl b" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 6) + '" text-anchor="middle">' + esc(sp.name) + "</text>");
    ins.forEach(function (t, k) { var yy = y + (h / (ins.length + 1)) * (k + 1), clk = /^>/.test(t), lab = t.replace(/^>/, ""); s.push('<line class="lgw" x1="' + (x - 46) + '" y1="' + yy + '" x2="' + x + '" y2="' + yy + '"/><text class="lgl" x="' + (x - 52) + '" y="' + (yy + 6) + '" text-anchor="end">' + esc(lab) + "</text>"); if (clk) s.push('<path class="lgw" d="M' + x + " " + (yy - 8) + "l12 8l-12 8" + '"/>'); });
    outs.forEach(function (t, k) { var yy = y + (h / (outs.length + 1)) * (k + 1); s.push('<line class="lgw" x1="' + (x + w) + '" y1="' + yy + '" x2="' + (x + w + 46) + '" y2="' + yy + '"/><text class="lgl" x="' + (x + w + 52) + '" y="' + (yy + 6) + '">' + esc(t) + "</text>"); });
    (sp.bottom || []).forEach(function (t, k, a) { var xx = x + (w / (a.length + 1)) * (k + 1); s.push('<line class="lgw" x1="' + xx + '" y1="' + (y + h) + '" x2="' + xx + '" y2="' + (y + h + 34) + '"/><text class="lgl" x="' + xx + '" y="' + (y + h + 54) + '" text-anchor="middle">' + esc(t) + "</text>"); });
    var W = x + w + 120, H = y + h + ((sp.bottom || []).length ? 64 : 20);
    return '<svg class="lgc" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(sp.name) + '">' + s.join("") + "</svg>";
  }
  /* n blocks in a chain (ripple adder): { n, name, top: i => [labels], bottom: i => label, carry: i => label } */
  function chain(sp) {
    var n = sp.n, bw = 110, gap = 64, x0 = 60, y = 70, h = 80, s = [], W = x0 + n * (bw + gap) + 40;
    for (var k = 0; k < n; k++) {
      var x = x0 + k * (bw + gap), i = n - 1 - k;
      s.push('<rect class="lgb" x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="10"/><text class="lgl b" x="' + (x + bw / 2) + '" y="' + (y + h / 2 + 6) + '" text-anchor="middle">' + esc(sp.name) + "</text>");
      sp.top(i).forEach(function (t, j) { var xx = x + bw * (j + 1) / 3; s.push('<line class="lgw" x1="' + xx + '" y1="' + (y - 34) + '" x2="' + xx + '" y2="' + y + '"/><text class="lgl" x="' + xx + '" y="' + (y - 42) + '" text-anchor="middle">' + esc(t) + "</text>"); });
      s.push('<line class="lgw" x1="' + (x + bw / 2) + '" y1="' + (y + h) + '" x2="' + (x + bw / 2) + '" y2="' + (y + h + 34) + '"/><text class="lgl" x="' + (x + bw / 2) + '" y="' + (y + h + 56) + '" text-anchor="middle">' + esc(sp.bottom(i)) + "</text>");
      s.push('<line class="lgw" x1="' + (x + bw) + '" y1="' + (y + h / 2) + '" x2="' + (x + bw + gap) + '" y2="' + (y + h / 2) + '"/><text class="lgl s" x="' + (x + bw + gap / 2) + '" y="' + (y + h / 2 - 8) + '" text-anchor="middle">' + esc(sp.carry(i)) + "</text>");
    }
    s.push('<line class="lgw" x1="' + (x0 - 40) + '" y1="' + (y + h / 2) + '" x2="' + x0 + '" y2="' + (y + h / 2) + '"/><text class="lgl s" x="' + (x0 - 20) + '" y="' + (y + h / 2 - 8) + '" text-anchor="middle">' + esc(sp.cout || "") + "</text>");
    return '<svg class="lgc" viewBox="0 0 ' + W + " " + (y + h + 70) + '" role="img" aria-label="' + esc(sp.name) + ' chain">' + s.join("") + "</svg>";
  }

  /* ---------------- state diagram ---------------- */
  function state(sp) {
    var R = 30, s = [], N = {}, W = sp.w || 520, H = sp.h || 360;
    sp.nodes.forEach(function (n) { N[n.id] = n; });
    s.push('<defs><marker id="lga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="lgah" d="M0 0L10 5L0 10z"/></marker></defs>');
    sp.edges.forEach(function (e) {
      var a = N[e.a], b = N[e.b];
      if (a === b) { var dir = e.loop || -1; s.push('<path class="lgw" marker-end="url(#lga)" d="M' + (a.x - 14) + " " + (a.y + dir * R * 0.9) + "C" + (a.x - 40) + " " + (a.y + dir * 90) + " " + (a.x + 40) + " " + (a.y + dir * 90) + " " + (a.x + 14) + " " + (a.y + dir * R * 0.9) + '"/><text class="lgl s" x="' + a.x + '" y="' + (a.y + dir * 84 + (dir > 0 ? 18 : -6)) + '" text-anchor="middle">' + esc(e.label || "") + "</text>"); return; }
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, bend = e.bend === undefined ? 0.18 : e.bend;
      var sx = a.x + ux * R, sy = a.y + uy * R, ex = b.x - ux * (R + 2), ey = b.y - uy * (R + 2), mx = (sx + ex) / 2 - uy * L * bend, my = (sy + ey) / 2 + ux * L * bend;
      s.push('<path class="lgw" marker-end="url(#lga)" d="M' + r(sx) + " " + r(sy) + "Q" + r(mx) + " " + r(my) + " " + r(ex) + " " + r(ey) + '"/>');
      s.push('<text class="lgl s" x="' + r((sx + ex) / 4 + mx / 2 - uy * 12) + '" y="' + r((sy + ey) / 4 + my / 2 + ux * 12 + 5) + '" text-anchor="middle">' + esc(e.label || "") + "</text>");
    });
    sp.nodes.forEach(function (n) { s.push('<circle class="lgs' + (n.hl ? " on" : "") + '" cx="' + n.x + '" cy="' + n.y + '" r="' + R + '"/><text class="lgl b" x="' + n.x + '" y="' + (n.y + 6) + '" text-anchor="middle">' + esc(n.label || n.id) + "</text>"); });
    return '<svg class="lgc" viewBox="0 -40 ' + W + " " + (H + 80) + '" role="img" aria-label="state diagram">' + s.join("") + "</svg>";
  }

  /* ---------------- timing diagram ---------------- */
  function timing(sp) {
    var rows = sp.rows, n = rows[0].bits.length, cw = sp.cw || 44, x0 = 70, rh = 52, s = [], W = x0 + n * cw + 20, H = rows.length * rh + 20;
    rows.forEach(function (row, k) {
      var yb = 20 + k * rh + 34, yt = yb - 26, d = "";
      row.bits.forEach(function (b, i) { var x = x0 + i * cw, yy = b ? yt : yb; d += (i === 0 ? "M" + x + " " + yy : "L" + x + " " + yy) + "L" + (x + cw) + " " + yy; });
      s.push('<text class="lgl" x="' + (x0 - 12) + '" y="' + (yb - 6) + '" text-anchor="end">' + esc(row.name) + '</text><path class="lgt-w lg-s' + (row.c || 1) + '" d="' + d + '"/>');
    });
    for (var i = 0; i <= n; i++) if (sp.grid !== false) s.push('<line class="lgk-d" stroke-dasharray="3 5" x1="' + (x0 + i * cw) + '" y1="14" x2="' + (x0 + i * cw) + '" y2="' + (H - 4) + '"/>');
    return '<svg class="lgc" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="timing">' + s.join("") + "</svg>";
  }

  CV.lg = { expr: expr, env: env, minterms: minterms, bits: bits, tt: tt, table: table, kmap: kmap, termOf: termOf, cellOf: cellOf, gate: gate, gates: gates, gateRow: gateRow, block: block, chain: chain, state: state, timing: timing };
})(typeof window !== "undefined" ? window : globalThis);
