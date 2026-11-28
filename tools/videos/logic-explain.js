/* CircuitVision — animated explainer engine for the Logic Design LAB videos (logic-lab<n>.mp4), in the design of the Circuits 1 lab videos (clab-explain.js).
   The video of a lab is made from the lab's own data (logic-exps.js): for every circuit the page asks the student to build (tasks "build" and "seq") the
   ICs are placed in their sockets, the wires of the page's solution are drawn one by one on the IC trainer (trainer.js), then the switches go through the
   truth table (or the page's own step list for the flip-flop and counter circuits) and the LEDs show the result. The table on the right is filled with
   what the simulated trainer reads, and checked against the page's expected values. English on screen, the Arabic text of the page is the subtitle track
   (logic-lab<n>.ar.vtt). No sound. Every frame is a pure function of time: EX.frame(id, t). */
(function () {
  "use strict";
  var CV = window.CV, EXPS = CV.logicLab.experiments, DICT = window.LOGIC_EN || {};
  var EX = window.EX = { S: {}, problems: [] }, BUSY = false, PW = 1130, PH = 730, AR = /[؀-ۿ]/;
  function c01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { var x = (t - a) / (b - a); if (x > 0 && x < 1) BUSY = true; return c01(x); }
  function eo(x) { return 1 - Math.pow(1 - x, 3); }
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function J(x) { return JSON.stringify(x); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function words(s) { return String(s || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; }
  function bdur(en) { return Math.max(3.0, Math.min(9, 1.6 + words(en) * 0.27)); }
  function strip(s) { return String(s).replace(/<[^>]+>/g, ""); }
  var EXTRA = { "نفّذ F ببوابات NAND فقط (7400) على الجهاز.": "Implement F with NAND gates only (7400) on the trainer.", "نفّذ F ببوابات NOR فقط (7402) على الجهاز.": "Implement F with NOR gates only (7402) on the trainer." };
  var PAT = [[/^النبضة (\d+): (\d+)$/, "Pulse $1: $2"], [/^النبضة (\d+): يرجع (\d+)$/, "Pulse $1: back to $2"]];
  function T(s) {   // Arabic of the page → English on screen
    s = String(s == null ? "" : s); if (!AR.test(s)) return strip(s);
    var v = DICT[s] || EXTRA[s]; if (v) return strip(v);
    for (var i = 0; i < PAT.length; i++) if (PAT[i][0].test(s)) return s.replace(PAT[i][0], PAT[i][1]);
    EX.problems.push("no English for: " + s); return strip(s).replace(/[؀-ۿ]+/g, "").replace(/\s+/g, " ").trim();
  }

  /* ---------- the tasks of a lab that are built on the trainer ---------- */
  function rowsOf(n) { var r = []; for (var m = 0; m < (1 << n); m++) { var b = []; for (var i = n - 1; i >= 0; i--) b.push((m >> i) & 1); r.push(b); } return r; }
  function pick(rows, k) { if (rows.length <= k) return rows; var o = []; for (var i = 0; i < k; i++) o.push(rows[Math.round(i * (rows.length - 1) / (k - 1))]); return o; }
  var tmp = null;
  function tmpTrainer() { if (!tmp) tmp = CV.trainer.mount(document.getElementById("tmp"), {}); return tmp; }
  function load(api, sol, nW) {
    api.reset(); Object.keys(sol.chips).forEach(function (s) { api.placeChip(+s, sol.chips[s]); });
    var map = holesFor(sol.wires); map.slice(0, nW == null ? map.length : nW).forEach(function (w) { api.addWire(w[0], w[1]); }); api.update();
  }
  function holesFor(wires) {
    var cnt = {};
    function pk(ep) {
      var k = cnt[ep] = (cnt[ep] || 0) + 1, m;
      if (ep === "V5") return "p5t" + ((k * 2 + 1) % 41);
      if (ep === "G0") return "gnd" + (k * 2 % 37);
      if ((m = /^sw:([a-i])$/.exec(ep))) return "sw" + m[1] + (k % 2);
      if ((m = /^led:([a-h])$/.exec(ep))) return "led" + m[1] + (k % 2);
      if (ep === "pls") return "pls" + (k % 2);
      if ((m = /^(\d+)\.(\d+)$/.exec(ep))) return "s" + m[1] + "p" + m[2] + (k % 2 ? "a" : "b");
      return ep;
    }
    return wires.map(function (w) { return [pk(w[0]), pk(w[1])]; });
  }
  function readOut(api, outs) { return outs.map(function (o) { return api.led(o[0]); }); }
  function tasksOf(e) {
    var out = [];
    (e.parts || []).forEach(function (p) {
      if (p.demo && p.table && p.table.cols.length === 3) out.push({ id: "demo" + p.id, type: "build", title: p.title, note: "", inputs: [["a", p.table.cols[0]], ["b", p.table.cols[1]]], outputs: [["a", p.table.cols[2]]], sol: p.demo, rows: p.table.rows.map(function (r) { return r.slice(0, 2); }), demo: true });
    });
    e.tasks.forEach(function (t) { if ((t.type === "build" || t.type === "seq") && t.sol) { if (t.probes && !t.outputs) t.outputs = t.probes.map(function (p) { return [p, p.name]; }); out.push(t); } });
    return out;
  }
  function pinLabel(chip, p) { var c = CV.chips.get(chip); return c && c.labels ? String(c.labels[p] || "") : ""; }
  function epEn(ep, sol) {
    var m;
    if (ep === "V5") return "+5V"; if (ep === "G0") return "0V"; if (ep === "pls") return "the pulse button";
    if ((m = /^sw:([a-i])$/.exec(ep))) return m[1] === "i" ? "the lower H/L switch" : "switch " + m[1];
    if ((m = /^led:([a-h])$/.exec(ep))) return "LED " + m[1];
    if ((m = /^(\d+)\.(\d+)$/.exec(ep))) { var l = pinLabel(sol.chips[m[1]], m[2]); return "pin " + m[2] + (l ? " (" + l + ")" : "") + (Object.keys(sol.chips).length > 1 ? " of socket " + m[1] : ""); }
    return ep;
  }
  function epAr(ep, sol) {
    var m;
    if (ep === "V5") return "+5V"; if (ep === "G0") return "0V"; if (ep === "pls") return "زر النبضة";
    if ((m = /^sw:([a-i])$/.exec(ep))) return m[1] === "i" ? "المفتاح السفلي" : "المفتاح " + m[1];
    if ((m = /^led:([a-h])$/.exec(ep))) return "LED " + m[1];
    if ((m = /^(\d+)\.(\d+)$/.exec(ep))) { var l = pinLabel(sol.chips[m[1]], m[2]); return "الرجل " + m[2] + (l ? " (" + l + ")" : "") + (Object.keys(sol.chips).length > 1 ? " في المقبس " + m[1] : ""); }
    return ep;
  }
  function isPin(ep) { return /^\d+\.\d+$/.test(ep); }
  function wireBeats(sol) {   // English + Arabic beats that describe the wiring of one solution
    var ch = Object.keys(sol.chips), W = sol.wires, b = [];
    b.push(["Place " + ch.map(function (s) { return sol.chips[s] + " in socket " + s; }).join(", ") + ".", "ركّب " + ch.map(function (s) { return sol.chips[s] + " في المقبس " + s; }).join(" و") + "."]);
    var pw = W.filter(function (w) { return (w[0] === "V5" || w[0] === "G0") && isPin(w[1]); });
    if (pw.length) b.push(["Power first: +5V to every VCC pin and 0V to every GND pin. A chip without power does nothing.", "التغذية أولاً: +5V لرجل VCC و 0V لرجل GND في كل دائرة. الدائرة بدون تغذية لا تعمل."]);
    var ins = W.filter(function (w) { return /^sw:/.test(w[0]) && isPin(w[1]) || /^sw:/.test(w[1]) && isPin(w[0]); }), pls = W.filter(function (w) { return w[0] === "pls" || w[1] === "pls"; });
    if (ins.length) { var s2 = ins.slice(0, 3).map(function (w) { var a = /^sw:/.test(w[0]) ? w : [w[1], w[0]]; return epEn(a[0], sol) + " to " + epEn(a[1], sol); });
      b.push(["Inputs from the switches: " + s2.join("; ") + (ins.length > 3 ? "; and " + (ins.length - 3) + " more" : "") + ".", "المداخل من المفاتيح: " + ins.slice(0, 3).map(function (w) { var a = /^sw:/.test(w[0]) ? w : [w[1], w[0]]; return epAr(a[0], sol) + " ← " + epAr(a[1], sol); }).join("، ") + (ins.length > 3 ? "، و" + (ins.length - 3) + " أخرى" : "") + "."]); }
    if (pls.length) b.push(["The clock comes from the pulse button: pressing it gives a rising edge.", "الساعة من زر النبضة: الضغط يعطي حافة صاعدة."]);
    var mid = W.filter(function (w) { return isPin(w[0]) && isPin(w[1]); });
    if (mid.length) b.push(["Chip to chip: " + mid.length + " wire" + (mid.length > 1 ? "s" : "") + " carry an output of one gate into an input of the next.", "بين الدوائر: " + mid.length + " سلك ينقل مخرج بوابة إلى مدخل التالية."]);
    var outs = W.filter(function (w) { return /^led:/.test(w[0]) && isPin(w[1]) || /^led:/.test(w[1]) && isPin(w[0]); });
    if (outs.length) b.push(["Outputs to the LEDs: " + outs.slice(0, 3).map(function (w) { var a = /^led:/.test(w[0]) ? [w[1], w[0]] : w; return epEn(a[0], sol) + " to " + epEn(a[1], sol); }).join("; ") + (outs.length > 3 ? "; and " + (outs.length - 3) + " more" : "") + ".",
      "المخارج إلى LED: " + outs.slice(0, 3).map(function (w) { var a = /^led:/.test(w[0]) ? [w[1], w[0]] : w; return epAr(a[0], sol) + " ← " + epAr(a[1], sol); }).join("، ") + (outs.length > 3 ? "، و" + (outs.length - 3) + " أخرى" : "") + "."]);
    return b;
  }
  function head(l) { return String(l).split(/\s*=/)[0].trim(); }

  /* ---------- the plan: acts and their timings; the readings are taken once, here ---------- */
  function build(id) {
    var D = EX.S[id], e = D.exp, acts = [];
    acts.push({ type: "title", chip: "Logic Design · Lab " + e.n, h1: T(e.title).replace(/(,| and | — )/, "<br>$1"), go: "In this lab you will",
      goals: (e.objective || []).slice(0, 3).map(function (o) { return [T(o)]; }),
      beats: [["Welcome to this Logic Design lab. We work on the IC trainer, one chip and one wire at a time.", (e.objective || []).join(" ")], ["Every circuit is checked against its truth table, row by row.", ""]] });
    tasksOf(e).forEach(function (t) {
      var sol = t.sol, nW = sol.wires.length, api = tmpTrainer();
      var title = T(t.title), note = t.note ? T(t.note) : "";
      var bb = wireBeats(sol);
      acts.push({ type: "build", kick: title.length > 54 ? title.slice(0, 52).replace(/\s+\S*$/, "") + "…" : title, task: t, sol: sol,
        beats: (note ? [[note, t.note || ""]] : []).concat(bb) });
      // the readings
      var tsel, rows = [];
      if (t.type === "seq") {
        load(api, sol); var st = {}; api.state.sw = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0 }; api.pulse(0); api.solve();
        t.steps.forEach(function (s, k) {
          Object.keys(s.sw || {}).forEach(function (q) { api.setSwitch(q, s.sw[q]); }); if (s.pulse !== undefined) api.pulse(s.pulse); api.solve();
          var got = readOut(api, t.outputs); if (s.want && s.want.some(function (w, i) { return w !== null && w !== got[i]; })) EX.problems.push(e.id + "/" + t.id + " step " + k + ": " + got + " vs " + s.want);
          rows.push({ step: s, got: got, cells: [String(k + 1), s.pulse === undefined ? (rows.length ? rows[rows.length - 1].cells[1] : "0") : String(s.pulse)].concat(got.map(String)) });
        });
        api.pulse(0); api.state.sw = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0 };
        acts.push({ type: "test", seq: true, kick: "Step through it", task: t, sol: sol, rows: rows, head: ["#", "CLK"].concat(t.outputs.map(function (o) { return head(o[1]); })), dur1: 2.4,
          beats: t.steps.map(function (s, k) { return [T(s.say || "Step " + (k + 1)), s.say || ""]; }) });
      } else {
        var all = t.rows ? t.rows.map(function (r) { return r.slice(0, t.inputs.length); }) : rowsOf(t.inputs.length), use = t.inputs.length <= 3 || t.rows ? all : pick(all, 8);
        load(api, sol);
        use.forEach(function (bits, k) {
          t.inputs.forEach(function (s, i) { api.setSwitch(s[0], bits[i]); }); api.solve();
          var got = readOut(api, t.outputs), want = t.fn ? t.fn(bits) : null;
          if (want && want.some(function (w, i) { return w !== null && w !== got[i]; })) EX.problems.push(e.id + "/" + t.id + " row " + bits.join("") + ": " + got + " vs " + want);
          rows.push({ bits: bits, got: got, cells: bits.map(String).concat(got.map(String)) });
        });
        t.inputs.forEach(function (s) { api.setSwitch(s[0], 0); });
        acts.push({ type: "test", kick: "Truth table", task: t, sol: sol, rows: rows, head: t.inputs.map(function (s) { return head(s[1]); }).concat(t.outputs.map(function (o) { return head(o[1]); })), nin: t.inputs.length, dur1: 1.6,
          beats: [["Set the switches to each input combination and read the LEDs: " + (use.length < all.length ? use.length + " of the " + all.length + " rows are shown." : "every row is shown."), "ضع المفاتيح على كل تركيبة مدخلات واقرأ الـ LED" + (use.length < all.length ? ": نعرض " + use.length + " صفوف من " + all.length + "." : ".")],
                  ["Each LED lights for a 1 and stays dark for a 0.", "كل LED يضيء مع 1 وينطفئ مع 0."]] });
      }
    });
    acts.push({ type: "end", rows: [["Power every IC first: VCC to +5V and GND to 0V."], ["Inputs from the switches, outputs to the LEDs, one wire at a time."], ["Check every row of the truth table against the theory."]],
      beats: [["That is the whole lab, built and tested on the trainer.", ""]] });
    // timings
    var t = 0, subs = [], plan = [];
    acts.forEach(function (a) {
      var A = { type: a.type, a: a, t0: t, beats: [], bt: 0 };
      var seqTest = a.type === "test" && a.seq;
      (a.beats || []).forEach(function (b) { var d = seqTest ? a.dur1 : bdur(b[0]); A.beats.push({ t0: A.bt, t1: A.bt + d, en: b[0], ar: b[1] }); A.bt += d; });
      if (a.type === "build") {
        var nc = Object.keys(a.sol.chips).length, nw = a.sol.wires.length; A.nc = nc; A.nw = nw; A.tc = 0.6; A.tw = 0.6 + nc * 0.9 + 0.4; A.wd = nw > 14 ? 0.62 : 1.0; A.tend = A.tw + nw * A.wd + 0.8; A.dur = Math.max(A.bt + 0.6, A.tend);
        A.view = viewOf(a.sol);
      } else if (a.type === "test") { A.t1 = 1.2; A.dur = Math.max(A.bt + 0.4, A.t1 + a.rows.length * a.dur1 + 1.2); A.view = viewOf(a.sol); }
      else if (a.type === "title") A.dur = Math.max(A.bt + 0.8, 10); else A.dur = Math.max(A.bt + 0.8, 8);
      A.beats.forEach(function (b) { if (b.ar) subs.push([t + b.t0, t + b.t1, b.ar]); });
      plan.push(A); t += A.dur;
    });
    return (D._plan = { dur: t, acts: plan, subs: subs });
  }
  var LAY = null;
  function viewOf(sol) {   // the part of the trainer an act is about
    LAY = LAY || CV.trainer.layout(); var r = null;
    function add(b) { r = r ? [Math.min(r[0], b[0]), Math.min(r[1], b[1]), Math.max(r[2], b[2]), Math.max(r[3], b[3])] : b; }
    holesFor(sol.wires).forEach(function (w) { w.forEach(function (h) { var o = LAY.byId[h]; if (!o) return; add([o.x - (/^sw/.test(h) ? 110 : 0), o.y, o.x + (/^led/.test(h) ? 120 : 0), o.y]); }); });
    if (!r) r = [0, 0, 1280, 960];
    var pad = 70, x = r[0] - pad, y = r[1] - pad, w = r[2] - r[0] + 2 * pad, h = r[3] - r[1] + 2 * pad;
    w = Math.max(w, 560); h = Math.max(h, w * PH / PW); w = Math.max(w, h * PW / PH);
    var cx = x + (r[2] - r[0] + 2 * pad) / 2, cy = y + (r[3] - r[1] + 2 * pad) / 2; x = cx - w / 2; y = cy - h / 2;
    if (w > 1280 || h > 960) { var k = Math.max(w / 1280, h / 960); w /= k; h /= k; x = cx - w / 2; y = cy - h / 2; }
    x = Math.max(0, Math.min(1280 - w, x)); y = Math.max(0, Math.min(960 - h, y)); return [x, y, w, h];
  }
  EX.add = function (id, d) { EX.S[id] = d; };
  EX.list = function () { return Object.keys(EX.S); };
  EX.plan = function (id) { return EX.S[id]._plan || build(id); };
  EX.info = function (id) { var p = EX.plan(id); return { dur: p.dur, subs: p.subs, sfx: [], scenes: p.acts.map(function (A) { return [A.t0, A.dur, A.type]; }), problems: EX.problems.slice() }; };

  /* ---------- the frame ---------- */
  var LOGO = '<svg viewBox="0 0 34 24"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#3fb6ff"/><stop offset="1" stop-color="#2f7bff"/></linearGradient></defs><path d="M14 4.5A8.5 8.5 0 1 0 14 19.5" fill="none" stroke="url(#lg)" stroke-width="3.2" stroke-linecap="round"/><path d="M16 4l7 16 7-16" fill="none" stroke="url(#lg)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var built = "", E = {}, curAct = -1, api = null, curKey = "", svg = null;
  function q(s) { return E.root.querySelector(s); }
  function mkFrame(id) {
    if (built === id) return; built = id; var D = EX.S[id];
    E.root = document.getElementById("frame");
    E.root.innerHTML = '<div class="bg"></div><div class="grid"></div><div class="hdr"><div class="brand">' + LOGO + 'CircuitVision</div><span>' + esc(D.hdr) + '</span><span class="ttl">' + esc(D.title) + '</span></div>' +
      '<div class="lab"><span class="dot"></span><span class="lk"></span></div><div id="dev"><div id="tr"></div></div>' +
      '<div class="col"><div class="col-in"></div></div><div class="tabbox"></div><div class="tcard"></div><div class="rows"></div><div class="eqbox"><div></div></div><div class="pbar"><i></i></div>';
    ["lk", "col", "tabbox", "tcard", "rows", "eqbox", "pbar"].forEach(function (k) { E[k] = q("." + k); });
    E.dev = document.getElementById("dev"); E.bar = q(".pbar i"); E.eq = q(".eqbox div");
    try { localStorage.clear(); } catch (x) {}
    api = CV.trainer.mount(document.getElementById("tr"), {}); svg = document.querySelector("#tr svg.tr-svg"); curKey = "";
  }
  function actHtml(A) {
    var a = A.a;
    E.dev.style.display = E.col.style.display = "none"; E.tabbox.style.display = "none"; E.tcard.style.display = E.rows.style.display = E.eqbox.style.display = "none";
    E.lk.textContent = a.kick || ""; E.col.firstChild.innerHTML = "";
    var bt = A.beats.map(function (b) { return '<div class="bt">' + esc(b.en) + "</div>"; }).join("");
    if (a.type === "title") {
      E.lk.textContent = ""; E.tcard.style.display = "flex";
      E.tcard.innerHTML = '<div class="tchip">' + esc(a.chip) + '</div><h1>' + a.h1 + '</h1><div class="trule"></div><div class="tgo">' + esc(a.go) + "</div><ul>" + a.goals.map(function (g) { return "<li>" + esc(g[0]) + "</li>"; }).join("") + "</ul>";
    } else if (a.type === "end") {
      E.rows.style.display = "flex"; E.rows.innerHTML = a.rows.map(function (r, i) { return '<div class="row"><div class="ic">' + (i + 1) + "</div><div>" + esc(r[0]) + "</div></div>"; }).join("");
    } else {
      E.dev.style.display = "block"; E.col.style.display = "block"; E.col.firstChild.innerHTML = bt; E.col.classList.toggle("short", a.type === "test");
      if (a.type === "test") {
        var nc = a.head.length, cls = nc > 11 ? "lg2" : nc > 7 ? "lg" : "";
        var h = '<div class="tt">' + esc(a.task.demo ? "Truth table" : T(a.task.title).slice(0, 44)) + '</div><table class="tb ' + cls + '"><tr>' + a.head.map(function (c, i) { return "<th" + (a.nin && i === a.nin - 1 ? ' style="border-right:2px solid #3fb6ff"' : "") + ">" + esc(c) + "</th>"; }).join("") + "</tr>";
        a.rows.forEach(function (r) { h += '<tr class="tr">' + r.cells.map(function (c, j) { return '<td class="b v' + (j >= (a.nin || (a.seq ? 2 : 0)) ? " pc" : "") + '"' + (a.nin && j === a.nin - 1 ? ' style="border-right:2px solid #3fb6ff"' : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; });
        E.tabbox.innerHTML = h + "</table>"; E.tabbox.style.display = "block"; E.tabbox.style.top = "430px"; E.trs = [].slice.call(E.tabbox.querySelectorAll("tr.tr"));
      }
    }
    E.bt = [].slice.call(E.col.querySelectorAll(".bt"));
    if (a.type === "title") { var tc = E.tcard; E.tch = tc.querySelector(".tchip"); E.th1 = tc.querySelector("h1"); E.tr = tc.querySelector(".trule"); E.tg = tc.querySelector(".tgo"); E.tli = [].slice.call(tc.querySelectorAll("li")); }
    if (a.type === "end") E.rw = [].slice.call(E.rows.querySelectorAll(".row"));
  }
  var prevView = null;
  function setView(v) { svg.setAttribute("viewBox", v.map(function (x) { return x.toFixed(1); }).join(" ")); }
  function setState(A, nC, nW, step) {   // the trainer at one moment of an act
    var a = A.a, sol = a.sol, key = J([curAct, nC, nW, step]); if (key === curKey) return false; curKey = key;
    api.reset(); Object.keys(sol.chips).slice(0, nC).forEach(function (s) { api.placeChip(+s, sol.chips[s]); });
    holesFor(sol.wires).slice(0, nW).forEach(function (w) { api.addWire(w[0], w[1]); });
    api.state.sw = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0 }; api.pulse(0); api.solve();
    if (step >= 0) {
      if (a.seq) { for (var k = 0; k <= step; k++) { var s = a.task.steps[k]; Object.keys(s.sw || {}).forEach(function (z) { api.setSwitch(z, s.sw[z]); }); if (s.pulse !== undefined) api.pulse(s.pulse); api.solve(); } }
      else { var r = a.rows[step]; a.task.inputs.forEach(function (s, i) { api.setSwitch(s[0], r.bits[i]); }); api.solve(); }
    }
    api.update(); return true;
  }
  function actAt(p, t) { var i = 0; while (i < p.acts.length - 1 && t >= p.acts[i + 1].t0) i++; return i; }
  EX.frame = function (id, t) {
    BUSY = false; var p = EX.plan(id); mkFrame(id); var ai = actAt(p, t), A = p.acts[ai], a = A.a, lt = t - A.t0;
    if (ai !== curAct) { curAct = ai; actHtml(A); BUSY = true; curKey = ""; if (A.view) { A._pv = ai > 0 && p.acts[ai - 1]._v ? p.acts[ai - 1]._v : A.view; } }
    E.bar.style.width = (t / p.dur * 100).toFixed(2) + "%";
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
    } else {
      var w = eio(seg(lt, 0, 1.4)), pv = A._pv || A.view, v = A.view; A._v = [0, 1, 2, 3].map(function (i) { return pv[i] + (v[i] - pv[i]) * w; }); setView(A._v);
      if (A.type === "build") {
        var nC = Object.keys(a.sol.chips).length, cs = lt < A.tc ? 0 : Math.min(nC, Math.floor((lt - A.tc) / 0.9) + 1);
        var nW = lt < A.tw ? 0 : Math.min(A.nw, Math.floor((lt - A.tw) / A.wd) + 1);
        if (setState(A, cs, nW, -1)) BUSY = true;
        if (nW > 0) {   // the newest wire is drawn from its start to its end
          var paths = [].slice.call(svg.querySelectorAll('path[stroke-linecap="round"]')), pth = paths[paths.length - 1];
          if (pth) { var k = eio(seg(lt, A.tw + (nW - 1) * A.wd, A.tw + (nW - 1) * A.wd + Math.min(0.9, A.wd))); if (!pth._L) pth._L = pth.getTotalLength(); pth.style.strokeDasharray = pth._L + " " + (pth._L + 2); pth.style.strokeDashoffset = (pth._L * (1 - k)).toFixed(1);
            var rs = []; for (var n = pth.nextSibling; n && n.tagName === "rect" && rs.length < 2; n = n.nextSibling) rs.push(n); if (rs[1]) rs[1].style.opacity = k > 0.98 ? 1 : 0; if (rs[0]) rs[0].style.opacity = k > 0.02 ? 1 : 0; }
        }
      } else {
        var step = lt < A.t1 ? -1 : Math.min(a.rows.length - 1, Math.floor((lt - A.t1) / a.dur1));
        if (setState(A, 99, 99, step)) BUSY = true;
        E.tabbox.style.opacity = eo(seg(lt, 0.2, 0.9)).toFixed(2);
        E.trs.forEach(function (tr, i) { var shown = step >= 0 && i <= step, cl = "tr" + (i === step ? " cur" : ""); tr._v = tr._v || [].slice.call(tr.querySelectorAll("td")); tr._v.forEach(function (c) { c.style.visibility = shown ? "visible" : "hidden"; }); if (tr.className !== cl) { tr.className = cl; BUSY = true; } });
      }
    }
    return { busy: BUSY, act: ai };
  };

  /* ---------- the seven labs ---------- */
  EXPS.forEach(function (e) {
    EX.add("logic-lab" + e.n, { exp: e, hdr: "Logic Design · Lab", title: "Lab#" + e.n + " — " + T(e.title) });
  });
})();
