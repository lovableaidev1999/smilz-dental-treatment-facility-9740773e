import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Lock } from 'lucide-react';
import { useBuilder } from '@/hooks/useBuilderState';
import { getBlockDefinition } from './block-registry';
import { CONTAINER_TYPES } from '@/types/visual-builder';
import type { LayoutNode, DeviceMode } from '@/types/visual-builder';
import SectionLayoutPicker from './SectionLayoutPicker';
import { renderNodeContent } from './shared-renderer';

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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

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

      {/* Block content — uses the shared renderer for WYSIWYG parity */}
      {isContainer ? (
        <ContainerDropZone node={node}>
          {node.children && node.children.length > 0 ? (
            node.children.map(child => (
              <div key={child.id} className="w-full min-w-0">
                <SortableBlock node={child} parentId={node.id} />
              </div>
            ))
          ) : (
            <DropPlaceholder parentId={node.id} onAdd={type => addBlock(type, node.id)} />
          )}
        </ContainerDropZone>
      ) : (
        <div className="w-full">
          {renderNodeContent(node, 0, { editorMode: true })}
        </div>
      )}
    </div>
  );
};

// ─── Container drop zone with grid/flex layout ──────────
// Mirrors the shared-renderer's container markup exactly for WYSIWYG parity
const ContainerDropZone = ({ node, children }: { node: LayoutNode; children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id: `container-${node.id}`, data: { containerId: node.id } });
  const childIds = node.children?.map(c => c.id) || [];

  if (node.type === 'section') {
    const gridColumns = node.props.gridColumns || '1fr';
    const colCount = gridColumns.split(' ').filter(Boolean).length;
    const responsiveStyles = node.responsive?.desktop || {};
    const sectionStyle: React.CSSProperties = {
      background: node.props.background || undefined,
      backgroundImage: node.props.backgroundImage ? `url(${node.props.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: responsiveStyles.padding || undefined,
    };
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: gridColumns,
      columnGap: node.props.columnGap || '1.5rem',
      rowGap: node.props.rowGap || '1.5rem',
    };
    const sectionClasses = responsiveStyles.padding
      ? 'relative w-full min-h-[60px]'
      : 'relative w-full py-12 md:py-16 px-4 md:px-6 min-h-[60px]';
    return (
      <section className={sectionClasses} style={sectionStyle}>
        <div className="w-full mx-auto" style={{ maxWidth: node.props.fullWidth ? '100%' : (node.props.maxWidth || '80rem') }}>
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} className={`min-h-[60px] ${colCount > 1 ? 'vb-responsive-grid' : ''}`} style={gridStyle}>
              {children}
            </div>
          </SortableContext>
        </div>
      </section>
    );
  }

  if (node.type === 'grid') {
    const cols = node.props.gridCols || 2;
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      columnGap: node.props.columnGap || '1rem',
      rowGap: node.props.rowGap || '1rem',
    };
    return (
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="vb-responsive-grid min-h-[60px] w-full" style={gridStyle}>
          {children}
        </div>
      </SortableContext>
    );
  }

  // Container block — preserve visual styling in editor
  if (node.type === 'container') {
    const containerStyle: React.CSSProperties = {
      background: node.props.background || undefined,
      padding: node.props.padding || '1.5rem',
      borderRadius: node.props.borderRadius || '1rem',
      border: node.props.borderColor ? `1px solid ${node.props.borderColor}` : undefined,
      boxShadow: node.props.shadow ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    };
    return (
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-[60px] w-full" style={containerStyle}>
          {children}
        </div>
      </SortableContext>
    );
  }

  // Column / generic container
  return (
    <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="min-h-[60px] w-full" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: node.props?.verticalAlign || 'flex-start' }}>
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

// ─── Inline insert-section gutter (between sections) ────
const InlineAddSection = ({ onOpen }: { onOpen: () => void }) => (
  <div className="group/insert relative h-2 hover:h-9 transition-all duration-150 flex items-center justify-center">
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(); }}
      className="opacity-0 group-hover/insert:opacity-100 transition-opacity flex items-center gap-2 w-full px-4"
      aria-label="Add section here"
    >
      <span className="flex-1 h-px bg-primary/40" />
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium shadow-sm hover:bg-primary/90">
        <Plus className="h-3 w-3" />
        Add Section
      </span>
      <span className="flex-1 h-px bg-primary/40" />
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
  const [showLayoutPicker, setShowLayoutPicker] = useState<{ open: boolean; index?: number }>({ open: false });

  const openPicker = (index?: number) => setShowLayoutPicker({ open: true, index });
  const closePicker = () => setShowLayoutPicker({ open: false });

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
          <div ref={setCanvasRef} className="min-h-[70vh]">
            {layout.length > 0 ? (
              <>
                <InlineAddSection onOpen={() => openPicker(0)} />
                {layout.map((node, i) => (
                  <div key={node.id}>
                    <SortableBlock node={node} parentId={null} />
                    <InlineAddSection onOpen={() => openPicker(i + 1)} />
                  </div>
                ))}
                <div className="p-4">
                  <AddSectionButton onOpen={() => openPicker()} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                <Plus className="h-10 w-10 mb-3 text-primary/30" />
                <p className="text-sm font-medium">Start building your page</p>
                <p className="text-xs mt-1">Choose a section layout to get started</p>
                <button
                  onClick={() => openPicker()}
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
        open={showLayoutPicker.open}
        onClose={closePicker}
        parentId={null}
        index={showLayoutPicker.index}
      />
    </div>
  );
};

export default BuilderCanvas;
