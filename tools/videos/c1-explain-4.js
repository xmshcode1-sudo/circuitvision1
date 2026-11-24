/* Circuits 1 · Chapter 4 — scripts of the animated lesson videos (explain.js). English on screen; the Arabic of each
   beat becomes the subtitle track. Content, figures and numbers follow the lessons (c1-techniques.js). */
(function () {
  "use strict";
  var CH = "Chapter 4 · Techniques of Circuit Analysis";

  EX.add("c1-techniques-1", {
    chapter: CH,
    goals: [["Choose a reference node and name the node voltages.", "تختار العقدة المرجعية وتسمّي جهود العقد."],
      ["Write a KCL equation at each node in terms of the node voltages.", "تكتب معادلة KCL عند كل عقدة بدلالة جهود العقد."],
      ["Solve the equations, then find any current from the node voltages.", "تحل المعادلات ثم تحسب أي تيار من جهود العقد."]],
    items: [
      ["idea", { label: "The method in three steps", chain: ["1 · Choose a reference node and ground it", "2 · At each other node: currents leaving add to zero", "3 · Solve for the node voltages"], beats: [
        ["The node-voltage method finds every unknown node voltage in three steps.", "طريقة جهود العقد تجد كل جهود العقد المجهولة في ثلاث خطوات."],
        ["We work with essential nodes, where three or more elements meet. With $n$ essential nodes we need $n - 1$ equations: the reference is known, 0 V.", "نعمل بالعقد الأساسية التي يلتقي فيها ثلاثة عناصر أو أكثر. مع n عقدة أساسية نحتاج n − 1 معادلة، لأن المرجع معروف وجهده صفر."],
        ["We usually choose the bottom node as reference, because it connects the most branches.", "نختار عادة العقدة السفلية مرجعًا لأنها تتصل بأكثر الفروع."]] }],
      ["idea", { label: "Writing a current with node voltages", fig: 0, beats: [
        ["A node voltage is the voltage rise from the reference to that node. Here two essential nodes are unknown: $v_1$ and $v_2$.", "جهد العقدة هو الارتفاع في الجهد من المرجع إلى العقدة. هنا عقدتان أساسيتان مجهولتان: v₁ و v₂."],
        ["The current leaving node 1 through the 1 Ω resistor toward the 10 V source is the drop across it over its value: $(v_1 - 10)/1$.", "التيار الخارج من العقدة 1 عبر المقاومة 1 Ω نحو مصدر 10 V هو الهبوط عليها مقسومًا على قيمتها: (v₁ − 10)/1.", { hi: "R1" }],
        ["The rule for every resistor: this node's voltage minus the other end's, over $R$.", "القاعدة لكل مقاومة: جهد هذه العقدة ناقص جهد الطرف الآخر، على R."]] }],
      ["ex", { title: "Fig. 4.5", fig: 0, q: ["Find $v_1$ and $v_2$.", "الشكل 4.5: أوجد v₁ و v₂."],
        steps: [
          ["@frac{v_1 - 10}{1} + @frac{v_1}{5} + @frac{v_1 - v_2}{2} = 0", "Node 1: three currents leave it, through 1 Ω, 5 Ω and 2 Ω. Their sum is zero.", "العقدة 1: ثلاثة تيارات تخرج منها عبر 1 Ω و 5 Ω و 2 Ω، ومجموعها صفر."],
          ["@frac{v_2 - v_1}{2} + @frac{v_2}{10} - 2 = 0", "Node 2: two currents leave through resistors; the 2 A source enters, so it is written with a minus sign.", "العقدة 2: تياران يخرجان عبر المقاومتين، ومصدر 2 A يدخل فيُكتب بإشارة سالبة."],
          ["v_1 = @frac{100}{11} = 9.09 V, @quad v_2 = @frac{120}{11} = 10.91 V", "Two linear equations in two unknowns: solve them together.", "معادلتان خطيتان في مجهولين نحلهما معًا."]],
        check: [["The 2 A source pushes current into node 2, so $v_2$ comes out higher than $v_1$: it does.", "مصدر 2 A يدفع تيارًا إلى العقدة 2، فنتوقع v₂ أعلى من v₁، وهذا ما حصل."]] }],
      ["ex", { title: "Example 4.2", fig: 1, q: ["(a) Find $i_a$, $i_b$ and $i_c$. (b) Find the power of each source.", "مثال 4.2: (أ) أوجد iₐ و i_b و i_c. (ب) أوجد قدرة كل مصدر."],
        pick: ["There is only one non-reference essential node, so one KCL equation is enough.", "هناك عقدة أساسية واحدة غير مرجعية، فتكفي معادلة KCL واحدة."],
        steps: [
          ["@frac{v_1 - 50}{5} + @frac{v_1}{10} + @frac{v_1}{40} - 3 = 0", "Currents leaving node 1 through the three resistors; the 3 A enters.", "التيارات الخارجة من العقدة 1 عبر المقاومات الثلاث، والـ 3 A يدخل."],
          ["v_1 = 40 V", "Multiply through by 40 and solve: $8v_1 + 4v_1 + v_1 = 400 + 120$.", "نضرب في 40 ونحل: 8v₁ + 4v₁ + v₁ = 400 + 120."],
          ["i_a = @frac{50 - 40}{5} = 2 A, @quad i_b = @frac{40}{10} = 4 A, @quad i_c = @frac{40}{40} = 1 A", "Every branch current now follows from Ohm's law.", "كل تيار فرع يأتي الآن من قانون أوم."],
          ["p_{50V} = -50 i_a = -100 W, @quad p_{3A} = -3 v_1 = -120 W", "Both powers are negative: both sources deliver.", "القدرتان سالبتان: المصدران يعطيان القدرة."]],
        check: [["The resistors absorb $20 + 160 + 40 = 220$ W, and the sources deliver $100 + 120 = 220$ W.", "المقاومات تمتص 20 + 160 + 40 = 220 W، والمصادر تعطي 100 + 120 = 220 W."]] }],
      ["ex", { title: "Problem 4.6", fig: 2, q: ["Use the node-voltage method to find $v_o$.", "مسألة 4.6: استخدم طريقة جهود العقد لإيجاد vₒ."],
        steps: [
          ["@frac{v_1 - 24}{20 + 80} + @frac{v_1}{25} + 0.04 = 0", "20 Ω and 80 Ω are in series with the source, so they form one 100 Ω branch.", "المقاومتان 20 Ω و 80 Ω على التوالي مع المصدر، فتكوّنان فرعًا واحدًا 100 Ω."],
          ["v_1 @left(@frac{1}{100} + @frac{1}{25}@right) = @frac{24}{100} - 0.04", "Collect the $v_1$ terms on one side.", "نجمع حدود v₁ في طرف واحد."],
          ["0.05 v_1 = 0.2 @Rightarrow v_o = v_1 = 4 V", "Divide, and $v_o$ is that node voltage.", "نقسم، و vₒ هو جهد هذه العقدة."]] }],
      ["when", { beats: [
        ["The method suits circuits with fewer nodes than meshes, or with current sources.", "تناسب الطريقة الدوائر التي عقدها أقل من حلقاتها، أو التي فيها مصادر تيار."],
        ["Write every current as leaving the node; a current source entering the node gets a minus sign.", "اكتب كل تيار خارجًا من العقدة، ومصدر التيار الداخل إليها يأخذ إشارة سالبة."]] }],
      ["real", { beats: [
        ["Circuit simulators such as SPICE use this same method.", "برامج محاكاة الدوائر مثل SPICE تستخدم الطريقة نفسها."],
        ["They write one KCL equation per node and solve them all at once as a matrix.", "تكتب معادلة KCL لكل عقدة وتحلها كلها معًا كمصفوفة."]] }],
      ["quiz", { i: 0, q: "A circuit has 5 nodes and no voltage sources. How many node equations do we need?", opts: ["4", "5", "the number of branches"],
        whys: ["Number of nodes − 1: the reference voltage is zero.", "The reference node's voltage is known (zero), so it needs no equation.", "Branches count for the branch method, not for node voltages."],
        hints: [["One node is the reference.", "إحدى العقد هي المرجع."]] }],
      ["quiz", { i: 1, q: "The current in resistor $R$ leaving node $v_1$ toward node $v_2$ is…", opts: ["$(v_1 - v_2)/R$", "$(v_2 - v_1)/R$", "$v_1/R$"],
        whys: ["This node's voltage minus the other's, over $R$.", "That is the current entering $v_1$.", "Only if $v_2$ is the reference (zero)."],
        hints: [["Current leaving goes from this node to the other.", "التيار الخارج يتجه من هذه العقدة إلى الأخرى."]] }],
      ["sum", { math: ["@Sigma i_{out} = 0, @quad i = @frac{v_{node} - v_{other}}{R}"], beats: [
        ["Choose a reference; name the other essential nodes.", "اختر مرجعًا وسمِّ العقد الأساسية الأخرى."],
        ["At each node: the currents leaving add to zero, each written as (this node − other end) / R.", "عند كل عقدة: مجموع التيارات الخارجة صفر، وكل تيار (هذه العقدة − الطرف الآخر) / R."],
        ["Solve, then get every current from Ohm's law.", "حلّ، ثم احسب كل تيار من قانون أوم."]] }]
    ]
  });

  EX.add("c1-techniques-2", {
    chapter: CH,
    goals: [["Express the controlling quantity in terms of the node voltages.", "تعبّر عن الكمية المتحكِّمة بدلالة جهود العقد."],
      ["Write node equations that include a dependent source.", "تكتب معادلات العقد مع المصدر التابع."],
      ["Solve the system and check the result.", "تحل النظام وتتحقق من النتيجة."]],
    items: [
      ["idea", { fig: 0, beats: [
        ["With a dependent source we write the node equations as usual.", "مع المصدر التابع نكتب معادلات العقد كالمعتاد."],
        ["Then we add the constraint: the controlling quantity written in terms of the node voltages. Here $i_@phi$ is the current in the 5 Ω resistor.", "ثم نضيف القيد: الكمية المتحكِّمة مكتوبة بدلالة جهود العقد. هنا i_φ هو تيار المقاومة 5 Ω.", { hi: "R5" }],
        ["So $i_@phi = (v_1 - v_2)/5$, and no new unknown is left without an equation.", "إذن i_φ = (v₁ − v₂)/5، ولا يبقى مجهول جديد بلا معادلة.", { hi: "R5 D" }]] }],
      ["ex", { title: "Example 4.3", fig: 0, q: ["Use the node-voltage method to find the power dissipated in the 5 Ω resistor.", "مثال 4.3: استخدم طريقة جهود العقد لإيجاد القدرة المستهلكة في المقاومة 5 Ω."],
        steps: [
          ["@frac{v_1 - 20}{2} + @frac{v_1}{20} + @frac{v_1 - v_2}{5} = 0 @Rightarrow 15v_1 - 4v_2 = 200", "Node 1: three currents leave. Multiply by 20 to clear the fractions.", "العقدة 1: ثلاثة تيارات تخرج. نضرب في 20 لنتخلص من الكسور."],
          ["@frac{v_2 - v_1}{5} + @frac{v_2}{10} + @frac{v_2 - 8i_@phi}{2} = 0", "Node 2: the branch with the dependent source is written like any branch: node voltage minus the source's value, over 2 Ω.", "العقدة 2: الفرع الذي فيه المصدر التابع يُكتب كأي فرع: جهد العقدة ناقص قيمة المصدر، على 2 Ω."],
          ["i_@phi = @frac{v_1 - v_2}{5} @Rightarrow 16v_2 - 10v_1 = 0", "The constraint: substitute $i_@phi$ so only node voltages remain.", "القيد: نعوّض i_φ فلا يبقى إلا جهود العقد."],
          ["v_1 = 16 V, @quad v_2 = 10 V", "Two equations, two unknowns.", "معادلتان ومجهولان."],
          ["i_@phi = @frac{16 - 10}{5} = 1.2 A, @quad p_{5@Omega} = 5 @times 1.2^2 = 7.2 W", "Back to the asked quantity: the current, then $i^2R$.", "نعود للمطلوب: التيار ثم i²R."]],
        check: [["The dependent source is $8i_@phi = 9.6$ V, between $v_2 = 10$ V and ground: a plausible value.", "قيمة المصدر التابع 8i_φ = 9.6 V بين v₂ = 10 V والأرضي، وهذه قيمة معقولة."]] }],
      ["when", { beats: [
        ["Never add a new unknown without an equation: write every controlling quantity in node voltages.", "لا تضف مجهولًا جديدًا بلا معادلة: اكتب كل كمية متحكِّمة بجهود العقد."]] }],
      ["real", { beats: [
        ["Transistor and amplifier circuits are analyzed exactly like this.", "دوائر الترانزستور والمكبرات تُحلَّل بهذه الطريقة تمامًا."],
        ["The transistor is replaced by a model with a dependent source, then we write the node equations plus the constraint.", "نستبدل الترانزستور بنموذج فيه مصدر تابع، ثم نكتب معادلات العقد مع القيد."]] }],
      ["quiz", { i: 0, q: "With a dependent source, the number of equations needed is…", opts: ["the node equations + one constraint per dependent source", "only the node equations, treating the source as a constant"],
        whys: ["The constraint covers the extra unknown, the controlling quantity.", "Its value is unknown: it depends on $i_x$ or $v_x$."],
        hints: [["Count the unknowns, including the controlling quantity.", "عدّ المجاهيل مع الكمية المتحكِّمة."]] }],
      ["sum", { beats: [
        ["Node equations as usual.", "معادلات العقد كالمعتاد."],
        ["Plus one constraint per dependent source: its control in terms of node voltages.", "ومعها قيد لكل مصدر تابع: الكمية المتحكِّمة بدلالة جهود العقد."],
        ["Substitute, solve, then compute what is asked.", "عوّض وحلّ، ثم احسب المطلوب."]] }]
    ]
  });

  EX.add("c1-techniques-3", {
    chapter: CH,
    goals: [["Handle a voltage source between a node and the reference.", "تتعامل مع مصدر جهد بين عقدة والمرجع."],
      ["Use the supernode for a voltage source between two nodes.", "تستخدم العقدة العظمى لمصدر جهد بين عقدتين."],
      ["Write the supernode's constraint equation.", "تكتب معادلة القيد للعقدة العظمى."]],
    items: [
      ["idea", { label: "Case one: a known node", fig: 0, beats: [
        ["If a voltage source is the only element between an essential node and the reference, that node's voltage is known directly.", "إذا كان مصدر الجهد هو العنصر الوحيد بين عقدة أساسية والمرجع، فجهد هذه العقدة معروف مباشرة.", { hi: "V50" }],
        ["Here $v_1 = 50$ V: one unknown fewer.", "هنا v₁ = 50 V، فيقل عدد المجاهيل واحدًا.", { hi: "V50" }]] }],
      ["idea", { label: "Case two: the supernode", fig: 0, beats: [
        ["If a voltage source sits between two essential nodes, neither of them the reference, its current is unknown and can't be written with Ohm's law.", "إذا كان مصدر الجهد بين عقدتين أساسيتين ليست أيهما المرجع، فتياره مجهول ولا يُكتب بقانون أوم.", { hi: "D" }],
        ["So we merge the two nodes into a supernode, and write KCL for all the currents leaving it. The current between them doesn't appear.", "فندمج العقدتين في عقدة عظمى ونكتب KCL لكل التيارات الخارجة منها، ولا يظهر التيار بينهما.", { hi: "D" }],
        ["We add the source's own equation: the difference of the two node voltages equals the source value.", "ونضيف معادلة المصدر نفسه: فرق جهدَي العقدتين يساوي قيمة المصدر."]] }],
      ["ex", { title: "Lecture example", fig: 0, q: ["Find $v_1$, $v_2$, $v_3$ and $i_@phi$. $i_@phi$ is the current of the 5 Ω resistor from node 2 to node 1.", "مثال المحاضرة: أوجد v₁ و v₂ و v₃ و i_φ، حيث i_φ تيار المقاومة 5 Ω من العقدة 2 إلى العقدة 1."],
        steps: [
          ["v_1 = 50 V", "The 50 V source alone joins node 1 to the reference.", "المصدر 50 V وحده يصل العقدة 1 بالمرجع."],
          ["@frac{v_2 - v_1}{5} + @frac{v_2}{50} + @frac{v_3}{100} - 4 = 0", "Nodes 2 and 3 have the dependent source between them: one supernode, one KCL for all currents leaving it.", "العقدتان 2 و 3 بينهما المصدر التابع: عقدة عظمى واحدة ومعادلة KCL واحدة لكل التيارات الخارجة منها."],
          ["22v_2 + v_3 = 1400 @quad (1)", "Multiply by 100 and put in $v_1 = 50$.", "نضرب في 100 ونعوّض v₁ = 50."],
          ["v_3 = v_2 + 10i_@phi, @quad i_@phi = @frac{v_2 - v_1}{5} @Rightarrow 3v_2 - v_3 = 100 @quad (2)", "The source's equation, with its control $i_@phi$ written in node voltages.", "معادلة المصدر، مع كتابة الكمية المتحكِّمة i_φ بجهود العقد."],
          ["v_2 = 60 V, @quad v_3 = 80 V, @quad i_@phi = 2 A", "Solve (1) and (2) together.", "نحل (1) و (2) معًا."]],
        check: [["The dependent source is $10i_@phi = 20$ V, and indeed $v_3 - v_2 = 80 - 60 = 20$ V.", "المصدر التابع 10i_φ = 20 V، وبالفعل v₃ − v₂ = 80 − 60 = 20 V."]] }],
      ["when", { beats: [
        ["Don't write the current of an ideal voltage source with Ohm's law: it has no resistance, so its current is unknown.", "لا تكتب تيار مصدر الجهد المثالي بقانون أوم: لا مقاومة له، فتياره مجهول."],
        ["If the source is dependent, add its constraint equation as well.", "وإذا كان المصدر تابعًا فأضف معادلة القيد أيضًا."]] }],
      ["real", { beats: [
        ["Electronic circuits often have a supply between two rails, neither of which is ground.", "الدوائر الإلكترونية كثيرًا ما يكون فيها مصدر بين خطين ليس أيهما الأرضي."],
        ["The supernode is the direct way to solve them.", "والعقدة العظمى هي الطريقة المباشرة لحلها."]] }],
      ["quiz", { i: 0, q: "An ideal voltage source is between two non-reference nodes. Why not write KCL at each node separately?", opts: ["The source's current is unknown and can't be written in node voltages", "KCL doesn't apply to voltage sources"],
        whys: ["So we merge the two nodes into a supernode and add the constraint.", "KCL always applies; the problem is the extra unknown."],
        hints: [["What would you write for the source's current?", "ماذا ستكتب لتيار المصدر؟"]] }],
      ["sum", { beats: [
        ["A source to the reference: that node's voltage is known.", "مصدر إلى المرجع: جهد تلك العقدة معروف."],
        ["A source between two nodes: merge them into a supernode, one KCL for both.", "مصدر بين عقدتين: ادمجهما في عقدة عظمى بمعادلة KCL واحدة."],
        ["Add the source's equation: the difference of the two voltages is its value.", "أضف معادلة المصدر: فرق الجهدين يساوي قيمته."]] }]
    ]
  });

  EX.add("c1-techniques-4", {
    chapter: CH,
    goals: [["Define a mesh current for each mesh.", "تعرّف تيار حلقة لكل حلقة."],
      ["Write KVL for each mesh in terms of the mesh currents.", "تكتب KVL لكل حلقة بدلالة تيارات الحلقات."],
      ["Compute a shared branch current from the two mesh currents.", "تحسب تيار الفرع المشترك من تيارَي الحلقتين."]],
    items: [
      ["idea", { label: "The method in three steps", chain: ["1 · Choose meshes covering every branch", "2 · KVL around each mesh", "3 · Solve for the mesh currents"], beats: [
        ["The mesh-current method finds a current for each mesh in three steps.", "طريقة تيارات الحلقات تجد تيارًا لكل حلقة في ثلاث خطوات."],
        ["A mesh is a loop that encloses no other loop. Each mesh current circulates clockwise around it.", "الحلقة (mesh) مسار مغلق لا يحيط بحلقة أخرى، وتيارها يدور مع عقارب الساعة."],
        ["A resistor shared by two meshes carries the difference of their currents, because they pass through it in opposite directions.", "المقاومة المشتركة بين حلقتين يمر فيها فرق تياريهما، لأنهما يمران فيها في اتجاهين متعاكسين."]] }],
      ["law", { label: "Two meshes, from the lecture", steps: [
        ["v_1 = i_a R_1 + (i_a - i_b) R_3", "Mesh a: the source rise equals the drop on $R_1$ plus the drop on the shared $R_3$, which carries $i_a - i_b$.", "الحلقة a: ارتفاع المصدر يساوي الهبوط على R₁ زائد الهبوط على R₃ المشتركة التي يمر فيها iₐ − i_b."],
        ["-v_2 = (i_b - i_a) R_3 + i_b R_2", "Mesh b: in its own direction the shared resistor carries $i_b - i_a$.", "الحلقة b: باتجاهها هي تحمل المقاومة المشتركة i_b − iₐ."],
        ["@text{equations} = @text{meshes}", "One KVL per mesh, as many equations as unknown currents.", "معادلة KVL لكل حلقة، أي معادلات بعدد التيارات المجهولة."]] }],
      ["ex", { title: "Example 4.4", fig: 0, q: ["(a) Find the power of each voltage source. (b) Find the voltage $v_o$ across the 8 Ω resistor.", "مثال 4.4: (أ) أوجد قدرة كل مصدر جهد. (ب) أوجد الجهد vₒ على المقاومة 8 Ω."],
        steps: [
          ["-40 + 2i_a + 8(i_a - i_b) = 0", "Mesh a: the 8 Ω is shared with mesh b.", "الحلقة a: المقاومة 8 Ω مشتركة مع الحلقة b."],
          ["8(i_b - i_a) + 6i_b + 6(i_b - i_c) = 0", "Mesh b, in the middle, shares a resistor with each neighbour.", "الحلقة b في الوسط تشترك في مقاومة مع كل جارة."],
          ["6(i_c - i_b) + 4i_c + 20 = 0", "Mesh c: the 20 V source opposes its direction.", "الحلقة c: المصدر 20 V يعاكس اتجاهها."],
          ["i_a = 5.6 A, @quad i_b = 2 A, @quad i_c = -0.8 A", "Three equations, three unknowns.", "ثلاث معادلات وثلاثة مجاهيل."],
          ["p_{40V} = -40 i_a = -224 W, @quad p_{20V} = 20 i_c = -16 W", "Both powers are negative: both sources deliver.", "القدرتان سالبتان: المصدران يعطيان."],
          ["v_o = 8(i_a - i_b) = 8(3.6) = 28.8 V", "The 8 Ω carries the difference of meshes a and b.", "المقاومة 8 Ω يمر فيها فرق تيارَي الحلقتين a و b."]],
        check: [["$i_c$ is negative: mesh c's current really flows counter-clockwise. The 20 V source still delivers.", "i_c سالب: تيار الحلقة c يدور فعليًا عكس عقارب الساعة، والمصدر 20 V ما زال يعطي القدرة."]] }],
      ["when", { beats: [
        ["The method suits circuits with fewer meshes than nodes, or with voltage sources.", "تناسب الطريقة الدوائر التي حلقاتها أقل من عقدها، أو التي فيها مصادر جهد."],
        ["Any branch current is its mesh current, or the difference of two if the branch is shared.", "تيار أي فرع هو تيار حلقته، أو فرق تيارين إذا كان الفرع مشتركًا."]] }],
      ["real", { beats: [
        ["Lighting runs and circuits with many sources in series, like electric-car battery packs, have few meshes.", "خطوط الإنارة والدوائر التي فيها مصادر كثيرة على التوالي، مثل حزم بطاريات السيارات الكهربائية، حلقاتها قليلة."],
        ["There the mesh method is faster.", "وهناك تكون طريقة الحلقات أسرع."]] }],
      ["quiz", { i: 0, q: "Two clockwise mesh currents $i_1$ and $i_2$ share a branch. The branch current is…", opts: ["$i_1 - i_2$ (in the direction of $i_1$)", "$i_1 + i_2$"],
        whys: ["The two currents pass through the shared branch in opposite directions.", "They are opposite in the shared branch, so we subtract."],
        hints: [["Draw both clockwise arrows on the shared branch.", "ارسم السهمين مع عقارب الساعة على الفرع المشترك."]] }],
      ["sum", { beats: [
        ["Name a clockwise current for each mesh.", "سمِّ تيارًا مع عقارب الساعة لكل حلقة."],
        ["KVL around each mesh; a shared resistor carries the difference of the two currents.", "KVL حول كل حلقة، والمقاومة المشتركة يمر فيها فرق التيارين."],
        ["Solve, then every branch current is a mesh current or a difference of two.", "حلّ، فيكون كل تيار فرع تيار حلقة أو فرق تيارين."]] }]
    ]
  });

  EX.add("c1-techniques-5", {
    chapter: CH,
    goals: [["Express the controlling quantity in terms of the mesh currents.", "تعبّر عن الكمية المتحكِّمة بدلالة تيارات الحلقات."],
      ["Write KVL with a dependent voltage source.", "تكتب KVL مع مصدر جهد تابع."],
      ["Compute the power asked for.", "تحسب القدرة المطلوبة."]],
    items: [
      ["idea", { fig: 0, beats: [
        ["With a dependent source we write the mesh equations as usual, keeping its value, here $15i_@phi$, as a voltage in KVL.", "مع المصدر التابع نكتب معادلات الحلقات كالمعتاد، ونبقي قيمته، هنا 15i_φ، جهدًا في KVL.", { hi: "D" }],
        ["Then we write the controlling current in mesh currents. $i_@phi$ is in the shared 20 Ω branch, so $i_@phi = i_1 - i_3$; mind its direction.", "ثم نكتب التيار المتحكِّم بتيارات الحلقات. i_φ في الفرع المشترك 20 Ω، فـ i_φ = i₁ − i₃، مع الانتباه لاتجاهه.", { hi: "R20" }]] }],
      ["ex", { title: "Example 4.5", fig: 0, q: ["Use the mesh-current method to find the power dissipated in the 4 Ω resistor.", "مثال 4.5: استخدم طريقة تيارات الحلقات لإيجاد القدرة المستهلكة في المقاومة 4 Ω."],
        pick: ["Three meshes: $i_1$ on the left, $i_2$ on top with the 1 Ω, $i_3$ on the right.", "ثلاث حلقات: i₁ في اليسار، و i₂ في الأعلى مع 1 Ω، و i₃ في اليمين."],
        steps: [
          ["50 = 5(i_1 - i_2) + 20(i_1 - i_3)", "Mesh 1: the source's rise equals the drops on the two shared resistors.", "الحلقة 1: ارتفاع المصدر يساوي الهبوط على المقاومتين المشتركتين."],
          ["0 = 5(i_2 - i_1) + 1i_2 + 4(i_2 - i_3)", "Mesh 2: no source inside, so the drops add to zero.", "الحلقة 2: لا مصدر فيها، فمجموع الهبوطات صفر."],
          ["0 = 20(i_3 - i_1) + 4(i_3 - i_2) + 15i_@phi", "Mesh 3 includes the dependent source.", "الحلقة 3 فيها المصدر التابع."],
          ["i_@phi = i_1 - i_3 @Rightarrow 0 = -5i_1 - 4i_2 + 9i_3", "The constraint, substituted and arranged in standard form.", "نعوّض القيد ونرتّب المعادلة بالشكل القياسي."],
          ["i_2 = 26 A, @quad i_3 = 28 A", "Solve the three equations together.", "نحل المعادلات الثلاث معًا."],
          ["i_{4@Omega} = i_3 - i_2 = 2 A, @quad p = (2)^2(4) = 16 W", "The 4 Ω is shared by meshes 2 and 3; then $i^2R$.", "المقاومة 4 Ω مشتركة بين الحلقتين 2 و 3، ثم i²R."]] }],
      ["when", { beats: [
        ["If the controlling current is in a shared branch, it is the difference of two mesh currents: check its direction.", "إذا كان التيار المتحكِّم في فرع مشترك فهو فرق تيارين، فتحقق من اتجاهه."],
        ["After substituting, arrange the equations in standard form before solving.", "بعد التعويض رتّب المعادلات بالشكل القياسي قبل الحل."]] }],
      ["real", { beats: [
        ["The op-amp model contains a high-gain dependent voltage source.", "نموذج مكبر العمليات فيه مصدر جهد تابع بكسب عالٍ."],
        ["Analyzing its circuits, by meshes or nodes, needs the same constraint equation.", "وتحليل دوائره، بالحلقات أو بالعقد، يحتاج معادلة القيد نفسها."]] }],
      ["quiz", { i: 0, q: "A dependent voltage source $8i_x$ is in a mesh. When writing KVL…", opts: ["write $8i_x$ with the sign set by its polarity, then replace $i_x$ with mesh currents", "remove it, since it is not an independent source"],
        whys: ["That way the only unknowns stay the mesh currents.", "A dependent source affects the circuit; it is never removed."],
        hints: [["It is a voltage in the loop like any other.", "إنه جهد في الحلقة مثل أي جهد آخر."]] }],
      ["sum", { beats: [
        ["Mesh equations as usual, with the dependent source as a voltage.", "معادلات الحلقات كالمعتاد، والمصدر التابع جهد فيها."],
        ["The constraint: its control written in mesh currents.", "القيد: الكمية المتحكِّمة مكتوبة بتيارات الحلقات."],
        ["Arrange, solve, and compute what is asked.", "رتّب وحلّ واحسب المطلوب."]] }]
    ]
  });

  EX.add("c1-techniques-6", {
    chapter: CH,
    goals: [["Handle a current source on the outer edge of a mesh.", "تتعامل مع مصدر تيار في الفرع الخارجي لحلقة."],
      ["Use the supermesh for a current source in a shared branch.", "تستخدم الحلقة العظمى لمصدر تيار في فرع مشترك."],
      ["Write the supermesh's constraint equation.", "تكتب معادلة القيد للحلقة العظمى."]],
    items: [
      ["idea", { label: "A current source in a mesh", fig: 0, beats: [
        ["A current source's voltage is unknown. If it sits on the outer edge of one mesh, that mesh current is simply the source's value.", "جهد مصدر التيار مجهول. إذا كان على الحافة الخارجية لحلقة واحدة، فتيار تلك الحلقة يساوي قيمة المصدر مباشرة."],
        ["Here the 5 A source is in a branch shared by meshes a and c. Name its voltage $v$ and put it in both meshes' equations.", "هنا المصدر 5 A في فرع مشترك بين الحلقتين a و c. نسمّي جهده v ونضعه في معادلتي الحلقتين.", { hi: "I5" }],
        ["Adding the two equations eliminates $v$. That sum is the supermesh: KVL around the path that encloses both meshes, skipping the source's branch.", "جمع المعادلتين يحذف v، وهذا المجموع هو الحلقة العظمى: KVL حول المسار الذي يحيط بالحلقتين متجاوزًا فرع المصدر.", { hi: "I5" }]] }],
      ["ex", { title: "Lecture example", fig: 0, q: ["Find the mesh currents $i_a$, $i_b$ and $i_c$.", "مثال المحاضرة: أوجد تيارات الحلقات iₐ و i_b و i_c."],
        steps: [
          ["100 = 3(i_a - i_b) + v + 6i_a @quad (1)", "Mesh a, with the source's unknown voltage $v$.", "الحلقة a مع الجهد المجهول v للمصدر."],
          ["-50 = 4i_c - v + 2(i_c - i_b) @quad (2)", "Mesh c meets the same source the other way round, so $v$ appears with a minus sign.", "الحلقة c تمر بالمصدر نفسه في الاتجاه المعاكس، فيظهر v بإشارة سالبة."],
          ["50 = 9i_a - 5i_b + 6i_c", "Add (1) and (2): $v$ cancels. This is the supermesh equation itself.", "نجمع (1) و (2) فيُحذف v، وهذه معادلة الحلقة العظمى نفسها."],
          ["0 = 3(i_b - i_a) + 10i_b + 2(i_b - i_c)", "Mesh b, an ordinary mesh.", "الحلقة b حلقة عادية."],
          ["i_c - i_a = 5", "The source equation: in the shared branch the two mesh currents differ by 5 A.", "معادلة المصدر: في الفرع المشترك يختلف تيارا الحلقتين بمقدار 5 A."],
          ["i_a = 1.75 A, @quad i_b = 1.25 A, @quad i_c = 6.75 A", "Three equations, three unknowns.", "ثلاث معادلات وثلاثة مجاهيل."]],
        check: [["$i_c - i_a = 6.75 - 1.75 = 5$ A, matching the current source.", "i_c − iₐ = 6.75 − 1.75 = 5 A، وهذا يطابق مصدر التيار."]] }],
      ["when", { beats: [
        ["A current source on the outer edge of one mesh: that mesh current is known.", "مصدر تيار على الحافة الخارجية لحلقة واحدة: تيار تلك الحلقة معروف."],
        ["Shared by two meshes: a supermesh. Never write KVL through a current source without naming its voltage.", "مشترك بين حلقتين: حلقة عظمى. ولا تكتب KVL عبر مصدر تيار دون أن تسمّي جهده."]] }],
      ["real", { beats: [
        ["Current sources stand for devices like constant-current battery chargers and solar cells.", "مصادر التيار تمثّل أجهزة مثل شواحن البطاريات بتيار ثابت والخلايا الشمسية."],
        ["Having one between two meshes is common.", "ووجود أحدها بين حلقتين أمر شائع."]] }],
      ["quiz", { i: 0, q: "A 2 A current source sits on the outer branch of a single mesh, in the mesh's direction:", opts: ["this mesh current is 2 A directly", "we need a supermesh"],
        whys: ["Only this mesh's current flows in that branch.", "A supermesh is only for a source in a shared branch."],
        hints: [["How many mesh currents pass through that branch?", "كم تيار حلقة يمر في ذلك الفرع؟"]] }],
      ["sum", { beats: [
        ["Outer current source: the mesh current is known.", "مصدر تيار خارجي: تيار الحلقة معروف."],
        ["Shared current source: one KVL around both meshes, the supermesh.", "مصدر تيار مشترك: KVL واحدة حول الحلقتين، أي الحلقة العظمى."],
        ["Plus the source equation: the difference of the two mesh currents.", "ومعها معادلة المصدر: فرق تيارَي الحلقتين."]] }]
    ]
  });

  EX.add("c1-techniques-7", {
    chapter: CH,
    goals: [["Count the equations each method needs.", "تعدّ المعادلات التي تحتاجها كل طريقة."],
      ["Choose the method with fewer equations, given the kind of sources.", "تختار الطريقة الأقل معادلات حسب نوع المصادر."],
      ["Solve with the chosen method, and check with the other.", "تحل بالطريقة المختارة وتتحقق بالأخرى."]],
    items: [
      ["idea", { label: "Which method?", math: ["N_{node} = n_e - 1 - N_{V}", "N_{mesh} = N_{meshes} - N_{I}"], beats: [
        ["Both methods exist to cut down the number of simultaneous equations. So before starting, count.", "الطريقتان موجودتان لتقليل عدد المعادلات الآنية، فقبل أن تبدأ: عُدّ."],
        ["Node method: essential nodes minus one, minus one for each voltage source, because each source fixes a voltage or forms a supernode.", "طريقة العقد: العقد الأساسية ناقص واحد، وناقص واحد لكل مصدر جهد، لأن كل مصدر يحدد جهدًا أو يكوّن عقدة عظمى."],
        ["Mesh method: meshes minus one for each current source, because each one fixes a mesh current or forms a supermesh.", "طريقة الحلقات: عدد الحلقات ناقص واحد لكل مصدر تيار، لأن كل مصدر يحدد تيار حلقة أو يكوّن حلقة عظمى."]] }],
      ["when", { beats: [
        ["Current sources favour the node method; voltage sources favour the mesh method.", "مصادر التيار ترجّح طريقة العقد، ومصادر الجهد ترجّح طريقة الحلقات."],
        ["If a voltage is asked, the node method is usually closer; if a current, the mesh method.", "إذا كان المطلوب جهدًا فطريقة العقد أقرب عادة، وإذا كان تيارًا فطريقة الحلقات."],
        ["You can solve the same problem both ways to check your answer.", "ويمكنك حل المسألة بالطريقتين للتحقق من الإجابة."]] }],
      ["ex", { title: "Problem 4.13", fig: 0, q: ["Find the power delivered by the 2 A current source.", "مسألة 4.13: أوجد القدرة التي يعطيها مصدر التيار 2 A."],
        pick: ["Count first: one essential node besides the reference, so the node method needs one equation. The meshes would need a supermesh.", "نعدّ أولًا: عقدة أساسية واحدة غير المرجع، فطريقة العقد تحتاج معادلة واحدة، والحلقات تحتاج حلقة عظمى."],
        steps: [
          ["@frac{v_1 - 20}{15} - 2 + @frac{v_1 - 25}{10} = 0", "One node equation: currents leaving through 15 Ω and 10 Ω; the 2 A enters.", "معادلة عقدة واحدة: تياران يخرجان عبر 15 Ω و 10 Ω، والـ 2 A يدخل."],
          ["v_1 = 35 V", "Multiply by 30: $2v_1 - 40 - 60 + 3v_1 - 75 = 0$.", "نضرب في 30: 2v₁ − 40 − 60 + 3v₁ − 75 = 0."],
          ["p_{2A} = -35 @times 2 = -70 W", "The source's current leaves its + end: negative power, it delivers 70 W.", "تيار المصدر يخرج من طرفه الموجب: قدرة سالبة، أي أنه يعطي 70 W."],
          ["-20 + 15i_a + 10i_b + 25 = 0, @quad i_b - i_a = 2", "Check with meshes: the source is shared, so a supermesh plus the source equation.", "نتحقق بالحلقات: المصدر مشترك، فحلقة عظمى مع معادلة المصدر."],
          ["i_a = -1 A, @quad i_b = 1 A @Rightarrow v_1 = 20 - 15(-1) = 35 V", "Same voltage, so the same power: both methods agree.", "الجهد نفسه، فالقدرة نفسها: الطريقتان متفقتان."]] }],
      ["real", { beats: [
        ["An engineer picks the method before starting, as you pick the shortest route before driving.", "المهندس يختار الطريقة قبل أن يبدأ، كما تختار أقصر طريق قبل أن تقود."],
        ["One equation instead of two saves time and cuts mistakes in an exam.", "معادلة واحدة بدل اثنتين توفّر الوقت وتقلل الأخطاء في الاختبار."]] }],
      ["quiz", { i: 0, q: "A circuit has 3 essential nodes and 4 meshes, with no special sources. Which method needs fewer equations?", opts: ["Node voltages (2 equations)", "Mesh currents (3 equations)"],
        whys: ["$3 - 1 = 2$, against 4.", "There are 4 meshes, so 4 equations."],
        hints: [["Nodes: essential nodes minus one. Meshes: one per mesh.", "العقد: العقد الأساسية ناقص واحد. الحلقات: معادلة لكل حلقة."]] }],
      ["sum", { beats: [
        ["Count the equations of both methods before you start.", "عُدّ معادلات الطريقتين قبل أن تبدأ."],
        ["Voltage sources shrink the node count; current sources shrink the mesh count.", "مصادر الجهد تقلل معادلات العقد، ومصادر التيار تقلل معادلات الحلقات."],
        ["Solving both ways is a strong check.", "الحل بالطريقتين تحقق قوي."]] }]
    ]
  });

  EX.add("c1-techniques-8", {
    chapter: CH,
    goals: [["Convert a voltage source with a series resistor into a current source with a parallel resistor, and back.", "تحوّل مصدر جهد مع مقاومة على التوالي إلى مصدر تيار مع مقاومة على التوازي، والعكس."],
      ["Use successive transformations to reduce a circuit.", "تستخدم تحويلات متتالية لاختزال دائرة."],
      ["Know the limits of the transformation.", "تعرف حدود التحويل."]],
    items: [
      ["law", { label: "The transformation", steps: [
        ["v_s @text{ in series with } R @quad @Leftrightarrow @quad i_s @text{ in parallel with } R", "A voltage source in series with $R$ can be replaced by a current source in parallel with the same $R$. Seen from terminals a and b, nothing changes.", "مصدر جهد على التوالي مع R يمكن استبداله بمصدر تيار على التوازي مع R نفسها، ولا يتغير شيء عند الطرفين a و b."],
        ["i_s = @frac{v_s}{R}", "Short a and b: the voltage source pushes $v_s/R$ through the short; the current source must give the same.", "عند قصر a و b يدفع مصدر الجهد التيار vₛ/R في القصر، ويجب أن يعطي مصدر التيار الشيء نفسه."],
        ["v_s = i_s R", "Open a and b: the current source makes $i_sR$ across $R$; the voltage source must give the same.", "عند فتح a و b يولّد مصدر التيار i_sR على R، ويجب أن يعطي مصدر الجهد الشيء نفسه."],
        ["@text{arrow} @to @text{the + terminal}", "Direction: the current source's arrow points toward the voltage source's + terminal.", "الاتجاه: سهم مصدر التيار يشير نحو الطرف الموجب لمصدر الجهد."]] }],
      ["idea", { label: "The special case", beats: [
        ["A resistor in parallel with a voltage source, or in series with a current source, changes nothing at the terminals.", "مقاومة على التوازي مع مصدر جهد، أو على التوالي مع مصدر تيار، لا تغيّر شيئًا عند الأطراف."],
        ["So it can be removed when finding voltages and currents outside. It does change the power of the source itself.", "فيمكن حذفها عند حساب الجهود والتيارات خارجها، لكنها تغيّر قدرة المصدر نفسه."],
        ["Don't transform the element whose voltage or current you are asked for.", "لا تحوّل العنصر الذي طُلب جهده أو تياره."]] }],
      ["ex", { title: "Example 4.8", fig: 0, q: ["(a) Find the power of the 6 V source. (b) Is it absorbing or delivering?", "مثال 4.8: (أ) أوجد قدرة المصدر 6 V. (ب) هل يمتص أم يعطي؟"],
        pick: ["Leave the 6 V source alone, and transform from the far end toward it, combining resistors after each step.", "نترك المصدر 6 V كما هو، ونحوّل من الطرف البعيد باتجاهه، ونجمع المقاومات بعد كل خطوة."],
        steps: [
          ["40 V, 5 @Omega @to @frac{40}{5} = 8 A @par 5 @Omega; @quad 20 @par 5 = 4 @Omega", "40 V with 5 Ω becomes 8 A with 5 Ω, which is now in parallel with 20 Ω.", "40 V مع 5 Ω تصبح 8 A مع 5 Ω، وهذه الآن على التوازي مع 20 Ω."],
          ["8 A @par 4 @Omega @to 32 V; @quad 4 + 6 + 10 = 20 @Omega", "Back to a voltage source: 32 V in series with 4 Ω, then with 6 Ω and 10 Ω.", "نرجعها مصدر جهد: 32 V على التوالي مع 4 Ω ثم مع 6 Ω و 10 Ω."],
          ["32 V, 20 @Omega @to 1.6 A; @quad 20 @par 30 = 12 @Omega", "Transform again so the 20 Ω meets 30 Ω in parallel.", "نحوّل مرة أخرى لتصبح 20 Ω على التوازي مع 30 Ω."],
          ["1.6 A @par 12 @Omega @to 19.2 V @text{ in series with } 12 @Omega", "And once more into a voltage source. One loop is left with the 6 V source.", "ومرة أخيرة إلى مصدر جهد، فتبقى حلقة واحدة مع المصدر 6 V."],
          ["i = @frac{19.2 - 6}{4 + 12} = 0.825 A", "KVL in the last loop.", "KVL في الحلقة الأخيرة."],
          ["p_{6V} = 6 @times 0.825 = 4.95 W", "The current enters the 6 V source at its + terminal: positive power, the source absorbs.", "التيار يدخل المصدر 6 V من طرفه الموجب: قدرة موجبة، أي أن المصدر يمتص."]] }],
      ["ex", { title: "Example 4.9", fig: 1, q: ["Use source transformations to find $v_o$.", "مثال 4.9: استخدم تحويلات المصادر لإيجاد vₒ."],
        steps: [
          ["@text{remove } 125 @Omega @text{ and } 10 @Omega; @quad 5 + 15 = 20 @Omega", "125 Ω is in parallel with the voltage source and 10 Ω in series with the current source: the special case, remove both.", "125 Ω على التوازي مع مصدر الجهد و 10 Ω على التوالي مع مصدر التيار: الحالة الخاصة، فنحذفهما."],
          ["250 V, 25 @Omega @to 10 A @par 25 @Omega", "Transform the 250 V source with its 25 Ω.", "نحوّل المصدر 250 V مع 25 Ω."],
          ["10 - 8 = 2 A", "Current sources in parallel add, with their directions.", "مصادر التيار على التوازي تُجمع مع مراعاة اتجاهاتها."],
          ["25 @par 100 @par 20 = 10 @Omega @Rightarrow v_o = 2 @times 10 = 20 V", "One source, one equivalent resistor: Ohm's law.", "مصدر واحد ومقاومة مكافئة واحدة: قانون أوم."]] }],
      ["real", { beats: [
        ["A battery's datasheet gives a voltage and an internal resistance: a voltage source with a resistor.", "ورقة بيانات البطارية تعطي جهدًا ومقاومة داخلية: مصدر جهد مع مقاومة."],
        ["A solar cell is usually described as a current source with a resistor. The transformation lets you compare them in one model.", "والخلية الشمسية توصف عادة بمصدر تيار مع مقاومة، والتحويل يسمح بمقارنتهما بنموذج واحد."]] }],
      ["quiz", { i: 0, q: "A 5 A current source in parallel with 4 Ω is equivalent to…", opts: ["20 V in series with 4 Ω", "1.25 V with 4 Ω", "20 V with 0.25 Ω"],
        whys: ["$v_s = i_sR$.", "You divided; $v_s = i_s @times R$.", "The resistor stays the same 4 Ω."],
        hints: [["The resistor keeps its value; only the source changes.", "المقاومة تبقى كما هي، والذي يتغير المصدر فقط."]] }],
      ["sum", { math: ["v_s = i_s R"], beats: [
        ["Voltage source in series with $R$ ⇔ current source in parallel with $R$.", "مصدر جهد على التوالي مع R ⇔ مصدر تيار على التوازي مع R."],
        ["Transform step by step, combining resistors and sources after each step.", "حوّل خطوة خطوة، واجمع المقاومات والمصادر بعد كل خطوة."],
        ["A resistor across a voltage source, or in series with a current source, can be removed for the outside.", "المقاومة على مصدر جهد، أو على التوالي مع مصدر تيار، تُحذف بالنسبة لما خارجها."]] }]
    ]
  });

  EX.add("c1-techniques-9", {
    chapter: CH,
    goals: [["Find the Thévenin voltage from the open-circuit voltage.", "تحسب جهد ثيفنن من جهد الدائرة المفتوحة."],
      ["Find the Thévenin resistance from the short-circuit current.", "تحسب مقاومة ثيفنن من تيار القصر."],
      ["Find the Norton current and relate the two equivalents.", "تحسب تيار نورتن وتربط المكافئين."]],
    items: [
      ["idea", { fig: 0, beats: [
        ["Thévenin's theorem: any network of sources and resistors, seen from two terminals a and b, can be replaced by a voltage source $V_{Th}$ in series with $R_{Th}$.", "نظرية ثيفنن: أي شبكة مصادر ومقاومات، منظورًا إليها من طرفين a و b، يمكن استبدالها بمصدر جهد V_Th على التوالي مع R_Th."],
        ["Connect the same load to both and it gets the same voltage and current. So we can study the load without the whole network.", "إذا وصلنا الحمل نفسه بالاثنين أخذ الجهد والتيار نفسيهما، فنستطيع دراسة الحمل دون الشبكة كلها."]] }],
      ["law", { label: "The recipe", steps: [
        ["V_{Th} = v_{ab} @text{ (open circuit)}", "Remove the load and find the open-circuit voltage between a and b: no current flows in $R_{Th}$, so all of $V_{Th}$ appears.", "نزيل الحمل ونوجد جهد الدائرة المفتوحة بين a و b: لا تيار في R_Th، فيظهر V_Th كله."],
        ["i_{sc} = @frac{V_{Th}}{R_{Th}}", "Short a and b and find the short-circuit current, from a to b: only $R_{Th}$ limits it.", "نقصر a و b ونوجد تيار القصر من a إلى b: لا يحدّه إلا R_Th."],
        ["R_{Th} = @frac{V_{Th}}{i_{sc}}", "Divide the two: the open voltage over the short current.", "نقسم الاثنين: جهد الفتح على تيار القصر."],
        ["I_N = i_{sc}, @quad R_N = R_{Th}", "Norton is the source transformation of Thévenin: a current source in parallel with the same resistance.", "مكافئ نورتن تحويل مصدر لمكافئ ثيفنن: مصدر تيار على التوازي مع المقاومة نفسها."]] }],
      ["ex", { title: "Lecture example", fig: 0, q: ["Find the Thévenin and Norton equivalents of the circuit, with respect to terminals a and b.", "مثال المحاضرة: أوجد مكافئَي ثيفنن ونورتن للدائرة بالنسبة للطرفين a و b."],
        steps: [
          ["@frac{v_1 - 25}{5} + @frac{v_1}{20} - 3 = 0 @Rightarrow v_1 = 32 V = V_{Th}", "Open circuit: no current in 4 Ω, so $v_{ab} = v_1$. One node equation.", "دائرة مفتوحة: لا تيار في 4 Ω، فـ v_ab = v₁. معادلة عقدة واحدة."],
          ["@frac{v_2 - 25}{5} + @frac{v_2}{20} - 3 + @frac{v_2}{4} = 0 @Rightarrow v_2 = 16 V", "Short a and b: now the 4 Ω carries current to the short, so it joins the node equation.", "نقصر a و b: الآن المقاومة 4 Ω يمر فيها تيار إلى القصر، فتدخل معادلة العقدة."],
          ["i_{sc} = @frac{16}{4} = 4 A", "That current is the short-circuit current.", "هذا التيار هو تيار القصر."],
          ["R_{Th} = @frac{32}{4} = 8 @Omega", "Thévenin: 32 V with 8 Ω. Norton: 4 A with 8 Ω.", "ثيفنن: 32 V مع 8 Ω، ونورتن: 4 A مع 8 Ω."]] }],
      ["ex", { title: "Example 4.10", fig: 1, q: ["Find the Thévenin equivalent of this circuit with dependent sources.", "مثال 4.10: أوجد مكافئ ثيفنن لهذه الدائرة التي فيها مصادر تابعة."],
        steps: [
          ["V_{Th} = v = -20i(25) = -500i", "$i_x$ must be zero, since it has no return path. So the open-circuit voltage is the voltage of 25 Ω, fed by the dependent source $20i$.", "i_x لا بد أن يكون صفرًا لأنه لا مسار عودة له، فجهد الدائرة المفتوحة هو جهد 25 Ω الذي يغذيه المصدر التابع 20i."],
          ["i = @frac{5 - 3v}{2000} @Rightarrow V_{Th} = -5 V", "The left loop gives $i$ in terms of $v$; substitute and solve.", "الحلقة اليسرى تعطي i بدلالة v، فنعوّض ونحل."],
          ["v = 0 @Rightarrow i = 2.5 mA, @quad i_{sc} = -20i = -50 mA", "Short a and b: $v = 0$ switches off the $3v$ source, and all of $20i$ goes through the short.", "عند قصر a و b يصبح v = 0 فيتوقف المصدر 3v، ويمر كل 20i في القصر."],
          ["R_{Th} = @frac{-5}{-0.05} = 100 @Omega", "The ratio method works even with dependent sources.", "طريقة النسبة تعمل حتى مع المصادر التابعة."]] }],
      ["when", { beats: [
        ["Use it when you want the current or power of a changing load: find the equivalent once, then try any load.", "استخدمه حين تريد تيار أو قدرة حمل متغير: أوجد المكافئ مرة واحدة ثم جرّب أي حمل."],
        ["Watch the direction of $i_{sc}$: from a to b through the short.", "انتبه لاتجاه i_sc: من a إلى b عبر القصر."]] }],
      ["real", { beats: [
        ["A phone's charging port sees the charger as a voltage source with an internal resistance: a Thévenin equivalent.", "منفذ شحن الجوال يرى الشاحن مصدر جهد مع مقاومة داخلية، أي مكافئ ثيفنن."],
        ["That is why the charger's voltage dips a little when the phone draws more current.", "ولهذا ينخفض جهد الشاحن قليلًا حين يسحب الجوال تيارًا أكبر."]] }],
      ["quiz", { i: 0, q: "To find $R_{Th}$ in a circuit with independent sources only, a voltage source is replaced by…", opts: ["a wire (short circuit)", "an open circuit", "it stays as it is"],
        whys: ["Switching off a voltage source makes its voltage zero.", "That is for a current source.", "To find $R_{Th}$ we switch the independent sources off."],
        hints: [["Zero volts across it: what element is that?", "صفر فولت عليه: أي عنصر هذا؟"]] }],
      ["quiz", { i: 1, q: "$V_{Th} = 20$ V and $I_N = 4$ A. The Thévenin resistance is…", opts: ["5 Ω", "80 Ω"],
        whys: ["$20/4$.", "$R_{Th} = V_{Th}/I_N$, not the product."],
        hints: [["$I_N$ is the short-circuit current.", "I_N هو تيار القصر."]] }],
      ["sum", { math: ["V_{Th} = v_{oc}, @quad R_{Th} = @frac{V_{Th}}{i_{sc}}"], beats: [
        ["Open the terminals: the voltage is $V_{Th}$.", "افتح الطرفين: الجهد هو V_Th."],
        ["Short them: the current is $i_{sc}$, and $R_{Th} = V_{Th}/i_{sc}$.", "اقصرهما: التيار هو i_sc، و R_Th = V_Th/i_sc."],
        ["Norton is the same network as a current source: $I_N = i_{sc}$, $R_N = R_{Th}$.", "نورتن هو الشبكة نفسها كمصدر تيار: I_N = i_sc و R_N = R_Th."]] }]
    ]
  });

  EX.add("c1-techniques-10", {
    chapter: CH,
    goals: [["Find $R_{Th}$ by switching off the independent sources.", "تحسب R_Th بإطفاء المصادر المستقلة."],
      ["Use a test source to find $R_{Th}$ when there are dependent sources.", "تستخدم مصدر اختبار لحساب R_Th عند وجود مصادر تابعة."],
      ["Know why dependent sources are never switched off.", "تعرف لماذا لا تُطفأ المصادر التابعة أبدًا."]],
    items: [
      ["idea", { label: "Two shortcuts for R_Th", beats: [
        ["$V_{Th}/i_{sc}$ always works, but it is not always the easiest. Two other methods are often simpler.", "طريقة V_Th/i_sc تعمل دائمًا لكنها ليست الأسهل دائمًا، وهناك طريقتان أبسط غالبًا."],
        ["Independent sources only: switch them off. A voltage source becomes a short, a current source an open. Then find the resistance seen between a and b.", "مصادر مستقلة فقط: نطفئها. مصدر الجهد يصبح قصرًا ومصدر التيار يصبح فتحًا، ثم نوجد المقاومة المرئية بين a و b."],
        ["With dependent sources: switch off only the independent ones, apply a test source between a and b, and $R_{Th} = v_T/i_T$. Dependent sources are never switched off: they depend on the circuit, not on a fixed value.", "مع المصادر التابعة: نطفئ المستقلة فقط ونطبّق مصدر اختبار بين a و b، فتكون R_Th = v_T/i_T. المصادر التابعة لا تُطفأ أبدًا لأنها تعتمد على الدائرة لا على قيمة ثابتة."]] }],
      ["ex", { title: "Method one", fig: 0, q: ["Find $R_{Th}$ of the previous lesson's circuit (25 V, 5, 20 and 4 Ω, and 3 A) by switching off the sources.", "أوجد R_Th لدائرة الدرس السابق (25 V و 5 و 20 و 4 Ω و 3 A) بإطفاء المصادر."],
        steps: [
          ["25 V @to @text{short}, @quad 3 A @to @text{open}", "Switch off both independent sources.", "نطفئ المصدرين المستقلين."],
          ["R_{ab} = 4 + @frac{5 @times 20}{5 + 20} = 8 @Omega", "From a and b: 5 Ω and 20 Ω are now in parallel, then in series with 4 Ω.", "من a و b: المقاومتان 5 Ω و 20 Ω الآن على التوازي، ثم على التوالي مع 4 Ω."]],
        check: [["8 Ω: the same as $V_{Th}/i_{sc} = 32/4$ in the previous lesson.", "8 Ω: النتيجة نفسها التي أعطتها V_Th/i_sc = 32/4 في الدرس السابق."]] }],
      ["ex", { title: "Example 4.11", q: ["Find $R_{Th}$ of the Example 4.10 circuit with a test source.", "مثال 4.11: أوجد R_Th لدائرة المثال 4.10 بمصدر اختبار."],
        steps: [
          ["5 V @to @text{short}; @quad @text{apply } v_T @text{ between a and b}", "Switch off the 5 V source only, keep both dependent sources, and apply $v_T$; $i_T$ is the current it supplies.", "نطفئ المصدر 5 V فقط ونبقي المصدرين التابعين، ونطبّق v_T، و i_T هو التيار الذي يعطيه."],
          ["i_T = @frac{v_T}{25} + 20i", "KCL at a: the test current splits into the 25 Ω and the dependent source.", "KCL عند a: تيار الاختبار يتقسم بين 25 Ω والمصدر التابع."],
          ["i = -@frac{3v_T}{2000}", "The left loop: the only source left there is $3v$, and $v = v_T$.", "الحلقة اليسرى: المصدر الوحيد الباقي فيها 3v، و v = v_T."],
          ["@frac{i_T}{v_T} = @frac{1}{25} - @frac{60}{2000} = @frac{1}{100}", "Substitute $i$ and divide by $v_T$.", "نعوّض i ونقسم على v_T."],
          ["R_{Th} = @frac{v_T}{i_T} = 100 @Omega", "The same 100 Ω as Example 4.10.", "النتيجة نفسها 100 Ω كما في المثال 4.10."]] }],
      ["when", { beats: [
        ["Independent sources only: the first method is fastest.", "مصادر مستقلة فقط: الطريقة الأولى أسرع."],
        ["Dependent sources: the test source, because the resistance can't be found by series and parallel. A test value like $v_T = 1$ V keeps the numbers easy.", "مصادر تابعة: مصدر الاختبار، لأن المقاومة لا تُحسب بالتوالي والتوازي. وقيمة اختبار مثل v_T = 1 V تجعل الأرقام سهلة."]] }],
      ["real", { beats: [
        ["Audio engineers measure an amplifier's output resistance with the same test-source idea.", "مهندسو الصوت يقيسون مقاومة خرج المكبر بفكرة مصدر الاختبار نفسها."],
        ["They apply a signal at the output and measure the current, because the amplifier is full of dependent sources.", "يطبّقون إشارة على الخرج ويقيسون التيار، لأن المكبر مليء بالمصادر التابعة."]] }],
      ["quiz", { i: 0, q: "A circuit has only a dependent source, no independent ones. Its Thévenin voltage is…", opts: ["zero, and we need a test source for $R_{Th}$", "impossible to calculate"],
        whys: ["With no independent source nothing drives a voltage or current.", "$V_{Th} = 0$, and $R_{Th}$ comes from a test source."],
        hints: [["What would make the first current flow?", "ما الذي سيجعل أول تيار يسري؟"]] }],
      ["sum", { beats: [
        ["Independent sources only: switch them off and reduce the resistance between a and b.", "مصادر مستقلة فقط: أطفئها واختزل المقاومة بين a و b."],
        ["Dependent sources: keep them on, apply a test source, $R_{Th} = v_T/i_T$.", "مصادر تابعة: أبقها تعمل، وطبّق مصدر اختبار، R_Th = v_T/i_T."],
        ["Every method gives the same $R_{Th}$: use one to check another.", "كل الطرق تعطي R_Th نفسها، فاستخدم إحداها للتحقق من الأخرى."]] }]
    ]
  });

  EX.add("c1-techniques-11", {
    chapter: CH,
    goals: [["Find the load resistance that receives maximum power.", "تجد مقاومة الحمل التي تستقبل أقصى قدرة."],
      ["Compute the maximum power from the Thévenin equivalent.", "تحسب أقصى قدرة من مكافئ ثيفنن."],
      ["Know that the efficiency at maximum transfer is only 50%.", "تعرف أن الكفاءة عند أقصى نقل 50% فقط."]],
    items: [
      ["idea", { beats: [
        ["A load receives the most power from a linear network when its resistance equals the network's Thévenin resistance: $R_L = R_{Th}$.", "يستقبل الحمل أقصى قدرة من شبكة خطية عندما تساوي مقاومته مقاومة ثيفنن للشبكة: R_L = R_Th."],
        ["Why? A very large load takes almost no current; a very small one has almost no voltage. In between there is a best value.", "لماذا؟ الحمل الكبير جدًا لا يأخذ تيارًا تقريبًا، والصغير جدًا لا جهد عليه تقريبًا، وبينهما قيمة مثلى."]] }],
      ["law", { label: "Deriving R_L = R_Th", steps: [
        ["p = i^2 R_L = @left(@frac{V_{Th}}{R_{Th} + R_L}@right)^2 R_L", "Replace the network by its Thévenin equivalent: one loop, so the load current is $V_{Th}/(R_{Th} + R_L)$.", "نستبدل الشبكة بمكافئ ثيفنن: حلقة واحدة، فتيار الحمل V_Th/(R_Th + R_L)."],
        ["@frac{dp}{dR_L} = 0", "The maximum is where the slope is zero: differentiate with respect to $R_L$.", "القيمة العظمى عند انعدام الميل، فنشتق بالنسبة إلى R_L."],
        ["(R_{Th} + R_L)^2 = 2R_L(R_{Th} + R_L)", "After the quotient rule, the numerator set to zero gives this.", "بعد قاعدة مشتقة القسمة، جعل البسط صفرًا يعطي هذا."],
        ["R_L = R_{Th}", "Divide by $R_{Th} + R_L$ and simplify.", "نقسم على R_Th + R_L ونبسّط."],
        ["p_{max} = @frac{V_{Th}^2}{4R_L}", "Put it back: half of $V_{Th}$ is across the load.", "نعوّض: نصف V_Th يكون على الحمل."]] }],
      ["ex", { title: "Example 4.12", fig: 0, q: ["(a) Find $R_L$ for maximum power. (b) Find that power. (c) What percentage of the 360 V source's power reaches the load?", "مثال 4.12: (أ) أوجد R_L لأقصى قدرة. (ب) أوجد هذه القدرة. (ج) ما النسبة المئوية من قدرة المصدر 360 V التي تصل للحمل؟"],
        steps: [
          ["V_{Th} = @frac{150}{180} @times 360 = 300 V", "Open the load: voltage division between 30 Ω and 150 Ω.", "نفتح الحمل: قسمة جهد بين 30 Ω و 150 Ω."],
          ["R_{Th} = @frac{150 @times 30}{180} = 25 @Omega @Rightarrow R_L = 25 @Omega", "Switch off the source: 30 Ω ∥ 150 Ω.", "نطفئ المصدر: 30 Ω ∥ 150 Ω."],
          ["p_{max} = @left(@frac{300}{50}@right)^2 25 = 900 W", "The load current is 300/50 = 6 A.", "تيار الحمل 300/50 = 6 A."],
          ["v_{ab} = 150 V, @quad i_s = @frac{360 - 150}{30} = 7 A", "Back in the real circuit: the source current.", "نعود للدائرة الحقيقية: تيار المصدر."],
          ["p_s = -7 @times 360 = -2520 W", "The source delivers 2520 W.", "المصدر يعطي 2520 W."],
          ["@frac{900}{2520} @times 100 = 35.71 @text{ %}", "Only about 36% reaches the load.", "يصل للحمل نحو 36% فقط."]],
        check: [["Maximum power is not high efficiency: much of the power is lost inside the network.", "أقصى قدرة لا تعني كفاءة عالية: جزء كبير من القدرة يضيع داخل الشبكة."]] }],
      ["real", { beats: [
        ["Antennas and audio amplifiers match the load to the source to get the most power.", "في الهوائيات ومكبرات الصوت نطابق الحمل مع المصدر لنحصل على أقصى قدرة."],
        ["The power grid wants efficiency instead, so loads are made much larger than the grid's resistance.", "أما شبكة الكهرباء فتريد الكفاءة، فتُجعل مقاومة الأحمال أكبر بكثير من مقاومة الشبكة."]] }],
      ["quiz", { i: 0, q: "A network has $R_{Th} = 50$ Ω. For maximum power in the load, $R_L$ =", opts: ["50 Ω", "the largest possible value", "zero"],
        whys: ["$R_L = R_{Th}$.", "A very large load cuts the current, so the power falls.", "A zero load has zero voltage, so zero power."],
        hints: [["Match the load to the network.", "طابق الحمل مع الشبكة."]] }],
      ["sum", { math: ["R_L = R_{Th}, @quad p_{max} = @frac{V_{Th}^2}{4R_{Th}}"], beats: [
        ["Find the Thévenin equivalent first.", "أوجد مكافئ ثيفنن أولًا."],
        ["Maximum power when $R_L = R_{Th}$, and then $p_{max} = V_{Th}^2/4R_L$.", "أقصى قدرة عندما R_L = R_Th، وعندها p_max = V_Th²/4R_L."],
        ["At that point the efficiency is at most 50%.", "وعند هذه النقطة لا تزيد الكفاءة على 50%."]] }]
    ]
  });

  EX.add("c1-techniques-12", {
    chapter: CH,
    goals: [["Apply superposition to a circuit with more than one independent source.", "تطبّق التراكب على دائرة فيها أكثر من مصدر مستقل."],
      ["Switch sources off the correct way.", "تطفئ المصادر بالطريقة الصحيحة."],
      ["Know that superposition does not apply to power.", "تعرف أن التراكب لا ينطبق على القدرة."]],
    items: [
      ["idea", { math: ["x = x' + x'' + @ldots"], beats: [
        ["In a linear circuit with several independent sources, the total response is the sum of the responses to each source alone.", "في الدائرة الخطية التي فيها عدة مصادر مستقلة، الاستجابة الكلية مجموع استجابات كل مصدر وحده."],
        ["Keep one source on and switch the others off: a voltage source becomes a short, a current source an open. Then add the voltages and currents.", "نُبقي مصدرًا واحدًا ونطفئ البقية: مصدر الجهد يصبح قصرًا ومصدر التيار فتحًا، ثم نجمع الجهود والتيارات."],
        ["Dependent sources are never switched off.", "المصادر التابعة لا تُطفأ أبدًا."]] }],
      ["ex", { title: "Lecture example", fig: 0, q: ["Find the branch currents by superposition.", "مثال المحاضرة: أوجد تيارات الفروع بالتراكب."],
        steps: [
          ["@frac{v_1 - 120}{6} + @frac{v_1}{3} + @frac{v_1}{2 + 4} = 0 @Rightarrow v_1 = 30 V", "The 120 V source alone: the 12 A source becomes an open, leaving one node equation.", "المصدر 120 V وحده: يصبح المصدر 12 A دائرة مفتوحة، فتبقى معادلة عقدة واحدة."],
          ["i_1' = 15 A, @quad i_2' = 10 A, @quad i_3' = i_4' = 5 A", "Every current from that one voltage.", "كل التيارات من هذا الجهد الواحد."],
          ["v_3 = -12 V, @quad v_4 = -24 V", "The 12 A source alone: the 120 V becomes a short; two node equations.", "المصدر 12 A وحده: يصبح المصدر 120 V قصرًا، ومعادلتا عقدتين."],
          ["i_1'' = 2 A, @quad i_2'' = -4 A, @quad i_3'' = 6 A, @quad i_4'' = -6 A", "The second set of currents, with the same reference directions.", "مجموعة التيارات الثانية بالاتجاهات المرجعية نفسها."],
          ["i_1 = 17 A, @quad i_2 = 6 A, @quad i_3 = 11 A, @quad i_4 = -1 A", "Add each pair, keeping their signs.", "نجمع كل زوج مع الحفاظ على إشاراته."]] }],
      ["ex", { title: "Example 4.13", q: ["Use superposition to find $v_o$ in a circuit with a 10 V source, a 5 A source and two dependent sources.", "مثال 4.13: استخدم التراكب لإيجاد vₒ في دائرة فيها مصدر 10 V ومصدر 5 A ومصدران تابعان."],
        steps: [
          ["v_o' = @frac{20}{25} @times 10 = 8 V", "The 10 V source alone; both dependent sources stay on.", "المصدر 10 V وحده، والمصدران التابعان يبقيان."],
          ["v_o'' = 16 V", "The 5 A source alone: two node equations give 16 V.", "المصدر 5 A وحده: معادلتا عقدتين تعطيان 16 V."],
          ["v_o = 8 + 16 = 24 V", "Add the two contributions.", "نجمع المساهمتين."]] }],
      ["mistake", { beats: [
        ["Superposition works for voltages and currents, not for power: power is not linear.", "التراكب يصلح للجهود والتيارات وليس للقدرة، لأن القدرة ليست خطية."],
        ["Add the currents first, then square: $(1 + 2)^2 @times 2 = 18$ W, not $2 + 8 = 10$ W.", "اجمع التيارات أولًا ثم ربّع: (1 + 2)² × 2 = 18 W، وليس 2 + 8 = 10 W."]] }],
      ["real", { beats: [
        ["Audio circuits carry a varying signal on top of a constant supply voltage.", "دوائر الصوت تحمل إشارة متغيرة فوق جهد تغذية ثابت."],
        ["Engineers analyze each alone, DC then signal, and add them: superposition.", "المهندسون يحللون كلًا منهما وحده، المستمر ثم الإشارة، ثم يجمعونهما: هذا هو التراكب."]] }],
      ["quiz", { i: 0, q: "When finding the voltage source's contribution, the other current source is replaced by…", opts: ["an open circuit", "a wire"],
        whys: ["Switching off a current source makes its current zero.", "A wire is for switching off a voltage source."],
        hints: [["Zero current: what element is that?", "صفر تيار: أي عنصر هذا؟"]] }],
      ["quiz", { i: 1, q: "Two contributions to a 2 Ω resistor's current: 1 A and 2 A. The resistor's power is…", opts: ["18 W", "10 W"],
        whys: ["The total current is 3 A, and $3^2 @times 2 = 18$ W.", "You added the two powers (2 + 8); power does not superpose."],
        hints: [["Add currents, not powers.", "اجمع التيارات لا القدرات."]] }],
      ["sum", { math: ["x = x' + x'' + @ldots"], beats: [
        ["One independent source at a time; voltage sources shorted, current sources opened.", "مصدر مستقل واحد في كل مرة، ومصادر الجهد قصر ومصادر التيار فتح."],
        ["Dependent sources stay on.", "المصادر التابعة تبقى تعمل."],
        ["Add voltages and currents, never powers.", "اجمع الجهود والتيارات، ولا تجمع القدرات أبدًا."]] }]
    ]
  });
})();
