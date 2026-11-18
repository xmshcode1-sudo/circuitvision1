% Signals and Systems — The Convolution Integral
%title: The Convolution Integral, Numerically
%ar-title: تكامل الالتفاف عدديًا
%lesson: ss-ch2-3
%course: signals-systems

%% Approximate the integral with conv
%ar: ∫ x(τ) h(t − τ) dτ ≈ Σ x(k dt) h(t − k dt) dt. أي: conv(x, h) * dt. كلما صغرت dt زادت الدقة.
dt = 1e-3; t = 0:dt:5;
a = 2; x = exp(-a*t); h = ones(size(t));          % x = e^{-at}u(t), h = u(t)
y = conv(x, h)*dt; y = y(1:numel(t));
yf = (1/a)*(1 - exp(-a*t));
fprintf('max error = %.4f (shrinks with dt)\n', max(abs(y - yf)))
plot(t, y, t, yf, '--'); grid on; xlabel('t'); legend('conv \times dt', '(1/a)(1 - e^{-at})', 'Location', 'southeast'); title('Example 1')

%% Example 3: t^2 on (0,1) with a pulse on (-1,1)
%ar: الإشارتان تبدآن عند زمنين مختلفين، فبداية الناتج = مجموع البدايتين (−1). نقارن بالقوانين المجزأة.
dt = 1e-3; t1 = 0:dt:1; t2 = -1:dt:1;
x1 = t1.^2; x2 = ones(size(t2));
y = conv(x1, x2)*dt; ty = (0:numel(y)-1)*dt + t1(1) + t2(1);
yf = (ty + 1).^3/3 .* (ty >= -1 & ty < 0) + (1/3) .* (ty >= 0 & ty < 1) + (1/3 - (ty - 1).^3/3) .* (ty >= 1 & ty <= 2);
fprintf('max error = %.4f\n', max(abs(y - yf)))
figure; plot(ty, y, ty, yf, '--'); grid on; xlabel('t'); legend('numerical', 'piecewise formula'); title('Example 3')

%%! Project idea: RC circuit response to any input
%ar: مشروع يربط بالدوائر: دائرة RC استجابتها h(t) = (1/τ)e^{−t/τ}. الخرج لأي دخل = التفاف الدخل مع h. جرّب موجة مربعة: ستظهر الشحن والتفريغ كما في معمل الدوائر 2.
tau = 0.47e-3; dt = 1e-6; t = 0:dt:10e-3;
h = (1/tau)*exp(-t/tau);
vin = 10*(mod(t, 5e-3) < 2.5e-3);
vc = conv(vin, h)*dt; vc = vc(1:numel(t));
figure; plot(t*1e3, vin, t*1e3, vc); grid on; xlabel('t (ms)'); ylabel('V'); legend('input', 'v_C'); title('RC response by convolution')
