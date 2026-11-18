% Circuits 1 — Instantaneous Power
%title: Instantaneous Power p(t) = v(t) i(t)
%ar-title: القدرة اللحظية
%lesson: c1-power-1
%course: circuits-1

%% The formula
%ar: p(t) = (VmIm/2) cos(θv − θi) + (VmIm/2) cos(2ωt + θv + θi). المثال: v = 100 cos(377t)، i = 10 cos(377t − 60°).
Vm = 100; Im = 10; w = 377; tv = 0; ti = -60;
A = Vm*Im/2; P = A*cosd(tv - ti);
fprintf('p(t) = %g + %g cos(%g t %+g deg) W\n', P, A, 2*w, tv + ti)
fprintf('max %g W, min %g W\n', P + A, P - A)

%% Multiply the waveforms point by point
%ar: نتحقق بضرب v(t) و i(t) عدديًا: القيمة المتوسطة 250 W، والقدرة سالبة جزءًا من الدورة (الحمل يعيد طاقة للمصدر).
t = linspace(0, 2*2*pi/w, 2000);
v = Vm*cos(w*t + tv*pi/180); i = Im*cos(w*t + ti*pi/180); p = v.*i;
plot(t*1e3, p, t*1e3, P*ones(size(t)), '--'); grid on; xlabel('t (ms)'); ylabel('p (W)'); title('p(t) = v(t) i(t)')
legend('p(t)', 'average'); 
fprintf('numerical average over one period = %.2f W\n', mean(p(1:1000)))

%%! Project idea: energy delivered in one period
%ar: مشروع: الطاقة المنقولة في دورة واحدة = تكامل p(t)، و = P × T. احسبها بـ trapz وقارن. ثم غيّر زاوية التيار من 0 إلى 90° وارسم P: تنزل إلى الصفر.
T = 2*pi/w; tt = linspace(0, T, 2001);
E = trapz(tt, Vm*cos(w*tt).*Im.*cos(w*tt - pi/3));
fprintf('energy per period = %.4f J, P*T = %.4f J\n', E, P*T)
