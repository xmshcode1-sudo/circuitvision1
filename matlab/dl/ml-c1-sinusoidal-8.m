% Circuits 1 — The Mesh-Current Method
%title: Mesh Currents with Complex Matrices (Example 9.12)
%ar-title: تيارات الحلقات بمصفوفة مركّبة (مثال 9.12)
%lesson: c1-sinusoidal-8
%course: circuits-1

%% Example 9.12
%ar: من المحاضرة: 150 = (13 − j14) I1 − (12 − j16) I2، و 0 = (27 + j16) I1 − (26 + j13) I2.
A = [13 - 14j, -(12 - 16j)
     27 + 16j, -(26 + 13j)];
I = A \ [150; 0];
Ix = I(1) - I(2);
fprintf('I1 = %g %+gj A, I2 = %g %+gj A, Ix = %g %+gj A\n', real(I(1)), imag(I(1)), real(I(2)), imag(I(2)), real(Ix), imag(Ix))

%% The three voltages and the KVL check
%ar: V1 = (1 + j2) I1، و V2 = (12 − j16) Ix، و V3 = (1 + j3) I2. ونتحقق −150 + V1 + V2 = 0.
V1 = (1 + 2j)*I(1); V2 = (12 - 16j)*Ix; V3 = (1 + 3j)*I(2);
fprintf('V1 = %g%+gj, V2 = %g%+gj, V3 = %g%+gj V\n', real(V1), imag(V1), real(V2), imag(V2), real(V3), imag(V3))

%%! Project idea: three unknowns with the constraint
%ar: مشروع: نترك Ix مجهولًا ثالثًا ونضيف القيد Ix = I1 − I2 صفًا ثالثًا، بدل التعويض باليد.
M = [13 - 14j, -(12 - 16j), 0
     -(12 - 16j), 13 - 13j,  39
     1,           -1,       -1];
x = M \ [150; 0; 0];
fprintf('I1 = %g%+gj, I2 = %g%+gj, Ix = %g%+gj\n', real(x(1)), imag(x(1)), real(x(2)), imag(x(2)), real(x(3)), imag(x(3)))
