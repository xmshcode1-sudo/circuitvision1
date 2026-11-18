% Signals and Systems — Energy and Power Signals
%title: Energy and Power, Numerically
%ar-title: الطاقة والقدرة عدديًا
%lesson: ss-ch1-3
%course: signals-systems

%% Energy of A e^(-at) u(t)
%ar: E = ∫|x|² dt. integral يحسب التكامل عدديًا حتى ∞ (Inf). نقارن بالقانون A²/(2a).
A = 2; a = 3;
E = integral(@(t) (A*exp(-a*t)).^2, 0, Inf);
fprintf('E numerical = %.6f, formula A^2/(2a) = %.6f\n', E, A^2/(2*a))
%check: abs(E - A^2/(2*a)) < 1e-8

%% Average power of a cosine
%ar: P = متوسط |x|² على دورة. للجيبية: A²/2 مهما كان التردد والطور.
w0 = 5; th = 0.7; T0 = 2*pi/w0;
P = integral(@(t) (A*cos(w0*t + th)).^2, 0, T0) / T0;
fprintf('P = %.6f, A^2/2 = %g\n', P, A^2/2)
%check: abs(P - A^2/2) < 1e-9

%% A discrete step: energy grows, power settles
%ar: x[n] = A للـ n ≥ 0. نحسب E و P على نوافذ متزايدة N: الطاقة تكبر بلا حد، والقدرة تقترب من A²/2.
Ns = [10 100 1000 10000];
for N = Ns
    EN = A^2*(N + 1); PN = EN/(2*N + 1);
    fprintf('N = %5d: E_N = %8g, P_N = %.5f\n', N, EN, PN)
end
N = 1:2000; semilogx(N, A^2*(N + 1)./(2*N + 1)); grid on; xlabel('N'); ylabel('P_N'); title('Power of a DT step tends to A^2/2')

%%! Project idea: classify any recorded signal
%ar: مشروع: دالة تأخذ عيّنات إشارة طويلة وتقدّر الطاقة والقدرة على نوافذ متزايدة، وتقول: طاقة (E ثابتة) أم قدرة (P ثابتة). جربها على صوت أو اهتزاز مسجل.
t = linspace(0, 50, 50001); dt = t(2) - t(1);
for k = 1:2
    if k == 1, x = exp(-t); nm = 'exp(-t)'; else, x = cos(2*t); nm = 'cos(2t)'; end
    E1 = sum(x(t <= 25).^2)*dt; E2 = sum(x.^2)*dt;
    if abs(E2 - E1) < 1e-3*E2, s = 'energy signal'; else, s = 'power signal'; end
    fprintf('%-8s E(25) = %8.3f, E(50) = %8.3f -> %s\n', nm, E1, E2, s)
end
