/**
 * Single source of truth for all prerenderable / sitemap routes.
 * Used by both scripts/prerender.mjs and scripts/generate-sitemap.mjs
 * so the two can never drift apart.
 *
 * Each route: { path, type, priority, changefreq, lastmod? }
 */

const STATIC_ROUTES = [
  { path: "/",                                  type: "core",    priority: "1.0", changefreq: "weekly" },
  { path: "/services/",                         type: "core",    priority: "0.9", changefreq: "weekly" },
  { path: "/about/",                            type: "core",    priority: "0.7", changefreq: "monthly" },
  { path: "/contact/",                          type: "core",    priority: "0.7", changefreq: "monthly" },
  { path: "/gallery/",                          type: "core",    priority: "0.6", changefreq: "monthly" },
  { path: "/blog/",                             type: "core",    priority: "0.8", changefreq: "daily" },
  // SEO landing pages
  { path: "/dentist-in-kolkata/",               type: "seo",     priority: "0.9", changefreq: "monthly" },
  { path: "/dental-clinic-in-garia-kolkata/",   type: "seo",     priority: "0.9", changefreq: "monthly" },
  { path: "/root-canal-treatment-kolkata/",     type: "seo",     priority: "0.9", changefreq: "monthly" },
  { path: "/dental-implants-kolkata/",          type: "seo",     priority: "0.9", changefreq: "monthly" },
  { path: "/braces-aligners-kolkata/",          type: "seo",     priority: "0.9", changefreq: "monthly" },
];

// Routes never to prerender or include in sitemap
export const SKIP_PREFIXES = ["/admin", "/login", "/referral", "/preview"];

const withTrailingSlash = (p) => (p.endsWith("/") ? p : `${p}/`);

async function fetchTable(path) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[routes] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — dynamic routes will be skipped");
    return [];
  }
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      console.warn(`[routes] ${path} → ${r.status}`);
      return [];
    }
    return await r.json();
  } catch (err) {
    console.warn(`[routes] fetch failed for ${path}:`, err.message);
    return [];
  }
}

/**
 * Returns the full list of routes for both prerender and sitemap.
 */
export async function getAllRoutes() {
  const [services, posts, builtPages] = await Promise.all([
    fetchTable("services?select=slug,updated_at&is_active=eq.true"),
    fetchTable("blog_posts?select=slug,updated_at,published_at&is_published=eq.true"),
    fetchTable("page_layouts?select=page_slug,updated_at&is_published=eq.true"),
  ]);

  const dynamicRoutes = [
    ...services.map((s) => ({
      path: `/services/${s.slug}/`,
      type: "service",
      priority: "0.8",
      changefreq: "monthly",
      lastmod: (s.updated_at || new Date().toISOString()).split("T")[0],
    })),
    ...posts.map((p) => ({
      path: `/blog/${p.slug}/`,
      type: "blog",
      priority: "0.7",
      changefreq: "monthly",
      lastmod: (p.updated_at || p.published_at || new Date().toISOString()).split("T")[0],
    })),
    ...builtPages
      .filter((pg) => pg.page_slug && !["home", "about", "services", "contact", "blog", "gallery"].includes(pg.page_slug))
      .map((pg) => ({
        path: `/p/${pg.page_slug}/`,
        type: "builder",
        priority: "0.6",
        changefreq: "monthly",
        lastmod: (pg.updated_at || new Date().toISOString()).split("T")[0],
      })),
  ];

  // Deduplicate by normalized path
  const seen = new Set();
  const all = [...STATIC_ROUTES, ...dynamicRoutes].filter((r) => {
    const norm = withTrailingSlash(r.path);
    if (seen.has(norm)) return false;
    seen.add(norm);
    r.path = norm;
    return !SKIP_PREFIXES.some((p) => norm.startsWith(p));
  });

  return all;
}
