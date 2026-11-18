% Circuits 1 — The Node-Voltage Method (phasors)
%title: Node Voltages with Complex Matrices
%ar-title: جهود العقد بمصفوفة مركبة
%lesson: c1-sinusoidal-7
%course: circuits-1

%% The equations
%ar: Vs = 10∠0°، R1 = 2، ZL = j2 (من V1 للأرض)، ZC = −j6 (بين V1 و V2)، R2 = 4 (من V2 للأرض). نفس طريقة DC، والمصفوفة مركبة.
Vs = 10; R1 = 2; ZL = 2j; ZC = -6j; R2 = 4;
Y = [1/R1 + 1/ZL + 1/ZC, -1/ZC
     -1/ZC,               1/ZC + 1/R2];
V = Y \ [Vs/R1; 0];
fprintf('V1 = %g%+gj V, V2 = %g%+gj V\n', real(V(1)), imag(V(1)), real(V(2)), imag(V(2)))

%% Polar form and time functions
%ar: كل فازور يعطي دالة زمنية: |V| cos(ωt + ∠V).
for k = 1:2
    fprintf('v%d(t) = %.3f cos(wt %+.2f deg) V\n', k, abs(V(k)), angle(V(k))*180/pi)
end

%%! Project idea: sweep the frequency
%ar: مشروع: المعاوقات تتغير مع التردد. نعيد الحل لكل ω (L = ZL/(jω0) و C من ZC عند ω0 = 1) ونرسم |V2|: هذه بداية «الاستجابة الترددية» (Circuits 2).
w0 = 1; L = 2/w0; C = 1/(6*w0);
w = logspace(-2, 2, 300); V2 = zeros(size(w));
for k = 1:numel(w)
    zl = 1j*w(k)*L; zc = 1/(1j*w(k)*C);
    v = [1/R1 + 1/zl + 1/zc, -1/zc; -1/zc, 1/zc + 1/R2] \ [Vs/R1; 0]; V2(k) = v(2);
end
semilogx(w, abs(V2)); grid on; xlabel('\omega (rad/s)'); ylabel('|V_2| (V)'); title('|V_2| vs frequency (\omega_0 = 1 is the lesson''s case)')
