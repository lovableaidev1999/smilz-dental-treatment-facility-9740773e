import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO, BLOG_CATEGORIES } from "@/lib/constants";

// Sample blog posts - these will be migrated from the WordPress site
const samplePosts = [
  {
    slug: "importance-of-regular-dental-checkups",
    title: "The Importance of Regular Dental Checkups",
    excerpt: "Regular dental checkups are crucial for maintaining oral health. Learn why visiting your dentist every 6 months can prevent serious dental issues.",
    category: "Oral Hygiene",
    date: "2025-03-15",
    readTime: "5 min",
  },
  {
    slug: "what-to-expect-during-root-canal",
    title: "What to Expect During a Root Canal Treatment",
    excerpt: "Root canal treatment doesn't have to be scary. Here's everything you need to know about the procedure, recovery, and aftercare.",
    category: "Procedures",
    date: "2025-03-10",
    readTime: "7 min",
  },
  {
    slug: "benefits-of-dental-implants",
    title: "Benefits of Dental Implants Over Dentures",
    excerpt: "Dental implants offer a permanent solution for missing teeth. Discover why more patients are choosing implants over traditional dentures.",
    category: "Guides",
    date: "2025-02-28",
    readTime: "6 min",
  },
  {
    slug: "how-to-maintain-oral-hygiene",
    title: "How to Maintain Oral Hygiene at Home",
    excerpt: "Good oral hygiene starts at home. Learn the best practices for brushing, flossing, and maintaining a healthy smile between dental visits.",
    category: "Oral Hygiene",
    date: "2025-02-20",
    readTime: "4 min",
  },
  {
    slug: "smile-designing-what-you-need-to-know",
    title: "Smile Designing: What You Need to Know",
    excerpt: "Smile designing is a comprehensive approach to transforming your smile. Learn about the process, options, and what to expect.",
    category: "Procedures",
    date: "2025-02-15",
    readTime: "6 min",
  },
  {
    slug: "teeth-whitening-facts-myths",
    title: "Teeth Whitening: Facts vs Myths",
    excerpt: "Separate the facts from the myths about teeth whitening. Learn what really works and what to avoid for a brighter smile.",
    category: "Awareness",
    date: "2025-02-10",
    readTime: "5 min",
  },
];

const Blog = () => {
  return (
    <>
      <SEOHead
        title="Dental Insights & Blog"
        description="Expert dental insights, oral health tips, and treatment guides from Smilz Dental Treatment Facility Kolkata. Stay informed about your dental health."
        keywords="dental blog Kolkata, oral health tips, dental treatment guides"
        canonicalUrl={`${CLINIC_INFO.website}/blog`}
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "Insights", url: `${CLINIC_INFO.website}/blog` },
        ]}
      />

      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Dental Insights</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">
            Expert articles on oral health, dental procedures, and wellness tips from our team.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">All</span>
            {BLOG_CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat.name}
              </span>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samplePosts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-card border border-border group"
              >
                <div className="h-48 bg-secondary flex items-center justify-center">
                  <span className="text-6xl">📝</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm">
              More blog posts will be migrated from the existing website. Stay tuned!
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
