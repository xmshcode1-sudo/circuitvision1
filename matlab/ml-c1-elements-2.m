% Circuits 1 — Ohm's Law
%title: Ohm's Law, Power and the i-v Line
%ar-title: قانون أوم والقدرة وخط i-v
%lesson: c1-elements-2
%course: circuits-1

%% The example
%ar: مقاومة 5 Ω والتيار 2 A يدخل من +. الجهد v = iR والقدرة i²R والموصلية G = 1/R.
R = 5; i = 2;
v = i*R; p = i^2*R; G = 1/R;
fprintf('v = %g V, p = %g W (check v^2/R = %g W), G = %g S\n', v, p, v^2/R, G)
%check: v == 10 && p == 20 && G == 0.2

%% The i-v characteristic
%ar: المقاومة الخطية: خط مستقيم يمر بالأصل وميله 1/R. نرسم ثلاث مقاومات: الأصغر أشد ميلًا (تمرر تيارًا أكبر لنفس الجهد).
v = linspace(-10, 10, 101);
plot(v, v/2, v, v/5, v, v/10); grid on
xlabel('v (V)'); ylabel('i (A)'); title('i-v lines of resistors')
legend('R = 2 \Omega', 'R = 5 \Omega', 'R = 10 \Omega', 'Location', 'northwest')

%% Power is never negative in a resistor
%ar: p = i²R ≥ 0 دائمًا مهما كانت إشارة التيار: المقاومة تمتص دائمًا.
i = -3:3;
fprintf('i = %+g A -> p = %g W\n', [i; i.^2*5])

%%! Project idea: choose the resistor's power rating
%ar: مشروع عملي: لكل تيار متوقع، احسب القدرة واختر أقرب تقدير قياسي للمقاومة (1/8، 1/4، 1/2، 1، 2 W) مع هامش أمان ×2.
ratings = [0.125 0.25 0.5 1 2];
R = 220;
for I = [0.01 0.03 0.05 0.08]
    P = I^2*R; k = find(ratings >= 2*P, 1);
    fprintf('I = %4.0f mA: P = %6.1f mW -> use %g W\n', I*1e3, P*1e3, ratings(k))
end
