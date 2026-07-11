## Confirmed root cause

Fresh fetch of `https://smilz.net/` (cache-busted) returns a 2,913-byte SPA shell containing `G-TKL5QY7LVS` — an old Google Analytics tag. The current project uses `G-FGCJBS9KG8`. `public_html/index.html` on Hostinger is a stale file from an old build and is not being overwritten by recent deployments.

In `.github/workflows/deploy.yml`, after `cd "$FTP_PATH"` the workflow does:

```
put -O / "dist/index.html"
cls -l "index.html"
```

`-O /` is an **absolute FTP path** and uploads to the FTP account root, not `public_html`. The follow-up `cls -l "index.html"` lists the stale `public_html/index.html` and reports a false-positive `home_index_uploaded=true`. The mirror step, which does use relative paths and does target `public_html`, is not overwriting the stale file reliably — either because the explicit `put` runs after it and appears to "succeed", or because mirror's skip heuristics don't trigger on this file. Every other route is uploaded with relative paths and reaches `public_html` correctly, which is why only `/` is stale.

## Classification

Deployment issue only. Not caching, not asset loading, not React rendering, not an incorrect built `dist/index.html`.

## Scope

Modify `.github/workflows/deploy.yml` only. No React, `.htaccess`, prerender, or other file changes.

## Changes to `.github/workflows/deploy.yml`

1. **Fix the home upload target so it lands in `public_html`**
   - Replace `put -O / "dist/$HOME_INDEX"` with `put -O ./ "dist/$HOME_INDEX"` (relative to the lftp cwd, which is already `$FTP_PATH` = `public_html`).
   - Leave the `mirror` step untouched.

2. **Prove the uploaded home is the new build (not the stale one)**
   - Before FTP, expose the local `dist/index.html` sha256 and byte size as step outputs (`expected_home_sha256`, `expected_home_size`). The existing "Route index guard" step already computes both.
   - After `put`, run `cls --size "index.html"` inside lftp and echo `__HOME_INDEX_SIZE__ <bytes>` into the log. Grep for that marker and compare to `expected_home_size`. Set `home_index_uploaded=true` only on match; otherwise `false`.

3. **Verify the deploy marker before verifying the home markup**
   - Reorder steps so `Verify Deploy` (per-run marker asset under `/assets/`) runs immediately after the FTP step, before `Verify / (home) route`. The marker filename is unique per commit, so a 200 with the correct SHA proves the new build reached `public_html`.

4. **Home verification: distinguish upload failure from cache lag**
   - Keep the 24-attempt hero-string check (`Bridging Gaps|Call Now|4\.8 Google Rating`). Also accept `G-FGCJBS9KG8` (current GA ID) as a positive signal.
   - After the retry window branch on `steps.ftp_deploy.outputs.home_index_uploaded`:
     - `false` → hard fail (upload path bug).
     - `true` and response still stale → emit a warning with size + head of body and exit 0. This matches the existing behavior of `Verify Deploy` for edge-cache lag.

5. **Upload `.htaccess` explicitly and verify**
   - `mirror` already uploads it, but add a post-mirror `put -O ./ "dist/.htaccess"` followed by `cls -l ".htaccess"` and an `__HTACCESS_CONFIRMED__` marker so the `www → apex` 301 is guaranteed to land on every run.

## Files to modify

- `.github/workflows/deploy.yml` (only)

## Expected impact on the live site

- Next workflow run: `public_html/index.html` is overwritten with the current prerendered home. `https://smilz.net/` renders exactly like the Lovable preview.
- Every other page, redirect, edge function, sitemap entry, and asset: unchanged. Same commands, same relative paths as today.
- False-positive uploads eliminated (size/hash comparison instead of listing an existing filename).
- Hostinger/LiteSpeed cache lag after a confirmed upload is reported as a warning, not a failure.

## Risk

Low. Only lftp path arguments, an added size check, and the ordering of two verification steps change. Worst case is a loud, early workflow failure — never a silent regression on live pages.