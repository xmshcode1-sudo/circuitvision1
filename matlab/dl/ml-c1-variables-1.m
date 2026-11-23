% Circuits 1 — Circuit Analysis: An Overview
%title: The Four Circuit Variables
%ar-title: متغيرات الدائرة الأربعة
%lesson: c1-variables-1
%course: circuits-1

%% A circuit model in numbers
%ar: نموذج الدائرة: مصدر يعطي الطاقة ومقاومة تمثل الحمل. نحسب المتغيرات الأربعة: التيار والجهد والقدرة والطاقة.
V = 12; R = 6; t = 60;          % 12 V source, 6 ohm load, one minute
I = V / R;                       % current (A)
P = V * I;                       % power (W)
W = P * t;                       % energy (J)
fprintf('I = %g A, V = %g V, P = %g W, W = %g J\n', I, V, P, W)

%% Classify the elements
%ar: نصنّف عناصر الدائرة كما في المحاضرة: مصدر، أو خامل غير مفاعل (R)، أو مفاعل (L و C).
names = {'battery', 'resistor', 'capacitor', 'inductor'};
kind  = {'source', 'passive, non-reactive', 'reactive (stores energy)', 'reactive (stores energy)'};
for k = 1:numel(names)
    fprintf('%-10s : %s\n', names{k}, kind{k})
end

%%! Project idea: energy over a day
%ar: مشروع: نفس الحمل يعمل ساعات مختلفة. نرسم الطاقة بالكيلوواط ساعة مقابل عدد الساعات: الطاقة = القدرة × الزمن.
h = 0:24;
E_kWh = P * h / 1000;
plot(h, E_kWh, '-o'); grid on; xlabel('hours of operation'); ylabel('energy (kWh)'); title('Energy = power x time (24 W load)')
fprintf('energy after 24 h = %.3f kWh\n', E_kWh(end))
