import { useState, useRef, useEffect, useCallback } from 'react';
import { useBuilder } from '@/hooks/useBuilderState';
import { Bold, Italic, Underline, Type, Heading1, Heading2, Heading3, Pilcrow, Palette, Highlighter, Link as LinkIcon, Unlink } from 'lucide-react';

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
  const savedRangeRef = useRef<Range | null>(null);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState<'_self' | '_blank'>('_blank');
  const isSelected = state.selectedBlockId === blockId;

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (range) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const openLinkPanel = () => {
    saveSelection();
    // Try to read existing anchor under cursor
    const sel = window.getSelection();
    let anchor: HTMLAnchorElement | null = null;
    if (sel && sel.anchorNode) {
      let n: Node | null = sel.anchorNode;
      while (n && n !== ref.current) {
        if ((n as HTMLElement).tagName === 'A') {
          anchor = n as HTMLAnchorElement;
          break;
        }
        n = n.parentNode;
      }
    }
    setLinkUrl(anchor?.getAttribute('href') || '');
    setLinkTarget((anchor?.getAttribute('target') as any) === '_self' ? '_self' : '_blank');
    setShowLinkPanel(true);
  };

  const applyLink = () => {
    restoreSelection();
    if (!linkUrl) {
      document.execCommand('unlink');
    } else {
      // execCommand createLink doesn't set target, so set via temporary id
      const id = `__lk_${Date.now()}`;
      document.execCommand('createLink', false, linkUrl);
      // Find newly created/affected anchors in the contenteditable and set target/rel
      const anchors = ref.current?.querySelectorAll(`a[href="${CSS.escape(linkUrl)}"]`);
      anchors?.forEach(a => {
        a.setAttribute('target', linkTarget);
        if (linkTarget === '_blank') {
          a.setAttribute('rel', 'noopener noreferrer');
        } else {
          a.removeAttribute('rel');
        }
      });
    }
    setShowLinkPanel(false);
    ref.current?.focus();
  };

  const removeLink = () => {
    restoreSelection();
    document.execCommand('unlink');
    setShowLinkPanel(false);
    ref.current?.focus();
  };

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
    // Don't blur if focus moves into toolbar or link panel
    const next = e.relatedTarget as Node | null;
    if (toolbarRef.current?.contains(next)) return;
    if (next && (next as HTMLElement).closest?.('[data-rt-link-panel]')) return;
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
          <div className="w-px h-4 bg-border mx-0.5" />
          {/* Text color picker */}
          <label
            className="relative p-1 rounded hover:bg-accent cursor-pointer inline-flex items-center justify-center"
            title="Text color"
            onMouseDown={e => e.preventDefault()}
          >
            <Palette className="h-3.5 w-3.5 text-foreground" />
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={e => execCommand('foreColor', e.target.value)}
            />
          </label>
          {/* Highlight color picker */}
          <label
            className="relative p-1 rounded hover:bg-accent cursor-pointer inline-flex items-center justify-center"
            title="Highlight color"
            onMouseDown={e => e.preventDefault()}
          >
            <Highlighter className="h-3.5 w-3.5 text-foreground" />
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={e => execCommand('hiliteColor', e.target.value)}
            />
          </label>
          <button
            type="button"
            className="px-1 py-0.5 text-[10px] rounded hover:bg-accent text-foreground font-bold"
            onClick={() => execCommand('removeFormat')}
            title="Clear formatting"
          >
            ×
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            className="p-1 rounded hover:bg-accent text-foreground"
            onMouseDown={e => { e.preventDefault(); saveSelection(); }}
            onClick={openLinkPanel}
            title="Insert / edit link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-accent text-foreground"
            onMouseDown={e => e.preventDefault()}
            onClick={removeLink}
            title="Remove link"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Link panel */}
      {editing && showLinkPanel && (
        <div
          data-rt-link-panel
          tabIndex={-1}
          className="absolute -top-9 left-0 translate-y-[-100%] z-50 bg-card border border-border rounded-md shadow-md p-2 flex flex-col gap-2 w-72"
          onMouseDown={e => e.preventDefault()}
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://... or /about or mailto:..."
              className="text-xs px-2 py-1.5 border border-input rounded bg-background"
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                if (e.key === 'Escape') { setShowLinkPanel(false); }
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Open in</label>
            <select
              value={linkTarget}
              onChange={e => setLinkTarget(e.target.value as '_self' | '_blank')}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              className="text-xs px-2 py-1.5 border border-input rounded bg-background"
            >
              <option value="_blank">New tab</option>
              <option value="_self">Same tab</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border border-input hover:bg-accent text-foreground"
              onClick={() => setShowLinkPanel(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
              onClick={applyLink}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <Tag
        ref={ref as any}
        className={`rt-editable ${className || ''} ${editing ? 'outline-none ring-2 ring-primary/30 rounded px-1' : ''} ${
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
      <style>{`
        .rt-editable a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .rt-editable a:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
};

export default RichTextEditable;
