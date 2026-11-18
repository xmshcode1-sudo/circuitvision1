% Signals and Systems — Properties of the Z-Transform
%title: Z-Transform Properties: Convolution Is Multiplication
%ar-title: خواص تحويل Z: الالتفاف يصير ضربًا
%lesson: ss-ch6-2
%course: signals-systems

%% cos(w0 n) u[n]
%ar: X = (1 − z^{−1}cos ω0)/(1 − 2z^{−1}cos ω0 + z^{−2}) للـ |z| > 1. نتحقق بجمع 2000 حد عند z = 1.5.
w0 = pi/5; z = 1.5; n = 0:2000;
S = sum(cos(w0*n) .* z.^(-n));
Sf = (1 - cos(w0)/z)/(1 - 2*cos(w0)/z + z^(-2));
fprintf('sum %.10f, formula %.10f\n', S, Sf)
%check: abs(S - Sf) < 1e-12

%% Scaling: a^n cos(w0 n) u[n]
%ar: الضرب في a^n يستبدل z^{−1} بـ a z^{−1}. نفس الاختبار مع a = 0.8.
a = 0.8;
S = sum(a.^n .* cos(w0*n) .* z.^(-n));
Sf = (1 - a*cos(w0)/z)/(1 - 2*a*cos(w0)/z + a^2*z^(-2));
fprintf('sum %.10f, formula %.10f\n', S, Sf)
%check: abs(S - Sf) < 1e-12

%% Convolution = polynomial multiplication
%ar: لإشارات منتهية، X(z) كثيرة حدود في z^{−1}، وضرب كثيرتي حدود هو نفسه conv على المعاملات. لهذا conv في MATLAB تضرب كثيرات الحدود أيضًا.
x1 = [1 -2 1]; x2 = ones(1, 6);
y = conv(x1, x2);
fprintf('x1 * x2 = %s\n', num2str(y))
stem(0:7, y, 'filled'); grid on; xlabel('n'); title('(1 - 2z^{-1} + z^{-2})(1 + z^{-1} + ... + z^{-5}) = 1 - z^{-1} - z^{-6} + z^{-7}')
%check: isequal(y, [1 -1 0 0 0 0 -1 1])

%%! Project idea: a difference operator kills ramps
%ar: مشروع: x1 = (1 − z^{−1})² هو «الفرق الثاني»: يحول أي خط مستقيم (ramp) إلى صفر بعد أول عيّنتين. جربه على إشارة فيها ramp وقفزة: الخرج يكشف القفزات فقط (كاشف حواف).
n = 0:30; s = 0.5*n + 6*(n >= 15);
d2 = conv(s, [1 -2 1]); d2 = d2(1:numel(n));
figure; stem(n, d2, 'filled'); grid on; xlabel('n'); title('Second difference: only the jump at n = 15 remains')
fprintf('non-zero outputs (n >= 2) at n = %s\n', num2str(n(abs(d2) > 1e-12 & n >= 2)))
