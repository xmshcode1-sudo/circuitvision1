% Circuits 1 — Source Transformations
%title: Source Transformation, Proved Numerically
%ar-title: تحويل المصادر والتحقق منه عدديًا
%lesson: c1-techniques-8
%course: circuits-1

%% The transformation
%ar: مصدر جهد 48 V على التوالي مع 8 Ω يكافئ مصدر تيار is = Vs/R = 6 A على التوازي مع نفس 8 Ω.
Vs = 48; R = 8;
is = Vs/R;
fprintf('is = %g A in parallel with %g ohm\n', is, R)

%% Same load, same current
%ar: «مكافئ» تعني: أي حمل نوصله يرى نفس الجهد ونفس التيار. نجرب أحمالًا كثيرة ونقارن.
RL = [1 2 4 8 16 32 100];
iL_v = Vs ./ (R + RL);                  % voltage-source version
iL_i = is * R ./ (R + RL);              % current-source version (current divider)
fprintf('RL = %4g ohm: %.4f A  vs  %.4f A\n', [RL; iL_v; iL_i])
fprintf('largest difference: %g A\n', max(abs(iL_v - iL_i)))

%% But not inside the source
%ar: المكافئ خارجي فقط: القدرة المفقودة داخل المصدرين مختلفة. عند الدائرة المفتوحة: نسخة الجهد لا تفقد شيئًا، ونسخة التيار تفقد is²R في المقاومة.
fprintf('open circuit: internal loss %g W (voltage form) vs %g W (current form)\n', 0, is^2*R)

%%! Project idea: simplify a ladder step by step
%ar: مشروع: سلسلة مصادر ومقاومات. نطبّق التحويل خطوة خطوة في حلقة حتى يبقى مصدر واحد ومقاومة واحدة (مكافئ ثيفنن). نفس فكرة تبسيط الدوائر يدويًا.
V = [12 6]; Rs = [4 4];               % two voltage sources with series resistors, in parallel
I = sum(V./Rs); Rp = 1/sum(1./Rs);
fprintf('combined: %g A || %g ohm  ->  %g V in series with %g ohm\n', I, Rp, I*Rp, Rp)
