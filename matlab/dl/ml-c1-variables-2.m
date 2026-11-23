% Circuits 1 — Voltage and Current
%title: Charge, Current and Voltage
%ar-title: الشحنة والتيار والجهد
%lesson: c1-variables-2
%course: circuits-1

%% The lesson's example
%ar: شحنة 120 C تمر بانتظام خلال دقيقة، ونقلها يحتاج 1440 J. التيار I = q/t، والجهد V = w/q، وعدد الإلكترونات في الثانية = I × 6.24 × 10^18.
q = 120; t = 60; w = 1440;
I = q / t;
V = w / q;
n = I * 6.24e18;
fprintf('I = %g A, V = %g V, electrons per second = %.4g\n', I, V, n)

%% i = dq/dt numerically
%ar: إذا كانت الشحنة دالة في الزمن، فالتيار هو مشتقتها. نأخذ q(t) = 2t (تمر بانتظام) ونشتق رقميًا بـ diff.
tt = linspace(0, 5, 501); qq = 2 * tt;
ii = diff(qq) ./ diff(tt);
fprintf('current from dq/dt: min %.3f A, max %.3f A\n', min(ii), max(ii))

%%! Project idea: DC versus AC current
%ar: مشروع: نرسم تيارًا مستمرًا (DC) وتيارًا مترددًا (AC) يعكس اتجاهه دوريًا، كما في المحاضرة.
ts = linspace(0, 0.05, 600);
plot(ts, 2*ones(size(ts)), ts, 2*cos(2*pi*60*ts)); grid on
xlabel('t (s)'); ylabel('i (A)'); legend('DC', 'AC (60 Hz)'); title('Direct and alternating current')
