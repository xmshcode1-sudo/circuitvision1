/* CircuitVision — explainer videos for the Circuits 1 lab: the scene plan.
   Builds, from the experiment data in clab-exps.js, the list of scenes of one video: build the circuit part by part and lead by lead,
   set the instruments, then take every reading of the manual's tables with the meter connected where it really has to go
   (voltmeter across, ammeter in series). Every reading comes from the lab simulator (the same one the bench uses) and is checked
   against the page's own expected value; a mismatch stops the build.
   usage: node tools/videos/clab-plan.js exp1 > plan.json */
"use strict";
const path = require("path");
const CV = require(path.join(__dirname, "../../tests/load.js")), S = CV.clabSim, K = CV.clabCheck, X = CV.clabExps;
const clone = (x) => JSON.parse(JSON.stringify(x));
let SIGN = 1, AM = { d: "d2", j: "d2.mA", dc: "madc", ac: "maac" }, VM = { d: "d1", j: "d1.V" };
function metersFor(e) {   // PeakTech (mA input) as the ammeter and Fluke as the voltmeter, when the experiment has both
  const has = (k) => e.inst.indexOf(k) > -1;
  AM = has("d2") ? { d: "d2", j: "d2.mA", dc: "madc", ac: "maac" } : { d: "d1", j: "d1.A", dc: "adc", ac: "aac" };
  VM = has("d1") ? { d: "d1", j: "d1.V" } : { d: "d2", j: "d2.V" };
}   // the sign the manual's reference direction gives the reading
const deepSet = K.deepSet;

/* ---------- naming the places a lead can go ---------- */
const JACK = {
  "ps.m+": "طرف + للمصدر (MASTER)", "ps.m-": "طرف − للمصدر (MASTER)", "ps.s+": "طرف + للمصدر (SLAVE)", "ps.s-": "طرف − للمصدر (SLAVE)",
  "fg.out": "خرج مولّد الإشارة", "fg.com": "الطرف الأسود (الأرضي) للمولّد",
  "sc.1": "مجس CH1", "sc.1g": "المشبك الأسود لـ CH1", "sc.2": "مجس CH2", "sc.2g": "المشبك الأسود لـ CH2",
  "d1.V": "مدخل VΩ في Fluke", "d1.COM": "مدخل COM في Fluke", "d1.A": "مدخل A في Fluke",
  "d2.V": "مدخل VΩ في PeakTech", "d2.COM": "مدخل COM في PeakTech", "d2.mA": "مدخل mA في PeakTech", "d2.10A": "مدخل 10A في PeakTech",
  "rb.a": "الطرف الأحمر لصندوق المقاومات", "rb.b": "الطرف الأزرق لصندوق المقاومات",
  "lb.a": "الطرف الأحمر لصندوق الملفات", "lb.b": "الطرف الأزرق لصندوق الملفات",
  "cb.a": "الطرف الأحمر لصندوق المكثفات", "cb.b": "الطرف الأزرق لصندوق المكثفات",
  "mn.L": "مقبس L بعد عدّاد القدرة", "mn.N": "مقبس N", "lamp.a": "طرف L للمبة", "lamp.b": "طرف N للمبة"
};
const fieldOf = (p) => { const m = /^t:(\d+):(\d+)/.exec(p); return m ? m[1] + ":" + m[2] : null; };
function slotFields(id) {
  const m = /^([hv]):(\d+):(\d+)/.exec(id); if (!m) return null; const r = +m[2], c = +m[3];
  return m[1] === "h" ? [r + ":" + c, r + ":" + (c + 1)] : [r + ":" + c, (r + 1) + ":" + c];
}
function partLabel(pc) { return pc.lb || pc.name || (pc.t === "R" ? S.si(pc.v, "Ω") : pc.t === "L" ? S.si(pc.v, "H") : S.si(pc.v, "F")); }
function placeName(p, st, L) {
  if (JACK[p]) return JACK[p];
  const f = fieldOf(p); if (!f) return p;
  const named = Object.keys(L.nodes || {}).filter((k) => k !== "gnd" && fieldOf(L.nodes[k] + ":0") === f)[0];
  const touching = Object.keys(st.parts).filter((s) => st.parts[s].t !== "W" && slotFields(s).indexOf(f) > -1).map((s) => partLabel(st.parts[s]));
  if (named) return "العقدة " + named + (touching.length ? " (" + touching.join(" و ") + ")" : "");
  if (touching.length === 1) return "طرف " + touching[0];
  if (touching.length) return "العقدة بين " + touching.join(" و ");
  return "عقدة على اللوحة";
}

/* ---------- the board: free sockets and free fields ---------- */
function usedSockets(st) { const u = {}; st.leads.forEach((l) => l.forEach((p) => { if (/^t:/.test(p)) u[p] = 1; })); return u; }
function freeSocket(st, field, prefer) {
  const u = usedSockets(st), order = prefer || [0, 2, 6, 8, 1, 3, 5, 7, 4];
  for (const k of order) { const id = "t:" + field + ":" + k; if (!u[id]) return id; }
  return "t:" + field + ":4";
}
function fieldBusy(st, f) {
  if (Object.keys(st.parts).some((s) => slotFields(s).indexOf(f) > -1)) return true;
  return st.leads.some((l) => l.some((p) => fieldOf(p) === f));
}
const ROWS = 6, COLS = 9;
function neighbours(f) {
  const [r, c] = f.split(":").map(Number), out = [];
  if (c + 1 < COLS) out.push(["h:" + r + ":" + c, r + ":" + (c + 1)]);
  if (c - 1 >= 0) out.push(["h:" + r + ":" + (c - 1), r + ":" + (c - 1)]);
  if (r + 1 < ROWS) out.push(["v:" + r + ":" + c, (r + 1) + ":" + c]);
  if (r - 1 >= 0) out.push(["v:" + (r - 1) + ":" + c, (r - 1) + ":" + c]);
  return out;
}

/* ---------- the circuit without its meters (meters are added for each reading) ---------- */
const METER_JACK = /^d[12]\.(V|COM|A|mA|10A)$/;
function circuitOf(L, keepMeter) {
  const st = { parts: clone(L.parts || {}), leads: [], inst: null }, by = {};
  (L.leads || []).forEach((l) => {
    const j = l.filter((p) => METER_JACK.test(p))[0];
    if (!j || (keepMeter && j.slice(0, 2) === keepMeter)) { st.leads.push(l.slice(0, 2)); return; }
    (by[j] = by[j] || []).push(l[0] === j ? l[1] : l[0]);
  });
  ["d1", "d2"].forEach((d) => {   // an ammeter in series becomes a plain lead between its two ends
    if (keepMeter === d) return;
    const cur = by[d + ".A"] || by[d + ".mA"] || by[d + ".10A"], com = by[d + ".COM"];
    const set = (L.set || {})[d] || {};
    if (cur && com && /a/.test(set.mode || "") && !/^v/.test(set.mode || "")) st.leads.push([cur[0], com[0]]);
  });
  return st;
}

/* ---------- instrument state of one layout and one table row ---------- */
function instFor(e, L, rowSet) {
  const st = K.stateFor(L, rowSet || {}, false), inst = st.inst;
  ["d1", "d2"].forEach((d) => { inst[d].mode = "off"; });
  const term = (rowSet && rowSet.fgTerm) || (L.set && L.set.fgTerm);
  if (term) {   // same as the page: the generator is set so that its terminals show the wanted Vpp under load
    const s0 = clone(st); s0.inst.fg.vpp = 10; const sol = S.solve(s0, { only: e.inst }), a = S.mag(S.vBetween(sol, "fg.out", "fg.com").ac);
    if (a > 0) inst.fg.vpp = +(10 * (term / 2) / a).toFixed(2);
  }
  delete inst.fgTerm;
  return inst;
}

/* ---------- where a quantity lives ---------- */
function terminals(L, st, label) {
  const s = Object.keys(st.parts).filter((k) => st.parts[k].lb === label)[0];
  if (s) return { slot: s, fields: slotFields(s) };
  const box = Object.keys(L.lbl || {}).filter((k) => L.lbl[k] === label)[0];
  if (box) return { box, jacks: [box + ".a", box + ".b"] };
  return null;
}
const toPoint = (st, p, prefer) => (/^t:\d+:\d+$/.test(p) ? freeSocket(st, fieldOf(p + ":0"), prefer) : p);

function read(e, st) { return S.read(clone(st), { only: e.inst }); }
function signedVal(r) { return r.ac ? Math.abs(r.val) : r.val; }

/* voltmeter (Fluke) between two places, red lead on the higher potential */
function withVoltmeter(e, st, a, b, ac) {
  let t = clone(st); const pa = toPoint(t, a, [1, 0, 2]), pb = toPoint(t, b, [7, 6, 8]);
  t.leads.push([VM.j, pa], [VM.d + ".COM", pb]); t.inst[VM.d].mode = ac ? "vac" : "vdc";
  let r = read(e, t)[VM.d];
  if (!ac && r.val * SIGN < 0) { t.leads.splice(-2, 2, [VM.j, pb], [VM.d + ".COM", pa]); r = read(e, t)[VM.d]; }
  return { st: t, r, meter: VM.d, newLeads: t.leads.slice(-2) };
}
/* ammeter (PeakTech mA) put in series: either into an existing lead, or by moving one end of a part to a free field */
function withAmmeterInLead(e, st, leadIdx, ac) {
  const t = clone(st), l = t.leads[leadIdx]; t.leads.splice(leadIdx, 1);
  t.leads.push([l[0], AM.j], [AM.d + ".COM", l[1]]); t.inst[AM.d].mode = ac ? AM.ac : AM.dc;
  let r = read(e, t)[AM.d];
  if (!ac && r.val * SIGN < 0) { t.leads.splice(-2, 2, [l[1], AM.j], [AM.d + ".COM", l[0]]); r = read(e, t)[AM.d]; }
  return { st: t, r, meter: AM.d, newLeads: t.leads.slice(-2) };
}
function withAmmeterAtPart(e, st, slot, ac) {
  const fs = slotFields(slot);
  for (const [keep, other] of [[fs[0], fs[1]], [fs[1], fs[0]]]) {
    for (const [ns, nf] of neighbours(keep)) {
      if (nf === other || fieldBusy(st, nf) || st.parts[ns]) continue;
      const t = clone(st), pc = t.parts[slot]; delete t.parts[slot]; t.parts[ns] = pc;
      t.leads.push([freeSocket(t, nf, [4, 1, 3]), AM.j]); t.leads.push([AM.d + ".COM", freeSocket(t, other, [1, 0, 2])]);
      t.inst[AM.d].mode = ac ? AM.ac : AM.dc;
      let r = read(e, t)[AM.d];
      if (!ac && r.val * SIGN < 0) { const a = t.leads[t.leads.length - 2][0], b = t.leads[t.leads.length - 1][1]; t.leads.splice(-2, 2, [b, AM.j], [AM.d + ".COM", a]); r = read(e, t)[AM.d]; }
      return { st: t, r, meter: AM.d, newLeads: t.leads.slice(-2), moved: { from: slot, to: ns, label: partLabel(pc) } };
    }
  }
  /* no free field next to it: put the part on two free fields elsewhere, a lead from one end, the ammeter on the other */
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const f = r + ":" + c; if (fieldBusy(st, f)) continue;
    for (const [ns, nf] of neighbours(f)) {
      if (fieldBusy(st, nf) || st.parts[ns]) continue;
      const t = clone(st), pc = t.parts[slot]; delete t.parts[slot]; t.parts[ns] = pc;
      t.leads.push([freeSocket(t, fs[0], [1, 0, 2]), freeSocket(t, f, [4, 1])]);
      t.leads.push([freeSocket(t, nf, [4, 1, 3]), AM.j]); t.leads.push([AM.d + ".COM", freeSocket(t, fs[1], [7, 6, 8])]);
      t.inst[AM.d].mode = ac ? AM.ac : AM.dc;
      let rd = read(e, t)[AM.d];
      if (!ac && rd.val * SIGN < 0) { const a = t.leads[t.leads.length - 2][0], b = t.leads[t.leads.length - 1][1]; t.leads.splice(-2, 2, [b, AM.j], [AM.d + ".COM", a]); rd = read(e, t)[AM.d]; }
      return { st: t, r: rd, meter: AM.d, newLeads: t.leads.slice(-3), moved: { from: slot, to: ns, label: partLabel(pc), far: true } };
    }
  }
  return null;
}
function ammeterFor(e, L, st, label, ac) {
  const T = terminals(L, st, label); if (!T) return null;
  if (T.slot) return withAmmeterAtPart(e, st, T.slot, ac);
  const k = st.leads.findIndex((l) => l.indexOf(T.jacks[1]) > -1 || l.indexOf(T.jacks[0]) > -1);
  return k < 0 ? null : withAmmeterInLead(e, st, k, ac);
}

/* one quantity → the bench state that measures it, the reading, and how to say it */
function measure(e, L, st, q, unit, want) {
  SIGN = want === undefined || !isFinite(want) ? 1 : want < 0 ? -1 : 1;
  const ac = !!(st.inst.fg && st.inst.fg.on && e.inst.indexOf("fg") > -1);
  const k = q[0];
  let m = null, how = "";
  if (k === "V") {
    const T = terminals(L, st, q[1]); if (!T) return null;
    const a = T.slot ? "t:" + T.fields[0] : T.jacks[0], b = T.slot ? "t:" + T.fields[1] : T.jacks[1];
    m = withVoltmeter(e, st, a, b, ac); how = "الفولتميتر على التوازي مع " + q[1];
  } else if (k === "N" || k === "Vt") {
    const nd = (n) => (L.nodes || {})[n] || n, a = nd(q[1]), b = nd(k === "N" ? (q[2] || "gnd") : q[2]);
    m = withVoltmeter(e, st, a, b, ac);
    how = k === "N" ? "الفولتميتر بين العقدة " + q[1] + " والأرضي" : "الفولتميتر بين " + placeName(a + (/^t:\d+:\d+$/.test(a) ? ":0" : ""), st, L) + " و " + placeName(b + (/^t:\d+:\d+$/.test(b) ? ":0" : ""), st, L);
  } else if (k === "I") {
    m = ammeterFor(e, L, st, q[1], ac); if (!m) return null;
    how = "الأميتر على التوالي مع " + q[1];
  } else if (k === "Ips") {
    const i = st.leads.findIndex((l) => l.indexOf("ps." + q[1] + "+") > -1); if (i < 0) return null;
    m = withAmmeterInLead(e, st, i, false); how = "الأميتر على التوالي مع المصدر";
  } else if (k === "Ifg") {
    const i = st.leads.findIndex((l) => l.indexOf("fg.out") > -1 && !l.some((p) => /^sc\.|^d\d\.V$/.test(p))); if (i < 0) return null;
    m = withAmmeterInLead(e, st, i, true); how = "الأميتر على التوالي مع المولّد";
  } else if (k === "Iel") {
    const d = q[1].slice(0, 2); st = clone(st); st.inst[d].mode = ((L.set || {})[d] || {}).mode || "adc"; const r = read(e, st)[d]; m = { st: clone(st), r, meter: d, newLeads: [] }; how = "الأميتر نفسه يقصر الطرفين";
  } else return null;
  return Object.assign(m, { how });
}

/* the meter reading in the row's unit */
function inUnit(r, unit) {
  const base = r.unit === "mA" ? r.val / 1000 : r.val;   // A or V or Ω
  const v = r.ac ? Math.abs(base) : base;
  return K.scaled(v, unit);
}
function shown(x) {   // number as written in the table
  if (!isFinite(x)) return "—";
  const a = Math.abs(x);
  return a >= 1000 ? x.toFixed(0) : a >= 100 ? x.toFixed(1) : a >= 10 ? x.toFixed(2) : x.toFixed(3);
}

/* ---------- scene list ---------- */
function plan(e) {
  metersFor(e);
  const scenes = [], add = (s) => { scenes.push(s); return s; };
  const W = e.inst.some((k) => ["rb", "lb", "cb", "sc"].indexOf(k) > -1) || e.inst.indexOf("mn") > -1 ? 1600 : 1206;
  add({ kind: "card", eyebrow: "معمل الدوائر الكهربائية 1 · التجربة " + e.n, title: e.title, en: e.en, lines: e.objective, dur: 6 });
  add({ kind: "bench", inst: e.inst, state: { parts: {}, leads: [], inst: S.defaults() }, focus: "all", marks: instMarks(e.inst),
    panel: { title: "الأدوات على الطاولة", lines: e.equipment, note: "كل جهاز هنا بنفس شكل جهاز المعمل وأزراره." }, dur: 7 });

  let cur = null;   // the circuit currently on the board (without meters)
  e.procs.forEach((p) => {
    const tables = p.tables || [];
    const layoutsInOrder = [];
    tables.forEach((t) => t.rows.forEach((r) => { const L = K.layoutOf(e, r.L, p); if (layoutsInOrder.indexOf(L) < 0) layoutsInOrder.push(L); }));
    (p.layouts || []).forEach((L) => { if (layoutsInOrder.indexOf(L) < 0) layoutsInOrder.push(L); });
    const table = tables[0] && tableModel(tables[0]);
    add({ kind: "bench", inst: e.inst, state: cur ? stateOf(cur) : { parts: {}, leads: [], inst: S.defaults() }, focus: "board",
      panel: { title: p.title, fig: p.fig || null, steps: p.steps }, dur: Math.min(14, 6 + p.steps.length * 1.6) });

    layoutsInOrder.forEach((L) => {
      const keep = tables.some((t) => t.rows.some((r) => K.layoutOf(e, r.L, p) === L && r.q && r.q[0] === "Iel")) ? "d1" : null;
      const circ = circuitOf(L, keep), inst0 = instFor(e, L, {});
      circ.inst = clone(S.defaults()); deepSet(circ.inst, { ps: { mode: "normal" } });
      cur = buildScenes(e, p, L, circ, inst0, cur, add, table);
      /* readings of this layout */
      tables.forEach((t, ti) => t.rows.forEach((r, ri) => {
        if (K.layoutOf(e, r.L, p) !== L) return;
        rowScenes(e, p, L, t, ti, r, ri, cur, add, tableModel(t));
      }));
    });
  });
  add({ kind: "card", eyebrow: "انتهت التجربة " + e.n, title: "جرّبها بنفسك على الطاولة في المنصة", en: "CircuitVision · Circuits 1 Lab", lines: [], dur: 5 });
  scenes.forEach((s) => { s.W = W; });
  return { id: e.id, n: e.n, title: e.title, en: e.en, scenes };
}
function stateOf(c) { return { parts: clone(c.parts), leads: clone(c.leads), inst: clone(c.inst) }; }
function instMarks(inst) {
  const m = [];
  if (inst.indexOf("ps") > -1) m.push({ p: "ps.m+" }, { p: "ps.s+" });
  if (inst.indexOf("d1") > -1) m.push({ p: "d1.COM" });
  if (inst.indexOf("d2") > -1) m.push({ p: "d2.COM" });
  if (inst.indexOf("fg") > -1) m.push({ p: "fg.out" });
  if (inst.indexOf("sc") > -1) m.push({ p: "sc.1" }, { p: "sc.2" });
  ["rb", "lb", "cb"].forEach((k) => { if (inst.indexOf(k) > -1) m.push({ p: k + ".a" }); });
  if (inst.indexOf("mn") > -1) m.push({ p: "mn.L" }, { p: "lamp.a" });
  return m;
}

/* build (or modify) the circuit on the board */
function buildScenes(e, p, L, circ, inst, prev, add, table) {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let st = prev ? { parts: clone(prev.parts), leads: clone(prev.leads), inst: clone(prev.inst) } : { parts: {}, leads: [], inst: clone(S.defaults()) };
  st.inst.ps.on = false; st.inst.fg.on = false; st.inst.mn.on = false; ["d1", "d2"].forEach((d) => { st.inst[d].mode = "off"; });
  const removeParts = Object.keys(st.parts).filter((s) => !circ.parts[s] || !same(circ.parts[s], st.parts[s]));
  const key = (l) => l.slice(0, 2).sort().join("|");
  const want = circ.leads.map(key), have = st.leads.map(key);
  const removeLeads = st.leads.filter((l) => want.indexOf(key(l)) < 0);
  const addParts = Object.keys(circ.parts).filter((s) => !st.parts[s] || !same(circ.parts[s], st.parts[s]));
  const addLeads = circ.leads.filter((l) => have.indexOf(key(l)) < 0);
  const nChange = removeParts.length + removeLeads.length;
  const head = L.name ? "الدائرة: " + L.name : p.title;

  if (prev && nChange + addParts.length + addLeads.length > 0 && nChange + addParts.length + addLeads.length <= 4) {
    /* small change from the last circuit: one scene that names it */
    const said = [];
    removeParts.forEach((s) => { said.push("شِل " + partLabel(st.parts[s])); delete st.parts[s]; });
    removeLeads.forEach((l) => { said.push("افصل السلك من " + placeName(l[0], st, L) + " إلى " + placeName(l[1], st, L)); st.leads = st.leads.filter((x) => key(x) !== key(l)); });
    addParts.forEach((s) => { const pc = circ.parts[s]; st.parts[s] = clone(pc); said.push(pc.t === "W" ? "ضع وصلة بيضاء" : "ضع " + partLabel(pc) + (pc.lb || pc.name ? " (" + (pc.t === "R" ? S.si(pc.v, "Ω") : pc.t === "L" ? S.si(pc.v, "H") : S.si(pc.v, "F")) + ")" : "")); });
    addLeads.forEach((l) => { st.leads.push(l.slice(0, 2)); said.push("سلك من " + placeName(l[0], st, L) + " إلى " + placeName(l[1], st, L)); });
    add({ kind: "bench", inst: e.inst, state: stateOf(st), focus: "board", marks: addParts.map((s) => ({ s })).concat(addLeads.reduce((a, l) => a.concat([{ p: l[0] }, { p: l[1] }]), [])),
      panel: { title: "عدّل الدائرة: " + (L.name || ""), lines: said, table }, dur: 4 + said.length * 1.5 });
  } else if (!prev || nChange || addParts.length || addLeads.length) {
    if (prev && (Object.keys(st.parts).length || st.leads.length)) {
      st = { parts: {}, leads: [], inst: st.inst };
      addParts.length = 0; Object.keys(circ.parts).forEach((s) => addParts.push(s));
      addLeads.length = 0; circ.leads.forEach((l) => addLeads.push(l));
      add({ kind: "bench", inst: e.inst, state: stateOf(st), focus: "board", panel: { title: head, lines: ["فضّ اللوحة وابدأ الدائرة من جديد."], table }, dur: 3 });
    }
    const real = addParts.filter((s) => circ.parts[s].t !== "W"), bridges = addParts.filter((s) => circ.parts[s].t === "W");
    real.forEach((s, i) => {
      st.parts[s] = clone(circ.parts[s]);
      const pc = circ.parts[s], val = pc.t === "R" ? S.si(pc.v, "Ω") : pc.t === "L" ? S.si(pc.v, "H") : S.si(pc.v, "F");
      add({ kind: "bench", inst: e.inst, state: stateOf(st), focus: "board", marks: [{ s }],
        panel: { title: head, sub: (pc.lb || pc.name || "") + (pc.lb || pc.name ? " = " : "") + val, lines: ["القطعة " + (i + 1) + " من " + real.length, "اسحبها من الدرج وثبّتها بين مربّعين على اللوحة."], table }, dur: 3.2 });
    });
    if (bridges.length) {
      bridges.forEach((s) => { st.parts[s] = clone(circ.parts[s]); });
      add({ kind: "bench", inst: e.inst, state: stateOf(st), focus: "board", marks: bridges.map((s) => ({ s })),
        panel: { title: head, sub: "الوصلات البيضاء", lines: ["كل وصلة بيضاء تربط مربّعين ببعض، فيصيرون عقدة واحدة.", bridges.length + " وصلات في هذي الدائرة."], table }, dur: 4.2 });
    }
    addLeads.forEach((l, i) => {
      st.leads.push(l.slice(0, 2));
      add({ kind: "bench", inst: e.inst, state: stateOf(st), focus: "leads", marks: [{ p: l[0] }, { p: l[1] }],
        panel: { title: head, sub: "سلك " + (i + 1) + " من " + addLeads.length, lines: [placeName(l[0], st, L) + " ← " + placeName(l[1], st, L)], table }, dur: 3.4 });
    });
  }
  /* instrument settings */
  const fin = clone(inst); fin.d1.mode = "off"; fin.d2.mode = "off";
  const said = [], marks = [];
  if (e.inst.indexOf("ps") > -1 && fin.ps.on) {
    const two = L.leads.some((l) => l.some((x) => /^ps\.s/.test(x)));
    said.push("اضبط MASTER على " + fin.ps.m.v + " V" + (two ? " و SLAVE على " + fin.ps.s.v + " V" : "") + "، وحد التيار " + fin.ps.m.i + " A.");
    said.push("اضغط OUTPUT: تولع اللمبة الحمراء ويطلع الجهد على الطرفين.");
    marks.push({ p: "ps.m+" }); if (two) marks.push({ p: "ps.s+" });
  }
  if (e.inst.indexOf("fg") > -1 && fin.fg.on) { said.push("شغّل المولّد واضبطه: موجة جيبية، " + S.si(fin.fg.f, "Hz") + "، والسعة " + fin.fg.vpp + " Vpp."); marks.push({ p: "fg.out" }); }
  ["rb", "lb", "cb"].forEach((k) => {
    if (e.inst.indexOf(k) > -1 && (L.set || {})[k] && L.leads.some((l) => l.some((x) => x.indexOf(k + ".") === 0))) {
      const v = k === "rb" ? S.si(S.rbValue({ rb: fin.rb }), "Ω") : k === "lb" ? S.si(S.lbValue({ lb: fin.lb }), "H") : S.si(S.cbValue({ cb: fin.cb }), "F");
      said.push({ rb: "صندوق المقاومات", lb: "صندوق الملفات", cb: "صندوق المكثفات" }[k] + " على " + v + "."); marks.push({ p: k + ".a" });
    }
  });
  if (e.inst.indexOf("mn") > -1) { said.push("شغّل لوحة التيار المتردد (ON): 220 V و 60 Hz على اللمبة."); marks.push({ p: "mn.L" }); }
  st.inst = fin;
  if (said.length) add({ kind: "bench", inst: e.inst, state: stateOf(st), focus: "inst", marks, panel: { title: "اضبط الأجهزة", lines: said, table }, dur: 3 + said.length * 1.8 });
  return { parts: clone(st.parts), leads: clone(st.leads), inst: clone(st.inst) };
}

/* ---------- tables in the right column ---------- */
function tableModel(t) {
  const m = { title: t.title, kind: t.kind, rows: t.rows.map((r) => ({ label: r.label, unit: r.unit || r.ua || "", cells: [] })) };
  if (t.kind === "pair") m.head = ["", (t.a || "I") , (t.b || "V")];
  else if (t.kind === "pf") m.head = ["C", "V", "I (A)", "P (W)", "PF"];
  else if (t.kind === "m") m.head = ["", t.meas || "المقاس"];
  else m.head = ["", t.meas || "المقاس", t.calc || "المحسوب", "% الخطأ"];
  return m;
}
const FILLED = {};   // table cells filled so far, per experiment+table
function rowScenes(e, p, L, t, ti, r, ri, cur, add, model) {
  const tk = e.id + p.id + ti, filled = FILLED[tk] = FILLED[tk] || {};
  const rowSet = r.set || {};
  const base = { parts: clone(cur.parts), leads: clone(cur.leads), inst: instFor(e, L, rowSet) };
  const ac = !!(base.inst.fg && base.inst.fg.on);
  const show = (cells, hl) => { filled[ri] = cells; const mm = clone(model); mm.rows.forEach((row, k) => { row.cells = filled[k] || []; row.on = k === hl; }); return mm; };
  const changes = [];
  if (r.set && r.set.ps && r.set.ps.m && r.set.ps.m.v !== undefined) changes.push("جهد المصدر " + r.set.ps.m.v + " V");
  if (r.set && r.set.rb) changes.push("صندوق المقاومات " + S.si(S.rbValue({ rb: base.inst.rb }), "Ω"));
  if (r.set && r.set.cb) changes.push("صندوق المكثفات " + S.si(S.cbValue({ cb: base.inst.cb }), "F"));

  if (t.kind === "pf") {
    const st = base, R = read(e, st).mn, cells = [shown(R.v), shown(R.i), shown(R.p), R.pf.toFixed(3)];
    check(e, "pf " + r.label, R.pf, K.evalQ(e, L, ["mn", "pf"], rowSet, false), 0.01);
    add({ kind: "bench", inst: e.inst, state: st, focus: "inst", marks: [{ box: [216, 66, 330, 290] }],
      panel: { title: r.label, sub: "PF = " + R.pf.toFixed(3), lines: ["اقرأ من عدّاد القدرة: الجهد والتيار والقدرة ومعامل القدرة."].concat(changes.length ? ["غيّر: " + changes.join("، ")] : []), table: show(cells, ri) }, dur: 3.6 });
    return;
  }
  if (t.kind === "pair") {
    const ma = measure(e, L, base, r.qa, r.ua, K.evalQ(e, L, r.qa, rowSet, false)); if (!ma) return fail(e, r);
    const mb = measure(e, L, ma.st, r.qb, r.ub, K.evalQ(e, L, r.qb, rowSet, false)); if (!mb) return fail(e, r);
    const va = inUnit(ma.r, r.ua), vb = inUnit(mb.r, r.ub);
    check(e, r.label + " a", va, K.scaled(K.evalQ(e, L, r.qa, rowSet, false), r.ua)); check(e, r.label + " b", vb, K.scaled(K.evalQ(e, L, r.qb, rowSet, false), r.ub));
    add({ kind: "bench", inst: e.inst, state: mb.st, focus: "meters", marks: ma.newLeads.concat(mb.newLeads).reduce((a, l) => a.concat([{ p: l[0] }, { p: l[1] }]), []),
      panel: { title: r.label, sub: (r.qa[0] === "I" ? "I" : "A") + " = " + shown(va) + " " + r.ua + "   ·   V = " + shown(vb) + " " + r.ub,
        lines: (changes.length ? ["غيّر: " + changes.join("، ")] : []).concat([ma.how + "، و" + mb.how + "."]), table: show([shown(va), shown(vb)], ri) }, dur: 3.6 });
    return;
  }
  if (r.sum) {
    const vals = r.sum.map((k) => filled[k]), sm = vals.reduce((a, c) => a + (+(c || [])[0] || 0), 0), sc = vals.reduce((a, c) => a + (+(c || [])[1] || 0), 0);
    add({ kind: "bench", inst: e.inst, state: stateOf(cur), focus: "board", panel: { title: r.label, sub: shown(sm) + " ≈ " + shown(sc), lines: ["اجمع القراءات اللي فوق: هذا هو القانون نفسه."], table: show([shown(sm), shown(sc), ""], ri) }, dur: 4 });
    return;
  }
  const q = r.q; if (!q) return;
  const want = K.scaled(K.evalQ(e, L, q, rowSet, false), r.unit), calc = K.scaled(K.evalQ(e, L, q, rowSet, true), r.unit);
  let st, value, how, marks = [], lines = [];
  if (q[0] === "act") {
    const slot = Object.keys(L.parts)[0], pc = X.PIECES[q[1]];
    st = { parts: {}, leads: [], inst: clone(base.inst) }; st.parts[slot] = Object.assign({ id: q[1] }, clone(pc));
    const m = withVoltmeter(e, st, "t:" + slotFields(slot)[0], "t:" + slotFields(slot)[1], false); st = m.st; st.inst[VM.d].mode = "ohm";
    const rr = read(e, st)[VM.d]; value = rr.unit === "kΩ" ? rr.val * 1000 : rr.val; how = "الأوميتر على طرفي المقاومة لحالها، بدون مصدر";
    marks = [{ s: slot }, { p: VM.j }, { p: VM.d + ".COM" }];
    lines = ["قيمتها من الألوان: " + S.si(pc.v, "Ω") + " ± " + Math.round((pc.tol || 0.05) * 100) + "%. الفرق بين القراءة والألوان من تفاوت المقاومة."];
  } else if (["amp", "T", "f", "phase", "Z"].indexOf(q[0]) > -1) {
    st = clone(base); st.leads = clone((L.leads || []).filter((l) => !l.some((x) => METER_JACK.test(x)))); st.inst.sc.meas = true;
    if (q[0] === "phase") { const T = 1 / st.inst.fg.f, td = st.inst.sc.td, dt = Math.abs(want) / 360 * T; st.inst.sc.cur = true; st.inst.sc.x1 = 4; st.inst.sc.x2 = +(4 + dt / td).toFixed(2); }
    value = want; how = { amp: "القيمة العظمى من شاشة الأوسيلوسكوب (نصف Vpp)", T: "الزمن الدوري من الشاشة", f: "التردد من الشاشة", phase: "الفرق الزمني بين القمتين بالمؤشرين (Cursor) ثم θ = 360°·Δt / T", Z: "محسوبة من القراءتين: Z = Vs ÷ I" }[q[0]];
    marks = [{ p: "sc.1" }, { p: "sc.2" }];
  } else {
    const m = measure(e, L, base, q, r.unit, want); if (!m) return fail(e, r);
    st = m.st; value = inUnit(m.r, r.unit); how = m.how;
    marks = m.newLeads.reduce((a, l) => a.concat([{ p: l[0] }, { p: l[1] }]), []);
    if (m.moved) { marks.push({ s: m.moved.to }); lines.push(m.moved.far ? "انقل " + m.moved.label + " لمكان فاضي: سلك يوصّل طرفه الأول، والأميتر يكمّل من طرفه الثاني." : "حرّك طرف " + m.moved.label + " لمربّع فاضي، والأميتر يكمّل المسار."); }
  }
  check(e, r.label, value, want, r.tol);
  if (value < 0 && q[0] !== "phase") lines.push("الإشارة السالبة: التيار أو الجهد عكس الاتجاه المرسوم في الكتيب.");
  const err = calc ? Math.abs(value - calc) / Math.abs(calc) * 100 : NaN;
  const cells = t.kind === "m" ? [shown(value)] : [shown(value), shown(calc), isFinite(err) ? err.toFixed(2) + "%" : ""];
  add({ kind: "bench", inst: e.inst, state: st, focus: q[0] === "act" ? "meters" : ["amp", "T", "f", "phase", "Z"].indexOf(q[0]) > -1 ? "scope" : "meters", marks,
    panel: { title: "قِس " + r.label, sub: shown(value) + " " + r.unit, lines: (changes.length ? ["غيّر: " + changes.join("، ")] : []).concat([how + "."], lines), table: show(cells, ri) }, dur: 4.2 });
}
const PROBLEMS = [];
function check(e, what, got, want, tol) {
  if (!isFinite(got) || !isFinite(want)) { PROBLEMS.push(e.id + ": " + what + " not finite " + got + " / " + want); return; }
  const ok = Math.abs(got - want) <= Math.max((tol || 0.02) * Math.abs(want), 0.06 * Math.abs(want) + 0.011);
  if (!ok) PROBLEMS.push(e.id + ": " + what + " reading " + got + " vs expected " + want);
}
function fail(e, r) { PROBLEMS.push(e.id + ": no way to measure " + r.label + " " + JSON.stringify(r.q || r.qa)); }

if (require.main === module) {
  const ids = process.argv.slice(2), out = {};
  (ids.length ? ids : X.list.map((x) => x.id)).forEach((id) => { out[id] = plan(X.list.find((x) => x.id === id)); });
  if (PROBLEMS.length) { console.error(PROBLEMS.join("\n")); }
  process.stdout.write(JSON.stringify(out));
  process.exit(PROBLEMS.length ? 1 : 0);
}
module.exports = { plan, PROBLEMS };
