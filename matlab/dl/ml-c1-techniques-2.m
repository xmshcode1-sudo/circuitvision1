% Circuits 1 — The Node-Voltage Method and Dependent Sources
%title: Nodal Analysis with a Dependent Source
%ar-title: جهود العقد مع مصدر تابع
%lesson: c1-techniques-2
%course: circuits-1

%% Substitute the constraint into the equations
%ar: القيد ix = (24 − v1)/6. نعوّضه في معادلة v2: (v2 − v1)/10 − 4(24 − v1)/6 = 0. هكذا يبقى مجهولان فقط.
%ar: العقدة v1: v1(1/6 + 1/2 + 1/10) − v2/10 = 24/6. العقدة v2: v1(−1/10 + 4/6) + v2/10 = 4·24/6.
A = [1/6 + 1/2 + 1/10, -1/10
     -1/10 + 4/6,       1/10];
b = [24/6; 4*24/6];
v = A \ b;
ix = (24 - v(1))/6;
fprintf('v1 = %g V, v2 = %g V, ix = %g A\n', v, ix)

%% The matrix is no longer symmetric
%ar: المصدر التابع يكسر تماثل المصفوفة. لهذا لا نكتبها «بالنظر» كما في الدرس السابق، بل من المعادلات.
fprintf('symmetric? %d\n', isequal(A, A'))

%% Keep ix as a third unknown instead
%ar: طريقة أسهل للبرمجة: نترك ix مجهولًا ثالثًا ونضيف معادلة القيد صفًا. النتيجة نفسها.
A3 = [1/6 + 1/2 + 1/10, -1/10, 0
      -1/10,              1/10, -4
      1/6,                0,     1];
b3 = [24/6; 0; 24/6];
x = A3 \ b3;
fprintf('v1 = %g, v2 = %g, ix = %g\n', x)

%%! Project idea: an amplifier model
%ar: المصدر التابع هو نموذج الترانزستور والمكبر. غيّر الكسب (4 في المثال) وارسم v2: الخرج يكبر خطيًا مع الكسب. هذه بداية مشروع «تصميم مكبر بسيط».
k = 0:1:8; v2 = zeros(size(k));
for n = 1:numel(k)
    A3(2,3) = -k(n); s = A3 \ b3; v2(n) = s(2);
end
plot(k, v2, '-o'); grid on; xlabel('gain of the dependent source'); ylabel('v_2 (V)'); title('Output vs gain')
