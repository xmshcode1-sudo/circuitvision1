% Circuits 1 — Resistors in Series
%title: Series Resistors and Voltage Sharing
%ar-title: المقاومات على التوالي وتقسيم الجهد
%lesson: c1-resistive-1
%course: circuits-1

%% The lecture's seven resistors
%ar: سبع مقاومات R1 إلى R7 على التوالي مع vs (الأرقام التي عوّضناها في الدرس): Req = sum(R) و is = vs/Req، والتيار نفسه في الكل.
vs = 140; R = [2 3 5 10 4 6 5];
Req = sum(R); is = vs / Req; v = is * R;
fprintf('Req = %g ohm, is = %g A\n', Req, is)
fprintf('v_k = %s V\n', mat2str(v))

%% KVL closes
%ar: KVL حول الحلقة: −vs + مجموع الجهود = 0.
fprintf('-vs + sum(v) = %g\n', -vs + sum(v))

%%! Project idea: which resistor takes the most voltage?
%ar: مشروع: نرسم نصيب كل مقاومة من الجهد. الأكبر قيمة يأخذ الجهد الأكبر لأن التيار واحد.
bar(v); grid on; xlabel('resistor k'); ylabel('v_k (V)'); title('Series: same current, voltage proportional to R')
[~, kmax] = max(v); fprintf('largest voltage on R%d\n', kmax)
