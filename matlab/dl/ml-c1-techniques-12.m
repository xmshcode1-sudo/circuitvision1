% Circuits 1 — Superposition
%title: Superposition, Checked Against the Full Solution
%ar-title: التراكب ومقارنته بالحل الكامل
%lesson: c1-techniques-12
%course: circuits-1

%% Each source alone
%ar: Vs = 60 V مع R1 = 12 إلى العقدة، و R2 = 8 من العقدة للأرض، ومصدر تيار 5 A يدخل العقدة عبر R3. المطلوب i في R2.
%ar: Vs وحده (مصدر التيار مفتوح): i' = 60/(12 + 8). Is وحده (المصدر سلك): قسمة تيار i'' = 5 × 12/(12 + 8).
Vs = 60; Is = 5; R1 = 12; R2 = 8;
i1 = Vs/(R1 + R2);
i2 = Is*R1/(R1 + R2);
fprintf('i'' = %g A, i'''' = %g A, i = %g A\n', i1, i2, i1 + i2)

%% Both sources together
%ar: الحل المباشر بجهد العقدة: (v − 60)/12 + v/8 = 5. يجب أن يساوي مجموع الاستجابتين.
v = (Vs/R1 + Is) / (1/R1 + 1/R2);
fprintf('direct: v = %g V, i = %g A\n', v, v/R2)

%% Power does NOT superpose
%ar: القدرة تتناسب مع مربع التيار، فلا يصح جمع قدرات كل مصدر. هذا خطأ شائع.
fprintf('p from sum of currents: %g W, sum of powers: %g W\n', (i1 + i2)^2*R2, i1^2*R2 + i2^2*R2)

%%! Project idea: contribution of each source
%ar: مشروع: في دائرة بعدة مصادر، ارسم نسبة مساهمة كل مصدر في التيار وأنت تغيّر أحدها. مفيد لتحليل الضوضاء والتداخل في الأنظمة الحقيقية.
Isw = linspace(0, 10, 50);
plot(Isw, i1*ones(size(Isw)), Isw, Isw*R1/(R1 + R2), Isw, i1 + Isw*R1/(R1 + R2)); grid on
xlabel('I_s (A)'); ylabel('current in R_2 (A)'); legend('from V_s', 'from I_s', 'total', 'Location', 'northwest'); title('Superposition')
