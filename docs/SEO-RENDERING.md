# SEO Rendering Strategy

SMILZ.net is a React/Vite SPA deployed as **static files** to Hostinger via FTP.
To make every public page fully crawlable without a Node server, the build pipeline
**prerenders** every route into static HTML using Puppeteer. This achieves
SSR-equivalent SEO without the operational cost of running a server.

---

## Pipeline

```
vite build
   │
   ├─► scripts/_routes.mjs        ← single source of truth (Supabase + static)
   │
   ├─► scripts/generate-sitemap.mjs → dist/sitemap.xml
   │
   └─► scripts/prerender.mjs        → dist/<route>/index.html for every route
                                    → dist/prerender-report.json (audit)
```

`scripts/_routes.mjs` exports `getAllRoutes()` which returns the merged list of:

- Core pages: `/`, `/about/`, `/services/`, `/contact/`, `/gallery/`, `/blog/`
- SEO landing pages (Kolkata/Garia local terms)
- Every published service from Supabase → `/services/:slug/`
- Every published blog post from Supabase → `/blog/:slug/`
- Every published custom builder page → `/p/:slug/`

Both the prerender and the sitemap consume this same list, so they cannot drift apart.

---

## What the prerender guarantees per page

For every page captured, the script validates and records:

| Check | Rule | On fail |
|---|---|---|
| `<h1>` | exists, non-empty | ❌ FAIL build |
| `<meta name="description">` | ≥ 50 chars | ❌ FAIL build |
| `<script type="application/ld+json">` | ≥ 1 block | ❌ FAIL build |
| `#root` body content | > 2000 chars | ❌ FAIL build |
| Internal links | ≥ 3 | ⚠ Warn |
| `<link rel="canonical">` | exists | ⚠ Warn |
| `<title>` | not the default fallback | ⚠ Warn |
| Schema types per page | LocalBusiness/Service/Article | ⚠ Warn |
| Mobile (375px) sample | viewport meta, lazy images, no overflow | ⚠ Warn |

Failures cause the build to exit non-zero so regressions cannot be silently deployed.

---

## How to test locally

```bash
# 1. Build the SPA
npm run build

# 2. Generate sitemap
node scripts/generate-sitemap.mjs

# 3. Prerender every route (expects VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in env)
node scripts/prerender.mjs

# 4. Inspect a page — should show full HTML, not an empty React shell
cat dist/services/dental-implants/index.html | head -200

# 5. View the audit report
cat dist/prerender-report.json | jq '.pages[] | select(.status=="failed")'
```

To preview the prerendered output in a browser:

```bash
npx serve dist
# open http://localhost:3000/about/
```

View Source (Cmd-U) should show the full content, JSON-LD, meta tags — no empty `<div id="root"></div>`.

---

## Debugging missing SEO content

### Symptom: A page shows up empty in Google Search Console (URL Inspection → "Live Test")

1. Check the prerender report:
   ```bash
   cat dist/prerender-report.json | jq '.pages[] | select(.url=="/<route>/")'
   ```
2. Look at `failures` and `warnings`. Common causes:
   - `missing H1` → the page component renders an `<h2>` but no `<h1>` above the fold
   - `meta description too short` → `SEOHead` not mounted, or `description` prop empty
   - `no JSON-LD schema` → `<SEOHead>` not rendered for this route
   - `body content too small` → component is showing a loading skeleton; data fetch is too slow or failing in the prerender Puppeteer environment

### Symptom: "Discovered – currently not indexed"

- Confirm the URL is in `dist/sitemap.xml` AND in `dist/prerender-report.json` (succeeded).
- Confirm `dist/<route>/index.html` exists and contains real content (not the React shell).
- Re-submit via Search Console → URL Inspection → Request Indexing.

### Symptom: New blog/service is not being prerendered

- The route is fetched live from Supabase at build time. Confirm `is_published = true`
  (or `is_active = true` for services) in the database.
- Re-run the build. The sitemap and prerender both read from `getAllRoutes()`.

---

## What is NOT done

- **No SSR.** No Node server in production. No hosting migration.
- **No runtime data fetching changes.** Components still fetch from Supabase at runtime.
  The prerender just captures the post-fetch HTML so crawlers see the full page.

---

## Files

- `scripts/_routes.mjs` — single source of truth for all routes
- `scripts/prerender.mjs` — Puppeteer prerender + validation + report
- `scripts/generate-sitemap.mjs` — XML sitemap builder
- `dist/prerender-report.json` — generated after every build (machine-readable audit)
