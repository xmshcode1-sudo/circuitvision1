% Circuits 1 — The Mesh-Current Method and Dependent Sources
%title: Mesh Analysis with a Dependent Source (Example 4.5)
%ar-title: تيارات الحلقات مع مصدر تابع (مثال 4.5)
%lesson: c1-techniques-5
%course: circuits-1

%% Example 4.5 after substituting the constraint
%ar: من المحاضرة بعد التعويض بـ iφ = i1 − i3: 25 i1 − 5 i2 − 20 i3 = 50، و −5 i1 + 10 i2 − 4 i3 = 0، و −5 i1 − 4 i2 + 9 i3 = 0.
A = [25 -5 -20
     -5 10  -4
     -5 -4   9];
I = A \ [50; 0; 0];
p4 = (I(3) - I(2))^2 * 4;
fprintf('i1 = %g A, i2 = %g A, i3 = %g A, p(4 ohm) = %g W\n', I, p4)
%check: abs(I(2) - 26) < 1e-9 && abs(I(3) - 28) < 1e-9 && abs(p4 - 16) < 1e-9

%% The controlling current
%ar: iφ = i1 − i3 هو تيار المقاومة 20 Ω، والمصدر التابع قيمته 15 iφ.
iphi = I(1) - I(3);
fprintf('iphi = %g A, dependent source = %g V\n', iphi, 15*iphi)
%check: abs(iphi - 1.6) < 1e-9

%%! Project idea: four unknowns, no hand substitution
%ar: مشروع: نترك iφ مجهولًا رابعًا ونضيف معادلة القيد صفًا رابعًا. هكذا لا نحتاج أي تعويض باليد.
% unknowns i1 i2 i3 iphi; meshes: left (50 V,5,20), top (5,1,4), right (20,4, source 15 iphi)
M = [25 -5 -20  0
     -5 10  -4  0
    -20 -4  24 15
      1  0  -1 -1];
x = M \ [50; 0; 0; 0];
fprintf('i1 = %g, i2 = %g, i3 = %g, iphi = %g\n', x)
%check: max(abs(x(1:3) - I)) < 1e-9
