% Circuits 1 — Instantaneous Power
%title: Instantaneous Power p(t) = v(t) i(t)
%ar-title: القدرة اللحظية
%lesson: c1-power-1
%course: circuits-1

%% The lesson's example
%ar: v = 100 cos(ωt + 15°) و i = 4 cos(ωt − 105°). P = (VmIm/2) cos(θv − θi) و Q = (VmIm/2) sin(θv − θi).
Vm = 100; thv = 15; Im = 4; thi = -105;
P = Vm*Im/2*cosd(thv - thi); Q = Vm*Im/2*sind(thv - thi);
fprintf('P = %.2f W, Q = %.2f VAR\n', P, Q)

%% p(t) = P + P cos 2wt - Q sin 2wt
%ar: نتحقق رقميًا أن v·i يساوي P + P cos 2ωt − Q sin 2ωt في كل لحظة (بعد إزاحة الزمن بـ θi كما في المحاضرة).
w = 377; t = linspace(0, 2*2*pi/w, 1000);
v = Vm*cos(w*t + (thv - thi)*pi/180); i = Im*cos(w*t);
p = v.*i; pf = P + P*cos(2*w*t) - Q*sin(2*w*t);
fprintf('max difference = %.2e W, average of p = %.3f W\n', max(abs(p - pf)), mean(p(1:end-1)))

%%! Project idea: plot v, i and p
%ar: مشروع: نرسم v و i و p: القدرة تتذبذب بضعف التردد حول متوسطها P.
plot(t*1000, v, t*1000, 25*i, t*1000, p/4, t*1000, P/4*ones(size(t)), '--'); grid on
xlabel('t (ms)'); legend('v (V)', '25 i (A)', 'p/4 (W)', 'P/4'); title('Instantaneous power has twice the frequency')
