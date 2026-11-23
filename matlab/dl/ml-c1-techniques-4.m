% Circuits 1 — Introduction to the Mesh-Current Method
%title: Mesh Currents with a Resistance Matrix (Example 4.4)
%ar-title: تيارات الحلقات بمصفوفة المقاومات (مثال 4.4)
%lesson: c1-techniques-4
%course: circuits-1

%% Example 4.4
%ar: بعد الترتيب: 10 ia − 8 ib = 40، و −8 ia + 20 ib − 6 ic = 0، و −6 ib + 10 ic = −20.
R = [10 -8  0
     -8 20 -6
      0 -6 10];
v = [40; 0; -20];
I = R \ v;
fprintf('ia = %g A, ib = %g A, ic = %g A\n', I)

%% Powers and vo
%ar: p40V = −40 ia، و p20V = 20 ic، و vo = 8(ia − ib).
p40 = -40*I(1); p20 = 20*I(3); vo = 8*(I(1) - I(2));
fprintf('p40V = %g W, p20V = %g W, vo = %g V\n', p40, p20, vo)

%%! Project idea: build R automatically
%ar: مشروع: نبني مصفوفة المقاومات من قائمة المقاومات: القطر مجموع مقاومات كل حلقة، وخارج القطر سالب المقاومة المشتركة.
own = {[2 8], [8 6 6], [6 4]};   % resistors around each mesh
shared = [0 8 0; 8 0 6; 0 6 0];  % shared resistor between meshes
Rb = -shared; for k = 1:3, Rb(k,k) = sum(own{k}); end
disp(Rb)
