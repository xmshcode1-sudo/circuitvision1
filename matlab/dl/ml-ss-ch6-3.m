% Signals and Systems — Poles, Zeros, System Function and Stability
%title: Poles, Zeros and Stability in z
%ar-title: الأقطاب والأصفار والاستقرار في مستوى z
%lesson: ss-ch6-3
%course: signals-systems

%% The system y[n] = 0.5 y[n-1] + 2 x[n]
%ar: H(z) = 2/(1 − 0.5z^{−1}). في MATLAB نكتب المعاملات بقوى z^{−1}: b = 2، a = [1 −0.5]. القطب جذر المقام: 0.5.
b = 2; a = [1 -0.5];
p = roots(a);
fprintf('pole at %g, |pole| = %g -> stable: %d\n', p, abs(p), all(abs(p) < 1))

%% Impulse response with filter
%ar: h[n] = 2(0.5)^n u[n]. filter مع دخل δ.
n = 0:15; h = filter(b, a, double(n == 0));
fprintf('max error vs 2(0.5)^n = %.2e\n', max(abs(h - 2*0.5.^n)))
stem(n, h, 'filled'); grid on; xlabel('n'); title('h[n] = 2(0.5)^n')

%% Pole location decides the shape
%ar: نقارن ثلاثة أقطاب: 0.9 (يتلاشى ببطء)، −0.7 (يتذبذب ويتلاشى)، 1.05 (ينمو: غير مستقر). كل قطب خارج دائرة الوحدة يعني نظامًا سببيًا غير مستقر.
figure; P = [0.9 -0.7 1.05];
for k = 1:3
    subplot(3,1,k); stem(n, filter(1, [1 -P(k)], double(n == 0)), 'filled'); grid on; title(sprintf('pole at %g', P(k)))
end
xlabel('n')

%%! Project idea: a stability checker for digital filters
%ar: مشروع: أي مرشح IIR مستقر إذا كانت كل جذور a داخل دائرة الوحدة. دالة صغيرة تطبع النتيجة وأبعد قطب. جربها قبل استخدام أي مرشح.
for a = {[1 -0.5], [1 -1.5 0.5], [1 -1 0.5], [1 -2.1 1.1]}
    m = max(abs(roots(a{1})));
    if m < 1, s = 'stable'; else, s = 'NOT stable'; end
    fprintf('a = %-16s max |pole| = %.4f -> %s\n', mat2str(a{1}), m, s)
end
