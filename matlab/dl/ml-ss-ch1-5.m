% Signals and Systems — Transformations of the Independent Variable
%title: Shift, Scale and Reverse Time
%ar-title: الإزاحة والتحجيم والانعكاس في الزمن
%lesson: ss-ch1-5
%course: signals-systems

%% The signal as a function
%ar: نكتب x(t) دالة مجهولة: 1 على (−1, 0)، و 1 − 0.5t على (0, 2)، وصفر غير ذلك. الشروط المنطقية (t >= 0) تعطي 1 أو 0.
x = @(t) 1.*(t > -1 & t < 0) + (1 - 0.5*t).*(t >= 0 & t < 2);

%% y(t) = x(-3t - 4)
%ar: لا نحتاج حسابًا يدويًا: نعوّض −3t − 4 مكان t في الدالة. MATLAB يحسب القيم مباشرة.
t = linspace(-3, 3, 3001);
y = x(-3*t - 4);
subplot(2,1,1); plot(t, x(t)); grid on; title('x(t)'); ylim([-0.2 1.2])
subplot(2,1,2); plot(t, y); grid on; title('y(t) = x(-3t - 4)'); xlabel('t'); ylim([-0.2 3.2])
fprintf('y is non-zero for t in (%.4f, %.4f)\n', min(t(y > 0)), max(t(y > 0)))

%% Check one point by hand
%ar: عند t = −1.5: −3(−1.5) − 4 = 0.5، و x(0.5) = 1 − 0.25 = 0.75. نطابق.
fprintf('y(-1.5) = %.4f, x(0.5) = %.4f\n', x(-3*(-1.5) - 4), x(0.5))

%%! Project idea: a transformation playground
%ar: مشروع: دالة تأخذ أي x(t) وثلاثة أرقام (a, t0, عكس أم لا) وترسم الأصل والمحوّل معًا. جرب سرعة الصوت المضاعفة (a = 2) في تسجيل صوتي: يقصر الزمن ويرتفع التردد.
show_transform(x, 2, 1); show_transform(x, 0.5, -1);

function show_transform(x, a, t0)
    t = linspace(-6, 6, 2001);
    figure; plot(t, x(t), t, x(a*t - t0), '--'); grid on
    legend('x(t)', sprintf('x(%gt %+g)', a, -t0)); xlabel('t'); title('Time scaling and shifting')
end
