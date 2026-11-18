% Circuits 1 — Resistors in Series
%title: Series Resistors and Voltage Sharing
%ar-title: المقاومات على التوالي وتوزيع الجهد
%lesson: c1-resistive-1
%course: circuits-1

%% The example
%ar: أربع مقاومات على التوالي مع 40 V. Req = sum(R)، والتيار واحد للجميع، وجهد كل مقاومة i·R.
R = [2 3 5 10]; Vs = 40;
Req = sum(R); i = Vs/Req; v = i*R;
fprintf('Req = %g ohm, i = %g A\n', Req, i)
fprintf('v(%g ohm) = %g V\n', [R; v])
%check: Req == 20 && i == 2 && v(4) == 20

%% KVL check and a bar chart
%ar: مجموع الجهود يساوي جهد المصدر. bar يرسم نصيب كل مقاومة: الكبرى تأخذ النصيب الأكبر.
fprintf('sum of voltages = %g V\n', sum(v))
bar(v); grid on; set(gca, 'XTickLabel', {'2 \Omega', '3 \Omega', '5 \Omega', '10 \Omega'})
ylabel('voltage (V)'); title('Voltage across each series resistor')
%check: sum(v) == Vs

%%! Project idea: LED current-limiting resistor
%ar: مشروع عملي: LED يحتاج 20 mA وهبوطه 2 V، والمصدر 5 V. المقاومة على التوالي = (5 − 2)/0.02. ثم نختار أقرب قيمة قياسية أكبر منها (أكثر أمانًا).
Vs = 5; Vled = 2; Iled = 20e-3;
Rneed = (Vs - Vled)/Iled;
E12 = [1 1.2 1.5 1.8 2.2 2.7 3.3 3.9 4.7 5.6 6.8 8.2];
std = [E12 E12*10 E12*100 E12*1000];
Rpick = std(find(std >= Rneed, 1));
fprintf('needed %g ohm -> use %g ohm: I = %.1f mA, P = %.1f mW\n', Rneed, Rpick, (Vs-Vled)/Rpick*1e3, ((Vs-Vled)/Rpick)^2*Rpick*1e3)
%check: Rneed == 150 && Rpick == 150
