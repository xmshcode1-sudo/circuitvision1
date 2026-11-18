% MATLAB from zero — 7: from a script to a project
%title: MATLAB from Zero 7: From a Script to a Project
%ar-title: MATLAB من الصفر 7: من سكربت إلى مشروع
%course: intro
%level: 7

%% 1. Start from a working script
%ar: كل مشروع يبدأ بسكربت صغير يعمل ونتيجته صحيحة. هنا: شحن مكثف عبر مقاومة. نتحقق من ثابت الزمن قبل أي توسعة.
R = 10e3; C = 47e-9; Vs = 10;
tau = R*C;
t = linspace(0, 5*tau, 500);
vc = Vs*(1 - exp(-t/tau));
fprintf('tau = %.3f ms, vc(tau) = %.3f V\n', tau*1e3, interp1(t, vc, tau))

%% 2. Turn the numbers into parameters
%ar: اجمع كل القيم التي قد تتغير في بداية الملف داخل struct واحد (مثل p.R و p.C). هكذا تغيّر التصميم من مكان واحد.
p.R = 10e3; p.C = 47e-9; p.Vs = 10;
fprintf('parameters: R = %g, C = %g, Vs = %g\n', p.R, p.C, p.Vs)

%% 3. A parameter sweep
%ar: المشروع الحقيقي يجيب على سؤال: «ماذا لو؟». نرسم الشحن لعدة قيم للمقاومة على نفس الشكل بحلقة.
figure; hold on
for Rk = [2.2e3 4.7e3 10e3 22e3]
    tk = Rk*p.C;
    plot(t*1e3, p.Vs*(1 - exp(-t/tk)))
end
hold off; grid on; xlabel('t (ms)'); ylabel('v_C (V)')
legend('2.2 k', '4.7 k', '10 k', '22 k', 'Location', 'southeast'); title('Charging for several R')

%% 4. Save results to a file
%ar: احفظ النتائج في ملف CSV يفتحه Excel: fopen للفتح، fprintf للكتابة، fclose للإغلاق. هذا يصلح لكل أجهزة MATLAB.
f = fopen('charging.csv', 'w');
fprintf(f, 't_ms,vc_V\n');
fprintf(f, '%.5f,%.5f\n', [t(1:50:end)*1e3; vc(1:50:end)]);
fclose(f);
fprintf('saved %d rows to charging.csv\n', numel(t(1:50:end)))
delete('charging.csv');

%% 5. Check your design automatically
%ar: أضف اختبارًا يتأكد من النتيجة بنفسه: assert يوقف البرنامج برسالة إذا كان الشرط خطأ. هكذا تعرف فورًا إذا كسر تعديلٌ شيئًا.
assert(abs(p.R*p.C - 0.47e-3) < 1e-12, 'time constant changed!')
fprintf('all checks passed\n')

%%! 6. Ideas to grow it into a real project
%ar: (1) اجعل الحساب دالة: [t, vc] = rc_charge(p) واستدعها من سكربت رئيسي. (2) اقرأ القيم من المستخدم بـ input. (3) في MATLAB نفسه: App Designer (من Apps ثم Design App) يحول الدالة إلى برنامج بأزرار ومنزلقات.
%ar: (4) قارن النظرية بقياساتك من المعمل: ضع قراءاتك في متجه وارسمها فوق المنحنى النظري واحسب نسبة الخطأ. هذا تقرير معمل كامل من MATLAB.
meas_t  = [0.47 1.0 1.5 2.0];          % example: your own lab readings (ms)
meas_vc = [6.34 8.81 9.59 9.86];       % (V) - from the virtual lab, Experiment 1
theory  = p.Vs*(1 - exp(-meas_t*1e-3/tau));
err = abs(theory - meas_vc)./theory*100;
fprintf('t = %.2f ms: theory %.3f V, measured %.2f V, error %.2f%%\n', [meas_t; theory; meas_vc; err])
figure
plot(t*1e3, vc); hold on; plot(meas_t, meas_vc, 'o'); hold off; grid on
xlabel('t (ms)'); ylabel('v_C (V)'); legend('theory', 'measured', 'Location', 'southeast'); title('Theory vs lab')
