% Signals and Systems — Computing the Convolution Sum
%title: Flip, Shift, Multiply and Add
%ar-title: اعكس، أزح، اضرب واجمع
%lesson: ss-ch2-2
%course: signals-systems

%% Example 1 with conv
%ar: x = 1, 2, 1, 2 و h = 1, 1. الناتج بطول 4 + 2 − 1 = 5.
x = [1 2 1 2]; h = [1 1];
y = conv(x, h);
fprintf('y = %s\n', num2str(y))

%% The flip-and-shift loop, written out
%ar: نكتب نفس الحساب بحلقة: لكل n نعكس h ونزيحها ونضرب في x ونجمع. هذا ما تعمله بيدك، و conv تعمله أسرع.
N = numel(x) + numel(h) - 1; y2 = zeros(1, N);
for n = 0:N-1
    for k = 0:numel(x)-1
        if n - k >= 0 && n - k < numel(h), y2(n+1) = y2(n+1) + x(k+1)*h(n-k+1); end
    end
end
fprintf('loop: %s\n', num2str(y2))

%% Example 2: infinite signals, truncated
%ar: x[n] = (1/2)^(n−1) u[n − 1] و h = u[n]. نأخذ 30 عيّنة من كل منهما: أول 30 قيمة من الناتج صحيحة تمامًا. نقارن بالقانون 2(1 − (1/2)^n).
n = 0:29;
x = (0.5).^(n - 1) .* (n >= 1); h = ones(1, 30);
y = conv(x, h); y = y(1:30);
yf = 2*(1 - 0.5.^n);
fprintf('max error vs formula = %.2e\n', max(abs(y - yf)))
stem(n, y, 'filled'); hold on; plot(n, yf, 'r--'); hold off; grid on; xlabel('n'); legend('conv', '2(1 - 0.5^n)'); title('Example 2')

%% Example 3: the three regions
%ar: x = 1 عند 0 ≤ n ≤ 4، و h = α^n عند 0 ≤ n ≤ 6. نختار α = 1.2 ونقارن conv بالقوانين الثلاثة للمناطق.
a = 1.2; x = ones(1, 5); h = a.^(0:6);
y = conv(x, h); n = 0:numel(y)-1;
yf = zeros(size(n));
for k = n
    if k <= 4, yf(k+1) = (1 - a^(k+1))/(1 - a);
    elseif k <= 6, yf(k+1) = (a^(k-4) - a^(k+1))/(1 - a);
    elseif k <= 10, yf(k+1) = (a^(k-4) - a^7)/(1 - a); end
end
fprintf('max error = %.2e\n', max(abs(y - yf)))

%%! Project idea: a moving-average filter
%ar: مشروع: متوسط متحرك لـ M عيّنة = التفاف مع h = ones(1, M)/M. يزيل الضوضاء من قراءات حساس. جرّب M = 5 على إشارة مشوشة.
rng(3); n = 0:99; s = sin(2*pi*n/50); noisy = s + 0.3*randn(size(n));
M = 5; sm = conv(noisy, ones(1, M)/M, 'same');
figure; plot(n, noisy, ':', n, sm, n, s, '--'); grid on; legend('noisy', 'moving average', 'clean'); xlabel('n'); title('Moving-average filter')
fprintf('rms error: noisy %.3f, filtered %.3f\n', sqrt(mean((noisy - s).^2)), sqrt(mean((sm(3:end-2) - s(3:end-2)).^2)))
