% Circuits 1 — Voltage and Current Sources
%title: Valid and Invalid Source Connections
%ar-title: توصيلات المصادر الصحيحة وغير المسموحة
%lesson: c1-elements-1
%course: circuits-1

%% Example 2.1
%ar: مثال 2.1: مصدرا جهد على التوازي يجب أن يتساويا، ومصدرا تيار على التوالي يجب أن يتساويا، ومصدر جهد مع مصدر تيار صحيح دائمًا.
% each row: type of connection (1 = V||V, 2 = I series I, 3 = V with I), value 1, value 2
c = [1 10 10; 2 5 5; 1 10 5; 2 2 5; 3 5 10];
lbl = 'abcde';
ok = false(1, 5);
for k = 1:5
    ok(k) = c(k,1) == 3 || c(k,2) == c(k,3);
    if ok(k), s = 'valid'; else, s = 'not permissible'; end
    fprintf('(%c) %s\n', lbl(k), s)
end

%% Example 3: a dependent source in parallel
%ar: مثال 3: مصدر جهد تابع قيمته ib/4 على التوازي مع vg، و ib = −8 A. التوصيل يصح إذا vg = ib/4، وقدرة مصدر 8 A هي vg × 8.
ib = -8;
vg = ib / 4;
P8 = vg * 8;
fprintf('vg = %g V, P(8 A) = %g W\n', vg, P8)

%%! Project idea: Example 4 (find alpha)
%ar: مشروع: مصدر تيار تابع α·vx مع مصدر 15 A، و vx = −25 V. التوصيل يصح إذا α·vx = −15، ثم قدرة مصدر 25 V.
vx = -25; alpha = -15 / vx;
P25 = 25 * 15;
fprintf('alpha = %g A/V, P(25 V) = %g W (absorbed)\n', alpha, P25)
