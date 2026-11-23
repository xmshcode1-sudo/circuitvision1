% Circuits 1 — Circuits Containing Dependent Sources
%title: A Dependent Source in the Equations
%ar-title: المصدر التابع داخل المعادلات
%lesson: c1-elements-4
%course: circuits-1

%% The Fig. 2.22 example
%ar: المجهولان iΔ و i0. KVL يسار: 5 iΔ + 20 i0 = 500، و KCL عند b: i0 = iΔ + 5 iΔ أي 6 iΔ − i0 = 0. المصدر التابع يصير معاملًا في المصفوفة.
A = [5 20
     6 -1];
b = [500; 0];
x = A \ b; iD = x(1); i0 = x(2);
v0 = 20 * i0;
fprintf('iDelta = %g A, i0 = %g A, v0 = %g V\n', iD, i0, v0)

%% Example 2.10 and its power balance
%ar: مثال 2.10: 10 = 6 is، و 3 is = (2 + 3) i0. ثم نتحقق أن قدرة المصدرين = قدرة المقاومات = 21.7 W.
is = 10 / 6; i0 = 3*is / 5; vo = 3 * i0;
Psrc = -(10*is) - (3*is)*i0;
Pres = is^2*6 + i0^2*2 + i0^2*3;
fprintf('is = %.3f A, i0 = %g A, vo = %g V\n', is, i0, vo)
fprintf('sources deliver %.2f W, resistors absorb %.2f W\n', -Psrc, Pres)

%%! Project idea: sweep the gain of the dependent source
%ar: مشروع: نغيّر معامل المصدر التابع في مثال الشكل 2.22 (5 في المثال) ونرسم v0: كلما زاد الكسب زاد تيار 20 Ω.
g = 0:0.5:10; vv = zeros(size(g));
for k = 1:numel(g)
    s = [5 20; 1+g(k) -1] \ [500; 0]; vv(k) = 20*s(2);
end
plot(g, vv, '-o'); grid on; xlabel('gain of the dependent source'); ylabel('v_0 (V)'); title('v_0 vs the dependent-source gain (lecture: 5)')
fprintf('gain 5 -> v0 = %g V\n', vv(g == 5))
