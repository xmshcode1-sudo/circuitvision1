% Signals and Systems — The Inverse Z-Transform
%title: Inverse Z with Partial Fractions
%ar-title: عكس تحويل Z بالكسور الجزئية
%lesson: ss-ch6-4
%course: signals-systems

%% Example 1: partial fractions of X(z)/z
%ar: X = 1/(1 − 1.5z^{−1} + 0.5z^{−2}) = z²/(z² − 1.5z + 0.5). نفك X(z)/z = z/(z² − 1.5z + 0.5) بـ residue (دالة أساسية في MATLAB)، فنحصل على A/(z − p).
[r, p] = residue([1 0], [1 -1.5 0.5]);
fprintf('X(z)/z: %+g/(z - %g)\n', [r.'; p.'])

%% The ROC decides each term
%ar: الـ ROC 0.5 < |z| < 1: القطب 0.5 داخلها ⇐ حد يميني (0.5)^n u[n]. القطب 1 خارجها ⇐ حد يساري −2u[−n−1]. نتحقق بإعادة الجمع عند z = 0.8e^{j0.4}.
n = -200:200; x = -2*(n <= -1) - (0.5.^n).*(n >= 0);
z = 0.8*exp(1j*0.4);
fprintf('sum %.8f%+.8fj, X(z) %.8f%+.8fj\n', real(sum(x.*z.^(-n))), imag(sum(x.*z.^(-n))), real(1/(1 - 1.5/z + 0.5/z^2)), imag(1/(1 - 1.5/z + 0.5/z^2)))

%% Example 2: complex poles, checked with filter
%ar: السببية: X = (1 + z^{−1})/(1 − z^{−1} + 0.5z^{−2}). المعادلة من المحاضرة: √10 (1/√2)^n cos(πn/4 − 71.565°). filter بدخل δ يعطي نفس العكس مباشرة.
n = 0:20;
xf = sqrt(10)*(1/sqrt(2)).^n .* cos(pi*n/4 - 71.565*pi/180);
xr = filter([1 1], [1 -1 0.5], double(n == 0));
fprintf('first values: %s\n', num2str(xr(1:5), '%.4f  '))
fprintf('max difference from the formula = %.2e\n', max(abs(xr - xf)))
stem(n, xr, 'filled'); hold on; plot(n, xf, 'r.'); hold off; grid on; xlabel('n'); legend('filter', 'formula'); title('Example 2')

%% Example 3: repeated poles
%ar: X = 1/((1 + z^{−1})(1 − z^{−1})²). المقام نبنيه بضرب كثيرات الحدود بـ conv. الناتج 0.25(−1)^n + 0.75 + 0.5n.
a = conv([1 1], conv([1 -1], [1 -1]));
x3 = filter(1, a, double(n == 0));
fprintf('x[0..5] = %s\n', num2str(x3(1:6)))

%%! Project idea: inverse by long division (power series)
%ar: مشروع: للإشارات السببية، العكس = معاملات القسمة الطويلة لـ b/a. filter بدخل δ هو بالضبط هذه القسمة. استخدمه لعكس أي X(z) عدديًا عندما تكون الكسور الجزئية صعبة.
b = [1 0.5]; a = [1 -0.9 0.2];
q = filter(b, a, [1 zeros(1, 9)]);
fprintf('power-series coefficients: %s\n', num2str(q, '%.4f '))
