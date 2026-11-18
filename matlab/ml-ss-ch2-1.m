% Signals and Systems — Impulse Response and the Convolution Sum
%title: The Convolution Sum with conv
%ar-title: مجموع الالتفاف بالدالة conv
%lesson: ss-ch2-1
%course: signals-systems

%% The example with conv
%ar: h[n] = 1 عند n = 0, 1, 2 والدخل x[0] = 0.5 و x[1] = 2. conv(x, h) يحسب y[n] = Σ x[k] h[n − k] مباشرة. طول الناتج = طول x + طول h − 1.
x = [0.5 2];
h = [1 1 1];
y = conv(x, h);
n = 0:numel(y) - 1;
fprintf('y[%d] = %g\n', [n; y])
%check: isequal(y, [0.5 2.5 2.5 2])

%% The same as a sum of shifted copies
%ar: الالتفاف = مجموع نسخ من h مزاحة ومضروبة في قيم الدخل: 0.5 h[n] + 2 h[n − 1]. نبنيها يدويًا ونقارن.
c1 = [0.5*h, 0]; c2 = [0, 2*h];
fprintf('by hand: %s\n', num2str(c1 + c2))
%check: isequal(c1 + c2, y)

%% Plot the pieces and the result
%ar: subplot(3,1,k) تقسم النافذة إلى ثلاثة رسوم فوق بعض وتختار الرسم رقم k.
%ar: الرسمان الأولان هما النسختان المزاحتان من h، والثالث مجموعهما: نفس ناتج conv. هكذا ترى الالتفاف بعينك.
subplot(3,1,1); stem(0:3, c1, 'filled'); grid on; title('0.5 h[n]'); xlim([-0.5 3.5])
subplot(3,1,2); stem(0:3, c2, 'filled'); grid on; title('2 h[n-1]'); xlim([-0.5 3.5])
subplot(3,1,3); stem(n, y, 'filled'); grid on; title('y[n] = x[n] * h[n]'); xlabel('n'); xlim([-0.5 3.5])

%%! Project idea: an echo effect
%ar: مشروع صوتي: الصدى نظام LTI استجابته h = δ[n] + 0.6 δ[n − D]. في MATLAB: y = conv(x, h) على تسجيل صوتي (audioread ثم sound). هنا على إشارة قصيرة.
D = 5; h = [1, zeros(1, D - 1), 0.6];
x = [1 0.5 0.25 0 0 0 0 0];
y = conv(x, h);
fprintf('echo output: %s\n', num2str(y))
