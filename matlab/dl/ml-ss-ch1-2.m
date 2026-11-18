% Signals and Systems — Periodic and Aperiodic Signals
%title: Is the Sum Periodic?
%ar-title: هل المجموع دوري؟
%lesson: ss-ch1-2
%course: signals-systems

%% Periods of the three sinusoids
%ar: T = 2π/ω. نضع ω لكل إشارة في متجه ونحسب الأزمنة دفعة واحدة.
w = [10*pi 20*pi 31];
T = 2*pi ./ w;
fprintf('T1 = %.4f, T2 = %.4f, T3 = %.4f s\n', T)

%% The ratio must be rational
%ar: المجموع دوري إذا كانت نسبة الزمنين عددًا كسريًا. rat يكتب العدد كسرًا p/q. النسبة الأولى 2/1 بالضبط. والثانية 31/(10π) فيها π فهي غير كسرية: rat لا يجد لها إلا كسرًا ضخمًا تقريبيًا.
r4 = T(1)/T(2); [p, q] = rat(r4);
fprintf('T1/T2 = %g = %d/%d -> periodic, T4 = %g s\n', r4, p, q, q*T(1))
r5 = T(1)/T(3); [p, q] = rat(r5, 1e-12);
fprintf('T1/T3 = 31/(10 pi) = %.10f: even to 12 digits it needs %d/%d -> not periodic\n', r5, p, q)

%% See it
%ar: x4 تتكرر كل 0.2 s، و x5 لا تتكرر أبدًا تمامًا.
t = linspace(0, 1, 4000);
x4 = sin(10*pi*t) + sin(20*pi*t); x5 = sin(10*pi*t) + sin(31*t);
subplot(2,1,1); plot(t, x4); grid on; title('x_4 = sin(10\pi t) + sin(20\pi t): period 0.2 s')
subplot(2,1,2); plot(t, x5); grid on; title('x_5 = sin(10\pi t) + sin(31t): not periodic'); xlabel('t (s)')

%% Discrete-time periods
%ar: المتقطعة: N = 2πk/ω0 ويجب أن يكون عددًا صحيحًا. للمجموع: المضاعف المشترك الأصغر lcm للزمنين: lcm(6, 8) = 24.
N1 = 2*pi/(pi/3); N2 = 2*pi/(pi/4);
N0 = lcm(round(N1), round(N2));
fprintf('N1 = %g, N2 = %g, N0 = %d\n', N1, N2, N0)
n = 0:100; x = cos(pi*n/3) + sin(pi*n/4);
fprintf('max |x[n+24] - x[n]| = %.2e\n', max(abs(x(1+24:end) - x(1:end-24))))

%%! Project idea: a periodicity tester
%ar: مشروع: دالة تأخذ ترددات زاوية لمجموعة جيبيات مستمرة وتقول هل المجموع دوري وتعطي زمنه. اختبرها على أمثلة الدرس.
period_of([10*pi 20*pi]); period_of([10*pi 31]); period_of([4 6]);

function period_of(w)
    T = 2*pi ./ w; T0 = T(1);
    for k = 2:numel(T)
        [p, q] = rat(T0/T(k), 1e-9);
        if abs(p/q - T0/T(k)) > 1e-9 || q > 1000, fprintf('w = [%s]: not periodic\n', num2str(w)); return, end
        T0 = q*T0;
    end
    fprintf('w = [%s]: periodic, T0 = %.4f s\n', num2str(w, '%.4g '), T0)
end
