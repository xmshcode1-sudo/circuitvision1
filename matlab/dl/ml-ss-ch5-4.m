% Signals and Systems — The Inverse Laplace Transform
%title: Inverse Laplace with residue
%ar-title: عكس لابلاس بالدالة residue
%lesson: ss-ch5-4
%course: signals-systems

%% Example 1: simple poles
%ar: X = (s + 2)/(s³ + 4s² + 3s). residue(b, a) يعطي r (المعاملات) و p (الأقطاب) و k (حدود القسمة إن وجدت).
b = [1 2]; a = [1 4 3 0];
[r, p, k] = residue(b, a);
for m = 1:numel(r), fprintf('%+.4f / (s - (%g))\n', r(m), p(m)); end

%% Build x(t) from the residues and check it
%ar: x(t) = Σ r e^{pt} للـ t ≥ 0. نتحقق بأخذ تحويل لابلاس عدديًا عند s = 1 ومقارنته بـ X(1).
x = @(t) real(r.' * exp(p*t));
v = integral(@(t) x(t).*exp(-t), 0, Inf, 'ArrayValued', true);
fprintf('Laplace of x at s = 1: %.6f, X(1) = %.6f\n', v, polyval(b, 1)/polyval(a, 1))

%% Example 2: complex poles
%ar: المقام s³ + 3s² + 4s + 2 له أقطاب −1 ± j. البواقي مركبة مترافقة، ومجموعها حقيقي: e^{−t}(4 − 3cos t − 4 sin t).
[r, p] = residue([1 -2 1], [1 3 4 2]);
t = linspace(0, 6, 300);
x2 = real(r.' * exp(p*t));
xf = exp(-t).*(4 - 3*cos(t) - 4*sin(t));
fprintf('max error vs formula = %.2e\n', max(abs(x2 - xf)))
plot(t, x2, t, xf, '--'); grid on; xlabel('t'); legend('from residue', 'e^{-t}(4 - 3cos t - 4sin t)'); title('Example 2')

%% Example 3: improper fraction -> direct terms
%ar: (s³ + 2s² + 6)/(s² + 3s): درجة البسط أكبر، فـ k يعطي حدود القسمة الطويلة [1 −1] أي s − 1 ⇐ δ'(t) − δ(t).
[r, p, k] = residue([1 2 0 6], [1 3 0]);
fprintf('direct terms k = %s, residues %s at poles %s\n', mat2str(k), mat2str(r.', 4), mat2str(p.', 4))

%%! Project idea: step response of any circuit
%ar: مشروع: دائرة RLC توالي، استجابة الخطوة لجهد المكثف: Vc(s) = 1/(s(LCs² + RCs + 1)). residue يعطيك vc(t) لأي R و L و C بدون حل يدوي.
R = 2; L = 1; C = 0.25;
[r, p] = residue(1, conv([L*C R*C 1], [1 0]));
t = linspace(0, 10, 500); vc = real(r.' * exp(p*t));
figure; plot(t, vc); grid on; xlabel('t (s)'); ylabel('v_C (V)'); title(sprintf('RLC step response: R = %g, L = %g, C = %g', R, L, C))
fprintf('final value %.4f V\n', vc(end))
