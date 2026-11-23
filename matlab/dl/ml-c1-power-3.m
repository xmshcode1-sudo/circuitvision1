% Circuits 1 — The rms Value and Power Calculations
%title: rms Values and Average Power (Example 10.3)
%ar-title: القيم الفعالة والقدرة المتوسطة (مثال 10.3)
%lesson: c1-power-3
%course: circuits-1

%% Example 10.3, two ways
%ar: جهد عظمى 625 V على 50 Ω: (a) P = Vrms²/R، (b) Im = 625/50 ثم P = Irms²R. الطريقتان 3906.25 W.
Vm = 625; R = 50;
Pa = (Vm/sqrt(2))^2 / R;
Im = Vm/R; Pb = (Im/sqrt(2))^2 * R;
fprintf('Vrms = %.2f V, P = %.2f W; Irms = %.2f A, P = %.2f W\n', Vm/sqrt(2), Pa, Im/sqrt(2), Pb)

%% The rms value gives the same heat as DC
%ar: نحسب الطاقة في دورة للجهد الجيبي ولجهد DC يساوي Vrms: متساويتان.
w = 377; T = 2*pi/w; t = linspace(0, T, 20001);
E_ac = trapz(t, (Vm*cos(w*t)).^2 / R);
E_dc = (Vm/sqrt(2))^2 / R * T;
fprintf('energy per period: AC = %.4f J, DC at Vrms = %.4f J\n', E_ac, E_dc)

%%! Project idea: rms of other waveforms
%ar: مشروع: القيمة الفعالة تعتمد على شكل الموجة. نقارن الجيبية (Vm/√2) بالمربعة (Vm) والمثلثية (Vm/√3).
x = linspace(0, 1, 30001);
sine = sin(2*pi*x); square = sign(sin(2*pi*x)); tri = 2*abs(2*(x - floor(x + 0.5))) - 1;
r = [sqrt(mean(sine.^2)), sqrt(mean(square.^2)), sqrt(mean(tri.^2))];
fprintf('rms: sine %.4f, square %.4f, triangle %.4f (amplitude 1)\n', r)
bar(r); grid on; set(gca, 'xticklabel', {'sine', 'square', 'triangle'}); ylabel('rms (amplitude 1)'); title('rms depends on the waveform')
