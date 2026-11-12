/* CircuitVision — small pictures of the real parts, shown on the lab's part buttons so the student finds a part by its look. */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  var leg = '<path d="M2 12 H9 M31 12 H38" stroke="#b7c0cc" stroke-width="1.6" stroke-linecap="round"/>';
  var P = {
    select: '<path d="M14 4 L14 20 L18 16 L21 22 L24 21 L21 15 L26 15 Z" fill="currentColor"/>',
    W: '<path d="M4 18 C12 2, 26 22, 36 6" stroke="#ff8a2b" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="4" cy="18" r="2.2" fill="#c9d2de"/><circle cx="36" cy="6" r="2.2" fill="#c9d2de"/>',
    R: leg + '<rect x="9" y="7.5" width="22" height="9" rx="4.5" fill="#d9c49a"/><rect x="13" y="7.5" width="2.2" height="9" fill="#c0392b"/><rect x="17" y="7.5" width="2.2" height="9" fill="#c0392b"/><rect x="21" y="7.5" width="2.2" height="9" fill="#7a4a21"/><rect x="26" y="7.5" width="2" height="9" fill="#c9a227"/>',
    LED: '<path d="M17 18 V23 M23 18 V23" stroke="#b7c0cc" stroke-width="1.6" stroke-linecap="round"/><path d="M13 18 V10 A7 7 0 0 1 27 10 V18 Z" fill="#ff4d4d" opacity=".9"/><rect x="12" y="17" width="16" height="2.4" rx="1" fill="#e03b3b"/><path d="M16 9 A4 4 0 0 1 20 6" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/>',
    C: '<path d="M17 19 V23 M23 19 V23" stroke="#b7c0cc" stroke-width="1.6" stroke-linecap="round"/><rect x="13" y="2" width="14" height="17" rx="2.5" fill="#2f5fb3"/><rect x="22" y="2" width="3" height="17" fill="#c9d6ef" opacity=".8"/><path d="M23.5 6 v1.6 M23.5 11 v1.6" stroke="#2f5fb3" stroke-width="1.2"/>',
    L: leg + '<rect x="9" y="8" width="22" height="8" rx="2" fill="#5a3b1a"/><path d="M11 8 v8 M14 8 v8 M17 8 v8 M20 8 v8 M23 8 v8 M26 8 v8 M29 8 v8" stroke="#d68a3a" stroke-width="1.6"/>',
    LDR: '<path d="M17 19 V23 M23 19 V23" stroke="#b7c0cc" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="10" r="8.5" fill="#e7d7b0"/><path d="M14 7 H25 V9.5 H15 V12 H25 V14" stroke="#b03a2e" stroke-width="1.3" fill="none"/>',
    NTC: '<path d="M18 13 L16 23 M22 13 L24 23" stroke="#b7c0cc" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="20" cy="9" rx="6" ry="6.5" fill="#1d1d1d"/><path d="M17.5 7 A3 3 0 0 1 20 5" stroke="#777" stroke-width="1.1" fill="none"/>',
    BAT: '<rect x="5" y="6" width="27" height="12" rx="2" fill="#1f2937"/><rect x="5" y="6" width="9" height="12" rx="2" fill="#c9a227"/><rect x="32" y="9.5" width="3" height="5" rx="1" fill="#b7c0cc"/><path d="M24 12 h4 M26 10 v4" stroke="#fff" stroke-width="1.3"/>',
    SW: '<path d="M10 20 V23 M30 20 V23 M10 4 V1 M30 4 V1" stroke="#b7c0cc" stroke-width="1.6" stroke-linecap="round"/><rect x="8" y="3" width="24" height="18" rx="2" fill="#2b2f36"/><circle cx="20" cy="12" r="5.5" fill="#111" stroke="#555"/>',
    LAMP: '<path d="M16 17 h8 v3 h-8 z" fill="#9aa4b1"/><path d="M14 11 A6 6 0 1 1 26 11 C26 14 24 15 24 17 H16 C16 15 14 14 14 11 Z" fill="#ffe08a" opacity=".95"/><path d="M18 17 L19 11 L21 13 L22 11 L22 17" stroke="#a87b1d" stroke-width=".9" fill="none"/><path d="M18 21 V23 M22 21 V23" stroke="#b7c0cc" stroke-width="1.6"/>',
    PIR: '<rect x="7" y="13" width="26" height="9" rx="1.5" fill="#1d6b3a"/><path d="M12 14 A8 8 0 0 1 28 14 Z" fill="#f3f3f3"/><path d="M14 13 l2 -3 M19 13 v-4 M24 13 l-2 -3" stroke="#cfcfcf" stroke-width=".8"/>',
    AM: '<rect x="6" y="2" width="28" height="20" rx="2" fill="#e9edf2" stroke="#7a8696"/><path d="M10 16 A10 10 0 0 1 30 16" stroke="#7a8696" stroke-width="1" fill="none"/><path d="M20 17 L26 8" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/><text x="17" y="21.2" font-size="5" font-family="monospace" fill="#333">A</text>',
    DEP: '<rect x="6" y="3" width="28" height="18" rx="2" fill="#24324f" stroke="#3fb6ff"/><path d="M20 6 L26 12 L20 18 L14 12 Z" stroke="#3fb6ff" stroke-width="1.5" fill="none"/><path d="M20 9 v6 M17 12 h6" stroke="#ff8a2b" stroke-width="1.2"/>',
    DEL: '<path d="M8 17 L19 6 L30 17 L25 22 H13 Z" fill="#f08aa6"/><path d="M13.5 11.5 L24.5 22" stroke="#fff" stroke-width="1.4" opacity=".8"/><path d="M6 22.5 H34" stroke="currentColor" stroke-width="1" opacity=".5"/>'
  };
  CV.partIcon = function (k) {
    return P[k] ? '<svg class="pi" viewBox="0 0 40 24" width="40" height="24" aria-hidden="true">' + P[k] + '</svg>' : "";
  };
})();
