

# CMS-Driven Page Design System — Implementation Plan

## What This Delivers

A unified system where any page (Home, About, Services, Contact, Gallery, Blog) can be redesigned through the Visual Page Builder. Includes section templates, block locking, per-page SEO controls, global reusable sections, and performance guardrails.

## Architecture

```text
User visits /about
       │
       ▼
  SmartPage(slug="about", fallback=About)
       │
  Query page_layouts where slug="about" & is_published=true
       │
   ┌───┴───┐
   │ Found │ → VisualRenderer (custom design + SEO from layout)
   └───┬───┘
       │ Not found
       ▼
  Original hardcoded About component
```

## Implementation Steps

### Step 1: Create SmartPage wrapper

**New file**: `src/components/SmartPage.tsx`

- Accepts `slug`, `fallback` component, and optional `fallbackSeoProps`
- Queries `page_layouts` for published layout matching slug (5-min staleTime cache)
- If found: renders `<SEOHead>` with layout's SEO fields + `<VisualRenderer>`
- If not found: renders fallback component unchanged
- Shows brief loading spinner during fetch

### Step 2: Wire core routes through SmartPage

**Modified**: `src/App.tsx`

Replace direct components for 6 routes:
- `/` → `SmartPage slug="home" fallback={Home}`
- `/about` → `SmartPage slug="about" fallback={About}`
- `/services` → `SmartPage slug="services" fallback={ServicesPage}`
- `/contact` → `SmartPage slug="contact" fallback={Contact}`
- `/gallery` → `SmartPage slug="gallery" fallback={Gallery}`
- `/blog` → `SmartPage slug="blog" fallback={Blog}`

### Step 3: Add SEO fields to page layouts

**Modified**: `src/hooks/usePageLayouts.ts` — extend `PageLayoutRow` interface with optional `seo_title`, `seo_description`, `og_image` fields stored inside `layout_json` metadata (no schema change needed — store as top-level props in the JSON).

**Modified**: `src/pages/admin/AdminPageBuilder.tsx` — add SEO settings tab/dialog with Title, Meta Description, OG Image fields. Save into the layout payload.

**Modified**: `src/components/SmartPage.tsx` — pass SEO fields from layout to `<SEOHead>`.

### Step 4: Add section locking

**Modified**: `src/types/visual-builder.ts` — add optional `locked?: boolean` to `LayoutNode.props`.

**Modified**: `src/components/builder/PropertiesPanel.tsx` — add Lock/Unlock toggle button. When locked, disable delete, drag, and prop editing for that block.

**Modified**: `src/components/builder/BuilderCanvas.tsx` — skip drag handlers for locked blocks. Show lock icon overlay.

**Modified**: `src/hooks/useBuilderState.tsx` — `DELETE_BLOCK` and `MOVE_BLOCK` actions skip locked blocks.

### Step 5: Section templates

**New file**: `src/lib/sectionTemplates.ts`

Pre-built layout JSON arrays for common pages:
- **Home**: Hero section (heading + CTA + background image) → Services loop (carousel) → Testimonials → CTA
- **About**: Hero → Two-column (image + text) → Team/Doctor section → CTA
- **Services**: Hero → Service loop (grid) → FAQ → CTA
- **Contact**: Two-column (form + map/info) → CTA

**Modified**: `src/pages/admin/AdminPageLayouts.tsx` — when creating a new page or designing a core page, show template picker dialog. User selects a template or starts blank. Template inserts pre-built `layout_json`.

### Step 6: Core page management in Admin

**Modified**: `src/pages/admin/AdminPageLayouts.tsx`

- Add "Core Pages" section showing home, about, services, contact, gallery, blog with status
- "Design" button opens builder with that slug
- Publish/Unpublish toggle for instant switching
- "Preview" button opens page in new tab
- Warning dialog before publishing: "This will replace the current page design"

### Step 7: Global reusable sections

**New concept**: Store reusable sections as `page_layouts` rows with `is_template=true` and `template_type='global-header'|'global-footer'|'global-cta'`.

**Modified**: `src/components/builder/block-registry.tsx` — add new block type `global-section` that references a template by ID.

**Modified**: `src/components/builder/VisualRenderer.tsx` — `global-section` block fetches and renders the referenced template's layout_json inline.

**Modified**: `src/pages/admin/AdminPageLayouts.tsx` — separate "Global Sections" management area for creating/editing reusable header, footer, CTA blocks.

### Step 8: Upgrade dynamic blocks (mobile-first + layout control)

**Modified**: `src/components/builder/VisualRenderer.tsx`

- `ServiceLoopWidget`: add `displayType` prop support — "carousel" uses Embla with swipe/dots (reuse ServicesCarousel logic), "grid" uses responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-{n}`
- `BlogLoopWidget`: same carousel/grid support with responsive columns
- `ImageCarouselWidget`: upgrade to Embla with swipe
- `GalleryWidget`: responsive `grid-cols-2 md:grid-cols-{n}`
- All sections: responsive `grid-cols-1 md:grid-cols-2 lg:...` instead of fixed `gridTemplateColumns`

**Modified**: `src/components/builder/block-registry.tsx` — add `displayType`, `autoplay`, `showNavigation` to service-loop and blog-loop defaults.

**Modified**: `src/components/builder/PropertiesPanel.tsx` — add Display Type dropdown, Columns input, Autoplay/Navigation toggles for loop blocks.

### Step 9: Performance guardrails

**Modified**: `src/components/builder/VisualRenderer.tsx`
- Wrap below-the-fold blocks (index > 2) in IntersectionObserver lazy wrapper
- Add `loading="lazy"` to all images/iframes

**Modified**: `src/components/builder/BuilderCanvas.tsx` or `BuilderTopBar.tsx`
- Show warning badge when page has >30 blocks
- Toast warning on save if block count exceeds limit

**Modified**: `src/components/SmartPage.tsx`
- React Query staleTime: 5 minutes for layout queries

## Files Summary

| File | Action |
|------|--------|
| `src/components/SmartPage.tsx` | New |
| `src/lib/sectionTemplates.ts` | New |
| `src/App.tsx` | Modified (6 routes) |
| `src/types/visual-builder.ts` | Modified (locked prop) |
| `src/hooks/usePageLayouts.ts` | Modified (SEO fields) |
| `src/hooks/useBuilderState.tsx` | Modified (lock enforcement) |
| `src/components/builder/VisualRenderer.tsx` | Modified (responsive blocks, global sections, lazy loading) |
| `src/components/builder/block-registry.tsx` | Modified (layout control props, global-section type) |
| `src/components/builder/PropertiesPanel.tsx` | Modified (SEO, lock toggle, layout controls) |
| `src/components/builder/BuilderCanvas.tsx` | Modified (lock UI, block limit warning) |
| `src/pages/admin/AdminPageBuilder.tsx` | Modified (SEO settings, template picker) |
| `src/pages/admin/AdminPageLayouts.tsx` | Modified (core pages, global sections, templates) |

No database schema changes required — all new data fits within existing `layout_json` JSONB and `page_layouts` table columns.

