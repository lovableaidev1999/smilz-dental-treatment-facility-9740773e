# Inline Block Insertion Inside Text Boxes

## Goal

Inside a Text or Heading block in the visual builder, let the user place the cursor on any blank line (or between paragraphs) and insert a real builder block — Heading, Image, Button, Spacer, Divider, etc. — directly at that position. The text block automatically splits in two so the new block sits *between* the two halves of text, as a normal sibling block in the parent section.

This is the same UX pattern as Notion's "/" menu and Elementor's inline add‑element button.

## How it will work (user view)

1. User double-clicks a text block to start editing (existing behavior).
2. When the cursor sits on an empty line, a small floating **`+`** button appears at the left margin of that line.
3. Clicking **`+`** opens a compact popover listing insertable block types grouped by category (Heading, Image, Button, Spacer, Divider, Video, FAQ, etc. — sourced from the existing `BLOCK_DEFINITIONS`).
4. Picking a block:
   - Splits the current text block's HTML at the cursor into "before" and "after" HTML.
   - Updates the current text block's `html` to the "before" portion.
   - Inserts the chosen new block as the next sibling in the parent section.
   - If "after" is non-empty, inserts a second text block (cloned style/props) right after the new block containing the "after" HTML.
5. Selection moves to the newly inserted block so the user can immediately edit it.

A keyboard shortcut **`/`** at the start of an empty line opens the same popover (Notion-style), as a faster alternative to clicking the `+`.

## Technical Plan

### 1. New component — `InlineBlockInserter.tsx`
- Compact popover listing block types from `BLOCK_DEFINITIONS` (reuse the existing palette data — same icons and labels).
- Filter out container/layout-only types (`section`, `row`, `column`, `card`) so users only get content blocks inline.
- Search input at top to filter (helpful since the list can be long).

### 2. Extend `RichTextEditable.tsx`
- Track caret position with a `selectionchange` listener while `editing` is true. Compute:
  - The `Range` representing the caret.
  - The block-level element the caret sits in (closest `p`, `h1`–`h6`, `div`).
  - Whether that line is "empty" (no text content, no inline children other than `<br>`).
- When empty: render a small floating `+` button absolutely positioned to the left of that line's bounding rect (inside the same `relative` wrapper that already holds the toolbar).
- Listen for `/` keypress at the start of an empty line → open the same popover.
- On block pick, call a new helper passed in via props: `onInsertBlockAtCaret(blockType)`.

### 3. New reducer action — `SPLIT_AND_INSERT`
Added in `src/hooks/useBuilderState.tsx` alongside existing `ADD_BLOCK`:

```text
payload: {
  sourceBlockId: string,        // the text/heading block being split
  beforeHtml: string,           // HTML to keep in the original block
  afterHtml: string,            // HTML to put in a new sibling text block ("" = none)
  newBlock: BuilderNode,        // the block chosen from the picker
}
```

Behavior:
1. Locate `sourceBlockId` and its parent + index using existing `findNode` helper.
2. Update source block's `props.html` to `beforeHtml`.
3. Insert `newBlock` at `index + 1` in the parent's children.
4. If `afterHtml` is non-empty, insert a clone of the source (same `type`, copied `props` minus `html`, fresh id) at `index + 2` with `html = afterHtml`.
5. Set `selectedBlockId` to `newBlock.id`.

This keeps the operation a single undoable history entry.

### 4. Wire it up
- `RichTextEditable` receives an `onInsertBlock` callback (created in `shared-renderer.tsx` where the component is instantiated for `heading` and `text` cases) that:
  - Reads the saved caret range.
  - Splits the contenteditable's current HTML at the caret using `Range.cloneContents` / `extractContents` against a clone of the root, producing `beforeHtml` and `afterHtml`.
  - Builds the new block via the same factory used by `addBlock` (extract that factory from `useBuilderState.tsx` into an exported helper `createBlockFromType(type)` so it can be reused without dispatching).
  - Dispatches `SPLIT_AND_INSERT`.

### 5. Styling
- `+` button: 20×20 rounded square, `bg-card border border-border`, primary color on hover. Positioned `-left-7 top-1/2 -translate-y-1/2` relative to the empty line.
- Popover: matches existing `SectionLayoutPicker` look — `bg-card border rounded-md shadow-lg`, max-height with scroll, 2‑column grid of icon + label.

### 6. Edge cases handled
- Caret in middle of a line → still splits at caret; "before" keeps inline formatting up to caret, "after" keeps the rest.
- Caret in a heading block → split produces two heading blocks of the same level around the new block.
- Inserting at the very top → `beforeHtml` empty: skip updating source's html-emptying step is fine, but still reorder so the new block lands above; for cleanliness, if `beforeHtml` is empty AND `afterHtml` equals original, just insert *before* the source instead of splitting.
- Container blocks excluded from the inline picker.

## Files Changed

- **`src/components/builder/RichTextEditable.tsx`** — caret tracking, floating `+`, `/` shortcut, calls `onInsertBlock`.
- **`src/components/builder/InlineBlockInserter.tsx`** *(new)* — searchable block picker popover.
- **`src/components/builder/shared-renderer.tsx`** — pass `onInsertBlock` prop into the two `RichTextEditable` instances (text + heading).
- **`src/hooks/useBuilderState.tsx`** — new `SPLIT_AND_INSERT` reducer case; export `createBlockFromType` helper.

## Out of scope

- Inline insertion inside non-text blocks (already handled by the section-level "+ Add Section" gutter shipped previously).
- Drag-and-drop from the left palette directly onto a text-line caret (still works at section level).
