/* Circuits 1 · Chapter 5 — scripts of the animated lesson videos (explain.js). English on screen; the Arabic of each
   beat becomes the subtitle track. Content, figures and numbers follow the lessons (c1-sinusoidal.js). */
(function () {
  "use strict";
  var CH = "Chapter 5 · Sinusoidal Steady-State Analysis";
  var WAVE = { wave: { cycles: 2, marks: true, curves: [{ a: 1, ph: 60, c: "c2", label: "i(t)" }] } };

  EX.add("c1-sinusoidal-1", {
    chapter: CH,
    goals: [["Read the maximum value, the frequency and the phase angle from a sinusoidal function.", "تقرأ القيمة العظمى والتردد وزاوية الطور من الدالة الجيبية."],
      ["Convert between $@omega$, $f$ and the period $T$.", "تحوّل بين ω و f والدور T."],
      ["Compute the effective (rms) value.", "تحسب القيمة الفعالة (rms)."]],
    items: [
      ["idea", { label: "Why sinusoids?", beats: [
        ["We now study circuits driven by sources that vary sinusoidally with time.", "ندرس الآن دوائر تغذيها مصادر تتغير جيبيًا مع الزمن."],
        ["Electric energy is generated, transmitted, distributed and used in sinusoidal steady state, and it simplifies the design of electrical systems.", "الطاقة الكهربائية تُولَّد وتُنقل وتُوزَّع وتُستهلك في الحالة الجيبية المستقرة، وهي تبسّط تصميم الأنظمة الكهربائية."],
        ["The good news: every analysis technique from the earlier chapters works here too.", "والخبر الجيد أن كل طرق التحليل من الفصول السابقة تعمل هنا أيضًا."]] }],
      ["idea", { label: "Reading a sinusoid", fig: WAVE, beats: [
        ["We always write it with the cosine: $v = V_m @cos(@omega t + @phi)$.", "نكتبها دائمًا بدالة جيب التمام: v = V_m cos(ωt + φ)."],
        ["$V_m$ is the maximum value, the height of the peaks.", "V_m هي القيمة العظمى، أي ارتفاع القمم."],
        ["$T$ is the period, one full cycle in seconds; $f = 1/T$ is the frequency in hertz, cycles per second.", "T هو الدور، زمن دورة كاملة بالثواني، و f = 1/T هو التردد بالهرتز، أي دورات في الثانية."],
        ["$@omega = 2@pi f$ is the angular frequency in rad/s, and $@phi$ is the phase angle: it shifts the wave left or right.", "ω = 2πf هو التردد الزاوي بالراديان/ثانية، و φ زاوية الطور التي تزيح الموجة يمينًا أو يسارًا."]] }],
      ["law", { label: "The rms value", steps: [
        ["V_{rms} = @sqrt{@frac{1}{T}@int_0^T V_m^2 @cos^2(@omega t + @phi) dt}", "The rms value is the square root of the mean of the squared function over one period. It matters most in power calculations.", "القيمة الفعالة هي الجذر التربيعي لمتوسط مربع الدالة خلال دور واحد، وأهميتها الكبرى في حسابات القدرة."],
        ["@frac{1}{T}@int_0^T @cos^2(@omega t + @phi) dt = @frac{1}{2}", "Over a whole period the average of $@cos^2$ is one half, whatever the frequency or the phase.", "على دور كامل متوسط cos² يساوي النصف، مهما كان التردد أو الطور."],
        ["V_{rms} = @frac{V_m}{@sqrt{2}}", "So the rms value depends only on the maximum value.", "إذن القيمة الفعالة تعتمد على القيمة العظمى فقط."]] }],
      ["when", { beats: [
        ["$@omega t$ is in radians and $@phi$ in degrees: watch your calculator's mode.", "ωt بالراديان و φ بالدرجات: انتبه لوضع الآلة الحاسبة."],
        ["If the value at $t = 0$ is given, it fixes $@phi$: $v(0) = V_m @cos @phi$.", "إذا أُعطيت القيمة عند t = 0 فهي تحدد φ: v(0) = V_m cos φ."],
        ["The voltage written on appliances, 220 V, is an rms value, not a maximum.", "الجهد المكتوب على الأجهزة، 220 V، قيمة فعالة وليس قيمة عظمى."]] }],
      ["ex", { title: "Example 9.1", fig: WAVE, q: ["A sinusoidal current has a maximum of 20 A, completes a cycle in 1 ms, and is 10 A at $t = 0$. Find $f$, $@omega$, $i(t)$ and its rms value.", "مثال 9.1: تيار جيبي قيمته العظمى 20 A، ويكمل دورة في 1 ms، وقيمته 10 A عند t = 0. أوجد f و ω و i(t) والقيمة الفعالة."],
        given: ["I_m = 20 A", "T = 1 ms", "i(0) = 10 A"], find: "f, @quad @omega, @quad i(t), @quad I_{rms}",
        steps: [
          ["f = @frac{1}{T} = @frac{1}{10^{-3}} = 1000 Hz", "One cycle per millisecond is a thousand cycles per second.", "دورة كل ملي ثانية تعني ألف دورة في الثانية."],
          ["@omega = 2@pi f = 2000@pi @text{ rad/s}", "One cycle is $2@pi$ radians.", "الدورة الواحدة 2π راديان."],
          ["i(0) = 20 @cos @phi = 10 @Rightarrow @phi = 60@deg", "At $t = 0$ the cosine's argument is just $@phi$.", "عند t = 0 تصبح زاوية جيب التمام φ فقط."],
          ["i(t) = 20 @cos(2000@pi t + 60@deg) A", "Put the three pieces together.", "نجمع الأجزاء الثلاثة."],
          ["I_{rms} = @frac{20}{@sqrt{2}} = 14.14 A", "Divide the maximum by $@sqrt{2}$.", "نقسم القيمة العظمى على √2."]],
        check: [["The rms value, 14.14 A, is smaller than the 20 A peak, as it must be.", "القيمة الفعالة 14.14 A أصغر من القمة 20 A كما يجب."]] }],
      ["real", { beats: [
        ["The Saudi power grid runs at 60 Hz.", "شبكة الكهرباء في السعودية تعمل بتردد 60 Hz."],
        ["A home outlet is 220 V rms, so its peak is $220 @times @sqrt{2} @approx 311$ V.", "مقبس البيت 220 V قيمة فعالة، فقمته 220 × √2 ≈ 311 V."]] }],
      ["quiz", { i: 0, q: "$v(t) = 100 @cos(500t + 20@deg)$. The angular frequency is…", opts: ["500 rad/s", "500 Hz", "20°"],
        whys: ["The factor in front of $t$.", "500 is $@omega$ in rad/s; $f = 500/2@pi @approx 79.6$ Hz.", "20° is the phase angle."],
        hints: [["Compare with $V_m @cos(@omega t + @phi)$.", "قارن مع V_m cos(ωt + φ)."]] }],
      ["quiz", { i: 1, q: "The rms value of a voltage whose maximum is 100 V is…", opts: ["70.7 V", "141.4 V", "50 V"],
        whys: ["$100/@sqrt{2}$.", "You multiplied by $@sqrt{2}$ instead of dividing.", "You divided by 2; divide by $@sqrt{2}$."],
        hints: [["rms is smaller than the peak, but more than half of it.", "القيمة الفعالة أصغر من القمة، لكنها أكبر من نصفها."]] }],
      ["sum", { math: ["v = V_m @cos(@omega t + @phi), @quad @omega = 2@pi f, @quad V_{rms} = @frac{V_m}{@sqrt{2}}"], beats: [
        ["A sinusoid is set by three numbers: $V_m$, $@omega$ and $@phi$.", "الدالة الجيبية تحددها ثلاثة أرقام: V_m و ω و φ."],
        ["$f = 1/T$ and $@omega = 2@pi f$.", "f = 1/T و ω = 2πf."],
        ["The rms value is $V_m/@sqrt{2}$, and it is what appliances are labelled with.", "القيمة الفعالة V_m/√2، وهي المكتوبة على الأجهزة."]] }]
    ]
  });

  EX.add("c1-sinusoidal-2", {
    chapter: CH,
    goals: [["Convert a sinusoidal function to a phasor and back.", "تحوّل الدالة الجيبية إلى فيزور والعكس."],
      ["Convert a phasor between the polar and rectangular forms.", "تحوّل الفيزور بين الصيغة القطبية والمستطيلة."],
      ["Add two sinusoids by adding their phasors.", "تجمع دالتين جيبيتين بجمع فيزوريهما."]],
    items: [
      ["law", { label: "From a sinusoid to a phasor", steps: [
        ["e^{@pm j@theta} = @cos@theta @pm j@sin@theta", "Euler's identity links cosine to a complex exponential. This is the root of the phasor.", "متطابقة أويلر تربط جيب التمام بأسّ مركب، وهي أساس الفيزور."],
        ["v = V_m @cos(@omega t + @phi) = @Re@{V_m e^{j@phi} e^{j@omega t}@}", "So a cosine is the real part of a rotating complex number.", "إذن جيب التمام هو الجزء الحقيقي لعدد مركب دوّار."],
        ["@mk{V = V_m e^{j@phi} = V_m @angle @phi}", "Every function in the circuit shares the same $e^{j@omega t}$, so we drop it and keep only amplitude and angle: that is the phasor.", "كل دوال الدائرة تشترك في e^{jωt} نفسها، فنحذفها ونبقي المقدار والزاوية فقط: هذا هو الفيزور."]] }],
      ["idea", { label: "Polar and rectangular", fig: { phasor: { vecs: [[5, 53.13, "Z = 3 + j4 = 5∠53.13°", "c2"]], max: 5.5 } }, beats: [
        ["A phasor is a point in the complex plane, the frequency domain: the response there depends on $@omega$.", "الفيزور نقطة في المستوى المركب، وهو المجال الترددي لأن الاستجابة فيه تعتمد على ω."],
        ["Rectangular form $a + jb$; polar form $r@angle@theta$, with $r = @sqrt{a^2 + b^2}$ and $@theta = @tan^{-1}(b/a)$.", "الصيغة المستطيلة a + jb، والقطبية r∠θ، حيث r = √(a² + b²) و θ = tan⁻¹(b/a)."],
        ["Back the other way: $a = r@cos@theta$, $b = r@sin@theta$. Add and subtract in rectangular form; multiply and divide in polar.", "وبالعكس: a = r cos θ و b = r sin θ. نجمع ونطرح بالصيغة المستطيلة، ونضرب ونقسم بالقطبية."]] }],
      ["when", { beats: [
        ["Convert to cosine before taking the phasor: $@sin@theta = @cos(@theta - 90@deg)$.", "حوّل إلى جيب التمام قبل أخذ الفيزور: sin θ = cos(θ − 90°)."],
        ["The phasor does not carry $@omega$: it is the same for every function in the circuit.", "الفيزور لا يحمل ω، فهو نفسه لكل دوال الدائرة."]] }],
      ["ex", { title: "Example 9.5", fig: { phasor: { vecs: [[20, -30, "Y₁", "c1"], [40, 60, "Y₂", "c3"], [44.72, 33.43, "Y", "c2"]], max: 46 } }, q: ["$y_1 = 20@cos(@omega t - 30@deg)$ and $y_2 = 40@cos(@omega t + 60@deg)$. Write $y = y_1 + y_2$ as one sinusoid, using phasors.", "مثال 9.5: إذا كانت y₁ = 20 cos(ωt − 30°) و y₂ = 40 cos(ωt + 60°)، فاكتب y = y₁ + y₂ كدالة جيبية واحدة باستخدام الفيزورات."],
        steps: [
          ["Y = Y_1 + Y_2 = 20@angle-30@deg + 40@angle60@deg", "Same $@omega$, so the sum of the functions is the sum of the phasors.", "التردد نفسه، فمجموع الدوال هو مجموع الفيزورات."],
          ["20@angle-30@deg = 17.32 - j10", "To add, go to rectangular form: $20@cos(-30@deg)$ and $20@sin(-30@deg)$.", "للجمع ننتقل للصيغة المستطيلة: 20 cos(−30°) و 20 sin(−30°)."],
          ["40@angle60@deg = 20 + j34.64", "The same for the second phasor.", "والشيء نفسه للفيزور الثاني."],
          ["Y = 37.32 + j24.64 = 44.72@angle33.43@deg", "Add real parts and imaginary parts, then back to polar.", "نجمع الأجزاء الحقيقية والتخيلية، ثم نعود للصيغة القطبية."],
          ["y = 44.72 @cos(@omega t + 33.43@deg)", "The inverse transform: amplitude and angle back into a cosine.", "التحويل العكسي: المقدار والزاوية في دالة جيب تمام."]],
        check: [["44.72 is less than 20 + 40 = 60: the two waves are not in step, so their peaks don't simply add.", "44.72 أقل من 20 + 40 = 60، لأن الموجتين غير متوافقتين في الطور فلا تُجمع قممهما ببساطة."]] }],
      ["ex", { title: "Assessment 9.1, 9.2", q: ["Find the phasor of each function, then turn a phasor back into a time function.", "أوجد فيزور كل دالة، ثم حوّل فيزورًا إلى دالة زمنية."],
        steps: [
          ["v = 170@cos(377t - 40@deg) V @to V = 170@angle-40@deg V", "Already a cosine: read the amplitude and angle.", "الدالة جيب تمام أصلًا: نقرأ المقدار والزاوية."],
          ["i = 10@sin(1000t + 20@deg) = 10@cos(1000t - 70@deg) @to I = 10@angle-70@deg A", "A sine first becomes a cosine by subtracting 90°.", "الجيب يتحول أولًا إلى جيب تمام بطرح 90°."],
          ["V = 18.6@angle-54@deg V @to v = 18.6@cos(@omega t - 54@deg) V", "Back to time: put the amplitude and angle into a cosine.", "العودة للزمن: نضع المقدار والزاوية في جيب تمام."]] }],
      ["real", { beats: [
        ["Scientific calculators have a complex mode, CMPLX, that converts between polar and rectangular directly.", "الآلات الحاسبة العلمية فيها وضع الأعداد المركبة CMPLX الذي يحوّل بين القطبية والمستطيلة مباشرة."],
        ["It is the fastest way to add phasors in an exam.", "وهو أسرع طريقة لجمع الفيزورات في الاختبار."]] }],
      ["quiz", { i: 0, q: "The phasor of $i(t) = 5@cos(@omega t - 45@deg)$ is…", opts: ["$5@angle-45@deg$", "$5@angle45@deg$", "$5@angle(@omega - 45@deg)$"],
        whys: ["Read the amplitude and the angle directly.", "The angle is −45°.", "A phasor does not carry $@omega$: the frequency is known and shared."],
        hints: [["Keep the amplitude and the angle, drop the time.", "احتفظ بالمقدار والزاوية واحذف الزمن."]] }],
      ["sum", { math: ["V_m@cos(@omega t + @phi) @Leftrightarrow V_m@angle@phi"], beats: [
        ["A phasor keeps amplitude and angle; $@omega$ is shared and dropped.", "الفيزور يحتفظ بالمقدار والزاوية، و ω مشتركة فتُحذف."],
        ["Write sines as cosines first.", "اكتب الجيب جيب تمام أولًا."],
        ["Add in rectangular form, multiply and divide in polar form.", "اجمع بالصيغة المستطيلة، واضرب واقسم بالقطبية."]] }]
    ]
  });

  EX.add("c1-sinusoidal-3", {
    chapter: CH,
    goals: [["Compute the impedance of a resistor, an inductor and a capacitor.", "تحسب ممانعة المقاومة والملف والمكثف."],
      ["Know the phase relation between voltage and current in each element.", "تعرف علاقة الطور بين الجهد والتيار في كل عنصر."],
      ["Apply Ohm's law with phasors.", "تطبّق قانون أوم بالفيزورات."]],
    items: [
      ["law", { label: "Each element in the frequency domain", steps: [
        ["V = RI", "Resistor: Ohm's law carries straight over. Voltage and current are in phase.", "المقاومة: قانون أوم ينتقل كما هو، والجهد والتيار متوافقان في الطور."],
        ["v = L@frac{di}{dt} @Rightarrow V = j@omega L I", "Inductor: differentiating $e^{j@omega t}$ multiplies by $j@omega$.", "الملف: اشتقاق e^{jωt} يضرب في jω."],
        ["V = @omega L I_m @angle(@theta_i + 90@deg)", "$j$ is a 90° turn: in an inductor the voltage leads the current by 90°.", "j دوران 90°: في الملف يسبق الجهد التيار بـ 90°."],
        ["i = C@frac{dv}{dt} @Rightarrow V = @frac{I}{j@omega C}", "Capacitor: the same step the other way round. The voltage lags the current by 90°.", "المكثف: الخطوة نفسها بالعكس، فيتأخر الجهد عن التيار بـ 90°."],
        ["V = ZI", "In every case: the impedance $Z$. Its imaginary part is the reactance: $X_L = @omega L$, $X_C = -1/@omega C$.", "في كل حالة: الممانعة Z، وجزؤها التخيلي هو المفاعلة: X_L = ωL و X_C = −1/ωC."]] }],
      ["idea", { label: "The summary table", table: [["Element", "Impedance Z", "Admittance Y", "V vs I"], ["R", "$R$", "$1/R$", "in phase"], ["L", "$j@omega L$", "$1/(j@omega L)$", "V leads by 90°"], ["C", "$1/(j@omega C)$", "$j@omega C$", "V lags by 90°"]], beats: [
        ["Before the analysis, turn every inductor into $j@omega L$ and every capacitor into $-j/(@omega C)$, using the source's $@omega$.", "قبل التحليل حوّل كل ملف إلى jωL وكل مكثف إلى −j/(ωC) باستخدام ω المصدر."],
        ["Watch the units, mH and µF. Reactance changes with frequency; resistance does not.", "انتبه للوحدات mH و µF. المفاعلة تتغير مع التردد، والمقاومة لا تتغير."]] }],
      ["ex", { title: "Assessment 9.3", q: ["A 20 mH inductor carries $10@cos(10000t + 30@deg)$ mA. Find the reactance, the impedance, the voltage phasor and $v(t)$.", "تقييم 9.3: ملف 20 mH يمر فيه 10 cos(10000t + 30°) mA. أوجد المفاعلة والممانعة وفيزور الجهد و v(t)."],
        steps: [
          ["X_L = @omega L = (10^4)(20 @times 10^{-3}) = 200 @Omega", "Read $@omega = 10^4$ rad/s from the current, and use henries.", "نقرأ ω = 10⁴ rad/s من التيار، ونستخدم الهنري."],
          ["Z_L = j200 @Omega", "The impedance is $j$ times the reactance.", "الممانعة j ضرب المفاعلة."],
          ["V_L = IZ_L = (10@angle30@deg)(200@angle90@deg) @times 10^{-3} = 2@angle120@deg V", "Ohm's law in polar form: multiply magnitudes, add angles; the mA gives $10^{-3}$.", "قانون أوم بالصيغة القطبية: نضرب المقادير ونجمع الزوايا، والملي أمبير يعطي 10⁻³."],
          ["v_L = 2@cos(10000t + 120@deg) V", "Back to time: 90° ahead of the current, as an inductor should be.", "العودة للزمن: متقدم 90° على التيار كما يجب في الملف."]] }],
      ["ex", { title: "Assessment 9.4", q: ["A 5 µF capacitor has $30@cos(4000t + 25@deg)$ V across it. Find the reactance, the impedance, the current phasor and $i(t)$.", "تقييم 9.4: مكثف 5 µF عليه 30 cos(4000t + 25°) V. أوجد المفاعلة والممانعة وفيزور التيار و i(t)."],
        steps: [
          ["X_C = -@frac{1}{@omega C} = -@frac{1}{4000 @times 5 @times 10^{-6}} = -50 @Omega", "Use farads: 5 µF is $5 @times 10^{-6}$ F.", "نستخدم الفاراد: 5 µF = 5 × 10⁻⁶ F."],
          ["Z_C = -j50 @Omega", "A capacitor's impedance has a negative imaginary part.", "ممانعة المكثف جزؤها التخيلي سالب."],
          ["I = @frac{V}{Z_C} = @frac{30@angle25@deg}{50@angle-90@deg} = 0.6@angle115@deg A", "Divide in polar form: divide magnitudes, subtract angles.", "نقسم بالصيغة القطبية: نقسم المقادير ونطرح الزوايا."],
          ["i = 0.6@cos(4000t + 115@deg) A", "The current leads the voltage by 90°, as in a capacitor.", "التيار يسبق الجهد بـ 90° كما في المكثف."]] }],
      ["real", { beats: [
        ["A capacitor passes high frequencies easily, with a small reactance; an inductor blocks them.", "المكثف يمرر الترددات العالية بسهولة لأن مفاعلته صغيرة، والملف يعيقها."],
        ["That is why loudspeakers use a capacitor to send the high frequencies to the small speaker, the tweeter.", "ولهذا تستخدم السماعات مكثفًا لتوجيه الترددات العالية إلى السماعة الصغيرة (tweeter)."]] }],
      ["quiz", { i: 0, q: "In an inductor, the voltage relative to the current…", opts: ["leads by 90°", "lags by 90°", "is in phase"],
        whys: ["$V = j@omega L I$, and $j = 1@angle90@deg$.", "That is the capacitor.", "That is the resistor."],
        hints: [["Multiplying by $j$ adds 90°.", "الضرب في j يضيف 90°."]] }],
      ["quiz", { i: 1, q: "The impedance of a 10 µF capacitor at $@omega = 1000$ rad/s is…", opts: ["−j100 Ω", "+j100 Ω", "−j0.01 Ω"],
        whys: ["$1/(1000 @times 10^{-5}) = 100$.", "A capacitor's impedance has a negative imaginary part.", "That is $@omega C$; the impedance is its reciprocal."],
        hints: [["$Z_C = -j/(@omega C)$, with C in farads.", "Z_C = −j/(ωC) و C بالفاراد."]] }],
      ["sum", { math: ["Z_R = R, @quad Z_L = j@omega L, @quad Z_C = @frac{-j}{@omega C}"], beats: [
        ["Resistor: in phase. Inductor: voltage leads by 90°. Capacitor: voltage lags by 90°.", "المقاومة: متوافق. الملف: الجهد يسبق بـ 90°. المكثف: الجهد يتأخر بـ 90°."],
        ["Ohm's law becomes $V = ZI$ for every element.", "قانون أوم يصبح V = ZI لكل عنصر."],
        ["Reactance depends on $@omega$: compute it with the source's frequency.", "المفاعلة تعتمد على ω، فاحسبها بتردد المصدر."]] }]
    ]
  });

  EX.add("c1-sinusoidal-4", {
    chapter: CH,
    goals: [["Apply KCL and KVL to phasors.", "تطبّق KCL و KVL على الفيزورات."],
      ["Understand why magnitudes are not added directly.", "تفهم لماذا لا تُجمع المقادير مباشرة."]],
    items: [
      ["law", { label: "KVL with phasors", steps: [
        ["v_1 + v_2 + @ldots + v_n = 0", "KVL around a closed path in sinusoidal steady state.", "KVL حول مسار مغلق في الحالة الجيبية المستقرة."],
        ["V_{m1}@cos(@omega t + @theta_1) + @ldots + V_{mn}@cos(@omega t + @theta_n) = 0", "Every term is a cosine at the same $@omega$.", "كل حد جيب تمام بالتردد ω نفسه."],
        ["V_1 + V_2 + @ldots + V_n = 0", "Since $@omega$ is shared, the phasors themselves add to zero. KCL works the same way: $@Sigma I = 0$ at any node.", "ولأن ω مشتركة، فالفيزورات نفسها مجموعها صفر. و KCL بالطريقة نفسها: ΣI = 0 عند أي عقدة."],
        ["Z_{ab} = Z_1 + Z_2 + @ldots + Z_n", "Impedances in series carry one current, so they add, just like resistors.", "الممانعات على التوالي يمر فيها تيار واحد، فتُجمع كالمقاومات."]] }],
      ["mistake", { beats: [
        ["Add phasors as complex numbers, never their magnitudes.", "اجمع الفيزورات كأعداد مركبة، ولا تجمع مقاديرها أبدًا."],
        ["The voltage magnitudes around a loop usually add up to more than the source, because their angles differ.", "مقادير الجهود حول الحلقة غالبًا مجموعها أكبر من المصدر، لأن زواياها مختلفة."]] }],
      ["ex", { title: "Example 9.6", fig: 0, q: ["90 Ω, 32 mH and 5 µF in series with $v_s = 750@cos(5000t + 30@deg)$ V. Draw the frequency-domain circuit and find $i$.", "مثال 9.6: مقاومة 90 Ω وملف 32 mH ومكثف 5 µF على التوالي مع vₛ = 750 cos(5000t + 30°) V. ارسم الدائرة في المجال الترددي وأوجد i."],
        steps: [
          ["Z_L = j(5000)(32 @times 10^{-3}) = j160 @Omega", "Read $@omega = 5000$ rad/s from the source.", "نقرأ ω = 5000 rad/s من المصدر."],
          ["Z_C = @frac{-j}{(5000)(5 @times 10^{-6})} = -j40 @Omega, @quad V_s = 750@angle30@deg V", "The capacitor's impedance and the source phasor complete the frequency-domain circuit.", "ممانعة المكثف وفيزور المصدر يكملان الدائرة في المجال الترددي."],
          ["Z_{ab} = 90 + j160 - j40 = 90 + j120 = 150@angle53.13@deg @Omega", "Series impedances add as complex numbers.", "الممانعات على التوالي تُجمع كأعداد مركبة."],
          ["I = @frac{750@angle30@deg}{150@angle53.13@deg} = 5@angle-23.13@deg A", "Ohm's law: divide in polar form.", "قانون أوم: نقسم بالصيغة القطبية."],
          ["i = 5@cos(5000t - 23.13@deg) A", "Back to the time domain.", "نعود للمجال الزمني."]],
        check: [["The current lags the source by 53.13°: the circuit is inductive overall, since $j160$ beats $-j40$.", "التيار يتأخر عن المصدر بـ 53.13°: الدائرة حثية في مجملها لأن j160 أكبر من −j40."]] }],
      ["real", { beats: [
        ["Measure the voltages of an AC circuit with a voltmeter and their sum can exceed the source voltage.", "إذا قست جهود دائرة متردد بالفولتميتر فقد يكون مجموعها أكبر من جهد المصدر."],
        ["The meter reads magnitudes only, while KVL holds for the complex phasors.", "لأن المقياس يقرأ المقادير فقط، بينما KVL ينطبق على الفيزورات المركبة."]] }],
      ["quiz", { i: 0, q: "Two currents enter a node: $3@angle0@deg$ and $4@angle90@deg$. The current leaving is…", opts: ["$5@angle53.13@deg$", "$7@angle45@deg$"],
        whys: ["$3 + j4$.", "You added the magnitudes."],
        hints: [["Write both in rectangular form first.", "اكتب الاثنين بالصيغة المستطيلة أولًا."]] }],
      ["sum", { math: ["@Sigma V = 0, @quad @Sigma I = 0"], beats: [
        ["KVL and KCL hold for phasors as complex numbers.", "KVL و KCL ينطبقان على الفيزورات كأعداد مركبة."],
        ["Series impedances add.", "الممانعات على التوالي تُجمع."],
        ["Magnitudes alone don't obey KVL: the angles matter.", "المقادير وحدها لا تحقق KVL، فالزوايا مهمة."]] }]
    ]
  });

  EX.add("c1-sinusoidal-5", {
    chapter: CH,
    goals: [["Combine impedances in series and in parallel.", "تجمع الممانعات على التوالي والتوازي."],
      ["Apply the Δ-Y conversion to impedances.", "تطبّق تحويل Δ-Y على الممانعات."],
      ["Compute the equivalent impedance of a network.", "تحسب الممانعة المكافئة لشبكة."]],
    items: [
      ["law", { label: "Same rules, complex numbers", steps: [
        ["@frac{1}{Z_{ab}} = @frac{1}{Z_1} + @frac{1}{Z_2} + @ldots + @frac{1}{Z_n}", "Every simplification rule from chapter 3 works with impedances. In parallel, reciprocals add.", "كل قواعد التبسيط من الفصل 3 تعمل مع الممانعات. على التوازي تُجمع المقلوبات."],
        ["Z_{ab} = @frac{Z_1 Z_2}{Z_1 + Z_2}", "Two in parallel: product over sum, with complex arithmetic.", "اثنتان على التوازي: الضرب على المجموع، بحساب مركب."],
        ["Y = @frac{1}{Z} = G + jB", "The admittance: its real part is the conductance, its imaginary part the susceptance, in siemens.", "المسامحة (admittance): جزؤها الحقيقي الموصلية، والتخيلي المطاوعة (susceptance)، بالسيمنز."],
        ["Y_{ab} = Y_1 + Y_2 + @ldots + Y_n", "With many parallel branches, adding admittances is easier.", "مع فروع كثيرة على التوازي، جمع المسامحات أسهل."]] }],
      ["ex", { title: "Example 9.7", fig: 0, q: ["$i_s = 8@cos 200000t$ A feeds three parallel branches: 10 Ω, (6 Ω with 40 µH), and 1 µF. Find $v$, $i_1$, $i_2$ and $i_3$.", "مثال 9.7: مصدر iₛ = 8 cos 200000t A يغذي ثلاثة فروع على التوازي: 10 Ω، و (6 Ω مع 40 µH)، و 1 µF. أوجد v و i₁ و i₂ و i₃."],
        steps: [
          ["Z_L = j(200000)(40 @times 10^{-6}) = j8 @Omega, @quad Z_C = -j5 @Omega", "Frequency-domain impedances with $@omega = 200000$ rad/s.", "الممانعات في المجال الترددي مع ω = 200000 rad/s."],
          ["Y_1 = 0.1, @quad Y_2 = @frac{1}{6 + j8} = 0.06 - j0.08, @quad Y_3 = j0.2 S", "Three parallel branches: admittances are the easy route.", "ثلاثة فروع على التوازي: المسامحات أسهل طريق."],
          ["Y = 0.16 + j0.12 = 0.2@angle36.87@deg S @Rightarrow Z = 5@angle-36.87@deg @Omega", "Add them, then flip.", "نجمعها ثم نقلب الناتج."],
          ["V = ZI = (5@angle-36.87@deg)(8@angle0@deg) = 40@angle-36.87@deg V", "One voltage across all three branches.", "جهد واحد على الفروع الثلاثة."],
          ["I_1 = 4@angle-36.87@deg, @quad I_2 = 4@angle-90@deg, @quad I_3 = 8@angle53.13@deg A", "Each branch current is $VY_k$.", "تيار كل فرع VY_k."],
          ["v = 40@cos(200000t - 36.87@deg) V, @quad i_3 = 8@cos(200000t + 53.13@deg) A", "Back to the time domain.", "نعود للمجال الزمني."]],
        check: [["$I_3$ alone is 8 A, as big as the source: the currents cancel partly because their angles differ.", "التيار I₃ وحده 8 A بحجم المصدر: التيارات يلغي بعضها بعضًا جزئيًا لأن زواياها مختلفة."]] }],
      ["ex", { title: "Example 9.8", q: ["Use a Δ-to-Y transformation to find $I_o$ from a $120@angle0@deg$ V source.", "مثال 9.8: استخدم تحويل Δ إلى Y لإيجاد Iₒ من مصدر 120∠0° V."],
        steps: [
          ["10 + (20 + j60) + (-j20) = 30 + j40 @Omega", "The delta b-c-d: 10 Ω, 20 + j60 Ω and −j20 Ω. Their sum is the common denominator.", "الدلتا b-c-d: 10 Ω و 20 + j60 Ω و −j20 Ω، ومجموعها المقام المشترك."],
          ["Z_1 = @frac{(20 + j60)(10)}{30 + j40} = 12 + j4 @Omega", "At b: the product of the two neighbouring impedances over the sum.", "عند b: ضرب الممانعتين المجاورتين على المجموع."],
          ["Z_2 = -3.2 - j2.4 @Omega, @quad Z_3 = 8 - j24 @Omega", "The same pattern at c and d. A negative real part is fine on paper.", "النمط نفسه عند c و d، والجزء الحقيقي السالب مقبول حسابيًا."],
          ["@text{abn}: -j4 + 12 + j4 = 12 @Omega, @quad @text{acn}: 63.2 + j2.4 - 3.2 - j2.4 = 60 @Omega", "Each path from the source now has series parts to add.", "كل مسار من المصدر الآن فيه أجزاء على التوالي تُجمع."],
          ["Z = 12 @par 60 + 8 - j24 = 18 - j24 @Omega", "The two paths are in parallel, then in series with $Z_3$.", "المساران على التوازي، ثم على التوالي مع Z₃."],
          ["I_o = @frac{120@angle0@deg}{18 - j24} = 4@angle53.13@deg A", "Ohm's law with the source.", "قانون أوم مع المصدر."]] }],
      ["real", { beats: [
        ["Three-phase networks connect their loads in Δ or Y.", "شبكات الأطوار الثلاثة توصل أحمالها على شكل Δ أو Y."],
        ["Converting between them with impedances is the basis of their analysis in Circuits 2.", "والتحويل بينهما بالممانعات أساس تحليلها في Circuits 2."]] }],
      ["quiz", { i: 0, q: "Impedances $3 + j4$ and $3 - j4$ in series:", opts: ["6 Ω", "10 Ω"],
        whys: ["The imaginary parts cancel.", "You added the magnitudes, 5 + 5."],
        hints: [["Add real parts and imaginary parts separately.", "اجمع الأجزاء الحقيقية والتخيلية كلًا على حدة."]] }],
      ["sum", { math: ["Z_{series} = @Sigma Z, @quad Y_{par} = @Sigma Y"], beats: [
        ["Series impedances add; parallel admittances add.", "الممانعات على التوالي تُجمع، والمسامحات على التوازي تُجمع."],
        ["Two in parallel: product over sum.", "اثنتان على التوازي: الضرب على المجموع."],
        ["Δ-Y works as before, with complex multiplication and division.", "تحويل Δ-Y يعمل كما سبق، بضرب وقسمة مركبين."]] }]
    ]
  });

  EX.add("c1-sinusoidal-6", {
    chapter: CH,
    goals: [["Apply source transformations with phasors.", "تطبّق تحويل المصادر بالفيزورات."],
      ["Find $V_{Th}$ and $Z_{Th}$ of an AC network.", "تحسب V_Th و Z_Th لشبكة تيار متردد."],
      ["Find the Norton current $I_N$.", "تحسب تيار نورتن I_N."]],
    items: [
      ["law", { label: "Chapter 4, with impedances", steps: [
        ["V_s = Z_s I_s, @quad I_s = @frac{V_s}{Z_s}", "A voltage source $V_s$ in series with $Z_s$ is equivalent to a current source $I_s$ in parallel with the same $Z_s$.", "مصدر جهد V_s على التوالي مع Z_s يكافئ مصدر تيار I_s على التوازي مع Z_s نفسها."],
        ["Z_{Th} = @frac{V_{Th}}{I_{sc}}", "Any linear AC circuit, seen from a and b, is a source $V_{Th}$ with an impedance $Z_{Th}$, found by the same methods as before.", "أي دائرة تيار متردد خطية، منظورًا إليها من a و b، هي مصدر V_Th مع ممانعة Z_Th، نجدهما بالطرق السابقة نفسها."],
        ["I_N = I_{sc}, @quad Z_N = Z_{Th}", "Norton: a current source in parallel with the same impedance. With dependent sources, use $I_{sc}$ or a test source.", "نورتن: مصدر تيار على التوازي مع الممانعة نفسها. ومع المصادر التابعة نستخدم I_sc أو مصدر اختبار."]] }],
      ["ex", { title: "Example 9.9", q: ["Use source transformations to find the phasor $V_o$; the source is $40@angle0@deg$ V.", "مثال 9.9: استخدم تحويلات المصادر لإيجاد الفيزور Vₒ، والمصدر 40∠0° V."],
        steps: [
          ["I = @frac{40}{1 + j3} = 4 - j12 A @quad @text{in parallel with } (1 + j3) @Omega", "The source with its series $1 + j3$ Ω becomes a current source.", "المصدر مع (1 + j3) Ω على التوالي يصبح مصدر تيار."],
          ["Z = @frac{(1 + j3)(9 - j3)}{10} = 1.8 + j2.4 @Omega", "Now two branches are in parallel: product over sum.", "الآن فرعان على التوازي: الضرب على المجموع."],
          ["(4 - j12)(1.8 + j2.4) = 36 - j12 V", "Back to a voltage source, in series with $1.8 + j2.4$ Ω, then with $0.2 + j0.6$ Ω: $2 + j3$ Ω in all.", "نرجعه مصدر جهد على التوالي مع 1.8 + j2.4 Ω، ثم مع 0.2 + j0.6 Ω، فالمجموع 2 + j3 Ω."],
          ["V_o = @frac{(36 - j12)(10 - j19)}{12 - j16} = 36.12 - j18.84 V", "Voltage division onto the output branch, $10 - j19$ Ω.", "قسمة الجهد على فرع الخرج 10 − j19 Ω."]] }],
      ["ex", { title: "Example 9.10", q: ["Find the Thévenin equivalent at a and b: a 120∠0° V source, 12 Ω, 60 Ω, −j40 Ω, 120 Ω and a dependent source $10V_x$.", "مثال 9.10: أوجد مكافئ ثيفنن عند a و b: مصدر 120∠0° V و 12 Ω و 60 Ω و −j40 Ω و 120 Ω ومصدر تابع 10Vₓ."],
        steps: [
          ["120 V, 12 @Omega @to 10 A; @quad 12 @par 60 = 10 @Omega @to 100 V, 10 @Omega", "Simplify the left side first by transformations.", "نبسّط الجهة اليسرى أولًا بالتحويلات."],
          ["100 = 10I - j40I + 120I + 10V_x, @quad V_x = 100 - 10I", "KVL around the loop, and the dependent source's constraint.", "KVL حول الحلقة، وقيد المصدر التابع."],
          ["I = @frac{-900}{30 - j40} = 18@angle-126.87@deg A", "Substitute $V_x$ and solve for $I$.", "نعوّض Vₓ ونحل لـ I."],
          ["V_x = 208 + j144 V, @quad V_{Th} = 10V_x + 120I = 835.22@angle-20.17@deg V", "The open-circuit voltage at a and b.", "جهد الدائرة المفتوحة عند a و b."],
          ["Z_{Th} = @frac{V_T}{I_T} = 91.2 - j38.4 @Omega", "With a dependent source: switch off the 120 V and apply a test source.", "مع المصدر التابع: نطفئ 120 V ونطبّق مصدر اختبار."]] }],
      ["real", { beats: [
        ["To study a fault in a power network, engineers replace everything behind the fault point by a Thévenin equivalent.", "لدراسة عطل في شبكة الكهرباء يستبدل المهندسون كل ما خلف نقطة العطل بمكافئ ثيفنن."],
        ["From it they compute the short-circuit current there, and choose the breakers.", "ومنه يحسبون تيار القصر في تلك النقطة ويختارون القواطع."]] }],
      ["quiz", { i: 0, q: "$V_{Th} = 10@angle0@deg$ and $Z_{Th} = 2@angle-30@deg$. The Norton current is…", opts: ["$5@angle30@deg$ A", "$5@angle-30@deg$ A"],
        whys: ["Divide the magnitudes, subtract the angles.", "When dividing, subtract the denominator's angle: $0 - (-30) = +30$."],
        hints: [["$I_N = V_{Th}/Z_{Th}$ in polar form.", "I_N = V_Th/Z_Th بالصيغة القطبية."]] }],
      ["sum", { math: ["V_s = Z_s I_s, @quad Z_{Th} = @frac{V_{Th}}{I_{sc}}"], beats: [
        ["Source transformations and Thévenin work exactly as in chapter 4.", "تحويل المصادر وثيفنن يعملان تمامًا كما في الفصل 4."],
        ["Resistances become impedances, and the arithmetic is complex.", "المقاومات تصبح ممانعات، والحساب مركب."],
        ["With dependent sources: $I_{sc}$ or a test source.", "مع المصادر التابعة: I_sc أو مصدر اختبار."]] }]
    ]
  });

  EX.add("c1-sinusoidal-7", {
    chapter: CH,
    goals: [["Write node equations with impedances.", "تكتب معادلات العقد بالممانعات."],
      ["Solve a system of complex equations.", "تحل نظام معادلات مركبة."],
      ["Find branch currents from the node voltages.", "تحسب تيارات الفروع من جهود العقد."]],
    items: [
      ["idea", { math: ["@Sigma @frac{V_k - V_j}{Z} = 0"], beats: [
        ["The node-voltage method in the frequency domain is the same: choose a reference and write KCL at each essential node.", "طريقة جهود العقد في المجال الترددي هي نفسها: نختار مرجعًا ونكتب KCL عند كل عقدة أساسية."],
        ["Each current is this node's phasor minus the other end's, over the impedance between them.", "كل تيار هو فيزور هذه العقدة ناقص فيزور الطرف الآخر، على الممانعة بينهما."],
        ["Transform the circuit first, solve the complex equations with the calculator in CMPLX mode, then check with KCL.", "حوّل الدائرة أولًا، وحل المعادلات المركبة بالآلة الحاسبة في وضع CMPLX، ثم تحقق بـ KCL."]] }],
      ["ex", { title: "Example 9.11", q: ["Find $I_a$, $I_b$ and $I_c$: a $10.6@angle0@deg$ A source, 10 Ω, $1 + j2$ Ω, $-j5$ Ω, 5 Ω and a dependent source $20I_x$.", "مثال 9.11: أوجد Iₐ و I_b و I_c: مصدر 10.6∠0° A و 10 Ω و 1 + j2 Ω و −j5 Ω و 5 Ω ومصدر تابع 20Iₓ."],
        steps: [
          ["-10.6 + @frac{V_1}{10} + @frac{V_1 - V_2}{1 + j2} = 0", "Node 1: the source enters, two currents leave.", "العقدة 1: المصدر يدخل وتياران يخرجان."],
          ["@frac{V_2 - V_1}{1 + j2} + @frac{V_2}{-j5} + @frac{V_2 - 20I_x}{5} = 0", "Node 2, with the dependent source in its branch.", "العقدة 2 مع المصدر التابع في فرعه."],
          ["I_x = @frac{V_1 - V_2}{1 + j2} @Rightarrow -5V_1 + (4.8 + j0.6)V_2 = 0", "The constraint, written in node voltages and substituted.", "القيد مكتوبًا بجهود العقد ومعوّضًا."],
          ["V_1 = 68.40 - j16.80 V, @quad V_2 = 68 - j26 V", "Solve the two complex equations.", "نحل المعادلتين المركبتين."],
          ["I_a = 6.84 - j1.68, @quad I_b = -1.44 - j11.92, @quad I_c = 5.2 + j13.6 A", "Each branch current from its node voltages.", "كل تيار فرع من جهود عقده."]],
        check: [["$I_a + I_x = 10.6$ A: KCL at node 1 holds.", "Iₐ + Iₓ = 10.6 A: معادلة KCL عند العقدة 1 متحققة."]] }],
      ["real", { beats: [
        ["Power-network programs, called load flow, solve phasor node equations for thousands of nodes at once.", "برامج تحليل شبكات القوى (load flow) تحل معادلات العقد بالفيزورات لآلاف العقد معًا."],
        ["It is the same method as this lesson.", "وهي الطريقة نفسها التي في هذا الدرس."]] }],
      ["quiz", { i: 0, q: "The admittance of an inductor whose impedance is $j4$ Ω is…", opts: ["$-j0.25$ S", "$j0.25$ S"],
        whys: ["$1/(j4) = -j/4$.", "$1/j = -j$."],
        hints: [["Multiply top and bottom by $-j$.", "اضرب البسط والمقام في −j."]] }],
      ["sum", { beats: [
        ["Transform the circuit, then write KCL with phasors and impedances.", "حوّل الدائرة ثم اكتب KCL بالفيزورات والممانعات."],
        ["Dependent sources add a constraint in node voltages.", "المصادر التابعة تضيف قيدًا بجهود العقد."],
        ["Solve in complex form and check with KCL.", "حلّ بالصيغة المركبة وتحقق بـ KCL."]] }]
    ]
  });

  EX.add("c1-sinusoidal-8", {
    chapter: CH,
    goals: [["Write KVL for each mesh with impedances.", "تكتب KVL لكل حلقة بالممانعات."],
      ["Solve the complex equations.", "تحل المعادلات المركبة."],
      ["Find the current in a shared branch.", "تحسب تيار الفرع المشترك."]],
    items: [
      ["idea", { math: ["@Sigma Z I = @Sigma V_s"], beats: [
        ["The mesh method in the frequency domain: one clockwise current per mesh, KVL with impedances.", "طريقة الحلقات في المجال الترددي: تيار مع عقارب الساعة لكل حلقة، و KVL بالممانعات."],
        ["A dependent source adds a constraint in mesh currents, such as $I_x = I_1 - I_2$.", "المصدر التابع يضيف قيدًا بتيارات الحلقات مثل Iₓ = I₁ − I₂."],
        ["Then each voltage follows from $V = ZI$; check by adding the voltages around a loop.", "ثم يأتي كل جهد من V = ZI، ونتحقق بجمع الجهود حول حلقة."]] }],
      ["ex", { title: "Example 9.12", q: ["Use the mesh-current method to find $V_1$, $V_2$ and $V_3$; the source is $150@angle0@deg$ V and the dependent source is $39I_x$.", "مثال 9.12: استخدم طريقة تيارات الحلقات لإيجاد V₁ و V₂ و V₃، والمصدر 150∠0° V والمصدر التابع 39Iₓ."],
        steps: [
          ["150 = (1 + j2)I_1 + (12 - j16)(I_1 - I_2)", "Mesh 1: the shared impedance carries $I_1 - I_2$.", "الحلقة 1: الممانعة المشتركة يمر فيها I₁ − I₂."],
          ["0 = (12 - j16)(I_2 - I_1) + (1 + j3)I_2 + 39I_x", "Mesh 2, with the dependent source.", "الحلقة 2 مع المصدر التابع."],
          ["I_x = I_1 - I_2 @Rightarrow 0 = (27 + j16)I_1 - (26 + j13)I_2", "The constraint, substituted and arranged.", "نعوّض القيد ونرتّب."],
          ["I_1 = -26 - j52 A, @quad I_2 = -24 - j58 A, @quad I_x = -2 + j6 A", "Solve the two complex equations.", "نحل المعادلتين المركبتين."],
          ["V_1 = 78 - j104, @quad V_2 = 72 + j104, @quad V_3 = 150 - j130 V", "Each voltage is $V = ZI$ on its element.", "كل جهد V = ZI على عنصره."]],
        check: [["$-150 + V_1 + V_2 = -150 + 78 - j104 + 72 + j104 = 0$: KVL holds.", "−150 + V₁ + V₂ = 0: معادلة KVL متحققة."]] }],
      ["real", { beats: [
        ["Designers of filters and audio equipment compute mesh currents at each frequency.", "مصممو المرشحات وأجهزة الصوت يحسبون تيارات الحلقات عند كل تردد."],
        ["That shows how the response changes with frequency.", "وهذا يبيّن كيف تتغير الاستجابة مع التردد."]] }],
      ["quiz", { i: 0, q: "The branch shared by two meshes holds an inductor $j5$. Its term in mesh 1's equation is…", opts: ["$j5(I_1 - I_2)$", "$j5 I_1$"],
        whys: ["The shared branch current, in the direction of $I_1$, is $I_1 - I_2$.", "The branch is shared."],
        hints: [["Two mesh currents pass through it.", "يمر فيه تيارا حلقتين."]] }],
      ["sum", { beats: [
        ["One clockwise phasor current per mesh; KVL with impedances.", "تيار فيزوري مع عقارب الساعة لكل حلقة، و KVL بالممانعات."],
        ["Shared branches carry the difference of two mesh currents.", "الفروع المشتركة يمر فيها فرق تيارين."],
        ["$V = ZI$ for each element, and KVL to check.", "V = ZI لكل عنصر، و KVL للتحقق."]] }]
    ]
  });

  EX.add("c1-sinusoidal-9", {
    chapter: CH,
    goals: [["Draw phasors as arrows in the complex plane.", "ترسم الفيزورات كأسهم في المستوى المركب."],
      ["Tell from the diagram whether a circuit is inductive or capacitive.", "تعرف من المخطط هل الدائرة حثية أم سعوية."],
      ["Check KVL geometrically.", "تتحقق من KVL هندسيًا."]],
    items: [
      ["idea", { fig: { phasor: { vecs: [[100, 0, "V", "w"], [60, -53.13, "V_R", "c1"], [80, 36.87, "V_L", "c3", [36, -48]], [16, -53.13, "I", "c2", null, true, "tip"]], max: 105 } }, beats: [
        ["A phasor diagram draws each phasor as an arrow from the origin: its length is the magnitude, its angle the phase.", "المخطط الفيزوري يرسم كل فيزور سهمًا من نقطة الأصل: طوله المقدار وزاويته الطور."],
        ["In a series RL circuit, $V_R$ is in phase with the current, and $V_L$ leads it by 90°.", "في دائرة RL على التوالي يكون V_R متوافقًا مع التيار، و V_L يسبقه بـ 90°."],
        ["Placed head to tail, $V_R$ and $V_L$ add up to the source $V$: that is KVL, seen as geometry.", "إذا وضعنا V_R و V_L رأسًا إلى ذيل كان مجموعهما المصدر V: هذا هو KVL هندسيًا."]] }],
      ["ex", { title: "Series RL", fig: { phasor: { vecs: [[100, 0, "V", "w"], [60, -53.13, "V_R", "c1"], [80, 36.87, "V_L", "c3", [36, -48]]], max: 105 } }, q: ["Series RL: $V = 100@angle0@deg$ V, $R = 6$ Ω, $X_L = 8$ Ω. Find the current and the two voltages, and read the diagram.", "دائرة RL على التوالي: V = 100∠0° V و R = 6 Ω و X_L = 8 Ω. أوجد التيار والجهدين واقرأ المخطط."],
        steps: [
          ["I = @frac{100}{6 + j8} = 10@angle-53.13@deg A", "Series impedance $6 + j8 = 10@angle53.13@deg$ Ω.", "الممانعة على التوالي 6 + j8 = 10∠53.13° Ω."],
          ["V_R = 60@angle-53.13@deg V", "The resistor's voltage is in phase with the current.", "جهد المقاومة متوافق مع التيار."],
          ["V_L = 80@angle36.87@deg V", "The inductor's voltage is 90° ahead of the current.", "جهد الملف متقدم 90° على التيار."],
          ["@text{current lags the source by } 53.13@deg @Rightarrow @text{inductive}", "The current arrow points below the source arrow: an inductive circuit.", "سهم التيار تحت سهم المصدر: الدائرة حثية."]],
        check: [["$60^2 + 80^2 = 100^2$: the two voltages form a right triangle whose hypotenuse is the source.", "60² + 80² = 100²: الجهدان يكوّنان مثلثًا قائمًا وتره المصدر."]] }],
      ["when", { beats: [
        ["Use a phasor diagram to check a solution: do the arrows point the way they should?", "استخدم المخطط الفيزوري للتحقق من الحل: هل تشير الأسهم إلى حيث يجب؟"],
        ["You will need it again for power-factor correction in the next chapter.", "وستحتاجه مرة أخرى في تصحيح معامل القدرة في الفصل القادم."]] }],
      ["real", { beats: [
        ["Power-quality analyzers in factories show a live phasor diagram of the three voltages and currents.", "محللات جودة الكهرباء في المصانع تعرض مخططًا فيزوريًا حيًا للجهود والتيارات الثلاثة."],
        ["The engineer sees at once whether the load is inductive and needs correction capacitors.", "فيرى المهندس فورًا هل الحمل حثي ويحتاج مكثفات تصحيح."]] }],
      ["quiz", { i: 0, q: "In a phasor diagram the current leads the source voltage by 30°. The circuit is…", opts: ["capacitive", "inductive"],
        whys: ["The current leads in capacitive circuits.", "In inductive circuits the current lags."],
        hints: [["Which element makes the current lead?", "أي عنصر يجعل التيار يسبق؟"]] }],
      ["sum", { beats: [
        ["Each phasor is an arrow: length is magnitude, angle is phase.", "كل فيزور سهم: طوله المقدار وزاويته الطور."],
        ["Current lagging the voltage: inductive. Leading: capacitive.", "تيار متأخر عن الجهد: حثي، ومتقدم: سعوي."],
        ["Head-to-tail arrows show KVL at a glance.", "الأسهم رأسًا لذيل تُظهر KVL بنظرة."]] }]
    ]
  });
})();
