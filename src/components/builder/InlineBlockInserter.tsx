import { useState, useMemo, useEffect, useRef } from 'react';
import { BLOCK_DEFINITIONS, getBlockIcon } from './block-registry';
import { Search } from 'lucide-react';

interface Props {
  onPick: (type: string) => void;
  onClose: () => void;
  /** Position in viewport coords for the popover anchor */
  anchorRect: DOMRect | null;
}

// Container/layout types are inserted at section level — exclude from inline picker.
const EXCLUDED = new Set(['section', 'column', 'grid', 'container', 'row']);

const InlineBlockInserter = ({ onPick, onClose, anchorRect }: Props) => {
  const [query, setQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const blocks = useMemo(() => {
    const filtered = BLOCK_DEFINITIONS.filter(b => !EXCLUDED.has(b.type));
    if (!query.trim()) return filtered;
    const q = query.toLowerCase();
    return filtered.filter(b => b.label.toLowerCase().includes(q) || b.type.toLowerCase().includes(q));
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) onClose();
    };
    // Defer attach so the click that opened the popover doesn't close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Position relative to anchorRect (use fixed positioning so popover floats over the canvas)
  const top = anchorRect ? anchorRect.bottom + 6 : 0;
  const left = anchorRect ? anchorRect.left : 0;

  return (
    <div
      ref={popoverRef}
      className="fixed z-[100] w-72 max-h-80 bg-card border border-border rounded-lg shadow-lg flex flex-col overflow-hidden"
      style={{ top, left }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search blocks…"
            className="w-full text-xs pl-7 pr-2 py-1.5 border border-input rounded bg-background outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No blocks match "{query}"</div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {blocks.map(def => {
              const Icon = getBlockIcon(def);
              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => onPick(def.type)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground truncate">{def.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineBlockInserter;
