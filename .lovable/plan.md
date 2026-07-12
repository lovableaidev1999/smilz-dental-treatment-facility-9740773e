## Goal
Install the uploaded `db-backup.yml` as a scheduled GitHub Actions workflow so the Smilz Supabase database is dumped every Sunday 00:00 IST (Saturday 18:30 UTC), stored in the `backups` Storage bucket, old backups (>30 days) pruned, and success/failure emails sent via Resend.

## File to add
- `.github/workflows/db-backup.yml` — copy of the uploaded YAML verbatim (schedule `30 18 * * 6`, `workflow_dispatch` enabled). No app code, no other workflows touched.

## Required GitHub Actions secrets (repo → Settings → Secrets and variables → Actions)
The workflow references these — they must exist in the repo for it to run:

1. `SUPABASE_DB_URL` — full Postgres connection string for the Smilz Supabase project (from Project Settings → Database → Connection string → URI, with the DB password).
2. `SUPABASE_URL` — `https://<project-ref>.supabase.co` for the Smilz project.
3. `SUPABASE_SERVICE_ROLE_KEY` — service-role key for the Smilz project (Project Settings → API).
4. `EMAIL_API_KEY` — Resend API key (`re_...`) from resend.com.
5. `BACKUP_FROM_EMAIL` — verified Resend sender, e.g. `backups@smilz.net` (domain must be verified in Resend, or use `onboarding@resend.dev` for testing).

Note: on Lovable Cloud the service role key and DB password are not exposed to me. You'll need to fetch them from the Smilz Supabase project you already own and paste them into GitHub Secrets yourself.

## Required Supabase Storage bucket
- Bucket named `backups` must exist in the Smilz Supabase project. Recommended: **private** bucket (no public policies needed — the workflow uses the service role key which bypasses RLS). If it doesn't exist yet, create it before the first run.

## Verifying the recipient
The success/failure emails hardcode `dr.d.dutta@gmail.com` as the recipient (lines 118 and 131). Leaving as-is unless you want it changed.

## How to test after adding
1. Merge/push the workflow file.
2. Add the 5 secrets above.
3. In GitHub → Actions → "Database Backup" → **Run workflow** (manual `workflow_dispatch`) to confirm the first end-to-end run succeeds and the email arrives.
4. From then on it runs automatically every Sunday 00:00 IST.

## Out of scope
- No changes to app code, `deploy.yml`, or any other workflow.
- No changes to the Supabase schema.
- Not creating the `backups` bucket or the secrets on your behalf — those require dashboard/repo access.
