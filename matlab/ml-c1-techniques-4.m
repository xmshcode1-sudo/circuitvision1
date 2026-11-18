% Circuits 1 — Introduction to the Mesh-Current Method
%title: Mesh Currents with a Resistance Matrix
%ar-title: تيارات الحلقات بمصفوفة المقاومة
%lesson: c1-techniques-4
%course: circuits-1

%% The two mesh equations
%ar: الحلقة 1: 13 i1 − 10 i2 = 40. الحلقة 2: −10 i1 + 12 i2 = −20. على القطر مجموع مقاومات الحلقة، وخارجه سالب المقاومة المشتركة.
R = [13 -10
     -10 12];
v = [40; -20];
i = R \ v;
fprintf('i1 = %g A, i2 = %g A, current in the 10 ohm = %g A\n', i, i(1) - i(2))
%check: all(abs(i - [5; 2.5]) < 1e-9)

%% Power of every element
%ar: 3 Ω يحمل i1، و 2 Ω يحمل i2، و 10 Ω يحمل الفرق. المصدر 40 V يولّد 40·i1، و 20 V يمتص 20·i2.
%ar: إذا ظهر المجموع رقمًا مثل 3.55e-14 بدل 0 فهذا خطأ التقريب في حساب الأعداد العشرية داخل الحاسب، وهو صفر عمليًا. لذلك نقارن دائمًا بـ abs(x) < 1e-9 لا بـ x == 0.
p = [3*i(1)^2, 2*i(2)^2, 10*(i(1) - i(2))^2, -40*i(1), 20*i(2)];
fprintf('powers: %g %g %g %g %g  sum = %g W\n', p, sum(p))
%check: abs(sum(p)) < 1e-9

%%! Project idea: sweep a resistor
%ar: مشروع: كيف يتغير تيار المقاومة المشتركة إذا غيّرنا قيمتها من 1 إلى 100 Ω؟ نبني المصفوفة داخل حلقة بدل كتابتها يدويًا.
Rm = logspace(0, 2, 60); iM = zeros(size(Rm));
for k = 1:numel(Rm)
    x = [3 + Rm(k), -Rm(k); -Rm(k), 2 + Rm(k)] \ [40; -20]; iM(k) = x(1) - x(2);
end
semilogx(Rm, iM); grid on; xlabel('shared resistor (\Omega)'); ylabel('its current (A)'); title('Current in the shared branch')
