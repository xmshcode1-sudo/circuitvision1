% Circuits 1 — Power Factor Correction
%title: Power Factor Correction
%ar-title: تصحيح معامل القدرة
%lesson: c1-power-7
%course: circuits-1

%% Size the capacitor
%ar: Q المطلوب إزالته = P(tan θold − tan θnew)، ثم C = QC/(ω V²).
P = 10e3; V = 220; f = 60; w = 2*pi*f;
Qold = P*tan(acos(0.8)); Qnew = P*tan(acos(0.95));
QC = Qold - Qnew; C = QC/(w*V^2);
fprintf('Qold = %.1f, Qnew = %.1f, QC = %.1f VAR, C = %.1f uF\n', Qold, Qnew, QC, C*1e6)
%check: abs(C*1e6 - 230.9) < 0.1

%% The current drops
%ar: التيار = |S|/V. قبل التصحيح وبعده. نفس القدرة الحقيقية بتيار أقل ⇐ أسلاك أرخص وفقد أقل.
Iold = abs(P + 1j*Qold)/V; Inew = abs(P + 1j*Qnew)/V;
fprintf('I: %.2f A -> %.2f A\n', Iold, Inew)
%check: abs(Iold - 56.82) < 0.01 && abs(Inew - 47.85) < 0.01

%% Current versus capacitor size
%ar: نرسم التيار لمدى من المكثفات: ينزل حتى pf = 1 ثم يرجع يرتفع (تصحيح زائد يجعل الحمل سعويًا).
C = linspace(0, 600e-6, 400);
I = abs(P + 1j*(Qold - w*C*V^2))/V;
plot(C*1e6, I); grid on; xlabel('C (\muF)'); ylabel('line current (A)'); title('Current vs correction capacitor')
[Imin, k] = min(I);
fprintf('minimum current %.2f A at C = %.0f uF (pf = 1)\n', Imin, C(k)*1e6)

%%! Project idea: a correction calculator for a whole building
%ar: مشروع: دالة تأخذ P و pf الحالي والمطلوب والجهد والتردد وترجع المكثف وأقرب قيمة قياسية. استخدمها لعدة مبانٍ دفعة واحدة.
for x = [10e3 0.8; 25e3 0.75; 5e3 0.9]'
    c = pfc(x(1), x(2), 0.95, 220, 60);
    fprintf('P = %5.0f W, pf %.2f -> C = %.0f uF\n', x(1), x(2), c*1e6)
end

function C = pfc(P, pf1, pf2, V, f)
    C = P*(tan(acos(pf1)) - tan(acos(pf2))) / (2*pi*f*V^2);
end
