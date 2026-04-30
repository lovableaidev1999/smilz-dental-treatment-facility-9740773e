## Goal
Give the Smilz Referral page (`/referral`) the same editable hero banner that About, Blog, Contact, Gallery, and Services use, with a CMS‑editable background image.

## What changes

### 1. `src/pages/Referral.tsx`
- Replace the current plain gradient hero `<section>` with the shared `<PageHero />` component.
- Wire it to the CMS via `usePageContent("referral")` + `getSection("hero")`, exactly like Gallery does.
- Render `<PageHero />` unconditionally with sensible fallbacks so the banner always shows even if no CMS row exists yet:
  - `title`: `heroSection?.heading ?? "Smilz Referral"`
  - `subtitle`: `heroSection?.subheading ?? "Refer a friend or family member to Smilz Dental Treatment Facility."`
  - `imageUrl`: `heroSection?.image_url` (gradient fallback when empty)
  - `breadcrumbs`: Home → Smilz Referral
  - `contact`: pulled from `useSiteSettings()` (whatsapp / phone / phone_formatted)
  - `whatsappMessage`: a referral‑specific prefill ("Hi, I'd like to refer someone to Smilz Dental.")
- Keep the existing referral form section below the hero unchanged.
- Keep `SEOHead` (with `robots="noindex, nofollow"` as today — the page is a private form).

### 2. Admin editability
No new admin UI is needed. The existing **Admin → Pages** editor (which manages the `page_content` table used by About/Blog/Contact/Gallery) already supports any `page_name`. After deploy, an admin opens the Pages editor, picks/creates the `referral` page with section_id `hero`, and uploads an image — it will appear instantly on the live page (the existing realtime subscription in `usePageContent` invalidates the cache).

If a `referral` entry doesn't exist yet, the page still renders the gradient hero with the fallback title/subtitle above, so nothing breaks.

### 3. Prerendered SEO build
`/referral` is `noindex, nofollow`, so it does not need to be in the prerender list. No workflow change required. The Lovable preview and live site will reflect the new hero immediately after publish.

## Technical notes
- Reuses the existing `PageHero` component (`src/components/PageHero.tsx`) — no new components.
- Reuses `usePageContent` hook — no schema or migration work.
- Removes the local `framer-motion` hero wrapper (the form's `motion.div` stays).
- Pattern mirrors `src/pages/Gallery.tsx` (decoupled hero + filtered sections), so behavior is consistent across the site.

## Files touched
- `src/pages/Referral.tsx` (edit)

## Out of scope
- No database migration.
- No changes to admin panel code.
- No changes to GitHub workflows.