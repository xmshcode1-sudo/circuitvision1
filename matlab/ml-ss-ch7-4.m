% Signals and Systems — Discrete-Time Processing of CT Signals
%title: Processing Analog Signals Digitally
%ar-title: معالجة الإشارات المستمرة رقميًا
%lesson: ss-ch7-4
%course: signals-systems

%% Analog frequency to digital frequency
%ar: Ω = ωT = 2πf/fs. قطع 1 kHz مع fs = 8 kHz يصير Ωc = π/4.
fs = 8e3; fc = 1e3;
Wc = 2*pi*fc/fs;
fprintf('Omega_c = %.4f rad = pi/%g\n', Wc, pi/Wc)
%check: abs(Wc - pi/4) < 1e-12

%% A digital low-pass applied to sampled audio
%ar: نصمم مرشح FIR بقطع π/4 (نافذة هامنج، نكتبها بأنفسنا)، ونمرر إشارة فيها 500 Hz و 3 kHz: يبقى 500 Hz ويُحذف 3 kHz.
M = 30; m = -M:M; h = sin(Wc*m)./(pi*m); h(m == 0) = Wc/pi;
h = h .* (0.54 - 0.46*cos(2*pi*(0:2*M)/(2*M)));
n = 0:399; x = sin(2*pi*500*n/fs) + sin(2*pi*3000*n/fs);
y = filter(h, 1, x);
plot(n(200:300)/fs*1e3, x(200:300), n(200:300)/fs*1e3, y(200 + M:300 + M), 'LineWidth', 1.5); grid on
xlabel('t (ms)'); legend('input: 500 Hz + 3 kHz', 'output (delay removed)'); title('Digital low-pass at 1 kHz, fs = 8 kHz')
fprintf('output rms %.3f (a pure 500 Hz sine has %.3f)\n', sqrt(mean(y(100:end).^2)), 1/sqrt(2))

%% The digital differentiator of Example 7.2
%ar: hd[n] = (−1)^n/(nT) للـ n ≠ 0 و 0 عند n = 0. استجابته الترددية تقترب من jΩ/T (أي مشتقة). نتحقق عند تردد منخفض.
T = 1; nn = -400:400; hd = ((-1).^nn)./(nn*T); hd(nn == 0) = 0;
W = 0.3; Hd = sum(hd .* exp(-1j*W*nn));
fprintf('Hd(e^{j0.3}) = %.4f%+.4fj, ideal jW/T = %+.4fj\n', real(Hd), imag(Hd), W/T)
%check: abs(Hd - 1j*W/T) < 0.01

%%! Project idea: a real-time-style block processor
%ar: مشروع: الأنظمة الحقيقية تعالج الصوت كتلة كتلة. filter يرجع حالته الداخلية (zf) لتكملها في الكتلة التالية بدون انقطاع. نتحقق أن المعالجة بكتل تساوي المعالجة دفعة واحدة.
blk = 100; yb = []; zi = zeros(1, numel(h) - 1);
for k = 1:blk:numel(x)
    [yk, zi] = filter(h, 1, x(k:k + blk - 1), zi); yb = [yb, yk];
end
fprintf('block processing equals one-shot: max diff %.2e\n', max(abs(yb - y)))
%check: max(abs(yb - y)) < 1e-12
