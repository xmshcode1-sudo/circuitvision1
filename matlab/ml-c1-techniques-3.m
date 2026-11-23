% Circuits 1 — The Node-Voltage Method: Some Special Cases
%title: Supernode in MATLAB
%ar-title: العقدة الفائقة في MATLAB
%lesson: c1-techniques-3
%course: circuits-1

%% The lecture's supernode
%ar: v1 = 50 V مباشرة. ومن المحاضرة: 22 v2 + v3 = 1400، و v2 + 2(v2 − 50) − v3 = 0 أي 3 v2 − v3 = 100.
A = [22  1
      3 -1];
b = [1400; 100];
v = A \ b; v2 = v(1); v3 = v(2);
iphi = (v2 - 50) / 5;
fprintf('v2 = %g V, v3 = %g V, iphi = %g A\n', v2, v3, iphi)
%check: abs(v2 - 60) < 1e-12 && abs(v3 - 80) < 1e-12 && abs(iphi - 2) < 1e-12

%% Check the supernode KCL
%ar: KCL على العقدة الفائقة كاملة: (v2 − v1)/5 + v2/50 + v3/100 − 4 = 0.
r = (v2 - 50)/5 + v2/50 + v3/100 - 4;
fprintf('KCL residual = %.2e\n', r)
%check: abs(r) < 1e-12

%%! Project idea: modified nodal analysis
%ar: مشروع: بدل العقدة الفائقة نضيف تيار المصدر التابع مجهولًا (طريقة MNA التي يستخدمها SPICE). المجاهيل: v2 و v3 وتيار المصدر.
% unknowns: v2, v3, ix (current from node 2 to node 3 through the dependent source)
M = [1/5 + 1/50, 0,        1
     0,          1/100,   -1
     -1 - 10/5,  1,        0];
rhs = [50/5; 4; -10*50/5];
x = M \ rhs;
fprintf('v2 = %g, v3 = %g, source current = %g A\n', x)
%check: abs(x(1) - 60) < 1e-12 && abs(x(2) - 80) < 1e-12
