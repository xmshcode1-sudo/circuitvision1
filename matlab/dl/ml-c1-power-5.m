% Circuits 1 — Power Calculations
%title: Load, Line and Source Power (Example 10.5)
%ar-title: قدرة الحمل والخط والمصدر (مثال 10.5)
%lesson: c1-power-5
%course: circuits-1

%% Example 10.5
%ar: حمل 39 + j26 وخط 1 + j4 ومصدر 250∠0° rms. IL = 250/(40 + j30)، و VL = ZL IL، و SL = VL IL*.
Zl = 39 + 26j; Zline = 1 + 4j; Vs = 250;
IL = Vs/(Zl + Zline); VL = Zl*IL; SL = VL*conj(IL);
fprintf('IL = %g %+gj A (%.0f at %.2f deg), VL = %g %+gj V, SL = %g %+gj VA\n', real(IL), imag(IL), abs(IL), angle(IL)*180/pi, real(VL), imag(VL), real(SL), imag(SL))

%% Line and source: complex power is conserved
%ar: Sline = |IL|² Zline، و Ss = −Vs IL*. مجموع القدرات المركبة = صفر.
Sline = abs(IL)^2 * Zline; Ss = -Vs*conj(IL);
fprintf('Sline = %g %+gj VA, Ss = %g %+gj VA, sum = %g\n', real(Sline), imag(Sline), real(Ss), imag(Ss), abs(SL + Sline + Ss))

%%! Project idea: why transmit at high voltage?
%ar: مشروع: نفس قدرة الحمل (975 W) بجهود مصدر أعلى: التيار يقل وخسارة الخط |I|²R تقل مع مربعه.
k = 1:10; loss = (abs(IL)./k).^2 * real(Zline);
semilogy(k, loss, '-o'); grid on; xlabel('voltage scale factor'); ylabel('line loss (W)'); title('Higher voltage, smaller current, much smaller line loss')
