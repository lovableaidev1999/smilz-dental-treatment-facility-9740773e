import { useParams } from 'react-router-dom';
import { usePageLayout } from '@/hooks/usePageLayouts';
import VisualRenderer from '@/components/builder/VisualRenderer';
import SEOHead from '@/components/SEOHead';

const BuiltPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: layout, isLoading, error } = usePageLayout(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!layout) return null; // Will fall through to NotFound via router

  return (
    <>
      <SEOHead title={layout.page_title} description={`${layout.page_title} - Smilz Dental`} />
      <VisualRenderer layout={layout.layout_json || []} />
    </>
  );
};

export default BuiltPage;
