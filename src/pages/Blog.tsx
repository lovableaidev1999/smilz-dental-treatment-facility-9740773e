import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useBlogPosts } from "@/integrations/supabase/hooks";

const CATEGORY_TABS = [
  { slug: "", label: "All" },
  { slug: "oral-hygiene", label: "Oral Hygiene" },
  { slug: "procedures", label: "Procedures" },
  { slug: "general-health", label: "General Health" },
  { slug: "guides", label: "Guides" },
  { slug: "awareness", label: "Awareness" },
];

const categoryToTab: Record<string, string> = {
  "oral-hygiene": "oral-hygiene", "awareness": "awareness", "guide": "guides",
  "dental-implant": "procedures", "dental-health": "general-health",
  "braces": "procedures", "orthodontics": "procedures", "rct": "procedures",
  "caries": "general-health", "veneers-and-crowns": "procedures",
  "aligners": "procedures", "emergency": "general-health",
  "diabetis": "general-health", "wisdom-tooth": "procedures",
  "decision": "guides", "general": "general-health", "uncategorized": "awareness",
};

const Blog = () => {
  const [activeTab, setActiveTab] = useState("");
  const { data: allPosts, isLoading } = useBlogPosts();
  const { data: settings } = useSiteSettings();
  const links = settings?.links;

  const filteredPosts = activeTab
    ? (allPosts ?? []).filter((p) => categoryToTab[p.category] === activeTab || p.category === activeTab)
    : (allPosts ?? []);

  return (
    <>
      <SEOHead
        title="Dental Insights & Blog"
        description={`Expert dental insights, oral health tips, and treatment guides from ${settings?.general?.clinic_name ?? "Smilz Dental Treatment Facility"} Kolkata.`}
        keywords="dental blog Kolkata, oral health tips, dental treatment guides"
        canonicalUrl={`${links?.website ?? "https://www.smilz.net"}/blog`}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://www.smilz.net" },
          { name: "Insights", url: `${links?.website ?? "https://www.smilz.net"}/blog` },
        ]}
      />

      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Dental Insights</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">Expert articles on oral health, dental procedures, and wellness tips from our team.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORY_TABS.map((tab) => (
              <button key={tab.slug} onClick={() => setActiveTab(tab.slug)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"}`}>
                {tab.label}
                {!isLoading && <span className="ml-1.5 text-xs opacity-75">({tab.slug === "" ? (allPosts ?? []).length : (allPosts ?? []).filter((p) => categoryToTab[p.category] === tab.slug || p.category === tab.slug).length})</span>}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse h-80" />)}</div>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No posts found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }} className="bg-card rounded-2xl overflow-hidden shadow-card border border-border group">
                  <Link to={`/blog/${post.slug}`}>
                    <div className="h-48 bg-secondary flex items-center justify-center overflow-hidden">
                      {post.featured_image ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <span className="text-6xl">📝</span>}
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full capitalize">{CATEGORY_TABS.find((t) => t.slug === (categoryToTab[post.category] || post.category))?.label || post.category}</span>
                      {post.published_at && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                    <Link to={`/blog/${post.slug}`}><h2 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2></Link>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                    <Link to={`/blog/${post.slug}`} className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read More <ChevronRight className="h-4 w-4" /></Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
