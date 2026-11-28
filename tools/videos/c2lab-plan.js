/* CircuitVision — explainer videos for the Circuits 2 lab: the scene plan (the same scene format as clab-plan.js, so the same engine draws it).
   Every experiment of c2lab.js gives, for each procedure, the ready circuits (parts, leads, instrument settings). The plan builds each circuit part by
   part and lead by lead on the bench, sets the instruments, then reads the tables of the manual: a frequency table is swept row by row (the generator is
   re-set for every row and the bench simulator shows the readings), the other tables are filled as the layouts they belong to are read.
   usage: node tools/videos/c2lab-plan.js c2e7 > plan.json */
"use strict";
const path = require("path");
const CV = require(path.join(__dirname, "../../tests/load.js"));
require(path.join(__dirname, "../../c2lab.js"));
const S = CV.clabSim, K = CV.clabCheck, X = CV.c2lab, lib = require("./clab-plan.js").lib;
const clone = (x) => JSON.parse(JSON.stringify(x));
const AR = /[؀-ۿ]/;

/* ---------- Arabic of the manual → English on screen ---------- */
const EN = {
  "جهد المكثف أثناء الشحن": "Capacitor voltage while charging", "جهد المكثف أثناء التفريغ": "Capacitor voltage while discharging",
  "ثابت الزمن": "Time constant", "محسوب RC (ms)": "RC calculated (ms)", "من الشاشة (ms)": "From the scope (ms)",
  "vC محسوب (V)": "vC calculated (V)", "vC مقاس (V)": "vC measured (V)",
  "مقاومة الملفين": "Resistance of the two coils", "الملف": "Coil", "المحاثة الذاتية": "Self-inductance", "المحاثة المتبادلة": "Mutual inductance",
  "القطبية": "Polarity", "النقطة عند": "Dot at", "التوالي": "Series connection",
  "تحت التخميد (R = 200 Ω)": "Underdamped (R = 200 Ω)", "التخميد الحرج والزائد": "Critical and overdamped", "حرج": "Critical", "زائد (6.9 kΩ)": "Over (6.9 kΩ)",
  "Δt دورة (µs)": "Δt per cycle (µs)", "ω مقاس (rad/s)": "ω measured (rad/s)", "ωd نظري (rad/s)": "ωd theory (rad/s)",
  "عند 1 kHz": "At 1 kHz", "الكلي": "Total", "الحمل المتزن": "Balanced load", "القدرة": "Power",
  "الكلية من اللوحة Σ (W)": "Total from the panel Σ (W)", "المقدار rms (V أو mA)": "Magnitude rms (V or mA)", "الزاوية (°)": "Angle (°)",
  "جدول إضافي من المنصة: 2.0–5.8 kHz (حول الرنين)": "Extra table: 2.0–5.8 kHz (around resonance)", "الجدول 6.2 (6–9 kHz كما في الكتيب)": "Table 6.2 (6–9 kHz)"
};
function en(s) {
  s = String(s == null ? "" : s); if (EN[s]) return EN[s];
  s = s.replace(/^الجدول (\d+\.\d+): القياسات$/, "Table $1: Measurements").replace(/^الجدول (\d+\.\d+)$/, "Table $1").replace(/^الجدول (\d+\.\d+): جهد المكثف أثناء الشحن$/, "Table $1: Capacitor voltage while charging");
  Object.keys(EN).forEach((k) => { if (s.indexOf(k) > -1) s = s.split(k).join(EN[k]); });
  return s.replace(AR.global ? AR : new RegExp(AR.source, "g"), "").replace(/\s+/g, " ").replace(/\(\s*\)/g, "").trim();
}


/* English names for the titles on screen (the Arabic stays in the subtitle lines) */
const LN = { "RC بموجة 0 → 10 V": "RC, 0 → 10 V square wave", "RC بموجة ±10 V": "RC, ±10 V square wave", "الملف 1": "Coil 1", "الملف 2": "Coil 2", "V2 على الملف 2 المفتوح": "V2 on the open coil 2",
  "1' موصول بـ B، و VT بين 1 و A": "1' joined to B, VT between 1 and A", "توالي aiding (1' ← B)": "Series aiding (1' to B)", "توالي opposing (1' ← A)": "Series opposing (1' to A)",
  "حرج: صندوق 6275 Ω + 50 Ω المولد": "Critical: box 6275 Ω + 50 Ω generator", "R = 6.9 kΩ، 3 kHz": "R = 6.9 kΩ, 3 kHz", "R = 200 Ω، 1 kHz": "R = 200 Ω, 1 kHz", "قرب الرنين 3.8 kHz": "Near resonance, 3.8 kHz",
  "منخفض RC": "Low-pass RC", "عالٍ CR": "High-pass CR", "تمرير النطاق": "Band-pass", "المنفذ 2 مفتوح": "Port 2 open", "المنفذ 2 مقصور": "Port 2 shorted", "المنفذ 1 مفتوح": "Port 1 open", "المنفذ 1 مقصور": "Port 1 shorted",
  "IA و VAB": "IA and VAB", "IA و VAN": "IA and VAN", "صفحة L1 في اللوحة": "Panel page L1", "صفحة Σ في اللوحة": "Panel page Σ" };
const PT = [
  ["الإجراء 1 و 2: شحن المكثف بموجة مربعة 0 → 10 V، 200 Hz", "Procedures 1 and 2 · charge with a 0 → 10 V, 200 Hz square wave"], ["الإجراء 1 و 2: موجة مربعة ±10 V، 200 Hz", "Procedures 1 and 2 · ±10 V, 200 Hz square wave"],
  ["الإجراء 1: مقاومة الملفين (5 V مستمر)", "Procedure 1 · coil resistances (5 V DC)"], ["الإجراء 1 (تابع): المحاثة الذاتية (5 V rms، 60 Hz)", "Procedure 1 (cont.) · self-inductance (5 V rms, 60 Hz)"],
  ["الإجراء 2: المحاثة المتبادلة M", "Procedure 2 · mutual inductance M"], ["الإجراء 3: تحديد النقطة (القطبية)", "Procedure 3 · finding the dot (polarity)"], ["الإجراء 4: معامل الاقتران k", "Procedure 4 · coupling coefficient k"],
  ["الإجراءات 1–7: موجة مربعة 6 Vpp، والمكثف على CH1", "Procedures 1–7 · 6 Vpp square wave, capacitor on CH1"],
  ["الإجراء 1: R = 100 Ω، من 7.5 إلى 15 kHz بخطوة 300 Hz", "Procedure 1 · R = 100 Ω, 7.5 to 15 kHz"], ["الإجراء 2: R = 50 Ω، من 7.5 إلى 15 kHz بخطوة 300 Hz", "Procedure 2 · R = 50 Ω, 7.5 to 15 kHz"], ["الإجراء 3: R = 10 Ω، من 7.5 إلى 15 kHz بخطوة 300 Hz", "Procedure 3 · R = 10 Ω, 7.5 to 15 kHz"],
  ["الإجراء 1: القيم عند 1 kHz", "Procedure 1 · values at 1 kHz"], ["الإجراء 2: Z مع التردد (V = 2 V rms ثابت)", "Procedure 2 · Z against frequency (V = 2 V rms)"],
  ["الإجراء 1: مرشح التمرير المنخفض (R = 5 kΩ، C = 10 nF، Vs = 5 V rms)", "Procedure 1 · low-pass filter (R = 5 kΩ, C = 10 nF)"], ["الإجراء 2: مرشح التمرير العالي (C = 10 nF، R = 10 kΩ، Vs = 5 Vpp)", "Procedure 2 · high-pass filter (C = 10 nF, R = 10 kΩ)"],
  ["الخطوات 1–6: Vs = 5 Vpp", "Steps 1–6 · Vs = 5 Vpp"],
  ["الإجراء 1: منفذ 2 مفتوح (I2 = 0) ⇐ z11 و z21", "Procedure 1 · port 2 open (I2 = 0) → z11, z21"], ["الإجراء 2: منفذ 2 مقصور (V2 = 0) ⇐ y11 و y21", "Procedure 2 · port 2 shorted (V2 = 0) → y11, y21"],
  ["الإجراء 3: منفذ 1 مفتوح (I1 = 0) ⇐ z12 و z22", "Procedure 3 · port 1 open (I1 = 0) → z12, z22"], ["الإجراء 4: منفذ 1 مقصور (V1 = 0) ⇐ y12 و y22", "Procedure 4 · port 1 shorted (V1 = 0) → y12, y22"],
  ["الإجراء 1: حمل Y متزن (100 Ω لكل طور)", "Procedure 1 · balanced Y load (100 Ω per phase)"], ["الإجراء 2 و 3: القدرة من لوحة القياس", "Procedures 2 and 3 · power from the panel"]];
const FIX = { "الأدوات على الطاولة": "The bench", "اضبط الأجهزة": "Set the instruments", "اقرأ الأجهزة": "Read the instruments" };
function tr(t) {
  t = String(t || ""); if (FIX[t]) return FIX[t];
  const q = PT.filter((x) => x[0] === t)[0]; if (q) return q[1];
  let m = /^عدّل الدائرة: (.*)$/.exec(t); if (m) return "Change the circuit: " + (LN[m[1]] || en(m[1]));
  m = /^الدائرة: (.*)$/.exec(t); if (m) return "Circuit: " + (LN[m[1]] || en(m[1]));
  m = /^غيّر التردد إلى (.*) kHz$/.exec(t); if (m) return "Set the frequency to " + m[1] + " kHz";
  return t;
}

/* ---------- instrument state of a layout, for a table row ---------- */
function fullInst(e, L, rowSet) {
  const st = K.stateFor(L, rowSet || {}, false), inst = st.inst;
  const term = (rowSet && rowSet.fgTerm) || (L.set && L.set.fgTerm);
  if (term) {
    const s0 = clone(st); s0.inst.fg.vpp = 10; const sol = S.solve(s0, { only: e.inst }), a = S.mag(S.vBetween(sol, "fg.out", "fg.com").ac);
    if (a > 0) inst.fg.vpp = +(10 * (term / 2) / a).toFixed(2);
  }
  delete inst.fgTerm; return inst;
}
const MODE_AR = { vdc: "فولت مستمر V⎓", vac: "فولت متردد V~", adc: "أمبير مستمر A⎓", aac: "أمبير متردد A~", madc: "ملي أمبير مستمر", maac: "ملي أمبير متردد", ohm: "أوم Ω", off: "إيقاف" };
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function instLines(prev, now, L) {   // Arabic lines for the instrument changes of a scene (the subtitle track)
  const out = [], p = prev || {};
  ["d1", "d2"].forEach((d) => { if (now[d] && now[d].mode !== "off" && (!p[d] || p[d].mode !== now[d].mode)) out.push("اضبط الملتيميتر " + (d === "d1" ? "Fluke" : "PeakTech") + " على " + (MODE_AR[now[d].mode] || now[d].mode) + "."); });
  if (now.sc && !same(now.sc, p.sc) && (L.leads || []).some((l) => l.some((x) => /^sc\./.test(x)))) out.push("اضبط الأوسيلوسكوب: الفولت لكل تقسيم وزمن المسح، وشغّل قياس القمم.");
  if (now.va && now.va.on && !(p.va && p.va.on)) out.push("شغّل الفارياك على " + now.va.v + " V.");
  if (now.tp && now.tp.on && !(p.tp && p.tp.on)) out.push("شغّل محول المعمل ثلاثي الطور.");
  if (now.pm && p.pm && now.pm.pg !== p.pm.pg) out.push("اضغط ▲ أو ▼ في لوحة القياس لين تظهر الصفحة المطلوبة.");
  ["r1", "r2", "r3"].forEach((k) => { if (now[k] && p[k] && now[k].x !== p[k].x) out.push("اضبط المقاومة المتغيرة " + k.toUpperCase() + " على " + now[k].x + " Ω."); });
  return out;
}
function marksFor(e, L, now) {
  const m = [], used = (rx) => (L.leads || []).some((l) => l.some((x) => rx.test(x)));
  if (used(/^sc\./)) m.push({ p: "sc.1" }, { p: "sc.2" });
  ["d1", "d2"].forEach((d) => { if (now[d] && now[d].mode !== "off" && used(new RegExp("^" + d + "\\."))) m.push({ p: d + ".COM" }); });
  if (used(/^pm\./)) m.push({ p: "pm.1" });
  if (used(/^cc\./)) m.push({ p: "cc.1" });
  if (!m.length && used(/^fg\./)) m.push({ p: "fg.out" });
  return m;
}

/* ---------- tables ---------- */
function pickCols(T) {
  let cols = T.cols.filter((c) => c.src !== "row");
  while (cols.length > 6) { let k = cols.findIndex((c) => / pp/.test(c.h)); if (k < 0) cols.forEach((c, i) => { if (c.src === "calc") k = i; }); if (k < 0) break; cols.splice(k, 1); }
  return cols;
}
function fmt(v) { if (typeof v !== "number") return en(v); if (v === 0) return "0"; const a = Math.abs(v); return String(a >= 1e5 ? Math.round(v) : X.sig(v, a >= 1000 ? 5 : 4)); }
function cellsOf(T, cols, r) {
  const m = T.model(r);
  return cols.map((c) => {
    if (c.src === "%") { const a = m[c.of[0]], b = m[c.of[1]]; return a ? (Math.abs(a - b) / Math.abs(a) * 100).toFixed(2) + "%" : "—"; }
    return fmt(m[c.k]);
  });
}
function labelOf(T, r) { const rc = T.cols.filter((c) => c.src === "row")[0], m = T.model(r); return fmt(rc && m[rc.k] !== undefined ? m[rc.k] : r); }
function shownRows(T) {   // at most 12 rows on screen
  const n = T.rows.length, idx = T.rows.map((_, i) => i); if (n <= 12) return idx;
  const st = Math.ceil(n / 12), out = idx.filter((i) => i % st === 0); if (out[out.length - 1] !== n - 1) out.push(n - 1); return out;
}
const FILLED = new Map();
function tableView(T, shown, hl) {   // table model with the cells filled so far
  const cols = pickCols(T), f = FILLED.get(T) || {};
  const rc = T.cols.filter((c) => c.src === "row")[0];
  return { title: en(T.title), kind: "m", head: [rc ? en(rc.h).replace(/^$/, "") : ""].concat(cols.map((c) => en(c.h))),
    rows: shown.map((ri) => ({ label: labelOf(T, T.rows[ri]), unit: "", cells: f[ri] || [], on: ri === hl })) };
}
function fill(T, ri) { const f = FILLED.get(T) || {}; f[ri] = cellsOf(T, pickCols(T), T.rows[ri]); FILLED.set(T, f); }
const freqOf = (T, r) => (typeof r === "number" ? r : (() => { const m = /([\d.]+)\s*$/.exec(String(T.model(r).f)); return m ? +m[1] : NaN; })());
function sweepable(p, T) { const c0 = T.cols.filter((c) => c.src === "row")[0]; return (p.inst && (p.inst.controls || []).some((c) => c.k === "f")) && c0 && c0.k === "f" && T.rows.every((r) => typeof r === "number" || r === "cut"); }

/* ---------- plan ---------- */
function plan(e) {
  FILLED.clear();
  const scenes = [], add = (s) => { if (s.panel && s.panel.title) s.panel.title = tr(s.panel.title); scenes.push(s); return s; };
  const W = 1600;
  add({ kind: "card", eyebrow: "Circuits 2 · Lab " + e.n, title: e.title, en: e.en, lines: e.objective, dur: 6 });
  add({ kind: "bench", inst: e.inst, state: { parts: {}, leads: [], inst: S.defaults() }, focus: "all", marks: lib.instMarks(e.inst),
    panel: { title: "الأدوات على الطاولة", lines: e.equipment, note: "كل جهاز هنا بنفس شكل جهاز المعمل وأزراره." }, dur: 7 });
  let cur = null;
  e.procs.forEach((p) => {
    const meas = p.tables.filter((T) => T.cols.some((c) => c.src === "meas")), nL = p.layouts.length;
    const asg = p.layouts.map(() => []); let j = 0;
    meas.forEach((T) => {
      const n = T.rows.length, left = nL - j, all = T.rows.map((_, i) => i);
      if (sweepable(p, T)) asg[0].push({ T, rows: all, sweep: true });
      else if (n > 1 && n === left && left > 1) { all.forEach((i) => asg[j + i].push({ T, rows: [i], part: true })); j += n; }
      else if (n === 1 && nL > 1 && meas.length === 1) asg[nL - 1].push({ T, rows: [0] });
      else { asg[Math.min(j, nL - 1)].push({ T, rows: all }); if (n === 1 && j < nL - 1) j++; }
    });
    add({ kind: "bench", inst: e.inst, state: cur ? lib.stateOf(cur) : { parts: {}, leads: [], inst: S.defaults() }, focus: "board",
      panel: { title: p.title, steps: p.steps }, dur: Math.min(14, 6 + p.steps.length * 1.6) });
    p.layouts.forEach((L, li) => {
      const inst0 = fullInst(e, L, {}), circ = { parts: clone(L.parts || {}), leads: (L.leads || []).map((l) => l.slice(0, 2)), inst: clone(S.defaults()) };
      circ.inst.ps.mode = "normal";
      cur = lib.buildScenes(e, p, L, circ, inst0, cur, add, null);
      const prevInst = scenes[scenes.length - 1].state.inst, lines = instLines(prevInst, inst0, L);
      if (lines.length || !same(prevInst, inst0)) add({ kind: "bench", inst: e.inst, state: { parts: clone(cur.parts), leads: clone(cur.leads), inst: clone(inst0) }, focus: "inst", marks: marksFor(e, L, inst0),
        panel: { title: "اضبط الأجهزة", lines: lines.length ? lines : ["اضبط الأجهزة كما في الشكل."] }, dur: 3 + lines.length * 1.8 });
      cur = { parts: clone(cur.parts), leads: clone(cur.leads), inst: clone(inst0) };
      const jobs = asg[li];
      if (!jobs.length) {   // nothing to fill: just read the instruments
        let sub = ""; try { const st = {}; (p.inst.controls || []).forEach((c) => { st[c.k] = c.def; }); if (p.inst.controls && p.inst.controls[0] && p.inst.controls[0].k === "coil") st.coil = String(li + 1);
          const rd = p.inst.read(st); sub = rd.meters.filter((m) => typeof m[1] === "number" || !AR.test(m[1])).slice(0, 4).map((m) => en(m[0]) + " = " + m[1] + " " + (m[2] || "")).join("  ·  "); } catch (x) {}
        add({ kind: "bench", inst: e.inst, state: lib.stateOf(cur), focus: "inst", marks: marksFor(e, L, inst0), panel: { title: "اقرأ الأجهزة", sub: sub, lines: ["اقرأ القراءات من شاشات الأجهزة."] }, dur: 5 });
      }
      jobs.forEach((jb) => {
        const T = jb.T, shown = shownRows(T);
        if (jb.sweep) {
          const rowsIdx = shown;   // the sweep goes through the rows that are on screen
          rowsIdx.forEach((ri) => {
            const f = freqOf(T, T.rows[ri]), rs = { fg: { f: Math.round(f * 1e3) } }, ins = fullInst(e, L, rs);
            for (let k = 0; k <= ri; k++) fill(T, k);   // rows skipped on screen are still filled
            add({ kind: "bench", inst: e.inst, state: { parts: clone(cur.parts), leads: clone(cur.leads), inst: ins }, focus: "inst", marks: marksFor(e, L, ins),
              panel: { title: "غيّر التردد إلى " + f + " kHz", sub: "f = " + f + " kHz", lines: ["غيّر تردد المولّد إلى " + f + " kHz واقرأ القراءات.", "سجّلها في الصف."], table: tableView(T, shown, ri) }, dur: 3 });
          });
        } else {
          const last = jb.rows[jb.rows.length - 1];
          jb.rows.forEach((ri) => fill(T, ri)); if (jb.part) for (let k = 0; k < jb.rows[0]; k++) fill(T, k);
          let sub = ""; try { const ci = cellsOf(T, pickCols(T), T.rows[last]); sub = ""; } catch (x) {}
          add({ kind: "bench", inst: e.inst, state: lib.stateOf(cur), focus: "inst", marks: marksFor(e, L, inst0),
            panel: { title: "اقرأ الأجهزة", sub: sub, lines: ["اقرأ القراءات من الأجهزة وسجّلها في الجدول."], table: tableView(T, shown, jb.part ? last : -2) }, dur: 5 });
        }
      });
    });
  });
  add({ kind: "card", eyebrow: "انتهت التجربة " + e.n, title: "جرّبها بنفسك على الطاولة في المنصة", en: "CircuitVision · Circuits 2 Lab", lines: [], dur: 5 });
  scenes.forEach((s) => { s.W = W; });
  return { id: e.id, n: e.n, title: e.title, en: e.en, scenes };
}

if (require.main === module) {
  const ids = process.argv.slice(2), out = {};
  (ids.length ? ids : X.list.map((x) => x.id)).forEach((id) => { out[id] = plan(X.list.find((x) => x.id === id)); });
  process.stdout.write(JSON.stringify(out));
}
module.exports = { plan };
