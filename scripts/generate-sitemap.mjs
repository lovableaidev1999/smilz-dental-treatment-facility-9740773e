/**
 * Build-time sitemap generator.
 * Writes a real XML sitemap to dist/sitemap.xml using Supabase data.
 * Run AFTER `vite build`, before deployment.
 */
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = "https://smilz.net";

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/services/", priority: "0.9", changefreq: "weekly" },
  { loc: "/about/", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact/", priority: "0.7", changefreq: "monthly" },
  { loc: "/gallery/", priority: "0.6", changefreq: "monthly" },
  { loc: "/blog/", priority: "0.8", changefreq: "daily" },
  // SEO landing pages
  { loc: "/dentist-in-kolkata/", priority: "0.9", changefreq: "monthly" },
  { loc: "/dental-clinic-in-garia-kolkata/", priority: "0.9", changefreq: "monthly" },
  { loc: "/root-canal-treatment-kolkata/", priority: "0.9", changefreq: "monthly" },
  { loc: "/dental-implants-kolkata/", priority: "0.9", changefreq: "monthly" },
  { loc: "/braces-aligners-kolkata/", priority: "0.9", changefreq: "monthly" },
];

const withTrailingSlash = (p) => (p.endsWith("/") ? p : `${p}/`);

async function fetchTable(path) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

async function main() {
  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

  const [services, posts, builtPages] = await Promise.all([
    fetchTable("services?select=slug,updated_at&is_active=eq.true"),
    fetchTable("blog_posts?select=slug,updated_at,published_at&is_published=eq.true"),
    fetchTable("page_layouts?select=slug,updated_at&is_published=eq.true"),
  ]);

  const seen = new Set();
  const entries = [];

  const add = (loc, lastmod, changefreq, priority) => {
    const norm = withTrailingSlash(loc);
    if (seen.has(norm)) return;
    seen.add(norm);
    let e = `  <url>\n    <loc>${SITE}${norm}</loc>\n`;
    if (lastmod) e += `    <lastmod>${lastmod}</lastmod>\n`;
    e += `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    entries.push(e);
  };

  for (const p of STATIC_PAGES) add(p.loc, undefined, p.changefreq, p.priority);

  for (const s of services) {
    const lastmod = (s.updated_at || new Date().toISOString()).split("T")[0];
    add(`/services/${s.slug}`, lastmod, "monthly", "0.8");
  }
  for (const p of posts) {
    const lastmod = (p.updated_at || p.published_at || new Date().toISOString()).split("T")[0];
    add(`/blog/${p.slug}`, lastmod, "monthly", "0.7");
  }
  for (const pg of builtPages) {
    const lastmod = (pg.updated_at || new Date().toISOString()).split("T")[0];
    add(`/p/${pg.slug}`, lastmod, "monthly", "0.6");
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  writeFileSync(join(DIST, "sitemap.xml"), xml);
  console.log(`[sitemap] ✓ Wrote dist/sitemap.xml with ${entries.length} URLs`);
}

main().catch((err) => {
  console.error("[sitemap] Fatal:", err);
  process.exit(1);
});
