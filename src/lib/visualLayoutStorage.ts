import type { LayoutNode } from '@/types/visual-builder';

export interface VisualLayoutFallbackContent {
  type: 'visual-layout';
  version: 1;
  layout: LayoutNode[];
}

const isLayoutArray = (value: unknown): value is LayoutNode[] => Array.isArray(value);

export const createVisualLayoutFallbackContent = (
  layout: LayoutNode[],
): VisualLayoutFallbackContent => ({
  type: 'visual-layout',
  version: 1,
  layout,
});

export const isVisualLayoutFallbackContent = (
  value: unknown,
): value is VisualLayoutFallbackContent => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  return candidate.type === 'visual-layout' && candidate.version === 1 && isLayoutArray(candidate.layout);
};

export const getStoredVisualLayout = (entry: {
  visual_layout_json?: unknown;
  content_json?: unknown;
}): LayoutNode[] | null => {
  if (isLayoutArray(entry.visual_layout_json) && entry.visual_layout_json.length > 0) {
    return entry.visual_layout_json;
  }

  if (isVisualLayoutFallbackContent(entry.content_json) && entry.content_json.layout.length > 0) {
    return entry.content_json.layout;
  }

  return null;
};

export const isMissingVisualLayoutColumnError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { code?: string; message?: string };
  return candidate.code === 'PGRST204' && candidate.message?.includes('visual_layout_json') === true;
};