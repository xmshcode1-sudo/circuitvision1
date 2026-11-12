/* CircuitVision — Vercel Routing Middleware that serves the two server endpoints
   POST /api/tutor and POST /api/recognize (see the handlers below, unchanged from api/*.js).
   This copy keeps every file in one folder so it can be uploaded to GitHub from an iPad. */
const tutor = (function () {
  const module = { exports: {} };
/* CircuitVision — AI Tutor (Vercel serverless function).
   POST /api/tutor  { messages: [{ role: "user"|"tutor", text }], context?: { title, problem, facts, attempt } }
   → 200 { reply: "…" }
   The tutor explains and asks guiding questions. It must NOT produce numerical results of its own:
   every number about the current problem comes from `context.facts`, which the page builds from the
   circuit engine's solution. Environment variables (Vercel → Project → Settings → Environment Variables):
     GEMINI_API_KEY   required
     GEMINI_MODEL     optional, default "gemini-flash-latest" */

const MAX_MSG = 12, MAX_CHARS = 6000;
const hits = new Map(); // per-IP limit for this instance: 20 requests / minute

const SYSTEM = [
  "أنت «المعلم الذكي» في منصة CircuitVision لتعليم الدوائر الكهربائية (Circuits 1) لطلاب جامعيين. تكتب بالعربية الفصحى المبسطة، والمصطلحات التقنية بالإنجليزية بين قوسين عند أول ذكر.",
  "أسلوبك سقراطي: افهم أين توقف الطالب، ثم أعطه خطوة واحدة أو سؤالًا موجّهًا، لا الحل الكامل، إلا إذا طلب الحل صراحة بعد أن حاول.",
  "قاعدة صارمة: لا تحسب ولا تخترع أي رقم أو نتيجة عن المسألة الحالية. الأرقام الصحيحة الوحيدة هي الموجودة في «حقائق المحرك». إذا احتجت رقمًا غير موجود فيها فاطلب من الطالب حسابه أو قل إنك لا تستطيع التحقق منه.",
  "لا تعتمد على أرقام يكتبها الطالب كأنها صحيحة؛ قارنها بحقائق المحرك إن وُجدت، وإلا فقل إنها تحتاج تحققًا.",
  "لا تنسب أي مسألة أو رقم لكتاب (Nilsson أو Sadiku) إلا إذا كان ذلك مذكورًا في السياق.",
  "إذا سُئلت عن شيء خارج الدوائر الكهربائية والدراسة فاعتذر بلطف في جملة واحدة وارجع للموضوع.",
  "اختصر: من 2 إلى 6 جمل عادةً. اكتب المعادلات كنص بسيط مثل v = iR و Z_C = −j/(ωC)."
].join("\n");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "استخدم POST." }); }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "المعلم الذكي غير مفعّل: أضف GEMINI_API_KEY في إعدادات Vercel." });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 20) return res.status(429).json({ error: "رسائل كثيرة. انتظر دقيقة." });
  list.push(now); hits.set(ip, list);

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-MAX_MSG) : [];
  if (!msgs.length || msgs.some((m) => typeof m.text !== "string")) return res.status(400).json({ error: "رسالة غير صالحة." });
  const ctx = body.context || {};
  let ctxText = "";
  if (ctx.title || ctx.problem || ctx.facts) {
    ctxText = "\n\nسياق الطالب الآن:" +
      (ctx.title ? "\nالموضوع: " + String(ctx.title).slice(0, 200) : "") +
      (ctx.problem ? "\nالمسألة: " + String(ctx.problem).slice(0, 1500) : "") +
      (ctx.facts ? "\nحقائق المحرك (محسوبة وصحيحة؛ لا تكشف الإجابة النهائية إلا إذا طلبها الطالب بعد محاولة):\n" + String(ctx.facts).slice(0, 2500) : "") +
      (ctx.attempt ? "\nآخر محاولة للطالب وتشخيص Smart Feedback: " + String(ctx.attempt).slice(0, 500) : "");
  }
  let total = 0;
  const contents = msgs.map((m) => { const t = String(m.text).slice(0, 1500); total += t.length; return { role: m.role === "tutor" ? "model" : "user", parts: [{ text: t }] }; });
  if (total > MAX_CHARS) return res.status(413).json({ error: "المحادثة طويلة جدًا. ابدأ محادثة جديدة." });

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  try {
    const r = await callGemini(model, key, { systemInstruction: { parts: [{ text: SYSTEM + ctxText }] }, contents, generationConfig: { temperature: 0.3, maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: "low" } } });
    if (r.status === 429) return res.status(429).json({ error: "وصل المعلم لحد الاستخدام المجاني مؤقتًا. حاول بعد دقيقة." });
    if (!r.ok) return res.status(502).json({ error: "تعذّر الوصول للمعلم الآن. حاول مرة أخرى." });
    const j = await r.json();
    const text = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts.filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
    if (!text) return res.status(502).json({ error: "لم يصل رد من المعلم. أعد صياغة سؤالك." });
    return res.status(200).json({ reply: text });
  } catch (e) {
    if (e && e.name === "AbortError") return res.status(504).json({ error: "المعلم تأخر في الرد. أعد إرسال سؤالك." });
    return res.status(502).json({ error: "تعذّر الوصول للمعلم الآن." });
  }
};

/* Calls Gemini with a 20 s limit (the platform cuts the request at ~25 s). If the model rejects thinkingConfig,
   retries once without it. Logs Google's status and message for debugging; the key is never logged. */
async function callGemini(model, key, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  async function once(b) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
    try { return await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(b), signal: ctl.signal }); }
    finally { clearTimeout(t); }
  }
  let r = await once(body);
  if (r.status === 400 && body.generationConfig && body.generationConfig.thinkingConfig) {
    const msg = await r.clone().text().catch(() => "");
    if (/thinking/i.test(msg)) { const b2 = JSON.parse(JSON.stringify(body)); delete b2.generationConfig.thinkingConfig; r = await once(b2); }
  }
  if (!r.ok) { const msg = await r.clone().text().catch(() => ""); console.error("gemini", model, r.status, msg.slice(0, 300)); }
  return r;
}

function safeJson(s) { try { return JSON.parse(s); } catch (e) { return {}; } }

  return module.exports;
})();
const recognize = (function () {
  const module = { exports: {} };
/* CircuitVision — handwriting / notebook-photo transcription (Vercel serverless function).
   POST /api/recognize  { mime: "image/jpeg", image: "<base64>", context?: "<problem text>" }
   → 200 { lines: ["i₁ = 30/15 = 2 A", …], unreadable: false }
   The model ONLY transcribes what the student wrote. It must not solve, correct or judge;
   checking is done on the page by mathcheck.js and the Smart Feedback engine.
   Environment variables (Vercel → Project → Settings → Environment Variables):
     GEMINI_API_KEY   required
     GEMINI_MODEL     optional, default "gemini-flash-latest" (any Gemini model that accepts images) */

const MAX_B64 = 4 * 1024 * 1024; // keep under Vercel's 4.5 MB request limit
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const hits = new Map(); // simple per-IP limit for this instance: 12 requests / minute

const PROMPT = [
  "You are transcribing a university student's handwritten electrical-circuits solution.",
  "Transcribe EXACTLY what is written, line by line, even if it is wrong. Do not solve, complete, fix or comment.",
  "Write math as plain text with Unicode: × for multiplication, / for division, ² ³ for powers, subscripts like R₁ i₂ vₓ,",
  "Ω for ohms, µ for micro, ∥ for parallel, √ for square root, − for minus. Keep units and SI prefixes as written (mA, kΩ, V).",
  "Keep Arabic words as Arabic. One array item per written line, top to bottom. Skip crossed-out text.",
  "If the image has no readable handwriting, return an empty list and unreadable=true."
].join(" ");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "استخدم POST." }); }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "خدمة التعرف غير مفعّلة: أضف GEMINI_API_KEY في إعدادات Vercel." });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 12) return res.status(429).json({ error: "طلبات كثيرة. حاول بعد دقيقة." });
  list.push(now); hits.set(ip, list);

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const { mime, image, context } = body;
  if (!ALLOWED.includes(mime) || typeof image !== "string" || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    return res.status(400).json({ error: "أرسل صورة JPG أو PNG أو WebP." });
  }
  if (image.length > MAX_B64) return res.status(413).json({ error: "الصورة كبيرة جدًا. صوّر جزءًا أصغر من الصفحة." });

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const payload = {
    contents: [{ role: "user", parts: [
      { text: PROMPT + (context ? " The problem the student is solving (for reading ambiguous symbols only): " + String(context).slice(0, 600) : "") },
      { inline_data: { mime_type: mime, data: image } }
    ] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingLevel: "low" },
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties: { lines: { type: "ARRAY", items: { type: "STRING" } }, unreadable: { type: "BOOLEAN" } }, required: ["lines", "unreadable"] }
    }
  };

  try {
    const r = await callGemini(model, key, payload);
    if (r.status === 429) return res.status(429).json({ error: "وصلت خدمة التعرف لحدها المجاني مؤقتًا. حاول بعد دقيقة." });
    if (!r.ok) return res.status(502).json({ error: "تعذّر التعرف على الكتابة الآن. حاول مرة أخرى." });
    const j = await r.json();
    const text = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
    const out = safeJson(text) || {};
    const lines = Array.isArray(out.lines) ? out.lines.map((l) => String(l).slice(0, 300)).slice(0, 60) : [];
    return res.status(200).json({ lines, unreadable: !!out.unreadable || !lines.length });
  } catch (e) {
    return res.status(502).json({ error: "تعذّر الاتصال بخدمة التعرف. حاول مرة أخرى." });
  }
};

/* Calls Gemini with a 20 s limit (the platform cuts the request at ~25 s). If the model rejects thinkingConfig,
   retries once without it. Logs Google's status and message for debugging; the key is never logged. */
async function callGemini(model, key, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  async function once(b) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
    try { return await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(b), signal: ctl.signal }); }
    finally { clearTimeout(t); }
  }
  let r = await once(body);
  if (r.status === 400 && body.generationConfig && body.generationConfig.thinkingConfig) {
    const msg = await r.clone().text().catch(() => "");
    if (/thinking/i.test(msg)) { const b2 = JSON.parse(JSON.stringify(body)); delete b2.generationConfig.thinkingConfig; r = await once(b2); }
  }
  if (!r.ok) { const msg = await r.clone().text().catch(() => ""); console.error("gemini", model, r.status, msg.slice(0, 300)); }
  return r;
}

function safeJson(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  return module.exports;
})();

export const config = { matcher: ["/api/:path*"] };

export default async function middleware(request) {
  const url = new URL(request.url);
  const handler = url.pathname === "/api/tutor" ? tutor : url.pathname === "/api/recognize" ? recognize : null;
  if (!handler) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json; charset=utf-8" } });
  let body = {};
  if (request.method === "POST") { try { body = await request.json(); } catch (e) { body = {}; } }
  const req = { method: request.method, headers: { "x-forwarded-for": request.headers.get("x-forwarded-for") || "" }, body };
  const headers = {};
  const res = {
    code: 200,
    status(c) { this.code = c; return this; },
    setHeader(k, v) { headers[k] = v; },
    json(o) { return new Response(JSON.stringify(o), { status: this.code, headers: Object.assign({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }, headers) }); }
  };
  return handler(req, res);
}
