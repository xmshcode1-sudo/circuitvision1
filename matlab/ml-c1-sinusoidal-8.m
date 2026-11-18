% Circuits 1 — The Mesh-Current Method (phasors)
%title: Mesh Currents with Complex Matrices
%ar-title: تيارات الحلقات بمصفوفة مركبة
%lesson: c1-sinusoidal-8
%course: circuits-1

%% The equations
%ar: الحلقة 1: (3 + j2) I1 − j2 I2 = 10. الحلقة 2: −j2 I1 + (j2 + 4 − j2) I2 = 0.
Z = [3 + 2j, -2j
     -2j,     2j + 4 - 2j];
I = Z \ [10; 0];
fprintf('I1 = %g%+gj A, I2 = %g%+gj A\n', real(I(1)), imag(I(1)), real(I(2)), imag(I(2)))
%check: abs(I(1) - (2 - 1j)) < 1e-9 && abs(I(2) - (0.5 + 1j)) < 1e-9

%% Complex power balance
%ar: S = ½ V I* لكل عنصر (قيم عظمى). المصدر يعطي ½ × 10 × I1*، والمقاومات تأخذ الجزء الحقيقي فقط، والملف والمكثف يتبادلان الجزء التخيلي.
Ssrc = 0.5*10*conj(I(1));
P = 0.5*3*abs(I(1))^2 + 0.5*4*abs(I(2))^2;
QL = 0.5*2*abs(I(1) - I(2))^2; QC = -0.5*2*abs(I(2))^2;
fprintf('source S = %.3f%+.3fj VA, resistors P = %.3f W, L Q = %.3f, C Q = %.3f VAR\n', real(Ssrc), imag(Ssrc), P, QL, QC)
%check: abs(real(Ssrc) - P) < 1e-9 && abs(imag(Ssrc) - (QL + QC)) < 1e-9

%%! Project idea: the same circuit by nodes
%ar: مشروع للتأكد: حل نفس الدائرة بجهود العقد ثم احسب التيارات منها. إذا اتفقت الطريقتان فحلك صحيح. هكذا تراجع أي واجب.
% node between L and C: (Va - 10)/3 + Va/(2j) + Va/(4 - 2j) = 0
Va = (10/3) / (1/3 + 1/(2j) + 1/(4 - 2j));
fprintf('by nodes: I1 = %.3f%+.3fj, I2 = %.3f%+.3fj\n', real((10 - Va)/3), imag((10 - Va)/3), real(Va/(4 - 2j)), imag(Va/(4 - 2j)))
%check: abs((10 - Va)/3 - I(1)) < 1e-9
