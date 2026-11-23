% Circuits 1 — The Node-Voltage Method Versus the Mesh-Current Method
%title: Counting Equations Before You Solve
%ar-title: عدّ المعادلات قبل الحل
%lesson: c1-techniques-7
%course: circuits-1

%% Count the equations
%ar: معادلات العقد = عدد العقد الأساسية − 1 − مصادر الجهد، ومعادلات الحلقات = عدد الحلقات − مصادر التيار. نطبقها على مسألة 4.13.
ne = 2; meshes = 2; nV = 2; nI = 1;   % Problem 4.13: essential nodes, meshes, voltage sources, current sources
nodeEq = ne - 1; meshEq = meshes - nI;
fprintf('node equations = %d, mesh equations = %d (supermesh + constraint)\n', nodeEq, meshEq)
%check: nodeEq == 1 && meshEq == 1

%% Problem 4.13 by nodes
%ar: (v1 − 20)/15 − 2 + (v1 − 25)/10 = 0 ← v1 = 35 V، و p2A = −70 W.
v1 = (20/15 + 2 + 25/10) / (1/15 + 1/10);
fprintf('v1 = %g V, p(2 A) = %g W\n', v1, -2*v1)
%check: abs(v1 - 35) < 1e-12

%%! Project idea: same answer by meshes
%ar: مشروع: الحلقة الفائقة −20 + 15 ia + 10 ib + 25 = 0 مع ib − ia = 2. نرسم v1 من الطريقتين لعدة قيم لمصدر التيار: الخطان متطابقان.
Is = 0:0.5:5; vn = zeros(size(Is)); vm = vn;
for k = 1:numel(Is)
    vn(k) = (20/15 + Is(k) + 25/10) / (1/15 + 1/10);
    x = [15 10; -1 1] \ [-5; Is(k)]; vm(k) = 20 - 15*x(1);
end
plot(Is, vn, 'o', Is, vm, '-'); grid on; xlabel('current source (A)'); ylabel('v_1 (V)'); legend('node method', 'mesh method'); title('Two methods, one answer')
%check: max(abs(vn - vm)) < 1e-9
