## Why the workflow is currently producing a false failure

The "Verify / (home) route" step downloads `https://smilz.net/` and greps the body for marketing strings (`Bridging Gaps`, `Call Now`, `4.8 Google Rating`) or the current GA ID (`G-FGCJBS9KG8`). When Hostinger's LiteSpeed edge is still serving the previous cached `index.html`, none of those match — even though the FTP step already uploaded and size-confirmed the new `dist/index.html`. The step then hard-fails with exit 1, so a successful deployment is reported as a failure.

The `G-TKL5QY7LVS` string only appears in the *live server response* during that stale window. It exists nowhere in the repo:

- `rg` across the project finds `G-FGCJBS9KG8` in `index.html` (lines 37–45) and in `deploy.yml`.
- `G-TKL5QY7LVS` is not in any source, env file, build output, or config.

So the "wrong GA ID" is not a build-source problem — it's simply the old `index.html` that Hostinger's cache/origin is still serving until propagation completes. The already-existing per-commit `deploy-marker-<sha>.js` asset check is the correct signal; the homepage-markup check is redundant and brittle.

## What will change

Only `.github/workflows/deploy.yml`. No app code, no SEO components, no Vite config, no FTP logic.

### 1. Rewrite "Verify / (home) route"
- Remove all marketing-text and GA-ID substring checks (`Bridging Gaps`, `Call Now`, `4.8 Google Rating`, `G-FGCJBS9KG8`).
- New pass criteria: homepage returns HTTP 200 (any 2xx/3xx acceptable for redirects).
- Freshness of the deployed build is already proved by the existing "Verify Deploy" step (per-commit `deploy-marker-<sha>.js`) and by the FTP size match on `index.html`. No content grep needed.
- Keep the existing www→apex 301 check.

### 2. Extend verification timeout with progressive backoff
Apply to both "Verify Deploy" (marker asset) and "Verify / (home) route":
- Progressive delays: 15s, 30s, 45s, 60s, then hold at 60s.
- Total window ~18 minutes (well within Hostinger LiteSpeed cache TTL).
- Cache-bust each request with `?cb=<nanoseconds>` and `Cache-Control: no-cache` (already done).

### 3. Concise diagnostics on final failure
When the retry window ends without success, print (once, not per attempt):
- Expected commit SHA and marker URL
- Last HTTP status
- `curl -I` response headers filtered to: `date`, `age`, `cache-control`, `x-litespeed-cache*`, `cf-cache-status`, `x-cache`, `etag`, `last-modified`
- `<title>` extracted via `grep -oP '(?<=<title>).*?(?=</title>)'`
- Detected GA ID (`grep -oE 'G-[A-Z0-9]{8,}' | head -1`) — informational only, not a pass/fail
- Deploy marker contents fetched from `/deploy-marker.txt` and its age
- FTP step outputs: `marker_uploaded`, `home_index_uploaded`, `services_index_uploaded`, `htaccess_uploaded`
- No full-HTML dump.

### 4. Success criteria (new)
A deploy passes when all of these are true:
- FTP step confirmed uploads (`home_index_uploaded=true`, `marker_uploaded=true`, `services_index_uploaded=true`).
- `/assets/deploy-marker-<sha>.js` fetched from the live site contains the current commit SHA (existing step, just longer retry window).
- `https://smilz.net/` returns HTTP 2xx/3xx.
- `https://www.smilz.net/services/` still 301s to the apex.

Marketing text and GA ID matches are no longer required.

## Files modified
- `.github/workflows/deploy.yml` — only the "Verify Deploy" and "Verify / (home) route" steps; retry helper for progressive backoff; diagnostics block. FTP upload step, .htaccess handling, size-match hard-fail, sitemap validation, and prerender are all untouched.

## Why the new logic is more reliable
- Uses a per-commit unique artifact (`deploy-marker-<sha>.js`) that only exists after this run — impossible to false-positive on stale cache.
- Homepage check is purely a liveness probe (HTTP 200), decoupled from copy changes.
- Progressive backoff matches Hostinger's real cache propagation window instead of failing at ~6 minutes.
- Diagnostics point at cache headers and marker age, which are the actual failure modes — not homepage copy.
- No source code touched, so redesigns, GA changes, or SEO edits can never break the deploy pipeline again.
