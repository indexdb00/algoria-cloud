## Scope

Large multi-area update. Shipping in one pass, all i18n-aware (EN/PT/ES/FR/DE/IT). Only frontend + 1 small DB migration (admin role + whatsapp integration metadata). Stripe is wired as UI scaffolding — live checkout requires enabling Lovable Payments after approval.

---

### 1. Post-login splash screen
- New `src/components/SplashLoader.tsx` — fullscreen, Aurevia mark + wordmark side-by-side, animated blue gradient progress bar (CSS keyframes, ~1.4s), then fades out.
- Triggered in `_authenticated.tsx` on first mount per session (sessionStorage flag), before children render.

### 2. Chat becomes the default landing
- `/dashboard` now redirects to `/dashboard/chat` (update `dashboard.index.tsx` → move overview content to `dashboard.consumo.tsx`, make index a `<Navigate>` to chat).
- Sidebar order: **Chat → Funnels → Consumo → Integrations → Billing → Profile** (admin appended when role matches).

### 3. "Consumo" page (rename of Overview, 3rd item)
- New route `dashboard.consumo.tsx`. Pulls real data only:
  - chats (conversations count), prompts (user messages), credits used/left, successful campaigns (assistant messages containing `CAMPAIGN` block parsed from messages), reach/clicks/conversions (sum from `user_integrations.credentials.metrics` placeholders → shows "—" until real ad-platform sync, no fake numbers).
- Neon charts via `recharts` (already installed) with custom gradient strokes + glow filters using `--neon` token. Three cards: line (daily prompts last 14d), area (credits spent last 14d), bar (campaigns per platform).
- Delete old `dashboard.index.tsx` content (replaced by redirect).

### 4. WhatsApp integration page
- New route `dashboard.whatsapp.tsx` — landing for WhatsApp Business lead capture. Form to connect (Phone Number ID + Access Token + Webhook verify token), uses the same `connectIntegration` server fn (5 credits). Adds "whatsapp" to integration catalog in `dashboard.integrations.tsx`.
- Empty leads table with "Connect WhatsApp to start collecting leads" empty state; reads from new `whatsapp_leads` table when present.
- Sidebar link with WhatsApp icon (lucide `MessageCircle`).

### 5. Funnels redesign
- `dashboard.funnel.tsx`: glassmorphism cards per platform with gradient borders, animated connecting SVG lines between stages (Audience → Creative → Budget → KPI), hover lift, neon accent on active node. Mobile: vertical stack with dotted connector. Keep existing data source (parsed from chat).

### 6. Admin area
- DB migration: `app_role` enum + `user_roles` table + `has_role()` security-definer function (per platform rules). Seed current user as admin via SQL prompt to user (handled in migration description).
- Route group `src/routes/_authenticated/admin.tsx` (layout) gated by `has_role(uid,'admin')` server fn.
  - `admin.index.tsx` — KPIs: total users, MRR (from Stripe once connected), active subs, churn.
  - `admin.users.tsx` — list profiles + credits + plan + actions (grant credits, suspend).
  - `admin.payments.tsx` — Stripe dashboard mirror: subs, invoices, refund actions (calls Stripe via server fn).
  - `admin.chat.tsx` — unlimited admin AI chat (bypass credit check when `has_role(uid,'admin')` in `chat.functions.ts`). System prompt focused on platform health + ToS compliance auditing (queries recent messages flagged for policy keywords).
- Sidebar shows "Admin" section only when `has_role` true.

### 7. Stripe + PIX
- Recommend enabling Lovable Payments (Stripe) — will run `recommend_payment_provider` after plan approval. Plans: Free / Starter €19 / Growth €59 / Scale €199 (already in `dashboard.billing.tsx`).
- Brazilian PIX automatic: Stripe Checkout supports `payment_method_types: ['card','pix']` for BRL subscriptions. Billing page detects user country (from `profiles.country`) = "BR" and shows "Pagar com PIX (automático)" toggle. Server fn will pass PIX when ready post-Stripe-enable.

### 8. Tutorial polish
- Update `src/components/Tutorial.tsx`:
  - Header shows BrandMark + "Aurevia" in `font-heading` (Fraunces) at large size.
  - Body uses Fraunces for titles, Inter for body, generous line-height, subtle gradient backdrop.
  - Step indicator becomes thin neon progress bar instead of dots.
  - Buttons get gradient + glow.

### 9. i18n
- Add keys for: splash ("Loading your workspace…"), consumo (page title, metric labels, "Last 14 days"), whatsapp (page + form), admin (sections), pix label. Translate into 6 languages.

---

## Technical Details

**Migration (one call):**
```sql
CREATE TYPE app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid PK default gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz default now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY ur_self_read ON public.user_roles FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE FUNCTION public.has_role(_uid uuid,_role app_role) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS
  $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role=_role) $$;

CREATE TABLE public.whatsapp_leads (
  id uuid PK default gen_random_uuid(),
  user_id uuid NOT NULL,
  phone text NOT NULL,
  name text, message text, status text default 'new',
  created_at timestamptz default now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.whatsapp_leads TO authenticated;
GRANT ALL ON public.whatsapp_leads TO service_role;
ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY wl_self ON public.whatsapp_leads FOR ALL TO authenticated
  USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
```
User will be asked to insert themselves as admin via a follow-up `supabase--insert` (needs their user id / email).

**Files created (~10):** SplashLoader, dashboard.consumo, dashboard.whatsapp, admin.tsx layout + 4 admin pages, admin.functions.ts, whatsapp.functions.ts.
**Files edited (~8):** dashboard.tsx (sidebar + admin gate), dashboard.index.tsx (redirect), dashboard.funnel.tsx (redesign), dashboard.integrations.tsx (+whatsapp), dashboard.billing.tsx (PIX toggle), Tutorial.tsx, _authenticated.tsx (splash), i18n.tsx (keys), chat.functions.ts (admin unlimited).

**Stripe note:** Plan UI ships now. After you approve, I'll run `recommend_payment_provider` → `enable_stripe_payments` so live checkout + PIX activates. Until then the "Buy" buttons remain stub toasts.

**Admin bootstrap:** After migration runs, tell me which email should be the admin and I'll insert the role row.
