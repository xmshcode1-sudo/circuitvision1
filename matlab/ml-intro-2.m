% MATLAB from zero — 2: vectors and matrices
%title: MATLAB from Zero 2: Vectors and Matrices
%ar-title: MATLAB من الصفر 2: المتجهات والمصفوفات
%course: intro
%level: 2

%% Row and column vectors
%ar: اسم MATLAB من Matrix Laboratory: كل شيء فيه مصفوفة. المتجه صف من القيم بين قوسين مربعين [ ].
%ar: المسافة أو الفاصلة تفصل عناصر الصف، والفاصلة المنقوطة تبدأ صفًا جديدًا (أي عمود).
R = [10 20 30 40];          % a row vector
c = [1; 2; 3];              % a column vector
fprintf('R has %d elements, c has %d\n', length(R), length(c))
fprintf('size of c: %d x %d\n', size(c))

%% Indexing: picking elements
%ar: العنصر الأول رقمه 1 (وليس 0). R(2) هو العنصر الثاني، و R(end) هو الأخير، و R(2:3) من الثاني إلى الثالث.
fprintf('R(1) = %g, R(end) = %g\n', R(1), R(end))
fprintf('R(2:3) = %g %g\n', R(2:3))
R(2) = 22;                  % change one element
fprintf('after R(2) = 22: %g %g %g %g\n', R)

%% Ranges with the colon and linspace
%ar: a:s:b يعطي القيم من a إلى b بخطوة s. و linspace(a, b, N) يعطي N نقطة متساوية بين a و b. هذا ما نستخدمه للزمن في الرسم.
n = 0:2:10;
t = linspace(0, 1, 5);
fprintf('n = '); fprintf('%g ', n); fprintf('\n')
fprintf('t = '); fprintf('%g ', t); fprintf('\n')
%check: isequal(n, [0 2 4 6 8 10])

%% Element-wise operations: the dot
%ar: أهم قاعدة: لضرب كل عنصر في نظيره نضع نقطة قبل العملية: .* و ./ و .^ . بدون النقطة يحاول MATLAB ضرب مصفوفات بقواعد الجبر الخطي.
V = [5 10 15];
I = [0.5 1 1.5];
P = V .* I;                 % power of each element
fprintf('P = '); fprintf('%g ', P); fprintf('W\n')
fprintf('V.^2 = '); fprintf('%g ', V.^2); fprintf('\n')
%check: isequal(P, [2.5 10 22.5])

%% Functions on whole vectors
%ar: sum و max و min و mean تعمل على المتجه كله دفعة واحدة. هنا: مقاومات على التوالي = sum، وعلى التوازي = 1/sum(1./R).
R = [2 3 5 10];
Rs = sum(R);
Rp = 1 / sum(1 ./ R);
fprintf('series = %g ohm, parallel = %.4f ohm\n', Rs, Rp)
[Pmax, k] = max(P);
fprintf('largest power %g W at element %d\n', Pmax, k)
%check: Rs == 20 && abs(Rp - 1/(1/2+1/3+1/5+1/10)) < 1e-12

%% Matrices
%ar: المصفوفة صفوف وأعمدة. A(2,3) هو العنصر في الصف 2 والعمود 3. و A' هو المنقول (الصفوف تصير أعمدة).
A = [1 2 3; 4 5 6];
fprintf('A is %d x %d, A(2,3) = %g\n', size(A), A(2,3))
B = A';
fprintf('B = A'' is %d x %d\n', size(B))

%%! Project step: a table of results
%ar: مشروع صغير: جدول لقانون أوم لعدة مقاومات دفعة واحدة، بدون تكرار السطر لكل قيمة. هذه قوة المتجهات.
V = 12;
R = [100 220 470 1000];
I = V ./ R;
fprintf('   R (ohm)    I (mA)    P (mW)\n')
fprintf('%9g %9.2f %9.1f\n', [R; I*1e3; V*I*1e3])
%check: abs(I(1) - 0.12) < 1e-12
