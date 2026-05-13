import { useState, useRef, useEffect, useCallback } from 'react';
import { useBuilder } from '@/hooks/useBuilderState';
import { createBlockFromType } from '@/hooks/useBuilderState';
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  Type, Heading1, Heading2, Heading3, Pilcrow, Palette, Highlighter,
  Link as LinkIcon, Unlink, Plus, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Quote
} from 'lucide-react';
import InlineBlockInserter from './InlineBlockInserter';

// ─── Paste sanitizer: strip Word/Docs/web styles ───
const PASTE_ALLOWED_TAGS = new Set([
  'P','BR','STRONG','B','EM','I','U','S','STRIKE','A','UL','OL','LI',
  'H1','H2','H3','H4','H5','H6','BLOCKQUOTE','SPAN','DIV',
]);
const sanitizePastedHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Remove dangerous/foreign tags entirely
  tmp.querySelectorAll('script,style,meta,link,title,xml,o\\:p').forEach(n => n.remove());
  const walk = (root: Element) => {
    const all = Array.from(root.querySelectorAll('*'));
    all.forEach(el => {
      const tag = el.tagName;
      if (!PASTE_ALLOWED_TAGS.has(tag)) {
        // Replace unknown tag with its children
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        return;
      }
      // Strip attributes except href/target/rel on anchors
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        if (tag === 'A' && (name === 'href' || name === 'target' || name === 'rel')) return;
        el.removeAttribute(attr.name);
      });
      if (tag === 'A') {
        const href = (el as HTMLAnchorElement).getAttribute('href') || '';
        if (/^https?:\/\//i.test(href)) {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
      }
      // Unwrap empty spans/divs
      if ((tag === 'SPAN' || tag === 'DIV') && el.attributes.length === 0) {
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
    });
  };
  walk(tmp);
  // Remove empty paragraphs left by Word
  tmp.querySelectorAll('p,div').forEach(p => {
    if (!p.textContent?.trim() && !p.querySelector('img,br')) p.remove();
  });
  return tmp.innerHTML;
};

const FONT_PX_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];
const FONT_FAMILIES = [
  { label: 'Site Default', value: '' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Cormorant Garamond', value: '"Cormorant Garamond", serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
];

// Lazily load a Google Font when user picks a custom face in the editor
const ensureFontLoaded = (family: string) => {
  if (!family) return;
  const name = family.split(',')[0].replace(/['"]/g, '').trim();
  if (!name) return;
  const id = `rt-font-${name.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  // Skip system fonts
  if (['Arial','Helvetica','Georgia','Times New Roman','Courier New','Verdana','Tahoma'].includes(name)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

interface Props {
  blockId: string;
  propKey: string;
  value: string;
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
}



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
  const ctxMenuRef = useRef<HTMLDivElement>(null);
  const [ctxMenu, setCtxMenu] = useState<{ top: number; left: number } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const isSelected = state.selectedBlockId === blockId;

  // Currently detected font family + size from caret/selection
  const [currentFont, setCurrentFont] = useState<string>('');
  const [currentSize, setCurrentSize] = useState<string>('');

  // ─── Inline block insertion (Notion-style "+" on empty lines) ───
  const [inlineAdd, setInlineAdd] = useState<{ btnRect: DOMRect | null } | null>(null);
  const [plusBtnPos, setPlusBtnPos] = useState<{ top: number; left: number } | null>(null);
  const caretRangeRef = useRef<Range | null>(null);
  const caretLineElRef = useRef<HTMLElement | null>(null);

  // Find the closest block-level ancestor inside the editable region
  const getLineElement = (node: Node | null): HTMLElement | null => {
    let n: Node | null = node;
    while (n && n !== ref.current) {
      if (n.nodeType === 1) {
        const tag = (n as HTMLElement).tagName;
        if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(tag)) {
          return n as HTMLElement;
        }
      }
      n = n.parentNode;
    }
    return ref.current as HTMLElement | null;
  };

  const isLineEmpty = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    const text = (el.textContent || '').replace(/\u00A0/g, '').trim();
    if (text.length > 0) return false;
    // Allow lines with only <br> or whitespace
    return true;
  };

  const updateCaretAffordance = useCallback(() => {
    if (!editing || !ref.current) {
      setPlusBtnPos(null);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setPlusBtnPos(null); return; }
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.startContainer)) { setPlusBtnPos(null); return; }
    caretRangeRef.current = range.cloneRange();

    const lineEl = getLineElement(range.startContainer);
    caretLineElRef.current = lineEl;

    // Always offer the "+" — appearance differs only by emptiness
    if (!lineEl) { setPlusBtnPos(null); return; }
    const lineRect = lineEl.getBoundingClientRect();
    const containerRect = (ref.current.parentElement as HTMLElement).getBoundingClientRect();
    setPlusBtnPos({
      top: lineRect.top - containerRect.top + lineRect.height / 2 - 12,
      left: lineRect.left - containerRect.left - 28,
    });
  }, [editing]);

  // Detect current font family & size from the caret/selection
  const detectCurrentFormatting = useCallback(() => {
    if (!editing || !ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.startContainer;
    if (node.nodeType === 3) node = node.parentNode;
    if (!node || !ref.current.contains(node)) return;
    const cs = window.getComputedStyle(node as Element);
    const family = cs.fontFamily || '';
    // Match against known families list (first match wins)
    const match = FONT_FAMILIES.find(f => f.value && family.toLowerCase().includes(f.value.split(',')[0].replace(/['"]/g, '').toLowerCase().trim()));
    setCurrentFont(match?.value || '');
    // Size: round to nearest int px
    const sizePx = parseFloat(cs.fontSize);
    if (!isNaN(sizePx)) setCurrentSize(String(Math.round(sizePx)));
  }, [editing]);

  // Compute floating toolbar position from current selection / caret
  const updateToolbarPos = useCallback(() => {
    if (!editing || !ref.current) { setToolbarPos(null); return; }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current.contains(sel.anchorNode)) return;
    const range = sel.getRangeAt(0);
    const rects = range.getClientRects();
    let rect: DOMRect | null = null;
    if (rects.length > 0) {
      // Use first rect (start of selection) so toolbar sits above the selected word
      rect = rects[0] as DOMRect;
    } else {
      rect = range.getBoundingClientRect();
    }
    if (!rect || (rect.width === 0 && rect.height === 0 && rect.top === 0)) {
      // Fallback to block rect
      rect = ref.current.getBoundingClientRect();
    }
    const TOOLBAR_H = 36;
    const PAD = 8;
    let placement: 'top' | 'bottom' = 'top';
    let top = rect.top - TOOLBAR_H - PAD;
    if (top < 8) {
      top = rect.bottom + PAD;
      placement = 'bottom';
    }
    let left = rect.left;
    const maxLeft = window.innerWidth - 700;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    if (left < 8) left = 8;
    setToolbarPos({ top, left, placement });
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setPlusBtnPos(null);
      setInlineAdd(null);
      setToolbarPos(null);
      return;
    }
    const onSel = () => { updateCaretAffordance(); detectCurrentFormatting(); updateToolbarPos(); };
    document.addEventListener('selectionchange', onSel);
    const onScrollResize = () => updateToolbarPos();
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    // Initial position after focus
    const t = setTimeout(() => { updateCaretAffordance(); detectCurrentFormatting(); updateToolbarPos(); }, 50);
    return () => {
      document.removeEventListener('selectionchange', onSel);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
      clearTimeout(t);
    };
  }, [editing, updateCaretAffordance, detectCurrentFormatting, updateToolbarPos]);

  const openInlineInserter = () => {
    // Anchor popover to the "+" button position in viewport coordinates
    const container = ref.current?.parentElement as HTMLElement | null;
    if (!container || !plusBtnPos) {
      setInlineAdd({ btnRect: null });
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const fakeRect = new DOMRect(
      containerRect.left + plusBtnPos.left,
      containerRect.top + plusBtnPos.top,
      24,
      24
    );
    setInlineAdd({ btnRect: fakeRect });
  };

  const handleInlinePick = (blockType: string) => {
    const newBlock = createBlockFromType(blockType);
    if (!newBlock || !ref.current) {
      setInlineAdd(null);
      return;
    }

    // Compute beforeHtml / afterHtml by splitting at the caret range.
    const root = ref.current;
    const fullHtml = root.innerHTML;
    let beforeHtml = '';
    let afterHtml = '';

    const range = caretRangeRef.current;
    if (range && root.contains(range.startContainer)) {
      // Build "before" range: from start of root to caret
      const beforeRange = document.createRange();
      beforeRange.setStart(root, 0);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      const beforeFrag = beforeRange.cloneContents();
      const beforeWrap = document.createElement('div');
      beforeWrap.appendChild(beforeFrag);
      beforeHtml = beforeWrap.innerHTML;

      // Build "after" range: from caret to end of root
      const afterRange = document.createRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(root, root.childNodes.length);
      const afterFrag = afterRange.cloneContents();
      const afterWrap = document.createElement('div');
      afterWrap.appendChild(afterFrag);
      afterHtml = afterWrap.innerHTML;
    } else {
      // No caret info — append at end
      beforeHtml = fullHtml;
      afterHtml = '';
    }

    // Exit editing mode so the source block re-renders cleanly with new html
    setEditing(false);
    setInlineAdd(null);
    setPlusBtnPos(null);

    dispatch({
      type: 'SPLIT_AND_INSERT',
      payload: { sourceBlockId: blockId, beforeHtml, afterHtml, newBlock },
    });
  };


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
    // Don't blur if focus moves into toolbar, link panel, context menu, or inline inserter
    const next = e.relatedTarget as Node | null;
    if (toolbarRef.current?.contains(next)) return;
    if (next && (next as HTMLElement).closest?.('[data-rt-link-panel]')) return;
    if (next && (next as HTMLElement).closest?.('[data-rt-inline-inserter]')) return;
    if (next && (next as HTMLElement).closest?.('[data-rt-ctx-menu]')) return;
    // If the inline inserter popover is open, keep editing alive so dispatch happens cleanly
    if (inlineAdd) return;
    if (ctxMenu) return;
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
  }, [blockId, propKey, value, dispatch, inlineAdd, ctxMenu]);

  // Close context menu on outside click. Ignore scrolls happening inside the menu itself.
  useEffect(() => {
    if (!ctxMenu) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-rt-ctx-menu]')) return;
      setCtxMenu(null);
    };
    const onScroll = (e: Event) => {
      const t = e.target as Node | null;
      // Don't close if the scroll is inside the menu (its own overflow scroll)
      if (t && ctxMenuRef.current && ctxMenuRef.current.contains(t)) return;
      if (t && (t as HTMLElement).closest?.('[data-rt-ctx-menu]')) return;
      setCtxMenu(null);
    };
    const onResize = () => setCtxMenu(null);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [ctxMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    saveSelection();
    const sel = window.getSelection();
    let anchorRect: DOMRect | null = null;
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const rects = r.getClientRects();
      if (rects.length > 0) {
        // Use the last rect (end of selection) so menu appears to its right
        anchorRect = rects[rects.length - 1];
      } else {
        anchorRect = r.getBoundingClientRect();
      }
    }
    const fallback = { top: e.clientY, left: e.clientX };
    if (!anchorRect || (anchorRect.width === 0 && anchorRect.height === 0)) {
      setCtxMenu(fallback);
      return;
    }
    // Position to the right of the selection rect, vertically centered on click Y
    const MENU_WIDTH = 240;
    const PAD = 8;
    let left = anchorRect.right + PAD;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      // Not enough room on right → place to the left of selection start
      const startRect = sel?.getRangeAt(0).getClientRects()[0];
      left = (startRect ? startRect.left : anchorRect.left) - MENU_WIDTH - PAD;
      if (left < 8) left = 8;
    }
    let top = e.clientY - 20;
    const MENU_MAX_H = 360;
    if (top + MENU_MAX_H > window.innerHeight - 8) top = Math.max(8, window.innerHeight - MENU_MAX_H - 8);
    setCtxMenu({ top, left });
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditing(false);
      if (ref.current) ref.current.innerHTML = value;
      return;
    }
    // "/" on an empty line opens the inline block inserter (Notion-style)
    if (e.key === '/' && isLineEmpty(caretLineElRef.current)) {
      e.preventDefault();
      // Ensure plus position is fresh, then open
      updateCaretAffordance();
      setTimeout(openInlineInserter, 0);
      return;
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

  // Apply CSS font-size to selection by wrapping in span (execCommand fontSize is 1-7 only)
  const applyFontSize = (px: string) => {
    if (!px) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement('span');
    span.style.fontSize = `${px}px`;
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    } catch {}
    ref.current?.focus();
  };

  const applyFontFamily = (family: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    ensureFontLoaded(family);
    try {
      const frag = range.extractContents();
      // Strip any existing font-family from descendants so the new one wins
      frag.querySelectorAll('[style*="font-family"]').forEach((el: any) => {
        el.style.fontFamily = '';
        if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
      });
      if (!family) {
        // Inserting back without wrapping = inherit site default
        range.insertNode(frag);
      } else {
        const span = document.createElement('span');
        span.style.fontFamily = family;
        span.appendChild(frag);
        range.insertNode(span);
        // Restore selection over the new span
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(span);
        sel.addRange(r);
      }
    } catch {}
    ref.current?.focus();
    setTimeout(detectCurrentFormatting, 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    let cleaned: string;
    if (html) {
      cleaned = sanitizePastedHtml(html);
    } else {
      // Convert plain text to HTML (preserve line breaks)
      const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      cleaned = escape(text).split(/\r?\n/).map(line => line || '<br>').join('<br>');
    }
    document.execCommand('insertHTML', false, cleaned);
  };


  return (
    <div className="relative">
      {/* Floating toolbar */}
      {editing && toolbarPos && (
        <div
          ref={toolbarRef}
          className="fixed z-[60] flex flex-wrap items-center gap-0.5 bg-card border border-border rounded-md shadow-md px-1 py-0.5 max-w-[680px]"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
          onMouseDown={e => e.preventDefault()}
        >
          {/* Block format */}
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => formatBlock('p')} title="Paragraph">
            <Pilcrow className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => formatBlock('h1')} title="Heading 1">
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => formatBlock('h2')} title="Heading 2">
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => formatBlock('h3')} title="Heading 3">
            <Heading3 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => formatBlock('blockquote')} title="Blockquote">
            <Quote className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Font family */}
          <select
            value={currentFont}
            className="text-[11px] h-6 px-1 rounded border border-input bg-background text-foreground max-w-[110px]"
            onMouseDown={e => e.stopPropagation()}
            onChange={e => { const v = e.target.value; applyFontFamily(v); setCurrentFont(v); }}
            title="Font family"
          >
            {!FONT_FAMILIES.some(f => f.value === currentFont) && (
              <option value={currentFont}>{currentFont || 'Font'}</option>
            )}
            {FONT_FAMILIES.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
          </select>

          {/* Font size */}
          <select
            value={currentSize}
            className="text-[11px] h-6 px-1 rounded border border-input bg-background text-foreground"
            onMouseDown={e => e.stopPropagation()}
            onChange={e => { const v = e.target.value; applyFontSize(v); setCurrentSize(v); }}
            title="Font size (px)"
          >
            {!FONT_PX_SIZES.some(s => String(s) === currentSize) && currentSize && (
              <option value={currentSize}>{currentSize}px</option>
            )}
            {!currentSize && <option value="">Size</option>}
            {FONT_PX_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Inline marks */}
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
            <Underline className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('strikeThrough')} title="Strikethrough">
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('subscript')} title="Subscript">
            <Subscript className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('superscript')} title="Superscript">
            <Superscript className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Colors */}
          <label className="relative p-1 rounded hover:bg-accent cursor-pointer inline-flex items-center justify-center" title="Text color" onMouseDown={e => e.preventDefault()}>
            <Palette className="h-3.5 w-3.5 text-foreground" />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={e => execCommand('foreColor', e.target.value)} />
          </label>
          <label className="relative p-1 rounded hover:bg-accent cursor-pointer inline-flex items-center justify-center" title="Highlight color" onMouseDown={e => e.preventDefault()}>
            <Highlighter className="h-3.5 w-3.5 text-foreground" />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={e => execCommand('hiliteColor', e.target.value)} />
          </label>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Alignment */}
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('justifyLeft')} title="Align left">
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('justifyCenter')} title="Align center">
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('justifyRight')} title="Align right">
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('justifyFull')} title="Justify">
            <AlignJustify className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Lists & indent */}
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('insertUnorderedList')} title="Bullet list">
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('insertOrderedList')} title="Numbered list">
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('outdent')} title="Decrease indent">
            <Outdent className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onClick={() => execCommand('indent')} title="Increase indent">
            <Indent className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Link */}
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onMouseDown={e => { e.preventDefault(); saveSelection(); }} onClick={openLinkPanel} title="Insert / edit link">
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-accent text-foreground" onMouseDown={e => e.preventDefault()} onClick={removeLink} title="Remove link">
            <Unlink className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Clear formatting */}
          <button type="button" className="px-1.5 py-0.5 text-[11px] rounded hover:bg-accent text-foreground font-bold" onClick={() => execCommand('removeFormat')} title="Clear formatting">
            Tx
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

      {/* Floating "+" button on the current caret line */}
      {editing && plusBtnPos && (
        <button
          type="button"
          data-rt-inline-plus
          onMouseDown={e => { e.preventDefault(); }}
          onClick={openInlineInserter}
          title="Insert block here ( / )"
          className="absolute z-40 inline-flex items-center justify-center h-6 w-6 rounded-md bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 shadow-sm transition-colors"
          style={{ top: plusBtnPos.top, left: plusBtnPos.left }}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Inline block inserter popover */}
      {editing && inlineAdd && (
        <div data-rt-inline-inserter>
          <InlineBlockInserter
            anchorRect={inlineAdd.btnRect}
            onPick={handleInlinePick}
            onClose={() => setInlineAdd(null)}
          />
        </div>
      )}

      {/* Right-click context menu (vertical) */}
      {editing && ctxMenu && (
        <div
          ref={ctxMenuRef}
          data-rt-ctx-menu
          tabIndex={-1}
          onWheel={e => e.stopPropagation()}
          onMouseDown={e => e.preventDefault()}
          onContextMenu={e => e.preventDefault()}
          className="fixed z-[60] w-[240px] max-h-[360px] overflow-y-auto bg-card border border-border rounded-md shadow-lg p-2 flex flex-col gap-1"
          style={{ top: ctxMenu.top, left: ctxMenu.left }}
        >
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1">Format</div>
          <div className="grid grid-cols-5 gap-0.5">
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => formatBlock('p')} title="Paragraph"><Pilcrow className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => formatBlock('h1')} title="Heading 1"><Heading1 className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => formatBlock('h2')} title="Heading 2"><Heading2 className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => formatBlock('h3')} title="Heading 3"><Heading3 className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => formatBlock('blockquote')} title="Blockquote"><Quote className="h-3.5 w-3.5" /></button>
          </div>

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1 mt-1">Font</div>
          <select
            value={currentFont}
            className="text-[11px] h-7 px-1 rounded border border-input bg-background text-foreground"
            onMouseDown={e => e.stopPropagation()}
            onChange={e => { const v = e.target.value; applyFontFamily(v); setCurrentFont(v); }}
          >
            {!FONT_FAMILIES.some(f => f.value === currentFont) && (
              <option value={currentFont}>{currentFont || 'Font'}</option>
            )}
            {FONT_FAMILIES.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
          </select>
          <select
            value={currentSize}
            className="text-[11px] h-7 px-1 rounded border border-input bg-background text-foreground"
            onMouseDown={e => e.stopPropagation()}
            onChange={e => { const v = e.target.value; applyFontSize(v); setCurrentSize(v); }}
          >
            {!FONT_PX_SIZES.some(s => String(s) === currentSize) && currentSize && (
              <option value={currentSize}>{currentSize}px</option>
            )}
            {!currentSize && <option value="">Size</option>}
            {FONT_PX_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1 mt-1">Style</div>
          <div className="grid grid-cols-6 gap-0.5">
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('bold')} title="Bold"><Bold className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('italic')} title="Italic"><Italic className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('underline')} title="Underline"><Underline className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('strikeThrough')} title="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('subscript')} title="Subscript"><Subscript className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('superscript')} title="Superscript"><Superscript className="h-3.5 w-3.5" /></button>
          </div>

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1 mt-1">Color</div>
          <div className="flex gap-1">
            <label className="relative flex-1 h-7 rounded border border-input hover:bg-accent cursor-pointer inline-flex items-center justify-center gap-1 text-[11px] text-foreground" onMouseDown={e => e.preventDefault()}>
              <Palette className="h-3.5 w-3.5" /> Text
              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={e => execCommand('foreColor', e.target.value)} />
            </label>
            <label className="relative flex-1 h-7 rounded border border-input hover:bg-accent cursor-pointer inline-flex items-center justify-center gap-1 text-[11px] text-foreground" onMouseDown={e => e.preventDefault()}>
              <Highlighter className="h-3.5 w-3.5" /> Hi-lite
              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={e => execCommand('hiliteColor', e.target.value)} />
            </label>
          </div>

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1 mt-1">Align</div>
          <div className="grid grid-cols-4 gap-0.5">
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('justifyLeft')} title="Left"><AlignLeft className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('justifyCenter')} title="Center"><AlignCenter className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('justifyRight')} title="Right"><AlignRight className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('justifyFull')} title="Justify"><AlignJustify className="h-3.5 w-3.5" /></button>
          </div>

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1 mt-1">List</div>
          <div className="grid grid-cols-4 gap-0.5">
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('insertUnorderedList')} title="Bullets"><List className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('insertOrderedList')} title="Numbered"><ListOrdered className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('outdent')} title="Outdent"><Outdent className="h-3.5 w-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-accent text-foreground inline-flex items-center justify-center" onClick={() => execCommand('indent')} title="Indent"><Indent className="h-3.5 w-3.5" /></button>
          </div>

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium px-1 mt-1">Link</div>
          <div className="flex gap-1">
            <button type="button" className="flex-1 h-7 rounded border border-input hover:bg-accent text-foreground inline-flex items-center justify-center gap-1 text-[11px]" onClick={() => { setCtxMenu(null); openLinkPanel(); }}><LinkIcon className="h-3.5 w-3.5" /> Link</button>
            <button type="button" className="flex-1 h-7 rounded border border-input hover:bg-accent text-foreground inline-flex items-center justify-center gap-1 text-[11px]" onClick={() => { removeLink(); setCtxMenu(null); }}><Unlink className="h-3.5 w-3.5" /> Unlink</button>
            <button type="button" className="flex-1 h-7 rounded border border-input hover:bg-accent text-foreground inline-flex items-center justify-center gap-1 text-[11px] font-bold" onClick={() => execCommand('removeFormat')} title="Clear formatting">Tx</button>
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
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
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
