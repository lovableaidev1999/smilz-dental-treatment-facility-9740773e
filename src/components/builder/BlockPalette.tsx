import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BLOCK_DEFINITIONS, getBlockIcon } from './block-registry';
import type { BlockDefinition } from '@/types/visual-builder';

const categories = [
  { key: 'layout' as const, label: 'Layout' },
  { key: 'basic' as const, label: 'Basic' },
  { key: 'dynamic' as const, label: 'Dynamic' },
  { key: 'advanced' as const, label: 'Advanced' },
];

const PaletteItem = ({ def }: { def: BlockDefinition }) => {
  const Icon = getBlockIcon(def);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${def.type}`,
    data: { fromPalette: true, blockType: def.type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-colors text-center"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground leading-tight">{def.label}</span>
    </div>
  );
};

const BlockPalette = () => {
  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Blocks</h3>
      {categories.map(cat => {
        const blocks = BLOCK_DEFINITIONS.filter(b => b.category === cat.key);
        if (!blocks.length) return null;
        return (
          <div key={cat.key}>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">{cat.label}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {blocks.map(def => (
                <PaletteItem key={def.type} def={def} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BlockPalette;
