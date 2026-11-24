/* Circuits 1 · Chapter 2 — scripts of the animated lesson videos (explain.js). English on screen; the Arabic of each
   beat becomes the subtitle track. Content, figures and numbers follow the lessons (c1-elements.js). */
(function () {
  "use strict";
  var CH = "Chapter 2 · Circuit Elements";

  EX.add("c1-elements-1", {
    chapter: CH,
    goals: [["Tell an independent source from a dependent one, and name the four dependent types.", "تميّز المصدر المستقل من المصدر التابع وأنواعه الأربعة."],
      ["Judge whether connecting ideal sources together is valid.", "تحكم على صحة توصيل المصادر المثالية ببعضها."],
      ["Compute a source's power, and know that a source may also absorb power.", "تحسب قدرة المصدر وتعرف أنه قد يمتص القدرة لا أن يعطيها فقط."]],
    items: [
      ["idea", { label: "Active and passive", beats: [
        ["An active element can generate energy: batteries, generators, op-amps. A passive element cannot: the resistor, the inductor, the capacitor.", "العنصر النشط يستطيع توليد الطاقة مثل البطاريات والمولدات ومكبرات العمليات، والعنصر الخامل لا يستطيع مثل المقاومة والملف والمكثف."],
        ["The most important active elements are voltage and current sources, and they come in two kinds: independent and dependent.", "أهم العناصر النشطة مصادر الجهد والتيار، وهي نوعان: مستقلة وتابعة."]] }],
      ["idea", { label: "Independent sources", fig: 0, beats: [
        ["An ideal independent voltage source keeps a specified voltage across its terminals, whatever current flows through it.", "مصدر الجهد المستقل المثالي يحافظ على جهد محدد بين طرفيه مهما كان التيار المار فيه.", { hi: "V1" }],
        ["An ideal independent current source keeps a specified current, whatever voltage appears across it.", "مصدر التيار المستقل المثالي يحافظ على تيار محدد مهما كان الجهد عليه."],
        ["The current through a voltage source, and the voltage across a current source, are decided by the rest of the circuit.", "التيار في مصدر الجهد، والجهد على مصدر التيار، تحددهما بقية الدائرة."]] }],
      ["idea", { label: "Dependent sources", table: [["Type", "Value", "Constant"], ["VCVS", "$v_s = @mu v_x$", "no unit"], ["CCVS", "$v_s = @rho i_x$", "V/A = Ω"], ["VCCS", "$i_s = @alpha v_x$", "A/V = S"], ["CCCS", "$i_s = @beta i_x$", "no unit"]], beats: [
        ["A dependent, or controlled, source sets a voltage or current whose value depends on a voltage or current elsewhere in the circuit. It is drawn as a diamond.", "المصدر التابع (المتحكَّم فيه) يعطي جهدًا أو تيارًا تعتمد قيمته على جهد أو تيار في مكان آخر من الدائرة، ويُرسم على شكل معيّن."],
        ["There are four types: the output is a voltage or a current, and the controlling quantity is a voltage or a current.", "هناك أربعة أنواع: الخرج جهد أو تيار، والكمية المتحكِّمة جهد أو تيار."],
        ["The units of the constant follow from the ratio: $@mu$ and $@beta$ have none, $@rho$ is in ohms, $@alpha$ is in siemens.", "وحدة الثابت تأتي من النسبة: μ و β بلا وحدة، و ρ بالأوم، و α بالسيمنز."]] }],
      ["idea", { label: "Which connections are valid?", fig: 1, beats: [
        ["Two voltage sources in parallel must have the same voltage and the same polarity. Here 10 V and 5 V: the same terminals can't hold both, so it is not permissible.", "مصدرا جهد على التوازي يجب أن يتساويا في الجهد والقطبية. هنا 10 V و 5 V على نفس الطرفين، وهذا مستحيل، فالتوصيل غير مسموح.", { hi: "V1 V2" }],
        ["Two current sources in series must have the same current and direction: one series branch carries one current.", "مصدرا تيار على التوالي يجب أن يتساويا في التيار والاتجاه، لأن الفرع الواحد يحمل تيارًا واحدًا."],
        ["A voltage source with a current source, in series or in parallel, is always valid: each one fixes only its own quantity.", "مصدر جهد مع مصدر تيار، على التوالي أو التوازي، توصيل صحيح دائمًا، لأن كلًا منهما يحدد كميته فقط."]] }],
      ["ex", { title: "Example 2.1", fig: 0, q: ["Are these connections valid? Two 10 V sources in parallel, same polarity; 10 V with 5 V in parallel; 5 A with 5 A in series; 2 A with 5 A in series; 5 A in series with 10 V.", "مثال 2.1: هل هذه التوصيلات صحيحة؟ مصدرا 10 V على التوازي بنفس القطبية، و 10 V مع 5 V على التوازي، و 5 A مع 5 A على التوالي، و 2 A مع 5 A على التوالي، و 5 A مع 10 V على التوالي."],
        steps: [
          ["(a)@quad 10 V @par 10 V @to @text{valid}", "Both sources impose the same 10 V with the same polarity: no conflict.", "المصدران يفرضان الجهد نفسه 10 V بالقطبية نفسها، فلا تعارض."],
          ["(c)@quad 10 V @par 5 V @to @text{not permissible}", "One pair of terminals cannot be at 10 V and 5 V at the same time.", "زوج الأطراف نفسه لا يمكن أن يكون عند 10 V و 5 V في الوقت نفسه."],
          ["(b)@quad 5 A, 5 A @to @text{valid} @quad (d)@quad 2 A, 5 A @to @text{not}", "A series connection has one current, so it can't be 2 A and 5 A together.", "التوصيل على التوالي له تيار واحد، فلا يكون 2 A و 5 A معًا."],
          ["(e)@quad 5 A + 10 V @to @text{valid}", "The current source fixes the current and the voltage source fixes the voltage.", "مصدر التيار يحدد التيار، ومصدر الجهد يحدد الجهد."]] }],
      ["ex", { title: "Example 3 (Assessment)", fig: 2, q: ["A dependent voltage source $i_b/4$ is in parallel with $v_g$ and an 8 A source; $i_b$'s reference is opposite to the 8 A. (a) What $v_g$ makes it valid? (b) What is the 8 A source's power?", "مثال 3: مصدر جهد تابع قيمته i_b/4 على التوازي مع v_g ومصدر 8 A، ومرجع i_b عكس المصدر 8 A. (أ) ما قيمة v_g التي تجعل التوصيل صحيحًا؟ (ب) ما قدرة المصدر 8 A؟"],
        steps: [
          ["i_b = -8 A", "$i_b$'s reference points against the 8 A source, so it reads −8 A.", "مرجع i_b عكس اتجاه المصدر 8 A، فقيمته −8 A."],
          ["v_g = @frac{i_b}{4} = @frac{-8}{4} = -2 V", "Sources in parallel must be equal, so $v_g$ must match the dependent source's value.", "المصادر على التوازي يجب أن تتساوى، فلا بد أن يساوي v_g قيمة المصدر التابع."],
          ["P_{8A} = v_g @times 8 = -2 @times 8 = -16 W", "Negative power: the 8 A source delivers 16 W.", "القدرة سالبة: المصدر 8 A يعطي 16 W."]],
        check: [["A source can also absorb power; here the sign shows the 8 A source delivers.", "المصدر قد يمتص القدرة أيضًا، والإشارة هنا تبيّن أن المصدر 8 A يعطي."]] }],
      ["when", { beats: [
        ["Before solving a circuit with sources wired directly to each other, check the connection is valid.", "قبل حل دائرة فيها مصادر موصولة ببعضها مباشرة، تحقق من صحة التوصيل."],
        ["With a dependent source, find its controlling quantity first, and where it sits in the circuit.", "مع المصدر التابع، حدّد الكمية المتحكِّمة أولًا وأين تقع في الدائرة."]] }],
      ["real", { beats: [
        ["Never connect two batteries of different voltages in parallel, like a new one and a flat one: the difference drives a very large current that heats both.", "لا توصل بطاريتين مختلفتين في الجهد على التوازي، مثل جديدة وفارغة: الفرق يدفع تيارًا كبيرًا جدًا يسخّن الاثنتين."],
        ["The dependent source is the model we use for transistors and op-amps.", "والمصدر التابع هو النموذج الذي نستخدمه للترانزستور ومكبر العمليات."]] }],
      ["quiz", { i: 0, q: "An ideal voltage source keeps…", opts: ["a constant current, whatever the voltage", "a constant voltage across its terminals, whatever the current", "a constant power"],
        whys: ["That is the definition of the ideal current source.", "The current through it is decided by the rest of the circuit.", "Power = voltage × current, and the current depends on the circuit."],
        hints: [["Its name tells you what it fixes.", "اسمه يخبرك بما يثبّته."]] }],
      ["quiz", { i: 1, q: "A current source of value $@beta i_x$ is a…", opts: ["CCCS", "VCCS", "CCVS"],
        whys: ["A current source controlled by a current.", "A VCCS is controlled by a voltage $v_x$, not a current $i_x$.", "A CCVS is a voltage source; this one is a current source."],
        hints: [["Ask two questions: what does it output, and what controls it?", "اسأل سؤالين: ماذا يعطي؟ وما الذي يتحكم فيه؟"]] }],
      ["quiz", { i: 2, q: "Two ideal 3 A current sources in series, in the same direction:", opts: ["a valid connection", "always invalid", "the branch current is 6 A"],
        whys: ["The two currents are equal, so there is no conflict.", "Current sources in series are valid when their currents are equal.", "One branch has one current; series sources do not add their currents."],
        hints: [["A series branch carries one current.", "الفرع على التوالي يحمل تيارًا واحدًا."]] }],
      ["sum", { beats: [
        ["Independent sources fix their own value; dependent sources follow a voltage or current elsewhere.", "المصدر المستقل يثبّت قيمته، والتابع يتبع جهدًا أو تيارًا في مكان آخر."],
        ["Voltage sources in parallel must be equal; current sources in series must be equal.", "مصادر الجهد على التوازي يجب أن تتساوى، ومصادر التيار على التوالي يجب أن تتساوى."],
        ["A source may deliver or absorb power: the sign of $p$ tells which.", "المصدر قد يعطي القدرة أو يمتصها، وإشارة p تخبرك."]] }]
    ]
  });

  EX.add("c1-elements-2", {
    chapter: CH,
    goals: [["Apply Ohm's law with the sign convention.", "تطبّق قانون أوم مع اصطلاح الإشارة."],
      ["Compute conductance and a resistor's power with the different formulas.", "تحسب الموصلية وقدرة المقاومة بالصيغ المختلفة."],
      ["Know that a resistor always absorbs power.", "تعرف أن المقاومة تمتص القدرة دائمًا."]],
    items: [
      ["idea", { fig: 0, beats: [
        ["Resistance is a material's opposition to the flow of charge. The element that models it is the resistor.", "المقاومة قدرة المادة على إعاقة سريان الشحنة، والعنصر الذي يمثّلها هو المقاومة (resistor).", { hi: "R8" }],
        ["We link the resistor's current to its voltage in one of two ways, depending on the reference directions we drew.", "نربط تيار المقاومة بجهدها بإحدى طريقتين حسب اتجاهات المرجع التي رسمناها."]] }],
      ["law", { label: "Ohm's law and the sign", steps: [
        ["v = iR", "Current reference in the direction of the voltage drop, entering at +: the voltage is current times resistance.", "إذا كان مرجع التيار في اتجاه هبوط الجهد، أي يدخل من +، فالجهد = التيار × المقاومة."],
        ["v = -iR", "Current reference in the direction of the voltage rise, entering at −: the same law with a minus sign.", "وإذا كان في اتجاه ارتفاع الجهد، أي يدخل من −، فالقانون نفسه بإشارة سالبة."],
        ["G = @frac{1}{R} @quad (S)", "The reciprocal of resistance is the conductance, in siemens. Then $i = vG$.", "مقلوب المقاومة هو الموصلية وتقاس بالسيمنز، وعندها i = vG."]] }],
      ["law", { label: "A resistor's power, three ways", steps: [
        ["p = vi", "Start from the power of any element, with the passive sign convention.", "نبدأ بقدرة أي عنصر مع اصطلاح الإشارة."],
        ["p = (@mk{iR}) i = i^2 R = @frac{i^2}{G}", "Replace $v$ by $iR$: if you only know the current, use $i^2R$.", "نعوّض v بـ iR: إذا كنت تعرف التيار فقط فاستخدم i²R."],
        ["p = v @cdot @mk{@frac{v}{R}} = @frac{v^2}{R} = v^2 G", "Replace $i$ by $v/R$: if you only know the voltage, use $v^2/R$.", "نعوّض i بـ v/R: إذا كنت تعرف الجهد فقط فاستخدم v²/R."],
        ["p = i^2 R = @frac{v^2}{R} > 0", "Both forms are squares, so a resistor's power is positive whatever the references: a resistor always absorbs.", "الصيغتان فيهما تربيع، فقدرة المقاومة موجبة مهما كانت المراجع: المقاومة تمتص دائمًا."]] }],
      ["ex", { title: "Example 2.3 (a), (b)", fig: "L0", q: ["In each circuit either $v$ or $i$ is unknown. Find it, then the power dissipated in each resistor.", "مثال 2.3: في كل دائرة إما v أو i مجهول. أوجده ثم القدرة المستهلكة في كل مقاومة."],
        steps: [
          ["v_a = (1)(8) = 8 V", "(a) $v_a$ is a drop in the direction of the 1 A current, so $v = iR$.", "(أ) v_a هبوط في اتجاه التيار 1 A، فنستخدم v = iR."],
          ["p = @frac{8^2}{8} = (1)^2(8) = 8 W", "Both power formulas must agree: a free check.", "صيغتا القدرة يجب أن تتفقا، وهذا تحقق مجاني."],
          ["i_b = (50)(0.2) = 10 A", "(b) The resistor is given as a conductance, 0.2 S, and $i_b$ is in the direction of the drop: $i = vG$.", "(ب) المقاومة معطاة كموصلية 0.2 S، و i_b في اتجاه الهبوط، فنستخدم i = vG."],
          ["p = (50)^2(0.2) = 500 W", "Power from the voltage and the conductance: $v^2G$.", "القدرة من الجهد والموصلية: v²G."]] }],
      ["ex", { title: "Example 2.3 (c), (d)", fig: "L1", q: ["Now the references are reversed. Find the unknown and the power in each resistor.", "الآن المراجع معكوسة. أوجد المجهول والقدرة في كل مقاومة."],
        steps: [
          ["v_c = -(1)(20) = -20 V", "(c) $v_c$ is a rise in the direction of the current, so $v = -iR$.", "(ج) v_c ارتفاع في اتجاه التيار، فنستخدم v = −iR."],
          ["p = @frac{(-20)^2}{20} = (1)^2(20) = 20 W", "Squaring removes the minus sign: still positive.", "التربيع يزيل الإشارة السالبة، فالقدرة موجبة."],
          ["i_d = -@frac{50}{25} = -2 A", "(d) $i_d$ is in the direction of the voltage rise, so the minus sign appears again.", "(د) i_d في اتجاه ارتفاع الجهد، فتظهر الإشارة السالبة مرة أخرى."],
          ["p = @frac{50^2}{25} = (-2)^2(25) = 100 W", "Again positive: the resistor absorbs 100 W.", "موجبة مرة أخرى: المقاومة تمتص 100 W."]],
        check: [["The minus signs in (c) and (d) came only from the reference directions.", "الإشارات السالبة في (ج) و (د) جاءت من اتجاهات المرجع فقط."],
          ["The power is positive in every case, because a resistor always absorbs.", "القدرة موجبة في كل الحالات لأن المقاومة تمتص دائمًا."]] }],
      ["when", { beats: [
        ["Look at the current direction against the voltage polarity before writing $v = iR$ or $v = -iR$.", "انظر إلى اتجاه التيار مقابل قطبية الجهد قبل أن تكتب v = iR أو v = −iR."],
        ["Only the current known: $p = i^2R$. Only the voltage known: $p = v^2/R$. Conductance given: $i = vG$ and $p = v^2G$.", "إذا عرفت التيار فقط فاستخدم p = i²R، وإذا عرفت الجهد فقط فاستخدم p = v²/R، وإذا أُعطيت الموصلية فاستخدم i = vG و p = v²G."]] }],
      ["real", { beats: [
        ["An electric water heater is a resistor that turns the power $v^2/R$ into heat.", "سخان الماء الكهربائي مقاومة تحوّل القدرة v²/R إلى حرارة."],
        ["A 24.2 Ω heater on 220 V uses $220^2/24.2 = 2000$ W.", "سخان مقاومته 24.2 Ω على 220 V يستهلك 220²/24.2 = 2000 W."]] }],
      ["quiz", { i: 0, q: "The current reference enters a resistor's negative terminal. Ohm's law becomes…", opts: ["$v = iR$", "$v = -iR$", "$v = i/R$"],
        whys: ["$v = iR$ is for current entering the positive terminal.", "Entering at − reverses the sign.", "Voltage is current times resistance."],
        hints: [["Entering at − means moving through a voltage rise.", "الدخول من − يعني المرور عبر ارتفاع في الجهد."]] }],
      ["quiz", { i: 1, q: "A 250 Ω resistor. Its conductance is…", opts: ["4 mS", "250 S", "0.4 S"],
        whys: ["$G = 1/250 = 0.004$ S = 4 mS.", "Conductance is the reciprocal of resistance.", "1/250 is 0.004, not 0.4."],
        hints: [["$G = 1/R$, in siemens.", "G = 1/R بالسيمنز."]] }],
      ["quiz", { i: 2, q: "You computed a resistor's power and got −12 W. What does it mean?", opts: ["The resistor generates 12 W", "There is a sign error in your solution", "The current is opposite to the arrow"],
        whys: ["A resistor is passive: it never generates power.", "A resistor's power is always positive. Check the sign convention or the current's sign.", "Even with a negative current, $p = i^2R$ stays positive."],
        hints: [["Can a resistor ever give energy back?", "هل يمكن للمقاومة أن تعطي طاقة؟"]] }],
      ["sum", { math: ["v = @pm iR @quad p = i^2R = @frac{v^2}{R}"], beats: [
        ["$v = iR$ when the current enters at +, $v = -iR$ when it enters at −.", "v = iR إذا دخل التيار من +، و v = −iR إذا دخل من −."],
        ["Conductance is $G = 1/R$, in siemens.", "الموصلية G = 1/R بالسيمنز."],
        ["A resistor's power is $i^2R = v^2/R$: always positive, always absorbed.", "قدرة المقاومة i²R = v²/R: موجبة دائمًا وممتصة دائمًا."]] }]
    ]
  });

  EX.add("c1-elements-3", {
    chapter: CH,
    goals: [["Write a KCL equation at any node with correct signs.", "تكتب معادلة KCL عند أي عقدة بإشارات صحيحة."],
      ["Write a KVL equation around any closed path.", "تكتب معادلة KVL حول أي مسار مغلق."],
      ["Combine KCL, KVL and Ohm's law to solve a circuit with more than one loop.", "تجمع KCL و KVL وقانون أوم لحل دائرة فيها أكثر من حلقة."]],
    items: [
      ["idea", { label: "Nodes, branches and loops", fig: 0, beats: [
        ["Before Kirchhoff's laws we need three words. A node is a point where two or more elements meet. This network has 4: A, B, C and the bottom node D.", "قبل قانوني كيرشوف نحتاج ثلاثة مصطلحات. العقدة نقطة يلتقي فيها عنصران أو أكثر، وفي هذه الشبكة أربع عقد: A و B و C والعقدة السفلية D."],
        ["A branch is each element: there are 6 here.", "الفرع هو كل عنصر، وهنا ستة فروع.", { hi: "X1 X2 X3 X4 X5 X6" }],
        ["A loop is a closed path that returns to its start without passing any node twice, like $X_1 X_2 X_3$ or $X_5 X_6$. This network has 6.", "الحلقة مسار مغلق يعود إلى بدايته دون أن يمر بعقدة مرتين، مثل X₁ X₂ X₃ أو X₅ X₆، وفي هذه الشبكة ست حلقات.", { hi: "X5 X6" }]] }],
      ["law", { label: "Kirchhoff's current law", fig: 0, steps: [
        ["@Sigma i = 0 @quad @text{at any node}", "Charge can't pile up at a node, so the algebraic sum of the currents there is zero.", "الشحنة لا تتراكم عند العقدة، فالمجموع الجبري للتيارات عندها صفر."],
        ["@Sigma i_{in} = @Sigma i_{out}", "Said another way: what flows in equals what flows out.", "وبعبارة أخرى: ما يدخل يساوي ما يخرج."],
        ["B: @quad i_2 = i_3 + i_4", "At node B, $i_2$ comes in and splits into $i_3$ and $i_4$.", "عند العقدة B يدخل i₂ ويتفرع إلى i₃ و i₄."]] }],
      ["law", { label: "Kirchhoff's voltage law", fig: 0, steps: [
        ["@Sigma v = 0 @quad @text{around any loop}", "A charge that goes round a loop and returns to its start gains no energy, so the voltages round a closed path add to zero.", "الشحنة التي تدور حول حلقة وتعود لبدايتها لا تكسب طاقة، فمجموع الجهود حول المسار المغلق صفر."],
        ["@Sigma v_{rise} = @Sigma v_{drop}", "Rises equal drops around the loop.", "الارتفاعات تساوي الهبوطات حول الحلقة."],
        ["(X_1 X_2 X_3): @quad v_1 + v_2 = v_3", "Around $X_1X_2X_3$: the two drops on one side equal the one on the other.", "حول X₁X₂X₃: الهبوطان في جهة يساويان الهبوط في الجهة الأخرى."]] }],
      ["when", { beats: [
        ["Count the unknowns first, then write that many independent equations: KCL at nodes, KVL around loops.", "عدّ المجاهيل أولًا ثم اكتب بعددها معادلات مستقلة: KCL عند العقد و KVL حول الحلقات."],
        ["With $n$ nodes, $n - 1$ KCL equations are enough: the last node's equation repeats the others.", "مع n عقدة تكفي n − 1 معادلة KCL، لأن معادلة العقدة الأخيرة تكرار للبقية."],
        ["Avoid a loop through a current source: its voltage is unknown and adds a new unknown.", "تجنّب حلقة تمر بمصدر تيار، لأن جهده مجهول ويضيف مجهولًا جديدًا."]] }],
      ["ex", { title: "Example 2.8", fig: 1, q: ["A 120 V source, 10 Ω carrying $i_0$, 50 Ω carrying $i_1$, and a 6 A source entering node b. Find $i_0$ and $i_1$, then check the power balance.", "مثال 2.8: مصدر 120 V، ومقاومة 10 Ω يمر فيها i₀، ومقاومة 50 Ω يمر فيها i₁، ومصدر 6 A يدخل العقدة b. أوجد i₀ و i₁ ثم تحقق من توازن القدرة."],
        given: ["v_s = 120 V", "6 A @text{ into node b}", "10 @Omega @text{ carries } i_0", "50 @Omega @text{ carries } i_1"], find: "i_0, i_1",
        pick: ["Two unknowns need two equations: KCL at node b, and KVL around the left loop, which avoids the current source.", "مجهولان يحتاجان معادلتين: KCL عند العقدة b، و KVL حول الحلقة اليسرى التي لا تمر بمصدر التيار."],
        steps: [
          ["i_1 - i_0 - 6 = 0", "KCL at node b: $i_1$ leaves, $i_0$ and the 6 A enter.", "KCL عند العقدة b: يخرج i₁ ويدخل i₀ و 6 A."],
          ["-120 + 10 i_0 + 50 i_1 = 0", "KVL around the left path: the source's rise equals the two resistor drops.", "KVL حول المسار الأيسر: ارتفاع المصدر يساوي هبوطي المقاومتين."],
          ["-120 + 10 i_0 + 50(@mk{i_0 + 6}) = 0", "Substitute $i_1 = i_0 + 6$ from KCL, leaving one unknown.", "نعوّض i₁ = i₀ + 6 من KCL فيبقى مجهول واحد."],
          ["60 i_0 = -180 @Rightarrow i_0 = -3 A, @quad i_1 = 3 A", "Solve: $i_0$ is negative, so it flows against its arrow.", "نحل: i₀ سالب، أي أنه يسري عكس سهمه."],
          ["p_{50} = 450 W, @quad p_{10} = 90 W", "Resistor powers from $i^2R$: $(3)^2(50)$ and $(-3)^2(10)$.", "قدرتا المقاومتين من i²R: (3)²(50) و (−3)²(10)."],
          ["p_{120V} = -120 i_0 = 360 W, @quad p_{6A} = -(50 i_1)(6) = -900 W", "The 120 V source absorbs 360 W; the 6 A source delivers 900 W.", "مصدر 120 V يمتص 360 W، ومصدر 6 A يعطي 900 W."]],
        check: [["Absorbed: 360 + 450 + 90 = 900 W. Delivered: 900 W. The balance holds.", "الممتص: 360 + 450 + 90 = 900 W، والمعطى 900 W. التوازن متحقق."]] }],
      ["real", { beats: [
        ["A home distribution board is one big node: the current from the meter equals the sum of the currents leaving through each room's breaker.", "لوحة التوزيع في البيت عقدة كبيرة: التيار القادم من العداد يساوي مجموع التيارات الخارجة من قواطع الغرف."],
        ["That is KCL, and it decides the size of the main breaker.", "هذا هو KCL، وهو الذي يحدد حجم القاطع الرئيسي."]] }],
      ["quiz", { i: 0, q: "Currents of 2 A and 5 A enter a node, and a current $i$ leaves it. What is $i$?", opts: ["7 A", "3 A", "−7 A"],
        whys: ["In = out: $2 + 5 = i$.", "You subtracted instead of adding: both currents enter and $i$ leaves.", "$i$ is defined as leaving and the entering currents are positive, so $i$ is positive."],
        hints: [["What flows in must flow out.", "ما يدخل يجب أن يخرج."]] }],
      ["quiz", { i: 1, q: "KVL rests on the conservation of…", opts: ["energy", "charge", "current"],
        whys: ["A charge that goes round a loop gains or loses no net energy.", "Conservation of charge is the basis of KCL.", "KVL is a law about voltages, built on energy."],
        hints: [["Voltage is energy per charge.", "الجهد طاقة لكل شحنة."]] }],
      ["quiz", { i: 2, q: "Why avoid writing KVL around a loop through a current source?", opts: ["KVL does not apply to it", "Its voltage is unknown and adds a new unknown", "The current in it is zero"],
        whys: ["KVL applies to every loop; the problem is the unknown voltage.", "You may write it, but it adds an unknown instead of helping.", "The current in that branch is the source's value, not zero."],
        hints: [["What does a current source fix, and what does it leave free?", "ماذا يثبّت مصدر التيار؟ وماذا يترك حرًا؟"]] }],
      ["sum", { math: ["@Sigma i = 0 @quad @Sigma v = 0"], beats: [
        ["KCL: at every node, current in equals current out.", "KCL: عند كل عقدة التيار الداخل يساوي الخارج."],
        ["KVL: around every loop, rises equal drops.", "KVL: حول كل حلقة الارتفاعات تساوي الهبوطات."],
        ["Write as many independent equations as unknowns, then check the power balance.", "اكتب معادلات مستقلة بعدد المجاهيل، ثم تحقق من توازن القدرة."]] }]
    ]
  });

  EX.add("c1-elements-4", {
    chapter: CH,
    goals: [["Write a dependent source's constraint equation in terms of its controlling quantity.", "تكتب معادلة القيد للمصدر التابع بدلالة الكمية المتحكِّمة."],
      ["Solve a circuit with a dependent source using KCL and KVL.", "تحل دائرة فيها مصدر تابع باستخدام KCL و KVL."],
      ["Compute the dependent source's power and check the power balance.", "تحسب قدرة المصدر التابع وتتحقق من توازن القدرة."]],
    items: [
      ["idea", { label: "Same tools, one more equation", beats: [
        ["A circuit with a dependent source is solved with the same tools: KVL, KCL and Ohm's law.", "الدائرة التي فيها مصدر تابع تُحل بالأدوات نفسها: KVL و KCL وقانون أوم."],
        ["The only difference: the dependent source adds a constraint equation linking its value to its controlling quantity.", "الفرق الوحيد أن المصدر التابع يضيف معادلة قيد تربط قيمته بالكمية التي تتحكم فيه."]] }],
      ["idea", { label: "The steps", chain: ["1 · Identify the unknowns", "2 · Write the source in terms of its control", "3 · KVL and KCL: as many equations as unknowns", "4 · Ohm's law, then the power balance"], beats: [
        ["First, identify the unknowns.", "أولًا: حدّد المجاهيل."],
        ["Write the dependent source in terms of its controlling quantity. Once that quantity is known, the source is known.", "اكتب المصدر التابع بدلالة الكمية المتحكِّمة. متى عُرفت هذه الكمية عُرف المصدر."],
        ["Write as many KVL and KCL equations as unknowns, solve, then find what is asked with Ohm's law and check the power balance.", "اكتب معادلات KVL و KCL بعدد المجاهيل، وحلّها، ثم أوجد المطلوب بقانون أوم وتحقق من توازن القدرة."]] }],
      ["ex", { title: "Example (Fig. 2.22)", fig: 0, q: ["A 500 V source, 5 Ω carrying $i_@Delta$, 20 Ω with voltage $v_0$, and a dependent current source $5i_@Delta$. Find $v_0$.", "مثال الشكل 2.22: مصدر 500 V، ومقاومة 5 Ω يمر فيها i_Δ، ومقاومة 20 Ω جهدها v₀، ومصدر تيار تابع 5i_Δ. أوجد v₀."],
        pick: ["$v_0$ needs $i_0$. The unknowns are $i_@Delta$ and $i_0$, and the dependent source is already written in terms of $i_@Delta$.", "لإيجاد v₀ نحتاج i₀. المجهولان i_Δ و i₀، والمصدر التابع مكتوب أصلًا بدلالة i_Δ."], given: ["500 V, @quad 5 @Omega, @quad 20 @Omega", "@text{dependent: } 5 i_@Delta"], find: "v_0",
        steps: [
          ["500 = 5 i_@Delta + 20 i_0", "KVL around the left loop.", "KVL حول الحلقة اليسرى."],
          ["i_0 = i_@Delta + 5 i_@Delta = 6 i_@Delta", "KCL at node b: $i_@Delta$ and $5i_@Delta$ enter, $i_0$ leaves. This is where the dependent source enters the solution.", "KCL عند العقدة b: يدخل i_Δ و 5i_Δ ويخرج i₀. هنا يدخل المصدر التابع في الحل."],
          ["500 = 5 i_@Delta + 120 i_@Delta @Rightarrow i_@Delta = 4 A", "Substitute $i_0 = 6i_@Delta$: one equation, one unknown.", "نعوّض i₀ = 6i_Δ: معادلة واحدة ومجهول واحد."],
          ["i_0 = 24 A, @quad v_0 = 20 @times 24 = 480 V", "Then $i_0$, and Ohm's law gives $v_0$.", "ثم i₀، وقانون أوم يعطي v₀."]] }],
      ["ex", { title: "Example 2.10", fig: 1, q: ["A 10 V source with 6 Ω carrying $i_s$ on the left; a dependent source $3i_s$ with 2 Ω and 3 Ω on the right. Find $v_0$, and show that delivered power equals dissipated power.", "مثال 2.10: مصدر 10 V مع مقاومة 6 Ω يمر فيها i_s في اليسار، ومصدر تابع 3i_s مع 2 Ω و 3 Ω في اليمين. أوجد v₀ وبيّن أن القدرة المعطاة تساوي المستهلكة."],
        steps: [
          ["10 = 6 i_s @Rightarrow i_s = 1.67 A", "KVL around the left loop gives the controlling current at once.", "KVL حول الحلقة اليسرى يعطي التيار المتحكِّم مباشرة."],
          ["3 i_s = 2 i_0 + 3 i_0 @Rightarrow i_0 = 1 A", "KVL on the right: the dependent source's voltage, $3i_s = 5$ V, drives 2 Ω and 3 Ω in series.", "KVL في اليمين: جهد المصدر التابع 3i_s = 5 V يدفع التيار في 2 Ω و 3 Ω على التوالي."],
          ["v_0 = 3 i_0 = 3 V", "Ohm's law on the 3 Ω resistor.", "قانون أوم على المقاومة 3 Ω."],
          ["p_{10V} = (10)(-1.67) = -16.7 W, @quad p_{dep} = (5)(-1) = -5 W", "Both sources deliver: 21.7 W together.", "المصدران يعطيان القدرة: 21.7 W معًا."],
          ["(1.67)^2(6) + (1)^2(2) + (1)^2(3) = 21.7 W", "The resistors absorb 16.7 + 2 + 3 = 21.7 W.", "المقاومات تمتص 16.7 + 2 + 3 = 21.7 W."]],
        check: [["Delivered 21.7 W, dissipated 21.7 W: the balance holds, so the solution is consistent.", "المعطى 21.7 W والمستهلك 21.7 W: التوازن متحقق، فالحل متسق."]] }],
      ["when", { beats: [
        ["Write the controlling quantity in terms of the unknowns you chose; don't treat it as a new unknown without an equation.", "اكتب الكمية المتحكِّمة بدلالة المجاهيل التي اخترتها، ولا تعاملها كمجهول جديد بلا معادلة."],
        ["A dependent source may deliver or absorb power: use the same sign convention for its power.", "المصدر التابع قد يعطي القدرة أو يمتصها، فاحسب قدرته بنفس اصطلاح الإشارة."]] }],
      ["real", { beats: [
        ["In amplifiers we model the transistor with a dependent current source $@beta i_B$.", "في المكبرات نمثّل الترانزستور بمصدر تيار تابع βi_B."],
        ["A small base current controls a much larger collector current: lecture Example 2.11.", "تيار قاعدة صغير يتحكم في تيار مجمّع أكبر بكثير، وهذا مثال المحاضرة 2.11."]] }],
      ["quiz", { i: 0, q: "In Fig. 2.22, why is $i_0 = 6i_@Delta$?", opts: ["KCL at node b: $i_@Delta$ and $5i_@Delta$ enter, $i_0$ leaves", "KVL around the left loop", "Because 20 Ω is four times 5 Ω"],
        whys: ["In = out: $i_0 = i_@Delta + 5i_@Delta$.", "KVL gives $500 = 5i_@Delta + 20i_0$; the link between the currents comes from KCL.", "The ratio here does not come from the resistors but from the dependent source and KCL."],
        hints: [["Which law relates currents at a node?", "أي قانون يربط التيارات عند عقدة؟"]] }],
      ["quiz", { i: 1, q: "A dependent source's constraint equation expresses…", opts: ["the source's value in terms of its controlling quantity", "a fixed value that never changes", "KCL at the source's node"],
        whys: ["Like $i = 5i_@Delta$ or $v = 3i_s$.", "That describes an independent source.", "KCL is a separate equation; the constraint links the source to its control."],
        hints: [["It is what makes a dependent source dependent.", "هو ما يجعل المصدر تابعًا."]] }],
      ["quiz", { i: 2, q: "A dependent voltage source has value $3i_s$. The unit of the constant 3 is…", opts: ["V/A (ohm)", "no unit", "A/V"],
        whys: ["Voltage ÷ current = V/A: the constant $@rho$ of a current-controlled voltage source.", "The constant has no unit only when both quantities are of the same kind ($@mu$, $@beta$).", "A/V is the unit of $@alpha$, for a voltage-controlled current source."],
        hints: [["The constant turns a current into a voltage.", "الثابت يحوّل تيارًا إلى جهد."]] }],
      ["quiz", { i: 3, q: "In Example 2.10 the dependent source's power is −5 W. What does it mean?", opts: ["It delivers 5 W to the circuit", "It absorbs 5 W", "A dependent source can't deliver power"],
        whys: ["Negative power means the element delivers.", "With the passive sign convention positive is absorbed, negative is delivered.", "A dependent source is active and may deliver power, as here."],
        hints: [["Read the sign as for any element.", "اقرأ الإشارة كما تقرؤها لأي عنصر."]] }],
      ["sum", { beats: [
        ["Same tools as always: KVL, KCL, Ohm's law.", "الأدوات نفسها: KVL و KCL وقانون أوم."],
        ["Plus one constraint: the dependent source written in terms of its controlling quantity.", "وزيادة قيد واحد: المصدر التابع مكتوبًا بدلالة الكمية المتحكِّمة."],
        ["Check the power balance, counting the dependent source too.", "تحقق من توازن القدرة مع حساب المصدر التابع أيضًا."]] }]
    ]
  });
})();
