% Circuits 1 — The rms Value and Power Calculations
%title: rms Values and the Power Triangle
%ar-title: القيمة الفعالة ومثلث القدرة
%lesson: c1-power-3
%course: circuits-1

%% The example: a motor
%ar: |S| = Vrms Irms، و P = |S| × pf، و Q = |S| × sin θ. pf = 0.8 متأخر يعني θ موجبة.
V = 220; I = 5; pf = 0.8;
S = V*I; P = S*pf; Q = S*sqrt(1 - pf^2);
fprintf('|S| = %g VA, P = %g W, Q = %g VAR\n', S, P, Q)
%check: S == 1100 && P == 880 && abs(Q - 660) < 1e-9

%% rms of any waveform, numerically
%ar: rms لأي إشارة = جذر متوسط مربعها. نجرب الجيبية (القمة/√2) والمربعة (= القمة) والمثلثية (القمة/√3).
t = linspace(0, 1, 100001); t(end) = [];
x1 = sin(2*pi*t); x2 = sign(sin(2*pi*t)); x3 = 2*abs(2*(t - floor(t + 0.5))) - 1;
fprintf('rms: sine %.4f, square %.4f, triangle %.4f\n', sqrt(mean(x1.^2)), sqrt(mean(x2.^2)), sqrt(mean(x3.^2)))
%check: abs(sqrt(mean(x1.^2)) - 1/sqrt(2)) < 1e-4 && abs(sqrt(mean(x3.^2)) - 1/sqrt(3)) < 1e-4

%% The power triangle
%ar: نرسم المثلث: P أفقي، و Q رأسي، و |S| الوتر.
plot([0 P P 0], [0 0 Q 0], 'LineWidth', 2); grid on; axis equal
text(P/2, -40, 'P = 880 W'); text(P + 15, Q/2, 'Q = 660 VAR'); text(P/2 - 120, Q/2 + 40, '|S| = 1100 VA')
xlabel('W'); ylabel('VAR'); title('Power triangle'); axis([-50 1000 -100 750])

%%! Project idea: monthly cost of a motor
%ar: مشروع: المحرك يعمل 8 ساعات يوميًا. الطاقة الشهرية من P (وليس |S|): الفاتورة على القدرة الحقيقية. السعر مثال فقط.
kWh = P/1000*8*30;
fprintf('energy %.1f kWh per month -> %.2f at 0.18 per kWh\n', kWh, kWh*0.18)
