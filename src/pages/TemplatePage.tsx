import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePageLayout } from '@/hooks/usePageLayouts';
import VisualRenderer from '@/components/builder/VisualRenderer';
import SEOHead from '@/components/SEOHead';
import type { LayoutNode } from '@/types/visual-builder';
import { resolveTemplateVars } from '@/lib/resolveTemplateVars';

// ─── Blog Post Template Page ────────────────────────────
export const BlogPostTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: template } = usePageLayout('blog-post-template');
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog_posts', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!template || !post) return null;

  const vars: Record<string, any> = {
    Post_Title: post.title,
    Featured_Image: post.featured_image || '',
    Post_Content: post.content || '',
    Author: post.author || 'Smilz Dental',
    Published_Date: post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    Category: post.category || '',
    Excerpt: post.excerpt || '',
    Slug: post.slug,
  };

  const resolved = resolveTemplateVars(template.layout_json || [], vars);

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || post.seo_description || ''}
        canonicalUrl={`https://smilz.net/blog/${post.slug}`}
        type="article"
      />
      <VisualRenderer layout={resolved} />
    </>
  );
};

// ─── Service Template Page ──────────────────────────────
export const ServiceTemplate = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: template } = usePageLayout('service-template');
  const { data: service, isLoading } = useQuery({
    queryKey: ['services', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', serviceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!template || !service) return null;

  const vars: Record<string, any> = {
    Service_Title: service.title,
    Service_Image: service.image_url || '',
    Service_Content: service.description || '',
    Service_Short: service.short_description || '',
    Slug: service.slug,
  };

  const resolved = resolveTemplateVars(template.layout_json || [], vars);

  return (
    <>
      <SEOHead
        title={service.title}
        description={service.short_description || service.seo_description || ''}
        canonicalUrl={`https://smilz.net/services/${service.slug}`}
      />
      <VisualRenderer layout={resolved} />
    </>
  );
};
