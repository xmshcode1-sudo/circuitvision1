% Signals and Systems — Signals, Systems, CT and DT
%title: Continuous and Discrete Signals: Sampling
%ar-title: الإشارات المستمرة والمتقطعة وأخذ العيّنات
%lesson: ss-ch1-1
%course: signals-systems

%% A continuous signal on the computer
%ar: الحاسوب لا يخزن إشارة مستمرة فعلًا: نأخذ نقاطًا كثيرة جدًا قريبة من بعض (هنا 1000 نقطة) فتبدو مستمرة عند الرسم بـ plot.
t = linspace(0, 5, 1000);
x = exp(-t);

%% Sampling: x[n] = x(n Ts)
%ar: مثال الدرس: Ts = 0.5 s. العيّنة رقم n تؤخذ عند t = n Ts. لاحظ أن x[2] هي قيمة الإشارة عند t = 1 s.
Ts = 0.5;
n = 0:10;
xn = exp(-n*Ts);
fprintf('x[2] = x(%g s) = %.4f\n', 2*Ts, xn(n == 2))
%check: abs(xn(3) - exp(-1)) < 1e-12

%% Plot both on one figure
%ar: نرسم المستمرة بـ plot والمتقطعة بـ stem على نفس المحور (محور الزمن t = n Ts).
plot(t, x); hold on
stem(n*Ts, xn, 'filled'); hold off; grid on
xlabel('t (s)'); ylabel('x'); legend('x(t) = e^{-t}', 'x[n] = x(nT_s)'); title('Sampling with T_s = 0.5 s')

%% Deterministic and random signals
%ar: الإشارة المحددة نعرف قيمتها من القانون، أما العشوائية (مثل الضوضاء) فنولدها بـ randn: كل تشغيل يعطي قيمًا مختلفة. rng(1) يثبت البذرة لتكرار نفس النتيجة.
rng(1);
noise = 0.05*randn(size(t));
fprintf('noise: mean %.4f, std %.4f\n', mean(noise), std(noise))

%%! Project idea: a simple analog-to-digital converter
%ar: مشروع: المحول ADC يأخذ عيّنات ثم «يقرّب» كل عيّنة لأقرب مستوى (التكميم). بعدد بتات B يوجد 2^B مستوى. جرب B = 3 ولاحظ الخطأ.
B = 3; L = 2^B; xmax = 1;
q = round(xn/xmax*(L - 1))/(L - 1)*xmax;
figure; stem(n, xn); hold on; stairs(n, q, 'r'); hold off; grid on
xlabel('n'); legend('samples', sprintf('%d-bit ADC', B)); title('Quantization')
fprintf('largest quantization error = %.4f\n', max(abs(q - xn)))
