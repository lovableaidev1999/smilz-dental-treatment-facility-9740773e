## Plan

1. Update `.github/workflows/deploy.yml` so the deploy marker upload is no longer dependent on a potentially incorrect `$FTP_PATH/assets` path.
2. Make the `lftp` deploy step explicitly create and enter the configured remote publish directory, then mirror `dist/` into that directory.
3. Upload the SHA marker file last using a relative `assets/` target from inside the remote publish directory, ensuring it lands at `/assets/deploy-marker-<sha>.js` on the live site.
4. Add a quick post-upload remote listing/check inside the FTP session for `assets/deploy-marker-<sha>.js` so the action fails earlier if the marker was not actually placed on the server.
5. Keep the existing HTTP verification step, but optionally add a short initial wait before the retry loop for Hostinger propagation.

## Technical details

The current verification fails with 404 even though FTP reports success. The likely issue is that the marker is being uploaded to a path that does not map to the public `/assets/...` URL, or the marker upload command succeeds without proving the file exists in the target directory. The fix will make the remote working directory deterministic and verify the marker exists remotely before the HTTP curl check runs.