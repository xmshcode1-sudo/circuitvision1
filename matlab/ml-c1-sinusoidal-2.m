% Circuits 1 — The Phasor
%title: Adding Sinusoids with Phasors (Example 9.5)
%ar-title: جمع الدوال الجيبية بالفيزورات (مثال 9.5)
%lesson: c1-sinusoidal-2
%course: circuits-1

%% Example 9.5
%ar: Y = 20∠−30° + 40∠60°. في MATLAB نكتب الفيزور r·exp(jθ)، ثم abs و angle.
Y1 = 20*exp(1j*(-30)*pi/180); Y2 = 40*exp(1j*60*pi/180);
Y = Y1 + Y2;
fprintf('Y1 = %.2f %+.2fj, Y2 = %.2f %+.2fj\n', real(Y1), imag(Y1), real(Y2), imag(Y2))
fprintf('Y = %.2f %+.2fj = %.2f at %.2f deg -> y = %.2f cos(wt %+.2f deg)\n', real(Y), imag(Y), abs(Y), angle(Y)*180/pi, abs(Y), angle(Y)*180/pi)
%check: abs(abs(Y) - 44.72) < 0.01 && abs(angle(Y)*180/pi - 33.43) < 0.01

%% Check in the time domain
%ar: نتحقق أن y1(t) + y2(t) يساوي 44.72 cos(ωt + 33.43°) في كل لحظة.
w = 1; t = linspace(0, 4*pi, 400);
y = 20*cos(w*t - pi/6) + 40*cos(w*t + pi/3);
yp = abs(Y)*cos(w*t + angle(Y));
fprintf('max difference = %.2e\n', max(abs(y - yp)))
%check: max(abs(y - yp)) < 1e-9

%%! Project idea: the phasor sum as arrows
%ar: مشروع: نرسم الفيزورين ومجموعهما كأسهم في المستوى المركب: Y هو قطر متوازي الأضلاع.
plot([0 real(Y1)], [0 imag(Y1)], '-o', [0 real(Y2)], [0 imag(Y2)], '-o', [0 real(Y)], [0 imag(Y)], '-o', 'linewidth', 2); grid on; axis equal
xlabel('Re'); ylabel('Im'); legend('Y_1 = 20\angle-30^\circ', 'Y_2 = 40\angle60^\circ', 'Y = 44.72\angle33.43^\circ'); title('Example 9.5 in the complex plane')
