% Circuits 1 — Average and Reactive Power
%title: Average and Reactive Power (Example 10.1)
%ar-title: القدرة المتوسطة والمفاعلة (مثال 10.1)
%lesson: c1-power-2
%course: circuits-1

%% Example 10.1
%ar: i = 4 sin(ωt − 15°) نكتبها cos(ωt − 105°) أولًا. ثم P و Q، وإشارتهما تخبرنا هل الشبكة تمتص أم تعطي.
thi = -15 - 90;
P = 0.5*100*4*cosd(15 - thi); Q = 0.5*100*4*sind(15 - thi);
fprintf('P = %.2f W (%s average power), Q = %.2f VAR (%s reactive power)\n', P, ternary(P < 0), Q, ternary(Q < 0))

%% Pure R, L and C
%ar: مقاومة: θv − θi = 0 ← Q = 0. ملف: 90° ← P = 0. مكثف: −90° ← P = 0 و Q سالبة.
ang = [0 90 -90]; nm = {'R', 'L', 'C'};
for k = 1:3, fprintf('%s: P = %6.1f W, Q = %6.1f VAR\n', nm{k}, 50*cosd(ang(k)), 50*sind(ang(k))); end

%%! Project idea: power factor of different loads
%ar: مشروع: نرسم معامل القدرة cos(θ) مقابل زاوية الحمل من −90° (سعوي) إلى 90° (حثي).
th = -90:90;
plot(th, cosd(th)); grid on; xlabel('\theta_v - \theta_i (deg)'); ylabel('pf'); title('Power factor: leading (left) and lagging (right)')

function s = ternary(neg)
    if neg, s = 'delivering'; else, s = 'absorbing'; end
end
