% Circuits 1 — Power Factor Correction
%title: Power Factor Correction (Example 10.6)
%ar-title: تصحيح معامل القدرة (مثال 10.6)
%lesson: c1-power-7
%course: circuits-1

%% Example 10.6: the two loads
%ar: الحمل 1: 8 kW بمعامل 0.8 متقدم (Q سالبة). الحمل 2: 20 kVA بمعامل 0.6 متأخر. نجمع S، ثم تيار الخط ومعامل القدرة وخسارة الخط 0.05 Ω.
S1 = 8000 - 1j*8000*tan(acos(0.8));
S2 = 20000*0.6 + 1j*20000*sin(acos(0.6));
S = S1 + S2; Is = conj(S/250);
pf = cos(angle(S)); Pline = abs(Is)^2*0.05;
fprintf('S = %g %+gj VA, |Is| = %.2f A, pf = %.4f lagging, Pline = %.1f W\n', real(S), imag(S), abs(Is), pf, Pline)

%% The correction capacitor
%ar: نحتاج Q = −10 kVAR: X = 250²/Q = −6.25 Ω، و C = −1/(ωX) عند 60 Hz = 424.4 µF. بعد التصحيح |Is| = 80 A و Pline = 320 W.
Qc = -imag(S); X = 250^2/Qc; w = 2*pi*60; C = -1/(w*X);
Is2 = real(S)/250; Pline2 = Is2^2*0.05;
fprintf('X = %g ohm, C = %.1f uF, |Is| = %g A, Pline = %g W\n', X, C*1e6, Is2, Pline2)

%%! Project idea: line loss versus capacitor size
%ar: مشروع: نغيّر سعة المكثف من 0 إلى 800 µF ونرسم خسارة الخط: أقلها عند 424 µF (معامل القدرة = 1).
Cs = linspace(0, 800e-6, 401);
Qcap = -250^2 * w * Cs;
loss = abs((S + 1j*Qcap)/250).^2 * 0.05;
[lm, k] = min(loss);
plot(Cs*1e6, loss); grid on; xlabel('C (\muF)'); ylabel('line loss (W)'); title('Line loss is smallest at pf = 1')
fprintf('minimum loss %.1f W at C = %.0f uF\n', lm, Cs(k)*1e6)
