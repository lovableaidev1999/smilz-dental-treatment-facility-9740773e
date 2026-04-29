# MoveWorkSpace — Migrating Smilz Dental to a New Lovable Project

> **Goal:** Move this project to a fresh Lovable workspace **without enabling
> Lovable Cloud**, so the external Supabase (`eukymrxxmvkchxfpjjuz`) connects
> through Lovable's official Supabase integration. This eliminates the dual-
> backend mess (hardcoded client overrides, dead `.env`, agent tools pointing
> at the wrong DB) documented in `README.md`.

---

## Why migrate?

Current project has **Lovable Cloud enabled** (cannot be disabled). This caused:
- `.env` permanently overwritten with Cloud credentials → ignored at runtime.
- `src/integrations/supabase/client.ts` hardcoded to bypass `.env`.
- `src/integrations/supabase/types.ts` auto-generated from the **wrong** (empty) DB.
- Lovable agent's `supabase--*` tools point at the empty Cloud DB, not the real one.
- "Connect Supabase" button greyed out forever.

A fresh project where **Cloud is never enabled** fixes all of the above.

---

## ⚠️ Pre-flight Checklist (DO THIS FIRST)

- [ ] Full backup of external Supabase DB (`eukymrxxmvkchxfpjjuz`):
  - Schema dump: `supabase db dump --project-ref eukymrxxmvkchxfpjjuz -f schema.sql`
  - Data dump: `supabase db dump --project-ref eukymrxxmvkchxfpjjuz --data-only -f data.sql`
  - Storage bucket `media` — download all files (use Supabase dashboard or CLI).
- [ ] Note the live custom domain (`smilz.net`) — DO NOT change DNS yet.
- [ ] Note Hostinger FTP credentials (used by GitHub Actions deploy).
- [ ] Note all GitHub Secrets currently set on the repo:
  - `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_PORT`
  - Any `VITE_*` build secrets
- [ ] Export the list of runtime secrets from current project (Cloud → Secrets):
  - `GOOGLE_PLACE_ID`, `GOOGLE_PLACES_API_KEY`, `OPENAI_API_KEY`,
    `LOVABLE_API_KEY`, `GITHUB_REPO`, `GITHUB_DISPATCH_TOKEN`, etc.
- [ ] Confirm you can log into the Supabase dashboard for `eukymrxxmvkchxfpjjuz`.
- [ ] Tag current GitHub repo: `git tag pre-migration-$(date +%Y%m%d)` so you
      can roll back.

---

## ✅ The To-Do List (in order)

### Phase 1 — Create the new Lovable project

1. **Create a new blank Lovable project** in your workspace.
   - Name it `smilz-v2` or similar.
   - **DO NOT click "Enable Lovable Cloud"** anywhere. Not in setup, not later.
   - **DO NOT** ask the agent to add auth, database, or backend features yet.
2. **Immediately connect Supabase** before doing anything else:
   - Go to **Connectors** (left sidebar) → **Supabase** → **Connect**.
   - Select the existing project `eukymrxxmvkchxfpjjuz`.
   - Confirm "Connect Supabase" button is **active** (not greyed out). If
     greyed out, Cloud got enabled — delete the project and start over.
3. **Connect GitHub** to the same repo (or a new one if you prefer a clean history).
   - Connectors → GitHub → connect to your account → link repo.

### Phase 2 — Copy the codebase

4. **Pull the current code** from this project's GitHub repo into the new
   project's repo. Easiest paths:
   - **Option A (same repo):** Both projects point at the same repo. Lovable
     will sync automatically.
   - **Option B (clone):** `git clone` the old repo, push to a new repo, then
     link the new repo in the new Lovable project.

5. **After code is in the new project, fix these files** (use the prompt in
   the next section to make Lovable do it for you):

   - `src/integrations/supabase/client.ts` — **remove the hardcoded URL/key**
     and revert to reading `.env`:
     ```ts
     const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
     const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
     ```
   - `src/integrations/supabase/types.ts` — delete it; let Lovable
     regenerate it from the real DB schema.
   - `.env` — **leave alone**. Lovable's Supabase integration will populate it
     correctly with `eukymrxxmvkchxfpjjuz` credentials.
   - `README.md` — replace the dual-backend warning section with a normal
     project README.
   - `supabase/config.toml` — verify `project_id = "eukymrxxmvkchxfpjjuz"`.

### Phase 3 — Re-add secrets and connectors

6. **Re-add all runtime secrets** in Lovable Cloud → Secrets (despite the
   name, the Secrets UI works without enabling the Cloud DB):
   - `GOOGLE_PLACE_ID`
   - `GOOGLE_PLACES_API_KEY`
   - `OPENAI_API_KEY`
   - Any others from your pre-flight list.
7. **Re-add GitHub Actions secrets** on the new repo (if you used a new repo):
   - `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_PORT`
8. **Re-link any standard connectors** (Google, etc.) via Connectors panel.

### Phase 4 — Verify

9. **In the Lovable preview**, verify:
   - Homepage loads with services, blog posts, Google reviews.
   - `/services/dental-implants-garia-kolkata` resolves correctly.
   - Admin login at `/admin` works (Google OAuth).
   - Visual Builder opens layouts saved in `page_layouts` table.
   - Media library shows uploaded images from `media` bucket.
10. **Ask the Lovable agent to run** `supabase--read_query` with
    `SELECT count(*) FROM services` — it should return the real count
    (proves the agent's tools now point at the correct DB).
11. **Run a test deploy** via GitHub Actions to Hostinger staging path.
    Confirm built HTML references the correct Supabase URL.

### Phase 5 — Cutover

12. Update Supabase Auth **Site URL** and **Redirect URLs** to include the
    new Lovable preview URL (Auth → URL Configuration).
13. Once everything works on the new project: archive (don't delete) the old
    Lovable project for safety.
14. Production domain (`smilz.net`) keeps pointing at Hostinger — no DNS
    change needed since the deploy target is unchanged.

---

## 📋 The Prompt to Paste into the New Lovable Project

Copy-paste the block below into the chat of your **new** Lovable project
**after** you've connected Supabase and pulled the code:

````
I've migrated this project from another Lovable workspace where Lovable Cloud
was accidentally enabled, which forced a dual-backend setup. I've now
connected the real external Supabase project (eukymrxxmvkchxfpjjuz) directly
via the Supabase integration on this fresh project (Cloud is NOT enabled).

Please clean up the legacy workarounds:

1. Open `src/integrations/supabase/client.ts`. REMOVE the hardcoded
   SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY constants. Replace them with the
   standard pattern that reads from environment variables:
       const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
       const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
   Keep the rest of the file (createClient call, exports) intact.

2. Delete `src/integrations/supabase/types.ts`. Lovable will regenerate it
   automatically from the connected Supabase schema.

3. Verify `.env` now contains:
       VITE_SUPABASE_URL=https://eukymrxxmvkchxfpjjuz.supabase.co
       VITE_SUPABASE_PUBLISHABLE_KEY=<the real anon key>
       VITE_SUPABASE_PROJECT_ID=eukymrxxmvkchxfpjjuz
   If it points at any other project ref, STOP and tell me — Cloud may have
   been enabled by mistake.

4. Verify `supabase/config.toml` has `project_id = "eukymrxxmvkchxfpjjuz"`.

5. Replace the contents of `README.md` with a normal project description
   (this is the Smilz Dental headless CMS site: React + Vite + Supabase +
   Hostinger FTP deploy via GitHub Actions). Remove the dual-backend warning
   section that's currently there — it no longer applies.

6. Run a quick sanity check by querying the database with your supabase
   tools: `SELECT count(*) FROM services WHERE is_published = true`. Tell me
   the number you get back so I can confirm the agent tools are now wired to
   the correct DB.

7. Do NOT enable Lovable Cloud at any point. Do NOT add auth, storage, or
   edge function features through Cloud — everything goes through the
   already-connected external Supabase project.

8. Do NOT modify these files (they are project-managed):
   - .env (managed by Supabase integration)
   - src/integrations/supabase/client.ts (after step 1, only the integration touches it)
   - src/integrations/supabase/types.ts (after step 2, auto-regenerated)
   - supabase/config.toml (project-level settings)

After you finish, list which of the verification items in step 3, 4, and 6
passed or failed.
````

---

## 🚫 Things That Will Re-break the Setup

- Clicking "Enable Lovable Cloud" anywhere in the new project — **never do this**.
- Letting the agent add auth / storage / edge functions via Cloud (it will
  prompt to enable Cloud). Always tell it to use the existing Supabase
  connection instead.
- Manually editing `.env` (it'll be overwritten by the Supabase integration).
- Re-introducing hardcoded URLs/keys in `client.ts` "just in case".

---

## 🆘 Rollback Plan

If anything breaks during migration:
1. The old Lovable project still works — preview URL unchanged.
2. Hostinger production deploy is independent of either Lovable project; the
   live site at `smilz.net` keeps serving the last successful build.
3. To roll back code: `git checkout pre-migration-<date>` on the repo.

---

## 📌 Reference

- Old Lovable project ID: `14f41d17-cd74-4841-b45c-2a97193e3c2d`
- Cloud Supabase (unused, empty): `wleqgpofmfefvvksxkea`
- **Real Supabase (keep this one):** `eukymrxxmvkchxfpjjuz`
- Supabase dashboard: https://supabase.com/dashboard/project/eukymrxxmvkchxfpjjuz
- Production domain: https://smilz.net (Hostinger, FTP deploy)
- Deploy pipeline: `.github/workflows/` → FTP to Hostinger
