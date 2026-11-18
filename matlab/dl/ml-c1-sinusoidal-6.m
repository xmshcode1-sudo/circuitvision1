% Circuits 1 — Source Transformations and Thevenin-Norton Equivalents
%title: Source Transformation with Phasors
%ar-title: تحويل المصادر بالفازورات
%lesson: c1-sinusoidal-6
%course: circuits-1

%% The example
%ar: 20∠0° V على التوالي مع 4 + j4 Ω ⇐ مصدر تيار Is = V/Z على التوازي مع نفس المعاوقة.
V = 20; Z = 4 + 4j;
Is = V/Z;
fprintf('|Z| = %.3f at %g deg\n', abs(Z), angle(Z)*180/pi)
fprintf('Is = %.3f at %.0f deg A\n', abs(Is), angle(Is)*180/pi)

%% Check with a load
%ar: أي حمل يرى نفس التيار من الصيغتين. نجرب حملًا مركبًا 2 − j3.
ZL = 2 - 3j;
i1 = V/(Z + ZL);
i2 = Is*Z/(Z + ZL);
fprintf('load current: %.4f at %.2f deg  vs  %.4f at %.2f deg\n', abs(i1), angle(i1)*180/pi, abs(i2), angle(i2)*180/pi)

%%! Project idea: Thevenin of an AC network from two loads
%ar: مثل درس DC: قِس (أو احسب) جهد الطرفين لحملين، وحل معادلتين مركبتين لـ VTh و ZTh. نفس الكود يصلح للقياسات.
VTh0 = 20; ZTh0 = Z;                          % the "unknown" network
ZLa = 10; ZLb = 5j;
va = VTh0*ZLa/(ZTh0 + ZLa); vb = VTh0*ZLb/(ZTh0 + ZLb);
% v = VTh - ZTh*i  ->  [1 -i] [VTh; ZTh] = v
x = [1, -va/ZLa; 1, -vb/ZLb] \ [va; vb];
fprintf('recovered VTh = %.3f%+.3fj, ZTh = %.3f%+.3fj\n', real(x(1)), imag(x(1)), real(x(2)), imag(x(2)))
