import { lazy, Suspense, ComponentType, Component, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import PageHero from '@/components/PageHero';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import type { LayoutNode } from '@/types/visual-builder';
import { serviceSlugCandidates } from '@/lib/slugs';
import { usePageContent } from '@/hooks/usePageContent';

const VisualRenderer = lazy(() => import('@/components/builder/VisualRenderer'));

// Slugs where the hardcoded <PageHero> ALWAYS replaces the published layout's
// first hero section. The body (everything after) remains fully editable in
// the Visual Builder. Use for pages that need the universal navy-blue hero
// with breadcrumbs + CTAs (matching About / Services / Contact) but still
// want editable body content.
const FORCE_PAGE_HERO_SLUGS: Record<
  string,
  {
    breadcrumbLabel: string;
    whatsappMessage?: string;
    primaryCta?: { label: string; href: string; external?: boolean };
  }
> = {
  referral: {
    breadcrumbLabel: 'Smilz Referral',
    whatsappMessage: "Hi, I'd like to refer someone to Smilz Dental.",
    primaryCta: {
      label: 'Start Referring',
      href: 'https://referral.smilz.net/login',
      external: true,
    },
  },
  gallery: {
    breadcrumbLabel: 'Gallery',
    whatsappMessage: "Hi, I'd like to know more about your dental treatment results.",
  },

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

// Slugs that always render their hardcoded React component (skip the Visual
// Builder layout entirely). Use for pages with interactive logic / a fixed
// design language that the generic builder layout cannot reproduce.
// NOTE: 'referral' was removed so the page becomes fully editable in the
// Visual Builder (matches Home/Services/About behavior). The hardcoded
// Referral.tsx still serves as the fallback when no layout is published.
const FORCE_FALLBACK_SLUGS = new Set<string>([]);

const SmartPage = ({ slug, fallback: Fallback, fallbackSeoProps }: SmartPageProps) => {
  const pageSlugCandidates = slug.startsWith('service-')
    ? serviceSlugCandidates(slug.replace(/^service-/, '')).map((candidate) => `service-${candidate}`)
    : [slug];
  const forceFallback = FORCE_FALLBACK_SLUGS.has(slug);
  const forcePageHero = FORCE_PAGE_HERO_SLUGS[slug];
  const { getSection } = usePageContent(slug);
  const { data: siteSettings } = useSiteSettings();
  const cmsHero = getSection('hero');

  const { data: layout, isLoading } = useQuery({
    queryKey: ['page_layouts', slug, 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .in('page_slug', pageSlugCandidates)
        .eq('is_published', true)
        .limit(1);
      if (error) throw error;
      return (data?.[0] ?? null) as PageLayoutRow | null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!slug && !forceFallback,
  });

  // Force the hardcoded component for special slugs (e.g. Referral form page)
  if (forceFallback) {
    return <Fallback />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  // If a published layout exists, render it via VisualRenderer
  if (layout?.is_published && layout.layout_json?.length > 0) {
    // For FORCE_PAGE_HERO slugs, drop the layout's first section (it's the
    // builder hero) and render the universal <PageHero> above the body so
    // the page matches About / Services / Contact visually. The remaining
    // layout (body) stays fully editable in the Visual Builder.
    const bodyLayout = forcePageHero
      ? layout.layout_json.slice(1)
      : layout.layout_json;

    const renderedLayout = !forcePageHero && cmsHero?.image_url
      ? bodyLayout.map((node, index) =>
          index === 0 && node.type === 'section'
            ? {
                ...node,
                props: {
                  ...node.props,
                  backgroundImage: cmsHero.image_url,
                  background: node.props?.background || 'hsl(var(--primary))',
                },
              }
            : node,
        )
      : bodyLayout;

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
        {forcePageHero && (
          <PageHero
            title={cmsHero?.heading ?? layout.page_title}
            subtitle={cmsHero?.subheading ?? null}
            imageUrl={cmsHero?.image_url ?? null}
            breadcrumbs={[{ label: 'Home', to: '/' }, { label: forcePageHero.breadcrumbLabel }]}
            contact={siteSettings?.contact}
            whatsappMessage={forcePageHero.whatsappMessage}
            primaryCta={forcePageHero.primaryCta}
          />
        )}
        <RendererErrorBoundary fallback={<Fallback />}>
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-muted-foreground text-sm">Loading page...</div></div>}>
            <VisualRenderer layout={renderedLayout} />
          </Suspense>
        </RendererErrorBoundary>
      </>
    );
  }

  // Fallback to the hardcoded component
  return <Fallback />;
};

export default SmartPage;
