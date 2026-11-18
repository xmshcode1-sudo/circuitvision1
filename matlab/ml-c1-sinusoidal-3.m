% Circuits 1 — The Passive Circuit Elements in the Frequency Domain
%title: Impedance of R, L and C versus Frequency
%ar-title: معاوقة R و L و C مع التردد
%lesson: c1-sinusoidal-3
%course: circuits-1

%% The example
%ar: ZL = jωL و ZC = 1/(jωC) = −j/(ωC). عند ω = 500 rad/s: الملف 40 mH والمكثف 100 µF.
w = 500; L = 40e-3; C = 100e-6;
ZL = 1j*w*L; ZC = 1/(1j*w*C);
fprintf('ZL = %+gj ohm, ZC = %+gj ohm, series sum = %g ohm\n', imag(ZL), imag(ZC), abs(ZL + ZC))
%check: abs(ZL - 20j) < 1e-12 && abs(ZC + 20j) < 1e-9

%% Reactance versus frequency
%ar: XL يزيد خطيًا مع ω، و |XC| ينقص كـ 1/ω. يتقاطعان عند ω0 = 1/√(LC) = 500 rad/s، وهو تردد الرنين.
w = linspace(50, 2000, 500);
plot(w, w*L, w, 1./(w*C)); grid on; xlabel('\omega (rad/s)'); ylabel('|X| (\Omega)'); ylim([0 80])
legend('X_L = \omega L', '|X_C| = 1/(\omega C)'); title('Reactance vs frequency')
w0 = 1/sqrt(L*C);
fprintf('crossing at w0 = %g rad/s\n', w0)
%check: abs(w0 - 500) < 1e-9

%%! Project idea: choose a capacitor to cancel a coil
%ar: مشروع: عند 60 Hz، ملف 0.1 H. أي مكثف يلغي مفاعلته؟ C = 1/(ω²L). ثم أقرب قيمة قياسية (E6) ونسبة الخطأ.
w = 2*pi*60; L = 0.1;
Cn = 1/(w^2*L);
E6 = [1 1.5 2.2 3.3 4.7 6.8]*1e-5;
[~, k] = min(abs(E6 - Cn));
fprintf('need %.2f uF -> use %.1f uF, remaining reactance %.2f ohm\n', Cn*1e6, E6(k)*1e6, w*L - 1/(w*E6(k)))
