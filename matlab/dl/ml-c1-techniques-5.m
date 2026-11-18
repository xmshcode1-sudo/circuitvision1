% Circuits 1 — The Mesh-Current Method and Dependent Sources
%title: Mesh Analysis with a Dependent Source
%ar-title: تيارات الحلقات مع مصدر تابع
%lesson: c1-techniques-5
%course: circuits-1

%% Substitute ix = i1 - i2
%ar: الحلقة 1: 28 i1 − 20 i2 = 40. الحلقة 2: 20(i2 − i1) + 10 i2 + 5 ix = 0، ومع ix = i1 − i2 تصير −15 i1 + 25 i2 = 0.
A = [28 -20
    -15  25];
b = [40; 0];
i = A \ b;
ix = i(1) - i(2);
fprintf('i1 = %g A, i2 = %g A, ix = %g A\n', i, ix)

%% Keep ix as an unknown
%ar: أو نترك ix مجهولًا ثالثًا مع معادلة القيد ix − i1 + i2 = 0.
A3 = [28 -20 0; -20 30 5; -1 1 1];
x = A3 \ [40; 0; 0];
fprintf('i1 = %g, i2 = %g, ix = %g\n', x)

%%! Project idea: power of the dependent source
%ar: المصدر التابع قد يولّد أو يمتص. قدرته 5 ix × i2 (ندخله من +). اطبعها مع قدرة كل عنصر وتحقق من التوازن: مشروع «مدقق حلول الواجبات».
%ar: إذا ظهر المجموع رقمًا مثل 3.55e-14 بدل 0 فهذا خطأ التقريب في حساب الأعداد العشرية داخل الحاسب، وهو صفر عمليًا. لذلك نقارن دائمًا بـ abs(x) < 1e-9 لا بـ x == 0.
p = [-40*x(1), 8*x(1)^2, 20*x(3)^2, 10*x(2)^2, 5*x(3)*x(2)];
fprintf('source %g, R''s %g %g %g, dependent %g, sum %g W\n', p, sum(p))
