% Signals and Systems — Differential and Difference Equations
%title: Solving Differential and Difference Equations
%ar-title: حل المعادلات التفاضلية والفرقية
%lesson: ss-ch2-6
%course: signals-systems

%% The differential equation with ode45
%ar: dy/dt + 2y = K e^{3t} بسكون ابتدائي. ode45 يحتاج dy/dt = f(t, y). نكتبها دالة مجهولة ونحل من 0 إلى 1.
K = 1;
f = @(t, y) -2*y + K*exp(3*t);
[t, y] = ode45(f, [0 1], 0);
yf = (K/5)*(exp(3*t) - exp(-2*t));
fprintf('y(1) ode45 = %.6f, formula = %.6f\n', y(end), yf(end))
plot(t, y, 'o', t, yf); grid on; xlabel('t'); legend('ode45', '(K/5)(e^{3t} - e^{-2t})', 'Location', 'northwest'); title('dy/dt + 2y = e^{3t}')

%% The difference equation with filter
%ar: y[n] − ½ y[n − 1] = x[n]. filter(b, a, x) يحل a(1)y[n] + a(2)y[n−1] + … = b(1)x[n] + …. هنا b = 1 و a = [1 −0.5]. الدخل δ يعطي h[n].
n = 0:15; d = double(n == 0);
h = filter(1, [1 -0.5], d);
fprintf('h[0..4] = %s\n', num2str(h(1:5)))
fprintf('max error vs 0.5^n = %.2e\n', max(abs(h - 0.5.^n)))

%% The same recursion by hand
%ar: filter تعمل نفس هذه الحلقة: y[n] = ½ y[n−1] + x[n]، ونبدأ بـ y[−1] = 0.
y = zeros(size(n)); prev = 0;
for k = 1:numel(n), y(k) = 0.5*prev + d(k); prev = y(k); end
fprintf('loop equals filter: %d\n', max(abs(y - h)) < 1e-15)

%%! Project idea: a digital thermometer smoother
%ar: مشروع: y[n] = a y[n−1] + (1 − a) x[n] مرشح «أسي» يستخدم في الحساسات (تمرير منخفض بسيط). كلما اقتربت a من 1 كان أنعم وأبطأ. طبّقه بـ filter.
rng(6); n = 0:199; temp = 25 + 3*(n > 80) + 0.6*randn(size(n));
for a = [0.5 0.9]
    ys = filter(1 - a, [1 -a], temp, a*temp(1));
    fprintf('a = %.1f: noise std after filter %.3f\n', a, std(ys(1:70)))
end
figure; plot(n, temp, ':', n, filter(0.1, [1 -0.9], temp, 0.9*temp(1))); grid on; xlabel('n'); ylabel('T (C)'); legend('raw', 'a = 0.9'); title('Exponential smoothing')
