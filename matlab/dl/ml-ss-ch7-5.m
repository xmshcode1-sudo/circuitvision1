% Signals and Systems — Sampling of Discrete-Time Signals
%title: Downsampling and Upsampling
%ar-title: التخفيض والرفع في معدل العيّنات
%lesson: ss-ch7-5
%course: signals-systems

%% The largest decimation factor
%ar: X(e^{jω}) = 0 عند 2π/9 ≤ |ω| ≤ π، أي ωM = 2π/9. بلا تداخل نحتاج 2π/N ≥ 2ωM، أي N ≤ 4.5، وأكبر عدد صحيح 4.
wM = 2*pi/9;
Nmax = floor(pi/wM);
fprintf('N <= %.2f -> Nmax = %d, ws = 2pi/%d = pi/2\n', pi/wM, Nmax, Nmax)

%% Downsampling stretches the spectrum by N
%ar: نبني إشارة طيفها محدود عند 2π/9 (التفاف sinc)، ونحسب DTFT قبل وبعد x[Nn] لـ N = 4: الطيف يتمدد 4 مرات ويبقى بدون تداخل.
n = -400:400; x = (wM/pi)*((n == 0) + sin(wM*n)./(wM*n + (n == 0)).*(n ~= 0));
w = linspace(-pi, pi, 801);
X = abs(exp(-1j*w.'*n) * x.');
xd = x(mod(n, 4) == 0); nd = n(mod(n, 4) == 0)/4;
Xd = abs(exp(-1j*w.'*nd) * xd.');
subplot(2,1,1); plot(w/pi, X); grid on; title('X(e^{j\omega}): band edge 2\pi/9')
subplot(2,1,2); plot(w/pi, Xd); grid on; title('after x[4n]: edge 8\pi/9, no overlap'); xlabel('\omega / \pi')
edge = max(w(Xd > 0.5*max(Xd)));
fprintf('band edge after decimation by 4: %.3f pi (expected 8/9 = %.3f)\n', edge/pi, 8/9)

%% Up by 2, then down by 9
%ar: لتخفيض بمعامل غير صحيح 9/2: نرفع أولًا بـ 2 (نضع صفرًا بين العيّنات ثم نرشح) ثم نخفض بـ 9. نتحقق من موضع حافة الطيف: 2π/9 × 9/2 = π.
fprintf('net factor 9/2 = %.1f -> band edge moves from 2pi/9 to %.3f pi\n', 9/2, (2/9)*(9/2))

%%! Project idea: changing the sample rate of audio
%ar: مشروع: تحويل تسجيل من 48 kHz إلى 44.1 kHz = رفع بـ 147 ثم خفض بـ 160 مع مرشح بينهما. في MATLAB: resample (Signal Toolbox). هنا نحسب العوامل بـ rat فقط، وهي أول خطوة في أي محوّل.
[p, q] = rat(44100/48000);
fprintf('48 kHz -> 44.1 kHz: up by %d, down by %d\n', p, q)
