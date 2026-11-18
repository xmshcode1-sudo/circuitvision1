% Signals and Systems — Reconstruction: Zero-Order Hold and Interpolation
%title: The Zero-Order Hold
%ar-title: الإمساك من الرتبة الصفرية
%lesson: ss-ch7-2
%course: signals-systems

%% |H0(jw)| at 0 and at ws/2
%ar: |H0| = |2 sin(ωT/2)/ω|. عند ω → 0 يساوي T، وعند ωs/2 = π/T يساوي 2T/π ≈ 0.637T.
T = 1e-3; ws = 2*pi/T;
H0 = @(w) abs(2*sin(w*T/2)./w);
fprintf('|H0| near 0 = %.6f ms, at ws/2 = %.6f ms (2T/pi = %.6f ms)\n', H0(1e-6)*1e3, H0(ws/2)*1e3, 2*T/pi*1e3)
%check: abs(H0(ws/2) - 2*T/pi) < 1e-12

%% The ZOH frequency response
%ar: نرسم |H0|/T مع ω/ωs: ينزل إلى 63.7% عند نصف تردد العيّنات وأصفاره عند مضاعفات ωs.
w = linspace(1e-3, 3*ws, 1000);
plot(w/ws, H0(w)/T); grid on; xlabel('\omega / \omega_s'); ylabel('|H_0| / T'); title('Zero-order hold'); hold on; plot([0.5 0.5], [0 1], 'r--'); hold off

%% What the ZOH output looks like
%ar: stairs يرسم الإشارة كما يخرجها محوّل DAC: كل عيّنة ثابتة حتى التالية. نقارنها بالإشارة الأصلية.
f0 = 100; n = 0:20; xn = sin(2*pi*f0*n*T);
t = linspace(0, 20*T, 1000);
figure; plot(t*1e3, sin(2*pi*f0*t)); hold on; stairs(n*T*1e3, xn, 'r'); hold off; grid on
xlabel('t (ms)'); legend('x(t)', 'ZOH output'); title('Staircase reconstruction (100 Hz, T = 1 ms)')

%%! Project idea: compensate the droop
%ar: مشروع: بعد الـ ZOH نضع مرشحًا كسبه T/|H0| داخل النطاق ليعيد الاستجابة مسطحة. احسب الكسب المطلوب عند عدة ترددات واطبعه بالـ dB.
for f = [100 200 300 400 500]
    g = T/H0(2*pi*f);
    fprintf('f = %3d Hz: ZOH loss %.2f dB -> compensation %+.2f dB\n', f, 20*log10(H0(2*pi*f)/T), 20*log10(g))
end
