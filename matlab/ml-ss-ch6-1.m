% Signals and Systems — The Z-Transform and the ROC
%title: The Z-Transform and Its ROC
%ar-title: تحويل Z ومنطقة التقارب
%lesson: ss-ch6-1
%course: signals-systems

%% A finite sequence
%ar: x = {1, 2, 5, 7, 0, 1} و 5 عند n = 0. X(z) = Σ x[n] z^{−n}. نحسبه عند أي z ونقارن بـ z² + 2z + 5 + 7z^{−1} + z^{−3}.
x = [1 2 5 7 0 1]; n = -2:3;
X = @(z) sum(x .* z.^(-n));
z = 1.3*exp(1j*0.7);
Xf = z^2 + 2*z + 5 + 7/z + z^(-3);
fprintf('X(z) = %.6f%+.6fj, formula %.6f%+.6fj\n', real(X(z)), imag(X(z)), real(Xf), imag(Xf))
%check: abs(X(z) - Xf) < 1e-12

%% A two-sided sequence and its ring-shaped ROC
%ar: x = a^n u[n] − b^n u[−n−1] مع a = 0.5 و b = 2. الـ ROC حلقة 0.5 < |z| < 2. نجمع عددًا كبيرًا من الحدود عند z داخل الحلقة ونقارن بـ 1/(1 − az^{−1}) + 1/(1 − bz^{−1}).
a = 0.5; b = 2; z = 1.2*exp(1j*0.3);
n1 = 0:300; n2 = -300:-1;
S = sum(a.^n1 .* z.^(-n1)) - sum(b.^n2 .* z.^(-n2));
Sf = 1/(1 - a/z) + 1/(1 - b/z);
fprintf('sum %.8f%+.8fj, formula %.8f%+.8fj\n', real(S), imag(S), real(Sf), imag(Sf))
%check: abs(S - Sf) < 1e-10

%% Draw the ROC
%ar: نرسم الدائرتين |z| = 0.5 و |z| = 2 ونظلل الحلقة بينهما، ونضع الأقطاب عند a و b ودائرة الوحدة المتقطعة.
th = linspace(0, 2*pi, 400);
fill([2*cos(th), 0.5*cos(fliplr(th))], [2*sin(th), 0.5*sin(fliplr(th))], [0.85 0.93 1], 'EdgeColor', 'none'); hold on
plot(cos(th), sin(th), 'k--'); plot([a b], [0 0], 'rx', 'MarkerSize', 12, 'LineWidth', 2); hold off
axis equal; grid on; xlabel('Re\{z\}'); ylabel('Im\{z\}'); title('ROC 0.5 < |z| < 2 (unit circle dashed)')

%%! Project idea: the DTFT is X(z) on the unit circle
%ar: مشروع للفهم: إذا كانت دائرة الوحدة داخل الـ ROC، فقيم X(z) عليها هي الاستجابة الترددية. نحسب |X(e^{jω})| من هذه الصيغة ونرسمها.
w = linspace(-pi, pi, 600); zz = exp(1j*w);
Xw = 1./(1 - a./zz) + 1./(1 - b./zz);
figure; plot(w/pi, abs(Xw)); grid on; xlabel('\omega / \pi'); ylabel('|X(e^{j\omega})|'); title('X(z) evaluated on |z| = 1')
