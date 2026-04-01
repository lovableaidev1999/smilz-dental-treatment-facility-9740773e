import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, ArrowLeft, User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO } from "@/lib/constants";
import { useBlogPost, useBlogPosts } from "@/integrations/supabase/hooks";
import NotFound from "./NotFound";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug ?? "");
  const { data: relatedPosts } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="container-narrow mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-3/4" />
          <div className="h-5 bg-secondary rounded w-1/2" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) return <NotFound />;

  const related = (relatedPosts ?? [])
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={`${post.category}, dental blog Kolkata`}
        canonicalUrl={`${CLINIC_INFO.website}/blog/${post.slug}`}
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "Insights", url: `${CLINIC_INFO.website}/blog` },
          { name: post.title, url: `${CLINIC_INFO.website}/blog/${post.slug}` },
        ]}
      />

      {/* Header */}
      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto max-w-3xl">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-6">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-primary-foreground transition-colors">Insights</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground line-clamp-1">{post.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/75">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="bg-primary-foreground/20 px-3 py-0.5 rounded-full text-xs font-medium">
              {post.category}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-narrow mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full rounded-2xl mb-8 shadow-card"
                loading="lazy"
              />
            )}

            {/* Render HTML content from WordPress */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="mt-10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all articles
              </Link>
            </div>
          </motion.div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="group bg-card rounded-xl p-5 shadow-card border border-border hover:border-primary/30 transition-all"
                  >
                    <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 text-sm">
                      {rp.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rp.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogPost;
