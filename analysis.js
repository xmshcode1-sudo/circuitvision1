/* CircuitVision — circuit-analysis quantities for Chapter 4 (Techniques of Circuit Analysis).
   Built on mna.js. Adds:
     nodeLabels(c)   essential nodes (≥ 3 elements) named v₁, v₂ … relative to the ground node
     meshes(c)       mesh currents (clockwise) for the faces of a grid circuit, including wire currents
     thevenin(c)     open-circuit voltage, short-circuit current, R_Th = v_oc / i_sc at the port (type "T")
     superpose(c)    the response to each independent source acting alone
   and a generator for questions of kinds: vN, iM, Vth, Rth, In, Pmax, sup. */
(function (root) {
  "use strict";
  var CV = root.CV, MNA = CV.mna;
  var SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  function key(p) { return p[0] + "," + p[1]; }
  function clone(c) { return { rows: c.rows, cols: c.cols, ground: c.ground, edges: c.edges.map(function (e) { var o = {}; for (var k in e) o[k] = e[k]; return o; }) }; }

  /* ---------- nodes ---------- */
  function nodeLabels(c, opts) {
    var nodes = MNA.buildNodes(c), groups = {}, deg = {};
    if (opts && opts.only) return opts.only.map(function (p, i) { return { id: nodes.of(p), at: p, text: "v" + SUB[i + 1], name: "v" + (i + 1) }; });
    c.edges.forEach(function (e) {
      [e.a, e.b].forEach(function (p) {
        var id = nodes.of(p), g = groups[id] || (groups[id] = { id: id, pts: {}, conn: 0 });
        deg[key(p)] = (deg[key(p)] || 0) + 1; g.pts[key(p)] = p;
        if (e.type !== "W" && e.type !== "T") g.conn++;
      });
    });
    var list = Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.id !== -1 && g.conn >= 3; });
    list.forEach(function (g) {
      var pts = Object.keys(g.pts).map(function (k) { return g.pts[k]; });
      pts.sort(function (x, y) { return (deg[key(y)] - deg[key(x)]) || (x[0] - y[0]) || (x[1] - y[1]); });
      g.at = pts[0];
    });
    list.sort(function (x, y) { return (x.at[0] - y.at[0]) || (x.at[1] - y.at[1]); });
    return list.map(function (g, i) { return { id: g.id, at: g.at, text: "v" + SUB[i + 1], name: "v" + (i + 1) }; });
  }

  /* ---------- meshes ---------- */
  function meshes(c, sol) {
    var R = c.rows, C = c.cols, has = {};
    c.edges.forEach(function (e) { has[key(e.a) + "|" + key(e.b)] = e; });
    function edgeAt(a, b) { return has[key(a) + "|" + key(b)]; }
    // windows → faces (merge across missing interior edges; a missing perimeter edge opens the face to the outside)
    var parent = {};
    function find(k) { if (parent[k] === undefined) parent[k] = k; while (parent[k] !== k) k = parent[k] = parent[parent[k]]; return k; }
    function union(a, b) { var x = find(a), y = find(b); if (x !== y) parent[x] = y; }
    var r, cc;
    for (r = 0; r < R - 1; r++) for (cc = 0; cc < C - 1; cc++) {
      var w = "w" + r + "," + cc; find(w);
      if (!edgeAt([r, cc + 1], [r + 1, cc + 1])) union(w, cc + 1 < C - 1 ? "w" + r + "," + (cc + 1) : "out");
      if (!edgeAt([r + 1, cc], [r + 1, cc + 1])) union(w, r + 1 < R - 1 ? "w" + (r + 1) + "," + cc : "out");
      if (r === 0 && !edgeAt([0, cc], [0, cc + 1])) union(w, "out");
      if (cc === 0 && !edgeAt([r, 0], [r + 1, 0])) union(w, "out");
    }
    function faceOf(rr, c2) { return rr < 0 || c2 < 0 || rr >= R - 1 || c2 >= C - 1 ? find("out") : find("w" + rr + "," + c2); }
    // branch currents for every edge (wires from KCL at junction points)
    var cur = new Map();
    sol.elements.forEach(function (it) { cur.set(it.edge, it.i); });
    var wires = c.edges.filter(function (e) { return e.type === "W"; }), unknown = wires.slice();
    for (var guard = 0; unknown.length && guard < 200; guard++) {
      var progress = false;
      for (var u = 0; u < unknown.length; u++) {
        var wE = unknown[u];
        [wE.a, wE.b].some(function (pt) {
          var at = c.edges.filter(function (e) { return key(e.a) === key(pt) || key(e.b) === key(pt); });
          var unk = at.filter(function (e) { return !cur.has(e); });
          if (unk.length !== 1 || unk[0] !== wE) return false;
          var leaving = 0;
          at.forEach(function (e) { if (e !== wE) leaving += key(e.a) === key(pt) ? cur.get(e) : -cur.get(e); });
          var iw = key(wE.a) === key(pt) ? -leaving : leaving; // wire current a→b so that total leaving = 0
          cur.set(wE, iw); return true;
        }) && (unknown.splice(u, 1), u--, progress = true);
      }
      if (!progress) return null; // wire loop: current not determined
    }
    // face currents by propagation from the outside (current 0)
    var I = {}; I[find("out")] = 0;
    var rel = c.edges.map(function (e) {
      var h = e.a[0] === e.b[0];
      return h ? { e: e, p: faceOf(e.a[0], e.a[1]), m: faceOf(e.a[0] - 1, e.a[1]) }   // i_ab = I(below) − I(above)
               : { e: e, p: faceOf(e.a[0], e.a[1] - 1), m: faceOf(e.a[0], e.a[1]) };  // i_ab = I(left) − I(right)
    });
    for (var pass = 0; pass < 50; pass++) {
      var changed = false;
      rel.forEach(function (x) {
        var i = cur.get(x.e);
        if (x.p in I && !(x.m in I)) { I[x.m] = I[x.p] - i; changed = true; }
        else if (x.m in I && !(x.p in I)) { I[x.p] = i + I[x.m]; changed = true; }
      });
      if (!changed) break;
    }
    var bad = rel.some(function (x) { return !(x.p in I) || !(x.m in I) || Math.abs(I[x.p] - I[x.m] - cur.get(x.e)) > 1e-6 * (1 + Math.abs(cur.get(x.e))); });
    if (bad) return null;
    var faces = {};
    for (r = 0; r < R - 1; r++) for (cc = 0; cc < C - 1; cc++) { var f = find("w" + r + "," + cc); if (f !== find("out") && !faces[f]) faces[f] = { at: [r, cc], value: I[f] }; }
    var list = Object.keys(faces).map(function (k) { return faces[k]; });
    list.sort(function (x, y) { return (x.at[0] - y.at[0]) || (x.at[1] - y.at[1]); });
    return list.map(function (m, i) { return { at: m.at, value: m.value, text: "i" + SUB[i + 1], name: "i" + (i + 1) }; });
  }

  /* ---------- Thévenin / Norton ---------- */
  function thevenin(c) {
    var port = c.edges.filter(function (e) { return e.type === "T"; })[0];
    if (!port) return null;
    var open = clone(c); open.edges = open.edges.filter(function (e) { return e.type !== "T"; });
    var so = MNA.solve(open);
    if (!so.ok) return null;
    var voc = so.volt(port.a) - so.volt(port.b);
    var sh = clone(c); sh.edges.forEach(function (e) { if (e.type === "T") { e.type = "V"; e.value = 0; e.plus = "a"; e.name = "__sc"; } });
    var ss = MNA.solve(sh);
    if (!ss.ok) return null;
    var isc = ss.byName.__sc.i; // current a → b through the short
    if (Math.abs(isc) < 1e-9) return null;
    return { voc: voc, isc: isc, rth: voc / isc, open: so };
  }

  /* ---------- superposition ---------- */
  function superpose(c, target) {
    var srcs = c.edges.filter(function (e) { return e.type === "V" || e.type === "I"; });
    return srcs.map(function (s) {
      var k = clone(c);
      k.edges.forEach(function (e) { if ((e.type === "V" || e.type === "I") && e.name !== s.name) e.value = 0; });
      var so = MNA.solve(k);
      if (!so.ok) return null;
      var it = so.byName[target.el];
      return { src: s.name, value: target.q === "i" ? it.i : it.v };
    });
  }

  /* ---------- generator ---------- */
  var KINDS = ["vN", "iM", "Vth", "Rth", "In", "Pmax", "sup"];
  function generate(opts) {
    var Gi = CV.gen._internal, seed = opts.seed >>> 0;
    var kinds = opts.kinds || [opts.kind];
    for (var attempt = 1; attempt < 700; attempt++) {
      var R = CV.gen.rng(seed + attempt * 7919);
      var kind = R.pick(kinds);
      var fam = R.pick(opts.families || ["ladder", "grid"]);
      var c = Gi.FAMILIES[fam](R, {});
      var needPort = kind === "Vth" || kind === "Rth" || kind === "In" || kind === "Pmax";
      if (needPort) {
        var rights = c.edges.filter(function (e) { return e.a[0] !== e.b[0] && e.a[1] === c.cols - 1; });
        var port = R.pick(rights); port.type = "T"; delete port.value; delete port.plus; delete port.dir;
        if (!c.edges.some(function (e) { return e.type === "V" || e.type === "I"; })) { var r0 = R.pick(c.edges.filter(function (e) { return e.type === "R"; })); if (!r0) continue; Gi.addSource(r0, R, R() < 0.6 ? "V" : "I"); }
      }
      if (kind === "sup") {
        var srcs = c.edges.filter(function (e) { return e.type === "V" || e.type === "I"; });
        if (srcs.length < 2) { var r1 = R.pick(c.edges.filter(function (e) { return e.type === "R"; })); if (!r1) continue; Gi.addSource(r1, R, R() < 0.5 ? "V" : "I"); }
        if (c.edges.filter(function (e) { return e.type === "V" || e.type === "I"; }).length !== 2) continue;
      }
      if (opts.dependent && kind !== "sup" && !Gi.makeDependent(c, R)) continue;
      Gi.nameAll(c);
      if (c.edges.filter(function (e) { return e.type === "R"; }).length < 3) continue;
      if (needPort && !c.edges.some(function (e) { return e.type === "V" || e.type === "I"; })) continue;
      var g = null;
      try { g = build(c, kind, R, opts); } catch (err) { g = null; }
      if (!g) continue;
      if (attempt < 450 && !Gi.clean(g.question.value)) continue;
      c.seed = seed; c.attempt = attempt;
      g.seed = seed; g.family = fam; g.analysis = true;
      return g;
    }
    return null;
  }

  function build(c, kind, R, opts) {
    var nice = CV.gen._internal.nice, q, g = { circuit: c };
    if (kind === "vN" || kind === "iM" || kind === "sup") {
      var sol = MNA.solve(c);
      if (!sol.ok || Math.abs(sol.powerSum) > 1e-6) return null;
      if (opts.dependent) { var d = sol.byName.D; if (!d || Math.abs(d.i) < 1e-3 || Math.abs(sol.byName[d.edge.ctrl].i) < 1e-3) return null; }
      g.solution = sol;
      if (kind === "vN") {
        var nl = nodeLabels(c);
        if (nl.length < 2) return null;
        nl.forEach(function (n) { n.value = sol.volt(n.at); });
        var cand = nl.filter(function (n) { return nice(n.value); });
        if (!cand.length) return null;
        var pick = R.pick(cand);
        c.nodeLabels = nl; c.showGround = true; c.askedNode = pick.name;
        g.nodes = nl;
        q = { kind: "vN", value: pick.value, unit: "V", el: pick.name, label: pick.text };
      } else if (kind === "iM") {
        var ms = meshes(c, sol);
        if (!ms || ms.length < 2) return null;
        var mc = ms.filter(function (m) { return nice(m.value); });
        if (!mc.length) return null;
        var pm = R.pick(mc);
        c.meshLabels = ms; c.askedMesh = pm.name;
        g.meshes = ms;
        q = { kind: "iM", value: pm.value, unit: "A", el: pm.name, label: pm.text };
      } else {
        var rs = sol.elements.filter(function (it) { return it.edge.type === "R" && nice(it.i); });
        if (!rs.length) return null;
        var t = R.pick(rs), which = R() < 0.5 ? "i" : "v";
        var parts = superpose(c, { el: t.edge.name, q: which });
        if (parts.some(function (p) { return !p; })) return null;
        var src = R.pick(parts);
        if (!nice(src.value) || parts.some(function (p) { return Math.abs(p.value) < 1e-3; })) return null;
        t.edge.asked = which === "i" ? "iR" : "vR";
        g.parts = parts; g.total = which === "i" ? t.i : t.v;
        q = { kind: "sup", value: src.value, unit: which === "i" ? "A" : "V", el: t.edge.name, src: src.src, q: which };
      }
    } else {
      var th = thevenin(c);
      if (!th || !(th.rth > 0.05) || th.rth > 5000 || !nice(th.voc) || !nice(th.isc)) return null;
      if (opts.dependent) { var dd = th.open.byName.D; if (!dd || Math.abs(dd.i) < 1e-3) return null; }
      g.th = th; g.solution = th.open;
      var val = kind === "Vth" ? th.voc : kind === "Rth" ? th.rth : kind === "In" ? th.isc : th.voc * th.voc / (4 * th.rth);
      if (!nice(val)) return null;
      q = { kind: kind, value: val, unit: kind === "Vth" ? "V" : kind === "Rth" ? "Ω" : kind === "In" ? "A" : "W", el: "ab" };
      g.noTable = true;
    }
    g.question = q;
    return g;
  }

  function distractors(g) {
    var q = g.question, out = [], n = CV.num;
    function add(v, type, why) {
      if (!isFinite(v)) return;
      var a = Math.abs(q.value);
      if (Math.abs(Math.abs(v) - a) <= 0.01 * Math.max(a, 1e-9) && type !== "sign") return;
      if (out.some(function (o) { return Math.abs(o.value - v) <= 0.01 * Math.max(Math.abs(v), 1e-9); })) return;
      out.push({ value: v, type: type, why: why });
    }
    if (q.kind === "vN") {
      g.nodes.forEach(function (nd) { if (nd.name !== q.el) add(nd.value, "substitution", "هذه قيمة جهد العقدة <span class='ltr'>" + nd.text + "</span> وليس <span class='ltr'>" + q.label + "</span>."); });
      g.nodes.forEach(function (nd) { if (nd.name !== q.el) add(q.value - nd.value, "conceptual", "حسبت فرق الجهد بين <span class='ltr'>" + q.label + "</span> و <span class='ltr'>" + nd.text + "</span>. جهد العقدة يُقاس بالنسبة للأرضي (العقدة المرجعية)."); });
    }
    if (q.kind === "iM") {
      g.meshes.forEach(function (m) { if (m.name !== q.el) add(m.value, "substitution", "هذا تيار الحلقة <span class='ltr'>" + m.text + "</span> وليس <span class='ltr'>" + q.label + "</span>."); });
      g.meshes.forEach(function (m) { if (m.name !== q.el) add(q.value - m.value, "conceptual", "هذا تيار الفرع المشترك بين الحلقتين <span class='ltr'>(" + q.label + " − " + m.text + ")</span>، وليس تيار الحلقة نفسه."); });
    }
    if (q.kind === "Vth" || q.kind === "Rth" || q.kind === "In" || q.kind === "Pmax") {
      var th = g.th;
      if (q.kind === "Rth") { add(th.voc, "unit", "هذا جهد الدائرة المفتوحة V<sub>Th</sub>، وليس المقاومة."); add(1 / th.rth, "formula", "هذه الموصلية. <span class='ltr'>R<sub>Th</sub> = V<sub>Th</sub> / I<sub>N</sub></span>."); }
      if (q.kind === "Pmax") { add(th.voc * th.voc / th.rth, "formula", "نسيت القسمة على 4. أقصى قدرة <span class='ltr'>p = V<sub>Th</sub>² / (4R<sub>Th</sub>)</span>."); add(th.voc * th.voc / (2 * th.rth), "formula", "أقصى قدرة <span class='ltr'>V<sub>Th</sub>² / (4R<sub>Th</sub>)</span>، وليس على 2R<sub>Th</sub>."); add(th.voc * th.isc, "formula", "ضربت V<sub>Th</sub> في I<sub>N</sub>. عند أقصى نقل يكون الجهد على الحمل V<sub>Th</sub>/2 والتيار I<sub>N</sub>/2، فالقدرة ربع هذا الناتج."); }
      if (q.kind === "In") add(th.voc, "unit", "هذا جهد ثيفنن. تيار نورتن <span class='ltr'>I<sub>N</sub> = V<sub>Th</sub> / R<sub>Th</sub></span>.");
    }
    if (q.kind === "sup") {
      add(g.total, "conceptual", "هذه الاستجابة الكلية من كل المصادر معًا. في التراكب نطفئ المصادر الأخرى: مصدر الجهد يصبح قصرًا (سلكًا) ومصدر التيار يصبح دائرة مفتوحة.");
      g.parts.forEach(function (p) { if (p.src !== q.src) add(p.value, "substitution", "هذه مساهمة المصدر <span class='ltr'>" + p.src + "</span>، وليس <span class='ltr'>" + q.src + "</span>."); });
    }
    return out;
  }

  function steps(g) {
    var q = g.question, n = CV.num, f = CV.fmt, L = [];
    if (q.kind === "vN") {
      L.push("العقدة المرجعية (الأرضي) في أسفل اليسار. جهود كل العقد الأساسية:");
      L.push(g.nodes.map(function (nd) { return "<span class='eq-i'>" + nd.text + " = " + f(nd.value, "V") + "</span>"; }).join("، "));
      L.push("للتحقق: اكتب KCL عند كل عقدة بهذه القيم، ويجب أن يكون مجموع التيارات الخارجة صفرًا.");
    } else if (q.kind === "iM") {
      L.push("تيارات الحلقات (كلها مع عقارب الساعة):");
      L.push(g.meshes.map(function (m) { return "<span class='eq-i'>" + m.text + " = " + f(m.value, "A") + "</span>"; }).join("، "));
      L.push("تيار أي فرع مشترك = الفرق بين تياري الحلقتين على جانبيه.");
    } else if (q.kind === "sup") {
      L.push("نشغّل كل مصدر وحده ونطفئ الآخر (مصدر الجهد ← سلك، مصدر التيار ← دائرة مفتوحة):");
      g.parts.forEach(function (p) { L.push("مساهمة <span class='ltr'>" + p.src + "</span>: <span class='eq-i'>" + f(p.value, q.unit) + "</span>"); });
      L.push("المجموع = الاستجابة الكلية: <span class='eq-i'>" + g.parts.map(function (p) { return n(p.value); }).join(" + ").replace(/\+ −/g, "− ") + " = " + f(g.total, q.unit) + "</span>");
    } else {
      var th = g.th;
      L.push("جهد الدائرة المفتوحة بين a و b (الطرف a موجب): <span class='eq-i'>V<sub>Th</sub> = " + f(th.voc, "V") + "</span>");
      L.push("تيار القصر من a إلى b عبر سلك بين الطرفين: <span class='eq-i'>I<sub>N</sub> = " + f(th.isc, "A") + "</span>");
      L.push("<span class='eq-i'>R<sub>Th</sub> = V<sub>Th</sub> / I<sub>N</sub> = " + n(th.voc) + " / " + n(th.isc) + " = " + n(th.rth) + " Ω</span>");
      if (q.kind === "Pmax") L.push("أقصى نقل عند <span class='eq-i'>R<sub>L</sub> = R<sub>Th</sub> = " + n(th.rth) + " Ω</span>، و <span class='eq-i'>p<sub>max</sub> = V<sub>Th</sub>² / (4R<sub>Th</sub>) = " + f(q.value, "W") + "</span>");
    }
    return L;
  }

  CV.analysis = { nodeLabels: nodeLabels, meshes: meshes, thevenin: thevenin, superpose: superpose, generate: generate, distractors: distractors, steps: steps, KINDS: KINDS };
})(typeof window !== "undefined" ? window : globalThis);
