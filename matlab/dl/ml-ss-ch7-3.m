% Signals and Systems — Aliasing
%title: Aliasing: Which Frequency Comes Back?
%ar-title: التداخل الطيفي: أي تردد يرجع؟
%lesson: ss-ch7-3
%course: signals-systems

%% The apparent frequency
%ar: بعد أخذ العيّنات بـ ωs والاسترجاع بمرشح قطعه ωs/2، التردد الظاهر = المسافة إلى أقرب مضاعف لـ ωs. الدالة: |ω0 − ωs·round(ω0/ωs)|.
ws = 6;                                     % work in units of ws/6
alias = @(w0) abs(w0 - ws*round(w0/ws));
w0 = [1 2 4 5];
fprintf('w0 = %d ws/6 -> reconstructed %g ws/6\n', [w0; alias(w0)])

%% See the four cases
%ar: لكل حالة: الأصل (أزرق)، العيّنات، والمسترجع (أحمر). في الحالتين الأخيرتين المسترجع تردد أقل من الأصل.
t = linspace(0, 3, 1500); Ts = 2*pi/ws; n = 0:floor(3/Ts);
for k = 1:4
    subplot(4,1,k); plot(t, cos(w0(k)*t), t, cos(alias(w0(k))*t), 'r--'); hold on
    stem(n*Ts, cos(w0(k)*n*Ts), 'k', 'filled'); hold off; grid on; title(sprintf('\\omega_0 = %d\\omega_s/6', w0(k)))
end
xlabel('t')

%% Example 7.1: the phase matters at exactly ws/2
%ar: x = cos(ωs t/2 + φ). العيّنات = cos(πn + φ) = cos φ (−1)^n. عند φ = −π/2 كل العيّنات صفر: الإشارة اختفت.
n = 0:7;
for phi = [0 -pi/4 -pi/2]
    fprintf('phi = %6.3f: samples %s\n', phi, num2str(round(cos(pi*n + phi)*1e6)/1e6))
end

%%! Project idea: wagon-wheel effect
%ar: مشروع ممتع: عجلة تدور 23 دورة/ث وتصورها كاميرا 24 إطار/ث تبدو كأنها تدور ببطء للخلف (−1 دورة/ث). احسب الدوران الظاهر لعدة سرعات.
fps = 24;
for rps = [5 12 23 24 25 47]
    a = rps - fps*round(rps/fps);
    fprintf('wheel %2d rev/s -> camera shows %+g rev/s\n', rps, a)
end
