% Circuits 1 — Introduction to the Node-Voltage Method
%title: Node Voltages with a Conductance Matrix
%ar-title: جهود العقد بمصفوفة الموصلية
%lesson: c1-techniques-1
%course: circuits-1

%% Fig. 4.5
%ar: العقدة 1: (v1 − 10)/1 + v1/5 + (v1 − v2)/2 = 0. العقدة 2: (v2 − v1)/2 + v2/10 − 2 = 0. نكتبهما G v = i.
G = [1/1 + 1/5 + 1/2, -1/2
     -1/2,            1/2 + 1/10];
i = [10/1; 2];
v = G \ i;
fprintf('v1 = %.4f V (100/11), v2 = %.4f V (120/11)\n', v(1), v(2))

%% Example 4.2
%ar: مثال 4.2: عقدة واحدة: (v1 − 50)/5 + v1/10 + v1/40 − 3 = 0. ثم ia و ib و ic وقدرة المصدرين.
v1 = (50/5 + 3) / (1/5 + 1/10 + 1/40);
ia = (50 - v1)/5; ib = v1/10; ic = v1/40;
fprintf('v1 = %g V, ia = %g A, ib = %g A, ic = %g A, p50V = %g W, p3A = %g W\n', v1, ia, ib, ic, -50*ia, -3*v1)

%%! Project idea: Problem 4.6 (tutorial)
%ar: مشروع: مسألة 4.6: 20 Ω و 80 Ω على التوالي مع 24 V، و 25 Ω، ومصدر 40 mA خارج من العقدة. نرسم vo مقابل تيار المصدر.
vo = (24/100 - 0.04) / (1/100 + 1/25);
fprintf('vo = %g V\n', vo)
Is = linspace(0, 0.1, 50); vos = (24/100 - Is) / (1/100 + 1/25);
plot(Is*1000, vos); grid on; xlabel('current source (mA)'); ylabel('v_o (V)'); title('Problem 4.6: v_o falls linearly with the source current')
