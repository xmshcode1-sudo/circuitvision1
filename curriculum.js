/* CircuitVision — course structure and platform status.
   Chapters and topics follow the department's official course descriptions
   for Circuits 1 and Circuits 2, in the same order.
   Each topic becomes a lesson. A lesson only counts toward progress when
   `published: true` (set when its content is written and tested). */
(function () {
  "use strict";

  /* Chapters whose lessons are written and tested. Add a chapter id here when its lesson file is done. */
  var PUBLISHED = { "c1-variables": true, "c1-elements": true, "c1-resistive": true, "c1-techniques": true, "c1-sinusoidal": true, "c1-power": true };

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
      thumb: "dc",
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
      level: "الملفات والمكثفات، المحولات، الاستجابة العابرة، ثلاثي الطور، والاستجابة الترددية",
      thumb: "ac",
      chapters: [
        ch("c2-lc", "الملفات والمكثفات", "Inductance and Capacitance", [
          "The Inductor", "The Capacitor", "Series-Parallel Combinations of Inductance and Capacitance"]),
        ch("c2-coupled", "الملفات المقترنة مغناطيسيًا والمحولات المثالية", "Magnetically Coupled Coils and Ideal Transformers", [
          "Mutual Inductance", "A Model for Analyzing Mutually Coupled Coils", "Linear Transformers", "Ideal Transformers"]),
        ch("c2-first-order", "استجابة دوائر RL و RC من الرتبة الأولى", "Response of First-Order RL and RC Circuits", [
          "The Natural Response of an RL Circuit", "The Natural Response of an RC Circuit",
          "The Step Response of RL and RC Circuits", "A General Solution for Step and Natural Responses"]),
        ch("c2-rlc", "الاستجابة الطبيعية والدرجية لدوائر RLC", "Natural and Step Responses of RLC Circuits", [
          "Introduction to the Natural Response of a Parallel RLC Circuit",
          "The Forms of the Natural Response of a Parallel RLC Circuit",
          "The Step Response of a Parallel RLC Circuit", "The Natural and Step Response of a Series RLC Circuit"]),
        ch("c2-three-phase", "الدوائر ثلاثية الطور المتزنة", "Balanced Three-Phase Circuits", [
          "Balanced Three-Phase Voltages", "Three-Phase Voltage Sources", "Analysis of the Wye-Wye Circuit",
          "Analysis of the Wye-Delta Circuit", "Power Calculations in Balanced Three-Phase Circuits",
          "Measuring Average Power in Three-Phase Circuits"]),
        ch("c2-frequency", "الاستجابة الترددية", "Frequency Response", [
          "The Laplace Transform in Circuit Analysis", "Bode Plots", "Series and Parallel Resonance", "Passive Filters"]),
        ch("c2-two-port", "شبكات المنفذين", "Two-Port Networks", [
          "The Terminal Equations", "The Two-Port Parameters", "Analysis of the Terminated Two-Port Circuit",
          "Interconnected Two-Port Circuits"])
      ]
    }
  ];

  /* status: ok = built and tested · build = being built now · plan = later step */
  var modules = [
    { id: "home",       ar: "الرئيسية",               en: "Home",                    step: 1, status: "ok",    href: "index.html" },
    { id: "dashboard",  ar: "لوحة الطالب",            en: "Dashboard",               step: 1, status: "ok",    href: "dashboard.html" },
    { id: "courses",    ar: "المقررات والدروس",       en: "Courses",                 step: 2, status: "build", href: "lesson.html" },
    { id: "feedback",   ar: "التغذية الراجعة الذكية", en: "Smart Feedback",          step: 2, status: "ok" },
    { id: "generator",  ar: "مولّد التمارين",          en: "Circuit Generator",       step: 2, status: "ok",    href: "practice.html" },
    { id: "lab",        ar: "المعمل الذكي",           en: "Smart Virtual Lab",       step: 3, status: "build", href: "lab.html" },
    { id: "bank",       ar: "بنك الأسئلة",            en: "Question Bank",           step: 4, status: "build", href: "bank.html" },
    { id: "tutor",      ar: "المعلم الذكي",           en: "AI Tutor",                step: 5, status: "build", href: "tutor.html" },
    { id: "challenges", ar: "التحديات الهندسية",      en: "Engineering Challenges",  step: 5, status: "build", href: "challenges.html" },
    { id: "academy",    ar: "أكاديمية المشاريع",      en: "Project Academy",         step: 6, status: "build", href: "academy.html" },
    { id: "club",       ar: "نادي Beyond Theory",     en: "Beyond Theory",           step: 6, status: "build", href: "club.html" },
    { id: "realworld",  ar: "الهندسة في الواقع",      en: "Real-World Engineering",  step: 6, status: "build", href: "realworld.html" },
    { id: "portfolio",  ar: "ملف الإنجاز",            en: "My Portfolio",            step: 6, status: "build", href: "portfolio.html" },
    { id: "notebook",   ar: "دفتر المهندس",           en: "Engineering Notebook",    step: 6, status: "build", href: "notebook.html" }
  ];

  var statusLabel = { ok: "متاح", build: "متاح جزئيًا", plan: "مخطط" };

  window.CV = window.CV || {};
  window.CV.courses = courses;
  window.CV.modules = modules;
  window.CV.statusLabel = statusLabel;
  window.CV.currentStep = 2;
  window.CV.stepNote = "الدروس التفاعلية و Smart Feedback. مقرر Circuits 1 كامل (41 درسًا) مع مولّد التمارين، وأكاديمية المشاريع بستة مشاريع، والمعمل الذكي مع محاكي Arduino و40 تجربة موجّهة للدروس، وبنك الأسئلة، والتحديات، والمعلم الذكي، والنادي الطلابي (المعلم يحتاج مفتاح Gemini، والنادي يحتاج Supabase). Circuits 2 لم يُبنَ بعد.";
})();
