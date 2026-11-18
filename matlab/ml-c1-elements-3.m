% Circuits 1 — Kirchhoff's Laws
%title: KCL and KVL as a Matrix Equation
%ar-title: قانونا كيرشوف كمعادلة مصفوفات
%lesson: c1-elements-3
%course: circuits-1

%% The three equations of the example
%ar: المجاهيل i1 و i2 و i3. نكتب كل معادلة صفًا: معاملات المجاهيل في A، والطرف الأيمن في b.
%ar: KCL: i1 − i2 − i3 = 0. KVL يسار: 4 i1 + 12 i2 = 24. KVL يمين: −12 i2 + 6 i3 = 0.
A = [ 1  -1  -1
      4  12   0
      0 -12   6 ];
b = [0; 24; 0];
x = A \ b;
fprintf('i1 = %g A, i2 = %g A, i3 = %g A\n', x)
%check: all(abs(x - [3; 1; 2]) < 1e-12)

%% Check every law
%ar: نعوّض الحل في كل معادلة: الباقي A*x − b يجب أن يكون صفرًا (أو قريبًا جدًا منه بسبب التقريب العشري).
fprintf('residual = %g\n', norm(A*x - b))
fprintf('KCL: %g = %g + %g\n', x(1), x(2), x(3))

%% Power balance
%ar: قدرة المصدر −24 × i1، وقدرات المقاومات i²R. المجموع صفر.
p = [-24*x(1), 4*x(1)^2, 12*x(2)^2, 2*x(3)^2, 4*x(3)^2];
fprintf('source %g W, resistors %g W, sum %g W\n', p(1), sum(p(2:end)), sum(p))
%check: abs(sum(p)) < 1e-9

%%! Project idea: what if the source changes?
%ar: لأن الدائرة خطية، التيارات تتناسب مع المصدر. نحلها لعدة قيم للمصدر بحلقة ونرسم التيارات: خطوط مستقيمة تمر بالأصل.
Vs = 0:6:48; I = zeros(3, numel(Vs));
for k = 1:numel(Vs), I(:,k) = A \ [0; Vs(k); 0]; end
plot(Vs, I', '-o'); grid on; xlabel('V_s (V)'); ylabel('current (A)'); legend('i_1', 'i_2', 'i_3', 'Location', 'northwest'); title('Linearity: currents vs source')
