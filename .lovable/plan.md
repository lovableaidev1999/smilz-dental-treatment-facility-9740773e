

## Rich Text Formatting for Visual Builder Text Blocks

Currently, the visual builder's text blocks store plain strings and use a basic `contentEditable` div (`InlineEditable.tsx`) that strips all formatting. This plan adds bold, italic, underline, font size, and line break support.

### Approach

Store text content as **HTML strings** instead of plain text. Replace the plain `InlineEditable` with a new `RichTextEditable` component that shows a mini formatting toolbar when editing.

### Changes

**1. Create `src/components/builder/RichTextEditable.tsx`**

A new component that replaces `InlineEditable` for text/heading blocks:
- Uses `contentEditable` with `innerHTML` instead of `innerText`
- Shows a floating mini-toolbar on double-click (edit mode) with buttons for: **Bold**, *Italic*, Underline, Font Size (small/normal/large/xlarge), and line break hint
- Uses `document.execCommand` for formatting (bold, italic, underline, fontSize) -- simple and sufficient for this use case
- On blur, saves the `innerHTML` back to the block's `html` prop
- Shift+Enter inserts a `<br>` for new lines

**2. Update `src/components/builder/block-registry.tsx`**

- Add `html` to defaultProps for `heading` and `text` blocks (empty string, meaning fallback to `text` prop for backward compatibility)

**3. Update `src/components/builder/PropertiesPanel.tsx`**

- For text/heading blocks, change the "Text" field to a note saying "Double-click on canvas to edit with formatting" when `html` content exists
- Keep the plain text field as a fallback/source editor

**4. Update `src/components/builder/shared-renderer.tsx`**

- In the `heading` and `text` cases:
  - **Editor mode**: Use `RichTextEditable` instead of `InlineEditable`, reading from `node.props.html` (falling back to `node.props.text`)
  - **Live mode**: Render using `dangerouslySetInnerHTML` when `html` prop exists, otherwise render plain `text` as before (backward compatible)

**5. Update `src/components/builder/InlineEditable.tsx`**

- No changes needed; kept for any other uses but text/heading blocks will use the new component

### Data Model

```text
Before:  { type: "text", props: { text: "Hello world", ... } }
After:   { type: "text", props: { text: "Hello world", html: "<b>Hello</b> world", ... } }
```

The `html` prop takes priority when present. The `text` prop remains as plain-text fallback for backward compatibility with existing saved layouts.

### Mini Toolbar UI

A small absolute-positioned bar appearing above the editable element with icon buttons:
- **B** (Bold) | *I* (Italic) | U (Underline) | Font Size dropdown (S/M/L/XL)
- Styled consistently with the existing builder UI (ghost buttons, border, bg-card)

### Technical Notes

- `document.execCommand` is deprecated but remains the simplest approach for inline contentEditable formatting and is universally supported. A full TipTap integration would be overkill for these inline canvas edits.
- HTML is sanitized on render using `dangerouslySetInnerHTML` -- since this is admin-only content created by authenticated users, the risk is acceptable (same pattern used by `html-embed` and `legacy-content` blocks).
- Existing saved layouts with only `text` prop continue to work unchanged.

