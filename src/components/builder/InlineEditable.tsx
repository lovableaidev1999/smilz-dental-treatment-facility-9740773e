import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useBuilder } from '@/hooks/useBuilderState';

interface Props {
  blockId: string;
  propKey: string;
  value: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Inline editable text component for the builder canvas.
 * Click to select block, double-click to edit text inline.
 */
const InlineEditable = ({ blockId, propKey, value, tag: Tag = 'span', className, style }: Props) => {
  const { state, dispatch } = useBuilder();
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const isSelected = state.selectedBlockId === blockId;

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  const handleBlur = () => {
    if (ref.current) {
      const newText = ref.current.innerText;
      if (newText !== value) {
        dispatch({
          type: 'UPDATE_BLOCK_PROPS',
          payload: { blockId, props: { [propKey]: newText } },
        });
      }
    }
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      if (ref.current) ref.current.innerText = value;
    }
  };

  return (
    <Tag
      ref={ref as any}
      className={`${className || ''} ${editing ? 'outline-none ring-2 ring-primary/30 rounded px-1' : ''} ${
        isSelected && !editing ? 'cursor-text' : ''
      }`}
      style={style}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={e => {
        e.stopPropagation();
        setEditing(true);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown as any}
    >
      {!editing ? value : undefined}
    </Tag>
  );
};

export default InlineEditable;
