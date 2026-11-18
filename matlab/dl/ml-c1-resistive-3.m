% Circuits 1 — The Voltage-Divider and Current-Divider Circuits
%title: The Loaded Voltage Divider
%ar-title: مقسّم الجهد مع الحمل
%lesson: c1-resistive-3
%course: circuits-1

%% Without and with the load
%ar: المثال: 12 V، R1 = 6 kΩ، R2 = 3 kΩ. بدون حمل: vo = Vs R2/(R1+R2). مع حمل 3 kΩ: R2 يصير R2 ∥ RL.
Vs = 12; R1 = 6e3; R2 = 3e3; RL = 3e3;
par = @(a, b) a.*b./(a + b);
vo0 = Vs*R2/(R1 + R2);
voL = Vs*par(R2, RL)/(R1 + par(R2, RL));
fprintf('no load: %g V, with 3 k load: %g V\n', vo0, voL)

%% The output versus the load
%ar: نغيّر الحمل من 100 Ω إلى 1 MΩ ونرسم الخرج بمحور لوغاريتمي: الخرج يقترب من 4 V فقط إذا كان الحمل أكبر بكثير من R2.
RL = logspace(2, 6, 200);
vo = Vs*par(R2, RL)./(R1 + par(R2, RL));
semilogx(RL, vo); grid on; hold on; semilogx(RL, vo0*ones(size(RL)), 'r--'); hold off
xlabel('R_L (\Omega)'); ylabel('v_o (V)'); title('Loaded voltage divider'); legend('with load', 'no load', 'Location', 'southeast')

%%! Project idea: design a divider that tolerates the load
%ar: مشروع تصميم: نريد خرجًا لا ينزل أكثر من 5% مع حمل 10 kΩ. نجرب مقاسات مختلفة لـ R1 و R2 (بنفس النسبة 2:1) ونختار الأكبر الذي يحقق الشرط (أقل استهلاك).
scale = [10 100 1e3 1e4]; RL = 10e3;
for s = scale
    a = 2*s; b = s; v = Vs*par(b, RL)/(a + par(b, RL)); drop = (4 - v)/4*100;
    fprintf('R1 = %6g, R2 = %6g: vo = %.3f V, drop %.1f%%, current %.2f mA\n', a, b, v, drop, Vs/(a + par(b, RL))*1e3)
end
