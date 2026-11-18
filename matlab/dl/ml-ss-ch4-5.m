% Signals and Systems — Shifts, Scaling, Parseval, Differentiation, Convolution
%title: Fourier Transform Properties, Verified
%ar-title: خواص تحويل فورييه والتحقق منها
%lesson: ss-ch4-5
%course: signals-systems

%% Time shift multiplies by e^{-jwt0}
%ar: نبضة على [0, 2T] = نبضة متمركزة مزاحة بـ T. التحويل = e^{−jωT} × 2sin(ωT)/ω. نحسب عدديًا عند ω = 1.3.
T = 1; w = 1.3;
Xn = integral(@(t) exp(-1j*w*t), 0, 2*T);
Xf = exp(-1j*w*T)*2*sin(w*T)/w;
fprintf('numerical %.6f%+.6fj, property %.6f%+.6fj\n', real(Xn), imag(Xn), real(Xf), imag(Xf))

%% Scaling: stretch in time, squeeze in frequency
%ar: x(t/2) تحويلها 2X(2ω). نرسم الطيفين: النبضة الأعرض طيفها أضيق وأعلى.
w = linspace(-10, 10, 1001);
X1 = 2*sin(w)./w; X1(w == 0) = 2;
X2 = 2*sin(2*w)./w; X2(w == 0) = 4;
plot(w, X1, w, X2); grid on; xlabel('\omega'); legend('|t| < 1', '|t| < 2'); title('Time scaling')

%% Parseval: energy in time = energy in frequency
%ar: ∫|x|² dt = (1/2π)∫|X|² dω. لـ e^{−at}u(t): الطرفان = 1/(2a).
a = 3;
Et = integral(@(t) exp(-2*a*t), 0, Inf);
Ew = integral(@(w) 1./(a^2 + w.^2), -Inf, Inf)/(2*pi);
fprintf('time: %.6f, frequency: %.6f, 1/(2a) = %.6f\n', Et, Ew, 1/(2*a))

%% Convolution becomes multiplication
%ar: نلتف إشارتين عدديًا، ثم نقارن fft للناتج مع حاصل ضرب fft لكل منهما (بعد إضافة أصفار لنفس الطول).
rng(8); x = randn(1, 30); h = randn(1, 12);
y = conv(x, h); L = numel(y);
d = max(abs(fft(y) - fft(x, L).*fft(h, L)));
fprintf('max |FFT(x*h) - FFT(x)FFT(h)| = %.2e\n', d)

%%! Project idea: fast convolution
%ar: مشروع: الالتفاف الطويل أسرع بالـ fft: y = ifft(fft(x, L).*fft(h, L)). قِس الزمن بـ tic و toc لإشارات طويلة وقارن بـ conv. هذه طريقة برامج الصوت.
x = randn(1, 2e4); h = randn(1, 2e3); L = numel(x) + numel(h) - 1;
y1 = conv(x, h); y2 = real(ifft(fft(x, L).*fft(h, L)));
fprintf('results agree to %.1e\n', max(abs(y1 - y2)))
