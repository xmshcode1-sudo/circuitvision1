% Signals and Systems — Frequency Response of LCCDE Systems
%title: Frequency Response from the Equation
%ar-title: الاستجابة الترددية من المعادلة
%lesson: ss-ch4-6
%course: signals-systems

%% H(jw) from the coefficients
%ar: y'' + 4y' + 3y = x' + 2x. نستبدل d/dt بـ jω: H = (jω + 2)/((jω)² + 4jω + 3). polyval يحسب كثيرة الحدود بقيمة مركبة.
b = [1 2]; a = [1 4 3];
w = logspace(-2, 2, 400); s = 1j*w;
H = polyval(b, s)./polyval(a, s);
semilogx(w, 20*log10(abs(H))); grid on; xlabel('\omega (rad/s)'); ylabel('|H| (dB)'); title('H(j\omega) = (j\omega + 2)/((j\omega + 1)(j\omega + 3))')

%% Partial fractions with residue
%ar: residue(b, a) يعطي البواقي r والأقطاب p: H = Σ r/(s − p). ومنها h(t) = Σ r e^{pt}. للمثال: ½ عند −1 و −3.
[r, p] = residue(b, a);
fprintf('pole %g: residue %g\n', [p.'; r.'])
t = linspace(0, 5, 6); hcalc = real(r.' * exp(p*t));
fprintf('h(t) = 0.5e^{-t} + 0.5e^{-3t} -> max error %.2e\n', max(abs(hcalc - (0.5*exp(-t) + 0.5*exp(-3*t)))))

%% The discrete system with filter
%ar: y[n] − ¾y[n−1] + ⅛y[n−2] = 2x[n]. filter(2, [1 −3/4 1/8], δ) يعطي h[n]، ونقارن بـ 4(½)^n − 2(¼)^n. ثم الخرج لـ x = (¼)^n.
n = 0:20; d = double(n == 0);
h = filter(2, [1 -3/4 1/8], d);
fprintf('h error = %.2e\n', max(abs(h - (4*0.5.^n - 2*0.25.^n))))
y = filter(2, [1 -3/4 1/8], 0.25.^n);
yf = 8*0.5.^n - 4*0.25.^n - 2*(n + 1).*0.25.^n;
fprintf('y error = %.2e\n', max(abs(y - yf)))

%%! Project idea: a Bode plotter without toolboxes
%ar: مشروع: دالة bodeplot(b, a) ترسم المقدار بالـ dB والطور لأي نظام من معاملاته فقط. Control System Toolbox فيه bode، لكن هذه تعمل في كل مكان وتفهم ما يحدث داخلها.
my_bode([1 2], [1 4 3]);

function my_bode(b, a)
    w = logspace(-2, 3, 500); H = polyval(b, 1j*w)./polyval(a, 1j*w);
    figure; subplot(2,1,1); semilogx(w, 20*log10(abs(H))); grid on; ylabel('dB'); title('Bode plot')
    subplot(2,1,2); semilogx(w, angle(H)*180/pi); grid on; ylabel('deg'); xlabel('\omega (rad/s)')
end
