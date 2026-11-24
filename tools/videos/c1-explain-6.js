/* Circuits 1 · Chapter 6 — scripts of the animated lesson videos (explain.js). English on screen; the Arabic of each
   beat becomes the subtitle track. Content and numbers follow the lessons (c1-power.js). */
(function () {
  "use strict";
  var CH = "Chapter 6 · Sinusoidal Steady-State Power";
  // v, i and p = v·i for θv − θi = 120°, scaled so VmIm = 1: p swings at twice the frequency about its average.
  var VIP = { wave: { cycles: 2, curves: [{ a: 0.9, ph: 15, c: "w", label: "v" }, { a: 0.6, ph: -105, c: "c2", label: "i" }, { a: 0.5, off: -0.25, f: 2, ph: 120, c: "c3", label: "p" }] } };
  var TRI = function (P, Q, lp, lq, ls) { return { phasor: { vecs: [[P, 0, lp, "c1"], [Math.abs(Q), Q >= 0 ? 90 : -90, lq, "c3", [P, 0]], [Math.sqrt(P * P + Q * Q), Math.atan2(Q, P) * 180 / Math.PI, ls, "c2"]], max: Math.max(P, Math.abs(Q)), origin: [110, 560], R: 500 } }; };

  EX.add("c1-power-1", {
    chapter: CH,
    goals: [["Write $p(t) = v(t)i(t)$ for an element in sinusoidal steady state.", "تكتب p(t) = v(t)i(t) لعنصر في الحالة الجيبية المستقرة."],
      ["See that $p(t)$ oscillates at twice the frequency around an average value.", "ترى أن p(t) تتذبذب بضعف التردد حول قيمة متوسطة."],
      ["Explain the negative values of instantaneous power.", "تفسّر القيم السالبة للقدرة اللحظية."]],
    items: [
      ["idea", { fig: VIP, beats: [
        ["With the passive sign convention, the power at any instant is $p = vi$, the product of two sinusoids.", "مع اصطلاح الإشارة، القدرة في أي لحظة p = vi، أي حاصل ضرب دالتين جيبيتين."],
        ["Look at $p$: it swings twice as fast as $v$ and $i$, around a constant average.", "انظر إلى p: تتذبذب بضعف سرعة v و i حول متوسط ثابت."],
        ["Where $p$ goes below zero, the element is returning energy to the source at those instants.", "حيث تنزل p تحت الصفر، يكون العنصر يعيد الطاقة إلى المصدر في تلك اللحظات."]] }],
      ["law", { label: "Building p(t)", steps: [
        ["v = V_m @cos(@omega t + @theta_v - @theta_i), @quad i = I_m @cos @omega t", "Choose the time reference so the current's angle is zero: shift both by $@theta_i$. Nothing physical changes.", "نختار مرجع الزمن بحيث تكون زاوية التيار صفرًا، أي نزيح الاثنين بـ θᵢ، ولا يتغير شيء فيزيائيًا."],
        ["p = V_m I_m @cos(@omega t + @theta_v - @theta_i) @cos @omega t", "Multiply the two.", "نضرب الدالتين."],
        ["@cos A @cos B = @frac{1}{2}[@cos(A - B) + @cos(A + B)]", "A product of cosines becomes a sum: this is where $2@omega t$ comes from.", "حاصل ضرب جيبي تمام يصبح مجموعًا، ومن هنا يأتي 2ωt."],
        ["p = P + P @cos 2@omega t - Q @sin 2@omega t", "Expand and name the two constants $P$ and $Q$.", "نفك الحدود ونسمّي الثابتين P و Q."],
        ["P = @frac{V_m I_m}{2}@cos(@theta_v - @theta_i), @quad Q = @frac{V_m I_m}{2}@sin(@theta_v - @theta_i)", "$P$ is the average; $Q$ sets the part that only goes back and forth.", "P هو المتوسط، و Q يحدد الجزء الذي يذهب ويعود فقط."]] }],
      ["ex", { title: "Example", fig: VIP, q: ["$v = 100@cos(@omega t + 15@deg)$ V and $i = 4@cos(@omega t - 105@deg)$ A at a network's terminals. Write $p(t)$.", "مثال: v = 100 cos(ωt + 15°) V و i = 4 cos(ωt − 105°) A عند أطراف شبكة. اكتب p(t)."],
        steps: [
          ["@theta_v - @theta_i = 15@deg - (-105@deg) = 120@deg", "First the angle between voltage and current.", "أولًا الزاوية بين الجهد والتيار."],
          ["@frac{V_m I_m}{2} = @frac{(100)(4)}{2} = 200", "The common factor.", "العامل المشترك."],
          ["P = 200 @cos 120@deg = -100 W, @quad Q = 200 @sin 120@deg = 173.21 @text{ VAR}", "The two constants.", "الثابتان."],
          ["p = -100 - 100 @cos 2@omega t - 173.21 @sin 2@omega t @text{ W}", "Put them into $p = P + P@cos 2@omega t - Q@sin 2@omega t$.", "نعوّضهما في p = P + P cos 2ωt − Q sin 2ωt."]],
        check: [["The average is negative, −100 W: on average this network delivers power.", "المتوسط سالب −100 W: الشبكة في المتوسط تعطي القدرة."]] }],
      ["when", { beats: [
        ["Instantaneous power shows each instant, but practical work uses its average $P$ and the reactive power $Q$.", "القدرة اللحظية تُظهر كل لحظة، لكن الحسابات العملية تستخدم متوسطها P والقدرة الردية Q."]] }],
      ["real", { beats: [
        ["A lamp on a 60 Hz outlet has its power swing 120 times a second.", "مصباح على مقبس 60 Hz تتذبذب قدرته 120 مرة في الثانية."],
        ["That is the slight flicker a phone camera sometimes catches in slow motion.", "وهذا هو الوميض الخفيف الذي تلتقطه كاميرا الجوال أحيانًا بالتصوير البطيء."]] }],
      ["quiz", { i: 0, q: "Compared with the voltage, instantaneous power oscillates at…", opts: ["twice the frequency, $2@omega$", "the same frequency, $@omega$", "half, $@omega/2$"],
        whys: ["A product of two cosines at the same frequency gives a $2@omega$ term.", "$@cos @cdot @cos$ gives $@cos(2@omega t + …)$, not $@cos @omega t$.", "Multiplying never produces a frequency below $@omega$ here."],
        hints: [["Remember $@cos A @cos B$.", "تذكّر cos A cos B."]] }],
      ["quiz", { i: 1, q: "An ideal inductor in sinusoidal steady state. Its instantaneous power…", opts: ["oscillates with zero average", "is constant and positive", "is zero at every instant"],
        whys: ["$@theta_v - @theta_i = 90@deg$, so the constant term $@cos 90@deg = 0$: it stores and returns energy.", "An ideal inductor uses no energy on average.", "$p(t)$ is not zero instant by instant; only its average is."],
        hints: [["What is $@cos 90@deg$?", "كم يساوي cos 90°؟"]] }],
      ["sum", { math: ["p = P + P@cos 2@omega t - Q@sin 2@omega t"], beats: [
        ["$p = vi$ swings at $2@omega$ around its average $P$.", "p = vi تتذبذب بـ 2ω حول متوسطها P."],
        ["$P$ and $Q$ come from $V_mI_m/2$ times the cosine and sine of $@theta_v - @theta_i$.", "P و Q تأتيان من V_mI_m/2 في جيب تمام وجيب الزاوية θᵥ − θᵢ."],
        ["Negative instants mean energy flowing back to the source.", "اللحظات السالبة تعني طاقة تعود إلى المصدر."]] }]
    ]
  });

  EX.add("c1-power-2", {
    chapter: CH,
    goals: [["Compute the average power $P$ and the reactive power $Q$ from peaks and angles.", "تحسب القدرة المتوسطة P والردية Q من القيم العظمى والزوايا."],
      ["Find the sign of $Q$ for inductive and capacitive loads.", "تحدد إشارة Q للأحمال الحثية والسعوية."],
      ["Know the power of R, L and C each on its own.", "تعرف قدرة R و L و C كلًا على حدة."]],
    items: [
      ["idea", { math: ["P = @frac{V_m I_m}{2}@cos(@theta_v - @theta_i) @quad [W]", "Q = @frac{V_m I_m}{2}@sin(@theta_v - @theta_i) @quad [VAR]"], beats: [
        ["The average, or real, power $P$ is the average of $p$ over one period, in watts: the power that becomes work or heat.", "القدرة المتوسطة (الفعلية) P متوسط p على دور واحد بالواط: القدرة التي تتحول إلى شغل أو حرارة."],
        ["The reactive power $Q$, in volt-amperes reactive, is the energy that only shuttles between the source and the inductors and capacitors.", "القدرة الردية Q بالفولت أمبير الردي هي الطاقة التي تتنقل فقط بين المصدر والملفات والمكثفات."]] }],
      ["idea", { label: "R, L and C on their own", table: [["Element", "θv − θi", "P", "Q"], ["Resistor", "0°", "> 0", "0"], ["Inductor", "+90°", "0", "> 0"], ["Capacitor", "−90°", "0", "< 0"]], beats: [
        ["A pure resistor: voltage and current in phase, so $Q = 0$ and all the power is real.", "مقاومة بحتة: الجهد والتيار متوافقان، فـ Q = 0 وكل القدرة فعلية."],
        ["A pure inductor: the current lags by 90°, so $P = 0$ and $Q$ is positive. A pure capacitor: the current leads by 90°, $P = 0$ and $Q$ is negative.", "ملف بحت: التيار يتأخر 90° فـ P = 0 و Q موجبة. مكثف بحت: التيار يسبق 90° فـ P = 0 و Q سالبة."],
        ["The power factor is $pf = @cos(@theta_v - @theta_i)$. Lagging means an inductive load; leading means capacitive.", "معامل القدرة pf = cos(θᵥ − θᵢ)، ومتأخر يعني حملًا حثيًا، ومتقدم يعني سعويًا."]] }],
      ["ex", { title: "Example 10.1", q: ["$v = 100@cos(@omega t + 15@deg)$ V and $i = 4@sin(@omega t - 15@deg)$ A. Find $P$ and $Q$. Is the network absorbing or delivering each?", "مثال 10.1: v = 100 cos(ωt + 15°) V و i = 4 sin(ωt − 15°) A. أوجد P و Q. هل الشبكة تمتص كلًا منهما أم تعطيه؟"],
        steps: [
          ["i = 4@sin(@omega t - 15@deg) = 4@cos(@omega t - 105@deg) A", "Write the current as a cosine first: subtract 90°.", "نكتب التيار جيب تمام أولًا بطرح 90°."],
          ["P = @frac{1}{2}(100)(4)@cos[15 - (-105)] = -100 W", "The angle is 120°, and $@cos 120@deg = -0.5$.", "الزاوية 120°، و cos 120° = −0.5."],
          ["Q = @frac{1}{2}(100)(4)@sin[15 - (-105)] = 173.21 @text{ VAR}", "And $@sin 120@deg = 0.866$.", "و sin 120° = 0.866."]],
        check: [["$P$ negative: the network delivers average power. $Q$ positive: it absorbs reactive power, like an inductive load.", "P سالبة: الشبكة تعطي القدرة المتوسطة. Q موجبة: تمتص القدرة الردية كحمل حثي."]] }],
      ["real", { beats: [
        ["Electric motors are inductive loads with a lagging power factor, around 0.8.", "المحركات الكهربائية أحمال حثية بمعامل قدرة متأخر في حدود 0.8."],
        ["Utilities fine factories with a low power factor: they draw more current for the same useful power.", "شركات الكهرباء تغرّم المصانع ذات معامل القدرة المنخفض لأنها تسحب تيارًا أكبر للقدرة المفيدة نفسها."]] }],
      ["quiz", { i: 0, q: "An ideal capacitor absorbs reactive power that is…", opts: ["negative", "positive", "zero"],
        whys: ["The current leads by 90°, and $@sin(-90@deg) = -1$.", "Positive is for the inductor; in a capacitor $@theta_v - @theta_i = -90@deg$.", "$P$ is zero for a capacitor, but $Q$ is not."],
        hints: [["Which leads in a capacitor, the voltage or the current?", "في المكثف أيهما يسبق: الجهد أم التيار؟"]] }],
      ["quiz", { i: 1, q: "A 10 Ω resistor carries $i = 2@cos @omega t$ A. The average power is…", opts: ["20 W", "40 W", "10 W"],
        whys: ["$@frac{1}{2} @times 2^2 @times 10 = 20$ W.", "You forgot the ½ that comes with a peak value.", "The current is squared: $@frac{1}{2} @times 4 @times 10$."],
        hints: [["With peak values, $P = @frac{1}{2}I_m^2 R$.", "مع القيم العظمى P = ½ I_m² R."]] }],
      ["sum", { beats: [
        ["$P$ is the average power, in W; $Q$ is the exchanged power, in VAR.", "P القدرة المتوسطة بالواط، و Q القدرة المتبادلة بالفار."],
        ["Inductors absorb positive $Q$; capacitors absorb negative $Q$; resistors only $P$.", "الملفات تمتص Q موجبة، والمكثفات Q سالبة، والمقاومات P فقط."],
        ["Write sines as cosines before reading the angles.", "اكتب الجيب جيب تمام قبل قراءة الزوايا."]] }]
    ]
  });

  EX.add("c1-power-3", {
    chapter: CH,
    goals: [["Define the effective (rms) value of a periodic wave.", "تعرّف القيمة الفعالة (rms) لموجة دورية."],
      ["Write $P$ and $Q$ with rms values, without the ½.", "تكتب P و Q بالقيم الفعالة بدون ½."],
      ["Avoid mixing peak and effective values.", "تتجنب الخلط بين القيمة العظمى والفعالة."]],
    items: [
      ["idea", { beats: [
        ["The rms, or effective, value of a sinusoid delivers to a resistor the same energy as a DC source of that value. That is why it is called effective.", "القيمة الفعالة (rms) للدالة الجيبية تعطي المقاومة الطاقة نفسها التي يعطيها مصدر مستمر بالقيمة نفسها، ولهذا تسمى فعالة."],
        ["For a sinusoid, $V_{rms} = V_m/@sqrt{2}$ and $I_{rms} = I_m/@sqrt{2}$.", "للدالة الجيبية V_rms = V_m/√2 و I_rms = I_m/√2."]] }],
      ["law", { label: "Power with rms values", steps: [
        ["P = @frac{V_m I_m}{2} @cos(@theta_v - @theta_i)", "Start from the peak-value formula.", "نبدأ من قانون القيم العظمى."],
        ["P = @frac{V_m}{@sqrt{2}} @cdot @frac{I_m}{@sqrt{2}} @cos(@theta_v - @theta_i)", "Split the 2 into $@sqrt{2} @times @sqrt{2}$, one under each peak.", "نقسم الـ 2 إلى √2 × √2، واحدة تحت كل قيمة عظمى."],
        ["P = V_{eff} I_{eff} @cos(@theta_v - @theta_i), @quad Q = V_{eff} I_{eff} @sin(@theta_v - @theta_i)", "With rms values the ½ disappears.", "مع القيم الفعالة تختفي ½."],
        ["P = @frac{V_{rms}^2}{R} = I_{rms}^2 R", "For a resistor, exactly the DC formulas.", "وللمقاومة نحصل على قوانين التيار المستمر تمامًا."]] }],
      ["ex", { title: "Example 10.3", q: ["A sinusoidal voltage with a 625 V peak is across a 50 Ω resistor. Find the average power, then repeat by finding the current first.", "مثال 10.3: جهد جيبي قيمته العظمى 625 V على مقاومة 50 Ω. أوجد القدرة المتوسطة، ثم أعد الحل بإيجاد التيار أولًا."],
        steps: [
          ["V_{rms} = @frac{625}{@sqrt{2}} @approx 441.94 V", "Change the peak into rms.", "نحوّل القيمة العظمى إلى فعالة."],
          ["P = @frac{(441.94)^2}{50} = 3906.25 W", "Then the DC-style formula.", "ثم قانون يشبه قانون التيار المستمر."],
          ["I_m = @frac{625}{50} = 12.5 A @Rightarrow I_{rms} = @frac{12.5}{@sqrt{2}} @approx 8.84 A", "The second way: current first.", "الطريقة الثانية: التيار أولًا."],
          ["P = (8.84)^2(50) = 3906.25 W", "The same result.", "النتيجة نفسها."]] }],
      ["when", { beats: [
        ["Meters and appliances state rms values.", "المقاييس والأجهزة تذكر القيم الفعالة."],
        ["Given a peak, divide by $@sqrt{2}$, or use $P = V_mI_m/2$ directly.", "إذا أُعطيت القيمة العظمى فاقسم على √2، أو استخدم P = V_mI_m/2 مباشرة."]] }],
      ["real", { beats: [
        ["When the utility says the outlet is 220 V, it means the rms value.", "حين تقول شركة الكهرباء إن المقبس 220 V فهي تعني القيمة الفعالة."],
        ["A heater on it gives the same heat as on a 220 V DC source.", "والسخان عليه يعطي الحرارة نفسها كما لو كان على مصدر مستمر 220 V."]] }],
      ["quiz", { i: 0, q: "An outlet is 220 V rms. Its peak is about…", opts: ["311 V", "156 V", "440 V"],
        whys: ["$220 @times @sqrt{2} @approx 311$ V.", "You divided by $@sqrt{2}$; the peak is larger than the rms.", "The factor is $@sqrt{2}$, not 2."],
        hints: [["The peak is the bigger one.", "القيمة العظمى هي الأكبر."]] }],
      ["quiz", { i: 1, q: "With rms values, the average power formula is…", opts: ["$V_{rms}I_{rms}@cos@theta$", "$@frac{1}{2}V_{rms}I_{rms}@cos@theta$"],
        whys: ["The ½ is gone because $V_mI_m/2 = V_{rms}I_{rms}$.", "The ½ goes with peak values only."],
        hints: [["Where did the ½ go?", "أين ذهبت ½؟"]] }],
      ["sum", { math: ["P = V_{rms} I_{rms} @cos@theta = @frac{V_m I_m}{2}@cos@theta"], beats: [
        ["rms means: the same heating as DC of that value.", "الفعالة تعني: التسخين نفسه كتيار مستمر بالقيمة نفسها."],
        ["With rms values, no ½.", "مع القيم الفعالة لا يوجد ½."],
        ["With peak values, keep the ½.", "ومع القيم العظمى أبقِ ½."]] }]
    ]
  });

  EX.add("c1-power-4", {
    chapter: CH,
    goals: [["Combine $P$ and $Q$ in one complex number $S = P + jQ$.", "تجمع P و Q في عدد مركب واحد S = P + jQ."],
      ["Compute $S$ from the voltage and current phasors.", "تحسب S من فيزوري الجهد والتيار."],
      ["Draw the power triangle and read the power factor from it.", "ترسم مثلث القدرة وتقرأ منه معامل القدرة."]],
    items: [
      ["idea", { fig: TRI(8, 6, "P", "Q", "|S|"), beats: [
        ["Complex power joins the two: $S = P + jQ$, in volt-amperes. $P$ is its real part, $Q$ its imaginary part.", "القدرة المركبة تجمع الاثنين: S = P + jQ بالفولت أمبير، و P جزؤها الحقيقي و Q جزؤها التخيلي."],
        ["Its magnitude is the apparent power, $|S| = @sqrt{P^2 + Q^2}$.", "ومقدارها القدرة الظاهرية |S| = √(P² + Q²)."],
        ["Together they make the power triangle: $P$ across, $Q$ up, $|S|$ the hypotenuse, and the angle is the power-factor angle.", "ومعًا تكوّن مثلث القدرة: P أفقي و Q رأسي و |S| الوتر، والزاوية هي زاوية معامل القدرة."]] }],
      ["law", { label: "Reading the triangle", steps: [
        ["S = P + jQ @quad [VA]", "The complex power.", "القدرة المركبة."],
        ["P = |S|@cos@theta, @quad Q = |S|@sin@theta", "The two sides from the hypotenuse.", "الضلعان من الوتر."],
        ["@tan@theta = @frac{Q}{P} = @tan(@theta_v - @theta_i)", "The triangle's angle is the angle between voltage and current.", "زاوية المثلث هي الزاوية بين الجهد والتيار."],
        ["S = @frac{1}{2} V I^{@ast}", "From phasors: the voltage times the conjugate of the current. The conjugate subtracts the angles.", "من الفيزورات: الجهد في مرافق التيار، والمرافق يطرح الزوايا."]] }],
      ["ex", { title: "Example 10.4", fig: TRI(8, 6, "8 kW", "6 kVAR", "10 kVA"), q: ["A load at 240 V rms absorbs 8 kW at a lagging power factor of 0.8. Find the complex power and the load impedance.", "مثال 10.4: حمل على 240 V rms يمتص 8 kW بمعامل قدرة 0.8 متأخر. أوجد القدرة المركبة وممانعة الحمل."],
        steps: [
          ["@cos@theta = 0.8 @Rightarrow @sin@theta = 0.6", "Lagging means inductive, so $Q$ is positive.", "متأخر يعني حثيًا، فـ Q موجبة."],
          ["|S| = @frac{P}{@cos@theta} = @frac{8}{0.8} = 10 @text{ kVA}, @quad Q = 10 @times 0.6 = 6 @text{ kVAR}", "The hypotenuse from the horizontal side, then the vertical side.", "الوتر من الضلع الأفقي، ثم الضلع الرأسي."],
          ["S = 8 + j6 @text{ kVA}", "The complex power.", "القدرة المركبة."],
          ["8000 = (240) I_{eff} (0.8) @Rightarrow I_{eff} = 41.67 A", "$P = V_{eff}I_{eff}@cos@theta$ gives the current.", "P = V_eff I_eff cos θ تعطي التيار."],
          ["Z = @frac{240}{41.67}@angle36.87@deg = 5.76@angle36.87@deg = 4.608 + j3.456 @Omega", "The magnitude from Ohm's law; the angle is positive because the load is inductive.", "المقدار من قانون أوم، والزاوية موجبة لأن الحمل حثي."]] }],
      ["when", { beats: [
        ["Lagging power factor: positive $Q$, inductive. Leading: negative $Q$, capacitive.", "معامل قدرة متأخر: Q موجبة حثي. متقدم: Q سالبة سعوي."],
        ["Generators and transformers are rated in kVA, because the current they must carry depends on $|S|$.", "المولدات والمحولات تُقدَّر بالكيلو فولت أمبير لأن التيار الذي تحمله يعتمد على |S|."]] }],
      ["real", { beats: [
        ["A building's standby generator is rated, say, 100 kVA, not 100 kW.", "مولد الطوارئ في مبنى يُقدَّر مثلًا بـ 100 kVA وليس 100 kW."],
        ["If the loads' power factor is 0.8, it gives only 80 kW of useful power.", "وإذا كان معامل قدرة الأحمال 0.8 فلا يعطي إلا 80 kW قدرة مفيدة."]] }],
      ["quiz", { i: 0, q: "$S = 300 - j400$ VA. The load is…", opts: ["capacitive, pf 0.6 leading", "inductive, pf 0.6 lagging", "capacitive, pf 0.8"],
        whys: ["Negative $Q$ means capacitive, and $pf = 300/500 = 0.6$.", "Negative $Q$ means capacitive (leading).", "$pf = P/|S| = 300/500 = 0.6$; 0.8 is $@sin@theta$."],
        hints: [["Sign of $Q$ first, then $pf = P/|S|$.", "إشارة Q أولًا، ثم pf = P/|S|."]] }],
      ["quiz", { i: 1, q: "Complex power from peak-value phasors is…", opts: ["$@frac{1}{2} V I^@ast$", "$@frac{1}{2} V^@ast I$", "$V I$"],
        whys: ["The conjugate on the current, with the ½.", "That flips the sign of $Q$.", "Without the conjugate the angles add instead of subtract, and the ½ is missing."],
        hints: [["Which conjugate gives $@theta_v - @theta_i$?", "أي مرافق يعطي θᵥ − θᵢ؟"]] }],
      ["sum", { math: ["S = P + jQ, @quad |S| = @sqrt{P^2 + Q^2}"], beats: [
        ["$S = P + jQ$ in VA; its magnitude is the apparent power.", "S = P + jQ بالفولت أمبير، ومقدارها القدرة الظاهرية."],
        ["The power triangle: $P = |S|@cos@theta$, $Q = |S|@sin@theta$.", "مثلث القدرة: P = |S| cos θ و Q = |S| sin θ."],
        ["From phasors: $S = @frac{1}{2}VI^@ast$, conjugate on the current.", "من الفيزورات: S = ½VI* والمرافق على التيار."]] }]
    ]
  });

  EX.add("c1-power-5", {
    chapter: CH,
    goals: [["Apply conservation of complex power: what sources deliver, elements absorb.", "تطبّق حفظ القدرة المركبة: ما تعطيه المصادر تمتصه العناصر."],
      ["Combine parallel loads by their complex powers.", "تجمع الأحمال المتوازية بقدراتها المركبة."],
      ["Compute the line current and the overall power factor.", "تحسب تيار الخط ومعامل القدرة الكلي."]],
    items: [
      ["law", { label: "Forms of S", steps: [
        ["S = V_{eff} I_{eff}^{@ast}", "With rms phasors: voltage times the conjugate of current, no ½.", "بالفيزورات الفعالة: الجهد في مرافق التيار بدون ½."],
        ["S = |I_{eff}|^2 Z = |I_{eff}|^2 R + j|I_{eff}|^2 X", "If $V = ZI$: the real part goes to $R$, the reactive part to $X$.", "إذا كان V = ZI: الجزء الفعلي يذهب إلى R والردي إلى X."],
        ["S = @frac{|V_{eff}|^2}{Z^{@ast}}", "Or from the voltage alone, with the conjugate of the impedance.", "أو من الجهد وحده مع مرافق الممانعة."]] }],
      ["mistake", { beats: [
        ["Peak-value phasors: $@frac{1}{2}VI^@ast$. rms phasors: $VI^@ast$ without the ½.", "فيزورات القيم العظمى: ½VI*، والفعالة: VI* بدون ½."],
        ["Never forget the conjugate on the current: without it the sign of $Q$ comes out wrong.", "لا تنسَ المرافق على التيار، فبدونه تخرج إشارة Q خاطئة."]] }],
      ["ex", { title: "Lecture example", q: ["$V = 100@angle15@deg$ V and $I = 4@angle-105@deg$ A, peak values. Find $S$.", "مثال المحاضرة: V = 100∠15° V و I = 4∠−105° A بالقيم العظمى. أوجد S."],
        steps: [
          ["S = @frac{1}{2}(100@angle15@deg)(4@angle+105@deg)", "Conjugate the current: its angle changes sign.", "نأخذ مرافق التيار: تنعكس إشارة زاويته."],
          ["S = 200@angle120@deg = -100 + j173.21 @text{ VA}", "The same $P$ and $Q$ as from the time functions.", "نحصل على P و Q نفسيهما كما من الدوال الزمنية."]] }],
      ["ex", { title: "Example 10.5", q: ["A $39 + j26$ Ω load is fed from $250@angle0@deg$ V rms through a $1 + j4$ Ω line. Find $I_L$, $V_L$, the load power, the line power and the source power.", "مثال 10.5: حمل 39 + j26 Ω يغذيه مصدر 250∠0° V rms عبر خط 1 + j4 Ω. أوجد I_L و V_L وقدرة الحمل وقدرة الخط وقدرة المصدر."],
        steps: [
          ["I_L = @frac{250@angle0@deg}{40 + j30} = 4 - j3 = 5@angle-36.87@deg A", "Line and load are in series: add them, then Ohm's law.", "الخط والحمل على التوالي: نجمعهما ثم قانون أوم."],
          ["V_L = (39 + j26)(4 - j3) = 234 - j13 V", "The voltage that reaches the load.", "الجهد الذي يصل للحمل."],
          ["S_L = V_L I_L^{@ast} = (234 - j13)(4 + j3) = 975 + j650 @text{ VA}", "rms values, so no ½; conjugate on the current.", "قيم فعالة فلا ½، والمرافق على التيار."],
          ["P_{line} = 5^2 @times 1 = 25 W, @quad Q_{line} = 5^2 @times 4 = 100 @text{ VAR}", "The line's own losses: $|I|^2R$ and $|I|^2X$.", "مفاقيد الخط نفسه: |I|²R و |I|²X."],
          ["S_s = -250 I_L^{@ast} = -(1000 + j750) @text{ VA}", "The source supplies 1000 W and 750 VAR.", "المصدر يعطي 1000 W و 750 VAR."]],
        check: [["975 + 25 = 1000 W and 650 + 100 = 750 VAR: complex power is conserved.", "975 + 25 = 1000 W و 650 + 100 = 750 VAR: القدرة المركبة محفوظة."]] }],
      ["real", { beats: [
        ["The line loss $|I|^2R$ is why electricity is transmitted at very high voltage.", "مفقود الخط |I|²R هو سبب نقل الكهرباء بجهد عالٍ جدًا."],
        ["For the same power the current falls, and the loss falls with its square.", "فللقدرة نفسها يقل التيار، ويقل المفقود بمربعه."]] }],
      ["quiz", { i: 0, q: "Two loads: $S_1 = 3 + j4$ kVA and $S_2 = 3 - j4$ kVA. The total apparent power is…", opts: ["6 kVA", "10 kVA"],
        whys: ["$S = 6 + j0$, so $|S| = 6$ kVA.", "You added 5 + 5. Apparent powers don't add; add the complex $S$."],
        hints: [["Add the complex powers first.", "اجمع القدرات المركبة أولًا."]] }],
      ["quiz", { i: 1, q: "A 10 kW load with power factor 1. Its reactive power is…", opts: ["zero", "10 kVAR"],
        whys: ["$pf = 1$ means $@theta = 0$, so $Q = 0$.", "A power factor of 1 means a purely resistive load."],
        hints: [["$Q = |S|@sin@theta$.", "Q = |S| sin θ."]] }],
      ["sum", { math: ["S = V_{eff} I_{eff}^{@ast} = |I|^2 Z = @frac{|V|^2}{Z^{@ast}}"], beats: [
        ["rms phasors: $S = VI^@ast$; peak: $@frac{1}{2}VI^@ast$.", "الفيزورات الفعالة: S = VI*، والعظمى: ½VI*."],
        ["Complex power is conserved: sources equal loads plus lines.", "القدرة المركبة محفوظة: المصادر = الأحمال + الخطوط."],
        ["Add complex powers, never apparent powers.", "اجمع القدرات المركبة، لا الظاهرية."]] }]
    ]
  });

  EX.add("c1-power-6", {
    chapter: CH,
    goals: [["Show that maximum average power is transferred when $Z_L = Z_{Th}^@ast$.", "تثبت أن أقصى قدرة متوسطة تُنقل عندما Z_L = Z_Th*."],
      ["Compute $P_{max}$ with peak and with rms values.", "تحسب P_max بالقيم العظمى والفعالة."],
      ["Handle a purely resistive load.", "تتعامل مع الحمل المقاومي البحت."]],
    items: [
      ["idea", { beats: [
        ["Any linear network, seen from the load, is a Thévenin equivalent: $V_{Th}$ with $Z_{Th}$. Which $Z_L$ gets the most average power?", "أي شبكة خطية، منظورًا إليها من الحمل، مكافئ ثيفنن: V_Th مع Z_Th. فأي Z_L يأخذ أقصى قدرة متوسطة؟"],
        ["The load must be the conjugate: $Z_L = Z_{Th}^@ast$. The two reactances then cancel, and the current is $V_{Th}/(2R_L)$.", "يجب أن يكون الحمل المرافق: Z_L = Z_Th*. عندها تلغي المفاعلتان بعضهما، ويصبح التيار V_Th/(2R_L)."],
        ["If the load can only be a resistor, the best value is $R_L = |Z_{Th}|$.", "وإذا كان الحمل مقاومة فقط فأفضل قيمة R_L = |Z_Th|."]] }],
      ["law", { label: "P_max", steps: [
        ["Z_L = Z_{Th}^{@ast} @Rightarrow I = @frac{V_{Th}}{2R_L}", "Same real part, opposite reactance: only resistance is left in the loop.", "الجزء الحقيقي نفسه والمفاعلة معاكسة، فلا يبقى في الحلقة إلا مقاومة."],
        ["P_{max} = @frac{|V_{Th}|^2}{4R_L} @quad (V_{Th} @text{ rms})", "$|I|^2R_L$ with rms values.", "|I|²R_L بالقيم الفعالة."],
        ["P_{max} = @frac{1}{8}@frac{V_m^2}{R_L} @quad (V_{Th} @text{ peak})", "With a peak value, one more factor of ½.", "مع القيمة العظمى يُضاف عامل ½ آخر."]] }],
      ["ex", { title: "Example 10.8", q: ["Find $Z_L$ for maximum average power and the maximum power: source $20@angle0@deg$ V, 5 Ω and 20 Ω, $j3$ Ω, $-j6$ Ω.", "مثال 10.8: أوجد Z_L لأقصى قدرة متوسطة وأقصى قدرة: مصدر 20∠0° V و 5 Ω و 20 Ω و j3 Ω و −j6 Ω."],
        steps: [
          ["16@angle0@deg V @text{ with } 4 @Omega + j3 @Omega, @quad -j6 @Omega @text{ across a, b}", "Two source transformations simplify the left side.", "تحويلا مصدر يبسّطان الجهة اليسرى."],
          ["V_{Th} = 16@angle0@deg @frac{-j6}{4 + j3 - j6} = 19.2@angle-53.13@deg V", "Open circuit: voltage division onto $-j6$ Ω.", "دائرة مفتوحة: قسمة جهد على −j6 Ω."],
          ["Z_{Th} = @frac{(4 + j3)(-j6)}{4 - j3} = 5.76 - j1.68 @Omega", "Switch off the source: the two impedances in parallel.", "نطفئ المصدر: الممانعتان على التوازي."],
          ["Z_L = Z_{Th}^{@ast} = 5.76 + j1.68 @Omega", "Conjugate: same real part, flip the sign of the imaginary part.", "المرافق: الجزء الحقيقي نفسه وإشارة التخيلي معكوسة."],
          ["P_{max} = @frac{1}{8}@frac{(19.2)^2}{5.76} = 8 W", "$V_{Th}$ here is a peak value, so the 1/8 form.", "V_Th هنا قيمة عظمى، فنستخدم صيغة 1/8."]] }],
      ["real", { beats: [
        ["Radio and antenna systems, at 50 Ω or 75 Ω, use matching networks of inductors and capacitors.", "أنظمة الراديو والهوائيات (50 Ω أو 75 Ω) تستخدم شبكات مواءمة من الملفات والمكثفات."],
        ["They make the load look like the conjugate of the source impedance, so the antenna gets the most power.", "فتجعل الحمل يبدو مرافقًا لممانعة المصدر، فيأخذ الهوائي أقصى قدرة."]] }],
      ["quiz", { i: 0, q: "$Z_{Th} = 6 + j8$ Ω. The load that receives maximum power is…", opts: ["$6 - j8$ Ω", "$6 + j8$ Ω", "10 Ω"],
        whys: ["The conjugate: $-j8$ cancels $+j8$.", "Equal would double the reactance to $j16$ and cut the current.", "$|Z_{Th}| = 10$ is best only if the load must be a pure resistor."],
        hints: [["The reactances should cancel.", "يجب أن تلغي المفاعلتان بعضهما."]] }],
      ["quiz", { i: 1, q: "$V_{Th} = 20$ V (peak) and $R_{Th} = 5$ Ω. The maximum power is…", opts: ["10 W", "20 W"],
        whys: ["$400/(8 @times 5) = 10$ W.", "You used $4R_{Th}$ with a peak value."],
        hints: [["Peak value: use 1/8.", "قيمة عظمى: استخدم 1/8."]] }],
      ["sum", { math: ["Z_L = Z_{Th}^{@ast}, @quad P_{max} = @frac{|V_{Th}|^2}{4R_L}"], beats: [
        ["Thévenin first, then conjugate the impedance.", "ثيفنن أولًا، ثم مرافق الممانعة."],
        ["rms: $|V_{Th}|^2/4R_L$; peak: $V_m^2/8R_L$.", "فعالة: |V_Th|²/4R_L، وعظمى: V_m²/8R_L."],
        ["A resistor-only load: $R_L = |Z_{Th}|$.", "حمل مقاومي فقط: R_L = |Z_Th|."]] }]
    ]
  });

  EX.add("c1-power-7", {
    chapter: CH,
    goals: [["Understand why the power factor of inductive loads is raised.", "تفهم لماذا يُرفع معامل القدرة للأحمال الحثية."],
      ["Compute the reactive power to be compensated.", "تحسب القدرة الردية المطلوب تعويضها."],
      ["Compute the capacitance of the parallel capacitor.", "تحسب سعة المكثف الموصل على التوازي."]],
    items: [
      ["idea", { fig: TRI(20, 10, "P", "Q", "|S|"), beats: [
        ["In an inductive circuit the current lags the voltage, so part of the supplied power is reactive, not useful: a low power factor.", "في الدائرة الحثية يتأخر التيار عن الجهد، فجزء من القدرة المعطاة ردي غير مفيد، ومعامل القدرة منخفض."],
        ["The fix: a capacitor in parallel with the load. It supplies a leading reactive current that cancels part of the inductor's lagging one.", "الحل: مكثف على التوازي مع الحمل يعطي تيارًا رديًا متقدمًا يلغي جزءًا من التيار الردي المتأخر للملف."],
        ["To correct to 1, the capacitor supplies all of the load's $Q$. Then $|S| = P$: the triangle flattens into a line.", "للتصحيح إلى 1 يعطي المكثف كل Q للحمل، فتصبح |S| = P وينطبق المثلث على خط."]] }],
      ["law", { label: "Sizing the capacitor", steps: [
        ["Q_C = -Q_L", "The capacitor's reactive power cancels the load's.", "القدرة الردية للمكثف تلغي قدرة الحمل."],
        ["X = @frac{|V_{eff}|^2}{Q}", "From $Q = |V|^2/X$: the reactance that gives that $Q$. $Q$ is negative, so $X$ comes out negative.", "من Q = |V|²/X نجد المفاعلة التي تعطي هذه Q. و Q سالبة فتخرج X سالبة."],
        ["X_C = -@frac{1}{@omega C} @Rightarrow C = -@frac{1}{@omega X}", "Then the capacitance.", "ثم السعة."]] }],
      ["ex", { title: "Example 10.6", fig: TRI(20, 10, "20 kW", "10 kVAR", "22.36 kVA"), q: ["Two loads in parallel at 250 V rms through a 0.05 Ω line. Load 1: 8 kW at 0.8 leading. Load 2: 20 kVA at 0.6 lagging. Find the overall pf, $|S|$ and the line loss, then correct the pf to 1 at 60 Hz.", "مثال 10.6: حملان على التوازي على 250 V rms عبر خط 0.05 Ω. الحمل 1: 8 kW بمعامل 0.8 متقدم. الحمل 2: 20 kVA بمعامل 0.6 متأخر. أوجد معامل القدرة الكلي و |S| ومفقود الخط، ثم صحّح المعامل إلى 1 عند 60 Hz."],
        steps: [
          ["S_1 = 8000 - j6000 @text{ VA}", "Load 1 is leading, so its $Q$ is negative: $8000 @tan 36.87@deg = 6000$.", "الحمل 1 متقدم فـ Q سالبة: 8000 tan 36.87° = 6000."],
          ["S_2 = 12000 + j16000 @text{ VA}", "Load 2: $P = 20000 @times 0.6$, $Q = 20000 @sin 53.13@deg$, positive since lagging.", "الحمل 2: P = 20000 × 0.6 و Q = 20000 sin 53.13° موجبة لأنه متأخر."],
          ["S = 20000 + j10000 @text{ VA}, @quad I_s = 89.44@angle-26.57@deg A", "Parallel loads: add the complex powers; $I^@ast = S/V$.", "الأحمال المتوازية: نجمع القدرات المركبة، و I* = S/V."],
          ["pf = 0.8944 @text{ lag}, @quad |S| = 22.36 @text{ kVA}, @quad P_{line} = 400 W", "Line loss $|I|^2R = (89.44)^2(0.05)$.", "مفقود الخط |I|²R = (89.44)²(0.05)."],
          ["X = @frac{250^2}{-10000} = -6.25 @Omega", "Correction needs $Q = -10$ kVAR from the capacitor.", "التصحيح يحتاج Q = −10 kVAR من المكثف."],
          ["C = -@frac{1}{(376.99)(-6.25)} = 424.4 @mu F", "$@omega = 2@pi(60) = 376.99$ rad/s.", "ω = 2π(60) = 376.99 rad/s."],
          ["|S| = P = 20 @text{ kVA}, @quad I = 80 A, @quad P_{line} = 320 W", "After correction the line current falls from 89.44 A to 80 A, and the loss from 400 W to 320 W.", "بعد التصحيح ينخفض تيار الخط من 89.44 A إلى 80 A، والمفقود من 400 W إلى 320 W."]] }],
      ["when", { beats: [
        ["A parallel capacitor changes neither the load's average power nor its voltage.", "المكثف على التوازي لا يغيّر القدرة المتوسطة للحمل ولا جهده."],
        ["The benefit is the smaller line current, so a smaller line loss $|I|^2R$.", "الفائدة تيار خط أصغر، فمفقود خط |I|²R أصغر."]] }],
      ["real", { beats: [
        ["Factories install capacitor banks in their main boards to raise the power factor above the utility's limit.", "المصانع تركّب مجموعات مكثفات في لوحاتها الرئيسية لرفع معامل القدرة فوق حد شركة الكهرباء."],
        ["That avoids fines and cuts cable losses.", "وهذا يجنّبها الغرامات ويقلل مفاقيد الكابلات."]] }],
      ["quiz", { i: 0, q: "After adding a correction capacitor in parallel, the load's average power…", opts: ["does not change", "increases", "decreases"],
        whys: ["Same voltage, so the load draws the same $P$; an ideal capacitor uses no average power.", "The capacitor adds no real power; it only reduces $Q$.", "$P$ stays; what falls is $|S|$ and the line current."],
        hints: [["Does the load's voltage change?", "هل يتغير جهد الحمل؟"]] }],
      ["quiz", { i: 1, q: "Why is the correction capacitor connected in parallel, not in series?", opts: ["So the load voltage stays the same", "A series capacitor would generate positive reactive power"],
        whys: ["In parallel the load stays at the source voltage.", "A capacitor gives negative $Q$ either way; in series it would change the load voltage."],
        hints: [["Think about what the load sees.", "فكّر فيما يراه الحمل."]] }],
      ["sum", { math: ["C = -@frac{1}{@omega X}, @quad X = @frac{|V|^2}{Q_C}"], beats: [
        ["Inductive loads waste line current on reactive power.", "الأحمال الحثية تهدر تيار الخط على القدرة الردية."],
        ["A parallel capacitor supplies that $Q$ locally.", "المكثف على التوازي يعطي هذه Q محليًا."],
        ["Same useful power, smaller current, smaller losses.", "القدرة المفيدة نفسها، وتيار أصغر، ومفاقيد أصغر."]] }]
    ]
  });
})();
