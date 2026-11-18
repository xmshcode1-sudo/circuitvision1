% Signals and Systems — The Continuous-Time Fourier Series
%title: Fourier Series of a Pulse Train
%ar-title: متسلسلة فورييه لقطار النبضات
%lesson: ss-ch3-1
%course: signals-systems

%% Coefficients by numerical integration
%ar: ck = (1/T0) ∫ x(t) e^{−jkω0t} dt على دورة. النبضة سعتها 1 من −T إلى T. نختار T = 1 و T0 = 4، ونحسب بـ integral لكل k.
T = 1; T0 = 4; w0 = 2*pi/T0;
k = -8:8; c = zeros(size(k));
for m = 1:numel(k)
    c(m) = integral(@(t) exp(-1j*k(m)*w0*t), -T, T) / T0;
end
cf = sin(k*w0*T)./(k*pi); cf(k == 0) = 2*T/T0;
fprintf('k = %2d: numerical %8.5f, formula %8.5f\n', [k(9:13); real(c(9:13)); cf(9:13)])

%% The line spectrum
%ar: نرسم ck مقابل k بـ stem: قيم حقيقية (لأن الإشارة زوجية) وشكلها شكل sinc.
stem(k, real(c), 'filled'); grid on; xlabel('k'); ylabel('c_k'); title('Fourier coefficients of the pulse train (T = 1, T_0 = 4)')

%% Rebuild the signal from N harmonics
%ar: x_N(t) = Σ ck e^{jkω0t} من −N إلى N. كلما زاد N اقترب الشكل من النبضة، لكن يبقى «تجاوز» قرب الحواف ≈ 9% (ظاهرة جيبس).
t = linspace(-4, 4, 4000);
figure; hold on
for N = [3 10 40]
    kk = -N:N; ck = sin(kk*w0*T)./(kk*pi); ck(kk == 0) = 2*T/T0;
    xN = real(ck * exp(1j*w0*kk.'*t));
    plot(t, xN)
end
hold off; grid on; xlabel('t'); legend('N = 3', 'N = 10', 'N = 40'); title('Partial sums (Gibbs phenomenon)')
fprintf('overshoot with N = 40: %.3f\n', max(xN) - 1)

%%! Project idea: power in the harmonics
%ar: مشروع: بارسفال: القدرة = Σ|ck|². كم توافقية تحتاج لتحمل 95% من قدرة الإشارة؟ هذا سؤال تصميم عرض النطاق في الاتصالات.
P = 2*T/T0;                                         % average power of the pulse train
kk = -200:200; ck = sin(kk*w0*T)./(kk*pi); ck(kk == 0) = 2*T/T0;
for N = 0:10
    PN = sum(abs(ck(abs(kk) <= N)).^2);
    if PN >= 0.95*P, fprintf('N = %d harmonics carry %.1f%% of the power\n', N, PN/P*100); break, end
end
