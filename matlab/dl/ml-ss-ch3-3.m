% Signals and Systems — Discrete-Time Fourier Series
%title: The DTFS with fft
%ar-title: متسلسلة فورييه المتقطعة بالدالة fft
%lesson: ss-ch3-3
%course: signals-systems

%% fft gives the DTFS coefficients
%ar: ak = (1/N) Σ x[n] e^{−jk(2π/N)n} على دورة من n = 0 إلى N − 1. هذا بالضبط fft(x)/N. المهم: نرتب x من n = 0.
%ar: المثال: N = 6، x[−1] = 2، x[0] = 1، x[1] = 2، والباقي صفر. x[−1] هو نفسه x[5].
x = [1 2 0 0 0 2];                  % n = 0..5
N = 6; k = 0:N-1;
a = fft(x)/N;
af = 1/6 + (2/3)*cos(k*pi/3);
fprintf('a_%d = %8.4f %+8.4fj   formula %8.4f\n', [k; real(a); imag(a); af])

%% Example 2: sin(6 pi n / 5)
%ar: N = 5. المعاملات غير الصفرية عند k = 3 و k = −3 (أي 2). a3 = 1/(2j).
n = 0:4; x = sin(6*pi*n/5);
a = fft(x)/5;
fprintf('a_%d = %7.4f %+7.4fj\n', [0:4; real(a); imag(a)])

%% Plot the spectrum
%ar: abs(a) هي مقادير المعاملات. نرسمها مقابل k = 0..4 بـ stem لأن الطيف متقطع.
%ar: لاحظ أن المعاملين غير الصفريين عند k = 2 و k = 3 (أي −2 بعد الدوران بـ N = 5)، وكل منهما مقداره 0.5 كما في الحل اليدوي.
stem(0:4, abs(a), 'filled'); grid on; xlabel('k'); ylabel('|a_k|'); title('DTFS of sin(6\pi n/5), N = 5')

%%! Project idea: synthesize from coefficients with ifft
%ar: مشروع: x[n] = Σ ak e^{jk(2π/N)n} هو ifft(a)*N. اكتب المعاملات بنفسك (مثال 3) وارجع للإشارة، ثم تحقق.
N = 16; a = zeros(1, N);
a(1) = 1; a(2) = 3/2 - 1j/2; a(N) = 3/2 + 1j/2; a(3) = 1j/2; a(N-1) = -1j/2;    % k = 0, 1, -1, 2, -2
x = real(ifft(a)*N); n = 0:N-1;
xf = 1 + sin(2*pi*n/N) + 3*cos(2*pi*n/N) + cos(4*pi*n/N + pi/2);
fprintf('max error = %.2e\n', max(abs(x - xf)))
