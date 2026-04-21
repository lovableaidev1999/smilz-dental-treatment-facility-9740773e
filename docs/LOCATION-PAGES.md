# Location landing pages

Generate hyperlocal SEO landing pages (e.g. `Best dentist in Garia`,
`Dentist near me in Narendrapur`, `Highest-rated dentist in Sonarpur`) with
unique titles, descriptions, schema, and routed content — all auto-included
in prerender, `sitemap.xml` and `robots.txt`.

## Quick start

```bash
# 1. Edit the matrix (areas × intents) if you want to change the seed set
$EDITOR scripts/location-pages.config.mjs

# 2. Preview what would be generated (no DB writes)
node scripts/generate-location-pages.mjs --dry-run

# 3. Upsert all pages (idempotent — safe to re-run)
SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  \
  node scripts/generate-location-pages.mjs

# 4. Build & deploy as usual — prerender + sitemap will include them
npm run build
```

## What gets created

For each `(intent × area)` combination the script writes one row into
`page_layouts` with:

| Field | Source |
|---|---|
| `page_slug` | e.g. `best-dentist-in-garia` (from `slugTemplate`) |
| `page_title` | H1 (e.g. `Best Dentist in Garia`) |
| `layout_json[0]._seo` | unique title, description, OG image, JSON-LD (`Dentist` + `BreadcrumbList` with `areaServed` set to area + landmarks + nearby) |
| `layout_json[1..n]` | hero, body copy with geographic markers, services CTA, embedded map, FAQ |
| `is_published` | `true` |
| `template_type` | `location-landing` (so admins can filter them) |

## URL pattern

Pages live at root level — e.g. `https://smilz.net/best-dentist-in-garia/`.

This is wired through:

- **React** — `App.tsx` has a catch-all `<Route path="/:slug" element={<BuiltPage />} />`
  placed last among Layout-wrapped routes. `BuiltPage` includes a `RESERVED_SLUGS`
  guard so it never shadows hardcoded routes (it renders `<NotFound />` instead).
- **Sitemap & prerender** — `scripts/_routes.mjs` pulls every published
  `page_layouts` row whose slug isn't a core page (`home`, `about`, etc.) and
  emits it as `/<slug>/`. Both `scripts/prerender.mjs` and
  `scripts/generate-sitemap.mjs` consume the same source.
- **robots.txt** — already allows `/`. Nothing to change.

## Adding a new area or intent

Edit `scripts/location-pages.config.mjs`:

```js
// Add to AREAS:
{
  key: "tollygunge",
  name: "Tollygunge",
  landmarks: ["Tollygunge Metro", "Rabindra Sarobar"],
  nearby: ["Bansdroni", "Naktala"],
  distanceFromClinicKm: 6.2,
}

// Or add to INTENTS:
{
  key: "affordable-dentist-in",
  slugTemplate: "affordable-dentist-in-{area}",
  h1: "Affordable Dentist in {area}",
  title: "Affordable Dentist in {area} | Smilz",
  description: "Quality dental care at fair prices in {area}…",
  angle: "value",
}
```

Re-run `node scripts/generate-location-pages.mjs`. Existing pages are
updated in place; new ones are inserted.

## Per-page overrides

Need to hand-tune copy for one page without losing the matrix? Add to
`OVERRIDES` in the config:

```js
export const OVERRIDES = {
  "best-dentist-in:garia": {
    h1: "The Most Trusted Dentist in Garia, Kolkata",
    description: "…custom copy…",
  },
};
```

## Deleting / unpublishing

The script never deletes. To remove a page, either:

1. Unpublish it via the admin builder (`/admin/page-layouts`), or
2. Delete the row directly: `delete from page_layouts where page_slug = '...'`.

## How it stays in sync with SEO

After running the generator, `npm run build` (or the GitHub Action) will:

1. Run `vite build`.
2. Run `node scripts/prerender.mjs` — fetches all routes via
   `_routes.mjs` (which now includes location pages), prerenders each into
   `dist/<slug>/index.html`, validates H1/desc/JSON-LD, and writes
   `dist/prerender-report.json`.
3. Run `node scripts/generate-sitemap.mjs` — uses the same route source so
   sitemap and prerender can never drift.

You can verify any single page after deploy with:

```bash
curl -s https://smilz.net/best-dentist-in-garia/ | grep -E '<title|<h1|application/ld\+json'
```
