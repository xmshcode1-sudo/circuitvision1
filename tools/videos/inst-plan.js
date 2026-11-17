/* CircuitVision — short videos that introduce each instrument of the Circuits 1 bench (clab-inst-<key>.mp4).
   Every display in the videos is the bench's own simulator output for the state shown; the readings quoted in the text are read
   from the same simulation. usage: node tools/videos/inst-plan.js > /tmp/inst-plan.json */
"use strict";
const path = require("path");
const CV = require(path.join(__dirname, "../../tests/load.js")), S = CV.clabSim, K = CV.clabCheck;
const clone = (x) => JSON.parse(JSON.stringify(x));
const PROBLEMS = [];

function inst(over) { const i = S.defaults(); K.deepSet(i, over || {}); return i; }
function R(v, lb) { return { t: "R", v, id: "R" + v + (lb || ""), lb }; }
function read(st, only) { return S.read(clone(st), { only }); }
function num(t) { return parseFloat(String(t).replace(/[^0-9.\-]/g, "")); }
function need(what, got, want, tol) { if (!(Math.abs(got - want) <= (tol || 0.03) * Math.abs(want) + 1e-9)) PROBLEMS.push(what + ": got " + got + " want " + want); }

/* a 1 kΩ resistor on the board, between fields 2:3 and 2:4 */
const ONE_K = { "h:2:3": R(1000, "R") };
const PS_LOAD = [["ps.m+", "t:2:3:0"], ["t:2:4:8", "ps.m-"]];

function card(title, lines) { return { kind: "card", eyebrow: "معمل الدوائر الكهربائية 1 · تعرّف على الأجهزة", title, en: "CircuitVision · Circuits 1 Lab", lines: lines || [], dur: 4.5 }; }
function sc(only, st, view, marks, title, lines, sub, dur) { return { kind: "bench", inst: only, state: st, view, marks: marks || [], focus: "view", panel: { title, lines, sub }, dur: dur || 5 }; }

/* ---------------- dual supply ---------------- */
function ps() {
  const only = ["ps", "d1", "d2"], V = [470, 0, 590, 286], VB = [440, 0, 760, 560], out = [card("مزوّد الجهد Leybold", ["قناتين MASTER و SLAVE، كل قناة 0–16 V و 0–5 A"])];
  let st = { parts: {}, leads: [], inst: inst({ ps: { m: { v: 0, i: 0.1 } } }) };
  out.push(sc(only, st, V, [], "مزوّد الجهد المزدوج", ["جهازين في صندوق واحد: القناة اليسار MASTER واليمين SLAVE.", "كل قناة لها شاشة، ومقبضين، وثلاث مداخل."]));
  st = clone(st); st.inst.ps.m.v = 10;
  out.push(sc(only, st, V, [{ box: [498, 42, 268, 66] }], "الشاشة", ["فوق: التيار A والجهد V لكل قناة.", "والخرج مطفي، الشاشة تعرض الجهد اللي ضبطته عشان تجهّزه قبل التشغيل."], "MASTER = 10.0 V"));
  out.push(sc(only, st, V, [{ box: [498, 116, 224, 92] }], "المقابض", ["مقبض V: يضبط الجهد.", "مقبض A: يضبط حد التيار. المصدر ما يعطي أكثر منه حتى لو الدائرة تبغى."]));
  out.push(sc(only, st, V, [{ box: [552, 214, 144, 46] }, { box: [860, 214, 144, 46] }], "المداخل", ["الأحمر +، والأزرق −: هذول الخرج.", "الأصفر ⏚ أرضي الجهاز، وما نحتاجه في تجارب الكتيب."]));
  st = { parts: clone(ONE_K), leads: clone(PS_LOAD), inst: inst({ ps: { on: true, m: { v: 10, i: 0.1 } } }) };
  let r = read(st, only).ps.m; need("ps cv", r.v, 10);
  out.push(sc(only, st, VB, [{ box: [500, 206, 44, 54] }, { box: [498, 42, 268, 66] }], "OUTPUT", ["زر OUTPUT يشغّل الخرج وتولع لمبته الحمراء.", "هنا المصدر على مقاومة 1 kΩ: الجهد 10 V، والتيار 10 mA، ولمبة CV والعة."], "CV · " + r.v.toFixed(1) + " V · " + (r.i * 1000).toFixed(0) + " mA"));
  st = clone(st); st.inst.ps.m.i = 0.005; r = read(st, only).ps.m; need("ps cc", r.i, 0.005, 0.01);
  out.push(sc(only, st, VB, [{ box: [498, 42, 268, 66] }, { box: [498, 116, 110, 92] }], "حد التيار CC", ["لو نزّلنا حد التيار لـ 5 mA، الدائرة تبغى 10 mA ما تاخذها.", "المصدر يثبت التيار على الحد وينزّل الجهد، وتولع لمبة CC بدل CV."], "CC · " + r.v.toFixed(1) + " V · " + (r.i * 1000).toFixed(1) + " mA", 6));
  st = { parts: {}, leads: [["ps.m+", "t:2:3:0"], ["t:2:3:8", "ps.m-"]], inst: inst({ ps: { on: true, m: { v: 10, i: 0.1 } } }) }; r = read(st, only).ps.m;
  out.push(sc(only, st, VB, [{ box: [498, 42, 268, 66] }], "علامة القصر", ["سلكين من + و − على نفس المربّع = قصر.", "المصدر يروح CC والجهد صفر تقريبًا. إذا شفت هذا، افصل وراجع التوصيل."], "CC · " + r.v.toFixed(2) + " V · " + (r.i * 1000).toFixed(0) + " mA", 6));
  st = { parts: clone(ONE_K), leads: [["ps.m+", "t:2:3:0"], ["t:2:4:8", "ps.s-"]], inst: inst({ ps: { on: true, mode: "series", m: { v: 12, i: 0.1 } } }) }; r = read(st, only);
  const vtot = r.ps.m.v + r.ps.s.v; need("ps series", vtot, 24, 0.02);
  out.push(sc(only, st, VB, [{ box: [728, 116, 98, 86] }, { p: "ps.m+" }, { p: "ps.s-" }], "SERIES", ["القناتين توالي من داخل الجهاز، والـ SLAVE يتبع مقابض الـ MASTER.", "الخرج بين + MASTER و − SLAVE: ضعف الجهد، حتى 32 V."], "12 V + 12 V = " + vtot.toFixed(1) + " V", 6));
  st = { parts: { "h:2:3": R(100, "R") }, leads: clone(PS_LOAD), inst: inst({ ps: { on: true, mode: "parallel", m: { v: 10, i: 0.06 } } }) }; r = read(st, only).ps.m;
  out.push(sc(only, st, VB, [{ box: [728, 116, 98, 86] }, { box: [498, 42, 532, 66] }], "PARALLEL", ["القناتين توازي: نفس الجهد، والتيار المتاح يتضاعف (حتى 10 A).", "هنا حد كل قناة 60 mA، والحمل 100 Ω ياخذ 100 mA بدون ما يوصل CC."], (r.i * 1000).toFixed(0) + " mA", 6));
  out.push(card("خلاصة المزوّد", ["اضبط الجهد والخرج مطفي، وحد التيار مناسب", "CC بدون قصد = قصر أو حد تيار صغير"]));
  return { id: "inst-ps", key: "ps", out: "clab-inst-ps", label: "مزوّد الجهد", scenes: out };
}

/* ---------------- multimeters ---------------- */
function dmm(d) {
  const fl = d === "d1", only = ["ps", "d1", "d2"], X = fl ? 16 : 214, V = [0, 270, 860, 650], name = fl ? "Fluke 115" : "PeakTech";
  const A = fl ? "d1.A" : "d2.mA", out = [card("الملتيميتر " + name, fl ? ["جهد، تيار، مقاومة · مدخل A بفيوز 11 A"] : ["جهد، تيار، مقاومة · مدخل mA بفيوز 200 mA ومدخل 10A"])];
  let st = { parts: clone(ONE_K), leads: [], inst: inst() };
  out.push(sc(only, st, V, [{ box: [X, 282, 190, 356] }], name, fl ? ["الشاشة، وأزرار HOLD و MIN MAX و RANGE، والمفتاح الدوّار، وثلاث مداخل تحت."] : ["الشاشة، وأزرار HOLD و RANGE و REL، والمفتاح الدوّار، وأربع مداخل تحت."]));
  out.push(sc(only, st, V, [{ box: [X + 20, 400, 150, 150] }], "المفتاح الدوّار", fl ? ["V~ جهد متردد، V⎓ جهد مستمر، mV جهد صغير،", "Ω مقاومة، A~ و A⎓ تيار. وOFF يطفيه."] : ["V⎓ و V~ للجهد، Ω للمقاومة،", "mA⎓ و mA~ للتيار الصغير، و 10A للتيار الكبير."]));
  out.push(sc(only, st, V, [{ box: [X + 10, 572, 170, 56] }], "المداخل", fl ? ["COM (الأسود): السلك الثاني دائمًا هنا.", "VΩ: للجهد والمقاومة.", "A: للتيار فقط، وفيه فيوز 11 A."] : ["COM (الأسود) دائمًا.", "VΩ للجهد والمقاومة.", "mA للتيار حتى 200 mA (بفيوز)، و 10A للأكبر."]));
  st = { parts: clone(ONE_K), leads: clone(PS_LOAD).concat([[fl ? "d1.V" : "d2.V", "t:2:3:2"], [d + ".COM", "t:2:4:6"]]), inst: inst({ ps: { on: true, m: { v: 10, i: 0.1 } } }) };
  st.inst[d].mode = "vdc"; let r = read(st, only)[d]; need(d + " V", num(r.text), 10, 0.02);
  out.push(sc(only, st, V, [{ p: fl ? "d1.V" : "d2.V" }, { p: d + ".COM" }], "قياس الجهد", ["المفتاح على V⎓، والسلكين على طرفي القطعة: توازي.", "الفولتميتر مقاومته كبيرة، فما يغيّر الدائرة."], r.text + " V", 5.5));
  st = { parts: clone(ONE_K), leads: [[fl ? "d1.V" : "d2.V", "t:2:3:2"], [d + ".COM", "t:2:4:6"]], inst: inst() }; st.inst[d].mode = "ohm";
  r = read(st, only)[d];
  out.push(sc(only, st, V, [{ s: "h:2:3" }, { p: fl ? "d1.V" : "d2.V" }, { p: d + ".COM" }], "قياس المقاومة", ["المفتاح على Ω، والمقاومة لحالها بدون مصدر.", "القراءة قريبة من المكتوب، والفرق من تفاوت القطعة."], r.text + " " + (r.unit || "Ω"), 5.5));
  st = { parts: clone(ONE_K), leads: [["ps.m+", A], [d + ".COM", "t:2:3:0"], ["t:2:4:8", "ps.m-"]], inst: inst({ ps: { on: true, m: { v: 10, i: 0.1 } } }) };
  st.inst[d].mode = fl ? "adc" : "madc"; r = read(st, only)[d];
  out.push(sc(only, st, V, [{ p: A }, { p: d + ".COM" }, { p: "ps.m+" }], "قياس التيار", ["افتح الدائرة وخلّ التيار يمر داخل الجهاز: توالي.", "السلك الأحمر في مدخل " + (fl ? "A" : "mA") + "، والمفتاح على " + (fl ? "A⎓" : "mA⎓") + "."], r.text + " " + (r.unit || ""), 5.5));
  st = { parts: clone(ONE_K), leads: clone(PS_LOAD).concat([[A, "t:2:3:2"], [d + ".COM", "t:2:4:6"]]), inst: inst({ ps: { on: true, m: { v: 10, i: fl ? 12 : 1 } } }) };
  st.inst[d].mode = fl ? "adc" : "madc"; r = read(st, only);
  const blown = r.warn.some((w) => w.k === "fuse");
  if (!blown) PROBLEMS.push(d + ": fuse should blow");
  out.push(sc(only, st, V, [{ p: A }, { p: d + ".COM" }], "الغلط الأشهر", ["الأميتر على التوازي = قصر: مقاومته شبه صفر.", "التيار يكبر ويحترق الفيوز" + (fl ? "." : " (200 mA)."), "الأميتر يتوصل على التوالي دائمًا."], "FUSE", 6));
  out.push(card("خلاصة الملتيميتر", ["جهد: توازي · تيار: توالي · مقاومة: بدون مصدر", "COM للأسود دائمًا"]));
  return { id: "inst-" + d, key: fl ? "dmm-fluke" : "dmm-peak", out: fl ? "clab-inst-dmm-fluke" : "clab-inst-dmm-peak", label: name, scenes: out };
}

/* ---------------- function generator ---------------- */
function fg() {
  const only = ["fg", "sc", "d1"], VA = [300, 0, 1300, 975], VF = [0, 0, 640, 480], out = [card("مولّد الإشارة PINTEK FG-32", ["موجة جيبية لتجارب التيار المتردد"])];
  let st = { parts: {}, leads: [], inst: inst({ fg: { on: false, f: 1000, vpp: 10 } }) };
  out.push(sc(only, st, VF, [{ box: [16, 16, 452, 246] }], "PINTEK FG-32", ["شاشة التردد، وأزرار المدى والموجة، ومقابض التردد والسعة، والخرج تحت يمين."]));
  st = clone(st); st.inst.fg.on = true;
  out.push(sc(only, st, VF, [{ box: [32, 50, 160, 64] }, { box: [34, 120, 44, 40] }], "التشغيل والشاشة", ["زر POWER يشغّله، والشاشة تعرض التردد."], "1.000 kHz"));
  out.push(sc(only, st, VF, [{ box: [198, 70, 254, 32] }, { box: [94, 168, 68, 68] }], "التردد", ["اختر المدى من الأزرار (1، 10، 100، 1k …).", "ثم مقبض FREQUENCY يضبط الرقم داخل المدى."]));
  out.push(sc(only, st, VF, [{ box: [296, 180, 40, 44] }, { box: [212, 180, 40, 44] }], "السعة والإزاحة", ["AMPL يضبط السعة (Vpp).", "OFFSET يضيف جهد مستمر، وفي تجارب الكتيب يبقى على صفر."], "10 Vpp"));
  st = { parts: {}, leads: [["fg.out", "sc.1"], ["fg.com", "sc.1g"]], inst: inst({ fg: { on: true, f: 1000, vpp: 10 }, sc: { c1: { on: true, vd: 2 }, td: 2e-4 } }) };
  let a0 = S.mag(read(st, only).sc.c1.ac);
  out.push(sc(only, st, VA, [{ box: [368, 166, 86, 80] }, { p: "sc.1" }], "الخرج", ["الطرف الأحمر هو الإشارة، والأسود أرضي المولّد.", "على الأوسيلوسكوب بدون حمل: " + (2 * a0).toFixed(1) + " Vpp."], (2 * a0).toFixed(1) + " Vpp", 5.5));
  st = clone(st); st.parts = { "h:2:3": R(50, "RL") }; st.leads = [["fg.out", "t:2:3:0"], ["t:2:4:8", "fg.com"], ["sc.1", "t:2:3:2"], ["sc.1g", "t:2:4:6"]];
  const a1 = S.mag(read(st, only).sc.c1.ac); need("fg 50 ohm", a1 / a0, 0.5, 0.03);
  out.push(sc(only, st, VA, [{ s: "h:2:3" }, { p: "fg.out" }], "مقاومة الخرج 50 Ω", ["داخل المولّد 50 Ω على التوالي مع الخرج.", "مع حمل 50 Ω نص الجهد يضيع جوّا: " + (2 * a1).toFixed(1) + " Vpp بدل " + (2 * a0).toFixed(1) + ".", "لذلك نضبط السعة وهو موصول بالدائرة، ونقيس على طرفيه."], (2 * a1).toFixed(1) + " Vpp", 6.5));
  out.push(card("خلاصة المولّد", ["اضبط السعة والمولّد موصول بالدائرة", "الأسود هو الأرضي"]));
  return { id: "inst-fg", key: "fg", out: "clab-inst-fg", label: "مولّد الإشارة", scenes: out };
}

/* ---------------- oscilloscope ---------------- */
function scope() {
  const only = ["fg", "sc", "d1"], VS = [1040, 0, 560, 420], VA = [300, 0, 1300, 975], out = [card("راسم الإشارة PeakTech 1240", ["قناتين CH1 و CH2"])];
  const base = { parts: {}, leads: [["fg.out", "sc.1"], ["fg.com", "sc.1g"]], inst: inst({ fg: { on: true, f: 1000, vpp: 6 }, sc: { c1: { on: true, vd: 1 }, c2: { on: false }, td: 2e-4 } }) };
  out.push(sc(only, base, VS, [{ box: [1072, 28, 316, 214] }], "الشاشة", ["المحور الأفقي زمن، والعمودي جهد.", "كل مربّع (div) قيمته من المقابض تحت."], "1 V/div · 200 µs/div"));
  let st = clone(base); st.inst.sc.c1.vd = 2;
  out.push(sc(only, st, VS, [{ box: [1400, 160, 60, 50] }], "VOLTS/DIV", ["يكبّر أو يصغّر الموجة عموديًا.", "هنا 2 V/div: نفس الإشارة صارت أصغر."], "2 V/div", 5));
  st = clone(base); st.inst.sc.td = 5e-4;
  out.push(sc(only, st, VS, [{ box: [1510, 160, 60, 50] }], "SEC/DIV", ["يضغط أو يمدّ الموجة أفقيًا.", "هنا 500 µs/div: صار فيه دورات أكثر على الشاشة."], "500 µs/div", 5));
  st = clone(base); st.inst.sc.meas = true;
  out.push(sc(only, st, VS, [{ box: [1400, 34, 56, 24] }, { box: [1220, 28, 168, 50] }], "Measure", ["يعرض القيم على الشاشة: Vpp والمتوسط والتردد."], "Vpp · Freq", 5));
  st = clone(base); st.inst.sc.cur = true; st.inst.sc.x1 = 3.5; st.inst.sc.x2 = 8.5;
  out.push(sc(only, st, VS, [{ box: [1456, 34, 56, 24] }, { box: [1072, 190, 110, 50] }], "Cursor", ["خطين تحرّكهم بنفسك، والشاشة تكتب الفرق الزمني △x و 1/△x.", "نستخدمه لقياس الزمن الدوري وفرق الطور."], "△x = 1 ms", 5.5));
  st = { parts: { "h:2:3": R(1000, "R") }, leads: [["fg.out", "t:2:3:0"], ["t:2:4:8", "fg.com"], ["sc.1", "t:2:3:2"], ["sc.1g", "t:2:4:6"], ["sc.2", "t:2:3:1"], ["sc.2g", "t:2:4:7"]], inst: inst({ fg: { on: true, f: 1000, vpp: 6 }, sc: { c1: { on: true, vd: 1 }, c2: { on: true, vd: 1 }, td: 2e-4 } }) };
  out.push(sc(only, st, VA, [{ p: "sc.1g" }, { p: "sc.2g" }, { p: "fg.com" }], "المشبك الأسود", ["المشبك الأسود لكل مجس موصول بأرضي الجهاز، ومثله أسود المولّد.", "لذلك كل المشابك السوداء لازم تكون على نفس العقدة، وإلا تقصر جزء من الدائرة."], "", 6.5));
  out.push(card("خلاصة الأوسيلوسكوب", ["VOLTS/DIV للارتفاع · SEC/DIV للزمن", "المشابك السوداء على نقطة الأرضي فقط"]));
  return { id: "inst-sc", key: "scope", out: "clab-inst-scope", label: "راسم الإشارة", scenes: out };
}

/* ---------------- decade boxes ---------------- */
function boxes() {
  const only = ["rb", "lb", "cb"], V = [1180, 260, 420, 690], out = [card("صناديق المقاومات والملفات والمكثفات", ["تغيّر القيمة بالمقابض بدل ما تبدّل القطعة"])];
  let st = { parts: {}, leads: [], inst: inst({ rb: { d: [0, 0, 0, 0] }, lb: { d: [0, 0, 0] }, cb: { d: [0, 0] } }) };
  out.push(sc(only, st, V, [], "ثلاث صناديق", ["كل مقبض خانة: يضرب رقمه في القيمة المكتوبة تحته، وتنجمع الخانات."]));
  st = clone(st); st.inst.rb.d = [4, 7, 0, 0]; let v = S.rbValue(st.inst); need("rb", v, 4700, 0.001);
  out.push(sc(only, st, V, [{ box: [1206, 282, 378, 200] }], "صندوق المقاومات", ["4 × 1 kΩ + 7 × 100 Ω = 4.7 kΩ.", "القيمة الكاملة مكتوبة تحت يسار."], "R = " + S.si(v, "Ω"), 5.5));
  st = clone(st); st.inst.lb.d = [1, 7, 5]; v = S.lbValue(st.inst);
  out.push(sc(only, st, V, [{ box: [1206, 496, 378, 200] }], "صندوق الملفات", ["1 × 10 mH + 7 × 1 mH + 5 × 0.1 mH = " + S.si(v, "H") + "."], "L = " + S.si(v, "H"), 5.5));
  st = clone(st); st.inst.cb.d = [2, 2]; v = S.cbValue(st.inst);
  out.push(sc(only, st, V, [{ box: [1206, 710, 378, 200] }], "صندوق المكثفات", ["2 × 1 µF + 2 × 0.1 µF = " + S.si(v, "F") + "."], "C = " + S.si(v, "F"), 5.5));
  out.push(sc(only, st, V, [{ p: "rb.a" }, { p: "rb.b" }], "التوصيل", ["الصندوق قطعة بطرفين: الأحمر والأزرق، وتوصّله مثل أي قطعة على اللوحة."]));
  out.push(card("خلاصة الصناديق", ["القيمة = مجموع (رقم كل مقبض × المكتوب تحته)"]));
  return { id: "inst-boxes", key: "boxes", out: "clab-inst-boxes", label: "الصناديق", scenes: out };
}

const plans = {};
[ps(), dmm("d1"), dmm("d2"), fg(), scope(), boxes()].forEach((p) => { p.n = 0; plans[p.id] = p; });
if (PROBLEMS.length) { console.error(PROBLEMS.join("\n")); process.exitCode = 1; }
process.stdout.write(JSON.stringify(plans));
