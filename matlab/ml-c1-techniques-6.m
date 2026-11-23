% Circuits 1 — The Mesh-Current Method: Some Special Cases
%title: Supermesh in MATLAB
%ar-title: الحلقة الفائقة في MATLAB
%lesson: c1-techniques-6
%course: circuits-1

%% The lecture's supermesh
%ar: الحلقة الفائقة: 9 ia − 5 ib + 6 ic = 50. الحلقة b: −3 ia + 15 ib − 2 ic = 0. والمصدر: ic − ia = 5.
A = [ 9 -5  6
     -3 15 -2
     -1  0  1];
I = A \ [50; 0; 5];
fprintf('ia = %g A, ib = %g A, ic = %g A\n', I)
%check: max(abs(I - [1.75; 1.25; 6.75])) < 1e-12

%% The voltage of the current source
%ar: من معادلة الحلقة a: v = 100 − 3(ia − ib) − 6 ia. هذا جهد مصدر 5 A الذي تجنبناه بالحلقة الفائقة.
v = 100 - 3*(I(1) - I(2)) - 6*I(1);
fprintf('v across the 5 A source = %g V\n', v)
%check: abs(v - 88) < 1e-12

%%! Project idea: Problem 4.13 both ways
%ar: مشروع: مسألة 4.13: بالعقد معادلة واحدة، وبالحلقات حلقة فائقة. الطريقتان تعطيان v1 = 35 V وقدرة مصدر 2 A = −70 W.
v1 = (20/15 + 2 + 25/10) / (1/15 + 1/10);
I2 = [15 10; -1 1] \ [-5; 2];
v1m = 20 - 15*I2(1);
fprintf('node method v1 = %g V, mesh method v1 = %g V, p(2 A) = %g W\n', v1, v1m, -v1*2)
%check: abs(v1 - 35) < 1e-12 && abs(v1m - 35) < 1e-12
