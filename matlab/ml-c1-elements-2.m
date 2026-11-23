% Circuits 1 — Ohm's Law
%title: Ohm's Law and the Power of a Resistor
%ar-title: قانون أوم وقدرة المقاومة
%lesson: c1-elements-2
%course: circuits-1

%% Example 2.3, the four circuits
%ar: مثال 2.3: (a) 1 A في 8 Ω، (b) 50 V على 0.2 S، (c) 1 A في 20 Ω والجهد ارتفاع، (d) 50 V على 25 Ω والتيار في اتجاه الارتفاع.
va = 1 * 8;      pa = va^2 / 8;
ib = 50 * 0.2;   pb = 50^2 * 0.2;
vc = -(1 * 20);  pc = vc^2 / 20;
id = -50 / 25;   pd = id^2 * 25;
fprintf('(a) va = %g V, p = %g W\n(b) ib = %g A, p = %g W\n(c) vc = %g V, p = %g W\n(d) id = %g A, p = %g W\n', va, pa, ib, pb, vc, pc, id, pd)
%check: va == 8 && pa == 8 && ib == 10 && pb == 500 && vc == -20 && pc == 20 && id == -2 && pd == 100

%% Three ways to the same power
%ar: كما في المحاضرة: p = vi و p = i²R و p = v²/R تعطي نفس القيمة، وهي موجبة دائمًا للمقاومة.
R = 8; i = 1; v = i * R;
fprintf('vi = %g, i^2 R = %g, v^2/R = %g W\n', v*i, i^2*R, v^2/R)
%check: v*i == i^2*R && i^2*R == v^2/R

%%! Project idea: the i-v line of a resistor
%ar: مشروع: نرسم i مقابل v لمقاومات مختلفة: خطوط مستقيمة ميلها الموصلية G = 1/R.
v = linspace(-50, 50, 101);
plot(v, v/8, v, v/20, v, v/25); grid on
xlabel('v (V)'); ylabel('i (A)'); legend('8 \Omega', '20 \Omega', '25 \Omega'); title('i = G v: the slope is the conductance')
