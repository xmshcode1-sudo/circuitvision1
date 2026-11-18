% Circuits 1 — The Mesh-Current Method: Some Special Cases
%title: Supermesh in MATLAB
%ar-title: الحلقة العظمى في MATLAB
%lesson: c1-techniques-6
%course: circuits-1

%% Constraint and supermesh equation
%ar: مصدر التيار المشترك يعطي القيد i1 − i2 = 2.5، و KVL للمسار الخارجي: 8 i1 + 12 i2 + 20 i2 = 40.
A = [1 -1
     8 32];
b = [2.5; 40];
i = A \ b;
fprintf('i1 = %g A, i2 = %g A\n', i)
%check: all(abs(i - [3; 0.5]) < 1e-9)

%% Voltage across the current source
%ar: مصدر التيار له جهد لا نعرفه مسبقًا: نحسبه من KVL لأي حلقة تمر به. هنا من الحلقة 1: v = 40 − 8 i1.
vI = 40 - 8*i(1);
fprintf('voltage across the current source = %g V\n', vI)

%%! Project idea: solve without the supermesh
%ar: مثل MNA: اجعل جهد مصدر التيار مجهولًا ثالثًا واكتب KVL لكل حلقة عادية. البرنامج لا يحتاج أن «يرى» الحلقة العظمى.
M = [8 0 1; 0 32 -1; 1 -1 0];
x = M \ [40; 0; 2.5];
fprintf('i1 = %g, i2 = %g, vI = %g\n', x)
%check: abs(x(1) - 3) < 1e-9 && abs(x(3) - vI) < 1e-9
