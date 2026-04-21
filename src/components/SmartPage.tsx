import { lazy, Suspense, ComponentType, Component, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import type { LayoutNode } from '@/types/visual-builder';

const VisualRenderer = lazy(() => import('@/components/builder/VisualRenderer'));

interface PageLayoutRow {
  id: string;
  page_slug: string;
  page_title: string;
  layout_json: LayoutNode[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SmartPageProps {
  slug: string;
  fallback: ComponentType;
  fallbackSeoProps?: {
    title?: string;
    description?: string;
  };
}

// ─── Error boundary for safe fallback ───────────────────
class RendererErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('VisualRenderer error:', error, info);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const SmartPage = ({ slug, fallback: Fallback, fallbackSeoProps }: SmartPageProps) => {
  const { data: layout, isLoading } = useQuery({
    queryKey: ['page_layouts', slug, 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .eq('page_slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data as PageLayoutRow | null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  // If a published layout exists, render it via VisualRenderer
  if (layout?.is_published && layout.layout_json?.length > 0) {
    const seoMeta = (layout.layout_json as any)._seo || {};
    const seoTitle = seoMeta.title || fallbackSeoProps?.title || layout.page_title;
    const seoDescription =
      seoMeta.description?.trim() ||
      fallbackSeoProps?.description?.trim() ||
      `${layout.page_title} at Smilz Dental Clinic in Kolkata. Trusted dental care, modern treatments, and friendly experts. Book your appointment today.`;
    const ogImage = seoMeta.ogImage || undefined;

    return (
      <>
        <SEOHead title={seoTitle} description={seoDescription} ogImage={ogImage} />
        <RendererErrorBoundary fallback={<Fallback />}>
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-muted-foreground text-sm">Loading page...</div></div>}>
            <VisualRenderer layout={layout.layout_json} />
          </Suspense>
        </RendererErrorBoundary>
      </>
    );
  }

  // Fallback to the hardcoded component
  return <Fallback />;
};

export default SmartPage;
