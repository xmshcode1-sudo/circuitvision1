% Circuits 1 — Voltage Division and Current Division
%title: Current Division then Voltage Division (Example 3.4)
%ar-title: قسمة التيار ثم قسمة الجهد (مثال 3.4)
%lesson: c1-resistive-4
%course: circuits-1

%% Example 3.4
%ar: الفروع على التوازي: 80 و 10 و 80 و 24 Ω. Req = 6 Ω، و io = (Req/24) × 8 = 2 A، و v = 48 V، و vo = (30/80) × 48 = 18 V.
Rb = [36+44, 10, 40+10+30, 24];
Req = 1 / sum(1 ./ Rb);
io = Req/24 * 8; v = 24 * io; vo = 30/80 * v;
fprintf('Req = %g ohm, io = %g A, v = %g V, vo = %g V\n', Req, io, v, vo)

%% Every branch current at once
%ar: قسمة التيار لكل الفروع معًا: i_j = (Req/R_j) × 8، ومجموعها يجب أن يساوي 8 A.
ij = Req ./ Rb * 8;
fprintf('branch currents = %s A, sum = %g A\n', mat2str(ij, 4), sum(ij))

%%! Project idea: pie of the source current
%ar: مشروع: نرسم كيف يتوزع تيار المصدر 8 A على الفروع الأربعة: المقاومة الأصغر تأخذ الأكثر.
bar(ij); grid on; set(gca, 'xticklabel', {'80', '10', '80', '24'}); xlabel('branch resistance (\Omega)'); ylabel('i (A)'); title('Current division in Example 3.4')
