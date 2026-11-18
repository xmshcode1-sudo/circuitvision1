% Signals and Systems — Even and Odd Signals
%title: Even and Odd Parts
%ar-title: الجزء الزوجي والجزء الفردي
%lesson: ss-ch1-4
%course: signals-systems

%% Build x[n] on a symmetric index range
%ar: لنحسب x[−n] بسهولة نجعل محور n متماثلًا حول الصفر (من −N إلى N). عندها x[−n] هي fliplr(x).
A = 1; n = -8:8;
x = A*(n >= 0);
xr = fliplr(x);                      % x[-n]

%% The two parts
%ar: xe = ½(x[n] + x[−n]) و xo = ½(x[n] − x[−n]). مجموعهما x، والزوجي متماثل والفردي متماثل عكسيًا.
xe = (x + xr)/2; xo = (x - xr)/2;
fprintf('xe at n = -1, 0, 1: %g %g %g\n', xe(n == -1), xe(n == 0), xe(n == 1))
fprintf('xo at n = -1, 0, 1: %g %g %g\n', xo(n == -1), xo(n == 0), xo(n == 1))
fprintf('max |xe + xo - x| = %g\n', max(abs(xe + xo - x)))
%check: xe(n == 0) == 1 && xe(n == 3) == 0.5 && xo(n == -2) == -0.5

%% Plot
%ar: ثلاثة رسوم stem فوق بعض: الإشارة، الزوجي، الفردي.
subplot(3,1,1); stem(n, x, 'filled'); grid on; title('x[n] = A u[n]')
subplot(3,1,2); stem(n, xe, 'filled'); grid on; title('even part')
subplot(3,1,3); stem(n, xo, 'filled'); grid on; title('odd part'); xlabel('n')

%%! Project idea: even/odd of any signal and energy split
%ar: مشروع: دالة evenodd لأي إشارة على محور متماثل، وتتحقق أن الطاقة تنقسم: E = Ee + Eo (لأن الجزأين متعامدان).
y = (0.8.^abs(n)).*(n >= -3) + 0.3*n.*(abs(n) <= 4);
[ye, yo] = evenodd(y);
fprintf('E = %.4f, Ee + Eo = %.4f\n', sum(y.^2), sum(ye.^2) + sum(yo.^2))
%check: abs(sum(y.^2) - sum(ye.^2) - sum(yo.^2)) < 1e-12

function [e, o] = evenodd(x)
    r = fliplr(x); e = (x + r)/2; o = (x - r)/2;
end
