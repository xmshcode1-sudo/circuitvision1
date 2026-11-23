% Circuits 1 — Source Transformations
%title: Source Transformation, Proved Numerically (Example 4.8)
%ar-title: تحويل المصادر بالأرقام (مثال 4.8)
%lesson: c1-techniques-8
%course: circuits-1

%% Example 4.8 step by step
%ar: 40 V مع 5 Ω ← 8 A، ثم 20 ∥ 5 = 4 Ω ← 32 V، ثم 4 + 6 + 10 = 20 Ω ← 1.6 A، ثم 20 ∥ 30 = 12 Ω ← 19.2 V. التيار = (19.2 − 6)/16.
par = @(a, b) a*b/(a + b);
i1 = 40/5;  R1 = par(20, 5);  v1 = i1*R1;
R2 = R1 + 6 + 10;  i2 = v1/R2;  R3 = par(R2, 30);  v3 = i2*R3;
I = (v3 - 6) / (4 + R3); p6 = 6*I;
fprintf('8 A -> %g V -> %g A -> %g V, I = %g A, p(6 V) = %g W (absorbing)\n', v1, i2, v3, I, p6)
%check: abs(v3 - 19.2) < 1e-12 && abs(I - 0.825) < 1e-12 && abs(p6 - 4.95) < 1e-12

%% Check with node voltages
%ar: للتحقق نحل الدائرة الأصلية بالعقد: a فوق 30 Ω، و b فوق 20 Ω، و c أسفل 20 Ω (بين 10 Ω والمصدر 40 V).
G = [1/4 + 1/30 + 1/6, -1/6,              0
     -1/6,             1/6 + 1/20 + 1/5, -1/20 - 1/5
     0,                -1/20 - 1/5,       1/20 + 1/10 + 1/5];
V = G \ [6/4; 40/5; -40/5];
Ic = (V(1) - 6) / 4;
fprintf('current into the 6 V source = %g A\n', Ic)
%check: abs(Ic - 0.825) < 1e-12

%%! Project idea: Example 4.9
%ar: مشروع: مثال 4.9: نحذف 125 Ω و 10 Ω (الحالة الخاصة)، ثم 10 A − 8 A = 2 A على 25 ∥ 100 ∥ 20 = 10 Ω فـ vo = 20 V.
Rp = 1/(1/25 + 1/100 + 1/20);
vo = (250/25 - 8) * Rp;
fprintf('vo = %g V\n', vo)
%check: abs(vo - 20) < 1e-12
