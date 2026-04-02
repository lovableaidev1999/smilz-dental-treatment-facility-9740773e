import { useCallback, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useBuilder } from '@/hooks/useBuilderState';
import { getBlockDefinition, getBlockIcon } from './block-registry';
import { CONTAINER_TYPES } from '@/types/visual-builder';
import type { LayoutNode, DeviceMode } from '@/types/visual-builder';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// ─── Resolve responsive styles ─────────────────────────
const getResponsiveStyles = (node: LayoutNode, device: DeviceMode): React.CSSProperties => {
  const r = node.responsive;
  if (!r) return {};
  // Cascade: mobile inherits from tablet inherits from desktop
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
      const Tag = `h${props.level || 2}` as keyof JSX.IntrinsicElements;
      const sizes: Record<number, string> = { 1: 'text-3xl font-bold', 2: 'text-2xl font-bold', 3: 'text-xl font-semibold' };
      return <Tag className={`${sizes[props.level] || sizes[2]} text-foreground`} style={{ color: props.color || undefined }}>{props.text}</Tag>;
    }
    case 'text':
      return <p className="text-muted-foreground leading-relaxed" style={{ color: props.color || undefined }}>{props.text}</p>;
    case 'image':
      return props.src ? (
        <figure>
          <img src={props.src} alt={props.alt || ''} className="w-full rounded-lg object-cover max-h-48" style={{ borderRadius: props.borderRadius }} />
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
          <span className={`inline-block px-6 py-2.5 rounded-lg font-semibold text-sm ${styles[props.style] || styles.primary}`}>
            {props.text}
          </span>
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
        <div className="border border-dashed border-muted-foreground/30 rounded p-3 text-center">
          <p className="text-sm text-muted-foreground">📄 Legacy Content Block</p>
        </div>
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
  const def = getBlockDefinition(node.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { fromPalette: false, blockId: node.id, parentId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    ...getResponsiveStyles(node, state.deviceMode),
  };

  // Container-specific styles
  if (node.type === 'section') {
    style.display = style.display === 'none' ? 'none' : 'flex';
    style.flexDirection = style.flexDirection || 'row';
    style.background = node.props.background || undefined;
    if (node.props.backgroundImage) {
      style.backgroundImage = `url(${node.props.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
  }
  if (node.type === 'column') {
    style.width = node.props.width || '100%';
    style.minHeight = '60px';
    style.display = style.display === 'none' ? 'none' : 'flex';
    style.flexDirection = 'column';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/block relative ${
        isContainer ? 'min-h-[60px]' : ''
      } ${
        isSelected ? 'ring-2 ring-primary ring-offset-1' : isHovered ? 'ring-1 ring-primary/40' : ''
      } ${
        isDragging ? 'z-50' : ''
      }`}
      onClick={e => { e.stopPropagation(); dispatch({ type: 'SELECT_BLOCK', payload: node.id }); }}
      onMouseEnter={e => { e.stopPropagation(); dispatch({ type: 'HOVER_BLOCK', payload: node.id }); }}
      onMouseLeave={e => { e.stopPropagation(); dispatch({ type: 'HOVER_BLOCK', payload: null }); }}
    >
      {/* Block toolbar */}
      <div className={`absolute -top-5 left-0 flex items-center gap-0.5 bg-primary text-primary-foreground rounded-t text-[10px] px-1.5 py-0.5 z-10 transition-opacity ${
        isSelected || isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3" />
        </span>
        <span className="ml-1">{def?.label || node.type}</span>
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_BLOCK', payload: node.id }); }}
          className="ml-1 hover:text-destructive-foreground"
        >
          <Trash2 className="h-3 w-3" />
        </button>
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

// ─── Container drop zone with sortable context ──────────
const ContainerDropZone = ({ node, children }: { node: LayoutNode; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: `container-${node.id}`, data: { containerId: node.id } });
  const childIds = node.children?.map(c => c.id) || [];

  return (
    <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="flex flex-col gap-2 p-2 min-h-[60px] w-full">
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
    <div className="flex gap-1 mt-2">
      <button onClick={() => onAdd('heading')} className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-primary/10">+ Heading</button>
      <button onClick={() => onAdd('text')} className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-primary/10">+ Text</button>
      <button onClick={() => onAdd('image')} className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-primary/10">+ Image</button>
    </div>
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

  const { setNodeRef: setCanvasRef } = useDroppable({
    id: 'canvas-root',
    data: { containerId: null },
  });

  const topLevelIds = layout.map(n => n.id);

  return (
    <div className="flex-1 overflow-auto bg-muted/30 p-4">
      <div
        className="mx-auto bg-card shadow-card rounded-lg min-h-[70vh] transition-all duration-300"
        style={{ maxWidth: DEVICE_WIDTHS[deviceMode] }}
      >
        <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
          <div ref={setCanvasRef} className="min-h-[70vh] p-4 space-y-2">
            {layout.length > 0 ? (
              layout.map(node => (
                <SortableBlock key={node.id} node={node} parentId={null} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                <Plus className="h-10 w-10 mb-3 text-primary/30" />
                <p className="text-sm font-medium">Start building your page</p>
                <p className="text-xs mt-1">Drag blocks from the left panel or click below</p>
                <button
                  onClick={() => addBlock('section', null)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  + Add Section
                </button>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default BuilderCanvas;
