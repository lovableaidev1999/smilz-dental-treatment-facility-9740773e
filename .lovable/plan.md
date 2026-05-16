## Goal

Install Google Analytics 4 (Measurement ID **`G-FGCJBS9KG8`** — the active "Smilz" Web stream) on **every page** of smilz.net:

- Every React SPA route (current and future)
- Every prerendered/SSR HTML page in `html-site/` and `dist/` produced by `scripts/prerender.mjs`
- Every CMS-built page rendered through the shell

Goal achieved with a **single edit to `index.html`** — no React, Supabase, or dependency changes.

## Why one edit covers all SSR/prerendered pages

`scripts/prerender.mjs` boots Puppeteer against the built SPA, and every static HTML file it writes starts from `index.html`. Anything in `<head>` of `index.html` is therefore baked into every prerendered page automatically. The next CI run of `rebuild-content.yml` regenerates all static files with the tag and FTP-deploys them to Hostinger.

## Changes

### 1. Edit `index.html` — add the GA4 snippet

Insert immediately after the existing Ahrefs analytics `<script>` block in `<head>`.

Pattern (mirrors the existing Ahrefs deferred-load pattern):

```html
<!-- Google tag (gtag.js) — GA4 G-FGCJBS9KG8 -->
<script>
  // Define dataLayer + gtag shim SYNCHRONOUSLY so any later gtag('event', ...)
  // calls queue safely before the remote script loads.
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-FGCJBS9KG8');

  // Defer the actual gtag.js download until after window.load,
  // matching the Ahrefs pattern so LCP/FCP/TBT are not impacted.
  window.addEventListener('load', function () {
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-FGCJBS9KG8';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
</script>
```

Notes:
- `gtag('config', ...)` queued before script load → GA4 records the initial pageview correctly once the script arrives.
- Coexists with Ahrefs analytics (no conflict).
- No `<noscript>` pixel inside `<head>` (against HTML5 head rules; not needed for GA4).

### 2. SPA route changes — no code needed

GA4 Enhanced Measurement → "Page changes based on browser history events" is **on by default** (visible in the screenshot under "+ 4 more"). React Router's `history.pushState` navigations are auto-tracked. No changes to `App.tsx`, `Layout.tsx`, or `SEOHead.tsx`.

### 3. Prerendered / SSR HTML pages — covered automatically

- After merge to `main`, run the **"Rebuild Prerendered Pages"** workflow (`rebuild-content.yml`) — or just push, since it can be triggered on demand.
- It rebuilds `dist/` from the new `index.html`, regenerates every static file in the prerender pass, then FTP-deploys to Hostinger.
- Result: every existing page in `html-site/services/*`, `html-site/blog/*`, SEO landing pages, etc. ships with the tag.
- Every **future** page (new blog post, new builder page, new service) inherits it the same way — no further edits.

## What is NOT touched

- Supabase (no migrations, no schema, no edge function, no RLS).
- React components (`Layout`, `SEOHead`, router, builder, admin).
- `package.json` / dependencies (gtag.js loads from Google's CDN at runtime).
- `vite.config.ts` / build pipeline.
- Performance posture: deferred load preserves current LCP/FCP and PageSpeed cache work.

## Verification (after deploy)

1. Open `https://smilz.net/` → DevTools → Network → filter `collect?` → confirm `google-analytics.com/g/collect` request fires.
2. GA4 → **Reports → Realtime** → confirm own visit appears.
3. Re-run Google's **"Test your website"** button in Web stream details — should succeed.
4. Spot-check a blog post, a service page, an SEO landing page, and a CMS-built page — all should fire `collect`.
5. Navigate between SPA routes — confirm an additional `collect` per navigation (Enhanced Measurement page_view).

## Rollback

Delete the snippet from `index.html` and rerun the rebuild workflow. ~30-second reversal.

## Files touched

- `index.html` — one ~15-line block added after the Ahrefs script.

No other files modified. No CI/workflow file changes required.
