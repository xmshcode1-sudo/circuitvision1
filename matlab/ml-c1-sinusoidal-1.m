% Circuits 1 — The Sinusoidal Source
%title: The Sinusoidal Source (Example 9.1)
%ar-title: المصدر الجيبي (مثال 9.1)
%lesson: c1-sinusoidal-1
%course: circuits-1

%% Example 9.1
%ar: تيار عظمى 20 A ودورته 1 ms وقيمته 10 A عند t = 0. f = 1/T، و ω = 2πf، و cos φ = 10/20 ← φ = 60°، و Irms = 20/√2.
Im = 20; T = 1e-3; i0 = 10;
f = 1/T; w = 2*pi*f; phi = acosd(i0/Im); Irms = Im/sqrt(2);
fprintf('f = %g Hz, w = %g rad/s (2000*pi), phi = %g deg, Irms = %.2f A\n', f, w, phi, Irms)
%check: abs(f - 1000) < 1e-9 && abs(phi - 60) < 1e-9 && abs(Irms - 14.142) < 1e-3

%% rms from its definition
%ar: القيمة الفعالة هي جذر متوسط المربع خلال دورة. نحسبها بالتكامل العددي ونقارنها بـ Im/√2.
t = linspace(0, T, 20001);
i = Im*cos(w*t + phi*pi/180);
Irms_num = sqrt(trapz(t, i.^2) / T);
fprintf('rms by integration = %.5f A\n', Irms_num)
%check: abs(Irms_num - Im/sqrt(2)) < 1e-6

%%! Project idea: plot i(t)
%ar: مشروع: نرسم i(t) = 20 cos(2000πt + 60°) لدورتين، ونضع خط القيمة الفعالة.
t2 = linspace(0, 2*T, 800);
plot(t2*1000, Im*cos(w*t2 + pi/3), t2*1000, Irms*ones(size(t2)), '--'); grid on
xlabel('t (ms)'); ylabel('i (A)'); legend('i(t)', 'I_{rms}'); title('Example 9.1: i(t) = 20 cos(2000\pi t + 60^\circ) A')
