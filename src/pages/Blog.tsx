import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { useBlogPosts } from "@/integrations/supabase/hooks";
import { GenericSection } from "@/components/DynamicSections";
import type { PageSection } from "@/hooks/usePageContent";

const categoryToTab: Record<string, string> = {
  "oral-hygiene": "oral-hygiene", "awareness": "awareness", "guide": "guides",
  "dental-implant": "procedures", "dental-health": "general-health",
  "braces": "procedures", "orthodontics": "procedures", "rct": "procedures",
  "caries": "general-health", "veneers-and-crowns": "procedures",
  "aligners": "procedures", "emergency": "general-health",
  "diabetis": "general-health", "wisdom-tooth": "procedures",
  "decision": "guides", "general": "general-health", "uncategorized": "awareness",
};

const formatLabel = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

const getPostCategories = (p: any): string[] => {
  const cats: string[] = [];
  if (p.category) cats.push(p.category);
  if (Array.isArray(p.tags)) {
    p.tags.filter((t: string) => t.startsWith("cat:")).forEach((t: string) => {
      const c = t.slice(4);
      if (!cats.includes(c)) cats.push(c);
    });
  }
  return cats;
};

/** Resolve a raw category slug to its display tab slug */
const resolveTab = (c: string) => categoryToTab[c] || c;

const Blog = () => {
  const [activeTab, setActiveTab] = useState("");
  const { data: allPosts, isLoading } = useBlogPosts();
  const { data: settings } = useSiteSettings();
  const { sections } = usePageContent("blog");
  const links = settings?.links;
  // Build dynamic category tabs from actual post data
  const dynamicTabs = useMemo(() => {
    const posts = allPosts ?? [];
    const tabCounts = new Map<string, number>();
    posts.forEach(p => {
      const cats = getPostCategories(p);
      const resolved = new Set(cats.map(resolveTab));
      resolved.forEach(tab => tabCounts.set(tab, (tabCounts.get(tab) || 0) + 1));
    });
    const tabs = Array.from(tabCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({ slug, label: formatLabel(slug), count }));
    return [{ slug: "", label: "All", count: posts.length }, ...tabs];
  }, [allPosts]);

  const filteredPosts = activeTab
    ? (allPosts ?? []).filter((p) => {
        const cats = getPostCategories(p);
        return cats.some(c => resolveTab(c) === activeTab || c === activeTab);
      })
    : (allPosts ?? []);

  let dynamicIndex = 0;

  const renderSection = (section: PageSection) => {
    switch (section.section_id) {
      case "hero":
        return (
          <section key={section.id} className="bg-gradient-primary text-primary-foreground section-padding">
            <div className="container-narrow mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{section.heading ?? "Dental Insights"}</h1>
              <p className="text-primary-foreground/85 max-w-xl mx-auto">{section.subheading ?? "Expert articles on oral health, dental procedures, and wellness tips from our team."}</p>
            </div>
          </section>
        );

      default: {
        const imageFirst = dynamicIndex % 2 === 0;
        dynamicIndex++;
        return <GenericSection key={section.id} section={section} imageFirst={imageFirst} />;
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Dental Insights & Blog"
        description={`Expert dental insights, oral health tips, and treatment guides from ${settings?.general?.clinic_name ?? "Smilz Dental Treatment Facility"} Kolkata.`}
        keywords="dental blog Kolkata, oral health tips, dental treatment guides"
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/blog`}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://smilz.net" },
          { name: "Insights", url: `${links?.website ?? "https://smilz.net"}/blog` },
        ]}
      />

      {sections.map(renderSection)}

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="flex flex-wrap gap-2 mb-10">
            {dynamicTabs.map((tab) => (
              <button key={tab.slug} onClick={() => setActiveTab(tab.slug)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"}`}>
                {tab.label}
                {!isLoading && <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>}
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
                      {post.featured_image ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={600} height={338} /> : <span className="text-6xl">📝</span>}
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full capitalize">{formatLabel(resolveTab(post.category) || post.category)}</span>
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
