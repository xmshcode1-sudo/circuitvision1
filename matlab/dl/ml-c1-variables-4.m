% Circuits 1 — Power and Energy
%title: Power Balance and Energy
%ar-title: توازن القدرة والطاقة
%lesson: c1-variables-4
%course: circuits-1

%% P = dw/dt = VI
%ar: مثال الدرس: عنصر عليه 4 V ويدخله 3 A من طرفه الموجب. p = vi، والطاقة في دقيقتين w = p·t.
v = 4; i = 3; t = 120;
p = v * i;
w = p * t;
fprintf('p = %g W, energy in 2 min = %g J\n', p, w)

%% Energy is the integral of power
%ar: إذا تغيرت القدرة مع الزمن فالطاقة تكامل القدرة. نتحقق بـ trapz أن تكامل قدرة ثابتة 12 W خلال 120 s يعطي 1440 J.
tt = linspace(0, 120, 1201);
pp = 12 * ones(size(tt));
W = trapz(tt, pp);
fprintf('integral of p dt = %.4f J\n', W)

%%! Project idea: power balance in a circuit
%ar: مشروع: في مثال 2.8 (الفصل الثاني) القدرات هي 450 و 90 و 360 و −900 W. مجموعها يجب أن يكون صفرًا.
names = {'50 ohm', '10 ohm', '120 V source', '6 A source'};
P = [450 90 360 -900];
for k = 1:4, fprintf('%-13s %+6g W\n', names{k}, P(k)); end
fprintf('sum = %g W\n', sum(P))
bar(P); grid on; set(gca, 'xticklabel', names); ylabel('p (W)'); title('Power balance: the bars add up to zero')
