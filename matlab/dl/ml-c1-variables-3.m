% Circuits 1 — The Ideal Basic Circuit Element
%title: The Passive Sign Convention
%ar-title: اصطلاح الإشارة الخاملة
%lesson: c1-variables-3
%course: circuits-1

%% Example 1: the four cases
%ar: مثال 1 من المحاضرة: هبوط 4 V وتيار 3 A. في (a) و (b) يدخل التيار من الطرف الموجب فـ i = +3، وفي (c) و (d) يخرج منه فـ i = −3. ثم p = vi.
v = [4 4 4 4];
i = [3 3 -3 -3];
p = v .* i;
lbl = 'abcd';
for k = 1:4
    if p(k) > 0, s = 'absorbing'; else, s = 'delivering'; end
    fprintf('(%c) v = %+g V, i = %+g A, p = %+g W -> %s\n', lbl(k), v(k), i(k), p(k), s)
end

%% Same element, two references
%ar: نفس العنصر بمرجعين: إذا عكسنا سهم التيار نكتب p = −vi، والنتيجة الفيزيائية لا تتغير.
p1 = v(1) * i(1);          % current enters at +
p2 = -v(1) * (-i(1));      % arrow reversed: enters at -, use p = -vi
fprintf('p with the first reference = %g W, with the reversed reference = %g W\n', p1, p2)

%%! Project idea: a sign-convention helper
%ar: مشروع: دالة تأخذ v و i واتجاه دخول التيار (من + أو من −) وتطبع القدرة وهل العنصر يمتص أم يعطي.
cases = [4 3 1; 4 3 0; -5 2 1; 6 -2 0];   % v, i, enters at + (1) or - (0)
pw = zeros(1, size(cases, 1));
for k = 1:size(cases, 1)
    sgn = 2*cases(k,3) - 1;   % +1 if the current enters at +, -1 otherwise
    pw(k) = sgn * cases(k,1) * cases(k,2);
    if cases(k,3), at = '+'; else, at = '-'; end
    fprintf('v = %+g, i = %+g, enters at %s -> p = %+g W\n', cases(k,1), cases(k,2), at, pw(k))
end
bar(pw); grid on; xlabel('case'); ylabel('p (W)'); title('Positive = absorbing, negative = delivering')
