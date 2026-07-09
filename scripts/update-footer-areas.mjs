#!/usr/bin/env node
/**
 * Replaces the footer's "Areas We Serve" list with the 6 master hub links.
 *
 * Idempotent: re-running just re-writes the same array. Other footer fields
 * (show_areas_we_serve, etc.) are preserved via a read-modify-write.
 *
 * Required env (when actually writing):
 *   SUPABASE_URL                 (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY    (preferred — bypasses RLS)
 *
 * Usage:
 *   node scripts/update-footer-areas.mjs
 *   node scripts/update-footer-areas.mjs --dry-run
 */
import { HUBS } from "./location-pages.config.mjs";

const REAL_SUPABASE_URL = "https://eukymrxxmvkchxfpjjuz.supabase.co";
const REAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1a3ltcnh4bXZrY2h4ZnBqanV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzg1NTksImV4cCI6MjA5MDYxNDU1OX0.rtXAdsH4BDwRd4zBScoB-sleoQAPTeWPZsExBcM79Fc";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || REAL_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  REAL_SUPABASE_ANON_KEY;

const DRY_RUN = process.argv.includes("--dry-run");

const newAreas = HUBS.map((h) => ({ label: h.name, path: `/${h.slug}/` }));

async function main() {
  console.log(`[footer] New areas_we_serve list (${newAreas.length} hubs):`);
  for (const a of newAreas) console.log(`  - ${a.label.padEnd(28)} → ${a.path}`);

  if (DRY_RUN) {
    console.log(`[footer] Dry run — no writes performed.`);
    return;
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  // site_settings is a key/value table: { key: 'footer', value: jsonb }.
  // 1. Read the current footer row.
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/site_settings?select=key,value&key=eq.footer`,
    { headers },
  );
  if (!r.ok) {
    console.error(`[footer] Read failed: ${r.status} ${await r.text()}`);
    process.exit(1);
  }
  const rows = await r.json();
  const existingValue = rows.length ? (rows[0].value || {}) : {};

  const nextValue = {
    ...existingValue,
    show_areas_we_serve: true,
    areas_we_serve: newAreas,
  };

  // 2. Upsert (insert if missing, update if present) on the `key` column.
  const u = await fetch(
    `${SUPABASE_URL}/rest/v1/site_settings?on_conflict=key`,
    {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        key: "footer",
        value: nextValue,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!u.ok) {
    const body = await u.text();
    const isRls = u.status === 401 || u.status === 403 || body.includes("row-level security");
    const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (isRls && !usingServiceRole) {
      console.warn(`[footer] ⚠️  Write blocked by RLS (${u.status}). Skipping footer update.`);
      console.warn(`[footer]     To enable: add SUPABASE_SERVICE_ROLE_KEY to GitHub Actions secrets.`);
      console.warn(`[footer]     Response: ${body}`);
      console.warn(`[footer] Continuing — this is a soft failure, does not block deploy.`);
      return;
    }
    console.error(`[footer] Write failed: ${u.status} ${body}`);
    process.exit(1);
  }
  console.log(`[footer] Updated site_settings[key=footer].value.areas_we_serve with the 6 hub links.`);
}

main().catch((e) => {
  console.error("[footer] Fatal:", e);
  process.exit(1);
});
