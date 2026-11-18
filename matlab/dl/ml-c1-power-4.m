% Circuits 1 — Complex Power
%title: Complex Power S = V I* / 2
%ar-title: القدرة المركبة
%lesson: c1-power-4
%course: circuits-1

%% The example
%ar: S = ½ V I* بقيم القمة (أو Vrms Irms* بالقيم الفعالة). conj يعطي المرافق. الجزء الحقيقي P والتخيلي Q.
V = 100*exp(1j*36.87*pi/180); I = 4;
S = 0.5*V*conj(I);
fprintf('S = %.2f%+.2fj VA = %.1f at %.2f deg\n', real(S), imag(S), abs(S), angle(S)*180/pi)
fprintf('pf = %.3f (lagging because Q > 0)\n', cos(angle(S)))

%% The same from the impedance
%ar: Z = V/I، ثم S = ½|I|² Z: نفس النتيجة. هذه الصيغة أسهل إذا عرفت التيار والحمل.
Z = V/I;
S2 = 0.5*abs(I)^2*Z;
fprintf('Z = %.2f%+.2fj ohm, S = %.2f%+.2fj VA\n', real(Z), imag(Z), real(S2), imag(S2))

%%! Project idea: total power of several loads
%ar: مشروع: S الكلية = مجموع S لكل حمل (P و Q يجمعان جبريًا). ثلاثة أحمال على نفس الجهد، واطبع معامل القدرة الكلي.
Vrms = 220; Zs = [10 + 5j, 20, 15 - 8j];
Sk = Vrms^2 ./ conj(Zs);
St = sum(Sk);
fprintf('load %d: %.1f%+.1fj VA\n', [1:3; real(Sk); imag(Sk)])
fprintf('total: %.1f%+.1fj VA, pf = %.3f\n', real(St), imag(St), cos(angle(St)))
