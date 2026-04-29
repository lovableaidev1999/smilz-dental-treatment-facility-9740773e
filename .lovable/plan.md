## Goal

Make the Services admin behave like this:

- 🖌️ **Paintbrush** → opens the page in the Visual Page Builder, **pre-loaded with the existing service detail design and the actual service data** (title, image, description, FAQs). User can freely edit layout, add sections/images, rearrange — same as any built page.
- ✏️ **Pencil** → keeps a simple form for **content fields and SEO** (title, slug, short description, featured image, FAQs, **SEO title / description / keywords**). No layout editing.

This separates "what" (content + SEO via pencil) from "how" (visual design via paintbrush) — both stay available.

## What's already in place

- A `serviceDetailDesign()` template exists in `src/lib/existingDesignTemplates.ts` with placeholders `{Service_Title}`, `{Service_Image}`, `{Service_Content}`.
- `AdminServices.handleOpenBuilder()` already resolves these placeholders and stores the result in `sessionStorage` before navigating to `/admin/page-builder/new?...&template=true`.
- `AdminServiceEdit.tsx` already has SEO fields (SEO Title, SEO Description, Keywords).
- The live `ServiceDetail.tsx` page reads SEO from the `services` table.

So the architecture is right — the issue is the paintbrush sometimes opens an empty canvas, and the two icons aren't clearly distinguished.

## Changes

### 1. Fix paintbrush "blank canvas" issue

In `AdminPageBuilder.tsx` (the `/new` route), confirm the `sessionStorage.builder_template` is actually consumed when `?template=true` is present. If it isn't being read on first load (timing/effect ordering), wire it in so the canvas initializes from that JSON immediately. This is the root cause of the empty editor you saw.

### 2. Improve paintbrush load logic in `AdminServices.tsx`

When a `page_layouts` row already exists for `service-<slug>`:
- If the saved layout is empty/missing, fall back to seeding from `serviceDetailDesign()` + the service data (instead of opening a blank editor).
- Otherwise open the saved layout as today.

When no row exists: keep current behavior (template + sessionStorage + navigate to `/new`).

### 3. Make the two icons unmistakable

In the services list row, replace the bare icons with labeled buttons:

```text
[ 🖌 Edit Design ]   [ ✏ Edit Content & SEO ]   [ 👁 ]   [ 🗑 ]
```

- **Edit Design** = paintbrush → Visual Page Builder (layout, sections, images, blocks).
- **Edit Content & SEO** = pencil → `AdminServiceEdit` form (text fields, featured image, FAQs, SEO title/description/keywords).

Add a tiny helper line under the service title in the list:
*"Use Edit Design for layout · Edit Content & SEO for text and meta tags."*

### 4. Tighten the content form (`AdminServiceEdit.tsx`)

Keep all existing fields. Add a small banner at the top:

> "This editor manages the **content and SEO** for this service. To change the **page layout, sections, or images placement**, use **Edit Design** on the Services list."

Group SEO fields into a clearer card titled **"SEO Settings (meta title, description, keywords)"**.

No schema changes — `seo_title`, `seo_description`, `keywords` columns already exist on `services`.

### 5. Keep visual builder layout linked back to the service

The builder saves to `page_layouts` keyed by `service-<slug>`. The live `/services/:slug` route should continue rendering via `ServiceDetail.tsx` (default) but check for a saved `page_layouts` row first — if one exists for `service-<slug>`, render it via the builder's renderer instead.

I'll verify in `SmartPage.tsx` / `BuiltPage.tsx` whether this lookup already happens for service slugs; if not, add it so paintbrush edits actually appear on the live page.

## Technical details

- Files to edit:
  - `src/pages/admin/AdminServices.tsx` — relabel icons, add helper text, improve `handleOpenBuilder` fallback.
  - `src/pages/admin/AdminServiceEdit.tsx` — info banner + group SEO card.
  - `src/pages/admin/AdminPageBuilder.tsx` — ensure `sessionStorage.builder_template` is consumed on `/new?template=true`.
  - `src/components/SmartPage.tsx` (or `ServiceDetail.tsx`) — if missing, add lookup for `page_layouts.page_slug = 'service-<slug>'` and render via builder when present, falling back to `ServiceDetail`.

- No DB migrations needed.
- No changes to the `serviceDetailDesign()` template structure (it stays as the seed for first-time editing).

## Outcome

- Paintbrush always opens with the current design + content filled in, ready to redesign visually.
- Pencil stays the fast way to fix copy and SEO without touching layout.
- Live service pages reflect whichever path was used last (visual layout overrides default template if present).