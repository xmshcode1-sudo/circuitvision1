% Circuits 1 — Circuit Analysis: An Overview (lumped or not?)
%title: Wavelength and the Lumped Model
%ar-title: طول الموجة ومتى يصح النموذج المجمّع
%lesson: c1-variables-1
%course: circuits-1

%% The example: wavelength at 60 Hz and at 1 GHz
%ar: مثال الدرس: λ = c/f. نكتب سرعة الضوء والترددين، ثم نقسم. لاحظ كتابة 1 GHz بالشكل 1e9.
c = 3e8;                 % speed of light (m/s)
f = [60 1e9];            % frequencies (Hz)
lambda = c ./ f;         % wavelength of each (m)
fprintf('f = %-8g Hz  ->  lambda = %g m\n', [f; lambda])
%check: lambda(1) == 5e6 && abs(lambda(2) - 0.3) < 1e-12

%% Lumped or distributed?
%ar: قاعدة عملية: الدائرة lumped إذا كان أكبر طول فيها أصغر بكثير من λ (نستخدم هنا عُشر λ كحد). نختبر مسارًا طوله 10 cm.
d = 0.10;                % longest dimension of the circuit (m)
for k = 1:numel(f)
    if d < lambda(k)/10
        fprintf('%g Hz: d/lambda = %.2g  -> lumped model OK\n', f(k), d/lambda(k))
    else
        fprintf('%g Hz: d/lambda = %.2g  -> NOT lumped\n', f(k), d/lambda(k))
    end
end

%% Wavelength over a range of frequencies
%ar: نرسم λ لمدى واسع من الترددات بمقياس لوغاريتمي (loglog) لأن القيم تمتد من آلاف الكيلومترات إلى سنتيمترات.
f = logspace(1, 10, 200);
loglog(f, c./f); grid on
xlabel('f (Hz)'); ylabel('\lambda (m)'); title('Wavelength vs frequency')
hold on; loglog([10 1e10], [1 1]*d*10, 'r--'); hold off
legend('\lambda = c/f', '10 \times 10 cm', 'Location', 'southwest')

%%! Project idea: a lumped-model checker
%ar: حوّلها لأداة: دالة تأخذ أبعاد اللوحة وأعلى تردد في الإشارة وتقول هل يكفي تحليل الدوائر العادي أم نحتاج خطوط نقل. جرّبها على لوحة جوال (15 cm) عند 2.4 GHz.
check_lumped(0.15, 2.4e9);
check_lumped(0.15, 50);

function check_lumped(d, f)
    lam = 3e8/f;
    if d < lam/10, s = 'lumped circuit analysis is fine'; else, s = 'use transmission-line (distributed) analysis'; end
    fprintf('board %.2f m at %g Hz: lambda = %.3g m -> %s\n', d, f, lam, s)
end
