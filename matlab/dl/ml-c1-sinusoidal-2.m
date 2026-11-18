% Circuits 1 — The Phasor
%title: Adding Sinusoids with Phasors
%ar-title: جمع الجيبيات بالفازورات
%lesson: c1-sinusoidal-2
%course: circuits-1

%% Phasors are complex numbers
%ar: 20∠30° = 20 e^(j30°). نكتب دالة صغيرة pol للتحويل، ثم نجمع كعددين مركبين.
pol = @(m, d) m*exp(1j*d*pi/180);
V1 = pol(20, 30); V2 = pol(40, -60);
V = V1 + V2;
fprintf('V1 = %.2f%+.2fj, V2 = %.2f%+.2fj\n', real(V1), imag(V1), real(V2), imag(V2))
fprintf('V  = %.2f%+.2fj = %.2f at %.2f deg\n', real(V), imag(V), abs(V), angle(V)*180/pi)

%% Check in the time domain
%ar: نجمع الجيبيين الأصليين نقطة نقطة ونقارن بالجيبي الناتج من الفازور: متطابقان. لاحظ أن القمة 44.72 وليست 60.
w = 2*pi*60; t = linspace(0, 1/30, 1000);
vsum = 20*cos(w*t + pi/6) + 40*cos(w*t - pi/3);
vph = abs(V)*cos(w*t + angle(V));
plot(t*1e3, 20*cos(w*t + pi/6), ':', t*1e3, 40*cos(w*t - pi/3), ':', t*1e3, vsum, t*1e3, vph, '--'); grid on
xlabel('t (ms)'); ylabel('v (V)'); legend('v_1', 'v_2', 'v_1 + v_2', 'from the phasor'); title('Phasor addition')
fprintf('largest difference = %g V\n', max(abs(vsum - vph)))

%%! Project idea: phasor diagram plotter
%ar: مشروع: ارسم الفازورات أسهمًا من الأصل (مخطط فازوري) بـ plot لخطوط من 0 إلى كل فازور. مفيد في كل تقارير AC.
figure; hold on
P = [V1 V2 V]; c = 'brk';
for k = 1:3, plot([0 real(P(k))], [0 imag(P(k))], c(k), 'LineWidth', 2); end
hold off; axis equal; grid on; xlabel('Re'); ylabel('Im'); legend('V_1', 'V_2', 'V'); title('Phasor diagram')
