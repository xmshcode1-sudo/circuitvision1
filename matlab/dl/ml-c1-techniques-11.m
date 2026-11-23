% Circuits 1 — Maximum Power Transfer
%title: Maximum Power Transfer (Example 4.12)
%ar-title: نقل القدرة القصوى (مثال 4.12)
%lesson: c1-techniques-11
%course: circuits-1

%% Example 4.12
%ar: VTh = (150/180) × 360 = 300 V و RTh = 150 ∥ 30 = 25 Ω. أكبر قدرة عند RL = 25 Ω: pmax = (300/50)² × 25 = 900 W.
VTh = 150/180*360; RTh = 150*30/180;
pmax = (VTh/(2*RTh))^2 * RTh;
fprintf('VTh = %g V, RTh = %g ohm, pmax = %g W\n', VTh, RTh, pmax)

%% How much of the source power arrives?
%ar: vab = 150 V و is = (360 − 150)/30 = 7 A، فالمصدر يعطي 2520 W ونسبة ما يصل للحمل 35.71 %.
vab = VTh/2; is = (360 - vab)/30; ps = 360*is;
fprintf('vab = %g V, is = %g A, source power = %g W, delivered = %.2f %%\n', vab, is, ps, 100*pmax/ps)

%%! Project idea: the power curve
%ar: مشروع: نرسم قدرة الحمل مقابل RL ونتأكد أن القمة عند RL = RTh.
RL = linspace(1, 150, 1500);
p = (VTh ./ (RTh + RL)).^2 .* RL;
[pm, k] = max(p);
plot(RL, p); grid on; xlabel('R_L (\Omega)'); ylabel('p (W)'); title('Load power: peak at R_L = R_{Th} = 25 \Omega')
fprintf('peak %.1f W at RL = %.1f ohm\n', pm, RL(k))
