% Circuits 1 — The Ideal Basic Circuit Element: passive sign convention
%title: The Passive Sign Convention
%ar-title: اصطلاح الإشارة السلبي وحساب القدرة
%lesson: c1-variables-3
%course: circuits-1

%% The example
%ar: العنصر: v = 10 V والتيار 2 A يخرج من الطرف +. القاعدة: إذا دخل التيار من + نستخدم p = vi، وإذا خرج منه نستخدم p = −vi.
v = 10; i = 2;
entersPlus = false;              % the arrow leaves the + terminal
if entersPlus, p = v*i; else, p = -v*i; end
fprintf('p = %g W\n', p)

%% Absorbing or delivering?
%ar: إشارة p تخبرنا: موجبة ⇐ يمتص، سالبة ⇐ يولّد. نجعلها دالة محلية لنستخدمها لأي عنصر.
describe(p)

%% Changing the reference does not change the physics
%ar: لو عكسنا سهم التيار يصير i = −2 A ويدخل من + ، فنستخدم p = vi = 10 × (−2) = −20 W: نفس النتيجة.
p2 = v*(-2);
fprintf('reversed arrow: p = %g W\n', p2)

%%! Project idea: a power checker for any element list
%ar: مشروع: أدخل جدول عناصر (الجهد، التيار، هل يدخل التيار من +) واحصل على قدرة كل عنصر وحالته. سنكمله في الدرس التالي بتوازن القدرة.
V = [10 5 7]; I = [2 2 2]; into = [false true true];
P = V.*I; P(~into) = -P(~into);
for k = 1:3, fprintf('element %d: ', k); describe(P(k)); end

function describe(p)
    if p > 0, fprintf('p = %g W -> absorbs\n', p);
    elseif p < 0, fprintf('p = %g W -> delivers %g W\n', p, -p);
    else, fprintf('p = 0\n'); end
end
