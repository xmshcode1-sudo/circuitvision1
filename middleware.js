/* CircuitVision — Vercel Routing Middleware that serves the server endpoints
   POST /api/tutor, /api/recognize, /api/pay-verify and /api/moyasar-webhook (see the handlers below, unchanged from api/*.js).
   This copy keeps every file in one folder so it can be uploaded to GitHub from an iPad. */
const __mods = {};
function require(p) { const m = __mods[p.replace(/^\.\//, "")]; if (!m) throw new Error("module " + p); return m; }
const lib = (function () {
  const module = { exports: {} };
/* CircuitVision — shared server helpers for the /api endpoints (not an endpoint itself: files starting with "_" are not routed).
   Who is calling: the page sends the student's Supabase access token as "Authorization: Bearer <token>";
   getUser() asks Supabase Auth to validate it, so a forged token gets nothing.
   Privileged database calls use SUPABASE_SERVICE_ROLE_KEY (or the new sb_secret_… key) from the Vercel
   environment. It never reaches the browser.
   Environment variables (Vercel → Project → Settings → Environment Variables):
     SUPABASE_SERVICE_ROLE_KEY   required for payments and for checking subscriptions
     SUPABASE_URL, SUPABASE_ANON_KEY   optional, default to the public values in js/config.js */

const SB_URL = process.env.SUPABASE_URL || "https://lftrvtaopymlqgdcsjdv.supabase.co";
const SB_ANON = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdHJ2dGFvcHltbHFnZGNzamR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0ODExOTIsImV4cCI6MjExMDA1NzE5Mn0.LCYboIYos-PD8hMEhQUnQ3lXTEE9sUw0pWnFpshePpQ";

function header(req, name) {
  const h = req.headers || {};
  if (typeof h.get === "function") return h.get(name) || "";
  return h[name] || h[name.toLowerCase()] || "";
}
function serviceKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""; }
function serviceHeaders() {
  const k = serviceKey(), h = { apikey: k, "Content-Type": "application/json" };
  if (/^eyJ/.test(k)) h.Authorization = "Bearer " + k;      // legacy service_role JWT; the new sb_secret_ keys go in apikey only
  return h;
}
async function timed(url, opts, ms) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 8000);
  try { return await fetch(url, Object.assign({}, opts, { signal: ctl.signal })); } finally { clearTimeout(t); }
}

/* → { id, email, … } for a valid session, or null */
async function getUser(req) {
  const m = /^Bearer\s+(.+)$/i.exec(header(req, "authorization"));
  if (!m) return null;
  try {
    const r = await timed(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, Authorization: "Bearer " + m[1] } });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? u : null;
  } catch (e) { return null; }
}

async function rpc(name, args) {
  if (!serviceKey()) throw new Error("no service key");
  const r = await timed(SB_URL + "/rest/v1/rpc/" + name, { method: "POST", headers: serviceHeaders(), body: JSON.stringify(args || {}) });
  const text = await r.text();
  if (!r.ok) { console.error("rpc", name, r.status, text.slice(0, 300)); throw new Error("rpc " + r.status); }
  return text ? JSON.parse(text) : null;
}
async function select(path) {
  if (!serviceKey()) throw new Error("no service key");
  const r = await timed(SB_URL + "/rest/v1/" + path, { headers: serviceHeaders() });
  if (!r.ok) { console.error("select", path.split("?")[0], r.status); throw new Error("select " + r.status); }
  return r.json();
}

/* Gate for the AI endpoints. course = null → any signed-in, unblocked student; otherwise an active subscription
   to that course (or the course is free, or the caller is the admin). Without the service key only sign-in is checked,
   and the missing key is logged, so the AI keeps working while the owner finishes the setup. */
async function requireStudent(req, res, course) {
  const user = await getUser(req);
  if (!user) { res.status(401).json({ error: "سجّل الدخول أولًا لاستخدام هذه الخدمة.", code: "login" }); return null; }
  if (!serviceKey()) { console.error("SUPABASE_SERVICE_ROLE_KEY missing: subscriptions are not checked"); return user; }
  try {
    const p = await select("profiles?select=blocked,approval&id=eq." + encodeURIComponent(user.id));
    const admin = await rpc("has_access", { p_user: user.id, p_course: "__admin_check__" });   // true only for the admin (no such course)
    if (!admin) {
      if (p[0] && p[0].blocked) { res.status(403).json({ error: "حسابك موقوف. تواصل مع إدارة المنصة.", code: "blocked" }); return null; }
      if (!p[0] || p[0].approval !== "approved") { res.status(403).json({ error: "حسابك بانتظار موافقة الإدارة.", code: "pending" }); return null; }
    }
    if (course && !(await rpc("has_access", { p_user: user.id, p_course: course }))) {
      res.status(403).json({ error: "هذه الخدمة للمشتركين في المقرر. اشترك من صفحة الاشتراك.", code: "subscribe", course }); return null;
    }
  } catch (e) { res.status(503).json({ error: "تعذّر التحقق من اشتراكك الآن. حاول بعد قليل." }); return null; }
  return user;
}

function safeJson(s) { try { return JSON.parse(s); } catch (e) { return {}; } }

module.exports = { SB_URL, header, getUser, rpc, select, serviceKey, requireStudent, timed, safeJson };

  return module.exports;
})();
__mods["_lib.js"] = lib;
const payVerify = (function () {
  const module = { exports: {} };
/* CircuitVision — confirm a Moyasar payment and open the course (Vercel serverless function).
   POST /api/pay-verify  { id: "<moyasar payment id>" }   with  Authorization: Bearer <student access token>
   → 200 { ok: true, course, ends_at }
   The browser's word is never trusted: the payment is fetched from Moyasar with the secret key, and it must be
   "paid", in SAR, for exactly the course price in the database, and created for this student (metadata.user_id).
   Recording is idempotent (the payment id is unique), so a refresh or the webhook arriving first is harmless.
   Environment variables:
     MOYASAR_SECRET_KEY          required (sk_test_… while testing, sk_live_… for real money)
     SUPABASE_SERVICE_ROLE_KEY   required */

const L = require("./_lib.js");

async function verifyAndRecord(paymentId, expectUser) {
  const sk = process.env.MOYASAR_SECRET_KEY;
  if (!sk) return { status: 503, body: { error: "الدفع غير مفعّل بعد: أضف MOYASAR_SECRET_KEY في إعدادات Vercel." } };
  if (!L.serviceKey()) return { status: 503, body: { error: "الدفع غير مفعّل بعد: أضف SUPABASE_SERVICE_ROLE_KEY في إعدادات Vercel." } };
  if (typeof paymentId !== "string" || !/^[A-Za-z0-9_-]{6,80}$/.test(paymentId)) return { status: 400, body: { error: "رقم عملية غير صالح." } };

  let p;
  try {
    const auth = "Basic " + btoa(sk + ":");
    const r = await L.timed("https://api.moyasar.com/v1/payments/" + encodeURIComponent(paymentId), { headers: { Authorization: auth } }, 10000);
    if (r.status === 404) return { status: 404, body: { error: "لم نجد هذه العملية عند ميسّر." } };
    if (!r.ok) { console.error("moyasar fetch", r.status); return { status: 502, body: { error: "تعذّر التحقق من الدفع الآن. حاول بعد قليل." } }; }
    p = await r.json();
  } catch (e) { return { status: 504, body: { error: "تأخر ميسّر في الرد. حدّث الصفحة بعد قليل." } }; }

  const meta = p.metadata || {}, course = String(meta.course_id || ""), user = String(meta.user_id || "");
  if (p.status !== "paid") return { status: 402, body: { error: p.status === "failed" ? "لم تكتمل عملية الدفع" + (p.source && p.source.message ? ": " + p.source.message : ".") : "العملية لم تُدفع بعد (الحالة: " + p.status + ").", code: p.status } };
  if (!user || (expectUser && user !== expectUser)) return { status: 403, body: { error: "هذه العملية لا تخص حسابك." } };
  if (p.currency !== "SAR") return { status: 400, body: { error: "عملة غير متوقعة." } };

  let courses;
  try { courses = await L.select("courses?select=id,price_halalas,is_paid&id=eq." + encodeURIComponent(course)); }
  catch (e) { return { status: 503, body: { error: "تعذّر الوصول لقاعدة البيانات. حاول بعد قليل." } }; }
  const c = courses[0];
  if (!c) return { status: 400, body: { error: "مقرر غير معروف في العملية." } };
  if (p.amount !== c.price_halalas) { console.error("amount mismatch", paymentId, p.amount, c.price_halalas); return { status: 400, body: { error: "مبلغ العملية لا يطابق سعر المقرر. تواصل مع الإدارة." } }; }

  try {
    const out = await L.rpc("record_payment", { p_payment: p.id, p_user: user, p_course: c.id, p_amount: p.amount, p_currency: p.currency, p_live: /^sk_live_/.test(sk) });
    return { status: 200, body: { ok: true, course: c.id, ends_at: out && out.ends_at, already: !!(out && out.already) } };
  } catch (e) { return { status: 503, body: { error: "تم الدفع لكن تعذّر تفعيل الاشتراك الآن. حدّث الصفحة بعد قليل؛ العملية محفوظة عند ميسّر." } }; }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "استخدم POST." }); }
  const user = await L.getUser(req);
  if (!user) return res.status(401).json({ error: "سجّل الدخول أولًا." });
  const body = typeof req.body === "string" ? L.safeJson(req.body) : req.body || {};
  const out = await verifyAndRecord(body.id, user.id);
  return res.status(out.status).json(out.body);
};
module.exports.verifyAndRecord = verifyAndRecord;

  return module.exports;
})();
__mods["pay-verify.js"] = payVerify;
const webhook = (function () {
  const module = { exports: {} };
/* CircuitVision — Moyasar webhook (Vercel serverless function).
   POST /api/moyasar-webhook   (set this URL in Moyasar Dashboard → Webhooks, event "payment_paid",
   with a secret token of your choice that you also put in Vercel as MOYASAR_WEBHOOK_SECRET)
   It opens the course even if the student closed the page before returning from the bank.
   The body is used only to learn the payment id: the payment itself is fetched again from Moyasar and checked
   by the same code as /api/pay-verify. */

const L = require("./_lib.js");
const PV = require("./pay-verify.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "POST only" }); }
  const secret = process.env.MOYASAR_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: "webhook not configured" });
  const body = typeof req.body === "string" ? L.safeJson(req.body) : req.body || {};
  if (!body.secret_token || body.secret_token !== secret) return res.status(401).json({ error: "bad token" });
  if (body.type !== "payment_paid" || !body.data || !body.data.id) return res.status(200).json({ ignored: true });
  const out = await PV.verifyAndRecord(String(body.data.id), null);
  if (out.status >= 500) return res.status(out.status).json({ error: "retry" });   // Moyasar retries failed deliveries
  return res.status(200).json({ ok: out.status === 200 });
};

  return module.exports;
})();
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
  "إذا أُرسلت لك خطوة واحدة من حل الطالب فركّز عليها وحدها: ابدأ باسم القانون المناسب لها وصيغته في سطر واحد، ثم بيّن أين خالفه الطالب في هذه الخطوة تحديدًا (حد ناقص، إشارة، مقاومة خطأ…)، ثم اختم بسؤال واحد يقوده لتصحيحها. لا تنتقل لخطوات أخرى ولا تكتب الحل كاملًا.",
  "وإذا كانت خطوة الطالب صحيحة فقل له أي قانون طبّقه ولماذا ينطبق هنا في جملة، ثم ما الخطوة التالية المنطقية دون أن تحلها عنه.",
  "اختصر: من 2 إلى 6 جمل عادةً. اكتب المعادلات كنص بسيط مثل v = iR و Z_C = −j/(ωC)."
].join("\n");

const L = require("./_lib.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "استخدم POST." }); }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "المعلم الذكي غير مفعّل: أضف GEMINI_API_KEY في إعدادات Vercel." });

  if (!(await L.requireStudent(req, res, "circuits-1"))) return;  // sign-in + subscription checked by the server
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
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 25000);
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
  "If the image has no readable handwriting, return an empty list and unreadable=true.",
  "In doubt, list the 0-based indexes of lines where a character could be read two ways (1/l/I, 5/s, 0/o, 2/z, + / t, − / =) in doubt; leave it empty when every line is clear."
].join(" ");

const L = require("./_lib.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "استخدم POST." }); }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "خدمة التعرف غير مفعّلة: أضف GEMINI_API_KEY في إعدادات Vercel." });

  if (!(await L.requireStudent(req, res, null))) return;  // sign-in checked by the server
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 12) return res.status(429).json({ error: "طلبات كثيرة. حاول بعد دقيقة." });
  list.push(now); hits.set(ip, list);

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const { mime, image, context } = body;
  const vocab = Array.isArray(body.vocab) ? body.vocab.map((v) => String(v).slice(0, 12)).filter((v) => /^[\w()ωΩ]+$/.test(v)).slice(0, 60) : [];
  if (!ALLOWED.includes(mime) || typeof image !== "string" || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 200))) {
    return res.status(400).json({ error: "أرسل صورة JPG أو PNG أو WebP." });
  }
  if (image.length > MAX_B64) return res.status(413).json({ error: "الصورة كبيرة جدًا. صوّر جزءًا أصغر من الصفحة." });

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const payload = {
    contents: [{ role: "user", parts: [
      { text: PROMPT + (vocab.length ? " The names in this circuit are: " + vocab.join(", ") + ". When a handwritten name is ambiguous, read it as one of these (v1 not vl, Vs not V5, i_R2 not iR2 with a stray mark); never invent a name that is not written." : "") + (context ? " The problem the student is solving (for reading ambiguous symbols only): " + String(context).slice(0, 600) : "") },
      { inline_data: { mime_type: mime, data: image } }
    ] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: process.env.GEMINI_RECOGNIZE_THINKING || "minimal" },   // copying text needs little thinking, and it is the slow part
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties: { lines: { type: "ARRAY", items: { type: "STRING" } }, doubt: { type: "ARRAY", items: { type: "INTEGER" } }, unreadable: { type: "BOOLEAN" } }, required: ["lines", "unreadable"] }
    }
  };

  try {
    let r;
    try { r = await callGemini(model, key, payload); }
    catch (e) { console.error("recognize", model, e && e.name, e && e.message); r = null; }
    if (!r || r.status >= 500 || r.status === 404) { // slow, overloaded or missing model: one retry on the lighter model
      const alt = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";
      if (alt !== model) { try { r = await callGemini(alt, key, payload); } catch (e) { console.error("recognize", alt, e && e.name, e && e.message); r = r || null; } }
    }
    if (!r) return res.status(504).json({ error: "تأخرت خدمة التعرف في الرد. حاول مرة أخرى، أو اكتب حلّك في تبويب الكيبورد." });
    if (r.status === 429) return res.status(429).json({ error: "وصلت خدمة التعرف لحدها المجاني مؤقتًا. حاول بعد دقيقة." });
    if (!r.ok) return res.status(502).json({ error: "تعذّر التعرف على الكتابة الآن. حاول مرة أخرى." });
    const j = await r.json();
    const text = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
    const out = safeJson(text) || {};
    const lines = Array.isArray(out.lines) ? out.lines.map((l) => String(l).slice(0, 300)).slice(0, 60) : [];
    const doubt = Array.isArray(out.doubt) ? out.doubt.filter((i) => Number.isInteger(i) && i >= 0 && i < lines.length).slice(0, 20) : [];
    return res.status(200).json({ lines, doubt, unreadable: !!out.unreadable || !lines.length });
  } catch (e) {
    console.error("recognize", e && e.name, e && e.message);
    return res.status(502).json({ error: "تعذّر الاتصال بخدمة التعرف. حاول مرة أخرى." });
  }
};

/* Calls Gemini with a 25 s limit per try (vercel.json allows the function 60 s, enough for one retry). If the model rejects thinkingConfig,
   retries once without it. Logs Google's status and message for debugging; the key is never logged. */
async function callGemini(model, key, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  async function once(b) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 25000);
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

const ROUTES = { "/api/tutor": tutor, "/api/recognize": recognize, "/api/pay-verify": payVerify, "/api/moyasar-webhook": webhook };
export const config = { matcher: ["/api/:path*"] };

export default async function middleware(request) {
  const url = new URL(request.url);
  const handler = ROUTES[url.pathname] || null;
  if (!handler) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "content-type": "application/json; charset=utf-8" } });
  let body = {};
  if (request.method === "POST") { try { body = await request.json(); } catch (e) { body = {}; } }
  const req = { method: request.method, headers: { "x-forwarded-for": request.headers.get("x-forwarded-for") || "", authorization: request.headers.get("authorization") || "" }, body };
  const headers = {};
  const res = {
    code: 200,
    status(c) { this.code = c; return this; },
    setHeader(k, v) { headers[k] = v; },
    sent: null,
    json(o) { return this.sent = new Response(JSON.stringify(o), { status: this.code, headers: Object.assign({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }, headers) }); }
  };
  return (await handler(req, res)) || res.sent || new Response(JSON.stringify({ error: "no response" }), { status: 500, headers: { "content-type": "application/json; charset=utf-8" } });
}
