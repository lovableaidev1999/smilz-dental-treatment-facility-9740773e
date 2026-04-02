import { useState, useEffect, useRef } from 'react';
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

interface Props {
  layout: LayoutNode[];
  className?: string;
}

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
  if (node.responsive?.tablet?.display === 'none') classes.push('md:hidden');
  if (node.responsive?.mobile?.display === 'none') classes.push('max-md:hidden');
  if (node.responsive?.desktop?.display === 'none') classes.push('lg:hidden');
  return classes.join(' ');
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

  const cols = props.columns || 3;

  return (
    <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {(posts || []).map((post: any) => (
        <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
          <div className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
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
      ))}
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

  const cols = props.columns || 3;

  return (
    <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {(services || []).map((svc: any) => (
        <Link key={svc.id} to={`/services/${svc.slug}`} className="group block">
          <div className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
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
      ))}
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

// ─── Recursive renderer ─────────────────────────────────
const renderNode = (node: LayoutNode, index: number): React.ReactNode => {
  const key = `${node.type}-${node.id}`;
  const baseStyles = getStyles(node);
  const rClasses = getResponsiveClasses(node);

  switch (node.type) {
    case 'section': {
      const gridColumns = node.props.gridColumns || '1fr';
      const sectionInner: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: gridColumns,
        columnGap: node.props.columnGap || '1.5rem',
        rowGap: node.props.rowGap || '1.5rem',
        alignItems: baseStyles.alignItems || undefined,
      };
      return (
        <section
          key={key}
          className={`w-full ${rClasses}`}
          style={{
            ...baseStyles,
            background: node.props.background || undefined,
            backgroundImage: node.props.backgroundImage ? `url(${node.props.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            className="w-full mx-auto"
            style={{ maxWidth: node.props.fullWidth ? '100%' : (node.props.maxWidth || '1280px') }}
          >
            <div style={sectionInner}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </div>
          </div>
        </section>
      );
    }

    case 'grid': {
      const cols = node.props.gridCols || 2;
      const gridStyle: React.CSSProperties = {
        ...baseStyles,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        columnGap: node.props.columnGap || '1rem',
        rowGap: node.props.rowGap || '1rem',
      };
      return (
        <div key={key} className={rClasses} style={gridStyle}>
          {node.children?.map((child, i) => renderNode(child, i))}
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
            className="w-full object-cover"
            style={{ borderRadius: node.props.borderRadius, objectFit: node.props.objectFit }}
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
        if (hasAnimation) {
          return (
            <AnimatedBlock
              key={node.id}
              animation={node.props.animation}
              delay={node.props.animationDelay}
              hoverEffect={node.props.hoverEffect}
            >
              {rendered}
            </AnimatedBlock>
          );
        }
        return rendered;
      })}
    </div>
  );
};

export default VisualRenderer;
