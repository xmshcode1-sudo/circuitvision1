% Signals and Systems — The Continuous-Time Fourier Transform
%title: The Fourier Transform, Numerically
%ar-title: تحويل فورييه عدديًا
%lesson: ss-ch4-1
%course: signals-systems

%% X(jw) of e^{-at}u(t) by integration
%ar: X(jω) = ∫ x(t) e^{−jωt} dt. نحسبه بـ integral لعدة ترددات ونقارن بـ 1/(a + jω).
a = 2; w = [-6 -2 0 2 6];
X = arrayfun(@(ww) integral(@(t) exp(-a*t).*exp(-1j*ww*t), 0, Inf), w);
Xf = 1./(a + 1j*w);
fprintf('w = %+g: |X| = %.5f (formula %.5f), phase = %+7.2f deg\n', [w; abs(X); abs(Xf); angle(X)*180/pi])
%check: max(abs(X - Xf)) < 1e-8

%% Magnitude and phase spectra
%ar: |X| = 1/√(a² + ω²) و ∠X = −atan(ω/a). عند ω = ±a ينخفض المقدار إلى 1/√2 من قمته والطور ∓45°.
w = linspace(-20, 20, 1000); Xf = 1./(a + 1j*w);
subplot(2,1,1); plot(w, abs(Xf)); grid on; ylabel('|X(j\omega)|'); title('e^{-2t}u(t)')
subplot(2,1,2); plot(w, angle(Xf)*180/pi); grid on; ylabel('phase (deg)'); xlabel('\omega (rad/s)')

%% The rectangular pulse and its sinc spectrum
%ar: نبضة |t| < T1 تحويلها 2 sin(ωT1)/ω، وأصفاره عند ω = kπ/T1. نحسب نقطة ونقارن، ونرسم.
T1 = 1; w = linspace(-15, 15, 1501);
X = 2*sin(w*T1)./w; X(w == 0) = 2*T1;
Xn = integral(@(t) exp(-1j*3*t), -T1, T1);
fprintf('X(j3): numerical %.6f, formula %.6f\n', real(Xn), 2*sin(3)/3)
figure; plot(w, X); grid on; xlabel('\omega'); ylabel('X(j\omega)'); title('Pulse of width 2: X = 2 sin(\omega)/\omega')
%check: abs(Xn - 2*sin(3)/3) < 1e-10

%%! Project idea: see the spectrum of a real signal with fft
%ar: مشروع: fft يعطي تقريبًا لتحويل فورييه من عيّنات. خذ نبضة، احسب fft، اضرب في dt، ورتّب الترددات بـ fftshift، وقارن بالقانون. هذه أداة كل مهندس اتصالات.
dt = 1e-3; t = -20:dt:20-dt; x = double(abs(t) < T1);
Xd = fftshift(fft(ifftshift(x)))*dt; N = numel(t); wd = (-N/2:N/2-1)*2*pi/(N*dt);
sel = abs(wd) < 15;
figure; plot(wd(sel), real(Xd(sel)), w, X, '--'); grid on; xlabel('\omega'); legend('fft \times dt', 'formula'); title('fft approximates the Fourier transform')
fprintf('X(0): fft %.4f, formula %.4f\n', real(Xd(wd == 0)), 2*T1)
