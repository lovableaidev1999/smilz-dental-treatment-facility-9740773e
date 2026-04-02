import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LAYOUT_PRESETS, type LayoutPreset } from './block-registry';
import { useBuilder } from '@/hooks/useBuilderState';
import type { LayoutNode, BlockType } from '@/types/visual-builder';

const genId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface Props {
  open: boolean;
  onClose: () => void;
  parentId?: string | null;
  index?: number;
}

const SectionLayoutPicker = ({ open, onClose, parentId = null, index }: Props) => {
  const { dispatch } = useBuilder();

  const handleSelect = (preset: LayoutPreset) => {
    const columns: LayoutNode[] = Array.from({ length: preset.columnCount }, () => ({
      id: genId(),
      type: 'column' as BlockType,
      props: { width: '100%' },
      children: [],
    }));

    const section: LayoutNode = {
      id: genId(),
      type: 'section',
      props: {
        background: '',
        backgroundImage: '',
        maxWidth: '1280px',
        fullWidth: false,
        layoutMode: 'grid',
        gridColumns: preset.gridColumns,
        columnGap: '1.5rem',
        rowGap: '1.5rem',
      },
      children: columns,
    };

    dispatch({ type: 'ADD_BLOCK', payload: { block: section, parentId, index } });
    onClose();
  };

  // Visual preview of column layout
  const PreviewGrid = ({ preset }: { preset: LayoutPreset }) => {
    const cols = preset.gridColumns.split(' ');
    return (
      <div
        className="w-full h-10 rounded border border-border overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: preset.gridColumns, gap: '2px' }}
      >
        {cols.map((_, i) => (
          <div key={i} className="bg-primary/20 rounded-sm" />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Choose Section Layout</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-2">
          {LAYOUT_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleSelect(preset)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group"
            >
              <PreviewGrid preset={preset} />
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionLayoutPicker;
