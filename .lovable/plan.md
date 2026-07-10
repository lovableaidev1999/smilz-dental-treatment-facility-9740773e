## Goal
Stop the `Rebuild Prerendered Pages` workflow from using `SamKirkland/FTP-Deploy-Action`, because it is still reading a stale remote sync inventory and trying to delete the already-missing `/***best-dentist-in-garia-park` folder.

## Plan
1. Update `.github/workflows/rebuild-content.yml` only.
2. Replace the `Deploy via FTP (incremental)` step that uses `SamKirkland/FTP-Deploy-Action@v4.3.5` with the safer `lftp` deployment method already used in `Build & Deploy to Hostinger`.
3. Add an `Install lftp` step before the deploy step.
4. Configure `lftp mirror -R --only-newer` so it uploads changed prerendered files without relying on the FTP action’s stale state file and without processing the corrupted delete queue.
5. Keep the existing build, sitemap generation, and prerender steps unchanged.
6. Verify the workflow no longer references `SamKirkland/FTP-Deploy-Action` or any FTP deploy sync state file in `rebuild-content.yml`.

## Expected result
The rebuild workflow deploys changed prerendered pages without attempting to remove `/***best-dentist-in-garia-park`, so the `FTPError: 550 ... No such file or directory` loop should stop.