// ─── Block Types ──────────────────────────────────────────
export type BlockType =
  | 'section'
  | 'column'
  | 'grid'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'spacer'
  | 'divider'
  | 'legacy-content'
  | 'icon-list'
  | 'testimonial'
  | 'faq'
  | 'blog-loop'
  | 'service-loop'
  | 'contact-form'
  | 'html-embed'
  | 'video'
  | 'google-map'
  | 'icon'
  | 'tabs'
  | 'accordion'
  | 'image-box'
  | 'icon-box'
  | 'image-carousel'
  | 'gallery'
  | 'social-icons';

// Container types that can hold children
export const CONTAINER_TYPES: BlockType[] = ['section', 'column', 'grid'];

// ─── Responsive Values ──────────────────────────────────
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveProps {
  padding?: string;
  margin?: string;
  fontSize?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  display?: 'block' | 'none';
  gap?: string;
  flexDirection?: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

// ─── Layout Node ─────────────────────────────────────────
export interface LayoutNode {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  responsive?: {
    desktop?: ResponsiveProps;
    tablet?: ResponsiveProps;
    mobile?: ResponsiveProps;
  };
  children?: LayoutNode[];
}

// ─── Page Layout (Supabase row) ─────────────────────────
export interface PageLayout {
  id: string;
  page_slug: string;
  page_title: string;
  layout_json: LayoutNode[];
  is_published: boolean;
  is_template: boolean;
  template_type?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Builder State ──────────────────────────────────────
export interface BuilderState {
  layout: LayoutNode[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  deviceMode: DeviceMode;
  isDirty: boolean;
  showLayers: boolean;
  clipboardBlock: LayoutNode | null;
}

export type BuilderAction =
  | { type: 'SET_LAYOUT'; payload: LayoutNode[] }
  | { type: 'ADD_BLOCK'; payload: { block: LayoutNode; parentId: string | null; index?: number } }
  | { type: 'MOVE_BLOCK'; payload: { blockId: string; targetParentId: string | null; targetIndex: number } }
  | { type: 'UPDATE_BLOCK_PROPS'; payload: { blockId: string; props: Record<string, any> } }
  | { type: 'UPDATE_RESPONSIVE'; payload: { blockId: string; device: DeviceMode; props: ResponsiveProps } }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'DUPLICATE_BLOCK'; payload: string }
  | { type: 'SELECT_BLOCK'; payload: string | null }
  | { type: 'HOVER_BLOCK'; payload: string | null }
  | { type: 'SET_DEVICE'; payload: DeviceMode }
  | { type: 'TOGGLE_LAYERS' }
  | { type: 'MARK_SAVED' }
  | { type: 'COPY_BLOCK'; payload: string }
  | { type: 'PASTE_BLOCK'; payload: { parentId: string | null; index?: number } };

// ─── Block Definition (registry) ────────────────────────
export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: 'layout' | 'basic' | 'dynamic' | 'advanced';
  canHaveChildren: boolean;
  defaultProps: Record<string, any>;
  defaultChildren?: LayoutNode[];
}

// ─── DnD Types ──────────────────────────────────────────
export interface DragData {
  fromPalette: boolean;
  blockType?: BlockType;
  blockId?: string;
  parentId?: string | null;
}
