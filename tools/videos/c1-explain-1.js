/* Circuits 1 · Chapter 1 — scripts of the animated lesson videos (explain.js). English on screen; the Arabic of each
   beat becomes the subtitle track. Content and order follow the lessons (c1-variables.js). */
(function () {
  "use strict";
  var CH = "Chapter 1 · Circuit Variables";

  EX.add("c1-variables-1", {
    chapter: CH,
    goals: [["Know an electric circuit as a mathematical model of a real system.", "تعرف الدائرة الكهربائية كنموذج رياضي لنظام حقيقي."],
      ["Know what a circuit is made of: sources, resistors, inductors and capacitors.", "تعرف مكونات الدائرة: المصادر والمقاومات والملفات والمكثفات."],
      ["Know the four circuit variables: current, voltage, power and energy.", "تعرف متغيرات الدائرة الأربعة: التيار والجهد والقدرة والطاقة."]],
    items: [
      ["idea", { chain: ["Real system", "Circuit model", "Mathematical analysis", "Compare with measurement"], beats: [
        ["In electrical engineering we move energy from one point to another, so we connect electrical devices together.", "في الهندسة الكهربائية ننقل الطاقة من نقطة إلى أخرى، فنوصل الأجهزة الكهربائية ببعضها."],
        ["That interconnection is an electric circuit, and each component in it is an element.", "هذا التوصيل يسمى دائرة كهربائية، وكل مكوّن فيه يسمى عنصرًا."],
        ["A circuit in this course is a mathematical model: it approximates how the real system behaves.", "الدائرة في هذا المقرر نموذج رياضي يقرّب سلوك النظام الحقيقي."],
        ["We analyze the model by calculation instead of experimenting on the device, then compare the result with measurement.", "نحلل النموذج بالحساب بدل التجربة على الجهاز نفسه، ثم نقارن النتيجة بالقياس."]] }],
      ["idea", { label: "What a circuit is made of", table: [["Element", "What it does", "Kind"], ["Source", "supplies energy", "active"], ["Resistor $R$", "turns energy into heat, stores none", "passive, non-reactive"], ["Inductor $L$, capacitor $C$", "store energy and give it back", "reactive"]], beats: [
        ["Sources, or generators, supply energy to the circuit.", "المصادر (المولدات) تعطي الدائرة الطاقة."],
        ["The resistor is passive and non-reactive: it absorbs energy and stores none.", "المقاومة عنصر خامل غير مفاعل: تمتص الطاقة ولا تخزنها."],
        ["The inductor and the capacitor are reactive: they store energy and return it. Their effect shows only when voltage or current changes with time.", "الملف والمكثف عنصران مفاعلان: يخزنان الطاقة ويعيدانها. ويظهر أثرهما فقط عندما يتغير الجهد أو التيار مع الزمن."]] }],
      ["idea", { label: "The four circuit variables", table: [["Variable", "Symbol", "Unit"], ["Current", "$I$", "ampere (A)"], ["Voltage", "$V$", "volt (V)"], ["Power", "$P$", "watt (W)"], ["Energy", "$W$", "joule (J)"]], beats: [
        ["Every analysis in this course revolves around four variables: current, voltage, power and energy.", "كل تحليل في المقرر يدور حول أربعة متغيرات: التيار والجهد والقدرة والطاقة."],
        ["Each has its own symbol and unit. Write the unit with every number: it is how you catch mistakes.", "لكل متغير رمز ووحدة. اكتب الوحدة مع كل رقم، فهي طريقتك لاكتشاف الأخطاء."]] }],
      ["law", { label: "How the variables are linked", steps: [
        ["V = @frac{dw}{dq}", "Voltage is energy per unit charge: how much work moves one coulomb.", "الجهد طاقة لكل وحدة شحنة: الشغل اللازم لنقل كولوم واحد."],
        ["I = @frac{dq}{dt}", "Current is the rate of flow of charge: coulombs per second.", "التيار معدل مرور الشحنة: كولوم لكل ثانية."],
        ["P = @frac{dw}{dt} = V @cdot I", "Power is the rate of energy, and it turns out to be voltage times current. The next lessons build each of these.", "القدرة معدل الطاقة، وتساوي الجهد في التيار. الدروس القادمة تبني كل علاقة منها."]] }],
      ["when", { beats: [
        ["Before any calculation, identify the elements in the drawing: which is a source, which is a resistor, an inductor or a capacitor.", "قبل أي حساب، حدّد العناصر في الرسم: أيها مصدر وأيها مقاومة أو ملف أو مكثف."],
        ["If the analysis differs a lot from the measurement, the error is usually in the model, not in the arithmetic.", "إذا اختلف التحليل كثيرًا عن القياس، فالخطأ غالبًا في النموذج نفسه وليس في الحساب."]] }],
      ["ex", { title: "Example", q: ["A circuit has a battery, a resistor, a capacitor and an inductor. Classify each element.", "مثال: دائرة فيها بطارية ومقاومة ومكثف وملف. صنّف كل عنصر."],
        steps: [
          ["@text{Battery} @to @text{source}", "The battery supplies energy to the circuit, so it is a source.", "البطارية تعطي الدائرة الطاقة، فهي مصدر."],
          ["@text{Resistor} @to @text{passive, non-reactive}", "The resistor turns energy into heat and does not store it.", "المقاومة تحوّل الطاقة إلى حرارة ولا تخزنها."],
          ["C, L @to @text{reactive}", "The capacitor and the inductor store energy and return it to the circuit.", "المكثف والملف يخزنان الطاقة ويعيدانها إلى الدائرة."]] }],
      ["real", { beats: [
        ["A phone charger has thousands of components. To find the current it draws, a simple model is enough: a source and one resistor for the load.", "شاحن الجوال فيه آلاف المكونات، لكن لحساب التيار الذي يسحبه يكفي نموذج بسيط: مصدر ومقاومة تمثل الحمل."],
        ["That is the whole idea of a circuit model: as simple as possible, as accurate as needed.", "هذه فكرة نموذج الدائرة: أبسط ما يمكن، وبالدقة التي نحتاجها."]] }],
      ["quiz", { i: 0, q: "In this course, an electric circuit is…", opts: ["a mathematical model that approximates a real electrical system", "the real device itself with all its details", "just a set of wires"],
        whys: ["This is the lecture's definition: we analyze the model instead of the device.", "The real device is complex; we analyze a simplified model of it.", "A circuit connects elements: sources, resistors, inductors and capacitors."],
        hints: [["Think about what we calculate with, rather than what we hold in our hands.", "فكّر فيما نحسب به، لا فيما نمسكه بأيدينا."]] }],
      ["quiz", { i: 1, q: "Which of these elements is reactive?", opts: ["the resistor", "the capacitor", "the battery"],
        whys: ["The resistor is passive and non-reactive: it stores no energy.", "The capacitor and the inductor are reactive: they store energy.", "The battery is a source: it supplies energy."],
        hints: [["Reactive elements store energy and give it back.", "العناصر المفاعلة تخزن الطاقة وتعيدها."]] }],
      ["quiz", { i: 2, q: "What is the unit of power?", opts: ["joule (J)", "watt (W)", "coulomb (C)"],
        whys: ["The joule is the unit of energy. Power is the rate of energy: J/s = W.", "Power is in watts, and one watt is one joule per second.", "The coulomb is the unit of charge."],
        hints: [["Power is energy per second.", "القدرة طاقة لكل ثانية."]] }],
      ["sum", { beats: [
        ["A circuit is a mathematical model of a real electrical system.", "الدائرة نموذج رياضي لنظام كهربائي حقيقي."],
        ["It is made of sources, passive resistors and reactive inductors and capacitors.", "تتكون من مصادر ومقاومات خاملة وملفات ومكثفات مفاعلة."],
        ["Its four variables are current, voltage, power and energy, each with its own unit.", "متغيراتها الأربعة: التيار والجهد والقدرة والطاقة، ولكل منها وحدته."]] }]
    ]
  });

  EX.add("c1-variables-2", {
    chapter: CH,
    goals: [["Define voltage as energy per unit charge: $V = dw/dq$.", "تعرّف الجهد بأنه طاقة لكل وحدة شحنة: V = dw/dq."],
      ["Define current as the rate of flow of charge: $I = dq/dt$.", "تعرّف التيار بأنه معدل مرور الشحنة: I = dq/dt."],
      ["Know the conventional current direction and the difference between DC and AC.", "تعرف الاتجاه الاصطلاحي للتيار والفرق بين DC و AC."]],
    items: [
      ["idea", { math: ["V = @frac{dw}{dq}", "I = @frac{dq}{dt}"], beats: [
        ["Voltage, or potential difference, is what drives the current. Precisely, it is the energy needed per unit charge, in volts.", "الجهد، أو فرق الجهد، هو ما يدفع التيار. وبدقة: هو الطاقة اللازمة لكل وحدة شحنة، ويقاس بالفولت."],
        ["Current is the flow of electric charge in a conductor: charge per unit time, in amperes.", "التيار هو سريان الشحنة الكهربائية في الموصل: شحنة لكل وحدة زمن، ويقاس بالأمبير."],
        ["One ampere is one coulomb passing a point every second: about $6.24 @times 10^{18}$ electrons per second.", "الأمبير الواحد كولوم يمر بنقطة كل ثانية، أي نحو 6.24 × 10¹⁸ إلكترون في الثانية."]] }],
      ["idea", { label: "Direction, DC and AC", beats: [
        ["The current direction is opposite to the motion of electrons: we draw current as if positive charges were moving.", "اتجاه التيار عكس حركة الإلكترونات: نرسم التيار كأن الشحنات الموجبة هي التي تتحرك."],
        ["Direct current, DC, always flows one way. Alternating current, AC, reverses direction periodically.", "التيار المستمر DC يسري في اتجاه واحد دائمًا، والتيار المتردد AC يعكس اتجاهه بشكل دوري."],
        ["A negative current in an answer only means the real direction is opposite to the arrow you drew. The answer is not wrong.", "التيار السالب في الإجابة يعني فقط أن الاتجاه الفعلي عكس السهم الذي رسمته، وليس أن الإجابة خطأ."]] }],
      ["idea", { label: "Symbols and units", table: [["Symbol", "Meaning", "Unit"], ["$V$", "voltage", "volt (V)"], ["$w$", "energy", "joule (J)"], ["$q$", "charge", "coulomb (C)"], ["$I$", "current", "ampere (A)"], ["$t$", "time", "second (s)"]], beats: [
        ["From the definitions come the units: 1 A = 1 C/s, and 1 V = 1 J/C.", "من التعريفين تأتي الوحدات: 1 A = 1 C/s و 1 V = 1 J/C."],
        ["When charge passes uniformly, the current is constant: $I = q/t$. When you know the energy to move a charge, $V = w/q$.", "إذا مرت الشحنة بانتظام فالتيار ثابت: I = q/t. وإذا عرفت الطاقة اللازمة لنقل شحنة فالجهد V = w/q."]] }],
      ["ex", { title: "Example", q: ["120 C pass uniformly through a conductor in one minute, and moving it between the ends takes 1440 J. Find the current, the voltage and the electrons per second.", "مثال: تمر شحنة 120 C بانتظام في موصل خلال دقيقة، ونقلها بين طرفيه يحتاج 1440 J. أوجد التيار والجهد وعدد الإلكترونات في الثانية."],
        given: ["q = 120 C", "t = 1 @text{min} = 60 s", "w = 1440 J"], find: "I, V, @text{electrons/s}",
        gwhy: ["Write each value with its unit, and change the minute into seconds: the ampere is coulombs per second.", "نكتب كل قيمة بوحدتها ونحوّل الدقيقة إلى ثوانٍ، لأن الأمبير كولوم لكل ثانية."],
        steps: [
          ["I = @frac{q}{t} = @frac{120}{60} = 2 A", "The charge passes uniformly, so the current is constant: charge divided by time.", "الشحنة تمر بانتظام، فالتيار ثابت: الشحنة مقسومة على الزمن."],
          ["V = @frac{w}{q} = @frac{1440}{120} = 12 V", "Voltage is energy per unit charge: the given energy divided by the charge.", "الجهد طاقة لكل وحدة شحنة: الطاقة المعطاة مقسومة على الشحنة."],
          ["2 @times 6.24 @times 10^{18} = 1.248 @times 10^{19}", "Every second 2 C pass, and each coulomb is $6.24 @times 10^{18}$ electrons.", "كل ثانية تمر 2 C، وكل كولوم يساوي 6.24 × 10¹⁸ إلكترون."]],
        check: [["The units agree: C/s gave amperes, J/C gave volts.", "الوحدات متسقة: C/s أعطت أمبير، و J/C أعطت فولت."],
          ["The electrons move opposite to the 2 A current.", "الإلكترونات تتحرك عكس اتجاه التيار 2 A."]] }],
      ["real", { beats: [
        ["A car battery gives an almost constant DC voltage of about 12 V.", "بطارية السيارة تعطي جهدًا مستمرًا شبه ثابت نحو 12 V."],
        ["A home outlet gives AC voltage that reverses 60 times a second in Saudi Arabia.", "مقبس البيت يعطي جهدًا مترددًا ينعكس 60 مرة في الثانية في السعودية."]] }],
      ["quiz", { i: 0, q: "One ampere equals…", opts: ["1 J/C", "1 C/s", "1 C·s"],
        whys: ["J/C is the unit of voltage, the volt. The ampere is a rate of charge.", "Current = charge ÷ time.", "Current is charge divided by time, not multiplied by it."],
        hints: [["Current is how much charge passes each second.", "التيار هو كمية الشحنة التي تمر كل ثانية."]] }],
      ["quiz", { i: 1, q: "You computed a current in the direction of your arrow and got $i = -3$ A. What does it mean?", opts: ["The solution is wrong: current can't be negative", "3 A flows against the arrow", "No current flows"],
        whys: ["Current can be negative relative to its reference; the sign tells the real direction.", "The minus sign means the real direction is opposite to the reference.", "3 A is not zero; the sign only sets the direction."],
        hints: [["The arrow is a reference you chose, not the physics.", "السهم مرجع اخترته أنت، وليس الحقيقة الفيزيائية."]] }],
      ["quiz", { i: 2, q: "A phone battery is rated 3000 mAh. What is its charge in coulombs?", opts: ["3 C", "10 800 C", "180 C"],
        whys: ["You changed mAh into Ah but forgot to change hours into seconds.", "3 Ah × 3600 s = 10 800 C.", "You multiplied by 60 only; an hour is 3600 seconds."],
        hints: [["mAh is a current times a time. Turn mA into A, and hours into seconds.", "mAh تيار في زمن. حوّل mA إلى A والساعة إلى ثوانٍ."]],
        answer: ["3000 mAh = 3 Ah, and 3 A × 3600 s = 10 800 C.", "3000 mAh = 3 Ah، و 3 A × 3600 s = 10 800 C."] }],
      ["sum", { math: ["V = @frac{dw}{dq} @quad I = @frac{dq}{dt}"], beats: [
        ["Voltage is energy per charge, in volts; current is charge per second, in amperes.", "الجهد طاقة لكل شحنة بالفولت، والتيار شحنة لكل ثانية بالأمبير."],
        ["Current is drawn in the direction positive charge would move; a negative answer means the opposite direction.", "يُرسم التيار في اتجاه حركة الشحنة الموجبة، والإشارة السالبة تعني الاتجاه المعاكس."],
        ["DC flows one way; AC reverses periodically.", "التيار المستمر في اتجاه واحد، والمتردد ينعكس دوريًا."]] }]
    ]
  });

  EX.add("c1-variables-3", {
    chapter: CH,
    goals: [["Apply the passive sign convention.", "تطبّق اصطلاح الإشارة الموجبة للعنصر الخامل."],
      ["Choose $p = vi$ or $p = -vi$ from the current reference and the voltage polarity.", "تختار p = vi أو p = −vi من مرجع التيار وقطبية الجهد."],
      ["Read the sign of power: positive absorbs, negative delivers.", "تفسّر إشارة القدرة: الموجبة امتصاص والسالبة توليد."]],
    items: [
      ["idea", { fig: "L0", beats: [
        ["The ideal basic circuit element has two terminals. We describe it by the voltage $v$ across it and the current $i$ through it.", "العنصر الأساسي المثالي له طرفان، ونصفه بالجهد v عبره والتيار i المار فيه."],
        ["The arrow for $i$ and the + and − for $v$ are references we choose. Together they decide the sign we write for power.", "سهم التيار وعلامتا + و − للجهد مراجع نختارها، ومعًا تحدد الإشارة التي نكتبها للقدرة."],
        ["Here the current reference enters the + terminal: it moves in the direction of the voltage drop. Then $p = vi$.", "هنا يدخل مرجع التيار من الطرف الموجب، أي في اتجاه هبوط الجهد، فنكتب p = vi."]] }],
      ["idea", { fig: "L1", label: "The other two cases", beats: [
        ["Here the current reference enters the − terminal: it moves through a voltage rise. Then $p = -vi$.", "هنا يدخل مرجع التيار من الطرف السالب، أي عبر ارتفاع في الجهد، فنكتب p = −vi."],
        ["Why? Positive charge moving through a drop loses energy: the element absorbs it. Moving through a rise it gains energy: the element delivers.", "لماذا؟ الشحنة الموجبة التي تعبر هبوطًا تفقد طاقة فيمتصها العنصر، والتي تعبر ارتفاعًا تكسب طاقة فيعطيها العنصر."]] }],
      ["law", { label: "The rule", steps: [
        ["p = vi @quad @text{(current enters at +)}", "This is the passive sign convention: a plus sign when the current reference enters the positive terminal.", "هذا اصطلاح الإشارة الموجبة: إشارة موجبة عندما يدخل مرجع التيار من الطرف الموجب."],
        ["p = -vi @quad @text{(current enters at −)}", "A minus sign when it enters the negative terminal.", "وإشارة سالبة عندما يدخل من الطرف السالب."],
        ["p > 0 @Rightarrow @text{absorbs} @quad p < 0 @Rightarrow @text{delivers}", "Then read the sign of the number: positive means the element absorbs power, negative means it delivers it.", "ثم نقرأ إشارة الناتج: الموجبة تعني أن العنصر يمتص القدرة، والسالبة أنه يعطيها."]] }],
      ["when", { beats: [
        ["Before writing $p$, look at the drawing: which terminal does the current arrow enter?", "قبل أن تكتب p، انظر إلى الرسم: من أي طرف يدخل سهم التيار؟"],
        ["The references are arbitrary, but once chosen, keep them in every equation. The physical result does not change.", "المراجع اختيارية، لكن بعد اختيارها التزم بها في كل المعادلات، والنتيجة الفيزيائية لا تتغير."]] }],
      ["ex", { title: "Lecture Example 1", fig: "L2", q: ["A 4 V drop and a 3 A current, as in cases (a) to (d). Give $v$ and $i$ for the passive sign convention, then the power: does the box absorb or deliver?", "مثال المحاضرة 1: هبوط 4 V وتيار 3 A كما في الحالات (a) إلى (d). أعطِ v و i حسب الاصطلاح، ثم القدرة: هل الصندوق يمتص أم يعطي؟"],
        steps: [
          ["(a),(b): v = +4 V, @quad i = +3 A", "In (a) and (b) the current enters the positive terminal, so both keep their signs.", "في (a) و (b) يدخل التيار من الطرف الموجب، فيبقى الاثنان بإشارتهما."],
          ["(c),(d): v = +4 V, @quad i = -3 A", "In (c) and (d) the current leaves the positive terminal: measured into +, it is −3 A.", "في (c) و (d) يخرج التيار من الطرف الموجب، فإذا قسناه داخلًا من + يكون −3 A."],
          ["(a),(b): p = (+4)(+3) = 12 W", "Positive power: the box absorbs 12 W.", "القدرة موجبة: الصندوق يمتص 12 W."],
          ["(c),(d): p = (+4)(-3) = -12 W", "Negative power: the box delivers 12 W to the rest of the circuit.", "القدرة سالبة: الصندوق يعطي 12 W لبقية الدائرة."]],
        check: [["The size is the same in all four cases, 12 W. Only the direction of energy changes, and the sign tells it.", "المقدار واحد في الحالات الأربع 12 W، والذي يتغير اتجاه الطاقة فقط، والإشارة تخبرنا به."]] }],
      ["real", { beats: [
        ["While charging, current enters a phone battery at its + terminal: the battery absorbs power.", "أثناء الشحن يدخل التيار بطارية الجوال من طرفها الموجب، فهي تمتص القدرة."],
        ["In use, current leaves the + terminal: the battery delivers power. Same element; the sign tells you its state.", "أثناء الاستخدام يخرج التيار من الطرف الموجب، فهي تعطي القدرة. العنصر نفسه، والإشارة تخبرك بحالته."]] }],
      ["quiz", { i: 0, q: "The current reference enters an element's positive terminal. Which power equation?", opts: ["$p = vi$", "$p = -vi$", "$p = v/i$"],
        whys: ["Current entering at + means $p = vi$ under the passive sign convention.", "The minus sign is for current entering at −.", "$v/i$ is resistance, not power."],
        hints: [["Entering at + means moving through a voltage drop.", "الدخول من + يعني المرور عبر هبوط في الجهد."]] }],
      ["quiz", { i: 1, q: "An element's power came out $p = -15$ W. What does it mean?", opts: ["It absorbs 15 W", "It delivers 15 W", "There is a mistake: power can't be negative"],
        whys: ["Absorbing corresponds to positive $p$.", "$p < 0$ means the element delivers power to the rest of the circuit.", "The sign of power carries meaning: positive absorbs, negative delivers."],
        hints: [["Positive power is absorbed. What is the opposite?", "القدرة الموجبة امتصاص. فما عكسها؟"]] }],
      ["quiz", { i: 2, q: "An element has $v = 5$ V and $i = -2$ A, with the current reference entering at +. Its power is…", opts: ["10 W absorbed", "−10 W: it delivers 10 W", "−10 W: it absorbs 10 W"],
        whys: ["You dropped the sign of the current. Substitute $i = -2$ as it is: $p = (5)(-2) = -10$ W.", "$p = vi = (5)(-2) = -10$ W, and negative means delivering.", "The arithmetic is right but the reading is reversed: negative $p$ means delivering."],
        hints: [["The reference enters at +, so $p = vi$. Keep the sign of $i$.", "المرجع يدخل من + فنكتب p = vi، ونحتفظ بإشارة i."]] }],
      ["sum", { math: ["p = vi @quad @text{or} @quad p = -vi"], beats: [
        ["Current reference entering at +: $p = vi$. Entering at −: $p = -vi$.", "إذا دخل مرجع التيار من + فإن p = vi، وإذا دخل من − فإن p = −vi."],
        ["Positive power is absorbed; negative power is delivered.", "القدرة الموجبة ممتصة، والسالبة مُعطاة."],
        ["Choose the references once and keep them everywhere.", "اختر المراجع مرة واحدة والتزم بها في كل مكان."]] }]
    ]
  });

  EX.add("c1-variables-4", {
    chapter: CH,
    goals: [["Define power as the rate of energy: $P = dw/dt$.", "تعرّف القدرة بأنها معدل الطاقة: P = dw/dt."],
      ["Derive $P = VI$ from the definitions of voltage and current.", "تشتق P = VI من تعريفي الجهد والتيار."],
      ["Compute power and energy, and check the power balance of a circuit.", "تحسب القدرة والطاقة وتتحقق من توازن القدرة في الدائرة."]],
    items: [
      ["idea", { math: ["P = @frac{dw}{dt}", "1 W = 1 J/s"], beats: [
        ["Power is the rate at which energy is used or produced: energy per unit time.", "القدرة معدل استهلاك الطاقة أو إنتاجها: طاقة لكل وحدة زمن."],
        ["It is measured in watts, and one watt is one joule every second.", "وتقاس بالواط، والواط الواحد جول كل ثانية."]] }],
      ["law", { label: "Building P = VI", steps: [
        ["P = @frac{dw}{dt}", "Start from the definition. It speaks of energy and time, which are not our circuit variables.", "نبدأ من التعريف. فيه طاقة وزمن، وهما ليسا متغيرَي الدائرة اللذين نقيسهما."],
        ["P = @frac{dw}{@mk{dq}} @cdot @frac{@mk{dq}}{dt}", "Multiply top and bottom by $dq$. This changes nothing, but it splits the ratio into two we already know.", "نضرب البسط والمقام في dq. هذا لا يغيّر شيئًا، لكنه يقسم النسبة إلى نسبتين نعرفهما."],
        ["P = @frac{dw}{dq} @cdot @frac{dq}{dt} = @mk{V} @cdot @mk{I}", "The first ratio is the voltage, the second is the current.", "النسبة الأولى هي الجهد، والثانية هي التيار."],
        ["P = V @cdot I", "So knowing the voltage and the current of an element is enough to know its power.", "إذن معرفة جهد العنصر وتياره تكفي لمعرفة قدرته."]] }],
      ["idea", { label: "Energy and the power balance", math: ["w = P @cdot t", "@Sigma p = 0"], beats: [
        ["Energy is power accumulated over time. For constant power it is simply power times time.", "الطاقة هي القدرة متراكمة عبر الزمن، وللقدرة الثابتة هي القدرة في الزمن."],
        ["On bills, energy is in kilowatt-hours: $1 @text{ kWh} = 3.6 @times 10^6$ J.", "في الفواتير تقاس الطاقة بالكيلوواط ساعة: 1 kWh = 3.6 × 10⁶ J."],
        ["In any circuit, the power delivered equals the power absorbed: all the powers, with their signs, add to zero. If they don't, the solution has an error.", "في أي دائرة القدرة المعطاة تساوي القدرة الممتصة: مجموع القدرات بإشاراتها صفر، وإن لم يكن كذلك ففي الحل خطأ."]] }],
      ["ex", { title: "Example", q: ["An element has 4 V across it and 3 A entering its positive terminal. Find its power and the energy it absorbs in two minutes.", "مثال: عنصر عليه 4 V ويدخله 3 A من طرفه الموجب. أوجد قدرته والطاقة التي يمتصها في دقيقتين."],
        given: ["v = 4 V", "i = 3 A @text{ (enters at +)}", "t = 2 @text{ min} = 120 s"], find: "p, w",
        steps: [
          ["p = vi = 4 @times 3 = 12 W", "The current enters at +, so $p = vi$. Positive: the element absorbs.", "التيار يدخل من + فنكتب p = vi. الناتج موجب: العنصر يمتص."],
          ["w = p @cdot t = 12 @times 120 = 1440 J", "Constant power, so energy is power times time, in seconds to get joules.", "القدرة ثابتة، فالطاقة = القدرة × الزمن بالثواني لنحصل على جول."],
          ["p = 4 @times (-3) = -12 W", "If the current were reversed, leaving at +, the power would be −12 W: the element would deliver 12 W.", "لو انعكس التيار وخرج من + لكانت القدرة −12 W، أي أن العنصر يعطي 12 W."]],
        check: [["1440 J in 120 s is 12 J every second, which is 12 W. The two answers agree.", "1440 J في 120 s تعني 12 J كل ثانية، أي 12 W. الإجابتان متسقتان."]] }],
      ["real", { beats: [
        ["The electricity meter measures energy in kilowatt-hours.", "عداد الكهرباء يقيس الطاقة بالكيلوواط ساعة."],
        ["A 2 kW air conditioner running 10 hours uses 20 kWh. The bill is based on that energy, not on the power.", "مكيف قدرته 2 kW يعمل 10 ساعات يستهلك 20 kWh، والفاتورة تُحسب على هذه الطاقة لا على القدرة."]] }],
      ["quiz", { i: 0, q: "One watt equals…", opts: ["J/s", "J·s", "C/s"],
        whys: ["Power is the rate of energy: joules per second.", "Power is energy divided by time, not multiplied by it.", "C/s is the unit of current, the ampere."],
        hints: [["Power is a rate.", "القدرة معدل."]] }],
      ["quiz", { i: 1, q: "How many joules are in 1 kWh?", opts: ["3600 J", "$3.6 @times 10^6$ J", "1000 J"],
        whys: ["That is 1 Wh only: you forgot the prefix k.", "1000 W × 3600 s = $3.6 @times 10^6$ J.", "You forgot to change hours into seconds."],
        hints: [["k is 1000, and an hour is 3600 s.", "k تعني 1000، والساعة 3600 ثانية."]] }],
      ["quiz", { i: 2, q: "In a circuit, the absorbed powers add up to 50 W. What do you expect for the delivered powers?", opts: ["50 W", "less than 50 W, because of losses", "it can't be known"],
        whys: ["Power balance: delivered equals absorbed, so all powers with their signs add to zero.", "Losses are power absorbed by the resistors, already inside the 50 W.", "Conservation of energy fixes it: all powers add to zero."],
        hints: [["Energy is conserved in every circuit.", "الطاقة محفوظة في كل دائرة."]] }],
      ["sum", { math: ["P = @frac{dw}{dt} = V @cdot I"], beats: [
        ["Power is the rate of energy, in watts: $1 @text{ W} = 1 @text{ J/s}$.", "القدرة معدل الطاقة بالواط: 1 W = 1 J/s."],
        ["Splitting $dw/dt$ through $dq$ gives $P = VI$.", "تقسيم dw/dt عبر dq يعطي P = VI."],
        ["Energy is power times time, and the powers of a whole circuit add to zero.", "الطاقة = القدرة × الزمن، ومجموع قدرات الدائرة كلها صفر."]] }]
    ]
  });
})();
