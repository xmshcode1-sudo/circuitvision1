% Circuits 1 — Resistors in Parallel
%title: Parallel Resistors
%ar-title: المقاومات على التوازي
%lesson: c1-resistive-2
%course: circuits-1

%% A function for parallel combination
%ar: 1/Req = Σ 1/R. نكتبها دالة مجهولة تقبل أي عدد من المقاومات في متجه.
par = @(R) 1 / sum(1 ./ R);
fprintf('10 || 40 = %g ohm\n', par([10 40]))
fprintf('6 || 12 || 4 = %g ohm\n', par([6 12 4]))
%check: par([10 40]) == 8 && abs(par([6 12 4]) - 2) < 1e-12

%% Always smaller than the smallest
%ar: نضيف مقاومات على التوازي واحدة تلو الأخرى: المكافئ ينقص دائمًا ويبقى أقل من أصغر مقاومة.
R = [6 12 4 24 8];
Req = zeros(size(R));
for k = 1:numel(R), Req(k) = par(R(1:k)); end
plot(1:numel(R), Req, '-o'); grid on; xlabel('number of resistors'); ylabel('R_{eq} (\Omega)'); title('Adding resistors in parallel')
fprintf('%d resistors: Req = %.3f ohm\n', [1:numel(R); Req])

%%! Project idea: making a non-standard value
%ar: مشروع: تريد 75 Ω وعندك فقط قيم E12. جرّب كل زوج على التوازي واطبع أقرب ثلاث نتائج. هكذا يحل المهندسون نقص القيم في المعمل.
E12 = [1 1.2 1.5 1.8 2.2 2.7 3.3 3.9 4.7 5.6 6.8 8.2]; S = [E12*10 E12*100];
target = 75; best = [];
for a = S, for b = S, if b >= a, best(end+1, :) = [a b par([a b])]; end, end, end
[~, k] = sort(abs(best(:,3) - target));
fprintf('%g || %g = %.2f ohm\n', best(k(1:3), :)')
