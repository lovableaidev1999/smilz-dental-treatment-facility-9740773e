import { useState, useEffect, useRef } from 'react';
import type { LayoutNode } from '@/types/visual-builder';
import { renderNodeContent } from './shared-renderer';

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

const VisualRenderer = ({ layout, className }: Props) => {
  return (
    <div className={className}>
      {layout.map((node, i) => {
        const rendered = renderNodeContent(node, i);
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
