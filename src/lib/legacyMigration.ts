import type { LayoutNode } from '@/types/visual-builder';

const genId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Wraps legacy HTML content into a visual builder layout tree:
 * Section > Column > LegacyContent block
 */
export function wrapLegacyContent(html: string): LayoutNode[] {
  if (!html || !html.trim()) return [];

  const legacyBlock: LayoutNode = {
    id: genId(),
    type: 'legacy-content',
    props: {
      html,
      sourceTable: '',
      sourceId: '',
    },
  };

  const column: LayoutNode = {
    id: genId(),
    type: 'column',
    props: { width: '100%' },
    children: [legacyBlock],
  };

  const section: LayoutNode = {
    id: genId(),
    type: 'section',
    props: {
      background: '',
      backgroundImage: '',
      maxWidth: '1280px',
      fullWidth: false,
      layoutMode: 'grid',
      gridColumns: '1fr',
      columnGap: '1.5rem',
      rowGap: '1.5rem',
    },
    children: [column],
  };

  return [section];
}
