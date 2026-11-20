/* Scenes of the Circuits 2 lab videos (c2lab1.mp4 … c2lab10.mp4), rendered by lesson-studio.html + lesson-render.py.
   Everything shown comes from c2lab.js itself: the schematic of each procedure, the instrument readings computed by its models,
   and the tables filled with the same values the page accepts. Not part of the site. */
(function () {
  "use strict";
  var X = CV.c2lab, sig = X.sig, L = CV.lessons = CV.lessons || {}, V = CV.ssVideo = CV.ssVideo || {};
  function strip(h) { return String(h).replace(/<[^>]+>/g, ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v) { if (typeof v !== "number") return esc(v); if (v === 0) return "0"; var a = Math.abs(v); return String(a >= 1e5 ? Math.round(v) : sig(v, a >= 1000 ? 5 : 4)); }
  function dur(h, base) { return Math.min(16, (base || 4) + strip(h).length / 20); }
  function board(list, cur) { return "<div class='bd'>" + list.map(function (x, k) { return "<div class='bd-i" + (k === cur ? " now" : "") + "'>" + x + "</div>"; }).join("") + "</div>"; }
  function sch(p) { return CV.draw.render(p.fig, { aria: "" }); }
  function meters(r) {
    return "<div style='display:flex;flex-direction:column;align-items:center'><div class='mt'>" + r.meters.map(function (m) { return "<div class='mt-i'><span>" + esc(m[0]) + "</span><b" + (/[\u0600-\u06ff]/.test(String(m[1])) ? " class='tx'" : "") + ">" + (typeof m[1] === "number" ? fmt(m[1]) : esc(m[1])) + (m[2] ? " <small>" + esc(m[2]) + "</small>" : "") + "</b></div>"; }).join("") + "</div>" +
      (r.scope ? (function () { var s = r.scope; s.w = 700; s.h = 300; s.left = 50; return "<div class='mt-sc'>" + CV.sp.plot(s) + "</div>"; })() : "") + "</div>";
  }
  function table(T, maxRows) {
    var rows = T.rows; if (rows.length > maxRows) { var step = Math.ceil(rows.length / maxRows); rows = rows.filter(function (_, i) { return i % step === 0 || i === T.rows.length - 1; }); }
    return "<table class='lgt" + (T.cols.length > 5 ? " sm" : "") + "'><tr>" + T.cols.map(function (c) { return "<th>" + esc(c.h) + "</th>"; }).join("") + "</tr>" + rows.map(function (r) {
      var m = T.model(r);
      return "<tr>" + T.cols.map(function (c) {
        if (c.src === "%") { var a = m[c.of[0]], b = m[c.of[1]]; return "<td>" + (a ? (Math.abs(a - b) / Math.abs(a) * 100).toFixed(2) + "%" : "—") + "</td>"; }
        var v = c.src === "row" ? (m[c.k] === undefined ? r : m[c.k]) : m[c.k]; return "<td" + (c.src === "meas" ? " class='v'" : "") + ">" + fmt(v) + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</table>" + (rows.length < T.rows.length ? "<div class='mt-n'>" + rows.length + " من " + T.rows.length + " صفًا</div>" : "");
  }
  function plotOf(p) {
    var P = p.plot; if (!P) return null; var sets = [];
    P.ys.forEach(function (yk) { var pts = []; [P.table].concat(P.also != null ? [P.also] : []).forEach(function (ti) { var T = p.tables[ti]; T.rows.forEach(function (r) { if (r === "cut") return; var m = T.model(r), x = typeof m[P.x] === "number" ? m[P.x] : +r; pts.push([P.logx ? Math.log10(x) : x, m[yk]]); }); }); pts.sort(function (a, b) { return a[0] - b[0]; }); sets.push(pts); });
    var all = [].concat.apply([], sets), xs = all.map(function (q) { return q[0]; }), ys = all.map(function (q) { return q[1]; });
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), py = (y1 - y0) * 0.08 || 1;
    var s = { w: 700, h: 340, left: 52, x: [Math.min.apply(null, xs), Math.max.apply(null, xs)], y: [y0 - py, y1 + py], xl: P.xl + (P.logx ? " (log)" : ""), yl: P.yl, items: sets.map(function (pts, i) { return { pts: pts, c: i + 1 }; }) };
    if (P.logx) { s.xt = [-1, 0, 1, 2, 3].filter(function (k) { return k >= s.x[0] - 1e-9 && k <= s.x[1] + 1e-9; }); s.xf = function (v) { return String(+Math.pow(10, v).toPrecision(2)); }; }
    return CV.sp.plot(s);
  }
  function settings(p) {   // a few instrument settings to show: the default, then the first, middle and last table rows when the control matches
    var I = p.inst; if (!I) return [];
    var cs = I.controls || [], base = {}; cs.forEach(function (c) { base[c.k] = c.def; });
    var out = [base];
    var k = cs.length ? cs[0].k : null, T = p.tables[0];
    if (k && (k === "f" || k === "t" || k === "coil" || k === "c")) {
      var vals = cs[0].opts ? cs[0].opts.map(function (o) { return o[0]; }) : T.rows.filter(function (r) { return typeof r === "number"; }).map(String);
      [vals[0], vals[Math.floor(vals.length / 2)], vals[vals.length - 1]].forEach(function (v) { if (v !== undefined && String(v) !== String(base[k])) { var st = {}; for (var q in base) st[q] = base[q]; st[k] = v; if (!out.some(function (o) { return o[k] === st[k]; })) out.push(st); } });
    }
    if (k === "R") [6325, 6900].forEach(function (R) { var st = { R: R, f: "3000" }; out.push(st); });
    return out.slice(0, 4);
  }
  /* the bench itself with the ready circuit, as a still picture (the same drawing the student uses on the page) */
  function benchSvg(e, L) {
    if (!CV.clabBench || !e.inst) return null;
    var d = document.createElement("div"); d.style.cssText = "position:absolute;left:-5000px;width:1220px"; document.body.appendChild(d);
    var b = CV.clabBench.mount(d, { key: "vid-" + e.id, inst: e.inst, kit: e.kit });
    b.reset(); if (e.inst.indexOf("rb") > -1) b.set({ rb: { d: [0, 0, 0, 0, 0] } });
    var set = JSON.parse(JSON.stringify(L.set || {})), term = set.fgTerm; delete set.fgTerm;
    if (term) { var r = CV.clabCheck.solveL(e, L, {}, false); set.fg = set.fg || {}; set.fg.vpp = Math.round(r.state.inst.fg.vpp * 1000) / 1000; }
    b.load({ parts: L.parts, leads: L.leads, set: set });
    var svg = d.querySelector(".wb-svg").outerHTML; b.destroy(); d.remove(); return svg;
  }
  function label(p, st) { return (p.inst.controls || []).map(function (c) { var v = st[c.k], o = c.opts && c.opts.filter(function (x) { return String(x[0]) === String(v); })[0]; return c.label + ": <b>" + esc(o ? o[1] : v) + "</b>"; }).join("، "); }

  X.list.forEach(function (e) {
    var id = "c2lab" + e.n, out = [];
    L[id] = L[id] || { id: id }; L[id].course = "circuits-2-lab"; L[id].ar = e.title;
    out.push({ kind: "card", eyebrow: "معمل الدوائر الكهربائية 2 EE 2020 · التجربة " + e.n, title: e.title, en: "Experiment #" + e.n + ": " + e.en, lines: e.objective, dur: 6 });
    var p0 = e.procs[0];
    out.push({ title: "الأدوات", text: "<ul class='ticks'>" + e.equipment.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>", vis: sch(p0), cap: esc(p0.title), dur: 4 + e.equipment.length * 1.5 });
    e.theory.forEach(function (t, i) { out.push({ title: i ? "الخلفية (تابع)" : "الخلفية", text: "<p>" + t + "</p>", vis: i % 2 === 0 || !p0.inst ? sch(p0) : meters(p0.inst.read(settings(p0)[0])), dur: dur(t, 4) }); });
    if (e.note) out.push({ title: "ملاحظة على الكتيب", text: "<p>" + esc(e.note) + "</p>", vis: board(["<p>" + esc(e.note) + "</p>"], 0), dur: Math.min(16, 6 + e.note.length / 22) });
    e.prelab.forEach(function (t, k) {
      var from = Math.max(0, k - 3);
      out.push({ title: "التحضير (Pre-Lab)", sub: "السؤال " + (k + 1) + " من " + e.prelab.length, text: "<p>" + t.q + "</p><p style='color:#ff9f43'>" + t.sol + "</p>",
        vis: board(e.prelab.slice(from, k + 1).map(function (x, q) { return "<div class='n'>" + (from + q + 1) + "</div>" + x.q + "<br><span style='color:#7dffb0'>" + x.sol + "</span>"; }), k - from), dur: 5 + strip(t.q + t.sol).length / 22 });
    });
    e.procs.forEach(function (p) {
      out.push({ title: "خطوات التجربة", sub: p.title, text: "<ol class='steps'>" + p.steps.map(function (s) { return "<li class='now'>" + s + "</li>"; }).join("") + "</ol>", vis: sch(p), dur: 5 + strip(p.steps.join(" ")).length / 24 });
      (p.layouts || []).forEach(function (Lx) { var sv = benchSvg(e, Lx); if (sv) out.push({ title: "على طاولة المعمل", sub: p.title + (p.layouts.length > 1 ? " · " + Lx.name : ""), text: "<p>نفس الدائرة مركّبة على الطاولة: القطع على لوحة التوصيل، والأسلاك من الأجهزة، والأجهزة مضبوطة وتقرأ.</p><p>في صفحة التجربة: «ركّبها على طاولة المعمل» ثم «تحقق من توصيلي».</p>", vis: sv, dur: 7 }); });
      settings(p).forEach(function (st, i) { var r = p.inst.read(st); out.push({ title: "قراءة الأجهزة", sub: p.title, text: "<p>" + label(p, st) + "</p>" + (i === 0 ? "<p>القراءة من شاشة الجهاز، وتُكتب في الجدول كما هي.</p>" : ""), vis: meters(r), dur: 5 }); });
      if (p.inst && !(p.inst.controls || []).length) { /* fixed setups already shown once above */ }
      p.tables.forEach(function (T) {
        var hasM = T.cols.some(function (c) { return c.src === "meas"; }), hasC = T.cols.some(function (c) { return c.src === "calc"; });
        out.push({ title: "الجدول", sub: T.title, text: "<p>" + (hasM ? "الأرقام البرتقالية من الأجهزة. " : "") + (hasC ? "الباقي يُحسب من القوانين في الخلفية." : "") + "</p>" + (T.cols.some(function (c) { return c.src === "%"; }) ? "<p>والنسبة: |المحسوب − المقاس| ÷ المحسوب × 100.</p>" : ""), vis: table(T, 12), dur: 6 + Math.min(T.rows.length, 12) * 0.5 });
      });
      var pl = plotOf(p); if (pl) out.push({ title: "الرسم", sub: p.plot.yl + " مع " + p.plot.xl, text: "<p>نرسم قراءات الجدول. في صفحة التجربة يُرسم من قراءاتك أنت.</p>", vis: pl, dur: 6 });
    });
    out.push({ kind: "card", eyebrow: "انتهى الشرح", title: e.title, en: "التحضير والجداول تتحقق منها المنصة في صفحة التجربة", lines: [], dur: 4 });
    V[id] = out;
  });
})();
