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

  // 1. Read the current site_settings row.
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/site_settings?select=id,footer&limit=1`,
    { headers },
  );
  if (!r.ok) {
    console.error(`[footer] Read failed: ${r.status} ${await r.text()}`);
    process.exit(1);
  }
  const rows = await r.json();
  if (!rows.length) {
    console.error("[footer] No site_settings row exists — aborting (CMS row required).");
    process.exit(1);
  }
  const row = rows[0];

  const nextFooter = {
    ...(row.footer || {}),
    show_areas_we_serve: true,
    areas_we_serve: newAreas,
  };

  // 2. Write back.
  const u = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.${row.id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ footer: nextFooter, updated_at: new Date().toISOString() }),
  });
  if (!u.ok) {
    console.error(`[footer] Write failed: ${u.status} ${await u.text()}`);
    process.exit(1);
  }
  console.log(`[footer] Updated site_settings.footer.areas_we_serve with the 6 hub links.`);
}

main().catch((e) => {
  console.error("[footer] Fatal:", e);
  process.exit(1);
});
