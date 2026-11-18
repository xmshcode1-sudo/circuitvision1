% Circuits 1 — The Node-Voltage Method Versus the Mesh-Current Method
%title: Counting Equations Before You Solve
%ar-title: عدّ المعادلات قبل الحل
%lesson: c1-techniques-7
%course: circuits-1

%% Count the equations of each method
%ar: جهود العقد: (عدد العقد الأساسية − 1) ناقص عدد مصادر الجهد المتصلة بالمرجع أو بين عقدتين. تيارات الحلقات: عدد الحلقات الصغرى ناقص مصادر التيار في الفروع.
nodes = 4; meshes = 5; Vsrc = 1; Isrc = 1;
nNode = nodes - 1 - Vsrc;
nMesh = meshes - Isrc;
fprintf('node method: %d equations, mesh method: %d equations\n', nNode, nMesh)
if nNode <= nMesh, fprintf('-> choose node voltages\n'), else, fprintf('-> choose mesh currents\n'), end
%check: nNode == 2 && nMesh == 4

%% Both methods give the same answer
%ar: نفس الدائرة بالطريقتين يجب أن تعطي نفس الأرقام. مثال درس جهود العقد (v1 = 15، v2 = 27): تيار المقاومة 3 Ω = v1/3 = 5 A. وبالحلقات: مصدر 2 A يحدد تيار الحلقة اليمنى i2 = −2 A (عكس اتجاه الحلقة)، فتبقى معادلة واحدة.
G = [1/5 + 1/3 + 1/6, -1/6; -1/6, 1/6]; v = G \ [6; 2];
fprintf('node method: current in 3 ohm = %g A\n', v(1)/3)
% meshes: left (30 V, 5, 3) and right (3, 6, 2 A source): i2 = -2 (the source sets it)
i2 = -2;
i1 = (30 + 3*i2) / (5 + 3);          % KVL: -30 + 5 i1 + 3(i1 - i2) = 0
fprintf('mesh method: current in 3 ohm = %g A\n', i1 - i2)
%check: abs(v(1)/3 - 5) < 1e-9 && abs(i1 - i2 - 5) < 1e-9

%%! Project idea: a method advisor
%ar: مشروع: دالة تأخذ أرقام الدائرة وتطبع عدد المعادلات بكل طريقة وتنصح بالأقل. أضف لها لاحقًا العدّ التلقائي من قائمة عناصر الدائرة.
advise(4, 5, 1, 1); advise(6, 3, 0, 0);

function advise(nodes, meshes, Vsrc, Isrc)
    a = nodes - 1 - Vsrc; b = meshes - Isrc;
    if a <= b, m = 'node voltages'; else, m = 'mesh currents'; end
    fprintf('nodes %d, meshes %d: %d vs %d equations -> %s\n', nodes, meshes, a, b, m)
end
