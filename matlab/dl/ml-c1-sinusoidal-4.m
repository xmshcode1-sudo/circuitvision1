% Circuits 1 — Kirchhoff's Laws in the Frequency Domain
%title: KVL with Phasors (Example 9.6)
%ar-title: KVL بالفيزورات (مثال 9.6)
%lesson: c1-sinusoidal-4
%course: circuits-1

%% Example 9.6
%ar: 90 Ω و 32 mH و 5 µF على التوالي مع 750∠30° عند ω = 5000. المعاوقات تُجمع، ثم I = V/Z.
w = 5000; Vs = 750*exp(1j*30*pi/180);
Z = 90 + 1j*w*32e-3 + 1/(1j*w*5e-6);
I = Vs/Z;
fprintf('Z = %g %+gj = %g at %.2f deg ohm\nI = %g at %.2f deg A -> i = %g cos(5000t %+.2f deg) A\n', real(Z), imag(Z), abs(Z), angle(Z)*180/pi, abs(I), angle(I)*180/pi, abs(I), angle(I)*180/pi)

%% KVL closes with phasors, not with magnitudes
%ar: مجموع أطوار الجهود = Vs، أما مجموع مقاديرها فأكبر من 750 V.
VR = 90*I; VL = 1j*w*32e-3*I; VC = I/(1j*w*5e-6);
fprintf('|VR| + |VL| + |VC| = %.1f V, |VR + VL + VC| = %.1f V\n', abs(VR)+abs(VL)+abs(VC), abs(VR+VL+VC))

%%! Project idea: KVL in the time domain
%ar: مشروع: نرسم الجهود الثلاثة ومجموعها مع الزمن: المجموع يطابق جهد المصدر في كل لحظة.
t = linspace(0, 2*2*pi/w, 600); tf = @(P) abs(P)*cos(w*t + angle(P));
plot(t*1000, tf(VR), t*1000, tf(VL), t*1000, tf(VC), t*1000, tf(VR)+tf(VL)+tf(VC), 'k--'); grid on
xlabel('t (ms)'); ylabel('v (V)'); legend('v_R', 'v_L', 'v_C', 'sum = v_s'); title('Example 9.6: KVL in the time domain')
