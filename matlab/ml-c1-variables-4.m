% Circuits 1 — Power and Energy
%title: Power Balance and Energy
%ar-title: توازن القدرة والطاقة
%lesson: c1-variables-4
%course: circuits-1

%% Power of each element
%ar: جدول الدرس: ثلاثة عناصر. نضع الجهود والتيارات في متجهات، ومتجهًا منطقيًا يقول هل يدخل التيار من +.
v = [12 5 7]; i = [2 2 2];
entersPlus = [false true true];
s = ones(1,3); s(~entersPlus) = -1;     % +1 for p = vi, -1 for p = -vi
p = s .* v .* i;
fprintf('p_%c = %+g W\n', [double('abc'); p])
%check: isequal(p, [-24 10 14])

%% The power balance
%ar: في أي دائرة صحيحة مجموع القدرات صفر: ما يولده عنصر يمتصه غيره. هذا أسرع اختبار لحلّك.
fprintf('sum of powers = %g W\n', sum(p))
fprintf('delivered = %g W, absorbed = %g W\n', -sum(p(p<0)), sum(p(p>0)))
%check: sum(p) == 0

%% Energy: heater 1500 W for 2 hours
%ar: الطاقة = القدرة × الزمن. بالـ kWh (وحدة فاتورة الكهرباء) وبالجول.
P = 1500; T = 2;
E_kWh = P/1000 * T;
E_J = P * T*3600;
fprintf('E = %g kWh = %g J = %g MJ\n', E_kWh, E_J, E_J/1e6)
%check: E_kWh == 3 && E_J == 1.08e7

%% Energy from a varying power
%ar: إذا تغيرت القدرة مع الزمن: الطاقة هي المساحة تحت منحنى p(t)، ونحسبها بـ trapz. مثال: p = 1500 W في أول ساعة ثم 750 W.
t = linspace(0, 2*3600, 7201);
pt = 1500*(t < 3600) + 750*(t >= 3600);
E = trapz(t, pt);
fprintf('E = %.3f kWh\n', E/3.6e6)
plot(t/3600, pt); grid on; xlabel('t (h)'); ylabel('p (W)'); title('Power of the heater'); ylim([0 1700])

%%! Project idea: electricity bill estimator
%ar: مشروع: قائمة أجهزة البيت (القدرة وساعات التشغيل اليومية) ⇐ استهلاك شهري وفاتورة. السعر هنا مثال فقط: غيّره لتعرفة بلدك.
names = {'AC', 'fridge', 'lights', 'heater'};
Pw = [1800 150 200 1500]; hours = [10 24 6 1];
kWh = Pw/1000 .* hours * 30;
price = 0.18;                                % example price per kWh
for k = 1:numel(names), fprintf('%-7s %7.1f kWh\n', names{k}, kWh(k)); end
fprintf('total %.1f kWh -> %.2f per month at %.2f per kWh\n', sum(kWh), sum(kWh)*price, price)
