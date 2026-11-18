% Circuits 1 — More on Deriving a Thevenin Equivalent
%title: Thevenin with a Dependent Source: voc / isc and the Test Source
%ar-title: ثيفنن مع مصدر تابع: voc/isc ومصدر الاختبار
%lesson: c1-techniques-10
%course: circuits-1

%% Open-circuit voltage
%ar: الدائرة: 24 V ثم R1 = 4 (تيارها ix) إلى العقدة v، ومن v: R2 = 8 للأسفل، ومصدر تابع 2ix للأسفل، ثم R3 = 12 إلى الطرف a.
%ar: مجهولان ix و v: القيد 4 ix + v = 24، و KCL مفتوح الطرفين: ix − v/8 − 2 ix = 0.
A = [4 1; -1 -1/8];
x = A \ [24; 0];
voc = x(2);
fprintf('voc = %g V (ix = %g A)\n', voc, x(1))
%check: abs(voc - 48) < 1e-9

%% Short-circuit current
%ar: بقصر a-b يمر تيار في R3 أيضًا: KCL يصير ix − v/8 − 2 ix − v/12 = 0، و isc = v/12.
A = [4 1; -1 -1/8 - 1/12];
x = A \ [24; 0];
isc = x(2)/12;
RTh = voc/isc;
fprintf('isc = %g A, RTh = %g ohm\n', isc, RTh)
%check: abs(isc - 12) < 1e-9 && abs(RTh - 4) < 1e-9

%% The test-source method
%ar: أطفئ 24 V (سلك) واترك المصدر التابع، وحقن 1 A في الطرف a. المجاهيل: ix و v و va. RTh = va/1.
% ix = -v/4 (24 V off) ; KCL at v: ix - v/8 - 2ix + (va - v)/12 = 0 ; KCL at a: 1 = (va - v)/12
M = [4    1           0
     -1  -1/8 - 1/12   1/12
     0   -1/12         1/12];
x = M \ [0; 0; 1];
fprintf('test source: RTh = %g ohm\n', x(3))
%check: abs(x(3) - 4) < 1e-9

%%! Project idea: why you must not switch off dependent sources
%ar: مشروع للفهم: احسب RTh خطأً بإطفاء المصدر التابع (R3 + R1 ∥ R2) وقارن. الفرق كبير، ولهذا تحذر المحاضرة منه.
wrong = 12 + 4*8/(4 + 8);
fprintf('wrong RTh (dependent source removed) = %.3f ohm vs correct %g ohm\n', wrong, RTh)
