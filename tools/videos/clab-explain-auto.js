/* Circuits 1 labs 2–10: the acts are written from the lab's own plan (clab-plan.js): what is placed, which leads are drawn, how the
   instruments are set and what every reading is. English on screen is composed from that state; the Arabic of the plan's own panel text
   is the subtitle track. Lab 1 has hand-written beats (clab-explain-1.js). */
(function () {
  var AR = [["قراءة الأوميتر", "Ohmmeter"], ["من الألوان", "Colours"], ["% الخطأ", "Error %"], ["المقاس", "Measured"], ["المحسوب", "Calculated"], ["الجدول", "Table"], ["الدائرة", "Circuit"], ["المجموع", "Sum"],
    ["جهد المصدر", "Source voltage"], ["تيار المصدر", "Source current"], ["بدون حمل", "No load"], ["من المصدر", "from source"], ["في الدائرة الأصلية", "original circuit"], ["في مكافئ ثيفنن", "Thevenin equivalent"],
    ["مباشرة", "direct"], ["النتائج", "Results"], ["التيارات والجهود", "Currents and voltages"], ["تيارات الفروع", "Branch currents"], ["القياسات", "Measurements"], ["التيار", "Current"], ["التقسيمات", "divisions"],
    ["والمحسوب", "calculated"], ["على", "on"], ["في", "in"], ["و ", "and "]];
  function en(s) { s = String(s || ""); AR.forEach(function (p) { s = s.split(p[0]).join(p[1]); }); return s.replace(/\s+/g, " ").trim(); }
  var JACK = { "ps.m+": "MASTER +", "ps.m-": "MASTER −", "ps.s+": "SLAVE +", "ps.s-": "SLAVE −", "fg.out": "generator output", "fg.com": "generator ground", "sc.1": "CH1 probe", "sc.1g": "CH1 clip", "sc.2": "CH2 probe", "sc.2g": "CH2 clip",
    "d1.V": "Fluke VΩ", "d1.COM": "Fluke COM", "d1.A": "Fluke A", "d2.V": "PeakTech VΩ", "d2.COM": "PeakTech COM", "d2.mA": "PeakTech mA", "d2.10A": "PeakTech 10A", "rb.a": "decade box red", "rb.b": "decade box blue",
    "lb.a": "inductor box red", "lb.b": "inductor box blue", "cb.a": "capacitor box red", "cb.b": "capacitor box blue", "mn.L": "power meter L", "mn.N": "power meter N", "lamp.a": "lamp L", "lamp.b": "lamp N", "va.L": "variac L", "va.N": "variac N", "cc.1": "coil 1 terminal 1 (dot)", "cc.1'": "coil 1 terminal 1'", "cc.A": "coil 2 terminal A", "cc.B": "coil 2 terminal B",
    "tp.A": "transformer L1", "tp.B": "transformer L2", "tp.C": "transformer L3", "tp.N": "transformer N", "pm.1": "panel L1 in", "pm.2": "panel L2 in", "pm.3": "panel L3 in", "pm.N": "panel N in", "pm.1'": "panel L1 out", "pm.2'": "panel L2 out", "pm.3'": "panel L3 out", "pm.N'": "panel N out",
    "r1.a": "rheostat 1 a", "r1.w": "rheostat 1 w", "r2.a": "rheostat 2 a", "r2.w": "rheostat 2 w", "r3.a": "rheostat 3 a", "r3.w": "rheostat 3 w" };
  function jack(p) { if (JACK[p]) return JACK[p]; var m = /^t:(\d+):(\d+):(\d+)/.exec(p); if (m) return "board " + String.fromCharCode(64 + +m[2]) + m[1] + "·" + m[3]; return p; }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function lbl(pc) { return pc.lb || pc.name || (pc.t === "R" ? pc.v + " Ω" : pc.t); }
  var MODE = { vdc: "V⎓", vac: "V~", ohm: "Ω", adc: "A⎓", aac: "A~", madc: "mA⎓", maac: "mA~", off: "OFF", cap: "capacitance", diode: "diode" };
  function instDiff(a, b) {
    var out = []; a = a || {}; b = b || {};
    var ps = a.ps || {}, nps = b.ps || {};
    if (nps.m && (!ps.m || nps.m.v !== ps.m.v || nps.m.i !== ps.m.i)) out.push("MASTER " + nps.m.v + " V, limit " + nps.m.i + " A");
    if (nps.s && ps.s && (nps.s.v !== ps.s.v)) out.push("SLAVE " + nps.s.v + " V");
    if (nps.mode && ps.mode && nps.mode !== ps.mode) out.push("supply mode " + nps.mode);
    if (ps.on !== nps.on && nps.on !== undefined) out.push(nps.on ? "press OUTPUT" : "output off");
    ["d1", "d2"].forEach(function (k) { if (a[k] && b[k] && a[k].mode !== b[k].mode) out.push((k === "d1" ? "Fluke" : "PeakTech") + " to " + (MODE[b[k].mode] || b[k].mode)); });
    if (a.fg && b.fg && (a.fg.f !== b.fg.f || a.fg.vpp !== b.fg.vpp || a.fg.w !== b.fg.w || a.fg.on !== b.fg.on)) out.push("generator " + b.fg.f + " Hz, " + b.fg.vpp + " Vpp " + b.fg.w);
    ["rb", "lb", "cb"].forEach(function (k) { if (a[k] && b[k] && !same(a[k].d, b[k].d)) out.push({ rb: "resistance", lb: "inductance", cb: "capacitance" }[k] + " box set"); });
    if (a.va && b.va && a.va.v !== b.va.v) out.push("variac " + b.va.v + " V");
    if (a.sc && b.sc && !same(a.sc, b.sc)) out.push("oscilloscope adjusted");
    ["r1", "r2", "r3"].forEach(function (k) { if (a[k] && b[k] && a[k].x !== b[k].x) out.push(k.toUpperCase() + " rheostat " + b[k].x + " Ω"); });
    return out;
  }
  function sentence(s) { return s.charAt(0).toUpperCase() + s.slice(1) + "."; }
  function build(P) {
    var acts = [], prev = { parts: {}, leads: [], inst: null }, i = 1, n = P.length - 1;
    acts.push({ type: "title", chip: (P.__chip || "Circuits 1 · Lab ") + P.__n, h1: P.__en.replace(/(,| and | — )/, "<br>$1"), go: "In this lab you will", goals: P.__goals || [["Build the circuit part by part on the bench"], ["Take every reading with the instruments, wired the right way"], ["Compare what you measure with the theory"]],
      beats: [["Welcome to this " + (P.__course || "Circuits 1") + " lab. We work on the real bench, one wire at a time.", (P[0].lines || []).join(" ")], ["By the end you will have taken all the readings and checked them against theory.", ""]] });
    while (i < n) {
      var s = P[i], st = s.state, run = [i];
      while (i + run.length < n) { var q = P[i + run.length]; if (q.panel.table && s.panel.table && q.panel.table.title === s.panel.table.title && same(q.state.parts, st.parts) && same(q.state.leads, st.leads) && !same(q.state.inst, P[run[run.length - 1]].state.inst)) run.push(i + run.length); else break; }
      var added = Object.keys(st.parts).filter(function (k) { return !prev.parts[k] || !same(prev.parts[k], st.parts[k]); }), newL = st.leads.filter(function (l) { return !prev.leads.some(function (m) { return (m[0] === l[0] && m[1] === l[1]) || (m[0] === l[1] && m[1] === l[0]); }); });
      var d = instDiff(prev.inst, st.inst), bt = [], pn = s.panel, lines = (pn.lines || []).slice(), ar = (pn.steps || []).concat(lines);
      if (added.length) bt.push("Place " + added.map(function (k) { return lbl(st.parts[k]); }).join(", ") + " on the board.");
      if (newL.length) bt.push("Connect " + newL.slice(0, 3).map(function (l) { return jack(l[0]) + " to " + jack(l[1]); }).join("; ") + (newL.length > 3 ? "; and " + (newL.length - 3) + " more." : "."));
      if (d.length && run.length < 2) bt.push(sentence(d.slice(0, 3).join(", ")));
      if (run.length > 1) bt.push("Change the source one step at a time and read every row of the table.");
      if (pn.sub && !/[؀-ۿ]/.test(pn.sub)) bt.push("Reading: " + pn.sub.replace(/\s{2,}/g, "  "));
      if (!bt.length) bt.push(pn.title && !/[؀-ۿ]/.test(pn.title) ? pn.title : "Look at the bench.");
      var tb = (run.length > 1 ? P[run[run.length - 1]] : s).panel.table, a = { type: run.length > 1 ? "sweep" : "bench", kick: en(pn.title).replace(/[؀-ۿ]+/g, "").trim() || "Step", beats: bt.map(function (b, k) { return [b, k === bt.length - 1 ? ar.slice(k).join(" ") : (ar[k] || "")]; }) };
      if (run.length > 1) { a.steps = run; a.stepDur = 1.7; } else a.p = i;
      if (tb) a.table = { from: run.length > 1 ? run[run.length - 1] : i, title: en(tb.title), head: (tb.head || []).map(en), labels: tb.rows.map(function (r) { return en(r.label); }), top: 372 };
      acts.push(a);
      var lastS = P[run[run.length - 1]].state; prev = { parts: lastS.parts, leads: lastS.leads, inst: lastS.inst }; i += run.length;
    }
    acts.push({ type: "end", rows: P.__end || [["Build the circuit part by part, wire by wire."], ["Wire each meter where it must go: voltmeter across, ammeter in series."], ["Compare every reading with theory and explain any difference."]], beats: [["That is the whole lab, from the bench.", (P[n].lines || []).join(" ")]] });
    return acts;
  }
  window.CLX_AUTO = { build: build };
  if (window.CLX_SKIP_C1) return;
  for (var k = 2; k <= 10; k++) (function (k) {
    LX.add("clab-lab" + k, { exp: "exp" + k, hdr: "Circuits 1 · Lab", title: "Experiment " + k, acts: function (P) { var e = LX.PLAN["exp" + k]; var arr = P.slice(); arr.__n = k; arr.__en = e.en; return build(arr); } });
  })(k);
})();
