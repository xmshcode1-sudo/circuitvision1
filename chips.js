/* CircuitVision — TTL chips of the Logic Design lab (EE2111), modelled pin for pin from their data sheets.
   Each chip: pins (14/16), vcc/gnd pin numbers, a label per pin, and eval(get, st) → { pin: 0|1 } for its outputs.
   get(pin) reads an input as TTL does: a floating (unconnected) input reads HIGH.
   Sequential chips keep their flip-flop state in `st`; edge(get, st) is called after the inputs settle. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  function nand(a, b) { return a && b ? 0 : 1; }
  function quad(fn, pins) { // four 2-input gates: [[a,b,y],…]
    return function (g) { var o = {}; pins.forEach(function (p) { o[p[2]] = fn(g(p[0]), g(p[1])) ? 1 : 0; }); return o; };
  }
  var Q14 = [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]];          // 7400 / 7408 / 7432 / 7486
  var L14 = { 1: "1A", 2: "1B", 3: "1Y", 4: "2A", 5: "2B", 6: "2Y", 7: "GND", 8: "3Y", 9: "3A", 10: "3B", 11: "4Y", 12: "4A", 13: "4B", 14: "VCC" };
  var CHIPS = {
    "7400": { pins: 14, vcc: 14, gnd: 7, ar: "4 بوابات NAND بمدخلين", en: "Quad 2-input NAND", labels: L14, eval: quad(function (a, b) { return !(a && b); }, Q14) },
    "7408": { pins: 14, vcc: 14, gnd: 7, ar: "4 بوابات AND بمدخلين", en: "Quad 2-input AND", labels: L14, eval: quad(function (a, b) { return a && b; }, Q14) },
    "7432": { pins: 14, vcc: 14, gnd: 7, ar: "4 بوابات OR بمدخلين", en: "Quad 2-input OR", labels: L14, eval: quad(function (a, b) { return a || b; }, Q14) },
    "7486": { pins: 14, vcc: 14, gnd: 7, ar: "4 بوابات XOR بمدخلين", en: "Quad 2-input XOR", labels: L14, eval: quad(function (a, b) { return a !== b; }, Q14) },
    "7402": { pins: 14, vcc: 14, gnd: 7, ar: "4 بوابات NOR بمدخلين", en: "Quad 2-input NOR",
      labels: { 1: "1Y", 2: "1A", 3: "1B", 4: "2Y", 5: "2A", 6: "2B", 7: "GND", 8: "3A", 9: "3B", 10: "3Y", 11: "4A", 12: "4B", 13: "4Y", 14: "VCC" },
      eval: quad(function (a, b) { return !(a || b); }, [[2, 3, 1], [5, 6, 4], [8, 9, 10], [11, 12, 13]]) },
    "7404": { pins: 14, vcc: 14, gnd: 7, ar: "6 عواكس NOT", en: "Hex inverter",
      labels: { 1: "1A", 2: "1Y", 3: "2A", 4: "2Y", 5: "3A", 6: "3Y", 7: "GND", 8: "4Y", 9: "4A", 10: "5Y", 11: "5A", 12: "6Y", 13: "6A", 14: "VCC" },
      eval: function (g) { var o = {}; [[1, 2], [3, 4], [5, 6], [9, 8], [11, 10], [13, 12]].forEach(function (p) { o[p[1]] = g(p[0]) ? 0 : 1; }); return o; } },
    "7483": { pins: 16, vcc: 5, gnd: 12, ar: "جامع ثنائي 4 بت", en: "4-bit binary full adder",
      labels: { 1: "A4", 2: "S3", 3: "A3", 4: "B3", 5: "VCC", 6: "S2", 7: "B2", 8: "A2", 9: "S1", 10: "A1", 11: "B1", 12: "GND", 13: "C0", 14: "C4", 15: "S4", 16: "B4" },
      eval: function (g) {
        var a = g(10) + 2 * g(8) + 4 * g(3) + 8 * g(1), b = g(11) + 2 * g(7) + 4 * g(4) + 8 * g(16), s = a + b + g(13);
        return { 9: s & 1, 6: (s >> 1) & 1, 2: (s >> 2) & 1, 15: (s >> 3) & 1, 14: (s >> 4) & 1 };
      } },
    "7485": { pins: 16, vcc: 16, gnd: 8, ar: "مقارن مقدار 4 بت", en: "4-bit magnitude comparator",
      labels: { 1: "B3", 2: "IA<B", 3: "IA=B", 4: "IA>B", 5: "A>B", 6: "A=B", 7: "A<B", 8: "GND", 9: "B0", 10: "A0", 11: "B1", 12: "A1", 13: "A2", 14: "B2", 15: "A3", 16: "VCC" },
      eval: function (g) {
        var a = g(10) + 2 * g(12) + 4 * g(13) + 8 * g(15), b = g(9) + 2 * g(11) + 4 * g(14) + 8 * g(1);
        if (a > b) return { 5: 1, 6: 0, 7: 0 };
        if (a < b) return { 5: 0, 6: 0, 7: 1 };
        var gt = g(4), eq = g(3), lt = g(2);                       // equal: the cascade inputs decide (data sheet function table)
        if (eq) return { 5: 0, 6: 1, 7: 0 };
        return { 5: gt && !lt ? 1 : !gt && !lt ? 1 : 0, 6: 0, 7: lt && !gt ? 1 : !gt && !lt ? 1 : 0 };
      } },
    "74138": { pins: 16, vcc: 16, gnd: 8, ar: "مفكك 3 إلى 8 (مخارج فعّالة منخفضة)", en: "3-to-8 line decoder (active-low outputs)",
      labels: { 1: "A", 2: "B", 3: "C", 4: "G2A", 5: "G2B", 6: "G1", 7: "Y7", 8: "GND", 9: "Y6", 10: "Y5", 11: "Y4", 12: "Y3", 13: "Y2", 14: "Y1", 15: "Y0", 16: "VCC" },
      eval: function (g) {
        var Y = [15, 14, 13, 12, 11, 10, 9, 7], o = {}, on = g(6) && !g(4) && !g(5), n = g(1) + 2 * g(2) + 4 * g(3);
        Y.forEach(function (p, i) { o[p] = on && i === n ? 0 : 1; });
        return o;
      } },
    "74151": { pins: 16, vcc: 16, gnd: 8, ar: "ناخب 8 إلى 1 (MUX)", en: "8-to-1 multiplexer",
      labels: { 1: "D3", 2: "D2", 3: "D1", 4: "D0", 5: "Y", 6: "W", 7: "G", 8: "GND", 9: "C", 10: "B", 11: "A", 12: "D7", 13: "D6", 14: "D5", 15: "D4", 16: "VCC" },
      eval: function (g) {
        var D = [4, 3, 2, 1, 15, 14, 13, 12], n = g(11) + 2 * g(10) + 4 * g(9), y = g(7) ? 0 : g(D[n]);
        return { 5: y, 6: y ? 0 : 1 };
      } },
    "74155": { pins: 16, vcc: 16, gnd: 8, ar: "مفكك/موزّع مزدوج 2 إلى 4", en: "Dual 2-to-4 decoder / demultiplexer",
      labels: { 1: "1C", 2: "1G", 3: "B", 4: "1Y3", 5: "1Y2", 6: "1Y1", 7: "1Y0", 8: "GND", 9: "2Y0", 10: "2Y1", 11: "2Y2", 12: "2Y3", 13: "A", 14: "2G", 15: "2C", 16: "VCC" },
      eval: function (g) {
        var n = g(13) + 2 * g(3), o = {}, on1 = !g(2) && g(1), on2 = !g(14) && !g(15);
        [7, 6, 5, 4].forEach(function (p, i) { o[p] = on1 && i === n ? 0 : 1; });
        [9, 10, 11, 12].forEach(function (p, i) { o[p] = on2 && i === n ? 0 : 1; });
        return o;
      } },
    "7474": { pins: 14, vcc: 14, gnd: 7, seq: true, ar: "قلّابان D (حافة صاعدة) مع PRE و CLR", en: "Dual D flip-flop, positive edge, preset and clear",
      labels: { 1: "1CLR", 2: "1D", 3: "1CLK", 4: "1PRE", 5: "1Q", 6: "1Q̄", 7: "GND", 8: "2Q̄", 9: "2Q", 10: "2PRE", 11: "2CLK", 12: "2D", 13: "2CLR", 14: "VCC" },
      ff: [{ clr: 1, d: 2, clk: 3, pre: 4, q: 5, qn: 6 }, { clr: 13, d: 12, clk: 11, pre: 10, q: 9, qn: 8 }],
      eval: function (g, st) { return ffOut(this.ff, g, st); },
      edge: function (g, st) { // the Q output takes D on the rising clock edge
        var ch = false;
        this.ff.forEach(function (f, i) {
          var c = g(f.clk), s = st[i];
          if (s.clk === 0 && c === 1 && g(f.pre) && g(f.clr)) { var n = g(f.d); if (n !== s.q) ch = true; s.q = n; }
          s.clk = c;
        });
        return ch;
      } },
    "7476": { pins: 16, vcc: 5, gnd: 13, seq: true, ar: "قلّابان JK (Master-Slave) مع PRE و CLR", en: "Dual JK flip-flop, master-slave, preset and clear",
      labels: { 1: "1CLK", 2: "1PRE", 3: "1CLR", 4: "1J", 5: "VCC", 6: "2CLK", 7: "2PRE", 8: "2CLR", 9: "2J", 10: "2Q̄", 11: "2Q", 12: "2K", 13: "GND", 14: "1Q̄", 15: "1Q", 16: "1K" },
      ff: [{ clk: 1, pre: 2, clr: 3, j: 4, k: 16, q: 15, qn: 14 }, { clk: 6, pre: 7, clr: 8, j: 9, k: 12, q: 11, qn: 10 }],
      eval: function (g, st) { return ffOut(this.ff, g, st); },
      edge: function (g, st) { // master-slave: J and K are taken while the clock is high, Q changes when it falls
        var ch = false;
        this.ff.forEach(function (f, i) {
          var c = g(f.clk), s = st[i];
          if (s.clk === 1 && c === 0 && g(f.pre) && g(f.clr)) {
            var j = g(f.j), k = g(f.k), n = j && k ? 1 - s.q : j ? 1 : k ? 0 : s.q;
            if (n !== s.q) ch = true; s.q = n;
          }
          s.clk = c;
        });
        return ch;
      } },
    "74194": { pins: 16, vcc: 16, gnd: 8, seq: true, ar: "مسجّل إزاحة شامل 4 بت (يمين ويسار وتحميل متوازي)", en: "4-bit bidirectional universal shift register",
      labels: { 1: "CLR", 2: "SR", 3: "A", 4: "B", 5: "C", 6: "D", 7: "SL", 8: "GND", 9: "S0", 10: "S1", 11: "CLK", 12: "QD", 13: "QC", 14: "QB", 15: "QA", 16: "VCC" },
      ff: [{}],
      eval: function (g, st) { // CLR is asynchronous and active low
        var s = st[0] || {}; if (!s.r) s.r = [0, 0, 0, 0];
        if (!g(1)) s.r = [0, 0, 0, 0];
        return { 15: s.r[0], 14: s.r[1], 13: s.r[2], 12: s.r[3] };
      },
      edge: function (g, st) { // on the rising clock edge, S1 S0 pick: 00 hold · 01 shift right (QA←SR) · 10 shift left (QD←SL) · 11 parallel load
        var s = st[0], c = g(11), ch = false; if (!s.r) s.r = [0, 0, 0, 0];
        if (s.clk === 0 && c === 1 && g(1)) {
          var r = s.r, m = 2 * g(10) + g(9), n = m === 3 ? [g(3), g(4), g(5), g(6)] : m === 1 ? [g(2), r[0], r[1], r[2]] : m === 2 ? [r[1], r[2], r[3], g(7)] : r;
          ch = n.some(function (v, i) { return v !== r[i]; }); s.r = n.slice();
        }
        s.clk = c;
        return ch;
      } }
  };
  function ffOut(ffs, g, st) { // PRE and CLR are asynchronous and active low; both low gives Q = Q̄ = 1 (not stable)
    var o = {};
    ffs.forEach(function (f, i) {
      var s = st[i], pre = g(f.pre), clr = g(f.clr);
      if (!pre && !clr) { o[f.q] = 1; o[f.qn] = 1; return; }
      if (!pre) s.q = 1; else if (!clr) s.q = 0;
      o[f.q] = s.q; o[f.qn] = s.q ? 0 : 1;
    });
    return o;
  }
  Object.keys(CHIPS).forEach(function (k) { CHIPS[k].id = k; });
  CV.chips = {
    all: CHIPS,
    get: function (id) { return CHIPS[id]; },
    newState: function (id) { var c = CHIPS[id]; return c && c.ff ? c.ff.map(function () { return { q: 0, clk: null }; }) : null; },
    isOutput: function (id, pin) { // which pins a chip drives (found by evaluating once)
      var c = CHIPS[id], st = CV.chips.newState(id), o = c.eval(function () { return 1; }, st || []);
      return Object.prototype.hasOwnProperty.call(o, pin);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
