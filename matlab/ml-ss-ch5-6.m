% Signals and Systems — The Unilateral Laplace Transform
%title: Initial Conditions: Zero-Input and Zero-State
%ar-title: الشروط الابتدائية: الدخل الصفري والحالة الصفرية
%lesson: ss-ch5-6
%course: signals-systems

%% Solve with ode45
%ar: y'' + 3y' + 2y = 2u(t) مع y(0) = 3 و y'(0) = −5. ode45 يحتاج نظامًا من الرتبة الأولى: y1 = y و y2 = y'.
f = @(t, y) [y(2); 2 - 3*y(2) - 2*y(1)];
[t, Y] = ode45(f, [0 6], [3; -5]);
yf = 1 - exp(-t) + 3*exp(-2*t);
fprintf('max error vs 1 - e^{-t} + 3e^{-2t}: %.2e\n', max(abs(Y(:,1) - yf)))
%check: max(abs(Y(:,1) - yf)) < 1e-3

%% Split into zero-input and zero-state
%ar: الدخل الصفري: نفس المعادلة بدون دخل ومع الشروط الابتدائية. الحالة الصفرية: الدخل مع شروط صفرية. مجموعهما الحل الكامل.
[t1, Yzi] = ode45(@(t, y) [y(2); -3*y(2) - 2*y(1)], t, [3; -5]);
[t2, Yzs] = ode45(f, t, [0; 0]);
plot(t, Yzi(:,1), t, Yzs(:,1), t, Yzi(:,1) + Yzs(:,1), t, yf, 'k--'); grid on; xlabel('t')
legend('zero-input e^{-t} + 2e^{-2t}', 'zero-state 1 - 2e^{-t} + e^{-2t}', 'sum', 'formula'); title('y = zero-input + zero-state')
fprintf('max |zi + zs - y| = %.2e\n', max(abs(Yzi(:,1) + Yzs(:,1) - yf)))
%check: max(abs(Yzi(:,1) + Yzs(:,1) - yf)) < 2e-3

%% The same with residue
%ar: من التحويل: Y = 2/(s(s+1)(s+2)) + (3s + 4)/((s+1)(s+2)). نجمعهما في كسر واحد ونستخدم residue.
num = conv([3 4], [1 0]) + [0 0 2]; den = conv([1 0], [1 3 2]);
[r, p] = residue(num, den);
fprintf('%+.4f / (s - (%g))\n', [r.'; p.'])

%%! Project idea: an RC circuit with a charged capacitor
%ar: مشروع: مكثف مشحون مبدئيًا 5 V، والمصدر 10 V يغلق عند t = 0. استخدم نفس الفكرة (دخل صفري + حالة صفرية) وارسم الجهد. قارنه بقراءات معمل الدوائر 2.
RC = 1e-3; v0 = 5; Vs = 10; t = linspace(0, 5e-3, 400);
vzi = v0*exp(-t/RC); vzs = Vs*(1 - exp(-t/RC));
figure; plot(t*1e3, vzi, t*1e3, vzs, t*1e3, vzi + vzs); grid on; xlabel('t (ms)'); ylabel('v_C (V)'); legend('zero-input', 'zero-state', 'total', 'Location', 'east'); title('RC with initial charge')
