## Goal
Stop the recurring live sitemap failure for `https://***/services/` by proving whether `dist/services/index.html` exists in CI and forcing that exact file to be uploaded before live validation.

## Diagnosis
The validator is still getting `403` for `/services/`, which means Hostinger is serving `/services/` as an existing directory without an `index.html`. Since the workflow now has a route-index guard, one of these is happening:

1. The GitHub workflow run is still using an older `deploy.yml` without the new guard.
2. The guard creates `dist/services/index.html`, but FTP mirror is not replacing/uploading the remote file state correctly.
3. The remote `/services/` directory exists but does not receive `index.html` before validation.
4. Hostinger cache/propagation is serving the stale 403 briefly after upload.

## Plan

### 1. Add hard proof before FTP upload
Update `deploy.yml` so the route-index guard prints a clear, grep-friendly proof block:

```text
[route-index-guard] PROOF dist/services/index.html exists
[route-index-guard] size=...
[route-index-guard] mtime=...
[route-index-guard] sha256=...
```

If `dist/services/index.html` is missing, fail immediately before FTP instead of waiting for live validation.

### 2. Force-upload the exact `/services/index.html` file after mirror
After the `lftp mirror` command, add an explicit upload command:

```text
mkdir -p services
put -O services dist/services/index.html
cls -l services/index.html
```

This bypasses any mirror/timestamp/directory edge case and directly confirms the remote file exists in FTP output.

### 3. Track the explicit services upload result
Parse the FTP output for `services/index.html` and expose a workflow output such as:

```text
services_index_uploaded=true
```

If the mirror has warnings but the marker and services index were both listed, treat the upload as successful enough to proceed.

### 4. Add a targeted `/services/` HTTP verification retry before full sitemap validation
Before running the full live sitemap validator, add a small retry loop for only:

```text
https://smilz.net/services/?cb=<timestamp>
```

If `/services/` still returns `403` but FTP confirmed `services/index.html`, log it as Hostinger cache/propagation lag and wait longer before the full sitemap validation.

### 5. Keep the full sitemap validator as the final gate
Leave `node scripts/validate-sitemap.mjs dist/sitemap.xml --live` in place. It should only run after `/services/` has been specifically verified or given enough propagation time.

## Expected result
The next CI run will show exactly where the failure is:

- If the new proof logs are missing, the workflow changes were not pushed/used.
- If the proof logs exist but FTP does not list `services/index.html`, the FTP upload is the problem.
- If FTP lists `services/index.html` but HTTP still returns 403 temporarily, it is Hostinger cache/propagation and the targeted retry absorbs it.
- If `/services/` returns 200, the full sitemap validation should pass.