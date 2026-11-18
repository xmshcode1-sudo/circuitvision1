% MATLAB from zero — 3: plotting
%title: MATLAB from Zero 3: Plotting
%ar-title: MATLAB من الصفر 3: الرسم البياني
%course: intro
%level: 3

%% Your first plot
%ar: الرسم يحتاج متجهين بنفس الطول: قيم x وقيم y. نصنع الزمن بـ linspace ثم نحسب الإشارة لكل لحظة بعمليات النقطة.
t = linspace(0, 2e-3, 400);          % 0 to 2 ms
v = 10*sin(2*pi*1000*t);             % 1 kHz, 10 V peak
plot(t*1e3, v)
xlabel('t (ms)'); ylabel('v (V)'); title('A 1 kHz sine wave'); grid on
%ar: ضربنا t في 1e3 حتى يكون المحور بالمللي ثانية. دائمًا اكتب عنوان المحور ووحدته.

%% Several curves on one figure
%ar: hold on يبقي الرسم السابق ويضيف عليه. legend يكتب اسم كل منحنى بنفس الترتيب. '--' خط متقطع، و 'r' أحمر.
i = 2*sin(2*pi*1000*t - pi/3);
figure
plot(t*1e3, v); hold on
plot(t*1e3, 5*i, 'r--'); hold off
xlabel('t (ms)'); grid on
legend('v (V)', '5 i (A)'); title('Voltage and current')

%% Subplots
%ar: subplot(2,1,k) يقسم النافذة إلى صفين وعمود، ويرسم في الجزء k. مفيد لرسم الدخل والخرج فوق بعض.
figure
subplot(2,1,1); plot(t*1e3, v); ylabel('v (V)'); grid on; title('Input')
subplot(2,1,2); plot(t*1e3, v.*i); ylabel('p (W)'); xlabel('t (ms)'); grid on; title('Instantaneous power')

%% Discrete signals: stem
%ar: الإشارات المتقطعة x[n] نرسمها بـ stem وليس plot: عمود عند كل عدد صحيح n. ستحتاجه كثيرًا في الإشارات والنظم.
n = 0:15;
x = 0.8.^n;
figure
stem(n, x, 'filled'); xlabel('n'); ylabel('x[n]'); title('x[n] = 0.8^n'); grid on
%check: abs(x(4) - 0.512) < 1e-12

%%! Project step: save the figure for your report
%ar: لحفظ الرسم صورةً للتقرير: saveas(gcf, 'wave.png'). gcf تعني الشكل الحالي. أو من نافذة الشكل: File ثم Save As.
%ar: فكرة مشروع: سكربت يرسم أي إشارة جيبية من ثلاث قيم (السعة، التردد، الطور) ويحفظها. غيّر القيم وشاهد الفرق.
A = 5; f = 50; phi = pi/4;
t = linspace(0, 3/f, 600);
figure
plot(t*1e3, A*cos(2*pi*f*t + phi)); grid on
xlabel('t (ms)'); ylabel('v (V)'); title(sprintf('A = %g V, f = %g Hz, phase = %g deg', A, f, phi*180/pi))
