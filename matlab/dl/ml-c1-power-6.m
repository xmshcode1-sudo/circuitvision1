% Circuits 1 — Maximum Power Transfer (AC)
%title: Maximum Power Transfer with Impedances
%ar-title: أقصى نقل للقدرة بالمعاوقات
%lesson: c1-power-6
%course: circuits-1

%% The rule: ZL = conj(ZTh)
%ar: VTh = 7.071∠−45°، و ZTh = 2 − j2. أقصى قدرة عندما ZL = ZTh* = 2 + j2، وقيمتها |VTh|²/(8 RTh) (قيم قمة).
VTh = 7.071*exp(-1j*pi/4); ZTh = 2 - 2j;
ZL = conj(ZTh);
I = VTh/(ZTh + ZL);
Pmax = 0.5*abs(I)^2*real(ZL);
fprintf('ZL = %g%+gj ohm, Pmax = %.4f W (formula %.4f W)\n', real(ZL), imag(ZL), Pmax, abs(VTh)^2/(8*real(ZTh)))

%% Search over all loads
%ar: نتحقق بالبحث على شبكة من القيم: RL من 0.1 إلى 6 و XL من −6 إلى 6. meshgrid يصنع كل الأزواج، و contour يرسم خطوط تساوي القدرة.
[RL, XL] = meshgrid(linspace(0.1, 6, 120), linspace(-6, 6, 121));
P = 0.5*abs(VTh).^2 .* RL ./ ((real(ZTh) + RL).^2 + (imag(ZTh) + XL).^2);
[pm, k] = max(P(:));
fprintf('grid search: max %.4f W at RL = %.2f, XL = %.2f\n', pm, RL(k), XL(k))
contour(RL, XL, P, 20); colorbar; hold on; plot(2, 2, 'r*', 'MarkerSize', 12); hold off
xlabel('R_L (\Omega)'); ylabel('X_L (\Omega)'); title('Load power (W): the peak is at Z_{Th}^*')

%%! Project idea: when only R can change
%ar: مشروع: إذا كان الحمل مقاومة فقط، فأفضل قيمة RL = |ZTh| (وليست 2). احسب القدرة وقارن بالحالة المثالية.
RLb = abs(ZTh);
Pb = 0.5*abs(VTh/(ZTh + RLb))^2*RLb;
fprintf('resistive load only: RL = %.3f ohm gives %.4f W (%.0f%% of the maximum)\n', RLb, Pb, Pb/Pmax*100)
