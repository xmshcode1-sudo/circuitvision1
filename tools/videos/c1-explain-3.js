/* Circuits 1 · Chapter 3 — scripts of the animated lesson videos (explain.js). English on screen; the Arabic of each
   beat becomes the subtitle track. Numbers, figures and questions are the lesson's own (c1-resistive.js). */
(function () {
  "use strict";
  var CH = "Chapter 3 · Simple Resistive Circuits";

  EX.add("c1-resistive-1", {
    chapter: CH,
    goals: [["Recognize resistors connected in series in any drawing.", "تتعرف على المقاومات الموصلة على التوالي في أي رسم."],
      ["Compute the equivalent resistance of resistors in series.", "تحسب المقاومة المكافئة لمقاومات على التوالي."],
      ["Know that the current is the same in all series elements.", "تعرف أن التيار واحد في كل عناصر التوالي."]],
    items: [
      ["idea", { label: "What series means", beats: [
        ["In this chapter we use Ohm's law and Kirchhoff's laws to simplify a circuit into an easier equivalent one.", "في هذا الفصل نستخدم قانون أوم وقانوني كيرشوف لتبسيط الدائرة إلى دائرة مكافئة أسهل."],
        ["Two elements are in series when they meet at a single node that nothing else connects to.", "يكون العنصران على التوالي عندما يلتقيان عند عقدة واحدة لا يتصل بها شيء آخر."],
        ["Then all the charge leaving one must enter the other: series elements carry the same current.", "عندها كل الشحنة التي تخرج من أحدهما تدخل الآخر، فعناصر التوالي يمر فيها التيار نفسه."]] }],
      ["law", { label: "Building the series law", steps: [
        ["-v_s + i_s R_1 + i_s R_2 + @ldots + i_s R_7 = 0", "The lecture circuit: a source and seven resistors in one loop, all carrying $i_s$. Apply KVL around the loop, using Ohm's law for each drop.", "دائرة المحاضرة: مصدر وسبع مقاومات في حلقة واحدة يمر فيها التيار iₛ. نطبّق KVL حول الحلقة مع قانون أوم لكل هبوط."],
        ["v_s = i_s(@mk{R_1 + R_2 + @ldots + R_7})", "Take the common current $i_s$ out as a factor. This is possible only because the current is the same in every resistor.", "نخرج التيار المشترك iₛ عاملًا مشتركًا، وهذا ممكن فقط لأن التيار واحد في كل المقاومات."],
        ["v_s = i_s R_{eq}", "The bracket behaves like one resistor: the source can't tell the difference.", "القوس يتصرف كمقاومة واحدة، والمصدر لا يرى فرقًا."],
        ["R_{eq} = R_1 + R_2 + @ldots + R_k", "So resistors in series add. We replace them by one resistor without changing the source current.", "إذن المقاومات على التوالي تُجمع، ونستبدلها بمقاومة واحدة دون أن يتغير تيار المصدر."]] }],
      ["mistake", { beats: [
        ["The shape of the drawing does not decide series. Two resistors on one line are not in series if a third element joins the node between them.", "شكل الرسم لا يحدد التوالي. مقاومتان على خط واحد ليستا على التوالي إذا اتصل عنصر ثالث بالعقدة بينهما."],
        ["That third branch takes part of the current, so the two currents may differ.", "الفرع الثالث يأخذ جزءًا من التيار، فقد يختلف تيارا المقاومتين."]] }],
      ["ex", { title: "Example", q: ["The lecture circuit with numbers: $v_s = 140$ V and $R_1$ to $R_7$ are 2, 3, 5, 10, 4, 6 and 5 Ω. Find $R_{eq}$, the current $i_s$, and the voltage of $R_4$.", "مثال: دائرة المحاضرة بالأرقام: vₛ = 140 V والمقاومات من R₁ إلى R₇ هي 2 و 3 و 5 و 10 و 4 و 6 و 5 Ω. أوجد R_eq والتيار iₛ وجهد R₄."],
        given: ["v_s = 140 V", "R_1 @ldots R_7 = 2, 3, 5, 10, 4, 6, 5 @Omega"], find: "R_{eq}, @quad i_s, @quad v_4",
        steps: [
          ["R_{eq} = 2 + 3 + 5 + 10 + 4 + 6 + 5 = 35 @Omega", "All seven are in series, so add them.", "المقاومات السبع على التوالي، فنجمعها."],
          ["i_s = @frac{v_s}{R_{eq}} = @frac{140}{35} = 4 A", "Ohm's law on the equivalent gives the source current, the same in every resistor.", "قانون أوم على المكافئة يعطي تيار المصدر، وهو نفسه في كل مقاومة."],
          ["v_4 = i_s R_4 = 4 @times 10 = 40 V", "Back in the original circuit: Ohm's law on $R_4$ alone.", "نعود للدائرة الأصلية: قانون أوم على R₄ وحدها."]],
        check: [["The seven voltages add up to $4 @times 35 = 140$ V, which is $v_s$: KVL holds.", "مجموع الجهود السبعة 4 × 35 = 140 V وهو vₛ، فـ KVL متحقق."],
          ["$R_4$ is the largest resistor, so it takes the largest voltage.", "R₄ أكبر مقاومة، فتأخذ أكبر جهد."]] }],
      ["real", { beats: [
        ["Old string lights were wired in series.", "زينة الإضاءة القديمة كانت موصولة على التوالي."],
        ["If one lamp burned out, the whole string went dark: every lamp carries the same current, and an open lamp stops it.", "إذا احترق مصباح واحد انطفأ الخيط كله، لأن كل المصابيح يمر فيها التيار نفسه، والمصباح المفتوح يقطعه."]] }],
      ["quiz", { i: 0, q: "4 Ω and 6 Ω in series. The equivalent resistance is…", opts: ["10 Ω", "2.4 Ω", "24 Ω"],
        whys: ["Series: add the resistances.", "That is the parallel formula, $(4 @times 6)/(4 + 6)$.", "You multiplied them; in series we add."],
        hints: [["Series resistances add.", "مقاومات التوالي تُجمع."]] }],
      ["quiz", { i: 1, q: "In resistors connected in series, which quantity is the same in every resistor?", opts: ["the voltage", "the current", "the power"],
        whys: ["The voltage splits according to each resistance; equal voltage is the mark of parallel.", "The definition of series: the same current flows through every element.", "Power $p = i^2R$ differs with $R$."],
        hints: [["There is only one path for the charge.", "للشحنة مسار واحد فقط."]] }],
      ["quiz", { i: 2, q: "Two resistors drawn on one line, but a third branch joins the node between them. Are they in series?", opts: ["Yes, they are on one line", "No: their currents may differ"],
        whys: ["The drawing doesn't decide series; the third branch takes part of the current.", "The third branch makes the first current = the second current + the branch current."],
        hints: [["Check the node between them, not the shape of the drawing.", "افحص العقدة بينهما، لا شكل الرسم."]] }],
      ["sum", { math: ["R_{eq} = R_1 + R_2 + @ldots + R_k"], beats: [
        ["Series: one node shared by two elements and nothing else.", "التوالي: عقدة يشترك فيها عنصران فقط ولا شيء آخر."],
        ["Series elements carry the same current, and series resistances add.", "عناصر التوالي يمر فيها التيار نفسه، ومقاوماتها تُجمع."],
        ["Find the current from the equivalent, then go back for each voltage.", "أوجد التيار من المكافئة، ثم ارجع لحساب جهد كل مقاومة."]] }]
    ]
  });

  EX.add("c1-resistive-2", {
    chapter: CH,
    goals: [["Recognize resistors connected in parallel.", "تتعرف على المقاومات الموصلة على التوازي."],
      ["Compute the parallel equivalent resistance, and the special case of two resistors.", "تحسب المقاومة المكافئة للتوازي والحالة الخاصة لمقاومتين."],
      ["Reduce a network with both series and parallel parts.", "تختزل شبكة فيها أجزاء على التوالي وأخرى على التوازي."]],
    items: [
      ["idea", { label: "What parallel means", beats: [
        ["Two elements are in parallel when they connect to the same pair of nodes.", "يكون العنصران على التوازي عندما يتصلان بزوج العقد نفسه."],
        ["Between the same two nodes there is one voltage, so parallel elements have the same voltage.", "بين العقدتين نفسيهما يوجد جهد واحد، فالعناصر المتوازية لها الجهد نفسه."],
        ["The test is: are they between the same two nodes? Not: are they drawn side by side.", "الاختبار: هل هما بين العقدتين نفسيهما؟ وليس: هل رُسمتا متجاورتين."]] }],
      ["law", { label: "Building the parallel law", steps: [
        ["i_s = i_1 + i_2 + i_3 + i_4", "The lecture circuit: a source with four resistors in parallel between nodes a and b. KCL at node a.", "دائرة المحاضرة: مصدر مع أربع مقاومات على التوازي بين العقدتين a و b. نطبّق KCL عند العقدة a."],
        ["i_k = @frac{v_s}{R_k}", "Each resistor has the same voltage $v_s$, so Ohm's law gives each branch current.", "كل مقاومة عليها الجهد نفسه vₛ، فقانون أوم يعطي تيار كل فرع."],
        ["i_s = v_s @left(@frac{1}{R_1} + @frac{1}{R_2} + @frac{1}{R_3} + @frac{1}{R_4}@right)", "Substitute and take $v_s$ out as a common factor.", "نعوّض ونخرج vₛ عاملًا مشتركًا."],
        ["@frac{1}{R_{eq}} = @frac{1}{R_1} + @frac{1}{R_2} + @ldots + @frac{1}{R_k}", "The bracket is $i_s/v_s = 1/R_{eq}$. In parallel, reciprocals add; equivalently, conductances add: $G_{eq} = @Sigma G_i$.", "القوس هو iₛ/vₛ = 1/R_eq. على التوازي تُجمع المقلوبات، أي تُجمع الموصليات: G_eq = ΣG."],
        ["R_{eq} = @frac{R_1 R_2}{R_1 + R_2}", "Very often there are only two: then product over sum. The result is always smaller than the smallest resistor.", "كثيرًا ما تكون مقاومتين فقط: حاصل الضرب على المجموع. والناتج دائمًا أصغر من أصغر مقاومة."]] }],
      ["when", { beats: [
        ["In a series-parallel circuit, reduce from the end far from the source toward the source.", "في دائرة توالي وتوازي، اختزل من الطرف البعيد عن المصدر باتجاه المصدر."],
        ["Then go back the other way to share out the currents and voltages.", "ثم ارجع في الاتجاه المعاكس لتوزيع التيارات والجهود."]] }],
      ["ex", { title: "Example 3.1", fig: 0, q: ["Find $i_s$, $i_1$ and $i_2$ in the circuit.", "مثال 3.1: أوجد iₛ و i₁ و i₂ في الدائرة."],
        steps: [
          ["3 + 6 = 9 @Omega", "Start far from the source: 3 Ω and 6 Ω share one current, so they are in series.", "نبدأ من الطرف البعيد: 3 Ω و 6 Ω يمر فيهما التيار نفسه، فهما على التوالي."],
          ["18 @par 9 = @frac{18 @times 9}{18 + 9} = 6 @Omega", "That 9 Ω sits between the same two nodes as 18 Ω: parallel, product over sum.", "الـ 9 Ω بين العقدتين نفسيهما مع 18 Ω، فهما على التوازي: الضرب على المجموع."],
          ["R_{eq} = 4 + 6 = 10 @Omega @Rightarrow i_s = @frac{120}{10} = 12 A", "That 6 Ω is in series with 4 Ω. Now Ohm's law on the whole circuit.", "الـ 6 Ω على التوالي مع 4 Ω، ثم قانون أوم على الدائرة كلها."],
          ["v_1 = (12)(6) = 72 V", "Go back: the 12 A flows through the 6 Ω equivalent, so the parallel pair has 72 V.", "نرجع: الـ 12 A يمر في المكافئة 6 Ω، فجهد المجموعة المتوازية 72 V."],
          ["i_1 = @frac{72}{18} = 4 A, @quad i_2 = @frac{72}{9} = 8 A", "Both branches have 72 V: Ohm's law in each.", "الفرعان عليهما 72 V: قانون أوم في كل فرع."]],
        check: [["$4 + 8 = 12$ A: the branch currents add to $i_s$, as KCL demands.", "4 + 8 = 12 A: تيارا الفرعين مجموعهما iₛ كما يتطلب KCL."],
          ["The smaller branch, 9 Ω, carries the larger current.", "الفرع الأصغر 9 Ω يحمل التيار الأكبر."]] }],
      ["real", { beats: [
        ["All the appliances in a home are in parallel with the supply line: each gets the same 220 V.", "كل أجهزة البيت على التوازي مع خط الإمداد، فكل جهاز يأخذ الجهد نفسه 220 V."],
        ["Every extra appliance switched on lowers the equivalent resistance and raises the total current through the meter.", "وكل جهاز إضافي يُشغَّل يقلل المقاومة المكافئة ويزيد التيار الكلي في العداد."]] }],
      ["quiz", { i: 0, q: "30 Ω and 60 Ω in parallel:", opts: ["20 Ω", "90 Ω", "0.05 Ω"],
        whys: ["$(30 @times 60)/(30 + 60) = 1800/90 = 20$ Ω.", "That is the series formula.", "That is $1/R_{eq}$: flip the result."],
        hints: [["Two resistors: product over sum.", "لمقاومتين: الضرب على المجموع."]] }],
      ["quiz", { i: 1, q: "Five equal 100 Ω resistors in parallel:", opts: ["500 Ω", "20 Ω", "100 Ω"],
        whys: ["That is for series. In parallel: $R/n$.", "$100/5 = 20$ Ω.", "Adding resistors in parallel lowers the equivalent."],
        hints: [["Equal resistors in parallel: divide by how many there are.", "مقاومات متساوية على التوازي: اقسم على عددها."]] }],
      ["quiz", { i: 2, q: "You add one more resistor in parallel with a group. The equivalent resistance…", opts: ["increases", "decreases", "does not change"],
        whys: ["A new branch is an extra path for the current, so the resistance falls.", "Conductances add, so the conductance rises and the resistance falls.", "Only if the new resistor were infinite (an open circuit)."],
        hints: [["Think of conductances.", "فكّر في الموصليات."]] }],
      ["sum", { math: ["@frac{1}{R_{eq}} = @Sigma @frac{1}{R_i} @quad R_1 @par R_2 = @frac{R_1R_2}{R_1 + R_2}"], beats: [
        ["Parallel: the same two nodes, the same voltage.", "التوازي: العقدتان نفسهما والجهد نفسه."],
        ["Reciprocals add; for two resistors, product over sum.", "المقلوبات تُجمع، ولمقاومتين: الضرب على المجموع."],
        ["Reduce from the far end, then go back to share out currents and voltages.", "اختزل من الطرف البعيد، ثم ارجع لتوزيع التيارات والجهود."]] }]
    ]
  });

  EX.add("c1-resistive-3", {
    chapter: CH,
    goals: [["Compute the output voltage of a voltage divider, without and with a load.", "تحسب جهد الخرج لمقسّم الجهد بدون حمل ومع حمل."],
      ["Compute a branch current in a current divider.", "تحسب تيار فرع في مقسّم التيار."],
      ["Understand why a load changes the output voltage.", "تفهم لماذا يغيّر الحمل جهد الخرج."]],
    items: [
      ["idea", { fig: 0, beats: [
        ["Electronic circuits often need more than one voltage level, but there is only one supply. How do we get a smaller voltage from it?", "الدوائر الإلكترونية تحتاج غالبًا أكثر من مستوى جهد، والمصدر واحد. كيف نحصل منه على جهد أصغر؟"],
        ["Put two resistors in series with the source. There is one closed path, so the same current $i$ flows through $R_1$ and then $R_2$.", "نصل مقاومتين على التوالي مع المصدر. هناك مسار مغلق واحد، فيمر التيار نفسه i في R₁ ثم في R₂.", { hi: "R1 R2" }],
        ["Each resistor takes part of the source voltage: the voltage drops across $R_1$, then across $R_2$. Together the two drops add up to $v_s$.", "كل مقاومة تأخذ جزءًا من جهد المصدر: ينخفض الجهد عبر R₁ ثم عبر R₂، ومجموع الهبوطين يساوي vₛ.", { hi: "V100" }],
        ["We take the output $v_o$ across $R_2$. That is a voltage divider: series resistors that split the source voltage.", "نأخذ الخرج vₒ من طرفي R₂. هذا هو مقسّم الجهد: مقاومات على التوالي تقسم جهد المصدر.", { hi: "R2" }]] }],
      ["law", { label: "Building the law", steps: [
        ["R_{total} = @c1{R_1} + @c2{R_2}", "Step 1. In series, resistances add: the source sees one resistance, $R_1 + R_2$.", "الخطوة 1: على التوالي تُجمع المقاومات، فالمصدر يرى مقاومة واحدة تساوي R₁ + R₂."],
        ["i = @frac{v_s}{@c1{R_1} + @c2{R_2}}", "Ohm's law on the whole loop: current = voltage ÷ resistance. We use it because we know $v_s$ and the total resistance.", "قانون أوم على الدائرة كلها: التيار = الجهد ÷ المقاومة. نستخدمه لأننا نعرف vₛ والمقاومة الكلية."],
        ["@c2{v_2} = @mk{i} @cdot @c2{R_2}", "Step 2. We want the voltage of $R_2$ only, so apply Ohm's law to $R_2$ alone. But $i$ is still unknown here.", "الخطوة 2: نريد جهد R₂ فقط، فنطبّق قانون أوم على R₂ وحدها. لكن i ما زال مجهولًا هنا."],
        ["@c2{v_2} = @mk{@frac{v_s}{@c1{R_1} + @c2{R_2}}} @cdot @c2{R_2}", "Substitute $i$ from step 1. Substitution removes the unknown and leaves only values we know.", "نعوّض i من الخطوة 1. التعويض يحذف المجهول ويترك قيمًا نعرفها فقط."],
        ["v_o = @c2{v_2} = v_s @cdot @frac{@c2{R_2}}{@c1{R_1} + @c2{R_2}}", "Rearrange: this is the voltage-divider law. The fraction is $R_2$'s share of the source voltage, always less than 1.", "نرتّب الحدود: هذا هو قانون مقسّم الجهد. الكسر هو نصيب R₂ من جهد المصدر، وهو أصغر من 1 دائمًا."]] }],
      ["mistake", { beats: [
        ["Put the resistor whose voltage you want in the numerator. $R_1$ on top gives $v_1$, not $v_o$.", "ضع في البسط المقاومة التي تريد جهدها. وضع R₁ في البسط يعطي v₁ وليس vₒ."],
        ["The denominator is the sum of both resistors, never one of them alone.", "المقام هو مجموع المقاومتين، وليس إحداهما وحدها."]] }],
      ["when", { beats: [
        ["Use it when the resistors are in series and no current is drawn from the output.", "استخدمه عندما تكون المقاومات على التوالي ولا يُسحب تيار من نقطة الخرج."],
        ["If a load is connected at the output, merge it into $R_2$ first (they are in parallel), then apply the law.", "إذا وُصل حمل على الخرج، اضمّه إلى R₂ أولًا لأنهما على التوازي، ثم طبّق القانون."]] }],
      ["ex", { title: "Example 3.2", fig: 0, q: ["Find the output voltage $v_o$ of this voltage divider.", "مثال 3.2: أوجد جهد الخرج vₒ لمقسّم الجهد هذا."],
        given: ["v_s = 100 V", "@c1{R_1} = 25 k@Omega = 25000 @Omega", "@c2{R_2} = 100 k@Omega = 100000 @Omega"], find: "v_o = ?",
        gwhy: ["Read each value off the circuit with its unit. k means × 1000, so both resistances go into ohms.", "نقرأ كل قيمة من الدائرة مع وحدتها. k تعني × 1000، فنحوّل المقاومتين إلى الأوم."],
        pick: ["The resistors are in series and nothing is connected at the output, so the divider law applies directly.", "المقاومتان على التوالي ولا شيء موصول على الخرج، فقانون المقسّم ينطبق مباشرة."],
        steps: [
          ["v_o = v_s @cdot @frac{@c2{R_2}}{@c1{R_1} + @c2{R_2}}", "Start from the law, written in symbols.", "نبدأ بالقانون مكتوبًا بالرموز."],
          ["v_o = @mk{100} @cdot @frac{@mk{100000}}{@mk{25000} + @mk{100000}}", "Substitute every symbol with its value from the given list.", "نعوّض كل رمز بقيمته من المعطيات."],
          ["v_o = 100 @cdot @frac{100000}{@mk{125000}}", "Add the denominator first: 25000 + 100000 = 125000.", "نجمع المقام أولًا: 25000 + 100000 = 125000."],
          ["v_o = 100 @cdot @mk{0.8}", "Simplify the fraction: 100000 ÷ 125000 = 0.8. Ohms cancel ohms, so the fraction has no unit.", "نختصر الكسر: 100000 ÷ 125000 = 0.8. الأوم يُلغى مع الأوم، فالكسر بلا وحدة."],
          ["v_o = 80 V", "Multiply: $v_o = 80$ V. The unit is the volt, from $v_s$.", "نضرب: vₒ = 80 V، ووحدته الفولت من vₛ."]],
        check: [["80 V is less than 100 V: the output is a part of the source voltage, never more.", "80 V أصغر من 100 V: الخرج جزء من جهد المصدر ولا يزيد عليه."],
          ["$R_2$ is four times $R_1$, so its share is four times bigger: 80 V against 20 V.", "R₂ أكبر من R₁ بأربعة أضعاف، فنصيبها أكبر بأربعة أضعاف: 80 V مقابل 20 V."],
          ["$v_1 + v_o = 20 + 80 = 100$ V, which is $v_s$. The answer is consistent.", "v₁ + vₒ = 20 + 80 = 100 V وهو vₛ، فالإجابة متسقة."]] }],
      ["idea", { label: "The loaded divider", fig: 2, beats: [
        ["Now connect a load $R_L$ across the output. It sits in parallel with $R_2$.", "الآن نوصل حملًا R_L على الخرج. يصبح على التوازي مع R₂.", { hi: "RL R2" }],
        ["Two resistors in parallel act like one smaller resistor, $R_{eq}$. The bottom of the divider gets smaller, so its share of the voltage falls.", "مقاومتان على التوازي تعملان كمقاومة واحدة أصغر R_eq. الجزء السفلي من المقسّم يصغر، فيقل نصيبه من الجهد.", { hi: "RL R2" }],
        ["The smaller $R_L$ is, the lower $v_o$ goes. A very large $R_L$ draws almost no current, and we are back to the plain divider.", "كلما صغرت R_L انخفض vₒ أكثر. وإذا كانت R_L كبيرة جدًا لا تسحب تيارًا تقريبًا، فنرجع للمقسّم العادي.", { hi: "RL" }]] }],
      ["law", { label: "The loaded divider", fig: 2, steps: [
        ["R_{eq} = @frac{@c2{R_2} R_L}{@c2{R_2} + R_L}", "Replace $R_2$ and $R_L$ by their parallel equivalent.", "نستبدل R₂ و R_L بمكافئهما على التوازي."],
        ["v_o = v_s @cdot @frac{R_{eq}}{@c1{R_1} + R_{eq}}", "Then the divider law, with $R_{eq}$ in the place of $R_2$.", "ثم قانون المقسّم مع وضع R_eq مكان R₂."]] }],
      ["ex", { title: "Problem 3.13", fig: 2, q: ["With no load, $v_o$ is 4 V. Connecting $R_L$ across a and b drops it to 3 V. Find $R_L$.", "مسألة 3.13: بدون حمل vₒ = 4 V، وعند توصيل R_L بين a و b ينخفض إلى 3 V. أوجد R_L."],
        given: ["v_s = 20 V", "@c1{R_1} = 40 @Omega", "v_o = 4 V @text{ (no load)}", "v_o = 3 V @text{ (loaded)}"], find: "R_L = ?",
        steps: [
          ["4 = 20 @cdot @frac{@c2{R_2}}{40 + @c2{R_2}}", "No load first: the plain divider law has only one unknown, $R_2$.", "نبدأ بدون حمل: قانون المقسّم العادي فيه مجهول واحد هو R₂."],
          ["4(40 + @c2{R_2}) = 20@c2{R_2} @Rightarrow @c2{R_2} = 10 @Omega", "Multiply both sides by the denominator, then collect $R_2$: $160 = 16R_2$.", "نضرب الطرفين في المقام ثم نجمع حدود R₂: 160 = 16 R₂."],
          ["3 = 20 @cdot @frac{R_{eq}}{40 + R_{eq}} @Rightarrow R_{eq} = @frac{120}{17} @approx 7.06 @Omega", "With the load, the same law holds with $R_{eq}$ at the bottom. Solve it the same way.", "مع الحمل ينطبق القانون نفسه مع R_eq في الأسفل، ونحله بالطريقة نفسها."],
          ["@frac{1}{R_L} = @frac{17}{120} - @frac{1}{10} @Rightarrow R_L = 24 @Omega", "In parallel, conductances add: $1/R_{eq} = 1/R_2 + 1/R_L$. Subtract $1/R_2$ to isolate $R_L$.", "على التوازي تُجمع المواصلات: 1/R_eq = 1/R₂ + 1/R_L. نطرح 1/R₂ لنعزل R_L."]],
        check: [["$R_{eq} = 7.06\\ \\Omega$ is smaller than $R_2 = 10\\ \\Omega$, as a parallel combination must be.", "R_eq = 7.06 Ω أصغر من R₂ = 10 Ω، وهذا ما يجب أن يكون في التوازي."],
          ["The load lowered $v_o$ from 4 V to 3 V: exactly what a voltmeter shows when you connect a load in the lab.", "الحمل خفّض vₒ من 4 V إلى 3 V، وهذا بالضبط ما يقرؤه الفولتميتر عند توصيل حمل في المختبر."]] }],
      ["idea", { label: "The current divider", math: ["v = i_1 @c1{R_1} = i_2 @c2{R_2}", "i_1 = i_s @cdot @frac{@c2{R_2}}{@c1{R_1} + @c2{R_2}}"], beats: [
        ["Now the dual circuit: two resistors in parallel, fed by a current source $i_s$. Parallel parts share one voltage.", "الآن الدائرة المقابلة: مقاومتان على التوازي يغذيهما مصدر تيار iₛ. العناصر المتوازية تشترك في جهد واحد."],
        ["Since $v = i_1R_1 = i_2R_2$, each branch current is inversely proportional to its resistance.", "ولأن v = i₁R₁ = i₂R₂، يتناسب تيار كل فرع عكسيًا مع مقاومته."],
        ["Careful: in current division the numerator holds the other resistor. The smaller resistor takes the larger current.", "انتبه: في قسمة التيار يكون في البسط المقاومة الأخرى. المقاومة الأصغر تأخذ التيار الأكبر."]] }],
      ["ex", { title: "Example 3.3", fig: 1, q: ["Find the power dissipated in the 6 Ω resistor.", "مثال 3.3: أوجد القدرة المستهلكة في المقاومة 6 Ω."],
        steps: [
          ["@frac{4 @cdot 6}{4 + 6} + 1.6 = 2.4 + 1.6 = 4 @Omega", "Simplify first: 4 Ω ∥ 6 Ω is 2.4 Ω, in series with 1.6 Ω gives 4 Ω.", "نبسّط أولًا: 4 Ω ∥ 6 Ω = 2.4 Ω، وعلى التوالي مع 1.6 Ω تصبح 4 Ω."],
          ["i_o = @frac{16}{16 + 4} @cdot 10 = 8 A", "The source current splits between 16 Ω and that 4 Ω. The numerator holds the other resistor, 16 Ω.", "تيار المصدر يتقسم بين 16 Ω و 4 Ω المكافئة. في البسط المقاومة الأخرى 16 Ω."],
          ["i_6 = @frac{4}{6 + 4} @cdot 8 = 3.2 A", "Divide again: the 8 A splits between 4 Ω and 6 Ω.", "نقسّم مرة أخرى: الـ 8 A يتقسم بين 4 Ω و 6 Ω."],
          ["p = (3.2)^2 @cdot 6 = 61.44 W", "Power in a resistor: $p = i^2R$.", "القدرة في مقاومة: p = i²R."]],
        check: [["The smaller resistor took the bigger share each time: 8 A of 10 A, then 4.8 A against 3.2 A.", "المقاومة الأصغر أخذت النصيب الأكبر في كل مرة: 8 A من 10 A، ثم 4.8 A مقابل 3.2 A."]] }],
      ["real", { beats: [
        ["A volume knob, a potentiometer, is a variable voltage divider: its wiper splits one resistor into $R_1$ and $R_2$.", "مقبض الصوت (potentiometer) مقسّم جهد متغير: منزلقه يقسم مقاومة واحدة إلى R₁ و R₂."],
        ["And problem 3.13 is why a divider's output sags under load: the load lowers the bottom resistance.", "ومسألة 3.13 تشرح لماذا ينخفض خرج المقسّم تحت الحمل: الحمل يقلل المقاومة السفلية."]] }],
      ["quiz", { i: 0, q: "A voltage divider has $v_s = 10$ V, $R_1 = 4\\ \\Omega$ and $R_2 = 1\\ \\Omega$. What is the voltage across $R_2$?",
        opts: ["2 V", "8 V", "2.5 V"], whys: ["$10 \\times 1/(4+1) = 2$ V.", "That is the voltage of $R_1$. Put the resistor whose voltage you want in the numerator.", "You divided by $R_1$ instead of the sum of both resistors."],
        hints: [["$R_2$ goes in the numerator: it is the resistor whose voltage we want.", "R₂ في البسط لأنها المقاومة التي نريد جهدها."], ["The denominator is $4 + 1 = 5\\ \\Omega$.", "المقام هو 4 + 1 = 5 Ω."]],
        answer: ["$v_2 = 10 \\times 1/5 = 2$ V. The smaller resistor takes the smaller voltage.", "v₂ = 10 × 1/5 = 2 V. المقاومة الأصغر تأخذ الجهد الأصغر."] }],
      ["quiz", { i: 1, q: "A 6 A current source feeds 2 Ω and 4 Ω in parallel. What is the current in the 2 Ω resistor?",
        opts: ["2 A", "4 A", "3 A"], whys: ["That is the current of the 4 Ω resistor. In a current divider the numerator holds the other resistor.", "$6 \\times 4/(2+4) = 4$ A.", "The current splits equally only when the two resistors are equal."],
        hints: [["In current division, the numerator holds the other resistor.", "في قسمة التيار يكون في البسط المقاومة الأخرى."]],
        answer: ["$6 \\times 4/(2+4) = 4$ A. The smaller resistor takes the larger current.", "6 × 4/(2+4) = 4 A. المقاومة الأصغر تأخذ التيار الأكبر."] }],
      ["quiz", { i: 2, q: "A load is connected at the output of a voltage divider. The output voltage…",
        opts: ["increases", "decreases", "does not change"], whys: ["The load in parallel with $R_2$ lowers the bottom resistance, so its share falls.", "$R_2 \\parallel R_L$ is smaller than $R_2$.", "It changes, unless $R_L$ is practically infinite."],
        hints: [["The load is in parallel with $R_2$. What happens to two resistors in parallel?", "الحمل على التوازي مع R₂. ماذا يحدث لمقاومتين على التوازي؟"]],
        answer: ["It decreases: $R_2 \\parallel R_L$ is smaller than $R_2$, as in problem 3.13 (4 V fell to 3 V).", "يقل: R₂ ∥ R_L أصغر من R₂، كما في مسألة 3.13 حيث انخفض من 4 V إلى 3 V."] }],
      ["sum", { math: ["v_o = v_s @cdot @frac{@c2{R_2}}{@c1{R_1} + @c2{R_2}}"], beats: [
        ["Series resistors split the source voltage in proportion to their values.", "المقاومات على التوالي تقسم جهد المصدر بنسبة قيمها."],
        ["A load at the output lowers $v_o$: merge it into $R_2$ first.", "الحمل على الخرج يخفّض vₒ: اضمّه إلى R₂ أولًا."],
        ["Parallel resistors split a current, with the other resistor in the numerator.", "المقاومات على التوازي تقسم التيار، والمقاومة الأخرى في البسط."]] }]
    ]
  });

  EX.add("c1-resistive-4", {
    chapter: CH,
    goals: [["Apply voltage division to any number of series resistors.", "تطبّق قسمة الجهد على أي عدد من المقاومات على التوالي."],
      ["Apply current division to any number of parallel branches.", "تطبّق قسمة التيار على أي عدد من الفروع على التوازي."],
      ["Use both inside a larger circuit, after finding the equivalent resistance.", "تستخدمهما داخل دائرة أكبر بعد إيجاد المقاومة المكافئة."]],
    items: [
      ["law", { label: "Voltage division, any number of resistors", steps: [
        ["R_{eq} = R_1 + R_2 + @ldots + R_n", "Resistors $R_1 … R_n$ in series across a voltage $v$: their equivalent is the sum.", "مقاومات R₁ … Rₙ على التوالي على جهد v: مكافئها مجموعها."],
        ["i = @frac{v}{R_{eq}}", "One series current, from Ohm's law on the equivalent.", "تيار توالٍ واحد من قانون أوم على المكافئة."],
        ["v_j = i R_j = @frac{R_j}{R_{eq}} v", "Ohm's law on any one resistor $R_j$: each takes a share of $v$ proportional to its value.", "قانون أوم على أي مقاومة Rⱼ: كل مقاومة تأخذ من v نصيبًا يتناسب مع قيمتها."]] }],
      ["law", { label: "Current division, any number of branches", steps: [
        ["R_{eq} = R_1 @par R_2 @par @ldots @par R_n", "Resistors in parallel fed by a current $i$: find their parallel equivalent.", "مقاومات على التوازي يغذيها تيار i: نوجد مكافئها على التوازي."],
        ["v = i R_{eq}", "Parallel branches share one voltage: the current times the equivalent.", "الفروع المتوازية تشترك في جهد واحد: التيار × المكافئة."],
        ["i_j = @frac{v}{R_j} = @frac{R_{eq}}{R_j} i", "Ohm's law in branch $j$: each takes a share inversely proportional to its resistance.", "قانون أوم في الفرع j: كل فرع يأخذ نصيبًا يتناسب عكسيًا مع مقاومته."]] }],
      ["when", { beats: [
        ["Use division to reach the unknown directly, without solving the whole circuit.", "استخدم القسمة لتصل إلى المجهول مباشرة دون حل الدائرة كلها."],
        ["In current division, $R_{eq}$ is the parallel group the current splits in, not necessarily the whole circuit.", "في قسمة التيار، R_eq هي مجموعة التوازي التي يتقسم فيها التيار، وليست بالضرورة الدائرة كلها."]] }],
      ["ex", { title: "Example 3.4", fig: 0, q: ["Use current division to find $i_o$, and voltage division to find $v_o$.", "مثال 3.4: استخدم قسمة التيار لإيجاد iₒ، وقسمة الجهد لإيجاد vₒ."],
        pick: ["The 8 A source feeds four parallel branches. Reduce each branch, find the group's $R_{eq}$, then divide.", "مصدر 8 A يغذي أربعة فروع متوازية. نختزل كل فرع ونوجد R_eq للمجموعة ثم نقسم."], given: ["i = 8 A", "@text{branches: } 36 + 44, @quad 10, @quad 40 + 10 + 30, @quad 24"], find: "i_o, @quad v_o",
        steps: [
          ["R_{eq} = 80 @par 10 @par 80 @par 24", "Each branch's series resistors add first: 36 + 44 = 80 and 40 + 10 + 30 = 80.", "نجمع مقاومات التوالي في كل فرع أولًا: 36 + 44 = 80 و 40 + 10 + 30 = 80."],
          ["R_{eq} = @frac{1}{1/80 + 1/10 + 1/80 + 1/24} = 6 @Omega", "Four in parallel: add the reciprocals, then flip.", "أربعة على التوازي: نجمع المقلوبات ثم نقلب الناتج."],
          ["i_o = @frac{6}{24} @times 8 = 2 A", "Current division into the 24 Ω branch: $R_{eq}/R_j$ times the total.", "قسمة التيار في فرع 24 Ω: R_eq/Rⱼ في التيار الكلي."],
          ["v = 24 @times 2 = 48 V", "Ohm's law gives the common voltage of all the branches.", "قانون أوم يعطي الجهد المشترك لكل الفروع."],
          ["v_o = @frac{30}{80} @times 48 = 18 V", "Voltage division inside the 40 + 10 + 30 branch: 30 Ω's share of 48 V.", "قسمة الجهد داخل فرع 40 + 10 + 30: نصيب 30 Ω من 48 V."]],
        check: [["6 Ω is smaller than the smallest branch, 10 Ω, as a parallel group must be.", "6 Ω أصغر من أصغر فرع 10 Ω، كما يجب في التوازي."],
          ["The 10 Ω branch would take $48/10 = 4.8$ A, the most: the smallest branch takes the most current.", "فرع 10 Ω يأخذ 48/10 = 4.8 A وهو الأكبر: أصغر فرع يأخذ أكبر تيار."]] }],
      ["real", { beats: [
        ["An ammeter measures large currents with a very small resistor, a shunt, in parallel with its coil.", "الأميتر يقيس التيارات الكبيرة بمقاومة صغيرة جدًا (shunt) على التوازي مع ملفه."],
        ["Most of the current goes through the shunt and a small known part through the meter: that is current division.", "معظم التيار يمر في المقاومة الصغيرة وجزء صغير معروف في المقياس، وهذه قسمة التيار."]] }],
      ["quiz", { i: 0, q: "In current division $i_j = (R_{eq}/R_j)i$, the quantity $R_{eq}$ is…", opts: ["the resistance of the parallel group", "the resistance of the whole circuit", "the sum of the branch resistances"],
        whys: ["The group in which the current splits.", "Only if the whole circuit is that parallel group.", "Sums are for series; for parallel we add reciprocals."],
        hints: [["Where does the current $i$ split?", "أين يتقسم التيار i؟"]] }],
      ["quiz", { i: 1, q: "Two resistors in series, one twice the other, across 30 V. The voltage of the larger one is…", opts: ["20 V", "10 V", "15 V"],
        whys: ["Its share is 2/3 of the total: $2/3 @times 30 = 20$ V.", "That is the smaller one's voltage.", "The voltage splits in the ratio of the resistances, not equally."],
        hints: [["Call them $2R$ and $R$: the total is $3R$.", "سمّهما 2R و R، فالمجموع 3R."]] }],
      ["sum", { math: ["v_j = @frac{R_j}{R_{eq}} v @quad i_j = @frac{R_{eq}}{R_j} i"], beats: [
        ["Voltage division: share proportional to resistance.", "قسمة الجهد: النصيب يتناسب مع المقاومة."],
        ["Current division: share inversely proportional to resistance.", "قسمة التيار: النصيب يتناسب عكسيًا مع المقاومة."],
        ["Inside a big circuit: reduce, divide the current, then divide the voltage in the branch.", "في دائرة كبيرة: اختزل، ثم قسّم التيار، ثم قسّم الجهد داخل الفرع."]] }]
    ]
  });

  EX.add("c1-resistive-5", {
    chapter: CH,
    goals: [["Recognize a network that can't be reduced with series and parallel.", "تتعرف على شبكة لا تُختزل بالتوالي والتوازي."],
      ["Convert between Δ and Y in both directions.", "تحوّل بين Δ و Y في الاتجاهين."],
      ["Compute the equivalent resistance of a bridge circuit.", "تحسب المقاومة المكافئة لدائرة جسر."]],
    items: [
      ["idea", { fig: 0, beats: [
        ["Sometimes resistors are neither in series nor in parallel. In this bridge, no two resistors share a lone node or the same pair of nodes.", "أحيانًا لا تكون المقاومات على التوالي ولا على التوازي. في هذا الجسر لا تشترك مقاومتان في عقدة منفردة ولا في زوج العقد نفسه.", { hi: "R5" }],
        ["Two shapes cause this: the delta, Δ (also called pi), and the wye, Y (also called tee).", "الشكلان اللذان يسببان ذلك: الدلتا Δ (وتسمى pi) والواي Y (وتسمى tee)."],
        ["We convert one shape into the other so that the resistance between each pair of terminals stays the same. Then series and parallel work again.", "نحوّل أحد الشكلين إلى الآخر بحيث تبقى المقاومة بين كل زوج من الأطراف كما هي، فيعود التبسيط بالتوالي والتوازي ممكنًا."]] }],
      ["law", { label: "Δ to Y", steps: [
        ["R_1 = @frac{R_b R_c}{R_a + R_b + R_c}", "Each Y resistor = the product of the two Δ resistors next to it ÷ the sum of all three Δ resistors.", "كل مقاومة في Y = حاصل ضرب مقاومتَي Δ المجاورتين لها ÷ مجموع مقاومات Δ الثلاث."],
        ["R_2 = @frac{R_c R_a}{R_a + R_b + R_c}, @quad R_3 = @frac{R_a R_b}{R_a + R_b + R_c}", "The same pattern for the other two: always the two nearest branches on top.", "النمط نفسه للاثنتين الأخريين: دائمًا الفرعان الأقرب في البسط."]] }],
      ["law", { label: "Y to Δ", steps: [
        ["R_a = @frac{R_1R_2 + R_2R_3 + R_3R_1}{R_1}", "Each Δ resistor = the sum of the pairwise products of the Y resistors ÷ the Y resistor farthest from it.", "كل مقاومة في Δ = مجموع حواصل الضرب الثنائية لمقاومات Y ÷ مقاومة Y الأبعد عنها."],
        ["R_b = @frac{@Sigma}{R_2}, @quad R_c = @frac{@Sigma}{R_3}", "The numerator is the same for all three; only the divisor changes.", "البسط واحد للثلاث، والذي يتغير هو المقسوم عليه فقط."],
        ["R_Y = @frac{R_@Delta}{3}", "For three equal resistors the rule becomes simple: a Y resistor is a third of the Δ resistor.", "للمقاومات الثلاث المتساوية تبسط القاعدة: مقاومة Y تساوي ثلث مقاومة Δ."]] }],
      ["when", { beats: [
        ["Try series and parallel first. Convert only when you find neither.", "جرّب التوالي والتوازي أولًا، ولا تحوّل إلا إذا لم تجد أيًا منهما."],
        ["You may convert either delta in the network: choose the one that makes the rest easier.", "يمكنك تحويل أي دلتا في الشبكة: اختر التي تسهّل ما بعدها."]] }],
      ["ex", { title: "Example 3.7", fig: 1, q: ["Find the current and the power supplied by the 40 V source.", "مثال 3.7: أوجد التيار والقدرة التي يعطيها المصدر 40 V."],
        pick: ["Only the source current is asked, so the equivalent resistance across its terminals is enough. The bridge has no series or parallel pair: convert the upper Δ (100, 125, 25 Ω) to a Y.", "المطلوب تيار المصدر فقط، فتكفي المقاومة المكافئة على طرفيه. الجسر ليس فيه توالٍ ولا توازٍ، فنحوّل الدلتا العلوية (100 و 125 و 25 Ω) إلى Y."],
        steps: [
          ["100 + 125 + 25 = 250 @Omega", "The common denominator: the sum of the Δ resistors.", "المقام المشترك: مجموع مقاومات Δ."],
          ["R_1 = @frac{100 @times 125}{250} = 50, @quad R_2 = @frac{125 @times 25}{250} = 12.5, @quad R_3 = @frac{100 @times 25}{250} = 10", "Each Y branch: the product of its two neighbouring Δ resistors over 250.", "كل فرع في Y: حاصل ضرب مقاومتَي Δ المجاورتين له على 250."],
          ["(10 + 40) @par (12.5 + 37.5) = 50 @par 50 = 25 @Omega", "Now series pairs appear, and the two 50 Ω branches are in parallel.", "الآن تظهر أزواج على التوالي، والفرعان 50 Ω على التوازي."],
          ["R_{eq} = 5 + 50 + 25 = 80 @Omega", "Add the series parts in the source's path.", "نجمع الأجزاء الموصولة على التوالي في مسار المصدر."],
          ["i = @frac{40}{80} = 0.5 A, @quad p = -iv = -20 W", "The source current leaves its + terminal, so $p = -vi$: negative, the source delivers 20 W.", "تيار المصدر يخرج من طرفه الموجب، فـ p = −vi: سالبة، أي أن المصدر يعطي 20 W."]],
        check: [["Two equal 50 Ω branches in parallel give 25 Ω: half of one, as expected.", "فرعان متساويان 50 Ω على التوازي يعطيان 25 Ω، أي النصف كما نتوقع."]] }],
      ["real", { beats: [
        ["Factory motors and distribution transformers connect their windings in Y or in Δ.", "محركات المصانع ومحولات التوزيع توصل ملفاتها على شكل Y أو Δ."],
        ["Converting between the two is the same idea you will use for three-phase circuits in Circuits 2.", "التحويل بينهما هو الفكرة نفسها التي ستستخدمها في دوائر الأطوار الثلاثة في Circuits 2."]] }],
      ["quiz", { i: 0, q: "A balanced Δ has 30 Ω on each side. Each branch of the equivalent Y is…", opts: ["10 Ω", "90 Ω", "30 Ω"],
        whys: ["$R_Y = R_@Delta/3$.", "That is the reverse conversion: from Y to Δ we multiply by 3.", "The resistances change so that the terminal resistances stay the same."],
        hints: [["Equal resistors: the rule becomes a simple ratio.", "للمقاومات المتساوية تصبح القاعدة نسبة بسيطة."]] }],
      ["quiz", { i: 1, q: "When do we need a Δ-Y conversion to find an equivalent resistance?", opts: ["In any network with more than 3 resistors", "When there is no series or parallel combination to reduce", "When there are dependent sources"],
        whys: ["Many large networks reduce with series and parallel alone.", "Like an unbalanced bridge.", "That has nothing to do with the conversion."],
        hints: [["It is a tool for when the usual tools fail.", "إنها أداة لحين تفشل الأدوات المعتادة."]] }],
      ["quiz", { i: 2, q: "A balanced bridge ($R_1/R_3 = R_2/R_4$). The current in the bridge resistor $R_5$ is…", opts: ["zero", "the largest in the circuit", "equal to the current of $R_1$"],
        whys: ["Both ends of $R_5$ are at the same voltage, so no current flows in it.", "At balance its two ends have equal voltages.", "No current flows in it at balance."],
        hints: [["Balanced means both ends of $R_5$ sit at the same voltage.", "الاتزان يعني أن طرفي R₅ عند الجهد نفسه."]] }],
      ["sum", { math: ["R_Y = @frac{@text{product of neighbours}}{@text{sum of } @Delta}"], beats: [
        ["When nothing is in series or in parallel, convert a Δ to a Y or the reverse.", "عندما لا يكون شيء على التوالي أو التوازي، حوّل Δ إلى Y أو العكس."],
        ["Δ to Y: product of the two neighbours over the sum. Y to Δ: sum of products over the far one.", "من Δ إلى Y: ضرب الجارتين على المجموع. ومن Y إلى Δ: مجموع الضربات على الأبعد."],
        ["The terminals see the same resistance, so the rest of the circuit doesn't change.", "الأطراف ترى المقاومة نفسها، فلا تتغير بقية الدائرة."]] }]
    ]
  });
})();
