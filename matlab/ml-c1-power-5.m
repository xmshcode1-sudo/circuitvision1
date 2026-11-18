% Circuits 1 — Power Calculations
%title: Two Loads in Parallel
%ar-title: حملان على التوازي
%lesson: c1-power-5
%course: circuits-1

%% The example
%ar: الحمل الأول 4 kW بمعامل 0.8 متأخر ⇐ Q1 = P tan(acos 0.8). الثاني 2 kW بمعامل 1. نجمع S ثم نحسب التيار ومعامل القدرة.
V = 200;
P = [4000 2000]; pf = [0.8 1];
Q = P .* tan(acos(pf));
S = sum(P + 1j*Q);
I = abs(S)/V;
fprintf('Q = %g, %g VAR\n', Q)
fprintf('S = %g%+gj VA, |S| = %.1f VA, I = %.2f A, pf = %.4f\n', real(S), imag(S), abs(S), I, cos(angle(S)))
%check: abs(Q(1) - 3000) < 1e-9 && abs(I - 33.54) < 0.005 && abs(cos(angle(S)) - 0.8944) < 1e-4

%% A bar chart of P and Q
%ar: bar مع مصفوفة يرسم أعمدة متجاورة: P و Q لكل حمل وللمجموع.
bar([P real(S); Q imag(S)]'); grid on; set(gca, 'XTickLabel', {'load 1', 'load 2', 'total'})
legend('P (W)', 'Q (VAR)'); title('Real and reactive power')

%%! Project idea: a factory load table
%ar: مشروع: جدول أحمال مصنع من ملف (هنا مكتوب داخل الكود)، ويطبع التيار الكلي ومعامل القدرة، ويحذر إذا تجاوز التيار سعة القاطع.
P = [4000 2000 7500 1200]; pf = [0.8 1 0.85 0.7]; breaker = 80;
S = sum(P + 1j*P.*tan(acos(pf))); I = abs(S)/V;
fprintf('total %.0f W, %.0f VAR, I = %.1f A, pf = %.3f\n', real(S), imag(S), I, cos(angle(S)))
if I > breaker, fprintf('WARNING: exceeds the %g A breaker\n', breaker), end
