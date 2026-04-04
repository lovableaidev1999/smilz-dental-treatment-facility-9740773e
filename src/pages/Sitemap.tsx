import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://smilz.net";

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/services", priority: "0.9", changefreq: "weekly" },
  { loc: "/about", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact", priority: "0.7", changefreq: "monthly" },
  { loc: "/gallery", priority: "0.6", changefreq: "monthly" },
  { loc: "/blog", priority: "0.8", changefreq: "daily" },
  { loc: "/referral", priority: "0.5", changefreq: "monthly" },
];

const Sitemap = () => {
  useEffect(() => {
    const generate = async () => {
      const [{ data: posts }, { data: services }] = await Promise.all([
        supabase.from("blog_posts").select("slug, updated_at, published_at").eq("is_published", true),
        supabase.from("services").select("slug, updated_at").eq("is_active", true),
      ]);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const p of staticPages) {
        xml += `  <url>\n    <loc>${SITE}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
      }

      for (const s of services ?? []) {
        xml += `  <url>\n    <loc>${SITE}/services/${s.slug}</loc>\n    <lastmod>${(s.updated_at || new Date().toISOString()).split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }

      for (const p of posts ?? []) {
        const lastmod = (p.updated_at || p.published_at || new Date().toISOString()).split("T")[0];
        xml += `  <url>\n    <loc>${SITE}/blog/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;

      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      window.location.replace(url);
    };

    generate();
  }, []);

  return <div className="p-8 text-muted-foreground">Generating sitemap…</div>;
};

export default Sitemap;
