import type { BlockDefinition, BlockType, LayoutNode } from '@/types/visual-builder';
import {
  Layout, Columns, Type, AlignLeft, ImageIcon, MousePointerClick,
  Minus, ArrowUpDown, Code, ListOrdered, MessageSquareQuote,
  HelpCircle, Newspaper, Briefcase, Mail, FileText,
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
    },
    defaultChildren: [
      {
        id: genId(),
        type: 'column',
        props: { width: '100%' },
        children: [],
      },
    ],
  },
  {
    type: 'column',
    label: 'Column',
    icon: 'Columns',
    category: 'layout',
    canHaveChildren: true,
    defaultProps: { width: '50%' },
  },

  // Basic
  {
    type: 'heading',
    label: 'Heading',
    icon: 'Type',
    category: 'basic',
    canHaveChildren: false,
    defaultProps: { text: 'Heading', level: 2, align: 'left', color: '' },
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'AlignLeft',
    category: 'basic',
    canHaveChildren: false,
    defaultProps: { text: 'Enter your text here...', align: 'left', color: '' },
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'ImageIcon',
    category: 'basic',
    canHaveChildren: false,
    defaultProps: { src: '', alt: '', caption: '', objectFit: 'cover', borderRadius: '0.5rem' },
  },
  {
    type: 'button',
    label: 'Button',
    icon: 'MousePointerClick',
    category: 'basic',
    canHaveChildren: false,
    defaultProps: { text: 'Click Here', url: '/contact', style: 'primary', align: 'left', openInNewTab: false },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: 'ArrowUpDown',
    category: 'basic',
    canHaveChildren: false,
    defaultProps: { height: '40px' },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: 'Minus',
    category: 'basic',
    canHaveChildren: false,
    defaultProps: { color: '', thickness: '1px', width: '100%' },
  },

  // Dynamic
  {
    type: 'blog-loop',
    label: 'Blog Posts',
    icon: 'Newspaper',
    category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { count: 3, layout: 'grid', columns: 3, showImage: true, showExcerpt: true, showDate: true, category: '' },
  },
  {
    type: 'service-loop',
    label: 'Services',
    icon: 'Briefcase',
    category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { count: 6, layout: 'grid', columns: 3, showImage: true, showDescription: true },
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: 'HelpCircle',
    category: 'dynamic',
    canHaveChildren: false,
    defaultProps: {
      items: [
        { question: 'What is this?', answer: 'This is an FAQ item.' },
      ],
    },
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    icon: 'MessageSquareQuote',
    category: 'dynamic',
    canHaveChildren: false,
    defaultProps: { quote: 'Great service!', author: 'Patient Name', role: '', avatar: '' },
  },
  {
    type: 'contact-form',
    label: 'Contact Form',
    icon: 'Mail',
    category: 'dynamic',
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

  // Advanced
  {
    type: 'icon-list',
    label: 'Icon List',
    icon: 'ListOrdered',
    category: 'advanced',
    canHaveChildren: false,
    defaultProps: {
      items: [{ icon: 'Check', text: 'List item' }],
    },
  },
  {
    type: 'html-embed',
    label: 'HTML Embed',
    icon: 'Code',
    category: 'advanced',
    canHaveChildren: false,
    defaultProps: { html: '<div>Custom HTML</div>' },
  },
  {
    type: 'legacy-content',
    label: 'Legacy Content',
    icon: 'FileText',
    category: 'advanced',
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
  HelpCircle, Newspaper, Briefcase, Mail, FileText,
};

export const getBlockIcon = (def: BlockDefinition) =>
  BLOCK_ICON_MAP[def.icon] || FileText;
