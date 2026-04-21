

# Prerender Hardening Plan

This plan strengthens the existing Puppeteer prerender (no SSR, no hosting change, no UI change). It guarantees every public page ships full HTML with complete SEO, fails the build loudly if anything regresses, and stays auto-synced with Supabase content.

## What you'll get

- Every published page (core, services, blogs, custom `/p/:slug`) prerendered automatically — no hardcoded route lists.
- Build fails (or prints loud red errors) if any page is missing H1, meta description, or JSON-LD.
- A machine-readable `dist/prerender-report.json` plus a console summary table after every build.
- Mobile-first checks at 375px on a sample.
- Sitemap and prerender driven by the same route source — they cannot drift.

## Files

**New**
- `scripts/_routes.mjs` — single source of truth. Exports `getAllRoutes()` that fetches services, blog posts, and custom builder pages from Supabase and returns them with the static core routes.
- `docs/SEO-RENDERING.md` — how prerendering works, how to test locally, how to debug Google Search Console issues.

**Modified**
- `scripts/prerender.mjs` — import routes from `_routes.mjs`; harden wait logic (skeletons gone + Helmet title + DOM stable); add per-page validation (H1, meta description ≥ 50 chars, ≥ 1 JSON-LD, body content > 2KB, internal links present); emit `dist/prerender-report.json`; mobile 375px sample pass; non-zero exit on critical failures.
- `scripts/generate-sitemap.mjs` — import the same `getAllRoutes()`; remove its independent Supabase fetch so sitemap and prerender are guaranteed in sync.
- `src/components/SEOHead.tsx` — hydration audit pass (remove any `Date.now()` / locale-dependent values from rendered output).
- `src/pages/Home.tsx`, `src/pages/About.tsx`, `src/components/SmartPage.tsx` — hydration audit only (read-only check; edit only if a non-deterministic value is found).

**Untouched**
- `App.tsx` routing, all UI components, styles, forms, admin, auth, Supabase client, Vite config, `index.html`, `.github/workflows/deploy.yml`.

## How the hardened prerender will work

```text
build (vite)
   │
   ▼
scripts/_routes.mjs ──── fetch services + blogs + builder pages from Supabase
   │                       └─► returns: [{ path, type, lastmod }, ...]
   ├──────────────► scripts/generate-sitemap.mjs  → dist/sitemap.xml
   │
   └──────────────► scripts/prerender.mjs
                       │
                       ├─ for each route:
                       │    1. goto → networkidle2
                       │    2. wait: no .animate-pulse  AND  <h1> has text  AND  Helmet title set
                       │    3. capture <!doctype html> + outerHTML
                       │    4. validate: H1 ✓, meta desc ≥ 50 ✓, JSON-LD ≥ 1 ✓, body > 2KB ✓, internal links ✓
                       │    5. write dist/<route>/index.html
                       │    6. record { url, status, h1, descLen, schemaCount, linkCount }
                       │
                       ├─ mobile 375px pass on sample (/, /about, /services, one blog, one service)
                       │    └─ check: viewport meta, lazy below-fold images, no horizontal overflow
                       │
                       └─ write dist/prerender-report.json + print summary table
                          exit 1 if any page fails critical checks
```

## Per-page validation rules

| Check | Rule | On fail |
|---|---|---|
| `<h1>` | exists, non-empty text | ❌ FAIL |
| `<meta name="description">` | exists, ≥ 50 chars | ❌ FAIL |
| `<script type="application/ld+json">` | ≥ 1 block | ❌ FAIL |
| `#root` body content | > 2000 chars | ❌ FAIL |
| Internal links | ≥ 3 `<a href>` to same domain | ⚠ WARN |
| `<link rel="canonical">` | exists | ⚠ WARN |
| `<title>` | exists, not the default Vite/fallback | ⚠ WARN |
| Mobile sample | viewport meta + lazy images | ⚠ WARN |

Schema-by-page (warned, not failed, so missing schema is visible but doesn't block deploy):
- `/` → `WebSite` + `LocalBusiness`
- `/about` → `Organization` + `LocalBusiness`
- `/contact` → `LocalBusiness`
- `/services/:slug` → `Service`
- `/blog/:slug` → `Article`

## Sample report output

`dist/prerender-report.json`
```json
{
  "generatedAt": "2026-04-21T10:12:33Z",
  "totalRoutes": 78,
  "succeeded": 78,
  "failed": 0,
  "warnings": 2,
  "pages": [
    {
      "url": "/",
      "status": "success",
      "h1": "Best Dentists in Garia, Kolkata",
      "descLen": 158,
      "schemaCount": 3,
      "schemaTypes": ["WebSite", "LocalBusiness", "FAQPage"],
      "internalLinks": 24,
      "htmlBytes": 142390
    },
    {
      "url": "/services/dental-implants",
      "status": "success",
      "h1": "Dental Implants in Kolkata",
      "descLen": 162,
      "schemaCount": 2,
      "schemaTypes": ["Service", "LocalBusiness"],
      "internalLinks": 18,
      "htmlBytes": 118022
    }
  ]
}
```

Console summary:
```text
[prerender] ──────────────────────────────────────────────
[prerender]  ROUTE                              H1  DESC  SCHEMA  LINKS   STATUS
[prerender] /                                   ✓   158   3       24      ✅
[prerender] /about                              ✓   142   2       19      ✅
[prerender] /services/dental-implants           ✓   162   2       18      ✅
[prerender] /blog/dental-implants-in-kolkata    ✓   174   2       12      ✅
[prerender] ──────────────────────────────────────────────
[prerender] 78 succeeded · 0 failed · 2 warnings
```

## What this fixes vs what's already working

Already in place (kept): Puppeteer prerender, JSON-LD on most pages, sitemap generator, `.htaccess` legacy redirects, react-helmet-async metadata.

Newly guaranteed by this plan: automatic discovery of every published Supabase row, build-fails-on-regression, machine report, sitemap/prerender drift impossible, mobile-first sample audit, hydration determinism check.

## Risks & rollback

- Risk: Strict validation could fail the build on a real content gap (e.g., a blog post with no description). Mitigated by classifying schema/canonical/title issues as **warnings**, only H1/desc/JSON-LD/body as **failures**.
- Rollback: revert the four files; the runtime app is untouched.

