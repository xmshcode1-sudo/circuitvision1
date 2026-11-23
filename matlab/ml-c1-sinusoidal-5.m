% Circuits 1 — Series, Parallel, and Delta-to-Wye Simplifications
%title: Admittances in Parallel (Example 9.7) and Delta-to-Wye (Example 9.8)
%ar-title: المسامحات على التوازي (مثال 9.7) ودلتا إلى واي (مثال 9.8)
%lesson: c1-sinusoidal-5
%course: circuits-1

%% Example 9.7
%ar: ثلاثة فروع على التوازي مع 8∠0° A: 10 Ω، و 6 + j8، و −j5. نجمع المسامحات ثم V = I/Y.
Zb = [10, 6 + 8j, -5j];
Y = sum(1 ./ Zb); V = 8/Y; Ib = V ./ Zb;
fprintf('Y = %g %+gj S, V = %g at %.2f deg V\n', real(Y), imag(Y), abs(V), angle(V)*180/pi)
for k = 1:3, fprintf('I%d = %g at %.2f deg A\n', k, abs(Ib(k)), angle(Ib(k))*180/pi); end
%check: abs(Y - (0.16 + 0.12j)) < 1e-12 && abs(abs(V) - 40) < 1e-9 && abs(abs(Ib(3)) - 8) < 1e-9

%% Example 9.8
%ar: الدلتا 10 و 20 + j60 و −j20 (مجموعها 30 + j40) إلى Y، ثم Z = 12 ∥ 60 + 8 − j24 و Io = 120/Z.
Zbc = 10; Zbd = 20 + 60j; Zcd = -20j; Sd = Zbc + Zbd + Zcd;
Z1 = Zbd*Zbc/Sd; Z2 = Zbc*Zcd/Sd; Z3 = Zbd*Zcd/Sd;
Zabn = -4j + Z1; Zacn = 63.2 + 2.4j + Z2;
Z = Zabn*Zacn/(Zabn + Zacn) + Z3; Io = 120/Z;
fprintf('Z1 = %g%+gj, Z2 = %g%+gj, Z3 = %g%+gj\nZ = %g%+gj, Io = %g%+gj A\n', real(Z1), imag(Z1), real(Z2), imag(Z2), real(Z3), imag(Z3), real(Z), imag(Z), real(Io), imag(Io))
%check: abs(Z - (18 - 24j)) < 1e-9 && abs(Io - (2.4 + 3.2j)) < 1e-9

%%! Project idea: currents in the time domain
%ar: مشروع: نرسم تيارات مثال 9.7 الثلاثة ومجموعها: المجموع يساوي تيار المصدر 8 cos(200000t).
w = 2e5; t = linspace(0, 2*2*pi/w, 600); tf = @(P) abs(P)*cos(w*t + angle(P));
plot(t*1e6, tf(Ib(1)), t*1e6, tf(Ib(2)), t*1e6, tf(Ib(3)), t*1e6, tf(Ib(1))+tf(Ib(2))+tf(Ib(3)), 'k--'); grid on
xlabel('t (\mus)'); ylabel('i (A)'); legend('i_1', 'i_2', 'i_3', 'sum = i_s'); title('Example 9.7: KCL in the time domain')
