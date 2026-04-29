import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://smilz.net";

/** Ensure every URL ends with a trailing slash */
const withTrailingSlash = (path: string) =>
  path.endsWith("/") ? path : `${path}/`;

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/services/", priority: "0.9", changefreq: "weekly" },
  { loc: "/about/", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact/", priority: "0.7", changefreq: "monthly" },
  { loc: "/gallery/", priority: "0.6", changefreq: "monthly" },
  { loc: "/blog/", priority: "0.8", changefreq: "daily" },
  { loc: "/referral/", priority: "0.6", changefreq: "monthly" },
];

/** Routes explicitly excluded from the sitemap */
const EXCLUDED = new Set(["/login", "/admin", "/referral-register", "/admin/login", "/admin/reset-password", "/preview"]);

const Sitemap = () => {
  useEffect(() => {
    const generate = async () => {
      const [{ data: posts }, { data: services }, { data: builtPages }] = await Promise.all([
        supabase.from("blog_posts").select("slug, updated_at, published_at").eq("is_published", true),
        supabase.from("services").select("slug, updated_at").eq("is_active", true),
        supabase.from("page_layouts").select("page_slug, updated_at, is_published").eq("is_published", true),
      ]);

      const seen = new Set<string>();
      const entries: string[] = [];

      const addUrl = (loc: string, lastmod?: string, changefreq = "monthly", priority = "0.5") => {
        const normalized = withTrailingSlash(loc);
        if (seen.has(normalized) || EXCLUDED.has(loc.replace(SITE, ""))) return;
        seen.add(normalized);

        let entry = `  <url>\n    <loc>${normalized}</loc>\n`;
        if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
        entry += `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
        entries.push(entry);
      };

      // Static pages
      for (const p of staticPages) {
        addUrl(`${SITE}${p.loc}`, undefined, p.changefreq, p.priority);
      }

      // Dynamic service pages
      for (const s of services ?? []) {
        const lastmod = (s.updated_at || new Date().toISOString()).split("T")[0];
        addUrl(`${SITE}/services/${s.slug}`, lastmod, "monthly", "0.8");
      }

      // Dynamic blog posts
      for (const p of posts ?? []) {
        const lastmod = (p.updated_at || p.published_at || new Date().toISOString()).split("T")[0];
        addUrl(`${SITE}/blog/${p.slug}`, lastmod, "monthly", "0.7");
      }

      // CMS-built pages (/p/slug)
      for (const pg of builtPages ?? []) {
        const lastmod = (pg.updated_at || new Date().toISOString()).split("T")[0];
        addUrl(`${SITE}/p/${(pg as any).page_slug}`, lastmod, "monthly", "0.6");
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

      // Serve as XML – replace the document with raw XML output
      document.open("application/xml");
      document.write(xml);
      document.close();
    };

    generate();
  }, []);

  return <div className="p-8 text-muted-foreground">Generating sitemap…</div>;
};

export default Sitemap;
