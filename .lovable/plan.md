

## Smart Page Builder Audit & Fix Plan

### Problem Summary
The Visual Page Builder has architectural mismatches between the editor (`BuilderCanvas.tsx`) and the live renderer (`VisualRenderer.tsx`). They use **different rendering logic** for the same block types, causing what-you-see-is-NOT-what-you-get behavior. The About page was a symptom; the same issues will affect every page built with the builder.

### Root Cause Analysis

| Area | Editor (BuilderCanvas) | Live (VisualRenderer) | Mismatch |
|------|----------------------|----------------------|----------|
| **Section grid** | Inline `display: grid` + exact `gridTemplateColumns` always applied | Uses `vb-responsive-grid` CSS class to force `1fr` on mobile | Editor shows multi-col at all canvas widths; live stacks on mobile |
| **Grid block** | Inline `gridTemplateColumns: repeat(N, 1fr)` always | Tailwind responsive classes (`md:grid-cols-2`, `lg:grid-cols-3`) | Completely different grid systems |
| **Column block** | Inline flex with responsive merge logic | Inline flex with desktop-only styles | Tablet/mobile styles ignored on live |
| **Block wrappers** | Blocks wrapped in `<div className="p-2">` (adds padding) | No wrapper padding | Spacing differs |
| **Section wrapper** | `py-12 px-4 md:px-6 rounded-lg` on container | `py-12 md:py-16 px-4 md:px-6` on section element | Different padding targets |
| **Image rendering** | `objectFit: 'contain'`, no `h-auto` | `w-full h-auto`, `objectFit: 'contain'` | Height handling differs |
| **Heading sizes** | `text-3xl` (no responsive) | `text-3xl md:text-4xl` (responsive) | Text sizes differ per breakpoint |
| **Button styles** | No hover, no Link wrapper | Uses `<Link>` with hover effects | Interactive differences |
| **Container max-width** | Canvas applies `maxWidth` via `DEVICE_WIDTHS` on outer div | Section applies `maxWidth` on inner `mx-auto` div | Width constraint at different levels |

### Plan

#### 1. Create a shared `renderNode` function used by BOTH editor and live

Extract the rendering logic from `VisualRenderer.tsx` into a shared module (`src/components/builder/shared-renderer.tsx`). Both `BuilderCanvas` and `VisualRenderer` will import and use the same function.

- The shared renderer accepts an optional `editorMode` flag
- When `editorMode` is true: wraps blocks in selection/hover overlays (the toolbar, drag handles, outlines) but does NOT change the actual block rendering
- When `editorMode` is false: renders blocks identically but without editor chrome

#### 2. Unify section rendering

Both editor and live will use:
```tsx
// Section container
<section className="relative w-full py-12 px-4 md:px-6">
  <div className="w-full mx-auto" style={{ maxWidth }}>
    <div className="vb-responsive-grid" style={{ display: 'grid', gridTemplateColumns, gap }}>
      {children}
    </div>
  </div>
</section>
```
The `vb-responsive-grid` CSS class handles mobile stacking via `!important` override.

#### 3. Unify grid block rendering

Replace the divergent approaches with a single pattern:
```tsx
<div className="vb-responsive-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
  {children}
</div>
```

#### 4. Remove editor-only padding on block wrappers

Change `<div className="p-2">` around non-container blocks in `BuilderCanvas` to `<div className="w-full">` to match live rendering. Editor selection chrome (outlines, toolbars) will remain on the outer sortable wrapper.

#### 5. Unify text/heading/image/button rendering

Make `BlockPreview` in `BuilderCanvas` use the same markup as `VisualRenderer`:
- Headings: same responsive size classes
- Images: same `w-full h-auto` classes
- Buttons: same styling (though `Link` becomes a `span` in editor since navigation shouldn't work during editing)

#### 6. Add error boundary for live rendering

Wrap `VisualRenderer` output in an error boundary that shows a safe fallback instead of crashing the page:
```tsx
<ErrorBoundary fallback={<div>Something went wrong loading this page.</div>}>
  <VisualRenderer layout={layout} />
</ErrorBoundary>
```

### Files to modify

1. **`src/components/builder/shared-renderer.tsx`** (NEW) — Shared `renderNode` function
2. **`src/components/builder/VisualRenderer.tsx`** — Import shared renderer, remove duplicated logic
3. **`src/components/builder/BuilderCanvas.tsx`** — Import shared renderer for block previews, remove `BlockPreview` component, keep only editor chrome (selection, drag, toolbars)
4. **`src/index.css`** — Keep `vb-responsive-grid` as-is (already correct)
5. **`src/components/SmartPage.tsx`** — Add error boundary wrapper

### Technical Details

The key architectural change is extracting `renderNode` so it becomes the **single source of truth**. The editor wraps each rendered node in a `SortableBlock` container that adds selection UI, but the inner content is identical to what the live site shows.

The `vb-responsive-grid` CSS pattern (using `@media (max-width: 767px) { grid-template-columns: 1fr !important }`) is the correct approach for overriding inline grid styles on mobile — this stays as-is.

