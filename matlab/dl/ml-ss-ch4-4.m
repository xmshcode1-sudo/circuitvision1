% Signals and Systems — Properties: Linearity and Symmetry
%title: Linearity and Symmetry of the Fourier Transform
%ar-title: الخطية والتماثل في تحويل فورييه
%lesson: ss-ch4-4
%course: signals-systems

%% Linearity: one combined fraction
%ar: x[n] = 4(−½)^n u[n] + (⅓)^n u[n]. بالخطية نجمع تحويلين، والمثال يوحّد المقام. نتحقق أن الصيغتين متطابقتان على كل ω.
w = linspace(-pi, pi, 1001); z = exp(-1j*w);
X1 = 4./(1 + 0.5*z) + 1./(1 - z/3);
X2 = (5 - (5/6)*z)./(1 + z/6 - z.^2/6);
fprintf('max difference = %.2e\n', max(abs(X1 - X2)))

%% Real signal -> conjugate-symmetric spectrum
%ar: لأي إشارة حقيقية: X(−ω) = X*(ω). إذن |X| زوجية، والطور فردي، Re{X} زوجي، و Im{X} فردي.
a = 0.6; X = 1./(1 - a*exp(-1j*w));
fprintf('max |X(-w) - conj(X(w))| = %.2e\n', max(abs(fliplr(X) - conj(X))))
subplot(2,2,1); plot(w/pi, real(X)); grid on; title('Re\{X\}: even')
subplot(2,2,2); plot(w/pi, imag(X)); grid on; title('Im\{X\}: odd')
subplot(2,2,3); plot(w/pi, abs(X)); grid on; title('|X|: even'); xlabel('\omega/\pi')
subplot(2,2,4); plot(w/pi, angle(X)); grid on; title('phase: odd'); xlabel('\omega/\pi')

%% Even part <-> real part
%ar: تحويل الجزء الزوجي = Re{X}. نحسب الجزء الزوجي لـ a^n u[n] ثم نحسب تحويله بالجمع المباشر.
n = -100:100; x = a.^n.*(n >= 0); xe = (x + fliplr(x))/2;
Xe = exp(-1j*w.'*n) * xe.';
fprintf('max |FT{xe} - Re{X}| = %.2e\n', max(abs(Xe.' - real(X))))

%%! Project idea: halve the work with symmetry
%ar: مشروع: لأن الطيف متماثل للإشارات الحقيقية، يكفي حساب الترددات الموجبة فقط. في fft: نصف القيم الأولى تكفي، والباقي مرافقها. وفّر الحساب والذاكرة في تطبيقاتك.
rng(7); x = randn(1, 16); F = fft(x);
fprintf('F(16-k+1) == conj(F(k+1)) for k = 1..7: %d\n', max(abs(F(16:-1:10) - conj(F(2:8)))) < 1e-12)
