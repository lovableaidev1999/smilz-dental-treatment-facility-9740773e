## Goal
Make the deploy workflow reliably upload `dist/services/index.html` before live sitemap validation, so `/services/` stops returning 403.

## Diagnosis
The previous backfill is in `scripts/prerender.mjs`, but the workflow still fails on live `/services/`. That means either:
- the workflow run did not include the changed prerender script, or
- `lftp mirror --only-newer` is not uploading the newly backfilled `dist/services/index.html` because its timestamp/size does not appear newer than the remote state, or
- the backfilled file is overwritten/omitted before upload.

The strongest fix is to add an explicit verification/backfill step in `deploy.yml` after prerender and before FTP upload, independent of the prerender script.

## Plan
1. **Add a CI filesystem guard after prerender**
   - In `.github/workflows/deploy.yml`, add a step after `Prerender public pages` and before `Write deploy marker`.
   - The step checks every `<loc>` in `dist/sitemap.xml`.
   - For each site route, it verifies the corresponding `dist/<route>/index.html` exists.
   - If missing, it creates the folder and copies `dist/index.html` there.
   - It specifically logs whether `dist/services/index.html` exists.

2. **Force lftp to upload HTML changes**
   - Keep incremental upload, but change the upload command so HTML/index files are not skipped due to `--only-newer` timestamp edge cases.
   - Preferred: remove `--only-newer` from `lftp mirror`, while keeping exclusions and parallel upload.
   - This makes the deploy slower but much safer: changed/backfilled HTML files definitely reach Hostinger.

3. **Keep validator hint as-is**
   - `scripts/validate-sitemap.mjs` already explains the 403 cause clearly.
   - No further validator logic change is needed.

4. **Optional cleanup**
   - Keep the `scripts/prerender.mjs` backfill as an earlier safety net.
   - The workflow guard becomes the final pre-upload safety net.

## Expected result
On the next `Build & Deploy to Hostinger` run:
- CI logs show `dist/services/index.html` exists before FTP.
- FTP uploads that file.
- `node scripts/validate-sitemap.mjs dist/sitemap.xml --live` returns 200 for `/services/` and passes.