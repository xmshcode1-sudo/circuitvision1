% Signals and Systems — Trigonometric Form and Examples
%title: Fourier Series Examples, Checked Numerically
%ar-title: أمثلة متسلسلة فورييه والتحقق منها
%lesson: ss-ch3-2
%course: signals-systems

%% A function that computes ck for any periodic signal
%ar: نكتب دالة fs_coef(x, T0, k): تأخذ دالة x على دورة من −T0/2 إلى T0/2 وترجع المعاملات. نستخدمها في كل الأمثلة.
fs = @(x, T0, k) arrayfun(@(m) integral(@(t) x(t).*exp(-1j*m*2*pi/T0*t), -T0/2, T0/2, 'AbsTol', 1e-12)/T0, k);

%% Example 1: |cos t|
%ar: T0 = π، و ck = 2(−1)^k / (π(1 − 4k²)).
k = 0:5;
c = fs(@(t) abs(cos(t)), pi, k);
cf = 2*(-1).^k ./ (pi*(1 - 4*k.^2));
fprintf('k = %d: %9.6f  formula %9.6f\n', [k; real(c); cf])

%% Example 4: x(t) = t on (-1, 1)
%ar: cn = j(−1)^n/(nπ) و c0 = 0: معاملات تخيلية بحتة (لأن الإشارة فردية). نرسم طيفي السعة والطور.
n = -6:6;
c = fs(@(t) t, 2, n);
fprintf('|c1| = %.4f, |c2| = %.4f, |c3| = %.4f\n', abs(c(n == 1)), abs(c(n == 2)), abs(c(n == 3)))
subplot(2,1,1); stem(n, abs(c), 'filled'); grid on; ylabel('|c_n|'); title('Amplitude spectrum of x(t) = t')
subplot(2,1,2); stem(n(n ~= 0), angle(c(n ~= 0))*180/pi, 'filled'); grid on; ylabel('phase (deg)'); xlabel('n')

%% Example 3: cos 4t + sin 6t
%ar: ω0 = 2، والمعاملات غير الصفرية فقط عند k = ±2 و ±3. نتحقق عدديًا: كل الباقي صفر.
k = -4:4;
c = fs(@(t) cos(4*t) + sin(6*t), pi, k);
fprintf('k = %+d: %7.4f %+7.4fj\n', [k; real(c); imag(c)])

%%! Project idea: synthesize a triangle wave
%ar: مشروع: موجة مثلثية من توافقياتها الفردية فقط −2/(π²k²). المعاملات تصغر كـ 1/k² فيكفي عدد قليل لشكل ممتاز (مقارنة بالمربعة 1/k).
t = linspace(0, 4, 2000); x = 0.5*ones(size(t));
for kk = 1:2:9, x = x + 2*real(-2/(pi^2*kk^2)*exp(1j*kk*pi*t)); end
figure; plot(t, x); grid on; xlabel('t'); title('Triangle wave from 5 odd harmonics')
