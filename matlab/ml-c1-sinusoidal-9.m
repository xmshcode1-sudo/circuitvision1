% Circuits 1 — Phasor Diagrams
%title: Drawing Phasor Diagrams
%ar-title: رسم المخطط الفازوري
%lesson: c1-sinusoidal-9
%course: circuits-1

%% The example
%ar: RL توالي: V = 100∠0°، R = 6، XL = 8. I = V/Z، ثم VR = R I و VL = jXL I.
V = 100; Z = 6 + 8j;
I = V/Z; VR = 6*I; VL = 8j*I;
show = @(n, z) fprintf('%-3s = %7.2f at %7.2f deg\n', n, abs(z), angle(z)*180/pi);
show('I', I); show('VR', VR); show('VL', VL);
%check: abs(abs(I) - 10) < 1e-12 && abs(angle(I)*180/pi + 53.13) < 0.01

%% The diagram
%ar: نرسم كل فازور سهمًا من الأصل، و VL يبدأ من رأس VR ليظهر أن مجموعهما V (مثلث الجهود). التيار متأخر عن الجهد: دائرة حثية.
plot([0 real(V)], [0 imag(V)], 'k', 'LineWidth', 2); hold on
plot([0 real(VR)], [0 imag(VR)], 'b', 'LineWidth', 2)
plot(real(VR) + [0 real(VL)], imag(VR) + [0 imag(VL)], 'r', 'LineWidth', 2)
plot([0 real(I)]*5, [0 imag(I)]*5, 'g--', 'LineWidth', 2); hold off
axis equal; grid on; xlabel('Re'); ylabel('Im'); legend('V', 'V_R', 'V_L', '5 I'); title('Phasor diagram of the RL circuit')

%%! Project idea: animate the rotating phasors
%ar: مشروع ممتع: الفازور يدور بسرعة ω، وظله على المحور الحقيقي هو الإشارة الزمنية. في MATLAB: حلقة تحدث الرسم بـ drawnow. هنا نرسم ثلاث لقطات فقط.
figure
for k = 1:3
    th = (k - 1)*pi/3; z = 10*exp(1j*th);
    subplot(1,3,k); plot([0 real(z)], [0 imag(z)], 'LineWidth', 2); axis([-11 11 -11 11]); axis square; grid on
    title(sprintf('\\omega t = %d deg', round(th*180/pi)))
end
