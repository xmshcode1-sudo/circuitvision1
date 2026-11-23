% Circuits 1 — Delta-to-Wye (Pi-to-Tee) Equivalent Circuits
%title: Delta-to-Wye in Example 3.7
%ar-title: تحويل دلتا إلى واي في مثال 3.7
%lesson: c1-resistive-5
%course: circuits-1

%% The transformation formulas
%ar: الدلتا العلوية 100 و 125 و 25 Ω (مجموعها 250). كل مقاومة Y = حاصل ضرب الضلعين المجاورين ÷ المجموع.
Ra = 125; Rb = 100; Rc = 25;     % sides of the delta as in the lecture
S = Ra + Rb + Rc;
R1 = Rb*Ra/S; R2 = Ra*Rc/S; R3 = Rb*Rc/S;
fprintf('R1 = %g, R2 = %g, R3 = %g ohm\n', R1, R2, R3)

%% The source current and power
%ar: بعد التحويل: (10 + 40) ∥ (12.5 + 37.5) = 25 Ω، ومع 5 Ω و 50 Ω: Req = 80 Ω و i = 0.5 A و p = −20 W.
Req = 5 + R1 + (R3 + 40)*(R2 + 37.5)/((R3 + 40) + (R2 + 37.5));
i = 40 / Req; p = -i * 40;
fprintf('Req = %g ohm, i = %g A, p = %g W\n', Req, i, p)

%%! Project idea: check with node voltages (no transformation)
%ar: مشروع: نحل نفس الدائرة بالعقد بدون تحويل (عقد: أعلى الجسر a، اليسار x، اليمين y) ونتأكد أن تيار المصدر 0.5 A.
G = [1/5 + 1/100 + 1/125, -1/100,              -1/125
     -1/100,              1/100 + 1/25 + 1/40, -1/25
     -1/125,              -1/25,               1/125 + 1/25 + 1/37.5];
V = G \ [40/5; 0; 0];
isrc = (40 - V(1)) / 5;
fprintf('source current from nodes = %g A\n', isrc)
