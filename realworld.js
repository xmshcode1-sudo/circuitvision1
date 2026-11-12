/* CircuitVision — Real-World Engineering: a library of the real parts and instruments used in the lab and projects,
   with interactive tools (resistor colour code, capacitor code, standard values). Pictures are drawn illustrations. */
(function () {
  "use strict";
  var root = document.getElementById("rw-root"), $ = function (id) { return document.getElementById(id); };
  var si = function (v, u) { return CV.ac.si(v, u); };
  var COL = [["أسود", "black", "#1b1b1b"], ["بني", "brown", "#7a4a21"], ["أحمر", "red", "#d22"], ["برتقالي", "orange", "#f07818"], ["أصفر", "yellow", "#f2c80f"], ["أخضر", "green", "#2a9a3a"], ["أزرق", "blue", "#2a5bd7"], ["بنفسجي", "violet", "#8a3ab9"], ["رمادي", "grey", "#8a8a8a"], ["أبيض", "white", "#f4f4f4"]];
  var MULT = COL.map(function (c, i) { return [c[0], c[2], Math.pow(10, i)]; }).concat([["ذهبي", "#c9a227", 0.1], ["فضي", "#b8bcc4", 0.01]]);
  var TOL = [["ذهبي", "#c9a227", 5], ["فضي", "#b8bcc4", 10], ["بني", "#7a4a21", 1], ["أحمر", "#d22", 2], ["أخضر", "#2a9a3a", 0.5], ["أزرق", "#2a5bd7", 0.25], ["بنفسجي", "#8a3ab9", 0.1]];
  var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  var E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];

  /* ---------- illustrations ---------- */
  function svg(body, vb) { return '<svg class="rw-ill" viewBox="' + (vb || "0 0 240 120") + '" role="img" aria-hidden="true">' + body + '</svg>'; }
  function resistorSVG(bands) {
    var o = '<line x1="10" y1="60" x2="70" y2="60" class="rw-leg"/><line x1="170" y1="60" x2="230" y2="60" class="rw-leg"/><rect x="66" y="42" width="108" height="36" rx="16" fill="#e7c79a" stroke="#b48a52"/>';
    var xs = bands.length === 5 ? [84, 98, 112, 126, 152] : [86, 102, 118, 152];
    bands.forEach(function (c, i) { o += '<rect x="' + (xs[i] - 4) + '" y="42" width="8" height="36" fill="' + c + '"/>'; });
    return svg(o);
  }
  var ILL = {
    resistor: function () { return resistorSVG(["#d22", "#d22", "#7a4a21", "#c9a227"]); },
    ceramic: function () { return svg('<line x1="105" y1="78" x2="100" y2="115" class="rw-leg"/><line x1="135" y1="78" x2="140" y2="115" class="rw-leg"/><ellipse cx="120" cy="50" rx="38" ry="32" fill="#e6a23a" stroke="#a96b14"/><text x="120" y="57" text-anchor="middle" class="rw-tx">104</text>'); },
    electrolytic: function () { return svg('<line x1="108" y1="96" x2="108" y2="118" class="rw-leg"/><line x1="132" y1="96" x2="132" y2="112" class="rw-leg"/><rect x="92" y="10" width="56" height="86" rx="8" fill="#26408f" stroke="#162a63"/><rect x="128" y="10" width="20" height="86" fill="#9fb3e8"/><text x="138" y="40" text-anchor="middle" class="rw-tx" fill="#26408f">−</text><text x="138" y="70" text-anchor="middle" class="rw-tx" fill="#26408f">−</text><text x="108" y="58" text-anchor="middle" class="rw-tx" fill="#fff" style="font-size:10px">100µF</text><text x="100" y="116" class="rw-sm">+</text><text x="136" y="116" class="rw-sm">−</text>'); },
    inductor: function () { var o = '<line x1="10" y1="60" x2="60" y2="60" class="rw-leg"/><line x1="180" y1="60" x2="230" y2="60" class="rw-leg"/><rect x="58" y="44" width="124" height="32" rx="8" fill="#2f6b3a"/>'; for (var i = 0; i < 9; i++) o += '<ellipse cx="' + (70 + i * 12.5) + '" cy="60" rx="6" ry="17" fill="none" stroke="#c98a3a" stroke-width="3"/>'; return svg(o); },
    led: function () { return svg('<line x1="108" y1="78" x2="108" y2="118" class="rw-leg"/><line x1="132" y1="78" x2="132" y2="106" class="rw-leg"/><path d="M96 78 V40 A24 24 0 0 1 144 40 V78 Z" fill="#ff4b4b" fill-opacity=".85" stroke="#a11"/><rect x="92" y="76" width="56" height="6" rx="2" fill="#ff7777"/><line x1="148" y1="76" x2="148" y2="82" stroke="#a11" stroke-width="3"/><text x="96" y="114" class="rw-sm">+ أطول</text><text x="136" y="104" class="rw-sm">−</text>'); },
    ldr: function () { return svg('<line x1="108" y1="80" x2="108" y2="118" class="rw-leg"/><line x1="132" y1="80" x2="132" y2="118" class="rw-leg"/><circle cx="120" cy="50" r="32" fill="#d9a066" stroke="#8a5a2b" stroke-width="2"/><path d="M98 38 H108 V50 H118 V38 H128 V50 H138 V62 H128 V50" fill="none" stroke="#9b2d20" stroke-width="3"/>'); },
    ntc: function () { return svg('<line x1="112" y1="66" x2="104" y2="118" class="rw-leg"/><line x1="128" y1="66" x2="136" y2="118" class="rw-leg"/><ellipse cx="120" cy="54" rx="18" ry="16" fill="#3a3f8f" stroke="#1d2150"/><text x="150" y="58" class="rw-sm">10k</text>'); },
    battery: function () { return svg('<rect x="40" y="36" width="150" height="48" rx="10" fill="#222" /><rect x="40" y="36" width="54" height="48" rx="10" fill="#c9a227"/><rect x="190" y="50" width="10" height="20" rx="2" fill="#aaa"/><text x="140" y="66" text-anchor="middle" fill="#fff" class="rw-tx" style="font-size:15px">AA 1.5V</text><text x="203" y="44" class="rw-sm">+</text>'); },
    breadboard: function () { var o = '<rect x="6" y="6" width="228" height="108" rx="6" fill="#eef0f3" stroke="#c9ced6"/><line x1="14" y1="16" x2="226" y2="16" stroke="#e0312f"/><line x1="14" y1="104" x2="226" y2="104" stroke="#2f6fe0"/><rect x="6" y="56" width="228" height="8" fill="#dfe3e8"/>'; for (var c = 0; c < 13; c++) { var x = 22 + c * 16; o += '<rect x="' + (x - 3) + '" y="24" width="6" height="28" rx="2" fill="' + (c === 4 ? "#ffb347" : "none") + '" opacity=".5"/>'; for (var r = 0; r < 5; r++) { o += '<rect x="' + (x - 1.6) + '" y="' + (26 + r * 5.5) + '" width="3.2" height="3.2" fill="#9aa1ab"/><rect x="' + (x - 1.6) + '" y="' + (68 + r * 5.5) + '" width="3.2" height="3.2" fill="#9aa1ab"/>'; } } return svg(o + '<text x="86" y="20" class="rw-sm" style="fill:#555">العمود الواحد موصول (5 ثقوب)</text>'); },
    multimeter: function () { return svg('<rect x="70" y="4" width="100" height="112" rx="12" fill="#f2c80f" stroke="#a88a08"/><rect x="82" y="14" width="76" height="26" rx="3" fill="#b9c7a6"/><text x="120" y="33" text-anchor="middle" class="rw-tx" fill="#2a3320">12.04</text><circle cx="120" cy="66" r="16" fill="#333"/><line x1="120" y1="66" x2="128" y2="54" stroke="#ddd" stroke-width="3"/><circle cx="92" cy="102" r="5" fill="#d22"/><circle cx="120" cy="102" r="5" fill="#111"/><circle cx="148" cy="102" r="5" fill="#d22"/><text x="84" y="94" class="rw-sm">10A</text><text x="112" y="94" class="rw-sm">COM</text><text x="138" y="94" class="rw-sm">VΩmA</text>'); },
    scope: function () { var o = '<rect x="20" y="10" width="200" height="100" rx="8" fill="#1c2433"/><rect x="30" y="20" width="120" height="80" fill="#0b1220"/>'; var p = []; for (var i = 0; i <= 60; i++) p.push((30 + i * 2) + "," + (60 - 26 * Math.sin(i / 60 * 4 * Math.PI)).toFixed(1)); o += '<polyline points="' + p.join(" ") + '" fill="none" stroke="#e8b400" stroke-width="2"/>'; for (var k = 0; k < 4; k++) o += '<circle cx="' + (172 + (k % 2) * 26) + '" cy="' + (36 + Math.floor(k / 2) * 30) + '" r="8" fill="#3a465c"/>'; return svg(o); },
    generator: function () { var o = '<rect x="20" y="20" width="200" height="80" rx="8" fill="#1c2433"/><rect x="32" y="32" width="90" height="28" rx="3" fill="#0b1220"/><text x="77" y="51" text-anchor="middle" class="rw-tx" fill="#9ff0b5" style="font-size:12px">1.000 kHz</text><circle cx="160" cy="60" r="14" fill="#3a465c"/><circle cx="200" cy="82" r="7" fill="#c9a227"/><text x="186" y="70" class="rw-sm" style="fill:#b8c2d6">50Ω</text>'; return svg(o); },
    pot: function () { return svg('<line x1="96" y1="80" x2="96" y2="116" class="rw-leg"/><line x1="120" y1="80" x2="120" y2="116" class="rw-leg"/><line x1="144" y1="80" x2="144" y2="116" class="rw-leg"/><rect x="84" y="50" width="72" height="32" rx="4" fill="#2a5bd7"/><circle cx="120" cy="38" r="20" fill="#ddd" stroke="#999"/><line x1="120" y1="38" x2="120" y2="22" stroke="#555" stroke-width="3"/><text x="92" y="114" class="rw-sm">1</text><text x="116" y="114" class="rw-sm">2</text><text x="140" y="114" class="rw-sm">3</text>'); },
    button: function () { return svg('<rect x="90" y="40" width="60" height="44" rx="4" fill="#333"/><circle cx="120" cy="62" r="14" fill="#666"/><line x1="96" y1="84" x2="92" y2="112" class="rw-leg"/><line x1="144" y1="84" x2="148" y2="112" class="rw-leg"/><line x1="96" y1="40" x2="92" y2="12" class="rw-leg"/><line x1="144" y1="40" x2="148" y2="12" class="rw-leg"/>'); },
    pir: function () { return svg('<rect x="70" y="60" width="100" height="40" rx="3" fill="#2a8a4a"/><path d="M84 62 A36 36 0 0 1 156 62 Z" fill="#f3f5f8" stroke="#ccc"/><circle cx="96" cy="88" r="7" fill="#f07818"/><circle cx="144" cy="88" r="7" fill="#f07818"/><line x1="104" y1="100" x2="104" y2="118" class="rw-leg"/><line x1="120" y1="100" x2="120" y2="118" class="rw-leg"/><line x1="136" y1="100" x2="136" y2="118" class="rw-leg"/>'); },
    arduino: function () { var o = '<rect x="20" y="16" width="200" height="90" rx="6" fill="#0f5c7a"/><rect x="24" y="40" width="26" height="22" fill="#aaa"/><rect x="100" y="50" width="70" height="20" fill="#222"/>'; for (var i = 0; i < 14; i++) o += '<rect x="' + (70 + i * 10) + '" y="20" width="6" height="6" fill="#111"/>'; for (i = 0; i < 6; i++) o += '<rect x="' + (150 + i * 10) + '" y="96" width="6" height="6" fill="#111"/>'; return svg(o + '<text x="120" y="88" text-anchor="middle" class="rw-tx" fill="#e6f6ff" style="font-size:12px">UNO</text>'); }
  };

  /* ---------- library ---------- */
  var P = [
    { id: "resistor", ar: "المقاومة", en: "Resistor", cat: "عناصر", tool: "color", lessons: ["c1-elements-2", "c1-resistive-1"], lab: "led-indicator",
      what: "تحدد التيار وتقسم الجهد. قيمتها مكتوبة بحلقات ملونة، وقدرتها المقننة من حجمها (الشائع 1/4 W).",
      identify: ["اقرأ الحلقات من الطرف البعيد عن حلقة السماحية (الذهبية غالبًا على اليمين).", "4 حلقات: رقمان ثم المضاعف ثم السماحية. 5 حلقات: ثلاثة أرقام ثم المضاعف ثم السماحية.", "القيم المصنّعة قياسية (سلسلة E12 و E24)، فإن حسبت 200 Ω ستجد 220 Ω أو 180 Ω."],
      measure: ["افصل طرفًا واحدًا على الأقل من الدائرة، وإلا قست العناصر الموازية معها.", "الملتيميتر على Ω، ولا تلمس الطرفين بأصابعك (مقاومة جسمك تتوازى معها في القيم الكبيرة).", "توقّع قراءة ضمن السماحية: 220 Ω بسماحية ±5% بين 209 و 231 Ω."],
      faults: [["لونها داكن أو محروقة", "قدرة أكبر من تصنيفها", "احسب p = i²R واختر تصنيفًا أعلى بهامش"], ["الملتيميتر يقرأ OL", "المقاومة مفتوحة (تلفت)", "استبدلها"], ["القيمة بعيدة جدًا عن المتوقع", "قرأت الحلقات بالعكس أو المضاعف خطأ", "استخدم أداة الألوان أدناه"]] },
    { id: "ceramic", ar: "المكثف السيراميكي", en: "Ceramic Capacitor", cat: "عناصر", tool: "cap", lessons: ["c1-sinusoidal-3"], lab: "rc-filter",
      what: "مكثف صغير غير مستقطب، يُركّب بأي اتجاه. قيمته مكتوبة برمز من ثلاثة أرقام بوحدة pF.",
      identify: ["الرقمان الأولان قيمة، والثالث عدد الأصفار، والنتيجة بالـ pF: 104 = 100000 pF = 100 nF.", "رقمان فقط (مثل 22) يعنيان القيمة نفسها بالـ pF.", "حرف بعد الرقم يدل على السماحية، مثل J = ±5% و K = ±10% و M = ±20%."],
      measure: ["فرّغ المكثف أولًا (لا خطر في الدوائر الصغيرة، لكنها عادة صحيحة).", "استخدم وضع السعة في الملتيميتر إن وُجد، أو قس تردد القطع في دائرة RC بالأوسيلوسكوب."],
      faults: [["قيمة القطع بعيدة عن الحساب", "سماحية المكثفات واسعة (±10% أو ±20%)", "قس السعة الفعلية واستخدمها في الحساب"]] },
    { id: "electrolytic", ar: "المكثف الإلكتروليتي", en: "Electrolytic Capacitor", cat: "عناصر", tool: "cap", lessons: ["c1-sinusoidal-3"],
      what: "سعة كبيرة (µF) في حجم صغير، لكنه مستقطب: له طرف موجب وطرف سالب.",
      identify: ["الشريط على الجسم بعلامات (−) يشير إلى الطرف السالب.", "في القطع الجديدة الطرف الأطول هو الموجب.", "الجهد المكتوب (مثل 16V) حد أقصى؛ اختر جهدًا أعلى من جهد دائرتك بهامش."],
      measure: ["فرّغه قبل القياس عبر مقاومة، خصوصًا في الدوائر ذات الجهد الأعلى.", "قس السعة بوضع السعة في الملتيميتر إن وُجد."],
      faults: [["انتفاخ أو تسريب", "عكس القطبية أو جهد أعلى من المقنن", "افصل الدائرة واستبدله بالاتجاه الصحيح"]] },
    { id: "inductor", ar: "الملف", en: "Inductor", cat: "عناصر", lessons: ["c1-sinusoidal-3"],
      what: "سلك ملفوف يخزن الطاقة في مجال مغناطيسي. ممانعته jωL تزيد مع التردد.",
      identify: ["الملفات المحورية الصغيرة تُكتب بحلقات ألوان مثل المقاومة، والقيمة بالـ µH.", "الملفات الأكبر مكتوب عليها القيمة وأقصى تيار."],
      measure: ["الملتيميتر يقيس مقاومته المستمرة فقط (عادةً صغيرة)، لا الحث.", "الحث يحتاج جهاز LCR، أو يُستنتج من تجربة RL بمولد إشارة وأوسيلوسكوب."],
      faults: [["سخونة", "تيار أكبر من المقنن", "اختر ملفًا بتيار أعلى"]] },
    { id: "led", ar: "الثنائي المشع LED", en: "LED", cat: "عناصر", tool: "ledr", lessons: ["c1-elements-2"], lab: "led-indicator",
      what: "يضيء عندما يمر فيه تيار من الموجب (Anode) إلى السالب (Cathode). يحتاج دائمًا مقاومة على التوالي.",
      identify: ["الطرف الأطول موجب، والحافة المسطحة على قاعدته عند الطرف السالب.", "جهد التشغيل يعتمد على اللون: الأحمر حوالي 2 V والأزرق والأبيض حوالي 3 V (ارجع لورقة البيانات).", "التيار الشائع للقطع العادية 5 إلى 20 mA."],
      measure: ["وضع الديود في الملتيميتر يعرض جهد التشغيل تقريبًا، وقد يضيء الـ LED خافتًا.", "قس التيار بوضع الأميتر على التوالي."],
      faults: [["لا يضيء", "معكوس الاتجاه، أو جهد المصدر أقل من جهد تشغيله", "اعكسه أو ارفع الجهد"], ["أضاء بقوة ثم انطفأ", "بدون مقاومة أو مقاومة صغيرة جدًا", "احسب R = (Vs − Vf)/I"]] },
    { id: "ldr", ar: "المقاومة الضوئية LDR", en: "Light-Dependent Resistor", cat: "حساسات", lessons: ["c1-resistive-3"], lab: "light-sensor",
      what: "مقاومتها تقل كلما زاد الضوء. توضع في مجزّئ جهد ليقرأها متحكم مثل Arduino.",
      identify: ["قرص بخط متعرج بني أو أحمر، وبدون قطبية.", "قيمها تختلف كثيرًا بين القطع؛ قسها بنفسك في الضوء والظلام."],
      measure: ["قس المقاومة في ضوء الغرفة ثم وهي مغطاة بإصبعك.", "استجابتها بطيئة نسبيًا: انتظر لحظة بعد تغيير الضوء."],
      faults: [["القراءة لا تتغير مع الضوء", "المقاومة الثابتة في المجزّئ بعيدة جدًا عن قيم الـ LDR", "اختر R ≈ √(R_light·R_dark)"]] },
    { id: "ntc", ar: "الثرمستور NTC", en: "NTC Thermistor", cat: "حساسات", lessons: ["c1-resistive-3"], lab: "temp-alarm",
      what: "مقاومته تقل كلما ارتفعت الحرارة. يُوصف بقيمتين: R عند 25°C، والثابت B.",
      identify: ["حبة صغيرة بطرفين، والقيمة الشائعة 10 kΩ عند 25°C.", "R25 و B تجدهما في ورقة البيانات، مثل 10k و 3950 K."],
      measure: ["قسه في حرارة الغرفة ثم وهو بين أصابعك.", "مرّر تيارًا صغيرًا فقط: التيار الكبير يسخّنه فيخطئ القياس (Self-heating)."],
      faults: [["القراءة تنجرف ببطء", "تسخين ذاتي من تيار كبير", "زِد المقاومات في الجسر لتقليل التيار"]] },
    { id: "battery", ar: "البطارية", en: "Battery", cat: "مصادر", lessons: ["c1-elements-1"], lab: "mixer",
      what: "مصدر جهد مستمر حقيقي: جهد اسمي ومقاومة داخلية صغيرة. AA القلوية اسميًا 1.5 V.",
      identify: ["الطرف البارز موجب في AA.", "عدة بطاريات على التوالي تجمع جهودها: اثنتان AA ≈ 3 V."],
      measure: ["قس الجهد وهي تغذي حملًا: البطارية الضعيفة قد تقرأ جيدًا بدون حمل ثم تهبط.", "الفرق بين جهد بدون حمل وجهد مع حمل يكشف مقاومتها الداخلية."],
      faults: [["سخونة في الأسلاك", "قصر بين الطرفين", "افصلها فورًا؛ لا تقصر البطارية أبدًا"]] },
    { id: "breadboard", ar: "لوحة التجارب", en: "Breadboard", cat: "أدوات", lessons: [], lab: "led-indicator",
      what: "تبني عليها الدائرة بدون لحام. كل عمود من 5 ثقوب موصول داخليًا، والخطوط الطويلة على الأطراف للتغذية.",
      identify: ["الأعمدة a–e موصولة مع بعضها في كل رقم، وكذلك f–j، والقناة في المنتصف تفصلهما.", "خطوط + و − تمتد بطول اللوحة، وفي بعض اللوحات تنقطع في المنتصف؛ تحقق بوضع الاستمرارية."],
      measure: ["وضع الاستمرارية (الصافرة) يخبرك إن كانت نقطتان موصولتين."],
      faults: [["العنصر لا يعمل إطلاقًا", "طرفاه في نفس العمود (مقصور)", "ضع طرفي العنصر في عمودين مختلفين"], ["نصف اللوحة بلا تغذية", "خط التغذية منقطع في المنتصف", "صل نصفي الخط بسلك"]] },
    { id: "multimeter", ar: "الملتيميتر", en: "Multimeter", cat: "أجهزة قياس", lessons: ["c1-variables-2"],
      what: "يقيس الجهد والتيار والمقاومة. أهم قاعدة: الجهد على التوازي، والتيار على التوالي.",
      identify: ["المقبس COM للمجس الأسود دائمًا.", "VΩmA للأحمر عند قياس الجهد والمقاومة والتيار الصغير، و 10A للتيار الكبير."],
      measure: ["الجهد: المجسان على طرفي العنصر والدائرة تعمل.", "التيار: افتح الدائرة وضع الجهاز مكان السلك المفتوح.", "المقاومة: والدائرة مطفأة.", "V AC يقرأ القيمة الفعالة؛ الأجهزة الرخيصة دقيقة للموجة الجيبية فقط (غير True RMS)."],
      faults: [["الجهاز لا يقرأ تيارًا بعد ذلك", "قست جهدًا والمجس الأحمر في مقبس التيار فاحترق المصهر", "غيّر المصهر، وأعد المجس لمقبس V قبل قياس الجهد"], ["قراءة سالبة", "المجسان معكوسان", "لا ضرر؛ الإشارة تخبرك بالاتجاه"]] },
    { id: "scope", ar: "الأوسيلوسكوب", en: "Oscilloscope", cat: "أجهزة قياس", lessons: ["c1-sinusoidal-1"], lab: "rc-filter",
      what: "يرسم الجهد مع الزمن. تقرأ منه القيمة العظمى والزمن الدوري وفرق الطور بين إشارتين.",
      identify: ["كل قناة لها مجس بمشبك أرضي.", "المجسات غالبًا بوضعين ×1 و ×10؛ اضبط القناة على نفس الوضع."],
      measure: ["صل المشبك الأرضي بأرضي الدائرة فقط.", "فرق الطور: φ = −360° × f × Δt حيث Δt الفرق الزمني بين القمتين."],
      faults: [["الإشارة أصغر بعشر مرات", "المجس على ×10 والقناة على ×1", "طابق الإعدادين"], ["قصر عند توصيل المشبك", "المشبك على نقطة ليست أرضيًا، وأرضي الجهاز موصول بأرضي الشبكة", "المشبك على الأرضي فقط"]] },
    { id: "generator", ar: "مولد الإشارة", en: "Function Generator", cat: "أجهزة قياس", lessons: ["c1-power-6"], lab: "max-power",
      what: "يولد موجة جيبية أو مربعة بتردد وسعة تختارهما، ومقاومة خرجه غالبًا 50 Ω.",
      identify: ["الخرج عادة بمقبس BNC؛ الطرف الخارجي أرضي.", "بعض الأجهزة تعرض السعة مفترضةً حملًا 50 Ω؛ مع حمل عالي المقاومة يتضاعف الجهد الفعلي (إعداد High-Z)."],
      measure: ["تحقق من السعة الفعلية بالأوسيلوسكوب بدل الاعتماد على الشاشة."],
      faults: [["الجهد ضعف المتوقع", "الجهاز مضبوط على حمل 50 Ω وحملك عالي المقاومة", "غيّر الإعداد إلى High-Z"]] },
    { id: "pot", ar: "المقاومة المتغيرة", en: "Potentiometer", cat: "عناصر", lessons: ["c1-resistive-3"],
      what: "مقاومة بثلاثة أطراف: الطرفان الخارجيان بينهما القيمة الكاملة، والأوسط (Wiper) يتحرك بينهما فيعمل كمجزّئ جهد.",
      identify: ["القيمة الكاملة مكتوبة على الجسم، مثل 10K أو 103.", "الطرف الأوسط هو المنزلق."],
      measure: ["بين الطرفين الخارجيين: القيمة الكاملة ثابتة.", "بين الأوسط وأحد الطرفين: تتغير مع التدوير."],
      faults: [["التدوير لا يغير شيئًا", "وصلت الطرفين الخارجيين فقط", "استخدم الطرف الأوسط"]] },
    { id: "button", ar: "مفتاح الضغط", en: "Push Button", cat: "عناصر", lessons: [], lab: "button",
      what: "يوصل الدائرة ما دمت تضغطه. مع Arduino يُستخدم غالبًا مع INPUT_PULLUP.",
      identify: ["الأزرار ذات الأربعة أطراف: كل طرفين متقابلين موصولان داخليًا دائمًا.", "ضعه فوق القناة الوسطى في لوحة التجارب."],
      measure: ["وضع الاستمرارية: يصفر عند الضغط بين الطرفين الصحيحين فقط."],
      faults: [["الدائرة تعمل دائمًا", "الطرفان المستخدمان موصولان داخليًا أصلًا", "استخدم طرفين على قطر الزر"], ["قراءة Arduino عشوائية", "المدخل بدون مقاومة سحب", "استخدم INPUT_PULLUP"]] },
    { id: "pir", ar: "حساس الحركة PIR", en: "PIR Motion Sensor", cat: "حساسات", lessons: [], lab: "pir",
      what: "يكشف حركة الأجسام الدافئة (الأشخاص) أمامه، ويعطي خرجًا رقميًا مرتفعًا لفترة بعد الكشف.",
      identify: ["ثلاثة أطراف: VCC و OUT و GND.", "في وحدات HC-SR501 مقاومتان متغيرتان: الحساسية وزمن الإبقاء، والخرج المرتفع 3.3 V تقريبًا."],
      measure: ["قس OUT بالملتيميتر وحرّك يدك أمامه.", "يحتاج وقتًا قصيرًا بعد التشغيل حتى يستقر؛ القراءات الأولى قد تكون خاطئة."],
      faults: [["لا يكشف شخصًا واقفًا", "PIR يكشف الحركة لا الوجود", "هذا سلوكه الطبيعي"]] },
    { id: "arduino", ar: "Arduino Uno", en: "Arduino Uno", cat: "متحكمات", lessons: [], lab: "blink",
      what: "متحكم يعمل بمنطق 5 V. منافذه الرقمية تعطي 0 أو 5 V، ومداخله التماثلية تقرأ 0–5 V كرقم من 0 إلى 1023.",
      identify: ["المنفذ 13 عليه LED صغير على اللوحة (L).", "منافذ PWM عليها علامة ~ (مثل 9).", "A0 إلى A5 مداخل تماثلية."],
      measure: ["لا تدخل جهدًا أعلى من 5 V على أي منفذ.", "الحد الموصى به لتيار المنفذ 20 mA (الأقصى المطلق 40 mA)؛ الأحمال الأكبر تحتاج ترانزستور أو مرحّل."],
      faults: [["المنفذ لا يعمل بعد تجربة", "تيار زائد أو جهد أعلى من 5 V على المنفذ", "جرّب منفذًا آخر، واحسب التيار دائمًا"]] }
  ];

  /* ---------- tools ---------- */
  function colorTool() {
    var opt = function (list, sel, f) { return list.map(function (c, i) { return '<option value="' + i + '"' + (i === sel ? " selected" : "") + '>' + c[0] + (f ? f(c) : "") + '</option>'; }).join(""); };
    return '<section class="card rw-tool" id="tool-color"><h2>حاسبة ألوان المقاومة</h2>' +
      '<div class="rw-row"><div class="field"><label for="cb-n">عدد الحلقات</label><select class="select" id="cb-n"><option value="4">4</option><option value="5">5</option></select></div>' +
      '<div class="field"><label for="cb-1">الرقم 1</label><select class="select" id="cb-1">' + opt(COL, 2) + '</select></div><div class="field"><label for="cb-2">الرقم 2</label><select class="select" id="cb-2">' + opt(COL, 2) + '</select></div>' +
      '<div class="field" id="cb-3w" hidden><label for="cb-3">الرقم 3</label><select class="select" id="cb-3">' + opt(COL, 0) + '</select></div>' +
      '<div class="field"><label for="cb-m">المضاعف</label><select class="select" id="cb-m">' + opt(MULT, 1, function (c) { return " ×" + (c[2] >= 1 ? c[2].toLocaleString("en") : c[2]); }) + '</select></div>' +
      '<div class="field"><label for="cb-t">السماحية</label><select class="select" id="cb-t">' + opt(TOL, 0, function (c) { return " ±" + c[2] + "%"; }) + '</select></div></div>' +
      '<div class="rw-out"><div id="cb-svg"></div><p id="cb-val" class="rw-big"></p></div>' +
      '<hr class="rw-hr"><div class="rw-row"><div class="field"><label for="cb-in">أو اكتب قيمة لتعرف ألوانها (مثل 4.7k)</label><input class="input" id="cb-in" dir="ltr" placeholder="4.7k"></div></div><p id="cb-rev" class="muted"></p></section>';
  }
  function parseSI(s) { s = String(s).trim().replace(/ohm|Ω|\s/gi, "").replace(",", "."); var m = /^(\d*\.?\d+)([pnuµmkKM]?)$/.exec(s); if (!m) return NaN; return parseFloat(m[1]) * ({ p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6 }[m[2]] || 1); }
  function nearest(v, series) { var e = Math.floor(Math.log10(v)), best = null; [e - 1, e, e + 1].forEach(function (k) { series.forEach(function (m) { var x = m * Math.pow(10, k); if (!best || Math.abs(Math.log(x / v)) < Math.abs(Math.log(best / v))) best = x; }); }); return Number(best.toPrecision(3)); }
  function bindColor() {
    function upd() {
      var five = $("cb-n").value === "5"; $("cb-3w").hidden = !five;
      var d = [+$("cb-1").value, +$("cb-2").value].concat(five ? [+$("cb-3").value] : []), m = MULT[+$("cb-m").value], t = TOL[+$("cb-t").value];
      var digits = +d.join(""), val = digits * m[2];
      $("cb-svg").innerHTML = resistorSVG(d.map(function (i) { return COL[i][2]; }).concat([m[1], t[1]]));
      $("cb-val").innerHTML = '<span class="ltr">' + si(val, "Ω") + ' ±' + t[2] + '%</span> <span class="muted">(بين <span class="ltr">' + si(val * (1 - t[2] / 100), "Ω") + '</span> و <span class="ltr">' + si(val * (1 + t[2] / 100), "Ω") + '</span>)</span>';
    }
    ["cb-n", "cb-1", "cb-2", "cb-3", "cb-m", "cb-t"].forEach(function (id) { $(id).addEventListener("change", upd); }); upd();
    $("cb-in").addEventListener("input", function () {
      var v = parseSI(this.value), out = $("cb-rev");
      if (!(v > 0)) { out.textContent = this.value ? "اكتب رقمًا مثل 220 أو 4.7k أو 1M." : ""; return; }
      var e = Math.floor(Math.log10(v) + 1e-9) - 1, dd = Math.round(v / Math.pow(10, e));
      if (dd >= 100) { dd = Math.round(dd / 10); e++; }
      var exact = Math.abs(dd * Math.pow(10, e) - v) / v < 1e-6, mi = e + (e < 0 ? 0 : 0), mIdx = e >= 0 ? e : e === -1 ? 10 : e === -2 ? 11 : -1;
      if (mIdx < 0 || mIdx >= MULT.length) { out.textContent = "قيمة خارج مدى الحلقات الأربع."; return; }
      var names = [COL[Math.floor(dd / 10)][0], COL[dd % 10][0], MULT[mIdx][0], "ذهبي"];
      var e12 = nearest(v, E12), isE12 = Math.abs(e12 - v) / v < 0.005;
      out.innerHTML = (exact ? "" : "قرّبت إلى رقمين: <span class='ltr'>" + si(dd * Math.pow(10, e), "Ω") + "</span>. ") + "الألوان (4 حلقات، ±5%): <b>" + names.join(" – ") + "</b>." + (isE12 ? " قيمة قياسية في E12 ✓" : " ليست في E12؛ الأقرب <span class='ltr'>" + si(e12, "Ω") + "</span>، وفي E24 <span class='ltr'>" + si(nearest(v, E24), "Ω") + "</span>.");
    });
  }
  function capTool() {
    return '<section class="card rw-tool" id="tool-cap"><h2>فك رمز المكثف</h2><div class="rw-row"><div class="field"><label for="cc-in">الرمز المكتوب (مثل 104 أو 22 أو 473J)</label><input class="input" id="cc-in" dir="ltr" value="104"></div><div class="field"><label for="cc-v">أو القيمة لتعرف رمزها (مثل 150n)</label><input class="input" id="cc-v" dir="ltr" placeholder="150n"></div></div><p class="rw-big" id="cc-out"></p><p class="muted" id="cc-rev"></p></section>';
  }
  function bindCap() {
    var TOLC = { B: "±0.1 pF", C: "±0.25 pF", D: "±0.5 pF", F: "±1%", G: "±2%", J: "±5%", K: "±10%", M: "±20%", Z: "+80% / −20%" };
    function dec() {
      var s = $("cc-in").value.trim().toUpperCase(), m = /^(\d{2,3})([A-Z]?)$/.exec(s), out = $("cc-out");
      if (!m) { out.textContent = s ? "اكتب رقمين أو ثلاثة، وحرف السماحية اختياري." : ""; return; }
      var d = m[1], pf = d.length === 2 ? +d : +d.slice(0, 2) * Math.pow(10, +d[2]);
      if (d.length === 3 && +d[2] > 6) { out.textContent = "الرقم الثالث عادةً من 0 إلى 6 (والرقمان 8 و 9 يعنيان ×0.01 و ×0.1 عند بعض المصنعين)."; return; }
      out.innerHTML = '<span class="ltr">' + d + ' → ' + pf.toLocaleString("en") + ' pF' + (pf >= 1000 ? ' = ' + si(pf * 1e-12, "F") : "") + '</span>' + (m[2] ? ' <span class="muted">السماحية: <span class="ltr">' + (TOLC[m[2]] || "؟") + '</span></span>' : "");
    }
    $("cc-in").addEventListener("input", dec); dec();
    $("cc-v").addEventListener("input", function () {
      var v = parseSI(this.value.replace(/F/i, "")), out = $("cc-rev");
      if (!(v > 0)) { out.textContent = ""; return; }
      var pf = v / 1e-12, e = Math.floor(Math.log10(pf) + 1e-9) - 1, dd = Math.round(pf / Math.pow(10, e));
      if (dd >= 100) { dd = Math.round(dd / 10); e++; }
      out.innerHTML = pf < 10 ? "قيمة أصغر من 10 pF تُكتب عادة مباشرة (مثل 4.7)." : e < 0 ? "الرمز: <b class='ltr'>" + Math.round(pf) + "</b>" : "الرمز: <b class='ltr'>" + dd + e + "</b> <span class='muted'>(" + dd + " × 10^" + e + " pF)</span>";
    });
  }
  function ledTool() {
    return '<section class="card rw-tool" id="tool-ledr"><h2>مقاومة الـ LED</h2><div class="rw-row"><div class="field"><label for="lr-vs">جهد المصدر (V)</label><input class="input" id="lr-vs" dir="ltr" value="5"></div><div class="field"><label for="lr-vf">جهد تشغيل الـ LED (V)</label><input class="input" id="lr-vf" dir="ltr" value="2"></div><div class="field"><label for="lr-i">التيار المطلوب (mA)</label><input class="input" id="lr-i" dir="ltr" value="15"></div></div><p class="rw-big" id="lr-out"></p></section>';
  }
  function bindLed() {
    function upd() {
      var vs = parseFloat($("lr-vs").value), vf = parseFloat($("lr-vf").value), i = parseFloat($("lr-i").value) / 1000, out = $("lr-out");
      if (!(vs > 0 && vf > 0 && i > 0)) { out.textContent = "أدخل أرقامًا موجبة."; return; }
      if (vs <= vf) { out.textContent = "جهد المصدر يجب أن يكون أكبر من جهد تشغيل الـ LED."; return; }
      var r = (vs - vf) / i, e = E12.map(function () { return 0; }), up = null, k;
      for (k = -1; k <= 6 && up === null; k++) E12.forEach(function (m) { var x = Number((m * Math.pow(10, k)).toPrecision(3)); if (up === null && x >= r - 1e-9) up = x; });
      var iu = (vs - vf) / up, p = iu * iu * up;
      out.innerHTML = '<span class="ltr">R = (' + vs + ' − ' + vf + ') / ' + (i * 1000) + ' mA = ' + si(r, "Ω") + '</span><br>القيمة القياسية الأكبر (E12): <b class="ltr">' + si(up, "Ω") + '</b> ← التيار <span class="ltr">' + si(iu, "A") + '</span> وقدرة المقاومة <span class="ltr">' + si(p, "W") + '</span>' + (p > 0.125 ? ' <span class="cl-err">— أكبر من نصف 1/4 W، اختر 1/2 W.</span>' : "");
    }
    ["lr-vs", "lr-vf", "lr-i"].forEach(function (id) { $(id).addEventListener("input", upd); }); upd();
  }
  var TOOLS = { color: [colorTool, bindColor], cap: [capTool, bindCap], ledr: [ledTool, bindLed] };

  /* ---------- views ---------- */
  function lessonName(id) { return CV.lessons && CV.lessons[id] ? CV.lessons[id].ar : id; }
  function list() {
    document.title = "الهندسة في الواقع — CircuitVision";
    var cats = []; P.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    root.innerHTML = '<header class="rw-head"><span class="eyebrow ltr" style="justify-self:start">Real-World Engineering</span><h1>الهندسة في الواقع</h1><p>القطع والأجهزة الحقيقية التي تستخدمها في المعمل والمشاريع: كيف تتعرف عليها، وكيف تقيسها، وما الأعطال الشائعة. الصور رسوم توضيحية.</p></header>' +
      '<nav class="rw-tools-nav"><a class="btn btn-ghost btn-sm" href="#tool-color">حاسبة ألوان المقاومة</a><a class="btn btn-ghost btn-sm" href="#tool-cap">رمز المكثف</a><a class="btn btn-ghost btn-sm" href="#tool-ledr">مقاومة الـ LED</a></nav>' +
      cats.map(function (c) { return '<section class="rw-cat"><h2>' + c + '</h2><div class="rw-grid">' + P.filter(function (p) { return p.cat === c; }).map(function (p) { return '<a class="card rw-card" href="#' + p.id + '"><div class="rw-pic">' + ILL[p.id]() + '</div><b>' + p.ar + '</b><span class="ltr en">' + p.en + '</span><p>' + p.what + '</p></a>'; }).join("") + '</div></section>'; }).join("") +
      '<div class="rw-toolbox">' + colorTool() + capTool() + ledTool() + '</div>';
    bindColor(); bindCap(); bindLed();
  }
  function one(p) {
    document.title = p.ar + " — الهندسة في الواقع";
    var t = TOOLS[p.tool];
    root.innerHTML = '<nav class="crumbs"><a href="#">الهندسة في الواقع</a><span>/</span><span>' + p.ar + '</span></nav>' +
      '<header class="rw-one card"><div class="rw-pic big">' + ILL[p.id]() + '</div><div><h1>' + p.ar + '</h1><span class="ltr en">' + p.en + '</span><p>' + p.what + '</p>' +
      '<div class="rw-links">' + p.lessons.map(function (l) { return '<a class="chip chip-src" href="lesson.html#' + l + '">درس: ' + lessonName(l) + '</a>'; }).join("") + (p.lab ? '<a class="chip chip-build" href="lab.html#ex-' + p.lab + '">جرّبه في المعمل</a>' : "") + '</div></div></header>' +
      '<div class="rw-cols"><section class="card rw-sec"><h2>كيف تتعرف عليه</h2><ul class="ticks">' + p.identify.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul></section>' +
      '<section class="card rw-sec"><h2>كيف تقيسه</h2><ul class="ticks">' + p.measure.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul></section></div>' +
      '<section class="card rw-sec"><h2>أعطال شائعة</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>العَرَض</th><th>السبب المحتمل</th><th>ماذا تفعل</th></tr></thead><tbody>' + p.faults.map(function (f) { return "<tr><td>" + f[0] + "</td><td>" + f[1] + "</td><td>" + f[2] + "</td></tr>"; }).join("") + '</tbody></table></div></section>' +
      (t ? t[0]() : "");
    if (t) t[1]();
  }
  function route() {
    var id = location.hash.replace("#", ""), p = P.filter(function (x) { return x.id === id; })[0];
    if (p) { one(p); view = "one"; window.scrollTo(0, 0); return; }
    if (view !== "list" || !id) { list(); view = "list"; }
    if (/^tool-/.test(id)) { var el = document.getElementById(id); if (el) el.scrollIntoView({ block: "start" }); } else window.scrollTo(0, 0);
  }
  var view = "";
  window.addEventListener("hashchange", route); route();
})();
