% Circuits 1 — Voltage and Current
%title: Charge, Current and Voltage
%ar-title: الشحنة والتيار والجهد في MATLAB
%lesson: c1-variables-2
%course: circuits-1

%% Example 1: current from charge and time
%ar: I = Q/t. أول خطوة دائمًا: الوحدات بالنظام الدولي. الدقيقة 60 ثانية.
Q = 120; t = 60;
I = Q / t;
fprintf('I = %g A\n', I)

%% Example 2: current is the derivative of charge
%ar: q(t) = 20(1 − e^(−5t)) mC. التيار i = dq/dt. نشتقها يدويًا: i = 100 e^(−5t) mA، ثم نتأكد عدديًا بالفرق المحدود diff.
t = linspace(0, 1, 2001);
q = 20e-3*(1 - exp(-5*t));            % C
i_exact = 100e-3*exp(-5*t);           % A
i_num = diff(q) ./ diff(t);           % numerical derivative
fprintf('i(0) exact = %.1f mA, numerical = %.1f mA\n', i_exact(1)*1e3, i_num(1)*1e3)
fprintf('largest difference = %.3f mA\n', max(abs(i_num - i_exact(1:end-1)))*1e3)

%% Plot charge and current
%ar: subplot يضع الشحنة فوق التيار: التيار أكبر ما يكون عند البداية لأن الشحنة تتغير أسرع ما يمكن.
subplot(2,1,1); plot(t, q*1e3); grid on; ylabel('q (mC)'); title('q(t) = 20(1 - e^{-5t}) mC')
subplot(2,1,2); plot(t, i_exact*1e3); grid on; ylabel('i (mA)'); xlabel('t (s)'); title('i = dq/dt')

%% Example 3: voltage from energy and charge
%ar: V = W/Q: 20 J لنقل 4 C تعني 5 V.
W = 20; Q = 4;
fprintf('V = %g V\n', W/Q)

%%! Project idea: charge counter for a battery
%ar: مشروع: بطارية جوال 4000 mAh. كم كولوم تخزن؟ وكم ساعة تكفي لو سحب الجوال تيارًا متغيرًا؟ نجمع التيار عبر الزمن بـ trapz (التكامل العددي).
cap_C = 4000e-3 * 3600;                       % 4000 mAh in coulombs
fprintf('4000 mAh = %g C\n', cap_C)
th = 0:0.5:24;                                % hours
i_use = 0.15 + 0.35*(th >= 8 & th <= 22);     % A: 150 mA idle, 500 mA in use
used = trapz(th*3600, i_use);                 % C used in 24 h
fprintf('charge used in 24 h = %.0f C (%.0f%% of the battery)\n', used, used/cap_C*100)
