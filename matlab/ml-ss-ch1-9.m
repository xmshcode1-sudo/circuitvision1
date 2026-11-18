% Signals and Systems — Stability, Time Invariance and Linearity
%title: Testing Linearity, Time Invariance and Stability
%ar-title: اختبار الخطية وعدم التغيّر مع الزمن والاستقرار
%lesson: ss-ch1-9
%course: signals-systems

%% The systems of the lesson
%ar: y[n] = n x[n] و y = x² و y = 2x + 3 و y[n] = x[2n]. نمثل كل نظام دالة على محور n من 0 إلى 40.
n = 0:40;
S = {@(x) n.*x, @(x) x.^2, @(x) 2*x + 3, @(x) [x(1:2:end), zeros(1, 20)]};
names = {'n x[n]', 'x^2', '2x + 3', 'x[2n]'};

%% Linearity: superposition with random inputs
%ar: الخطي يحقق: T{a x1 + b x2} = a T{x1} + b T{x2}. نختبر بإشارات عشوائية وأرقام a و b عشوائية.
rng(2); x1 = randn(1, 41); x2 = randn(1, 41); a = 1.7; b = -0.6;
for k = 1:4
    e = max(abs(S{k}(a*x1 + b*x2) - (a*S{k}(x1) + b*S{k}(x2))));
    fprintf('%-7s linear: %d\n', names{k}, e < 1e-9)
end

%% Time invariance: shift then apply vs apply then shift
%ar: لا يتغير مع الزمن: إزاحة الدخل بـ n0 تزيح الخرج بنفس n0. نقارن عند n ≥ 2n0 لنتجنب أطراف المتجه.
n0 = 3; x = [zeros(1,5), randn(1,10), zeros(1,26)];
shift = @(v) [zeros(1, n0), v(1:end-n0)];
for k = 1:4
    d = S{k}(shift(x)) - shift(S{k}(x));
    fprintf('%-7s time-invariant: %d\n', names{k}, max(abs(d(1:20))) < 1e-9)
end

%% Stability: a bounded input
%ar: مستقر BIBO: كل دخل محدود يعطي خرجًا محدودًا. y = t x(t) مع x = 1 يعطي خرجًا ينمو بلا حد. و e^{x} محدود دائمًا.
t = linspace(0, 100, 1001); x = ones(size(t));
fprintf('y = t x(t):   max |y| = %g (grows with the window)\n', max(abs(t.*x)))
fprintf('y = e^{x(t)}: max |y| = %g\n', max(abs(exp(x))))
plot(t, t.*x, t, exp(x)); grid on; xlabel('t'); legend('t x(t)', 'e^{x(t)}', 'Location', 'northwest'); title('Bounded input x = 1')

%%! Project idea: a full system tester
%ar: مشروع: دالة test_system(T) تشغّل كل الاختبارات وتطبع جدولًا. انتبه: الاختبار العددي يثبت أن الخاصية غير متحققة إذا فشل، لكن نجاحه دليل قوي وليس برهانًا رياضيًا.
fprintf('\n%-7s %s\n', 'system', 'linear | TI');
for k = 1:4
    lin = max(abs(S{k}(a*x1 + b*x2) - (a*S{k}(x1) + b*S{k}(x2)))) < 1e-9;
    xx = [zeros(1,5), randn(1,10), zeros(1,26)]; d = S{k}(shift(xx)) - shift(S{k}(xx));
    fprintf('%-7s %6d | %d\n', names{k}, lin, max(abs(d(1:20))) < 1e-9)
end
