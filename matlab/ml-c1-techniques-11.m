% Circuits 1 — Maximum Power Transfer
%title: Maximum Power Transfer
%ar-title: أقصى نقل للقدرة
%lesson: c1-techniques-11
%course: circuits-1

%% Power in the load for many loads
%ar: p = VTh² RL / (RTh + RL)². نحسبها لكل قيم الحمل بعمليات النقطة، ثم نبحث عن القمة بـ max.
VTh = 40; RTh = 8;
RL = linspace(0.1, 40, 4000);
p = VTh^2 * RL ./ (RTh + RL).^2;
[pmax, k] = max(p);
fprintf('numerical: max %.3f W at RL = %.2f ohm\n', pmax, RL(k))
fprintf('formula:   max %g W at RL = %g ohm\n', VTh^2/(4*RTh), RTh)
%check: abs(VTh^2/(4*RTh) - 50) < 1e-12 && abs(RL(k) - 8) < 0.02

%% The curve and the efficiency
%ar: عند أقصى قدرة الكفاءة 50% فقط: نصف القدرة يضيع في RTh. الكفاءة η = RL/(RL + RTh).
eta = RL ./ (RL + RTh) * 100;
subplot(2,1,1); plot(RL, p); grid on; ylabel('p_L (W)'); title('Load power'); hold on; plot(RTh, pmax, 'ro'); hold off
subplot(2,1,2); plot(RL, eta); grid on; ylabel('\eta (%)'); xlabel('R_L (\Omega)'); title('Efficiency')

%%! Project idea: audio amplifier and speaker
%ar: مشروع: مكبر مقاومة خرجه 8 Ω. ما القدرة في سماعة 4 Ω أو 8 Ω أو 16 Ω؟ اطبع جدولًا. لماذا تُصنع السماعات بـ 8 Ω؟
for Rs = [4 8 16]
    fprintf('speaker %2g ohm: %.2f W, efficiency %.0f%%\n', Rs, VTh^2*Rs/(RTh + Rs)^2, Rs/(Rs + RTh)*100)
end
