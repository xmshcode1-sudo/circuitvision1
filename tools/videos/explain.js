/* CircuitVision — animated explainer engine for the Circuits 1 lesson videos (c1-*.mp4).
   A lesson's video is a script of items (concept, derivation, worked example, note, quiz, summary) written in
   tools/videos/c1-explain-*.js. On screen everything is English; every beat also carries its Arabic, which
   explain-render.py writes to the video's Arabic subtitle track (c1-*.ar.vtt) at the beat's exact time.
   Every frame is a pure function of time: EX.frame(id, t) draws the frame at t seconds and reports whether anything
   is still moving, so the renderer only screenshots frames that change. Circuits are the lesson's own figures,
   redrawn with their parts tagged so a beat can light the part it talks about. */
(function () {
  "use strict";
  var CV = window.CV, EX = window.EX = { S: {}, add: function (id, items) { EX.S[id] = items; } };
  var BUSY = false;
  function seg(t, a, b) { var x = (t - a) / (b - a); if (x > 0 && x < 1) BUSY = true; return x < 0 ? 0 : x > 1 ? 1 : x; }
  function eo(x) { return 1 - Math.pow(1 - x, 3); }
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function words(s) { return String(s || "").replace(/<[^>]+>|[\\@][a-z]+/gi, " ").split(/\s+/).filter(Boolean).length; }
  function dur(en, min) { return Math.max(min || 3.2, Math.min(9, 1.6 + words(en) * 0.27)); }

  /* ---------- maths: a small TeX-like markup ----------
     \frac{a}{b}  \sqrt{x}  x_{sub}  x^{sup}  \c1{..} \c2{..} \c3{..} \hl{..} (colours)  \mk{..} (marked)  \bx{..} (boxed)
     \text{..}  \cdot \times \Omega \omega \theta \phi \angle \deg \approx \to \pm \par (parallel) \inf \Sigma \Delta \pi \mu …
     @ may stand for \\ (easier to type). Single letters are variables (italic) unless they follow a number (units: 5 V, 2 A); longer runs are upright (cos, eq). */
  var SYM = { cdot: "·", times: "×", Omega: "Ω", omega: "ω", theta: "θ", phi: "φ", alpha: "α", beta: "β", angle: "∠", deg: "°", pm: "±", to: "→", Rightarrow: "⇒",
    approx: "≈", ne: "≠", le: "≤", ge: "≥", inf: "∞", par: "∥", Sigma: "Σ", Delta: "Δ", pi: "π", mu: "μ", minus: "−", lt: "&lt;", gt: "&gt;", int: "∫", ldots: "…",
    prime: "′", quad: "&emsp;", tau: "τ", lambda: "λ", rho: "ρ", parallel: "∥", left: "(", right: ")", Leftrightarrow: "⇔", sigma: "σ", eps: "ε", check: "✓", cross: "✗", ast: "*", Re: "Re", Im: "Im" };
  // words set upright; any other run of letters is a product of variables (vi, dq), set in italic
  var UPRIGHT = /^(cos|sin|tan|max|min|eq|rms|avg|Th|N|total|dc|ac|Re|Im|ln|log|exp|dB|kWh|Wh|Hz|rad|VA|VAR|kVA|kVAR|kW|MW|mA|mH|mF|kV|pf|pF|nF|uF|ms|min|Hz|eff|in|out|of|and|or|if)$/;
  // after a number, only these read as units; any other letter there is still a variable (10 i, 2 R)
  var UNITS = /^(V|A|W|J|C|s|S|F|H|Hz|VA|VAR|kVA|kVAR|kW|MW|kV|kWh|Wh|mA|mH|mF|mS|ms|min|rad|k|m|M|h|kHz|dB)$/;
  var OPS = { "=": 1, "+": 1, "−": 1, "→": 1, "≈": 1, "⇒": 1, "×": 1, "·": 1, "≤": 1, "≥": 1, "±": 1 };
  function M(s, sub) {
    s = String(s); var i = 0, out = "", lastNum = false;
    function group() { while (s[i] === " ") i++; if (s[i] !== "{") { var ch = s[i++]; return ch === "\\" || ch === "@" ? "@" + name() : ch; } var d = 1, j = ++i; while (j < s.length && d) { if (s[j] === "{") d++; else if (s[j] === "}") d--; j++; } var g = s.slice(i, j - 1); i = j; return g; }
    function name() { var j = i; while (j < s.length && /[A-Za-z]/.test(s[j])) j++; if (s.slice(i, j) === "c" && /[0-9]/.test(s[j] || "")) j++; var n = s.slice(i, j); i = j; return n; }
    function op(c) { return OPS[c] ? '<span class="mo">' + c + "</span>" : c; }
    while (i < s.length) {
      var c = s[i];
      if (c === "\\" || c === "@") {
        i++; var n = name();
        if (n === "frac") { var a = group(), b = group(); out += '<span class="fr"><span>' + M(a, sub) + "</span><span>" + M(b, sub) + "</span></span>"; lastNum = false; }
        else if (n === "sqrt") out += '√<span class="sq">' + M(group(), sub) + "</span>";
        else if (/^(c1|c2|c3|hl|mk|dim|bx)$/.test(n)) out += '<span class="' + n + '">' + M(group(), sub) + "</span>";
        else if (n === "text") { out += '<span class="tx">' + esc(group()) + "</span>"; lastNum = false; }
        else if (SYM[n] !== undefined) { var y = SYM[n]; out += /^(Omega|mu)$/.test(n) ? y : op(y); if (!/^(Omega|mu|deg)$/.test(n)) lastNum = false; }
        else out += esc(n);
        continue;
      }
      if (c === "_" || c === "^") { i++; var g = group(); out += (c === "_" ? "<sub>" : "<sup>") + M(g, true) + (c === "_" ? "</sub>" : "</sup>"); continue; }
      if (/[A-Za-z]/.test(c)) { var j = i; while (j < s.length && /[A-Za-z]/.test(s[j])) j++; var w = s.slice(i, j); i = j; out += (sub || (lastNum && UNITS.test(w)) || UPRIGHT.test(w)) ? '<span class="tx">' + w + "</span>" : "<i>" + w + "</i>"; if (!lastNum) lastNum = false; continue; }
      if (/[0-9.]/.test(c)) { var k = i; while (k < s.length && /[0-9.,]/.test(s[k]) && !(s[k] === "," && !/[0-9]/.test(s[k + 1] || ""))) k++; out += '<span class="nu">' + s.slice(i, k) + "</span>"; i = k; lastNum = true; continue; }
      if (c === " ") { out += " "; i++; continue; }
      if (c === "-") { var pv = out.replace(/<[^>]+>/g, "").replace(/\s+$/, "").slice(-1); out += (!pv || /[=+−×·(∠≈⇒→,]/.test(pv)) ? "−" : op("−"); i++; lastNum = false; continue; }
      if (c === "*") { out += op("·"); i++; lastNum = false; continue; }
      out += op(esc(c)); i++; if (!/[()\s]/.test(c)) lastNum = false;
    }
    return out;
  }
  EX.M = M;
  /* Prose: $...$ inside a sentence is maths. */
  function P(s) { return String(s || "").replace(/\$([^$]+)\$/g, function (_, m) { return '<span class="mi">' + M(m) + "</span>"; }); }
  EX.P = P;

  /* ---------- the lesson's own figures ---------- */
  function figsOf(id) {
    var L = CV.lessons[id]; if (L._exFigs) return L._exFigs;
    var draw = [], raw = [];
    L.sections.forEach(function (s) { var d = document.createElement("div"); d.innerHTML = s.html; d.querySelectorAll(".lfig").forEach(function (f) { raw.push(f.outerHTML); f.querySelectorAll("svg[data-fig]").forEach(function (v) { draw.push(CV.FIGS[+v.getAttribute("data-fig")]); }); }); });
    return (L._exFigs = { draw: draw, raw: raw });
  }
  /* Drawn graphs for the AC chapters: a sinusoid against time, and phasors on the complex plane. */
  var COL = { c1: "#7fa8ff", c2: "#3fb6ff", c3: "#ffb547", w: "#eaf0ff" };
  function sub(t) { return String(t).replace(/_([A-Za-z0-9]+)/g, '<tspan baseline-shift="sub" font-size="68%">$1</tspan>'); }
  function waveSVG(o) {
    var W0 = 60, W1 = 960, Y0 = 300, A = 200, cyc = o.cycles || 2, leg = 0, out = '<svg class="gr" viewBox="0 0 1000 580">' +
      '<path d="M' + W0 + ' ' + Y0 + ' H' + (W1 + 10) + ' M' + W0 + ' 50 V530" style="stroke:#5a6a90;stroke-width:3;fill:none"/><text x="975" y="' + (Y0 + 8) + '" class="gl">t</text>';
    (o.curves || []).forEach(function (c) {
      var d = ""; for (var x = 0; x <= W1 - W0; x += 4) { var th = 2 * Math.PI * cyc * x / (W1 - W0) * (c.f || 1) + (c.ph || 0) * Math.PI / 180; d += (x ? " L" : "M") + (W0 + x) + " " + (Y0 - ((c.off || 0) + (c.a || 1) * Math.cos(th)) * A).toFixed(1); }
      if (c.off !== undefined) out += '<path d="M' + W0 + ' ' + (Y0 - c.off * A).toFixed(1) + ' H' + W1 + '" style="stroke:' + (COL[c.c] || COL.c2) + ';stroke-width:3;stroke-dasharray:12 10;fill:none;opacity:.8"/>';
      out += '<path d="' + d + '" style="fill:none;stroke:' + (COL[c.c] || COL.c2) + ';stroke-width:6;stroke-linejoin:round"/>';
      if (c.label) { out += '<path d="M' + (W1 - 250 + leg * 85) + ' 40 h34" style="stroke:' + (COL[c.c] || COL.c2) + ';stroke-width:6"/><text x="' + (W1 - 208 + leg * 85) + '" y="52" class="gl" style="fill:' + (COL[c.c] || COL.c2) + '">' + sub(c.label) + "</text>"; leg++; }
    });
    if (o.marks) { var c0 = o.curves[0], a0 = c0.a || 1, ph = (c0.ph || 0), x0 = ((-ph / 360) % 1 + 1) % 1 * (W1 - W0) / cyc, per = (W1 - W0) / cyc;
      out += '<path d="M' + W0 + ' ' + (Y0 - a0 * A) + ' H' + (W0 + x0 + per) + '" style="stroke:#8e9cc0;stroke-width:2.5;stroke-dasharray:10 8;fill:none"/><text x="' + (W0 + 14) + '" y="' + (Y0 - a0 * A - 16) + '" class="gl">' + (o.mlabel || "Vm") + "</text>";
      out += '<path d="M' + (W0 + x0) + ' ' + (Y0 + a0 * A + 30) + ' H' + (W0 + x0 + per) + ' M' + (W0 + x0) + ' ' + (Y0 + a0 * A + 18) + ' v24 M' + (W0 + x0 + per) + ' ' + (Y0 + a0 * A + 18) + ' v24" style="stroke:#ffb547;stroke-width:3;fill:none"/><text x="' + (W0 + x0 + per / 2) + '" y="' + (Y0 + a0 * A + 70) + '" class="gl" style="fill:#ffb547" text-anchor="middle">T</text>'; }
    return out + "</svg>";
  }
  function phasorSVG(o) {
    var C = 360, CX = o.origin ? o.origin[0] : 360, CY = o.origin ? o.origin[1] : 360, R = o.R || 290, mx = o.max || Math.max.apply(null, o.vecs.map(function (v) { return v[0]; })), k = R / mx, out = '<svg class="gr" viewBox="0 0 720 720">' +
      '<path d="M' + (o.origin ? CX - 20 : 40) + ' ' + CY + ' H690 M' + CX + ' ' + (o.origin ? CY + 20 : 690) + ' V30" style="stroke:#5a6a90;stroke-width:3;fill:none"/><text x="690" y="' + (CY + 44) + '" class="gl" text-anchor="end">Re</text><text x="' + (CX + 14) + '" y="50" class="gl">Im</text>';
    var mxs = 0, mys = 0; o.vecs.forEach(function (v) { var th = v[1] * Math.PI / 180, x0 = CX + (v[4] ? v[4][0] * k : 0), y0 = CY - (v[4] ? v[4][1] * k : 0); mxs += x0 + v[0] * k * Math.cos(th) / 2; mys += y0 - v[0] * k * Math.sin(th) / 2; }); mxs /= o.vecs.length; mys /= o.vecs.length;
    o.vecs.forEach(function (v) {
      var a = 0, th = v[1] * Math.PI / 180, x0 = CX + (v[4] ? v[4][0] * k : 0), y0 = CY - (v[4] ? v[4][1] * k : 0), x = x0 + v[0] * k * Math.cos(th), y = y0 - v[0] * k * Math.sin(th), col = COL[v[3]] || COL.c2;
      var ux = Math.cos(th), uy = -Math.sin(th), hx = x - ux * 22, hy = y - uy * 22;
      out += '<path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + '" style="stroke:' + col + ';stroke-width:7;fill:none' + (v[5] ? ";stroke-dasharray:14 10" : "") + '"/>' +
        '<polygon points="' + x.toFixed(1) + ',' + y.toFixed(1) + ' ' + (hx - uy * 13).toFixed(1) + ',' + (hy + ux * 13).toFixed(1) + ' ' + (hx + uy * 13).toFixed(1) + ',' + (hy - ux * 13).toFixed(1) + '" style="fill:' + col + '"/>' +
        (function () { var tip = v[6] === "tip", mx2 = (x0 + x) / 2, my2 = (y0 + y) / 2, sg = ((uy) * (mx2 - mxs) + (-ux) * (my2 - mys)) >= 0 ? 1 : -1, nx = uy * sg, ny = -ux * sg;
          var lx = tip ? x + ux * 30 : mx2 + nx * 40, ly = tip ? y + uy * 30 + 12 : my2 + ny * 40 + 12, anc = tip ? (ux >= -0.2 ? "start" : "end") : (nx > 0.4 ? "start" : nx < -0.4 ? "end" : "middle");
          return '<text x="' + lx.toFixed(0) + '" y="' + ly.toFixed(0) + '" class="gl" style="fill:' + col + '" text-anchor="' + anc + '">' + sub(v[2]) + "</text>"; })();
    });
    return out + "</svg>";
  }
  /* fig: a number (the lesson's n-th drawn circuit), "L2" (its 3rd figure block as it is), a circuit object,
     or {wave: …} / {phasor: …} for the drawn graphs above. */
  function figHTML(id, f) {
    if (f === undefined || f === null) return "";
    if (typeof f === "object" && f.wave) return waveSVG(f.wave);
    if (typeof f === "object" && f.phasor) return phasorSVG(f.phasor);
    var F = figsOf(id);
    if (typeof f === "object") return CV.draw.render(f, { tag: true });
    if (typeof f === "string" && f[0] === "L") { var r = F.raw[+f.slice(1)]; if (!r) throw new Error(id + ": no figure " + f); return r.replace(/^<div class=.lfig.>|<\/div>$/g, ""); }
    var c = F.draw[f]; if (!c) throw new Error(id + ": no circuit " + f + " (has " + F.draw.length + ")");
    return CV.draw.render(c, { tag: true });
  }

  /* ---------- compiling a script into timed scenes ---------- */
  var KIND = { idea: "Concept", law: "Building the law", ex: "Worked example", when: "When to use it", real: "In the real world", mistake: "Common mistake", tip: "Tip", quiz: "Check yourself", sum: "Summary" };
  function beatList(list, t0) { var t = t0, out = []; (list || []).forEach(function (b) { var d = b.d || dur(b.en); out.push({ en: b.en, ar: b.ar, hi: b.hi, m: b.m, t0: t, t1: t + d }); t += d; }); return out; }
  function B(x) { return Array.isArray(x) ? { en: x[0], ar: x[1], hi: x[2] && x[2].hi, m: x[2] && x[2].m, d: x[2] && x[2].d } : x; }
  EX.plan = function (id) {
    var L = CV.lessons[id], S = EX.S[id]; if (!S) throw new Error("no script for " + id);
    if (L._exPlan) return L._exPlan;
    var sc = [], exN = 0;
    var tr = function (a) { return (CV.bi && CV.bi.tr(a)) || a; };
    var objEn = (S.goals || []).map(function (g) { return g[0]; }), objAr = (S.goals || []).map(function (g) { return g[1]; });
    sc.push({ type: "title", dur: 4.5 + objEn.length * 1.4, en: S.title || L.en, ar: L.ar, goals: objEn, beats: [{ t0: 0.4, t1: 4.5 + objEn.length * 1.4, ar: L.ar + " — " + objAr.join(" ") }] });
    S.items.forEach(function (it) {
      var k = it[0], o = it[1];
      if (k === "idea" || k === "when" || k === "real" || k === "mistake" || k === "tip") {
        var lead = o.fig !== undefined || o.math || o.chain || o.table ? 1.3 : 0.5, bs = beatList(o.beats.map(B), lead);
        sc.push({ type: "idea", kind: k, label: o.label || KIND[k], fig: o.fig, math: o.math, chain: o.chain, table: o.table, beats: bs, dur: bs[bs.length - 1].t1 + 0.6 });
      } else if (k === "law") {
        var steps = o.steps.map(function (s) { return { m: s[0], en: s[1], ar: s[2], d: s[3] }; }), bs2 = beatList(steps.map(function (s) { return { en: s.en, ar: s.ar, m: s.m, d: s.d || Math.max(4, dur(s.en)) }; }), o.fig !== undefined ? 1.3 : 0.5);
        sc.push({ type: "derive", label: o.label || KIND.law, fig: o.fig, box: o.box !== false, beats: bs2, dur: bs2[bs2.length - 1].t1 + 0.8 });
      } else if (k === "ex") {
        exN++; var title = o.title || ("Example " + exN);
        var q = beatList([{ en: o.q[0], ar: o.q[1], d: Math.max(5, dur(o.q[0]) + 1) }], 1.3);
        sc.push({ type: "exq", label: title, fig: o.fig, beats: q, dur: q[0].t1 + 0.5, title: title });
        if (o.given || o.find) {
          var gb = beatList([B(o.gwhy || ["Read the known values off the circuit and write each one with its unit.", "نقرأ القيم المعروفة من الدائرة ونكتب كل قيمة مع وحدتها."])].concat(o.find ? [B(o.fwhy || ["Name the unknown before solving: this is what we are asked to find.", "نحدد المجهول قبل الحل: هذا هو المطلوب."])] : []), 0.6);
          if (o.pick) gb = gb.concat(beatList([B(o.pick)], gb[gb.length - 1].t1));
          sc.push({ type: "given", label: title + " · Given and asked", fig: o.fig, given: o.given || [], find: o.find, pick: !!o.pick, beats: gb, dur: gb[gb.length - 1].t1 + 0.5 });
        }
        var st = beatList(o.steps.map(function (s) { return { m: s[0], en: s[1], ar: s[2], d: s[3] || Math.max(4, dur(s[1])) }; }), 0.5);
        sc.push({ type: "derive", label: title + " · Solution", fig: o.sfig, box: true, steps: true, beats: st, dur: st[st.length - 1].t1 + 0.8 });
        if (o.check) { var cb = beatList(o.check.map(B), 0.5); sc.push({ type: "check", label: title + " · Does it make sense?", beats: cb, dur: cb[cb.length - 1].t1 + 0.6 }); }
      } else if (k === "quiz") {
        var Q = L.quiz[o.i]; if (!Q) throw new Error(id + ": no quiz " + o.i);
        var qd = document.createElement("div"); qd.innerHTML = Q.q; var qar = qd.textContent.replace(/\s+/g, " ").trim(); CV.bi.apply(qd); var qen = o.q || qd.innerHTML;
        var opts = Q.options.map(function (op, j) { var d = document.createElement("div"); d.innerHTML = op.t; var tar = d.textContent.trim(); CV.bi.apply(d); var w = document.createElement("div"); w.innerHTML = op.why || ""; var war = w.textContent.trim(); CV.bi.apply(w); return { en: (o.opts && o.opts[j]) || d.innerHTML.trim(), ar: tar, ok: !!op.correct, why: (o.whys && o.whys[j]) || w.innerHTML.trim(), whyAr: war }; });
        var right = opts.filter(function (x) { return x.ok; })[0];
        var letters = ["A", "B", "C", "D"], arL = ["أ", "ب", "ج", "د"];
        var qb = [{ en: "Pause the video and try it before you go on.", ar: qar + " — " + opts.map(function (x, j) { return arL[j] + ") " + x.ar; }).join("   "), d: 3.2 + words(qen) * 0.25 }, { en: "Your turn: think it through.", ar: "حاول الحل بنفسك قبل أن تكمل.", d: o.wait || 5 }];
        (o.hints || []).forEach(function (h) { qb.push({ en: h[0], ar: h[1], hint: true }); });
        qb.push({ en: o.answer ? o.answer[0] : right.why, ar: o.answer ? o.answer[1] : right.whyAr, d: Math.max(6, dur(o.answer ? o.answer[0] : right.why) + 2.5), reveal: true });
        var qbs = beatList(qb, 0.4); qbs.forEach(function (b, j) { b.hint = qb[j].hint; b.reveal = qb[j].reveal; });
        sc.push({ type: "quiz", label: KIND.quiz, q: qen, opts: opts, letters: letters, beats: qbs, dur: qbs[qbs.length - 1].t1 + 0.6 });
      } else if (k === "sum") {
        var sb = beatList(o.beats.map(B), 0.5);
        sc.push({ type: "sum", label: KIND.sum, math: o.math, beats: sb, dur: sb[sb.length - 1].t1 + 1.5 });
      } else throw new Error(id + ": unknown item " + k);
    });
    var t = 0, subs = [];
    sc.forEach(function (s) { s.t0 = t; s.beats.forEach(function (b) { if (b.ar) subs.push([t + b.t0, t + b.t1, b.ar]); }); t += s.dur; });
    return (L._exPlan = { dur: t, scenes: sc, subs: subs, chapter: S.chapter || "" });
  };

  /* ---------- drawing a scene ---------- */
  var cur = null;
  function chrome(id, s, plan) {
    return '<div class="bg"></div><div class="grid"></div>' +
      '<div class="hdr"><span class="brand"><svg viewBox="0 0 34 24"><defs><linearGradient id="lgx" x1="0" x2="1"><stop offset="0" stop-color="#3fb6ff"/><stop offset="1" stop-color="#2f7bff"/></linearGradient></defs><path d="M14 4.5A8.5 8.5 0 1 0 14 19.5" fill="none" stroke="url(#lgx)" stroke-width="3.2" stroke-linecap="round"/><path d="M16 4l7 16 7-16" fill="none" stroke="url(#lgx)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>CircuitVision</span>' +
      '<span class="crs">Circuits 1 · ' + esc(plan.chapter) + '</span><span class="ttl">' + esc(EX.S[id].title || CV.lessons[id].en) + '</span></div>' +
      (s.type === "title" ? "" : '<div class="lab"><span class="dot"></span>' + esc(s.label) + '</div>') +
      '<div class="pbar"><i></i></div>';
  }
  function column(beats, cls) {
    return '<div class="col ' + (cls || "") + '"><div class="col-in">' + beats.map(function (b) { return '<div class="bt' + (b.hint ? " hint" : "") + (b.reveal ? " ans" : "") + '">' + (b.hint ? "<b>Hint</b>" : b.reveal ? "<b>Answer</b>" : "") + P(b.en) + "</div>"; }).join("") + "</div></div>";
  }
  function mathBlock(lines, cls) { return '<div class="mblock ' + (cls || "") + '">' + lines.map(function (m) { return '<div class="m">' + M(m) + "</div>"; }).join("") + "</div>"; }
  function visual(id, s) {
    if (s.fig !== undefined) return '<div class="vis"><div class="fig">' + figHTML(id, s.fig) + "</div></div>";
    if (s.math) return '<div class="vis">' + mathBlock(s.math, "big") + "</div>";
    if (s.chain) return '<div class="vis"><div class="chain">' + s.chain.map(function (c, i) { return (i ? '<div class="ca">↓</div>' : "") + '<div class="cb">' + P(c) + "</div>"; }).join("") + "</div></div>";
    if (s.table) return '<div class="vis"><table class="tb">' + s.table.map(function (r, i) { return "<tr>" + r.map(function (c) { return (i ? "<td>" : "<th>") + P(c) + (i ? "</td>" : "</th>"); }).join("") + "</tr>"; }).join("") + "</table></div>";
    return "";
  }

  var BUILD = {
    title: function (id, s) {
      return '<div class="tcard"><div class="tchip">' + esc(EX.plan(id).chapter) + '</div><h1>' + esc(s.en) + '</h1><div class="trule"></div>' +
        (s.goals.length ? '<div class="tgo">By the end of this lesson you will be able to:</div><ul>' + s.goals.map(function (g) { return "<li>" + P(g) + "</li>"; }).join("") + "</ul>" : "") + "</div>";
    },
    idea: function (id, s) {
      var vis = visual(id, s), icon = { when: "✓", real: "⚙", mistake: "!", tip: "★" }[s.kind];
      if (!vis) return '<div class="rows">' + s.beats.map(function (b) { return '<div class="row' + (s.kind === "mistake" ? " warn" : "") + '"><span class="ic">' + (icon || "•") + "</span><span>" + P(b.en) + "</span></div>"; }).join("") + "</div>";
      return vis + column(s.beats);
    },
    derive: function (id, s) {
      var hasFig = s.fig !== undefined;
      return (hasFig ? '<div class="mini"><div class="fig">' + figHTML(id, s.fig) + "</div></div>" : "") +
        '<div class="dv' + (hasFig ? " withfig" : "") + '"><div class="dv-in">' + s.beats.map(function (b, i) { return '<div class="m dl' + (s.box && i === s.beats.length - 1 ? " last" : "") + '">' + M(b.m) + "</div>"; }).join("") + "</div></div>" + column(s.beats, "why" + (hasFig ? " withfig" : ""));
    },
    exq: function (id, s) {
      return (s.fig !== undefined ? '<div class="vis"><div class="fig">' + figHTML(id, s.fig) + "</div></div>" : "") +
        '<div class="col q' + (s.fig === undefined ? " nofig" : "") + '"><div class="col-in"><div class="exn">' + esc(s.title) + '</div><div class="bt qtext">' + P(s.beats[0].en) + "</div></div></div>";
    },
    given: function (id, s) {
      return (s.fig !== undefined ? '<div class="vis"><div class="fig">' + figHTML(id, s.fig) + "</div></div>" : "") +
        '<div class="gk"><div class="gh">Given</div>' + s.given.map(function (g) { return '<div class="m gi">' + M(g) + "</div>"; }).join("") +
        (s.find ? '<div class="gh">Find</div><div class="m gf">' + M(s.find) + "</div>" : "") + "</div>" + column(s.beats, "why low");
    },
    check: function (id, s) { return '<div class="rows">' + s.beats.map(function (b) { return '<div class="row"><span class="ic ok">✓</span><span>' + P(b.en) + "</span></div>"; }).join("") + "</div>"; },
    quiz: function (id, s) {
      return '<div class="qz"><div class="qq">' + P(s.q) + '</div><div class="qo">' + s.opts.map(function (o, j) { return '<div class="op"><div class="oh"><span class="k">' + s.letters[j] + '</span><span class="ot">' + P(o.en) + '</span><span class="mk2"></span></div><div class="ow">' + P(o.why) + "</div></div>"; }).join("") + "</div></div>" +
        '<div class="ring"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" class="r0"/><circle cx="110" cy="110" r="96" class="r1" transform="rotate(-90 110 110)"/></svg><div class="rn">5</div><div class="rl">Try it yourself</div></div>' +
        column(s.beats.slice(2), "why qcol");
    },
    sum: function (id, s) { return '<div class="rows sumr">' + s.beats.map(function (b, i) { return '<div class="row"><span class="ic n">' + (i + 1) + "</span><span>" + P(b.en) + "</span></div>"; }).join("") + "</div>" + (s.math ? '<div class="sumbox">' + mathBlock(s.math) + "</div>" : ""); }
  };

  function mount(id, si) {
    var plan = EX.plan(id), s = plan.scenes[si], fr = document.getElementById("frame");
    fr.innerHTML = chrome(id, s, plan) + '<div class="sc-' + s.type + ' stage">' + BUILD[s.type](id, s) + "</div>";
    var q = function (x) { return fr.querySelector(x); }, qa = function (x) { return Array.prototype.slice.call(fr.querySelectorAll(x)); };
    var st = { id: id, si: si, s: s, fr: fr, bar: q(".pbar i"), lab: q(".lab"), plan: plan };
    // figure parts to draw on
    st.strokes = qa(".fig svg line, .fig svg path, .fig svg polyline, .fig svg polygon, .fig svg circle, .fig svg rect").map(function (e) { var L = 0; try { L = e.getTotalLength(); } catch (x) {} return [e, L]; }).filter(function (x) { return x[1] > 0; });
    st.texts = qa(".fig svg text");
    st.col = q(".col-in"); st.items = qa(".col .bt"); st.dl = qa(".dl"); st.dvin = q(".dv-in"); st.rows = qa(".rows .row");
    st.ops = qa(".qz .op"); st.ring = q(".ring"); st.r1 = q(".ring .r1"); st.rn = q(".ring .rn"); st.qq = q(".qq");
    st.gi = qa(".gi"); st.gf = q(".gf"); st.gh = qa(".gh");
    // fit the figure into its box
    qa(".fig svg").forEach(function (v) { v.removeAttribute("style"); v.style.width = "100%"; v.style.height = "100%"; });
    // a long title steps down in size until the card fits above the subtitle band
    var tc = q(".tcard"), h1 = q(".tcard h1"); if (tc && h1) { var f = 104; while (tc.offsetTop + tc.offsetHeight > 870 && f > 60) { f -= 6; h1.style.fontSize = f + "px"; } }
    // maths that is too wide for its box is set smaller, never cut
    qa(".dl, .gi, .gf, .vis .m, .sumbox .m, .qq").forEach(function (e) {
      var box = e.parentNode, avail = box.clientWidth - 40; if (e.classList.contains("dl")) avail = box.parentNode.clientWidth - 40;
      var fs = parseFloat(getComputedStyle(e).fontSize), w = e.scrollWidth; if (w > avail && avail > 0) e.style.fontSize = (fs * avail / w).toFixed(1) + "px";
    });
    // measure the stacks once: the text column, the derivation lines
    var colH = st.col ? st.col.parentNode.clientHeight : 0;
    st.colTops = st.items.map(function (e) { return [e.offsetTop, e.offsetHeight]; }); st.colH = colH;
    var dvH = st.dvin ? st.dvin.parentNode.clientHeight : 0; st.dlTops = st.dl.map(function (e) { return [e.offsetTop, e.offsetHeight]; }); st.dvH = dvH;
    // the lit parts of each beat
    st.hi = (s.beats || []).map(function (b) { return (b.hi || "").split(/\s+/).filter(Boolean).map(function (n) { return qa('.fig [data-e="' + n + '"]'); }).reduce(function (a, b2) { return a.concat(b2); }, []); });
    cur = st; return st;
  }

  function beatAt(s, t) { var k = -1; s.beats.forEach(function (b, i) { if (t >= b.t0 - 0.001) k = i; }); return k; }
  function scrollTo(t, beats, tops, H, k) { // keep beat k inside the box: ease the inner stack upward between beats
    if (!tops.length || k >= tops.length) return 0;
    var want = function (i) { if (i < 0) return 0; var b = tops[i]; return Math.max(0, b[0] + b[1] - H + 10); };
    var a = k > 0 ? want(k - 1) : 0, b2 = want(k), p = k >= 0 ? eio(seg(t, beats[k].t0, beats[k].t0 + 0.5)) : 0;
    return a + (b2 - a) * p;
  }

  function render(st, t) {
    var s = st.s, k = beatAt(s, t), plan = st.plan;
    st.bar.style.width = ((s.t0 + t) / plan.dur * 100).toFixed(2) + "%";
    if (st.lab) { var a0 = eo(seg(t, 0, 0.4)); st.lab.style.opacity = a0; st.lab.style.transform = "translateX(" + ((1 - a0) * -20).toFixed(1) + "px)"; }
    // the figure draws itself on at the start of the scene
    if (st.strokes.length) {
      var dp = seg(t, 0.05, 1.15);
      st.strokes.forEach(function (x) { var L = x[1]; x[0].style.strokeDasharray = L + " " + L; x[0].style.strokeDashoffset = (L * (1 - eio(dp))).toFixed(1); });
      var tp = eo(seg(t, 0.8, 1.25)); st.texts.forEach(function (e) { e.style.opacity = tp; });
      st.fr.querySelectorAll(".fig svg .sc-dot, .fig svg .sc-arr, .fig svg .sc-iref, .fig svg .sc-cdot").forEach(function (e) { e.style.opacity = tp; });
    }
    // lit parts for the current beat
    st.hi.forEach(function (els, i) { var on = i === k ? eo(seg(t, s.beats[i].t0, s.beats[i].t0 + 0.4)) : 0; els.forEach(function (e) { e.classList.toggle("on", on > 0.5); }); });
    // the text column: past beats dim, the current one bright, later ones hidden
    var cb = s.type === "quiz" ? s.beats.slice(2) : s.beats, kc = s.type === "quiz" ? k - 2 : k;
    st.items.forEach(function (e, i) {
      var b = cb[i]; if (!b) return;
      var a = eo(seg(t, b.t0, b.t0 + 0.45)), past = i === kc ? 0 : (t >= b.t1 ? 1 : 0);
      e.style.opacity = (a * (1 - 0.55 * past)).toFixed(3); e.style.transform = "translateY(" + ((1 - a) * 22).toFixed(1) + "px)";
      e.classList.toggle("now", !past && a > 0);
    });
    if (st.col && s.type !== "exq") st.col.style.transform = "translateY(" + (-scrollTo(t, cb, st.colTops, st.colH, kc)).toFixed(1) + "px)";
    if (s.type === "exq" && st.items[0]) { var qa0 = eo(seg(t, 0.9, 1.5)); st.items[0].style.opacity = qa0; st.items[0].style.transform = "translateY(" + ((1 - qa0) * 22).toFixed(1) + "px)"; }
    TYPE[s.type] && TYPE[s.type](st, t, k);
  }

  var TYPE = {
    title: function (st, t) {
      var q = function (x) { return st.fr.querySelector(x); };
      [".tchip", "h1", ".tgo"].forEach(function (x, i) { var e = q(x); if (!e) return; var a = eo(seg(t, 0.2 + i * 0.45, 0.8 + i * 0.45)); e.style.opacity = a; e.style.transform = "translateY(" + ((1 - a) * 30).toFixed(1) + "px)"; });
      var r = q(".trule"); if (r) r.style.transform = "scaleX(" + eio(seg(t, 0.8, 1.8)) + ")";
      st.fr.querySelectorAll(".tcard li").forEach(function (e, i) { var a = eo(seg(t, 2.0 + i * 1.1, 2.6 + i * 1.1)); e.style.opacity = a; e.style.transform = "translateX(" + ((1 - a) * -24).toFixed(1) + "px)"; });
    },
    idea: function (st, t, k) {
      st.rows.forEach(function (e, i) { var b = st.s.beats[i], a = eo(seg(t, b.t0, b.t0 + 0.45)); e.style.opacity = (a * (i < k ? 0.55 : 1)).toFixed(3); e.style.transform = "translateY(" + ((1 - a) * 24).toFixed(1) + "px)"; e.classList.toggle("now", i === k); });
      st.fr.querySelectorAll(".vis .cb, .vis .ca, .vis tr").forEach(function (e, i) { var a = eo(seg(t, 0.2 + i * 0.35, 0.7 + i * 0.35)); e.style.opacity = a; e.style.transform = "translateY(" + ((1 - a) * 16).toFixed(1) + "px)"; });
      st.fr.querySelectorAll(".vis .m").forEach(function (e, i) { var a = eo(seg(t, 0.3 + i * 0.5, 0.9 + i * 0.5)); e.style.opacity = a; e.style.transform = "translateY(" + ((1 - a) * 20).toFixed(1) + "px)"; });
    },
    derive: function (st, t, k) {
      st.dl.forEach(function (e, i) {
        var b = st.s.beats[i], a = eo(seg(t, b.t0, b.t0 + 0.55));
        e.style.opacity = (a * (i < k ? 0.38 : 1)).toFixed(3);
        e.style.clipPath = "inset(-30% " + ((1 - a) * 100).toFixed(1) + "% -30% -4%)";
        e.classList.toggle("now", i === k);
        if (e.classList.contains("last")) { var bx = eo(seg(t, b.t0 + 0.5, b.t0 + 1.0)); e.style.boxShadow = "0 0 0 " + (3 * bx).toFixed(1) + "px #3fb6ff, 0 0 " + (50 * bx).toFixed(0) + "px rgba(63,182,255," + (0.35 * bx).toFixed(2) + ")"; e.style.background = "rgba(63,182,255," + (0.07 * bx).toFixed(3) + ")"; }
        e.querySelectorAll(".mk").forEach(function (m) { var mk = i === k ? eo(seg(t, b.t0 + 0.5, b.t0 + 0.9)) : 0; m.style.boxShadow = "0 0 0 " + (3 * mk).toFixed(1) + "px rgba(255,181,71,.8)"; m.style.background = "rgba(255,181,71," + (0.16 * mk).toFixed(3) + ")"; });
      });
      if (st.dvin) st.dvin.style.transform = "translateY(" + (-scrollTo(t, st.s.beats, st.dlTops, st.dvH, k)).toFixed(1) + "px)";
    },
    given: function (st, t) {
      var s = st.s, b0 = s.beats[0];
      st.gh.forEach(function (e, i) { var a = eo(seg(t, i ? s.beats[1].t0 : b0.t0, (i ? s.beats[1].t0 : b0.t0) + 0.4)); e.style.opacity = a; });
      st.gi.forEach(function (e, i) { var a = eo(seg(t, b0.t0 + 0.4 + i * 0.7, b0.t0 + 0.9 + i * 0.7)); e.style.opacity = a; e.style.transform = "translateX(" + ((1 - a) * -24).toFixed(1) + "px)"; });
      if (st.gf) { var a = eo(seg(t, s.beats[1].t0 + 0.3, s.beats[1].t0 + 0.8)); st.gf.style.opacity = a; st.gf.style.transform = "translateX(" + ((1 - a) * -24).toFixed(1) + "px)"; }
    },
    check: function (st, t, k) { st.rows.forEach(function (e, i) { var b = st.s.beats[i], a = eo(seg(t, b.t0, b.t0 + 0.45)); e.style.opacity = (a * (i < k ? 0.6 : 1)).toFixed(3); e.style.transform = "translateY(" + ((1 - a) * 24).toFixed(1) + "px)"; var ic = e.querySelector(".ic"), p = seg(t, b.t0 + 0.3, b.t0 + 0.7); ic.style.transform = "scale(" + (0.4 + 0.6 * eo(p)).toFixed(3) + ")"; }); },
    quiz: function (st, t, k) {
      var s = st.s, a = eo(seg(t, 0.2, 0.8));
      st.qq.style.opacity = a; st.qq.style.transform = "translateY(" + ((1 - a) * 24).toFixed(1) + "px)";
      var rev = s.beats[s.beats.length - 1], rv = eo(seg(t, rev.t0, rev.t0 + 0.5));
      st.ops.forEach(function (e, j) {
        var o = s.opts[j], ai = eo(seg(t, 0.8 + j * 0.3, 1.3 + j * 0.3));
        e.style.opacity = (ai * (o.ok ? 1 : 1 - 0.4 * rv)).toFixed(3); e.style.transform = "translateY(" + ((1 - ai) * 20).toFixed(1) + "px)";
        e.classList.toggle("right", o.ok && rv > 0.02); e.classList.toggle("wrong", !o.ok && rv > 0.02);
        var w = e.querySelector(".ow"); w.style.opacity = rv; w.style.maxHeight = (rv * 160).toFixed(0) + "px";
        var m = e.querySelector(".mk2"); var tx = rv > 0.02 ? (o.ok ? "✓" : "✗") : ""; if (m.textContent !== tx) m.textContent = tx;
      });
      var w = s.beats[1], rp = seg(t, w.t0, w.t1);
      st.ring.style.opacity = (eo(seg(t, w.t0 - 0.4, w.t0)) * (1 - eo(seg(t, w.t1, w.t1 + 0.4)))).toFixed(3);
      st.r1.style.strokeDashoffset = (603.2 * rp).toFixed(1);
      var n = String(Math.max(0, Math.ceil(w.t1 - Math.max(t, w.t0)))); if (st.rn.textContent !== n) st.rn.textContent = n;
    },
    sum: function (st, t, k) {
      st.rows.forEach(function (e, i) { var b = st.s.beats[i], a = eo(seg(t, b.t0, b.t0 + 0.45)); e.style.opacity = a; e.style.transform = "translateY(" + ((1 - a) * 24).toFixed(1) + "px)"; });
      var bx = st.fr.querySelector(".sumbox"); if (bx) { var last = st.s.beats[st.s.beats.length - 1], a2 = eo(seg(t, last.t1 - 1.2, last.t1 - 0.6)); bx.style.opacity = a2; }
    }
  };

  /* One frame: EX.frame(id, t) → { busy, scene }. busy is true while something is moving. */
  EX.frame = function (id, t) {
    var plan = EX.plan(id), si = 0;
    while (si < plan.scenes.length - 1 && t >= plan.scenes[si + 1].t0) si++;
    var fresh = !cur || cur.id !== id || cur.si !== si;
    var st = fresh ? mount(id, si) : cur;
    BUSY = false; render(st, t - plan.scenes[si].t0);
    return { busy: BUSY || fresh, scene: si };
  };
  EX.info = function (id) { var p = EX.plan(id); return { dur: p.dur, subs: p.subs, scenes: p.scenes.map(function (s) { return [s.t0, s.dur, s.type]; }) }; };
  EX.list = function () { return Object.keys(EX.S); };
})();
