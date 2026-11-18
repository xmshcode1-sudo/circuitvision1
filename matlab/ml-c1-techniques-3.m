% Circuits 1 — The Node-Voltage Method: Some Special Cases
%title: Supernode in MATLAB
%ar-title: العقدة العظمى في MATLAB
%lesson: c1-techniques-3
%course: circuits-1

%% Known node and the supernode
%ar: v1 = 50 V معروفة مباشرة. المصدر 10 V بين v2 و v3 يعطي القيد v3 = v2 + 10، و KCL للعقدة العظمى: (v2 − 50)/5 + v2/15 + v3/20 = 0.
%ar: نكتب معادلتين في مجهولين (v2، v3) ونحل.
A = [1/5 + 1/15, 1/20
     -1,         1   ];
b = [50/5; 10];
v = A \ b;
fprintf('v2 = %g V, v3 = %g V\n', v)
%check: all(abs(v - [30; 40]) < 1e-9)

%% Check KCL for the supernode
%ar: التيارات الخارجة من العقدة العظمى: −4 و 2 و 2 أمبير. مجموعها صفر.
i = [(v(1) - 50)/5, v(1)/15, v(2)/20];
fprintf('%g + %g + %g = %g\n', i, sum(i))
%check: abs(sum(i)) < 1e-12

%%! Project idea: the source as an extra unknown (MNA)
%ar: البرامج الحقيقية لا تبحث عن العقد العظمى: تضيف تيار كل مصدر جهد مجهولًا جديدًا (طريقة MNA). هنا: المجاهيل v2 و v3 وتيار المصدر 10 V.
M = [1/5 + 1/15, 0,    1
     0,          1/20, -1
     -1,         1,     0];
x = M \ [50/5; 0; 10];
fprintf('MNA: v2 = %g, v3 = %g, current of the 10 V source = %g A\n', x)
%check: abs(x(1) - 30) < 1e-9 && abs(x(2) - 40) < 1e-9
