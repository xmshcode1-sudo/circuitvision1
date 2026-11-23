% Circuits 1 — Source Transformations and Thevenin-Norton Equivalent Circuits
%title: Source Transformation (Example 9.9) and Thevenin (Example 9.10)
%ar-title: تحويل المصادر (مثال 9.9) ومكافئ ثيفنن (مثال 9.10)
%lesson: c1-sinusoidal-6
%course: circuits-1

%% Example 9.9
%ar: 40∠0° مع 1 + j3 ← I = 40/(1 + j3)، ثم (1 + j3) ∥ (9 − j3)، ثم نعيده مصدر جهد ونقسم الجهد على فرع الخرج 10 − j19.
I = 40/(1 + 3j); Zp = (1 + 3j)*(9 - 3j)/((1 + 3j) + (9 - 3j));
Veq = I*Zp; Zs = Zp + 0.2 + 0.6j;
Vo = Veq*(10 - 19j)/(Zs + 10 - 19j);
fprintf('I = %g%+gj A, Zp = %g%+gj, Veq = %g%+gj V, Vo = %.2f%+.2fj V\n', real(I), imag(I), real(Zp), imag(Zp), real(Veq), imag(Veq), real(Vo), imag(Vo))
%check: abs(I - (4 - 12j)) < 1e-9 && abs(Zp - (1.8 + 2.4j)) < 1e-9 && abs(Vo - (36.12 - 18.84j)) < 1e-9

%% Example 9.10: VTh
%ar: بعد تحويل المصدر: 100 = (130 − j40) I + 10 Vx مع Vx = 100 − 10 I ← I = −900/(30 − j40)، و VTh = 10 Vx + 120 I.
I = -900/(30 - 40j); Vx = 100 - 10*I; VTh = 10*Vx + 120*I;
fprintf('I = %.2f at %.2f deg A, VTh = %g%+gj = %.2f at %.2f deg V\n', abs(I), angle(I)*180/pi, real(VTh), imag(VTh), abs(VTh), angle(VTh)*180/pi)
%check: abs(VTh - (784 - 288j)) < 1e-9

%%! Project idea: ZTh with a test source
%ar: مشروع: نعطل 120 V ونضع VT = 1 بين a و b. KCL عند a ومع القيد Vx نحسب IT، ثم ZTh = VT/IT = 91.2 − j38.4.
VT = 1;
Ia = VT/(10 - 40j);      % from a through -j40 and the 10 ohm equivalent to ground
Vx = 10*Ia;
Ib = (VT - 10*Vx)/120;   % from a through 120 ohm to the dependent source
IT = Ia + Ib;
ZTh = VT/IT;
fprintf('ZTh = %.1f %+.1fj ohm\n', real(ZTh), imag(ZTh))
%check: abs(ZTh - (91.2 - 38.4j)) < 1e-9
