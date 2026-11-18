% Circuits 1 — Voltage Division and Current Division
%title: Voltage and Current Division
%ar-title: قسمة الجهد وقسمة التيار
%lesson: c1-resistive-4
%course: circuits-1

%% Voltage division
%ar: v_k = (R_k / ΣR) × V. للمثال: 20 V على 2 و 3 و 5 Ω. نحسب جهد كل مقاومة دفعة واحدة.
R = [2 3 5]; V = 20;
v = R/sum(R) * V;
fprintf('v = %g V\n', v)
%check: v(3) == 10

%% Current division
%ar: i_k = (Req / R_k) × I. 6 A تدخل 3 ∥ 6 ∥ 2. التيار الأكبر في المقاومة الأصغر.
R = [3 6 2]; I = 6;
Req = 1/sum(1./R);
i = Req ./ R * I;
fprintf('Req = %g ohm\n', Req)
fprintf('i(%g ohm) = %g A\n', [R; i])
fprintf('sum = %g A\n', sum(i))
%check: abs(i(3) - 3) < 1e-12 && abs(sum(i) - 6) < 1e-12

%%! Project idea: a general divider tool
%ar: مشروع: دالة واحدة تعمل الاثنين، وتطبع جدولًا مرتبًا. استخدمها لمراجعة أي واجب في ثوانٍ.
divide('series', [2 3 5], 20);
divide('parallel', [3 6 2], 6);

function divide(type, R, x)
    if strcmp(type, 'series')
        y = R/sum(R)*x; u = 'V';
    else
        y = (1/sum(1./R))./R*x; u = 'A';
    end
    fprintf('%s:\n', type); fprintf('  R = %4g ohm -> %g %s\n', [R; y], u)
end
