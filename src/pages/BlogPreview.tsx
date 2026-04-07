import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, ArrowLeft, User } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useBlogPostById, useBlogPosts } from "@/integrations/supabase/hooks";
import BlockRenderer from "@/components/BlockRenderer";
import VisualRenderer from "@/components/builder/VisualRenderer";
import { getStoredVisualLayout, isVisualLayoutFallbackContent } from "@/lib/visualLayoutStorage";
import { sanitizeWpImages } from "@/lib/wpImageSanitizer";
import NotFound from "./NotFound";

const BlogPreview = () => {
  const { id } = useParams<{ id: string }>();
  const { loading: authLoading } = useAuth();
  const { data: post, isLoading, error, refetch } = useBlogPostById(id ?? "", !authLoading);
  const { data: relatedPosts } = useBlogPosts();
  const { data: settings } = useSiteSettings();
  const links = settings?.links;

  useEffect(() => {
    if (!authLoading && !post && id) {
      const timer = window.setTimeout(() => refetch(), 800);
      return () => window.clearTimeout(timer);
    }
  }, [authLoading, id, post, refetch]);

  if (authLoading || isLoading) {
    return (
      <div className="section-padding">
        <div className="container-narrow mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-3/4" />
          <div className="h-5 bg-secondary rounded w-1/2" />
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-secondary rounded" />)}</div>
        </div>
      </div>
    );
  }

  if (error) return <NotFound />;
  if (!post) {
    return (
      <div className="section-padding">
        <div className="container-narrow mx-auto max-w-3xl text-center py-20">
          <p className="text-lg font-semibold text-foreground">Preview not ready yet</p>
          <p className="text-muted-foreground mt-2">This draft preview can take a moment to become available after saving. Please try again from the editor.</p>
        </div>
      </div>
    );
  }

  const related = (relatedPosts ?? []).filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  const visualLayout = getStoredVisualLayout(post as any);
  const hasBlockContent = !!post.content_json && !isVisualLayoutFallbackContent(post.content_json);

  return (
    <>
      <SEOHead
        title={`${post.meta_title || post.title} | Preview`}
        description={post.meta_description || post.excerpt}
        keywords={`${post.category}, dental blog Kolkata`}
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.published_at,
          modifiedTime: post.updated_at || post.published_at,
          author: post.author,
          section: post.category,
        }}
        ogImage={post.featured_image}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://smilz.net" },
          { name: "Insights", url: `${links?.website ?? "https://smilz.net"}/blog` },
          { name: post.title, url: `${links?.website ?? "https://smilz.net"}/blog/${post.slug}` },
        ]}
      />

      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto max-w-3xl">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-6">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-primary-foreground transition-colors">Insights</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground line-clamp-1">Preview</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/75">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
            {post.published_at && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>}
            <span className="bg-primary-foreground/20 px-3 py-0.5 rounded-full text-xs font-medium">{post.is_published ? "Published" : "Draft Preview"}</span>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {post.featured_image && <img src={post.featured_image} alt={`${post.title} preview image`} className="w-full rounded-2xl mb-8 shadow-card" loading="lazy" width={800} height={450} />}
            {visualLayout ? (
              <VisualRenderer layout={visualLayout} className="mb-8" />
            ) : hasBlockContent ? (
              <BlockRenderer content={post.content_json} className="mb-8" />
            ) : (
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: sanitizeWpImages(post.content) }} />
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Tags:</p>
                <div className="flex flex-wrap gap-2">{post.tags.map((tag: string) => <span key={tag} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">{tag}</span>)}</div>
              </div>
            )}
            <div className="mt-10"><Link to="/blog" className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"><ArrowLeft className="h-4 w-4" /> Back to all articles</Link></div>
          </motion.div>

          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rp) => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group bg-card rounded-xl p-5 shadow-card border border-border hover:border-primary/30 transition-all">
                    <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 text-sm">{rp.title}</h3>
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

export default BlogPreview;
