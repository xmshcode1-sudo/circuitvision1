% Circuits 1 — Kirchhoff's Laws
%title: KCL and KVL as a Matrix Equation
%ar-title: قانونا كيرشوف كمعادلة مصفوفات
%lesson: c1-elements-3
%course: circuits-1

%% Example 2.8
%ar: مثال 2.8: المجهولان i0 و i1. KCL عند b: i1 − i0 = 6، و KVL يسار: 10 i0 + 50 i1 = 120. نكتبهما مصفوفة ونحل بـ A\b.
A = [-1  1
     10 50];
b = [6; 120];
x = A \ b; i0 = x(1); i1 = x(2);
fprintf('i0 = %g A, i1 = %g A\n', i0, i1)
%check: abs(i0 + 3) < 1e-12 && abs(i1 - 3) < 1e-12

%% Power balance
%ar: القدرات: 50 Ω و 10 Ω ومصدر 120 V (−120 i0) ومصدر 6 A (−50 i1 × 6). مجموعها صفر.
P = [i1^2*50, i0^2*10, -120*i0, -(50*i1)*6];
fprintf('P50 = %g W, P10 = %g W, P120V = %g W, P6A = %g W, sum = %g\n', P, sum(P))
%check: abs(sum(P)) < 1e-9 && abs(P(4) + 900) < 1e-9

%%! Project idea: KCL on the lecture network
%ar: مشروع: شبكة المحاضرة فيها أربع عقد A و B و C و D وستة فروع. نكتب KCL كمصفوفة اتصال، ونتحقق أن مجموع الصفوف صفر (معادلة D تتكرر).
%      i1 i2 i3 i4 i5 i6
Inc = [ 1 -1  0  0  0  0      % A: i1 = i2
        0  1 -1 -1  0  0      % B: i2 = i3 + i4
        0  0  0  1 -1 -1      % C: i4 = i5 + i6
       -1  0  1  0  1  1];    % D: i1 = i3 + i5 + i6
fprintf('rank of the KCL matrix = %d (nodes - 1)\n', rank(Inc))
%check: rank(Inc) == 3 && all(sum(Inc) == 0)
