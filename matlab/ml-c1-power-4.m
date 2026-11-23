% Circuits 1 — Complex Power
%title: Complex Power and the Power Triangle (Example 10.4)
%ar-title: القدرة المركّبة ومثلث القدرة (مثال 10.4)
%lesson: c1-power-4
%course: circuits-1

%% Example 10.4
%ar: 8 kW بمعامل 0.8 متأخر على 240 V rms: |S| = P/pf، و Q = |S| sin θ (موجبة لأنه حثي)، و Ieff = P/(V pf)، و Z = (V/Ieff)∠θ.
P = 8000; pf = 0.8; V = 240;
th = acos(pf); S = P/pf; Q = S*sin(th);
Ieff = P/(V*pf); Z = V/Ieff * exp(1j*th);
fprintf('S = %g + j%g VA, |S| = %g VA, Ieff = %.2f A, Z = %.3f %+.3fj ohm\n', P, Q, S, Ieff, real(Z), imag(Z))
%check: abs(Q - 6000) < 1e-9 && abs(Ieff - 41.667) < 1e-3 && abs(Z - (4.608 + 3.456j)) < 1e-9

%% S from the voltage and current phasors
%ar: مثال المحاضرة: V = 100∠15° و I = 4∠−105° (عظمى): S = ½ V I* = −100 + j173.21 VA.
Vp = 100*exp(1j*15*pi/180); Ip = 4*exp(-1j*105*pi/180);
Sp = 0.5*Vp*conj(Ip);
fprintf('S = %.2f %+.2fj VA\n', real(Sp), imag(Sp))
%check: abs(Sp - (-100 + 173.2051j)) < 1e-3

%%! Project idea: draw the power triangle
%ar: مشروع: نرسم مثلث القدرة لمثال 10.4: P أفقي و Q رأسي و |S| الوتر.
plot([0 P 0; P P P]/1000, [0 0 0; 0 Q Q]/1000, 'linewidth', 2); grid on; axis equal
xlabel('P (kW)'); ylabel('Q (kVAR)'); title('Power triangle: 8 kW, 6 kVAR, |S| = 10 kVA')
