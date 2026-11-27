/* CircuitVision — animated explainer engine for the Circuits 1 LAB videos (clab-lab<n>.mp4), in the design of the theory videos (explain.js).
   A lab's video is a list of acts written in tools/videos/clab-explain-<n>.js. English on screen; the Arabic of every beat goes to the
   subtitle track (clab-lab<n>.ar.vtt), and every sound effect is listed in EX.info(id).sfx for the renderer to mix (no music).
   The bench on screen is the lab's own bench (clab-bench.js). Its parts, leads and instrument settings come from the lab simulator
   through tools/videos/clab-plan.js (_plan.json), so every reading is the one the page itself gives. An act moves from the previous
   act's bench to its own: parts drop onto the board, leads are drawn one by one, the camera glides, then the instrument settings
   change and the readings follow. Every frame is a pure function of time: EX.frame(id, t) draws the frame at t seconds and reports
   whether anything is still moving, so the renderer only screenshots frames that change. */
(function () {
  "use strict";
  var CV = window.CV, LX = window.LX = window.EX = { S: {}, PLAN: {}, add: function (id, d) { LX.S[id] = d; } };
  var BUSY = false, PW = 1130, PH = 730;
  function c01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { var x = (t - a) / (b - a); if (x > 0 && x < 1) BUSY = true; return c01(x); }
  function eo(x) { return 1 - Math.pow(1 - x, 3); }
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function J(x) { return JSON.stringify(x); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function words(s) { return String(s || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; }
  function bdur(en) { return Math.max(3.0, Math.min(9, 1.6 + words(en) * 0.27)); }
  function sameLead(a, b) { return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]); }
  function sub(s) { return String(s).replace(/_\{([^}]*)\}/g, "<sub>$1</sub>").replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>"); }

  LX.loadPlan = function () { var x = new XMLHttpRequest(); x.open("GET", "_plan.json?" + Date.now(), false); x.send(); LX.PLAN = JSON.parse(x.responseText); };
  LX.list = function () { return Object.keys(LX.S); };

  /* ---------- the plan of one video: where every act starts, what moves in it, which sounds fall where ---------- */
  LX.plan = function (id) {
    var D = LX.S[id]; if (D._plan) return D._plan;
    if (!Object.keys(LX.PLAN).length) LX.loadPlan();
    var P = LX.PLAN[D.exp].scenes, acts = [], t = 0, subs = [], sfx = [], prev = null;
    (typeof D.acts === "function" ? D.acts(P) : D.acts).forEach(function (a) {
      var A = { type: a.type, a: a, t0: t, beats: [], sfx: [] }, bt = 0;
      (a.beats || []).forEach(function (b) { var d = bdur(b[0]); A.beats.push({ t0: bt, t1: bt + d, en: b[0], ar: b[1] }); bt += d; });
      if (a.type === "bench" || a.type === "sweep") {
        var steps = a.type === "sweep" ? a.steps : [a.p], sc = P[steps[0]], st = sc.state, pv = prev || { parts: {}, leads: [], inst: null }, T = 0.5;
        A.steps = steps; A.sc = sc;
        var added = Object.keys(st.parts).filter(function (k) { return !pv.parts[k] || J(pv.parts[k]) !== J(st.parts[k]); });
        var kept = Object.keys(st.parts).filter(function (k) { return added.indexOf(k) < 0; });
        var newL = st.leads.filter(function (l) { return !pv.leads.some(function (m) { return sameLead(l, m); }); });
        var keptL = st.leads.filter(function (l) { return pv.leads.some(function (m) { return sameLead(l, m); }); });
        A.kept = kept; A.keptL = keptL; A.pv = pv;
        A.added = added.map(function (k, i) { var o = { k: k, t: T + i * 0.9 }; A.sfx.push([o.t + 0.35, "pop"]); return o; }); T += added.length * 0.9;
        A.newL = newL.map(function (l, j) { var o = { l: l, t: T + j * 1.1 }; A.sfx.push([o.t + 0.85, "click"]); return o; }); T += newL.length * 1.1;
        var instChg = prev && J(st.inst) !== J(pv.inst);
        A.instAt = prev ? T + 0.2 : 0;
        if (instChg) { A.sfx.push([A.instAt, "dial"]); if (sc.focus === "meters") A.sfx.push([A.instAt + 0.55, "ding"]); }
        A.trans = instChg ? A.instAt + 1.1 : T + 0.5;
        if (!prev) A.trans = 1.6;
        A.sw = []; A.swRow = (a.type === "sweep" ? steps : []).map(function (si) { var r = P[si].panel && P[si].panel.table ? P[si].panel.table.rows : []; for (var z = 0; z < r.length; z++) if (r[z].on) return z; return -1; });
        if (a.type === "sweep") {
          var S = a.stepDur || 1.7, ts = A.trans + 0.5;
          steps.slice(1).forEach(function (si, k) { var tk = ts + k * S; A.sw.push({ t: tk, inst: P[si].state.inst }); A.sfx.push([tk, "tick"]); A.sfx.push([tk + 0.7, "ding"]); });
          A.sfx.push([A.trans - 0.3, "ding"]);
          A.end = A.sw.length ? A.sw[A.sw.length - 1].t + S + 0.6 : A.trans + 1;
        } else A.end = A.trans + 1.4;
        var last = P[steps[steps.length - 1]].state;
        prev = { parts: last.parts, leads: last.leads, inst: last.inst };
        A.dur = Math.max(bt + 0.6, A.end, a.min || 0);
        if (a.table) A.tab = { def: a.table, sc: P[a.table.from], steps: steps };
      } else if (a.type === "plot") {
        A.pts = a.pts ? a.pts : P[a.from].panel.table.rows.map(function (r) { return [+r.cells[0], +r.cells[1]]; });
        A.dur = Math.max(bt + 0.8, 11); for (var q = 0; q < A.pts.length; q++) A.sfx.push([1.6 + q * 0.45, "tick"]); A.sfx.push([1.6 + A.pts.length * 0.45 + 0.4, "whoosh"]); A.sfx.push([1.6 + A.pts.length * 0.45 + 1.7, "ding"]);
      } else if (a.type === "title") { A.dur = Math.max(bt + 0.8, 10); A.sfx.push([0.2, "whoosh"]); for (var g = 0; g < a.goals.length; g++) A.sfx.push([2.3 + g * 0.8, "pop"]); }
      else { A.dur = Math.max(bt + 0.8, 8); A.sfx.push([0.2, "whoosh"]); (a.rows || []).forEach(function (r, g2) { A.sfx.push([0.8 + g2 * 1.2, "pop"]); }); if (a.eq) A.sfx.push([0.8 + (a.rows || []).length * 1.2 + 0.4, "ding"]); }
      A.beats.forEach(function (b) { if (b.ar) subs.push([t + b.t0, t + b.t1, b.ar]); });
      A.sfx.forEach(function (s) { sfx.push([t + s[0], s[1]]); });
      acts.push(A); t += A.dur;
    });
    return (D._plan = { dur: t, acts: acts, subs: subs, sfx: sfx, P: P });
  };
  LX.info = function (id) { var p = LX.plan(id); return { dur: p.dur, subs: p.subs, sfx: p.sfx, scenes: p.acts.map(function (A) { return [A.t0, A.dur, A.type]; }) }; };

  /* ---------- the camera: the part of the bench an act is about ---------- */
  var bench = null, benchKey = "", curKey = "", curMarks = "", loadedLeads = [], loadedParts = {};
  var RECT = { ps: [484, 16, 560, 246], fg: [16, 16, 452, 246], sc: [1060, 16, 524, 246], d1: [16, 282, 190, 356], d2: [214, 282, 190, 356], board: [420, 282, 770, 650], mn: [16, 16, 560, 520] };
  function boxOfPoint(id) {
    var k = id.split(".")[0];
    if (RECT[k]) return RECT[k];
    if (/^(rb|lb|cb)$/.test(k)) { var j = bench.point(k + ".a"); return j ? [j[0] - 334, j[1] - 80, 378, 200] : null; }
    var q = bench.point(id); return q ? [q[0] - 30, q[1] - 30, 60, 60] : null;
  }
  function union(a, b) { if (!a) return b; if (!b) return a; var x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]); return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y]; }
  function viewFor(scene, A) {
    var sz = bench.size(), W = sz.W, H = sz.H, r = null, f = scene.focus;
    if (A.a.view) r = A.a.view.slice();
    else if (f === "all") r = [0, 0, W, H];
    else {
      if (f === "board" || f === "leads" || f === "meters") {
        var c = null;
        Object.keys(scene.state.parts).forEach(function (sl) { var g = bench.slot(sl); if (g) c = union(c, [g.x - 60, g.y - 60, 120, 120]); });
        scene.state.leads.forEach(function (l) { l.forEach(function (pt) { if (/^t:|^rail:/.test(pt)) { var q = bench.point(pt); if (q) c = union(c, [q[0] - 50, q[1] - 50, 100, 100]); } }); });
        r = c || (scene.state.leads.length ? null : RECT.board);
      }
      (scene.marks || []).forEach(function (m) {
        if (m.p) r = union(r, boxOfPoint(m.p));
        else if (m.s) { var g = bench.slot(m.s); if (g) r = union(r, [g.x - 40, g.y - 40, 80, 80]); }
        else if (m.box) r = union(r, m.box);
      });
      if (!r) r = [0, 0, W, H];
    }
    var pad = A.a.view ? 0 : 30; r = [r[0] - pad, r[1] - pad, r[2] + 2 * pad, r[3] + 2 * pad];
    var w = Math.max(r[2], A.a.view ? 300 : 820), h = Math.max(r[3], w * PH / PW); w = Math.max(w, h * PW / PH);
    var x = r[0] + r[2] / 2 - w / 2, y = r[1] + r[3] / 2 - h / 2;
    if (w <= W) x = Math.max(0, Math.min(W - w, x)); else x = (W - w) / 2;
    if (h <= H) y = Math.max(0, Math.min(H - h, y)); else y = (H - h) / 2;
    return [x, y, w, h];
  }

  /* ---------- the frame ---------- */
  var LOGO = '<svg viewBox="0 0 34 24"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#3fb6ff"/><stop offset="1" stop-color="#2f7bff"/></linearGradient></defs><path d="M14 4.5A8.5 8.5 0 1 0 14 19.5" fill="none" stroke="url(#lg)" stroke-width="3.2" stroke-linecap="round"/><path d="M16 4l7 16 7-16" fill="none" stroke="url(#lg)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var built = "", E = {}, curAct = -1, viewPrev = null, viewFrom = null;
  function q(s) { return E.root.querySelector(s); }
  function build(id) {
    if (built === id) return; built = id; var D = LX.S[id];
    E.root = document.getElementById("frame");
    E.root.innerHTML = '<div class="bg"></div><div class="grid"></div><div class="hdr"><div class="brand">' + LOGO + 'CircuitVision</div><span>' + esc(D.hdr) + '</span><span class="ttl">' + esc(D.title) + '</span></div>' +
      '<div class="lab"><span class="dot"></span><span class="lk"></span></div><div id="dev"><div id="bench"></div></div><div class="plot"></div>' +
      '<div class="col"><div class="col-in"></div></div><div class="tabbox"></div><div class="tcard"></div><div class="rows"></div><div class="eqbox"><div></div></div><div class="pbar"><i></i></div>';
    ["lk", "col", "col-in", "tabbox", "tcard", "rows", "eqbox", "pbar", "plot"].forEach(function (k) { E[k] = q("." + k); });
    E.dev = document.getElementById("dev"); E.bar = q(".pbar i"); E.eq = q(".eqbox div");
  }
  function fitTable(A, rowsAt) { return rowsAt; }
  function actHtml(A, p) {
    var a = A.a;
    E.dev.style.display = E.col.style.display = "none"; E.tabbox.style.display = "none"; E.tcard.style.display = E.rows.style.display = E.eqbox.style.display = E.plot.style.display = "none";
    E.lk.textContent = a.kick || ""; E.col.firstChild.innerHTML = "";
    var bt = A.beats.map(function (b) { return '<div class="bt">' + sub(esc(b.en)) + "</div>"; }).join("");
    if (a.type === "title") {
      E.lk.textContent = ""; E.tcard.style.display = "flex";
      E.tcard.innerHTML = '<div class="tchip">' + esc(a.chip) + '</div><h1>' + a.h1 + '</h1><div class="trule"></div><div class="tgo">' + esc(a.go) + "</div><ul>" + a.goals.map(function (g) { return "<li>" + sub(esc(g[0])) + "</li>"; }).join("") + "</ul>";
    } else if (a.type === "end") {
      E.rows.style.display = "flex"; E.rows.innerHTML = (a.rows || []).map(function (r, i) { return '<div class="row"><div class="ic">' + (i + 1) + "</div><div>" + sub(esc(r[0])) + "</div></div>"; }).join("");
      if (a.eq) { E.eqbox.style.display = "flex"; E.eq.innerHTML = a.eq; }
    } else if (a.type === "plot") {
      E.plot.style.display = "block"; E.col.style.display = "block"; E.col.classList.remove("short"); E.col.firstChild.innerHTML = bt; E.pts = A.pts;
      var pts = A.pts, mx = Math.max.apply(null, pts.map(function (r) { return r[0]; })), my = Math.max.apply(null, pts.map(function (r) { return r[1]; }));
      var X0 = 150, Y0 = 640, X1 = 1060, Y1 = 90, sx = function (v) { return X0 + (X1 - X0) * v / (mx * 1.08); }, sy = function (v) { return Y0 - (Y0 - Y1) * v / (my * 1.08); };
      var g = '<path d="M' + X0 + " " + Y0 + " H" + X1 + " M" + X0 + " " + Y0 + " V" + Y1 + '" stroke="#5f6e92" stroke-width="3" fill="none" stroke-linecap="round"/>';
      for (var k = 1; k <= 4; k++) { g += '<text x="' + (sx(mx * k / 4)) + '" y="' + (Y0 + 40) + '" font-size="26" text-anchor="middle">' + (mx * k / 4).toFixed(mx > 20 ? 0 : 1) + '</text><text x="' + (X0 - 16) + '" y="' + (sy(my * k / 4) + 9) + '" font-size="26" text-anchor="end">' + (my * k / 4).toFixed(1) + "</text>"; }
      g += '<text x="' + ((X0 + X1) / 2) + '" y="' + (Y0 + 84) + '" font-size="30" text-anchor="middle">' + esc(a.xl) + '</text><text x="40" y="' + ((Y0 + Y1) / 2) + '" font-size="30" text-anchor="middle" transform="rotate(-90 40 ' + ((Y0 + Y1) / 2) + ')">' + esc(a.yl) + "</text>";
      g += '<line class="pfit" x1="' + sx(0) + '" y1="' + sy(0) + '" x2="' + sx(pts[pts.length - 1][0]) + '" y2="' + sy(pts[pts.length - 1][1]) + '" stroke="#3fb6ff" stroke-width="5" stroke-linecap="round" opacity=".9"/>';
      pts.forEach(function (r) { g += '<circle class="ppt" cx="' + sx(r[0]) + '" cy="' + sy(r[1]) + '" r="11" fill="#ffb547"/>'; });
      g += '<text class="pslope" x="' + (X0 + 40) + '" y="' + (Y1 + 50) + '" font-size="44" fill="#eaf0ff" opacity="0">' + sub(esc(a.slope)) + "</text>";
      E.plot.innerHTML = '<svg viewBox="0 0 1130 730">' + g + "</svg>"; E.pf = E.plot.querySelector(".pfit"); E.pp = [].slice.call(E.plot.querySelectorAll(".ppt")); E.ps = E.plot.querySelector(".pslope");
      E.pfL = Math.hypot(sx(pts[pts.length - 1][0]) - sx(0), sy(pts[pts.length - 1][1]) - sy(0));
    } else {
      E.dev.style.display = "block"; E.col.style.display = "block"; E.col.firstChild.innerHTML = bt; E.col.classList.toggle("short", !!A.tab);
      if (A.tab) {
        var T = A.tab, rows = T.sc.panel.table.rows, d = T.def, steps = A.steps;
        var h = '<div class="tt">' + esc(d.title) + '</div><table class="tb' + (rows.length > 11 || Math.max.apply(null, rows.map(function (r) { return ((d.labels && d.labels[rows.indexOf(r)]) || r.label).length; })) > 16 ? ' sm xs' : rows.length > 5 ? ' sm' : '') + '"><tr>' + d.head.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
        rows.forEach(function (r, i) { h += '<tr class="tr"><td>' + esc((d.labels && d.labels[i]) || r.label) + "</td>" + r.cells.map(function (c, j) { return '<td class="v' + (d.pc === j ? " pc" : "") + '">' + esc(c) + "</td>"; }).join("") + (r.cells.length ? "" : d.head.slice(1).map(function () { return '<td class="e">·</td>'; }).join("")) + "</tr>"; });
        E.tabbox.innerHTML = h + "</table>"; E.tabbox.style.display = "block"; E.tabbox.style.top = (d.top || 500) + "px";
        E.trs = [].slice.call(E.tabbox.querySelectorAll("tr.tr"));
        E.trs.forEach(function (tr) { tr._v = [].slice.call(tr.querySelectorAll("td.v")); tr._e = [].slice.call(tr.querySelectorAll("td.e")); });
      }
    }
    E.bt = [].slice.call(E.col.querySelectorAll(".bt"));
    if (a.type === "title") { var tc = E.tcard; E.tch = tc.querySelector(".tchip"); E.th1 = tc.querySelector("h1"); E.tr = tc.querySelector(".trule"); E.tg = tc.querySelector(".tgo"); E.tli = [].slice.call(tc.querySelectorAll("li")); }
    if (a.type === "end") E.rw = [].slice.call(E.rows.querySelectorAll(".row"));
  }
  function mount(inst, id, A) {
    var key = id + "|" + inst.join(",");
    if (bench && key === benchKey) return;
    if (bench) bench.destroy();
    try { localStorage.clear(); } catch (e) {}
    var e = CV.clabExps.list.filter(function (x) { return x.id === LX.S[id].exp; })[0];
    bench = CV.clabBench.mount(document.getElementById("bench"), { key: "video-" + LX.S[id].exp, inst: inst, kit: e ? e.kit : [] });
    benchKey = key; curKey = ""; curMarks = "";
  }
  function dropEl(el, a) {   // a part drops onto the board: a sag from above and a fade
    if (!el) return;
    if (!el._o) { el._o = el.getAttribute("transform") || ""; }
    var m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(el._o);
    el.setAttribute("transform", a >= 1 || !m ? el._o : el._o.replace(m[0], "translate(" + m[1] + " " + (+m[2] - (1 - a) * 90).toFixed(1) + ")"));
    el.style.opacity = c01(a * 2.2).toFixed(3);
  }
  function actAt(p, t) { var i = 0; while (i < p.acts.length - 1 && t >= p.acts[i + 1].t0) i++; return i; }
  var wasBt = "";
  LX.frame = function (id, t) {
    BUSY = false; var p = LX.plan(id); build(id); var ai = actAt(p, t), A = p.acts[ai], a = A.a, lt = t - A.t0;
    if (ai !== curAct) { curAct = ai; wasBt = ""; actHtml(A, p); BUSY = true; if (A.type === "bench" || A.type === "sweep") { mount(a.inst || LX.PLAN[LX.S[id].exp].scenes[A.steps[0]].inst, id, A); curKey = ""; curMarks = ""; } }
    E.bar.style.width = (t / p.dur * 100).toFixed(2) + "%";
    // beats
    E.bt.forEach(function (el, i) {
      var b = A.beats[i], x = c01((lt - b.t0) / 0.6); if (x > 0 && x < 1) BUSY = true;
      el.style.opacity = eo(x).toFixed(3); el.style.transform = "translateY(" + ((1 - eo(x)) * 14).toFixed(1) + "px)";
      var now = lt >= b.t0 && (lt < b.t1 || i === A.beats.length - 1), cls = "bt" + (now ? " now" : lt >= b.t0 ? " old" : ""); if (el.className !== cls) { el.className = cls; BUSY = true; }
    });
    if (A.type === "title") {
      var f = function (el, t0) { var x = eo(seg(lt, t0, t0 + 0.6)); el.style.opacity = x.toFixed(3); el.style.transform = "translateY(" + ((1 - x) * 20).toFixed(1) + "px)"; };
      f(E.tch, 0.2); f(E.th1, 0.5); E.tr.style.transform = "scaleX(" + eio(seg(lt, 1.0, 2.0)).toFixed(3) + ")"; f(E.tg, 1.8); E.tli.forEach(function (el, i) { f(el, 2.3 + i * 0.8); });
    } else if (A.type === "end") {
      E.rw.forEach(function (el, i) { var x = eo(seg(lt, 0.8 + i * 1.2, 1.4 + i * 1.2)); el.style.opacity = x.toFixed(3); el.style.transform = "translateY(" + ((1 - x) * 20).toFixed(1) + "px)"; });
      var xe = eo(seg(lt, 0.8 + E.rw.length * 1.2 + 0.4, 1.4 + E.rw.length * 1.2 + 0.4)); E.eqbox.style.opacity = xe.toFixed(3);
    } else if (A.type === "plot") {
      var n = E.pp.length; E.pp.forEach(function (el, i) { var x = eo(seg(lt, 1.6 + i * 0.45, 1.95 + i * 0.45)); el.setAttribute("opacity", x.toFixed(2)); el.setAttribute("r", (4 + 7 * x).toFixed(1)); });
      var tf = 1.6 + n * 0.45 + 0.4; E.pf.style.strokeDasharray = E.pfL + 2; E.pf.style.strokeDashoffset = (E.pfL * (1 - eio(seg(lt, tf, tf + 1.2)))).toFixed(1); E.pf.setAttribute("opacity", lt > tf ? 0.9 : 0);
      E.ps.setAttribute("opacity", eo(seg(lt, tf + 1.5, tf + 2.1)).toFixed(2));
    } else {
      // the bench: parts, leads, instrument settings and the camera of this moment
      var st = A.sc.state, scene = A.sc, vis = (lt < 0.3 ? 0 : 1);
      var parts = {}; A.kept.forEach(function (k) { parts[k] = st.parts[k]; }); A.added.forEach(function (o) { if (lt >= o.t) parts[o.k] = st.parts[o.k]; });
      var leads = A.keptL.slice(); A.newL.forEach(function (o) { if (lt >= o.t) leads.push(o.l); });
      var inst = !A.pv.inst || lt >= A.instAt ? st.inst : A.pv.inst;
      if (A.type === "sweep") A.sw.forEach(function (s) { if (lt >= s.t) inst = s.inst; });
      var key = J([Object.keys(parts), leads, inst === st.inst ? 1 : J(inst)]);
      if (key !== curKey) { curKey = key; BUSY = true; bench.load({ parts: parts, leads: leads, set: inst || st.inst }); loadedLeads = leads.slice(); }
      var mk = lt > 1.0 ? J(scene.marks || []) : "[]"; if (mk !== curMarks) { curMarks = mk; bench.mark(mk === "[]" ? [] : scene.marks); BUSY = true; }
      A.added.forEach(function (o) { var el = E.dev.querySelector('[data-s="' + o.k + '"]'); dropEl(el, eo(seg(lt, o.t, o.t + 0.7))); });
      A.newL.forEach(function (o) {
        var i = loadedLeads.findIndex(function (m) { return sameLead(m, o.l); }); if (i < 0) return;
        var g = E.dev.querySelector('.wb-lead[data-l="' + i + '"]'); if (!g) return;
        var k = eio(seg(lt, o.t, o.t + 0.85)), paths = g.querySelectorAll(".wb-lead-o, .wb-lead-c");
        paths.forEach(function (pt) { if (!pt._L) pt._L = pt.getTotalLength(); pt.style.strokeDasharray = pt._L + " " + (pt._L + 2); pt.style.strokeDashoffset = (pt._L * (1 - k)).toFixed(1); });
        var e0 = E.dev.querySelector('[data-le="' + i + ':0"]'), e1 = E.dev.querySelector('[data-le="' + i + ':1"]');
        if (e0) e0.style.opacity = k > 0.02 ? 1 : 0; if (e1) e1.style.opacity = k > 0.98 ? 1 : 0;
      });
      // camera
      var v = viewFor(scene, A);
      if (!A._pvView) A._pvView = ai > 0 && p.acts[ai - 1]._view ? p.acts[ai - 1]._view : v; A._view = v;
      var w = eio(seg(lt, 0.0, 1.4)), pv = A._pvView; bench.view(pv[0] + (v[0] - pv[0]) * w, pv[1] + (v[1] - pv[1]) * w, pv[2] + (v[2] - pv[2]) * w, pv[3] + (v[3] - pv[3]) * w);
      if (A.tab) {
        E.tabbox.style.opacity = eo(seg(lt, A.trans - 0.6, A.trans)).toFixed(2);
        var rowsT = A.type === "sweep" ? A.steps.map(function (si, k) { return k === 0 ? A.trans - 0.3 : A.sw[k - 1].t + 0.7; }) : [A.trans - 0.2];
        var cnt = rowsT.filter(function (x) { return lt >= x; }).length, curRow = A.type === "sweep" ? (cnt > 0 ? A.swRow[cnt - 1] : -1) : -2, trows = A.tab.sc.panel.table.rows;
        E.trs.forEach(function (tr, i) {
          var has = trows[i].cells.length > 0, shown;
          if (A.type === "sweep") shown = has && (i < A.swRow[0] ? true : i <= curRow); else shown = has && lt >= rowsT[0];
          tr._v.forEach(function (c) { c.style.visibility = shown ? "visible" : "hidden"; }); tr._e.forEach(function (c) { c.style.visibility = shown ? "hidden" : "visible"; });
          var cur = A.type === "sweep" ? i === curRow : (shown && trows[i].on); var cl = "tr" + (cur ? " cur" : ""); if (tr.className !== cl) { tr.className = cl; BUSY = true; }
        });
      }
    }
    return { busy: BUSY, act: ai };
  };
})();
