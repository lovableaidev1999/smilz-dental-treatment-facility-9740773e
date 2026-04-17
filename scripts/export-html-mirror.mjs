#!/usr/bin/env node
/**
 * Static HTML Mirror Exporter
 * --------------------------------
 * Downloads every URL listed in https://smilz.net/sitemap.xml and writes
 * each one to ./html-site/<path>/index.html as a fully-rendered, SEO-ready
 * static page. Also writes robots.txt and sitemap.xml into the export.
 *
 * This script is READ-ONLY against the live site. It does NOT publish,
 * deploy, or modify smilz.net or the live app in any way. The output lives
 * entirely inside the local `html-site/` folder for review.
 *
 * Run:  node scripts/export-html-mirror.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const SITE_ORIGIN = "https://smilz.net";
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const OUT_DIR = path.resolve(process.cwd(), "html-site");
const CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 30_000;

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        // Identify ourselves but request the prerendered (bot) HTML.
        "User-Agent":
          "Mozilla/5.0 (compatible; SmilzStaticMirror/1.0; +https://smilz.net)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function urlToOutputPath(url) {
  const u = new URL(url);
  let p = u.pathname;
  if (p.endsWith("/")) p = p.slice(0, -1);
  if (p === "" || p === "/") return path.join(OUT_DIR, "index.html");
  return path.join(OUT_DIR, p, "index.html");
}

/**
 * Inject a small note at the top of <head> identifying the export, plus
 * make sure the canonical points back at the live URL so this offline copy
 * never accidentally competes with production for indexing.
 */
function postProcess(html, originalUrl) {
  // Force canonical to the live URL.
  const canonicalTag = `<link rel="canonical" href="${originalUrl}" />`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      canonicalTag,
    );
  } else {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n    ${canonicalTag}`);
  }

  // Mark as static export (visible only in source).
  const marker = `<!-- Static HTML mirror exported from ${originalUrl} on ${new Date().toISOString()} -->`;
  html = html.replace(/<head([^>]*)>/i, `<head$1>\n    ${marker}`);

  return html;
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function pool(items, worker, size) {
  const queue = [...items];
  const runners = Array.from({ length: size }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) break;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function main() {
  console.log(`▶ Fetching sitemap: ${SITEMAP_URL}`);
  const sitemapXml = await fetchText(SITEMAP_URL);

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(sitemapXml);
  const urls = (parsed?.urlset?.url ?? [])
    .map((u) => (typeof u === "string" ? u : u.loc))
    .filter(Boolean);

  if (urls.length === 0) {
    throw new Error("No <loc> entries found in sitemap.xml");
  }

  console.log(`▶ Found ${urls.length} URLs. Exporting to ${OUT_DIR}`);
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const results = { ok: [], failed: [] };

  await pool(
    urls,
    async (url) => {
      try {
        const html = await fetchText(url);
        const processed = postProcess(html, url);
        const outPath = urlToOutputPath(url);
        await writeFile(outPath, processed);
        results.ok.push({ url, outPath });
        console.log(`  ✓ ${url}  →  ${path.relative(process.cwd(), outPath)}`);
      } catch (err) {
        results.failed.push({ url, error: String(err) });
        console.warn(`  ✗ ${url}  (${err.message})`);
      }
    },
    CONCURRENCY,
  );

  // Copy sitemap + robots verbatim (live site already serves correct ones).
  try {
    const [sitemap, robots] = await Promise.all([
      fetchText(`${SITE_ORIGIN}/sitemap.xml`),
      fetchText(`${SITE_ORIGIN}/robots.txt`).catch(
        () => `User-agent: *\nAllow: /\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
      ),
    ]);
    await writeFile(path.join(OUT_DIR, "sitemap.xml"), sitemap);
    await writeFile(path.join(OUT_DIR, "robots.txt"), robots);
  } catch (e) {
    console.warn("Could not copy sitemap/robots:", e.message);
  }

  // Write a manifest for review.
  const manifest = {
    exportedAt: new Date().toISOString(),
    source: SITE_ORIGIN,
    totalUrls: urls.length,
    succeeded: results.ok.length,
    failed: results.failed.length,
    pages: results.ok.map((r) => ({
      url: r.url,
      file: path.relative(OUT_DIR, r.outPath),
    })),
    failures: results.failed,
    notes: [
      "This export is a READ-ONLY mirror. Nothing was published or deployed.",
      "Each page was downloaded as the prerendered HTML the live site already serves to search engines.",
      "All canonical tags point back to https://smilz.net to avoid duplicate-index risk.",
    ],
  };
  await writeFile(
    path.join(OUT_DIR, "_manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(
    `\n✔ Done. ${results.ok.length} ok, ${results.failed.length} failed. See html-site/_manifest.json`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
