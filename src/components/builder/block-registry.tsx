import type { BlockDefinition, BlockType, LayoutNode } from '@/types/visual-builder';
import {
  Layout, Columns, Type, AlignLeft, ImageIcon, MousePointerClick,
  Minus, ArrowUpDown, Code, ListOrdered, MessageSquareQuote,
  HelpCircle, Newspaper, Briefcase, Mail, FileText, Grid3X3,
  Video, MapPin, Star, PanelTop, ChevronsUpDown, Image as ImageLucide,
  Box, GalleryHorizontal, Images, Share2,
} from 'lucide-react';

const genId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Layout
  {
    type: 'section',
    label: 'Section',
    icon: 'Layout',
    category: 'layout',
    canHaveChildren: true,
    defaultProps: {
      background: '',
      backgroundImage: '',
      maxWidth: '1280px',
      fullWidth: false,
      layoutMode: 'grid',
      gridColumns: '1fr 1fr',
      columnGap: '1.5rem',
      rowGap: '1.5rem',
    },
    defaultChildren: [
      { id: genId(), type: 'column', props: { width: '100%' }, children: [] },
      { id: genId(), type: 'column', props: { width: '100%' }, children: [] },
    ],
  },
  {
    type: 'column',
    label: 'Column',
    icon: 'Columns',
    category: 'layout',
    canHaveChildren: true,
    defaultProps: { width: '100%', verticalAlign: 'flex-start' },
  },
  {
    type: 'grid',
    label: 'Grid Layout',
    icon: 'Grid3X3',
    category: 'layout',
    canHaveChildren: true,
    defaultProps: { gridRows: 2, gridCols: 2, columnGap: '1rem', rowGap: '1rem' },
    defaultChildren: Array.from({ length: 4 }, () => ({
      id: genId(),
      type: 'column' as BlockType,
      props: { width: '100%' },
      children: [],
    })),
  },

  // Basic
  {
    type: 'heading', label: 'Heading', icon: 'Type', category: 'basic',
    canHaveChildren: false,
    defaultProps: { text: 'Heading', level: 2, align: 'left', color: '' },
  },
  {
    type: 'text', label: 'Text', icon: 'AlignLeft', category: 'basic',
    canHaveChildren: false,
    defaultProps: { text: 'Enter your text here...', align: 'left', color: '' },
  },
  {
    type: 'image', label: 'Image', icon: 'ImageIcon', category: 'basic',
    canHaveChildren: false,
    defaultProps: { src: '', alt: '', caption: '', objectFit: 'cover', borderRadius: '0.5rem' },
  },
  {
    type: 'video', label: 'Video', icon: 'Video', category: 'basic',
    canHaveChildren: false,
    defaultProps: { url: '', autoplay: false, loop: false, muted: true, aspectRatio: '16/9' },
  },
  {
    type: 'button', label: 'Button', icon: 'MousePointerClick', category: 'basic',
    canHaveChildren: false,
    defaultProps: { text: 'Click Here', url: '/contact', style: 'primary', align: 'left', openInNewTab: false },
  },
  {
    type: 'spacer', label: 'Spacer', icon: 'ArrowUpDown', category: 'basic',
    canHaveChildren: false,
    defaultProps: { height: '40px' },
  },
  {
    type: 'divider', label: 'Divider', icon: 'Minus', category: 'basic',
    canHaveChildren: false,
    defaultProps: { color: '', thickness: '1px', width: '100%' },
  },
  {
    type: 'icon', label: 'Icon', icon: 'Star', category: 'basic',
    canHaveChildren: false,
    defaultProps: { icon: 'Star', size: '48px', color: '', align: 'center' },
  },
  {
    type: 'google-map', label: 'Google Maps', icon: 'MapPin', category: 'basic',
    canHaveChildren: false,
    defaultProps: { address: 'Kolkata, India', zoom: 14, height: '300px' },
  },

  // Dynamic
  {
    type: 'blog-loop', label: 'Blog Posts', icon: 'Newspaper', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { count: 3, layout: 'grid', columns: 3, showImage: true, showExcerpt: true, showDate: true, category: '' },
  },
  {
    type: 'service-loop', label: 'Services', icon: 'Briefcase', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { count: 6, layout: 'grid', columns: 3, showImage: true, showDescription: true },
  },
  {
    type: 'faq', label: 'FAQ', icon: 'HelpCircle', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { items: [{ question: 'What is this?', answer: 'This is an FAQ item.' }] },
  },
  {
    type: 'accordion', label: 'Accordion', icon: 'ChevronsUpDown', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      items: [
        { title: 'Accordion Item 1', content: 'Content for item 1' },
        { title: 'Accordion Item 2', content: 'Content for item 2' },
      ],
    },
  },
  {
    type: 'tabs', label: 'Tabs', icon: 'PanelTop', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      items: [
        { title: 'Tab 1', content: 'Content for tab 1' },
        { title: 'Tab 2', content: 'Content for tab 2' },
      ],
    },
  },
  {
    type: 'testimonial', label: 'Testimonial', icon: 'MessageSquareQuote', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { quote: 'Great service!', author: 'Patient Name', role: '', avatar: '' },
  },
  {
    type: 'contact-form', label: 'Contact Form', icon: 'Mail', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'tel', label: 'Phone', required: false },
        { type: 'textarea', label: 'Message', required: true },
      ],
      submitText: 'Send Message',
    },
  },
  {
    type: 'image-box', label: 'Image Box', icon: 'ImageLucide', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { src: '', title: 'Image Box Title', description: 'A short description here.', align: 'center' },
  },
  {
    type: 'icon-box', label: 'Icon Box', icon: 'Box', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { icon: 'Star', title: 'Icon Box Title', description: 'A short description here.', align: 'center', iconColor: '' },
  },
  {
    type: 'image-carousel', label: 'Image Carousel', icon: 'GalleryHorizontal', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      images: [
        { src: '', alt: 'Slide 1' },
        { src: '', alt: 'Slide 2' },
        { src: '', alt: 'Slide 3' },
      ],
      autoplay: true,
      interval: 3000,
    },
  },
  {
    type: 'gallery', label: 'Gallery', icon: 'Images', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      images: [
        { src: '', alt: 'Image 1' },
        { src: '', alt: 'Image 2' },
        { src: '', alt: 'Image 3' },
        { src: '', alt: 'Image 4' },
      ],
      columns: 3,
      gap: '0.5rem',
    },
  },
  {
    type: 'social-icons', label: 'Social Icons', icon: 'Share2', category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      icons: [
        { platform: 'facebook', url: '#' },
        { platform: 'instagram', url: '#' },
        { platform: 'youtube', url: '#' },
      ],
      size: '24px',
      align: 'center',
    },
  },

  // Advanced
  {
    type: 'icon-list', label: 'Icon List', icon: 'ListOrdered', category: 'advanced',
    canHaveChildren: false,
    defaultProps: { items: [{ icon: 'Check', text: 'List item' }] },
  },
  {
    type: 'html-embed', label: 'HTML Embed', icon: 'Code', category: 'advanced',
    canHaveChildren: false,
    defaultProps: { html: '<div>Custom HTML</div>' },
  },
  {
    type: 'legacy-content', label: 'Legacy Content', icon: 'FileText', category: 'advanced',
    canHaveChildren: false,
    defaultProps: { html: '', sourceTable: '', sourceId: '' },
  },
];

export const getBlockDefinition = (type: BlockType): BlockDefinition | undefined =>
  BLOCK_DEFINITIONS.find(b => b.type === type);

export const getBlocksByCategory = (category: BlockDefinition['category']) =>
  BLOCK_DEFINITIONS.filter(b => b.category === category);

// Icon map for rendering
export const BLOCK_ICON_MAP: Record<string, React.FC<any>> = {
  Layout, Columns, Type, AlignLeft, ImageIcon, MousePointerClick,
  Minus, ArrowUpDown, Code, ListOrdered, MessageSquareQuote,
  HelpCircle, Newspaper, Briefcase, Mail, FileText, Grid3X3,
  Video, MapPin, Star, PanelTop, ChevronsUpDown, ImageLucide,
  Box, GalleryHorizontal, Images, Share2,
};

export const getBlockIcon = (def: BlockDefinition) =>
  BLOCK_ICON_MAP[def.icon] || FileText;

// ─── Section Layout Presets ──────────────────────────────
export interface LayoutPreset {
  label: string;
  icon: string;
  gridColumns: string;
  columnCount: number;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { label: '1 Column', icon: '▬', gridColumns: '1fr', columnCount: 1 },
  { label: '2 Columns', icon: '▬▬', gridColumns: '1fr 1fr', columnCount: 2 },
  { label: '3 Columns', icon: '▬▬▬', gridColumns: '1fr 1fr 1fr', columnCount: 3 },
  { label: '4 Columns', icon: '▬▬▬▬', gridColumns: '1fr 1fr 1fr 1fr', columnCount: 4 },
  { label: '30 / 70', icon: '◂▸', gridColumns: '30% 70%', columnCount: 2 },
  { label: '70 / 30', icon: '▸◂', gridColumns: '70% 30%', columnCount: 2 },
  { label: '25 / 50 / 25', icon: '◂▬▸', gridColumns: '1fr 2fr 1fr', columnCount: 3 },
  { label: '25 / 75', icon: '◁▷', gridColumns: '1fr 3fr', columnCount: 2 },
];
