# Weekly Supabase Database Backup System

Based on your sample YAML, here is the finalized plan adapted for **Sunday 12:00 AM IST**, **Supabase Storage** as the backup destination, and **Resend** for email notifications to `dr.d.dutta@gmail.com`.

## Architecture

```text
GitHub Actions (cron: Sun 00:00 IST = Sat 18:30 UTC)
        │
        ├── pg_dump (Postgres 17 client) → db_backup_YYYY_MM_DD.sql
        ├── Upload to Supabase Storage bucket "backups"
        └── Resend API → dr.d.dutta@gmail.com
                         (✅ success or ❌ failure)
```

## File to Create

### `.github/workflows/db-backup.yml`
Based on your sample, with these changes:
- **Cron**: `30 18 * * 6` (Saturday 18:30 UTC = **Sunday 00:00 IST**) instead of `0 2 * * *`
- **Manual trigger** (`workflow_dispatch`) kept for on-demand backups
- **Filename**: `db_backup_YYYY_MM_DD.sql` (date only, since it's weekly)
- **Email recipient**: `dr.d.dutta@gmail.com` (hardcoded)
- **From address**: read from `BACKUP_FROM_EMAIL` secret (so you can switch to a verified domain later without editing the workflow)
- **Failure email**: includes a direct link to the failed GitHub Actions run for quick troubleshooting
- **Success email**: includes filename, bucket name, and timestamp
- Uses your exact pattern: PostgreSQL 17 client install, `pg_dump --clean --if-exists --no-owner`, multipart upload via curl to `/storage/v1/object/backups/<file>`

## What You Need to Do in Supabase Dashboard

### 1. Create the Storage Bucket
- Go to **Storage** → **New bucket**
- Name: **`backups`** (must match exactly)
- Public: **OFF** (keep it private — only service role can access)
- Click **Create**

### 2. Get the Database Connection String
- **Project Settings** → **Database** → **Connection string** → **URI** tab
- Use the **Session pooler** or **Direct connection** string
- Replace `[YOUR-PASSWORD]` with your actual database password
- Full string looks like: `postgresql://postgres.eukymrxxmvkchxfpjjuz:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres`

### 3. Get the Service Role Key
- **Project Settings** → **API** → copy the **`service_role`** key (NOT anon)

## What You Need to Do in Resend

1. Sign up at **resend.com** (free tier: 100 emails/day — way more than enough)
2. **Verify a sending domain** (e.g. `smilz.net`) for production. For initial testing you can use `onboarding@resend.dev` as the from address.
3. Go to **API Keys** → **Create API Key** → copy it

## GitHub Actions Secrets to Add

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Value |
|---|---|
| `SUPABASE_DB_URL` | Full Postgres URI from Supabase Dashboard step 2 |
| `SUPABASE_URL` | `https://eukymrxxmvkchxfpjjuz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from step 3 |
| `EMAIL_API_KEY` | Resend API key |
| `BACKUP_FROM_EMAIL` | `onboarding@resend.dev` for testing, or `backups@smilz.net` once domain is verified |

The recipient `dr.d.dutta@gmail.com` will be hardcoded in the workflow, so no secret is needed for it.

## Email Content

**✅ Success** — Subject: `✅ Smilz DB Backup Successful — <date>`
> Backup `db_backup_2026_05_03.sql` uploaded to Supabase Storage bucket `backups` at `<timestamp IST>`.

**❌ Failure** — Subject: `❌ Smilz DB Backup FAILED — <date>`
> Backup failed. View the run logs: `https://github.com/<owner>/<repo>/actions/runs/<run_id>`

## Testing After Setup

Once you've added all 5 secrets and created the `backups` bucket:
1. Go to **Actions** → **Database Backup** → **Run workflow** (manual trigger)
2. Within ~1 minute you should:
   - See a new `db_backup_*.sql` file in the **backups** bucket
   - Receive a success email at `dr.d.dutta@gmail.com`
3. The next automatic run will be the upcoming **Sunday 12:00 AM IST**

## Notes

- **Cron timing**: GitHub Actions runs in UTC. Sunday 00:00 IST = Saturday 18:30 UTC, hence `30 18 * * 6`. Scheduled runs may be delayed a few minutes during GitHub peak load — this is normal and acceptable for backups.
- **PostgreSQL 17** client is required because Supabase now runs Postgres 17; older `pg_dump` versions will fail with a version mismatch error.
- **Restoration**: The dump uses `--clean --if-exists --no-owner` so it can be restored to any Supabase project via `psql "<DB_URL>" < db_backup_*.sql`.
- **Retention**: Not included to keep this simple. If you want auto-deletion of dumps older than e.g. 90 days, say the word and I'll add a cleanup step.
