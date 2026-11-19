/* CircuitVision — Circuits 1 lab bench (v2), drawn after the photos of the university bench:
   Leybold plug-in board 297×300 (3×3 socket fields, each field one node; component blocks and white bridging plugs sit between
   neighbouring fields), Leybold 521 535 dual supply 2×0–16 V / 2×0–5 A (MASTER / SLAVE, NORMAL · SERIES · PARALLEL),
   Fluke 115 and PeakTech multimeters, PINTEK FG-32 function generator, PeakTech 1240 two-channel oscilloscope,
   decade boxes (R, L, C), and for Lab 10 the mains panel with its power meter and the fluorescent lamp.
   Interaction (mouse and touch are the same): drag a part from the drawer onto the board, drag it again to move it, tap it to turn or
   remove it; drag from any socket or terminal to another one to run a lead; drag a knob (or tap it for big buttons);
   tap a position on a meter dial. Two fingers (or the wheel) zoom, dragging the desk pans.
   The electrical behaviour is in clab-sim.js. CV.clabBench.mount(el, { key, inst, kit }) → api. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {}, S = CV.clabSim;
  var COLS = 9, ROWS = 6, PT = 82, BX = 420, BY = 282, BW = 770, BH = 650, HO = 21;
  var LANES = [["", 0], [":a", -HO], [":b", HO]];
  var SOCK = [[-HO, -HO], [0, -HO], [HO, -HO], [-HO, 0], [0, 0], [HO, 0], [-HO, HO], [0, HO], [HO, HO]];
  function tc(r, c) { return [BX + 57 + c * PT, BY + 62 + r * PT]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function r2(x) { return Math.round(x * 100) / 100; }
  var si = S.si;
  var VDIV = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10], TDIV = [1e-6, 2e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2];
  var DIAL = {
    d1: [["off", "OFF"], ["vac", "V~"], ["vdc", "V⎓"], ["mv", "mV⎓"], ["ohm", "Ω"], ["aac", "A~"], ["adc", "A⎓"]],
    d2: [["off", "OFF"], ["vdc", "V⎓"], ["vac", "V~"], ["ohm", "Ω"], ["madc", "mA⎓"], ["maac", "mA~"], ["adc", "10A⎓"], ["aac", "10A~"]]
  };
  var DIAL_AR = { off: "إيقاف", vac: "جهد متردد (RMS)", vdc: "جهد مستمر", mv: "جهد مستمر صغير (mV)", ohm: "مقاومة", aac: "تيار متردد (A)", adc: "تيار مستمر (A)", madc: "تيار مستمر (mA)", maac: "تيار متردد (mA)" };
  var UNIT = { vac: "V~", vdc: "V⎓", mv: "mV⎓", ohm: "Ω", aac: "A~", adc: "A⎓", madc: "mA⎓", maac: "mA~" };
  var DNAME = { d1: "Fluke 115", d2: "PeakTech" };

  /* seven-segment digits: the supply, the generator and the meters all use them */
  var SEG = { "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", "L": "def", "O": "abcdef", " ": "" };
  function seg7(str, x, y, h, on, off) {   // right-aligned at x, top at y; "." belongs to the digit before it
    var w = h * 0.5, gap = h * 0.2, t = h * 0.11, out = "", chars = [], i;
    for (i = 0; i < str.length; i++) { if (str[i] === "." && chars.length) chars[chars.length - 1].dot = 1; else chars.push({ c: str[i] }); }
    var x0 = x - chars.length * (w + gap) + gap;
    chars.forEach(function (ch, k) {
      var X = x0 + k * (w + gap), s = SEG[ch.c] === undefined ? "g" : SEG[ch.c], H = h / 2;
      var P = { a: [X + t, y, w - 2 * t, t], d: [X + t, y + h - t, w - 2 * t, t], g: [X + t, y + H - t / 2, w - 2 * t, t], f: [X, y + t, t, H - 1.5 * t], b: [X + w - t, y + t, t, H - 1.5 * t], e: [X, y + H + t / 2, t, H - 1.5 * t], c: [X + w - t, y + H + t / 2, t, H - 1.5 * t] };
      "abcdefg".split("").forEach(function (n) { var q = P[n], lit = s.indexOf(n) > -1; if (!lit && !off) return; out += '<rect x="' + r2(q[0]) + '" y="' + r2(q[1]) + '" width="' + r2(q[2]) + '" height="' + r2(q[3]) + '" rx="' + r2(t / 2) + '" fill="' + (lit ? on : off) + '"/>'; });
      if (ch.dot) out += '<circle cx="' + r2(X + w + gap * 0.45) + '" cy="' + r2(y + h - t / 2) + '" r="' + r2(t * 0.62) + '" fill="' + on + '"/>';
    });
    return out;
  }

  function mount(host, opts) {
    opts = opts || {};
    var inst = opts.inst || ["ps", "d1", "d2", "rb"], KEY = "cv-clab2-" + (opts.key || "free");
    var kit = (opts.kit || []).slice(), MAINS = inst.indexOf("mn") > -1, H = MAINS ? 560 : 950;
    var TCOLS = 4, TROWS = Math.max(4, Math.ceil((kit.length + 1) / TCOLS)), TRAY_H = Math.max(278, 50 + TROWS * 62);
    if (!MAINS) {
      var top3 = ["fg", "ps", "sc"].some(function (k) { return inst.indexOf(k) > -1; });
      var rightN = ["rb", "lb", "cb", "va", "cc"].filter(function (k) { return inst.indexOf(k) > -1; }).length +
        (top3 ? ["tp", "wm"].filter(function (k) { return inst.indexOf(k) > -1; }).length + (inst.indexOf("pm") > -1 ? 236 / 214 : 0) : 0);
      var rhN = ["r1", "r2", "r3"].filter(function (k) { return inst.indexOf(k) > -1; }).length;
      H = Math.max(H, 282 + rightN * 214 + rhN * 164 + 10, 654 + TRAY_H + 16);
    }
    var W = MAINS || ["rb", "lb", "cb", "sc", "va", "cc", "tp", "wm", "pm", "r1"].some(function (k) { return inst.indexOf(k) > -1; }) ? 1600 : 1206;
    var marks = [], state = load() || fresh(), sel = null, undo = [], P = {}, SLOT = {}, R = null, drag = null, hold = {};
    var vb = { x: 0, y: 0, w: W, h: H };
    function fresh() { return { parts: {}, leads: [], inst: S.defaults() }; }
    function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.inst) { var d = S.defaults(); Object.keys(d).forEach(function (k) { if (!s.inst[k]) s.inst[k] = d[k]; }); return s; } } catch (e) {} return null; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
    function has(k) { return inst.indexOf(k) > -1; }
    var I = state.inst;

    host.innerHTML = '<div class="wb"><div class="wb-bar"><span class="wb-hint"></span><span class="wb-acts">' +
      '<button type="button" class="wb-b" data-a="undo" disabled>تراجع</button><button type="button" class="wb-b" data-a="thin" aria-pressed="false" title="الأسلاك تصير شفافة ولا تنمسك، عشان تحط القطع وتحركها تحتها براحتك">أسلاك شفافة</button><button type="button" class="wb-b" data-a="leads">افصل الأسلاك</button><button type="button" class="wb-b" data-a="clear">فضّ الطاولة</button>' +
      '<span class="wb-zoom no-bi"><button type="button" class="wb-b" data-a="zo" aria-label="تصغير">−</button><button type="button" class="wb-b" data-a="fit" aria-label="كامل الطاولة">⤢</button><button type="button" class="wb-b" data-a="zi" aria-label="تكبير">＋</button></span>' +
      '<button type="button" class="wb-b wb-full" data-a="full">ملء الشاشة</button></span></div>' +
      '<div class="wb-stage"><svg class="wb-svg" viewBox="0 0 ' + W + ' ' + H + '" role="application" aria-label="طاولة معمل الدوائر"></svg><div class="wb-tool" hidden></div><div class="wb-pop" hidden></div><div class="wb-toast" hidden></div></div>' +
      '<ul class="wb-warn" aria-live="polite"></ul><p class="wb-rot">للمساحة الأكبر اقلب الجهاز بالعرض</p></div>';
    var wrap0 = host.querySelector(".wb"); try { if (localStorage.getItem(KEY + ".thin")) { wrap0.classList.add("wb-thin"); var tb = wrap0.querySelector('[data-a="thin"]'); tb.setAttribute("aria-pressed", "true"); tb.classList.add("on"); } } catch (e) {}
    var wrap = host.querySelector(".wb"), svg = host.querySelector(".wb-svg"), stage = host.querySelector(".wb-stage"), pop = host.querySelector(".wb-pop"), tool = host.querySelector(".wb-tool"), toastEl = host.querySelector(".wb-toast"), hint = host.querySelector(".wb-hint");
    hint.textContent = MAINS ? "اسحب من مقبس إلى مقبس لتوصيل سلك · اضغط أي مفتاح أو مقبض لضبطه" : "اسحب القطعة من الدرج إلى اللوحة · اسحب من فتحة إلى فتحة لتوصيل سلك · اضغط القطعة لتدويرها أو حذفها";

    /* ---------- drawing helpers ---------- */
    var out = [];
    function o(s) { out.push(s); }
    function rect(x, y, w, h, cls, rx, extra) { o('<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '"' + (extra || "") + '/>'); }
    function text(t, x, y, cls, anchor, extra) { o('<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '"' + (extra || "") + '>' + esc(t) + '</text>'); }
    function jack(id, x, y, color, label, ly) {
      P[id] = [x, y];
      o('<g class="wb-pt" data-p="' + id + '"><circle class="wb-jk wb-' + color + '" cx="' + x + '" cy="' + y + '" r="12"/><circle class="wb-jr" cx="' + x + '" cy="' + y + '" r="8.5"/><circle class="wb-jh" cx="' + x + '" cy="' + y + '" r="4.6"/><circle class="wb-hit" cx="' + x + '" cy="' + y + '" r="20"/></g>');
      if (label) text(label, x, y + (ly || 29), "wb-lbl");
    }
    function knob(ctl, x, y, r, label, val, cls, ang) {
      var a = (ang === undefined ? 0 : ang) * Math.PI / 180, lx = x + Math.sin(a) * (r - 4), ly = y - Math.cos(a) * (r - 4), mx = x + Math.sin(a) * (r * 0.45), my = y - Math.cos(a) * (r * 0.45);
      o('<g class="wb-ctl" data-c="' + ctl + '" data-drag="1"><circle class="wb-knob-sh" cx="' + x + '" cy="' + (y + 3) + '" r="' + (r + 1) + '"/><circle class="wb-knob ' + (cls || "") + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/><circle class="wb-knob-top" cx="' + x + '" cy="' + y + '" r="' + r2(r * 0.72) + '"/><line class="wb-knob-l" x1="' + r2(mx) + '" y1="' + r2(my) + '" x2="' + r2(lx) + '" y2="' + r2(ly) + '"/><circle class="wb-hit" cx="' + x + '" cy="' + y + '" r="' + (r + 10) + '"/></g>');
      if (label) text(label, x, y - r - 7, "wb-lbl");
      if (val !== undefined) text(val, x, y + r + 16, "wb-val");
    }
    function button(ctl, x, y, w, h, label, cls) {
      o('<g class="wb-ctl" data-c="' + ctl + '"><rect class="wb-btn ' + (cls || "") + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + Math.min(6, h / 2) + '"/>' + (label ? '<text class="wb-btn-t" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 4) + '" text-anchor="middle">' + esc(label) + '</text>' : "") + '<rect class="wb-hit" x="' + (x - 5) + '" y="' + (y - 7) + '" width="' + (w + 10) + '" height="' + (h + 14) + '"/></g>');
    }
    function led(x, y, on, color) { o('<circle class="wb-led' + (on ? " on " + color : "") + '" cx="' + x + '" cy="' + y + '" r="4"/>'); }

    /* ---------- the plug-in board ---------- */
    function slotGeom(id) {
      var m = /^([hv]):(\d+):(\d+)(:[ab])?$/.exec(id); if (!m) return null;
      var r = +m[2], c = +m[3], a = tc(r, c), off = m[4] === ":a" ? -HO : m[4] === ":b" ? HO : 0, hz = m[1] === "h";
      return { x: hz ? a[0] + PT / 2 : a[0] + off, y: hz ? a[1] + off : a[1] + PT / 2, h: hz, r: r, c: c, lane: m[4] || "" };
    }
    function allSlots() {
      if (Object.keys(SLOT).length) return SLOT;
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) LANES.forEach(function (ln) {
        if (c < COLS - 1) SLOT["h:" + r + ":" + c + ln[0]] = slotGeom("h:" + r + ":" + c + ln[0]);
        if (r < ROWS - 1) SLOT["v:" + r + ":" + c + ln[0]] = slotGeom("v:" + r + ":" + c + ln[0]);
      });
      return SLOT;
    }
    function partSvg(pc, g, cls, id) {   // a block seen from above, centred on (g.x, g.y); lying along x when g.h
      var s = '<g class="wb-part ' + (cls || "") + '"' + (id ? ' data-s="' + id + '"' : "") + ' transform="translate(' + r2(g.x) + ' ' + r2(g.y) + ')' + (g.h ? "" : " rotate(90)") + '">';
      s += '<rect class="wb-hit" x="-30" y="-14" width="60" height="28"/>';
      s += '<circle class="wb-pin" cx="-20" cy="0" r="5.2"/><circle class="wb-pin" cx="20" cy="0" r="5.2"/>';
      if (pc.t === "W") {
        s += '<rect class="wb-brg-sh" x="-27" y="-6" width="54" height="15" rx="3"/><rect class="wb-brg" x="-27" y="-9" width="54" height="15" rx="3"/><line class="wb-brg-l" x1="-19" y1="-1.5" x2="19" y2="-1.5"/>';
      } else {
        s += '<rect class="wb-blk-sh" x="-29" y="-10" width="58" height="26" rx="3"/><rect class="wb-blk" x="-29" y="-14" width="58" height="27" rx="3"/><rect class="wb-plate" x="-25" y="-11.5" width="50" height="21" rx="1.5"/>';
        if (pc.bands) { s += '<line class="wb-sym" x1="-21" y1="-1" x2="21" y2="-1"/><rect x="-13" y="-6" width="26" height="10" rx="4" fill="#d9c08a" stroke="#8a7446" stroke-width=".6"/>'; pc.bands.forEach(function (b, k) { s += '<rect x="' + (-9.5 + k * 5.2 + (k === pc.bands.length - 1 ? 2 : 0)) + '" y="-6" width="2.6" height="10" fill="' + b + '"/>'; }); }
        else if (pc.t === "R") s += '<line class="wb-sym" x1="-21" y1="-4" x2="-10" y2="-4"/><rect class="wb-sym" x="-10" y="-7.5" width="20" height="7"/><line class="wb-sym" x1="10" y1="-4" x2="21" y2="-4"/>';
        else if (pc.t === "L") s += '<path class="wb-sym" d="M-21 -3h7q2.5 -6 5 0q2.5 -6 5 0q2.5 -6 5 0q2.5 -6 5 0h8"/>';
        else if (pc.t === "C") s += '<path class="wb-sym" d="M-21 -4h18M3 -4h18M-3 -9v10M3 -9v10"/>';
        var lab = pc.name || (pc.t === "R" ? si(pc.v, "Ω") : pc.t === "L" ? si(pc.v, "H") : si(pc.v, "F"));
        s += '<text class="wb-pv" x="0" y="' + (pc.bands ? 7.8 : 7.2) + '" text-anchor="middle">' + esc(lab) + '</text>';
      }
      return s + "</g>";
    }
    function drawBoard() {
      rect(BX + 4, BY + 6, BW, BH, "wb-board-sh", 12); rect(BX, BY, BW, BH, "wb-board", 12);
      var r, c, k, t;
      for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {   // the printed lines that show which sockets are one node
        t = tc(r, c);
        o('<path class="wb-trace" d="M' + (t[0] - HO) + ' ' + (t[1] - HO) + 'h' + 2 * HO + 'v' + 2 * HO + 'h' + -2 * HO + 'zM' + t[0] + ' ' + (t[1] - HO) + 'v' + 2 * HO + 'M' + (t[0] - HO) + ' ' + t[1] + 'h' + 2 * HO + '"/>');
      }
      [0, 1].forEach(function (n) { var y = BY + BH - 92 + n * 44; o('<line class="wb-trace wb-rail-l" x1="' + (BX + 36) + '" y1="' + y + '" x2="' + (BX + BW - 36) + '" y2="' + y + '"/>'); });
      for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) { t = tc(r, c); for (k = 0; k < 9; k++) hole("t:" + r + ":" + c + ":" + k, t[0] + SOCK[k][0], t[1] + SOCK[k][1]); }
      [0, 1].forEach(function (n) { for (k = 0; k < 17; k++) hole("rail:" + n + ":" + k, BX + 36 + k * (BW - 72) / 16, BY + BH - 92 + n * 44); });
      text("RASTERSTECKPLATTE 297×300 · PLUG-IN BOARD", BX + BW - 22, BY + BH - 14, "wb-tiny", "end");
      o('<g transform="translate(' + (BX + 30) + ' ' + (BY + BH - 22) + ')"><circle r="9" fill="none" stroke="#4b4f55" stroke-width="1.6"/><text class="wb-tiny" y="3.4" text-anchor="middle" style="font-weight:700;font-size:9px">LD</text></g>');
      Object.keys(state.parts).forEach(function (id) { var g = slotGeom(id); if (g) o(partSvg(state.parts[id], g, sel && sel.k === "part" && sel.id === id ? "sel" : "", id)); });
    }
    function hole(id, x, y) { P[id] = [x, y]; o('<g class="wb-pt wb-hole" data-p="' + id + '"><circle class="wb-so" cx="' + x + '" cy="' + y + '" r="4.8"/><circle class="wb-so-in" cx="' + x + '" cy="' + y + '" r="2.6"/><circle class="wb-hit" cx="' + x + '" cy="' + y + '" r="10.5"/></g>'); }

    /* ---------- the drawer with the lab's component blocks ---------- */
    var TX = 16, TY = 654, TW = 388, TH = TRAY_H, TRAY = [];
    function drawTray() {
      rect(TX, TY, TW, TH, "wb-tray", 10); rect(TX + 8, TY + 30, TW - 16, TH - 38, "wb-tray-in", 6);
      text("PARTS · القطع", TX + TW / 2, TY + 21, "wb-lbl-d");
      TRAY = []; var used = {};   // the drawer never runs out: take as many copies of a part as the circuit needs
      var items = [{ t: "W", id: "W" }].concat(kit), cols = TCOLS, cw = (TW - 28) / cols;
      items.forEach(function (pc, k) {
        var x = TX + 14 + cw * (k % cols) + cw / 2, y = TY + 62 + Math.floor(k / cols) * 62, gone = pc.t !== "W" && used[pc.id];
        TRAY.push({ pc: pc, x: x, y: y, gone: gone });
        o('<g class="wb-tr' + (gone ? " gone" : "") + '" data-t="' + k + '"><rect class="wb-hit" x="' + (x - cw / 2 + 2) + '" y="' + (y - 28) + '" width="' + (cw - 4) + '" height="58"/>' + partSvg(pc, { x: x, y: y - 6, h: true }, "tray") + '</g>');
        text(pc.t === "W" ? "وصلة" : (pc.name ? pc.name : si(pc.v, pc.t === "R" ? "Ω" : pc.t === "L" ? "H" : "F")) + (pc.n ? " (" + pc.n + ")" : ""), x, y + 22, "wb-tr-t");
      });
    }

    /* ---------- Leybold 521 535 dual supply ---------- */
    function drawPS() {
      var x = 484, y = 16, w = 560, h = 246, ps = I.ps, mode = ps.mode || "normal", rd = R.ps;
      rect(x + 3, y + 5, w, h, "wb-sh", 8); rect(x, y, w, h, "wb-case", 8);
      text("LEYBOLD", x + 18, y + 19, "wb-brand", "start"); text("DC POWER SUPPLY 2×0–16 V / 2×0–5 A", x + w - 16, y + 19, "wb-tiny", "end"); text("521 535", x + w - 16, y + 9.5, "wb-tiny", "end");
      rect(x + 14, y + 26, w - 28, 66, "wb-disp", 4);
      var on = ps.on, par = mode === "parallel", ser = mode === "series";
      function shown(ch) {
        if (!on) return { v: par || (ser && ch === "s") ? ps.m.v : ps[ch].v, i: 0, cc: false };   // output off: the display shows the set voltage
        if (par) return { v: rd.m.v, i: Math.abs(rd.m.i) / 2, cc: ch === "s" ? true : rd.m.cc };
        return { v: rd[ch].v, i: Math.abs(rd[ch].i), cc: rd[ch].cc };
      }
      [["m", x + 22], ["s", x + 290]].forEach(function (q) {
        var s = shown(q[0]), X = q[1];
        o(seg7((s.i < 10 ? s.i.toFixed(2) : s.i.toFixed(1)), X + 104, y + 34, 38, "#3dff7a", "#12301c"));
        o(seg7(Math.max(0, s.v).toFixed(1).replace(/^(\d)\./, "0$1."), X + 232, y + 34, 38, "#3dff7a", "#12301c"));
        text("A", X + 116, y + 70, "wb-disp-t"); text("V", X + 244, y + 70, "wb-disp-t");
        text("CC", X + 58, y + 87, "wb-disp-s"); led(X + 40, y + 83.5, on && s.cc, "red"); text("CV", X + 190, y + 87, "wb-disp-s"); led(X + 172, y + 83.5, on && !s.cc, "green");
      });
      rect(x + 14, y + 100, 224, 92, "wb-panel", 6); rect(x + 322, y + 100, 224, 92, "wb-panel", 6);
      text("MASTER", x + 126, y + 186, "wb-pan-t"); text("SLAVE", x + 434, y + 186, "wb-pan-t");
      function ang(v, max) { return -140 + 280 * v / max; }
      knob("ps.m.i", x + 76, y + 146, 23, "A", undefined, "white", ang(ps.m.i, 5)); knob("ps.m.v", x + 178, y + 146, 23, "V", undefined, "white", ang(ps.m.v, 16));
      knob("ps.s.i", x + 384, y + 146, 23, "A", undefined, "white", ang(ser || par ? ps.m.i : ps.s.i, 5)); knob("ps.s.v", x + 486, y + 146, 23, "V", undefined, "white", ang(ser || par ? ps.m.v : ps.s.v, 16));
      [["NORMAL", "normal"], ["SERIES", "series"], ["PARALLEL", "parallel"]].forEach(function (m, k) { led(x + 252, y + 112 + k * 13, mode === m[1], "green"); text(m[0], x + 260, y + 115.5 + k * 13, "wb-tiny", "start"); });
      button("ps.sw1", x + 252, y + 152, 22, 22, "", "push" + (mode !== "normal" ? " in" : "")); button("ps.sw2", x + 286, y + 152, 22, 22, "", "push" + (par ? " in" : ""));
      text("SWITCH", x + 280, y + 188, "wb-tiny");
      button("ps.out", x + 22, y + 206, 26, 26, "", "push" + (on ? " in" : "")); led(x + 35, y + 200, on, "red"); text("OUTPUT", x + 35, y + 243, "wb-tiny");
      jack("ps.m-", x + 84, y + 216, "blue", "−", 26); jack("ps.m.e", x + 130, y + 216, "yellow", "⏚", 26); jack("ps.m+", x + 176, y + 216, "red", "+", 26);
      jack("ps.s-", x + 392, y + 216, "blue", "−", 26); jack("ps.s.e", x + 438, y + 216, "yellow", "⏚", 26); jack("ps.s+", x + 484, y + 216, "red", "+", 26);
    }

    /* ---------- PINTEK FG-32 function generator ---------- */
    function drawFG() {
      var x = 16, y = 16, w = 452, h = 246, fg = I.fg;
      rect(x + 3, y + 5, w, h, "wb-sh", 8); rect(x, y, w, h, "wb-fgcase", 8); rect(x + 8, y + 8, w - 16, h - 16, "wb-fgface", 5);
      text("PINTEK", x + 20, y + 30, "wb-pintek", "start"); text("FG-32  3 MHz FUNCTION GENERATOR", x + 84, y + 30, "wb-tiny", "start");
      rect(x + 20, y + 40, 150, 50, "wb-disp", 4);
      var f = fg.f, txt = !fg.on ? "" : f >= 1000 ? (f / 1000).toFixed(f >= 100000 ? 1 : f >= 10000 ? 2 : 3) : f.toFixed(f >= 100 ? 1 : 2);
      if (fg.on) { o(seg7(txt, x + 138, y + 48, 34, "#ff3b30", "#3a0d0b")); text(f >= 1000 ? "kHz" : "Hz", x + 154, y + 64, "wb-disp-r"); }
      button("fg.on", x + 22, y + 108, 34, 22, fg.on ? "I" : "O", "rocker" + (fg.on ? " in" : "")); text("POWER", x + 39, y + 144, "wb-tiny");
      text("RANGE (Hz)", x + 300, y + 52, "wb-tiny");
      [1, 10, 100, 1e3, 1e4, 1e5].forEach(function (d, k) { var act = f >= d && f < d * 10; button("fg.rng:" + d, x + 186 + k * 41, y + 58, 36, 20, d >= 1000 ? d / 1000 + "k" : "" + d, "key" + (act ? " in" : "")); });
      text("FUNCTION", x + 240, y + 100, "wb-tiny");
      var wv = fg.w || "sin"; button("fg.w:sin", x + 186, y + 106, 36, 20, "∿", "key" + (wv === "sin" ? " in" : "")); button("fg.w:tri", x + 227, y + 106, 36, 20, "⋀", "key soon"); button("fg.w:sq", x + 268, y + 106, 36, 20, "⊓", "key" + (wv === "sq" ? " in" : ""));
      knob("fg.f", x + 112, y + 186, 30, "FREQUENCY", undefined, "cream", -140 + 280 * (Math.log10(f / Math.pow(10, Math.floor(Math.log10(Math.max(f, 1)))))));
      knob("fg.off", x + 216, y + 190, 18, "OFFSET", (fg.off || 0).toFixed(1) + " V", "cream", (fg.off || 0) * 14);
      knob("fg.a", x + 300, y + 190, 18, "AMPL", fg.vpp.toFixed(1) + " Vpp", "cream", -140 + 280 * fg.vpp / 20);
      rect(x + 352, y + 150, 86, 80, "wb-fgout", 6); text("OUTPUT 50Ω", x + 395, y + 164, "wb-tiny");
      jack("fg.out", x + 374, y + 192, "red", "", 0); jack("fg.com", x + 416, y + 192, "black", "⏚", 28);
    }

    /* ---------- PeakTech 1240 oscilloscope ---------- */
    function drawScope() {
      var x = 1060, y = 16, w = 524, h = 246, sc = I.sc, sx = x + 16, sy = y + 16, sw = 300, sh = 190;
      rect(x + 3, y + 5, w, h, "wb-sh", 12); rect(x, y, w, h, "wb-sccase", 12);
      rect(sx - 4, sy - 4, sw + 8, sh + 28, "wb-scbez", 4); rect(sx, sy, sw, sh, "wb-scscr", 0);
      text("PeakTech® 1240", x + 20, y + h - 6, "wb-pt-brand", "start");
      o(scopeScreen(sx, sy, sw, sh));
      rect(x + 334, y + 12, 178, 222, "wb-scpan", 8);
      [["sc.meas", "Measure", sc.meas], ["sc.cur", "Cursor", sc.cur], ["sc.auto", "Autoset", false], ["sc.math", "Math", sc.math], ["sc.xy", "X-Y", sc.xy], ["sc.run", sc.stop ? "Run" : "Stop", sc.stop]].forEach(function (b, k) {
        button(b[0], x + 342 + (k % 3) * 56, y + 20 + Math.floor(k / 3) * 26, 50, 20, b[1], "sckey" + (b[2] ? " in" : ""));
      });
      [["c1", "CH1", "#e5372e"], ["c2", "CH2", "#d8b800"]].forEach(function (c, k) {
        var X = x + 366 + k * 56, st = sc[c[0]];
        knob("sc." + c[0] + ".pos", X, y + 98, 11, "POSITION", undefined, "grey", (st.pos || 0) * 30);
        o('<g class="wb-ctl" data-c="sc.' + c[0] + '"><rect x="' + (X - 20) + '" y="' + (y + 118) + '" width="40" height="18" rx="4" fill="' + (st.on ? c[2] : "#9aa3ad") + '"/><text class="wb-btn-t" style="fill:#fff" x="' + X + '" y="' + (y + 131) + '" text-anchor="middle">' + c[1] + '</text><rect class="wb-hit" x="' + (X - 25) + '" y="' + (y + 112) + '" width="50" height="30"/></g>');
        knob("sc." + c[0] + ".vd", X, y + 166, 17, "", undefined, "grey", -140 + 280 * VDIV.indexOf(st.vd) / (VDIV.length - 1)); text("VOLTS/DIV", X, y + 196, "wb-tiny");
      });
      knob("sc.hpos", x + 478, y + 98, 11, "POSITION", undefined, "grey", (sc.hpos || 0) * 30);
      knob("sc.t", x + 478, y + 166, 17, "", undefined, "grey", -140 + 280 * TDIV.indexOf(sc.td) / (TDIV.length - 1)); text("SEC/DIV", x + 478, y + 196, "wb-tiny");
      jack("sc.1", x + 352, y + 216, "red", "", 0); jack("sc.1g", x + 382, y + 216, "black", "", 0); jack("sc.2", x + 422, y + 216, "red", "", 0); jack("sc.2g", x + 452, y + 216, "black", "", 0);
      text("CH1 · مجس + مشبك أسود", x + 367, y + 241, "wb-tiny"); text("CH2", x + 437, y + 241, "wb-tiny");
    }
    function scopeScreen(sx, sy, sw, sh) {
      var sc = I.sc, d = R.sc, s = "", NX = 12, NY = 8, dx = sw / NX, dy = sh / NY, i;
      for (i = 1; i < NX; i++) s += '<line class="wb-grid' + (i === NX / 2 ? " mid" : "") + '" x1="' + (sx + i * dx) + '" y1="' + sy + '" x2="' + (sx + i * dx) + '" y2="' + (sy + sh) + '"/>';
      for (i = 1; i < NY; i++) s += '<line class="wb-grid' + (i === NY / 2 ? " mid" : "") + '" x1="' + sx + '" y1="' + (sy + i * dy) + '" x2="' + (sx + sw) + '" y2="' + (sy + i * dy) + '"/>';
      if (!d) return s;
      var w = d.w, T = sc.td * NX, cols = { c1: "#ff453a", c2: "#ffd60a" }, cy = sy + sh / 2;
      /* trigger: CH1 (or CH2 when CH1 is flat) crosses its mean going up at the centre of the screen */
      var trg = S.mag(d.c1.ac) > 1e-6 && d.c1.on ? d.c1 : d.c2, ph0 = S.mag(trg.ac) > 1e-9 ? -Math.PI / 2 - S.ang(trg.ac) : 0;
      function val(ch, t) { if (ch.h) { var y = ch.dc; for (var k = 0; k < ch.h.length; k++) { var x = ch.h[k], n = 2 * k + 1, m = S.mag(x); if (m > 1e-9) y += m * Math.cos(n * (w * t + ph0) + S.ang(x)); } return y; } return ch.dc + (w ? S.mag(ch.ac) * Math.cos(w * t + S.ang(ch.ac) + ph0) : 0); }
      function trace(fn, col) {
        var pts = [], n = 240, k, t, yv;
        for (k = 0; k <= n; k++) { t = (k / n - 0.5 - (sc.hpos || 0) / NX) * T; yv = cy - fn(t); pts.push(r2(sx + k * sw / n) + "," + r2(clamp(yv, sy + 1, sy + sh - 1))); }
        return '<polyline class="wb-wave" stroke="' + col + '" points="' + pts.join(" ") + '"/>';
      }
      if (sc.xy) {
        var q = [], k2, t2;
        for (k2 = 0; k2 <= 200; k2++) { t2 = k2 / 200 * (w ? 2 * Math.PI / w : 1); q.push(r2(clamp(sx + sw / 2 + val(d.c1, t2) / d.c1.vd * dx, sx + 1, sx + sw - 1)) + "," + r2(clamp(cy - val(d.c2, t2) / d.c2.vd * dy, sy + 1, sy + sh - 1))); }
        s += '<polyline class="wb-wave" stroke="#30d158" points="' + q.join(" ") + '"/>';
      } else {
        ["c1", "c2"].forEach(function (c) {
          var ch = d[c]; if (!ch.on) return; var pos = (sc[c].pos || 0) * dy;
          s += '<path d="M' + sx + ' ' + r2(cy - pos) + 'l-7 -4v8z" fill="' + cols[c] + '"/>';
          s += trace(function (t) { return val(ch, t) / ch.vd * dy + pos; }, cols[c]);
        });
        if (sc.math && d.c1.on && d.c2.on) s += trace(function (t) { return (val(d.c1, t) + val(d.c2, t)) / d.c1.vd * dy; }, "#bf5af2");
      }
      if (sc.cur && !sc.xy) {
        var x1 = sx + sc.x1 * dx, x2 = sx + sc.x2 * dx, dt = Math.abs(sc.x2 - sc.x1) * sc.td;
        s += '<line class="wb-cur" x1="' + x1 + '" y1="' + sy + '" x2="' + x1 + '" y2="' + (sy + sh) + '"/><line class="wb-cur" x1="' + x2 + '" y1="' + sy + '" x2="' + x2 + '" y2="' + (sy + sh) + '"/>';
        s += '<rect x="' + (sx + 4) + '" y="' + (sy + sh - 44) + '" width="96" height="40" fill="#000" stroke="#5ac8fa" stroke-width=".8"/><text class="wb-sct" x="' + (sx + 9) + '" y="' + (sy + sh - 28) + '">△x:' + esc(si(dt, "s").replace(" ", "")) + '</text><text class="wb-sct" x="' + (sx + 9) + '" y="' + (sy + sh - 12) + '">1/△x:' + (dt > 0 ? esc(si(1 / dt, "Hz").replace(" ", "")) : "—") + '</text>';
      }
      if (sc.meas && !sc.xy) {
        var m = [];
        ["c1", "c2"].forEach(function (c, k) { var ch = d[c]; if (!ch.on) return; var a = S.mag(ch.ac); if (ch.h && w) { var mx = -1e9, mn = 1e9; for (var q = 0; q < 400; q++) { var yv = val(ch, q / 400 * 2 * Math.PI / w); mx = Math.max(mx, yv); mn = Math.min(mn, yv); } a = (mx - mn) / 2; } m.push("CH" + (k + 1) + " Vpp " + si(2 * a, "V").replace(" ", "") + "  Vavg " + si(ch.dc, "V").replace(" ", "")); });
        if (d.f) m.push("Freq " + si(d.f, "Hz").replace(" ", ""));
        m.forEach(function (t, k) { s += '<text class="wb-sct" x="' + (sx + sw - 6) + '" y="' + (sy + 14 + k * 13) + '" text-anchor="end">' + esc(t) + '</text>'; });
      }
      s += '<rect x="' + (sx + sw / 2 - 30) + '" y="' + (sy + 2) + '" width="60" height="5" rx="2.5" fill="none" stroke="#ffd60a" stroke-width=".8"/><rect x="' + (sx + 84) + '" y="' + (sy + 1) + '" width="34" height="11" rx="5" fill="' + (sc.stop ? "#ff453a" : "#30d158") + '"/><text class="wb-sct" style="fill:#000" x="' + (sx + 101) + '" y="' + (sy + 10) + '" text-anchor="middle">' + (sc.stop ? "Stop" : "Trig") + '</text>';
      var by = sy + sh + 4;
      ["c1", "c2"].forEach(function (c, k) { var st = sc[c]; s += '<text class="wb-sct" x="' + (sx + 4 + k * 86) + '" y="' + (by + 12) + '" fill="' + cols[c] + '" style="fill:' + (st.on ? cols[c] : "#667") + '">' + (k + 1) + ' ' + esc(si(st.vd, "V").replace(" ", "")) + (st.cp === "AC" ? "~" : st.cp === "GND" ? "⏚" : "⎓") + '</text>'; });
      s += '<text class="wb-sct" x="' + (sx + sw - 6) + '" y="' + (by + 12) + '" text-anchor="end">M:' + esc(si(sc.td, "s").replace(" ", "")) + '</text>';
      return s;
    }

    /* ---------- multimeters ---------- */
    function lcdText(d) {
      var rd = hold[d] || R[d]; if (!rd || rd.mode === "off") return "";
      return rd.text === undefined ? "" : rd.text;
    }
    function drawDMM(d, x, y) {
      var w = 190, h = 356, fl = d === "d1", st = I[d], rd = R[d], mode = st.mode, cx = x + w / 2, dy = fl ? y + 204 : y + 208, dial = DIAL[d];
      rect(x + 3, y + 5, w, h, "wb-sh", 22); rect(x, y, w, h, fl ? "wb-fluke" : "wb-peak", 22); rect(x + 11, y + 11, w - 22, h - 22, fl ? "wb-fluke-in" : "wb-peak-in", 14);
      if (fl) { rect(x + 24, y + 20, 46, 13, "wb-fl-logo", 2); text("FLUKE", x + 47, y + 30, "wb-fl-logo-t"); text("115  TRUE RMS MULTIMETER", x + 74, y + 30, "wb-tiny-l", "start"); }
      else { text("PeakTech®", x + 26, y + 31, "wb-pk-logo", "start"); text("DMM", x + w - 26, y + 31, "wb-tiny", "end"); }
      rect(x + 24, y + 38, w - 48, 62, "wb-lcd", 4);
      var t = lcdText(d);
      if (mode !== "off") {
        var k = /k$/.test(t) ? "k" : /M$/.test(t) ? "M" : "", body = t.replace(/[kM]$/, "");
        if (/^[-0-9. OL]+$/.test(body) && body) o(seg7(body, x + w - 60, y + 52, 32, "#1a2016", "")); else text(body, x + w - 66, y + 82, "wb-lcd-t", "end");
        text(k + (UNIT[mode] || "").replace(/[~⎓]/, ""), x + w - 30, y + 90, "wb-lcd-u", "end"); text(/ac$/.test(mode) ? "AC" : mode === "ohm" ? "" : "DC", x + w - 30, y + 54, "wb-lcd-s", "end");
        if (hold[d]) text("HOLD", x + 30, y + 52, "wb-lcd-s", "start");
        if (rd && rd.fuse) text("FUSE", x + 30, y + 94, "wb-lcd-s", "start");
        text("AUTO", x + 30, y + 94 - (rd && rd.fuse ? 12 : 0), "wb-lcd-s", "start");
      }
      if (fl) { button(d + ".hold", x + 26, y + 108, 34, 18, "HOLD", "flkey" + (hold[d] ? " in" : "")); button(d + ".soon:MIN MAX", x + 64, y + 108, 34, 18, "MINMAX", "flkey soon"); button(d + ".soon:RANGE", x + 102, y + 108, 34, 18, "RANGE", "flkey soon"); button(d + ".soon:Hz", x + 140, y + 108, 24, 18, "", "flkey yel soon"); }
      else { button(d + ".hold", x + 26, y + 108, 42, 18, "HOLD", "pkkey" + (hold[d] ? " in" : "")); button(d + ".soon:RANGE", x + 74, y + 108, 42, 18, "RANGE", "pkkey soon"); button(d + ".soon:REL", x + 122, y + 108, 42, 18, "REL", "pkkey soon"); }
      var n = dial.length, a0 = -150, a1 = 150, idx = 0;
      dial.forEach(function (m, k) {
        var a = (a0 + (a1 - a0) * k / (n - 1)) * Math.PI / 180, lx = cx + Math.sin(a) * 68, ly = dy - Math.cos(a) * 62;
        if (m[0] === mode) idx = k;
        o('<g class="wb-ctl" data-c="' + d + '.mode:' + m[0] + '"><circle class="wb-hit" cx="' + r2(lx) + '" cy="' + r2(ly) + '" r="17"/><text class="wb-dial-t' + (m[0] === mode ? " on" : "") + (m[0] === "off" ? " off" : "") + '" x="' + r2(lx) + '" y="' + r2(ly + 4) + '" text-anchor="middle">' + esc(m[1]) + '</text></g>');
      });
      var ar = a0 + (a1 - a0) * idx / (n - 1);
      o('<g class="wb-ctl" data-c="' + d + '.dial" data-drag="1"><circle class="wb-dial' + (fl ? "" : " pk") + '" cx="' + cx + '" cy="' + dy + '" r="42"/><g transform="rotate(' + r2(ar) + ' ' + cx + ' ' + dy + ')"><rect class="wb-dial-g' + (fl ? "" : " pk") + '" x="' + (cx - 11) + '" y="' + (dy - 42) + '" width="22" height="84" rx="10"/><line class="wb-dial-m" x1="' + cx + '" y1="' + (dy - 38) + '" x2="' + cx + '" y2="' + (dy - 22) + '"/></g></g>');
      var jy = y + h - 40;
      if (fl) { jack("d1.A", x + 44, jy, "red", "A", 25); jack("d1.COM", cx, jy, "black", "COM", 25); jack("d1.V", x + w - 44, jy, "red", "VΩ", 25); text("10 A FUSED", x + 44, jy - 20, "wb-tiny-l"); }
      else { jack("d2.10A", x + 32, jy, "red", "10A", 25); jack("d2.mA", x + 74, jy, "red", "mA", 25); jack("d2.COM", x + 116, jy, "black", "COM", 25); jack("d2.V", x + 158, jy, "red", "VΩ", 25); text("200 mA FUSED", x + 74, jy - 20, "wb-tiny"); }
    }

    /* ---------- decade boxes ---------- */
    function drawDecade(k, x, y, title, labels, value) {
      var w = 378, h = 200, d = I[k].d, n = d.length, pitch = Math.min(74, 290 / n);
      rect(x + 3, y + 5, w, h, "wb-sh", 10); rect(x, y, w, h, "wb-dec", 10); rect(x + 10, y + 10, w - 20, h - 20, "wb-dec-in", 6);
      text("PeakTech", x + 24, y + 34, "wb-pk-logo", "start"); text(title, x + 108, y + 34, "wb-dec-t", "start");
      d.forEach(function (v, i) {
        var X = x + 54 + i * pitch, Y = y + 104, j;
        for (j = 0; j < 10; j++) { var a = (j * 36 - 162) * Math.PI / 180; text("" + j, X + Math.sin(a) * 31, Y - Math.cos(a) * 31 + 3.5, "wb-dec-n" + (j === v ? " on" : "")); }
        knob(k + ".d:" + i, X, Y, 20, "", undefined, "white", v * 36 - 162); text(labels[i], X, Y + 52, "wb-dec-l");
      });
      text(value, x + 24, y + h - 16, "wb-dec-v", "start");
      jack(k + ".a", x + w - 44, y + 80, "red", "", 0); jack(k + ".b", x + w - 44, y + 136, "blue", "", 0);
    }

    function rbLabels(n) { return ["×10 kΩ", "×1 kΩ", "×100 Ω", "×10 Ω", "×1 Ω"].slice(5 - n); }
    /* ---------- Circuits 2: variac, coupled coils, three-phase supply, wattmeter ---------- */
    function box(x, y, title, sub) { var w = 378, h = 200; rect(x + 3, y + 5, w, h, "wb-sh", 10); rect(x, y, w, h, "wb-case", 10); text(title, x + 18, y + 26, "wb-lbl", "start"); if (sub) text(sub, x + w - 16, y + 26, "wb-tiny", "end"); }
    function drawVariac(x, y) {
      var va = I.va; box(x, y, "VARIAC · محول متغير", "0–30 V rms · 60 Hz");
      o('<circle cx="' + (x + 118) + '" cy="' + (y + 110) + '" r="58" fill="#f4f1e8" stroke="#8a8f98" stroke-width="2"/>');
      for (var k = 0; k <= 6; k++) { var a = (-140 + 280 * k / 6) * Math.PI / 180; text("" + k * 5, x + 118 + Math.sin(a) * 46, y + 114 - Math.cos(a) * 46, "wb-tiny"); }
      knob("va.v", x + 118, y + 110, 26, "", undefined, "grey", -140 + 280 * va.v / 30);
      text(va.v.toFixed(1) + " V", x + 118, y + 186, "wb-val");
      button("va.on", x + 214, y + 62, 46, 26, va.on ? "ON" : "OFF", "mnkey" + (va.on ? " in" : "")); led(x + 274, y + 75, va.on, "red");
      jack("va.L", x + 236, y + 146, "red", "L", 28); jack("va.N", x + 316, y + 146, "blue", "N", 28);
    }
    function drawCoils(x, y) {
      box(x, y, "COUPLED COILS · ملفان على قلب حديدي", "1000 / 500 TURNS");
      rect(x + 120, y + 52, 140, 112, "wb-core", 6); rect(x + 146, y + 76, 88, 64, "wb-core-in", 3);
      for (var k = 0; k < 6; k++) { o('<rect x="' + (x + 110) + '" y="' + (y + 64 + k * 15) + '" width="40" height="11" rx="5" fill="#b8672a" stroke="#7a3f12"/>'); o('<rect x="' + (x + 230) + '" y="' + (y + 72 + k * 13) + '" width="40" height="9" rx="4" fill="#b8672a" stroke="#7a3f12"/>'); }
      text("N1 = 1000", x + 130, y + 186, "wb-tiny"); text("N2 = 500", x + 250, y + 186, "wb-tiny");
      jack("cc.1", x + 52, y + 76, "red", "", 0); jack("cc.1'", x + 52, y + 146, "black", "", 0);
      text("1 ●", x + 26, y + 80, "wb-lbl"); text("1'", x + 26, y + 150, "wb-lbl");
      jack("cc.A", x + 326, y + 76, "red", "", 0); jack("cc.B", x + 326, y + 146, "black", "", 0);
      text("A", x + 352, y + 80, "wb-lbl"); text("B", x + 352, y + 150, "wb-lbl");
    }
    var LTR = ' direction="ltr" unicode-bidi="embed"';
    /* the LD three-phase extra-low-voltage transformer of the lab: two stars (6 V / 10 V and 23 V / 40 V) with one neutral */
    function drawTP(x, y) {
      var tp = I.tp, w = 378, h = 214;
      rect(x + 3, y + 5, w, h, "wb-sh", 10); rect(x, y, w, h, "wb-case", 10); rect(x + 12, y + 40, w - 24, h - 52, "wb-tp-pan", 6);
      text("3-PHASE TRANSFORMER · محول ثلاثي الطور", x + 16, y + 26, "wb-lbl", "start"); text("LD · 60 Hz", x + w - 14, y + 26, "wb-tiny", "end");
      o('<g class="wb-ctl" data-c="tp.on"><rect class="wb-rocker' + (tp.on ? " on" : "") + '" x="' + (x + 22) + '" y="' + (y + 50) + '" width="24" height="36" rx="4"/></g>');
      o('<path class="wb-tp-sym" d="M' + (x + 150) + ' ' + (y + 62) + 'h22M' + (x + 206) + ' ' + (y + 62) + 'h22M' + (x + 153) + ' ' + (y + 68) + 'l6 -12M' + (x + 159) + ' ' + (y + 68) + 'l6 -12M' + (x + 165) + ' ' + (y + 68) + 'l6 -12M' + (x + 209) + ' ' + (y + 68) + 'l6 -12M' + (x + 215) + ' ' + (y + 68) + 'l6 -12M' + (x + 221) + ' ' + (y + 68) + 'l6 -12"/><circle class="wb-tp-sym" cx="' + (x + 182) + '" cy="' + (y + 62) + '" r="11"/><circle class="wb-tp-sym" cx="' + (x + 196) + '" cy="' + (y + 62) + '" r="11"/>');
      text("Imax 4 A Y · 2.3 A Δ", x + 189, y + 92, "wb-tiny");
      function star(cx, cy, k, vl, vp) {
        var p2 = [cx, cy - 52], pn = [cx, cy], p1 = [cx - 50, cy + 36], p3 = [cx + 50, cy + 36], ln = function (a, b) { o('<line class="wb-tp-ln" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'); };
        ln(p1, p2); ln(p2, p3); ln(p3, p1); ln(pn, p1); ln(pn, p2); ln(pn, p3);
        text(vl, (p1[0] + p2[0]) / 2 - 18, (p1[1] + p2[1]) / 2, "wb-tiny", "middle", LTR); text(vl, (p1[0] + p3[0]) / 2, p1[1] + 14, "wb-tiny", "middle", LTR); text(vp, cx + 8, cy - 28, "wb-tiny", "start", LTR);
        jack("tp." + k[1], p2[0], p2[1], "black", "", 0); jack("tp." + k[3], pn[0], pn[1], "blue", "", 0); jack("tp." + k[0], p1[0], p1[1], "black", "", 0); jack("tp." + k[2], p3[0], p3[1], "black", "", 0);
        text("L2", p2[0] - 20, p2[1] + 4, "wb-tiny", "end"); text("N", pn[0] + 16, pn[1] + 18, "wb-tiny", "start"); text("L1", p1[0] - 16, p1[1] + 4, "wb-tiny", "end"); text("L3", p3[0] + 16, p3[1] + 4, "wb-tiny", "start");
      };
      o('<line class="wb-tp-ln" x1="' + (x + 96) + '" y1="' + (y + 150) + '" x2="' + (x + 282) + '" y2="' + (y + 150) + '"/>');
      star(x + 96, y + 150, ["a", "b", "c", "n"], "10 V", "6 V"); star(x + 282, y + 150, ["A", "B", "C", "N"], "40 V", "23 V");
    }
    /* the MFA-2001 power meter panel: L1 L2 L3 N in on the left, out on the right, a current transformer in each line */
    var PM_PG = ["L1", "L2", "L3", "Σ", "U", "I"];
    function drawPM(x, y) {
      var w = 400, h = 222, m = R.pm, pg = (I.pm && I.pm.pg) || 0;
      rect(x + 3, y + 5, w, h, "wb-sh", 10); rect(x, y, w, h, "wb-case", 10);
      text("POWER METER · لوحة قياس القدرة", x + 16, y + 22, "wb-lbl", "start"); text("CAT II · 400 V", x + w - 14, y + 22, "wb-tiny", "end");
      var ys = [y + 44, y + 68, y + 92, y + 118], nm = ["L1", "L2", "L3", "N"], id = ["1", "2", "3", "N"];
      ys.forEach(function (yy, k) {
        o('<line class="wb-tp-ln" x1="' + (x + 30) + '" y1="' + yy + '" x2="' + (x + w - 30) + '" y2="' + yy + '"/>');
        jack("pm." + id[k], x + 30, yy, k === 3 ? "blue" : "black", "", 0); jack("pm." + id[k] + "'", x + w - 30, yy, k === 3 ? "blue" : "black", "", 0);
        text(nm[k], x + 50, yy - 5, "wb-tiny", "start"); if (k < 3) text("max. 10 A", x + w - 50, yy - 5, "wb-tiny", "end");
        if (k < 3) { var cx = x + 150 + k * 50; o('<circle class="wb-tp-sym" cx="' + cx + '" cy="' + yy + '" r="8"/><line class="wb-tp-ln" x1="' + cx + '" y1="' + (yy + 8) + '" x2="' + cx + '" y2="' + ys[3] + '"/>'); }
      });
      rect(x + 112, y + 132, 172, 84, "wb-lcd", 4);
      var rows, units, f = function (v, d) { var a = Math.abs(v); return a >= 1000 ? v.toFixed(0) : a >= 100 ? v.toFixed(1) : v.toFixed(d === undefined ? 2 : d); };
      if (!m) rows = ["0.00", "0.00", "0.00"], units = ["", "", ""];
      else if (pg < 3) { var q = m.ph[pg]; rows = [f(q.p), f(q.q), q.pf.toFixed(2)]; units = ["W", "var", "PF"]; }
      else if (pg === 3) { rows = [f(m.p), f(m.q), m.pf.toFixed(2)]; units = ["W", "var", "PF"]; }
      else if (pg === 4) { rows = m.ph.map(function (q) { return f(q.v, 1); }); units = ["V", "V", "V"]; }
      else { rows = m.ph.map(function (q) { return f(q.i, 3); }); units = ["A", "A", "A"]; }
      rows.forEach(function (t, k) { o(seg7(t, x + 250, y + 137 + k * 26, 17, "#1a2016", "")); text(units[k], x + 280, y + 152 + k * 26, "wb-lcd-u", "end", LTR); });
      text(PM_PG[pg] + (pg < 3 || pg === 3 ? "" : pg === 4 ? " L–N" : ""), x + 122, y + 150, "wb-lcd-u", "start");
      text("MFA-2001", x + 56, y + 160, "wb-tiny"); text("PROGRAMM", x + 334, y + 140, "wb-tiny");
      button("pm.up", x + 314, y + 148, 40, 26, "▲", "pkkey"); button("pm.dn", x + 314, y + 182, 40, 26, "▼", "pkkey");
    }
    /* a load rheostat: 1000 Ω, 0.57 A; ends a and b, slider w */
    function drawRH(k, x, y) {
      var w = 378, h = 150, v = I[k].x, sx = x + 70 + 238 * v / 1000;
      rect(x + 3, y + 5, w, h, "wb-sh", 10); rect(x, y, w, h, "wb-case", 10);
      text("RHEOSTAT " + k.slice(1) + " · مقاومة متغيرة", x + 16, y + 24, "wb-lbl", "start"); text("1000 Ω · 0.57 A", x + w - 14, y + 24, "wb-tiny", "end");
      for (var i = 0; i < 14; i++) rect(x + 56 + i * 19, y + 40, 9, 40, "wb-rh-slot", 3);
      rect(x + 60, y + 84, 258, 6, "wb-rh-bar", 3);
      o('<g class="wb-ctl" data-c="' + k + '.x" data-drag="1"><rect class="wb-rh-sl" x="' + (sx - 26) + '" y="' + (y + 70) + '" width="52" height="30" rx="4"/><line class="wb-rh-tick" x1="' + sx + '" y1="' + (y + 74) + '" x2="' + sx + '" y2="' + (y + 96) + '"/></g>');
      text("R(a–w) = " + si(v, "Ω"), x + 189, y + 118, "wb-val", "middle", LTR);
      jack(k + ".a", x + 36, y + 120, "red", "a", 26); jack(k + ".w", x + 300, y + 120, "yellow", "w", 26); jack(k + ".b", x + 344, y + 120, "black", "b", 26);
    }
    function drawWM(x, y) {
      var w = R.wm, tot = I.wm.tot; box(x, y, "WATTMETER · واتميتر", "");
      rect(x + 20, y + 40, 190, 64, "wb-lcd", 4);
      var val = w ? (tot ? w.tot : w.p) : 0, txt = Math.abs(val) >= 1000 ? val.toFixed(0) : Math.abs(val) >= 100 ? val.toFixed(1) : val.toFixed(2);
      o(seg7(txt, x + 176, y + 52, 34, "#1a2016", "")); text("W", x + 200, y + 96, "wb-lcd-u", "end"); if (tot) text("Σ 3φ", x + 30, y + 56, "wb-lcd-s", "start");
      button("wm.tot", x + 224, y + 56, 64, 26, "Σ 3φ", "pkkey" + (tot ? " in" : ""));
      text("CURRENT · تيار", x + 92, y + 130, "wb-tiny"); text("VOLTAGE · جهد", x + 270, y + 130, "wb-tiny");
      jack("wm.I", x + 60, y + 160, "red", "I", 0); jack("wm.I'", x + 124, y + 160, "black", "I'", 0); jack("wm.V", x + 238, y + 160, "red", "V", 0); jack("wm.V'", x + 302, y + 160, "black", "V'", 0);
      text("I", x + 60, y + 192, "wb-lbl"); text("I'", x + 124, y + 192, "wb-lbl"); text("V", x + 238, y + 192, "wb-lbl"); text("V'", x + 302, y + 192, "wb-lbl");
    }
    /* ---------- Lab 10: mains panel, power meter, fluorescent lamp ---------- */
    function drawMains() {
      var x = 16, y = 16, mn = I.mn, m = R.mn, on = mn.on;
      rect(x + 3, y + 5, 560, 520, "wb-sh", 10); rect(x, y, 560, 520, "wb-mn", 10); rect(x, y, 560, 26, "wb-mn-top", 10); rect(x, y + 494, 560, 26, "wb-mn-top", 10);
      text("AC SUPPLY 220 V · 60 Hz", x + 20, y + 50, "wb-lbl", "start");
      led(x + 40, y + 86, on, "green"); o('<circle cx="' + (x + 40) + '" cy="' + (y + 86) + '" r="15" fill="none" stroke="#7b8490" stroke-width="2"/>');
      button("mn.on", x + 74, y + 70, 70, 32, on ? "ON" : "OFF", "mnkey" + (on ? " in" : ""));
      rect(x + 200, y + 50, 330, 290, "wb-case", 8); text("POWER METER · عدّاد القدرة", x + 365, y + 72, "wb-lbl");
      rect(x + 236, y + 86, 258, 214, "wb-pm", 6); rect(x + 250, y + 98, 180, 190, "wb-pm-lcd", 3);
      var rows = on && m ? [[m.v.toFixed(1), "V"], [m.i.toFixed(3), "A"], [m.p.toFixed(1), "W"], [m.pf.toFixed(3), "PF"]] : [["", "V"], ["", "A"], ["", "W"], ["", "PF"]];
      rows.forEach(function (rw, k) { if (rw[0]) o(seg7(rw[0], x + 396, y + 106 + k * 45, 34, "#10240f", "")); text(rw[1], x + 424, y + 136 + k * 45, "wb-pm-u", "end"); });
      [0, 1, 2, 3].forEach(function (k) { rect(x + 444, y + 110 + k * 44, 34, 28, "wb-pm-k", 4); });
      text(on && m ? (m.q >= 0 ? "IND · متأخر" : "CAP · متقدم") : "", x + 365, y + 322, "wb-tiny");
      jack("mn.L", x + 60, y + 190, "red", "L", 30); jack("mn.N", x + 60, y + 270, "blue", "N", 30);
      text("الخرج بعد العدّاد", x + 60, y + 150, "wb-tiny");
      // lamp
      var lx = 620, ly = 70, lit = on && m && m.p > 5;
      rect(lx, ly + 8, 560, 44, "wb-lamp-b", 6); rect(lx + 26, ly, 508, 30, "wb-lamp" + (lit ? " on" : ""), 15);
      if (lit) o('<rect x="' + (lx + 6) + '" y="' + (ly - 22) + '" width="548" height="78" rx="38" fill="url(#wb-glow)"/>');
      rect(lx + 4, ly - 2, 24, 36, "wb-lamp-cap", 4); rect(lx + 532, ly - 2, 24, 36, "wb-lamp-cap", 4);
      text("FLUORESCENT LAMP 220 V · 20 W  (مع الملف الخانق)", lx + 280, ly + 74, "wb-lbl");
      jack("lamp.a", lx + 120, ly + 118, "red", "L", 30); jack("lamp.b", lx + 440, ly + 118, "blue", "N", 30);
      o('<path class="wb-fixed" d="M' + (x + 72) + ' ' + (y + 190) + 'C 320 ' + (y + 420) + ', 600 ' + (ly + 260) + ', ' + (lx + 120) + ' ' + (ly + 130) + '"/><path class="wb-fixed n" d="M' + (x + 72) + ' ' + (y + 270) + 'C 360 ' + (y + 470) + ', 900 ' + (ly + 330) + ', ' + (lx + 440) + ' ' + (ly + 130) + '"/>');
    }

    /* ---------- leads ---------- */
    function ptKind(p) {
      if (/tp\.[Nn]$|pm\.N'?$|r\d\.w$/.test(p)) return "blue";
      if (/\.(m|s)\+$|\.V$|\.A$|\.10A$|\.mA$|fg\.out|sc\.[12]$|\.a$|mn\.L|va\.L|cc\.1$|tp\.[ABCabc]$|pm\.[123]'?$|wm\.I$/.test(p)) return "red";
      if (/sc\.[12]g|fg\.com|\.COM$|wm\.[IV]'|cc\.1'|cc\.B/.test(p)) return "black";
      if (/\.(m|s)-$|\.b$|mn\.N|va\.N/.test(p)) return "blue";
      if (/\.e$/.test(p)) return "green";
      return "";
    }
    function leadColor(l, i) { return l[2] || ptKind(l[0]) || ptKind(l[1]) || (i % 2 ? "blue" : "red"); }
    function leadPath(a, b) {
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy), sag = Math.min(90, 14 + d * 0.16);
      return "M" + r2(a[0]) + " " + r2(a[1]) + "C" + r2(a[0] + dx * 0.25) + " " + r2(a[1] + dy * 0.25 + sag) + "," + r2(a[0] + dx * 0.75) + " " + r2(a[1] + dy * 0.75 + sag) + "," + r2(b[0]) + " " + r2(b[1]);
    }
    function drawLeads() {
      state.leads.forEach(function (l, i) {
        var a = P[l[0]], b = P[l[1]]; if (!a || !b) return;
        var col = leadColor(l, i), on = sel && sel.k === "lead" && sel.i === i, d = leadPath(a, b);
        o('<g class="wb-lead c-' + col + (on ? " sel" : "") + '" data-l="' + i + '"><path class="wb-lead-o" d="' + d + '"/><path class="wb-lead-c" d="' + d + '"/><path class="wb-lead-hit" d="' + d + '"/>');
        [a, b].forEach(function (q, e) { o('<g data-le="' + i + ":" + e + '"><circle class="wb-plug" cx="' + q[0] + '" cy="' + q[1] + '" r="8.2"/><circle class="wb-plug-in" cx="' + q[0] + '" cy="' + q[1] + '" r="3"/></g>'); });
        o("</g>");
      });
    }

    /* ---------- warnings under the bench ---------- */
    var WARN = {
      short: function (w) { return ["bad", "المصدر " + (w.ch === "m" ? "MASTER" : "SLAVE") + " في وضع CC وجهده تقريبًا صفر: فيه دائرة قصر. غالبًا الأميتر موصول على التوازي، أو سلك يقصر الطرفين."]; },
      cc: function (w) { return ["warn", "المصدر " + (w.ch === "m" ? "MASTER" : "SLAVE") + " وصل لحد التيار (CC)، فجهده أقل من المضبوط. ارفع مقبض A أو راجع الدائرة."]; },
      fuse: function (w) { return ["bad", "احترق فيوز مدخل " + w.j + " في " + DNAME[w.d] + ": مرّ فيه تيار أكبر من حده. الأميتر يتوصل على التوالي دائمًا."]; },
      leadAlert: function (w) { return ["warn", "في " + DNAME[w.d] + " سلك في مدخل التيار (A أو mA) والمفتاح على غير التيار. مدخل التيار مقاومته شبه صفر: لو لمست به جهدًا تعمل قصرًا."]; },
      ohmLive: function () { return ["warn", "لا تقيس المقاومة والدائرة موصولة بمصدر شغال: القراءة غلط وقد تتلف الجهاز. افصل المصدر أو أطفئه أولًا."]; },
      noJack: function () { return ["info", "المفتاح على التيار، لكن ما فيه سلك في مدخل A أو mA."]; },
      hot: function (w) { return ["warn", "المقاومة " + si(w.nom, "Ω") + " تسخن: قدرتها " + w.p.toFixed(2) + " W وهي مصممة لـ " + w.pmax + " W. خفّض الجهد."]; },
      rheo: function (w) { return ["bad", "المقاومة المتغيرة " + w.id.slice(1) + " يمر فيها " + w.i.toFixed(2) + " A وحدها 0.57 A: بتحترق. كبّر قيمتها (حرّك المنزلق) أو اطفئ المحول."]; },
      tpmax: function (w) { return ["bad", "تيار الخط " + w.id.slice(3).toUpperCase() + " في المحول " + w.i.toFixed(2) + " A وحده 4 A: فيه قصر أو حمل صغير جدًا."]; },
      twoAC: function () { return ["warn", "شغّال أكثر من مصدر متردد بترددات مختلفة: المحاكي يحسب على تردد واحد. شغّل مصدرًا مترددًا واحدًا (أو بنفس التردد)."]; },
      earth: function (w) { return ["bad", "تيار يمر في أرضي " + (w.id === "fg.gnd" ? "مولد الإشارة" : "الأوسيلوسكوب") + ": المشبك الأسود على عقدة غير عقدة الأرضي (الطرف الأسود للمولد). كل المشابك السوداء لازم تكون على نفس العقدة."]; }
    };
    function drawWarnings() {
      var ul = host.querySelector(".wb-warn"), seen = {};
      ul.innerHTML = R.warn.map(function (w) {
        var k = w.k + (w.d || "") + (w.ch || "") + (w.id || ""); if (seen[k]) return ""; seen[k] = 1;
        var m = WARN[w.k] ? WARN[w.k](w) : ["info", w.k];
        return '<li class="' + m[0] + '">' + esc(m[1]) + (w.k === "fuse" ? ' <button type="button" class="wb-b" data-fuse="' + w.d + '">بدّل الفيوز</button>' : "") + "</li>";
      }).join("");
      ul.querySelectorAll("[data-fuse]").forEach(function (b) { b.onclick = function () { I[b.dataset.fuse].blown = {}; commit(); }; });
    }

    /* ---------- render ---------- */
    function render() {
      I = state.inst; P = {}; out = [];
      if (!I.sc.stop || !R) R = S.read(state, { only: inst }); else { var keep = R.sc; R = S.read(state, { only: inst }); R.sc = keep; }
      o('<defs><radialGradient id="wb-glow"><stop offset="0" stop-color="#fffbe0" stop-opacity=".85"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="wb-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eceef1"/><stop offset="1" stop-color="#dfe2e7"/></linearGradient></defs>');
      rect(0, 0, W, H, "wb-desk", 0, ' data-bg="1"');
      if (MAINS) { drawMains(); if (has("cb")) drawDecade("cb", 1206, 300, "CAPACITANCE DECADE BOX", ["×1 µF", "×0.1 µF"], "C = " + si(S.cbValue(I), "F")); }
      else {
        rect(0, 268, W, 6, "wb-shelf", 0);
        if (has("fg")) drawFG(); if (has("ps")) drawPS(); if (has("sc")) drawScope();
        if (has("d1")) drawDMM("d1", 16, 282); if (has("d2")) drawDMM("d2", 214, 282);
        drawTray(); drawBoard();
        var by = 282;
        if (has("rb")) { drawDecade("rb", 1206, by, "RESISTANCE DECADE BOX", rbLabels(I.rb.d.length), "R = " + si(S.rbValue(I), "Ω")); by += 214; }
        if (has("lb")) { drawDecade("lb", 1206, by, "LAB INDUCTANCE DECADE BOX", ["×10 mH", "×1 mH", "×0.1 mH"], "L = " + si(S.lbValue(I), "H")); by += 214; }
        if (has("cb")) { drawDecade("cb", 1206, by, "CAPACITANCE DECADE BOX", ["×1 µF", "×0.1 µF"], "C = " + si(S.cbValue(I), "F")); by += 214; }
        if (has("va")) { drawVariac(1206, by); by += 214; }
        if (has("cc")) { drawCoils(1206, by); by += 214; }
        var shelf = !has("fg") && !has("ps") && !has("sc");   // an empty top shelf: the three-phase supply and the wattmeter go there
        if (has("tp")) { if (shelf) drawTP(420, 36); else { drawTP(1206, by); by += 228; } }
        if (has("wm")) { if (shelf) drawWM(830, 40); else { drawWM(1206, by); by += 214; } }
        if (has("pm")) { if (shelf) drawPM(830, 36); else { drawPM(1196, by); by += 236; } }
        ["r1", "r2", "r3"].forEach(function (k) { if (has(k)) { drawRH(k, 1206, by); by += 164; } });
      }
      drawLeads();
      marks.forEach(function (m) {   // orange rings used by the explainer videos (api.mark)
        var q = m.p && P[m.p], g = m.s && slotGeom(m.s);
        if (q) o('<circle class="wb-mark" cx="' + q[0] + '" cy="' + q[1] + '" r="' + (m.r || 17) + '"/>');
        else if (g) o('<rect class="wb-mark" x="' + (g.x - (g.h ? 36 : 22)) + '" y="' + (g.y - (g.h ? 22 : 36)) + '" width="' + (g.h ? 72 : 44) + '" height="' + (g.h ? 44 : 72) + '" rx="10"/>');
        else if (m.box) o('<rect class="wb-mark" x="' + m.box[0] + '" y="' + m.box[1] + '" width="' + m.box[2] + '" height="' + m.box[3] + '" rx="12"/>');
      });
      o('<g class="wb-ghost"></g>');
      svg.innerHTML = out.join("");
      drawWarnings(); placeTool();
      wrap.querySelector('[data-a="undo"]').disabled = !undo.length;
      if (opts.onChange) opts.onChange(state, R);
    }
    function snap() { undo.push(JSON.stringify(state)); if (undo.length > 40) undo.shift(); }
    function commit() { save(); render(); }

    /* ---------- pointer handling ---------- */
    function pt(evt) { var m = svg.getScreenCTM(); if (!m) return [0, 0]; var p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY; p = p.matrixTransform(m.inverse()); return [p.x, p.y]; }
    function px(n) { var r = svg.getBoundingClientRect(); return n * vb.w / Math.max(1, r.width); }   // n screen pixels in drawing units
    function nearestPoint(q, max, skip) { var best = null, bd = max; Object.keys(P).forEach(function (id) { if (id === skip) return; var d = Math.hypot(P[id][0] - q[0], P[id][1] - q[1]); if (d < bd) { bd = d; best = id; } }); return best; }
    function nearestSlot(q, max) { var all = allSlots(), best = null, bd = max; Object.keys(all).forEach(function (id) { if (state.parts[id]) return; var g = all[id], d = Math.hypot(g.x - q[0], g.y - q[1]); if (d < bd) { bd = d; best = id; } }); return best; }
    function onBoard(q) { return q[0] > BX - 10 && q[0] < BX + BW + 10 && q[1] > BY - 10 && q[1] < BY + BH - 100; }
    function ghost(html) { var g = svg.querySelector(".wb-ghost"); if (g) g.innerHTML = html; }
    function partUnder(evt) { if (!document.elementsFromPoint) return null; var all = document.elementsFromPoint(evt.clientX, evt.clientY); for (var i = 0; i < all.length; i++) { var s0 = all[i].closest && all[i].closest("[data-s]"); if (s0 && svg.contains(s0)) return s0; } return null; }
    function moving(on) { svg.classList.toggle("wb-moving", !!on); }   // wires fade and let go of the pointer while a part is carried
    var pointers = {}, pinch = null;
    var asp = null;   // height/width of the view; in full screen it follows the screen so the bench fills it (drag the desk to see the rest)
    function fitFull() {
      if (!wrap.classList.contains("full")) { asp = null; vb = { x: 0, y: 0, w: W, h: H }; setVB(); return; }
      var r = svg.getBoundingClientRect(); if (r.width < 10 || r.height < 10) return;
      asp = r.height / r.width;
      if (asp <= H / W) vb = { x: 0, y: 0, w: W, h: W * asp };                       // wide screen: full width, drag up and down
      else { var w = H / asp; vb = { x: MAINS ? 0 : clamp(BX + BW / 2 - w / 2 - 120, 0, W - w), y: 0, w: w, h: H }; }   // tall screen: full height, starts at the board
      setVB();
    }
    function setVB() { var A = asp || H / W; vb.w = clamp(vb.w, W / 5, Math.min(W, H / A)); vb.h = vb.w * A; vb.x = clamp(vb.x, 0, W - vb.w); vb.y = clamp(vb.y, 0, H - vb.h); svg.setAttribute("viewBox", r2(vb.x) + " " + r2(vb.y) + " " + r2(vb.w) + " " + r2(vb.h)); placeTool(); }
    function zoomAt(q, f) { var nw = clamp(vb.w * f, W / 5, W), k = nw / vb.w; vb.x = q[0] - (q[0] - vb.x) * k; vb.y = q[1] - (q[1] - vb.y) * k; vb.w = nw; setVB(); }

    svg.addEventListener("pointerdown", function (evt) {
      if (evt.button) return;
      pointers[evt.pointerId] = [evt.clientX, evt.clientY];
      var ids = Object.keys(pointers);
      if (ids.length === 2) { cancelDrag(); var a = pointers[ids[0]], b = pointers[ids[1]]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), w: vb.w }; return; }
      closePop();
      var q = pt(evt), t = evt.target, el;
      try { svg.setPointerCapture(evt.pointerId); } catch (e) {}
      drag = { q0: q, c0: [evt.clientX, evt.clientY], moved: false };
      if ((el = t.closest("[data-le]"))) { var le = el.dataset.le.split(":"); drag.k = "replug"; drag.i = +le[0]; drag.e = +le[1]; }
      else if ((el = t.closest("[data-c]"))) { drag.k = "ctl"; drag.c = el.dataset.c; drag.canDrag = !!el.dataset.drag; drag.v0 = ctlValue(drag.c); }
      else if ((el = t.closest("[data-s]"))) { drag.k = "part"; drag.id = el.dataset.s; }
      else if (t.closest("[data-l]") && !t.closest("[data-le]") && (el = partUnder(evt))) { drag.k = "part"; drag.id = el.dataset.s; }   // a wire lying over a part: the part is what the student meant to grab
      else if ((el = t.closest("[data-t]"))) { var it = TRAY[+el.dataset.t]; if (it && !it.gone) { drag.k = "tray"; drag.pc = it.pc; } else drag.k = "none"; }
      else if ((el = t.closest("[data-p]"))) { drag.k = "lead"; drag.from = el.dataset.p; }
      else if ((el = t.closest("[data-l]"))) { drag.k = "leadsel"; drag.i = +el.dataset.l; }
      else { var np = nearestPoint(q, Math.max(13, px(22))); if (np) { drag.k = "lead"; drag.from = np; } else { drag.k = "pan"; drag.vb0 = { x: vb.x, y: vb.y }; } }
      evt.preventDefault();
    });
    svg.addEventListener("pointermove", function (evt) {
      if (pointers[evt.pointerId]) pointers[evt.pointerId] = [evt.clientX, evt.clientY];
      var ids = Object.keys(pointers);
      if (pinch && ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d > 10) { var r = svg.getBoundingClientRect(), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; var q0 = [vb.x + (mid[0] - r.left) / r.width * vb.w, vb.y + (mid[1] - r.top) / r.height * vb.h]; zoomAt(q0, (pinch.w * pinch.d / d) / vb.w); } return; }
      if (!drag) return;
      var q = pt(evt), dxp = evt.clientX - drag.c0[0], dyp = evt.clientY - drag.c0[1];
      if (!drag.moved && Math.hypot(dxp, dyp) < 7) return;
      drag.moved = true;
      if (drag.k === "lead" || drag.k === "replug") {
        var from = drag.k === "lead" ? drag.from : state.leads[drag.i][1 - drag.e], tgt = nearestPoint(q, Math.max(26, px(34)), from), a2 = P[from], b2 = tgt ? P[tgt] : q, col = drag.k === "lead" ? (ptKind(from) || "red") : leadColor(state.leads[drag.i], drag.i);
        drag.tgt = tgt;
        ghost('<g class="wb-lead c-' + col + ' live"><path class="wb-lead-o" d="' + leadPath(a2, b2) + '"/><path class="wb-lead-c" d="' + leadPath(a2, b2) + '"/><circle class="wb-plug" cx="' + r2(b2[0]) + '" cy="' + r2(b2[1]) + '" r="8.2"/></g>' + (tgt ? '<circle class="wb-target" cx="' + b2[0] + '" cy="' + b2[1] + '" r="' + r2(Math.max(15, px(18))) + '"/>' : ""));
      } else if (drag.k === "part" || drag.k === "tray") {
        var pc = drag.k === "part" ? state.parts[drag.id] : drag.pc, sl = onBoard(q) ? nearestSlot(q, Math.max(60, px(44))) : null, g = sl ? allSlots()[sl] : { x: q[0], y: q[1], h: true };
        if (drag.k === "part" && !sl && onBoard(q)) { var own = allSlots()[drag.id]; if (Math.hypot(own.x - q[0], own.y - q[1]) < 60) { sl = drag.id; g = own; } }
        drag.slot = sl; moving(true);
        ghost((sl ? '<rect class="wb-target" x="' + (g.x - (g.h ? 32 : 18)) + '" y="' + (g.y - (g.h ? 18 : 32)) + '" width="' + (g.h ? 64 : 36) + '" height="' + (g.h ? 36 : 64) + '" rx="6"/>' : "") + partSvg(pc, g, "drag"));
        if (drag.k === "part") { var me = svg.querySelector('[data-s="' + drag.id + '"]'); if (me) me.style.opacity = ".25"; }
      } else if (drag.k === "ctl" && drag.canDrag) { dragCtl(drag.c, drag.v0, dxp - dyp, q); }
      else if (drag.k === "pan") { var rr = svg.getBoundingClientRect(); vb.x = drag.vb0.x - dxp * vb.w / rr.width; vb.y = drag.vb0.y - dyp * vb.h / rr.height; setVB(); }
    });
    function cancelDrag() { drag = null; ghost(""); moving(false); }
    function endPtr(evt) {
      delete pointers[evt.pointerId]; if (Object.keys(pointers).length < 2) pinch = null;
      moving(false);
      if (!drag) return; var d = drag; drag = null; ghost("");
      if (evt.type === "pointercancel") { render(); return; }
      if (d.k === "lead") {
        if (d.moved) { if (d.tgt) addLead(d.from, d.tgt); else render(); }
        else if (sel && sel.k === "pt" && sel.p !== d.from) addLead(sel.p, d.from);
        else { sel = sel && sel.k === "pt" && sel.p === d.from ? null : { k: "pt", p: d.from }; render(); }
      } else if (d.k === "replug") {
        if (d.moved) { if (d.tgt) { snap(); state.leads[d.i][d.e] = d.tgt; sel = null; commit(); } else { snap(); state.leads.splice(d.i, 1); sel = null; commit(); } }
        else { sel = { k: "lead", i: d.i, e: d.e }; render(); }
      } else if (d.k === "leadsel") { sel = { k: "lead", i: d.i }; render(); }
      else if (d.k === "part") {
        if (!d.moved) { sel = sel && sel.k === "part" && sel.id === d.id ? null : { k: "part", id: d.id }; render(); }
        else if (d.slot && d.slot !== d.id) { snap(); state.parts[d.slot] = state.parts[d.id]; delete state.parts[d.id]; sel = null; commit(); }
        else if (!d.slot) { snap(); delete state.parts[d.id]; sel = null; commit(); }
        else render();
      } else if (d.k === "tray") {
        if (d.moved && d.slot) {
          snap(); var np = JSON.parse(JSON.stringify(d.pc));
          if (np.t !== "W") {   // a second copy of the same block gets its own id (so its own actual value, like another real resistor)
            var taken = {}; Object.keys(state.parts).forEach(function (s) { if (s !== d.slot && state.parts[s].id) taken[state.parts[s].id] = 1; });
            var base = String(np.id).split("~")[0], k = 2; np.id = base; while (taken[np.id]) np.id = base + "~" + k++;
          }
          state.parts[d.slot] = np; sel = null; commit();
        }
        else if (!d.moved) { toast("اسحب القطعة إلى مكانها على اللوحة"); }
        else render();
      } else if (d.k === "ctl") { if (d.moved && d.canDrag) commit(); else tapCtl(d.c, evt); }
      else if (d.k === "pan" && !d.moved) { if (sel) { sel = null; render(); } }
    }
    svg.addEventListener("pointerup", endPtr); svg.addEventListener("pointercancel", endPtr);
    svg.addEventListener("wheel", function (evt) { if (!evt.ctrlKey && !wrap.classList.contains("full")) return; evt.preventDefault(); zoomAt(pt(evt), evt.deltaY > 0 ? 1.15 : 1 / 1.15); }, { passive: false });
    function addLead(a, b) {
      if (a === b) { render(); return; }
      if (!state.leads.some(function (l) { return (l[0] === a && l[1] === b) || (l[0] === b && l[1] === a); })) { snap(); state.leads.push([a, b]); }
      sel = null; commit();
    }

    /* ---------- controls: every knob and key has a value, a step and limits ---------- */
    function ctlSpec(c) {
      var m;
      if ((m = /^ps\.([ms])\.([vi])$/.exec(c))) { var ch = m[1], tr = (I.ps.mode || "normal") !== "normal" && ch === "s"; return { get: function () { return I.ps[tr ? "m" : ch][m[2]]; }, set: function (v) { I.ps[tr ? "m" : ch][m[2]] = v; }, min: 0, max: m[2] === "v" ? 16 : 5, step: m[2] === "v" ? 0.1 : 0.01, px: m[2] === "v" ? 0.05 : 0.01, unit: m[2] === "v" ? "V" : "A", title: (ch === "m" ? "MASTER" : "SLAVE") + (m[2] === "v" ? " · الجهد" : " · حد التيار"), note: tr ? "في وضع SERIES/PARALLEL مقبض الـ MASTER هو اللي يتحكم." : "" }; }
      if (c === "fg.a") return { get: function () { return I.fg.vpp; }, set: function (v) { I.fg.vpp = v; }, min: 0, max: 20, step: 0.1, px: 0.05, unit: "Vpp", title: "AMPLITUDE · السعة (دائرة مفتوحة)" };
      if (c === "fg.off") return { get: function () { return I.fg.off || 0; }, set: function (v) { I.fg.off = v; }, min: -10, max: 10, step: 0.1, px: 0.05, unit: "V", title: "DC OFFSET" };
      if (c === "fg.f") return { get: function () { return I.fg.f; }, set: function (v) { I.fg.f = v; }, min: 1, max: 1e6, step: 0, log: true, unit: "Hz", units: [["Hz", 1], ["kHz", 1e3], ["MHz", 1e6]], type: true, title: "FREQUENCY · التردد", presets: [50, 60, 100, 500, 1000, 2000, 5000, 10000] };
      if ((m = /^sc\.(c[12])\.vd$/.exec(c))) return { get: function () { return VDIV.indexOf(I.sc[m[1]].vd); }, set: function (v) { I.sc[m[1]].vd = VDIV[v]; }, min: 0, max: VDIV.length - 1, step: 1, px: 0.04, show: function (v) { return si(VDIV[v], "V") + "/div"; }, title: "VOLTS/DIV · " + m[1].toUpperCase().replace("C", "CH") };
      if (c === "sc.t") return { get: function () { return TDIV.indexOf(I.sc.td); }, set: function (v) { I.sc.td = TDIV[v]; }, min: 0, max: TDIV.length - 1, step: 1, px: 0.04, show: function (v) { return si(TDIV[v], "s") + "/div"; }, title: "SEC/DIV" };
      if ((m = /^sc\.(c[12])\.pos$/.exec(c))) return { get: function () { return I.sc[m[1]].pos || 0; }, set: function (v) { I.sc[m[1]].pos = v; }, min: -4, max: 4, step: 0.1, px: 0.03, unit: "div", title: "VERTICAL POSITION" };
      if (c === "sc.hpos") return { get: function () { return I.sc.hpos || 0; }, set: function (v) { I.sc.hpos = v; }, min: -6, max: 6, step: 0.1, px: 0.04, unit: "div", title: "HORIZONTAL POSITION" };
      if ((m = /^(r[123])\.x$/.exec(c))) return { get: function () { return I[m[1]].x; }, set: function (v) { I[m[1]].x = v; }, min: 0, max: 1000, step: 1, px: 2, unit: "Ω", type: true, presets: [100, 200, 500, 1000], title: "RHEOSTAT " + m[1].slice(1) + " · R بين a و w", note: "المنزلق يقسم الملف: R(a–w) + R(w–b) = 1000 Ω. أقصى تيار 0.57 A." };
      if (c === "va.v") return { get: function () { return I.va.v; }, set: function (v) { I.va.v = v; }, min: 0, max: 30, step: 0.1, px: 0.05, unit: "V rms", title: "VARIAC · جهد الخرج (60 Hz)" };
      if ((m = /^(rb|lb|cb)\.d:(\d)$/.exec(c))) { var DL = { rb: rbLabels(I.rb.d.length), lb: ["×10 mH", "×1 mH", "×0.1 mH"], cb: ["×1 µF", "×0.1 µF"] }[m[1]];
        return { get: function () { return I[m[1]].d[+m[2]]; }, set: function (v) { I[m[1]].d[+m[2]] = v; }, min: 0, max: 9, step: 1, px: 0.035, title: { rb: "صندوق المقاومات", lb: "صندوق المحاثة", cb: "صندوق المكثفات" }[m[1]], tag: DL[+m[2]],
          extra: function () { return m[1] === "rb" ? "R = " + si(S.rbValue(I), "Ω") : m[1] === "lb" ? "L = " + si(S.lbValue(I), "H") : "C = " + si(S.cbValue(I), "F"); } }; }
      if ((m = /^(d[12])\.dial$/.exec(c))) { var dl = DIAL[m[1]]; return { get: function () { return Math.max(0, dl.map(function (x) { return x[0]; }).indexOf(I[m[1]].mode)); }, set: function (v) { I[m[1]].mode = dl[v][0]; delete hold[m[1]]; }, min: 0, max: dl.length - 1, step: 1, px: 0.025, show: function (v) { return dl[v][1] + " · " + DIAL_AR[dl[v][0]]; }, title: DNAME[m[1]] }; }
      return null;
    }
    function ctlValue(c) { var s = ctlSpec(c); return s ? s.get() : 0; }
    function quant(s, v) { v = clamp(v, s.min, s.max); return s.step ? Math.round(v / s.step) * s.step : v; }
    function dragCtl(c, v0, dpx) {
      var s = ctlSpec(c); if (!s) return; var v;
      if (s.log) { v = clamp(v0 * Math.pow(10, dpx / 160), s.min, s.max); v = +v.toPrecision(3); } else v = quant(s, v0 + dpx * s.px);
      v = Math.round(v * 1e6) / 1e6;
      if (v !== s.get()) { if (!drag.snapped) { snap(); drag.snapped = 1; } s.set(v); render(); }
    }
    function tapCtl(c, evt) {
      var m;
      if (c === "ps.out") { snap(); I.ps.on = !I.ps.on; return commit(); }
      if (c === "ps.sw1") { snap(); I.ps.mode = (I.ps.mode || "normal") === "normal" ? "series" : "normal"; return commit(); }
      if (c === "ps.sw2") { snap(); I.ps.mode = I.ps.mode === "parallel" ? "series" : "parallel"; return commit(); }
      if (c === "fg.on") { snap(); I.fg.on = !I.fg.on; return commit(); }
      if (c === "mn.on") { snap(); I.mn.on = !I.mn.on; return commit(); }
      if ((m = /^fg\.rng:(\d+)$/.exec(c))) { snap(); var mant = I.fg.f / Math.pow(10, Math.floor(Math.log10(I.fg.f))); I.fg.f = +(mant * +m[1]).toPrecision(3); return commit(); }
      if (c === "fg.w:sin" || c === "fg.w:sq") { snap(); I.fg.w = c.slice(5); return commit(); }
      if (/^fg\.w:/.test(c)) return toast("الموجة المثلثة: قيد الإعداد. الجيبية والمربعة شغالتان.");
      if (c === "va.on") { snap(); I.va.on = !I.va.on; return commit(); }
      if (c === "tp.on") { snap(); I.tp.on = !I.tp.on; return commit(); }
      if (c === "wm.tot") { I.wm.tot = !I.wm.tot; return commit(); }
      if (c === "pm.up" || c === "pm.dn") { I.pm.pg = ((I.pm.pg || 0) + (c === "pm.up" ? 5 : 1)) % 6; return commit(); }
      if ((m = /\.soon:(.+)$/.exec(c))) return toast("زر " + m[1] + ": قيد الإعداد");
      if ((m = /^(d[12])\.hold$/.exec(c))) { if (hold[m[1]]) delete hold[m[1]]; else hold[m[1]] = R[m[1]]; return render(); }
      if ((m = /^(d[12])\.mode:(\w+)$/.exec(c))) { snap(); I[m[1]].mode = m[2]; delete hold[m[1]]; return commit(); }
      if (c === "sc.meas" || c === "sc.math" || c === "sc.xy" || c === "sc.cur") { var k = c.slice(3); I.sc[k] = !I.sc[k]; if (k === "cur" && I.sc.cur) { commit(); return openCursor(evt); } return commit(); }
      if (c === "sc.run") { I.sc.stop = !I.sc.stop; return commit(); }
      if (c === "sc.auto") { autoset(); return commit(); }
      if ((m = /^sc\.(c[12])$/.exec(c))) return openChan(m[1], evt);
      var s = ctlSpec(c); if (s) openSpec(c, s, evt);
    }
    function autoset() {
      var d = R.sc; if (!d) return;
      ["c1", "c2"].forEach(function (c) { var ch = d[c], peak = Math.abs(ch.dc) + S.mag(ch.ac); if (peak < 1e-4) return; var want = peak / 3, v = VDIV.filter(function (x) { return x >= want; })[0] || VDIV[VDIV.length - 1]; I.sc[c].vd = v; I.sc[c].pos = 0; I.sc[c].on = true; });
      if (d.f) { var T = 1 / d.f, td = TDIV.filter(function (x) { return x * 12 >= 2.4 * T; })[0] || TDIV[TDIV.length - 1]; I.sc.td = td; }
      I.sc.hpos = 0; I.sc.xy = false;
    }

    /* ---------- pop-over with big touch controls ---------- */
    function placeBox(box, evt) {
      box.hidden = false; var r = stage.getBoundingClientRect(), bw = box.offsetWidth, bh = box.offsetHeight;
      var x = clamp(evt.clientX - r.left - bw / 2, 6, Math.max(6, r.width - bw - 6)), y = evt.clientY - r.top + 22;
      if (y + bh > r.height - 6) y = Math.max(6, evt.clientY - r.top - bh - 22);
      box.style.left = x + "px"; box.style.top = y + "px";
    }
    function closePop() { pop.hidden = true; pop.innerHTML = ""; }
    function openSpec(c, s, evt) {
      function shown() { var v = s.get(); return s.show ? s.show(v) : (s.log ? si(v, s.unit) : (s.step < 1 ? v.toFixed(s.step < 0.1 ? 2 : 1) : v) + (s.unit ? " " + s.unit : "")); }
      var big = s.log ? null : s.step * (s.max - s.min > 50 * s.step ? 10 : 1);
      pop.innerHTML = '<div class="wb-pop-h"><b>' + esc(s.title || "") + (s.tag ? ' <span class="wb-pop-tag" dir="ltr">' + esc(s.tag) + '</span>' : "") + '</b><button type="button" class="wb-pop-x" aria-label="أغلق">✕</button></div>' +
        '<div class="wb-pop-v no-bi" dir="ltr"><span>' + esc(shown()) + '</span>' + (s.extra ? '<small>' + esc(s.extra()) + '</small>' : "") + '</div>' +
        '<div class="wb-pop-r no-bi">' + (big && big !== s.step ? '<button type="button" data-d="' + -big + '">−−</button>' : "") + '<button type="button" data-d="' + (s.log ? "/" : -s.step) + '">−</button><button type="button" data-d="' + (s.log ? "*" : s.step) + '">＋</button>' + (big && big !== s.step ? '<button type="button" data-d="' + big + '">＋＋</button>' : "") + '</div>' +
        (s.type ? '<div class="wb-pop-in no-bi" dir="ltr"><input type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" aria-label="اكتب القيمة">' + (s.units ? '<select aria-label="الوحدة">' + s.units.map(function (u) { return '<option value="' + u[1] + '">' + esc(u[0]) + '</option>'; }).join("") + '</select>' : '<span>' + esc(s.unit || "") + '</span>') + '<button type="button" data-in="1">اضبط</button></div><p class="wb-pop-n wb-pop-e" hidden></p>' : "") +
        (s.log ? "" : '<input class="wb-pop-s" type="range" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + s.get() + '">') +
        (s.presets ? '<div class="wb-pop-p no-bi" dir="ltr">' + s.presets.map(function (p) { return '<button type="button" data-set="' + p + '">' + esc(si(p, s.unit)) + '</button>'; }).join("") + '</div>' : "") +
        (s.note ? '<p class="wb-pop-n">' + esc(s.note) + '</p>' : "");
      placeBox(pop, evt);
      var first = true;
      function apply(v, exact) { if (first) { snap(); first = false; } v = s.log ? clamp(+v.toPrecision(exact ? 6 : 3), s.min, s.max) : Math.round(quant(s, v) * 1e6) / 1e6; s.set(v); commit(); pop.querySelector(".wb-pop-v span").textContent = shown(); if (s.extra) pop.querySelector(".wb-pop-v small").textContent = s.extra(); var sl = pop.querySelector(".wb-pop-s"); if (sl) sl.value = v; fillIn(); }
      /* the value typed by hand (the frequency: 1590 Hz, 2.5 kHz…) */
      var inp = pop.querySelector(".wb-pop-in input"), usel = pop.querySelector(".wb-pop-in select"), err = pop.querySelector(".wb-pop-e");
      function fillIn() {
        if (!inp) return; var v = s.get(), k = 1;
        if (usel) { var opt = Array.prototype.filter.call(usel.options, function (o) { return v >= +o.value; }).pop() || usel.options[0]; usel.value = opt.value; k = +opt.value; }
        if (document.activeElement !== inp) inp.value = String(+(v / k).toPrecision(6));
      }
      function typed() {
        var raw = String(inp.value).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); }).replace(/[٫,]/g, ".").replace(/\s/g, ""), m = /^(\d*\.?\d+)(k|K|M|m)?(hz|Hz|HZ)?$/.exec(raw);
        var k = usel ? +usel.value : 1; if (m && m[2]) k = { k: 1e3, K: 1e3, M: 1e6, m: 1e-3 }[m[2]];
        var v = m ? +m[1] * k : NaN;
        if (!(v > 0) || v < s.min || v > s.max) { err.hidden = false; err.textContent = "اكتب رقمًا بين " + (s.log ? si(s.min, s.unit) + " و " + si(s.max, s.unit) : s.min + " و " + s.max + (s.unit ? " " + s.unit : "")) + "."; return; }
        err.hidden = true; inp.blur(); apply(v, true);
      }
      if (inp) { fillIn(); inp.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); typed(); } }; pop.querySelector("[data-in]").onclick = typed; if (usel) usel.onchange = function () { if (inp.value) typed(); }; }
      function nice(v, up) { // the next round value: 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8 in every decade
        var N = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8], e = Math.floor(Math.log10(v)), list = [];
        for (var d = e - 1; d <= e + 1; d++) N.forEach(function (n) { list.push(+(n * Math.pow(10, d)).toPrecision(3)); });
        return up ? (list.filter(function (x) { return x > v * 1.0001; })[0] || v * 1.2) : (list.filter(function (x) { return x < v * 0.9999; }).pop() || v / 1.2);
      }
      pop.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { var d = b.dataset.d, v = s.get(); apply(d === "*" ? nice(v, true) : d === "/" ? nice(v, false) : v + +d); }; });
      pop.querySelectorAll("[data-set]").forEach(function (b) { b.onclick = function () { apply(+b.dataset.set); }; });
      var sl = pop.querySelector(".wb-pop-s"); if (sl) sl.oninput = function () { apply(+sl.value); };
      pop.querySelector(".wb-pop-x").onclick = closePop;
    }
    function openChan(c, evt) {
      var st = I.sc[c];
      pop.innerHTML = '<div class="wb-pop-h"><b>' + c.toUpperCase().replace("C", "CH") + '</b><button type="button" class="wb-pop-x" aria-label="أغلق">✕</button></div>' +
        '<div class="wb-pop-p no-bi"><button type="button" data-on="1" class="' + (st.on ? "on" : "") + '">ON</button><button type="button" data-on="0" class="' + (st.on ? "" : "on") + '">OFF</button></div>' +
        '<div class="wb-pop-n">Coupling · نوع الربط</div><div class="wb-pop-p no-bi">' + ["DC", "AC", "GND"].map(function (k) { return '<button type="button" data-cp="' + k + '" class="' + (st.cp === k ? "on" : "") + '">' + k + '</button>'; }).join("") + '</div>';
      placeBox(pop, evt);
      pop.querySelectorAll("[data-on]").forEach(function (b) { b.onclick = function () { st.on = b.dataset.on === "1"; commit(); closePop(); }; });
      pop.querySelectorAll("[data-cp]").forEach(function (b) { b.onclick = function () { st.cp = b.dataset.cp; commit(); closePop(); }; });
      pop.querySelector(".wb-pop-x").onclick = closePop;
    }
    function openCursor(evt) {
      pop.innerHTML = '<div class="wb-pop-h"><b>Cursor · المؤشران</b><button type="button" class="wb-pop-x" aria-label="أغلق">✕</button></div><div class="wb-pop-n">x1</div><input class="wb-pop-s" data-k="x1" type="range" min="0" max="12" step="0.05" value="' + I.sc.x1 + '"><div class="wb-pop-n">x2</div><input class="wb-pop-s" data-k="x2" type="range" min="0" max="12" step="0.05" value="' + I.sc.x2 + '">';
      placeBox(pop, evt);
      pop.querySelectorAll("input").forEach(function (i) { i.oninput = function () { I.sc[i.dataset.k] = +i.value; commit(); }; });
      pop.querySelector(".wb-pop-x").onclick = closePop;
    }
    var toastT = 0;
    function toast(t) { toastEl.textContent = t; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 2600); }

    /* ---------- the little toolbar next to the selected part / lead ---------- */
    function placeTool() {
      if (!sel || sel.k === "pt") { tool.hidden = true; markSel(); return; }
      var q, html;
      if (sel.k === "part") { var g = slotGeom(sel.id); if (!g || !state.parts[sel.id]) { sel = null; tool.hidden = true; return; } q = [g.x, g.y - 30]; html = '<button type="button" data-t="rot">↻ تدوير</button><button type="button" data-t="del" class="bad">حذف</button>'; }
      else { var l = state.leads[sel.i]; if (!l) { sel = null; tool.hidden = true; return; } var a = P[l[0]], b = P[l[1]]; q = sel.e === undefined ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 10] : [P[l[sel.e]][0], P[l[sel.e]][1] - 26];
        html = '<button type="button" data-t="del" class="bad">افصل السلك</button><button type="button" data-t="col">اللون</button>' + (sel.e !== undefined ? '<button type="button" data-t="more">سلك ثاني من هنا</button>' : ""); }
      tool.innerHTML = html; tool.hidden = false;
      var m = svg.getScreenCTM(), r = stage.getBoundingClientRect(), p = svg.createSVGPoint(); p.x = q[0]; p.y = q[1]; p = p.matrixTransform(m);
      tool.style.left = clamp(p.x - r.left - tool.offsetWidth / 2, 4, Math.max(4, r.width - tool.offsetWidth - 4)) + "px"; tool.style.top = clamp(p.y - r.top - tool.offsetHeight - 6, 4, r.height - tool.offsetHeight - 4) + "px";
    }
    function markSel() { if (sel && sel.k === "pt" && P[sel.p]) ghost('<circle class="wb-target on" cx="' + P[sel.p][0] + '" cy="' + P[sel.p][1] + '" r="15"/>'); }
    tool.addEventListener("click", function (evt) {
      var b = evt.target.closest("[data-t]"); if (!b || !sel) return; var t = b.dataset.t;
      if (sel.k === "part") {
        if (t === "del") { snap(); delete state.parts[sel.id]; sel = null; return commit(); }
        var g = slotGeom(sel.id), alt = [], r = g.r, c = g.c;
        (g.h ? [["v", r, c], ["v", r - 1, c], ["v", r, c + 1], ["v", r - 1, c + 1]] : [["h", r, c], ["h", r, c - 1], ["h", r + 1, c], ["h", r + 1, c - 1]]).forEach(function (a) { LANES.forEach(function (ln) { alt.push(a[0] + ":" + a[1] + ":" + a[2] + ln[0]); }); });
        var to = alt.filter(function (id) { return allSlots()[id] && !state.parts[id]; })[0];
        if (!to) return toast("ما فيه مكان فاضي للتدوير هنا");
        snap(); state.parts[to] = state.parts[sel.id]; delete state.parts[sel.id]; sel = { k: "part", id: to }; return commit();
      }
      if (t === "del") { snap(); state.leads.splice(sel.i, 1); sel = null; return commit(); }
      if (t === "col") { snap(); var l = state.leads[sel.i], order = ["red", "blue", "black", "green"], cur = leadColor(l, sel.i); l[2] = order[(order.indexOf(cur) + 1) % order.length]; return commit(); }
      if (t === "more") { sel = { k: "pt", p: state.leads[sel.i][sel.e] }; toast("اختر النقطة الثانية"); return render(); }
    });

    /* ---------- top bar ---------- */
    wrap.querySelector(".wb-bar").addEventListener("click", function (evt) {
      var b = evt.target.closest("[data-a]"); if (!b) return; var a = b.dataset.a;
      if (a === "undo" && undo.length) { state = JSON.parse(undo.pop()); sel = null; commit(); }
      if (a === "thin") { var th = wrap.classList.toggle("wb-thin"); b.setAttribute("aria-pressed", th ? "true" : "false"); b.classList.toggle("on", th); try { localStorage.setItem(KEY + ".thin", th ? "1" : ""); } catch (e) {} if (th) { if (sel && sel.k === "lead") sel = null; render(); toast("الأسلاك شفافة: حرّك القطع وحطها بدون ما تمسك سلك. اضغط الزر مرة ثانية لترجع الأسلاك."); } return; }
      if (a === "leads" && state.leads.length) { snap(); state.leads = []; sel = null; commit(); }
      if (a === "clear") { snap(); var keep = state.inst; state = fresh(); state.inst = keep; sel = null; commit(); }
      if (a === "zi") zoomAt([vb.x + vb.w / 2, vb.y + vb.h / 2], 1 / 1.3);
      if (a === "zo") zoomAt([vb.x + vb.w / 2, vb.y + vb.h / 2], 1.3);
      if (a === "fit") fitFull();
      if (a === "full") { var on = wrap.classList.toggle("full"); wrap.classList.toggle("solo", !opts.fullEl); if (opts.fullEl) opts.fullEl.classList.toggle("wb-fullhost", on); document.documentElement.classList.toggle("wb-lock", on); b.textContent = on ? "خروج من ملء الشاشة" : "ملء الشاشة"; if (opts.onFull) opts.onFull(on); setTimeout(function () { fitFull(); placeTool(); }, 60); }
    });
    function onKey(e) { if (e.key === "Escape" && wrap.classList.contains("full")) wrap.querySelector('[data-a="full"]').click(); if ((e.key === "Delete" || e.key === "Backspace") && sel && sel.k !== "pt" && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) { e.preventDefault(); var b = tool.querySelector('[data-t="del"]'); if (b) b.click(); } }
    document.addEventListener("keydown", onKey);
    function onResize() { if (wrap.classList.contains("full")) setTimeout(fitFull, 120); }
    window.addEventListener("resize", onResize);

    var api = {
      state: function () { return state; },
      reading: function () { return R; },
      load: function (layout) {   // put a ready circuit on the bench (the "show the solution" button)
        snap();
        state.parts = JSON.parse(JSON.stringify(layout.parts || {})); state.leads = JSON.parse(JSON.stringify(layout.leads || []));
        if (layout.set) deepSet(state.inst, layout.set);
        sel = null; commit();
      },
      set: function (s) { deepSet(state.inst, s); commit(); },
      setKit: function (k) { kit = k.slice(); render(); },
      reset: function () { state = fresh(); commit(); },
      refresh: render,
      /* used by the video generator (tools/videos): rings around points / slots / boxes, a fixed view, geometry */
      mark: function (list) { marks = list || []; render(); },
      view: function (x, y, w, h) { svg.setAttribute("viewBox", r2(x) + " " + r2(y) + " " + r2(w) + " " + r2(h)); },
      size: function () { return { W: W, H: H }; },
      point: function (id) { return P[id] ? P[id].slice() : null; },
      slot: function (id) { var g = slotGeom(id); return g ? { x: g.x, y: g.y, h: g.h } : null; },
      destroy: function () { document.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); document.documentElement.classList.remove("wb-lock"); if (opts.fullEl) opts.fullEl.classList.remove("wb-fullhost"); host.innerHTML = ""; }
    };
    function deepSet(t, s) { Object.keys(s).forEach(function (k) { if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) { t[k] = t[k] || {}; deepSet(t[k], s[k]); } else t[k] = s[k]; }); }
    render();
    return api;
  }

  CV.clabBench = { mount: mount, si: si, seg7: seg7 };
})(typeof window !== "undefined" ? window : globalThis);
