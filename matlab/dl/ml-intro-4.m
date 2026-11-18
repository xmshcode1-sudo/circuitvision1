% MATLAB from zero — 4: scripts, sections and functions
%title: MATLAB from Zero 4: Scripts and Functions
%ar-title: MATLAB من الصفر 4: السكربتات والدوال
%course: intro
%level: 4

%% Scripts and sections
%ar: السكربت ملف .m فيه أوامر تُنفذ بالترتيب. اصنعه من Home ثم New Script، واحفظه باسم بدون مسافات مثل lab1.m.
%ar: السطر الذي يبدأ بـ %% يقسم السكربت إلى أقسام: تقدر تشغل قسمًا واحدًا بـ Ctrl+Enter. والسطر الذي يبدأ بـ % تعليق لا يُنفذ.
clear; clc;
Vs = 10;                 % source voltage (V)
R1 = 1e3; R2 = 2e3;      % resistors (ohm)
Vout = Vs * R2/(R1 + R2);
fprintf('Vout = %.4f V\n', Vout)

%% Formatted printing
%ar: fprintf يطبع نصًا فيه أماكن للأرقام: %d عدد صحيح، %f عشري، %.2f بخانتين، %e علمي، %g أقصر شكل، و %s نص.
fprintf('%d | %f | %.2f | %e | %g\n', 7, pi, pi, 12000, 0.000125)
name = 'R2';
fprintf('%s = %g ohm\n', name, R2)

%% Anonymous functions
%ar: الدالة المجهولة سطر واحد: الاسم = @(المدخلات) القانون. ممتازة للقوانين القصيرة.
divider = @(Vs, Ra, Rb) Vs .* Rb ./ (Ra + Rb);
par = @(a, b) a.*b ./ (a + b);
fprintf('divider(12, 6k, 3k) = %g V\n', divider(12, 6e3, 3e3))
fprintf('3k || 6k = %g ohm\n', par(3e3, 6e3))

%% Using a function with many inputs at once
%ar: لأننا كتبنا .* و ./ داخل الدالة، تقبل متجهًا كاملًا: نحسب الخرج لعدة قيم حمل بسطر واحد.
RL = [1e3 3e3 10e3 1e6];
Vo = divider(12, 6e3, par(3e3, RL));
fprintf('RL = %8g ohm -> Vo = %.3f V\n', [RL; Vo])

%%! Project step: your own function file
%ar: للدوال الأطول: ملف باسم الدالة نفسها. هنا دالة محلية في آخر السكربت (مسموحة من MATLAB R2016b). تأخذ مقاومات وترجع المكافئ على التوالي والتوازي.
%ar: تقسيم المشروع إلى دوال صغيرة يجعله سهل الاختبار والتطوير: كل دالة تعمل شيئًا واحدًا وتختبرها وحدها.
[Rs, Rp] = combine([2 3 6]);
fprintf('series = %g, parallel = %g ohm\n', Rs, Rp)

function [Rs, Rp] = combine(R)
% COMBINE  equivalent resistance in series and in parallel
    Rs = sum(R);
    Rp = 1 / sum(1 ./ R);
end
