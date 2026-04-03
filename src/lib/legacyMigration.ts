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

/**
 * Intelligently converts legacy HTML into structured visual builder blocks.
 * Parses headings, paragraphs, images, lists, and blockquotes into proper blocks.
 */
export function convertHtmlToVisualLayout(html: string): LayoutNode[] {
  if (!html || !html.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: LayoutNode[] = [];

  const processNode = (el: Element) => {
    const tag = el.tagName.toLowerCase();

    // Headings
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const level = parseInt(tag[1]);
      blocks.push({
        id: genId(),
        type: 'heading',
        props: { text: el.textContent?.trim() || '', level: Math.min(level, 3), align: 'left', color: '' },
      });
      return;
    }

    // Images
    if (tag === 'img') {
      blocks.push({
        id: genId(),
        type: 'image',
        props: {
          src: el.getAttribute('src') || '',
          alt: el.getAttribute('alt') || '',
          caption: '',
          objectFit: 'contain',
          borderRadius: '0.5rem',
        },
      });
      return;
    }

    // Figures (image with caption)
    if (tag === 'figure') {
      const img = el.querySelector('img');
      const caption = el.querySelector('figcaption');
      if (img) {
        blocks.push({
          id: genId(),
          type: 'image',
          props: {
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            caption: caption?.textContent?.trim() || '',
            objectFit: 'contain',
            borderRadius: '0.5rem',
          },
        });
        return;
      }
    }

    // Paragraphs - check if they contain only an image
    if (tag === 'p') {
      const img = el.querySelector('img');
      if (img && el.children.length === 1) {
        blocks.push({
          id: genId(),
          type: 'image',
          props: {
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            caption: '',
            objectFit: 'contain',
            borderRadius: '0.5rem',
          },
        });
        return;
      }
      const text = el.textContent?.trim();
      if (text) {
        blocks.push({
          id: genId(),
          type: 'text',
          props: { text, align: 'left', color: '' },
        });
      }
      return;
    }

    // Lists (ul/ol) -> icon-list
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li')).map(li => ({
        icon: 'Check',
        text: li.textContent?.trim() || '',
      }));
      if (items.length > 0) {
        blocks.push({
          id: genId(),
          type: 'icon-list',
          props: { items },
        });
      }
      return;
    }

    // Blockquotes -> testimonial
    if (tag === 'blockquote') {
      blocks.push({
        id: genId(),
        type: 'testimonial',
        props: {
          quote: el.textContent?.trim() || '',
          author: '',
          role: '',
          avatar: '',
        },
      });
      return;
    }

    // Dividers
    if (tag === 'hr') {
      blocks.push({
        id: genId(),
        type: 'divider',
        props: { color: '', thickness: '1px', width: '100%' },
      });
      return;
    }

    // iframes (YouTube embeds, maps)
    if (tag === 'iframe') {
      const src = el.getAttribute('src') || '';
      if (src.includes('youtube') || src.includes('youtu.be')) {
        blocks.push({
          id: genId(),
          type: 'video',
          props: { url: src, autoplay: false, loop: false, muted: true, aspectRatio: '16/9' },
        });
        return;
      }
      if (src.includes('google.com/maps')) {
        blocks.push({
          id: genId(),
          type: 'google-map',
          props: { address: 'Embedded Map', zoom: 14, height: '300px' },
        });
        return;
      }
      // Generic embed
      blocks.push({
        id: genId(),
        type: 'html-embed',
        props: { html: el.outerHTML },
      });
      return;
    }

    // Div / section / article - recurse into children
    if (['div', 'section', 'article', 'main', 'aside', 'span', 'strong', 'em', 'b', 'i', 'a'].includes(tag)) {
      if (el.children.length > 0) {
        Array.from(el.children).forEach(processNode);
      } else {
        const text = el.textContent?.trim();
        if (text) {
          blocks.push({
            id: genId(),
            type: 'text',
            props: { text, align: 'left', color: '' },
          });
        }
      }
      return;
    }

    // Fallback: any other element with text
    const text = el.textContent?.trim();
    if (text) {
      blocks.push({
        id: genId(),
        type: 'text',
        props: { text, align: 'left', color: '' },
      });
    }
  };

  Array.from(doc.body.children).forEach(processNode);

  // If nothing was parsed, fall back to legacy wrapper
  if (blocks.length === 0) return wrapLegacyContent(html);

  // Wrap all blocks in Section > Column
  const column: LayoutNode = {
    id: genId(),
    type: 'column',
    props: { width: '100%' },
    children: blocks,
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
