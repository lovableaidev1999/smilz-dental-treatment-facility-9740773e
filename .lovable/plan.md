## Goal

Fix two issues in the Visual Page Builder's inline text editor (`RichTextEditable.tsx`):

1. **Pasted content from Word/Google Docs/web pages brings in foreign font sizes, colors, fonts, and styles** that break the page's design.
2. **Lack of MS Word-style formatting controls** — currently only S/M/L/XL size presets and limited tools.

## Changes

### 1. Sanitize pasted content (`onPaste` handler)

Add a `handlePaste` handler on the contentEditable element that:
- Calls `e.preventDefault()` to block default paste.
- Reads `text/html` from `e.clipboardData`; falls back to `text/plain`.
- Runs HTML through a sanitizer that:
  - Strips all inline `style` attributes (removes `font-size`, `font-family`, `color`, `background`, `line-height`, MSO styles).
  - Strips `class`, `id`, `lang`, `dir`, and all `mso-*`, `o:*`, `w:*` Word/Office attributes & tags.
  - Removes `<style>`, `<meta>`, `<script>`, `<link>`, `<o:p>`, `<xml>` blocks entirely.
  - Keeps a safe whitelist of tags: `p, br, strong, b, em, i, u, s, a, ul, ol, li, h1-h6, blockquote, span` (span only without style → unwrapped).
  - Preserves `href`, `target`, `rel` on `<a>` and converts external links to `target="_blank" rel="noopener noreferrer"`.
- Inserts the cleaned HTML at the caret via `document.execCommand('insertHTML', false, cleanHtml)` so it inherits the block's own typography.

This guarantees pasted text adopts the page's font, size, and color tokens instead of the source document's.

### 2. Expand the floating toolbar (Word-like)

Replace the current S/M/L/XL preset row with a richer toolbar. Add the following controls beside the existing Bold/Italic/Underline/Heading/Color/Link buttons:

- **Font size dropdown** — numeric pixel sizes (`12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64 px`). Applies via wrapping the selection in a `<span style="font-size: Npx">` (using a small custom helper, since `execCommand('fontSize')` only supports 1–7).
- **Font family dropdown** — Default (inherit), Poppins, Arial, Georgia, Times New Roman, Courier New. Applied with `execCommand('fontName')`. Default option clears any inline font-family on the selection.
- **Strikethrough** button (`execCommand('strikeThrough')`).
- **Subscript / Superscript** buttons.
- **Alignment** buttons — Left / Center / Right / Justify (`justifyLeft`, `justifyCenter`, `justifyRight`, `justifyFull`).
- **Bullet list / Numbered list** buttons (`insertUnorderedList`, `insertOrderedList`).
- **Indent / Outdent** buttons.
- **Blockquote** toggle (`formatBlock` → `blockquote`).
- Keep existing: Paragraph/H1/H2/H3, Bold, Italic, Underline, Text color, Highlight, Clear formatting, Link, Unlink.

Toolbar layout will be reorganized into grouped clusters with thin separators, wrapping naturally if width is constrained.

### 3. Small UX improvements

- Make the toolbar `flex-wrap` so it stays usable on narrow blocks.
- Add tooltips (`title`) for every button.
- Ensure dropdowns (font size, font family) don't blur the editor — use `onMouseDown={e => e.preventDefault()}` and restore selection before applying.

## Files to modify

- `src/components/builder/RichTextEditable.tsx` — add `handlePaste`, sanitizer helper, expanded toolbar with new controls and dropdowns.

No new dependencies required (uses native `document.execCommand` and a small inline sanitizer; no DOMPurify needed since output stays inside the contentEditable and is later saved as the block's own HTML).

## Result

Pasting from Word, Google Docs, websites, or emails will produce clean text that matches the page's design system. The floating toolbar gains MS Word–level controls: numeric font size, font family, alignment, lists, indent, strikethrough, sub/superscript, and blockquote.
