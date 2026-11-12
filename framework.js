/* CircuitVision — Project Academy framework: one project per Circuits 1 lesson.
   A project is written compactly (js/projects/c1-lesson-projects.js): the lesson's circuit with the values the
   student controls, the design questions, the checks, and what to measure. Everything the student sees as a number
   is computed here by the lab solver (js/lab/labsim.js) — the same solver the Smart Lab and the guided experiments use.
   Build steps and their pictures are generated from the circuit laid out on the breadboard (js/lab/bench.js). */
(function () {
  "use strict";
  var CV = window.CV, P = CV.projects = CV.projects || {}, order = CV.projectOrder = CV.projectOrder || [];
  var Cx = CV.ac.C, si = function (v, u) { return CV.ac.si(v, u); };

  /* ---------- circuits in the grid notation (same as the guided experiments) ---------- */
  function lab(spec) {
    var id = 0, edges = spec.edges.map(function (e) { var x = { id: "p" + (++id), k: e[0], a: e[1], b: e[2] }; for (var k in (e[3] || {})) x[k] = e[3][k]; return x; });
    edges.forEach(function (x) { if (x.ctrl) { var t = edges.filter(function (y) { return y.tag === x.ctrl; })[0]; x.ctrl = t ? t.id : null; } });
    return { rows: 7, cols: 7, arduino: false, ground: spec.ground || [2, 0], env: { light: 50, temp: 25 }, probes: Object.assign({ vp: null, vn: null, ch1: null, ch2: null }, spec.probes || {}), edges: edges };
  }
  function H(L, res) {
    var parent = {};
    function f(p) { var k = p.join(","); if (parent[k] === undefined) parent[k] = k; while (parent[k] !== k) k = parent[k] = parent[parent[k]]; return k; }
    L.edges.forEach(function (e) { if (e.k === "W" || (e.k === "SW" && e.closed)) parent[f(e.a)] = f(e.b); });
    var h = {
      L: L, res: res, ok: !!(res && res.ok),
      e: function (tag) { return L.edges.filter(function (x) { return x.tag === tag; })[0]; },
      el: function (tag) { var e = h.e(tag); return e && res && res.ok ? res.el[e.id] : null; },
      v: function (p, q) { return res.dcV(p) - (q ? res.dcV(q) : 0); },
      vac: function (p, q) { var z = res.acV(p); return q ? Cx.sub(z, res.acV(q)) : z; },
      mag: function (z) { return Cx.abs(z); }, ph: function (z) { return Cx.arg(z); },
      S: function (tag) { var x = h.el(tag); return Cx.scale(Cx.mul(x.vac, Cx.conj(x.iac)), 0.5); },
      same: function (p, q) { return f(p) === f(q); }
    };
    return h;
  }
  function solveAt(def, v) {
    var L = lab(def.circuit(v)), res = CV.labsim.solve(L, null);
    return { L: L, res: res, h: H(L, res) };
  }

  /* ---------- schematic for the renderer (engine/draw.js) ---------- */
  function drawing(L) {
    var R = 0, Cc = 0, nm = {}, cnt = {};
    L.edges.forEach(function (e) { R = Math.max(R, e.a[0], e.b[0]); Cc = Math.max(Cc, e.a[1], e.b[1]); });
    L.edges.forEach(function (e) { var k = { R: "R", C: "C", L: "L", V: e.bat ? "B" : "V", I: "I", GEN: "G", AM: "A", LED: "LED", DEP: "D", LAMP: "X", SW: "S" }[e.k]; if (!k) return; cnt[k] = (cnt[k] || 0) + 1; nm[e.id] = e.label || e.tag || k + cnt[k]; });
    var edges = L.edges.map(function (e) {
      var o = { a: e.a, b: e.b, name: nm[e.id] };
      switch (e.k) {
        case "W": o.type = "W"; delete o.name; break;
        case "R": o.type = "R"; o.value = e.value; break;
        case "C": case "L": o.type = e.k; o.value = e.value; o.vtext = si(e.value, e.k === "C" ? "F" : "H"); break;
        case "V": o.type = "V"; o.value = e.value; o.plus = e.plus; o.vtext = si(e.value, "V"); break;
        case "I": o.type = "I"; o.value = e.value; o.dir = e.dir; o.vtext = si(e.value, "A"); break;
        case "GEN": o.type = "V"; o.gen = true; o.plus = e.plus; o.vtext = si(e.amp, "V") + " · " + si(e.freq, "Hz"); break;
        case "LED": o.type = "V"; o.led = true; o.plus = e.plus; o.value = CV.labsim.LED_VF[e.color || "red"]; o.vtext = "LED"; break;
        case "LAMP": o.type = "R"; o.lamp = true; o.value = e.vr * e.vr / e.pr; o.vtext = si(e.vr, "V") + " · " + si(e.pr, "W"); break;
        case "DEP": o.type = e.dk; o.value = e.gain; o.plus = e.plus; o.dir = e.dir; o.vtext = CV.num(e.gain) + " × " + (/^C/.test(e.dk) ? "i" : "v") + "(" + (nm[e.ctrl] || "?") + ")"; break;
        case "SW": o.type = "W"; o.sw = true; o.closed = e.closed; o.label = nm[e.id]; break;
        case "AM": o.type = "W"; o.am = true; o.label = nm[e.id]; break;
      }
      return o;
    });
    return { rows: R + 1, cols: Cc + 1, edges: edges, showGround: true, ground: L.ground };
  }

  /* ---------- build steps from the breadboard layout ---------- */
  var B = CV.bench;
  function bandText(R) { var b = B.bands(R); return b ? b.list.map(function (c) { return B.BAND_AR[c[0]]; }).join("-") : ""; }
  function hn(p) { var q = B.parse(p); return q.kind === "rail" ? (q.pol === "-" ? "الخط الأزرق" : "الخط الأحمر") + " (" + q.col + ")" : "<span class='ltr'>" + p + "</span>"; }
  function partText(p, nm) {
    var a = hn(p.legs[0]), b = hn(p.legs[1]), n = "<b class='ltr'>" + (nm[p.id] || "") + "</b>";
    switch (p.k) {
      case "R": return "مقاومة " + n + " = <span class='ltr'>" + si(p.value, "Ω") + "</span> (" + bandText(p.value) + ") من " + a + " إلى " + b;
      case "LED": return "LED " + n + ": الرجل الطويلة (+) في " + a + " والقصيرة في " + b;
      case "C": return "مكثف " + n + " = <span class='ltr'>" + si(p.value, "F") + "</span> بين " + a + " و " + b + (p.value >= 1e-6 ? " (في AC استخدم مكثفًا غير قطبي أو ثنائي القطبية)" : "");
      case "L": return "ملف " + n + " = <span class='ltr'>" + si(p.value, "H") + "</span> بين " + a + " و " + b;
      case "BAT": return "بطارية " + n + " (<span class='ltr'>" + si(p.value, "V") + "</span>): الموجب في " + a + " والسالب في " + b;
      case "AM": return "أميتر لوحة " + n + " من " + a + " إلى " + b + " (يقرأ التيار الداخل من الرجل الأولى)";
      case "DEP": return "وحدة المصدر التابع " + n + " (" + p.dk + ") بين " + a + " و " + b;
      case "SW": return "مفتاح ضغط " + n + " بين " + a + " و " + b;
      case "LAMP": return "لمبة " + n + " بين " + a + " و " + b;
      case "W": return "سلك قصير من " + a + " إلى " + b;
    }
    return (B.KIND[p.k] ? B.KIND[p.k].ar : p.k) + " " + n + " بين " + a + " و " + b;
  }
  function buildSteps(def, v) {
    var L = lab(def.circuit(v)), b = B.convert(L), nm = CV.benchView.names(b), steps = [], shown = [];
    var board = b.parts.filter(function (p) { return !p.lead && p.k !== "W"; }), jumpers = b.parts.filter(function (p) { return !p.lead && p.k === "W"; }), leads = b.parts.filter(function (p) { return p.lead; });
    function add(t, ids) { var snap = shown.concat(ids); shown = snap; steps.push({ t: t, ids: ids.slice(), show: snap.slice() }); }
    for (var i = 0; i < board.length; i += 2) {
      var g = board.slice(i, i + 2);
      add("ركّب " + g.map(function (p) { return partText(p, nm); }).join("، ثم ") + ".", g.map(function (p) { return p.id; }));
    }
    if (jumpers.length) add("أسلاك التوصيل: " + jumpers.map(function (p) { return partText(p, nm).replace(/^سلك قصير /, ""); }).join("؛ ") + ".", jumpers.map(function (p) { return p.id; }));
    function leadsOf(re) { return leads.filter(function (p) { return re.test(p.legs[0]); }); }
    b.inst.ps.forEach(function (c, i) {
      var ls = leadsOf(new RegExp("^PS" + (i + 1) + "[+-]$")); if (!ls.length) return;
      var pl = ls.filter(function (p) { return /\+$/.test(p.legs[0]); })[0], mn = ls.filter(function (p) { return /-$/.test(p.legs[0]); })[0];
      add("مزود الجهد CH" + (i + 1) + ": السلك الأحمر (+) إلى " + hn(pl.legs[1]) + " والأسود (−) إلى " + hn(mn.legs[1]) + ". " + (c.isrc ? "اضبط حد التيار <span class='ltr'>" + si(c.ilim, "A") + "</span> والجهد <span class='ltr'>30 V</span> (تعمل مصدر تيار CC)" : "اضبط <span class='ltr'>" + si(c.v, "V") + "</span> وحد التيار <span class='ltr'>" + (def.ilim ? si(def.ilim, "A") : "100 mA") + "</span>") + "، ثم ON.", ls.map(function (p) { return p.id; }));
    });
    b.inst.fg.forEach(function (c, i) {
      var ls = leadsOf(new RegExp("^FG" + (i + 1) + "g?$")); if (!ls.length) return;
      var sg = ls.filter(function (p) { return !/g$/.test(p.legs[0]); })[0], gn = ls.filter(function (p) { return /g$/.test(p.legs[0]); })[0];
      add("مولد الإشارة CH" + (i + 1) + ": الإشارة إلى " + hn(sg.legs[1]) + " والأرضي إلى " + hn(gn.legs[1]) + ". اضبط: " + ({ sine: "جيبية", square: "مربعة", triangle: "مثلثية" }[c.wave] || "جيبية") + "، <span class='ltr'>" + si(c.freq, "Hz") + "</span>، <span class='ltr'>" + CV.num(c.vpp) + " Vpp</span>" + (c.phase ? "، الطور <span class='ltr'>" + CV.num(c.phase) + "°</span>" : "") + (c.rs ? "" : "، مقاومة الخرج 0 Ω (مثالي)") + "، ثم ON.", ls.map(function (p) { return p.id; }));
    });
    var meters = leadsOf(/^(M\d|S\d)/);
    if (meters.length) {
      var t = [];
      var m1 = leadsOf(/^M1/); if (m1.length) t.push("الملتيميتر 1 (" + (b.inst.dmm[0].mode === "VAC" ? "V~" : "V⎓") + "): VΩ إلى " + hn(m1.filter(function (p) { return /V$/.test(p.legs[0]); })[0].legs[1]) + " و COM إلى " + hn(m1.filter(function (p) { return /C$/.test(p.legs[0]); })[0].legs[1]));
      [1, 2].forEach(function (n) { var s = leadsOf(new RegExp("^S" + n + "$"))[0]; if (s) t.push("مجس CH" + n + " للأوسيلوسكوب إلى " + hn(s.legs[1]) + " ومشبكه الأرضي إلى الخط الأزرق"); });
      add("أجهزة القياس: " + t.join("؛ ") + "." + (leadsOf(/^S/).length ? " ثم اضغط AUTO في الأوسيلوسكوب." : ""), meters.map(function (p) { return p.id; }));
    }
    steps.bench = b;
    return steps;
  }
  function picture(steps, i, aria) {
    var b = JSON.parse(JSON.stringify(steps.bench)), s = steps[i], keep = {}, mark = {};
    s.show.forEach(function (id) { keep[id] = 1; }); s.ids.forEach(function (id) { mark[id] = 1; });
    b.parts = b.parts.filter(function (p) { return keep[p.id]; });
    return '<div class="bb-pic">' + CV.benchView.picture(b, { mark: mark, dim: true, aria: aria, full: steps.bench }) + '</div>';
  }
  function partsList(b, def) {
    var out = [["لوحة تجارب (breadboard)", "1"]], cnt = {};
    b.parts.forEach(function (p) {
      if (p.lead || p.k === "W") return;
      var k = p.k === "R" ? "مقاومة " + si(p.value, "Ω") + " ¼ W" : p.k === "C" ? "مكثف " + si(p.value, "F") : p.k === "L" ? "ملف " + si(p.value, "H") : p.k === "LED" ? "LED " + ({ red: "أحمر", yellow: "أصفر", blue: "أزرق", white: "أبيض", green: "أخضر" }[p.color] || "") : p.k === "BAT" ? "بطارية " + si(p.value, "V") : p.k === "AM" ? "أميتر لوحة (أو ملتيميتر إضافي على A)" : p.k === "DEP" ? "وحدة مصدر تابع (" + p.dk + ") — في المعمل تُبنى بترانزستور أو مضخّم عمليات" : B.KIND[p.k].ar;
      cnt[k] = (cnt[k] || 0) + 1;
    });
    Object.keys(cnt).forEach(function (k) { out.push([k, String(cnt[k])]); });
    var inst = [];
    if (b.inst.ps.some(function (c) { return c.on; })) inst.push("مزود جهد مختبري");
    if (b.inst.fg.some(function (c) { return c.on; })) inst.push("مولد إشارة");
    if (b.parts.some(function (p) { return /^M/.test(p.legs[0] || ""); }) || (def.measure || []).length) inst.push("ملتيميتر");
    if (b.parts.some(function (p) { return /^S/.test(p.legs[0] || ""); }) || b.inst.fg.some(function (c) { return c.on; })) inst.push("أوسيلوسكوب");
    out.push([inst.join(" + ") + " وأسلاك توصيل", "—"]);
    return out;
  }

  /* ---------- the project object (the shape academy.js and progress.js read) ---------- */
  function defaults(def) { var v = {}; def.controls.forEach(function (c) { v[c.id] = c.def; }); return v; }
  function opts(list, unit) { return list.map(function (x) { return { v: x, l: si(x, unit) }; }); }
  function define(def) {
    var id = def.lesson, d0 = defaults(def), s0 = solveAt(def, d0);
    if (!s0.res.ok) throw new Error("project " + id + " circuit does not solve: " + s0.res.error);
    var p = {
      id: id, lesson: id, chapter: def.chapter, ar: def.ar, en: def.en, level: def.level || "مبتدئ", lessons: [id].concat(def.also || []), summary: def.summary,
      idea: { html: def.idea, specs: def.specs },
      design: {
        prompt: def.design.prompt, figure: "<div class='lfig'>" + CV.draw.render(drawing(s0.L), { aria: def.ar }) + "</div>",
        steps: def.design.steps.map(function (s, i) {
          var o = { id: "s" + (i + 1), label: s.label, symbol: s.symbol || "", units: s.units, unitDefault: s.unitDefault || 0, hints: s.hints || [], tol: s.tol };
          if (s.kind === "choice") { o.kind = "choice"; o.options = s.options; }
          else o.answer = s.f(s0.h, d0);
          o.solution = typeof s.sol === "function" ? s.sol(s0.h, d0) : s.sol || "";
          if (s.diagnose) o.diagnose = s.diagnose(s0.h, d0);
          return o;
        })
      },
      sim: {
        intro: def.simIntro || "غيّر القيم، والمحاكي يحل الدائرة ويفحص شروط المشروع.",
        controls: def.controls.map(function (c) { return { id: c.id, label: c.label, type: "select", options: c.labels ? c.opts.map(function (x, i) { return { v: x, l: c.labels[i] }; }) : opts(c.opts, c.unit), def: c.def }; }),
        compute: function (v) {
          var vv = {}; def.controls.forEach(function (c) { vv[c.id] = v[c.id] !== undefined ? +v[c.id] : c.def; if (isNaN(vv[c.id])) vv[c.id] = v[c.id]; });
          var s = solveAt(def, vv);
          if (!s.res.ok) return { error: true, circuit: drawing(s.L), readings: [], checks: [{ t: "الدائرة قابلة للحل", ok: false }], expected: {}, design: [] };
          var h = s.h, ex = {};
          (def.measure || []).forEach(function (m) { ex[m.id] = m.f(h, vv); });
          return {
            circuit: drawing(s.L), lab: s.L,
            readings: def.readings.map(function (r) { return [r[0], r[1](h, vv)]; }),
            checks: def.checks.map(function (c) { return { t: c[0], ok: !!c[1](h, vv) }; }),
            expected: ex,
            design: def.controls.map(function (c) { var x = vv[c.id]; return c.label + ": " + (c.labels ? c.labels[c.opts.indexOf(x)] : si(x, c.unit)); })
          };
        }
      },
      safety: ["افصل مزود الجهد (OFF) قبل أي تعديل في اللوحة.", "ابدأ بحد تيار صغير في مزود الجهد، وارفعه بعد التأكد من التوصيل."].concat(def.safety || []),
      test: {
        intro: def.testIntro || "ابنِ الدائرة بقيم تصميمك في المحاكاة وقس. المتوقع محسوب من تصميمك.",
        quantities: (def.measure || []).map(function (m) { return { id: m.id, label: m.label, units: m.units, def: m.def || 0 }; }),
        tol: def.tol || 0.1,
        analyze: function (m, v, r) { return def.analyze ? def.analyze(m, v, r) : []; },
        causes: def.causes || ["سماحية المقاومات ±5%.", "مقاومة أسلاك التوصيل ونقاط التماس.", "دقة جهاز القياس ومقاومته الداخلية."]
      },
      buildFor: function (v) { return buildSteps(def, v); },
      picture: picture,
      labFor: function (v) { var vv = {}; def.controls.forEach(function (c) { vv[c.id] = v[c.id] !== undefined ? (isNaN(+v[c.id]) ? v[c.id] : +v[c.id]) : c.def; }); return lab(def.circuit(vv)); }
    };
    var st0 = buildSteps(def, d0);
    p.build = st0.map(function (s) { return { t: s.t }; });
    p.parts = partsList(st0.bench, def);
    P[id] = p; order.push(id);
    return p;
  }

  var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  function e12(from, to) { var out = []; for (var d = 1e-12; d <= to * 1.001; d *= 10) E12.forEach(function (m) { var v = Number((m * d).toPrecision(3)); if (v >= from * 0.999 && v <= to * 1.001 && out.indexOf(v) < 0) out.push(v); }); return out; }
  CV.projectKitDef = { define: define, e12: e12, lab: lab, H: H, drawing: drawing,
    U: { V: [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }], A: [{ l: "µA", f: 1e-6 }, { l: "mA", f: 1e-3 }, { l: "A", f: 1 }], W: [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }], OHM: [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }], DEG: [{ l: "°", f: 1 }], S: [{ l: "µs", f: 1e-6 }, { l: "ms", f: 1e-3 }, { l: "s", f: 1 }], HZ: [{ l: "Hz", f: 1 }, { l: "kHz", f: 1e3 }], J: [{ l: "J", f: 1 }, { l: "kJ", f: 1e3 }], VAR: [{ l: "mVAR", f: 1e-3 }, { l: "VAR", f: 1 }], VA: [{ l: "mVA", f: 1e-3 }, { l: "VA", f: 1 }], F: [{ l: "nF", f: 1e-9 }, { l: "µF", f: 1e-6 }], NONE: [{ l: "—", f: 1 }] } };
})();
