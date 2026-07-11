# Lock Core Pages to Fixed Templates (Content-Only CMS)

## Good news: this is already ~90% in place

The architecture you describe is already the intended design. Before writing new code, here is what the current codebase does:

- **`src/components/SmartPage.tsx`** defines `FORCE_FALLBACK_SLUGS = { home, about, services, contact, gallery, blog }`. For these six slugs, any row in the `page_layouts` (Visual Builder) table is **ignored**. The hardcoded React component is always rendered.
- Each core page component (`Home.tsx`, `Services.tsx`, `About.tsx`, `Contact.tsx`, `Gallery.tsx`, `Blog.tsx`) reads editable strings/images from the `page_content` table via `usePageContent(slug)`. Layout, spacing, grid, animations, colors, and component structure all live in the source code.
- **`src/pages/admin/AdminPageLayouts.tsx`** already lists these six pages under a "Core Pages" section with a `Fixed Design` lock badge, an amber warning ("cannot be edited in the Visual Builder"), and only exposes an **Edit Content** button that routes to `/admin/pages?page=<slug>` (AdminPages → `page_content`).
- **`AdminPages`** is the safe content editor (headings, subheadings, body text, image URL, button text/link, SEO metadata per section). It writes to `page_content` only — never `page_layouts`.

So the runtime is already template-controlled. The remaining gaps are edge cases where an admin could *think* they are editing a core page's layout, or where a stale row in `page_layouts` could confuse them.

## What actually changes (small, low-risk)

### 1. Block direct-URL editing of core-page layouts in the Visual Builder
Currently `/admin/page-builder/:id` opens whatever layout id is in the URL. If a legacy `page_layouts` row exists for `home`/`about`/etc., an admin could still open and save it (though it has no effect on the live site because `SmartPage` ignores it).

**Change:** In `src/pages/admin/AdminPageBuilder.tsx`, when the loaded layout's `page_slug` is one of the six core slugs, show a read-only notice and a "Go to Content Editor" button that navigates to `/admin/pages?page=<slug>`. Do not render the builder canvas.

### 2. Remove the "New Page" pathway that could reuse a core slug
In `AdminPageLayouts.tsx`, the "New Page" dialog accepts any slug. Add a validation check: reject creation if the entered slug is one of the six core slugs, with a toast pointing to Admin → Pages.

### 3. Hide/deactivate any stray published `page_layouts` rows for core slugs
Non-destructive: run a one-shot admin migration that flips `is_published = false` for any existing row whose `page_slug ∈ {home, about, services, contact, gallery, blog}`. The rows are kept (no data loss) but marked draft so they can never accidentally re-appear on the live site if `FORCE_FALLBACK_SLUGS` is ever changed.

### 4. Documentation touch-up
Add a short "Core Pages Policy" note in `AdminPages` explaining that these six pages are template-locked and only content is editable. No behavior change.

## Files changed

| File | Change |
|---|---|
| `src/pages/admin/AdminPageBuilder.tsx` | Guard: if `page_slug ∈ CORE_SLUGS`, render a locked notice with link to `/admin/pages?page=<slug>` instead of the builder canvas. |
| `src/pages/admin/AdminPageLayouts.tsx` | Validate "New Page" slug against `CORE_SLUGS`. |
| `src/pages/admin/AdminPages.tsx` | Add a small header banner: "Core pages have fixed designs — only content is editable here." |
| `supabase/migrations/<timestamp>_lock_core_page_layouts.sql` | `UPDATE public.page_layouts SET is_published = false WHERE page_slug IN (...)`. No drops, no deletes. |

**Not touched:** `Home.tsx`, `Services.tsx`, `About.tsx`, `Contact.tsx`, `Gallery.tsx`, `Blog.tsx`, `SmartPage.tsx` (already correct), routing (`App.tsx`), SEO components, `page_content` schema, custom-page builder for `/p/<slug>` pages.

## How existing CMS content maps into the fixed templates

No mapping work needed. Each hardcoded page already consumes `page_content` sections by `section_id`:

- **Home:** `hero`, `about-preview`, `services-preview`, `why-choose`, `testimonials`, `faq`, `cta` → `Home.tsx`
- **About:** `hero`, `mission`, `team`, `values`, `stats` → `About.tsx`
- **Services:** `hero` + `services` table rows → `Services.tsx`
- **Contact:** `hero`, `info`, `map` + `site_settings.contact` → `Contact.tsx`
- **Gallery:** `hero` + `gallery` table rows → `Gallery.tsx`
- **Blog (Insights):** `hero` + `blog_posts` table rows → `Blog.tsx`

Admins continue editing in **Admin → Pages** (per-section content), **Admin → Services**, **Admin → Gallery**, **Admin → Blog**, **Admin → Settings**. All existing rows remain valid — nothing is migrated or renamed.

## SEO, routing, URLs

- Routes unchanged: `/`, `/about`, `/services`, `/contact`, `/gallery`, `/blog`.
- `SEOHead` continues to read title/description/canonical/OG/JSON-LD from the same sources (`site_settings`, `page_content` SEO fields, service/blog row SEO fields).
- Sitemap generator (`scripts/generate-sitemap.mjs`) is not touched.

## Production impact

- **Live rendering: zero visible change.** `SmartPage` already ignores `page_layouts` for these six slugs, so the live site is already using the hardcoded templates. This work only closes admin-UI loopholes.
- **Admin UX:** cleaner — direct URLs to a locked layout redirect to the content editor; creating a "new page" with a reserved slug is blocked with a clear message.
- **Data:** no destructive changes. Legacy `page_layouts` rows for core slugs are simply flipped to `is_published = false` (recoverable).
- **Risk:** low. All changes are admin-only and additive guards; no changes to public routes, public components, or the deploy pipeline.

## Rollout

1. Merge changes.
2. Auto-deploy via existing GitHub Actions workflow (no workflow changes).
3. Verify: open `/admin/page-builder/<any core layout id>` → sees lock screen; live pages unchanged.
