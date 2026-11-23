% Circuits 1 — More on Deriving a Thevenin Equivalent
%title: RTh by Deactivating Sources and by a Test Source
%ar-title: مقاومة ثيفنن بتعطيل المصادر وبمصدر الاختبار
%lesson: c1-techniques-10
%course: circuits-1

%% Method 1: deactivate the independent sources
%ar: 25 V ← قصر و 3 A ← مفتوح، فـ RTh = 4 + 5 ∥ 20 = 8 Ω.
RTh = 4 + 5*20/(5 + 20);
fprintf('RTh = %g ohm\n', RTh)

%% Method 2: a test source (Example 4.11)
%ar: نعطل 5 V ونضع vT: iT = vT/25 + 20 i، و i = −3 vT/2000. نجرّب vT = 1 V.
vT = 1;
i = -3*vT/2000;
iT = vT/25 + 20*i;
fprintf('iT = %g A for vT = 1 V -> RTh = %g ohm\n', iT, vT/iT)

%%! Project idea: linear in the test source
%ar: مشروع: الدائرة خطية، فـ iT يتناسب مع vT مهما كانت القيمة. نرسم iT مقابل vT: الميل 1/RTh = 0.01.
vTs = linspace(-10, 10, 21);
iTs = vTs/25 + 20*(-3*vTs/2000);
plot(vTs, iTs, '-o'); grid on; xlabel('v_T (V)'); ylabel('i_T (A)'); title('Test source: slope = 1/R_{Th} = 0.01 S')
p = polyfit(vTs, iTs, 1); fprintf('slope = %g S\n', p(1))
