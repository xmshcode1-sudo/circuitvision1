% Signals and Systems — Properties of the Laplace Transform
%title: Laplace Properties, Verified
%ar-title: خواص تحويل لابلاس والتحقق منها
%lesson: ss-ch5-3
%course: signals-systems

%% Differentiation in s: t e^{-at} u(t)
%ar: −t x(t) ↔ dX/ds، فـ t e^{−at}u(t) ↔ 1/(s + a)². نتحقق بالتكامل عند عدة قيم لـ s.
a = 2;
for s = [0, 1, 0.5 + 2j]
    v = integral(@(t) t.*exp(-a*t).*exp(-s*t), 0, Inf);
    fprintf('s = %4.1f%+4.1fj: %9.6f%+9.6fj  1/(s+a)^2 = %9.6f%+9.6fj\n', real(s), imag(s), real(v), imag(v), real(1/(s + a)^2), imag(1/(s + a)^2))
end
%check: abs(integral(@(t) t.*exp(-2*t).*exp(-t), 0, Inf) - 1/9) < 1e-9

%% Shift in s: e^{-at} cos(w0 t) u(t)
%ar: الضرب في e^{−at} يزيح المتغير: s ← s + a. النتيجة (s + a)/((s + a)² + ω0²).
w0 = 4; s = 1.5;
v = integral(@(t) exp(-a*t).*cos(w0*t).*exp(-s*t), 0, Inf);
fprintf('numerical %.6f, property %.6f\n', v, (s + a)/((s + a)^2 + w0^2))
%check: abs(v - (s + a)/((s + a)^2 + w0^2)) < 1e-7

%% What the shift does to the poles
%ar: قطبا cos(4t) على المحور التخيلي ±4j. بعد الضرب في e^{−2t} ينتقلان يسارًا إلى −2 ± 4j: إشارة تتذبذب وتتلاشى.
t = linspace(0, 3, 600);
subplot(1,2,1); plot([0 0], [4 -4], 'x', [-2 -2], [4 -4], 'x', 'MarkerSize', 12, 'LineWidth', 2); grid on; axis([-3 1 -5 5]); xlabel('Re'); ylabel('Im'); title('Poles move left by a')
subplot(1,2,2); plot(t, cos(w0*t), t, exp(-a*t).*cos(w0*t)); grid on; xlabel('t'); legend('cos 4t', 'e^{-2t}cos 4t'); title('Time signals')

%%! Project idea: final value without simulation
%ar: مشروع: نظرية القيمة النهائية: y(∞) = lim s Y(s) عند s → 0 (إذا كان النظام مستقرًا). احسبها لاستجابة الخطوة لأي نظام بسطر واحد، وتحقق بمحاكاة.
b = [5]; aa = [1 3 2];
yinf = polyval(b, 0)/polyval(aa, 0);
[tt, yy] = ode45(@(t, y) [y(2); 5 - 3*y(2) - 2*y(1)], [0 15], [0; 0]);
fprintf('final value theorem: %g, simulation at t = 15: %.4f\n', yinf, yy(end, 1))
%check: abs(yy(end,1) - 2.5) < 1e-3
