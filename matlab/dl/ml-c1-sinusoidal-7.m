% Circuits 1 — The Node-Voltage Method
%title: Node Voltages with Complex Matrices (Example 9.11)
%ar-title: جهود العقد بمصفوفة مركّبة (مثال 9.11)
%lesson: c1-sinusoidal-7
%course: circuits-1

%% Example 9.11
%ar: من المحاضرة: V1(1.1 + j0.2) − V2 = 10.6 + j21.2، و −5 V1 + (4.8 + j0.6) V2 = 0. نفس طريقة DC والمصفوفة مركبة.
A = [1.1 + 0.2j, -1
     -5,          4.8 + 0.6j];
V = A \ [10.6 + 21.2j; 0];
fprintf('V1 = %.2f %+.2fj V, V2 = %.2f %+.2fj V\n', real(V(1)), imag(V(1)), real(V(2)), imag(V(2)))

%% The branch currents
%ar: Ia = V1/10، و Ix = (V1 − V2)/(1 + j2)، و Ib = (V2 − 20 Ix)/5، و Ic = V2/(−j5). ونتحقق Ia + Ix = 10.6.
Ia = V(1)/10; Ix = (V(1) - V(2))/(1 + 2j); Ib = (V(2) - 20*Ix)/5; Ic = V(2)/(-5j);
fprintf('Ia = %.2f%+.2fj, Ix = %.2f%+.2fj, Ib = %.2f%+.2fj, Ic = %.2f%+.2fj A\n', real(Ia), imag(Ia), real(Ix), imag(Ix), real(Ib), imag(Ib), real(Ic), imag(Ic))
fprintf('Ia + Ix = %.4f %+.4fj A\n', real(Ia + Ix), imag(Ia + Ix))

%%! Project idea: phasor diagram of the currents
%ar: مشروع: نرسم Ia و Ix و Ib و Ic كأسهم: Ia + Ix يقع على المحور الحقيقي (تيار المصدر 10.6∠0°).
P = [Ia Ix Ib Ic];
hold on; for k = 1:4, plot([0 real(P(k))], [0 imag(P(k))], '-o', 'linewidth', 2); end; hold off
grid on; axis equal; xlabel('Re (A)'); ylabel('Im (A)'); legend('I_a', 'I_x', 'I_b', 'I_c'); title('Example 9.11: branch-current phasors')
