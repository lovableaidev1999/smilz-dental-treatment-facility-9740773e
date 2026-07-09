/**
 * Build-time sitemap generator.
 * Writes a real XML sitemap to dist/sitemap.xml using the central route source
 * (scripts/_routes.mjs) so sitemap and prerender can never drift apart.
 * Run AFTER `vite build`, before deployment.
 */
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getAllRoutes } from "./_routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PUBLIC = join(__dirname, "..", "public");
const SITE = "https://smilz.net";

async function main() {
  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

  const routes = await getAllRoutes();

  const entries = routes.map((r) => {
    let e = `  <url>\n    <loc>${SITE}${r.path}</loc>\n`;
    if (r.lastmod) e += `    <lastmod>${r.lastmod}</lastmod>\n`;
    e += `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`;
    return e;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  writeFileSync(join(DIST, "sitemap.xml"), xml);
  // Also refresh the committed public/sitemap.xml so Hostinger picks up
  // the cleaned URL set immediately on next deploy (build copies public/→dist/).
  writeFileSync(join(PUBLIC, "sitemap.xml"), xml);
  console.log(`[sitemap] ✓ Wrote dist/sitemap.xml and public/sitemap.xml with ${entries.length} URLs`);
}

main().catch((err) => {
  console.error("[sitemap] Fatal:", err);
  process.exit(1);
});
