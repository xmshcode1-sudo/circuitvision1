% MATLAB from zero — 1: the Command Window, variables and arithmetic
%title: MATLAB from Zero 1: Variables and Arithmetic
%ar-title: MATLAB من الصفر 1: المتغيرات والعمليات الحسابية
%course: intro
%level: 1

%% MATLAB as a calculator
%ar: افتح MATLAB: في المنتصف نافذة الأوامر (Command Window) وفيها العلامة >>. اكتب أي عملية واضغط Enter.
%ar: هنا نستخدم fprintf لنطبع الناتج بشكل مرتب. %g تعني «اطبع الرقم بأقصر شكل»، و \n تعني سطرًا جديدًا.
fprintf('%g\n', 2 + 3*4)
fprintf('%g\n', (2 + 3)*4)
fprintf('%g\n', 2^10)
fprintf('%g\n', 7/2)
%check: 2+3*4 == 14
%ar: ترتيب العمليات مثل الرياضيات: الأس ^ أولًا، ثم الضرب * والقسمة /، ثم الجمع والطرح. الأقواس تغيّر الترتيب.

%% Variables
%ar: المتغير اسم نحفظ فيه قيمة: نكتب الاسم ثم = ثم القيمة. الاسم يبدأ بحرف، وبدون مسافات، والحروف الكبيرة والصغيرة مختلفة (R غير r).
%ar: الفاصلة المنقوطة ; في آخر السطر تمنع MATLAB من طباعة النتيجة. بدونها يطبع القيمة مباشرة.
V = 12;          % voltage in volts
R = 4;           % resistance in ohms
I = V / R;       % Ohm's law
fprintf('I = %g A\n', I)
%check: I == 3

%% Built-in constants and functions
%ar: MATLAB فيه ثوابت جاهزة مثل pi، ودوال جاهزة مثل sqrt للجذر و exp للأس الطبيعي و sin و cos (الزاوية بالراديان).
fprintf('pi       = %.4f\n', pi)
fprintf('sqrt(2)  = %.4f\n', sqrt(2))
fprintf('exp(1)   = %.4f\n', exp(1))
fprintf('sin(pi/6)= %.4f\n', sin(pi/6))
fprintf('sind(30) = %.4f\n', sind(30))
%ar: sind و cosd تأخذ الزاوية بالدرجات. %.4f تعني أربع خانات بعد الفاصلة.

%% Scientific notation and units
%ar: الأعداد الكبيرة والصغيرة تُكتب بـ e: 4.7e3 تعني 4.7 × 10³، و 10e-6 تعني 10 × 10⁻⁶. هكذا نكتب kΩ و µF.
R  = 4.7e3;      % 4.7 kOhm
C  = 10e-6;      % 10 uF
tau = R*C;       % time constant
fprintf('tau = %g s = %g ms\n', tau, tau*1e3)
%check: abs(tau - 0.047) < 1e-12

%% Workspace commands
%ar: who يعرض المتغيرات المحفوظة، و clear يمسحها، و clc يمسح الشاشة فقط. help sqrt يشرح أي دالة.
%ar: نصيحة: ابدأ كل سكربت بـ clear; clc; حتى لا تختلط القيم القديمة بالجديدة.
clear
fprintf('after clear, does V exist? %d\n', exist('V', 'var'))

%%! From the calculator to a small project
%ar: الفكرة الأولى لمشروع: «حاسبة دائرة» تأخذ القيم وتطبع كل النتائج دفعة واحدة. غيّر V و R فقط وشغّل من جديد.
%ar: احفظ هذا في ملف باسم ohm_calc.m (من New Script) واضغط Run. هذا أول سكربت لك.
V = 9;  R = 330;
I = V / R;  P = V * I;
fprintf('I = %.2f mA,  P = %.1f mW\n', I*1e3, P*1e3)
%check: abs(I - 9/330) < 1e-12
