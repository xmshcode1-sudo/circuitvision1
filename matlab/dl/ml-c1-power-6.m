% Circuits 1 — Maximum Power Transfer
%title: Maximum Power Transfer with Impedances (Example 10.8)
%ar-title: نقل القدرة القصوى بالمعاوقات (مثال 10.8)
%lesson: c1-power-6
%course: circuits-1

%% Example 10.8
%ar: بعد تحويلي المصادر: 16∠0° مع 4 + j3، و −j6 بين a و b. VTh = 16(−j6)/(4 − j3) و ZTh = (4 + j3) ∥ (−j6). ثم ZL = ZTh* و Pmax = |VTh|²/(8 RL).
VTh = 16*(-6j)/(4 + 3j - 6j);
ZTh = (4 + 3j)*(-6j)/(4 + 3j - 6j);
ZL = conj(ZTh); Pmax = abs(VTh)^2/(8*real(ZL));
fprintf('VTh = %.2f at %.2f deg V, ZTh = %.2f %+.2fj, ZL = %.2f %+.2fj, Pmax = %g W\n', abs(VTh), angle(VTh)*180/pi, real(ZTh), imag(ZTh), real(ZL), imag(ZL), Pmax)

%% Search all loads
%ar: نبحث في شبكة من قيم RL و XL عن أكبر قدرة: القمة عند 5.76 + j1.68.
[RL, XL] = meshgrid(linspace(0.5, 15, 291), linspace(-6, 8, 281));
I = VTh ./ (ZTh + RL + 1j*XL); Pl = 0.5*abs(I).^2 .* RL;
[pm, k] = max(Pl(:));
fprintf('best load found: %.2f %+.2fj ohm, %.3f W\n', RL(k), XL(k), pm)

%%! Project idea: contour of the load power
%ar: مشروع: نرسم خطوط تساوي القدرة في مستوى (RL, XL): القمة نقطة واحدة هي مرافق ZTh.
contour(RL, XL, Pl, 20); grid on; xlabel('R_L (\Omega)'); ylabel('X_L (\Omega)'); title('Load power: the peak is at Z_L = Z_{Th}^*')
