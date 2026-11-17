/* Logic Design EE2111 — Chapter 2: Boolean Algebra and Logic Gates (lecture file Chap2). */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss, G = CV.lg;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var CH = "الفصل 2: الجبر البولياني والبوابات المنطقية", C = "logic-design";
  function H(h) { return { html: h }; }
  var XYZ = ["x", "y", "z"];

  /* ================= 1. Postulates and theorems ================= */
  S.lesson({
    id: "ld-ch2-1", course: C, chapter: CH, ar: "مسلّمات الجبر البولياني ونظرياته", en: "Postulates and Basic Theorems of Boolean Algebra", min: 30,
    obj: ["تعرف مسلّمات هنتنغتون والجبر ثنائي القيمة.", "تطبق مبدأ الثنائية (duality).", "تستخدم النظريات الست ومنها دي مورغان والامتصاص."],
    idea: [
      "الجبر البولياني مجموعة عناصر B مع عمليتين + (OR) و · (AND) تحقق <b>مسلّمات هنتنغتون</b>: الانغلاق، والعنصر المحايد " + m("x + 0 = x") + " و " + m("x · 1 = x") + "، والإبدال، والتوزيع " + m("x(y + z) = xy + xz") + " و " + m("x + yz = (x + y)(x + z)") + "، والمتمم " + m("x + x' = 1") + " و " + m("x · x' = 0") + "، ووجود عنصرين مختلفين على الأقل. والجبر ثنائي القيمة (0 و 1) يحققها كلها.",
      "<b>مبدأ الثنائية</b>: أي عبارة مستنتجة من المسلّمات تبقى صحيحة إذا بدّلنا OR بـ AND و 0 بـ 1. لذلك تأتي كل نظرية بصيغتين (a) و (b).",
      "النظريات: (1) " + m("x + x = x") + " (2) " + m("x + 1 = 1") + " (3) " + m("(x')' = x") + " (4) التجميع (5) <b>دي مورغان</b> " + m("(x + y)' = x'y'") + " و " + m("(xy)' = x' + y'") + " (6) <b>الامتصاص</b> " + m("x + xy = x") + " و " + m("x(x + y) = x") + ". وأولوية العمليات: الأقواس، ثم NOT، ثم AND، ثم OR."
    ],
    figs: [H(G.tt(["x", "y"], [{ h: "x+y", f: "x+y" }, { h: "(x+y)'", f: "(x+y)'" }, { h: "x'", f: "x'" }, { h: "y'", f: "y'" }, { h: "x'y'", f: "x'y'" }])), ],
    laws: ["x + 0 = x      x · 1 = x", "x + x' = 1      x · x' = 0", "x + x = x      x · x = x", "x + 1 = 1      x · 0 = 0", "(x + y)' = x'y'      (xy)' = x' + y'", "x + xy = x      x(x + y) = x"],
    when: ["لإثبات نظرية: إما خطوة بخطوة من المسلّمات، أو بجدول الحقيقة لكل القيم.", "دي مورغان هو مفتاح إيجاد متمم الدالة وتحويل الدوائر إلى NAND و NOR."],
    ex: [
      { q: "أثبت النظرية 1(a): " + m("x + x = x") + " من المسلّمات.",
        s: [m("x + x = (x + x) · 1") + " (المسلّمة 2b).", m("= (x + x)(x + x')") + " (5a).", m("= x + xx'") + " (4b).", m("= x + 0 = x") + " (5b ثم 2a)."] },
      { q: "تحقق من دي مورغان " + m("(x + y)' = x'y'") + " بجدول الحقيقة.",
        s: ["نكتب الأعمدة x و y و x + y ونعكسها.", "ثم x' و y' وحاصل ضربهما.", "العمودان " + m("(x+y)'") + " و " + m("x'y'") + " متطابقان في الصفوف الأربعة: 1، 0، 0، 0."],
        fig: H(G.tt(["x", "y"], [{ h: "(x+y)'", f: "(x+y)'" }, { h: "x'y'", f: "x'y'" }])) },
      { q: "أثبت الامتصاص " + m("x + xy = x") + ".",
        s: [m("x + xy = x · 1 + xy") + ".", m("= x(1 + y)") + " (التوزيع).", m("= x · 1 = x") + " (النظرية 2a). والثنائية تعطي " + m("x(x + y) = x") + "."] }
    ],
    real: "برامج تصميم الدوائر تبسّط آلاف العبارات تلقائيًا بهذه القواعد نفسها، فتقلل عدد البوابات والمساحة على الشريحة.",
    quiz: [
      S.q("ثنائي العبارة <span class='ltr'>x + 0 = x</span>:", [["<span class='ltr'>x · 1 = x</span>", true, "+ ↔ · و 0 ↔ 1."], ["<span class='ltr'>x · 0 = 0</span>", "formula", "نبدّل 0 بـ 1 أيضًا."], ["<span class='ltr'>x + 1 = 1</span>", "conceptual", "هذه نظرية أخرى."]]),
      S.q("<span class='ltr'>(xy)'</span> =", [["<span class='ltr'>x' + y'</span>", true, "دي مورغان."], ["<span class='ltr'>x'y'</span>", "formula", "هذا (x + y)'."], ["<span class='ltr'>x + y</span>", "conceptual", "نسيت المتممات."]]),
      S.q("<span class='ltr'>x + xy</span> =", [["x", true, "الامتصاص."], ["xy", "conceptual", "x يمتص xy."], ["1", "conceptual", "ليس دائمًا 1."]])
    ],
    practice: {
      prompt: "احسب قيمة العبارات عند " + m("x = 1, y = 0, z = 1") + ".",
      steps: [
        S.step("s1", m("(x + y)'"), "=", 0, { hints: ["x + y = 1."], sol: "0" }),
        S.step("s2", m("x' + yz"), "=", 0, { hints: ["x' = 0، yz = 0."], sol: "0" }),
        S.step("s3", m("x + x'y'z"), "=", 1, { hints: ["x = 1 يكفي."], sol: "1" })
      ]
    }
  });

  /* ================= 2. Boolean functions ================= */
  S.lesson({
    id: "ld-ch2-2", course: C, chapter: CH, ar: "الدوال البوليانية: جدول الحقيقة والتبسيط والمتمم", en: "Boolean Functions: Truth Tables, Simplification and Complement", min: 35,
    obj: ["تكتب جدول الحقيقة لدالة وترسم دائرتها.", "تبسّط دالة جبريًا إلى أقل عدد من الحروف (literals).", "تجد متمم دالة بدي مورغان أو بالثنائية."],
    idea: [
      "الدالة البوليانية علاقة بين متغيرات ثنائية، وقيمتها تُعرف لكل تركيب ممكن: جدول الحقيقة فيه " + m("2<sup>n</sup>") + " صفًا (من 0 إلى " + m("2<sup>n</sup> − 1") + "). ويمكن تحويل العبارة إلى <b>مخطط دائرة منطقية</b>.",
      "<b>تقليل عدد الحدود والحروف</b> في العبارة يعطي دائرة أبسط (بوابات أقل ومداخل أقل). نستخدم النظريات، ومن أهمها نظرية <b>التوافق</b> (consensus): " + m("xy + x'z + yz = xy + x'z") + ".",
      "<b>متمم الدالة</b> F' بدي مورغان المعمم: " + m("(A + B + C + …)' = A'B'C'…") + " و " + m("(ABC…)' = A' + B' + C' + …") + ". وطريقة أسهل: نأخذ <b>ثنائي</b> الدالة ثم نعكس كل حرف."
    ],
    figs: [H("<div class='lgrow'>" + G.tt(XYZ, [{ h: "F<sub>2</sub>", f: "x'y'z + x'yz + xy'" }]) + G.gates({ terms: [["x'", "z"], ["x", "y'"]], out: "F2" }) + "</div>")],
    laws: ["x(x' + y) = xy      x + x'y = x + y", "(x + y)(x + y') = x", "xy + x'z + yz = xy + x'z   (التوافق)", "F' = ثنائي F مع عكس كل حرف"],
    when: ["قبل رسم الدائرة: بسّط أولًا.", "تحقق دائمًا من التبسيط بجدول الحقيقة: يجب أن يتطابق العمود الأصلي والمبسط."],
    ex: [
      { q: "للدالة " + m("F<sub>1</sub> = x + y'z") + ": اكتب جدول الحقيقة وارسم الدائرة.",
        s: ["F1 = 1 عندما x = 1 (الصفوف 4 إلى 7) أو y = 0 و z = 1 (الصف 1).", "الصفوف الصحيحة: 1، 4، 5، 6، 7.", "الدائرة: بوابة NOT لـ y، وبوابة AND لـ y'z، ثم OR مع x."],
        fig: H("<div class='lgrow'>" + G.tt(XYZ, [{ h: "F<sub>1</sub>", f: "x + y'z" }], { hl: [1, 4, 5, 6, 7] }) + G.gates({ terms: [["x"], ["y'", "z"]], out: "F1" }) + "</div>") },
      { q: "بسّط " + m("F<sub>2</sub> = x'y'z + x'yz + xy'") + " وتحقق بجدول الحقيقة.",
        s: [m("x'y'z + x'yz = x'z(y' + y) = x'z") + ".", "إذن " + m("F<sub>2</sub> = x'z + xy'") + ": حدان بأربعة حروف بدل ثلاثة حدود بثمانية.", "جدول الحقيقة للعبارتين متطابق: الصفوف 1، 3، 4، 5."],
        fig: H(G.tt(XYZ, [{ h: "الأصل", f: "x'y'z + x'yz + xy'" }, { h: "x'z+xy'", f: "x'z + xy'" }])) },
      { q: "بسّط: " + m("x(x' + y)") + "، " + m("x + x'y") + "، " + m("(x + y)(x + y')") + "، " + m("xy + x'z + yz") + ".",
        s: [m("x(x' + y) = xx' + xy = xy") + ".", m("x + x'y = (x + x')(x + y) = x + y") + ".", m("(x + y)(x + y') = x + yy' = x") + ".", m("xy + x'z + yz(x + x') = xy + x'z + xyz + x'yz = xy(1 + z) + x'z(1 + y) = xy + x'z") + "."] },
      { q: "أوجد متمم " + m("F<sub>1</sub> = x'yz' + x'y'z") + " و " + m("F<sub>2</sub> = x(y'z' + yz)") + ".",
        s: [m("F<sub>1</sub>' = (x'yz')'(x'y'z)' = (x + y' + z)(x + y + z')") + ".", m("F<sub>2</sub>' = x' + (y'z' + yz)' = x' + (y + z)(y' + z')") + ".", "وبالثنائية: ثنائي F1 هو " + m("(x' + y + z')(x' + y' + z)") + "، وبعكس كل حرف نصل لنفس F1'."] }
    ],
    real: "كل حرف ناقص في العبارة يعني مدخل بوابة أقل، وكل حد ناقص يعني بوابة أقل؛ في شريحة فيها ملايين البوابات هذا فرق كبير في الحجم والسرعة والطاقة.",
    quiz: [
      S.q("<span class='ltr'>x + x'y</span> =", [["<span class='ltr'>x + y</span>", true, "التوزيع ثم x + x' = 1."], ["<span class='ltr'>xy</span>", "formula", "هذا x(x' + y)."], ["x", "conceptual", "y تبقى."]]),
      S.q("عدد صفوف جدول حقيقة دالة بأربعة متغيرات:", [["16", true, "2⁴."], ["8", "formula", "هذا لثلاثة."], ["4", "formula", "2⁴ وليس 4."]]),
      S.q("متمم <span class='ltr'>xy + z</span>:", [["<span class='ltr'>(x' + y')z'</span>", true, "دي مورغان."], ["<span class='ltr'>x'y' + z'</span>", "formula", "تتبدل العمليات أيضًا."], ["<span class='ltr'>x' + y' + z'</span>", "formula", "z' تُضرب."]])
    ],
    practice: {
      prompt: "الدالة " + m("F = xy + xy' + x'z") + ".",
      steps: [
        S.step("s1", "كم صفًا تكون فيه F = 1؟", "=", G.minterms("xy + xy' + x'z", XYZ).length, { hints: ["xy + xy' = x."], sol: "F = x + x'z = x + z: الصفوف 1، 3، 4، 5، 6، 7 ⇒ 6." }),
        S.step("s2", "عدد الحروف في أبسط صورة.", "=", 2, { hints: ["x + z."], sol: "2 (x و z)." }),
        S.step("s3", "قيمة F' عند x = 0، y = 1، z = 0.", "=", 1, { hints: ["F = x + z = 0."], sol: "F' = 1." })
      ]
    }
  });

  /* ================= 3. Canonical forms ================= */
  var f1 = [1, 4, 7], f2 = [3, 5, 6, 7];
  function mmTable() { var rows = []; for (var k = 0; k < 8; k++) { var b = G.bits(k, 3), t = "", M = []; for (var i = 0; i < 3; i++) { t += XYZ[i] + (b[i] === "1" ? "" : "'"); M.push(XYZ[i] + (b[i] === "1" ? "'" : "")); } rows.push([b, t, "m" + k, M.join(" + "), "M" + k]); } return G.table(["xyz", "Minterm", "", "Maxterm", ""], rows, { small: true }); }
  S.lesson({
    id: "ld-ch2-3", course: C, chapter: CH, ar: "الصيغ القانونية: Minterms و Maxterms", en: "Canonical Forms: Minterms and Maxterms", min: 35,
    obj: ["تكتب الحد الأصغر (minterm) والحد الأكبر (maxterm) لكل صف.", "تعبر عن دالة كمجموع minterms وكحاصل ضرب maxterms.", "تحوّل بين الصيغتين."],
    idea: [
      "<b>الحد الأصغر</b> m<sub>j</sub> حد AND فيه كل المتغيرات: المتغير بدون شرطة إذا كان بته 1 وبشرطة إذا كان 0، و j رقم الصف العشري. مثلًا عند xyz = 101: " + m("m<sub>5</sub> = xy'z") + ". و<b>الحد الأكبر</b> M<sub>j</sub> حد OR بالعكس: " + m("M<sub>5</sub> = x' + y + z'") + ".",
      "أي دالة = <b>مجموع الـ minterms</b> للصفوف التي فيها 1، أو = <b>حاصل ضرب الـ maxterms</b> للصفوف التي فيها 0. وهاتان الصيغتان القانونيتان. ودائمًا " + m("m<sub>j</sub>' = M<sub>j</sub>") + ".",
      "للتحويل من صيغة لأخرى: نبدّل Σ بـ Π ونكتب الأرقام الغائبة. ولتحويل عبارة إلى SOM: كل حد ينقصه متغير x نضربه في " + m("(x + x')") + "؛ وإلى POM: كل حد OR ينقصه x نجمع له " + m("xx'") + " ونوزّع."
    ],
    figs: [H(mmTable())],
    laws: ["F = Σ m<sub>j</sub> (صفوف الـ 1)      F = Π M<sub>j</sub> (صفوف الـ 0)", "m<sub>j</sub>' = M<sub>j</sub>", "F(x,y,z) = Σ(1,4,7) ⇔ Π(0,2,3,5,6)", "F' = Σ (الأرقام الغائبة من F)"],
    when: ["الصيغة القانونية تأتي مباشرة من جدول الحقيقة.", "اختر الصيغة الأقصر: إذا كانت الآحاد أقل من النصف فـ Σ أقصر."],
    ex: [
      { q: "من جدول الحقيقة: " + m("f<sub>1</sub>") + " = 1 في الصفوف 1، 4، 7، و " + m("f<sub>2</sub>") + " = 1 في 3، 5، 6، 7. اكتبهما مجموع minterms.",
        s: [m("f<sub>1</sub> = x'y'z + xy'z' + xyz = m<sub>1</sub> + m<sub>4</sub> + m<sub>7</sub>") + ".", m("f<sub>2</sub> = x'yz + xy'z + xyz' + xyz = m<sub>3</sub> + m<sub>5</sub> + m<sub>6</sub> + m<sub>7</sub>") + "."],
        fig: H(G.tt(XYZ, [{ h: "f<sub>1</sub>", f: f1.reduce(function (a, k) { a[k] = 1; return a; }, [0, 0, 0, 0, 0, 0, 0, 0]) }, { h: "f<sub>2</sub>", f: f2.reduce(function (a, k) { a[k] = 1; return a; }, [0, 0, 0, 0, 0, 0, 0, 0]) }], { m: true })) },
      { q: "أوجد " + m("f<sub>1</sub>'") + " من الجدول، ثم اكتب " + m("f<sub>1</sub>") + " حاصل ضرب maxterms.",
        s: [m("f<sub>1</sub>' = x'y'z' + x'yz' + x'yz + xy'z + xyz'") + " (صفوف الـ 0: 0، 2، 3، 5، 6).", "بأخذ المتمم ودي مورغان: " + m("f<sub>1</sub> = (x + y + z)(x + y' + z)(x + y' + z')(x' + y + z')(x' + y' + z)") + ".", m("= M<sub>0</sub>M<sub>2</sub>M<sub>3</sub>M<sub>5</sub>M<sub>6</sub>") + "، وبالمثل " + m("f<sub>2</sub> = M<sub>0</sub>M<sub>1</sub>M<sub>2</sub>M<sub>4</sub>") + "."] },
      { q: "اكتب " + m("F = xy + x'z") + " حاصل ضرب maxterms.",
        s: ["بالتوزيع: " + m("F = (xy + x')(xy + z) = (x + x')(y + x')(x + z)(y + z) = (x' + y)(x + z)(y + z)") + ".", "نكمل كل حد: " + m("(x' + y + zz')(x + z + yy')(y + z + xx')") + ".", "بعد التوزيع وحذف المكرر: " + m("(x + y + z)(x + y' + z)(x' + y + z)(x' + y + z') = M<sub>0</sub>M<sub>2</sub>M<sub>4</sub>M<sub>5</sub>") + ".", m("F = Π(0, 2, 4, 5)") + "، وتحقق: الآحاد في 1، 3، 6، 7."] }
    ],
    real: "أدوات التصميم تأخذ جدول حقيقة من المهندس (مثلًا لوحدة تحكم) وتكتبه أولًا بالصيغة القانونية ثم تبسّطه آليًا.",
    quiz: [
      S.q("<span class='ltr'>m<sub>6</sub></span> لثلاثة متغيرات x y z:", [["<span class='ltr'>xyz'</span>", true, "110."], ["<span class='ltr'>x'y'z</span>", "conceptual", "هذا m1."], ["<span class='ltr'>x' + y' + z</span>", "conceptual", "هذا M6."]]),
      S.q("<span class='ltr'>F = Σ(0, 2, 5)</span> لثلاثة متغيرات = Π(…)", [["<span class='ltr'>Π(1, 3, 4, 6, 7)</span>", true, "الأرقام الغائبة."], ["<span class='ltr'>Π(0, 2, 5)</span>", "conceptual", "Π تأخذ صفوف الـ 0."], ["<span class='ltr'>Π(1, 3, 4)</span>", "math", "نسيت 6 و 7."]]),
      S.q("<span class='ltr'>m<sub>3</sub>'</span> =", [["<span class='ltr'>M<sub>3</sub></span>", true, "دي مورغان."], ["<span class='ltr'>m<sub>4</sub></span>", "conceptual", "ليس الرقم المتمم."], ["<span class='ltr'>M<sub>4</sub></span>", "conceptual", "نفس الرقم."]])
    ],
    practice: {
      prompt: "الدالة " + m("F(x, y, z) = x + y'z") + ".",
      steps: [
        S.step("s1", "كم minterm في F؟", "=", G.minterms("x + y'z", XYZ).length, { hints: ["x يغطي 4 صفوف، و y'z يضيف m1."], sol: "Σ(1, 4, 5, 6, 7) ⇒ 5." }),
        S.step("s2", "أصغر رقم maxterm في F.", "=", 0, { hints: ["صفوف الـ 0: 0، 2، 3."], sol: "M0." }),
        S.step("s3", "كم maxterm في F؟", "=", 3, { hints: ["8 − 5."], sol: "Π(0, 2, 3) ⇒ 3." })
      ]
    }
  });

  /* ================= 4. Standard forms and logic gates ================= */
  S.lesson({
    id: "ld-ch2-4", course: C, chapter: CH, ar: "الصيغ المعيارية والبوابات المنطقية", en: "Standard Forms and Digital Logic Gates", min: 30,
    obj: ["تفرّق بين SOP و POS وتنفذهما بمستويين.", "تعرف البوابات الثماني ورموزها وجداولها.", "تعرف دوال المتغيرين الست عشرة وعائلات الدوائر المتكاملة."],
    idea: [
      "الصيغ القانونية نادرًا ما تكون الأقصر، فنستخدم <b>الصيغ المعيارية</b>: <b>مجموع حواصل ضرب</b> (SOP) حدودها AND بأي عدد من الحروف ثم OR واحدة، و<b>حاصل ضرب مجاميع</b> (POS) حدودها OR ثم AND واحدة. كلاهما <b>تنفيذ بمستويين</b> يعطي أقل تأخير. أما " + m("F<sub>3</sub> = AB + C(D + E)") + " فثلاثة مستويات، وبالتوزيع تصير " + m("AB + CD + CE") + " بمستويين.",
      "مع n متغير يوجد " + m("2<sup>2<sup>n</sup></sup>") + " دالة؛ لمتغيرين 16 دالة منها AND و OR و XOR و NOR و NAND والتكافؤ والمتمم. والبوابات الشائعة: AND، OR، NOT، Buffer، NAND، NOR، XOR، XNOR.",
      "تمتد البوابات لأكثر من مدخلين (إلا NOT و Buffer). و XOR بثلاثة مداخل أو أكثر <b>دالة فردية</b>: تساوي 1 إذا كان عدد الآحاد في المداخل فرديًا. والدوائر المتكاملة تأتي بعائلات: TTL و ECL و MOS و CMOS."
    ],
    figs: [H(G.gateRow(["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"])), H(G.tt(["x", "y"], [{ h: "AND", f: "xy" }, { h: "OR", f: "x+y" }, { h: "NAND", f: "(xy)'" }, { h: "NOR", f: "(x+y)'" }, { h: "XOR", f: "x⊕y" }, { h: "XNOR", f: "(x⊕y)'" }]))],
    laws: ["SOP: F = Σ (حدود AND)  ⇐ AND-OR", "POS: F = Π (حدود OR)  ⇐ OR-AND", "x ⊕ y = xy' + x'y      (x ⊕ y)' = xy + x'y'", "x ⊕ y ⊕ z = 1 ⇔ عدد الآحاد فردي", "عدد دوال n متغير = 2<sup>2<sup>n</sup></sup>"],
    when: ["إذا كانت الدالة متعددة المستويات وتريد سرعة: حوّلها إلى SOP أو POS.", "XOR في المجمّعات ودوائر التماثل لأنها تكشف الفردية."],
    ex: [
      { q: "ارسم دوائر " + m("F<sub>1</sub> = y' + xy + x'yz'") + " و " + m("F<sub>2</sub> = x(y' + z)(x' + y + z')") + ".",
        s: ["F1 بصيغة SOP: ثلاثة حدود (y' وحده، xy، x'yz') تدخل بوابة OR: AND-OR.", "F2 بصيغة POS: ثلاثة حدود (x، y' + z، x' + y + z') تدخل بوابة AND: OR-AND."],
        fig: H("<div class='lgrow'>" + G.gates({ terms: [["y'"], ["x", "y"], ["x'", "y", "z'"]], out: "F1" }) + G.gates({ terms: [["x"], ["y'", "z"], ["x'", "y", "z'"]], out: "F2", kind: "OR-AND" }) + "</div>") },
      { q: "جدول حقيقة XOR بثلاثة مداخل " + m("F = x ⊕ y ⊕ z") + ".",
        s: ["نحسب x ⊕ y ثم نأخذ XOR مع z.", "F = 1 في الصفوف التي فيها عدد فردي من الآحاد: 001، 010، 100، 111.", "إذن " + m("F = Σ(1, 2, 4, 7)") + "."],
        fig: H(G.tt(XYZ, [{ h: "x⊕y", f: "x⊕y" }, { h: "F", f: "x⊕y⊕z" }], { hl: [1, 2, 4, 7] })) }
    ],
    real: "الشريحة 7400 تحوي أربع بوابات NAND بمدخلين، وهي من أول ما تستخدمه في معمل التصميم المنطقي على جهاز الـ Trainer.",
    quiz: [
      S.q("<span class='ltr'>AB + CD + CE</span> صيغة:", [["SOP بمستويين", true, "حدود AND ثم OR."], ["POS", "conceptual", "حدودها ضرب."], ["ثلاثة مستويات", "conceptual", "بعد التوزيع مستويان."]]),
      S.q("XOR بأربعة مداخل خرجها 1 عند المدخل 1101:", [["نعم", true, "ثلاثة آحاد: فردي."], ["لا", "conceptual", "العدد فردي."], ["غير معرّف", "conceptual", "XOR معرفة لأي عدد مداخل."]]),
      S.q("عدد دوال متغيرين:", [["16", true, "2^(2²)."], ["4", "formula", "هذا عدد الصفوف."], ["8", "formula", "2^(2²) = 16."]])
    ],
    practice: {
      prompt: "الدالة " + m("F = (x ⊕ y)z") + ".",
      steps: [
        S.step("s1", "كم صفًا تكون فيه F = 1؟", "=", G.minterms("(x⊕y)z", XYZ).length, { hints: ["x ≠ y و z = 1."], sol: "011 و 101 ⇒ 2." }),
        S.step("s2", "أكبر رقم minterm فيها.", "=", 5, { hints: ["101."], sol: "m5." }),
        S.step("s3", "عدد البوابات في التنفيذ المباشر (XOR ثم AND).", "=", 2, { hints: ["بوابتان."], sol: "2." })
      ]
    }
  });
})();
