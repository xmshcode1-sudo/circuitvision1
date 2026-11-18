% Signals and Systems — Poles, Zeros, ROC and Common Pairs
%title: One X(s), Three Possible Signals
%ar-title: X(s) واحدة وثلاث إشارات ممكنة
%lesson: ss-ch5-2
%course: signals-systems

%% Poles and zeros of the example
%ar: X = (2s + 4)/(s² + 4s + 3). roots تعطي الصفر والأقطاب، والمعامل هو نسبة المعاملين الأعليين.
b = [2 4]; a = [1 4 3];
fprintf('zero: %g, poles: %g %g, gain: %g\n', roots(b), sort(roots(a)), b(1)/a(1))
%check: abs(roots(b) + 2) < 1e-12

%% Partial fractions for 1/((s+1)(s+2))
%ar: residue يفك الكسر: 1/(s + 1) − 1/(s + 2). كل حد له شكلان: يميني e^{−at}u(t) أو يساري −e^{−at}u(−t) حسب الـ ROC.
[r, p] = residue(1, conv([1 1], [1 2]));
fprintf('residue %g at pole %g\n', [r.'; p.'])

%% The three signals
%ar: ROC يمين −1 ⇐ إشارة يمينية. بين −2 و −1 ⇐ ثنائية. يسار −2 ⇐ يسارية. نفس X(s) تمامًا!
t = linspace(-3, 3, 1201); u = @(t) double(t >= 0);
x1 = (exp(-t) - exp(-2*t)).*u(t);
x2 = -exp(-t).*u(-t) - exp(-2*t).*u(t);
x3 = (-exp(-t) + exp(-2*t)).*u(-t);
subplot(3,1,1); plot(t, x1); grid on; title('ROC Re\{s\} > -1: right-sided')
subplot(3,1,2); plot(t, x2); grid on; title('ROC -2 < Re\{s\} < -1: two-sided')
subplot(3,1,3); plot(t, x3); grid on; title('ROC Re\{s\} < -2: left-sided'); xlabel('t')

%% Check one of them numerically
%ar: الإشارة الثنائية: نحسب تحويلها عند s = −1.5 (داخل منطقتها) بالتكامل على كل الزمن ونقارن بـ 1/((s + 1)(s + 2)).
s = -1.5;
X = integral(@(t) -exp(-(1 + s)*t), -Inf, 0) + integral(@(t) -exp(-(2 + s)*t), 0, Inf);   % combine the exponents: e^{-t} alone overflows at -Inf
fprintf('two-sided at s = -1.5: %.6f, formula %.6f\n', X, 1/((s + 1)*(s + 2)))
%check: abs(X - 1/((s + 1)*(s + 2))) < 1e-8

%%! Project idea: a table of Laplace pairs that checks itself
%ar: مشروع: جدول أزواج لابلاس الشائعة، وكل سطر يتحقق عدديًا عند s = 2 قبل طباعته. أي خطأ في الجدول يظهر فورًا.
s = 2; w0 = 3; a0 = 1;
pairs = {'u(t)', @(t) ones(size(t)), 1/s; 'e^{-t}u(t)', @(t) exp(-a0*t), 1/(s + a0); 't u(t)', @(t) t, 1/s^2; 'cos(3t)u(t)', @(t) cos(w0*t), s/(s^2 + w0^2); 'sin(3t)u(t)', @(t) sin(w0*t), w0/(s^2 + w0^2)};
for k = 1:size(pairs, 1)
    v = integral(@(t) pairs{k,2}(t).*exp(-s*t), 0, Inf);
    fprintf('%-12s X(2) = %.6f  table %.6f\n', pairs{k,1}, v, pairs{k,3})
end
