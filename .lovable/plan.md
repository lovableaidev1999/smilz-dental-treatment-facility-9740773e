
# Publish to SEO — One-Click Static Rebuild

## What you'll get

A new "Publish to SEO" button in the admin CMS that, when clicked, triggers your existing GitHub Actions workflow (`.github/workflows/rebuild-content.yml`) to:
1. Rebuild the React app
2. Regenerate `sitemap.xml`
3. Prerender every page (services, blogs, builder pages, SEO landings) into static HTML
4. Incrementally upload changed files to Hostinger via FTP

End-to-end time per click: ~20–30 minutes (FTP step is incremental, so only changed HTML is actually uploaded).

## Architecture

```text
Admin browser
    │  click "Publish to SEO"
    ▼
Supabase Edge Function: trigger-rebuild
    │  POST /repos/{owner}/{repo}/dispatches
    │  with event_type: "content-updated"
    ▼
GitHub repository_dispatch event
    │
    ▼
.github/workflows/rebuild-content.yml  ← already exists, no changes needed
    │  build → prerender → FTP
    ▼
smilz.net (Hostinger) updated
```

## What gets built

### 1. New edge function: `supabase/functions/trigger-rebuild/index.ts`

A small, authenticated edge function that:
- Verifies the caller is a logged-in admin (validates JWT via `getClaims`)
- Reads two server-side secrets: `GITHUB_DISPATCH_TOKEN` and `GITHUB_REPO`
- POSTs to `https://api.github.com/repos/{GITHUB_REPO}/dispatches` with body `{ "event_type": "content-updated" }`
- Returns success / error JSON to the frontend
- Logs each trigger (who, when) to console for audit

Why an edge function (not a direct fetch from the browser)?
- The GitHub PAT must never be exposed to the client
- Lets us add admin-only auth, rate limiting, and audit logging in one place

### 2. Required secret

One secret to add (you'll be prompted in a separate step): `GITHUB_DISPATCH_TOKEN`
- A GitHub Fine-grained Personal Access Token
- Repo access: only your Smilz repo
- Permission: **Contents: Read and write** (this is what allows `repository_dispatch`)

`GITHUB_REPO` (format `owner/repo`) will also be requested as a secret so we can change repos without redeploying code.

### 3. New admin page: `src/pages/admin/AdminPublishSEO.tsx`

A simple page with:
- Big "Publish to SEO" button (Navy/Gold theme, matches admin look)
- Confirmation dialog before triggering ("This will rebuild ~80 pages and take ~20–30 min. Continue?")
- After click: shows toast + status panel with:
  - Last triggered timestamp (stored in `localStorage` for now)
  - Direct link to GitHub Actions run page so you can watch progress
- Helper text explaining what happens and roughly how long it takes
- Cooldown: button disabled for 5 min after each click to prevent accidental double-triggers

### 4. Sidebar nav update: `src/pages/admin/AdminLayout.tsx`

Add a new entry "Publish to SEO" with a `Rocket` icon, placed near the top so it's easy to find.

### 5. Route registration: `src/App.tsx`

Add `/admin/publish-seo` route pointing to the new page.

## What does NOT change

- `.github/workflows/rebuild-content.yml` — already accepts `repository_dispatch` events, no edits needed
- `scripts/prerender.mjs`, `scripts/generate-sitemap.mjs` — untouched
- Existing chatbot, CMS, builder code — untouched

## Files touched

| File | Action |
|---|---|
| `supabase/functions/trigger-rebuild/index.ts` | **new** |
| `src/pages/admin/AdminPublishSEO.tsx` | **new** |
| `src/pages/admin/AdminLayout.tsx` | edit (add nav item) |
| `src/App.tsx` | edit (add route) |

## Secrets required (will prompt after approval)

- `GITHUB_DISPATCH_TOKEN` — your GitHub Fine-grained PAT
- `GITHUB_REPO` — your repo in `owner/repo` format

## Notes & caveats

- **Full vs incremental rebuild**: Every click rebuilds ALL pages on GitHub Actions side. The FTP upload is incremental (only changed files transferred), so bandwidth and Hostinger time stay small. CPU time on GitHub Actions is fixed at ~20–30 min regardless of how much content changed.
- **GitHub Actions free tier**: Public repos = unlimited minutes. Private repos = 2,000 free min/month. At ~25 min per publish, that's ~80 publishes/month free.
- **Future enhancement (not in this scope)**: True incremental prerender (only rebuild changed routes) is possible but is ~4–6 hrs of work. Recommend shipping this simple version first and revisiting only if it becomes a bottleneck.

After you approve, I'll request the two secrets and then build all four files.
