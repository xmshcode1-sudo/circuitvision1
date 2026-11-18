% Signals and Systems — Systems: Memory, Invertibility, Causality
%title: Testing Systems: Memory and Causality
%ar-title: اختبار النظم: الذاكرة والسببية
%lesson: ss-ch1-8
%course: signals-systems

%% Systems as functions of a whole signal
%ar: نمثل كل نظام دالة تأخذ متجه الدخل x (على محور n) وترجع الخرج. الإزاحة x[n − 1] نعملها بتحريك المتجه وإضافة صفر.
delay   = @(x) [0, x(1:end-1)];               % y[n] = x[n-1]
advance = @(x) [x(2:end), 0];                 % y[n] = x[n+1]
square  = @(x) (2*x - x.^2).^2;               % y[n] = (2x[n] - x[n]^2)^2
accum   = @(x) cumsum(x);                     % y[n] = sum of x[k], k <= n

%% A numerical causality test
%ar: فكرة الاختبار: دخلان متطابقان حتى n0 ومختلفان بعده. النظام السببي يعطي خرجين متطابقين حتى n0. إذا اختلفا قبل n0 فهو يحتاج المستقبل.
n = 0:20; n0 = 10;
x1 = sin(0.3*n); x2 = x1; x2(n > n0) = x2(n > n0) + 1;
names = {'x[n-1]', 'x[n+1]', '(2x - x^2)^2', 'running sum'}; sys = {delay, advance, square, accum};
for k = 1:4
    y1 = sys{k}(x1); y2 = sys{k}(x2);
    causal = all(abs(y1(n <= n0) - y2(n <= n0)) < 1e-12);
    fprintf('%-14s causal: %d\n', names{k}, causal)
end

%% A numerical memory test
%ar: بلا ذاكرة: الخرج عند n يعتمد على x[n] فقط. نغيّر الدخل عند لحظة واحدة: النظام بلا ذاكرة يتغير خرجه في نفس اللحظة فقط.
x3 = x1; x3(n == n0) = x3(n == n0) + 1;
for k = 1:4
    ch = find(abs(sys{k}(x3) - sys{k}(x1)) > 1e-12) - 1;
    fprintf('%-14s output changed at n = %s -> memoryless: %d\n', names{k}, num2str(ch), isequal(ch, n0))
end

%%! Project idea: an automatic system classifier
%ar: مشروع: اجمع الاختبارين (وأضف الخطية والاستقرار من الدرس التالي) في دالة واحدة classify(sys) تطبع جدول خصائص أي نظام تكتبه. ممتاز لمراجعة الواجبات.
y = accum(double(n == 0));
fprintf('impulse response of the running sum: %s ...\n', num2str(y(1:6)))
