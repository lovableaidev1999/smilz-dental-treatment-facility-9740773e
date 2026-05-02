## Problem

In the visual page builder, you can only append a new section at the **end** of the page using the "+ Add Section" button at the bottom. There is no way to insert a section *between* two existing sections (e.g. above the Spacer or above the FAQ in screenshot 1). When you click the "+" in the picker, the new section always lands at the end (screenshot 2).

The underlying state already supports inserting at any index — `SectionLayoutPicker` accepts `parentId` and `index` props, and the `ADD_BLOCK` reducer honors `index`. The UI just never wires it up.

## Solution

Add an **inline "+ Add Section here" affordance between every pair of top-level sections** (and above the first one) in the canvas. Clicking it opens the existing `SectionLayoutPicker` pre-targeted at that exact insertion index, so the new section gets inserted in place rather than appended.

### UX details

- A thin horizontal gutter appears between sections.
- It stays subtle by default (e.g. 8 px tall, transparent), and on hover reveals a centered pill button: a "+" icon with the label "Add Section" and a hairline divider line on each side.
- One gutter rendered above section 0, and one after each section. The existing big "+ Add Section" button at the bottom of the page is kept as-is for discoverability.
- Same picker dialog appears — no new UI to learn — but selecting a layout inserts at the chosen position.

```text
┌─────────────────────────┐
│   Section: Heading      │
└─────────────────────────┘
  ─────  + Add Section  ─────   ← new inline insert (hover to reveal)
┌─────────────────────────┐
│   Section: Spacer       │
└─────────────────────────┘
  ─────  + Add Section  ─────   ← new inline insert
┌─────────────────────────┐
│   Section: FAQ          │
└─────────────────────────┘
        [ + Add Section ]       ← existing bottom button (append)
```

## Technical changes

**File:** `src/components/builder/BuilderCanvas.tsx`

1. Change `showLayoutPicker` state from a boolean to `{ open: boolean; index?: number }` so we can remember *where* the next section should be inserted.
2. Add a small `InlineAddSection` component — a hover-reveal gutter with a centered "+ Add Section" pill — rendered:
   - Once before `layout[0]`
   - Once after each `layout[i]`
3. Each inline gutter calls `setShowLayoutPicker({ open: true, index: i })` with the correct insertion index.
4. The existing bottom "+ Add Section" button calls it with no index (appends to end, current behavior).
5. Pass `index={showLayoutPicker.index}` and `parentId={null}` through to `<SectionLayoutPicker />`.

No changes needed to:
- `SectionLayoutPicker.tsx` — already accepts `parentId` / `index`.
- `useBuilderState.tsx` — `ADD_BLOCK` reducer already inserts at the given index via `insertNode`.
- Drag-and-drop reordering — unchanged; existing grip handle on each section still lets users reorder afterward.

## Out of scope

- Inserting between *child* blocks inside a section (that already works via the per-container drop placeholder and drag-and-drop).
- Changing the section picker dialog itself.
