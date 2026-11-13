/* CircuitVision — checking a written solution against the circuit itself, line by line.
   The arithmetic checker (mathcheck.js) can only say whether numbers agree. This module knows the circuit:
   every symbol the student writes (node voltages v1…, mesh currents i1…, R2, Vs, i_R2, v_R2, vx…) is given its
   true value from the solver, so a written equation can be judged as physics, not just as arithmetic:
     · an equation that holds for this circuit is right, whatever form it is written in (it may be scaled,
       rearranged, or a combination of laws);
     · an equation that does not hold is compared with the correct KCL row of every node and KVL row of every
       mesh, and with the same rows after one typical slip (a branch left out, a sign flipped, the wrong
       resistor, a shared branch with the neighbour's current forgotten), to say exactly what went wrong;
     · a value written for a variable is compared with the circuit's, and a later line that is right with the
       student's own earlier values is reported as an error carried from that line, not a new one.
   Nothing here is guessed: every verdict comes from substituting the solver's values.
   check(text, ctx) → { lines: [...], summary: {...} }   ctx = { c, sol, nodes (nodeLabels), meshes } */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  var PREFIX = { p: 1e-12, n: 1e-9, "µ": 1e-6, "μ": 1e-6, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  var UNIT_RE = /^(p|n|µ|μ|u|m|k|K|M|G)?(Ω|ohm|V|A|W|S)(?![A-Za-z0-9Ω])/;
  var SUBD = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "ₓ": "x" };
  var SUBS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  function sub(name) { return name.replace(/(\d)/g, function (d) { return SUBS[+d]; }); }
  function fmt(v) { return CV.num ? CV.num(v) : String(+v.toPrecision(4)); }

  function normalize(s) {
    return String(s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/(\d)٫(\d)/g, "$1.$2").replace(/(\d),(\d)/g, "$1.$2")
      .replace(/[₀-₉ₓ]/g, function (c) { return SUBD[c]; })
      .replace(/[×·⋅]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/∥|\|\|/g, "|").trim();
  }

  /* ---------- the circuit's symbols ---------- */
  function context(ctx) {
    var c = ctx.c, sol = ctx.sol, MNA = CV.mna, nodes = MNA.buildNodes(c);
    var S = {}, idOf = {};
    (ctx.nodes || []).forEach(function (nl) { S["v" + nl.name.slice(1)] = { key: "n:" + nl.name, kind: "node", name: nl.name, val: sol.volt(nl.at), id: nl.id }; idOf[nl.id] = nl.name; });
    (ctx.meshes || []).forEach(function (m) { S["i" + m.name.slice(1)] = { key: "m:" + m.name, kind: "mesh", name: m.name, val: m.value }; });
    sol.elements.forEach(function (it) {
      var e = it.edge; if (!e.name || e.type === "W") return;
      var nm = e.name === "D" ? null : e.name;
      if (nm) {
        if (e.type === "R" || e.type === "V" || e.type === "I") S[nm] = { key: "e:" + nm, kind: "value", name: nm, val: e.value };
        S["v" + nm] = S["v_" + nm] = S["V(" + nm + ")"] = { key: "ev:" + nm, kind: "elv", name: nm, val: it.v };
        S["i" + nm] = S["i_" + nm] = S["I(" + nm + ")"] = { key: "ei:" + nm, kind: "eli", name: nm, val: it.i };
        S["p" + nm] = S["P" + nm] = S["p_" + nm] = S["P_" + nm] = { key: "ep:" + nm, kind: "elp", name: "p_" + nm, val: it.p };
      }
    });
    var D = sol.byName.D;
    if (D) { var ce = sol.byName[D.edge.ctrl]; if (ce) { S.vx = { key: "x:v", kind: "ctrl", name: "vₓ", val: ce.v }; S.ix = { key: "x:i", kind: "ctrl", name: "iₓ", val: ce.i }; } }
    return { S: S, nodes: nodes, idOf: idOf, c: c, sol: sol, meshes: ctx.meshes || [], labels: ctx.nodes || [] };
  }
  function lookup(K, raw) {
    var S = K.S, t = raw.replace(/_/g, "");
    if (S[raw]) return S[raw];
    if (S[t]) return S[t];
    var m = /^([vViI])\(?([A-Za-z]+\d*)\)?$/.exec(raw.replace(/_/g, ""));
    if (m && S[(m[1].toLowerCase()) + m[2]]) return S[m[1].toLowerCase() + m[2]];
    if (/^[vV]\d+$/.test(t) && S["v" + t.slice(1)]) return S["v" + t.slice(1)];
    if (/^[iI]\d+$/.test(t) && S["i" + t.slice(1)]) return S["i" + t.slice(1)];
    if (/^[vViI]x$/i.test(t)) return S[t[0].toLowerCase() + "x"] || null;
    return null;
  }

  /* ---------- expressions with symbols ---------- */
  function parse(seg, K) {
    var s = normalize(seg), t = [], i = 0, m, unknown = null;
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i)))) {
        var v = parseFloat(m[0]); i += m[0].length;
        var rest = s.slice(i).replace(/^\s+/, ""), sk = s.slice(i).length - rest.length, u = UNIT_RE.exec(rest);
        if (u) { v *= u[1] ? PREFIX[u[1]] : 1; i += sk + u[0].length; }
        t.push({ k: "n", v: v }); continue;
      }
      if ((m = /^[A-Za-z][A-Za-z0-9_]*(\([A-Za-z]+\d*\))?/.exec(s.slice(i)))) {
        var id = m[0]; i += id.length;
        if (UNIT_RE.test(id) && t.length && (t[t.length - 1].k === ")" || t[t.length - 1].k === "n") && !lookup(K, id)) continue; // a unit after a bracket
        var sym = lookup(K, id);
        if (!sym) { unknown = unknown || id; t.push({ k: "s", sym: null }); continue; }
        t.push({ k: "s", sym: sym }); continue;
      }
      if ("+-*/^()|".indexOf(ch) > -1) { t.push({ k: ch }); i++; continue; }
      return { bad: true };
    }
    var out = [];
    t.forEach(function (tok) {
      var prev = out[out.length - 1];
      if (prev && (prev.k === "n" || prev.k === ")" || prev.k === "s") && (tok.k === "(" || tok.k === "s" || (tok.k === "n" && prev.k !== "n"))) out.push({ k: "*" });
      out.push(tok);
    });
    if (unknown) return { unknown: unknown };
    var syms = {}; out.forEach(function (x) { if (x.k === "s") syms[x.sym.key] = x.sym; });
    function ev(env) {
      var p = 0;
      function peek() { return out[p] && out[p].k; }
      function expr() { var v = term(); while (peek() === "+" || peek() === "-") { var o = out[p++].k, r = term(); v = o === "+" ? v + r : v - r; } return v; }
      function term() { var v = pw(); while (peek() === "*" || peek() === "/" || peek() === "|") { var o = out[p++].k, r = pw(); v = o === "*" ? v * r : o === "/" ? v / r : v * r / (v + r); } return v; }
      function pw() { var v = un(); if (peek() === "^") { p++; v = Math.pow(v, pw()); } return v; }
      function un() { if (peek() === "-") { p++; return -un(); } if (peek() === "+") { p++; return un(); } return pr(); }
      function pr() {
        var tk = out[p++]; if (!tk) throw 0;
        if (tk.k === "n") return tk.v;
        if (tk.k === "s") return env(tk.sym);
        if (tk.k === "(") { var v = expr(); if (peek() !== ")") throw 0; p++; return v; }
        throw 0;
      }
      try { var v = expr(); return p === out.length && isFinite(v) ? v : null; } catch (e) { return null; }
    }
    return { ev: ev, syms: syms, n: Object.keys(syms).length };
  }
  function close(a, b, scale) { var s = Math.max(Math.abs(a), Math.abs(b), scale || 0); return Math.abs(a - b) <= Math.max(0.012 * s, 1e-12); }

  /* ---------- the correct equations of this circuit ----------
     Every row is a linear form (coef over unknown names + constant k) that is zero for the true solution:
       node side: KCL at a node (currents leaving), KCL for a supernode, the voltage constraint of a source between nodes;
       mesh side: KVL around a mesh, KVL around a supermesh, the current constraint of a current source.
     Each row is made of terms (one per branch or element), and each term knows the typical slips a student makes with it,
     so a wrong equation can be matched against "the right row with one slip". Dependent sources are written through
     their controlling quantity, expressed in the same unknowns. */
  function lf(k) { return { coef: {}, k: k || 0 }; }
  function add(a, b, s) { s = s === undefined ? 1 : s; var o = { coef: Object.assign({}, a.coef), k: a.k + s * b.k }; for (var q in b.coef) o.coef[q] = (o.coef[q] || 0) + s * b.coef[q]; return o; }
  function scale(a, s) { return add(lf(), a, s); }
  function isZero(a) { if (Math.abs(a.k) > 1e-12) return false; for (var q in a.coef) if (Math.abs(a.coef[q]) > 1e-12) return false; return true; }
  function sum(terms) { var o = lf(); terms.forEach(function (x) { if (x) o = add(o, x); }); return o; }
  var T = { // wording shared by the rows
    kcl: function (n) { return ["KCL عند " + sub(n), "KCL at " + sub(n)]; },
    kcls: function (g) { return ["KCL للعقدة العظمى (" + g.map(sub).join(" و ") + ")", "KCL for the supernode (" + g.map(sub).join(", ") + ")"]; },
    vcons: function (a, b, nm) { return ["قيد المصدر " + nm + " بين " + a + " و " + b, "the constraint of source " + nm + " between " + a + " and " + b]; },
    kvl: function (m) { return ["KVL في الحلقة " + sub(m), "KVL around mesh " + sub(m)]; },
    kvls: function (g) { return ["KVL للحلقة العظمى (" + g.map(sub).join(" و ") + ")", "KVL around the supermesh (" + g.map(sub).join(", ") + ")"]; },
    icons: function (nm, dep) { return dep ? ["قيد المصدر التابع", "the dependent source’s constraint"] : ["قيد مصدر التيار " + nm, "the constraint of current source " + nm]; }
  };
  function buildRows(K) {
    var c = K.c, nodes = K.nodes, ess = {}, out = { node: [], mesh: [], notes: {} }, byName = {};
    c.edges.forEach(function (e) { if (e.name) byName[e.name] = e; });
    K.labels.forEach(function (nl) { ess[nl.id] = nl.name; });
    ess[-1] = "gnd";
    var V = function (n) { return ess[n] && ess[n] !== "gnd" ? ess[n] : null; };
    var at = function (n, en) { return V(n) ? sub(V(n)) : en ? "ground" : "الأرضي"; };
    var nm = function (e, en) { return e.name === "D" ? (en ? "the dependent source" : "المصدر التابع") : e.name; };
    /* the controlling quantity of the dependent source, in node voltages and in mesh currents */
    var D = c.edges.filter(function (e) { return /^(VC|CC)(VS|CS)$/.test(e.type); })[0], ce = D && byName[D.ctrl];
    var vcNode = null, vcMesh = null;
    function nodeLf(n) { // a node's voltage in the unknowns: a labelled node, ground, or reached from one through voltage sources
      var seenN = {}, q = [[n, lf()]];
      while (q.length) {
        var it = q.shift(), m = it[0]; if (seenN[m]) continue; seenN[m] = 1;
        if (ess[m] !== undefined) { var o = lf(it[1].k); if (V(m)) o.coef[V(m)] = 1; return o; } // v(n) = v(m) + offset
        c.edges.forEach(function (e) {
          if (e.type !== "V") return;
          var a2 = nodes.of(e.a), b2 = nodes.of(e.b), vab = e.plus === "a" ? e.value : -e.value; // v(a) − v(b)
          if (a2 === m) q.push([b2, lf(it[1].k + vab)]); else if (b2 === m) q.push([a2, lf(it[1].k - vab)]);
        });
      }
      return null;
    }
    if (ce) {
      var la = nodeLf(nodes.of(ce.a)), lb = nodeLf(nodes.of(ce.b));
      if (la && lb) vcNode = add(la, lb, -1);
      var ef = (K.meshes.edgeFaces || []).filter(function (x) { return x.e === ce; })[0];
      if (ef) { vcMesh = lf(); if (ef.p) vcMesh.coef[ef.p] = ce.value; if (ef.m) vcMesh.coef[ef.m] = (vcMesh.coef[ef.m] || 0) - ce.value; }
    }
    out.ctrl = { node: vcNode, mesh: vcMesh, R: ce ? ce.value : 1, on: ce ? ce.name : "", isI: D ? /^CC/.test(D.type) : false, name: D ? (/^CC/.test(D.type) ? "iₓ" : "vₓ") : "" };
    function depGain(e) { return /^VC/.test(e.type) ? e.value : e.value / ce.value; } // per volt of v_ctrl
    /* ----- node side: branches between labelled nodes ----- */
    var els = c.edges.filter(function (e) { return e.type !== "W" && e.type !== "T"; }), inc = {};
    els.forEach(function (e, i) { [nodes.of(e.a), nodes.of(e.b)].forEach(function (n) { (inc[n] = inc[n] || []).push(i); }); });
    var seen = {}, chains = [];
    function walk(from, idx) {
      var path = [], cur = from, i = idx;
      for (var g = 0; g < 60; g++) {
        var e = els[i], na = nodes.of(e.a), nb = nodes.of(e.b), next = na === cur ? nb : na;
        path.push({ i: i, u: cur, w: next }); seen[i] = 1;
        if (ess[next] !== undefined) return { path: path, end: next };
        var nx = (inc[next] || []).filter(function (j) { return j !== i; });
        if (nx.length !== 1) return { path: path, end: next, open: true };
        cur = next; i = nx[0];
      }
      return { path: path, end: cur, open: true };
    }
    els.forEach(function (e0, i0) {
      if (seen[i0]) return;
      var na0 = nodes.of(e0.a), left;
      if (ess[na0] !== undefined) left = { path: [], end: na0 };
      else { var nx = (inc[na0] || []).filter(function (j) { return j !== i0; }); left = nx.length === 1 ? walk(na0, nx[0]) : { open: true }; }
      var right = walk(na0, i0);
      if (left.open || right.open) return;
      var path = left.path.slice().reverse().map(function (x) { return { i: x.i, u: x.w, w: x.u }; }).concat(right.path), A = left.end, B = right.end;
      if (A === B) return;
      var ch = { A: A, B: B, R: 0, E: lf(), I: null, ok: true, els: [], rs: [] };
      path.forEach(function (x) {
        var e = els[x.i], fwd = nodes.of(e.a) === x.u; ch.els.push(e);
        if (e.type === "R") { ch.R += e.value; ch.rs.push(e); }
        else if (e.type === "V") ch.E.k += (e.plus === "a") === fwd ? e.value : -e.value;
        else if (e.type === "I") { var iab = e.dir === "ab" ? e.value : -e.value; ch.I = lf(fwd ? iab : -iab); }
        else if (e.type === "VCCS" || e.type === "CCCS") { if (!vcNode) { ch.ok = false; return; } var g = depGain(e) * (e.dir === "ab" ? 1 : -1); ch.I = scale(vcNode, fwd ? g : -g); }
        else { if (!vcNode) { ch.ok = false; return; } var k = depGain(e) * ((e.plus === "a") === fwd ? 1 : -1); ch.E = add(ch.E, vcNode, k); }
      });
      ch.name = ch.els.map(function (e) { return nm(e); }).join(" + "); ch.nameEn = ch.els.map(function (e) { return nm(e, true); }).join(" + ");
      chains.push(ch);
    });
    function cur(ch, from, R, E) { // current leaving `from` along the branch
      var s = from === ch.A ? 1 : -1, to = from === ch.A ? ch.B : ch.A;
      if (ch.I) return scale(ch.I, s);
      var r = R || ch.R, o = lf(); if (V(from)) o.coef[V(from)] = 1 / r; if (V(to)) o.coef[V(to)] = (o.coef[V(to)] || 0) - 1 / r;
      return add(o, E || ch.E, -s / r);
    }
    function branch(ch, from) {
      var d = ["تيار الفرع " + ch.name + " بين " + at(ch.A) + " و " + at(ch.B), "the current in the branch " + ch.nameEn + " between " + at(ch.A, true) + " and " + at(ch.B, true)];
      var slips = [];
      if (!ch.I && !isZero(ch.E)) slips.push({ t: cur(ch, from, null, scale(ch.E, -1)), ar: "إشارة جهد المصدر في الفرع " + ch.name + " معكوسة. انتبه أي طرف من المصدر هو +.", en: "the source voltage in the branch " + ch.nameEn + " has the wrong sign. Check which end of the source is +." });
      if (!ch.I && ch.rs.length === 1) c.edges.forEach(function (re) {
        if (re.type !== "R" || re === ch.rs[0] || re.value === ch.rs[0].value) return;
        slips.push({ t: cur(ch, from, re.value), ar: "قسمت تيار الفرع " + ch.name + " على " + re.name + " بدل " + ch.rs[0].name + ".", en: "you divided the current in the branch " + ch.nameEn + " by " + re.name + " instead of " + ch.rs[0].name + "." });
      });
      if (!ch.I && ch.rs.length > 1) slips.push({ t: cur(ch, from, ch.rs[0].value), ar: "مقاومة الفرع " + ch.name + " هي مجموع مقاوماته المتتالية، لا " + ch.rs[0].name + " وحدها.", en: "the resistance of the branch " + ch.nameEn + " is the sum of its series resistors, not " + ch.rs[0].name + " alone." });
      return { ar: d[0], en: d[1], t: cur(ch, from), slips: slips };
    }
    var vOnly = chains.filter(function (ch) { return ch.ok && !ch.I && ch.R === 0; });
    // supernodes: labelled nodes joined by a branch of voltage sources only
    var grp = {}; function gf(n) { while (grp[n] !== undefined && grp[n] !== n) n = grp[n]; return n; }
    K.labels.forEach(function (nl) { grp[nl.id] = nl.id; }); grp[-1] = -1;
    vOnly.forEach(function (ch) { var a = gf(ch.A), b = gf(ch.B); if (a !== b) { if (a === -1) grp[b] = a; else grp[a] = b; } });
    var groups = {};
    K.labels.forEach(function (nl) { var g = gf(nl.id); (groups[g] = groups[g] || []).push(nl.id); });
    Object.keys(groups).forEach(function (g) {
      var mem = groups[g], set = {}; mem.forEach(function (n) { set[n] = 1; });
      var withGround = +g === -1, names = mem.map(V);
      if (withGround) { out.notes.known = (out.notes.known || []).concat(names); return; } // these voltages are set by sources from ground
      var terms = [], bad = false;
      chains.forEach(function (ch) {
        var inA = set[ch.A], inB = set[ch.B];
        if (!!inA === !!inB) return; // inside the group, or not touching it
        if (!ch.ok) { bad = true; return; }
        terms.push(branch(ch, inA ? ch.A : ch.B));
      });
      if (bad || !terms.length) return;
      var lab = mem.length > 1 ? T.kcls(names) : T.kcl(names[0]);
      out.node.push({ id: "n:" + names.join("+"), kind: mem.length > 1 ? "kcls" : "kcl", ar: lab[0], en: lab[1], terms: terms, covers: names, flipHint: ["كل التيارات الخارجة من العقدة بنفس الإشارة.", "all currents leaving the node take the same sign."] });
      if (mem.length > 1) out.notes.super = (out.notes.super || []).concat([names]);
    });
    vOnly.forEach(function (ch) { // vA − vB − E = 0
      var o = lf(); if (V(ch.A)) o.coef[V(ch.A)] = 1; if (V(ch.B)) o.coef[V(ch.B)] = (o.coef[V(ch.B)] || 0) - 1;
      var lab = T.vcons(at(ch.A), at(ch.B), ch.name), labEn = T.vcons(at(ch.A, true), at(ch.B, true), ch.nameEn);
      out.node.push({ id: "c:" + ch.name, kind: "vcons", ar: lab[0], en: labEn[1], whole: add(o, ch.E, -1),
        wholeSlips: [{ t: add(o, ch.E, 1), ar: "في " + lab[0] + " الإشارة معكوسة: فرق الجهد = جهد الطرف + ناقص جهد الطرف −.", en: "in " + labEn[1] + " the sign is reversed: the voltage difference is the + end minus the − end." }] });
    });
    /* ----- mesh side ----- */
    if (K.meshes.length && K.meshes.edgeFaces) {
      var terms = {}, mg = {}, bad = {}, icons = [];
      K.meshes.forEach(function (m) { terms[m.name] = []; mg[m.name] = m.name; });
      function mf(m) { while (mg[m] !== m) m = mg[m]; return m; }
      K.meshes.edgeFaces.forEach(function (x) {
        var e = x.e; if (e.type === "W" || e.type === "T") return;
        if (e.type === "I" || e.type === "CCCS" || e.type === "VCCS") {
          var iab = e.type === "I" ? lf(e.dir === "ab" ? e.value : -e.value) : (vcMesh ? scale(vcMesh, depGain(e) * (e.dir === "ab" ? 1 : -1)) : null);
          if (!iab) { if (x.p) bad[x.p] = 1; if (x.m) bad[x.m] = 1; return; }
          var o = lf(); if (x.p) o.coef[x.p] = 1; if (x.m) o.coef[x.m] = (o.coef[x.m] || 0) - 1; // I(p) − I(m) = i_ab
          var lab = T.icons(nm(e), e.name === "D"), labEn = T.icons(nm(e, true), e.name === "D");
          icons.push({ id: "c:" + e.name, kind: "icons", ar: lab[0], en: labEn[1], whole: add(o, iab, -1),
            wholeSlips: [{ t: add(o, iab, 1), ar: "في " + lab[0] + " الإشارة معكوسة: قارن اتجاه سهم المصدر باتجاه تيار كل حلقة.", en: "in " + labEn[1] + " the sign is reversed: compare the source arrow with each mesh current’s direction." }] });
          if (x.p && x.m) { var a = mf(x.p), b = mf(x.m); if (a !== b) mg[a] = b; }
          else out.notes.knownMesh = (out.notes.knownMesh || []).concat([x.p || x.m]);
          return;
        }
        [["p", 1], ["m", -1]].forEach(function (side) {
          var F = x[side[0]]; if (!F || !terms[F]) return;
          var s = side[1], other = side[0] === "p" ? x.m : x.p, o = lf(), d, slips = [];
          if (e.type === "R") {
            if (x.p) o.coef[x.p] = s * e.value; if (x.m) o.coef[x.m] = (o.coef[x.m] || 0) - s * e.value;
            d = ["هبوط الجهد على " + e.name, "the voltage drop across " + e.name];
            if (other) { var own = lf(); own.coef[F] = o.coef[F]; slips.push({ t: own, ar: e.name + " مشتركة مع الحلقة " + sub(other) + "، فتيارها " + sub(F) + " − " + sub(other) + " وليس " + sub(F) + " وحده.", en: e.name + " is shared with mesh " + sub(other) + ", so its current is " + sub(F) + " − " + sub(other) + ", not " + sub(F) + " alone." }); }
          } else if (e.type === "V") { o.k = s * (e.plus === "a" ? e.value : -e.value); d = ["جهد المصدر " + e.name, "the source voltage " + e.name]; }
          else { if (!vcMesh) { bad[F] = 1; return; } o = scale(vcMesh, s * depGain(e) * (e.plus === "a" ? 1 : -1)); d = ["جهد المصدر التابع", "the dependent source’s voltage"]; }
          terms[F].push({ ar: d[0], en: d[1], t: o, slips: slips });
        });
      });
      var mgroups = {};
      K.meshes.forEach(function (m) { var g = mf(m.name); (mgroups[g] = mgroups[g] || []).push(m.name); });
      Object.keys(mgroups).forEach(function (g) {
        var mem = mgroups[g];
        if (mem.some(function (m) { return bad[m] || (out.notes.knownMesh || []).indexOf(m) > -1; })) return;
        var all = []; mem.forEach(function (m) { all = all.concat(terms[m]); });
        // a branch shared inside the supermesh cancels out; drop pairs that add to zero
        var lab = mem.length > 1 ? T.kvls(mem) : T.kvl(mem[0]);
        out.mesh.push({ id: "m:" + mem.join("+"), kind: mem.length > 1 ? "kvls" : "kvl", ar: lab[0], en: lab[1], terms: all.filter(function (x) { return !isZero(x.t); }), covers: mem, flipHint: ["امشِ مع اتجاه الحلقة وطبّق الإشارة عند كل عنصر.", "walk with the mesh direction and apply the sign at each element."] });
        if (mem.length > 1) out.notes.superMesh = (out.notes.superMesh || []).concat([mem]);
      });
      out.mesh = out.mesh.concat(icons);
    }
    return out;
  }
  function rowForm(r) { return r.whole || sum(r.terms.map(function (x) { return x.t; })); }
  var W = 1; // typical size of the unknowns, so coefficients and constants weigh alike when forms are compared
  function vecMatch(s, r) { // s ≈ λ r ?
    var keys = {}; Object.keys(s.coef).concat(Object.keys(r.coef)).forEach(function (q) { keys[q] = 1; });
    keys = Object.keys(keys);
    var sv = keys.map(function (q) { return (s.coef[q] || 0) * W; }).concat([s.k]), rv = keys.map(function (q) { return (r.coef[q] || 0) * W; }).concat([r.k]);
    var rr = rv.reduce(function (a, x) { return a + x * x; }, 0), ss = sv.reduce(function (a, x) { return a + x * x; }, 0);
    if (rr < 1e-20 || ss < 1e-20) return false;
    var lam = sv.reduce(function (a, x, i) { return a + x * rv[i]; }, 0) / rr;
    if (Math.abs(lam) < 1e-12) return false;
    var err = sv.reduce(function (a, x, i) { var d = x - lam * rv[i]; return a + d * d; }, 0);
    return err <= 1e-4 * ss ? { lam: lam } : false;
  }
  /* the student's equation as a linear form in the given variables (null if it is not linear in them) */
  function linear(f, keys) {
    var z = {}; keys.forEach(function (k) { z[k] = 0; });
    var f0 = f(z); if (f0 === null) return null;
    var o = { coef: {}, k: f0 };
    for (var j = 0; j < keys.length; j++) {
      var e1 = Object.assign({}, z), e2 = Object.assign({}, z); e1[keys[j]] = 1; e2[keys[j]] = 3.7;
      var a = f(e1), b = f(e2); if (a === null || b === null) return null;
      var cj = a - f0; if (Math.abs((b - f0) - 3.7 * cj) > 1e-6 * (1 + Math.abs(b - f0))) return null;
      o.coef[keys[j]] = cj;
    }
    var mix = Object.assign({}, z); keys.forEach(function (k, i) { mix[k] = 1 + i * 0.7; });
    var pred = f0 + keys.reduce(function (s, k) { return s + o.coef[k] * mix[k]; }, 0), act = f(mix);
    if (act === null || Math.abs(pred - act) > 1e-6 * (1 + Math.abs(act))) return null;
    return o;
  }

  /* ---------- the check ---------- */
  function check(text, ctx) {
    var K = context(ctx), RW = buildRows(K), mine = {}, lines = [], usedRows = {};
    W = Math.max(1, Math.max.apply(null, Object.keys(K.S).map(function (k) { var o = K.S[k]; return o.kind === "node" || o.kind === "mesh" ? Math.abs(o.val) : 0; }).concat([0])));
    var nodeVars = K.labels.map(function (n) { return n.name; }), meshVars = K.meshes.map(function (m) { return m.name; });
    function trueEnv(sym) { return sym.val; }
    function mineEnv(sym) { return mine[sym.key] !== undefined ? mine[sym.key].v : sym.val; }
    String(text || "").split(/\n|⇒|=>/).forEach(function (raw, idx) {
      var line = raw.trim(); if (!line) return;
      var body = line.replace(/^[^=]*?[:：]\s*(?=.*=)/, ""); // "KCL عند العقدة 1:" labels
      if (!/=|≈/.test(body)) return;
      var segs = body.split(/=|≈/), P = segs.map(function (sg) { return parse(sg, K); }), res = { n: idx + 1, text: line };
      var unk = P.filter(function (p) { return p.unknown; })[0];
      if (unk) {
        var have = nodeVars.concat(meshVars).map(sub).join(" و "), haveEn = nodeVars.concat(meshVars).map(sub).join(", ");
        res.status = "skip";
        res.msg = "لا أعرف الرمز «" + unk.unknown + "» في هذه الدائرة." + (have ? " المجاهيل في الرسم: " + have + "." : "") + " وللعناصر: R2 و Vs و i_R2 و v_R2 و p_R2 (بأسماء الرسم).";
        res.en = "I don’t know the symbol “" + unk.unknown + "” in this circuit." + (haveEn ? " The unknowns on the drawing are " + haveEn + "." : "") + " For elements: R2, Vs, i_R2, v_R2, p_R2 (with the drawing’s names).";
        lines.push(res); return;
      }
      if (P.some(function (p) { return p.bad || !p.ev; })) { res.status = "skip"; res.msg = "لم أفهم صيغة هذا السطر."; res.en = "I couldn’t read this line."; lines.push(res); return; }
      var hasSym = P.some(function (p) { return p.n; });
      // a value for one variable:  v1 = 8 V
      if (P.length >= 2 && P[0].n === 1 && P.slice(1).every(function (p) { return !p.n; })) {
        var sym = P[0].syms[Object.keys(P[0].syms)[0]], lhsIsSym = /^\s*[-+]?\s*[A-Za-z_][\w()]*\s*$/.test(normalize(segs[0]));
        if (lhsIsSym) {
          var val = P[P.length - 1].ev(trueEnv), neg = /^\s*-/.test(normalize(segs[0])) ? -1 : 1, t = sym.val * neg;
          // arithmetic inside the numeric parts first
          for (var j = 1; j + 1 < P.length; j++) { var a1 = P[j].ev(trueEnv), a2 = P[j + 1].ev(trueEnv); if (!close(a1, a2)) { res.status = "err"; res.kind = "arith"; res.msg = "خطأ حسابي: " + segs[j].trim() + " يساوي " + fmt(a1) + " وليس " + fmt(a2) + "."; res.en = "Arithmetic slip: " + segs[j].trim() + " is " + fmt(a1) + ", not " + fmt(a2) + "."; lines.push(res); mine[sym.key] = { v: val * neg, n: res.n }; return; } }
          mine[sym.key] = { v: val * neg, n: res.n };
          if (close(val, t)) { res.status = "ok"; res.kind = "value"; res.msg = "قيمة " + sub(sym.name) + " صحيحة لهذه الدائرة ✓"; res.en = "The value of " + sub(sym.name) + " is right for this circuit ✓"; }
          else {
            res.status = "err"; res.kind = "value";
            if (close(val, -t)) { res.msg = "قيمة " + sub(sym.name) + " صحيحة لكن إشارتها معكوسة. راجع اتجاه المرجع أو القطبية في الرسم."; res.en = "The value of " + sub(sym.name) + " has the right size but the wrong sign. Check the drawn reference direction or polarity."; }
            else if (close(val, t * 1000) || close(val, t / 1000)) { res.msg = "رقم " + sub(sym.name) + " صحيح لكن البادئة خطأ (فرق ×1000)."; res.en = "The number for " + sub(sym.name) + " is right but the prefix is wrong (off by ×1000)."; }
            else {
              var other = Object.keys(K.S).map(function (k) { return K.S[k]; }).filter(function (o) { return o.key !== sym.key && o.kind === sym.kind && close(val, o.val); })[0];
              res.msg = "قيمة " + sub(sym.name) + " لا تطابق الدائرة." + (other ? " هذه قيمة " + sub(other.name) + "، فربما خلطت بينهما." : " راجع المعادلات التي أوصلتك لها.");
              res.en = "The value of " + sub(sym.name) + " doesn’t match the circuit." + (other ? " That is the value of " + sub(other.name) + "; you may have mixed them up." : " Check the equations that led to it.");
            }
          }
          lines.push(res); return;
        }
      }
      if (!hasSym) { // plain arithmetic
        for (var q = 0; q + 1 < P.length; q++) { var x1 = P[q].ev(trueEnv), x2 = P[q + 1].ev(trueEnv); if (x1 === null || x2 === null) continue; if (!close(x1, x2)) { res.status = "err"; res.kind = "arith"; res.msg = "خطأ حسابي: " + segs[q].trim() + " يساوي " + fmt(x1) + " وليس " + fmt(x2) + "."; res.en = "Arithmetic slip: " + segs[q].trim() + " is " + fmt(x1) + ", not " + fmt(x2) + "."; lines.push(res); return; } }
        res.status = "ok"; res.kind = "arith"; res.msg = "الحساب صحيح ✓"; res.en = "The arithmetic is right ✓"; lines.push(res); return;
      }
      // an equation with symbols: does it hold for this circuit?
      for (var k = 0; k + 1 < P.length; k++) {
        var L = P[k], R = P[k + 1], lv = L.ev(trueEnv), rv = R.ev(trueEnv);
        if (lv === null || rv === null) { res.status = "skip"; res.msg = "لم أستطع حساب هذا السطر (قسمة على صفر؟)."; res.en = "I couldn’t evaluate this line (division by zero?)."; lines.push(res); return; }
        var scale = Math.max.apply(null, Object.keys(L.syms).concat(Object.keys(R.syms)).map(function (kk) { var sy = L.syms[kk] || R.syms[kk]; return Math.abs(sy.val); }).concat([Math.abs(lv), Math.abs(rv)])) * 0.05;
        if (close(lv, rv, scale)) continue;
        res.status = "err";
        // right with the student's own earlier values → the error comes from an earlier line
        var lm = L.ev(mineEnv), rm = R.ev(mineEnv), from = Object.keys(L.syms).concat(Object.keys(R.syms)).map(function (kk) { return mine[kk]; }).filter(function (x) { return x; });
        if (from.length && lm !== null && rm !== null && close(lm, rm, scale)) {
          var ln = from.map(function (x) { return x.n; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
          res.kind = "carried"; res.status = "warn";
          res.msg = "هذه الخطوة صحيحة بالقيم التي كتبتها، لكن قيمة سابقة فيها خطأ (السطر " + ln.join("، ") + ")، فانتقل الخطأ إلى هنا.";
          res.en = "This step is right with the values you wrote, but an earlier value is wrong (line " + ln.join(", ") + "), so the error carried into it.";
          lines.push(res); return;
        }
        if ((!L.n || !R.n) && P.length > 2) {
          // one side is plain numbers: a substitution step
          res.kind = "sub"; res.msg = "التعويض لا يطابق: الطرف الذي فيه الرموز لا يساوي الأرقام التي كتبتها بالقيم الحقيقية للدائرة. راجع القيم التي عوّضتها."; res.en = "The substitution doesn’t match: the side with symbols doesn’t equal the numbers you wrote, with this circuit’s real values. Check the values you put in.";
          lines.push(res); return;
        }
        diagnose(res, L, R);
        lines.push(res); return;
      }
      res.status = "ok";
      var kind = identify(P[0], P[P.length - 1]);
      res.kind = kind ? kind.kind : "eq";
      res.msg = "المعادلة صحيحة لهذه الدائرة ✓" + (kind ? " (" + kind.ar + ")" : ""); res.en = "The equation holds for this circuit ✓" + (kind ? " (" + kind.en + ")" : "");
      if (kind && kind.row) usedRows[kind.row] = 1;
      lines.push(res);
    });
    function formOf(L, R, mode) { // the equation L − R as a linear form in this mode's unknowns (the controlling quantity written out)
      var all = Object.assign({}, L.syms, R.syms), keys = [], usesCtrl = false;
      for (var k in all) {
        var sy = all[k];
        if (sy.kind === "value") continue;
        if (sy.kind === mode) keys.push(k);
        else if (sy.kind === "ctrl") { keys.push(k); usesCtrl = true; }
        else return null;
      }
      if (!keys.some(function (k) { return all[k].kind === mode; }) && !usesCtrl) return null;
      var f = function (env) { var e = function (sym) { return env[sym.key] !== undefined ? env[sym.key] : sym.val; }; var a = L.ev(e), b = R.ev(e); return a === null || b === null ? null : a - b; };
      var raw = linear(f, keys); if (!raw) return null;
      var o = lf(raw.k);
      for (var q in raw.coef) {
        var s2 = all[q], c2 = raw.coef[q];
        if (s2.kind === mode) o.coef[s2.name] = (o.coef[s2.name] || 0) + c2;
        else { var ex = RW.ctrl[mode]; if (!ex) return null; o = add(o, ex, q === "x:i" ? c2 / RW.ctrl.R : c2); }
      }
      return { form: o, raw: raw, usesCtrl: usesCtrl };
    }
    function small(f) { var m = Math.abs(f.raw.k); for (var q in f.raw.coef) m = Math.max(m, Math.abs(f.raw.coef[q]) * W); return Math.abs(f.form.k) <= 1e-6 * (1 + m) && Object.keys(f.form.coef).every(function (q) { return Math.abs(f.form.coef[q]) * W <= 1e-6 * (1 + m); }); }
    function identify(L, R) {
      var modes = ["node", "mesh"];
      for (var i = 0; i < modes.length; i++) {
        var f = formOf(L, R, modes[i]); if (!f) continue;
        if (f.usesCtrl && small(f)) return { kind: "ctrl", ar: "قيد الكمية المتحكِّمة", en: "the controlling quantity’s constraint" };
        var rows = RW[modes[i]];
        for (var j = 0; j < rows.length; j++) if (vecMatch(f.form, rowForm(rows[j]))) return { kind: rows[j].kind, row: rows[j].id, ar: rows[j].ar, en: rows[j].en };
        return { kind: "eq", ar: "تجمع أكثر من قانون أو فيها قيد", en: "it combines laws or a constraint" };
      }
      return null;
    }
    function diagnose(res, L, R) {
      res.kind = "law";
      var modes = ["node", "mesh"];
      for (var i = 0; i < modes.length; i++) {
        var mode = modes[i], f = formOf(L, R, mode); if (!f) continue;
        var cands = [], s = f.form;
        if (f.usesCtrl && RW.ctrl[mode] && vecMatch(s, RW.ctrl[mode])) { // ix = −(…) : the constraint written against the drawn arrow
          res.msg = "قيد الكمية المتحكِّمة إشارته معكوسة: " + (RW.ctrl.name || "الكمية المتحكِّمة") + " تؤخذ باتجاه السهم (أو القطبية) المرسوم على " + RW.ctrl.on + "، أي (جهد بداية السهم − جهد نهايته)" + (RW.ctrl.isI ? " ÷ " + RW.ctrl.on : "") + ".";
          res.en = "The controlling quantity’s constraint has the wrong sign: " + (RW.ctrl.name || "it") + " follows the arrow (or polarity) drawn on " + RW.ctrl.on + ", i.e. (voltage at the arrow’s start − at its end)" + (RW.ctrl.isI ? " ÷ " + RW.ctrl.on : "") + ".";
          return;
        }
        var addC = function (m, ar, en) { if (m) cands.push({ ar: ar, en: en, d: Math.abs(Math.log(Math.abs(m.lam))) + (m.lam < 0 ? 0.01 : 0) }); };
        RW[mode].forEach(function (r) {
          if (r.whole) { r.wholeSlips.forEach(function (sl) { addC(vecMatch(s, sl.t), sl.ar[0].toUpperCase() === sl.ar[0] ? sl.ar : sl.ar, sl.en); }); return; }
          var ts = r.terms.map(function (x) { return x.t; });
          r.terms.forEach(function (x, j) {
            var others = sum(ts.filter(function (_, q) { return q !== j; }));
            if (r.terms.length > 1) addC(vecMatch(s, others), "معادلة " + r.ar + " ناقصة: نسيت " + x.ar + ".", "Your " + r.en + " is missing " + x.en + ".");
            addC(vecMatch(s, add(others, x.t, -1)), "في " + r.ar + " إشارة " + x.ar + " معكوسة: " + r.flipHint[0], "In " + r.en + " " + x.en + " has the wrong sign: " + r.flipHint[1]);
            x.slips.forEach(function (sl) { addC(vecMatch(s, add(others, sl.t)), "في " + r.ar + ": " + sl.ar, "In " + r.en + ": " + sl.en); });
          });
        });
        cands.sort(function (a, b) { return a.d - b.d; });
        if (cands.length) { res.msg = cands[0].ar; res.en = cands[0].en; return; }
        var N = RW.notes, hintAr = "", hintEn = "";
        if (mode === "node") {
          if (N.super) { hintAr = " تنبيه: " + N.super.map(function (g) { return g.map(sub).join(" و "); }).join("، ") + " بينها مصدر جهد، وتياره مجهول؛ فاكتب KCL للعقدة العظمى (كل الفروع الخارجة منها معًا) ومعادلة قيد المصدر."; hintEn = " Note: " + N.super.map(function (g) { return g.map(sub).join(", "); }).join("; ") + " are joined by a voltage source whose current is unknown; write KCL for the supernode (all branches leaving it together) and the source’s constraint."; }
          else if (N.known) { hintAr = " تنبيه: جهد " + N.known.map(sub).join(" و ") + " يحدده مصدر جهد من الأرضي مباشرة، فلا تكتب له KCL."; hintEn = " Note: the voltage of " + N.known.map(sub).join(", ") + " is set by a voltage source from ground, so it needs no KCL."; }
          else { hintAr = " اكتب لكل فرع تياره الخارج من العقدة: (جهد العقدة − جهد الطرف الآخر − جهد المصادر) ÷ المقاومة."; hintEn = " For each branch write the current leaving the node: (node voltage − other end − source voltages) ÷ resistance."; }
          res.msg = "المعادلة لا تتحقق في هذه الدائرة: ليست KCL صحيحة عند أي عقدة ولا قيدًا صحيحًا." + hintAr; res.en = "The equation doesn’t hold in this circuit: it isn’t a correct KCL at any node, nor a correct constraint." + hintEn; return;
        }
        if (N.superMesh) { hintAr = " تنبيه: الحلقات " + N.superMesh.map(function (g) { return g.map(sub).join(" و "); }).join("، ") + " بينها مصدر تيار، فاكتب KVL للحلقة العظمى (حولها كلها) ومعادلة قيد المصدر."; hintEn = " Note: meshes " + N.superMesh.map(function (g) { return g.map(sub).join(", "); }).join("; ") + " share a current source, so write KVL around the supermesh (around all of them) and the source’s constraint."; }
        else if (N.knownMesh) { hintAr = " تنبيه: تيار الحلقة " + N.knownMesh.map(sub).join(" و ") + " يحدده مصدر تيار على حافتها، فلا تكتب لها KVL."; hintEn = " Note: the current of mesh " + N.knownMesh.map(sub).join(", ") + " is set by a current source on its edge, so it needs no KVL."; }
        res.msg = "المعادلة لا تتحقق في هذه الدائرة: ليست KVL صحيحة لأي حلقة ولا قيدًا صحيحًا." + hintAr; res.en = "The equation doesn’t hold in this circuit: it isn’t a correct KVL for any mesh, nor a correct constraint." + hintEn; return;
      }
      res.msg = "المعادلة لا تتحقق بالقيم الحقيقية لهذه الدائرة. راجع القانون الذي استخدمته والإشارات."; res.en = "The equation doesn’t hold with this circuit’s real values. Check the law you used and the signs.";
    }
    /* the method as a whole: is a set of equations missing? */
    var summary = { ok: lines.filter(function (l) { return l.status === "ok"; }).length, err: lines.filter(function (l) { return l.status === "err"; }).length, notes: [] };
    var hasVal = function (pfx) { return Object.keys(mine).some(function (k) { return k.indexOf(pfx) === 0; }); };
    [["node", "n:", "طريقة جهود العقد تحتاج ", "The node-voltage method needs "], ["mesh", "m:", "طريقة تيارات الحلقات تحتاج ", "The mesh-current method needs "]].forEach(function (m) {
      var rows = RW[m[0]], used = rows.filter(function (r) { return usedRows[r.id]; });
      if (!used.length || used.length >= rows.length || hasVal(m[1])) return;
      var miss = rows.filter(function (r) { return !usedRows[r.id]; });
      summary.notes.push({ t: m[2] + rows.length + " معادلات مستقلة في هذه الدائرة. ينقصك: " + miss.map(function (r) { return r.ar; }).join("، ") + ".", en: m[3] + rows.length + " independent equations in this circuit. Still missing: " + miss.map(function (r) { return r.en; }).join("; ") + "." });
    });
    return { lines: lines, summary: summary };
  }
  CV.stepcheck = { check: check, context: context, _rows: function (ctx) { var K = context(ctx); return { K: K, RW: buildRows(K) }; } };
})(typeof window !== "undefined" ? window : globalThis);
