% Signals and Systems — Unit Impulse and Unit Step
%title: Impulse, Step and the Sifting Property
%ar-title: الدفعة والخطوة وخاصية الانتقاء
%lesson: ss-ch1-7
%course: signals-systems

%% Discrete impulse and step
%ar: δ[n] = 1 عند n = 0 فقط، و u[n] = 1 عند n ≥ 0. نكتبهما بشرط منطقي على متجه n، ونحولهما لأرقام بـ double.
n = -5:10;
d = double(n == 0); u = double(n >= 0);
x = u - double(n - 4 >= 0);                % u[n] - u[n-4]
fprintf('u[n] - u[n-4] = 1 at n = %s\n', num2str(n(x == 1)))
%check: isequal(n(x == 1), 0:3)

%% Plot
%ar: stem ترسم الإشارة المتقطعة: خطًا رأسيًا عند كل n، و'filled' تملأ الدائرة. الأفضل من plot للإشارات المتقطعة لأن القيم موجودة عند الأعداد الصحيحة فقط.
%ar: النتيجة أربع عينات قيمتها 1 عند n = 0..3: هذا هو u[n] − u[n−4] مكتوبًا كمجموع نبضات.
stem(n, x, 'filled'); grid on; xlabel('n'); title('u[n] - u[n-4] = \delta[n] + \delta[n-1] + \delta[n-2] + \delta[n-3]')

%% Sifting with a narrow pulse
%ar: δ(t) المستمرة نقربها بنبضة عرضها ε وارتفاعها 1/ε (مساحتها 1). كلما صغرت ε اقترب ∫(t² + 1)δ(t − 2)dt من 5.
f = @(t) t.^2 + 1;
for e = [0.5 0.1 0.01 0.001]
    val = integral(@(t) f(t)/e, 2 - e/2, 2 + e/2);
    fprintf('eps = %-6g -> %.6f\n', e, val)
end
%check: abs(integral(@(t) f(t)/1e-3, 2 - 5e-4, 2 + 5e-4) - 5) < 1e-5

%% The discrete sum
%ar: Σ cos(πn) δ[n − 3] = cos(3π) = −1: الدفعة «تلتقط» قيمة واحدة.
n = -10:10;
s = sum(cos(pi*n) .* double(n == 3));
fprintf('sum = %g\n', s)
%check: abs(s + 1) < 1e-12

%%! Project idea: the step as a running sum of the impulse
%ar: مشروع للفهم: u[n] = Σ δ[k] حتى n. cumsum يحسب المجموع الجاري. وبالعكس δ[n] = u[n] − u[n−1] (الفرق diff). جربه على أي إشارة: هذا التكامل والاشتقاق المتقطع.
n = -5:10; d = double(n == 0);
uu = cumsum(d);
fprintf('cumsum of delta equals u: %d\n', isequal(uu, double(n >= 0)))
%check: isequal(uu, double(n >= 0))
