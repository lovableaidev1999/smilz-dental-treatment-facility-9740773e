## What happened

Your site has **two separate CMS systems** — both under Admin — and they do very different things:

| CMS section | Table | Effect on the live page |
|---|---|---|
| **Admin → Pages** (content sections) | `page_content` | Edits text/images inside the existing hardcoded design (safe). |
| **Admin → Visual Page Builder** | `page_layouts` | **Completely replaces** the hardcoded page with the drag-and-drop layout when you hit *Publish*. |

`src/components/SmartPage.tsx` (used by `/`, `/about`, `/services`, `/contact`, `/gallery`, `/blog`, `/referral`) checks `page_layouts` first: if a published row exists for that slug, it renders that layout via `VisualRenderer` and the original `Home.tsx` design is bypassed entirely.

So when you opened Home in the Page Builder and published, `SmartPage` started rendering the builder layout instead of the real `Home.tsx` — that's why the design changed.

## Fix (no risk to the live site)

### 1. Restore the Home design immediately

Add `'home'` to `FORCE_FALLBACK_SLUGS` in `src/components/SmartPage.tsx`. That set already exists and is designed for exactly this case: when a slug is in it, `SmartPage` **never** reads `page_layouts` and always renders the hardcoded component (`Home.tsx`). The stray `page_layouts` row for `home` stays in the database untouched — we just stop reading it. Zero DB change, zero deploy risk. Home will render exactly like it did before the accidental publish, using your current `page_content` sections.

We'll do the same defensive lock for the other main pages that already have polished hardcoded designs you likely don't want overwritten by accident: `about`, `services`, `contact`, `gallery`, `blog`. (Any page_layouts you already have for these will simply be ignored — nothing is deleted.)

### 2. Make "safe content editing" obvious in the CMS

- In **Admin → Visual Page Builder** (`src/pages/admin/AdminPageLayouts.tsx`), for the six locked core pages listed above:
  - Replace the "Design in Builder" action with a clear notice: *"This page uses the site's fixed design. Edit its content in Admin → Pages."* plus a direct link/button that navigates to `/admin/pages?page=home` (etc.).
  - Keep the builder accessible only for **custom pages** (slugs not in the locked list), which is what it's meant for.
- In **Admin → Pages** (`src/pages/admin/AdminPages.tsx`), add a small header banner: *"Editing content here is safe — the page design will not change."*
- Support the `?page=home` query param in `AdminPages` so the "Edit content" button from the Builder screen lands directly on the right page's sections.

### 3. Nothing else changes

- No database migration, no schema change, no changes to `page_content`, no changes to the published site's routes.
- `Home.tsx`, `About.tsx`, `Services.tsx`, `Contact.tsx`, `Gallery.tsx`, `Blog.tsx` are untouched — they keep reading from `page_content` exactly as they do today, so edits you make in **Admin → Pages** appear on the live site.
- Custom builder pages (anything not in the locked list, e.g. landing pages) keep working exactly as before.

## Files touched

```text
src/components/SmartPage.tsx        # add home/about/services/contact/gallery/blog to FORCE_FALLBACK_SLUGS
src/pages/admin/AdminPageLayouts.tsx # show "Edit content in Pages" for locked core pages
src/pages/admin/AdminPages.tsx      # support ?page= query param + safe-edit banner
```

## Verification

1. `npm run build` passes.
2. Visit `/` in preview — matches the original Home design (hero, services carousel, reviews, FAQ, CTA).
3. Admin → Pages → Home: edit a section heading, save, reload `/` — new text appears, design unchanged.
4. Admin → Visual Page Builder: Home/About/Services/Contact/Gallery/Blog rows show the "Edit content in Pages" action instead of opening the builder. Custom pages still open the builder normally.

## Technical notes

- `FORCE_FALLBACK_SLUGS` short-circuits **before** the `page_layouts` query runs (it's already gated by `enabled: !!slug && !forceFallback`), so the lock is authoritative and cheap.
- We do not delete the accidental `page_layouts` row for `home`. If in future you want to re-enable builder mode for Home, remove `'home'` from the set — no data loss.
- `RESERVED_SLUGS` in `src/pages/BuiltPage.tsx` already blocks these slugs from being rendered by the generic `/p/:slug` fallback, so there's no second render path to worry about.
