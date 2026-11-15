/* CircuitVision — deployment settings.
   Accounts and the student club need a Supabase project (free tier is enough):
   1. supabase.com → New project. 2. SQL Editor → run supabase/schema.sql.
   3. Authentication → Providers → Email: enabled.
   4. Project Settings → API: copy the Project URL and the "anon public" key here.
   The anon key is meant to be public; Row Level Security in schema.sql protects the data.
   Subscriptions and the admin panel: run supabase/access.sql (already applied to the project).
   Leave both empty to run the site without accounts (progress stays in the browser). */
window.CV_CONFIG = {
  SUPABASE_URL: "https://lftrvtaopymlqgdcsjdv.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdHJ2dGFvcHltbHFnZGNzamR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0ODExOTIsImV4cCI6MjExMDA1NzE5Mn0.LCYboIYos-PD8hMEhQUnQ3lXTEE9sUw0pWnFpshePpQ",
  /* Moyasar (ميسّر): the PUBLISHABLE key only (pk_test_… or pk_live_…). It is public by design.
     The secret key (sk_…) goes ONLY in Vercel → Environment Variables as MOYASAR_SECRET_KEY. Empty = payment not open yet. */
  MOYASAR_PUBLISHABLE_KEY: "",
  /* false = subscriptions are switched off: every approved account opens everything, and the subscription page,
     its menu link and the admin's prices/payments tabs are hidden. Accounts and admin approval stay on. */
  SUBSCRIPTIONS: false,
  MOYASAR_METHODS: ["creditcard"]           // mada, Visa, Mastercard. Add "stcpay" after it is activated in your Moyasar account
};
