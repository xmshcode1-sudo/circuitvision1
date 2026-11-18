% Circuits 1 — Delta-to-Wye (Pi-to-Tee) Equivalent Circuits
%title: Delta-to-Wye and the Bridge
%ar-title: تحويل دلتا إلى واي وحل الجسر
%lesson: c1-resistive-5
%course: circuits-1

%% Delta to wye
%ar: كل مقاومة Y = حاصل ضرب الضلعين المجاورين ÷ مجموع الثلاثة. المثلث هنا R1 = 20 و R2 = 30 و R5 = 50.
R1 = 20; R2 = 30; R5 = 50; R3 = 14; R4 = 9;
S = R1 + R2 + R5;
Ra = R1*R2/S; Rb = R1*R5/S; Rc = R2*R5/S;
fprintf('Y resistors: %g, %g, %g ohm\n', Ra, Rb, Rc)
%check: Ra == 6 && Rb == 10 && Rc == 15

%% Finish the bridge
%ar: بعد التحويل: (Rb + R3) ∥ (Rc + R4) ثم على التوالي مع Ra.
par = @(a, b) a*b/(a + b);
Rab = Ra + par(Rb + R3, Rc + R4);
fprintf('Rab = %g ohm\n', Rab)
%check: abs(Rab - 18) < 1e-12

%% Check with nodal analysis
%ar: تحقق مستقل: نحقن 1 A في a ونخرجه من b، ونحل جهود العقد بالمصفوفة. Rab = va − vb. يجب أن يعطي نفس الرقم.
% nodes: 1 = a, 2 = between R1-R3-R5, 3 = between R2-R4-R5, b = reference
G = [1/R1+1/R2, -1/R1,          -1/R2
     -1/R1,      1/R1+1/R3+1/R5, -1/R5
     -1/R2,     -1/R5,           1/R2+1/R4+1/R5];
v = G \ [1; 0; 0];
fprintf('nodal: Rab = %g ohm\n', v(1))
%check: abs(v(1) - 18) < 1e-9

%%! Project idea: a reusable converter in both directions
%ar: مشروع: دالتان d2y و y2d. التحقق: التحويل ذهابًا وإيابًا يرجع نفس القيم.
[a, b, c] = d2y(R1, R2, R5); [x, y, z] = y2d(a, b, c);
fprintf('back to delta: %g %g %g\n', x, y, z)
%check: abs(x - 20) < 1e-9

function [Ra, Rb, Rc] = d2y(R1, R2, R3)
    S = R1 + R2 + R3; Ra = R1*R2/S; Rb = R1*R3/S; Rc = R2*R3/S;
end
function [R1, R2, R3] = y2d(Ra, Rb, Rc)
    N = Ra*Rb + Rb*Rc + Rc*Ra; R1 = N/Rc; R2 = N/Rb; R3 = N/Ra;
end
