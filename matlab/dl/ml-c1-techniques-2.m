% Circuits 1 — The Node-Voltage Method and Dependent Sources
%title: Nodal Analysis with a Dependent Source (Example 4.3)
%ar-title: جهود العقد مع مصدر تابع (مثال 4.3)
%lesson: c1-techniques-2
%course: circuits-1

%% The two node equations and the constraint
%ar: من المحاضرة: 15 v1 − 4 v2 = 200، و 8 v2 − 2 v1 − 40 iφ = 0 مع iφ = (v1 − v2)/5، فتصبح 16 v2 − 10 v1 = 0.
A = [15 -4
    -10 16];
b = [200; 0];
v = A \ b;
iphi = (v(1) - v(2)) / 5; p5 = 5 * iphi^2;
fprintf('v1 = %g V, v2 = %g V, iphi = %g A, p(5 ohm) = %g W\n', v(1), v(2), iphi, p5)

%% Three unknowns without substituting
%ar: بدل التعويض باليد نضع iφ مجهولًا ثالثًا ونضيف معادلة القيد كصف في المصفوفة. النتيجة نفسها.
A3 = [ 1/2 + 1/20 + 1/5, -1/5,              0
      -1/5,              1/5 + 1/10 + 1/2, -8/2
       1/5,             -1/5,              -1];
x = A3 \ [20/2; 0; 0];
fprintf('v1 = %g, v2 = %g, iphi = %g\n', x)

%%! Project idea: power balance
%ar: مشروع: نحسب قدرة كل عنصر ونتحقق أن المجموع صفر (المصدر 20 V والمصدر التابع 8 iφ والمقاومات).
v1 = x(1); v2 = x(2); ip = x(3);
i20 = (20 - v1)/2; idep = (v2 - 8*ip)/2;
P = [-20*i20, (20-v1)^2/2, v1^2/20, (v1-v2)^2/5, v2^2/10, (v2-8*ip)^2/2, 8*ip*idep];
fprintf('sum of powers = %.2e W\n', sum(P))
bar(P); grid on; ylabel('p (W)'); title('Example 4.3: every element''s power (sum = 0)')
