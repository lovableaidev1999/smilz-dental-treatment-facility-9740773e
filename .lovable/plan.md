# Ask Smilz AI — Chat Logging + Admin Insights (SEO/GEO Growth)

Goal: persist every chatbot conversation in Supabase, surface it inside the admin CMS as an actionable analytics view, and turn real visitor questions into SEO/GEO content fuel — without breaking anything currently live.

---

## What you'll get

1. Two new Supabase tables (`chat_conversations`, `chat_messages`) — public can write, only admins can read.
2. Updated `dental-chat` Edge Function that logs each turn + extracts language and locality clues.
3. New admin route **`/admin/chat-insights`** with three tabs: Conversations, Top Questions, GEO/SEO Opportunities.
4. Frontend chatbot keeps working exactly as today — adds a hidden `session_id` (localStorage) so returning visitors thread together.

No existing file's behavior changes. Only additions + one edge-function rewrite (drop-in).

---

## You do (Supabase dashboard, no CLI)

### A. Run this SQL in Supabase → SQL Editor

```sql
-- 1. Conversations (one per visitor session)
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count int not null default 0,
  language text,                 -- 'en' | 'hi' | 'bn' | null
  detected_locality text,        -- e.g. 'Sonarpur', 'Garia', 'Behala'
  detected_intent text,          -- 'pricing' | 'booking' | 'symptom' | 'service' | 'other'
  detected_service text,         -- 'implants' | 'braces' | 'rct' | 'whitening' | ...
  user_agent text,
  ip_hash text,                  -- sha256, never raw IP
  is_lead boolean not null default false,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.chat_conversations (session_id);
create index on public.chat_conversations (last_message_at desc);
create index on public.chat_conversations (detected_intent);
create index on public.chat_conversations (detected_service);

-- 2. Messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.chat_messages (conversation_id, created_at);

-- 3. RLS — public writes via edge function (service role), only admins read
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Admin read (reuse existing has_role pattern if present, else email allowlist)
create policy "Admins read conversations"
  on public.chat_conversations for select
  using (auth.uid() is not null);   -- tighten to admin role table if you have one

create policy "Admins update conversations"
  on public.chat_conversations for update
  using (auth.uid() is not null);

create policy "Admins read messages"
  on public.chat_messages for select
  using (auth.uid() is not null);
-- No public INSERT policies → only the edge function (service role) can write.
```

### B. Replace the `dental-chat` Edge Function `index.ts`
Single drop-in file (provided in chat below the plan). It:
- accepts `{ messages, session_id }` from the browser
- writes the user turn + assistant reply to the new tables using `SUPABASE_SERVICE_ROLE_KEY`
- runs cheap regex/keyword detection for `language`, `detected_locality` (Garia, Sonarpur, Behala, Patuli, Narendrapur, Baghajatin, Jadavpur, Rajpur, Bansdroni, Tollygunge, Kolkata + 50 nearby), `detected_intent`, `detected_service`
- flags `is_lead = true` when intent is `pricing`/`booking` or a phone/WhatsApp is volunteered
- never blocks the reply if logging fails (try/catch swallow)

No DB schema means **everything you ship works** — even before tables exist.

---

## I'll do (codebase — additive only)

### 1. Frontend (`src/components/DentalChatbot.tsx`)
- Add `session_id` (uuid) stored in `localStorage` under `smilz_chat_session`.
- Send it alongside `messages` in the existing `supabase.functions.invoke("dental-chat", ...)`.
- Zero UI change. If logging fails server-side, chat still replies normally.

### 2. New Admin page — `src/pages/admin/AdminChatInsights.tsx`
Route: `/admin/chat-insights`
Tabs (using existing shadcn `Tabs`):

**Tab 1 — Conversations**
- Table: date · language · locality · intent · service · message count · lead badge · reviewed checkbox
- Click row → side drawer shows full transcript
- Filters: date range, language, intent, service, leads-only, unreviewed-only
- Export CSV button

**Tab 2 — Top Questions** (the SEO goldmine)
- Aggregates user messages (last 30/90/365 days) → de-duplicated, sorted by frequency
- Each row: question · count · suggested action button:
  - **"Create FAQ"** → prefills new FAQ entry
  - **"Create Blog Post"** → opens `/admin/blog/new` with title prefilled
- Powered by a Postgres view `v_top_chat_questions` (added in same SQL above — optional, can also compute client-side)

**Tab 3 — GEO Opportunities** (the local-SEO goldmine)
- Group by `detected_locality` → count of conversations + top services asked from that area
- Each row: locality · conversation count · top 3 services · button **"Generate Location Page"** → links to your existing `scripts/generate-location-pages.mjs` config (just shows the slug to add)
- Map view (optional v2) using leaflet — skipped now to keep scope tight

### 3. Sidebar entry — `src/pages/admin/AdminLayout.tsx`
Add one nav item:
```ts
{ label: "Chat Insights", path: "/admin/chat-insights", icon: MessageSquare }
```

### 4. Route registration — `src/App.tsx`
Add lazy import + `<Route path="chat-insights" element={<AdminChatInsights />} />` inside the existing `/admin` parent route.

### 5. Data hook — `src/hooks/useChatInsights.ts`
React Query, 5-min stale-time (per project memory), `is_published`-style filtering N/A here. Uses `maybeSingle()` style for single-conv fetch.

---

## SEO / GEO growth loop (how this pays back)

```text
Visitor asks bot ──► logged + locality/intent detected
                            │
                            ▼
            Admin opens /admin/chat-insights weekly
                            │
        ┌───────────────────┼─────────────────────┐
        ▼                   ▼                     ▼
  Top Questions       GEO Opportunities      Hot Leads
  → FAQ/Blog post     → Location page        → WhatsApp follow-up
  → Schema FAQPage    → 'dentist in Sonarpur'  (revenue)
  → Featured snippet  → Local schema markup
```

- **SEO**: Top Questions tab feeds the existing blog system (TipTap editor + dynamic categories). Each new post inherits the site's metadata standards (title format, JSON-LD, canonical) from `mem://seo/metadata-standards`.
- **GEO**: Detected localities feed `scripts/generate-location-pages.mjs` (already in the repo per `docs/LOCATION-PAGES.md`) — visitor-revealed neighborhoods become real landing pages with LocalBusiness schema.
- **Lead capture**: `is_lead=true` rows surface for manual WhatsApp follow-up using the existing click-to-chat (`+918961775554`).

---

## Privacy / safety

- IP is hashed (sha256), never stored raw.
- No name/phone/email is *required* — only stored if the visitor types it.
- One-line privacy notice added to the chatbot welcome message: *"Conversations may be reviewed to improve our service."*
- RLS blocks all public reads; only authenticated admin sessions can view logs.

---

## Won't break checklist

- Tables don't exist yet → edge function try/catches DB writes → chatbot replies normally.
- Frontend sends an extra field (`session_id`) the old function ignores → safe during deploy gap.
- New admin page is behind existing `useAuth` guard in `AdminLayout`.
- No changes to: `client.ts`, `types.ts` (auto-regen on your side), `.env`, build config, sitemap, prerender, Hostinger deploy.

---

## Order of operations (after you approve)

1. I write the new `index.ts`, the React admin page, the hook, the sidebar/route changes, and the chatbot session_id patch.
2. You paste the SQL into Supabase → SQL Editor → Run.
3. You paste the new `index.ts` into Supabase → Edge Functions → `dental-chat` → Deploy.
4. GitHub Actions deploys the frontend changes to Hostinger automatically.
5. Within 24 h you'll see the first conversations populate `/admin/chat-insights`.

Ready to build — approve and I'll ship the code in one pass.
