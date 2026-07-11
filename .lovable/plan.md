
## Problems

1. **`https://www.smilz.net/services/`** renders an unstyled/broken page while `https://smilz.net/services` is correct. Root cause: no www → non-www 301 in `public/.htaccess`, so the `www` host serves an inconsistent variant (memory says canonical is `smilz.net` non-www, enforced via `.htaccess`).
2. **`https://smilz.net/` home hero** shows an outdated centered layout ("Bridging Gaps… Spreading Smiles!" red text overlapping the H1, small centered title, no CTA buttons, no rating strip) — while the Lovable preview shows the correct hero (yellow eyebrow, big left-aligned H1, description, Book Appointment + Call Now buttons, "4.8 Google Rating / Since 1999 / Advanced Technology" row). Root cause: the hosted `dist/index.html` (and/or `html-site/` prerender for `/`) contains a stale prerendered snapshot of the old Home hero. Because `index.html` is served with `no-cache` but the prerender output is baked in at build time, the visitor sees the old markup until React hydrates — and if the JS bundle is cached against an older hash, hydration keeps the stale DOM. Home is a `FORCE_FALLBACK` slug, so `src/pages/Home.tsx` is the source of truth; the fix is a fresh full rebuild + re-prerender + FTP upload so the on-disk `index.html` matches current `Home.tsx`.

## Fix

### Part A — canonical host redirect (fixes /services/ on www)

Insert at the top of `public/.htaccess`, right after `RewriteBase /` and before all other rules:

```apache
# ── Canonical host: force www.smilz.net → smilz.net (301) ──
RewriteCond %{HTTP_HOST} ^www\.smilz\.net$ [NC]
RewriteRule ^(.*)$ https://smilz.net/$1 [R=301,L]
```

- Uses `[R=301,L]` so any URL under `www.` normalizes to the canonical host before SPA fallback, prerender rules, or MIME handling runs.
- No React changes needed — `src/lib/canonicalUrl.ts` already normalizes canonical tags to `https://smilz.net`.

### Part B — refresh the hosted home hero (fixes stale `/` render)

The React source is already correct (`Home.tsx` renders the hero shown in the preview). We only need the hosted `index.html` and prerender output to match. Two changes:

1. **Force prerender + full mirror upload for `/`** in `.github/workflows/deploy.yml`:
   - After `npm run build`, run `node scripts/prerender.mjs` unconditionally (the workflow already does — verify it isn't gated on file changes).
   - In the FTP step, add an explicit `put -O / dist/index.html` after the `lftp mirror` so the root `index.html` is guaranteed to overwrite the stale copy (same pattern already used for `services/index.html`).
   - Add a proof block that logs `sha256` of `dist/index.html` before upload, so we can confirm which build reached Hostinger.

2. **Post-deploy home verification** (mirrors the `/services/` retry loop already added):
   - Before running the sitemap validator, `curl -L https://smilz.net/?cb=<ts>` and `grep` for a distinctive string from the current hero (e.g. `"Bridging Gaps… Spreading Smiles!"` eyebrow class or the `Book Appointment` + `Call Now` CTA pair) to confirm the fresh HTML is live. Fail the deploy if not found.

No changes to `src/pages/Home.tsx` — the React version is already what the user wants. This is purely a deploy/asset-freshness issue.

### Part C — bust the browser cache on the visitor side (optional but recommended)

Because `.htaccess` sets `Cache-Control: no-cache, no-store, must-revalidate` on `.html`, the moment the new `index.html` reaches Hostinger every browser gets it. But the JS bundle is `max-age=31536000, immutable` and only cache-busts on hash change. Vite already emits hashed bundle filenames, so a fresh build produces new hashes — no extra config needed. Just make sure the CI runs `npm run build` fresh (no cached `dist/`) which the workflow already does.

## Verification after deploy

1. `curl -I https://www.smilz.net/services/` → `301` with `Location: https://smilz.net/services/`.
2. `curl -I https://smilz.net/services/` → `200`, styled page.
3. `curl -sL https://smilz.net/ | grep -i "Bridging Gaps"` → matches the new hero eyebrow (yellow), and `grep -i "Call Now"` matches the CTA.
4. Home + Services load visually identical to the Lovable preview (screenshots 1 and 2 of the earlier upload set).

## Files to change

- `public/.htaccess` — insert the www→non-www 301 block near the top.
- `.github/workflows/deploy.yml` — add explicit `put -O / dist/index.html` upload + sha256 proof for the home page, and a post-deploy `curl` check for `/` that greps for a hero-specific string before running the sitemap validator.

Nothing changes in React source code (Home / Services already render correctly in the preview).
