% Circuits 1 — Circuits Containing Dependent Sources
%title: A Dependent Source in the Equations
%ar-title: المصدر التابع داخل المعادلات
%lesson: c1-elements-4
%course: circuits-1

%% Two unknowns, two equations
%ar: المجهولان: ix وجهد العقدة v. معادلة القيد: ix = (20 − v)/4 أي 4 ix + v = 20. و KCL: ix = v/8 + 0.5 ix أي 0.5 ix − v/8 = 0.
%ar: المصدر التابع يصير مجرد معامل في المصفوفة: لا يحتاج معاملة خاصة.
A = [4    1
     0.5 -1/8];
b = [20; 0];
x = A \ b;
ix = x(1); v = x(2);
fprintf('ix = %g A, v = %g V, dependent source = %g A\n', ix, v, 0.5*ix)

%% Gain sweep: what does the dependent source do?
%ar: نغيّر معامل المصدر التابع (0.5 في المثال) ونرى v. محدد المصفوفة det = g − 1.5، فعند g = 1.5 لا يوجد حل وحيد، وكلما اقتربنا منه تكبر القيم.
g = 0:0.1:1.4; vv = zeros(size(g));
for k = 1:numel(g)
    s = [4 1; 1-g(k) -1/8] \ [20; 0]; vv(k) = s(2);
end
plot(g, vv, '-o'); grid on; xlabel('gain of the dependent source'); ylabel('v (V)'); title('Node voltage vs dependent-source gain')
fprintf('g = %.1f -> v = %.3f V\n', [g; vv])

%%! Project idea: detect impossible designs
%ar: مشروع: قبل الحل افحص det(A). إذا كانت صفرًا (أو cond كبيرة جدًا) اطبع تحذيرًا بدل نتيجة خاطئة. جرّبه عند g = 1.5.
gbad = 1.5; Abad = [4 1; 1-gbad -1/8];
fprintf('det = %g, rank = %d\n', det(Abad), rank(Abad))
if rank(Abad) < 2, fprintf('no unique solution: the design must change\n'), end
