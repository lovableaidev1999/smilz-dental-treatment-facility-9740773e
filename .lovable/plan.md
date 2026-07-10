## Problem

`validate-sitemap.mjs --live` reports `[403] https://smilz.net/services/` while all 375 other sitemap URLs return 200.

Root cause: `dist/services/` exists as a directory on Hostinger (its children `dist/services/<slug>/index.html` were prerendered fine), but `dist/services/index.html` itself is missing. `.htaccess` has `Options -Indexes` + `DirectoryIndex index.html`, so Apache returns **403** for a directory without an index instead of falling through to the SPA rewrite. The prerender pass for the parent route `/services/` didn't produce a file — either it was skipped (SPA returned 404 on retry), it timed out, or a concurrency race left it unwritten. Either way, live URL 403s and CI fails.

## Fix

Two-part safety net so a single prerender miss can never break the deploy again.

### 1. Post-prerender "SPA shell backfill" step

Add a small block near the end of `scripts/prerender.mjs` (after all pages are written, before writing the report) that:

- Reads every route from `getAllRoutes()` — the same source the sitemap uses.
- For each route, computes the expected file path (`dist<route>index.html`, with the root special-cased to `dist/index.html`).
- If the file does **not** exist, copies `dist/index.html` (the raw Vite SPA shell) to that location and logs `[prerender] ⚠ backfilled <route> with SPA shell`.
- Increments a new `report.backfilled` counter and adds a page entry with `status: "backfilled"` so it's visible in `prerender-report.json`.

Effect: every route in the sitemap is guaranteed to have an on-disk `index.html`. Missing prerenders degrade gracefully to a client-rendered SPA page (still crawlable via the existing prerender-for-bots strategy) instead of a 403.

### 2. Validator diagnostics improvement (optional, small)

In `scripts/validate-sitemap.mjs`, when a URL returns 403, print a hint line: `hint: likely missing <route>/index.html on server (Apache -Indexes)`. Purely to make future occurrences self-explanatory in CI logs. No behavior change.

### 3. Investigate the underlying /services/ prerender failure (follow-up, non-blocking)

In this same change, read the previous run's `prerender-report.json` if available and add a `console.warn` in `prerender.mjs` when a **core** route (`/`, `/services/`, `/about/`, `/contact/`, `/blog/`, `/gallery/`, `/referral/`) ends up in the backfilled bucket — those should never be missing, so we want a loud signal to fix the real root cause later. No hard failure, just a visible warning.

## Files to change

- `scripts/prerender.mjs` — add backfill loop + core-route warning.
- `scripts/validate-sitemap.mjs` — add 403 hint in the failure log.

Nothing to change in `.htaccess`, the workflow YAML, or the sitemap generator. `lftp mirror --only-newer` will pick the backfilled files up automatically.

## Verification

- After the change, the CI job's prerender step will log a `backfilled` line for `/services/` (or whatever route was previously missing).
- The subsequent `Validate sitemap (live HTTP)` step should see 200 for every URL.
- `dist/prerender-report.json` will contain a `backfilled` array we can inspect to chase down the real prerender failure separately, without breaking future deploys.
