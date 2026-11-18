% Signals and Systems — Properties of Convolution and of LTI Systems
%title: Cascade, Parallel, Inverse and Stability
%ar-title: التوالي والتوازي والعكس والاستقرار
%lesson: ss-ch2-4
%course: signals-systems

%% The overall impulse response
%ar: (h1 ثم h2) على التوازي مع (h3 ثم h4): h = h1*h2 + h3*h4. h1 = 3δ(t) تضرب h2 في 3 فقط. الجزء الثاني نحسبه عدديًا بـ conv ونقارن بالقانون.
dt = 1e-3; t = 0:dt:6;
h2 = 2*exp(-t); h3 = 4*exp(-2*t); h4 = exp(-3*t);
h34 = conv(h3, h4)*dt; h34 = h34(1:numel(t));
h = 3*h2 + h34;
hf = 6*exp(-t) + 4*(exp(-2*t) - exp(-3*t));
fprintf('max error = %.4f\n', max(abs(h - hf)))
plot(t, h, t, hf, '--'); grid on; xlabel('t'); legend('numerical', '6e^{-t} + 4(e^{-2t} - e^{-3t})'); title('Overall impulse response')
%check: max(abs(h - hf)) < 5e-3

%% Inverse system: u[n] * (d[n] - d[n-1]) = d[n]
%ar: النظام العكسي يلغي أثر النظام: التفافهما = δ.
u = ones(1, 10); hinv = [1 -1];
r = conv(u, hinv);
fprintf('u * h_inv = %s\n', num2str(r(1:10)))
%check: isequal(r(1:10), [1 zeros(1, 9)])

%% Stability: sum of |h|
%ar: LTI مستقر إذا كان Σ|h[n]| محدودًا. نجمع على نوافذ متزايدة: u[n] يكبر بلا حد، و (1/2)^n يقترب من 2.
for N = [10 100 1000]
    fprintf('N = %4d: sum|u| = %4d, sum|0.5^n| = %.6f\n', N, N, sum(0.5.^(0:N-1)))
end

%%! Project idea: an FIR filter from its impulse response
%ar: h[n] = (1/2)^n للـ 0..3 تعني y[n] = x[n] + ½x[n−1] + ¼x[n−2] + ⅛x[n−3]. filter(h, 1, x) يطبقها على أي دخل. نتحقق أنها تساوي conv.
h = 0.5.^(0:3); rng(4); x = randn(1, 20);
y1 = filter(h, 1, x); y2 = conv(x, h); y2 = y2(1:20);
fprintf('filter vs conv: max difference %.2e\n', max(abs(y1 - y2)))
%check: max(abs(y1 - y2)) < 1e-12
