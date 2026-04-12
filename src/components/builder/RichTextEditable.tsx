import { useState, useRef, useEffect, useCallback } from 'react';
import { useBuilder } from '@/hooks/useBuilderState';
import { Bold, Italic, Underline, Type, Heading1, Heading2, Heading3, Pilcrow } from 'lucide-react';

interface Props {
  blockId: string;
  propKey: string;
  value: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FONT_SIZES: { label: string; value: string }[] = [
  { label: 'S', value: '2' },
  { label: 'M', value: '3' },
  { label: 'L', value: '5' },
  { label: 'XL', value: '6' },
];

const RichTextEditable = ({ blockId, propKey, value, tag = 'span', className, style }: Props) => {
  const Tag = tag as any;
  const { state, dispatch } = useBuilder();
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isSelected = state.selectedBlockId === blockId;

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  // Set initial HTML content when entering edit mode
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.innerHTML = value;
    }
  }, [editing]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't blur if clicking toolbar
    if (toolbarRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    if (ref.current) {
      const newHtml = ref.current.innerHTML;
      if (newHtml !== value) {
        dispatch({
          type: 'UPDATE_BLOCK_PROPS',
          payload: { blockId, props: { [propKey]: newHtml } },
        });
      }
    }
    setEditing(false);
  }, [blockId, propKey, value, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditing(false);
      if (ref.current) ref.current.innerHTML = value;
    }
    // Shift+Enter for line break is default in contentEditable
  };

  const execCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    ref.current?.focus();
  };

  return (
    <div className="relative">
      {/* Floating toolbar */}
      {editing && (
        <div
          ref={toolbarRef}
          className="absolute -top-9 left-0 z-50 flex items-center gap-0.5 bg-card border border-border rounded-md shadow-md px-1 py-0.5"
          onMouseDown={e => e.preventDefault()}
        >
          {/* Heading buttons */}
          <button type="button" className="px-1.5 py-0.5 text-[10px] rounded hover:bg-accent text-foreground font-bold" onClick={() => formatBlock('p')} title="Paragraph">
            <Pilcrow className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="px-1.5 py-0.5 text-[10px] rounded hover:bg-accent text-foreground font-bold" onClick={() => formatBlock('h1')} title="Heading 1">
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="px-1.5 py-0.5 text-[10px] rounded hover:bg-accent text-foreground font-bold" onClick={() => formatBlock('h2')} title="Heading 2">
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="px-1.5 py-0.5 text-[10px] rounded hover:bg-accent text-foreground font-bold" onClick={() => formatBlock('h3')} title="Heading 3">
            <Heading3 className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('bold')} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('italic')} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('underline')} title="Underline">
            <Underline className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <div className="flex items-center gap-0.5">
            <Type className="h-3 w-3 text-muted-foreground" />
            {FONT_SIZES.map(fs => (
              <button
                key={fs.value}
                type="button"
                className="px-1.5 py-0.5 text-[10px] rounded hover:bg-accent text-foreground font-medium"
                onClick={() => execCommand('fontSize', fs.value)}
                title={`Font size ${fs.label}`}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Tag
        ref={ref as any}
        className={`${className || ''} ${editing ? 'outline-none ring-2 ring-primary/30 rounded px-1' : ''} ${
          isSelected && !editing ? 'cursor-text' : ''
        }`}
        style={style}
        contentEditable={editing}
        suppressContentEditableWarning
        onDoubleClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setEditing(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={!editing ? { __html: value } : undefined}
      />
    </div>
  );
};

export default RichTextEditable;
