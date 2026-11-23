% Circuits 1 — The Passive Circuit Elements in the Frequency Domain
%title: Impedance of L and C (Assessments 9.3 and 9.4)
%ar-title: معاوقة الملف والمكثف (تمرينا 9.3 و 9.4)
%lesson: c1-sinusoidal-3
%course: circuits-1

%% Assessment 9.3: the inductor
%ar: ملف 20 mH وتياره 10 cos(10000t + 30°) mA: XL = ωL و ZL = jωL و VL = ZL·I.
w = 1e4; L = 20e-3; I = 10e-3*exp(1j*30*pi/180);
ZL = 1j*w*L; VL = ZL*I;
fprintf('XL = %g ohm, VL = %g at %g deg -> vL = %g cos(10000t %+g deg) V\n', w*L, abs(VL), angle(VL)*180/pi, abs(VL), angle(VL)*180/pi)

%% Assessment 9.4: the capacitor
%ar: مكثف 5 µF وجهده 30 cos(4000t + 25°) V: XC = −1/(ωC) و I = V/ZC.
w = 4000; C = 5e-6; V = 30*exp(1j*25*pi/180);
ZC = 1/(1j*w*C); Ic = V/ZC;
fprintf('XC = %g ohm, I = %g at %g deg A\n', imag(ZC), abs(Ic), angle(Ic)*180/pi)

%%! Project idea: reactance versus frequency
%ar: مشروع: نرسم |XL| و |XC| مقابل التردد: الملف يزيد مع التردد والمكثف يقل.
w = logspace(2, 6, 300);
loglog(w, w*20e-3, w, 1./(w*5e-6)); grid on; xlabel('\omega (rad/s)'); ylabel('|X| (\Omega)'); legend('20 mH', '5 \muF'); title('Reactance of L rises, of C falls')
