% Circuits 1 — Voltage and Current Sources
%title: Valid and Invalid Source Connections
%ar-title: توصيلات المصادر الصحيحة والمستحيلة
%lesson: c1-elements-1
%course: circuits-1

%% The rule as code
%ar: مصادر جهد على التوازي يجب أن يتساوى جهدها، ومصادر تيار على التوالي يجب أن يتساوى تيارها. أي خلط آخر (جهد مع تيار) مسموح.
%ar: نكتب القاعدة كدالة ترجع true أو false، ونجربها على حالات الدرس الأربع.
cases = {
    'V', 'parallel', 10, 'V', 10
    'V', 'parallel', 10, 'V', 5
    'I', 'series',    2, 'I', 3
    'I', 'series',    2, 'V', 12 };
for k = 1:size(cases, 1)
    ok = valid_pair(cases{k,1}, cases{k,2}, cases{k,3}, cases{k,4}, cases{k,5});
    fprintf('%s=%g %-8s %s=%-3g -> %s\n', cases{k,1}, cases{k,3}, cases{k,2}, cases{k,4}, cases{k,5}, tf(ok))
end

%% Why: the voltage between two nodes is one number
%ar: مصدران 10 V و 5 V على التوازي يفرضان جهدين مختلفين على نفس العقدتين: KVL في الحلقة بينهما يعطي 10 − 5 = 0، وهذا مستحيل.
fprintf('KVL around the two sources: 10 - 5 = %g, must be 0\n', 10 - 5)

%%! Project idea: a netlist sanity checker
%ar: في أي مشروع محاكاة، أول خطوة فحص الدائرة قبل حلها. وسّع الدالة لتفحص قائمة عناصر كاملة وتطبع تحذيرًا بدل أن ينهار الحل.
fprintf('%s\n', tf(valid_pair('V', 'parallel', 5, 'I', 1)))

function ok = valid_pair(t1, how, x1, t2, x2)
    if strcmp(t1, 'V') && strcmp(t2, 'V') && strcmp(how, 'parallel')
        ok = (x1 == x2);
    elseif strcmp(t1, 'I') && strcmp(t2, 'I') && strcmp(how, 'series')
        ok = (x1 == x2);
    else
        ok = true;
    end
end
function s = tf(ok)
    if ok, s = 'valid'; else, s = 'IMPOSSIBLE'; end
end
