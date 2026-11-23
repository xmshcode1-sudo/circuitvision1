% Circuits 1 — Resistors in Parallel
%title: Series-Parallel Simplification (Example 3.1)
%ar-title: التبسيط بالتوالي والتوازي (مثال 3.1)
%lesson: c1-resistive-2
%course: circuits-1

%% Example 3.1 by reduction
%ar: مثال 3.1: 3 + 6 = 9 Ω، ثم 9 ∥ 18 = 6 Ω، ثم مع 4 Ω: Req = 10 Ω و is = 12 A و v1 = 72 V و i1 = 4 A و i2 = 8 A.
par = @(a, b) a*b/(a + b);
R9 = 3 + 6; Rp = par(18, R9); Req = 4 + Rp;
is = 120 / Req; v1 = is * Rp; i1 = v1/18; i2 = v1/9;
fprintf('Req = %g ohm, is = %g A, v1 = %g V, i1 = %g A, i2 = %g A\n', Req, is, v1, i1, i2)
%check: Req == 10 && is == 12 && v1 == 72 && i1 == 4 && i2 == 8

%% The same circuit by node voltages
%ar: للتحقق: عقدة واحدة v1: (v1 − 120)/4 + v1/18 + v1/9 = 0.
v1n = (120/4) / (1/4 + 1/18 + 1/9);
fprintf('v1 from KCL = %g V\n', v1n)
%check: abs(v1n - 72) < 1e-9

%%! Project idea: adding resistors in parallel
%ar: مشروع: نضيف مقاومات 100 Ω على التوازي واحدة بعد أخرى ونرسم Req: كل فرع جديد يقلل المقاومة المكافئة (Req = 100/n).
n = 1:10; Rn = 1 ./ (n / 100);
plot(n, Rn, '-o'); grid on; xlabel('number of 100 \Omega resistors in parallel'); ylabel('R_{eq} (\Omega)'); title('Parallel: the equivalent always drops')
%check: abs(Rn(4) - 25) < 1e-12
