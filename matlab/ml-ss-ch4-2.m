% Signals and Systems — Fourier Transform of Periodic Signals
%title: Periodic Signals Have Line Spectra
%ar-title: الإشارات الدورية لها طيف خطوط
%lesson: ss-ch4-2
%course: signals-systems

%% A cosine has two lines
%ar: cos ω0t تحويلها π[δ(ω − ω0) + δ(ω + ω0)]. بـ fft على عدد صحيح من الدورات نرى خطين فقط عند ±ω0، وكل الباقي صفر.
fs = 100; t = 0:1/fs:10 - 1/fs; f0 = 5;
x = cos(2*pi*f0*t);
X = fftshift(fft(x))/numel(x); f = (-numel(x)/2:numel(x)/2-1)*fs/numel(x);
[~, i] = sort(abs(X), 'descend');
fprintf('the two largest lines: f = %g Hz and %g Hz, height %.3f each\n', f(i(1)), f(i(2)), abs(X(i(1))))
stem(f, abs(X), '.'); grid on; xlim([-10 10]); xlabel('f (Hz)'); ylabel('|X| / N'); title('cos(2\pi 5 t): two lines at \pm 5 Hz')
%check: abs(abs(f(i(1))) - 5) < 1e-9 && abs(abs(X(i(1))) - 0.5) < 1e-9

%% An impulse train: all coefficients equal 1/T0
%ar: نقرّب قطار الدفعات بنبضات ضيقة جدًا مساحتها 1. معاملات فورييه كلها تقترب من 1/T0، لذلك تحويله قطار دفعات أيضًا.
T0 = 2; e = 1e-3;
for k = [0 1 5 20]
    ck = integral(@(t) exp(-1j*k*2*pi/T0*t)/e, -e/2, e/2)/T0;
    fprintf('k = %2d: c_k = %.5f (1/T0 = %g)\n', k, real(ck), 1/T0)
end
%check: abs(integral(@(t) exp(-1j*5*pi*t)/1e-3, -5e-4, 5e-4)/2 - 0.5) < 1e-4

%%! Project idea: identify the notes of a chord
%ar: مشروع ممتع: وتر موسيقي = مجموع جيبيات. fft تكشف الترددات. هنا ثلاث نغمات (دو، مي، صول) والبرنامج يجدها.
fs = 8000; t = 0:1/fs:1 - 1/fs;
chord = sin(2*pi*261.6*t) + sin(2*pi*329.6*t) + sin(2*pi*392.0*t);
C = abs(fft(chord)); fr = (0:numel(t)-1)*fs/numel(t); C = C(fr < 1000); fr = fr(fr < 1000);
[~, i] = sort(C, 'descend'); found = sort(fr(i(1:3)));
fprintf('notes found at %g, %g, %g Hz\n', found)
figure; plot(fr, C/max(C)); grid on; xlabel('f (Hz)'); title('Spectrum of a C-major chord'); xlim([200 450])
