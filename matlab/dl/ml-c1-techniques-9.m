% Circuits 1 — Thevenin and Norton Equivalents
%title: Thevenin Equivalent: Three Ways
%ar-title: مكافئ ثيفنن بثلاث طرق
%lesson: c1-techniques-9
%course: circuits-1

%% From the formulas
%ar: الدائرة: مصدر 12 V، R1 = 4، R2 = 12 على التوازي مع الطرفين عبر R3 = 1. VTh بقسمة الجهد، و RTh بإطفاء المصدر.
Vs = 12; R1 = 4; R2 = 12; R3 = 1;
par = @(a, b) a*b/(a + b);
VTh = Vs*R2/(R1 + R2);
RTh = R3 + par(R1, R2);
IN = VTh/RTh;
fprintf('VTh = %g V, RTh = %g ohm, IN = %g A\n', VTh, RTh, IN)

%% From two measurements on the full circuit
%ar: الطريقة التجريبية (كما في المعمل): احسب جهد الطرفين لحملين مختلفين من الدائرة الكاملة، ثم أوجد الخط v = VTh − RTh·i.
vload = @(RL) Vs*par(R2, R3 + RL)/(R1 + par(R2, R3 + RL)) * RL/(R3 + RL);
RLa = 2; RLb = 10;
va = vload(RLa); vb = vload(RLb); ia = va/RLa; ib = vb/RLb;
c = polyfit([ia ib], [va vb], 1);
fprintf('from two loads: VTh = %g V, RTh = %g ohm\n', c(2), -c(1))

%% The equivalent behaves the same for every load
%ar: نرسم جهد الحمل من الدائرة الكاملة ومن المكافئ: المنحنيان متطابقان تمامًا.
RL = logspace(-1, 2, 100);
vfull = arrayfun(vload, RL);
vth = VTh*RL./(RTh + RL);
semilogx(RL, vfull, RL, vth, '--'); grid on; xlabel('R_L (\Omega)'); ylabel('v_{ab} (V)')
legend('full circuit', 'Thevenin equivalent', 'Location', 'southeast'); title('Same load voltage')
fprintf('largest difference = %g V\n', max(abs(vfull - vth)))

%%! Project idea: measure the output resistance of a real device
%ar: مشروع معمل: قِس جهد خرج شاحن أو بطارية بدون حمل ثم مع حمل معروف. الدالة تعطيك VTh و RTh من قراءتين فقط. جرّبها بقراءات حقيقية.
[V0, R0] = thevenin_from(5.05, Inf, 4.80, 10);
fprintf('charger: VTh = %.2f V, RTh = %.3f ohm\n', V0, R0)

function [VTh, RTh] = thevenin_from(v1, R1, v2, R2)
% v1 measured with load R1 (Inf = no load), v2 with load R2
    if isinf(R1), VTh = v1; RTh = (v1 - v2)/(v2/R2);
    else, i1 = v1/R1; i2 = v2/R2; RTh = (v1 - v2)/(i2 - i1); VTh = v1 + i1*RTh; end
end
