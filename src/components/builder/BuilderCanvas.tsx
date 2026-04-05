import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Lock } from 'lucide-react';
import { useBuilder } from '@/hooks/useBuilderState';
import { getBlockDefinition, getBlockIcon } from './block-registry';
import { CONTAINER_TYPES } from '@/types/visual-builder';
import type { LayoutNode, DeviceMode } from '@/types/visual-builder';
import InlineEditable from './InlineEditable';
import SectionLayoutPicker from './SectionLayoutPicker';

// ─── Resolve responsive styles ─────────────────────────
const getResponsiveStyles = (node: LayoutNode, device: DeviceMode): React.CSSProperties => {
  const r = node.responsive;
  if (!r) return {};
  const merged = {
    ...r.desktop,
    ...(device !== 'desktop' ? r.tablet : {}),
    ...(device === 'mobile' ? r.mobile : {}),
  };
  return {
    padding: merged.padding || undefined,
    margin: merged.margin || undefined,
    fontSize: merged.fontSize || undefined,
    lineHeight: merged.lineHeight || undefined,
    textAlign: merged.textAlign || undefined,
    display: merged.display || undefined,
    gap: merged.gap || undefined,
    flexDirection: merged.flexDirection as any || undefined,
    alignItems: merged.alignItems || undefined,
    justifyContent: merged.justifyContent || undefined,
  };
};

// ─── Render block content preview on canvas ─────────────
const BlockPreview = ({ node }: { node: LayoutNode }) => {
  const { props, type } = node;

  switch (type) {
    case 'heading': {
      const sizes: Record<number, string> = { 1: 'text-3xl font-bold', 2: 'text-2xl font-bold', 3: 'text-xl font-semibold' };
      const tag = `h${props.level || 2}`;
      return (
        <InlineEditable
          blockId={node.id}
          propKey="text"
          value={props.text}
          tag={tag}
          className={`${sizes[props.level] || sizes[2]} text-foreground`}
          style={{ color: props.color || undefined, textAlign: (props.align as any) || undefined }}
        />
      );
    }
    case 'text':
      return (
        <InlineEditable
          blockId={node.id}
          propKey="text"
          value={props.text}
          tag="p"
          className="text-muted-foreground leading-relaxed"
          style={{ color: props.color || undefined, textAlign: (props.align as any) || undefined }}
        />
      );
    case 'image':
      return props.src ? (
        <figure>
          <img src={props.src} alt={props.alt || ''} className="w-full rounded-lg" style={{ borderRadius: props.borderRadius, objectFit: props.objectFit || 'contain' }} />
          {props.caption && <figcaption className="text-xs text-muted-foreground text-center mt-1">{props.caption}</figcaption>}
        </figure>
      ) : (
        <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">No image set</div>
      );
    case 'button': {
      const styles: Record<string, string> = {
        primary: 'bg-primary text-primary-foreground',
        gold: 'bg-[hsl(40,80%,55%)] text-foreground',
        outline: 'border-2 border-primary text-primary bg-transparent',
      };
      return (
        <div style={{ textAlign: props.align || 'left' }}>
          <InlineEditable
            blockId={node.id}
            propKey="text"
            value={props.text}
            tag="span"
            className={`inline-block px-6 py-2.5 rounded-lg font-semibold text-sm ${styles[props.style] || styles.primary}`}
          />
        </div>
      );
    }
    case 'spacer':
      return <div style={{ height: props.height }} className="bg-muted/30 border border-dashed border-border rounded" />;
    case 'divider':
      return <hr style={{ borderColor: props.color || undefined, borderWidth: props.thickness, width: props.width }} className="border-border" />;
    case 'blog-loop':
      return (
        <div className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">📰 Blog Posts Loop</p>
          <p className="text-xs text-muted-foreground">{props.count} posts · {props.columns} columns</p>
        </div>
      );
    case 'service-loop':
      return (
        <div className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">🦷 Services Loop</p>
          <p className="text-xs text-muted-foreground">{props.count} services · {props.columns} columns</p>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">FAQ ({(props.items || []).length} items)</p>
          {(props.items || []).slice(0, 2).map((it: any, i: number) => (
            <div key={i} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">{it.question}</div>
          ))}
        </div>
      );
    case 'testimonial':
      return (
        <blockquote className="border-l-4 border-primary/30 pl-3 italic text-muted-foreground text-sm">
          "{props.quote}" — <strong>{props.author}</strong>
        </blockquote>
      );
    case 'contact-form':
      return (
        <div className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">📧 Contact Form</p>
          <p className="text-xs text-muted-foreground">{(props.fields || []).length} fields</p>
        </div>
      );
    case 'html-embed':
      return (
        <div className="border border-dashed border-muted-foreground/30 rounded p-2 text-xs text-muted-foreground font-mono overflow-hidden max-h-20">
          {props.html?.slice(0, 100)}
        </div>
      );
    case 'legacy-content':
      return (
        <div className="border border-dashed border-muted-foreground/30 rounded p-3">
          <p className="text-xs font-medium text-primary mb-2">📄 Legacy Content Block</p>
          {props.html ? (
            <div
              className="prose prose-sm max-w-none max-h-48 overflow-hidden text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: props.html }}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center">No legacy content</p>
          )}
        </div>
      );
    case 'video': {
      const url = props.url || '';
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      const getYoutubeId = (u: string) => {
        const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
        return m?.[1] || '';
      };
      if (isYoutube) {
        return (
          <div style={{ aspectRatio: props.aspectRatio || '16/9' }}>
            <iframe src={`https://www.youtube.com/embed/${getYoutubeId(url)}?autoplay=0`} className="w-full h-full rounded-lg" allow="encrypted-media" allowFullScreen />
          </div>
        );
      }
      return url ? (
        <div style={{ aspectRatio: props.aspectRatio || '16/9' }}>
          <video src={url} muted controls className="w-full h-full rounded-lg object-cover" />
        </div>
      ) : (
        <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">🎬 No video URL set</div>
      );
    }
    case 'google-map':
      return (
        <div className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">📍 Google Map</p>
          <p className="text-xs text-muted-foreground">{props.address || 'No address'}</p>
        </div>
      );
    case 'icon': {
      const IconMap: Record<string, string> = { Star: '⭐', Heart: '❤️', Check: '✓', Phone: '📞', Mail: '✉️', Home: '🏠', ArrowRight: '→', Tooth: '🦷', Smile: '😊', Shield: '🛡️', Clock: '🕐', Calendar: '📅', Sparkles: '✨', Syringe: '💉', Stethoscope: '🩺', Award: '🏆', Users: '👥', MapPin: '📍', ThumbsUp: '👍', Eye: '👁️', Baby: '👶', Pill: '💊', Xray: '🔬', Clipboard: '📋' };
      return (
        <div style={{ textAlign: (props.align || 'center') as any }}>
          <span style={{ fontSize: props.size || '48px', color: props.color || 'hsl(var(--primary))' }}>
            {IconMap[props.icon] || '★'}
          </span>
        </div>
      );
    }
    case 'tabs':
      return (
        <div className="space-y-1">
          <div className="flex border-b border-border">
            {(props.items || []).map((item: any, i: number) => (
              <span key={i} className={`px-3 py-1 text-xs font-medium border-b-2 ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{item.title}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground p-2">{(props.items || [])[0]?.content || 'Tab content'}</p>
        </div>
      );
    case 'accordion':
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Accordion ({(props.items || []).length} items)</p>
          {(props.items || []).slice(0, 2).map((it: any, i: number) => (
            <div key={i} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">{it.title}</div>
          ))}
        </div>
      );
    case 'image-box':
      return (
        <div style={{ textAlign: (props.align || 'center') as any }}>
          {props.src ? (
            <img src={props.src} alt={props.title || ''} className="w-full rounded-lg mb-2" style={{ objectFit: 'contain' }} />
          ) : (
            <div className="h-24 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs mb-2">No image</div>
          )}
          <h4 className="text-sm font-semibold text-foreground">{props.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{props.description}</p>
        </div>
      );
    case 'icon-box': {
      const IMap: Record<string, string> = { Star: '⭐', Heart: '❤️', Check: '✓', Phone: '📞', Mail: '✉️', Home: '🏠', ArrowRight: '→', Tooth: '🦷', Smile: '😊', Shield: '🛡️', Clock: '🕐', Calendar: '📅', Sparkles: '✨', Syringe: '💉', Stethoscope: '🩺', Award: '🏆', Users: '👥', MapPin: '📍', ThumbsUp: '👍', Eye: '👁️', Baby: '👶', Pill: '💊', Xray: '🔬', Clipboard: '📋' };
      return (
        <div style={{ textAlign: (props.align || 'center') as any }}>
          <span className="inline-block mb-1" style={{ fontSize: '32px', color: props.iconColor || 'hsl(var(--primary))' }}>
            {IMap[props.icon] || '★'}
          </span>
          <h4 className="text-sm font-semibold text-foreground">{props.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{props.description}</p>
        </div>
      );
    }
    case 'image-carousel': {
      const imgs = (props.images || []).filter((img: any) => img.src);
      return (
        <div className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">🖼️ Image Carousel / Slideshow</p>
          <p className="text-xs text-muted-foreground">{imgs.length} images · {props.autoplay ? 'Autoplay' : 'Manual'} · {props.interval || 3000}ms</p>
          {imgs.length > 0 && <img src={imgs[0].src} alt={imgs[0].alt || ''} className="w-full max-h-32 object-contain rounded mt-2" />}
        </div>
      );
    }
    case 'gallery': {
      const imgs = (props.images || []).filter((img: any) => img.src);
      return (
        <div className="border border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">🖼️ Gallery</p>
          <p className="text-xs text-muted-foreground">{imgs.length} images · {props.columns || 3} columns</p>
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
    case 'social-icons': {
      const platformIcons: Record<string, string> = { facebook: 'f', instagram: '📷', youtube: '▶', twitter: '𝕏', linkedin: 'in', whatsapp: '💬' };
      return (
        <div style={{ textAlign: (props.align || 'center') as any }}>
          <div className="inline-flex gap-2">
            {(props.icons || []).map((s: any, i: number) => (
              <span key={i} className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs">
                {platformIcons[s.platform] || '?'}
              </span>
            ))}
          </div>
        </div>
      );
    }
    case 'icon-list':
      return (
        <ul className="space-y-1">
          {(props.items || []).map((item: any, i: number) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">✓</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return <div className="text-xs text-muted-foreground">Unknown block: {type}</div>;
  }
};

// ─── Sortable block wrapper ─────────────────────────────
const SortableBlock = ({ node, parentId }: { node: LayoutNode; parentId: string | null }) => {
  const { state, dispatch, addBlock } = useBuilder();
  const isContainer = CONTAINER_TYPES.includes(node.type);
  const isSelected = state.selectedBlockId === node.id;
  const isHovered = state.hoveredBlockId === node.id;
  const isLocked = node.props?.locked || false;
  const isHiddenOnDevice = (node.props?.hideOn || []).includes(state.deviceMode);
  const def = getBlockDefinition(node.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { fromPalette: false, blockId: node.id, parentId },
    disabled: isLocked,
  });

  const rStyles = getResponsiveStyles(node, state.deviceMode);
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Section uses CSS Grid
  if (node.type === 'section') {
    const layoutMode = node.props.layoutMode || 'grid';
    style.background = node.props.background || undefined;
    if (node.props.backgroundImage) {
      style.backgroundImage = `url(${node.props.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    style.padding = rStyles.padding;
    style.margin = rStyles.margin;
  }

  // Grid block uses CSS Grid
  if (node.type === 'grid') {
    style.padding = rStyles.padding;
    style.margin = rStyles.margin;
  }

  // Column styling
  if (node.type === 'column') {
    style.minHeight = '60px';
    style.display = rStyles.display === 'none' ? 'none' : 'flex';
    style.flexDirection = 'column';
    style.justifyContent = node.props.verticalAlign || 'flex-start';
    style.padding = rStyles.padding;
    style.margin = rStyles.margin;
  }

  const outlineClass = isSelected
    ? 'ring-2 ring-primary ring-offset-1'
    : isHovered
      ? 'ring-1 ring-primary/40'
      : (isContainer ? 'ring-1 ring-transparent hover:ring-border' : '');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/block relative ${isContainer ? 'min-h-[60px]' : ''} ${outlineClass} ${isDragging ? 'z-50' : ''} ${isHiddenOnDevice ? 'opacity-40 border-dashed' : ''}`}
      onClick={e => { e.stopPropagation(); dispatch({ type: 'SELECT_BLOCK', payload: node.id }); }}
      onMouseEnter={e => { e.stopPropagation(); dispatch({ type: 'HOVER_BLOCK', payload: node.id }); }}
      onMouseLeave={e => { e.stopPropagation(); dispatch({ type: 'HOVER_BLOCK', payload: null }); }}
    >
      {/* Block toolbar */}
      <div className={`absolute -top-5 left-0 flex items-center gap-0.5 bg-primary text-primary-foreground rounded-t text-[10px] px-1.5 py-0.5 z-10 transition-opacity ${
        isSelected || isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        {isLocked ? (
          <Lock className="h-3 w-3 text-amber-300" />
        ) : (
          <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3 w-3" />
          </span>
        )}
        <span className="ml-1">{def?.label || node.type}</span>
        {isHiddenOnDevice && <span className="ml-1 text-amber-300 text-[9px]">👁️‍🗨️ hidden</span>}
        {isLocked && <span className="ml-1 text-amber-300 text-[9px]">🔒</span>}
        {!isLocked && (
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_BLOCK', payload: node.id }); }}
            className="ml-1 hover:text-destructive-foreground"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Block content */}
      {isContainer ? (
        <ContainerDropZone node={node}>
          {node.children && node.children.length > 0 ? (
            node.children.map(child => (
              <SortableBlock key={child.id} node={child} parentId={node.id} />
            ))
          ) : (
            <DropPlaceholder parentId={node.id} onAdd={type => addBlock(type, node.id)} />
          )}
        </ContainerDropZone>
      ) : (
        <div className="p-2">
          <BlockPreview node={node} />
        </div>
      )}
    </div>
  );
};

// ─── Container drop zone with grid/flex layout ──────────
const ContainerDropZone = ({ node, children }: { node: LayoutNode; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: `container-${node.id}`, data: { containerId: node.id } });
  const childIds = node.children?.map(c => c.id) || [];

  // Determine grid or flex layout
  let containerStyle: React.CSSProperties = {};
  let containerClass = 'min-h-[60px] w-full p-2';

  if (node.type === 'section') {
    const gridColumns = node.props.gridColumns || '1fr';
    containerStyle = {
      display: 'grid',
      gridTemplateColumns: gridColumns,
      columnGap: node.props.columnGap || '1.5rem',
      rowGap: node.props.rowGap || '1.5rem',
    };
    containerClass += ' rounded-lg';
  } else if (node.type === 'grid') {
    const cols = node.props.gridCols || 2;
    containerStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      columnGap: node.props.columnGap || '1rem',
      rowGap: node.props.rowGap || '1rem',
    };
  } else {
    // Column: vertical flex
    containerStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
  }

  return (
    <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className={containerClass} style={containerStyle}>
        {children}
      </div>
    </SortableContext>
  );
};

// ─── Empty container placeholder ────────────────────────
const DropPlaceholder = ({ parentId, onAdd }: { parentId: string; onAdd: (type: string) => void }) => (
  <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground min-h-[60px]">
    <Plus className="h-5 w-5 mb-1" />
    <p className="text-xs">Drop blocks here</p>
    <div className="flex gap-1 mt-2 flex-wrap justify-center">
      <button onClick={() => onAdd('heading')} className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-primary/10">+ Heading</button>
      <button onClick={() => onAdd('text')} className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-primary/10">+ Text</button>
      <button onClick={() => onAdd('image')} className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-primary/10">+ Image</button>
    </div>
  </div>
);

// ─── Add Section Button ─────────────────────────────────
const AddSectionButton = ({ onOpen }: { onOpen: () => void }) => (
  <div className="flex justify-center py-3">
    <button
      onClick={onOpen}
      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
    >
      <Plus className="h-4 w-4" />
      Add Section
    </button>
  </div>
);

// ─── Main Canvas ────────────────────────────────────────
const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const BuilderCanvas = () => {
  const { state, dispatch, addBlock } = useBuilder();
  const { layout, deviceMode } = state;
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const { setNodeRef: setCanvasRef } = useDroppable({
    id: 'canvas-root',
    data: { containerId: null },
  });

  const topLevelIds = layout.map(n => n.id);

  return (
    <div className="h-full overflow-auto bg-muted/30 p-4">
      <div
        className="mx-auto bg-card shadow-card rounded-lg min-h-[70vh] transition-all duration-300"
        style={{ maxWidth: DEVICE_WIDTHS[deviceMode] }}
      >
        <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
          <div ref={setCanvasRef} className="min-h-[70vh] p-4 space-y-2">
            {layout.length > 0 ? (
              <>
                {layout.map(node => (
                  <SortableBlock key={node.id} node={node} parentId={null} />
                ))}
                <AddSectionButton onOpen={() => setShowLayoutPicker(true)} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                <Plus className="h-10 w-10 mb-3 text-primary/30" />
                <p className="text-sm font-medium">Start building your page</p>
                <p className="text-xs mt-1">Choose a section layout to get started</p>
                <button
                  onClick={() => setShowLayoutPicker(true)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  + Add Section
                </button>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      <SectionLayoutPicker
        open={showLayoutPicker}
        onClose={() => setShowLayoutPicker(false)}
      />
    </div>
  );
};

export default BuilderCanvas;
