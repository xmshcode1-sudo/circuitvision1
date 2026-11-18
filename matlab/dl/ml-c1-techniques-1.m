% Circuits 1 — Introduction to the Node-Voltage Method
%title: Node Voltages with a Conductance Matrix
%ar-title: جهود العقد بمصفوفة الموصلية
%lesson: c1-techniques-1
%course: circuits-1

%% Write the node equations as G v = i
%ar: مثال الدرس: (v1 − 30)/5 + v1/3 + (v1 − v2)/6 = 0 و (v2 − v1)/6 = 2. نرتّب كل معادلة: معاملات v1 و v2 في صف، والثوابت في الطرف الأيمن.
%ar: الصف الأول: v1(1/5 + 1/3 + 1/6) − v2/6 = 30/5. الصف الثاني: −v1/6 + v2/6 = 2.
G = [1/5 + 1/3 + 1/6, -1/6
     -1/6,             1/6];
i = [30/5; 2];
v = G \ i;
fprintf('v1 = %g V, v2 = %g V\n', v)

%% Read the matrix
%ar: لاحظ شكل المصفوفة: على القطر مجموع موصليات كل عقدة، وخارجه سالب الموصلية بين عقدتين. وهي متماثلة. هذا قانون عام لدوائر المقاومات والمصادر المستقلة.
fprintf('G is symmetric: %d\n', isequal(G, G'))

%% Branch currents and the KCL check
%ar: من جهود العقد نحسب كل تيار. ثم نتحقق KCL عند v1: التيارات الخارجة مجموعها صفر.
%ar: إذا ظهر المجموع رقمًا مثل 3.55e-14 بدل 0 فهذا خطأ التقريب في حساب الأعداد العشرية داخل الحاسب، وهو صفر عمليًا. لذلك نقارن دائمًا بـ abs(x) < 1e-9 لا بـ x == 0.
v1 = v(1); v2 = v(2);
iR1 = (v1 - 30)/5; iR2 = v1/3; iR3 = (v1 - v2)/6;
fprintf('currents leaving v1: %g, %g, %g  (sum %g)\n', iR1, iR2, iR3, iR1 + iR2 + iR3)

%%! Project idea: a general nodal solver
%ar: مشروع مهم: دالة تبني G تلقائيًا من قائمة مقاومات (عقدة، عقدة، قيمة) ومصادر تيار. بعدها تحل أي دائرة مقاومات بنفس الكود. هذا قلب برامج المحاكاة مثل SPICE.
%ar: مصدر الجهد 30 V مع 5 Ω حوّلناه إلى مصدر تيار 6 A على التوازي مع 5 Ω (تحويل المصادر).
R = [1 0 5; 1 0 3; 1 2 6];          % [node a, node b, ohms], 0 = reference
Isrc = [1 6; 2 2];                   % [node, current injected]
v = nodal(R, Isrc, 2);
fprintf('general solver: v1 = %g V, v2 = %g V\n', v)

function v = nodal(R, Isrc, n)
    G = zeros(n); b = zeros(n, 1);
    for k = 1:size(R, 1)
        a = R(k,1); c = R(k,2); g = 1/R(k,3);
        if a, G(a,a) = G(a,a) + g; end
        if c, G(c,c) = G(c,c) + g; end
        if a && c, G(a,c) = G(a,c) - g; G(c,a) = G(c,a) - g; end
    end
    for k = 1:size(Isrc, 1), b(Isrc(k,1)) = b(Isrc(k,1)) + Isrc(k,2); end
    v = G \ b;
end
