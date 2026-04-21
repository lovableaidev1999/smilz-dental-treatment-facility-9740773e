import { useParams } from 'react-router-dom';
import { usePageLayout } from '@/hooks/usePageLayouts';
import VisualRenderer from '@/components/builder/VisualRenderer';
import SEOHead from '@/components/SEOHead';
import NotFound from '@/pages/NotFound';

const extractSeo = (layoutJson: any[]) => {
  const seoEntry = layoutJson?.find((n: any) => n._seo);
  const seo = seoEntry?._seo || {};
  const blocks = (layoutJson || []).filter((n: any) => !n._seo);
  return { seo, blocks };
};

// Slugs that already have hardcoded React routes — never let BuiltPage shadow them.
// Keep this in sync with App.tsx top-level routes.
const RESERVED_SLUGS = new Set([
  '', 'home', 'services', 'about', 'contact', 'gallery', 'blog', 'preview',
  'referral', 'p', 'admin', 'sitemap.xml', 'robots.txt',
  'dentist-in-kolkata', 'dental-clinic-in-garia-kolkata',
  'root-canal-treatment-kolkata', 'dental-implants-kolkata',
  'braces-aligners-kolkata',
]);

const BuiltPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cleanSlug = (slug || '').replace(/\/$/, '');
  const isReserved = RESERVED_SLUGS.has(cleanSlug);

  const { data: layout, isLoading } = usePageLayout(isReserved ? '' : cleanSlug);

  if (isReserved) return <NotFound />;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!layout) return <NotFound />;

  const { seo, blocks } = extractSeo(layout.layout_json);

  // Inject any custom JSON-LD attached to this page's _seo block.
  const jsonLd = Array.isArray(seo.jsonLd) ? seo.jsonLd : seo.jsonLd ? [seo.jsonLd] : undefined;

  return (
    <>
      <SEOHead
        title={seo.seoTitle || seo.title || layout.page_title}
        description={seo.seoDescription || seo.description || `${layout.page_title} - Smilz Dental`}
        keywords={seo.seoKeywords || seo.keywords || undefined}
        canonicalUrl={seo.seoCanonicalUrl || seo.canonical || undefined}
        ogImage={seo.seoOgImage || seo.ogImage || undefined}
        robots={seo.seoRobots || seo.robots || undefined}
        jsonLd={jsonLd as any}
      />
      <VisualRenderer layout={blocks} />
    </>
  );
};

export default BuiltPage;
