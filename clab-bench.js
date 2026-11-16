/* CircuitVision — Circuits 1 lab bench, drawn after the university's bench:
   a plug-in board of 3×3 socket tiles (each tile is one node) with plug-in component blocks and bridging plugs,
   a 2-channel DC supply (master/slave), two digital multimeters, a function generator, a 2-channel oscilloscope,
   decade resistance / inductance / capacitance boxes, and (Lab 10) the mains panel with its power meter and a fluorescent lamp.
   Interaction: tap a socket or a terminal, then another one → a banana lead. Tap the gap between two tiles → put a part there.
   Tap a knob, a dial or a button → its control. CV.clabBench.mount(el, opts) → api. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {}, S = CV.clabSim;
  var NS = "http://www.w3.org/2000/svg";
  var COLS = 9, ROWS = 6, PX = 124, PY = 112, BX = 410, BY = 296;
  function tc(r, c) { return [BX + 82 + c * PX, BY + 76 + r * PY]; }
  var SOCK = [[-27, -27], [0, -27], [27, -27], [-27, 0], [0, 0], [27, 0], [-27, 27], [0, 27], [27, 27]];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f1(x) { return Math.round(x * 10) / 10; }
  function si(v, u) {
    var a = Math.abs(v), p = a >= 1e6 ? [1e6, "M"] : a >= 1e3 ? [1e3, "k"] : a >= 1 || a === 0 ? [1, ""] : a >= 1e-3 ? [1e-3, "m"] : a >= 1e-6 ? [1e-6, "µ"] : [1e-9, "n"];
    var n = v / p[0]; return (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1).replace(/\.0$/, "") : n.toFixed(2).replace(/\.?0+$/, "")) + " " + p[1] + u;
  }
  var VDIV = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10], TDIV = [1e-6, 2e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2];
  var DIAL = {
    d1: [["off", "OFF"], ["vac", "V~"], ["vdc", "V⎓"], ["mv", "mV⎓"], ["ohm", "Ω"], ["aac", "A~"], ["adc", "A⎓"]],
    d2: [["off", "OFF"], ["vdc", "V⎓"], ["vac", "V~"], ["ohm", "Ω"], ["madc", "mA⎓"], ["maac", "mA~"], ["adc", "10A⎓"], ["aac", "10A~"]]
  };
  var DIAL_AR = { off: "إيقاف", vac: "جهد متردد (RMS)", vdc: "جهد مستمر", mv: "جهد مستمر صغير (mV)", ohm: "مقاومة", aac: "تيار متردد (A)", adc: "تيار مستمر (A)", madc: "تيار مستمر (mA)", maac: "تيار متردد (mA)" };

  function mount(host, opts) {
    opts = opts || {};
    var inst = opts.inst || ["ps", "d1", "d2", "rb"], KEY = "cv-clab-" + (opts.key || "free");
    var kit = (opts.kit || []).slice();
    var state = load() || fresh(), sel = null, selLead = -1, last = null, P = {};
    function fresh() { return { parts: {}, leads: [], inst: S.defaults() }; }
    function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.inst) { var d = S.defaults(); Object.keys(d).forEach(function (k) { if (!s.inst[k]) s.inst[k] = d[k]; }); return s; } } catch (e) {} return null; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
    function has(k) { return inst.indexOf(k) > -1; }

    host.innerHTML = '<div class="cb-wrap"><div class="cb-bar"><span class="cb-hint" id="cb-hint"></span><span class="cb-acts">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-a="del" disabled>احذف السلك</button><button type="button" class="btn btn-ghost btn-sm" data-a="leads">امسح الأسلاك</button><button type="button" class="btn btn-ghost btn-sm" data-a="clear">لوحة فارغة</button></span></div>' +
      '<div class="cb-stage"><svg class="cb-svg" viewBox="0 0 1600 ' + (inst.indexOf("mn") > -1 ? 290 : 1100) + '" role="img" aria-label="طاولة معمل الدوائر"></svg><div class="cb-pop" hidden></div></div>' +
      (has("sc") ? '<div class="cb-scope-big"><b>شاشة الأوسيلوسكوب مكبّرة</b><div class="cb-scr"></div></div>' : "") +
      '<ul class="cb-warn" aria-live="polite"></ul></div>';
    var svg = host.querySelector(".cb-svg"), pop = host.querySelector(".cb-pop"), stage = host.querySelector(".cb-stage");

    /* ---------- drawing helpers ---------- */
    var out = [];
    function o(s) { out.push(s); }
    function rect(x, y, w, h, cls, rx, extra) { o('<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '"' + (extra || "") + '/>'); }
    function text(t, x, y, cls, anchor) { o('<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '">' + esc(t) + '</text>'); }
    function jack(id, x, y, color, label) {
      P[id] = [x, y];
      o('<g class="cb-pt' + (sel === id ? " sel" : "") + '" data-p="' + id + '"><circle class="cb-jk cb-' + color + '" cx="' + x + '" cy="' + y + '" r="11"/><circle class="cb-jh" cx="' + x + '" cy="' + y + '" r="4.5"/>' +
        '<circle class="cb-hit" cx="' + x + '" cy="' + y + '" r="18"/></g>');
      if (label) text(label, x, y + 27, "cb-lbl");
    }
    function knob(ctl, x, y, r, label, val) {
      o('<g class="cb-ctl" data-c="' + ctl + '"><circle class="cb-knob" cx="' + x + '" cy="' + y + '" r="' + r + '"/><line class="cb-knob-l" x1="' + x + '" y1="' + (y - r + 5) + '" x2="' + x + '" y2="' + (y - r + 14) + '"/><circle class="cb-hit" cx="' + x + '" cy="' + y + '" r="' + (r + 8) + '"/></g>');
      if (label) text(label, x, y + r + 16, "cb-lbl");
      if (val !== undefined) text(val, x, y + r + 31, "cb-val");
    }
    function button(ctl, x, y, w, h, label, cls) { o('<g class="cb-ctl" data-c="' + ctl + '"><rect class="cb-btn ' + (cls || "") + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5"/><text class="cb-btn-t" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 5) + '" text-anchor="middle">' + esc(label) + '</text></g>'); }
    function seg(t, x, y, cls, anchor) { text(t, x, y, "cb-seg " + (cls || ""), anchor || "end"); }

    /* ---------- render ---------- */
    var R = null;
    function render() {
      R = S.read(state, { only: inst });
      out = []; P = {};
      if (!has("mn")) drawBoard();
      if (has("ps")) drawPS(16, 16);
      if (has("fg")) drawFG(532, 16);
      if (has("sc")) drawScope(878, 16);
      if (has("mn")) drawMains(16, 16);
      if (has("d1")) drawDMM("d1", 16, 296);
      if (has("d2")) drawDMM("d2", 205, 296);
      if (has("rb")) drawDecade("rb", 16, 650, "DECADE RESISTANCE BOX", ["×1 kΩ", "×100 Ω", "×10 Ω", "×1 Ω"], state.inst.rb.d, si(S.rbValue(state.inst), "Ω"));
      if (has("lb")) drawDecade("lb", 16, 870, "DECADE INDUCTANCE BOX", ["×10 mH", "×1 mH", "×0.1 mH"], state.inst.lb.d, si(S.lbValue(state.inst), "H"));
      if (has("cb")) drawDecade("cb", has("mn") ? 990 : 16, has("mn") ? 40 : has("lb") ? 650 : 870, "DECADE CAPACITANCE BOX", ["×1 µF", "×0.1 µF"], state.inst.cb.d, si(S.cbValue(state.inst), "F"));
      drawLeads();
      svg.innerHTML = out.join("");
      drawWarnings();
      if (has("sc")) host.querySelector(".cb-scr").innerHTML = '<svg viewBox="0 0 520 400" class="cb-scr-svg">' + scopeScreen(0, 0, 520, 400, true) + "</svg>";
      host.querySelector('[data-a="del"]').disabled = selLead < 0;
      host.querySelector("#cb-hint").textContent = sel ? "اختر الطرف الثاني للسلك (أو اضغط نفس النقطة للإلغاء)." : selLead >= 0 ? "سلك محدد: احذفه من الزر." : "اضغط فتحة ثم فتحة ثانية لتوصيل سلك · اضغط الفراغ بين مربعين لتركيب قطعة · اضغط أي مقبض أو زر لضبطه.";
      if (opts.onChange) opts.onChange(api);
    }

    function drawBoard() {
      rect(BX, BY, COLS * PX + 32, ROWS * PY + 112, "cb-board", 14);
      text("PLUG-IN BOARD 297 × 300", BX + COLS * PX + 18, BY + ROWS * PY + 104, "cb-brd-t", "end");
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
        var C = tc(r, c);
        o('<path class="cb-tl" d="M' + (C[0] - 27) + ' ' + (C[1] - 27) + 'h54v54h-54zM' + C[0] + ' ' + (C[1] - 27) + 'v54M' + (C[0] - 27) + ' ' + C[1] + 'h54"/>');
        SOCK.forEach(function (d, k) {
          var id = "t:" + r + ":" + c + ":" + k, x = C[0] + d[0], y = C[1] + d[1]; P[id] = [x, y];
          o('<g class="cb-pt cb-sk' + (sel === id ? " sel" : "") + '" data-p="' + id + '"><circle class="cb-hole" cx="' + x + '" cy="' + y + '" r="5.5"/><circle class="cb-hit" cx="' + x + '" cy="' + y + '" r="12"/></g>');
        });
      }
      // two long rails along the bottom
      for (var k = 0; k < 2; k++) {
        var y = BY + ROWS * PY + 40 + k * 30;
        o('<line class="cb-rail" x1="' + (BX + 30) + '" y1="' + y + '" x2="' + (BX + COLS * PX) + '" y2="' + y + '"/>');
        for (var q = 0; q < 18; q++) { var id = "rail:" + k + ":" + q, x = BX + 44 + q * ((COLS * PX - 40) / 17); P[id] = [x, y];
          o('<g class="cb-pt cb-sk' + (sel === id ? " sel" : "") + '" data-p="' + id + '"><circle class="cb-hole" cx="' + f1(x) + '" cy="' + y + '" r="5.5"/><circle class="cb-hit" cx="' + f1(x) + '" cy="' + y + '" r="12"/></g>'); }
      }
      // slots (gaps between tiles) and the parts in them
      for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
        var A = tc(r, c);
        if (c < COLS - 1) slot("h:" + r + ":" + c, A[0] + PX / 2, A[1], true);
        if (r < ROWS - 1) slot("v:" + r + ":" + c, A[0], A[1] + PY / 2, false);
      }
    }
    function slot(id, x, y, h) {
      var pc = state.parts[id];
      if (!pc) { o('<g class="cb-slot" data-s="' + id + '"><rect class="cb-slot-hit" x="' + (h ? x - 20 : x - 34) + '" y="' + (h ? y - 34 : y - 15) + '" width="' + (h ? 40 : 68) + '" height="' + (h ? 68 : 30) + '" rx="6"/></g>'); return; }
      o('<g class="cb-part" data-s="' + id + '" transform="translate(' + x + ' ' + y + ')' + (h ? "" : " rotate(90)") + '">');
      if (pc.t === "W") { rect(-46, -20, 92, 40, "cb-blk-w", 5); o('<line class="cb-bar-l" x1="-34" y1="0" x2="34" y2="0"/>'); }
      else {
        rect(-48, -24, 96, 48, "cb-blk", 6); rect(-44, -21, 88, 22, "cb-blk-top", 3);
        if (pc.t === "R" && pc.bands) {
          o('<line class="cb-lead-w" x1="-40" y1="-10" x2="40" y2="-10"/><rect class="cb-rbody" x="-24" y="-17" width="48" height="14" rx="6"/>');
          pc.bands.forEach(function (b, i) { o('<rect x="' + (-17 + i * 9 + (i === 3 ? 5 : 0)) + '" y="-17" width="4" height="14" fill="' + b + '"/>'); });
        } else if (pc.t === "R") { o('<rect class="cb-sym" x="-16" y="-15" width="32" height="10" fill="none"/><line class="cb-sym" x1="-34" y1="-10" x2="-16" y2="-10"/><line class="cb-sym" x1="16" y1="-10" x2="34" y2="-10"/>'); }
        else if (pc.t === "L") { o('<path class="cb-sym" fill="none" d="M-34 -10h8q4 -10 8 0q4 -10 8 0q4 -10 8 0q4 -10 8 0h10"/>'); }
        else if (pc.t === "C") { o('<path class="cb-sym" d="M-34 -10h30M-4 -18v16M4 -18v16M4 -10h30"/>'); }
        text(pc.bands ? "" : (pc.t === "R" ? si(pc.v, "Ω") : pc.t === "L" ? si(pc.v, "H") : si(pc.v, "F")), 0, 17, "cb-blk-t");
      }
      o('<rect class="cb-hit" x="-48" y="-24" width="96" height="48"/></g>');
    }

    function drawPS(x, y) {
      var st = state.inst.ps, ps = R.ps;
      rect(x, y, 500, 250, "cb-dev cb-ps", 10);
      text("DC POWER SUPPLY  2 × 0–16 V / 2 × 0–5 A", x + 490, y + 20, "cb-dev-t", "end");
      rect(x + 14, y + 28, 472, 58, "cb-disp", 6);
      [["m", x + 22], ["s", x + 256]].forEach(function (a) {
        var ch = ps[a[0]], on = st.on;
        seg(on ? Math.abs(ch.i).toFixed(2) : "", a[1] + 92, y + 70, "g"); text("A", a[1] + 100, y + 70, "cb-segu", "start");
        seg(on ? Math.abs(ch.v).toFixed(1) : "", a[1] + 196, y + 70, "g"); text("V", a[1] + 204, y + 70, "cb-segu", "start");
        o('<circle class="cb-led ' + (on && ch.cc ? "on-r" : "") + '" cx="' + (a[1] + 30) + '" cy="' + (y + 80) + '" r="3.5"/>'); text("CC", a[1] + 42, y + 83, "cb-tiny", "start");
        o('<circle class="cb-led ' + (on && !ch.cc ? "on-g" : "") + '" cx="' + (a[1] + 150) + '" cy="' + (y + 80) + '" r="3.5"/>'); text("CV", a[1] + 162, y + 83, "cb-tiny", "start");
      });
      rect(x + 14, y + 96, 472, 92, "cb-face", 8);
      text("MASTER", x + 130, y + 108, "cb-tiny"); text("SLAVE", x + 368, y + 108, "cb-tiny");
      knob("ps.m.i", x + 100, y + 136, 20, "A", st.m.i.toFixed(2) + " A"); knob("ps.m.v", x + 170, y + 136, 20, "V", st.m.v.toFixed(1) + " V");
      knob("ps.s.i", x + 330, y + 136, 20, "A", st.s.i.toFixed(2) + " A"); knob("ps.s.v", x + 400, y + 136, 20, "V", st.s.v.toFixed(1) + " V");
      text("NORMAL", x + 250, y + 126, "cb-tiny"); text("SERIES", x + 250, y + 140, "cb-tiny cb-dim"); text("PARALLEL", x + 250, y + 154, "cb-tiny cb-dim");
      button("ps.out", x + 20, y + 120, 54, 28, "OUTPUT", st.on ? "on" : "");
      o('<circle class="cb-led ' + (st.on ? "on-r" : "") + '" cx="' + (x + 47) + '" cy="' + (y + 162) + '" r="4"/>');
      jack("ps.m-", x + 78, y + 216, "blue"); jack("ps.m.e", x + 128, y + 216, "yel"); jack("ps.m+", x + 178, y + 216, "red");
      jack("ps.s-", x + 322, y + 216, "blue"); jack("ps.s.e", x + 372, y + 216, "yel"); jack("ps.s+", x + 422, y + 216, "red");
      text("−", x + 78, y + 244, "cb-lbl"); text("⏚", x + 128, y + 244, "cb-lbl"); text("+", x + 178, y + 244, "cb-lbl");
      text("−", x + 322, y + 244, "cb-lbl"); text("⏚", x + 372, y + 244, "cb-lbl"); text("+", x + 422, y + 244, "cb-lbl");
    }
    function drawFG(x, y) {
      var st = state.inst.fg;
      rect(x, y, 330, 250, "cb-dev cb-fg", 10);
      text("FUNCTION GENERATOR", x + 316, y + 22, "cb-dev-t cb-dark", "end");
      rect(x + 16, y + 34, 150, 46, "cb-disp", 5);
      var fz = st.f >= 1000 ? (st.f / 1000).toFixed(3) + " kHz" : st.f.toFixed(1) + " Hz";
      seg(st.on ? fz.split(" ")[0] : "", x + 130, y + 66, "r"); text(st.on ? fz.split(" ")[1] : "", x + 136, y + 66, "cb-segu r", "start");
      text("SINE ∿", x + 248, y + 52, "cb-tiny cb-dark");
      knob("fg.f", x + 64, y + 128, 24, "FREQUENCY", fz);
      knob("fg.a", x + 160, y + 128, 24, "AMPLITUDE", st.vpp.toFixed(1) + " Vpp");
      button("fg.on", x + 246, y + 104, 64, 30, st.on ? "ON" : "OFF", st.on ? "on" : "");
      text("OUTPUT 50 Ω", x + 260, y + 172, "cb-tiny cb-dark");
      jack("fg.out", x + 236, y + 204, "red", "OUT"); jack("fg.com", x + 290, y + 204, "blk", "⏚");
    }
    function drawScope(x, y) {
      var st = state.inst.sc;
      rect(x, y, 706, 250, "cb-dev cb-sc", 10);
      text("DIGITAL STORAGE OSCILLOSCOPE · 2 CH", x + 16, y + 22, "cb-dev-t", "start");
      o(scopeScreen(x + 16, y + 30, 300, 210, false));
      var bx = x + 334;
      button("sc.c1", bx, y + 36, 74, 30, "CH1", st.c1.on ? "on-y" : ""); button("sc.c2", bx + 84, y + 36, 74, 30, "CH2", st.c2.on ? "on-c" : "");
      button("sc.t", bx + 168, y + 36, 84, 30, "TIME/DIV"); button("sc.cur", bx + 262, y + 36, 92, 30, "CURSOR", st.cur ? "on" : "");
      button("sc.math", bx, y + 76, 74, 30, "MATH", st.math ? "on" : ""); button("sc.meas", bx + 84, y + 76, 74, 30, "MEASURE", st.meas ? "on" : "");
      text("CH1 " + si(st.c1.vd, "V") + "/div · " + st.c1.cp, bx, y + 132, "cb-tiny", "start"); text("CH2 " + si(st.c2.vd, "V") + "/div · " + st.c2.cp, bx + 184, y + 132, "cb-tiny", "start");
      text("M " + si(st.td, "s") + "/div", bx, y + 150, "cb-tiny", "start");
      jack("sc.1", bx + 30, y + 196, "yel", "CH1"); jack("sc.1g", bx + 80, y + 196, "blk", "⏚");
      jack("sc.2", bx + 180, y + 196, "cyan", "CH2"); jack("sc.2g", bx + 230, y + 196, "blk", "⏚");
      text("مقطع الأرضي متصل بأرضي المبنى", bx + 290, y + 226, "cb-tiny", "start");
    }
    function scopeScreen(x, y, w, h, big) {
      var st = state.inst.sc, sc = R.sc, s = [], gx = w / 10, gy = (h - (big ? 54 : 30)) / 8, H8 = gy * 8, oy = y + 4, ox = x;
      s.push('<rect class="cb-scr-bg" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>');
      for (var i = 0; i <= 10; i++) s.push('<line class="cb-grid' + (i === 5 ? " c" : "") + '" x1="' + f1(ox + i * gx) + '" y1="' + oy + '" x2="' + f1(ox + i * gx) + '" y2="' + f1(oy + H8) + '"/>');
      for (i = 0; i <= 8; i++) s.push('<line class="cb-grid' + (i === 4 ? " c" : "") + '" x1="' + ox + '" y1="' + f1(oy + i * gy) + '" x2="' + f1(ox + w) + '" y2="' + f1(oy + i * gy) + '"/>');
      if (!sc) return s.join("");
      var w0 = sc.w, ph0 = sc.c1.ac && S.mag(sc.c1.ac) > 1e-6 ? S.ang(sc.c1.ac) : sc.c2.ac && S.mag(sc.c2.ac) > 1e-6 ? S.ang(sc.c2.ac) : 0;
      function wave(c, vd, cls) {
        var pts = [], m = S.mag(c.ac), a = S.ang(c.ac) - ph0;
        for (var k = 0; k <= 200; k++) {
          var t = k / 200 * 10 * st.td, v = c.dc + (w0 ? m * Math.sin(w0 * t + a) : 0), yy = oy + H8 / 2 - v / vd * gy;
          yy = Math.max(oy - 2, Math.min(oy + H8 + 2, yy)); pts.push(f1(ox + k / 200 * w) + "," + f1(yy));
        }
        s.push('<polyline class="' + cls + '" points="' + pts.join(" ") + '"/>');
      }
      if (st.c1.on) wave(sc.c1, st.c1.vd, "cb-tr1");
      if (st.c2.on) wave(sc.c2, st.c2.vd, "cb-tr2");
      if (st.math) wave({ dc: sc.c1.dc + sc.c2.dc, ac: S.add(sc.c1.ac, sc.c2.ac) }, st.c1.vd, "cb-trm");
      var by = y + h - (big ? 12 : 6), fs = big ? "cb-scr-t big" : "cb-scr-t";
      s.push('<text class="' + fs + ' y" x="' + (x + 6) + '" y="' + by + '">CH1 ' + esc(si(st.c1.vd, "V")) + '</text><text class="' + fs + ' c" x="' + (x + w * 0.27) + '" y="' + by + '">CH2 ' + esc(si(st.c2.vd, "V")) + '</text><text class="' + fs + '" x="' + (x + w * 0.56) + '" y="' + by + '">M ' + esc(si(st.td, "s")) + '</text>');
      if (st.cur) {
        [st.x1, st.x2].forEach(function (d) { s.push('<line class="cb-cur" x1="' + f1(ox + d * gx) + '" y1="' + oy + '" x2="' + f1(ox + d * gx) + '" y2="' + f1(oy + H8) + '"/>'); });
        var dt = Math.abs(st.x2 - st.x1) * st.td;
        s.push('<text class="' + fs + ' m" x="' + (x + 6) + '" y="' + (oy + 14) + '">Δx: ' + esc(si(dt, "s")) + '   1/Δx: ' + (dt ? esc(si(1 / dt, "Hz")) : "—") + '</text>');
      }
      if (st.meas) {
        var lines = [];
        [["CH1", sc.c1, st.c1], ["CH2", sc.c2, st.c2]].forEach(function (q) {
          if (!q[2].on) return; var m = S.mag(q[1].ac);
          lines.push(q[0] + ": " + (m > 1e-4 ? "Vpp " + si(2 * m, "V") + " · Vrms " + si(m / Math.SQRT2, "V") + " · f " + (sc.f ? si(sc.f, "Hz") : "—") : "Mean " + si(q[1].dc, "V")));
        });
        lines.forEach(function (l, i) { s.push('<text class="' + fs + ' m" x="' + (x + w - 6) + '" y="' + (oy + 14 + i * (big ? 18 : 12) + (st.cur ? (big ? 18 : 12) : 0)) + '" text-anchor="end">' + esc(l) + '</text>'); });
      }
      return s.join("");
    }
    function drawMains(x, y) {
      var st = state.inst.mn, m = R.mn;
      rect(x, y, 600, 250, "cb-dev cb-mn", 10);
      text("AC SUPPLY 220 V / 60 Hz · POWER METER", x + 586, y + 22, "cb-dev-t", "end");
      rect(x + 20, y + 36, 300, 150, "cb-pm", 8);
      [["V", m && st.on ? m.v.toFixed(1) : "0.0"], ["A", m && st.on ? m.i.toFixed(3) : "0.000"], ["W", m && st.on ? m.p.toFixed(1) : "0.0"], ["PF", m && st.on ? m.pf.toFixed(2) : "—"]].forEach(function (r, i) {
        seg(r[1], x + 250, y + 70 + i * 32, "g"); text(r[0], x + 262, y + 70 + i * 32, "cb-segu", "start");
      });
      button("mn.on", x + 350, y + 60, 90, 36, st.on ? "ON" : "OFF", st.on ? "on" : "");
      text("⚠ DANGER 220 V", x + 350, y + 130, "cb-tiny cb-badt", "start");
      jack("mn.L", x + 380, y + 200, "red", "L"); jack("mn.N", x + 440, y + 200, "blue", "N");
      // the fluorescent lamp, wired after the power meter
      var lx = x + 640, ly = y + 40;
      rect(lx, ly, 300, 180, "cb-dev", 10); text("FLUORESCENT LAMP 20 W + BALLAST", lx + 150, ly + 22, "cb-dev-t");
      rect(lx + 30, ly + 60, 240, 26, "cb-tube " + (st.on ? "lit" : ""), 13);
      jack("lamp.a", lx + 110, ly + 140, "red", "a"); jack("lamp.b", lx + 190, ly + 140, "blue", "b");
      o('<path class="cb-lead red fixed" d="M' + (x + 380) + ' ' + (y + 200) + 'C' + (x + 420) + ' ' + (y + 290) + ',' + (lx + 60) + ' ' + (ly + 220) + ',' + (lx + 110) + ' ' + (ly + 140) + '"/>');
      o('<path class="cb-lead blue fixed" d="M' + (x + 440) + ' ' + (y + 200) + 'C' + (x + 480) + ' ' + (y + 300) + ',' + (lx + 140) + ' ' + (ly + 230) + ',' + (lx + 190) + ' ' + (ly + 140) + '"/>');
    }
    function drawDMM(d, x, y) {
      var st = state.inst[d], rd = R[d], fl = d === "d1", w = fl ? 180 : 180, h = 330;
      rect(x, y, w, h, "cb-dev " + (fl ? "cb-fluke" : "cb-peak"), 18);
      rect(x + 14, y + 14, w - 28, 230, "cb-dmm-face", 12);
      text(fl ? "TRUE RMS MULTIMETER" : "DIGITAL MULTIMETER", x + w / 2, y + 32, "cb-tiny cb-w");
      rect(x + 24, y + 40, w - 48, 58, "cb-lcd", 6);
      seg(rd.text || "", x + w - 30, y + 82, "lcd"); text(rd.text ? ({ vdc: "V⎓", mv: "mV⎓", vac: "V~", ohm: "Ω", adc: "A⎓", aac: "A~", madc: "mA⎓", maac: "mA~" })[st.mode] || "" : "", x + 32, y + 92, "cb-lcd-u", "start");
      var cx = x + w / 2, cy = y + 170, DL = DIAL[d], k = DL.map(function (z) { return z[0]; }).indexOf(st.mode);
      o('<g class="cb-ctl" data-c="' + d + '.dial"><circle class="cb-dial" cx="' + cx + '" cy="' + cy + '" r="44"/>');
      DL.forEach(function (z, i) { var a = -150 + i * (300 / (DL.length - 1)), r = 58, tx = cx + r * Math.sin(a * Math.PI / 180), ty = cy - r * Math.cos(a * Math.PI / 180) + 4; o('<text class="cb-dial-t' + (i === k ? " on" : "") + '" x="' + f1(tx) + '" y="' + f1(ty) + '" text-anchor="middle">' + esc(z[1]) + '</text>'); });
      var a0 = (-150 + Math.max(0, k) * (300 / (DL.length - 1))) * Math.PI / 180;
      o('<line class="cb-dial-p" x1="' + cx + '" y1="' + cy + '" x2="' + f1(cx + 36 * Math.sin(a0)) + '" y2="' + f1(cy - 36 * Math.cos(a0)) + '"/><circle class="cb-hit" cx="' + cx + '" cy="' + cy + '" r="66"/></g>');
      if (fl) { jack("d1.A", x + 40, y + 284, "red", "A"); jack("d1.COM", x + 90, y + 284, "blk", "COM"); jack("d1.V", x + 140, y + 284, "red", "VΩ"); }
      else { jack("d2.10A", x + 30, y + 284, "red", "10A"); jack("d2.mA", x + 72, y + 284, "red", "mA"); jack("d2.COM", x + 114, y + 284, "blk", "COM"); jack("d2.V", x + 156, y + 284, "red", "VΩ"); }
      var blown = st.blown && Object.keys(st.blown).filter(function (j) { return st.blown[j]; });
      if (blown && blown.length) text("الفيوز محروق (" + blown.join("، ") + ")", x + w / 2, y + 320, "cb-tiny cb-badt");
    }
    function drawDecade(id, x, y, title, labels, digits, total) {
      rect(x, y, 378, 200, "cb-dev cb-dec", 10);
      text(title, x + 189, y + 22, "cb-dev-t");
      labels.forEach(function (l, i) { var kx = x + 48 + i * (labels.length === 4 ? 78 : labels.length === 3 ? 100 : 130); knob(id + ".k" + i, kx, y + 80, 26); text(l, kx, y + 122, "cb-lbl cb-w"); text(String(digits[i]), kx, y + 86, "cb-knob-d"); });
      text("= " + total, x + 150, y + 172, "cb-val big");
      jack(id + ".a", x + 300, y + 168, "red"); jack(id + ".b", x + 344, y + 168, "blk");
    }
    function leadColor(l, i) {
      var s = l.join(" ");
      if (/(\+|\.V\b|\.A\b|\.mA|\.10A|sc\.1\b|sc\.2\b|fg\.out|\.a\b|mn\.L|lamp\.a)/.test(s)) return /(-|COM|g\b|com|\.b\b|mn\.N|lamp\.b|\.e\b)/.test(s) && !/(\+|fg\.out)/.test(s) ? "blue" : "red";
      if (/(-|COM|com|g\b|\.b\b|\.e\b)/.test(s)) return "blue";
      return i % 2 ? "blue" : "red";
    }
    function drawLeads() {
      (state.leads || []).forEach(function (l, i) {
        var a = P[l[0]], b = P[l[1]]; if (!a || !b) return;
        var d = Math.hypot(b[0] - a[0], b[1] - a[1]), sag = 30 + d * 0.18, col = leadColor(l, i);
        var path = "M" + f1(a[0]) + " " + f1(a[1]) + "C" + f1(a[0]) + " " + f1(a[1] + sag) + "," + f1(b[0]) + " " + f1(b[1] + sag) + "," + f1(b[0]) + " " + f1(b[1]);
        o('<g class="cb-lead-g' + (i === selLead ? " sel" : "") + '" data-l="' + i + '"><path class="cb-lead-hit" d="' + path + '"/><path class="cb-lead-sh" d="' + path + '"/><path class="cb-lead ' + col + '" d="' + path + '"/>' +
          '<rect class="cb-plug ' + col + '" x="' + f1(a[0] - 6) + '" y="' + f1(a[1] - 6) + '" width="12" height="16" rx="3"/><rect class="cb-plug ' + col + '" x="' + f1(b[0] - 6) + '" y="' + f1(b[1] - 6) + '" width="12" height="16" rx="3"/></g>');
      });
    }
    var WARN = {
      short: function (w) { return ["bad", "المصدر " + (w.ch === "m" ? "MASTER" : "SLAVE") + " في وضع CC وجهده تقريبًا صفر: فيه دائرة قصر. غالبًا الأميتر موصول على التوازي، أو سلك يقصر الطرفين."]; },
      cc: function (w) { return ["warn", "المصدر " + (w.ch === "m" ? "MASTER" : "SLAVE") + " وصل لحد التيار (CC)، فجهده أقل من المضبوط. ارفع مقبض A أو راجع الدائرة."]; },
      fuse: function (w) { return ["bad", "احترق فيوز مدخل " + w.j + " في " + (w.d === "d1" ? "الملتيميتر الأول" : "الملتيميتر الثاني") + ": مرّ فيه تيار أكبر من حده. الأميتر يتوصل على التوالي دائمًا."]; },
      leadAlert: function (w) { return ["warn", "في " + (w.d === "d1" ? "الملتيميتر الأول" : "الملتيميتر الثاني") + " سلك في مدخل التيار (A أو mA) والمفتاح على غير التيار. مدخل التيار مقاومته شبه صفر: لو لمست به جهدًا تعمل قصرًا."]; },
      ohmLive: function (w) { return ["warn", "لا تقيس المقاومة والدائرة موصولة بمصدر شغال: القراءة غلط وقد تتلف الجهاز. افصل المصدر أو أطفئه أولًا."]; },
      noJack: function (w) { return ["info", "المفتاح على التيار، لكن ما فيه سلك في مدخل A أو mA."]; },
      hot: function (w) { return ["warn", "المقاومة " + si(w.nom, "Ω") + " تسخن: قدرتها " + w.p.toFixed(2) + " W وهي مصممة لـ 2 W. خفّض الجهد."]; },
      earth: function (w) { return ["bad", "تيار يمر في أرضي " + (w.id === "fg.gnd" ? "مولد الإشارة" : "الأوسيلوسكوب") + ": المقطع الأسود للمجس على عقدة غير عقدة الأرضي (الطرف الأسود للمولد). كل المقاطع السوداء لازم تكون على نفس العقدة."]; }
    };
    function drawWarnings() {
      var ul = host.querySelector(".cb-warn"), seen = {};
      ul.innerHTML = R.warn.map(function (w) {
        var k = w.k + (w.d || "") + (w.ch || "") + (w.id || ""); if (seen[k]) return ""; seen[k] = 1;
        var m = WARN[w.k] ? WARN[w.k](w) : ["info", w.k];
        return '<li class="' + m[0] + '">' + esc(m[1]) + (w.k === "fuse" ? ' <button type="button" class="btn btn-ghost btn-sm" data-fuse="' + w.d + '">بدّل الفيوز</button>' : "") + "</li>";
      }).join("");
      ul.querySelectorAll("[data-fuse]").forEach(function (b) { b.onclick = function () { state.inst[b.dataset.fuse].blown = {}; commit(); }; });
    }

    /* ---------- interaction ---------- */
    function commit() { save(); render(); }
    function svgPoint(evt) { var r = svg.getBoundingClientRect(); return [(evt.clientX - r.left) * 1600 / r.width, (evt.clientY - r.top) * 1600 / r.width]; }
    svg.addEventListener("click", function (evt) {
      var t = evt.target.closest("[data-p],[data-s],[data-c],[data-l]"); closePop();
      if (!t) { sel = null; selLead = -1; render(); return; }
      if (t.dataset.p) {
        var p = t.dataset.p; selLead = -1;
        if (!sel) sel = p;
        else if (sel === p) sel = null;
        else { if (!state.leads.some(function (l) { return (l[0] === sel && l[1] === p) || (l[0] === p && l[1] === sel); })) state.leads.push([sel, p]); sel = null; save(); }
        render(); return;
      }
      if (t.dataset.l) { selLead = +t.dataset.l; sel = null; render(); return; }
      if (t.dataset.s) { partMenu(t.dataset.s, evt); return; }
      if (t.dataset.c) { control(t.dataset.c, evt); }
    });
    host.querySelector('[data-a="del"]').onclick = function () { if (selLead >= 0) { state.leads.splice(selLead, 1); selLead = -1; commit(); } };
    host.querySelector('[data-a="leads"]').onclick = function () { state.leads = []; selLead = -1; sel = null; commit(); };
    host.querySelector('[data-a="clear"]').onclick = function () { var keepInst = state.inst; state = fresh(); state.inst = keepInst; state.inst.ps.on = false; sel = null; selLead = -1; commit(); };

    function openPop(evt, html) {
      pop.innerHTML = '<button type="button" class="cb-pop-x" aria-label="إغلاق">×</button>' + html; pop.hidden = false;
      var r = stage.getBoundingClientRect(), x = evt.clientX - r.left, y = evt.clientY - r.top, pw = Math.min(300, r.width - 16);
      pop.style.width = pw + "px"; pop.style.left = Math.max(8, Math.min(r.width - pw - 8, x - pw / 2)) + "px"; pop.style.top = Math.max(8, Math.min(r.height - 60, y + 14)) + "px";
      pop.querySelector(".cb-pop-x").onclick = closePop;
    }
    function closePop() { pop.hidden = true; pop.innerHTML = ""; }

    function partMenu(slotId, evt) {
      var cur = state.parts[slotId], used = {};
      Object.keys(state.parts).forEach(function (k) { var p = state.parts[k]; if (p && p.id && p.t !== "W") used[p.id] = k; });
      var items = kit.map(function (pc) {
        var busy = used[pc.id] && used[pc.id] !== slotId;
        var name = pc.t === "R" ? (pc.bands ? "مقاومة ملوّنة " + pc.name : si(pc.v, "Ω") + (pc.n ? " (" + pc.n + ")" : "")) : pc.t === "L" ? "ملف " + si(pc.v, "H") : pc.t === "C" ? "مكثف " + si(pc.v, "F") : pc.name;
        return '<button type="button" class="cb-item' + (cur && cur.id === pc.id ? " cur" : "") + '" data-pc="' + pc.id + '"' + (busy ? " disabled" : "") + '>' + esc(name) + (busy ? ' <small>على اللوحة</small>' : "") + '</button>';
      }).join("");
      openPop(evt, '<b>ركّب قطعة هنا</b><div class="cb-items"><button type="button" class="cb-item" data-pc="W">قابس توصيل (سلك قصير)</button>' + items + '</div>' + (cur ? '<button type="button" class="btn btn-ghost btn-sm" data-rm>شيل القطعة</button>' : ""));
      pop.querySelectorAll("[data-pc]").forEach(function (b) { b.onclick = function () {
        var id = b.dataset.pc; state.parts[slotId] = id === "W" ? { t: "W", id: "W" } : JSON.parse(JSON.stringify(kit.filter(function (k) { return k.id === id; })[0])); closePop(); commit(); }; });
      var rm = pop.querySelector("[data-rm]"); if (rm) rm.onclick = function () { delete state.parts[slotId]; closePop(); commit(); };
    }

    function slider(label, val, min, max, step, unit, set, fmt) {
      var id = "cbs" + Math.random().toString(36).slice(2, 7);
      var h = '<label class="cb-sl" for="' + id + '"><span>' + esc(label) + '</span><span class="cb-sl-row"><button type="button" class="btn btn-ghost btn-sm" data-st="-">−</button><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><button type="button" class="btn btn-ghost btn-sm" data-st="+">+</button></span>' +
        '<span class="cb-sl-row"><input type="number" class="input ltr" step="' + step + '" min="' + min + '" max="' + max + '" value="' + val + '"> <span class="ltr">' + esc(unit) + '</span></span></label>';
      return { html: h, wire: function () {
        var rg = pop.querySelector("#" + id), wrap = rg.closest(".cb-sl"), nb = wrap.querySelector('input[type="number"]');
        function apply(v) { v = Math.max(min, Math.min(max, Math.round(v / step) * step)); v = +v.toFixed(6); rg.value = v; nb.value = fmt ? fmt(v) : v; set(v); save(); render(); }
        rg.oninput = function () { apply(+rg.value); }; nb.onchange = function () { apply(+nb.value); };
        wrap.querySelectorAll("[data-st]").forEach(function (b) { b.onclick = function (e) { e.preventDefault(); apply(+rg.value + (b.dataset.st === "+" ? step : -step)); }; });
      } };
    }
    function control(c, evt) {
      var I = state.inst, sl, html = "", wires = [];
      function add(s) { html += s.html; wires.push(s.wire); }
      if (c === "ps.out") { I.ps.on = !I.ps.on; commit(); return; }
      if (c === "fg.on") { I.fg.on = !I.fg.on; commit(); return; }
      if (c === "mn.on") { I.mn.on = !I.mn.on; commit(); return; }
      var m = /^ps\.([ms])\.([vi])$/.exec(c);
      if (m) { var ch = I.ps[m[1]]; add(m[2] === "v" ? slider((m[1] === "m" ? "MASTER" : "SLAVE") + " · الجهد", ch.v, 0, 16, 0.1, "V", function (v) { ch.v = v; })
                                                     : slider((m[1] === "m" ? "MASTER" : "SLAVE") + " · حد التيار", ch.i, 0, 5, 0.01, "A", function (v) { ch.i = v; })); }
      else if (c === "fg.f") { html += '<div class="cb-pre">' + [50, 60, 100, 500, 1000, 2000, 5000, 10000].map(function (f) { return '<button type="button" class="btn btn-ghost btn-sm" data-f="' + f + '">' + si(f, "Hz") + '</button>'; }).join("") + '</div>'; add(slider("التردد", I.fg.f, 10, 20000, 10, "Hz", function (v) { I.fg.f = v; })); }
      else if (c === "fg.a") add(slider("السعة (من القمة للقمة، بدون حمل)", I.fg.vpp, 0, 20, 0.1, "Vpp", function (v) { I.fg.vpp = v; }));
      else if (/^d[12]\.dial$/.test(c)) {
        var d = c.slice(0, 2);
        html += '<b>مفتاح الملتيميتر</b><div class="cb-items">' + DIAL[d].map(function (z) { return '<button type="button" class="cb-item' + (I[d].mode === z[0] ? " cur" : "") + '" data-m="' + z[0] + '"><b class="ltr">' + esc(z[1]) + '</b> ' + esc(DIAL_AR[z[0]]) + '</button>'; }).join("") + '</div>';
        if (I[d].blown && Object.keys(I[d].blown).some(function (j) { return I[d].blown[j]; })) html += '<button type="button" class="btn btn-ghost btn-sm" data-fz>بدّل الفيوز</button>';
        openPop(evt, html);
        pop.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { I[d].mode = b.dataset.m; closePop(); commit(); }; });
        var fz = pop.querySelector("[data-fz]"); if (fz) fz.onclick = function () { I[d].blown = {}; closePop(); commit(); };
        return;
      }
      else if ((m = /^(rb|lb|cb)\.k(\d)$/.exec(c))) { var box = I[m[1]], k = +m[2]; add(slider("الخانة", box.d[k], 0, 9, 1, "", function (v) { box.d[k] = v; })); }
      else if (c === "sc.c1" || c === "sc.c2") {
        var cc = I.sc[c.slice(3)];
        html += '<b>' + c.slice(3).toUpperCase() + '</b><div class="cb-pre"><button type="button" class="btn btn-ghost btn-sm" data-on>' + (cc.on ? "إخفاء القناة" : "إظهار القناة") + '</button>' + ["DC", "AC", "GND"].map(function (k2) { return '<button type="button" class="btn btn-sm ' + (cc.cp === k2 ? "btn-primary" : "btn-ghost") + '" data-cp="' + k2 + '">' + k2 + '</button>'; }).join("") + '</div>';
        add(slider("الحساسية (V/div)", VDIV.indexOf(cc.vd), 0, VDIV.length - 1, 1, "", function (v) { cc.vd = VDIV[v]; }, function (v) { return VDIV[v]; }));
        openPop(evt, html); wires.forEach(function (w) { w(); });
        pop.querySelector("[data-on]").onclick = function () { cc.on = !cc.on; closePop(); commit(); };
        pop.querySelectorAll("[data-cp]").forEach(function (b) { b.onclick = function () { cc.cp = b.dataset.cp; closePop(); commit(); }; });
        return;
      }
      else if (c === "sc.t") add(slider("الزمن لكل تقسيمة (s/div)", TDIV.indexOf(I.sc.td), 0, TDIV.length - 1, 1, "", function (v) { I.sc.td = TDIV[v]; }, function (v) { return si(TDIV[v], "s"); }));
      else if (c === "sc.cur") { I.sc.cur = true; add(slider("المؤشر x1 (تقسيمات)", I.sc.x1, 0, 10, 0.02, "div", function (v) { I.sc.x1 = v; })); add(slider("المؤشر x2 (تقسيمات)", I.sc.x2, 0, 10, 0.02, "div", function (v) { I.sc.x2 = v; }));
        html += '<button type="button" class="btn btn-ghost btn-sm" data-off>أخفِ المؤشرات</button>'; }
      else if (c === "sc.math") { I.sc.math = !I.sc.math; commit(); return; }
      else if (c === "sc.meas") { I.sc.meas = !I.sc.meas; commit(); return; }
      else return;
      openPop(evt, html); wires.forEach(function (w) { w(); });
      pop.querySelectorAll("[data-f]").forEach(function (b) { b.onclick = function () { I.fg.f = +b.dataset.f; closePop(); commit(); }; });
      var off = pop.querySelector("[data-off]"); if (off) off.onclick = function () { I.sc.cur = false; closePop(); commit(); };
      if (c === "sc.cur") commit();
    }

    var api = {
      state: function () { return state; },
      reading: function () { return R; },
      load: function (layout) {   // put a ready circuit on the bench (the "show the solution" button)
        state.parts = JSON.parse(JSON.stringify(layout.parts || {})); state.leads = JSON.parse(JSON.stringify(layout.leads || []));
        if (layout.set) deepSet(state.inst, layout.set);
        sel = null; selLead = -1; commit();
      },
      set: function (s) { deepSet(state.inst, s); commit(); },
      setKit: function (k) { kit = k.slice(); },
      reset: function () { state = fresh(); commit(); },
      refresh: render,
      destroy: function () { host.innerHTML = ""; }
    };
    function deepSet(t, s) { Object.keys(s).forEach(function (k) { if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) { t[k] = t[k] || {}; deepSet(t[k], s[k]); } else t[k] = s[k]; }); }
    render();
    return api;
  }

  CV.clabBench = { mount: mount, si: si };
})(typeof window !== "undefined" ? window : globalThis);
