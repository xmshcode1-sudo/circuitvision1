% Circuits 1 — The Sinusoidal Source
%title: The Sinusoidal Source: rms, Frequency, Phase
%ar-title: المصدر الجيبي: القيمة الفعالة والتردد والطور
%lesson: c1-sinusoidal-1
%course: circuits-1

%% The example: 220 V rms, 60 Hz
%ar: القمة Vm = √2 × Vrms، و ω = 2πf. نطبع القانون كاملًا كما نكتبه في الحل.
Vrms = 220; f = 60;
Vm = sqrt(2)*Vrms; w = 2*pi*f; T = 1/f;
fprintf('v(t) = %.0f cos(%.0f t) V,  T = %.3f ms\n', Vm, w, T*1e3)
%check: abs(Vm - 311.13) < 0.01 && abs(w - 376.99) < 0.01

%% Plot two periods and check the rms numerically
%ar: rms = جذر متوسط المربع. نحسبه عدديًا من العينات: sqrt(mean(v.^2)) على دورة كاملة، ويجب أن يعطي 220.
t = linspace(0, 2*T, 2001);
v = Vm*cos(w*t);
plot(t*1e3, v); grid on; xlabel('t (ms)'); ylabel('v (V)'); title('220 V rms, 60 Hz')
hold on; plot(t*1e3, Vrms*ones(size(t)), 'r--'); hold off; legend('v(t)', 'V_{rms}')
vr = sqrt(mean(v(1:1000).^2));
fprintf('numerical rms over one period = %.2f V\n', vr)
%check: abs(vr - 220) < 0.1

%% Phase: leading and lagging
%ar: cos(ωt + 60°) يتقدم على cos(ωt): يصل قمته قبله بزمن Δt = θ/ω. نحسب Δt بالمللي ثانية.
theta = 60;
dt = (theta*pi/180)/w;
fprintf('a 60 deg lead = %.3f ms earlier\n', dt*1e3)

%%! Project idea: a waveform analyser
%ar: مشروع: دالة تأخذ عينات إشارة (من راسم أو ملف) وترجع القمة والقيمة الفعالة والتردد. هنا نختبرها على إشارة نعرف جوابها.
[pk, rm, fr] = analyse(t, Vm*cos(w*t + 0.3) + 0*t);
fprintf('peak %.1f V, rms %.1f V, f %.1f Hz\n', pk, rm, fr)
%check: abs(fr - 60) < 0.5

function [pk, rm, fr] = analyse(t, x)
    pk = max(abs(x));
    rm = sqrt(mean(x.^2));
    s = sign(x); up = find(s(1:end-1) <= 0 & s(2:end) > 0);   % rising zero crossings
    fr = (numel(up) - 1) / (t(up(end)) - t(up(1)));
end
