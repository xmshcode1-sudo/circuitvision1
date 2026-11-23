% Circuits 1 — Thevenin and Norton Equivalents
%title: Thevenin Equivalent: voc and isc
%ar-title: مكافئ ثيفنن: جهد الدائرة المفتوحة وتيار القصر
%lesson: c1-techniques-9
%course: circuits-1

%% The lecture example
%ar: الدائرة المفتوحة: (v1 − 25)/5 + v1/20 − 3 = 0 ← VTh = 32 V. القصر: (v2 − 25)/5 + v2/20 − 3 + v2/4 = 0 ← isc = v2/4 = 4 A.
VTh = (25/5 + 3) / (1/5 + 1/20);
v2 = (25/5 + 3) / (1/5 + 1/20 + 1/4);
isc = v2/4; RTh = VTh/isc;
fprintf('VTh = %g V, isc = %g A, RTh = %g ohm, Norton: %g A with %g ohm\n', VTh, isc, RTh, isc, RTh)
%check: abs(VTh - 32) < 1e-12 && abs(isc - 4) < 1e-12 && abs(RTh - 8) < 1e-12

%% Example 4.10 (dependent sources)
%ar: VTh = −500 i و i = (5 − 3 VTh)/2000 ← VTh = −5 V. القصر: i = 5/2000 و isc = −20 i ← RTh = 100 Ω.
VTh2 = (-500*5/2000) / (1 - 500*3/2000);
isc2 = -20 * 5/2000; RTh2 = VTh2/isc2;
fprintf('VTh = %g V, isc = %g mA, RTh = %g ohm\n', VTh2, isc2*1000, RTh2)
%check: abs(VTh2 + 5) < 1e-12 && abs(RTh2 - 100) < 1e-9

%%! Project idea: the load line
%ar: مشروع: مع أي حمل R يعطي المكافئ i = VTh/(RTh + R). نرسم الجهد مقابل التيار للحمل: خط مستقيم من VTh إلى isc.
R = logspace(-1, 3, 100);
iL = VTh ./ (RTh + R); vL = iL .* R;
plot(iL, vL); grid on; xlabel('load current (A)'); ylabel('load voltage (V)'); title('The Thevenin line: from v_{oc} = 32 V to i_{sc} = 4 A')
