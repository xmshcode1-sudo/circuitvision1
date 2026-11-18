% Circuits 1 — Kirchhoff's Laws in the Frequency Domain
%title: KVL with Phasors
%ar-title: قانون كيرشوف للجهد بالفازورات
%lesson: c1-sinusoidal-4
%course: circuits-1

%% Add the phasors, not the magnitudes
%ar: VR = 60∠0° و VL = 80∠90°. جهد المصدر = مجموعهما كأعداد مركبة: 100∠53.13°، وليس 140.
VR = 60; VL = 80j;
V = VR + VL;
fprintf('V = %g at %.2f deg (sum of magnitudes would be %g)\n', abs(V), angle(V)*180/pi, abs(VR) + abs(VL))

%% The same in the time domain
%ar: KVL صحيح عند كل لحظة: vR(t) + vL(t) = v(t). نرسم الثلاثة ونتحقق.
w = 2*pi*50; t = linspace(0, 0.04, 800);
vR = 60*cos(w*t); vL = 80*cos(w*t + pi/2); v = abs(V)*cos(w*t + angle(V));
plot(t*1e3, vR, t*1e3, vL, t*1e3, vR + vL, t*1e3, v, '--'); grid on
xlabel('t (ms)'); ylabel('V'); legend('v_R', 'v_L', 'v_R + v_L', 'v'); title('KVL at every instant')
fprintf('largest error = %g V\n', max(abs(vR + vL - v)))

%%! Project idea: what a voltmeter shows
%ar: الفولتميتر يقرأ القيمة الفعالة لكل جهد على حدة، فمجموع القراءات لا يساوي قراءة المصدر. اطبع ما ستقرأه في المعمل لتتوقع النتيجة قبل القياس.
fprintf('meter readings (rms): VR = %.2f, VL = %.2f, V = %.2f V\n', 60/sqrt(2), 80/sqrt(2), 100/sqrt(2))
