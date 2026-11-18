% Signals and Systems — The Discrete-Time Fourier Transform
%title: The DTFT: Periodic in Frequency
%ar-title: تحويل فورييه المتقطع: دوري في التردد
%lesson: ss-ch4-3
%course: signals-systems

%% DTFT of a^n u[n] by direct summation
%ar: X(e^{jω}) = Σ x[n] e^{−jωn}. نجمع 200 حدًا (يكفي لأن a^n تتلاشى) لكل ω، ونقارن بـ 1/(1 − a e^{−jω}). الضرب في مصفوفة يحسب كل الترددات دفعة واحدة.
a = 0.7; n = 0:199; w = linspace(-pi, pi, 801);
X = exp(-1j*w.'*n) * (a.^n).';
Xf = 1./(1 - a*exp(-1j*w.'));
fprintf('max error = %.2e\n', max(abs(X - Xf)))

%% Periodic with period 2*pi
%ar: نرسم على ثلاث فترات: الطيف يتكرر كل 2π. القمة عند ω = 0 لأن a موجبة (إشارة بطيئة التغير).
w3 = linspace(-3*pi, 3*pi, 2000);
plot(w3/pi, abs(1./(1 - a*exp(-1j*w3)))); grid on; xlabel('\omega / \pi'); ylabel('|X(e^{j\omega})|'); title('DTFT of 0.7^n u[n]: period 2\pi')

%% a^|n| and the ideal low-pass
%ar: x = a^|n| تحويلها (1 − a²)/(1 − 2a cos ω + a²) حقيقي. وعكس النافذة |ω| < B هو sin(Bn)/(πn) مع x[0] = B/π.
n = -150:150; x = a.^abs(n);
X = real(exp(-1j*w.'*n) * x.');
fprintf('a^|n|: max error = %.2e\n', max(abs(X - (1 - a^2)./(1 - 2*a*cos(w.') + a^2))))
B = pi/4; h = sin(B*n)./(pi*n); h(n == 0) = B/pi;
fprintf('ideal LPF: h[0] = %.4f = B/pi\n', h(n == 0))

%%! Project idea: design a simple digital low-pass filter
%ar: مشروع: المرشح المثالي h لا نهائي. نقطعه إلى 41 عيّنة ونضربه في نافذة (Hamming نكتبها بأنفسنا) ثم نرى استجابته الترددية: مرشح FIR حقيقي تقدر تستخدمه بـ filter.
M = 20; m = -M:M; hT = sin(B*m)./(pi*m); hT(m == 0) = B/pi;
win = 0.54 - 0.46*cos(2*pi*(0:2*M)/(2*M));
hw = hT.*win;
H = exp(-1j*w.'*m) * hw.';
figure; plot(w/pi, 20*log10(abs(H))); grid on; xlabel('\omega / \pi'); ylabel('|H| (dB)'); title('41-tap windowed low-pass, cutoff \pi/4'); ylim([-90 5])
fprintf('gain at w = 0: %.3f, at w = pi/2: %.1f dB\n', abs(H(w == 0)), 20*log10(abs(H(abs(w - pi/2) < 1e-9))))
