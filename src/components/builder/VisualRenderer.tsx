import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LayoutNode, DeviceMode } from '@/types/visual-builder';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Props {
  layout: LayoutNode[];
  className?: string;
}

// ─── Lazy load wrapper for below-the-fold blocks ────────
const LazyBlock = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(index < 3);

  useEffect(() => {
    if (index < 3 || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  if (index < 3) return <>{children}</>;

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : '100px' }}>
      {visible ? children : <div className="animate-pulse bg-muted rounded-lg h-24" />}
    </div>
  );
};

// ─── Animation wrapper ──────────────────────────────────
const AnimatedBlock = ({ children, animation, delay, hoverEffect }: {
  children: React.ReactNode;
  animation?: string;
  delay?: string;
  hoverEffect?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!animation);

  useEffect(() => {
    if (!animation || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animation]);

  const animStyles: Record<string, React.CSSProperties> = {
    'fade-in': { opacity: visible ? 1 : 0, transition: `opacity 0.6s ease ${delay || '0'}ms` },
    'slide-up': { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${delay || '0'}ms, transform 0.6s ease ${delay || '0'}ms` },
    'slide-left': { opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-30px)', transition: `opacity 0.6s ease ${delay || '0'}ms, transform 0.6s ease ${delay || '0'}ms` },
    'slide-right': { opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(30px)', transition: `opacity 0.6s ease ${delay || '0'}ms, transform 0.6s ease ${delay || '0'}ms` },
    'scale-in': { opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.9)', transition: `opacity 0.6s ease ${delay || '0'}ms, transform 0.6s ease ${delay || '0'}ms` },
  };

  const hoverClasses: Record<string, string> = {
    'lift': 'hover:-translate-y-1 hover:shadow-elevated',
    'glow': 'hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
    'scale': 'hover:scale-105',
  };

  if (!animation && !hoverEffect) return <>{children}</>;

  return (
    <div
      ref={ref}
      style={animation ? animStyles[animation] : undefined}
      className={`transition-all duration-300 ${hoverEffect ? hoverClasses[hoverEffect] || '' : ''}`}
    >
      {children}
    </div>
  );
};

// ─── Responsive styles ──────────────────────────────────
// For public rendering we use desktop by default
const getStyles = (node: LayoutNode): React.CSSProperties => {
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

// ─── Responsive CSS classes for tablet/mobile ───────────
const getResponsiveClasses = (node: LayoutNode): string => {
  const classes: string[] = [];
  const hideOn: string[] = node.props?.hideOn || [];
  
  // Per-device visibility via hideOn prop
  if (hideOn.includes('mobile') || node.responsive?.mobile?.display === 'none') classes.push('max-md:hidden');
  if (hideOn.includes('tablet') || node.responsive?.tablet?.display === 'none') classes.push('md:max-lg:hidden');
  if (hideOn.includes('desktop') || node.responsive?.desktop?.display === 'none') classes.push('lg:hidden');
  
  return classes.join(' ');
};

// ─── Embla Carousel helper ──────────────────────────────
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
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === selectedIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Blog Loop Widget ──────────────────────────────────
const BlogLoopWidget = ({ props }: { props: any }) => {
  const { data: posts } = useQuery({
    queryKey: ['blog_posts_loop', props.category, props.count],
    queryFn: async () => {
      let q = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(props.count || 3);
      if (props.category) q = q.eq('category', props.category);
      const { data } = await q;
      return data || [];
    },
  });

  const renderCard = (post: any) => (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <div className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow h-full">
        {props.showImage && post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
          {props.showExcerpt && post.excerpt && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
          )}
          {props.showDate && post.published_at && (
            <p className="text-xs text-muted-foreground mt-2">{new Date(post.published_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </Link>
  );

  if (props.displayType === 'carousel') {
    return <EmblaCarousel items={posts || []} renderItem={(post) => renderCard(post)} autoplay={props.autoplay} showNavigation={props.showNavigation} />;
  }

  const cols = props.columns || 3;
  return (
    <div className={`grid gap-6 grid-cols-1 ${cols >= 2 ? 'md:grid-cols-2' : ''} ${cols >= 3 ? 'lg:grid-cols-3' : ''} ${cols >= 4 ? 'xl:grid-cols-4' : ''}`}>
      {(posts || []).map((post: any) => <div key={post.id}>{renderCard(post)}</div>)}
    </div>
  );
};

// ─── Service Loop Widget ────────────────────────────────
const ServiceLoopWidget = ({ props }: { props: any }) => {
  const { data: services } = useQuery({
    queryKey: ['services_loop', props.count],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(props.count || 6);
      return data || [];
    },
  });

  const renderCard = (svc: any) => (
    <Link to={`/services/${svc.slug}`} className="group block h-full">
      <div className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow h-full">
        {props.showImage && svc.image_url && (
          <img src={svc.image_url} alt={svc.title} className="w-full h-40 object-cover" loading="lazy" />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{svc.title}</h3>
          {props.showDescription && svc.short_description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{svc.short_description}</p>
          )}
        </div>
      </div>
    </Link>
  );

  if (props.displayType === 'carousel') {
    return <EmblaCarousel items={services || []} renderItem={(svc) => renderCard(svc)} autoplay={props.autoplay} showNavigation={props.showNavigation} />;
  }

  const cols = props.columns || 3;
  return (
    <div className={`grid gap-6 grid-cols-1 ${cols >= 2 ? 'md:grid-cols-2' : ''} ${cols >= 3 ? 'lg:grid-cols-3' : ''} ${cols >= 4 ? 'xl:grid-cols-4' : ''}`}>
      {(services || []).map((svc: any) => <div key={svc.id}>{renderCard(svc)}</div>)}
    </div>
  );
};

// ─── Contact Form Widget ────────────────────────────────
const ContactFormWidget = ({ node, rClasses, baseStyles }: { node: LayoutNode; rClasses: string; baseStyles: React.CSSProperties }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('contact_submissions').insert({
        name: formData['Name'] || '',
        email: formData['Email'] || '',
        phone: formData['Phone'] || '',
        message: formData['Message'] || '',
        source: 'page-builder',
      });
      setSubmitted(true);
      setFormData({});
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-8 text-center bg-primary/5 rounded-xl ${rClasses}`} style={baseStyles}>
        <p className="text-lg font-semibold text-foreground">Thank you!</p>
        <p className="text-muted-foreground mt-1">We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className={`space-y-4 ${rClasses}`} style={baseStyles} onSubmit={handleSubmit}>
      {(node.props.fields || []).map((field: any, i: number) => (
        <div key={i}>
          <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground"
              rows={4}
              required={field.required}
              value={formData[field.label] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
            />
          ) : (
            <input
              type={field.type}
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground"
              required={field.required}
              value={formData[field.label] || ''}
              onChange={e => setFormData(prev => ({ ...prev, [field.label]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Sending...' : (node.props.submitText || 'Submit')}
      </button>
    </form>
  );
};

// ─── Tabs Widget (needs hooks) ──────────────────────────
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

// ─── Image Carousel Widget (needs hooks) ────────────────
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
      <img src={imgs[current]?.src} alt={imgs[current]?.alt || ''} className="w-full h-64 object-cover transition-opacity" loading="lazy" />
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

// ─── Recursive renderer ─────────────────────────────────
const renderNode = (node: LayoutNode, index: number): React.ReactNode => {
  const key = `${node.type}-${node.id}`;
  const baseStyles = getStyles(node);
  const rClasses = getResponsiveClasses(node);

  switch (node.type) {
    case 'section': {
      const gridColumns = node.props.gridColumns || '1fr';
      const colCount = gridColumns.split(' ').filter(Boolean).length;
      const gapStyle: React.CSSProperties = {
        columnGap: node.props.columnGap || '1.5rem',
        rowGap: node.props.rowGap || '1.5rem',
        alignItems: baseStyles.alignItems || undefined,
      };
      // Mobile: always single column. Tablet+: use the defined grid.
      const gridStyle: React.CSSProperties = colCount > 1
        ? { display: 'grid', gridTemplateColumns: gridColumns, ...gapStyle }
        : { display: 'grid', gridTemplateColumns: '1fr', ...gapStyle };
      const mobileGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr', ...gapStyle };

      return (
        <section
          key={key}
          className={`relative w-full py-12 md:py-16 px-4 md:px-6 ${rClasses}`}
          style={{
            background: node.props.background || undefined,
            backgroundImage: node.props.backgroundImage ? `url(${node.props.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: baseStyles.padding || undefined,
          }}
        >
          <div
            className="w-full mx-auto"
            style={{ maxWidth: node.props.fullWidth ? '100%' : (node.props.maxWidth || '80rem') }}
          >
            {/* Mobile grid (stacked) - hidden on md+ */}
            {colCount > 1 && (
              <div className="md:hidden" style={mobileGridStyle}>
                {node.children?.map((child, i) => (
                  <div key={child.id} className="w-full min-w-0">{renderNode(child, i)}</div>
                ))}
              </div>
            )}
            {/* Desktop grid - hidden on mobile when multi-col */}
            <div className={colCount > 1 ? 'hidden md:grid' : 'grid'} style={gridStyle}>
              {node.children?.map((child, i) => (
                <div key={child.id} className="w-full min-w-0">{renderNode(child, i)}</div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'grid': {
      const cols = node.props.gridCols || 2;
      return (
        <div
          key={key}
          className={`grid grid-cols-1 ${cols >= 2 ? 'md:grid-cols-2' : ''} ${cols >= 3 ? 'lg:grid-cols-3' : ''} ${cols >= 4 ? 'xl:grid-cols-4' : ''} ${rClasses}`}
          style={{
            ...baseStyles,
            columnGap: node.props.columnGap || '1rem',
            rowGap: node.props.rowGap || '1rem',
          }}
        >
          {node.children?.map((child, i) => (
            <div key={child.id} className="w-full min-w-0">{renderNode(child, i)}</div>
          ))}
        </div>
      );
    }

    case 'column': {
      const colStyle: React.CSSProperties = {
        ...baseStyles,
        display: baseStyles.display === 'none' ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: node.props.verticalAlign || 'flex-start',
      };
      return (
        <div key={key} className={rClasses} style={colStyle}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </div>
      );
    }

    case 'heading': {
      const Tag = `h${node.props.level || 2}` as keyof JSX.IntrinsicElements;
      const sizes: Record<number, string> = {
        1: 'text-3xl md:text-4xl font-bold',
        2: 'text-2xl md:text-3xl font-bold',
        3: 'text-xl md:text-2xl font-semibold',
      };
      return (
        <Tag
          key={key}
          className={`font-heading text-foreground ${sizes[node.props.level] || sizes[2]} ${rClasses}`}
          style={{ ...baseStyles, color: node.props.color || undefined, textAlign: node.props.align || baseStyles.textAlign }}
        >
          {node.props.text}
        </Tag>
      );
    }

    case 'text':
      return (
        <p
          key={key}
          className={`text-muted-foreground leading-relaxed ${rClasses}`}
          style={{ ...baseStyles, color: node.props.color || undefined, textAlign: node.props.align || baseStyles.textAlign }}
        >
          {node.props.text}
        </p>
      );

    case 'image':
      return node.props.src ? (
        <figure key={key} className={rClasses} style={baseStyles}>
          <img
            src={node.props.src}
            alt={node.props.alt || ''}
            className="w-full"
            style={{ borderRadius: node.props.borderRadius, objectFit: node.props.objectFit || 'contain' }}
            loading="lazy"
          />
          {node.props.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2 italic">{node.props.caption}</figcaption>
          )}
        </figure>
      ) : null;

    case 'button': {
      const btnStyles: Record<string, string> = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        gold: 'bg-[hsl(40,80%,55%)] text-foreground hover:opacity-90',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
      };
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: node.props.align || 'left' }}>
          <Link
            to={node.props.url || '/contact'}
            className={`inline-block px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:shadow-elevated ${
              btnStyles[node.props.style] || btnStyles.primary
            }`}
          >
            {node.props.text}
          </Link>
        </div>
      );
    }

    case 'spacer':
      return <div key={key} className={rClasses} style={{ ...baseStyles, height: node.props.height }} />;

    case 'divider':
      return (
        <hr
          key={key}
          className={`border-border ${rClasses}`}
          style={{
            ...baseStyles,
            borderColor: node.props.color || undefined,
            borderWidth: node.props.thickness,
            width: node.props.width,
          }}
        />
      );

    case 'blog-loop':
      return <BlogLoopWidget key={key} props={node.props} />;

    case 'service-loop':
      return <ServiceLoopWidget key={key} props={node.props} />;

    case 'faq': {
      const items = node.props.items || [];
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: items
                  .filter((it: any) => it.question && it.answer)
                  .map((it: any) => ({
                    '@type': 'Question',
                    name: it.question,
                    acceptedAnswer: { '@type': 'Answer', text: it.answer },
                  })),
              }),
            }}
          />
        </div>
      );
    }

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

    case 'contact-form':
      return <ContactFormWidget key={key} node={node} rClasses={rClasses} baseStyles={baseStyles} />;

    case 'icon-list':
      return (
        <ul key={key} className={`space-y-2 ${rClasses}`} style={baseStyles}>
          {(node.props.items || []).map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">✓</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      );

    case 'video': {
      // Support YouTube, Vimeo embed URLs or direct video
      const url = node.props.url || '';
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      const isVimeo = url.includes('vimeo.com');
      const getYoutubeId = (u: string) => {
        const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
        return m?.[1] || '';
      };
      const getVimeoId = (u: string) => {
        const m = u.match(/vimeo\.com\/(\d+)/);
        return m?.[1] || '';
      };
      if (isYoutube) {
        return (
          <div key={key} className={rClasses} style={{ ...baseStyles, aspectRatio: node.props.aspectRatio || '16/9' }}>
            <iframe src={`https://www.youtube.com/embed/${getYoutubeId(url)}?autoplay=${node.props.autoplay ? 1 : 0}&loop=${node.props.loop ? 1 : 0}&mute=${node.props.muted ? 1 : 0}`} className="w-full h-full rounded-lg" allow="autoplay; encrypted-media" allowFullScreen loading="lazy" />
          </div>
        );
      }
      if (isVimeo) {
        return (
          <div key={key} className={rClasses} style={{ ...baseStyles, aspectRatio: node.props.aspectRatio || '16/9' }}>
            <iframe src={`https://player.vimeo.com/video/${getVimeoId(url)}?autoplay=${node.props.autoplay ? 1 : 0}&loop=${node.props.loop ? 1 : 0}&muted=${node.props.muted ? 1 : 0}`} className="w-full h-full rounded-lg" allow="autoplay; encrypted-media" allowFullScreen loading="lazy" />
          </div>
        );
      }
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, aspectRatio: node.props.aspectRatio || '16/9' }}>
          <video src={url} autoPlay={node.props.autoplay} loop={node.props.loop} muted={node.props.muted} controls className="w-full h-full rounded-lg object-cover" />
        </div>
      );
    }

    case 'google-map': {
      const address = node.props.address || '';
      if (!address.trim()) {
        return (
          <div key={key} className={`${rClasses} flex items-center justify-center bg-muted rounded-lg`} style={{ ...baseStyles, height: node.props.height || '300px' }}>
            <p className="text-muted-foreground text-sm">📍 Please enter a location</p>
          </div>
        );
      }
      const q = encodeURIComponent(address);
      return (
        <div key={key} className={rClasses} style={baseStyles}>
          <div className="w-full rounded-xl overflow-hidden border border-border">
            <iframe
              src={`https://www.google.com/maps?q=${q}&z=${node.props.zoom || 15}&output=embed`}
              className="w-full h-[300px] md:h-[450px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              title="Google Maps"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${q}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Open in Google Maps ↗
          </a>
        </div>
      );
    }

    case 'icon': {
      const IconMap: Record<string, string> = { Star: '★', Heart: '♥', Check: '✓', Phone: '☎', Mail: '✉', Home: '⌂', ArrowRight: '→' };
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: (node.props.align || 'center') as any }}>
          <span style={{ fontSize: node.props.size || '48px', color: node.props.color || 'hsl(var(--primary))' }}>
            {IconMap[node.props.icon] || '★'}
          </span>
        </div>
      );
    }

    case 'tabs':
      return <TabsWidget key={key} node={node} rClasses={rClasses} baseStyles={baseStyles} />;

    case 'accordion': {
      const items = node.props.items || [];
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

    case 'image-box':
      return (
        <div key={key} className={`text-${node.props.align || 'center'} ${rClasses}`} style={baseStyles}>
          {node.props.src && <img src={node.props.src} alt={node.props.title || ''} className="w-full rounded-lg mb-3" style={{ objectFit: 'contain' }} loading="lazy" />}
          <h4 className="text-lg font-semibold text-foreground">{node.props.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{node.props.description}</p>
        </div>
      );

    case 'icon-box': {
      const IconMap: Record<string, string> = { Star: '★', Heart: '♥', Check: '✓', Phone: '☎', Mail: '✉', Home: '⌂', ArrowRight: '→' };
      return (
        <div key={key} className={`text-${node.props.align || 'center'} ${rClasses}`} style={baseStyles}>
          <span className="inline-block mb-3" style={{ fontSize: '40px', color: node.props.iconColor || 'hsl(var(--primary))' }}>
            {IconMap[node.props.icon] || '★'}
          </span>
          <h4 className="text-lg font-semibold text-foreground">{node.props.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{node.props.description}</p>
        </div>
      );
    }

    case 'image-carousel':
      return <ImageCarouselWidget key={key} node={node} rClasses={rClasses} baseStyles={baseStyles} />;

    case 'gallery': {
      const imgs = (node.props.images || []).filter((img: any) => img.src);
      const cols = node.props.columns || 3;
      return (
        <div key={key} className={`grid grid-cols-2 ${cols >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} ${cols >= 4 ? 'lg:grid-cols-4' : ''} ${rClasses}`} style={{ ...baseStyles, gap: node.props.gap || '0.5rem' }}>
          {imgs.map((img: any, i: number) => (
            <img key={i} src={img.src} alt={img.alt || ''} className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
          ))}
          {!imgs.length && <div className="col-span-full text-center text-muted-foreground py-8">Add images to gallery</div>}
        </div>
      );
    }

    case 'social-icons': {
      const platformIcons: Record<string, string> = { facebook: 'f', instagram: '📷', youtube: '▶', twitter: '𝕏', linkedin: 'in', whatsapp: '💬' };
      return (
        <div key={key} className={rClasses} style={{ ...baseStyles, textAlign: (node.props.align || 'center') as any }}>
          <div className="inline-flex gap-3">
            {(node.props.icons || []).map((s: any, i: number) => (
              <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                style={{ width: node.props.size ? `calc(${node.props.size} + 16px)` : '40px', height: node.props.size ? `calc(${node.props.size} + 16px)` : '40px', fontSize: node.props.size || '16px' }}
              >
                {platformIcons[s.platform] || s.platform?.[0]?.toUpperCase() || '?'}
              </a>
            ))}
          </div>
        </div>
      );
    }

    case 'html-embed':
      return (
        <div
          key={key}
          className={rClasses}
          style={baseStyles}
          dangerouslySetInnerHTML={{ __html: node.props.html || '' }}
        />
      );

    case 'legacy-content':
      return (
        <div
          key={key}
          className={`prose prose-lg max-w-none ${rClasses}`}
          style={baseStyles}
          dangerouslySetInnerHTML={{ __html: node.props.html || '' }}
        />
      );

    default:
      return null;
  }
};

const VisualRenderer = ({ layout, className }: Props) => {
  return (
    <div className={className}>
      {layout.map((node, i) => {
        const rendered = renderNode(node, i);
        if (!rendered) return null;
        const hasAnimation = node.props?.animation || node.props?.hoverEffect;
        const content = hasAnimation ? (
          <AnimatedBlock
            key={node.id}
            animation={node.props.animation}
            delay={node.props.animationDelay}
            hoverEffect={node.props.hoverEffect}
          >
            {rendered}
          </AnimatedBlock>
        ) : rendered;

        // Lazy load blocks below the fold
        return (
          <LazyBlock key={node.id} index={i}>
            {content}
          </LazyBlock>
        );
      })}
    </div>
  );
};

export default VisualRenderer;
