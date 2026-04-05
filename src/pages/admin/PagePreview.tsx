import { useParams } from 'react-router-dom';
import { usePageLayoutById } from '@/hooks/usePageLayouts';
import VisualRenderer from '@/components/builder/VisualRenderer';
import SEOHead from '@/components/SEOHead';

const PagePreview = () => {
  const { id } = useParams<{ id: string }>();
  const { data: layout, isLoading } = usePageLayoutById(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`Preview: ${layout.page_title}`} description="" />
      <div className="border-t-4 border-amber-500">
        <div className="bg-amber-500 text-white text-center text-xs py-1 font-medium">
          DRAFT PREVIEW — This page is not published
        </div>
        <VisualRenderer layout={layout.layout_json || []} />
      </div>
    </>
  );
};

export default PagePreview;
