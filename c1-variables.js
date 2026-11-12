/* Circuits 1 — Chapter 1: Circuit Variables
   Four lessons following the course description:
   Circuit Analysis: An Overview · Voltage and Current · The Ideal Basic Circuit Element · Power and Energy
   Every number in the examples and practice problems is computed exactly; `answer` values are in SI base units.
   Practice problems and examples are written for CircuitVision (not copied from a textbook). */
(function () {
  "use strict";
  var L = (window.CV = window.CV || {}).lessons = window.CV.lessons || {};

  /* Element diagram: two-terminal box, polarity marks on the left, current arrow on the top lead.
     plusTop: "+" mark at the top terminal. arrow: "down" (into the top terminal) or "up" (out of it). */
  function elem(o) {
    var plusY = o.plusTop ? 78 : 136, minusY = o.plusTop ? 136 : 78;
    var arr = o.arrow === "down" ? "M103 28 L117 28 L110 40 Z" : "M103 40 L117 40 L110 28 Z";
    return '<svg class="dg" viewBox="0 0 240 200" role="img" aria-label="' + (o.aria || "عنصر دائرة بطرفين") + '">' +
      '<path class="dg-w" d="M110 12 V60 M110 140 V188"/>' +
      '<circle class="dg-t" cx="110" cy="12" r="4"/><circle class="dg-t" cx="110" cy="188" r="4"/>' +
      '<rect class="dg-box" x="80" y="60" width="60" height="80" rx="6"/>' +
      '<text class="dg-pol" x="62" y="' + plusY + '" text-anchor="middle">+</text>' +
      '<text class="dg-pol" x="62" y="' + minusY + '" text-anchor="middle">−</text>' +
      '<text class="dg-lbl" x="40" y="111" text-anchor="middle">' + (o.v || "v") + '</text>' +
      '<path class="dg-arrow" d="' + arr + '"/>' +
      '<text class="dg-lbl" x="126" y="40">' + (o.i || "i") + '</text>' +
      (o.name ? '<text class="dg-sub" x="110" y="105" text-anchor="middle">' + o.name + '</text>' : '') +
      '</svg>';
  }
  window.CV.elemDiagram = elem;

  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };

  /* ------------------------------------------------------------------ */
  L["c1-variables-1"] = {
    id: "c1-variables-1", ar: "نظرة عامة على تحليل الدوائر", en: "Circuit Analysis: An Overview", minutes: 15,
    objectives: [
      "تعرف ما هو نموذج الدائرة ولماذا نستخدمه.",
      "تعرف متى يصح تحليل الدائرة بالنموذج المجمّع (Lumped).",
      "تستخدم وحدات SI وبادئاتها بدون أخطاء تحويل."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>الدائرة الكهربائية الحقيقية (شاحن جوال، لوحة تحكم، شبكة كهرباء) معقدة جدًا. لذلك لا نحللها كما هي، بل نبني لها <b>نموذج دائرة</b> <span class='ltr'>(circuit model)</span>: مجموعة من <b>العناصر المثالية</b> المتصلة ببعضها، كل عنصر منها يوصف بمعادلة رياضية بسيطة.</p>" +
        "<p>نظرية الدوائر هي حالة خاصة من نظرية المجال الكهرومغناطيسي. تصح عندما تكون أبعاد الدائرة صغيرة جدًا مقارنة بطول موجة الإشارة. عندها نعتبر أن الإشارة تصل إلى كل نقاط السلك في نفس اللحظة، ويسمى هذا <b>النموذج المجمّع</b> <span class='ltr'>(lumped model)</span>.</p>" +
        "<div class='flow'><span>النظام الحقيقي</span><i>←</i><span>نموذج الدائرة</span><i>←</i><span>التحليل الرياضي</span><i>←</i><span>المقارنة بالقياس</span></div>" +
        "<p class='muted'>الخطوة الأخيرة مهمة: إذا اختلفت نتيجة التحليل عن القياس كثيرًا، فالخطأ غالبًا في النموذج نفسه وليس في الحساب.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'>" +
        "<dt>Circuit model</dt><dd>تمثيل مبسّط للنظام الحقيقي بعناصر مثالية.</dd>" +
        "<dt>Ideal circuit element</dt><dd>عنصر نظري يوصف بعلاقة رياضية دقيقة بين الجهد والتيار.</dd>" +
        "<dt>Lumped-parameter system</dt><dd>نظام أبعاده صغيرة جدًا مقارنة بطول الموجة، فيصح تحليله بنظرية الدوائر.</dd>" +
        "<dt>SI units</dt><dd>النظام الدولي للوحدات، وهو أساس كل الحسابات الهندسية.</dd>" +
        "</dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq'>λ = c / f</div>" +
        "<table class='tbl'><thead><tr><th>الرمز</th><th>المعنى</th><th>الوحدة</th></tr></thead><tbody>" +
        "<tr><td class='ltr'>λ</td><td>طول الموجة <span class='ltr'>(wavelength)</span></td><td class='ltr'>m</td></tr>" +
        "<tr><td class='ltr'>c</td><td>سرعة الضوء ≈ <span class='ltr'>3 × 10⁸</span></td><td class='ltr'>m/s</td></tr>" +
        "<tr><td class='ltr'>f</td><td>التردد <span class='ltr'>(frequency)</span></td><td class='ltr'>Hz</td></tr></tbody></table>" +
        "<p><b>البادئات الأكثر استخدامًا</b> <span class='ltr'>(SI prefixes)</span></p>" +
        "<div class='prefixes ltr'><span><b>p</b>10⁻¹²</span><span><b>n</b>10⁻⁹</span><span><b>µ</b>10⁻⁶</span><span><b>m</b>10⁻³</span><span><b>k</b>10³</span><span><b>M</b>10⁶</span><span><b>G</b>10⁹</span><span><b>T</b>10¹²</span></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>قبل أي تحليل، تأكد أن النموذج المجمّع صالح: أبعاد الدائرة أصغر بكثير من <span class='ltr'>λ</span>. قاعدة عملية: أقل من عُشر طول الموجة تقريبًا.</li>" +
        "<li>عند الترددات المنخفضة مثل <span class='ltr'>60 Hz</span> يكون <span class='ltr'>λ</span> آلاف الكيلومترات، فكل الدوائر العادية تعتبر lumped.</li>" +
        "<li>عند الترددات العالية جدًا (GHz) قد يكون مسار بطول بضعة سنتيمترات غير صغير، ونحتاج نظرية خطوط النقل بدلًا من نظرية الدوائر.</li>" +
        "<li>حوّل كل القيم إلى وحدات SI الأساسية قبل التعويض. معظم أخطاء الطلاب في هذا الفصل أخطاء بادئات وليست أخطاء فهم.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>شبكة الكهرباء في السعودية تعمل بتردد <span class='ltr'>60 Hz</span>. احسب طول الموجة، ثم قارنه بطول الموجة عند <span class='ltr'>1 GHz</span>.</p>" +
        "<ol class='steps'>" +
        "<li><b>اختيار القانون:</b> المطلوب طول موجة من تردد معلوم، فنستخدم <span class='eq-i'>λ = c / f</span>.</li>" +
        "<li><b>التعويض عند 60 Hz:</b> <span class='eq-i'>λ = (3 × 10⁸) / 60 = 5 × 10⁶ m = 5000 km</span>.</li>" +
        "<li><b>التعويض عند 1 GHz:</b> حوّل أولًا <span class='eq-i'>1 GHz = 10⁹ Hz</span>، ثم <span class='eq-i'>λ = (3 × 10⁸) / 10⁹ = 0.3 m = 30 cm</span>.</li>" +
        "<li><b>التفسير:</b> عند 60 Hz أي دائرة في مبنى أو جهاز أصغر بكثير من 5000 km، فهي lumped. أما عند 1 GHz فمسار طوله 10 cm يساوي ثلث طول الموجة، فلا يصح اعتباره lumped.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مهندسو تصميم لوحات الدوائر المطبوعة <span class='ltr'>(PCB)</span> في أجهزة Wi-Fi والجوالات يتعاملون مع هذه المشكلة يوميًا: مسار نحاسي بطول بضعة سنتيمترات يتصرف كخط نقل عند <span class='ltr'>2.4 GHz</span>، فيصممون عرضه وطوله بحسابات خاصة. أما فني الكهرباء الذي يمدد أسلاك منزل فلا يحتاج ذلك أبدًا، لأن 60 Hz تجعل كل أسلاك المبنى lumped.</p>" }
    ],
    quiz: [
      { q: "مقاومة قيمتها <span class='ltr'>4.7 kΩ</span>. كم قيمتها بالأوم؟", options: [
        { t: "<span class='ltr'>4700 Ω</span>", correct: true, why: "k تعني 10³، إذن 4.7 × 1000 = 4700 Ω." },
        { t: "<span class='ltr'>470 Ω</span>", type: "unit", why: "ضربت في 100 بدل 1000. البادئة k تعني 10³." },
        { t: "<span class='ltr'>0.0047 Ω</span>", type: "unit", why: "قسمت بدل أن تضرب. k تكبّر القيمة: 4.7 kΩ = 4.7 × 10³ Ω." }
      ]},
      { q: "أي بادئة تساوي <span class='ltr'>10⁻⁶</span>؟", options: [
        { t: "<span class='ltr'>m</span> (milli)", type: "unit", why: "milli تساوي 10⁻³ وليس 10⁻⁶." },
        { t: "<span class='ltr'>µ</span> (micro)", correct: true, why: "micro = 10⁻⁶." },
        { t: "<span class='ltr'>n</span> (nano)", type: "unit", why: "nano تساوي 10⁻⁹." }
      ]},
      { q: "متى يصح تحليل الدائرة بالنموذج المجمّع (lumped)؟", options: [
        { t: "عندما يكون الجهد منخفضًا", type: "conceptual", why: "قيمة الجهد لا تحدد صلاحية النموذج. المعيار هو أبعاد الدائرة مقارنة بطول الموجة." },
        { t: "عندما تكون أبعاد الدائرة أصغر بكثير من طول الموجة", correct: true, why: "عندها تصل الإشارة لكل نقاط الدائرة في نفس اللحظة تقريبًا." },
        { t: "دائمًا، في كل الدوائر", type: "conceptual", why: "عند الترددات العالية جدًا لا يصح النموذج المجمّع ونحتاج نظرية المجال أو خطوط النقل." }
      ]},
      { q: "تيار قيمته <span class='ltr'>250 mA</span> يساوي:", options: [
        { t: "<span class='ltr'>2.5 A</span>", type: "unit", why: "قسمت على 100 بدل 1000. m = 10⁻³." },
        { t: "<span class='ltr'>0.25 A</span>", correct: true, why: "250 × 10⁻³ = 0.25 A." },
        { t: "<span class='ltr'>250 000 A</span>", type: "unit", why: "ضربت في 1000 بدل القسمة. milli تصغّر القيمة." }
      ]}
    ],
    practice: {
      prompt: "دائرة راوتر Wi-Fi تعمل بتردد <span class='ltr'>2.4 GHz</span>، وفيها مسار نحاسي طوله <span class='ltr'>5 cm</span>. هل يصح تحليل هذا المسار كجزء من دائرة lumped؟ حلّها على خطوات. استخدم <span class='ltr'>c = 3 × 10⁸ m/s</span>.",
      steps: [
        { id: "s1", label: "احسب طول الموجة <span class='ltr'>λ</span>.", symbol: "λ =", answer: 0.125,
          units: [{ l: "mm", f: 1e-3 }, { l: "cm", f: 1e-2 }, { l: "m", f: 1 }, { l: "km", f: 1e3 }], unitDefault: 2,
          diagnose: [
            { value: 8, type: "formula", why: "قسمت التردد على سرعة الضوء <span class='ltr'>(f / c)</span>. القانون الصحيح <span class='ltr'>λ = c / f</span>، ويمكنك التحقق بالوحدات: <span class='ltr'>(m/s) ÷ (1/s) = m</span>.", review: R("c1-variables-1", "laws", "القوانين والوحدات"), hint: "اكتب القانون بالوحدات أولًا وتأكد أن الناتج بالمتر." },
            { value: 125, type: "unit", why: "عوّضت التردد كأنه <span class='ltr'>2.4 MHz</span>. البادئة G تعني <span class='ltr'>10⁹</span>، أي <span class='ltr'>f = 2.4 × 10⁹ Hz</span>.", review: R("c1-variables-1", "laws", "جدول البادئات"), hint: "اكتب f بالهيرتز كاملة قبل التعويض." }
          ],
          hints: ["المطلوب طول موجة وعندك التردد. ما القانون الذي يربطهما؟", "<span class='ltr'>λ = c / f</span>، مع <span class='ltr'>f = 2.4 × 10⁹ Hz</span>."],
          solution: "<span class='eq-i'>λ = (3 × 10⁸) / (2.4 × 10⁹) = 0.125 m = 12.5 cm</span>" },
        { id: "s2", label: "احسب النسبة بين طول المسار وطول الموجة <span class='ltr'>d / λ</span>.", symbol: "d / λ =", answer: 0.4,
          units: [{ l: "(بدون وحدة)", f: 1 }],
          diagnose: [
            { value: 2.5, type: "substitution", why: "عكست النسبة فحسبت <span class='ltr'>λ / d</span>. المطلوب طول المسار مقسومًا على طول الموجة.", hint: "البسط هو طول المسار d." },
            { value: 0.04, type: "unit", why: "حوّلت 5 cm إلى 0.005 m. التحويل الصحيح: <span class='ltr'>5 cm = 0.05 m</span> لأن <span class='ltr'>c = 10⁻²</span>.", hint: "اكتب الطولين بنفس الوحدة قبل القسمة." },
            { value: 40, type: "unit", why: "قسمت 5 (بالسنتيمتر) على 0.125 (بالمتر). اكتب الطولين بنفس الوحدة قبل القسمة.", hint: "<span class='ltr'>5 cm = 0.05 m</span>." }
          ],
          hints: ["حوّل الطولين لنفس الوحدة.", "<span class='ltr'>d = 0.05 m</span> و <span class='ltr'>λ = 0.125 m</span>."],
          solution: "<span class='eq-i'>d / λ = 0.05 / 0.125 = 0.4</span>" },
        { id: "s3", kind: "choice", label: "هل يصح اعتبار هذا المسار جزءًا من دائرة lumped؟",
          options: [
            { t: "نعم، لأن طول المسار أقل من طول الموجة", type: "conceptual", why: "أن يكون أقل لا يكفي. يجب أن يكون <b>أصغر بكثير</b> (أقل من عُشر λ تقريبًا). هنا المسار يساوي 40% من λ.", review: R("c1-variables-1", "when", "متى نستخدم النموذج المجمّع") },
            { t: "لا، لأن طوله يساوي 0.4 من طول الموجة، وهذا ليس صغيرًا", correct: true },
            { t: "يعتمد على قيمة الجهد في المسار", type: "conceptual", why: "صلاحية النموذج المجمّع لا تعتمد على الجهد، بل على أبعاد الدائرة مقارنة بطول الموجة.", review: R("c1-variables-1", "concept", "الفكرة") }
          ],
          hints: ["القاعدة العملية: أبعاد الدائرة أقل من عُشر طول الموجة تقريبًا."],
          solution: "لا. النسبة 0.4 أكبر بكثير من 0.1، فالمسار يتصرف كخط نقل ولا يصح تحليله كدائرة lumped." }
      ]
    },
    lab: { title: "قياس تأثير التردد", desc: "في المعمل الذكي ستغيّر تردد مصدر جيبي وتلاحظ متى تبقى نتائج تحليل الدائرة صحيحة." }
  };

  /* ------------------------------------------------------------------ */
  L["c1-variables-2"] = {
    id: "c1-variables-2", ar: "الجهد والتيار", en: "Voltage and Current", minutes: 20,
    objectives: [
      "تعرّف الشحنة والجهد والتيار ووحدات كل منها.",
      "تحسب التيار من الشحنة، والجهد من الطاقة والشحنة.",
      "تفهم معنى اتجاه المرجع للتيار وقطبية المرجع للجهد."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>كل الظواهر الكهربائية سببها <b>الشحنة</b> <span class='ltr'>(charge)</span>، ووحدتها الكولوم <span class='ltr'>(C)</span>. شحنة الإلكترون <span class='ltr'>−1.6022 × 10⁻¹⁹ C</span>.</p>" +
        "<p><b>فصل</b> الشحنات يحتاج طاقة، وينتج عنه <b>جهد</b> <span class='ltr'>(voltage)</span>: الطاقة لكل وحدة شحنة. و<b>حركة</b> الشحنات تنتج <b>تيارًا</b> <span class='ltr'>(current)</span>: معدل مرور الشحنة عبر مقطع.</p>" +
        "<p>عند رسم دائرة نحدد <b>اتجاه مرجع</b> للتيار (سهم) و<b>قطبية مرجع</b> للجهد (+ و −) قبل أن نعرف القيم الفعلية. إذا خرجت قيمة التيار سالبة، فهذا يعني أن التيار الفعلي عكس السهم، وليس أن الحل خطأ.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Charge (q)</dt><dd>كمية الشحنة، بالكولوم C.</dd>" +
        "<dt>Voltage (v)</dt><dd>الطاقة اللازمة لنقل وحدة شحنة بين نقطتين، بالفولت <span class='ltr'>V = J/C</span>.</dd>" +
        "<dt>Current (i)</dt><dd>معدل تدفق الشحنة، بالأمبير <span class='ltr'>A = C/s</span>.</dd>" +
        "<dt>Reference direction</dt><dd>اتجاه نختاره للتيار على الرسم. الإشارة السالبة تعني أن الاتجاه الفعلي معاكس.</dd>" +
        "<dt>Reference polarity</dt><dd>علامتا + و − نختارهما للجهد بين طرفين.</dd></dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq-row'><div class='eq'>v = dw / dq</div><div class='eq'>i = dq / dt</div></div>" +
        "<p>عندما تكون القيم ثابتة مع الزمن تصبح العلاقات بسيطة:</p>" +
        "<div class='eq-row'><div class='eq'>V = W / Q</div><div class='eq'>I = Q / t</div></div>" +
        "<table class='tbl'><thead><tr><th>الرمز</th><th>المعنى</th><th>الوحدة</th></tr></thead><tbody>" +
        "<tr><td class='ltr'>w, W</td><td>الطاقة</td><td class='ltr'>J</td></tr><tr><td class='ltr'>q, Q</td><td>الشحنة</td><td class='ltr'>C</td></tr>" +
        "<tr><td class='ltr'>t</td><td>الزمن</td><td class='ltr'>s</td></tr><tr><td class='ltr'>v</td><td>الجهد</td><td class='ltr'>V = J/C</td></tr>" +
        "<tr><td class='ltr'>i</td><td>التيار</td><td class='ltr'>A = C/s</td></tr></tbody></table>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>إذا أُعطيت كمية شحنة تمر خلال زمن، استخدم <span class='eq-i'>I = Q / t</span>، والزمن بالثواني دائمًا.</li>" +
        "<li>إذا أُعطيت الشحنة كدالة في الزمن <span class='ltr'>q(t)</span>، فالتيار هو مشتقتها <span class='eq-i'>i = dq/dt</span>.</li>" +
        "<li>إذا أُعطيت طاقة لازمة لنقل شحنة، استخدم <span class='eq-i'>V = W / Q</span>. انتبه: نقسم على الشحنة وليس على التيار.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Examples", html:
        "<p class='q'><b>مثال 1:</b> تمر شحنة <span class='ltr'>120 C</span> عبر مقطع سلك خلال دقيقة واحدة. ما التيار؟</p>" +
        "<ol class='steps'><li><b>تحويل الوحدات:</b> <span class='eq-i'>t = 1 min = 60 s</span>.</li><li><b>القانون:</b> <span class='eq-i'>I = Q / t = 120 / 60 = 2 A</span>.</li></ol>" +
        "<p class='q'><b>مثال 2:</b> الشحنة الداخلة إلى طرف عنصر تعطى بالعلاقة <span class='eq-i'>q(t) = 20(1 − e<sup>−5t</sup>) mC</span>. أوجد التيار، وقيمته عند <span class='ltr'>t = 0</span>.</p>" +
        "<ol class='steps'><li><b>القانون:</b> التيار مشتقة الشحنة <span class='eq-i'>i = dq/dt</span>.</li><li><b>الاشتقاق:</b> <span class='eq-i'>i(t) = 20 × 5 e<sup>−5t</sup> = 100 e<sup>−5t</sup> mA</span> (لأن mC/s = mA).</li><li><b>عند t = 0:</b> <span class='eq-i'>i(0) = 100 mA</span>، ثم يتناقص التيار أسيًا مع الزمن.</li></ol>" +
        "<p class='q'><b>مثال 3:</b> نقل شحنة <span class='ltr'>4 C</span> من النقطة a إلى b يحتاج طاقة <span class='ltr'>20 J</span>. ما الجهد بين النقطتين؟</p>" +
        "<ol class='steps'><li><span class='eq-i'>V = W / Q = 20 / 4 = 5 V</span>.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>سعة بطارية الجوال تكتب بوحدة <span class='ltr'>mAh</span>، وهي في الحقيقة وحدة <b>شحنة</b> وليست وحدة تيار: <span class='ltr'>1 mAh = 10⁻³ A × 3600 s = 3.6 C</span>. بطارية <span class='ltr'>5000 mAh</span> تخزن شحنة <span class='ltr'>18 000 C</span>. لو سحب الجوال تيارًا ثابتًا <span class='ltr'>500 mA</span> فإنها تكفي نظريًا <span class='ltr'>10</span> ساعات.</p>" }
    ],
    quiz: [
      { q: "الأمبير الواحد يساوي:", options: [
        { t: "<span class='ltr'>1 J/C</span>", type: "conceptual", why: "J/C هي وحدة الجهد (الفولت). الأمبير معدل مرور الشحنة." },
        { t: "<span class='ltr'>1 C/s</span>", correct: true, why: "التيار = شحنة ÷ زمن." },
        { t: "<span class='ltr'>1 C·s</span>", type: "formula", why: "التيار شحنة مقسومة على الزمن وليس مضروبة فيه." }
      ]},
      { q: "حسبت تيارًا في اتجاه السهم المرسوم فكانت قيمته <span class='ltr'>i = −3 A</span>. ماذا يعني ذلك؟", options: [
        { t: "الحل خطأ لأن التيار لا يكون سالبًا", type: "sign", why: "التيار يمكن أن يكون سالبًا بالنسبة لاتجاه المرجع. الإشارة تخبرك بالاتجاه الفعلي." },
        { t: "يمر تيار 3 A عكس اتجاه السهم", correct: true, why: "الإشارة السالبة تعني أن الاتجاه الفعلي معاكس لاتجاه المرجع." },
        { t: "لا يمر أي تيار", type: "conceptual", why: "القيمة 3 A ليست صفرًا. الإشارة تحدد الاتجاه فقط." }
      ]},
      { q: "بطارية جوال سعتها <span class='ltr'>3000 mAh</span>. كم شحنتها بالكولوم؟", options: [
        { t: "<span class='ltr'>3 C</span>", type: "unit", why: "حوّلت mAh إلى Ah لكن نسيت تحويل الساعة إلى ثوانٍ." },
        { t: "<span class='ltr'>10 800 C</span>", correct: true, why: "3 Ah × 3600 s = 10 800 C." },
        { t: "<span class='ltr'>180 C</span>", type: "unit", why: "ضربت في 60 فقط. الساعة 3600 ثانية." }
      ]}
    ],
    practice: {
      prompt: "شحنة مقدارها <span class='ltr'>0.36 C</span> تعبر مقطع موصل بانتظام خلال <span class='ltr'>3</span> دقائق. ونقل هذه الشحنة بين طرفي الموصل يحتاج طاقة <span class='ltr'>4.32 J</span>.",
      steps: [
        { id: "s1", label: "احسب التيار المار في الموصل.", symbol: "I =", answer: 0.002,
          units: [{ l: "µA", f: 1e-6 }, { l: "mA", f: 1e-3 }, { l: "A", f: 1 }], unitDefault: 1,
          diagnose: [
            { value: 0.12, type: "unit", why: "قسمت على 3 مباشرة. الزمن في القانون بالثواني: <span class='ltr'>3 min = 180 s</span>.", review: R("c1-variables-2", "when", "متى نستخدم I = Q/t"), hint: "حوّل الدقائق إلى ثوانٍ أولًا." },
            { value: 500, type: "formula", why: "قسمت الزمن على الشحنة. التيار هو الشحنة مقسومة على الزمن <span class='ltr'>I = Q / t</span>.", review: R("c1-variables-2", "laws", "القوانين والوحدات"), hint: "وحدة الأمبير C/s تخبرك: الشحنة في البسط." },
            { value: 64.8, type: "formula", why: "ضربت الشحنة في الزمن. التيار معدل، فنقسم الشحنة على الزمن.", review: R("c1-variables-2", "laws", "القوانين والوحدات") }
          ],
          hints: ["التيار = الشحنة ÷ الزمن، والزمن بالثواني.", "<span class='ltr'>I = 0.36 / 180</span>."],
          solution: "<span class='eq-i'>I = Q / t = 0.36 / 180 = 0.002 A = 2 mA</span>" },
        { id: "s2", label: "احسب الجهد بين طرفي الموصل.", symbol: "V =", answer: 12,
          units: [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }, { l: "kV", f: 1e3 }], unitDefault: 1,
          diagnose: [
            { value: 2160, type: "formula", why: "قسمت الطاقة على التيار. الجهد هو الطاقة لكل وحدة <b>شحنة</b>: <span class='ltr'>V = W / Q</span>.", review: R("c1-variables-2", "when", "الفرق بين القسمة على الشحنة والتيار"), hint: "استخدم الشحنة Q = 0.36 C وليس التيار." },
            { value: 1.5552, type: "formula", why: "ضربت الطاقة في الشحنة. الجهد = الطاقة ÷ الشحنة، ووحدته J/C.", review: R("c1-variables-2", "laws", "القوانين والوحدات") },
            { value: 0.08333, type: "formula", why: "قسمت الشحنة على الطاقة. القانون الصحيح <span class='ltr'>V = W / Q</span>، الطاقة في البسط.", review: R("c1-variables-2", "laws", "القوانين والوحدات"), hint: "وحدة الفولت J/C: الجول في البسط." }
          ],
          hints: ["الجهد = الطاقة لكل وحدة شحنة.", "<span class='ltr'>V = 4.32 / 0.36</span>."],
          solution: "<span class='eq-i'>V = W / Q = 4.32 / 0.36 = 12 V</span>" }
      ]
    },
    lab: { title: "قياس التيار والجهد", desc: "في المعمل الذكي ستضع أميتر على التوالي وفولتميتر على التوازي، وتلاحظ ماذا يعني أن يكون التيار سالبًا بالنسبة لاتجاه القياس." }
  };

  /* ------------------------------------------------------------------ */
  L["c1-variables-3"] = {
    id: "c1-variables-3", ar: "العنصر المثالي واصطلاح الإشارة", en: "The Ideal Basic Circuit Element", minutes: 20,
    objectives: [
      "تعرف الصفات الثلاث للعنصر المثالي الأساسي.",
      "تطبق اصطلاح الإشارة السالب (Passive Sign Convention) في أي اتجاهات مرجع.",
      "تحدد هل العنصر يمتص القدرة أم يولّدها من إشارة p."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>العنصر المثالي الأساسي له ثلاث صفات: <b>طرفان فقط</b>، ويوصف رياضيًا بالكامل عن طريق <b>الجهد والتيار</b> بين طرفيه، و<b>لا يمكن تقسيمه</b> إلى عناصر أبسط.</p>" +
        "<p>لكي نحسب القدرة بإشارة صحيحة نستخدم <b>اصطلاح الإشارة السالب</b> <span class='ltr'>(Passive Sign Convention)</span>:</p>" +
        "<div class='callout'>إذا كان اتجاه مرجع التيار <b>داخلًا</b> إلى الطرف الموجب لجهد العنصر، فإن <span class='eq-i'>p = vi</span>. وإذا كان <b>خارجًا</b> منه (أي داخلًا إلى الطرف السالب)، فإن <span class='eq-i'>p = −vi</span>.</div>" +
        "<p>بعدها: إذا كانت <span class='ltr'>p &gt; 0</span> فالعنصر <b>يمتص</b> القدرة، وإذا كانت <span class='ltr'>p &lt; 0</span> فهو <b>يولّد</b> (يعطي) القدرة.</p>" },
      { id: "diagram", title: "الحالات الأربع", en: "The Four Cases", html:
        "<div class='cases'>" +
        "<figure>" + elem({ plusTop: true, arrow: "down", aria: "التيار يدخل الطرف الموجب" }) + "<figcaption>التيار يدخل الطرف <b>+</b><br><span class='eq-i'>p = vi</span></figcaption></figure>" +
        "<figure>" + elem({ plusTop: true, arrow: "up", aria: "التيار يخرج من الطرف الموجب" }) + "<figcaption>التيار يخرج من الطرف <b>+</b><br><span class='eq-i'>p = −vi</span></figcaption></figure>" +
        "<figure>" + elem({ plusTop: false, arrow: "down", aria: "التيار يدخل الطرف السالب" }) + "<figcaption>التيار يدخل الطرف <b>−</b><br><span class='eq-i'>p = −vi</span></figcaption></figure>" +
        "<figure>" + elem({ plusTop: false, arrow: "up", aria: "التيار يخرج من الطرف السالب" }) + "<figcaption>التيار يخرج من الطرف <b>−</b><br><span class='eq-i'>p = vi</span></figcaption></figure>" +
        "</div>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Ideal basic circuit element</dt><dd>عنصر بطرفين، يوصف بالجهد والتيار، ولا يمكن تقسيمه.</dd>" +
        "<dt>Passive sign convention</dt><dd>القاعدة التي تحدد إشارة معادلة القدرة حسب اتجاهات المرجع.</dd>" +
        "<dt>Absorbed power</dt><dd>قدرة يمتصها العنصر (p موجبة).</dd><dt>Delivered power</dt><dd>قدرة يعطيها العنصر للدائرة (p سالبة).</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq-row'><div class='eq'>p = vi</div><div class='eq'>p = −vi</div></div>" +
        "<p>الأولى عندما يدخل مرجع التيار من الطرف +، والثانية عندما يدخل من الطرف −. القيم v و i تُعوَّض <b>بإشاراتها</b> كما هي.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>في كل مرة تحسب فيها قدرة عنصر. الخطوة الأولى دائمًا: انظر إلى الرسم وحدد هل سهم التيار يدخل الطرف + أم −.</li>" +
        "<li>القاعدة تتعلق <b>باتجاهات المرجع</b> المرسومة، وليس بالاتجاه الفعلي للتيار. لا تغيّر المعادلة لأن قيمة i سالبة.</li>" +
        "<li>عوّض الجهد والتيار بإشاراتهما. إشارة سالبة واحدة منسية تقلب النتيجة من امتصاص إلى توليد.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<div class='ex-split'><div>" + elem({ plusTop: true, arrow: "up", v: "10 V", i: "2 A", aria: "عنصر جهده 10 فولت والتيار 2 أمبير خارج من الطرف الموجب" }) + "</div><div>" +
        "<p class='q'>عنصر جهده <span class='ltr'>v = 10 V</span> (الطرف + في الأعلى)، وتيار المرجع <span class='ltr'>i = 2 A</span> يخرج من الطرف العلوي. احسب القدرة وحدد هل يمتصها أم يولّدها.</p>" +
        "<ol class='steps'><li><b>حدد الحالة:</b> السهم يخرج من الطرف +، أي يدخل من الطرف −.</li>" +
        "<li><b>اختر المعادلة:</b> <span class='eq-i'>p = −vi</span>.</li>" +
        "<li><b>عوّض:</b> <span class='eq-i'>p = −(10)(2) = −20 W</span>.</li>" +
        "<li><b>فسّر:</b> p سالبة، إذن العنصر <b>يولّد</b> <span class='ltr'>20 W</span>، مثل بطارية تغذي الدائرة.</li></ol></div></div>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>بطارية الجوال مثال حي على الحالتين. أثناء الشحن يدخل التيار من طرفها الموجب، فهي <b>تمتص</b> القدرة وتخزنها. أثناء الاستخدام يخرج التيار من طرفها الموجب نحو الدائرة، فهي <b>تولّد</b> القدرة. نفس العنصر ونفس القطبية، والذي تغيّر هو اتجاه التيار.</p>" }
    ],
    quiz: [
      { q: "مرجع التيار يدخل الطرف الموجب لعنصر. ما معادلة القدرة؟", options: [
        { t: "<span class='ltr'>p = vi</span>", correct: true, why: "دخول التيار من الطرف + يعني p = vi حسب اصطلاح الإشارة السالب." },
        { t: "<span class='ltr'>p = −vi</span>", type: "sign", why: "الإشارة السالبة تستخدم عندما يدخل التيار من الطرف −." },
        { t: "<span class='ltr'>p = v / i</span>", type: "formula", why: "v / i هي المقاومة وليست القدرة." }
      ]},
      { q: "حسبت قدرة عنصر فكانت <span class='ltr'>p = −15 W</span>. ماذا يعني ذلك؟", options: [
        { t: "العنصر يمتص 15 W", type: "sign", why: "الامتصاص يقابل p موجبة. p السالبة تعني أن العنصر يعطي القدرة." },
        { t: "العنصر يولّد 15 W", correct: true, why: "p &lt; 0 تعني أن العنصر يعطي القدرة لبقية الدائرة." },
        { t: "يوجد خطأ لأن القدرة لا تكون سالبة", type: "conceptual", why: "إشارة القدرة تحمل معنى: موجبة للامتصاص وسالبة للتوليد." }
      ]},
      { q: "عنصر فيه <span class='ltr'>v = 5 V</span> و <span class='ltr'>i = −2 A</span>، ومرجع التيار يدخل الطرف الموجب. القدرة:", options: [
        { t: "<span class='ltr'>10 W</span> ممتصة", type: "sign", why: "نسيت إشارة التيار. عوّض i = −2 كما هي: p = (5)(−2) = −10 W." },
        { t: "<span class='ltr'>−10 W</span>، أي العنصر يولّد 10 W", correct: true, why: "p = vi = (5)(−2) = −10 W، والإشارة السالبة تعني توليد." },
        { t: "<span class='ltr'>−10 W</span>، أي العنصر يمتص 10 W", type: "conceptual", why: "الحساب صحيح لكن التفسير معكوس: p السالبة تعني توليد القدرة." }
      ]}
    ],
    practice: {
      prompt: "عنصر قطبية جهده المرجعية: الطرف + في الأعلى، وقيمة الجهد <span class='ltr'>v = −8 V</span>. مرجع التيار يخرج من الطرف العلوي وقيمته <span class='ltr'>i = 3 A</span>.",
      figure: elem({ plusTop: true, arrow: "up", v: "−8 V", i: "3 A", aria: "عنصر جهده سالب 8 فولت والتيار 3 أمبير يخرج من الطرف الموجب" }),
      steps: [
        { id: "s1", kind: "choice", label: "أي معادلة قدرة تنطبق على اتجاهات المرجع في الرسم؟",
          options: [
            { t: "<span class='ltr'>p = vi</span>", type: "sign", why: "السهم يخرج من الطرف +، أي أن التيار يدخل من الطرف −، وهذه حالة الإشارة السالبة.", review: R("c1-variables-3", "diagram", "الحالات الأربع") },
            { t: "<span class='ltr'>p = −vi</span>", correct: true },
            { t: "تعتمد على إشارة v، فبما أن v سالبة نستخدم p = vi", type: "conceptual", why: "اختيار المعادلة يعتمد على <b>اتجاهات المرجع</b> المرسومة فقط، وليس على إشارات القيم. القيم تعوّض بإشاراتها بعد ذلك.", review: R("c1-variables-3", "when", "متى نستخدم كل معادلة") }
          ],
          hints: ["انظر إلى سهم التيار: هل يدخل الطرف + أم يخرج منه؟"],
          solution: "السهم يخرج من الطرف +، إذن <span class='eq-i'>p = −vi</span>." },
        { id: "s2", label: "احسب القدرة p.", symbol: "p =", answer: 24,
          units: [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }, { l: "kW", f: 1e3 }], unitDefault: 1,
          diagnose: [
            { value: -24, type: "sign", why: "إما أنك نسيت إشارة الجهد السالبة <span class='ltr'>(v = −8)</span>، أو استخدمت <span class='ltr'>p = vi</span>. التعويض الصحيح فيه إشارتان سالبتان: <span class='ltr'>p = −(−8)(3)</span>.", review: R("c1-variables-3", "laws", "تعويض القيم بإشاراتها"), hint: "اكتب المعادلة ثم عوّض v = −8 بين قوسين." },
            { value: -2.667, type: "formula", why: "قسمت الجهد على التيار. القدرة حاصل <b>ضرب</b> الجهد في التيار.", review: R("c1-variables-3", "laws", "القوانين") },
            { value: 2.667, type: "formula", why: "قسمت الجهد على التيار. القدرة حاصل <b>ضرب</b> الجهد في التيار.", review: R("c1-variables-3", "laws", "القوانين") }
          ],
          hints: ["المعادلة من الخطوة السابقة: p = −vi.", "<span class='ltr'>p = −(−8)(3)</span>."],
          solution: "<span class='eq-i'>p = −vi = −(−8)(3) = 24 W</span>" },
        { id: "s3", kind: "choice", label: "هل العنصر يمتص القدرة أم يولّدها؟",
          options: [
            { t: "يمتص <span class='ltr'>24 W</span>", correct: true },
            { t: "يولّد <span class='ltr'>24 W</span>", type: "sign", why: "القدرة الناتجة موجبة، و p &gt; 0 تعني امتصاص القدرة.", review: R("c1-variables-3", "concept", "معنى إشارة القدرة") },
            { t: "لا يمكن الحكم لأن الجهد سالب", type: "conceptual", why: "الحكم يكون على إشارة p النهائية بعد تطبيق الاصطلاح، وليس على إشارة الجهد وحده.", review: R("c1-variables-3", "concept", "معنى إشارة القدرة") }
          ],
          hints: ["p موجبة أم سالبة؟"],
          solution: "p = +24 W موجبة، إذن العنصر يمتص 24 W." }
      ]
    },
    lab: { title: "اتجاه التيار وإشارة القدرة", desc: "في المعمل الذكي ستعكس اتجاه مرجع التيار على عنصر وتشاهد كيف تتغير معادلة القدرة بينما تبقى النتيجة الفيزيائية نفسها." }
  };

  /* ------------------------------------------------------------------ */
  L["c1-variables-4"] = {
    id: "c1-variables-4", ar: "القدرة والطاقة", en: "Power and Energy", minutes: 20,
    objectives: [
      "تحسب القدرة من الجهد والتيار، والطاقة من القدرة والزمن.",
      "تحوّل بين الجول والكيلوواط ساعة بدون أخطاء.",
      "تتحقق من توازن القدرة في الدائرة."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>القدرة</b> <span class='ltr'>(power)</span> هي معدل استهلاك الطاقة أو توليدها، ووحدتها الواط <span class='ltr'>(W = J/s)</span>. ومن تعريفي الجهد والتيار:</p>" +
        "<div class='eq'>p = dw/dt = (dw/dq)(dq/dt) = v i</div>" +
        "<p><b>الطاقة</b> هي تكامل القدرة على الزمن. وإذا كانت القدرة ثابتة فالطاقة = القدرة × الزمن.</p>" +
        "<p>في أي دائرة، <b>مجموع القدرات يساوي صفرًا</b> (مع اصطلاح الإشارة): ما تولّده المصادر يساوي تمامًا ما تمتصه بقية العناصر. هذه أداة ممتازة للتحقق من حلك.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Power (p)</dt><dd>معدل تغير الطاقة، بالواط W.</dd><dt>Energy (w)</dt><dd>بالجول J، أو بالكيلوواط ساعة kWh في فواتير الكهرباء.</dd>" +
        "<dt>Power balance</dt><dd>مجموع القدرات في الدائرة = صفر.</dd></dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq-row'><div class='eq'>p = v i</div><div class='eq'>w = ∫ p dt</div><div class='eq'>W = P t</div></div>" +
        "<div class='eq'>Σ p = 0</div>" +
        "<div class='callout'><span class='ltr'>1 kWh = 1000 W × 3600 s = 3.6 × 10⁶ J = 3.6 MJ</span></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>لحساب القدرة من الجهد والتيار استخدم <span class='eq-i'>p = vi</span> مع اصطلاح الإشارة من الدرس السابق.</li>" +
        "<li>لحساب الطاقة خلال زمن والقدرة ثابتة: <span class='eq-i'>W = Pt</span>. إذا أردت النتيجة بالجول فالزمن بالثواني، وإذا أردتها بالـ kWh فالقدرة بالـ kW والزمن بالساعات.</li>" +
        "<li>بعد حل أي دائرة اجمع قدرات كل العناصر. إذا لم يكن المجموع صفرًا فهناك خطأ في الإشارة أو في الحساب.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'><b>توازن القدرة:</b> دائرة من ثلاثة عناصر حُسبت قدراتها كالتالي. تحقق من صحة الحل.</p>" +
        "<table class='tbl'><thead><tr><th>العنصر</th><th class='ltr'>v</th><th class='ltr'>i</th><th>الحالة</th><th class='ltr'>p</th></tr></thead><tbody>" +
        "<tr><td>a</td><td class='ltr'>12 V</td><td class='ltr'>2 A</td><td>التيار يخرج من +</td><td class='ltr'>−24 W</td></tr>" +
        "<tr><td>b</td><td class='ltr'>5 V</td><td class='ltr'>2 A</td><td>التيار يدخل +</td><td class='ltr'>+10 W</td></tr>" +
        "<tr><td>c</td><td class='ltr'>7 V</td><td class='ltr'>2 A</td><td>التيار يدخل +</td><td class='ltr'>+14 W</td></tr></tbody></table>" +
        "<ol class='steps'><li><b>اجمع:</b> <span class='eq-i'>Σp = −24 + 10 + 14 = 0</span> ✓</li><li><b>فسّر:</b> العنصر a يولّد 24 W، والعنصران b و c يمتصان معًا 24 W.</li></ol>" +
        "<p class='q'><b>الطاقة:</b> سخان قدرته <span class='ltr'>1500 W</span> يعمل ساعتين. كم الطاقة؟</p>" +
        "<ol class='steps'><li><b>بالـ kWh:</b> <span class='eq-i'>W = 1.5 kW × 2 h = 3 kWh</span>.</li><li><b>بالجول:</b> <span class='eq-i'>W = 1500 × 7200 s = 1.08 × 10⁷ J = 10.8 MJ</span>.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>عدّاد الكهرباء في بيتك لا يقيس القدرة بل يقيس <b>الطاقة</b> بالكيلوواط ساعة، والفاتورة تحسب على هذا الأساس. لذلك يستهلك جهاز قدرته صغيرة طاقة كبيرة إذا عمل ساعات طويلة، مثل الثلاجة أو المكيّف في الصيف.</p>" }
    ],
    quiz: [
      { q: "الواط يساوي:", options: [
        { t: "<span class='ltr'>J/s</span>", correct: true, why: "القدرة معدل الطاقة: جول لكل ثانية." },
        { t: "<span class='ltr'>J·s</span>", type: "formula", why: "القدرة طاقة مقسومة على الزمن وليس مضروبة فيه." },
        { t: "<span class='ltr'>C/s</span>", type: "conceptual", why: "C/s هي وحدة التيار (الأمبير)." }
      ]},
      { q: "كم جولًا في <span class='ltr'>1 kWh</span>؟", options: [
        { t: "<span class='ltr'>3600 J</span>", type: "unit", why: "هذا يساوي 1 Wh فقط. نسيت البادئة k." },
        { t: "<span class='ltr'>3.6 × 10⁶ J</span>", correct: true, why: "1000 W × 3600 s = 3.6 × 10⁶ J." },
        { t: "<span class='ltr'>1000 J</span>", type: "unit", why: "نسيت تحويل الساعة إلى ثوانٍ." }
      ]},
      { q: "في دائرة، مجموع القدرات الممتصة <span class='ltr'>50 W</span>. ماذا تتوقع لمجموع القدرات المولّدة؟", options: [
        { t: "<span class='ltr'>50 W</span>", correct: true, why: "توازن القدرة: ما يولَّد = ما يُمتص، فمجموع كل القدرات بإشاراتها صفر." },
        { t: "أقل من 50 W بسبب الفقد", type: "conceptual", why: "الفقد نفسه قدرة تمتصها المقاومات، وهو محسوب ضمن 50 W الممتصة." },
        { t: "لا يمكن معرفته", type: "conceptual", why: "قانون حفظ الطاقة يحدده: مجموع القدرات صفر." }
      ]}
    ],
    practice: {
      prompt: "مكيّف يسحب تيارًا <span class='ltr'>10 A</span> من مصدر <span class='ltr'>220 V</span>، ويعمل <span class='ltr'>8</span> ساعات يوميًا. اعتبره هنا حملًا يستهلك القدرة <span class='ltr'>P = VI</span>؛ ستتعلم في فصل قدرة التيار المتردد أن القدرة الفعلية تعتمد أيضًا على معامل القدرة.",
      steps: [
        { id: "s1", label: "احسب القدرة التي يسحبها المكيّف.", symbol: "P =", answer: 2200,
          units: [{ l: "W", f: 1 }, { l: "kW", f: 1e3 }, { l: "MW", f: 1e6 }], unitDefault: 0,
          diagnose: [
            { value: 22, type: "formula", why: "قسمت الجهد على التيار، وهذه المقاومة المكافئة وليست القدرة. القدرة <span class='ltr'>P = VI</span>.", review: R("c1-variables-4", "laws", "القوانين"), hint: "القدرة حاصل ضرب." },
            { value: 0.04545, type: "formula", why: "قسمت التيار على الجهد. القدرة حاصل ضرب الجهد في التيار.", review: R("c1-variables-4", "laws", "القوانين") },
            { value: 230, type: "formula", why: "جمعت الجهد والتيار. لا يصح جمع كميتين بوحدتين مختلفتين؛ القدرة حاصل <b>ضربهما</b>.", review: R("c1-variables-4", "laws", "القوانين") }
          ],
          hints: ["القدرة = الجهد × التيار."],
          solution: "<span class='eq-i'>P = VI = 220 × 10 = 2200 W = 2.2 kW</span>" },
        { id: "s2", label: "احسب الطاقة اليومية بالكيلوواط ساعة.", symbol: "W =", answer: 17.6 * 3.6e6,
          units: [{ l: "Wh", f: 3600 }, { l: "kWh", f: 3.6e6 }, { l: "J", f: 1 }], unitDefault: 1,
          diagnose: [
            { value: 17600 * 3.6e6, type: "unit", why: "ضربت 2200 (بالواط) في 8 ثم كتبت الوحدة kWh. الناتج 17 600 بوحدة <b>Wh</b>، وهو يساوي 17.6 kWh.", review: R("c1-variables-4", "when", "وحدات الطاقة"), hint: "حوّل القدرة إلى kW قبل الضرب في الساعات." },
            { value: 275 * 3.6e6, type: "formula", why: "قسمت القدرة على الزمن. الطاقة = القدرة × الزمن.", review: R("c1-variables-4", "laws", "القوانين") },
            { value: 0.275 * 3.6e6, type: "formula", why: "قسمت القدرة على الزمن. الطاقة = القدرة × الزمن.", review: R("c1-variables-4", "laws", "القوانين") }
          ],
          hints: ["الطاقة = القدرة × الزمن، والقدرة بالـ kW والزمن بالساعات.", "<span class='ltr'>2.2 kW × 8 h</span>."],
          solution: "<span class='eq-i'>W = 2.2 kW × 8 h = 17.6 kWh</span>" },
        { id: "s3", label: "حوّل هذه الطاقة إلى ميغاجول.", symbol: "W =", answer: 63.36e6,
          units: [{ l: "kJ", f: 1e3 }, { l: "MJ", f: 1e6 }, { l: "GJ", f: 1e9 }], unitDefault: 1,
          diagnose: [
            { value: 17.6e6, type: "unit", why: "كتبت الرقم بالـ kWh كما هو بوحدة MJ. التحويل: <span class='ltr'>1 kWh = 3.6 MJ</span>.", review: R("c1-variables-4", "laws", "تحويل kWh إلى جول"), hint: "اضرب في 3.6." },
            { value: 4.889e6, type: "unit", why: "قسمت على 3.6 بدل الضرب. الكيلوواط ساعة <b>أكبر</b> من الميغاجول، فالرقم بالـ MJ يجب أن يكون أكبر.", review: R("c1-variables-4", "laws", "تحويل kWh إلى جول"), hint: "1 kWh = 3.6 MJ، فاضرب." }
          ],
          hints: ["<span class='ltr'>1 kWh = 3.6 MJ</span>."],
          solution: "<span class='eq-i'>W = 17.6 × 3.6 = 63.36 MJ</span>" }
      ]
    },
    lab: { title: "توازن القدرة", desc: "في المعمل الذكي ستبني دائرة بمصدر ومقاومتين، وتقيس قدرة كل عنصر، وتتحقق أن مجموعها صفر." }
  };
})();
