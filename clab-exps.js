/* CircuitVision — Electric Circuits I Lab: the ten experiments of the department's lab manual,
   rewritten as steps on the virtual bench. Values (sources, resistors, tables) follow the manual.
   For each procedure:
     layouts: ready circuits on the board (used by «اعرض الحل», by the wiring check, and to compute the expected readings)
     fig:     the schematic (CV.draw grid format)
     tables:  rows of measured / calculated quantities; expected values come from the simulator
              (measured = the actual parts on the bench, calculated = nominal values), never typed by hand. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  var B = { k: "#151515", n: "#7a4a1d", r: "#d0312d", o: "#f08a1c", y: "#f2d21b", g: "#2f9e44", u: "#2463d6", v: "#7a3fa0", e: "#8a8a8a", w: "#f5f5f5", G: "#c9a227", S: "#c0c0c0" };
  var PIECES = {
    R100: { t: "R", v: 100 }, R220a: { t: "R", v: 220, n: "1" }, R220b: { t: "R", v: 220, n: "2" }, R470a: { t: "R", v: 470, n: "1" }, R470b: { t: "R", v: 470, n: "2" },
    R1ka: { t: "R", v: 1000, n: "1" }, R1kb: { t: "R", v: 1000, n: "2" }, R1k5: { t: "R", v: 1500 }, R2k2: { t: "R", v: 2200 }, R3k3: { t: "R", v: 3300 }, R10k: { t: "R", v: 10000 }, R100k: { t: "R", v: 100000 },
    Rc1: { t: "R", v: 470, tol: 0.05, bands: [B.y, B.v, B.n, B.G], name: "R1" }, Rc2: { t: "R", v: 1500, tol: 0.05, bands: [B.n, B.g, B.r, B.G], name: "R2" }, Rc3: { t: "R", v: 220, tol: 0.05, bands: [B.r, B.r, B.n, B.G], name: "R3" }
  };
  function kit(ids) { return ids.map(function (id) { var p = JSON.parse(JSON.stringify(PIECES[id])); p.id = id; return p; }); }
  function P(id, lb) { var p = JSON.parse(JSON.stringify(PIECES[id])); p.id = id; if (lb) p.lb = lb; return p; }
  var W = { t: "W", id: "W" };
  function mix(a, b) { var o = {}; [a, b].forEach(function (x) { Object.keys(x || {}).forEach(function (k) { o[k] = x[k]; }); }); return o; }
  function psOn(v, s) { var o = { ps: { on: true, m: { v: v, i: 0.5 } } }; if (s !== undefined) o.ps.s = { v: s, i: 0.5 }; return o; }

  /* ---------- schematics ---------- */
  function E(a, b, type, name, value, extra) { var e = { a: a, b: b, type: type, name: name || "", value: value }; Object.keys(extra || {}).forEach(function (k) { e[k] = extra[k]; }); return e; }
  function Wr(a, b) { return { a: a, b: b, type: "W" }; }
  function Am(a, b, label) { return { a: a, b: b, type: "W", am: true, label: label || "" }; }
  function Vs(a, b, name, text) { return { a: a, b: b, type: "V", name: name || "Vs", value: 0, vtext: text || "", plus: "a" }; }
  function Gen(a, b, name, text) { return { a: a, b: b, type: "V", gen: true, name: name || "vs", value: 0, vtext: text || "" }; }
  function fig(rows, cols, edges, extra) { var c = { rows: rows, cols: cols, edges: edges }; Object.keys(extra || {}).forEach(function (k) { c[k] = extra[k]; }); return c; }

  /* ---------- shared circuits ---------- */
  // bridge network of Lab 4/5 circuit 1: a = t1,3 · b = t2,2 · c = t2,4 · ground = t3,3 (the same placement serves the Δ of Lab 3)
  function bridgeParts(ab, ac, bc, bg, cg) {
    var p = {}; p["h:1:2"] = ab; p["v:1:2"] = W; p["h:1:3"] = ac; p["v:1:4"] = W; p["h:2:2"] = bc; p["h:2:3"] = W; p["v:2:2"] = bg; p["h:3:2"] = W; p["v:2:4"] = cg; p["h:3:3"] = W; return p;
  }
  // ladder of Lab 4/5 circuit 2: s = t1,1 · a = t1,2 · b = t1,3 · c = t1,4 · ground row t3 · R7 over the top (row 0)
  function ladderParts() {
    return { "h:1:1": P("R1ka", "R1"), "v:1:2": P("R2k2", "R2"), "v:2:2": W, "h:1:2": P("R470a", "R3"), "v:1:3": P("R1k5", "R4"), "v:2:3": W, "h:1:3": P("R100", "R5"), "v:1:4": P("R220a", "R6"), "v:2:4": W,
      "v:0:2": W, "h:0:2": P("R3k3", "R7"), "h:0:3": W, "v:0:4": W, "h:3:2": W, "h:3:3": W };
  }
  var LADDER_FIG = fig(4, 4, [Vs([3, 0], [1, 0], "Vs", "30 V"), E([1, 0], [1, 1], "R", "R1", 1000), E([1, 1], [1, 2], "R", "R3", 470), E([1, 2], [1, 3], "R", "R5", 100),
    E([1, 1], [3, 1], "R", "R2", 2200), E([1, 2], [3, 2], "R", "R4", 1500), E([1, 3], [3, 3], "R", "R6", 220), Wr([3, 0], [3, 3]),
    Wr([1, 1], [0, 1]), E([0, 1], [0, 2], "R", "R7", 3300), Wr([0, 2], [0, 3]), Wr([0, 3], [1, 3])],
    { nodeLabels: [{ at: [1, 1], text: "a" }, { at: [1, 2], text: "b" }, { at: [1, 3], text: "c" }] });

  var BRIDGE_FIG = fig(3, 4, [Vs([2, 0], [0, 0], "Vs", "15 V"), Wr([0, 0], [0, 1]), Wr([0, 1], [0, 3]), E([0, 1], [1, 1], "R", "R1", 470), E([0, 3], [1, 3], "R", "R2", 220), E([1, 1], [1, 2], "R", "R5", 1000), Wr([1, 2], [1, 3]),
    E([1, 1], [2, 1], "R", "R3", 1000), E([1, 3], [2, 3], "R", "R4", 220), Wr([2, 0], [2, 1]), Wr([2, 1], [2, 3])], { nodeLabels: [{ at: [0, 1], text: "a" }, { at: [1, 1], text: "b" }, { at: [1, 3], text: "c" }], showGround: true, ground: [2, 1] });

  var EXPS = [
  /* ================= Lab 1 ================= */
  { id: "exp1", n: 1, en: "Resistors, Current and Voltage Measurements, and Ohm's Law", title: "المقاومات وقياس التيار والجهد وقانون أوم",
    objective: ["التعرف على الأجهزة: مصدر الجهد المستمر، الملتيميتر، صندوق المقاومات العشري.", "قراءة قيمة المقاومة من ألوانها وقياسها بالأوميتر.", "التحقق من قانون أوم V = IR."],
    equipment: ["مصدر جهد مستمر", "ملتيميتران رقميان", "صندوق مقاومات عشري", "ثلاث مقاومات ملوّنة", "مقاومات 100 Ω و 220 Ω و 470 Ω و 1 kΩ و 1.5 kΩ"],
    inst: ["ps", "d1", "d2", "rb"], kit: kit(["Rc1", "Rc2", "Rc3", "R100", "R220a", "R470a", "R1ka", "R1k5"]),
    theory: [
      "المقاومة الصغيرة تُكتب قيمتها بحلقات ملونة: أول حلقتين أرقام، والثالثة المضاعِف (عدد الأصفار)، والرابعة التفاوت: ذهبي ±5%، فضي ±10%، وبدونها ±20%.",
      "الأرقام: أسود 0، بني 1، أحمر 2، برتقالي 3، أصفر 4، أخضر 5، أزرق 6، بنفسجي 7، رمادي 8، أبيض 9. والتفاوت الأخضر ±0.5%.",
      "الفولتميتر يتوصل <b>على التوازي</b> مع العنصر، والأميتر يتوصل <b>على التوالي</b> في المسار بعد ما تفتحه. مدخل التيار في الملتيميتر مقاومته شبه صفر.",
      "الأوميتر يقيس على مقاومة <b>مفصولة</b> عن أي مصدر."
    ],
    prelab: [
      { q: "حدّد القيمة والتفاوت لكل مقاومة من ألوانها.", fields: [
        { label: "أصفر، بنفسجي، أسود", ans: 47, unit: "Ω" }, { label: "تفاوتها", ans: 20, unit: "%" },
        { label: "برتقالي، أحمر، بني، أخضر", ans: 320, unit: "Ω" }, { label: "تفاوتها", ans: 0.5, unit: "%" },
        { label: "أخضر، أزرق، أحمر، ذهبي", ans: 5600, unit: "Ω" }, { label: "تفاوتها", ans: 5, unit: "%" },
        { label: "أحمر، أصفر، برتقالي، ذهبي", ans: 24000, unit: "Ω" }, { label: "تفاوتها", ans: 5, unit: "%" },
        { label: "أزرق، رمادي، أصفر، فضي", ans: 680000, unit: "Ω" }, { label: "تفاوتها", ans: 10, unit: "%" }] },
      { q: "قانون أوم مع اصطلاح الإشارة السالبة للعنصر الخامل: أوجد المجهول.", fields: [
        { label: "v = 10 V و i = 2 A ← R", ans: 5, unit: "Ω" }, { label: "i = 40 mA و R = 4 kΩ ← v", ans: 160, unit: "V" }, { label: "v = 16 V و R = 64 Ω ← i", ans: 0.25, unit: "A" }] }
    ],
    procs: [
      { id: "p1", title: "الإجراء 1: قياس المقاومة",
        steps: ["على الطاولة ثلاث مقاومات ملوّنة R1 و R2 و R3. اقرأ قيمة كل واحدة من ألوانها.", "ركّب المقاومة على اللوحة لحالها (بدون مصدر)، وصِل الملتيميتر: سلك في VΩ وسلك في COM على طرفيها.", "حوّل المفتاح على Ω واقرأ القيمة. كرر للثلاث.", "احسب نسبة الخطأ بين القيمتين: أيهما أدق؟"],
        layouts: [{ id: "L1", name: "قياس R1", parts: { "h:2:3": P("Rc1") }, leads: [["d1.V", "t:2:3:3"], ["d1.COM", "t:2:4:5"]], set: { d1: { mode: "ohm" } } }],
        tables: [{ title: "الجدول 1.2", kind: "mc", meas: "قراءة الأوميتر", calc: "من الألوان", rows: [
          { label: "R1", q: ["act", "Rc1"], unit: "Ω" }, { label: "R2", q: ["act", "Rc2"], unit: "Ω" }, { label: "R3", q: ["act", "Rc3"], unit: "Ω" }] }] },
      { id: "p2", title: "الإجراء 2: التحقق من قانون أوم (R = 100 Ω)",
        steps: ["ركّب المقاومة 100 Ω. صِل: + المصدر ← مدخل A في الملتيميتر الأول، و COM ← طرف المقاومة، والطرف الثاني ← − المصدر.", "صِل الملتيميتر الثاني على طرفي المقاومة (VΩ و COM) واجعله على V⎓، والأول على A⎓.", "ابدأ من 0 V وارفع الجهد 1 V كل مرة حتى 10 V. اقرأ التيار I والجهد U في كل خطوة.", "لا تغيّر مدى الملتيميتر أثناء القياس."],
        fig: fig(2, 3, [Vs([1, 0], [0, 0], "Vs"), Am([0, 0], [0, 1], "I"), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "R", "R", 100), Wr([1, 2], [1, 0])]),
        layouts: [{ id: "L1", name: "R = 100 Ω", parts: { "h:2:3": P("R100", "R") }, leads: [["ps.m+", "d1.A"], ["d1.COM", "t:2:3:3"], ["t:2:4:5", "ps.m-"], ["d2.V", "t:2:3:1"], ["d2.COM", "t:2:4:1"]],
          set: mix(psOn(1), { d1: { mode: "adc" }, d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 1.3 (R = 100 Ω)", kind: "pair", a: "I (mA)", b: "U (V)", plot: { x: "a", y: "b", xl: "I (mA)", yl: "U (V)" },
          rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (v) { return { label: "Vs = " + v + " V", set: { ps: { m: { v: v } } }, qa: ["I", "R"], ua: "mA", qb: ["V", "R"], ub: "V" }; }) }] },
      { id: "p2b", title: "الإجراء 2 (تابع): نفس القياس مع R = 1 kΩ",
        steps: ["بدّل المقاومة بـ 1 kΩ، وكرر من 1 V إلى 10 V.", "ارسم U مقابل I للمقاومتين: ما العلاقة؟ وما معنى الميل؟"],
        layouts: [{ id: "L1", name: "R = 1 kΩ", parts: { "h:2:3": P("R1ka", "R") }, leads: [["ps.m+", "d1.A"], ["d1.COM", "t:2:3:3"], ["t:2:4:5", "ps.m-"], ["d2.V", "t:2:3:1"], ["d2.COM", "t:2:4:1"]],
          set: mix(psOn(1), { d1: { mode: "adc" }, d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 1.3 (R = 1 kΩ)", kind: "pair", a: "I (mA)", b: "U (V)", plot: { x: "a", y: "b", xl: "I (mA)", yl: "U (V)" },
          rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (v) { return { label: "Vs = " + v + " V", set: { ps: { m: { v: v } } }, qa: ["I", "R"], ua: "mA", qb: ["V", "R"], ub: "V" }; }) }] },
      { id: "p3", title: "الإجراء 3: ثلاث دوائر",
        steps: ["الدائرة 1: V = 15 V و I = 15 mA. احسب R واختر القطعة المناسبة، ثم قِس I.", "الدائرة 2: I = 40 mA و R = 200 Ω (اضبطها من صندوق المقاومات). احسب V واضبطه، ثم قِس V على المقاومة.", "الدائرة 3: V = 15 V و R = 220 Ω. احسب I ثم قِسه."],
        layouts: [
          { id: "C1", name: "الدائرة 1", parts: { "h:2:3": P("R1ka", "R") }, leads: [["ps.m+", "d1.A"], ["d1.COM", "t:2:3:3"], ["t:2:4:5", "ps.m-"]], set: mix(psOn(15), { d1: { mode: "adc" } }) },
          { id: "C2", name: "الدائرة 2", parts: {}, lbl: { rb: "R" }, leads: [["ps.m+", "rb.a"], ["rb.b", "ps.m-"], ["d2.V", "rb.a"], ["d2.COM", "rb.b"]], set: mix(psOn(8), { rb: { d: [0, 2, 0, 0] }, d2: { mode: "vdc" } }) },
          { id: "C3", name: "الدائرة 3", parts: { "h:2:3": P("R220a", "R") }, leads: [["ps.m+", "d1.A"], ["d1.COM", "t:2:3:3"], ["t:2:4:5", "ps.m-"]], set: mix(psOn(15), { d1: { mode: "adc" } }) }],
        tables: [{ title: "النتائج", kind: "mc", meas: "المقاس", calc: "المحسوب", rows: [
          { label: "الدائرة 1: I (والمحسوب R = 1 kΩ)", L: "C1", q: ["I", "R"], unit: "mA" },
          { label: "الدائرة 2: V", L: "C2", q: ["V", "R"], unit: "V" },
          { label: "الدائرة 3: I", L: "C3", q: ["I", "R"], unit: "mA" }] }] }
    ] },

  /* ================= Lab 2 ================= */
  { id: "exp2", n: 2, en: "Verification of Kirchhoff's Voltage Law (KVL) and Current Law (KCL)", title: "التحقق من قانوني كيرشوف للجهد والتيار",
    objective: ["التحقق من قانون كيرشوف للتيار KCL.", "التحقق من قانون كيرشوف للجهد KVL."],
    equipment: ["مصدر جهد مستمر", "ملتيميتران رقميان", "مقاومات 100 Ω و 220 Ω و 470 Ω و 1 kΩ و 1.5 kΩ"],
    inst: ["ps", "d1", "d2"], kit: kit(["R100", "R220a", "R470a", "R470b", "R1ka", "R1k5"]),
    theory: ["KCL: مجموع التيارات الداخلة إلى أي عقدة = مجموع الخارجة منها.", "KVL: مجموع الجهود حول أي مسار مغلق = صفر؛ أي جهد المصدر = مجموع هبوط الجهد على المقاومات في دائرة التوالي.", "في التوالي يمر نفس التيار في كل المقاومات، وأكبر مقاومة يقع عليها أكبر جهد. وفي التوازي نفس الجهد على الفروع، وأصغر مقاومة يمر فيها أكبر تيار."],
    prelab: [
      { q: "دائرة توالي: R1 = 100 Ω و R2 = 220 Ω و R3 = 1 kΩ، والتيار I = 10 mA. احسب جهد كل مقاومة وجهد المصدر.", fields: [{ label: "V1", ans: 1, unit: "V" }, { label: "V2", ans: 2.2, unit: "V" }, { label: "V3", ans: 10, unit: "V" }, { label: "Vs = V1 + V2 + V3", ans: 13.2, unit: "V" }] },
      { q: "دائرة توازي: Vs = 30 V على R1 = 1.5 kΩ و R2 = 1 kΩ. احسب التيارات.", fields: [{ label: "I1", ans: 20, unit: "mA" }, { label: "I2", ans: 30, unit: "mA" }, { label: "I = I1 + I2", ans: 50, unit: "mA" }] }
    ],
    procs: [
      { id: "p1", title: "الإجراء 1: قانون كيرشوف للجهد (KVL)",
        steps: ["ركّب R1 = 100 Ω و R2 = 220 Ω و R3 = 1 kΩ على التوالي، مع أميتر في المسار.", "اضبط جهد المصدر حتى يقرأ الأميتر I = 10 mA (تقريبًا 13.2 V).", "قِس V1 و V2 و V3 بالفولتميتر واحدة واحدة، ثم قِس Vs.", "قارن مجموع الجهود بجهد المصدر. على أي مقاومة أكبر هبوط؟"],
        fig: fig(2, 4, [Vs([1, 0], [0, 0], "Vs"), Am([0, 0], [0, 1], "I"), E([0, 1], [0, 2], "R", "R1", 100), E([0, 2], [0, 3], "R", "R2", 220), E([0, 3], [1, 3], "R", "R3", 1000), Wr([1, 3], [1, 0])]),
        layouts: [{ id: "L1", name: "توالي", parts: { "h:2:2": P("R100", "R1"), "h:2:3": P("R220a", "R2"), "h:2:4": P("R1ka", "R3") }, leads: [["ps.m+", "d1.A"], ["d1.COM", "t:2:2:3"], ["t:2:5:5", "ps.m-"], ["d2.V", "t:2:2:1"], ["d2.COM", "t:2:3:1"]],
          set: mix(psOn(13.2), { d1: { mode: "adc" }, d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 2.1", kind: "mc", meas: "المقاس (V)", calc: "المحسوب (V)", rows: [
          { label: "V1 على R1 = 100 Ω", q: ["V", "R1"], unit: "V" }, { label: "V2 على R2 = 220 Ω", q: ["V", "R2"], unit: "V" }, { label: "V3 على R3 = 1 kΩ", q: ["V", "R3"], unit: "V" },
          { label: "المجموع V1 + V2 + V3", sum: [0, 1, 2], unit: "V" }, { label: "جهد المصدر Vs", q: ["Vt", "ps.m+", "ps.m-"], unit: "V" }] }] },
      { id: "p2", title: "الإجراء 2: قانون كيرشوف للتيار (KCL)",
        steps: ["ركّب R1 = 1.5 kΩ و R2 = 1 kΩ على التوازي.", "المصدر 30 V أكبر من حد القناة الواحدة (16 V): صِل القناتين على التوالي (− MASTER إلى + SLAVE) واضبط كل واحدة 15 V.", "قِس التيار الكلي I، ثم I1 في فرع R1، ثم I2 في فرع R2 (الأميتر على التوالي في كل فرع).", "قارن I بمجموع I1 + I2. أي فرع تياره أكبر؟"],
        fig: fig(2, 3, [Vs([1, 0], [0, 0], "Vs", "30 V"), Am([0, 0], [0, 1], "I"), E([0, 1], [1, 1], "R", "R1", 1500), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "R", "R2", 1000), Wr([1, 2], [1, 0])]),
        layouts: [{ id: "L1", name: "توازي", parts: { "v:1:2": P("R1k5", "R1"), "h:1:2": W, "v:1:3": P("R1ka", "R2"), "h:2:2": W },
          leads: [["ps.m+", "d1.A"], ["d1.COM", "t:1:2:3"], ["ps.m-", "ps.s+"], ["ps.s-", "t:2:2:6"]], set: mix(psOn(15, 15), { d1: { mode: "adc" } }) }],
        tables: [{ title: "الجدول 2.2", kind: "mc", meas: "المقاس (mA)", calc: "المحسوب (mA)", rows: [
          { label: "I1 في R1 = 1.5 kΩ", q: ["I", "R1"], unit: "mA" }, { label: "I2 في R2 = 1 kΩ", q: ["I", "R2"], unit: "mA" }, { label: "المجموع I1 + I2", sum: [0, 1], unit: "mA" },
          { label: "تيار المصدر I", q: ["Ips", "m"], unit: "mA" }] }] },
      { id: "p3", title: "الإجراء 3: KVL و KCL في دائرة واحدة",
        steps: ["Vs = 15 V، R1 = 220 Ω، R2 = 100 Ω، R3 = 470 Ω، R4 = 470 Ω: ركّب الدائرة كما في الشكل.", "قِس IT و I1 و I2 و I3 و I4 (الأميتر في كل مرة على التوالي في الفرع)، ثم جهد كل مقاومة.", "تحقق: IT = I1 + I2 و I2 = I3 + I4، وطبّق KVL على الحلقة الوسطى."],
        fig: fig(2, 5, [Vs([1, 0], [0, 0], "Vs", "15 V"), Am([0, 0], [0, 1], "IT"), E([0, 1], [1, 1], "R", "R1", 220), E([0, 1], [0, 2], "R", "R2", 100), E([0, 2], [1, 2], "R", "R3", 470), Wr([0, 2], [0, 3]), E([0, 3], [1, 3], "R", "R4", 470), Wr([1, 3], [1, 0])]),
        layouts: [{ id: "L1", name: "الدائرة", parts: { "v:1:2": P("R220a", "R1"), "v:2:2": W, "h:1:2": P("R100", "R2"), "v:1:3": P("R470a", "R3"), "v:2:3": W, "h:1:3": W, "v:1:4": P("R470b", "R4"), "v:2:4": W, "h:3:2": W, "h:3:3": W },
          leads: [["ps.m+", "d1.A"], ["d1.COM", "t:1:2:0"], ["ps.m-", "t:3:2:6"]], set: mix(psOn(15), { d1: { mode: "adc" } }) }],
        tables: [{ title: "التيارات والجهود", kind: "mc", meas: "المقاس", calc: "المحسوب", rows: [
          { label: "IT", q: ["Ips", "m"], unit: "mA" }, { label: "I1", q: ["I", "R1"], unit: "mA" }, { label: "I2", q: ["I", "R2"], unit: "mA" }, { label: "I3", q: ["I", "R3"], unit: "mA" }, { label: "I4", q: ["I", "R4"], unit: "mA" },
          { label: "VR1", q: ["V", "R1"], unit: "V" }, { label: "VR2", q: ["V", "R2"], unit: "V" }, { label: "VR3", q: ["V", "R3"], unit: "V" }, { label: "VR4", q: ["V", "R4"], unit: "V" }] }] }
    ] },

  /* ================= Lab 3 ================= */
  { id: "exp3", n: 3, en: "Current Divider, Voltage Divider and Δ-Y Transformations", title: "مقسّم التيار ومقسّم الجهد وتحويل Δ-Y",
    objective: ["التحقق من قاعدة مقسّم الجهد، وأثر الحمل عليه.", "التحقق من قاعدة مقسّم التيار.", "التحقق من تحويل Δ-Y."],
    equipment: ["مصدر جهد مستمر", "ملتيميتران رقميان", "مقاومات 100 Ω و 220 Ω و 470 Ω و 1 kΩ و 10 kΩ"],
    inst: ["ps", "d1", "d2"], kit: kit(["R100", "R220a", "R220b", "R470a", "R1ka", "R10k"]),
    theory: ["مقسّم الجهد: Vo = Vs · R2 / (R1 + R2). لو وصلت حملًا RL على R2 تصير R2 ∥ RL أصغر، فينزل Vo.", "مقسّم التيار: I1 = I · R2 / (R1 + R2) و I2 = I · R1 / (R1 + R2): التيار الأكبر في المقاومة الأصغر.", "Δ إلى Y: Ra = Rab·Rac / (Rab + Rbc + Rac)، وبالمثل لكل طرف: حاصل ضرب المقاومتين المتصلتين بالطرف ÷ مجموع الثلاث."],
    prelab: [
      { q: "مقسّم الجهد: Vs = 10 V، R1 = 100 Ω، R2 = 220 Ω.", fields: [{ label: "Vo بدون حمل", ans: 6.875, unit: "V" }, { label: "Vo مع RL = 470 Ω", ans: 5.998, unit: "V" }] },
      { q: "مقسّم التيار: I = 145.45 mA، R1 = 100 Ω، R2 = 220 Ω.", fields: [{ label: "I1", ans: 100, unit: "mA" }, { label: "I2", ans: 45.45, unit: "mA" }] },
      { q: "حوّل Δ (Rab = 470 Ω، Rac = 220 Ω، Rbc = 10 kΩ) إلى Y، ثم أوجد التيار من المصدر 15 V (Rbd = 1 kΩ و Rcd = 220 Ω).", fields: [{ label: "Ra", ans: 9.672, unit: "Ω" }, { label: "Rb", ans: 439.7, unit: "Ω" }, { label: "Rc", ans: 205.8, unit: "Ω" }, { label: "I", L: "p3/L1", q: ["Ips", "m"], unit: "mA" }] }
    ],
    procs: [
      { id: "p1", title: "الإجراء 1: مقسّم الجهد",
        steps: ["ركّب R1 = 100 Ω و R2 = 220 Ω على التوالي، Vs = 10 V، وقِس Vo على R2 (بدون حمل).", "وصّل حملًا RL = 470 Ω على التوازي مع R2، وقِس Vo.", "بدّل الحمل بـ RL = 220 Ω وقِس Vo. ماذا يفعل الحمل بالجهد؟"],
        fig: fig(2, 3, [Vs([1, 0], [0, 0], "Vs", "10 V"), E([0, 0], [0, 1], "R", "R1", 100), E([0, 1], [1, 1], "R", "R2", 220, { vlabel: "Vo" }), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "R", "RL", 470), Wr([1, 2], [1, 0])]),
        layouts: [
          { id: "L0", name: "بدون حمل", parts: { "h:1:2": P("R100", "R1"), "v:1:3": P("R220a", "R2"), "h:2:2": W }, leads: [["ps.m+", "t:1:2:3"], ["ps.m-", "t:2:2:6"], ["d2.V", "t:1:3:5"], ["d2.COM", "t:2:3:5"]], set: mix(psOn(10), { d2: { mode: "vdc" } }) },
          { id: "L1", name: "RL = 470 Ω", parts: { "h:1:2": P("R100", "R1"), "v:1:3": P("R220a", "R2"), "h:2:2": W, "h:1:3": W, "v:1:4": P("R470a", "RL"), "h:2:3": W }, leads: [["ps.m+", "t:1:2:3"], ["ps.m-", "t:2:2:6"], ["d2.V", "t:1:3:5"], ["d2.COM", "t:2:3:5"]], set: mix(psOn(10), { d2: { mode: "vdc" } }) },
          { id: "L2", name: "RL = 220 Ω", parts: { "h:1:2": P("R100", "R1"), "v:1:3": P("R220a", "R2"), "h:2:2": W, "h:1:3": W, "v:1:4": P("R220b", "RL"), "h:2:3": W }, leads: [["ps.m+", "t:1:2:3"], ["ps.m-", "t:2:2:6"], ["d2.V", "t:1:3:5"], ["d2.COM", "t:2:3:5"]], set: mix(psOn(10), { d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 3.1", kind: "mc", meas: "Vo المقاس (V)", calc: "Vo المحسوب (V)", rows: [
          { label: "بدون حمل", L: "L0", q: ["V", "R2"], unit: "V" }, { label: "RL = 470 Ω", L: "L1", q: ["V", "R2"], unit: "V" }, { label: "RL = 220 Ω", L: "L2", q: ["V", "R2"], unit: "V" }] }] },
      { id: "p2", title: "الإجراء 2: مقسّم التيار",
        steps: ["ركّب R1 = 100 Ω و R2 = 220 Ω على التوازي، و Vs = 10 V.", "قِس I من المصدر، ثم I1 و I2 (الأميتر على التوالي في كل فرع).", "قارن بقاعدة مقسّم التيار."],
        fig: fig(2, 3, [Vs([1, 0], [0, 0], "Vs", "10 V"), Am([0, 0], [0, 1], "I"), E([0, 1], [1, 1], "R", "R1", 100), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "R", "R2", 220), Wr([1, 2], [1, 0])]),
        layouts: [{ id: "L1", name: "توازي", parts: { "v:1:2": P("R100", "R1"), "h:1:2": W, "v:1:3": P("R220a", "R2"), "h:2:2": W }, leads: [["ps.m+", "d1.A"], ["d1.COM", "t:1:2:3"], ["ps.m-", "t:2:2:6"]], set: mix(psOn(10), { d1: { mode: "adc" } }) }],
        tables: [{ title: "الجدول 3.2", kind: "mc", meas: "المقاس (mA)", calc: "المحسوب (mA)", rows: [
          { label: "I من المصدر", q: ["Ips", "m"], unit: "mA" }, { label: "I1 في R1 = 100 Ω", q: ["I", "R1"], unit: "mA" }, { label: "I2 في R2 = 220 Ω", q: ["I", "R2"], unit: "mA" }] }] },
      { id: "p3", title: "الإجراء 3: دائرة Δ",
        steps: ["ركّب الدائرة: Rab = 470 Ω، Rac = 220 Ω، Rbc = 10 kΩ، Rbd = 1 kΩ، Rcd = 220 Ω، والمصدر 15 V بين a و d.", "قِس التيار I من المصدر، وقارنه بالمحسوب من تحويل Δ-Y في التحضير."],
        fig: fig(3, 4, [Vs([2, 0], [0, 0], "Vs", "15 V"), Am([0, 0], [0, 1], "I"), Wr([0, 1], [0, 3]), E([0, 1], [1, 1], "R", "Rab", 470), E([0, 3], [1, 3], "R", "Rac", 220), E([1, 1], [1, 3], "R", "Rbc", 10000),
          E([1, 1], [2, 1], "R", "Rbd", 1000), E([1, 3], [2, 3], "R", "Rcd", 220), Wr([2, 0], [2, 1]), Wr([2, 1], [2, 3])], { nodeLabels: [{ at: [0, 1], text: "a" }, { at: [1, 1], text: "b" }, { at: [1, 3], text: "c" }, { at: [2, 1], text: "d" }] }),
        layouts: [{ id: "L1", name: "دائرة Δ", parts: bridgeParts(P("R470a", "Rab"), P("R220a", "Rac"), P("R10k", "Rbc"), P("R1ka", "Rbd"), P("R220b", "Rcd")),
          leads: [["ps.m+", "d1.A"], ["d1.COM", "t:1:3:1"], ["ps.m-", "t:3:3:7"]], set: mix(psOn(15), { d1: { mode: "adc" } }), nodes: { a: "t:1:3", b: "t:2:2", c: "t:2:4", d: "t:3:3" } }],
        tables: [{ title: "التيار", kind: "mc", meas: "المقاس (mA)", calc: "المحسوب (mA)", rows: [{ label: "I من المصدر", q: ["Ips", "m"], unit: "mA" }] }] }
    ] },

  /* ================= Lab 4 ================= */
  { id: "exp4", n: 4, en: "Verification of Nodal Analysis", title: "التحقق من تحليل العقد (Nodal Analysis)",
    objective: ["إيجاد جهود العقد بتحليل العقد.", "مقارنة الجهود المقاسة بالمحسوبة."],
    equipment: ["مصدر جهد مستمر", "ملتيميتران رقميان", "مقاومات 100 Ω و 220 Ω و 470 Ω و 1 kΩ و 1.5 kΩ و 2.2 kΩ و 3.3 kΩ"],
    inst: ["ps", "d1", "d2"], kit: kit(["R100", "R220a", "R220b", "R470a", "R1ka", "R1kb", "R1k5", "R2k2", "R3k3"]),
    theory: ["اختر عقدة مرجعية (الأرضي) واكتب KCL عند كل عقدة أساسية بدلالة جهود العقد: مجموع (Vk − Vj)/R الخارجة = 0.", "جهد العقدة يُقاس بين العقدة والمرجع: سلك COM على المرجع والآخر على العقدة.", "جهد أي مقاومة = فرق جهدي طرفيها."],
    prelab: [{ q: "للدائرة 2 (Vs = 30 V، R1 = 1 kΩ، R2 = 2.2 kΩ، R3 = 470 Ω، R4 = 1.5 kΩ، R5 = 100 Ω، R6 = 220 Ω، R7 = 3.3 kΩ): أوجد جهود العقد.", fields: [
      { label: "Va", L: "p2/L1", q: ["N", "a"], unit: "V" }, { label: "Vb", L: "p2/L1", q: ["N", "b"], unit: "V" }, { label: "Vc", L: "p2/L1", q: ["N", "c"], unit: "V" }, { label: "VR7", L: "p2/L1", q: ["V", "R7"], unit: "V" }] }],
    procs: [
      { id: "p1", title: "الإجراء 1: الدائرة 1",
        steps: ["Vs = 15 V، R1 = 470 Ω، R2 = 220 Ω، R3 = 1 kΩ، R4 = 220 Ω، R5 = 1 kΩ. ركّب الدائرة: R1 من a إلى b، R2 من a إلى c، R5 من b إلى c، R3 من b إلى الأرضي، R4 من c إلى الأرضي.", "قِس جهود العقد a و b و c بالنسبة للأرضي.", "قِس VR5 مباشرة، واحسبه من Vb − Vc وقارن."],
        fig: BRIDGE_FIG,
        layouts: [{ id: "L1", name: "الدائرة 1", parts: bridgeParts(P("R470a", "R1"), P("R220a", "R2"), P("R1ka", "R5"), P("R1kb", "R3"), P("R220b", "R4")),
          leads: [["ps.m+", "t:1:3:1"], ["ps.m-", "t:3:3:7"], ["d2.COM", "t:3:3:6"], ["d2.V", "t:2:2:0"]], set: mix(psOn(15), { d2: { mode: "vdc" } }), nodes: { a: "t:1:3", b: "t:2:2", c: "t:2:4", gnd: "t:3:3" } }],
        tables: [{ title: "الجدول 4.1", kind: "mc", meas: "المقاس (V)", calc: "المحسوب (V)", rows: [
          { label: "Va", q: ["N", "a"], unit: "V" }, { label: "Vb", q: ["N", "b"], unit: "V" }, { label: "Vc", q: ["N", "c"], unit: "V" }, { label: "VR5 (مقاس مباشرة)", q: ["V", "R5"], unit: "V" }] }] },
      { id: "p2", title: "الإجراء 2: الدائرة 2",
        steps: ["Vs = 30 V (القناتان على التوالي: − MASTER إلى + SLAVE، كل واحدة 15 V).", "R1 من المصدر إلى a، R2 من a إلى الأرضي، R3 من a إلى b، R4 من b إلى الأرضي، R5 من b إلى c، R6 من c إلى الأرضي، و R7 من a إلى c فوق الدائرة.", "قِس Va و Vb و Vc و VR7 وقارنها بالتحضير."],
        fig: LADDER_FIG,
        layouts: [{ id: "L1", name: "الدائرة 2", parts: ladderParts(), leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "ps.s+"], ["ps.s-", "t:3:2:6"], ["d2.COM", "t:3:3:6"], ["d2.V", "t:1:2:1"]],
          set: mix(psOn(15, 15), { d2: { mode: "vdc" } }), nodes: { a: "t:1:2", b: "t:1:3", c: "t:1:4", gnd: "t:3:2" } }],
        tables: [{ title: "الجدول 4.3", kind: "mc", meas: "المقاس (V)", calc: "المحسوب (V)", rows: [
          { label: "Va", q: ["N", "a"], unit: "V" }, { label: "Vb", q: ["N", "b"], unit: "V" }, { label: "Vc", q: ["N", "c"], unit: "V" }, { label: "VR7", q: ["V", "R7"], unit: "V" }] }] }
    ] },

  /* ================= Lab 5 ================= */
  { id: "exp5", n: 5, en: "Verification of Mesh Analysis", title: "التحقق من تحليل الحلقات (Mesh Analysis)",
    objective: ["إيجاد التيارات بتحليل الحلقات.", "مقارنة تيارات الفروع المقاسة بالمحسوبة."],
    equipment: ["مصدر جهد مستمر", "ملتيميتران رقميان", "مقاومات 100 Ω و 220 Ω و 470 Ω و 1 kΩ و 1.5 kΩ و 2.2 kΩ و 3.3 kΩ"],
    inst: ["ps", "d1", "d2"], kit: kit(["R100", "R220a", "R220b", "R470a", "R1ka", "R1kb", "R1k5", "R2k2", "R3k3"]),
    theory: ["عرّف تيار حلقة لكل حلقة مستقلة (مع عقارب الساعة) واكتب KVL حولها.", "تيار الفرع المشترك بين حلقتين = الفرق بين تياريهما.", "لقياس تيار فرع: افتح الفرع وضع الأميتر على التوالي (مدخل A و COM)."],
    prelab: [{ q: "للدائرة 1 (Vs = 15 V، R1 = 470 Ω، R2 = 220 Ω، R3 = 1 kΩ، R4 = 220 Ω، R5 = 1 kΩ): أوجد تيارات المقاومات.", fields: [
      { label: "IR1", L: "p1/L1", q: ["I", "R1"], unit: "mA" }, { label: "IR2", L: "p1/L1", q: ["I", "R2"], unit: "mA" }, { label: "IR3", L: "p1/L1", q: ["I", "R3"], unit: "mA" }, { label: "IR4", L: "p1/L1", q: ["I", "R4"], unit: "mA" }, { label: "IR5", L: "p1/L1", q: ["I", "R5"], unit: "mA" }, { label: "Is", L: "p1/L1", q: ["Ips", "m"], unit: "mA" }] }],
    procs: [
      { id: "p1", title: "الإجراء 1: الدائرة 1",
        steps: ["نفس الدائرة 1 في التجربة 4. ركّبها.", "قِس تيار كل مقاومة وتيار المصدر: افتح الفرع وضع الأميتر.", "قارن بالمحسوب من تحليل الحلقات."],
        fig: BRIDGE_FIG,
        layouts: [{ id: "L1", name: "الدائرة 1", parts: bridgeParts(P("R470a", "R1"), P("R220a", "R2"), P("R1ka", "R5"), P("R1kb", "R3"), P("R220b", "R4")),
          leads: [["ps.m+", "d1.A"], ["d1.COM", "t:1:3:1"], ["ps.m-", "t:3:3:7"]], set: mix(psOn(15), { d1: { mode: "adc" } }), nodes: { a: "t:1:3", b: "t:2:2", c: "t:2:4", gnd: "t:3:3" } }],
        tables: [{ title: "تيارات الفروع", kind: "mc", meas: "المقاس (mA)", calc: "المحسوب (mA)", rows: [
          { label: "Is", q: ["Ips", "m"], unit: "mA" }, { label: "IR1", q: ["I", "R1"], unit: "mA" }, { label: "IR2", q: ["I", "R2"], unit: "mA" }, { label: "IR3", q: ["I", "R3"], unit: "mA" }, { label: "IR4", q: ["I", "R4"], unit: "mA" }, { label: "IR5", q: ["I", "R5"], unit: "mA" }] }] },
      { id: "p2", title: "الإجراء 2: الدائرة 2",
        steps: ["نفس الدائرة 2 في التجربة 4 (Vs = 30 V بالقناتين على التوالي).", "قِس تيار المصدر وتيار كل مقاومة من R1 إلى R7.", "ارسم الدائرة واكتب على كل فرع مقدار تياره واتجاهه."],
        fig: LADDER_FIG,
        layouts: [{ id: "L1", name: "الدائرة 2", parts: ladderParts(), leads: [["ps.m+", "d1.A"], ["d1.COM", "t:1:1:3"], ["ps.m-", "ps.s+"], ["ps.s-", "t:3:2:6"]], set: mix(psOn(15, 15), { d1: { mode: "adc" } }) }],
        tables: [{ title: "الجدول 6.1", kind: "mc", meas: "المقاس (mA)", calc: "المحسوب (mA)", rows: [
          { label: "Is", q: ["Ips", "m"], unit: "mA" }, { label: "IR1", q: ["I", "R1"], unit: "mA" }, { label: "IR2", q: ["I", "R2"], unit: "mA" }, { label: "IR3", q: ["I", "R3"], unit: "mA" }, { label: "IR4", q: ["I", "R4"], unit: "mA" },
          { label: "IR5", q: ["I", "R5"], unit: "mA" }, { label: "IR6", q: ["I", "R6"], unit: "mA" }, { label: "IR7", q: ["I", "R7"], unit: "mA" }] }] }
    ] },

  /* ================= Lab 6 ================= */
  { id: "exp6", n: 6, en: "Thevenin's Theorem and Maximum Power Transfer (DC)", title: "نظرية ثيفنن وأقصى نقل للقدرة",
    objective: ["التحقق عمليًا من نظرية ثيفنن.", "التحقق من نظرية أقصى نقل للقدرة."],
    equipment: ["مصدر جهد مستمر", "ملتيميتران رقميان", "صندوق مقاومات عشري", "مقاومات 470 Ω و 1 kΩ و 2.2 kΩ و 3.3 kΩ"],
    inst: ["ps", "d1", "d2", "rb"], kit: kit(["R470a", "R1ka", "R2k2", "R3k3", "R1k5"]),
    theory: ["أي دائرة خطية بين طرفين a و b تكافئ مصدر VTh على التوالي مع RTh.", "VTh = جهد الدائرة المفتوحة Voc بين a و b. و RTh = Voc / Isc حيث Isc تيار القصر.", "أقصى قدرة للحمل عندما RL = RTh، وقيمتها Pmax = VTh² / (4 RTh)."],
    prelab: [{ q: "Vs = 15 V، R1 = 470 Ω، R2 = 1 kΩ، R3 = 2.2 kΩ، والحمل R4 = 3.3 kΩ بين a و b.", fields: [
      { label: "VTh", ans: 10.204, unit: "V" }, { label: "RTh", ans: 2519.7, unit: "Ω" }, { label: "I4", ans: 1.7534, unit: "mA" }, { label: "Pmax (عند R4 = RTh)", ans: 10.33, unit: "mW" }] }],
    procs: [
      { id: "p1", title: "الإجراء 1: مكافئ ثيفنن",
        steps: ["ركّب الدائرة: R1 = 470 Ω من المصدر إلى العقدة، R2 = 1 kΩ منها إلى الأرضي، R3 = 2.2 kΩ منها إلى a، والحمل R4 = 3.3 kΩ بين a و b، و Vs = 15 V.", "قِس I4 بأميتر على التوالي مع R4.", "شيل R4 وقِس Voc = VTh بين a و b.", "ضع سلكًا بين a و b (بالأميتر) وقِس Isc. احسب RTh = Voc / Isc.", "ابنِ المكافئ: المصدر = VTh، وصندوق المقاومات = RTh على التوالي مع R4، وقِس I4 وقارن."],
        fig: fig(2, 4, [Vs([1, 0], [0, 0], "Vs", "15 V"), E([0, 0], [0, 1], "R", "R1", 470), E([0, 1], [1, 1], "R", "R2", 1000), E([0, 1], [0, 2], "R", "R3", 2200), Am([0, 2], [0, 3], "I4"), E([0, 3], [1, 3], "R", "R4", 3300), Wr([1, 3], [1, 0])], { nodeLabels: [{ at: [0, 3], text: "a" }, { at: [1, 3], text: "b" }] }),
        layouts: [
          { id: "L1", name: "الدائرة مع R4", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R1ka", "R2"), "v:2:2": W, "h:1:2": P("R2k2", "R3"), "v:1:3": P("R3k3", "R4"), "h:3:2": W },
            leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["t:2:3:7", "d1.A"], ["d1.COM", "t:3:3:1"]], set: mix(psOn(15), { d1: { mode: "adc" } }), nodes: { a: "t:1:3", b: "t:3:3" } },
          { id: "L2", name: "مفتوحة (Voc)", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R1ka", "R2"), "v:2:2": W, "h:1:2": P("R2k2", "R3"), "h:3:2": W },
            leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["d2.V", "t:1:3:5"], ["d2.COM", "t:3:3:5"]], set: mix(psOn(15), { d2: { mode: "vdc" } }), nodes: { a: "t:1:3", b: "t:3:3" } },
          { id: "L3", name: "قصر (Isc)", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R1ka", "R2"), "v:2:2": W, "h:1:2": P("R2k2", "R3"), "h:3:2": W },
            leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["d1.A", "t:1:3:5"], ["d1.COM", "t:3:3:5"]], set: mix(psOn(15), { d1: { mode: "adc" } }), lbl: { "d1.A.sh": "SC" } },
          { id: "L4", name: "مكافئ ثيفنن", parts: { "v:1:3": P("R3k3", "R4") }, lbl: { rb: "RTh" },
            leads: [["ps.m+", "rb.a"], ["rb.b", "t:1:3:1"], ["t:2:3:7", "d1.A"], ["d1.COM", "ps.m-"]], set: mix(psOn(10.2), { rb: { d: [2, 5, 2, 0] }, d1: { mode: "adc" } }) }],
        tables: [{ title: "الجدول 6.1", kind: "mc", meas: "المقاس", calc: "المحسوب", rows: [
          { label: "VTh = Voc", L: "L2", q: ["Vt", "t:1:3", "t:3:3"], unit: "V" }, { label: "Isc", L: "L3", q: ["Iel", "d1.A.sh"], unit: "mA" },
          { label: "I4 في الدائرة الأصلية", L: "L1", q: ["I", "R4"], unit: "mA" }, { label: "I4 في مكافئ ثيفنن", L: "L4", q: ["I", "R4"], unit: "mA" }] }] },
      { id: "p2", title: "الإجراء 2: أقصى نقل للقدرة",
        steps: ["اجعل الحمل R4 صندوق المقاومات بين a و b، مع أميتر على التوالي وفولتميتر عليه.", "غيّر R4 حسب الجدول، وفي كل قيمة قِس I4 و V4، واحسب P4 = V4 · I4.", "ارسم P4 مقابل R4: عند أي قيمة أقصى قدرة؟ وقارنها بـ RTh."],
        fig: fig(2, 4, [Vs([1, 0], [0, 0], "Vs", "15 V"), E([0, 0], [0, 1], "R", "R1", 470), E([0, 1], [1, 1], "R", "R2", 1000), E([0, 1], [0, 2], "R", "R3", 2200), Am([0, 2], [0, 3], "I4"), E([0, 3], [1, 3], "R", "R4", 0, { vtext: "متغيّر", variable: true }), Wr([1, 3], [1, 0])]),
        layouts: [{ id: "L1", name: "R4 متغيرة", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R1ka", "R2"), "v:2:2": W, "h:1:2": P("R2k2", "R3"), "h:3:2": W }, lbl: { rb: "R4" },
          leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["t:1:3:5", "d1.A"], ["d1.COM", "rb.a"], ["rb.b", "t:3:3:5"], ["d2.V", "rb.a"], ["d2.COM", "rb.b"]], set: mix(psOn(15), { rb: { d: [0, 4, 0, 0] }, d1: { mode: "adc" }, d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 6.2", kind: "pair", a: "I4 (mA)", b: "V4 (V)", power: true, plot: { x: "r", y: "p", xl: "R4 (kΩ)", yl: "P4 (mW)" },
          rows: [0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.2, 3.4, 3.6, 3.8].map(function (k) {
            var ohm = Math.round(k * 1000); return { label: "R4 = " + k + " kΩ", r: k, set: { rb: { d: [Math.floor(ohm / 1000), Math.floor(ohm / 100) % 10, Math.floor(ohm / 10) % 10, ohm % 10] } }, qa: ["I", "R4"], ua: "mA", qb: ["V", "R4"], ub: "V" }; }) }] }
    ] },

  /* ================= Lab 7 ================= */
  { id: "exp7", n: 7, en: "Superposition Theorem Applied to DC Circuits", title: "نظرية التراكب في دوائر التيار المستمر",
    objective: ["التحقق عمليًا من نظرية التراكب."],
    equipment: ["مصدر جهد مستمر بقناتين", "ملتيميتران رقميان", "مقاومات 100 Ω و 220 Ω و 470 Ω"],
    inst: ["ps", "d1", "d2"], kit: kit(["R100", "R220a", "R470a"]),
    theory: ["في دائرة خطية فيها أكثر من مصدر: الاستجابة الكلية = مجموع استجابات كل مصدر لوحده.", "لإطفاء مصدر جهد: انزعه وضع مكانه سلكًا (قصر). لا تقصر طرفي المصدر وهو موصول!", "الإشارة مهمة: لو عكست قطبية مصدر، تنعكس إشارة مساهمته."],
    prelab: [{ q: "Vs1 = 15 V، Vs2 = 10 V، R1 = 470 Ω، R2 = 220 Ω، R3 = 100 Ω (الدائرة 1). أوجد V3 و I3 بالتراكب.", fields: [
      { label: "V31 (Vs1 فقط)", L: "p1/L2", q: ["V", "R3"], unit: "V" }, { label: "V32 (Vs2 فقط)", L: "p1/L3", q: ["V", "R3"], unit: "V" }, { label: "V3", L: "p1/L1", q: ["V", "R3"], unit: "V" }, { label: "I3", L: "p1/L1", q: ["I", "R3"], unit: "mA" }] }],
    procs: [
      { id: "p1", title: "الإجراء 1: الدائرة 1",
        steps: ["Vs1 = 15 V من MASTER، و Vs2 = 10 V من SLAVE. R1 = 470 Ω من Vs1 إلى العقدة، R3 = 100 Ω من العقدة إلى الأرضي، و R2 = 220 Ω من العقدة إلى + Vs2، و − Vs2 إلى الأرضي.", "قِس V3 و I3 والمصدران موصولان.", "شيل Vs2 وضع مكانه سلكًا، وقِس V31 و I31.", "رجّع Vs2 وشيل Vs1 وضع مكانه سلكًا، وقِس V32 و I32.", "تحقق: V3 = V31 + V32 و I3 = I31 + I32."],
        fig: fig(2, 3, [Vs([1, 0], [0, 0], "Vs1", "15 V"), E([0, 0], [0, 1], "R", "R1", 470), E([0, 1], [1, 1], "R", "R3", 100), E([0, 1], [0, 2], "R", "R2", 220), Vs([1, 2], [0, 2], "Vs2", "10 V"), Wr([1, 0], [1, 2])]),
        layouts: [
          { id: "L1", name: "المصدران", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R100", "R3"), "v:2:2": W, "h:1:2": P("R220a", "R2") }, leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["ps.s+", "t:1:3:5"], ["ps.s-", "t:3:2:8"], ["d2.V", "t:1:2:1"], ["d2.COM", "t:3:2:7"]], set: mix(psOn(15, 10), { d2: { mode: "vdc" } }) },
          { id: "L2", name: "Vs1 فقط", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R100", "R3"), "v:2:2": W, "h:1:2": P("R220a", "R2") }, leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["t:1:3:5", "t:3:2:8"], ["d2.V", "t:1:2:1"], ["d2.COM", "t:3:2:7"]], set: mix(psOn(15, 10), { d2: { mode: "vdc" } }) },
          { id: "L3", name: "Vs2 فقط", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R100", "R3"), "v:2:2": W, "h:1:2": P("R220a", "R2") }, leads: [["t:1:1:3", "t:3:2:6"], ["ps.s+", "t:1:3:5"], ["ps.s-", "t:3:2:8"], ["d2.V", "t:1:2:1"], ["d2.COM", "t:3:2:7"]], set: mix(psOn(15, 10), { d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 7.1", kind: "mc", meas: "المقاس", calc: "المحسوب", rows: [
          { label: "V31 (Vs1 فقط)", L: "L2", q: ["V", "R3"], unit: "V" }, { label: "I31", L: "L2", q: ["I", "R3"], unit: "mA" },
          { label: "V32 (Vs2 فقط)", L: "L3", q: ["V", "R3"], unit: "V" }, { label: "I32", L: "L3", q: ["I", "R3"], unit: "mA" },
          { label: "V3 (المصدران)", L: "L1", q: ["V", "R3"], unit: "V" }, { label: "I3 (المصدران)", L: "L1", q: ["I", "R3"], unit: "mA" }] }] },
      { id: "p2", title: "الإجراء 2: الدائرة 2 (قطبية Vs2 معكوسة)",
        steps: ["نفس الدائرة، لكن اعكس Vs2: + SLAVE إلى الأرضي و − SLAVE إلى R2.", "كرر نفس القياسات الثلاثة، ولاحظ إشارة V32."],
        fig: fig(2, 3, [Vs([1, 0], [0, 0], "Vs1", "15 V"), E([0, 0], [0, 1], "R", "R1", 470), E([0, 1], [1, 1], "R", "R3", 100), E([0, 1], [0, 2], "R", "R2", 220), mix(Vs([1, 2], [0, 2], "Vs2", "10 V"), { plus: "b" }), Wr([1, 0], [1, 2])]),
        layouts: [
          { id: "L1", name: "المصدران", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R100", "R3"), "v:2:2": W, "h:1:2": P("R220a", "R2") }, leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["ps.s-", "t:1:3:5"], ["ps.s+", "t:3:2:8"], ["d2.V", "t:1:2:1"], ["d2.COM", "t:3:2:7"]], set: mix(psOn(15, 10), { d2: { mode: "vdc" } }) },
          { id: "L2", name: "Vs1 فقط", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R100", "R3"), "v:2:2": W, "h:1:2": P("R220a", "R2") }, leads: [["ps.m+", "t:1:1:3"], ["ps.m-", "t:3:2:6"], ["t:1:3:5", "t:3:2:8"], ["d2.V", "t:1:2:1"], ["d2.COM", "t:3:2:7"]], set: mix(psOn(15, 10), { d2: { mode: "vdc" } }) },
          { id: "L3", name: "Vs2 فقط", parts: { "h:1:1": P("R470a", "R1"), "v:1:2": P("R100", "R3"), "v:2:2": W, "h:1:2": P("R220a", "R2") }, leads: [["t:1:1:3", "t:3:2:6"], ["ps.s-", "t:1:3:5"], ["ps.s+", "t:3:2:8"], ["d2.V", "t:1:2:1"], ["d2.COM", "t:3:2:7"]], set: mix(psOn(15, 10), { d2: { mode: "vdc" } }) }],
        tables: [{ title: "الجدول 7.2", kind: "mc", meas: "المقاس", calc: "المحسوب", signed: true, rows: [
          { label: "V31 (Vs1 فقط)", L: "L2", q: ["V", "R3"], unit: "V" }, { label: "V32 (Vs2 فقط)", L: "L3", q: ["V", "R3"], unit: "V" }, { label: "V3 (المصدران)", L: "L1", q: ["V", "R3"], unit: "V" }, { label: "I3 (المصدران)", L: "L1", q: ["I", "R3"], unit: "mA" }] }] }
    ] },

  /* ================= Lab 8 ================= */
  { id: "exp8", n: 8, en: "DC and AC Measurements with the Oscilloscope", title: "القياس بالأوسيلوسكوب (DC و AC) ودائرة RL",
    objective: ["التعرف على وظائف الأوسيلوسكوب.", "قياس جهد مستمر وجهد متردد به.", "قياس فرق الطور في دائرة RL على التوالي."],
    equipment: ["مصدر جهد مستمر", "مولد إشارة", "أوسيلوسكوب", "ملتيميتر رقمي", "ملف 17.5 mH (صندوق محاثة)", "مقاومة 100 Ω"],
    inst: ["ps", "fg", "sc", "d1", "lb"], kit: kit(["R100", "R470a"]),
    theory: ["الشاشة 10 تقسيمات أفقيًا و 8 رأسيًا. الجهد = عدد التقسيمات الرأسية × V/div. الزمن = التقسيمات الأفقية × s/div.", "للجيبية: Vpp = 2Vm و Vrms = Vm/√2 و f = 1/T و ω = 2πf. الملتيميتر على V~ يقرأ RMS.", "في RL على التوالي يتأخر التيار (ومعه VR) عن جهد المصدر بزاوية θ = tan⁻¹(ωL/R). ومن الشاشة: θ = 360° × f × Δt.", "مقطع الأرضي في مجسّ الأوسيلوسكوب متصل بأرضي المبنى، ومثله الطرف الأسود للمولد: لازم يكونان على نفس العقدة."],
    prelab: [{ q: "vs(t) = 7 sin(2π·1000 t) V. أكمل:", fields: [{ label: "السعة Vm", ans: 7, unit: "V" }, { label: "التردد f", ans: 1000, unit: "Hz" }, { label: "الزمن الدوري T", ans: 1, unit: "ms" }, { label: "ω", ans: 6283.2, unit: "rad/s" }, { label: "Vpp", ans: 14, unit: "V" }, { label: "Vrms", ans: 4.95, unit: "V" }] },
      { q: "دائرة RL على التوالي: R = 100 Ω و L = 17.5 mH عند 1 kHz.", fields: [{ label: "XL", ans: 109.96, unit: "Ω" }, { label: "|Z|", ans: 148.63, unit: "Ω" }, { label: "θ (تأخر التيار)", ans: 47.71, unit: "°" }, { label: "PF", ans: 0.673, unit: "" }] }],
    procs: [
      { id: "p1", title: "الإجراء 1 و 2: قياس جهد مستمر",
        steps: ["شغّل الأوسيلوسكوب، واجعل CH1 على DC وخط الصفر في المنتصف.", "صِل خرج المصدر إلى CH1 (الطرف الموجب إلى CH1 والسالب إلى مقطع الأرضي).", "اضبط المصدر على كل قيمة في الجدول، واقرأ عدد التقسيمات × V/div."],
        layouts: [{ id: "L1", name: "المصدر على CH1", parts: {}, leads: [["ps.m+", "sc.1"], ["ps.m-", "sc.1g"]], set: mix(psOn(1), { sc: { c1: { vd: 2, cp: "DC", on: true }, c2: { on: false } } }) }],
        tables: [{ title: "الجدول 8.2", kind: "m", meas: "Vmeas = التقسيمات × V/div (V)", rows: [1, 2, 5, 8, 10].map(function (v) { return { label: "VDC = " + v + " V", set: { ps: { m: { v: v } } }, q: ["Vt", "sc.1", "sc.1g"], unit: "V", tol: 0.06 }; }) }] },
      { id: "p2", title: "الإجراء 2 (تابع): قياس جهد متردد",
        steps: ["صِل مولد الإشارة إلى CH2، و CH2 على AC.", "اضبط المولد: جيبية، 10 Vpp، 1 kHz.", "اقرأ Vm والزمن الدوري T، واحسب f.", "قِس Vrms بالملتيميتر على V~ وقارنه بـ Vm/√2."],
        layouts: [{ id: "L1", name: "المولد على CH2", parts: {}, leads: [["fg.out", "sc.2"], ["fg.com", "sc.2g"], ["d1.V", "fg.out"], ["d1.COM", "fg.com"]], set: { fg: { on: true, f: 1000, vpp: 10 }, sc: { c2: { vd: 2, cp: "AC", on: true }, c1: { on: false }, td: 0.0002 }, d1: { mode: "vac" } } }],
        tables: [{ title: "الجدول 8.3", kind: "m", meas: "المقاس", rows: [{ label: "Vm (V)", q: ["amp", "sc.2"], unit: "V", tol: 0.05 }, { label: "T (ms)", q: ["T"], unit: "ms", tol: 0.05 }, { label: "f (Hz)", q: ["f"], unit: "Hz", tol: 0.05 }, { label: "Vrms بالملتيميتر (V)", q: ["Vt", "fg.out", "fg.com"], unit: "V" }] }] },
      { id: "p3", title: "الإجراء 3: دائرة RL على التوالي",
        steps: ["ركّب: المولد ← الملف 17.5 mH (صندوق المحاثة) ← R = 100 Ω ← الطرف الأسود للمولد.", "CH1 على المولد (vs) و CH2 على R (VR)، والمقطعان السوداوان على الطرف المشترك (طرف المولد الأسود).", "اضبط السعة حتى يقرأ CH1 قيمة 10 Vpp (vs = 5 sin 2π·1000t). المولد له مقاومة داخلية 50 Ω، فتنزل سعته مع الحمل.", "قِس بالملتيميتر (V~): vs و VL و VR، ثم I بمدخل A.", "بالمؤشرات قِس Δt بين قمتي vs و VR، واحسب θ = 360° f Δt و PF = cos θ و Z = Vs / I."],
        fig: fig(2, 3, [Gen([1, 0], [0, 0], "vs", "5 V · 1 kHz"), E([0, 0], [0, 1], "L", "L", 0.0175), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "R", "R", 100, { vlabel: "VR" }), Wr([1, 2], [1, 0])]),
        layouts: [{ id: "L1", name: "RL", parts: { "v:1:3": P("R100", "R") }, lbl: { lb: "L" },
          leads: [["fg.out", "lb.a"], ["lb.b", "t:1:3:1"], ["t:2:3:7", "fg.com"], ["sc.1", "fg.out"], ["sc.1g", "fg.com"], ["sc.2", "t:1:3:5"], ["sc.2g", "t:2:3:5"], ["d1.V", "t:1:3:3"], ["d1.COM", "t:2:3:3"]],
          set: { fg: { on: true, f: 1000 }, fgTerm: 10, lb: { d: [1, 7, 5] }, sc: { c1: { vd: 2, cp: "DC", on: true }, c2: { vd: 1, cp: "DC", on: true }, td: 0.0002, cur: true }, d1: { mode: "vac" } } }],
        tables: [{ title: "القياسات", kind: "mc", meas: "المقاس", calc: "المحسوب", rows: [
          { label: "vs (RMS)", q: ["Vt", "fg.out", "fg.com"], unit: "V" }, { label: "VL (RMS)", q: ["V", "L"], unit: "V" }, { label: "VR (RMS)", q: ["V", "R"], unit: "V" },
          { label: "I (RMS)", q: ["I", "R"], unit: "mA" }, { label: "θ: تأخر VR عن vs", q: ["phase", ["fg.out", "fg.com"], ["t:1:3", "t:2:3"]], unit: "°", tol: 0.04 }, { label: "Z = Vs / I", q: ["Z", ["fg.out", "fg.com"], "R"], unit: "Ω" }] }] }
    ] },

  /* ================= Lab 9 ================= */
  { id: "exp9", n: 9, en: "KVL, KCL and Thevenin's Theorem Applied to AC Circuits", title: "KVL و KCL ونظرية ثيفنن في دوائر التيار المتردد",
    objective: ["التحقق من KCL و KVL في دائرة متردد.", "التحقق من نظرية ثيفنن في دائرة متردد."],
    equipment: ["مولد إشارة", "ملتيميتران رقميان", "مقاومات 100 Ω و 220 Ω و 1 kΩ و 3.3 kΩ", "صندوق مقاومات", "صندوق محاثة (17.5 mH)"],
    inst: ["fg", "sc", "d1", "d2", "rb", "lb"], kit: kit(["R100", "R220a", "R1ka", "R3k3"]),
    theory: ["في المتردد KVL و KCL صحيحان على <b>الفيزورات</b>، لا على قراءات RMS: مجموع قراءات الملتيميتر حول حلقة لا يساوي جهد المصدر غالبًا، لأن الجهود مختلفة الطور.", "ZL = jωL. والممانعات تُجمع مثل المقاومات لكن بالأعداد المركبة.", "مكافئ ثيفنن في المتردد: ETh = جهد الدائرة المفتوحة، و ZTh = الممانعة بين الطرفين والمصدر مطفأ (قصر)."],
    prelab: [{ q: "Vs = 5 V قمة، 1 kHz، R1 = 1 kΩ، R2 = 220 Ω، L = 17.5 mH، RL = 100 Ω.", fields: [
      { label: "|ZT|", ans: 1085.7, unit: "Ω" }, { label: "Is (RMS)", L: "p1/L1", q: ["Ifg"], unit: "mA" }, { label: "IR2 (RMS)", L: "p1/L1", q: ["I", "R2"], unit: "mA" }, { label: "IRL (RMS)", L: "p1/L1", q: ["I", "RL"], unit: "mA" }] }],
    procs: [
      { id: "p1", title: "الإجراء 1: KVL و KCL",
        steps: ["ركّب: المولد ← R1 = 1 kΩ ← العقدة؛ R2 = 220 Ω من العقدة إلى الأرضي؛ الملف 17.5 mH من العقدة إلى RL = 100 Ω ثم إلى الأرضي.", "اضبط المولد على 1 kHz واجعل جهد طرفيه 5 V قمة (3.54 V RMS على الملتيميتر).", "قِس Vs و VR1 و VR2 و VL و VRL، ثم Is و IR2 و IRL.", "تحقق من KVL و KCL بالفيزورات."],
        fig: fig(2, 3, [Gen([1, 0], [0, 0], "vs", "5 V قمة · 1 kHz"), E([0, 0], [0, 1], "R", "R1", 1000), E([0, 1], [1, 1], "R", "R2", 220), E([0, 1], [0, 2], "L", "L", 0.0175), E([0, 2], [1, 2], "R", "RL", 100), Wr([1, 2], [1, 0])]),
        layouts: [{ id: "L1", name: "الدائرة", parts: { "h:1:1": P("R1ka", "R1"), "v:1:2": P("R220a", "R2"), "v:2:2": W, "v:1:4": P("R100", "RL"), "v:2:4": W, "h:3:2": W, "h:3:3": W }, lbl: { lb: "L" },
          leads: [["fg.out", "t:1:1:3"], ["fg.com", "t:3:2:6"], ["t:1:2:5", "lb.a"], ["lb.b", "t:1:4:3"], ["d1.V", "t:1:1:1"], ["d1.COM", "t:3:2:7"]], set: { fg: { on: true, f: 1000 }, fgTerm: 10, lb: { d: [1, 7, 5] }, d1: { mode: "vac" } } }],
        tables: [{ title: "الجدول 9.1 و 9.2", kind: "mc", meas: "المقاس (RMS)", calc: "المحسوب (RMS)", rows: [
          { label: "Vs", q: ["Vt", "fg.out", "fg.com"], unit: "V" }, { label: "VR1", q: ["V", "R1"], unit: "V" }, { label: "VR2", q: ["V", "R2"], unit: "V" }, { label: "VL", q: ["V", "L"], unit: "V" }, { label: "VRL", q: ["V", "RL"], unit: "V" },
          { label: "Is", q: ["Ifg"], unit: "mA" }, { label: "IR2", q: ["I", "R2"], unit: "mA" }, { label: "IRL", q: ["I", "RL"], unit: "mA" }] }] },
      { id: "p2", title: "الإجراء 2: ثيفنن في المتردد",
        steps: ["الدائرة: R1 = 1 kΩ، R2 = 3.3 kΩ، الملف 17.5 mH، والحمل RL = 100 Ω بين a و b، و Vs = 5 V قمة 1 kHz.", "قِس VR و IR على الحمل.", "شيل RL وقِس جهد الدائرة المفتوحة ETh بين a و b.", "احسب ZTh = (R1 ∥ R2) + jωL.", "ابنِ المكافئ: المولد بسعة ETh (بدون حمل)، وصندوق المقاومات = الجزء الحقيقي من ZTh ناقص 50 Ω (مقاومة المولد الداخلية)، وصندوق المحاثة = 17.5 mH، ثم RL. قِس VR و IR وقارن."],
        fig: fig(2, 3, [Gen([1, 0], [0, 0], "vs", "5 V قمة"), E([0, 0], [0, 1], "R", "R1", 1000), E([0, 1], [1, 1], "R", "R2", 3300), E([0, 1], [0, 2], "L", "L", 0.0175), E([0, 2], [1, 2], "R", "RL", 100), Wr([1, 2], [1, 0])], { nodeLabels: [{ at: [0, 2], text: "a" }, { at: [1, 2], text: "b" }] }),
        layouts: [
          { id: "L1", name: "مع الحمل", parts: { "h:1:1": P("R1ka", "R1"), "v:1:2": P("R3k3", "R2"), "v:2:2": W, "v:1:4": P("R100", "RL"), "v:2:4": W, "h:3:2": W, "h:3:3": W }, lbl: { lb: "L" },
            leads: [["fg.out", "t:1:1:3"], ["fg.com", "t:3:2:6"], ["t:1:2:5", "lb.a"], ["lb.b", "t:1:4:3"], ["d1.V", "t:1:4:1"], ["d1.COM", "t:2:4:1"]], set: { fg: { on: true, f: 1000 }, fgTerm: 10, lb: { d: [1, 7, 5] }, d1: { mode: "vac" } } },
          { id: "L2", name: "مفتوحة (ETh)", parts: { "h:1:1": P("R1ka", "R1"), "v:1:2": P("R3k3", "R2"), "v:2:2": W, "v:2:4": W, "h:3:2": W, "h:3:3": W }, lbl: { lb: "L" },
            leads: [["fg.out", "t:1:1:3"], ["fg.com", "t:3:2:6"], ["t:1:2:5", "lb.a"], ["lb.b", "t:1:4:3"], ["d1.V", "t:1:4:1"], ["d1.COM", "t:2:4:1"]], set: { fg: { on: true, f: 1000 }, fgTerm: 10, lb: { d: [1, 7, 5] }, d1: { mode: "vac" } } },
          { id: "L3", name: "مكافئ ثيفنن", parts: { "v:1:4": P("R100", "RL"), "v:2:4": W }, lbl: { lb: "L", rb: "RTh" },
            leads: [["fg.out", "rb.a"], ["rb.b", "lb.a"], ["lb.b", "t:1:4:3"], ["fg.com", "t:3:4:6"], ["d1.V", "t:1:4:1"], ["d1.COM", "t:2:4:1"]], set: { fg: { on: true, f: 1000, vpp: 7.674 }, rb: { d: [0, 7, 1, 7] }, lb: { d: [1, 7, 5] }, d1: { mode: "vac" } } }],
        tables: [{ title: "النتائج", kind: "mc", meas: "المقاس (RMS)", calc: "المحسوب (RMS)", rows: [
          { label: "VR على الحمل", L: "L1", q: ["V", "RL"], unit: "V" }, { label: "IR", L: "L1", q: ["I", "RL"], unit: "mA" }, { label: "ETh", L: "L2", q: ["Vt", "t:1:4", "t:2:4"], unit: "V" },
          { label: "VR في المكافئ", L: "L3", q: ["V", "RL"], unit: "V" }, { label: "IR في المكافئ", L: "L3", q: ["I", "RL"], unit: "mA" }] }] }
    ] },

  /* ================= Lab 10 ================= */
  { id: "exp10", n: 10, en: "Power Factor Correction", title: "تحسين معامل القدرة",
    objective: ["فهم معامل القدرة لحمل حثّي أحادي الطور.", "تحسينه بمكثف على التوازي مع الحمل."],
    equipment: ["مصباح فلورسنت 20 W مع الملف (Ballast)", "مصدر 220 V / 60 Hz مع مقياس قدرة (V و A و W)", "صندوق مكثفات عشري"],
    inst: ["mn", "cb"], kit: [],
    note: "المصباح على المنصة نموذج تقريبي (مقاومة وملف على التوالي) يشبه سلوك المصباح الحقيقي بمعامل قدرة منخفض؛ قيمه للتدريب وليست قياسًا لمصباح معيّن.",
    theory: ["القدرة الفعلية P = V I cos θ بالواط، والردية Q = V I sin θ بالـ VAR، والظاهرية S = V I بالـ VA. ومعامل القدرة PF = P / S = cos θ.", "الحمل الحثي يسحب تيارًا متأخرًا. المكثف على التوازي يسحب تيارًا متقدمًا يلغي جزءه الردي، فينزل تيار الخط ويرتفع PF، والقدرة الفعلية ما تتغير.", "لـ PF = 1: C = X / (ω Z²) حيث Z² = R² + X²."],
    prelab: [{ q: "حمل حثّي بدون مكثف على 220 V و 60 Hz: قرأ مقياس القدرة I = 0.338 A و P = 26.0 W.", fields: [{ label: "S", ans: 74.36, unit: "VA" }, { label: "PF", ans: 0.35, unit: "" }, { label: "Q", ans: 69.66, unit: "VAR" }, { label: "C لـ PF = 1", ans: 3.82, unit: "µF" }] }],
    procs: [
      { id: "p1", title: "الإجراء: تحسين معامل القدرة",
        steps: ["شغّل المصدر وسجّل V و A و W و PF بدون مكثف.", "صِل صندوق المكثفات على التوازي مع المصباح (طرفي a و b) على 1 µF وسجّل القراءات.", "زِد السعة خطوة خطوة حسب الجدول حتى يصل التيار لأقل قيمة.", "ارسم PF مقابل C: عند أي سعة أعلى PF؟ وقارنها بالمحسوبة."],
        layouts: [{ id: "L1", name: "مع المكثف", parts: {}, leads: [["cb.a", "lamp.a"], ["cb.b", "lamp.b"]], set: { mn: { on: true }, cb: { d: [1, 0] } } },
          { id: "L0", name: "بدون مكثف", parts: {}, leads: [], set: { mn: { on: true }, cb: { d: [0, 0] } } }],
        tables: [{ title: "الجدول 10.1", kind: "pf", plot: { x: "c", y: "pf", xl: "C (µF)", yl: "PF" },
          rows: [[0, "بدون مكثف"], [1], [2], [3], [3.2], [3.4], [3.6], [3.8], [4], [4.2], [4.4], [4.6], [4.8], [5], [5.2], [5.4], [5.6], [5.8], [6]].map(function (r) {
            var c = r[0]; return { label: r[1] || "C = " + c + " µF", c: c, L: c ? "L1" : "L0", set: { cb: { d: [Math.floor(c + 1e-9), Math.round((c - Math.floor(c + 1e-9)) * 10)] } } }; }) }] }
    ] }
  ];

  CV.clabExps = { list: EXPS, PIECES: PIECES };
})(typeof window !== "undefined" ? window : globalThis);
