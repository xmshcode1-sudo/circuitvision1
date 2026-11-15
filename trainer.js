/* CircuitVision — the WUEKRO W5101-3D IC trainer, as on the lab bench.
   Same layout as the real board: power switch and +5V LED, 8 logic switches a–h, 8 LED indicators a–h,
   ZIF sockets 1–4 (14 pins), 5–8 (16 pins), 9 (20 pins), 10 (24 pins), +5V and 0V rails, clock generator G,
   divider f…f/16, pulse button, a plain toggle, monostable, an extra H/L switch, and the 4-digit display with BCD inputs.
   Wires go hole to hole. The logic is simulated with TTL rules: a floating chip input reads HIGH, a chip works only
   when its VCC pin is on +5V and its GND pin on 0V, and two outputs fighting on one wire is reported as a short.
   CV.trainer.mount(el, { key }) → api */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  var NS = "http://www.w3.org/2000/svg";
  var W = 1280, H = 960;
  var WIRE_COLORS = ["#d8312b", "#1f5fd6", "#e8c20f", "#1b1b1b", "#1d9a4a", "#e86a12"];
  var SW = ["a", "b", "c", "d", "e", "f", "g", "h"];
  var SOCKETS = [ // number, pins, block x, block y, row pitch
    { n: 1, pins: 14, x: 360, y: 168, w: 160, pitch: 22, top: 187 }, { n: 2, pins: 14, x: 525, y: 168, w: 160, pitch: 22, top: 187 },
    { n: 3, pins: 14, x: 690, y: 168, w: 160, pitch: 22, top: 187 }, { n: 4, pins: 14, x: 855, y: 168, w: 160, pitch: 22, top: 187 },
    { n: 5, pins: 16, x: 360, y: 350, w: 160, pitch: 22, top: 368 }, { n: 6, pins: 16, x: 525, y: 350, w: 160, pitch: 22, top: 368 },
    { n: 7, pins: 16, x: 690, y: 350, w: 160, pitch: 22, top: 368 }, { n: 8, pins: 16, x: 855, y: 350, w: 160, pitch: 22, top: 368 },
    { n: 9, pins: 20, x: 490, y: 588, w: 190, pitch: 24.5, top: 603 }, { n: 10, pins: 24, x: 690, y: 588, w: 190, pitch: 22.6, top: 600 }
  ];
  var CLOCKS = [0, 0.5, 1, 2, 4]; // Hz — the real knob reaches 10 kHz; slowed here so the eye can follow it
  var MONO = [0.1, 1, 3];

  /* ---------- the holes and what each one belongs to ---------- */
  function layout() {
    var holes = [], byId = {};
    function hole(id, x, y, g, info) { var h = { id: id, x: x, y: y, g: g, info: info }; holes.push(h); byId[id] = h; return h; }
    function rail(prefix, y, x0, x1, g, info) { var i = 0; for (var x = x0; x <= x1; x += 22) hole(prefix + (i++), x, y, g, info); }
    rail("p5t", 160, 300, 1180, "V5", ["+5V", "+5V"]);
    rail("gnd", 554, 362, 1160, "G0", ["0V (⊥)", "0V (⊥)"]);
    rail("p5m", 579, 312, 1170, "V5", ["+5V", "+5V"]);
    rail("gnb", 893, 212, 1100, "G0", ["0V", "0V"]);
    SW.forEach(function (s, i) { var y = 190 + i * 44; hole("sw" + s + "0", 330, y, "SW" + s, ["المفتاح " + s, "switch " + s]); hole("sw" + s + "1", 350, y, "SW" + s, ["المفتاح " + s, "switch " + s]); });
    SW.forEach(function (s, i) { var y = 185 + i * 44.5; hole("led" + s + "0", 1046, y, "LED" + s, ["مدخل LED " + s, "LED input " + s]); hole("led" + s + "1", 1066, y, "LED" + s, ["مدخل LED " + s, "LED input " + s]); });
    SOCKETS.forEach(function (s) {
      var half = s.pins / 2;
      for (var i = 0; i < half; i++) {
        var y = s.top + i * s.pitch, pl = i + 1, pr = s.pins - i;
        hole("s" + s.n + "p" + pl + "a", s.x + 20, y, "S" + s.n + "P" + pl); hole("s" + s.n + "p" + pl + "b", s.x + 40, y, "S" + s.n + "P" + pl);
        hole("s" + s.n + "p" + pr + "a", s.x + s.w - 40, y, "S" + s.n + "P" + pr); hole("s" + s.n + "p" + pr + "b", s.x + s.w - 20, y, "S" + s.n + "P" + pr);
      }
    });
    hole("clk0", 214, 470, "CLK", ["مخرج مولّد النبضات G", "clock generator G output"]); hole("clk1", 214, 494, "CLK", ["مخرج مولّد النبضات G", "clock generator G output"]);
    ["A", "B", "C", "D", "E"].forEach(function (k, i) { hole("div" + k, 222, 621 + i * 30.5, "DIV" + k, ["المقسّم " + k + " (" + ["f", "f/2", "f/4", "f/8", "f/16"][i] + ")", "divider " + k + " (" + ["f", "f/2", "f/4", "f/8", "f/16"][i] + ")"]); });
    hole("divR", 128, 785, "DIVR", ["مدخل تصفير المقسّم R", "divider reset input R"]);
    hole("pls0", 232, 792, "PLS", ["زر النبضة ⎍", "pulse button ⎍"]); hole("pls1", 254, 792, "PLS", ["زر النبضة ⎍", "pulse button ⎍"]);
    hole("plsn0", 232, 814, "PLSN", ["زر النبضة (معكوس)", "pulse button (inverted)"]); hole("plsn1", 254, 814, "PLSN", ["زر النبضة (معكوس)", "pulse button (inverted)"]);
    hole("bnc0", 210, 860, "BNC", ["مفتاح التلامس", "contact switch"]); hole("bnc1", 232, 860, "BNC", ["مفتاح التلامس", "contact switch"]);
    hole("monoT", 300, 628, "MONOT", ["مدخل القادح ▷ للمونوستابل", "monostable trigger ▷"]);
    hole("monoQ", 468, 628, "MONOQ", ["مخرج المونوستابل Q", "monostable output Q"]); hole("monoQN", 468, 652, "MONOQN", ["مخرج المونوستابل Q̄", "monostable output Q̄"]);
    hole("swi0", 470, 822, "SWi", ["مفتاح H/L السفلي", "lower H/L switch"]); hole("swi1", 470, 846, "SWi", ["مفتاح H/L السفلي", "lower H/L switch"]);
    [0, 1, 2, 3].forEach(function (d) { [1, 2, 4, 8].forEach(function (b, j) { hole("dsp" + d + "b" + b, 968 + d * 60, 795 + j * 25, "DSP" + d + "B" + b, ["مدخل الشاشة: الخانة " + (d + 1) + " · الوزن " + b, "display digit " + (d + 1) + " · weight " + b]); }); });
    return { holes: holes, byId: byId };
  }

  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(s, x, y, size, parent, opts) { var t = el("text", Object.assign({ x: x, y: y, "font-size": size, fill: "#1d2733", "font-family": "Arial, Helvetica, sans-serif", "text-anchor": "middle", "dominant-baseline": "middle" }, opts || {}), parent); t.textContent = s; return t; }

  function mount(host, opts) {
    opts = opts || {};
    var L = layout(), key = opts.key ? "cv-trainer:" + opts.key : null;
    var S = { power: 1, chips: {}, wires: [], sw: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0 }, bnc: 0, clk: 0, mono: 1, dez: 1 };
    try { if (key) { var saved = JSON.parse(localStorage.getItem(key) || "null"); if (saved) S = Object.assign(S, saved); } } catch (e) {}
    var R = { pulse: 0, clkOut: 0, div: 0, monoOn: 0, monoTimer: null, ff: {}, issues: [], net: {}, netOf: {}, sel: null, wsel: null, prevMonoT: null, prevDivR: 0 };
    Object.keys(S.chips).forEach(function (s) { R.ff[s] = CV.chips.newState(S.chips[s]); });
    function save() { try { if (key) localStorage.setItem(key, JSON.stringify(S)); } catch (e) {} if (opts.onChange) opts.onChange(api); }

    /* ---------- solving the board ---------- */
    function sockOf(n) { return SOCKETS.filter(function (s) { return s.n === +n; })[0]; }
    function pinGroup(sock, chipId, p) { var c = CV.chips.get(chipId), s = sockOf(sock); return "S" + sock + "P" + (p <= c.pins / 2 ? p : p + (s.pins - c.pins)); }
    function solve() {
      var parent = {};
      function find(x) { while (parent[x] && parent[x] !== x) x = parent[x]; return x; }
      function uni(a, b) { a = find(a); b = find(b); if (a !== b) parent[a] = b; }
      L.holes.forEach(function (h) { if (!parent[h.g]) parent[h.g] = h.g; });
      S.wires.forEach(function (w) { var a = L.byId[w.a], b = L.byId[w.b]; if (a && b) uni(a.g, b.g); });
      var netOf = {}; L.holes.forEach(function (h) { netOf[h.g] = find(h.g); });
      R.netOf = netOf;
      var on = !!S.power, fixed = {};
      function drive(g, v, who) { var n = netOf[g]; if (!n) return; (fixed[n] = fixed[n] || []).push({ v: v, who: who }); }
      if (on) {
        drive("V5", 1, "+5V"); drive("G0", 0, "0V");
        SW.concat(["i"]).forEach(function (s) { drive("SW" + s, S.sw[s] ? 1 : 0, "sw:" + s); });
        drive("PLS", R.pulse, "pulse"); drive("PLSN", R.pulse ? 0 : 1, "pulse"); drive("BNC", S.bnc, "bnc");
        drive("CLK", R.clkOut, "clk");
        ["A", "B", "C", "D", "E"].forEach(function (k, i) { drive("DIV" + k, i === 0 ? R.clkOut : (R.div >> (i - 1)) & 1, "div"); });
        drive("MONOQ", R.monoOn, "mono"); drive("MONOQN", R.monoOn ? 0 : 1, "mono");
      }
      var socks = Object.keys(S.chips), outs = {}, val = {}, issues = [], powered = {};
      function resolve() {
        val = {}; var shorts = {};
        var all = {}; for (var n in fixed) all[n] = fixed[n].slice();
        socks.forEach(function (s) { var o = outs[s]; if (!o) return; for (var p in o) { var n = netOf[pinGroup(s, S.chips[s], +p)]; (all[n] = all[n] || []).push({ v: o[p], who: "chip:" + s + ":" + p }); } });
        for (var k in all) {
          var ds = all[k], v = ds[0].v, bad = ds.some(function (d) { return d.v !== v; });
          if (bad) { shorts[k] = ds; val[k] = null; } else val[k] = v;
        }
        return shorts;
      }
      function getter(s) { var c = S.chips[s]; return function (p) { var v = val[netOf[pinGroup(s, c, p)]]; return v === undefined || v === null ? 1 : v; }; }
      var shorts = {}, iter = 0, osc = false;
      for (; iter < 60; iter++) {
        shorts = resolve();
        var changed = false;
        socks.forEach(function (s) {
          var c = CV.chips.get(S.chips[s]); if (!c) return;
          var vcc = val[netOf[pinGroup(s, S.chips[s], c.vcc)]], gnd = val[netOf[pinGroup(s, S.chips[s], c.gnd)]];
          powered[s] = vcc === 1 && gnd === 0;
          var o = powered[s] ? c.eval(getter(s), R.ff[s] || []) : null;
          if (JSON.stringify(o) !== JSON.stringify(outs[s] || null)) { outs[s] = o; changed = true; }
        });
        if (!changed) {
          var ed = false; // flip-flops act on clock edges once the inputs are steady
          socks.forEach(function (s) { var c = CV.chips.get(S.chips[s]); if (c && c.seq && powered[s] && c.edge(getter(s), R.ff[s])) ed = true; });
          if (!ed) break;
        }
      }
      if (iter >= 60) osc = true;
      R.net = val; R.outs = outs; R.powered = powered;
      // the monostable fires on a rising edge at its trigger; the divider clears while R is high
      var mt = val[netOf.MONOT], fired = mt === 1 && R.prevMonoT === 0; R.prevMonoT = mt === undefined ? null : mt;
      if (fired) { fireMono(); return solve(); } // its output goes high at once
      var dr = val[netOf.DIVR] === 1; if (dr) R.div = 0; R.prevDivR = dr;
      // what to tell the student
      if (!on) issues.push({ sev: "warn", t: "الجهاز مطفأ: شغّله من المفتاح الأحمر.", en: "The trainer is off: switch it on with the red switch." });
      Object.keys(shorts).forEach(function (n) {
        var who = shorts[n].map(function (d) { return name(d.who); }).filter(function (v, i, a) { return a.indexOf(v) === i; });
        issues.push({ sev: "err", t: "تماس (قصر): " + who.join(" و ") + " موصولة ببعض وكل واحد يعطي مستوى مختلف. افصل أحد السلكين.", en: "Short circuit: " + who.join(" and ") + " are joined while driving different levels. Remove one of the wires." });
      });
      socks.forEach(function (s) {
        var id = S.chips[s], c = CV.chips.get(id); if (!c || powered[s] || !on) return;
        var used = S.wires.some(function (w) { return [w.a, w.b].some(function (h) { return L.byId[h] && L.byId[h].g.indexOf("S" + s + "P") === 0; }); });
        if (!used) return;
        issues.push({ sev: "err", t: "الدائرة " + id + " في المقبس " + s + " بدون تغذية: صل الرجل " + c.vcc + " (VCC) بـ +5V والرجل " + c.gnd + " (GND) بـ 0V.", en: "IC " + id + " in socket " + s + " has no power: connect pin " + c.vcc + " (VCC) to +5V and pin " + c.gnd + " (GND) to 0V." });
      });
      if (osc) issues.push({ sev: "warn", t: "الدائرة تتذبذب (مخرج راجع لمدخل بدون قلّاب)، فالنتيجة غير مستقرة.", en: "The circuit oscillates (an output fed back to an input without a flip-flop), so its result is not steady." });
      R.issues = issues;
    }
    function name(who) {
      if (who === "+5V" || who === "0V") return who;
      if (who.indexOf("sw:") === 0) return (CV.bi && CV.bi.mode() === "en" ? "switch " : "المفتاح ") + who.slice(3);
      if (who.indexOf("chip:") === 0) { var p = who.split(":"), c = CV.chips.get(S.chips[p[1]]); return (S.chips[p[1]]) + " " + (c.labels[p[2]] || "") + " (" + p[2] + ")"; }
      return { pulse: "زر النبضة", bnc: "مفتاح التلامس", clk: "المولّد G", div: "المقسّم", mono: "المونوستابل" }[who] || who;
    }
    function netVal(g) { var n = R.netOf[g]; var v = R.net[n]; return v === undefined ? null : v; }
    function holeVal(id) { var h = L.byId[id]; return h ? netVal(h.g) : null; }
    function fireMono() {
      R.monoOn = 1; clearTimeout(R.monoTimer);
      R.monoTimer = setTimeout(function () { R.monoOn = 0; update(); }, MONO[S.mono] * 1000);
    }

    /* ---------- the clock ---------- */
    var timer = null;
    function setClock() {
      clearInterval(timer); timer = null;
      var f = CLOCKS[S.clk]; if (!f) { R.clkOut = 0; return; }
      timer = setInterval(function () {
        if (!document.body.contains(svg)) { clearInterval(timer); return; }
        R.clkOut = R.clkOut ? 0 : 1;
        if (R.clkOut && !R.prevDivR) R.div = (R.div + 1) & 15;
        update();
      }, 500 / f);
    }

    /* ---------- drawing ---------- */
    host.innerHTML = "";
    host.classList.add("tr-host");
    var bar = document.createElement("div"); bar.className = "tr-bar"; host.appendChild(bar);
    var scroller = document.createElement("div"); scroller.className = "tr-scroll"; host.appendChild(scroller);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, class: "tr-svg", role: "img", "aria-label": "IC trainer W5101-3D", direction: "ltr" }, scroller); scroller.setAttribute("dir", "ltr");
    var info = document.createElement("div"); info.className = "tr-info"; info.setAttribute("aria-live", "polite"); host.appendChild(info);
    var issuesEl = document.createElement("ul"); issuesEl.className = "tr-issues"; host.appendChild(issuesEl);
    var zoom = 1;
    bar.innerHTML = '<button type="button" class="btn btn-ghost btn-sm" data-z="-1" aria-label="تصغير">−</button><button type="button" class="btn btn-ghost btn-sm" data-z="1" aria-label="تكبير">+</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="labels" aria-pressed="false">أسماء الأرجل</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="delwire" disabled>احذف السلك</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="clear">امسح الأسلاك</button>' +
      '<span class="tr-hint">اضغط فتحة ثم فتحة ثانية لتوصيل سلك · اضغط المقبس لتركيب IC</span>';
    var showLabels = false;
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.z) { zoom = Math.max(1, Math.min(2.6, zoom + (+b.dataset.z) * 0.4)); svg.style.width = (zoom * 100) + "%"; return; }
      if (b.dataset.act === "labels") { showLabels = !showLabels; b.setAttribute("aria-pressed", showLabels); draw(); }
      if (b.dataset.act === "delwire" && R.wsel !== null) { S.wires.splice(R.wsel, 1); R.wsel = null; save(); update(); }
      if (b.dataset.act === "clear") { if (!S.wires.length) return; if (b.dataset.sure) { S.wires = []; R.wsel = null; delete b.dataset.sure; b.textContent = "امسح الأسلاك"; save(); update(); } else { clearTimeout(b._t); b.dataset.sure = "1"; b.textContent = "متأكد؟ اضغط مرة ثانية"; b._t = setTimeout(function () { delete b.dataset.sure; b.textContent = "امسح الأسلاك"; }, 3000); } }
    });
    var gBoard = el("g", {}, svg), gDyn = el("g", {}, svg), gWires = el("g", {}, svg), gTop = el("g", {}, svg);

    function drawBoard() {
      gBoard.innerHTML = "";
      el("rect", { x: 2, y: 40, width: W - 4, height: H - 44, rx: 40, fill: "#2a2d31" }, gBoard);
      el("rect", { x: 16, y: 64, width: W - 32, height: H - 84, rx: 30, fill: "#eef0f2", stroke: "#c9ced4" }, gBoard);
      [[45, 95], [1235, 95], [45, 915], [1235, 915], [640, 95], [215, 535], [1195, 535], [1195, 770], [80, 875], [290, 880]].forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: 9, fill: "#2b2f34" }, gBoard); });
      txt("IC-Trainer", 1150, 118, 17, gBoard); txt("W5101-3D", 1070, 935, 16, gBoard); txt("WUEKRO", 140, 928, 15, gBoard, { fill: "#2c6e5a", "font-weight": "bold", "font-family": "Georgia, serif" });
      // power
      el("rect", { x: 40, y: 150, width: 112, height: 70, rx: 6, fill: "#1b1d20" }, gBoard);
      el("rect", { x: 70, y: 168, width: 52, height: 34, rx: 4, fill: "#2c3036" }, gBoard);
      el("rect", { x: 172, y: 222, width: 48, height: 70, fill: "none", stroke: "#1d2733" }, gBoard); el("line", { x1: 172, y1: 292, x2: 220, y2: 222, stroke: "#1d2733" }, gBoard);
      txt("AC", 186, 238, 12, gBoard); txt("DC", 207, 278, 12, gBoard);
      txt("Fuse/Sicherung", 106, 330, 12, gBoard); txt("230V: 0,1AT", 106, 346, 11, gBoard); txt("115V: 0,2AT", 106, 361, 11, gBoard);
      txt("AC, 50-60Hz", 112, 160, 10, gBoard, { fill: "#cfd5db" });
      txt("+5V / 5A", 255, 150, 12, gBoard);
      el("path", { d: "M220 222 V160 H300", fill: "none", stroke: "#1d2733" }, gBoard);
      // rails
      el("line", { x1: 300, y1: 160, x2: 1180, y2: 160, stroke: "#1d2733", "stroke-width": 1.4 }, gBoard);
      el("line", { x1: 362, y1: 554, x2: 1160, y2: 554, stroke: "#1d2733", "stroke-width": 1.4 }, gBoard); txt("⊥", 1170, 545, 16, gBoard);
      el("line", { x1: 312, y1: 579, x2: 1170, y2: 579, stroke: "#1d2733", "stroke-width": 1.4 }, gBoard); txt("+5V", 690, 568, 12, gBoard);
      el("line", { x1: 212, y1: 893, x2: 1100, y2: 893, stroke: "#1d2733", "stroke-width": 1.4 }, gBoard); txt("0V", 276, 880, 12, gBoard); txt("⊥", 1110, 884, 16, gBoard);
      // switches a–h
      SW.forEach(function (s, i) { var y = 190 + i * 44; txt("H", 252, y - 15, 10, gBoard); txt("L", 268, y - 15, 10, gBoard); txt("H", 284, y - 15, 10, gBoard); txt(s, 318, y + 15, 12, gBoard); el("line", { x1: 300, y1: y, x2: 330, y2: y, stroke: "#1d2733" }, gBoard); });
      // LEDs
      SW.forEach(function (s, i) { var y = 185 + i * 44.5; txt(s, 1066, y - 14, 12, gBoard); el("line", { x1: 1066, y1: y, x2: 1110, y2: y, stroke: "#1d2733" }, gBoard); el("path", { d: "M1110 " + (y - 12) + " L1136 " + y + " L1110 " + (y + 12) + " Z", fill: "none", stroke: "#1d2733", "stroke-width": 1.4 }, gBoard); });
      // sockets
      SOCKETS.forEach(function (s) {
        var half = s.pins / 2, top = s.top - 14, bot = s.top + (half - 1) * s.pitch + 14;
        if (s.n <= 8) el("rect", { x: s.x - 2, y: s.y, width: s.w + 4, height: (s.n <= 4 ? 172 : 194), fill: "none", stroke: "#1d2733", "stroke-width": 1.4 }, gBoard);
        for (var i = 0; i < half; i++) {
          var y = s.top + i * s.pitch;
          txt(String(i + 1), s.x + 8, y, 10, gBoard); txt(String(s.pins - i), s.x + s.w - 6, y, 10, gBoard);
          el("line", { x1: s.x + 20, y1: y, x2: s.x + 40, y2: y, stroke: "#1d2733" }, gBoard); el("line", { x1: s.x + s.w - 40, y1: y, x2: s.x + s.w - 20, y2: y, stroke: "#1d2733" }, gBoard);
        }
        var bw = s.pins >= 20 ? 52 : 44, bx = s.x + s.w / 2 - bw / 2;
        el("rect", { x: bx, y: top - 4, width: bw, height: bot - top + 8, rx: 4, fill: "#2e8c74", stroke: "#1f6a57" }, gBoard);
        for (var j = 0; j < half; j++) { var yy = s.top + j * s.pitch; el("rect", { x: bx + 5, y: yy - 3, width: 6, height: 6, fill: "#1b4d40" }, gBoard); el("rect", { x: bx + bw - 11, y: yy - 3, width: 6, height: 6, fill: "#1b4d40" }, gBoard); }
        el("line", { x1: bx + bw - 4, y1: bot + 2, x2: bx + bw + 2, y2: bot + 26, stroke: "#5b6670", "stroke-width": 3 }, gBoard); el("circle", { cx: bx + bw + 3, cy: bot + 30, r: 6, fill: "#2e8c74" }, gBoard);
        txt(String(s.n), s.x + s.w / 2 - 12, bot + 26, 15, gBoard);
        var hit = el("rect", { x: bx, y: top - 4, width: bw, height: bot - top + 8, fill: "transparent", class: "tr-sock", "data-sock": s.n, tabindex: 0, role: "button", "aria-label": "المقبس " + s.n }, gBoard);
        hit.addEventListener("click", function () { pickChip(s.n); });
      });
      // clock generator G
      el("rect", { x: 75, y: 392, width: 120, height: 168, fill: "none", stroke: "#1d2733" }, gBoard);
      txt("G", 135, 408, 13, gBoard); el("path", { d: "M100 438 h10 v-14 h14 v14 h14 v-14 h14 v14 h10", fill: "none", stroke: "#1d2733", "stroke-width": 1.6 }, gBoard);
      txt("10kHz", 135, 462, 11, gBoard); txt("0", 92, 532, 11, gBoard); txt("max", 172, 532, 11, gBoard); txt("R", 135, 550, 11, gBoard);
      el("line", { x1: 195, y1: 482, x2: 214, y2: 482, stroke: "#1d2733" }, gBoard);
      // divider
      el("rect", { x: 70, y: 596, width: 120, height: 180, fill: "none", stroke: "#1d2733" }, gBoard);
      el("path", { d: "M115 615 h10 v-12 h14 v12 h10", fill: "none", stroke: "#1d2733", "stroke-width": 1.5 }, gBoard);
      txt("Teiler", 128, 676, 12, gBoard); txt("Divider", 128, 692, 12, gBoard);
      ["A", "B", "C", "D", "E"].forEach(function (k, i) { var y = 621 + i * 30.5; txt(k, 176, y, 11, gBoard); el("line", { x1: 190, y1: y, x2: 222, y2: y, stroke: "#1d2733" }, gBoard); txt(["f", "f/2", "f/4", "f/8", "f/16"][i], 252, y, 11, gBoard); });
      txt("R", 128, 766, 11, gBoard);
      // pulse button
      el("path", { d: "M206 778 h8 v-12 h12 v12 h8", fill: "none", stroke: "#1d2733", "stroke-width": 1.5 }, gBoard);
      el("line", { x1: 150, y1: 805, x2: 232, y2: 805, stroke: "#1d2733" }, gBoard);
      // contact switch symbol
      el("path", { d: "M150 860 h20 l18 -12 M190 860 h20 M178 846 v-8 h8", fill: "none", stroke: "#1d2733", "stroke-width": 1.5 }, gBoard);
      // monostable
      el("rect", { x: 320, y: 596, width: 125, height: 184, fill: "none", stroke: "#1d2733" }, gBoard);
      txt("1", 352, 612, 13, gBoard); el("path", { d: "M362 618 h6 v-14 h14 v14 h6", fill: "none", stroke: "#1d2733", "stroke-width": 1.5 }, gBoard);
      el("path", { d: "M320 620 l10 8 -10 8", fill: "none", stroke: "#1d2733" }, gBoard); el("line", { x1: 300, y1: 628, x2: 320, y2: 628, stroke: "#1d2733" }, gBoard);
      el("circle", { cx: 450, cy: 652, r: 4, fill: "none", stroke: "#1d2733" }, gBoard); el("line", { x1: 445, y1: 628, x2: 468, y2: 628, stroke: "#1d2733" }, gBoard); el("line", { x1: 454, y1: 652, x2: 468, y2: 652, stroke: "#1d2733" }, gBoard);
      txt("ext.", 336, 680, 10, gBoard); txt("0,1s", 368, 662, 10, gBoard); txt("1s", 398, 662, 10, gBoard); txt("3s", 420, 680, 10, gBoard);
      txt("C", 270, 712, 12, gBoard); txt("ext", 286, 718, 9, gBoard); el("line", { x1: 283, y1: 690, x2: 283, y2: 830, stroke: "#1d2733" }, gBoard);
      el("rect", { x: 312, y: 826, width: 38, height: 12, fill: "none", stroke: "#1d2733" }, gBoard); txt("R", 326, 812, 12, gBoard); txt("ext", 342, 818, 9, gBoard);
      el("path", { d: "M283 832 H312 M350 832 H382 V780", fill: "none", stroke: "#1d2733" }, gBoard);
      // lower H/L switch
      txt("H", 410, 818, 10, gBoard); txt("L", 410, 834, 10, gBoard); txt("H", 410, 850, 10, gBoard); el("line", { x1: 440, y1: 834, x2: 470, y2: 834, stroke: "#1d2733" }, gBoard);
      // display
      txt("Anzeige / Display", 1046, 605, 12, gBoard); txt("Dez", 925, 626, 11, gBoard); txt("Hex", 925, 670, 11, gBoard);
      el("rect", { x: 940, y: 618, width: 212, height: 66, fill: "#1a1a1a" }, gBoard);
      el("rect", { x: 940, y: 698, width: 214, height: 60, fill: "none", stroke: "#1d2733" }, gBoard); el("line", { x1: 940, y1: 758, x2: 1154, y2: 698, stroke: "#1d2733" }, gBoard);
      [0, 1, 2, 3].forEach(function (d) { [1, 2, 4, 8].forEach(function (b, j) { txt(String(b), 950 + d * 60, 795 + j * 25, 11, gBoard); }); el("path", { d: "M" + (980 + d * 60) + " 758 V785", stroke: "#1d2733", fill: "none" }, gBoard); });
    }

    function drawSwitch(cx, cy, on, label, onClick) {
      var g = el("g", { class: "tr-click", role: "switch", tabindex: 0, "aria-checked": on ? "true" : "false", "aria-label": label }, gDyn);
      el("circle", { cx: cx, cy: cy, r: 9, fill: "#b9c0c7", stroke: "#6b747d" }, g);
      el("line", { x1: cx, y1: cy, x2: cx + (on ? -11 : 11), y2: cy, stroke: "#59626b", "stroke-width": 5, "stroke-linecap": "round" }, g);
      el("circle", { cx: cx + (on ? -13 : 13), cy: cy, r: 4.5, fill: "#d9dde1", stroke: "#6b747d" }, g);
      el("rect", { x: cx - 26, y: cy - 16, width: 52, height: 32, fill: "transparent" }, g);
      g.addEventListener("click", onClick);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } });
      return g;
    }
    function draw() {
      gDyn.innerHTML = ""; gTop.innerHTML = "";
      // power LED and switch
      el("circle", { cx: 240, cy: 172, r: 5, fill: S.power ? "#ff2d2d" : "#7a2a2a", class: S.power ? "tr-glow" : "" }, gDyn);
      var pw = el("g", { class: "tr-click", role: "switch", tabindex: 0, "aria-checked": S.power ? "true" : "false", "aria-label": "مفتاح التشغيل" }, gDyn);
      el("rect", { x: 74, y: 262, width: 44, height: 46, rx: 4, fill: "#141516" }, pw);
      el("rect", { x: 80, y: S.power ? 268 : 280, width: 32, height: 22, rx: 3, fill: S.power ? "#ff3b2f" : "#6e1b17" }, pw);
      pw.addEventListener("click", function () { S.power = S.power ? 0 : 1; save(); update(); });
      // switches
      SW.forEach(function (s, i) { drawSwitch(268, 190 + i * 44, S.sw[s], "المفتاح " + s, function () { S.sw[s] = S.sw[s] ? 0 : 1; save(); update(); }); });
      drawSwitch(425, 834, S.sw.i, "مفتاح H/L السفلي", function () { S.sw.i = S.sw.i ? 0 : 1; save(); update(); });
      drawSwitch(118, 860, S.bnc, "مفتاح التلامس", function () { S.bnc = S.bnc ? 0 : 1; save(); update(); });
      drawSwitch(925, 648, S.dez, "Dez / Hex", function () { S.dez = S.dez ? 0 : 1; save(); update(); });
      // pulse button: high while pressed
      var pb = el("g", { class: "tr-click", role: "button", tabindex: 0, "aria-label": "زر النبضة" }, gDyn);
      el("circle", { cx: 128, cy: 805, r: 13, fill: R.pulse ? "#c8c2a8" : "#efe9cf", stroke: "#7d775f", "stroke-width": 2 }, pb);
      el("circle", { cx: 128, cy: 805, r: 22, fill: "transparent" }, pb);
      function press(v) { if (R.pulse === v) return; R.pulse = v; update(); }
      pb.addEventListener("pointerdown", function (e) { e.preventDefault(); press(1); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { pb.addEventListener(ev, function () { press(0); }); });
      pb.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(1); setTimeout(function () { press(0); }, 180); } });
      // knobs
      function knob(cx, cy, ang, label, onClick) {
        var g = el("g", { class: "tr-click", role: "button", tabindex: 0, "aria-label": label }, gDyn);
        el("circle", { cx: cx, cy: cy, r: 20, fill: "#1a1a1a" }, g); el("circle", { cx: cx, cy: cy, r: 15, fill: "#2b2b2b" }, g);
        var a = ang * Math.PI / 180; el("line", { x1: cx, y1: cy, x2: cx + 14 * Math.sin(a), y2: cy - 14 * Math.cos(a), stroke: "#fff", "stroke-width": 2.5 }, g);
        g.addEventListener("click", onClick); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } });
      }
      knob(135, 498, -130 + S.clk * 65, "سرعة المولّد G", function () { S.clk = (S.clk + 1) % CLOCKS.length; save(); setClock(); update(); });
      txt(CLOCKS[S.clk] ? CLOCKS[S.clk] + " Hz" : "OFF", 135, 528, 10, gDyn, { fill: "#2f6bd8", "font-weight": "bold" });
      knob(372, 712, -40 + S.mono * 45, "زمن المونوستابل", function () { S.mono = (S.mono + 1) % MONO.length; save(); update(); });
      txt(MONO[S.mono] + " s", 372, 748, 10, gDyn, { fill: "#2f6bd8", "font-weight": "bold" });
      // LEDs
      SW.forEach(function (s, i) { var y = 185 + i * 44.5, v = netVal("LED" + s) === 1 && S.power; el("circle", { cx: 1158, cy: y, r: 7, fill: v ? "#ff3326" : "#5b2320", class: v ? "tr-glow" : "" }, gDyn); });
      // display
      [0, 1, 2, 3].forEach(function (d) {
        var n = 0; [1, 2, 4, 8].forEach(function (b) { if (netVal("DSP" + d + "B" + b) === 1) n += b; });
        var ch = !S.power ? "" : S.dez && n > 9 ? "" : n.toString(16).toUpperCase();
        txt(S.power ? ch : "", 968 + d * 52, 653, 44, gDyn, { fill: "#ff2a1f", "font-family": "'Courier New', monospace", "font-weight": "bold", class: "tr-glow" });
      });
      // chips
      Object.keys(S.chips).forEach(function (sn) {
        var s = sockOf(sn), id = S.chips[sn], c = CV.chips.get(id); if (!c) return;
        var half = c.pins / 2, top = s.top - 12, h = (half - 1) * s.pitch + 24, w = 40, x = s.x + s.w / 2 - w / 2;
        var g = el("g", { class: "tr-click tr-chip", role: "button", tabindex: 0, "aria-label": id + " في المقبس " + sn }, gDyn);
        el("rect", { x: x, y: top, width: w, height: h, rx: 3, fill: "#1e1f22", stroke: R.powered && R.powered[sn] ? "#3fb27f" : "#555" }, g);
        el("path", { d: "M" + (x + w / 2 - 7) + " " + top + " a7 7 0 0 0 14 0", fill: "#3a3b3f" }, g);
        var t = txt("74LS" + id.slice(2), x + w / 2, top + h / 2, 11, g, { fill: "#e9e9e9", transform: "rotate(90 " + (x + w / 2) + " " + (top + h / 2) + ")" });
        g.addEventListener("click", function () { pickChip(+sn); });
        if (showLabels) for (var p = 1; p <= c.pins; p++) {
          var sp = p <= half ? p : p + (s.pins - c.pins), left = sp <= s.pins / 2, row = left ? sp - 1 : s.pins - sp, yy = s.top + row * s.pitch;
          txt(c.labels[p], left ? s.x + 56 : s.x + s.w - 56, yy, 8.5, gTop, { fill: "#0d47a1", "font-weight": "bold", "text-anchor": left ? "start" : "end", class: "tr-lbl" });
        }
      });
      // holes
      L.holes.forEach(function (h) {
        var v = holeVal(h.id), sel = R.sel === h.id;
        el("circle", { cx: h.x, cy: h.y, r: 4.6, fill: sel ? "#2f7bff" : "#1d2026", stroke: sel ? "#9cc3ff" : "none", "stroke-width": 3 }, gDyn);
        if (R.sel && sel) el("circle", { cx: h.x, cy: h.y, r: 11, fill: "none", stroke: "#2f7bff", "stroke-width": 2 }, gTop);
        var hit = el("circle", { cx: h.x, cy: h.y, r: 10, fill: "transparent", class: "tr-hole", "data-h": h.id }, gTop);
        hit.addEventListener("click", function (e) { e.stopPropagation(); tapHole(h.id); });
      });
      drawWires();
      showInfo();
      var list = R.issues.map(function (x) { return '<li class="' + x.sev + '">' + esc(x.t) + '</li>'; }).join("");
      issuesEl.innerHTML = list; issuesEl.hidden = !list;
      if (CV.bi) R.issues.forEach(function (x) { var o = {}; o[x.t] = x.en; CV.bi.add(o); });
    }
    function drawWires() {
      gWires.innerHTML = "";
      S.wires.forEach(function (w, i) {
        var a = L.byId[w.a], b = L.byId[w.b]; if (!a || !b) return;
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), sag = Math.min(90, 18 + d * 0.22);
        var p = "M" + a.x + " " + a.y + " C" + (a.x + dx * 0.25) + " " + (a.y + dy * 0.25 + sag) + " " + (b.x - dx * 0.25) + " " + (b.y - dy * 0.25 + sag) + " " + b.x + " " + b.y;
        var col = WIRE_COLORS[w.c % WIRE_COLORS.length], sel = R.wsel === i;
        if (sel) el("path", { d: p, fill: "none", stroke: "#2f7bff", "stroke-width": 9, opacity: 0.5 }, gWires);
        el("path", { d: p, fill: "none", stroke: col, "stroke-width": 3.6, "stroke-linecap": "round", opacity: 0.92 }, gWires);
        [a, b].forEach(function (h) { el("rect", { x: h.x - 6, y: h.y - 6, width: 12, height: 12, rx: 2, fill: col, stroke: "#00000055" }, gWires); });
        var hit = el("path", { d: p, fill: "none", stroke: "transparent", "stroke-width": 14, class: "tr-wire" }, gWires);
        hit.addEventListener("click", function (e) { e.stopPropagation(); R.wsel = R.wsel === i ? null : i; R.sel = null; update(); });
      });
      bar.querySelector('[data-act="delwire"]').disabled = R.wsel === null;
    }
    function lvl(v) { return v === 1 ? "H (1)" : v === 0 ? "L (0)" : "عائم"; }
    function lvlEn(v) { return v === 1 ? "H (1)" : v === 0 ? "L (0)" : "floating"; }
    function holeName(id) {
      var h = L.byId[id], m = /^S(\d+)P(\d+)$/.exec(h.g);
      if (m) {
        var sn = +m[1], sp = +m[2], id2 = S.chips[sn], c = id2 && CV.chips.get(id2), s = sockOf(sn), cp = null;
        if (c) { var half = c.pins / 2; if (sp <= half) cp = sp; else if (sp > s.pins - half) cp = sp - (s.pins - c.pins); }
        var ar = "المقبس " + sn + " · الرجل " + sp, en = "socket " + sn + " · pin " + sp;
        if (c && cp) { ar += " ← " + id2 + " رجل " + cp + ": " + c.labels[cp]; en += " → " + id2 + " pin " + cp + ": " + c.labels[cp]; }
        else if (c) { ar += " (لا توجد رجل للـ IC هنا)"; en += " (no IC pin here)"; }
        return [ar, en];
      }
      return h.info || [h.g, h.g];
    }
    function showInfo() {
      var t, en;
      if (R.sel) { var n = holeName(R.sel), v = holeVal(R.sel); t = n[0] + " · المستوى: " + lvl(v) + " — اضغط فتحة ثانية لتوصيل سلك."; en = n[1] + " · level: " + lvlEn(v) + " — tap a second hole to connect a wire."; }
      else if (R.wsel !== null) { var w = S.wires[R.wsel], a = holeName(w.a), b = holeName(w.b); t = "سلك من " + a[0] + " إلى " + b[0] + ". اضغط «احذف السلك» لإزالته."; en = "Wire from " + a[1] + " to " + b[1] + ". Press “Remove wire” to delete it."; }
      else { t = "اضغط أي فتحة لترى اسمها ومستواها، ثم فتحة ثانية لتوصيل سلك."; en = "Tap any hole to see its name and level, then a second hole to connect a wire."; }
      info.textContent = t; if (CV.bi) { var o = {}; o[t] = en; CV.bi.add(o); }
    }
    function tapHole(id) {
      R.wsel = null;
      if (!R.sel) { R.sel = id; draw(); return; }
      if (R.sel === id) { R.sel = null; draw(); return; }
      var a = R.sel; R.sel = null;
      if (!S.wires.some(function (w) { return (w.a === a && w.b === id) || (w.a === id && w.b === a); })) S.wires.push({ a: a, b: id, c: S.wires.length });
      save(); update();
    }
    function pickChip(sn) {
      var s = sockOf(sn), cur = S.chips[sn];
      var old = host.querySelector(".tr-pick"); if (old) old.remove();
      var box = document.createElement("div"); box.className = "tr-pick card";
      var fits = Object.keys(CV.chips.all).filter(function (k) { return CV.chips.all[k].pins <= s.pins; });
      box.innerHTML = '<div class="tr-pick-h"><b>المقبس ' + sn + ' (' + s.pins + ' رجل)</b><button type="button" class="btn btn-ghost btn-sm" data-x>إغلاق</button></div>' +
        (cur ? '<p class="muted">مركّب الآن: <b class="ltr">' + cur + '</b> — ' + CV.chips.get(cur).ar + '</p><div class="tr-pin">' + pinout(cur) + '</div><button type="button" class="btn btn-ghost btn-sm" data-rm>انزع الـ IC</button>' : '<p class="muted">اختر الـ IC الذي تركّبه:</p>') +
        '<div class="tr-pick-l">' + fits.map(function (k) { return '<button type="button" class="btn btn-ghost btn-sm' + (k === cur ? ' on' : '') + '" data-c="' + k + '"><b class="ltr">' + k + '</b> <span>' + CV.chips.get(k).ar + '</span></button>'; }).join("") + '</div>' +
        (s.pins > 16 ? '<p class="muted small">في المقبس الكبير يُركّب الـ IC من الأعلى: أرجله اليسار هي أرجل المقبس نفسها، وأرجله اليمين تقابل أرقامًا أكبر في المقبس. فعّل «أسماء الأرجل» لتراها.</p>' : "");
      host.appendChild(box);
      box.querySelector("[data-x]").addEventListener("click", function () { box.remove(); });
      var rm = box.querySelector("[data-rm]"); if (rm) rm.addEventListener("click", function () { delete S.chips[sn]; delete R.ff[sn]; box.remove(); save(); update(); });
      box.querySelectorAll("[data-c]").forEach(function (b) { b.addEventListener("click", function () { S.chips[sn] = b.dataset.c; R.ff[sn] = CV.chips.newState(b.dataset.c); box.remove(); save(); update(); }); });
      box.scrollIntoView({ block: "nearest" });
    }
    function pinout(id) {
      var c = CV.chips.get(id), half = c.pins / 2, rows = "";
      for (var i = 1; i <= half; i++) rows += '<tr><td>' + i + '</td><td>' + c.labels[i] + '</td><td class="ic"></td><td>' + c.labels[c.pins + 1 - i] + '</td><td>' + (c.pins + 1 - i) + '</td></tr>';
      return '<table class="ltr"><tbody>' + rows + '</tbody></table>';
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function update() { solve(); draw(); }
    svg.addEventListener("click", function () { if (R.sel || R.wsel !== null) { R.sel = null; R.wsel = null; draw(); drawWires(); } });

    drawBoard(); setClock(); update();
    try { if (matchMedia("(pointer: coarse)").matches) { zoom = 1.6; svg.style.width = "160%"; } } catch (e) {} // bigger holes for fingers

    /* ---------- for the experiments: set inputs, read outputs, check a wiring ---------- */
    var api = {
      state: S, runtime: R,
      update: update, solve: solve,
      setSwitch: function (s, v) { S.sw[s] = v ? 1 : 0; },
      pulse: function (v) { R.pulse = v ? 1 : 0; },
      led: function (s) { return S.power && netVal("LED" + s) === 1 ? 1 : 0; },
      ledRaw: function (s) { return netVal("LED" + s); },
      level: holeVal,
      chips: function () { return Object.assign({}, S.chips); },
      issues: function () { return R.issues.slice(); },
      /* switches and LEDs that have at least one wire on them (for checking a build wired to other switches/LEDs) */
      used: function () {
        var sw = {}, led = {};
        S.wires.forEach(function (w) { [w.a, w.b].forEach(function (id) { var h = L.byId[id]; if (!h) return; var m = /^(SW|LED)([a-h])$/.exec(h.g); if (m) (m[1] === "SW" ? sw : led)[m[2]] = 1; }); });
        return { sw: SW.filter(function (s) { return sw[s]; }), led: SW.filter(function (s) { return led[s]; }) };
      },
      placeChip: function (sn, id) { if (id) { S.chips[sn] = id; R.ff[sn] = CV.chips.newState(id); } else { delete S.chips[sn]; delete R.ff[sn]; } save(); update(); },
      addWire: function (a, b) { S.wires.push({ a: a, b: b, c: S.wires.length }); },
      reset: function () { S.wires = []; S.chips = {}; R.ff = {}; Object.keys(S.sw).forEach(function (k) { S.sw[k] = 0; }); save(); update(); },
      /* run a truth table on the board: inputs = switch letters, outputs = LED letters, fn(bits) → expected bits */
      table: function (inputs, outputs, fn) {
        var keep = Object.assign({}, S.sw), rows = [], n = inputs.length;
        for (var m = 0; m < (1 << n); m++) {
          var bits = inputs.map(function (_, i) { return (m >> (n - 1 - i)) & 1; });
          inputs.forEach(function (s, i) { S.sw[s] = bits[i]; });
          solve();
          var got = outputs.map(function (o) { return typeof o === "string" ? netVal("LED" + o) : holeVal(o.hole); }), want = fn(bits);
          rows.push({ in: bits, got: got, want: want, ok: want.every(function (w, i) { return w === null || w === got[i]; }) });
        }
        S.sw = Object.assign(S.sw, keep); update();
        return rows;
      },
      /* step a sequence: steps = [{ sw: {a:1}, pulse: 'rise'|'fall'|1|0 }], read LEDs after each */
      sequence: function (steps, outputs) {
        var keep = Object.assign({}, S.sw), out = [];
        steps.forEach(function (st) {
          Object.keys(st.sw || {}).forEach(function (k) { S.sw[k] = st.sw[k]; });
          if (st.pulse !== undefined) R.pulse = st.pulse ? 1 : 0;
          solve();
          out.push(outputs.map(function (o) { return typeof o === "string" ? netVal("LED" + o) : holeVal(o.hole); }));
        });
        R.pulse = 0; S.sw = Object.assign(S.sw, keep); update();
        return out;
      },
      destroy: function () { clearInterval(timer); clearTimeout(R.monoTimer); host.innerHTML = ""; }
    };
    return api;
  }
  CV.trainer = { mount: mount, layout: layout };
})(typeof window !== "undefined" ? window : globalThis);
