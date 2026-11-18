% Signals and Systems — The Sampling Theorem
%title: The Sampling Theorem
%ar-title: نظرية أخذ العيّنات
%lesson: ss-ch7-1
%course: signals-systems

%% The numbers of the example
%ar: الإشارة الصوتية محدودة عند fM = 4 kHz. معدل نايكويست 2fM. مع fs = 10 kHz يجب أن يكون قطع مرشح الاسترجاع بين fM و fs − fM.
fM = 4e3; fs = 10e3;
fprintf('Nyquist rate = %g kHz; with fs = %g kHz the cutoff must be in (%g, %g) kHz\n', 2*fM/1e3, fs/1e3, fM/1e3, (fs - fM)/1e3)
%check: 2*fM == 8e3 && fs - fM == 6e3

%% Reconstruction by sinc interpolation
%ar: الاسترجاع المثالي: x(t) = Σ x[n] sinc((t − nT)/T). دالة sinc في Signal Toolbox، فنكتبها بأنفسنا (مع حالة الصفر). نسترجع جيبيًا 3 kHz من عيّنات بمعدل 10 kHz.
mysinc = @(x) (x == 0) + sin(pi*x)./(pi*x + (x == 0));
f0 = 3e3; T = 1/fs; n = 0:99; xn = cos(2*pi*f0*n*T);
t = linspace(20*T, 60*T, 800);
xr = zeros(size(t));
for k = 1:numel(n), xr = xr + xn(k)*mysinc((t - n(k)*T)/T); end
plot(t*1e3, cos(2*pi*f0*t), t*1e3, xr, '--'); hold on; stem(n(21:61)*T*1e3, xn(21:61), 'filled'); hold off
grid on; xlabel('t (ms)'); legend('original', 'reconstructed', 'samples'); title('3 kHz sampled at 10 kHz, then sinc-interpolated')
fprintf('max reconstruction error in the middle = %.3f\n', max(abs(xr - cos(2*pi*f0*t))))

%% Below the Nyquist rate it fails
%ar: نفس الجيبي 3 kHz بعيّنات 4 kHz (أقل من 6 kHz): العيّنات نفسها تنطبق على جيبي 1 kHz. الاسترجاع يعطي الإشارة الخطأ.
fs2 = 4e3; n = 0:20; tt = n/fs2;
fprintf('samples of 3 kHz and of 1 kHz at 4 kHz identical: %d\n', max(abs(cos(2*pi*3e3*tt) - cos(2*pi*1e3*tt))) < 1e-9)
%check: max(abs(cos(2*pi*3e3*tt) - cos(2*pi*1e3*tt))) < 1e-9

%%! Project idea: choose the sampling rate for your sensor
%ar: مشروع: أعطِ الدالة أعلى تردد في الإشارة وعرض المنطقة الانتقالية للمرشح، ترجع أقل fs عملي. القاعدة: fs ≥ 2fM + عرض الانتقال. جربها على الصوت (20 kHz) وتخطيط القلب (150 Hz).
for x = [20e3 2.05e3; 150 50]'
    fprintf('fM = %6g Hz, transition %5g Hz -> fs >= %g Hz\n', x(1), x(2), 2*x(1) + x(2))
end
