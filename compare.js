/* CircuitVision — compare the student's board with the circuit a project asks for.
   Both boards are reduced to their circuit: each part (and each supply or generator channel in use) becomes an
   element between two nets; meters, probes and jumper wires are left out. The two circuits are then matched:
   parts of the same kind are paired (same value first) and the nets of the two circuits are mapped one to one,
   searching for the pairing that puts the most parts in the right place. What is left over is reported as
   missing, extra, wrong value, reversed, or connected between the wrong points.
   compare(goal, bench, names) → { ok, items: [{ sev, t, en, parts }] } */
(function (root) {
  "use strict";
  var CV = root.CV;
  var POLAR = { BAT: 1, LED: 1, PIR: 1, DEP: 1, PS: 1, FG: 1, AM: 1 };
  var KAR = { R: "مقاومة", C: "مكثف", L: "ملف", LED: "LED", LDR: "مقاومة ضوئية LDR", NTC: "ثرمستور NTC", BAT: "بطارية", SW: "مفتاح ضغط", LAMP: "لمبة", PIR: "حساس حركة", AM: "أميتر لوحة", DEP: "وحدة مصدر تابع", PS: "قناة مزود الجهد", FG: "مولد الإشارة" };
  var KEN = { R: "resistor", C: "capacitor", L: "inductor", LED: "LED", LDR: "LDR", NTC: "NTC thermistor", BAT: "battery", SW: "push button", LAMP: "lamp", PIR: "motion sensor", AM: "panel ammeter", DEP: "dependent-source module", PS: "supply channel", FG: "function generator" };
  function si(v, u) { return CV.ac && CV.ac.si ? CV.ac.si(v, u) : (+v.toPrecision(3)) + " " + u; }
  function valueOf(k, p) {
    if (k === "R") return si(p.value, "Ω"); if (k === "C") return si(p.value, "F"); if (k === "L") return si(p.value, "H");
    if (k === "BAT") return si(p.value, "V"); if (k === "LED") return p.color || "red"; if (k === "LAMP") return (p.vr || 6) + "V";
    if (k === "DEP") return (p.dk || "") + " " + (p.gain || ""); return "";
  }
  function elements(b) {
    var B = CV.bench, u = B.connectivity(b, false), net = function (l) { return u.find(B.strip(l)); }, out = [];
    b.parts.forEach(function (p) {
      if (p.k === "W" || !p.legs[0] || !p.legs[1]) return;
      if (B.parse(p.legs[0]).kind === "jack" || B.parse(p.legs[1]).kind === "jack") return;
      out.push({ id: p.id, k: p.k, val: valueOf(p.k, p), n: [net(p.legs[0]), net(p.legs[1])], p: p });
    });
    var plugged = {}; b.parts.forEach(function (p) { p.legs.forEach(function (l) { if (l && B.parse(l).kind === "jack") plugged[l] = net(l); }); });
    b.inst.ps.forEach(function (ch, i) {
      var a = plugged["PS" + (i + 1) + "+"], c = plugged["PS" + (i + 1) + "-"];
      if (a !== undefined && c !== undefined) out.push({ id: "ps" + (i + 1), k: "PS", ch: i + 1, on: ch.on, isrc: !!ch.isrc, set: ch.isrc ? ch.ilim : ch.v, val: "", n: [a, c] });
    });
    b.inst.fg.forEach(function (ch, i) {
      var a = plugged["FG" + (i + 1)], c = plugged["FG" + (i + 1) + "g"];
      if (a !== undefined && c !== undefined) out.push({ id: "fg" + (i + 1), k: "FG", ch: i + 1, on: ch.on, set: ch, val: "", n: [a, c] });
    });
    return out;
  }
  function compare(goal, bench, names) {
    var T = elements(goal), S = elements(bench), nm = names || {};
    function sName(e) { return e.k === "PS" ? "CH" + e.ch + " لمزود الجهد" : e.k === "FG" ? "CH" + e.ch + " لمولد الإشارة" : (nm[e.id] || KAR[e.k]); }
    function sNameEn(e) { var t = nm[e.id]; return e.k === "PS" ? "supply CH" + e.ch : e.k === "FG" ? "generator CH" + e.ch : t && !/[؀-ۿ]/.test(t) ? t : "the " + KEN[e.k]; }
    function tDesc(e) { return KAR[e.k] + (e.val && e.k !== "LED" ? " " + e.val : ""); }
    function tDescEn(e) { return "a " + KEN[e.k] + (e.val && e.k !== "LED" ? " of " + e.val : ""); }
    /* search: assign each goal element a board element of the same kind (or none), map nets one to one */
    T.sort(function (a, b) { return S.filter(function (x) { return x.k === a.k; }).length - S.filter(function (x) { return x.k === b.k; }).length; });
    var best = null, steps = 0;
    function go(i, used, map, inv, asg, score) {
      if (++steps > 60000) return;
      if (i === T.length) { if (!best || score > best.score) best = { score: score, asg: asg.slice(), map: Object.assign({}, map) }; return; }
      var rest = T.length - i; if (best && score + rest * 3 <= best.score) return;
      var t = T[i], tried = false;
      S.forEach(function (s, j) {
        if (used[j] || s.k !== t.k) return;
        var ors = [[0, 1], [1, 0]];
        ors.forEach(function (o, oi) {
          var a = t.n[0], b = t.n[1], sa = s.n[o[0]], sb = s.n[o[1]], m2 = Object.assign({}, map), v2 = Object.assign({}, inv), fit = true;
          [[a, sa], [b, sb]].forEach(function (pr) {
            if (m2[pr[0]] !== undefined) { if (m2[pr[0]] !== pr[1]) fit = false; }
            else if (v2[pr[1]] !== undefined) fit = false;
            else { m2[pr[0]] = pr[1]; v2[pr[1]] = pr[0]; }
          });
          var sameVal = t.val === s.val, rev = POLAR[t.k] && oi === 1;
          var sc = fit ? 3 - (rev ? 1 : 0) - (sameVal ? 0 : 1) : (sameVal ? 0.5 : 0.25);
          used[j] = 1; tried = true;
          asg[i] = { s: s, fit: fit, rev: fit && rev, sameVal: sameVal };
          go(i + 1, used, fit ? m2 : map, fit ? v2 : inv, asg, score + sc);
          used[j] = 0;
        });
      });
      asg[i] = null; go(i + 1, used, map, inv, asg, score); // this goal part is missing from the board
    }
    go(0, {}, {}, {}, [], 0);
    var asg = best.asg, map = best.map, items = [], usedS = {};
    asg.forEach(function (a) { if (a) usedS[a.s.id] = 1; });
    function nodeDesc(tn, self, en) { // a goal net described by what else meets there, named as on the student's board where possible
      var who = [];
      T.forEach(function (t, i) {
        if (t === self) return;
        [0, 1].forEach(function (end) {
          if (t.n[end] !== tn) return;
          var a = asg[i], pol = POLAR[t.k] ? (end === 0 ? (en ? " (+)" : " (+)") : (en ? " (−)" : " (−)")) : "";
          who.push((a && a.fit ? (en ? sNameEn(a.s) : sName(a.s)) : (en ? tDescEn(t) : tDesc(t))) + pol);
        });
      });
      if (!who.length) return en ? "a free point" : "نقطة حرة";
      return (en ? "the point joining " : "النقطة التي تلتقي فيها ") + who.join(en ? ", " : "، ");
    }
    T.forEach(function (t, i) {
      var a = asg[i];
      if (!a) { items.push({ sev: "err", parts: [], t: "ينقص من دائرتك: " + tDesc(t) + "، بين " + nodeDesc(t.n[0], t, false) + " و " + nodeDesc(t.n[1], t, false) + ".", en: "Missing from your circuit: " + tDescEn(t) + ", between " + nodeDesc(t.n[0], t, true) + " and " + nodeDesc(t.n[1], t, true) + "." }); return; }
      var s = a.s;
      if (!a.sameVal && t.k !== "PS" && t.k !== "FG") items.push({ sev: "warn", parts: [s.id], t: sName(s) + " قيمتها " + s.val + " والمطلوب " + t.val + ".", en: sNameEn(s) + " is " + s.val + "; the circuit needs " + t.val + "." });
      if (!a.fit) items.push({ sev: "err", parts: s.k === "PS" || s.k === "FG" ? [] : [s.id], t: sName(s) + " ليست في مكانها: المطلوب أن تكون بين " + nodeDesc(t.n[0], t, false) + " و " + nodeDesc(t.n[1], t, false) + ".", en: sNameEn(s) + " isn’t in its place: it should go between " + nodeDesc(t.n[0], t, true) + " and " + nodeDesc(t.n[1], t, true) + "." });
      else if (a.rev) items.push({ sev: "err", parts: s.k === "PS" || s.k === "FG" ? [] : [s.id], t: "قطبية " + sName(s) + " معكوسة: بدّل طرفيها.", en: "The polarity of " + sNameEn(s) + " is reversed: swap its two ends." });
      if (t.k === "PS" && a.fit) {
        if (!s.on) items.push({ sev: "warn", parts: [], t: sName(s) + " موصولة صح لكنها مطفأة: شغّلها (ON).", en: sNameEn(s) + " is wired correctly but switched off: turn it ON." });
        if (t.isrc) { if (Math.abs(bench.inst.ps[s.ch - 1].ilim - t.set) > 1e-6 * (1 + t.set)) items.push({ sev: "warn", parts: [], t: "حد التيار في " + sName(s) + " المطلوب " + si(t.set, "A") + ".", en: "The current limit on " + sNameEn(s) + " should be " + si(t.set, "A") + "." }); }
        else if (Math.abs(s.set - t.set) > 1e-6 * (1 + Math.abs(t.set))) items.push({ sev: "warn", parts: [], t: sName(s) + " مضبوطة على " + si(s.set, "V") + " والمطلوب " + si(t.set, "V") + ".", en: sNameEn(s) + " is set to " + si(s.set, "V") + "; the circuit needs " + si(t.set, "V") + "." });
      }
      if (t.k === "FG" && a.fit) {
        var g = t.set, h = s.set;
        if (!s.on) items.push({ sev: "warn", parts: [], t: sName(s) + " موصول صح لكنه مطفأ: شغّله (ON).", en: sNameEn(s) + " is wired correctly but switched off: turn it ON." });
        if ((h.wave || "sine") !== (g.wave || "sine") || Math.abs(h.freq - g.freq) > 1e-6 * g.freq || Math.abs(h.vpp - g.vpp) > 1e-6 * (1 + g.vpp))
          items.push({ sev: "warn", parts: [], t: sName(s) + ": المطلوب إشارة " + ({ sine: "جيبية", square: "مربعة", triangle: "مثلثية" })[g.wave || "sine"] + " " + si(g.vpp, "Vpp") + " بتردد " + si(g.freq, "Hz") + ".", en: sNameEn(s) + ": the circuit needs a " + (g.wave || "sine") + " wave of " + si(g.vpp, "Vpp") + " at " + si(g.freq, "Hz") + "." });
      }
    });
    S.forEach(function (s) { if (!usedS[s.id]) items.push({ sev: "warn", parts: s.k === "PS" || s.k === "FG" ? [] : [s.id], t: sName(s) + (s.val && s.k !== "LED" ? " (" + s.val + ")" : "") + " زائدة: ليست في الدائرة المطلوبة.", en: sNameEn(s) + (s.val && s.k !== "LED" ? " (" + s.val + ")" : "") + " is extra: it isn’t in the circuit you are building." }); });
    return { ok: !items.length, items: items, total: T.length, placed: asg.filter(function (a) { return a && a.fit && !a.rev && a.sameVal; }).length };
  }
  CV.benchCompare = { compare: compare, elements: elements };
})(typeof window !== "undefined" ? window : globalThis);
