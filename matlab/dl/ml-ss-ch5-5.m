% Signals and Systems — The System Function: Causality, Stability, LCCDE
%title: Causality and Stability from the Poles
%ar-title: السببية والاستقرار من الأقطاب
%lesson: ss-ch5-5
%course: signals-systems

%% Partial fractions of H(s)
%ar: H = (s − 1)/((s + 1)(s − 2)) = (2/3)/(s + 1) + (1/3)/(s − 2).
[r, p] = residue([1 -1], conv([1 1], [1 -2]));
fprintf('%.4f / (s - (%g))\n', [r.'; p.'])

%% The three impulse responses
%ar: قطب في النصف الأيمن (2): إذا أردناه سببيًا ⇐ ينمو (غير مستقر). إذا أردناه مستقرًا ⇐ حده يصير يساريًا (غير سببي).
t = linspace(-3, 3, 1201); u = @(t) double(t >= 0);
hc = (2/3)*exp(-t).*u(t) + (1/3)*exp(2*t).*u(t);
hs = (2/3)*exp(-t).*u(t) - (1/3)*exp(2*t).*u(-t);
subplot(2,1,1); plot(t, hc); grid on; title('causal (ROC Re\{s\} > 2): grows -> unstable')
subplot(2,1,2); plot(t, hs); grid on; title('stable (ROC -1 < Re\{s\} < 2): two-sided -> not causal'); xlabel('t')
fprintf('integral of |h|: causal (to t = 10) %.1f, stable %.4f\n', integral(@(t) (2/3)*exp(-t) + (1/3)*exp(2*t), 0, 10), integral(@(t) (2/3)*exp(-t), 0, Inf) + integral(@(t) (1/3)*exp(2*t), -Inf, 0))

%% A causal system is stable if all poles are in the left half
%ar: قاعدة سريعة نكتبها دالة: سببي ومستقر ⇔ كل الأقطاب Re < 0. نختبر النظام وعكسه من مثال الدرس.
isStable = @(a) all(real(roots(a)) < 0);
fprintf('H = (s^2 + 2s - 3)/(s + 2): causal & stable? %d\n', isStable([1 2]))
fprintf('inverse (s + 2)/(s^2 + 2s - 3): causal & stable? %d (pole at %g)\n', isStable([1 2 -3]), max(roots([1 2 -3])))

%%! Project idea: stability margin of a feedback design
%ar: مشروع تحكم: نظام بتغذية راجعة مقامه s³ + 3s² + 3s + 1 + K. ارسم الأقطاب لقيم K وجد أكبر K يبقى معه مستقرًا. هذا ما يعمله مهندس التحكم.
K = linspace(0, 12, 241); maxRe = arrayfun(@(k) max(real(roots([1 3 3 1 + k]))), K);
figure; plot(K, maxRe); grid on; hold on; plot(K, 0*K, 'r--'); hold off; xlabel('K'); ylabel('max Re\{pole\}'); title('Stable while the curve is below zero')
fprintf('largest stable K = %.2f (theory: 8)\n', K(find(maxRe < 0, 1, 'last')))
