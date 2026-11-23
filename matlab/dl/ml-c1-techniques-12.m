% Circuits 1 — Superposition
%title: Superposition, Checked Against the Full Solution
%ar-title: التراكب والتحقق بالحل الكامل
%lesson: c1-techniques-12
%course: circuits-1

%% The 120 V source alone
%ar: مصدر 12 A مفتوح: (v1 − 120)/6 + v1/3 + v1/6 = 0 ← v1 = 30 V، ومنها i1′ = 15 و i2′ = 10 و i3′ = i4′ = 5 A.
v1 = (120/6) / (1/6 + 1/3 + 1/6);
Ia = [(120 - v1)/6, v1/3, v1/6, v1/6];
fprintf('i'' = %s A\n', mat2str(Ia))

%% The 12 A source alone
%ar: مصدر 120 V قصر: معادلتا عقد لـ v3 و v4 ← v3 = −12 و v4 = −24، ومنها i″.
G = [1/3 + 1/6 + 1/2, -1/2
     -1/2,             1/2 + 1/4];
v = G \ [0; -12];
Ib = [-v(1)/6, v(1)/3, (v(1) - v(2))/2, v(2)/4];
I = Ia + Ib;
fprintf('v3 = %g V, v4 = %g V\ni'''' = %s A\ni = %s A\n', v, mat2str(Ib), mat2str(I))

%%! Project idea: check with both sources on
%ar: مشروع: نحل الدائرة كاملة بالمصدرين معًا (عقدتان) ونقارن بالتراكب. ونرى أن القدرة لا تُجمع بالتراكب.
G2 = [1/6 + 1/3 + 1/2, -1/2
      -1/2,             1/2 + 1/4];
vf = G2 \ [120/6; -12];
Ifull = [(120 - vf(1))/6, vf(1)/3, (vf(1) - vf(2))/2, vf(2)/4];
fprintf('full solution i = %s A\n', mat2str(Ifull))
fprintf('power in 3 ohm: true %g W, sum of the two partial powers %g W\n', 3*Ifull(2)^2, 3*Ia(2)^2 + 3*Ib(2)^2)
