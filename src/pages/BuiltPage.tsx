import { useParams } from 'react-router-dom';
import { usePageLayout } from '@/hooks/usePageLayouts';
import VisualRenderer from '@/components/builder/VisualRenderer';
import SEOHead from '@/components/SEOHead';

const extractSeo = (layoutJson: any[]) => {
  const seoEntry = layoutJson?.find((n: any) => n._seo);
  const seo = seoEntry?._seo || {};
  const blocks = (layoutJson || []).filter((n: any) => !n._seo);
  return { seo, blocks };
};

const BuiltPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: layout, isLoading } = usePageLayout(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!layout) return null;

  const { seo, blocks } = extractSeo(layout.layout_json);

  return (
    <>
      <SEOHead
        title={seo.seoTitle || layout.page_title}
        description={seo.seoDescription || `${layout.page_title} - Smilz Dental`}
        keywords={seo.seoKeywords || undefined}
        canonicalUrl={seo.seoCanonicalUrl || undefined}
        ogImage={seo.seoOgImage || undefined}
        robots={seo.seoRobots || undefined}
      />
      <VisualRenderer layout={blocks} />
    </>
  );
};

export default BuiltPage;
