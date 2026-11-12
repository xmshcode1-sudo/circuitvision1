/* CircuitVision — the bench instruments' front panels.
   Every reading comes from the solved circuit: DC + the generator's fundamental from labsim, and for square and
   triangle waves the odd harmonics (each one solved at its own frequency; the circuit is linear apart from LEDs).
   Square waves use 32 odd harmonics with cubed Lanczos smoothing (overshoot under 0.1%), triangles 8 — the scope's measurements are taken
   from that waveform. */
(function () {
  "use strict";
  var B = CV.bench, C = CV.ac.C, si = CV.ac.si, num = CV.num;
  var host, cb, bench, solved, wave = null, rollBuf = [], rollT0 = performance.now();
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var PREF = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6 };
  function parseSI(s) { s = String(s).trim().replace(/,/g, ".").replace(/[ΩVAFHzh°\s]/g, ""); var m = /^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKM]?)$/.exec(s); return m ? parseFloat(m[1]) * (PREF[m[2]] || 1) : NaN; }
  function clean(v) { return Math.abs(v) < 1e-12 ? 0 : v; }

  /* ---------- harmonics ---------- */
  function harmonics() {
    var res = solved && solved.res; if (!res || !res.ok || !res.ac) return null;
    var lab = solved.c.lab, gens = lab.edges.filter(function (e) { return e.k === "GEN"; });
    var list = [{ h: 1, res: res, sigma: 1 }], maxH = 1;
    gens.forEach(function (g) { var m = g.wave === "square" ? 63 : g.wave === "triangle" ? 15 : 1; maxH = Math.max(maxH, m); });
    for (var h = 3; h <= maxH; h += 2) {
      var L = JSON.parse(JSON.stringify(lab)), any = false, sig = 1;
      L.edges.forEach(function (e) {
        if (e.k !== "GEN") return;
        var A = e.amp / B.FG_FIRST[e.wave || "sine"], a = 0;
        if (e.wave === "square") { sig = Math.pow(lanczos(h, 65), 3); a = A * 4 / Math.PI / h * (((h - 1) / 2) % 2 ? -1 : 1) * sig; }
        else if (e.wave === "triangle") a = A * 8 / (Math.PI * Math.PI) / (h * h);
        e.amp = a; e.freq = e.freq * h; e.phase = (e.phase || 0) * h; if (a) any = true;
      });
      if (!any) continue;
      var r = CV.labsim.solve(L, null); if (r.ok && r.ac) list.push({ h: h, res: r, sig: sig });
    }
    return { f: res.ac.f, list: list };
  }
  function lanczos(h, M) { var x = Math.PI * h / M; return Math.sin(x) / x; }
  // complex amplitude of v(p) − v(q) at each harmonic, plus DC
  function vparts(p, q) {
    var res = solved.res, dc = res.dcV(p) - (q ? res.dcV(q) : 0), comp = [];
    if (wave) wave.list.forEach(function (x) { var z = x.res.acV(p); if (q) z = C.sub(z, x.res.acV(q)); comp.push({ h: x.h, z: z, sig: x.sig || 1 }); });
    return { dc: dc, comp: comp };
  }
  function iparts(id) {
    var res = solved.res, x = res.el[id], dc = x ? x.i : 0, comp = [];
    if (wave) wave.list.forEach(function (w) { var y = w.res.el[id]; if (y && y.iac) comp.push({ h: w.h, z: y.iac, sig: w.sig || 1 }); });
    return { dc: dc, comp: comp };
  }
  function at(parts, t, f) { var v = parts.dc; parts.comp.forEach(function (c) { v += C.abs(c.z) * Math.cos(2 * Math.PI * f * c.h * t + C.arg(c.z) * Math.PI / 180); }); return v; }
  function acRms(parts) { var s = 0; parts.comp.forEach(function (c) { var m = C.abs(c.z) / (c.sig || 1); s += m * m / 2; }); return Math.sqrt(s); }

  /* ---------- panels ---------- */
  function opts(list, cur, fmt) { return list.map(function (v) { return '<option value="' + v + '"' + (Math.abs(v - cur) < 1e-15 ? " selected" : "") + '>' + fmt(v) + '</option>'; }).join(""); }
  function knob(id, label, val, unit, extra) { return '<label class="ins-f"><span>' + label + '</span><span class="ins-in"><input id="' + id + '" value="' + esc(val) + '" dir="ltr" inputmode="decimal" autocomplete="off"' + (extra || "") + '><b>' + unit + '</b></span></label>'; }
  function build() {
    var b = bench, o = "";
    // oscilloscope
    var sc = b.inst.sc;
    o += '<section class="ins ins-sc" aria-label="الأوسيلوسكوب"><header class="ins-h"><b>الأوسيلوسكوب</b><span class="ltr">2-CH · 1 MΩ</span><span class="sp"></span><button type="button" class="ins-btn" id="sc-auto">AUTO</button><button type="button" class="ins-btn' + (sc.run ? " on" : "") + '" id="sc-run">' + (sc.run ? "RUN" : "STOP") + '</button></header>' +
      '<div class="sc-body"><canvas id="sc-cv" width="640" height="400" aria-label="شاشة الأوسيلوسكوب"></canvas><div class="sc-ctl">' +
      [0, 1].map(function (i) {
        var c = sc.ch[i];
        return '<fieldset class="sc-ch ch' + (i + 1) + '"><legend><label><input type="checkbox" id="sc-on' + i + '"' + (c.on ? " checked" : "") + '> CH' + (i + 1) + '</label></legend>' +
          '<label class="ins-f"><span>VOLTS/DIV</span><select id="sc-v' + i + '" dir="ltr">' + opts(B.VSTEPS, c.vdiv, function (v) { return si(v, "V"); }) + '</select></label>' +
          '<label class="ins-f"><span>الاقتران</span><select id="sc-cp' + i + '" dir="ltr"><option' + (c.coup === "DC" ? " selected" : "") + '>DC</option><option' + (c.coup === "AC" ? " selected" : "") + '>AC</option><option' + (c.coup === "GND" ? " selected" : "") + '>GND</option></select></label>' +
          '<label class="ins-f"><span>الموضع (div)</span><input id="sc-p' + i + '" type="range" min="-4" max="4" step="0.2" value="' + c.pos + '"></label></fieldset>';
      }).join("") +
      '<fieldset class="sc-h"><legend>أفقي وتريقر</legend><label class="ins-f"><span>TIME/DIV</span><select id="sc-t" dir="ltr">' + opts(B.TSTEPS, sc.tdiv, function (v) { return si(v, "s"); }) + '</select></label>' +
      '<label class="ins-f"><span>المصدر</span><select id="sc-ts"><option value="0"' + (sc.trig.src === 0 ? " selected" : "") + '>CH1</option><option value="1"' + (sc.trig.src === 1 ? " selected" : "") + '>CH2</option></select></label>' +
      knob("sc-tl", "المستوى", num(sc.trig.level), "V") + '<label class="ins-f"><span>الحافة</span><select id="sc-te"><option value="+"' + (sc.trig.slope === "+" ? " selected" : "") + '>صاعدة ↗</option><option value="-"' + (sc.trig.slope === "-" ? " selected" : "") + '>هابطة ↘</option></select></label></fieldset>' +
      '</div></div><div class="sc-meas" id="sc-meas"></div></section>';
    // multimeters
    o += '<div class="ins-col">' + b.inst.dmm.map(function (m, i) {
      var n = i + 1, modes = [["VDC", "V⎓"], ["VAC", "V~"], ["ADC", "A⎓"], ["AAC", "A~"], ["OHM", "Ω"]];
      return '<section class="ins ins-dmm" aria-label="الملتيميتر ' + n + '"><header class="ins-h"><b>ملتيميتر ' + n + '</b><span class="ltr">True RMS</span></header>' +
        '<div class="dmm-lcd" id="dmm-lcd' + n + '"><span class="dmm-v ltr" id="dmm-v' + n + '">----</span><span class="dmm-m" id="dmm-m' + n + '"></span></div>' +
        '<div class="dmm-dial" role="radiogroup" aria-label="الوضع">' + modes.map(function (x) { return '<button type="button" role="radio" class="dmm-k' + (m.mode === x[0] ? " on" : "") + '" data-dmm="' + i + '" data-mode="' + x[0] + '" aria-checked="' + (m.mode === x[0]) + '">' + x[1] + '</button>'; }).join("") + '</div>' +
        '<p class="ins-note" id="dmm-n' + n + '"></p></section>';
    }).join("") + '</div>';
    // power supply
    o += '<section class="ins ins-ps" aria-label="مزود الجهد"><header class="ins-h"><b>مزود الجهد</b><span class="ltr">3 × 0–30 V · 0–3 A</span></header><div class="ps-chs">' +
      b.inst.ps.map(function (c, i) {
        var n = i + 1;
        return '<div class="ps-ch"><div class="ps-top"><b>CH' + n + '</b><span class="ps-cv" id="ps-mode' + n + '">CV</span><button type="button" class="ins-btn pwr' + (c.on ? " on" : "") + '" data-ps="' + i + '" aria-pressed="' + !!c.on + '">' + (c.on ? "ON" : "OFF") + '</button></div>' +
          '<div class="ps-lcd ltr"><span id="ps-v' + n + '">0.00 V</span><span id="ps-i' + n + '">0.000 A</span></div>' +
          knob("ps-sv" + i, "الجهد", num(c.v), "V") + knob("ps-si" + i, "حد التيار", si(c.ilim, "").trim(), "A") + '</div>';
      }).join("") + '</div><p class="ins-note">القنوات معزولة عن بعض. القناة تعطي الجهد المضبوط ما دام التيار أقل من الحد (CV)، وإذا طلب الحمل أكثر تثبّت التيار على الحد (CC). لتستخدمها مصدر تيار: اضبط الحد على التيار المطلوب وارفع الجهد.</p></section>';
    // function generator
    o += '<section class="ins ins-fg" aria-label="مولد الإشارة"><header class="ins-h"><b>مولد الإشارة</b><span class="ltr">2-CH</span></header><div class="fg-chs">' +
      b.inst.fg.map(function (c, i) {
        var n = i + 1;
        return '<div class="fg-ch ch' + n + '"><div class="ps-top"><b>CH' + n + '</b><span class="sp"></span><button type="button" class="ins-btn pwr' + (c.on ? " on" : "") + '" data-fg="' + i + '" aria-pressed="' + !!c.on + '">' + (c.on ? "ON" : "OFF") + '</button></div>' +
          '<div class="fg-w" role="radiogroup" aria-label="شكل الإشارة">' + [["sine", "جيبية", "M2 10 C6 -2 10 -2 14 10 S22 22 26 10"], ["square", "مربعة", "M2 16 V4 H14 V16 H26 V4"], ["triangle", "مثلثية", "M2 16 L8 4 L14 16 L20 4 L26 16"]].map(function (w) {
            return '<button type="button" role="radio" class="fg-wb' + (c.wave === w[0] ? " on" : "") + '" data-fgw="' + i + '" data-w="' + w[0] + '" aria-checked="' + (c.wave === w[0]) + '" title="' + w[1] + '"><svg viewBox="0 0 28 20"><path d="' + w[2] + '"/></svg><span>' + w[1] + '</span></button>';
          }).join("") + '</div>' +
          '<div class="fg-g">' + knob("fg-f" + i, "التردد", si(c.freq, "").trim(), "Hz") + knob("fg-a" + i, "السعة", num(c.vpp), "Vpp") + knob("fg-o" + i, "الإزاحة DC", num(c.offset), "V") + knob("fg-p" + i, "الطور", num(c.phase), "°") + '</div>' +
          '<label class="ins-f"><span>مقاومة الخرج</span><select id="fg-r' + i + '"><option value="50"' + (c.rs > 0 ? " selected" : "") + '>50 Ω (الجهاز الحقيقي)</option><option value="0"' + (c.rs > 0 ? "" : " selected") + '>0 Ω مثالي (للتجارب النظرية)</option></select></label></div>';
      }).join("") + '</div></section>';
    host.innerHTML = o;
    bindPanels();
  }
  function bindPanels() {
    var b = bench;
    function num0(id, set, ok) { var el = $(id); el.addEventListener("change", function () { var v = parseSI(el.value); if (!isFinite(v) || (ok && !ok(v))) { el.classList.add("bad"); return; } el.classList.remove("bad"); set(v); cb.changed(false); }); }
    b.inst.ps.forEach(function (c, i) {
      num0("ps-sv" + i, function (v) { c.v = v; }, function (v) { return v >= 0 && v <= 30; });
      num0("ps-si" + i, function (v) { c.ilim = v; }, function (v) { return v > 0 && v <= 3; });
    });
    host.querySelectorAll("[data-ps]").forEach(function (bt) { bt.addEventListener("click", function () { var c = b.inst.ps[+bt.dataset.ps]; c.on = !c.on; bt.classList.toggle("on", c.on); bt.textContent = c.on ? "ON" : "OFF"; bt.setAttribute("aria-pressed", c.on); cb.changed(false); }); });
    b.inst.fg.forEach(function (c, i) {
      num0("fg-f" + i, function (v) { c.freq = v; }, function (v) { return v >= 0.1 && v <= 1e7; });
      num0("fg-a" + i, function (v) { c.vpp = v; }, function (v) { return v >= 0 && v <= 20; });
      num0("fg-o" + i, function (v) { c.offset = v; }, function (v) { return Math.abs(v) <= 10; });
      num0("fg-p" + i, function (v) { c.phase = v; }, function (v) { return Math.abs(v) <= 360; });
      $("fg-r" + i).addEventListener("change", function () { c.rs = +this.value; cb.changed(false); });
    });
    host.querySelectorAll("[data-fg]").forEach(function (bt) { bt.addEventListener("click", function () { var c = b.inst.fg[+bt.dataset.fg]; c.on = !c.on; bt.classList.toggle("on", c.on); bt.textContent = c.on ? "ON" : "OFF"; bt.setAttribute("aria-pressed", c.on); cb.changed(false); }); });
    host.querySelectorAll("[data-fgw]").forEach(function (bt) { bt.addEventListener("click", function () { var i = +bt.dataset.fgw; b.inst.fg[i].wave = bt.dataset.w; host.querySelectorAll('[data-fgw="' + i + '"]').forEach(function (x) { x.classList.toggle("on", x === bt); x.setAttribute("aria-checked", x === bt); }); cb.changed(false); }); });
    host.querySelectorAll("[data-dmm]").forEach(function (bt) { bt.addEventListener("click", function () { var i = +bt.dataset.dmm; b.inst.dmm[i].mode = bt.dataset.mode; host.querySelectorAll('[data-dmm="' + i + '"]').forEach(function (x) { x.classList.toggle("on", x === bt); x.setAttribute("aria-checked", x === bt); }); cb.changed(false); }); });
    var sc = b.inst.sc;
    [0, 1].forEach(function (i) {
      $("sc-on" + i).addEventListener("change", function () { sc.ch[i].on = this.checked; cb.save(); });
      $("sc-v" + i).addEventListener("change", function () { sc.ch[i].vdiv = +this.value; cb.save(); });
      $("sc-cp" + i).addEventListener("change", function () { sc.ch[i].coup = this.value; cb.save(); });
      $("sc-p" + i).addEventListener("input", function () { sc.ch[i].pos = +this.value; cb.save(); });
    });
    $("sc-t").addEventListener("change", function () { sc.tdiv = +this.value; rollBuf = []; cb.save(); });
    $("sc-ts").addEventListener("change", function () { sc.trig.src = +this.value; cb.save(); });
    $("sc-te").addEventListener("change", function () { sc.trig.slope = this.value; cb.save(); });
    num0("sc-tl", function (v) { sc.trig.level = v; }, null);
    $("sc-run").addEventListener("click", function () { sc.run = !sc.run; this.textContent = sc.run ? "RUN" : "STOP"; this.classList.toggle("on", sc.run); cb.save(); });
    $("sc-auto").addEventListener("click", autoset);
  }

  /* ---------- scope ---------- */
  function chParts(i) {
    var c = solved && solved.c, st = c && c.info.sc[i];
    if (!st || !st.tip || !solved.res.ok) return null;
    return vparts(c.lab.probes["ch" + (i + 1)], st.ref);
  }
  function autoset() {
    var sc = bench.inst.sc, f = wave ? wave.f : null;
    [0, 1].forEach(function (i) {
      var p = chParts(i); if (!p) return;
      var lo = Infinity, hi = -Infinity, T = f ? 1 / f : 1; for (var k = 0; k < 400; k++) { var v = at(p, k / 400 * T, f || 0); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      var span = Math.max(hi - lo, Math.abs(hi), Math.abs(lo)); sc.ch[i].on = true; sc.ch[i].vdiv = B.niceV(Math.max(span, 1e-3) / 6); sc.ch[i].pos = 0;
      if (i === 0) sc.trig.level = Math.round(((hi + lo) / 2) * 1000) / 1000;
    });
    if (f) sc.tdiv = B.niceT(2 / f / 10);
    sc.trig.src = 0; build(); cb.save(); update();
  }
  function scopeFrame() {
    var cv = $("sc-cv"); if (!cv || !bench) return;
    var ctx = cv.getContext("2d"), W = cv.width, H = cv.height, sc = bench.inst.sc; ctx.direction = "ltr"; ctx.textAlign = "left";
    ctx.fillStyle = "#06140f"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(120,220,170,.16)"; ctx.lineWidth = 1;
    for (var i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke(); }
    for (i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, i * H / 8); ctx.lineTo(W, i * H / 8); ctx.stroke(); }
    ctx.strokeStyle = "rgba(120,220,170,.4)";
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    for (i = 0; i <= 50; i++) { ctx.beginPath(); ctx.moveTo(i * W / 50, H / 2 - 3); ctx.lineTo(i * W / 50, H / 2 + 3); ctx.stroke(); }
    ctx.font = "13px ui-monospace, monospace"; ctx.fillStyle = "rgba(200,255,225,.75)";
    var cols = ["#ffd400", "#25d7e6"], f = wave ? wave.f : null, span = sc.tdiv * 10;
    var parts = [chParts(0), chParts(1)];
    var roll = !f && span >= 0.5;
    if (roll && sc.run && solved && solved.res.ok) {
      var now = (performance.now() - rollT0) / 1000;
      rollBuf.push([now, parts.map(function (p) { return p ? p.dc : null; })]);
      while (rollBuf.length && rollBuf[0][0] < now - span) rollBuf.shift();
    }
    // trigger: time offset where the trigger channel crosses the level
    var t0 = 0;
    if (f && parts[sc.trig.src]) {
      var tp = parts[sc.trig.src], T = 1 / f, N = 720, prev = trace(tp, sc.ch[sc.trig.src].coup, 0, f);
      for (var k = 1; k <= N; k++) { var t = k / N * T, v = trace(tp, sc.ch[sc.trig.src].coup, t, f); if (sc.trig.slope === "+" ? prev < sc.trig.level && v >= sc.trig.level : prev > sc.trig.level && v <= sc.trig.level) { t0 = t; break; } prev = v; }
    }
    [0, 1].forEach(function (i) {
      var c = sc.ch[i], p = parts[i]; if (!c.on || !p) return;
      var y0 = H / 2 - c.pos * H / 8, k2 = H / 8 / c.vdiv;
      ctx.strokeStyle = cols[i]; ctx.lineWidth = 2; ctx.beginPath();
      if (roll) rollBuf.forEach(function (s, j) { var v = s[1][i]; if (v == null) return; var x = (s[0] - (rollBuf[rollBuf.length - 1][0] - span)) / span * W, y = y0 - (c.coup === "GND" ? 0 : c.coup === "AC" ? 0 : v) * k2; if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      else for (var j = 0; j <= 600; j++) { var tt = t0 + j / 600 * span, vv = f ? trace(p, c.coup, tt, f) : (c.coup === "DC" ? p.dc : 0), y = y0 - vv * k2; y = Math.max(-2, Math.min(H + 2, y)); if (j === 0) ctx.moveTo(j / 600 * W, y); else ctx.lineTo(j / 600 * W, y); }
      ctx.stroke();
      ctx.fillStyle = cols[i]; ctx.fillText("CH" + (i + 1) + " " + si(c.vdiv, "V") + "/div " + c.coup, 8 + i * 190, H - 10);
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(8, y0 - 5); ctx.lineTo(8, y0 + 5); ctx.fill();
    });
    ctx.fillStyle = "rgba(200,255,225,.8)"; ctx.fillText(si(sc.tdiv, "s") + "/div" + (roll ? " ROLL" : ""), W - 150, H - 10);
    if (f && parts[sc.trig.src] && sc.ch[sc.trig.src].on) { var ty = H / 2 - sc.ch[sc.trig.src].pos * H / 8 - sc.trig.level * H / 8 / sc.ch[sc.trig.src].vdiv; ctx.fillStyle = "#ff9b3d"; ctx.beginPath(); ctx.moveTo(W, ty); ctx.lineTo(W - 9, ty - 5); ctx.lineTo(W - 9, ty + 5); ctx.fill(); }
    if (!parts[0] && !parts[1]) { ctx.fillStyle = "rgba(200,255,225,.7)"; ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.fillText("صِل مجس CH1 أو CH2 بالدائرة (ومشبك الأرضي)", W / 2, H / 2 - 16); ctx.direction = "ltr"; ctx.textAlign = "left"; }
  }
  function trace(p, coup, t, f) { if (coup === "GND") return 0; var v = at(p, t, f); return coup === "AC" ? v - p.dc : v; }
  function measures() {
    var box = $("sc-meas"); if (!box) return;
    var f = wave ? wave.f : null, out = [], parts = [chParts(0), chParts(1)];
    [0, 1].forEach(function (i) {
      var p = parts[i]; if (!p) return;
      var c = bench.inst.sc.ch[i], T = f ? 1 / f : 1, N = 2000, lo = Infinity, hi = -Infinity, s = 0, s2 = 0;
      for (var k = 0; k < N; k++) { var v = f ? trace(p, c.coup, k / N * T, f) : trace(p, c.coup, 0, 0); lo = Math.min(lo, v); hi = Math.max(hi, v); s += v; s2 += v * v; }
      out.push('<div class="m ch' + (i + 1) + '"><b>CH' + (i + 1) + '</b><span>Vpp <i>' + si(clean(hi - lo), "V") + '</i></span><span>Vmax <i>' + si(clean(hi), "V") + '</i></span><span>Vmin <i>' + si(clean(lo), "V") + '</i></span><span>Vavg <i>' + si(clean(s / N), "V") + '</i></span><span>Vrms <i>' + si(c.coup === "GND" ? 0 : Math.sqrt((c.coup === "AC" ? 0 : p.dc * p.dc) + acRms(p) * acRms(p)), "V") + '</i></span>' + (f ? '<span>Freq <i>' + si(f, "Hz") + '</i></span>' : "") + '</div>');
    });
    if (f && parts[0] && parts[1] && parts[0].comp.length && parts[1].comp.length) {
      var z1 = parts[0].comp[0].z, z2 = parts[1].comp[0].z;
      if (C.abs(z1) > 1e-9 && C.abs(z2) > 1e-9) { var d = C.arg(z2) - C.arg(z1); while (d > 180) d -= 360; while (d <= -180) d += 360; out.push('<div class="m"><b>الطور</b><span>CH2 − CH1 <i>' + (Math.round(d * 10) / 10) + '°</i></span><span>Δt <i>' + si(Math.abs(d) / 360 / f, "s") + '</i></span></div>'); }
    }
    box.innerHTML = out.join("") || '<p class="ins-note">القياسات تظهر بعد توصيل مجس.</p>';
    box.querySelectorAll("i").forEach(function (x) { x.dir = "ltr"; });
  }

  /* ---------- meters ---------- */
  function lcd(v, unit) { if (!isFinite(v)) return "----"; return si(clean(v), unit); }
  function dmmUpdate() {
    var c = solved.c, res = solved.res;
    bench.inst.dmm.forEach(function (m, i) {
      var n = i + 1, st = c.info.dmm[i], out = "----", note = "", jv = "M" + n + "V", jc = "M" + n + "C", ja = "M" + n + "A";
      $("dmm-m" + n).textContent = { VDC: "V DC", VAC: "V AC (rms)", ADC: "A DC", AAC: "A AC (rms)", OHM: "Ω" }[m.mode];
      if (m.blown) { out = "FUSE"; note = 'احترق فيوز مقبس A: مرّ فيه أكثر من 10 A (غالبًا الأميتر موصول على التوازي مع مصدر). <button type="button" class="lk-btn" data-fuse="' + i + '">ركّب فيوز جديد</button>'; }
      else if (!res.ok) { note = "الدائرة غير قابلة للحل الآن."; }
      else if (/^V/.test(m.mode)) {
        if (st.a) note = "⚠ السلك الأحمر في مقبس A: هذا لقياس التيار ويقصر الدائرة. انقله إلى مقبس VΩ.";
        if (st.v && st.c) { var p = vparts(c.lab.edges.filter(function (e) { return e.id === "dmm" + n + "v"; })[0].a, c.lab.edges.filter(function (e) { return e.id === "dmm" + n + "v"; })[0].b); out = m.mode === "VDC" ? lcd(p.dc, "V") : lcd(acRms(p), "V"); }
        else if (!st.a) note = "صِل السلك الأحمر بمقبس VΩ والأسود بمقبس COM، ثم طرفيهما على التوازي مع العنصر.";
      } else if (/^A/.test(m.mode)) {
        if (st.a && st.c) { var ip = iparts("dmm" + n + "a"); out = m.mode === "ADC" ? lcd(ip.dc, "A") : lcd(acRms(ip), "A"); note = "الأميتر يُوصل على التوالي: افتح الدائرة وأدخله في الفتحة."; }
        else note = st.v ? "⚠ لقياس التيار انقل السلك الأحمر إلى مقبس A." : "صِل الأحمر بمقبس A والأسود بـ COM، وأدخل الجهاز على التوالي.";
      } else {
        var r = B.ohms(bench, n);
        if (r.state === "open") note = "صِل الأحمر بـ VΩ والأسود بـ COM على طرفي العنصر.";
        else if (r.state === "live") { out = "----"; note = "⚠ يوجد جهد على العنصر (" + si(r.v, "V") + "): افصل المصدر قبل قياس المقاومة، والقراءة الآن لا معنى لها."; }
        else if (r.state === "OL") out = "OL";
        else if (r.state === "ok") { out = lcd(r.r, "Ω"); note = "يقيس المقاومة المكافئة بين الطرفين بكل ما هو موصول بينهما."; }
        else note = "تعذّر القياس.";
      }
      $("dmm-v" + n).textContent = out; $("dmm-n" + n).innerHTML = note;
      var fb = host.querySelector('[data-fuse="' + i + '"]'); if (fb) fb.addEventListener("click", function () { m.blown = false; cb.changed(false); });
    });
  }
  function psUpdate() {
    var c = solved.c, res = solved.res;
    bench.inst.ps.forEach(function (ch, i) {
      var n = i + 1, x = res.ok ? res.el["ps" + n] : null, cc = !!solved.cc[n], v = 0, I = 0;
      if (ch.on) { v = ch.v; if (x) { if (cc) { v = x.v; I = ch.ilim; } else I = -x.i; } }
      $("ps-v" + n).textContent = (Math.round(clean(v) * 100) / 100).toFixed(2) + " V";
      $("ps-i" + n).textContent = (Math.round(clean(I) * 1000) / 1000).toFixed(3) + " A";
      var md = $("ps-mode" + n); md.textContent = cc ? "CC" : "CV"; md.className = "ps-cv" + (cc ? " cc" : "") + (ch.on ? " lit" : "");
    });
  }
  function update() {
    if (!host || !solved) return;
    wave = harmonics();
    if (!$("sc-cv")) build();
    dmmUpdate(); psUpdate(); measures();
  }
  CV.instruments = {
    init: function (el, callbacks) { host = el; cb = callbacks; },
    set: function (b, s, rebuild) { bench = b; solved = s; if (rebuild || !$("sc-cv")) build(); update(); },
    frame: function () { if (bench && solved) scopeFrame(); },
    vparts: function (p, q) { return vparts(p, q); }, harmonicsInfo: function () { return wave; }
  };
})();
