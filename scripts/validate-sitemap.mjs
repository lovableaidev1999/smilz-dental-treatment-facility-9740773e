#!/usr/bin/env node
/**
 * Sitemap validator.
 *
 * 1. Parses public/sitemap.xml (or the file passed as argv[2]).
 * 2. Fails if any URL matches a "dirty slug" pattern.
 * 3. Optionally HEAD/GETs each URL and fails if any returns a non-2xx / non-3xx
 *    response. Live HTTP checks run when SITEMAP_CHECK_LIVE=1 (or --live flag);
 *    otherwise only static slug validation runs (safe for CI without network
 *    access to prod). The deploy workflow enables live checks after FTP.
 *
 * Exit 0 = clean. Exit 1 = at least one problem found.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const liveFlag = args.includes("--live") || process.env.SITEMAP_CHECK_LIVE === "1";
const fileArg = args.find((a) => !a.startsWith("--"));
const SITEMAP_PATH = fileArg
  ? (fileArg.startsWith("/") ? fileArg : join(ROOT, fileArg))
  : (existsSync(join(ROOT, "dist/sitemap.xml"))
      ? join(ROOT, "dist/sitemap.xml")
      : join(ROOT, "public/sitemap.xml"));

// Any URL whose path matches one of these = "dirty" and must never ship.
const DIRTY_PATTERNS = [
  { re: /-in-near-/i,    label: "double-preposition (-in-near-)" },
  { re: /\/near-[a-z]/i, label: "legacy near- prefix" },
  { re: /%[0-9a-f]{2}/i, label: "percent-encoded (emoji/non-ASCII) slug" },
];

const CONCURRENCY = 12;
const TIMEOUT_MS = 15000;

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

function findDirty(urls) {
  const bad = [];
  for (const u of urls) {
    for (const p of DIRTY_PATTERNS) {
      if (p.re.test(u)) bad.push({ url: u, reason: p.label });
    }
  }
  return bad;
}

async function checkOne(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Use GET (not HEAD) — some Hostinger/Apache setups return 405 for HEAD
    // on prerendered .html files served via .htaccess rewrites.
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "smilz-sitemap-validator/1.0" },
    });
    return { url, status: r.status, finalUrl: r.url, ok: r.status >= 200 && r.status < 400 };
  } catch (e) {
    return { url, status: 0, error: e.message, ok: false };
  } finally {
    clearTimeout(t);
  }
}

async function runPool(items, worker, size) {
  const results = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  if (!existsSync(SITEMAP_PATH)) {
    console.error(`[validate-sitemap] ✗ sitemap not found at ${SITEMAP_PATH}`);
    process.exit(1);
  }
  const xml = readFileSync(SITEMAP_PATH, "utf8");
  const urls = extractLocs(xml);
  console.log(`[validate-sitemap] Loaded ${urls.length} URLs from ${SITEMAP_PATH}`);

  // 1) Static dirty-slug check — always runs
  const dirty = findDirty(urls);
  if (dirty.length) {
    console.error(`[validate-sitemap] ✗ ${dirty.length} dirty slug(s) found:`);
    for (const d of dirty) console.error(`   - ${d.url}   [${d.reason}]`);
    process.exit(1);
  }
  console.log("[validate-sitemap] ✓ No dirty slugs");

  if (!liveFlag) {
    console.log("[validate-sitemap] Skipping live HTTP checks (pass --live or SITEMAP_CHECK_LIVE=1 to enable)");
    return;
  }

  // 2) Live HTTP check
  console.log(`[validate-sitemap] Checking ${urls.length} URLs with concurrency=${CONCURRENCY}...`);
  const results = await runPool(urls, checkOne, CONCURRENCY);
  const failed = results.filter((r) => !r.ok);
  const summary = results.reduce((acc, r) => {
    const k = r.status || "ERR";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  console.log(`[validate-sitemap] Status distribution: ${JSON.stringify(summary)}`);

  if (failed.length) {
    console.error(`[validate-sitemap] ✗ ${failed.length} URL(s) did not return 2xx/3xx:`);
    for (const f of failed.slice(0, 50)) {
      console.error(`   - [${f.status || "ERR"}] ${f.url}${f.error ? "  " + f.error : ""}`);
    }
    if (failed.length > 50) console.error(`   ...and ${failed.length - 50} more`);
    process.exit(1);
  }
  console.log(`[validate-sitemap] ✓ All ${urls.length} URLs return a valid response`);
}

main().catch((e) => {
  console.error("[validate-sitemap] Fatal:", e);
  process.exit(1);
});
