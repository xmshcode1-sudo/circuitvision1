% Circuits 1 — Average and Reactive Power
%title: Average and Reactive Power
%ar-title: القدرة المتوسطة والردية
%lesson: c1-power-2
%course: circuits-1

%% The example
%ar: P = (VmIm/2) cos θ و Q = (VmIm/2) sin θ، حيث θ = θv − θi. Q موجبة: حمل حثي.
Vm = 200; Im = 5; th = 30 - (-15);
P = Vm*Im/2*cosd(th); Q = Vm*Im/2*sind(th);
fprintf('theta = %g deg, P = %.1f W, Q = %.1f VAR\n', th, P, Q)

%% P and Q as the angle changes
%ar: من θ = −90° (مكثف خالص) إلى +90° (ملف خالص): P أكبر عند 0° (مقاومة)، و Q تغيّر إشارتها.
th = -90:1:90;
plot(th, Vm*Im/2*cosd(th), th, Vm*Im/2*sind(th)); grid on; xlabel('\theta_v - \theta_i (deg)'); ylabel('W or VAR')
legend('P', 'Q', 'Location', 'southeast'); title('Average and reactive power vs angle')

%%! Project idea: classify loads automatically
%ar: مشروع: من قياسات v و i (السعة والطور) لعدة أحمال، اطبع P و Q ونوع كل حمل.
loads = [200 5 30 -15; 200 5 0 0; 200 5 0 60];
for k = 1:size(loads, 1)
    a = loads(k,3) - loads(k,4); p = loads(k,1)*loads(k,2)/2*cosd(a); q = loads(k,1)*loads(k,2)/2*sind(a);
    if q > 1e-9, ty = 'inductive'; elseif q < -1e-9, ty = 'capacitive'; else, ty = 'resistive'; end
    fprintf('load %d: P = %7.1f W, Q = %7.1f VAR -> %s\n', k, p, q, ty)
end
