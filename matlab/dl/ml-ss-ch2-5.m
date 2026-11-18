% Signals and Systems — Step Response and Correlation
%title: Step Response and Correlation
%ar-title: استجابة الخطوة والارتباط
%lesson: ss-ch2-5
%course: signals-systems

%% Step response = running integral of h
%ar: s(t) = ∫ h(τ) dτ من −∞ إلى t. عدديًا: cumsum(h)*dt. لـ h = e^{−2t}u(t): s = (1 − e^{−2t})/2.
dt = 1e-3; t = 0:dt:4; h = exp(-2*t);
s = cumsum(h)*dt; sf = (1 - exp(-2*t))/2;
fprintf('max error = %.4f\n', max(abs(s - sf)))

%% Autocorrelation of 2e^{-3t}u(t)
%ar: R(τ) = ∫ x(t) x(t + τ) dt = التفاف x مع x معكوسة. Signal Toolbox فيه xcorr، لكن conv مع fliplr تكفي وتعمل في كل نسخ MATLAB.
dt = 1e-3; t = 0:dt:4; x = 2*exp(-3*t);
R = conv(x, fliplr(x))*dt; tau = (-(numel(t)-1):(numel(t)-1))*dt;
Rf = (4/6)*exp(-3*abs(tau));
fprintf('R(0) = %.4f (energy = %.4f), max error = %.4f\n', R(tau == 0), 4/6, max(abs(R - Rf)))
plot(tau, R, tau, Rf, '--'); grid on; xlabel('\tau'); legend('numerical', '0.67 e^{-3|\tau|}'); title('Autocorrelation')

%% Cross-correlation finds a delay
%ar: y هي x مزاحة 1.5. قمة الارتباط المتبادل تقع عند التأخير. هذا مبدأ الرادار وقياس المسافة بالصدى.
t = -1:dt:5;
xp = double(t >= 0 & t < 1); yp = double(t >= 1.5 & t < 2.5);
Rxy = conv(yp, fliplr(xp))*dt; lag = (-(numel(t)-1):(numel(t)-1))*dt;
[pk, k] = max(Rxy);
fprintf('peak %.3f at lag %.3f s\n', pk, lag(k))

%%! Project idea: a sonar distance meter
%ar: مشروع: أرسل نبضة، واستقبل صداها مع ضوضاء، واحسب التأخير من قمة الارتباط، ثم المسافة = سرعة الصوت × التأخير / 2.
rng(5); fs = 10e3; tt = 0:1/fs:0.1; pulse = sin(2*pi*2e3*tt(1:50));
delay = 0.0234; rx = zeros(size(tt)); i0 = round(delay*fs);
rx(i0+1:i0+50) = 0.4*pulse; rx = rx + 0.1*randn(size(tt));
c = conv(rx, fliplr(pulse)); [~, k] = max(c); d_est = (k - 50)/fs;
fprintf('estimated delay %.4f s -> distance %.2f m (true %.2f m)\n', d_est, 343*d_est/2, 343*delay/2)
