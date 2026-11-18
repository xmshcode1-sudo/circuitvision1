% MATLAB from zero — 5: conditions and loops
%title: MATLAB from Zero 5: Conditions and Loops
%ar-title: MATLAB من الصفر 5: الشروط والحلقات
%course: intro
%level: 5

%% if / elseif / else
%ar: if تنفذ الأوامر فقط إذا كان الشرط صحيحًا. المقارنات: == يساوي، ~= لا يساوي، > و < و >= و <=. و && تعني «و»، و || تعني «أو».
p = -24;                 % power of an element (W)
if p > 0
    fprintf('absorbs %g W\n', p)
elseif p < 0
    fprintf('delivers %g W\n', -p)
else
    fprintf('no power\n')
end

%% for loops
%ar: for تكرر الأوامر لكل قيمة في متجه. هنا نحسب قسمة الجهد لكل مقاومة ونطبع سطرًا لكل واحدة.
Vs = 12; R1 = 1e3;
for R2 = [1e3 2e3 5e3]
    fprintf('R2 = %5g ohm -> Vout = %.3f V\n', R2, Vs*R2/(R1+R2))
end

%% Collecting results in a loop
%ar: لحفظ النتائج: جهّز متجهًا من أصفار بـ zeros ثم املأه بالفهرس k. هذا أسرع من تكبير المتجه في كل دورة.
N = 6;
fib = zeros(1, N); fib(1) = 1; fib(2) = 1;
for k = 3:N
    fib(k) = fib(k-1) + fib(k-2);
end
fprintf('%g ', fib); fprintf('\n')
%check: isequal(fib, [1 1 2 3 5 8])

%% while loops
%ar: while تكرر ما دام الشرط صحيحًا. مثال: كم ثابت زمن يحتاج المكثف ليصل 99% من الشحن؟
k = 0;
while 1 - exp(-k) < 0.99
    k = k + 1;
end
fprintf('%d time constants reach %.2f%% of the final value\n', k, 100*(1 - exp(-k)))
%check: k == 5

%% Loop or vector?
%ar: في MATLAB الحساب على المتجهات (بدون حلقة) أقصر وأسرع غالبًا. السطران هنا يعطيان نفس النتيجة.
n = 0:9;
s1 = 0; for k = n, s1 = s1 + 0.5^k; end
s2 = sum(0.5.^n);
fprintf('loop: %.6f   vector: %.6f\n', s1, s2)
%check: abs(s1 - s2) < 1e-15

%%! Project step: a design search
%ar: مشروع: ابحث عن أفضل مقاومة من القيم القياسية E12 تعطي خرجًا أقرب لـ 5 V من 12 V مع R1 = 1 kΩ. الحلقة تجرب كل القيم وتحتفظ بالأفضل.
E12 = [1 1.2 1.5 1.8 2.2 2.7 3.3 3.9 4.7 5.6 6.8 8.2];
best = Inf;
for dec = [100 1e3 1e4]
    for m = E12
        R2 = m*dec; Vo = 12*R2/(1e3 + R2);
        if abs(Vo - 5) < best
            best = abs(Vo - 5); Rbest = R2; Vbest = Vo;
        end
    end
end
fprintf('best R2 = %g ohm -> Vout = %.3f V\n', Rbest, Vbest)
%check: Rbest == 680
