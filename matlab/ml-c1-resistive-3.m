% Circuits 1 — The Voltage-Divider and Current-Divider Circuits
%title: Dividers and the Loaded Divider (Problem 3.13)
%ar-title: المقسّمات والمقسّم المحمَّل (مسألة 3.13)
%lesson: c1-resistive-3
%course: circuits-1

%% Example 3.2 and Example 3.3
%ar: مثال 3.2: vo = 100 × 100k/(100k + 25k) = 80 V. مثال 3.3: 4 ∥ 6 + 1.6 = 4 Ω، ثم io = 16/(16+4) × 10 = 8 A، ثم i6 = 4/(6+4) × 8 = 3.2 A و p = 61.44 W.
vo = 100 * 100e3 / (100e3 + 25e3);
Rb = 4*6/(4+6) + 1.6;
io = 16/(16 + Rb) * 10; i6 = 4/(6+4) * io; p6 = i6^2 * 6;
fprintf('Ex 3.2: vo = %g V\nEx 3.3: io = %g A, i6 = %g A, p6 = %g W\n', vo, io, i6, p6)
%check: vo == 80 && abs(io - 8) < 1e-12 && abs(i6 - 3.2) < 1e-12 && abs(p6 - 61.44) < 1e-9

%% Problem 3.13 (tutorial)
%ar: بدون حمل vo = 4 V ← R2 = 10 Ω. مع الحمل vo = 3 V ← Req = 120/17 Ω، ثم RL من 1/RL = 1/Req − 1/R2.
R2 = 4*40 / (20 - 4);
Req = 3*40 / (20 - 3);
RL = 1 / (1/Req - 1/R2);
fprintf('R2 = %g ohm, Req = %.4f ohm, RL = %g ohm\n', R2, Req, RL)
%check: abs(R2 - 10) < 1e-12 && abs(RL - 24) < 1e-9

%%! Project idea: how the load pulls the output down
%ar: مشروع: نرسم vo مقابل RL لمقسّم المسألة 3.13. عندما RL كبيرة جدًا نرجع إلى 4 V بدون حمل.
RLs = logspace(0, 4, 200);
vos = 20 * (R2*RLs./(R2 + RLs)) ./ (40 + R2*RLs./(R2 + RLs));
semilogx(RLs, vos); grid on; xlabel('R_L (\Omega)'); ylabel('v_o (V)'); title('Loaded divider of Problem 3.13 (no-load value 4 V)')
