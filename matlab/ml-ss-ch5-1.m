% Signals and Systems — The Laplace Transform and the ROC
%title: The Laplace Transform and Its ROC
%ar-title: تحويل لابلاس ومنطقة التقارب
%lesson: ss-ch5-1
%course: signals-systems

%% X(s) by numerical integration
%ar: X(s) = ∫ x(t) e^{−st} dt. للمثال x = 3e^{−2t}u(t) − 2e^{−t}u(t). نختار قيمًا لـ s داخل الـ ROC (Re{s} > −1) ونقارن بـ (s − 1)/(s² + 3s + 2).
%ar: تنبيه عملي: نكتب الأسّين معًا exp(−(2 + s)t) بدل ضرب exp(−2t) في exp(−st)؛ عند t كبيرة جدًا قد يعطي الضرب Inf × 0 = NaN.
x = @(t) 3*exp(-2*t) - 2*exp(-t);
for s = [0.5, 1 + 2j, -0.5 + 3j]
    Xn = integral(@(t) 3*exp(-(2 + s)*t) - 2*exp(-(1 + s)*t), 0, Inf);
    Xf = (s - 1)/(s^2 + 3*s + 2);
    fprintf('s = %5.2f%+5.2fj: numerical %8.5f%+8.5fj, formula %8.5f%+8.5fj\n', real(s), imag(s), real(Xn), imag(Xn), real(Xf), imag(Xf))
end
%check: abs(Xn - Xf) < 1e-8

%% Outside the ROC the integral blows up
%ar: عند Re{s} = −1.5 (خارج الـ ROC) نحسب التكامل إلى حدود متزايدة T: القيمة تكبر بلا حد، أي لا يوجد تحويل هناك.
s = -1.5;
for T = [5 10 20 40]
    fprintf('integral to T = %2d: %12.2f\n', T, integral(@(t) 3*exp(-(2 + s)*t) - 2*exp(-(1 + s)*t), 0, T))
end

%% Poles, zeros and the ROC on the s-plane
%ar: الأقطاب جذور المقام، والأصفار جذور البسط. الـ ROC يمين أقصى قطب (لأن الإشارة يمينية). نظلل المنطقة بـ fill.
p = roots([1 3 2]); z = roots([1 -1]);
fill([-1 3 3 -1], [-3 -3 3 3], [0.85 0.93 1]); hold on
plot(real(p), imag(p), 'kx', 'MarkerSize', 12, 'LineWidth', 2); plot(real(z), imag(z), 'ko', 'MarkerSize', 10, 'LineWidth', 2)
hold off; grid on; axis([-3 3 -3 3]); xlabel('Re\{s\}'); ylabel('Im\{s\}'); title('Poles (x), zero (o) and the ROC: Re\{s\} > -1')
fprintf('poles: %g %g, zero: %g\n', sort(p), z)
%check: all(abs(sort(p) - [-2; -1]) < 1e-12)

%%! Project idea: a pole-zero plotter
%ar: مشروع: دالة pz(b, a) ترسم الأقطاب والأصفار لأي دالة تحويل من معاملاتها. ستستخدمها في كل دروس لابلاس و Z.
pz([1 -1], [1 3 2]);

function pz(b, a)
    z = roots(b); p = roots(a);
    figure; plot(real(p), imag(p), 'x', 'MarkerSize', 12, 'LineWidth', 2); hold on
    plot(real(z), imag(z), 'o', 'MarkerSize', 10, 'LineWidth', 2); hold off; grid on; axis equal
    xlabel('Re'); ylabel('Im'); title('Pole-zero plot'); legend('poles', 'zeros')
end
