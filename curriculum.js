/* CircuitVision — course structure and platform status.
   Chapters and topics follow the department's official course descriptions
   for Circuits 1 and Circuits 2, in the same order.
   Each topic becomes a lesson. A lesson only counts toward progress when
   `published: true` (set when its content is written and tested). */
(function () {
  "use strict";

  /* Chapters whose lessons are written and tested. Add a chapter id here when its lesson file is done. */
  var PUBLISHED = { "c2-lc": true, "c2-coupled": true, "c2-first-order": true, "c2-rlc": true, "c2-three-phase": true, "c2-frequency": true, "c2-two-port": true, "ld-ch1": true, "ld-ch2": true, "ld-ch3": true, "ld-ch4": true, "ld-ch5": true, "ss-ch1": true, "ss-ch2": true, "ss-ch3": true, "ss-ch4": true, "ss-ch5": true, "ss-ch6": true, "ss-ch7": true, "c1-variables": true, "c1-elements": true, "c1-resistive": true, "c1-techniques": true, "c1-sinusoidal": true, "c1-power": true };

  function ch(id, ar, en, topics) {
    return {
      id: id, ar: ar, en: en,
      lessons: topics.map(function (t, i) { return { id: id + "-" + (i + 1), en: t, published: !!PUBLISHED[id] }; })
    };
  }

  var courses = [
    {
      id: "circuits-1",
      code: "Circuits 1",
      ar: "الدوائر الكهربائية 1",
      level: "تحليل دوائر DC، ثم تحليل التيار المتردد في الحالة المستقرة وحسابات القدرة",
      thumb: "dc", lab: "lab.html", labNote: "معمل الدوائر 1: 10 تجارب، والمعمل الحر",
      chapters: [
        ch("c1-variables", "متغيرات الدائرة", "Circuit Variables", [
          "Circuit Analysis: An Overview", "Voltage and Current", "The Ideal Basic Circuit Element", "Power and Energy"]),
        ch("c1-elements", "عناصر الدائرة", "Circuit Elements", [
          "Voltage and Current Sources", "Ohm’s Law", "Kirchhoff’s Laws", "Analysis of a Circuit Containing Dependent Sources"]),
        ch("c1-resistive", "دوائر المقاومات البسيطة", "Simple Resistive Circuits", [
          "Resistors in Series", "Resistors in Parallel", "The Voltage-Divider and Current-Divider Circuits",
          "Voltage Division and Current Division", "Delta-to-Wye (Pi-to-Tee) Equivalent Circuits"]),
        ch("c1-techniques", "طرق تحليل الدوائر", "Techniques of Circuit Analysis", [
          "Introduction to the Node-Voltage Method", "The Node-Voltage Method and Dependent Sources",
          "The Node-Voltage Method: Some Special Cases", "Introduction to the Mesh-Current Method",
          "The Mesh-Current Method and Dependent Sources", "The Mesh-Current Method: Some Special Cases",
          "The Node-Voltage Method Versus the Mesh-Current Method", "Source Transformations",
          "Thévenin and Norton Equivalents", "More on Deriving a Thévenin Equivalent",
          "Maximum Power Transfer", "Superposition"]),
        ch("c1-sinusoidal", "تحليل الحالة المستقرة الجيبية", "Sinusoidal Steady-State Analysis", [
          "The Sinusoidal Source", "The Phasor", "The Passive Circuit Elements in the Frequency Domain",
          "Kirchhoff’s Laws in the Frequency Domain", "Series, Parallel, and Delta-to-Wye Simplifications",
          "Source Transformations and Thévenin-Norton Equivalent Circuits", "The Node-Voltage Method",
          "The Mesh-Current Method", "Phasor Diagrams"]),
        ch("c1-power", "حسابات القدرة في الحالة المستقرة الجيبية", "Sinusoidal Steady-State Power Calculations", [
          "Instantaneous Power", "Average and Reactive Power", "The rms Value and Power Calculations",
          "Complex Power", "Power Calculations", "Maximum Power Transfer", "Power Factor Correction"])
      ]
    },
    {
      id: "circuits-2",
      code: "Circuits 2",
      ar: "الدوائر الكهربائية 2",
      level: "EE 2020 · من محاضرات المقرر: الملفات والمكثفات، المحولات، الاستجابة العابرة، ثلاثي الطور، الاستجابة الترددية، وشبكات المنفذين",
      thumb: "ac", lab: "lab2.html", labNote: "معمل EE 2020: 10 تجارب مع مقاطع شرح",
      chapters: [
        ch("c2-lc", "الملفات والمكثفات", "Inductance and Capacitance", [
          "The Inductor", "The Capacitor", "Series-Parallel Combinations of Inductance and Capacitance"]),
        ch("c2-coupled", "الملفات المقترنة مغناطيسيًا والمحولات", "Magnetically Coupled Coils and Ideal Transformers", [
          "Mutual Inductance and the Dot Convention", "Coupling Coefficient and Energy in Coupled Coils", "Linear Transformers", "Ideal Transformers"]),
        ch("c2-first-order", "استجابة دوائر RL و RC من الرتبة الأولى", "Response of First-Order RL and RC Circuits", [
          "The Natural Response of an RL Circuit", "The Natural Response of an RC Circuit",
          "The Step Response of an RL Circuit", "The Step Response of an RC Circuit and the General Solution"]),
        ch("c2-rlc", "الاستجابة الطبيعية والدرجية لدوائر RLC", "Natural and Step Responses of RLC Circuits", [
          "Introduction to the Natural Response of a Parallel RLC Circuit",
          "The Forms of the Natural Response of a Parallel RLC Circuit", "The Step Response of a Parallel RLC Circuit"]),
        ch("c2-three-phase", "الدوائر ثلاثية الطور", "Three-Phase Circuits", [
          "Balanced Three-Phase Voltages and Sources", "Analysis of the Wye-Wye Circuit", "Analysis of the Wye-Delta Circuit",
          "Power Calculations in Balanced Three-Phase Circuits", "Unbalanced Three-Phase Systems"]),
        ch("c2-frequency", "الاستجابة الترددية", "Frequency Response", [
          "Transfer Function and the Decibel Scale", "Bode Plots", "Series and Parallel Resonance", "Passive Filters"]),
        ch("c2-two-port", "شبكات المنفذين (Two-Port)", "Two-Port Networks", [
          "Two-Port Networks and Impedance (z) Parameters", "Admittance (y) Parameters", "Hybrid (h) Parameters", "Inverse Hybrid (g) Parameters"])
      ]
    },
    /* Courses with a place reserved on the platform. Their chapters are added only from the department's course
       description when the founder provides it, so nothing here is guessed. */
    {
      id: "logic-design", code: "Logic Design", ar: "التصميم المنطقي", group: "ld", thumb: "logic", lab: "logic.html", labNote: "معمل EE2111: 7 تجارب عملية مع جهاز IC Trainer",
      level: "EE 2111 · من محاضرات المقرر: الأعداد الثنائية، الجبر البولياني، خرائط كارنو، الدوائر التوافقية والتتابعية",
      chapters: [
        ch("ld-ch1", "الأنظمة الرقمية والأعداد الثنائية", "Digital Systems and Binary Numbers", [
          "Information Representation and Number Systems", "Decimal to Base-R Conversion, Octal and Hexadecimal", "Binary Arithmetic and Complements", "Signed Binary Numbers", "Binary Codes: BCD, Gray, ASCII and Parity"]),
        ch("ld-ch2", "الجبر البولياني والبوابات المنطقية", "Boolean Algebra and Logic Gates", [
          "Postulates and Basic Theorems of Boolean Algebra", "Boolean Functions: Truth Tables, Simplification and Complement", "Canonical Forms: Minterms and Maxterms", "Standard Forms and Digital Logic Gates"]),
        ch("ld-ch3", "تبسيط الدوال على مستوى البوابات", "Gate-Level Minimization", [
          "The Map Method: Two- and Three-Variable K-Maps", "Four-Variable K-Map and Prime Implicants", "Product-of-Sums Simplification and Don't-Care Conditions", "NAND and NOR Implementation", "Other Two-Level Implementations, Exclusive-OR and Parity"]),
        ch("ld-ch4", "الدوائر التوافقية", "Combinational Circuits", [
          "Combinational Circuits: Analysis and Design Procedure", "Half Adder and Full Adder", "Binary Adder, Carry Lookahead and Binary Subtractor", "Decimal (BCD) Adder, Binary Multiplier and Magnitude Comparator", "Decoders and Encoders", "Multiplexers, Demultiplexers and Three-State Gates"]),
        ch("ld-ch5", "المنطق التتابعي المتزامن", "Synchronous Sequential Logic", [
          "Sequential Circuits and Latches", "Flip-Flops: D, JK and T", "Analysis of Clocked Sequential Circuits", "Analysis with JK and T Flip-Flops", "State Reduction and Assignment", "Design Procedure of Synchronous Sequential Circuits"])
      ]
    },
    {
      id: "signals-systems", code: "Signals and Systems", ar: "تحليل الإشارات والنظم", group: "ss", thumb: "signals",
      level: "EE 3010 · من محاضرات المقرر: الإشارات والنظم، نظم LTI، فورييه، لابلاس، Z، وأخذ العيّنات",
      chapters: [
        ch("ss-ch1", "الإشارات والنظم", "Signals and Systems", [
          "Signals, Systems, CT and DT", "Periodic and Aperiodic Signals", "Energy and Power Signals", "Even and Odd Signals",
          "Transformations of the Independent Variable", "Complex Exponential and Sinusoidal Signals", "Unit Impulse and Unit Step",
          "Systems: Interconnections, Memory, Invertibility, Causality", "Stability, Time Invariance and Linearity"]),
        ch("ss-ch2", "نظم LTI", "Linear Time-Invariant (LTI) Systems", [
          "Impulse Response and the Convolution Sum", "Computing the Convolution Sum", "The Convolution Integral",
          "Properties of Convolution and of LTI Systems", "Step Response and Correlation", "Systems Described by Differential and Difference Equations"]),
        ch("ss-ch3", "متسلسلة فورييه", "Fourier Series Representation of Periodic Signals", [
          "LTI Response to Complex Exponentials and the CT Fourier Series", "Trigonometric Form, Dirichlet Conditions and Examples", "Discrete-Time Fourier Series"]),
        ch("ss-ch4", "تحويل فورييه", "Fourier Transform", [
          "The Continuous-Time Fourier Transform", "Fourier Transform of Periodic Signals", "The Discrete-Time Fourier Transform",
          "Properties: Linearity and Symmetry", "Properties: Shifts, Scaling, Parseval, Differentiation, Convolution", "Frequency Response of Systems Described by Differential and Difference Equations"]),
        ch("ss-ch5", "تحويل لابلاس", "Laplace Transform", [
          "The Laplace Transform and the Region of Convergence", "Poles, Zeros, ROC Properties and Common Pairs", "Properties of the Laplace Transform",
          "The Inverse Laplace Transform", "The System Function: Causality, Stability, LCCDE", "The Unilateral Laplace Transform and Transform Circuits"]),
        ch("ss-ch6", "تحويل Z", "Z-Transform", [
          "The Z-Transform and the Region of Convergence", "Properties of the Z-Transform", "Poles, Zeros, System Function and Stability", "The Inverse Z-Transform"]),
        ch("ss-ch7", "نظرية أخذ العيّنات", "Sampling Theorem", [
          "The Sampling Theorem", "Reconstruction: Zero-Order Hold and Interpolation", "Aliasing", "Discrete-Time Processing of Continuous-Time Signals", "Sampling of Discrete-Time Signals"])
      ]
    }
  ];
  /* Groups on the dashboard. */
  var groups = [
    { id: "core", ar: "مقررات الدوائر", note: "الفصول والمواضيع حسب توصيف المقررين في القسم. اضغط على أي فصل لعرض مواضيعه." },
    { id: "ld", ar: "التصميم المنطقي", note: "دروس EE 2111 من محاضرات المقرر، ولكل درس مقطع شرح وتمرين واختبار قصير، ومعه معمل الـ Trainer." },
    { id: "ss", ar: "تحليل الإشارات والنظم", note: "دروس EE 3010 من محاضرات المقرر، ولكل درس مقطع شرح وتمرين واختبار قصير." },
    { id: "next", ar: "مقررات قادمة", note: "مكانها محجوز في المنصة، والمحتوى يُبنى بعد إكمال مقررات الدوائر." }
  ];

  /* status: ok = built and tested · build = being built now · plan = later step */
  var modules = [
    { id: "home",       ar: "الرئيسية",               en: "Home",                    step: 1, status: "ok",    href: "index.html" },
    { id: "dashboard",  ar: "لوحة الطالب",            en: "Dashboard",               step: 1, status: "ok",    href: "dashboard.html" },
    { id: "courses",    ar: "المقررات والدروس",       en: "Courses",                 step: 2, status: "build", href: "lesson.html" },
    { id: "feedback",   ar: "التغذية الراجعة الذكية", en: "Smart Feedback",          step: 2, status: "ok" },
    { id: "generator",  ar: "مولّد التمارين",          en: "Circuit Generator",       step: 2, status: "ok",    href: "practice.html" },
    { id: "lab",        ar: "معمل الدوائر",           en: "Circuits Lab",       step: 3, status: "build", href: "lab.html" },
    { id: "bank",       ar: "بنك الأسئلة",            en: "Question Bank",           step: 4, status: "build", href: "bank.html" },
    { id: "tutor",      ar: "المعلم الذكي",           en: "AI Tutor",                step: 5, status: "build", href: "tutor.html" },
    { id: "challenges", ar: "التحديات الهندسية",      en: "Engineering Challenges",  step: 5, status: "build", href: "challenges.html" },
    { id: "academy",    ar: "أكاديمية المشاريع",      en: "Project Academy",         step: 6, status: "build", href: "academy.html" },
    { id: "club",       ar: "نادي Beyond Theory",     en: "Beyond Theory",           step: 6, status: "build", href: "club.html" },
    { id: "realworld",  ar: "الهندسة في الواقع",      en: "Real-World Engineering",  step: 6, status: "build", href: "realworld.html" },
    { id: "portfolio",  ar: "ملف الإنجاز",            en: "My Portfolio",            step: 6, status: "build", href: "portfolio.html" },
    { id: "notebook",   ar: "دفتر المهندس",           en: "Engineering Notebook",    step: 6, status: "build", href: "notebook.html" },
    { id: "logic",      ar: "معمل التصميم المنطقي",   en: "Logic Design Lab",        step: 6, status: "build", href: "logic.html" },
    { id: "lab2",       ar: "معمل الدوائر 2",         en: "Circuits 2 Lab",          step: 3, status: "build", href: "lab2.html" },
    { id: "matlab",     ar: "MATLAB",                 en: "MATLAB",                  step: 3, status: "build", href: "matlab.html" },
    { id: "whatsapp",   ar: "الدائرة المغلقة",         en: "Closed Loop",             step: 1, status: "ok",    href: "https://chat.whatsapp.com/HXS31WkWNVaFc2B2OfoF4u", external: true }
  ];

  var statusLabel = { ok: "متاح", build: "متاح جزئيًا", plan: "مخطط" };

  window.CV = window.CV || {};
  window.CV.courses = courses.filter(function (c) { return !c.planned; });
  window.CV.allCourses = courses;
  window.CV.courseGroups = groups;
  window.CV.modules = modules;
  window.CV.statusLabel = statusLabel;
  window.CV.currentStep = 2;
  window.CV.stepNote = "الدروس التفاعلية و Smart Feedback. مقرر Circuits 1 كامل (41 درسًا) مع مولّد التمارين، وأكاديمية المشاريع بستة مشاريع، والمعمل الذكي مع محاكي Arduino و40 تجربة موجّهة للدروس، وبنك الأسئلة، والتحديات، والمعلم الذكي، والنادي الطلابي (المعلم يحتاج مفتاح Gemini، والنادي يحتاج Supabase). ومقرر Circuits 2 (EE 2020): 23 درسًا من المحاضرات مع مقاطع الشرح، ومعمله بعشر تجارب (شبكات المنفذين النظرية قيد الإعداد).";
  /* English for every chapter and lesson title, from the curriculum itself (ch.en) and from the lessons (L.en), so the
     English and bilingual modes never show an Arabic title alone */
  (function () {
    var bi = window.CV.bi; if (!bi) return;
    var m = {};
    (window.CV.allCourses || []).forEach(function (c) { if (c.ar && c.en) m[c.ar] = c.en; c.chapters.forEach(function (ch) { if (ch.ar && ch.en) m[ch.ar] = ch.en; }); });
    m["EE 2020 · من محاضرات المقرر: الملفات والمكثفات، المحولات، الاستجابة العابرة، ثلاثي الطور، الاستجابة الترددية، وشبكات المنفذين"] = "EE 2020 · from the course lectures: inductors and capacitors, transformers, transient response, three-phase, frequency response, and two-port networks";
    m["اكتب اسمك كما تحب أن يظهر في لوحتك."] = "Write your name as you want it to appear on your dashboard.";
    bi.add(m);
    function lessons() { var o = {}, L = window.CV.lessons || {}; Object.keys(L).forEach(function (k) { if (L[k].ar && L[k].en) o[L[k].ar] = L[k].en; }); bi.add(o); if (bi.apply && document.body) bi.apply(document.body); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lessons); else setTimeout(lessons, 0);
  })();
})();
