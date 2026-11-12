/* CircuitVision — breadboard illustrations for project build steps.
   A drawn illustration (not a photo): holes a–j × columns, power rails top (T+/T−) and bottom (B+/B−).
   Hole refs: "c5" (row c, column 5), "T+3", "T-3", "B+3", "B-3". Resistor colour bands are computed from the value. */
(function () {
  "use strict";
  var P = 16, COLS = 22, X0 = 128, BW = COLS - 1, METER_Y = null;
  var Y = { "T+": 34, "T-": 50, "B+": 290, "B-": 306 };
  "abcde".split("").forEach(function (r, i) { Y[r] = 86 + i * P; });
  "fghij".split("").forEach(function (r, i) { Y[r] = 190 + i * P; });
  var W, H, HALF;
  var BAND = ["#1b1b1b", "#7a4a21", "#d22", "#f07818", "#f2c80f", "#2a9a3a", "#2a5bd7", "#8a3ab9", "#8a8a8a", "#f4f4f4"];
  var WIRE = { red: "#e0312f", black: "#262626", blue: "#2f6fe0", yellow: "#e8b400", green: "#22a04a", orange: "#f07818", white: "#f2f2f2" };
  var LEDC = { red: "#ff3b3b", yellow: "#ffd23b", blue: "#3b8bff", white: "#f5f5ff" };

  function xy(ref) {
    var m = /^([TB][+-])(\d+)$/.exec(ref);
    if (m) return [X0 + (+m[2] - 1) * P, Y[m[1]]];
    m = /^([a-j])(\d+)$/.exec(ref);
    return [X0 + (+m[2] - 1) * P, Y[m[1]]];
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function bands(ohm) {
    var e = Math.floor(Math.log10(ohm) + 1e-9) - 1, d = Math.round(ohm / Math.pow(10, e));
    if (d >= 100) { d = Math.round(d / 10); e++; }
    return [BAND[Math.floor(d / 10)], BAND[d % 10], BAND[e], "#c9a227"];
  }
  function leg(a, b) { return '<line class="bb-leg" x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '"/>'; }
  function hole(p) { return '<rect class="bb-pin" x="' + f(p[0] - 2.6) + '" y="' + f(p[1] - 2.6) + '" width="5.2" height="5.2" rx="1"/>'; }
  // a two-leg part: body drawn along the a→b axis, centred, raised by `lift` toward the top of the board
  function axial(a, b, len, bodyFn, lift) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - (lift || 0), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    var c1 = [mx - Math.cos(ang * Math.PI / 180) * len / 2, my - Math.sin(ang * Math.PI / 180) * len / 2], c2 = [mx + Math.cos(ang * Math.PI / 180) * len / 2, my + Math.sin(ang * Math.PI / 180) * len / 2];
    return hole(a) + hole(b) + leg(a, c1) + leg(c2, b) + '<g transform="translate(' + f(mx) + ' ' + f(my) + ') rotate(' + f(ang) + ')">' + bodyFn(len) + '</g>';
  }
  function curve(a, b, bulge, cls, color) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - bulge;
    return '<path class="' + cls + '" d="M' + f(a[0]) + ' ' + f(a[1]) + ' Q' + f(mx) + ' ' + f(my) + ' ' + f(b[0]) + ' ' + f(b[1]) + '" style="stroke:' + color + '"/>';
  }

  var DRAW = {
    wire: function (p) { var a = xy(p.a), b = xy(p.b), d = Math.hypot(b[0] - a[0], b[1] - a[1]); return hole(a) + hole(b) + curve(a, b, Math.min(14, d / 4), "bb-wire", WIRE[p.c] || p.c); },
    res: function (p) {
      var bs = bands(p.ohm);
      return axial(xy(p.a), xy(p.b), 34, function (L) {
        var o = '<rect class="bb-res" x="' + (-L / 2) + '" y="-5.5" width="' + L + '" height="11" rx="5"/>';
        [-10, -5, 0, 9].forEach(function (x, i) { o += '<rect x="' + (x - 1.6) + '" y="-5.5" width="3.2" height="11" fill="' + bs[i] + '"/>'; });
        return o;
      }, 0);
    },
    led: function (p, ctx) {
      var a = xy(p.a), b = xy(p.b), mx = (a[0] + b[0]) / 2, top = Math.min(a[1], b[1]) - 26, col = LEDC[p.color] || LEDC.red, on = ctx.powered;
      var o = hole(a) + hole(b) + leg(a, [mx - 3, top + 8]) + leg(b, [mx + 3, top + 10]);
      if (on) o += '<circle cx="' + f(mx) + '" cy="' + f(top) + '" r="17" fill="' + col + '" opacity=".28"/><circle cx="' + f(mx) + '" cy="' + f(top) + '" r="11" fill="' + col + '" opacity=".35"/>';
      o += '<path class="bb-led" d="M' + f(mx - 7) + ' ' + f(top + 9) + ' V' + f(top) + ' A7 7 0 0 1 ' + f(mx + 7) + ' ' + f(top) + ' V' + f(top + 9) + ' Z" fill="' + col + '" fill-opacity="' + (on ? 1 : .75) + '"/>';
      o += '<text class="bb-t" x="' + f(a[0] + (a[0] < b[0] ? -5 : 5)) + '" y="' + f(top + 4) + '" text-anchor="middle">+</text>';
      return o;
    },
    ldr: function (p) { return axial(xy(p.a), xy(p.b), 20, function () { return '<circle r="9" fill="#d9a066" stroke="#8a5a2b" stroke-width="1.2"/><path d="M-6 -3 H-3 V3 H0 V-3 H3 V3 H6" fill="none" stroke="#9b2d20" stroke-width="1.4"/>'; }, 12); },
    ntc: function (p) { return axial(xy(p.a), xy(p.b), 12, function () { return '<ellipse rx="6" ry="5" fill="#3a3f8f" stroke="#1d2150"/><text class="bb-t bb-tl" y="-9" text-anchor="middle">NTC</text>'; }, 12); },
    cap: function (p) { return axial(xy(p.a), xy(p.b), 18, function () { return '<ellipse rx="10" ry="8" fill="#e6a23a" stroke="#a96b14"/><text class="bb-t" y="3" text-anchor="middle" style="font-size:7px">' + (p.code || "") + '</text>'; }, 14); },
    src: function (p) {
      var right = p.side === "right", bx = right ? X0 + BW * P + 34 : 10, by = p.y || (HALF ? 30 : 60), bh = 26 + p.pins.length * 18, o = '<rect class="bb-box" x="' + bx + '" y="' + by + '" width="96" height="' + bh + '" rx="7"/><text class="bb-bt" x="' + (bx + 48) + '" y="' + (by + 17) + '" text-anchor="middle" direction="rtl" unicode-bidi="plaintext">' + p.label + '</text>';
      p.pins.forEach(function (pin, i) {
        var py = by + 36 + i * 18, px = right ? bx : bx + 96, t = xy(pin.to), dx = right ? -1 : 1;
        o += '<text class="bb-bp" x="' + (px + dx * 8) + '" y="' + (py + 4) + '" text-anchor="' + (right ? "start" : "end") + '">' + pin.name + '</text><circle cx="' + px + '" cy="' + py + '" r="3" fill="#ccc"/>';
        o += '<path class="bb-lead" d="M' + px + ' ' + py + ' C' + (px + dx * 40) + ' ' + py + ' ' + f(t[0] - dx * 30) + ' ' + f(t[1]) + ' ' + f(t[0]) + ' ' + f(t[1]) + '" style="stroke:' + (WIRE[pin.c] || pin.c) + '"/>' + hole(t);
      });
      return o;
    },
    meter: function (p) {
      var bx = X0 + BW * P + 34, by = p.y || METER_Y || 90, o = '<rect class="bb-box" x="' + bx + '" y="' + by + '" width="96" height="70" rx="8"/><rect x="' + (bx + 10) + '" y="' + (by + 10) + '" width="76" height="24" rx="3" fill="#b9c7a6"/><text class="bb-lcd" x="' + (bx + 48) + '" y="' + (by + 27) + '" text-anchor="middle">' + (p.mode || "V") + '</text><text class="bb-bt" x="' + (bx + 48) + '" y="' + (by + 53) + '" text-anchor="middle" direction="rtl">' + (p.label || "ملتيميتر") + '</text>';
      var leads = p.leads ? p.leads.map(function (l, i) { return [l.to, l.c, by + 58 + i * 5]; }) : [[p.a, "red", by + 62], [p.b, "black", by + 66]];
      leads.forEach(function (q) {
        var t = xy(q[0]); o += '<path class="bb-lead" d="M' + bx + ' ' + q[2] + ' C' + (bx - 40) + ' ' + q[2] + ' ' + f(t[0] + 30) + ' ' + f(t[1] - 30) + ' ' + f(t[0]) + ' ' + f(t[1]) + '" style="stroke:' + (WIRE[q[1]] || q[1]) + '"/><circle cx="' + f(t[0]) + '" cy="' + f(t[1]) + '" r="3.6" fill="' + (WIRE[q[1]] || q[1]) + '" stroke="#fff" stroke-width="1"/>';
      });
      return o;
    }
  };

  function board() {
    var o = '<rect class="bb-body" x="' + (X0 - 18) + '" y="14" width="' + (BW * P + 36) + '" height="' + (HALF ? Y.e + 26 - 14 : 306) + '" rx="8"/>';
    if (!HALF) o += '<rect class="bb-gap" x="' + (X0 - 18) + '" y="' + (Y.e + 12) + '' + '" width="' + (BW * P + 36) + '" height="' + (Y.f - Y.e - 24) + '"/>';
    var rails = HALF ? ["T+", "T-"] : ["T+", "T-", "B+", "B-"], rows = HALF ? "abcde" : "abcdefghij";
    [["T+", "#e0312f"], ["T-", "#2f6fe0"], ["B+", "#e0312f"], ["B-", "#2f6fe0"]].filter(function (r) { return rails.indexOf(r[0]) > -1; }).forEach(function (r) {
      var y = Y[r[0]] + (r[0][1] === "+" ? -9 : 9);
      o += '<line x1="' + (X0 - 6) + '" y1="' + y + '" x2="' + (X0 + BW * P + 6) + '" y2="' + y + '" stroke="' + r[1] + '" stroke-width="1.4"/>';
      o += '<text class="bb-t" x="' + (X0 - 12) + '" y="' + (Y[r[0]] + 3) + '" text-anchor="middle" fill="' + r[1] + '">' + (r[0][1] === "+" ? "+" : "−") + '</text>';
    });
    for (var c = 1; c <= COLS; c++) {
      var x = X0 + (c - 1) * P;
      rails.forEach(function (r) { if ((c - 1) % 6 !== 5) o += '<rect class="bb-h" x="' + (x - 2) + '" y="' + (Y[r] - 2) + '" width="4" height="4" rx="1"/>'; });
      rows.split("").forEach(function (r) { o += '<rect class="bb-h" x="' + (x - 2) + '" y="' + (Y[r] - 2) + '" width="4" height="4" rx="1"/>'; });
      if (c % 5 === 0 || c === 1) { o += '<text class="bb-n" x="' + x + '" y="' + (Y.a - 10) + '" text-anchor="middle">' + c + '</text>' + (HALF ? '' : '<text class="bb-n" x="' + x + '" y="' + (Y.j + 16) + '" text-anchor="middle">' + c + '</text>'); }
    }
    rows.split("").forEach(function (r) { o += '<text class="bb-n" x="' + (X0 - 12) + '" y="' + (Y[r] + 3) + '" text-anchor="middle">' + r + '</text>'; });
    return o;
  }

  /* steps: [{ add: [part], remove: [id] }]; renders the board as it is after step `upto`, new parts highlighted */
  function refs(q) { var r = [q.a, q.b].concat((q.pins || []).map(function (x) { return x.to; }), (q.leads || []).map(function (x) { return x.to; })); return r.filter(Boolean); }
  function render(steps, upto, aria) {
    // size the board to what the whole project uses, so every step's picture has the same frame
    var all = []; steps.forEach(function (s) { (s.add || []).forEach(function (q) { all = all.concat(refs(q)); }); });
    var maxC = Math.max.apply(null, all.map(function (r) { return +/\d+$/.exec(r)[0]; }));
    HALF = !all.some(function (r) { return /^([f-j]|B)/.test(r); });
    COLS = Math.max(12, maxC + 2); BW = COLS - 1; W = X0 + BW * P + 150; H = HALF ? Y.e + 52 : 330;
    METER_Y = HALF ? 40 : null;
    var parts = [], order = { wire: 1, res: 2, cap: 2, ldr: 2, ntc: 2, led: 3, src: 4, meter: 5 };
    for (var i = 0; i <= upto; i++) {
      var s = steps[i] || {};
      (s.remove || []).forEach(function (id) { parts = parts.filter(function (q) { return q.id !== id; }); });
      (s.add || []).forEach(function (q) { parts.push({ p: q, step: i }); });
    }
    var ctx = { powered: parts.some(function (q) { return q.p.k === "src" && q.p.power; }) };
    parts.sort(function (x, y) { return order[x.p.k] - order[y.p.k]; });
    var body = parts.map(function (q) { return '<g class="' + (q.step === upto ? "bb-new" : "bb-old") + '">' + DRAW[q.p.k](q.p, ctx) + '</g>'; }).join("");
    return '<svg class="bb" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (aria || "رسم توضيحي للتوصيل على لوحة التجارب") + '">' + board() + body + '</svg>';
  }

  window.CV = window.CV || {};
  window.CV.breadboard = { render: render, bands: bands };
})();
