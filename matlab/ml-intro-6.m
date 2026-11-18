% MATLAB from zero — 6: complex numbers and systems of equations
%title: MATLAB from Zero 6: Complex Numbers and Linear Equations
%ar-title: MATLAB من الصفر 6: الأعداد المركبة وحل المعادلات
%course: intro
%level: 6

%% Complex numbers
%ar: MATLAB يفهم j (أو i) كجذر −1. نكتب 3 + 4j مباشرة. abs يعطي المقدار، و angle الزاوية بالراديان، و real و imag الجزأين.
z = 3 + 4j;
fprintf('|z| = %g, angle = %.4f rad = %.2f deg\n', abs(z), angle(z), angle(z)*180/pi)
fprintf('real = %g, imag = %g, conj = %g%+gj\n', real(z), imag(z), real(conj(z)), imag(conj(z)))
%check: abs(z) == 5

%% Polar form for phasors
%ar: الفازور 20∠30° نكتبه 20*exp(1j*30*pi/180). نصنع دالتين صغيرتين للتحويل بين الصيغتين، وسنستخدمهما في كل دروس AC.
pol = @(m, deg) m .* exp(1j*deg*pi/180);
V1 = pol(20, 30); V2 = pol(40, -60);
V = V1 + V2;
fprintf('V = %.2f%+.2fj = %.2f at %.2f deg\n', real(V), imag(V), abs(V), angle(V)*180/pi)
%check: abs(abs(V) - 44.72) < 0.005

%% Impedances
%ar: الملف jωL والمكثف 1/(jωC). العمليات على المركبة عادية: + و * و / .
w = 500; L = 40e-3; C = 100e-6;
ZL = 1j*w*L; ZC = 1/(1j*w*C);
fprintf('ZL = %+gj ohm, ZC = %+gj ohm\n', imag(ZL), imag(ZC))

%% Systems of linear equations: A x = b
%ar: معادلات العقد والحلقات نكتبها مصفوفة: A x = b. الحل بالشرطة المائلة العكسية: x = A \ b. لا تستخدم inv(A)*b: الشرطة أدق وأسرع.
%ar: مثال: 13 i1 − 10 i2 = 40 و −10 i1 + 12 i2 = −20.
A = [13 -10; -10 12];
b = [40; -20];
x = A \ b;
fprintf('i1 = %g A, i2 = %g A\n', x)
%check: abs(x(1) - 5) < 1e-12 && abs(x(2) - 2.5) < 1e-12

%% Polynomials and roots
%ar: كثيرة الحدود نكتب معاملاتها من الأعلى: s² + 3s + 2 هي [1 3 2]. roots يعطي الجذور، و polyval يحسب القيمة.
p = [1 3 2];
r = roots(p);
fprintf('roots: %g %g\n', sort(r))
fprintf('p(1) = %g\n', polyval(p, 1))
%check: all(abs(sort(r) - [-2; -1]) < 1e-12)

%%! Project step: a reusable phasor printer
%ar: كل مشروع دوائر AC يحتاج طباعة الفازور بالشكل القطبي. هذه دالة محلية تكتبها مرة وتستخدمها دائمًا.
show('V1', V1); show('V2', V2); show('V1+V2', V);

function show(name, z)
% SHOW  print a phasor in rectangular and polar form
    fprintf('%-6s = %8.3f %+8.3fj = %7.3f at %7.2f deg\n', name, real(z), imag(z), abs(z), angle(z)*180/pi)
end
