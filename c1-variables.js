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
      "تعرف تعريف الدائرة الكهربائية كنموذج رياضي لنظام حقيقي.",
      "تعرف ممّ تتكون الدائرة: مصادر، وعناصر خاملة غير مفاعلة (R) ومفاعلة (L و C).",
      "تعرف متغيرات الدائرة الأربعة: التيار والجهد والقدرة والطاقة."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>الدائرة الكهربائية <span class='ltr'>(electric circuit)</span> هي <b>نموذج رياضي</b> يقرّب سلوك نظام كهربائي حقيقي. نحللها بالحساب بدل أن نجرّب على الجهاز نفسه.</p>" +
        "<p>في الهندسة الكهربائية نريد غالبًا <b>نقل الطاقة</b> من نقطة إلى أخرى، ولهذا نوصل أجهزة كهربائية ببعضها. هذا التوصيل يسمى <b>دائرة كهربائية</b>، وكل مكوّن فيها يسمى <b>عنصرًا</b> <span class='ltr'>(element)</span>.</p>" +
        "<p>تتكون الدوائر من: <b>مصادر</b> (مولدات) تعطي الطاقة، و<b>عناصر</b> قد تكون خاملة غير مفاعلة مثل المقاومة، أو <b>مفاعلة</b> <span class='ltr'>(reactive)</span> مثل المكثف والملف.</p>" +
        "<div class='flow'><span>النظام الحقيقي</span><i>←</i><span>نموذج الدائرة</span><i>←</i><span>التحليل الرياضي</span><i>←</i><span>المقارنة بالقياس</span></div>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'>" +
        "<dt>Electric circuit</dt><dd>نموذج رياضي لنظام كهربائي، وهو توصيل بين عناصر كهربائية.</dd>" +
        "<dt>Element</dt><dd>كل مكوّن في الدائرة.</dd>" +
        "<dt>Source (generator)</dt><dd>عنصر يعطي الطاقة للدائرة.</dd>" +
        "<dt>Passive, non-reactive</dt><dd>عنصر خامل لا يخزن طاقة، مثل المقاومة R.</dd>" +
        "<dt>Reactive</dt><dd>عنصر يخزن الطاقة، مثل المكثف C والملف L.</dd>" +
        "</dl>" },
      { id: "laws", title: "متغيرات الدائرة", en: "Circuit Variables", html:
        "<p>كل تحليل في المقرر يدور حول أربعة متغيرات <span class='ltr'>(I, V, P, E)</span>:</p>" +
        "<table class='tbl'><thead><tr><th>المتغير</th><th>الرمز</th><th>الوحدة</th></tr></thead><tbody>" +
        "<tr><td>التيار <span class='ltr'>(current)</span></td><td class='ltr'>I</td><td>أمبير <span class='ltr'>(A)</span></td></tr>" +
        "<tr><td>الجهد <span class='ltr'>(voltage)</span></td><td class='ltr'>V</td><td>فولت <span class='ltr'>(V)</span></td></tr>" +
        "<tr><td>القدرة <span class='ltr'>(power)</span></td><td class='ltr'>P</td><td>واط <span class='ltr'>(W)</span></td></tr>" +
        "<tr><td>الطاقة <span class='ltr'>(energy)</span></td><td class='ltr'>W</td><td>جول <span class='ltr'>(J)</span></td></tr>" +
        "</tbody></table>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>قبل أي حساب: حدّد العناصر في الرسم، أيها مصدر وأيها مقاومة أو ملف أو مكثف.</li>" +
        "<li>الملف والمكثف لا يظهر أثرهما إلا عندما يتغير الجهد أو التيار مع الزمن، وهذا ما ندرسه في فصل الحالة الجيبية.</li>" +
        "<li>إذا اختلف التحليل عن القياس كثيرًا، فالخطأ غالبًا في النموذج نفسه وليس في الحساب.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>دائرة فيها بطارية، ومقاومة، ومكثف، وملف. صنّف كل عنصر.</p>" +
        "<ol class='steps'><li>البطارية: <b>مصدر</b>، تعطي الطاقة للدائرة.</li>" +
        "<li>المقاومة: عنصر <b>خامل غير مفاعل</b>، تحول الطاقة إلى حرارة ولا تخزنها.</li>" +
        "<li>المكثف والملف: عناصر <b>مفاعلة</b>، تخزن الطاقة وتعيدها للدائرة.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>شاحن الجوال نظام حقيقي فيه آلاف المكونات. لكن لحساب التيار الذي يسحبه من البطارية يكفي نموذج بسيط: مصدر ومقاومة تمثل الحمل. هذه هي فكرة نموذج الدائرة.</p>" }
    ],
    quiz: [
      { q: "الدائرة الكهربائية في هذا المقرر هي:", options: [
        { t: "نموذج رياضي يقرّب سلوك نظام كهربائي حقيقي", correct: true, why: "هذا تعريف المحاضرة: نحلل النموذج بدل الجهاز." },
        { t: "الجهاز الحقيقي نفسه بكل تفاصيله", type: "conceptual", why: "الجهاز الحقيقي معقد. نحن نحلل نموذجًا مبسطًا منه." },
        { t: "مجموعة أسلاك فقط", type: "conceptual", why: "الدائرة توصيل بين عناصر: مصادر ومقاومات وملفات ومكثفات." }
      ]},
      { q: "أي عنصر مما يلي <b>مفاعل</b> (reactive)؟", options: [
        { t: "المقاومة", type: "conceptual", why: "المقاومة خاملة غير مفاعلة: لا تخزن الطاقة." },
        { t: "المكثف", correct: true, why: "المكثف والملف عناصر مفاعلة تخزن الطاقة." },
        { t: "البطارية", type: "conceptual", why: "البطارية مصدر يعطي الطاقة." }
      ]},
      { q: "ما وحدة القدرة؟", options: [
        { t: "الجول (J)", type: "unit", why: "الجول وحدة الطاقة. القدرة معدل الطاقة: J/s = W." },
        { t: "الواط (W)", correct: true, why: "القدرة بالواط، والواط = جول لكل ثانية." },
        { t: "الكولوم (C)", type: "unit", why: "الكولوم وحدة الشحنة." }
      ]}
    ],
    practice: {
      prompt: "دائرة إنارة فيها مولد، ومصباح نمثله بمقاومة، ومكثف لتحسين الأداء، وملف داخل المحرك. صنّف العناصر.",
      steps: [
        { id: "s1", kind: "choice", label: "المولد في هذه الدائرة:", options: [
            { t: "مصدر يعطي الطاقة", correct: true },
            { t: "عنصر خامل غير مفاعل", type: "conceptual", why: "المولد يعطي الطاقة للدائرة، فهو مصدر." },
            { t: "عنصر مفاعل", type: "conceptual", why: "العنصر المفاعل يخزن الطاقة ويعيدها، أما المولد فيعطيها." }
          ], hints: ["من الذي يعطي الطاقة في الدائرة؟"], solution: "المولد مصدر." },
        { id: "s2", kind: "choice", label: "المصباح (المقاومة):", options: [
            { t: "عنصر مفاعل", type: "conceptual", why: "المقاومة لا تخزن طاقة، بل تحولها إلى حرارة وضوء." },
            { t: "عنصر خامل غير مفاعل", correct: true },
            { t: "مصدر", type: "conceptual", why: "المصباح يستهلك الطاقة ولا يعطيها." }
          ], hints: ["هل المقاومة تخزن الطاقة؟"], solution: "المقاومة خاملة غير مفاعلة." },
        { id: "s3", kind: "choice", label: "المكثف والملف:", options: [
            { t: "عناصر مفاعلة تخزن الطاقة", correct: true },
            { t: "عناصر غير مفاعلة", type: "conceptual", why: "المكثف يخزن طاقة في المجال الكهربائي والملف في المجال المغناطيسي، فهما مفاعلان." },
            { t: "مصادر", type: "conceptual", why: "قد يعيدان طاقة خزناها، لكنهما لا يولدان طاقة، فليسا مصدرين." }
          ], hints: ["أي العناصر وصفتها المحاضرة بأنها reactive؟"], solution: "المكثف والملف عناصر مفاعلة." }
      ]
    },
    lab: { title: "قياس تأثير التردد", desc: "في المعمل الذكي ستغيّر تردد مصدر جيبي وتلاحظ متى تبقى نتائج تحليل الدائرة صحيحة." }
  };

  /* ------------------------------------------------------------------ */
  L["c1-variables-2"] = {
    id: "c1-variables-2", ar: "الجهد والتيار", en: "Voltage and Current", minutes: 20,
    objectives: [
      "تعرّف الجهد بأنه الطاقة لكل وحدة شحنة: V = dw/dq.",
      "تعرّف التيار بأنه معدل سريان الشحنة: I = dq/dt.",
      "تعرف اتجاه التيار الاصطلاحي والفرق بين DC و AC."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>الجهد</b> <span class='ltr'>(V)</span>، ويسمى فرق الجهد الكهربائي، هو القوة التي تدفع التيار. وبدقة: هو <b>الطاقة لكل وحدة شحنة</b>: <span class='eq-i'>V = dw/dq</span>، ووحدته الفولت.</p>" +
        "<p><b>التيار</b> <span class='ltr'>(I)</span> هو سريان الشحنة الكهربائية في موصل: <span class='eq-i'>I = dq/dt</span>، ووحدته الأمبير. الأمبير الواحد = كولوم واحد يمر بنقطة في الدائرة كل ثانية، أي حوالي <span class='ltr'>6.24 × 10¹⁸</span> إلكترون في الثانية.</p>" +
        "<p><b>اتجاه التيار عكس اتجاه حركة الإلكترونات.</b> نرسم التيار كأنه حركة شحنات موجبة.</p>" +
        "<p>للتيار نوعان: <b>مستمر</b> <span class='ltr'>(DC)</span> تسري فيه الشحنة في اتجاه واحد دائمًا، و<b>متردد</b> <span class='ltr'>(AC)</span> يعكس فيه اتجاهه بشكل دوري.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'>" +
        "<dt>Voltage (potential difference)</dt><dd>الطاقة لكل وحدة شحنة، بالفولت.</dd>" +
        "<dt>Current</dt><dd>معدل سريان الشحنة في الموصل، بالأمبير.</dd>" +
        "<dt>Charge (q)</dt><dd>الشحنة الكهربائية بالكولوم (C).</dd>" +
        "<dt>DC / AC</dt><dd>تيار مستمر في اتجاه واحد / تيار يعكس اتجاهه دوريًا.</dd>" +
        "</dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq'>V = dw / dq</div><div class='eq'>I = dq / dt</div>" +
        "<table class='tbl'><thead><tr><th>الرمز</th><th>المعنى</th><th>الوحدة</th></tr></thead><tbody>" +
        "<tr><td class='ltr'>V</td><td>الجهد</td><td>فولت <span class='ltr'>(V)</span></td></tr>" +
        "<tr><td class='ltr'>w</td><td>الطاقة</td><td>جول <span class='ltr'>(J)</span></td></tr>" +
        "<tr><td class='ltr'>q</td><td>الشحنة</td><td>كولوم <span class='ltr'>(C)</span></td></tr>" +
        "<tr><td class='ltr'>I</td><td>التيار</td><td>أمبير <span class='ltr'>(A)</span></td></tr>" +
        "<tr><td class='ltr'>t</td><td>الزمن</td><td>ثانية <span class='ltr'>(s)</span></td></tr>" +
        "</tbody></table><p class='muted'><span class='ltr'>1 A = 1 C/s</span> و <span class='ltr'>1 V = 1 J/C</span>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>إذا كانت الشحنة تمر بانتظام فالتيار ثابت: <span class='eq-i'>I = q / t</span>.</li>" +
        "<li>إذا أعطيت الطاقة اللازمة لنقل شحنة فالجهد: <span class='eq-i'>V = w / q</span>.</li>" +
        "<li>التيار السالب في الحل يعني أن الاتجاه الفعلي عكس السهم الذي رسمته، وليس أن الحل خطأ.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Examples", html:
        "<p class='q'>تمر شحنة <span class='ltr'>120 C</span> بانتظام في موصل خلال دقيقة واحدة، ونقلها بين طرفيه يحتاج <span class='ltr'>1440 J</span>. أوجد التيار والجهد، وعدد الإلكترونات التي تمر في الثانية.</p>" +
        "<ol class='steps'><li><span class='eq-i'>I = q / t = 120 / 60 = 2 A</span></li>" +
        "<li><span class='eq-i'>V = w / q = 1440 / 120 = 12 V</span></li>" +
        "<li>كل ثانية يمر <span class='ltr'>2 C</span>، أي <span class='eq-i'>2 × 6.24 × 10¹⁸ = 1.248 × 10¹⁹</span> إلكترون، وتتحرك الإلكترونات عكس اتجاه التيار.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>بطارية السيارة تعطي جهدًا مستمرًا <span class='ltr'>(DC)</span> تقريبًا 12 V، أما مقبس البيت فيعطي جهدًا مترددًا <span class='ltr'>(AC)</span> يعكس اتجاهه 60 مرة في الثانية في السعودية.</p>" }
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
    id: "c1-variables-3", ar: "العنصر الأساسي المثالي", en: "The Ideal Basic Circuit Element", minutes: 20,
    objectives: [
      "تطبّق اصطلاح الإشارة الخاملة (passive sign convention).",
      "تختار p = vi أو p = −vi حسب اتجاه مرجع التيار وقطبية الجهد.",
      "تفسّر إشارة القدرة: موجبة = امتصاص، سالبة = إعطاء."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>العنصر الأساسي المثالي له طرفان، ونصفه بجهد <span class='ltr'>v</span> بين طرفيه وتيار <span class='ltr'>i</span> يمر فيه. <b>اتجاه التيار وقطبية الجهد</b> يحددان إشارة القدرة.</p>" +
        "<p><b>اصطلاح الإشارة الخاملة</b> <span class='ltr'>(passive sign convention)</span>: إذا كان مرجع التيار في اتجاه <b>هبوط</b> الجهد، أي يدخل من الطرف الموجب، نستخدم إشارة موجبة: <span class='eq-i'>p = vi</span>. وإذا كان مرجع التيار في اتجاه <b>ارتفاع</b> الجهد، أي يدخل من الطرف السالب: <span class='eq-i'>p = −vi</span>.</p>" +
        "<p>الشحنات الموجبة التي تمر عبر هبوط في الجهد <b>تفقد</b> طاقة (العنصر يمتص)، والتي تمر عبر ارتفاع في الجهد <b>تكسب</b> طاقة (العنصر يعطي).</p>" },
      { id: "diagram", title: "الحالات الأربع", en: "The Four Cases", html:
        "<div class='lfig'>" + elem({ plusTop: true, arrow: "down", name: "(a)" }) + elem({ plusTop: false, arrow: "up", name: "(b)" }) + "</div>" +
        "<p class='muted'>(a) و (b): التيار يدخل من الطرف الموجب، إذن <span class='ltr'>p = vi</span>.</p>" +
        "<div class='lfig'>" + elem({ plusTop: true, arrow: "up", name: "(c)" }) + elem({ plusTop: false, arrow: "down", name: "(d)" }) + "</div>" +
        "<p class='muted'>(c) و (d): التيار يدخل من الطرف السالب، إذن <span class='ltr'>p = −vi</span>.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Passive sign convention</dt><dd>إشارة موجبة في العلاقة عندما يدخل مرجع التيار من طرف الجهد الموجب.</dd>" +
        "<dt>Absorbing</dt><dd>العنصر يأخذ قدرة من الدائرة <span class='ltr'>(p &gt; 0)</span>.</dd>" +
        "<dt>Supplying / delivering</dt><dd>العنصر يعطي قدرة للدائرة <span class='ltr'>(p &lt; 0)</span>.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>p = vi   (التيار يدخل من +)</div><div class='eq'>p = −vi   (التيار يدخل من −)</div>" +
        "<ul class='ticks'><li><span class='ltr'>p &gt; 0</span>: القدرة تُعطى للدائرة داخل الصندوق، أي العنصر يمتص.</li>" +
        "<li><span class='ltr'>p &lt; 0</span>: القدرة تُسحب من الدائرة داخل الصندوق، أي العنصر يعطي.</li></ul>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>قبل كتابة p انظر للرسم: من أي طرف يدخل سهم التيار؟</li>" +
        "<li>المراجع (السهم والقطبية) اختيارية، لكن بعد اختيارها يجب الالتزام بها في كل المعادلات.</li>" +
        "<li>نفس العنصر قد تكتبه بـ vi أو بـ −vi حسب المراجع، والنتيجة الفيزيائية لا تتغير.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 1 من المحاضرة: هبوط جهد <span class='ltr'>4 V</span> على عنصر، وتيار <span class='ltr'>3 A</span> كما في الحالات الأربع (a) إلى (d). حدّد v و i بالنسبة لاصطلاح الإشارة الخاملة، ثم القدرة: هل الصندوق يمتص أم يعطي؟</p>" +
        "<div class='lfig'>" + elem({ plusTop: true, arrow: "down", v: "4 V", i: "3 A", name: "(a)" }) + elem({ plusTop: false, arrow: "up", v: "4 V", i: "3 A", name: "(b)" }) + elem({ plusTop: true, arrow: "up", v: "4 V", i: "3 A", name: "(c)" }) + elem({ plusTop: false, arrow: "down", v: "4 V", i: "3 A", name: "(d)" }) + "</div>" +
        "<ol class='steps'><li>(a) و (b): التيار يدخل من الطرف الموجب: <span class='eq-i'>v = +4 V, i = +3 A</span>.</li>" +
        "<li>(c) و (d): التيار يخرج من الطرف الموجب: <span class='eq-i'>v = +4 V, i = −3 A</span>.</li>" +
        "<li>(a) و (b): <span class='eq-i'>p = (+4)(+3) = 12 W</span>، الصندوق <b>يمتص</b>.</li>" +
        "<li>(c) و (d): <span class='eq-i'>p = (+4)(−3) = −12 W</span>، الصندوق <b>يعطي</b>.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>بطارية الجوال أثناء الشحن يدخلها التيار من طرفها الموجب فتمتص قدرة، وأثناء التشغيل يخرج التيار من طرفها الموجب فتعطي قدرة. نفس العنصر، والإشارة تخبرك بالحالة.</p>" }
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
    id: "c1-variables-4", ar: "القدرة والطاقة", en: "Power and Energy", minutes: 15,
    objectives: [
      "تعرّف القدرة بأنها معدل استهلاك أو إنتاج الطاقة: P = dw/dt.",
      "تشتق P = VI من تعريفي الجهد والتيار.",
      "تحسب القدرة والطاقة وتتحقق من توازن القدرة في الدائرة."
    ],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>القدرة</b> <span class='ltr'>(P)</span> هي معدل استهلاك الطاقة أو إنتاجها في وحدة الزمن: <span class='eq-i'>P = dw/dt</span>، ووحدتها الواط، و <span class='ltr'>1 W = 1 J/s</span>.</p>" +
        "<p>بضرب البسط والمقام في <span class='ltr'>dq</span> نربط القدرة بمتغيري الدائرة: <span class='eq-i'>P = dw/dt = (dw/dq)(dq/dt) = V·I</span>. لهذا يكفي أن نعرف الجهد والتيار لنعرف القدرة.</p>" +
        "<p>الطاقة هي تكامل القدرة على الزمن، وإذا كانت القدرة ثابتة: <span class='eq-i'>w = P·t</span>. وفي أي دائرة، مجموع القدرة الممتصة = مجموع القدرة المعطاة.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Power</dt><dd>معدل الطاقة، بالواط (W).</dd><dt>Energy</dt><dd>الطاقة بالجول (J). وفي الفواتير بالكيلوواط ساعة: <span class='ltr'>1 kWh = 3.6 × 10⁶ J</span>.</dd>" +
        "<dt>Power balance</dt><dd>مجموع القدرات في الدائرة كلها يساوي صفرًا.</dd></dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq'>P = dw / dt</div><div class='eq'>P = (dw/dq)(dq/dt) = V·I</div><div class='eq'>1 W = 1 J/s</div>" +
        "<p class='muted'>مع اصطلاح الإشارة الخاملة: <span class='ltr'>p = vi</span> إذا دخل التيار من +، و <span class='ltr'>p = −vi</span> إذا دخل من −.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>لحساب قدرة عنصر: اضرب جهده في تياره مع الإشارة الصحيحة.</li>" +
        "<li>لحساب الطاقة خلال زمن: اضرب القدرة في الزمن بوحدات متوافقة.</li>" +
        "<li>بعد حل أي دائرة: تحقق أن القدرة المعطاة = القدرة الممتصة. إذا لم تتساويا ففي الحل خطأ.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>من مثال 1: عنصر عليه <span class='ltr'>4 V</span> ويمر فيه <span class='ltr'>3 A</span> داخلًا من طرفه الموجب. احسب قدرته، والطاقة التي يمتصها في دقيقتين.</p>" +
        "<ol class='steps'><li><span class='eq-i'>p = vi = 4 × 3 = 12 W</span>، موجبة إذن العنصر يمتص.</li>" +
        "<li><span class='eq-i'>w = p·t = 12 × 120 = 1440 J</span></li>" +
        "<li>لو عكسنا اتجاه التيار (يخرج من +): <span class='eq-i'>p = 4 × (−3) = −12 W</span>، أي العنصر يعطي 12 W.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>عداد الكهرباء يقيس الطاقة بالكيلوواط ساعة. مكيّف قدرته <span class='ltr'>2 kW</span> يعمل 10 ساعات يستهلك <span class='ltr'>20 kWh</span>، وعلى هذه الطاقة تُحسب الفاتورة، لا على القدرة.</p>" }
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
