/**
 * Shared renderer — single source of truth for block rendering.
 * Used by both VisualRenderer (live site) and BuilderCanvas (editor).
 *
 * `editorMode` controls minor behavioural differences:
 *   – text/heading blocks use InlineEditable wrappers
 *   – buttons render as <span> instead of <Link>
 *   – dynamic data blocks (blog-loop, service-loop, contact-form) show placeholders
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeWpImages } from '@/lib/wpImageSanitizer';
import type { LayoutNode } from '@/types/visual-builder';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import InlineEditable from './InlineEditable';
import RichTextEditable from './RichTextEditable';
import { servicePath } from '@/lib/slugs';

// ─── Responsive styles (desktop baseline for live) ──────
export const getStyles = (node: LayoutNode): React.CSSProperties => {
  const r = node.responsive?.desktop || {};
  return {
    padding: r.padding || undefined,
    margin: r.margin || undefined,
    fontSize: r.fontSize || undefined,
    lineHeight: r.lineHeight || undefined,
    textAlign: r.textAlign || undefined,
    display: r.display || undefined,
    gap: r.gap || undefined,
    flexDirection: r.flexDirection as any || undefined,
    alignItems: r.alignItems || undefined,
    justifyContent: r.justifyContent || undefined,
  };
};

// ─── Responsive CSS classes for per-device visibility ───
export const getResponsiveClasses = (node: LayoutNode): string => {
  const classes: string[] = [];
  const hideOn: string[] = node.props?.hideOn || [];
  if (hideOn.includes('mobile') || node.responsive?.mobile?.display === 'none') classes.push('max-md:hidden');
  if (hideOn.includes('tablet') || node.responsive?.tablet?.display === 'none') classes.push('md:max-lg:hidden');
  if (hideOn.includes('desktop') || node.responsive?.desktop?.display === 'none') classes.push('lg:hidden');
  return classes.join(' ');
};

// ─── Embla carousel (shared) ────────────────────────────
const EmblaCarousel = ({ items, renderItem, autoplay = true, showNavigation = true }: {
  items: any[];
  renderItem: (item: any, i: number) => React.ReactNode;
  autoplay?: boolean;
  showNavigation?: boolean;
}) => {
  const plugins = autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: true })] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1, breakpoints: { '(min-width: 768px)': { slidesToScroll: 2 }, '(min-width: 1024px)': { slidesToScroll: 3 } } },
    plugins
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);
  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex-[0_0_85%] min-w-0 md:flex-[0_0_45%] lg:flex-[0_0_30%]">
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
      {showNavigation && items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`w-2 h-2 rounded-full transition-colors ${i === selectedIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Blog loop (live only) ──────────────────────────────
const BlogLoopWidget = ({ props }: { props: any }) => {
  const { data: posts } = useQuery({
    queryKey: ['blog_posts_loop', props.category, props.count],
    queryFn: async () => {
      let q = supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(props.count || 3);
      if (props.category) q = q.eq('category', props.category);
      const { data } = await q;
      return data || [];
    },
  });
  const renderCard = (post: any) => (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <div className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow h-full">
        {props.showImage && post.featured_image && <img src={post.featured_image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" width={600} height={192} />}
        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
          {props.showExcerpt && post.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
          {props.showDate && post.published_at && <p className="text-xs text-muted-foreground mt-2">{new Date(post.published_at).toLocaleDateString()}</p>}
        </div>
      </div>
    </Link>
  );
  if (props.displayType === 'carousel') return <EmblaCarousel items={posts || []} renderItem={(post) => renderCard(post)} autoplay={props.autoplay} showNavigation={props.showNavigation} />;
  const cols = props.columns || 3;
  return (
    <div className={`grid gap-6 grid-cols-1 ${cols >= 2 ? 'md:grid-cols-2' : ''} ${cols >= 3 ? 'lg:grid-cols-3' : ''} ${cols >= 4 ? 'xl:grid-cols-4' : ''}`}>
      {(posts || []).map((post: any) => <div key={post.id}>{renderCard(post)}</div>)}
    </div>
  );
};

// ─── Service loop (live only) ───────────────────────────
const ServiceLoopWidget = ({ props }: { props: any }) => {
  const { data: services } = useQuery({
    queryKey: ['services_loop', props.count],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order').limit(props.count || 6);
      return data || [];
    },
  });
  const renderCard = (svc: any) => (
    <Link to={servicePath(svc.slug)} className="group block h-full">
      <div className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow h-full">
        {props.showImage && svc.image_url && <img src={svc.image_url} alt={svc.title} className="w-full h-40 object-cover" loading="lazy" width={600} height={160} />}
        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{svc.title}</h3>
          {props.showDescription && svc.short_description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{svc.short_description}</p>}
        </div>
      </div>
    </Link>
  );
  // List display — simple text links with chevron
  if (props.displayType === 'list') {
    return (
      <ul className="space-y-1">
        {(services || []).map((svc: any) => (
          <li key={svc.id}>
            <Link
              to={servicePath(svc.slug)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
            >
              {svc.title} <span className="text-muted-foreground">›</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  if (props.displayType === 'carousel') return <EmblaCarousel items={services || []} renderItem={(svc) => renderCard(svc)} autoplay={props.autoplay} showNavigation={props.showNavigation} />;
  const cols = props.columns || 3;
  return (
    <div className={`grid gap-6 grid-cols-1 ${cols >= 2 ? 'md:grid-cols-2' : ''} ${cols >= 3 ? 'lg:grid-cols-3' : ''} ${cols >= 4 ? 'xl:grid-cols-4' : ''}`}>
      {(services || []).map((svc: any) => <div key={svc.id}>{renderCard(svc)}</div>)}
    </div>
  );
};

// ─── Contact form (live only) ───────────────────────────
const ContactFormWidget = ({ node, rClasses, baseStyles }: { node: LayoutNode; rClasses: string; baseStyles: React.CSSProperties }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('contact_submissions').insert({ name: formData['Name'] || '', email: formData['Email'] || '', phone: formData['Phone'] || '', message: formData['Message'] || '', source: 'page-builder' });
      setSubmitted(true);
      setFormData({});
    } catch (err) { console.error('Form submission error:', err); } finally { setSubmitting(false); }
  };
  if (submitted) return (
    <div className={`p-8 text-center bg-primary/5 rounded-xl ${rClasses}`} style={baseStyles}>
      <p className="text-lg font-semibold text-foreground">Thank you!</p>
      <p className="text-muted-foreground mt-1">We'll be in touch soon.</p>
    </div>
  );
  return (
    <form className={`space-y-4 ${rClasses}`} style={baseStyles} onSubmit={handleSubmit}>
      {(node.props.fields || []).map((field: any, i: number) => (
        <div key={i}>
          <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" rows={4} required={field.required} value={formData[field.label] || ''} onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))} />
          ) : (
            <input type={field.type} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" required={field.required} value={formData[field.label] || ''} onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))} />
          )}
        </div>
      ))}
      <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
        {submitting ? 'Sending...' : (node.props.submitText || 'Submit')}
      </button>
    </form>
  );
};

// ─── Tabs widget ────────────────────────────────────────
const TabsWidget = ({ node, rClasses, baseStyles }: { node: LayoutNode; rClasses: string; baseStyles: React.CSSProperties }) => {
  const [activeTab, setActiveTab] = useState(0);
  const items = node.props.items || [];
  return (
    <div className={rClasses} style={baseStyles}>
      <div className="flex border-b border-border">
        {items.map((item: any, i: number) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${i === activeTab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="p-4 text-muted-foreground">{items[activeTab]?.content}</div>
    </div>
  );
};

// ─── Image carousel widget ──────────────────────────────
const ImageCarouselWidget = ({ node, rClasses, baseStyles }: { node: LayoutNode; rClasses: string; baseStyles: React.CSSProperties }) => {
  const [current, setCurrent] = useState(0);
  const imgs = (node.props.images || []).filter((img: any) => img.src);
  useEffect(() => {
    if (!node.props.autoplay || imgs.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % imgs.length), node.props.interval || 3000);
    return () => clearInterval(t);
  }, [imgs.length, node.props.autoplay, node.props.interval]);
  if (!imgs.length) return <div className="bg-muted rounded-lg h-48 flex items-center justify-center text-muted-foreground">Add images to carousel</div>;
  return (
    <div className={`relative overflow-hidden rounded-lg ${rClasses}`} style={baseStyles}>
      <img src={imgs[current]?.src} alt={imgs[current]?.alt || ''} className="w-full h-64 object-cover transition-opacity" loading="lazy" width={800} height={256} />
      {imgs.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {imgs.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-background/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Icon map (shared) ──────────────────────────────────
const ICON_MAP: Record<string, string> = {
  Star: '⭐', Heart: '❤️', Check: '✓', Phone: '📞', Mail: '✉️', Home: '🏠',
  ArrowRight: '→', Tooth: '🦷', Smile: '😊', Shield: '🛡️', Clock: '🕐',
  Calendar: '📅', Sparkles: '✨', Syringe: '💉', Stethoscope: '🩺', Award: '🏆',
  Users: '👥', MapPin: '📍', ThumbsUp: '👍', Eye: '👁️', Baby: '👶',
  Pill: '💊', Xray: '🔬', Clipboard: '📋',
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: 'f', instagram: '📷', youtube: '▶', twitter: '𝕏', linkedin: 'in', whatsapp: '💬',
};

// ─── Options for renderNodeContent ──────────────────────
export interface RenderOptions {
  editorMode?: boolean;
}

/**
 * The single source of truth for rendering a LayoutNode.
 * Both the live site and the editor use this function.
 */
export const renderNodeContent = (node: LayoutNode, index: number, opts: RenderOptions = {}): React.ReactNode => {
  const key = `${node.type}-${node.id}`;
  const baseStyles = getStyles(node);
  const rClasses = getResponsiveClasses(node);
  const { editorMode } = opts;

  switch (node.type) {
    // ─── SECTION ────────────────────────────────────────
    case 'section': {
      const gridColumns = node.props.gridColumns || '1fr';
      const colCount = gridColumns.split(' ').filter(Boolean).length;
      const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: gridColumns,
        columnGap: node.props.columnGap || '1.5rem',
        rowGap: node.props.rowGap || '1.5rem',
        alignItems: baseStyles.alignItems || undefined,
      };
      const spacingMap: Record<string, string> = {
        none: '',
        small: 'py-3 md:py-4',
        medium: 'py-6 md:py-8',
        large: 'py-12 md:py-16',
      };
      const spacingClass = spacingMap[node.props.sectionSpacing] ?? spacingMap.medium;
      return (
        <section
          key={key}
          className={`relative w-full ${spacingClass} px-4 md:px-6 ${rClasses}`}
          style={{
            background: node.props.background || undefined,
            backgroundImage: node.props.backgroundImage ? `url(${node.props.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: baseStyles.padding || undefined,
          }}
        >
          <div className="w-full mx-auto" style={{ maxWidth: node.props.maxWidth || '80rem' }}>
            <div className={colCount > 1 ? 'vb-responsive-grid' : ''} style={gridStyle}>
              {node.children?.map((child, i) => (
                <div key={child.id} className="w-full min-w-0">
                  {renderNodeContent(child, i, opts)}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // ─── GRID ───────────────────────────────────────────
    case 'grid': {
      const cols = node.props.gridCols || 2;
      return (
        <div
          key={key}
          className={`vb-responsive-grid ${rClasses}`}
          style={{
            ...baseStyles,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            columnGap: node.props.columnGap || '1rem',
            rowGap: node.props.rowGap || '1rem',
          }}
        >
          {node.children?.map((child, i) => (
            <div key={child.id} className="w-full min-w-0">{renderNodeContent(child, i, opts)}</div>
          ))}
        </div>
      );
    }

    // ─── COLUMN ─────────────────────────────────────────
    case 'column': {
      const colStyle: React.CSSProperties = {
        ...baseStyles,
        display: baseStyles.display === 'none' ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: node.props.verticalAlign || 'flex-start',
      };
      return (
        <div key={key} className={rClasses} style={colStyle}>
          {node.children?.map((child, i) => renderNodeContent(child, i, opts))}
        </div>
      );
    }

    // ─── CONTAINER ──────────────────────────────────────
    case 'container': {
      const isSticky = node.props.sticky && !editorMode;
      const containerStyle: React.CSSProperties = {
        ...baseStyles,
        background: node.props.background || undefined,
        padding: node.props.padding || '1.5rem',
        borderRadius: node.props.borderRadius || '1rem',
        border: node.props.borderColor ? `1px solid ${node.props.borderColor}` : undefined,
        boxShadow: node.props.shadow ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : undefined,
        ...(isSticky ? { position: 'sticky' as const, top: node.props.stickyTop || '96px', zIndex: 10 } : {}),
      };
      return (
        <div key={key} className={rClasses} style={containerStyle}>
          {node.children?.map((child, i) => renderNodeContent(child, i, opts))}
        </div>
      );
    }

    // ─── HEADING ────────────────────────────────────────
    case 'heading': {
      const Tag = `h${node.props.level || 2}` as keyof JSX.IntrinsicElements;
      const sizes: Record<number, string> = {
        1: 'text-3xl md:text-4xl font-bold',
        2: 'text-2xl md:text-3xl font-bold',
        3: 'text-xl md:text-2xl font-semibold',
      };
      const className = `font-heading text-foreground ${sizes[node.props.level] || sizes[2]} ${rClasses}`;
      const style = { ...baseStyles, color: node.props.color || undefined, textAlign: node.props.align || baseStyles.textAlign };

      const headingContent = node.props.html || node.props.text;

      if (editorMode) {
        return (
          <RichTextEditable
            key={key}
            blockId={node.id}
            propKey="html"
            value={headingContent}
            tag={Tag as string}
            className={className}
            style={style}
          />
        );
      }
      if (node.props.html) {
        return <Tag key={key} className={className} style={style} dangerouslySetInnerHTML={{ __html: node.props.html }} />;
      }
      return <Tag key={key} className={className} style={style}>{node.props.text}</Tag>;
    }

    // ─── TEXT ────────────────────────────────────────────
    case 'text': {
      const className = `text-muted-foreground leading-relaxed ${rClasses}`;
      const style = { ...baseStyles, color: node.props.color || undefined, textAlign: node.props.align || baseStyles.textAlign };
      const textContent = node.props.html || node.props.text;

      if (editorMode) {
        return (
          <RichTextEditable
            key={key}
            blockId={node.id}
            propKey="html"
            value={textContent}
            tag="p"
            className={className}
            style={style}
          />
        );
      }
      if (node.props.html) {
        return <p key={key} className={className} style={style} dangerouslySetInnerHTML={{ __html: node.props.html }} />;
      }
      return <p key={key} className={className} style={style}>{node.props.text}</p>;
    }

    // ─── IMAGE ──────────────────────────────────────────
    case 'image':
      return node.props.src ? (
        <figure key={key} className={`w-full ${rClasses}`} style={baseStyles}>
          <img
            src={node.props.src}
            alt={node.props.alt || ''}
            className="w-full h-auto"
            style={{ borderRadius: node.props.borderRadius, objectFit: node.props.objectFit || 'contain' }}
            loading="lazy"
            width={800}
            height={600}
          />
          {node.props.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2 italic">{node.props.caption}</figcaption>
          )}
        </figure>
      ) : (
        <div key={key} className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">No image set</div>
      );

    // ─── BUTTON ─────────────────────────────────────────
    case 'button': {
      const btnStyles: Record<string, string> = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        gold: 'bg-[hsl(40,80%,55%)] text-foreground hover:opacity-90',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        'outline-light': 'border-2 border-white/60 text-white hover:bg-white/10',
      };
      const alignStyle = node.props.align === 'stretch' ? 'block w-full text-center' : '';
      const fontColorStyle = node.props.fontColor ? { color: node.props.fontColor } : {};
      const btnClass = `inline-block px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-elevated ${alignStyle} ${btnStyles[node.props.style] || btnStyles.primary}`;

      if (editorMode) {
        return (
          <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: node.props.align === 'stretch' ? undefined : (node.props.align || 'left') }}>
            <InlineEditable
              blockId={node.id}
              propKey="text"
              value={node.props.text}
              tag="span"
              className={btnClass}
              style={fontColorStyle}
            />
          </div>
        );
      }
      const url = node.props.url || '/contact';
      const isExternal = /^(https?:|tel:|mailto:|\/\/)/i.test(url) || url.startsWith('#');
      const newTab = !!node.props.openInNewTab;
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: node.props.align === 'stretch' ? undefined : (node.props.align || 'left') }}>
          {isExternal || newTab ? (
            <a
              href={url}
              className={btnClass}
              style={fontColorStyle}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
            >
              {node.props.text}
            </a>
          ) : (
            <Link to={url} className={btnClass} style={fontColorStyle}>
              {node.props.text}
            </Link>
          )}
        </div>
      );
    }

    // ─── SPACER ─────────────────────────────────────────
    case 'spacer':
      return editorMode
        ? <div key={key} style={{ height: node.props.height }} className="bg-muted/30 border border-dashed border-border rounded" />
        : <div key={key} className={rClasses} style={{ ...baseStyles, height: node.props.height }} />;

    // ─── DIVIDER ────────────────────────────────────────
    case 'divider':
      return (
        <hr key={key} className={`border-border ${rClasses}`} style={{ ...baseStyles, borderColor: node.props.color || undefined, borderWidth: node.props.thickness, width: node.props.width }} />
      );

    // ─── BLOG LOOP ──────────────────────────────────────
    case 'blog-loop':
      if (editorMode) {
        return (
          <div key={key} className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">📰 Blog Posts Loop</p>
            <p className="text-xs text-muted-foreground">{node.props.count} posts · {node.props.columns} columns</p>
          </div>
        );
      }
      return <BlogLoopWidget key={key} props={node.props} />;

    // ─── SERVICE LOOP ───────────────────────────────────
    case 'service-loop':
      if (editorMode) {
        return (
          <div key={key} className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">🦷 Services Loop</p>
            <p className="text-xs text-muted-foreground">{node.props.count} services · {node.props.columns} columns</p>
          </div>
        );
      }
      return <ServiceLoopWidget key={key} props={node.props} />;

    // ─── FAQ ────────────────────────────────────────────
    case 'faq': {
      const items = node.props.items || [];
      if (editorMode) {
        return (
          <div key={key} className="space-y-2">
            <p className="text-sm font-medium text-foreground">FAQ ({items.length} items)</p>
            {items.length > 0 ? (
              items.map((it: any, i: number) => (
                <div key={i} className="border-l-2 border-primary/30 pl-2">
                  <p className="text-sm font-medium text-foreground">{it.question}</p>
                  {it.answer && <p className="text-sm text-muted-foreground mt-1">{it.answer}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No FAQ items added yet.</p>
            )}
          </div>
        );
      }
      return (
        <div key={key} className={rClasses} style={baseStyles}>
          <Accordion type="single" collapsible className="w-full">
            {items.map((item: { question: string; answer: string }, i: number) => (
              <AccordionItem key={i} value={`faq-${node.id}-${i}`}>
                <AccordionTrigger className="text-foreground font-medium text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org', '@type': 'FAQPage',
              mainEntity: items.filter((it: any) => it.question && it.answer).map((it: any) => ({
                '@type': 'Question', name: it.question,
                acceptedAnswer: { '@type': 'Answer', text: it.answer },
              })),
            }),
          }} />
        </div>
      );
    }

    // ─── TESTIMONIAL ────────────────────────────────────
    case 'testimonial':
      return (
        <blockquote key={key} className={`border-l-4 border-primary pl-4 my-4 ${rClasses}`} style={baseStyles}>
          <p className="text-muted-foreground italic">"{node.props.quote}"</p>
          <footer className="mt-2 text-sm font-medium text-foreground">
            — {node.props.author}
            {node.props.role && <span className="text-muted-foreground ml-1">({node.props.role})</span>}
          </footer>
        </blockquote>
      );

    // ─── CONTACT FORM ───────────────────────────────────
    case 'contact-form':
      if (editorMode) {
        return (
          <div key={key} className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">📧 Contact Form</p>
            <p className="text-xs text-muted-foreground">{(node.props.fields || []).length} fields</p>
          </div>
        );
      }
      return <ContactFormWidget key={key} node={node} rClasses={rClasses} baseStyles={baseStyles} />;

    // ─── ICON LIST ──────────────────────────────────────
    case 'icon-list': {
      const listColor = node.props.color || undefined;
      const iconColor = node.props.iconColor || listColor;
      const fontWeight = node.props.fontWeight || undefined;
      const fontSize = node.props.fontSize || undefined;
      const TextEl = (node.props.element || 'span') as any;
      const iconMap: Record<string, string> = { MapPin: '📍', Clock: '🕐', Phone: '📞', Check: '✓', Mail: '✉️', Star: '⭐' };
      return (
        <ul key={key} className={`space-y-2 ${rClasses}`} style={{ ...baseStyles, color: listColor, fontWeight, fontSize }}>
          {(node.props.items || []).map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2" style={{ color: listColor, fontWeight, fontSize }}>
              <span style={{ color: iconColor }}>{iconMap[item.icon] || '✓'}</span>
              <TextEl style={{ color: listColor, fontWeight, fontSize, margin: 0 }}>{item.text}</TextEl>
            </li>
          ))}
        </ul>
      );
    }

    // ─── VIDEO ──────────────────────────────────────────
    case 'video': {
      const url = node.props.url || '';
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      const isVimeo = url.includes('vimeo.com');
      const getYoutubeId = (u: string) => { const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/); return m?.[1] || ''; };
      const getVimeoId = (u: string) => { const m = u.match(/vimeo\.com\/(\d+)/); return m?.[1] || ''; };

      if (isYoutube) {
        return (
          <div key={key} className={rClasses} style={{ ...baseStyles, aspectRatio: node.props.aspectRatio || '16/9' }}>
            <iframe src={`https://www.youtube.com/embed/${getYoutubeId(url)}?autoplay=${editorMode ? 0 : node.props.autoplay ? 1 : 0}&loop=${node.props.loop ? 1 : 0}&mute=${node.props.muted ? 1 : 0}`} className={`w-full h-full rounded-lg ${editorMode ? 'pointer-events-none' : ''}`} allow="autoplay; encrypted-media" allowFullScreen loading="lazy" />
          </div>
        );
      }
      if (isVimeo) {
        return (
          <div key={key} className={rClasses} style={{ ...baseStyles, aspectRatio: node.props.aspectRatio || '16/9' }}>
            <iframe src={`https://player.vimeo.com/video/${getVimeoId(url)}?autoplay=${editorMode ? 0 : node.props.autoplay ? 1 : 0}&loop=${node.props.loop ? 1 : 0}&muted=${node.props.muted ? 1 : 0}`} className={`w-full h-full rounded-lg ${editorMode ? 'pointer-events-none' : ''}`} allow="autoplay; encrypted-media" allowFullScreen loading="lazy" />
          </div>
        );
      }
      if (!url) {
        return <div key={key} className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">🎬 No video URL set</div>;
      }
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, aspectRatio: node.props.aspectRatio || '16/9' }}>
          <video src={url} autoPlay={editorMode ? false : node.props.autoplay} loop={node.props.loop} muted={node.props.muted} controls className="w-full h-full rounded-lg object-cover" />
        </div>
      );
    }

    // ─── GOOGLE MAP ─────────────────────────────────────
    case 'google-map': {
      const embedUrl = node.props.embedUrl?.trim();
      const address = node.props.address || '';
      const hasContent = embedUrl || address.trim();
      if (!hasContent) {
        return (
          <div key={key} className={`border border-dashed border-primary/30 rounded-lg p-4 text-center ${rClasses}`}>
            <p className="text-sm text-primary font-medium">📍 Google Map</p>
            <p className="text-xs text-muted-foreground">Please enter a location or embed URL</p>
          </div>
        );
      }
      const q = encodeURIComponent(address);
      const src = embedUrl
        ? embedUrl
        : `https://www.google.com/maps?q=${q}&z=${node.props.zoom || 15}&output=embed`;
      const directionsHref = embedUrl
        ? 'https://www.google.com/maps/search/?api=1&query=SMiLZ+Dental+Treatment+Facility'
        : `https://www.google.com/maps/search/?api=1&query=${q}`;
      return (
        <div key={key} className={rClasses} style={baseStyles}>
          <div className="w-full rounded-xl overflow-hidden border border-border">
            <iframe
              src={src}
              className={`w-full h-[300px] md:h-[450px] border-0 ${editorMode ? 'pointer-events-none' : ''}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              title={node.props.title || 'Google Maps'}
            />
          </div>
          {!editorMode && (
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 inline-block">
              Open in Google Maps ↗
            </a>
          )}
        </div>
      );
    }

    // ─── ICON ───────────────────────────────────────────
    case 'icon':
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: (node.props.align || 'center') as any }}>
          <span style={{ fontSize: node.props.size || '48px', color: node.props.color || 'hsl(var(--primary))' }}>
            {ICON_MAP[node.props.icon] || '★'}
          </span>
        </div>
      );

    // ─── TABS ───────────────────────────────────────────
    case 'tabs':
      if (editorMode) {
        return (
          <div key={key} className="space-y-1">
            <div className="flex border-b border-border">
              {(node.props.items || []).map((item: any, i: number) => (
                <span key={i} className={`px-3 py-1 text-xs font-medium border-b-2 ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{item.title}</span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground p-2">{(node.props.items || [])[0]?.content || 'Tab content'}</p>
          </div>
        );
      }
      return <TabsWidget key={key} node={node} rClasses={rClasses} baseStyles={baseStyles} />;

    // ─── ACCORDION ──────────────────────────────────────
    case 'accordion': {
      const items = node.props.items || [];
      if (editorMode) {
        return (
          <div key={key} className="space-y-1">
            <p className="text-sm font-medium text-foreground">Accordion ({items.length} items)</p>
            {items.slice(0, 2).map((it: any, i: number) => (
              <div key={i} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">{it.title}</div>
            ))}
          </div>
        );
      }
      return (
        <div key={key} className={rClasses} style={baseStyles}>
          <Accordion type="single" collapsible className="w-full">
            {items.map((item: { title: string; content: string }, i: number) => (
              <AccordionItem key={i} value={`acc-${node.id}-${i}`}>
                <AccordionTrigger className="text-foreground font-medium text-left">{item.title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    // ─── IMAGE BOX ──────────────────────────────────────
    case 'image-box':
      return (
        <div key={key} className={`text-${node.props.align || 'center'} ${rClasses}`} style={baseStyles}>
          {node.props.src ? (
            <img src={node.props.src} alt={node.props.title || ''} className="w-full rounded-lg mb-3" style={{ objectFit: 'contain' }} loading="lazy" width={800} height={600} />
          ) : (
            <div className="h-24 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs mb-2">No image</div>
          )}
          <h4 className="text-lg font-semibold text-foreground">{node.props.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{node.props.description}</p>
        </div>
      );

    // ─── ICON BOX ───────────────────────────────────────
    case 'icon-box':
      return (
        <div key={key} className={`text-${node.props.align || 'center'} ${rClasses}`} style={baseStyles}>
          <span className="inline-block mb-3" style={{ fontSize: '40px', color: node.props.iconColor || 'hsl(var(--primary))' }}>
            {ICON_MAP[node.props.icon] || '★'}
          </span>
          <h4 className="text-lg font-semibold text-foreground">{node.props.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{node.props.description}</p>
        </div>
      );

    // ─── IMAGE CAROUSEL ─────────────────────────────────
    case 'image-carousel':
      if (editorMode) {
        const imgs = (node.props.images || []).filter((img: any) => img.src);
        return (
          <div key={key} className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">🖼️ Image Carousel / Slideshow</p>
            <p className="text-xs text-muted-foreground">{imgs.length} images · {node.props.autoplay ? 'Autoplay' : 'Manual'} · {node.props.interval || 3000}ms</p>
            {imgs.length > 0 && <img src={imgs[0].src} alt={imgs[0].alt || ''} className="w-full max-h-32 object-contain rounded mt-2" />}
          </div>
        );
      }
      return <ImageCarouselWidget key={key} node={node} rClasses={rClasses} baseStyles={baseStyles} />;

    // ─── GALLERY ────────────────────────────────────────
    case 'gallery': {
      const imgs = (node.props.images || []).filter((img: any) => img.src);
      const cols = node.props.columns || 3;
      if (editorMode) {
        return (
          <div key={key} className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-primary font-medium">🖼️ Gallery</p>
            <p className="text-xs text-muted-foreground">{imgs.length} images · {cols} columns</p>
            {imgs.length > 0 && (
              <div className="flex gap-1 mt-2 justify-center">
                {imgs.slice(0, 3).map((img: any, i: number) => (
                  <img key={i} src={img.src} alt={img.alt || ''} className="w-16 h-16 object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        );
      }
      return (
        <div key={key} className={`grid grid-cols-2 ${cols >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} ${cols >= 4 ? 'lg:grid-cols-4' : ''} ${rClasses}`} style={{ ...baseStyles, gap: node.props.gap || '0.5rem' }}>
          {imgs.map((img: any, i: number) => (
            <img key={i} src={img.src} alt={img.alt || ''} className="w-full aspect-square object-cover rounded-lg" loading="lazy" width={400} height={400} />
          ))}
          {!imgs.length && <div className="col-span-full text-center text-muted-foreground py-8">Add images to gallery</div>}
        </div>
      );
    }

    // ─── SOCIAL ICONS ───────────────────────────────────
    case 'social-icons':
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: (node.props.align || 'center') as any }}>
          <div className="inline-flex gap-3">
            {(node.props.icons || []).map((s: any, i: number) => {
              const inner = (
                <span className="flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  style={{ width: node.props.size ? `calc(${node.props.size} + 16px)` : '40px', height: node.props.size ? `calc(${node.props.size} + 16px)` : '40px', fontSize: node.props.size || '16px' }}>
                  {PLATFORM_ICONS[s.platform] || s.platform?.[0]?.toUpperCase() || '?'}
                </span>
              );
              if (editorMode) return <span key={i}>{inner}</span>;
              return <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer">{inner}</a>;
            })}
          </div>
        </div>
      );

    // ─── CTA BAR ──────────────────────────────────────────
    case 'cta-bar': {
      const phone = node.props.phone || '+918961775554';
      const rawPhone = phone.replace(/[^0-9]/g, '');
      const waText = encodeURIComponent(node.props.whatsappText || 'Hi, I would like to book an appointment.');
      const barBg = node.props.bgColor || 'hsl(var(--primary) / 0.95)';
      const bookBg = node.props.bookBgColor || 'hsl(var(--destructive))';
      const callBg = node.props.callBgColor || '';
      // In editor mode, never use fixed positioning — it covers the builder toolbar
      const stickyClass = node.props.sticky && !editorMode ? 'fixed top-0 left-0 z-[9999]' : '';

      return (
        <div
          key={key}
          className={`w-full shadow-md backdrop-blur-sm ${stickyClass} ${rClasses}`}
          style={{ ...baseStyles, background: barBg }}
        >
          <div className="mx-auto flex items-center justify-center gap-3 py-2.5 px-4" style={{ maxWidth: '80rem' }}>
            <a
              href={editorMode ? undefined : `https://wa.me/${rawPhone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: bookBg }}
              onClick={editorMode ? (e) => e.preventDefault() : undefined}
            >
              <span className="shrink-0">💬</span>
              {node.props.bookLabel || 'Book Appointment'}
            </a>
            <a
              href={editorMode ? undefined : `tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              style={callBg ? { background: callBg, borderColor: 'transparent' } : {}}
              onClick={editorMode ? (e) => e.preventDefault() : undefined}
            >
              <span className="shrink-0">📞</span>
              {node.props.callLabel || 'Call Now'}
            </a>
          </div>
        </div>
      );
    }

    // ─── HTML EMBED ─────────────────────────────────────
    case 'html-embed':
      if (editorMode) {
        return (
          <div key={key} className="border border-dashed border-muted-foreground/30 rounded p-2 text-xs text-muted-foreground font-mono overflow-hidden max-h-20">
            {node.props.html?.slice(0, 100)}
          </div>
        );
      }
      return <div key={key} data-cms-content className={`max-w-full ${rClasses}`} style={baseStyles} dangerouslySetInnerHTML={{ __html: sanitizeWpImages(node.props.html || '') }} />;

    // ─── LEGACY CONTENT ─────────────────────────────────
    case 'legacy-content':
      return (
        <div key={key} data-cms-content className={`prose prose-lg max-w-none ${rClasses}`} style={baseStyles} dangerouslySetInnerHTML={{ __html: sanitizeWpImages(node.props.html || '') }} />
      );

    default:
      return editorMode
        ? <div key={key} className="text-xs text-muted-foreground">Unknown block: {node.type}</div>
        : null;
  }
};
