% Signals and Systems — Complex Exponential and Sinusoidal Signals
%title: Complex Exponentials and Euler's Formula
%ar-title: الأسّيات المركّبة وصيغة أويلر
%lesson: ss-ch1-6
%course: signals-systems

%% Euler's formula, numerically
%ar: A cos(ω0 t + φ) = (A/2)e^{jφ}e^{jω0 t} + (A/2)e^{−jφ}e^{−jω0 t}. نتحقق نقطة نقطة. exp تقبل أسًا مركبًا.
A = 3; w0 = 5; phi = 0.4; t = linspace(0, 3, 500);
lhs = A*cos(w0*t + phi);
rhs = (A/2)*exp(1j*phi)*exp(1j*w0*t) + (A/2)*exp(-1j*phi)*exp(-1j*w0*t);
fprintf('max difference = %.2e, largest imaginary part = %.2e\n', max(abs(lhs - rhs)), max(abs(imag(rhs))))
%check: max(abs(lhs - rhs)) < 1e-12

%% The period of e^{j5t}
%ar: T0 = 2π/ω0. نرسم الجزأين الحقيقي (cos) والتخيلي (sin).
T0 = 2*pi/5;
fprintf('T0 = %.4f s\n', T0)
z = exp(1j*5*t);
plot(t, real(z), t, imag(z), '--'); grid on; xlabel('t'); legend('Re = cos 5t', 'Im = sin 5t'); title('e^{j5t}')
%check: abs(T0 - 1.2566) < 1e-4

%% Discrete time: w0 and w0 + 2pi are the same signal
%ar: في المتقطع: e^{j(ω0+2π)n} = e^{jω0 n} لكل n صحيح. هذا سبب أن ترددات المتقطع تكفيها فترة طولها 2π.
n = 0:20; w0 = 0.3;
d = max(abs(exp(1j*(w0 + 2*pi)*n) - exp(1j*w0*n)));
fprintf('max |e^{j(w0+2pi)n} - e^{jw0 n}| = %.2e\n', d)
%check: d < 1e-12

%%! Project idea: the growing/decaying spiral
%ar: مشروع بصري: e^{(σ + jω)t} حلزون في المستوى المركب. plot3 يرسمه مع الزمن: σ سالبة ⇐ يتلاشى، موجبة ⇐ يكبر. هذه هي الأقطاب التي ستراها في لابلاس.
t = linspace(0, 6, 1500); s = -0.3 + 4j;
z = exp(s*t);
figure; plot3(t, real(z), imag(z)); grid on; xlabel('t'); ylabel('Re'); zlabel('Im'); title('e^{(-0.3 + j4)t}'); view(35, 25)
