% Circuits 1 — Series, Parallel, and Delta-to-Wye Simplifications
%title: Combining Impedances
%ar-title: جمع المعاوقات على التوالي والتوازي
%lesson: c1-sinusoidal-5
%course: circuits-1

%% The example
%ar: نفس قوانين المقاومات، لكن بأعداد مركبة: 4 Ω على التوالي مع (j6 ∥ −j3).
par = @(a, b) a.*b ./ (a + b);
Z = 4 + par(6j, -3j);
fprintf('j6 || -j3 = %+gj ohm\n', imag(par(6j, -3j)))
fprintf('Z = %g%+gj = %.2f at %.2f deg ohm\n', real(Z), imag(Z), abs(Z), angle(Z)*180/pi)
%check: abs(Z - (4 - 6j)) < 1e-12

%% The surprise: a parallel LC can be larger than both
%ar: |j6 ∥ −j3| = 6، أكبر من 3! عكس المقاومات. نرسم مقدار ملف ∥ مكثف مع التردد: يصير لا نهائيًا عند الرنين.
w = linspace(100, 3000, 2000); L = 10e-3; C = 100e-6;
Zp = par(1j*w*L, 1./(1j*w*C));
semilogy(w, abs(Zp)); grid on; xlabel('\omega (rad/s)'); ylabel('|Z| (\Omega)'); title('|Z_L || Z_C| vs frequency')
fprintf('resonance at %g rad/s\n', 1/sqrt(L*C))

%%! Project idea: an impedance calculator
%ar: مشروع: دوال صغيرة zR و zL و zC و ser و par تبني أي شبكة بسطر واحد. جرب: (R + L) ∥ C عند 1 kHz.
zR = @(R, w) R + 0*w; zL = @(L, w) 1j*w*L; zC = @(C, w) 1./(1j*w*C); ser = @(a, b) a + b;
w = 2*pi*1e3;
Z = par(ser(zR(50, w), zL(10e-3, w)), zC(1e-6, w));
fprintf('Z = %.2f%+.2fj ohm\n', real(Z), imag(Z))
