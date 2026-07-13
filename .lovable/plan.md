## Goal

Tighten technical SEO across the SPA and add three dedicated South Kolkata / Garia location-service landing pages that feel like a premium medical portal.

## Current state (verified in code)

- `react-helmet-async` is already wired via `<HelmetProvider>` in `src/App.tsx`, and `SEOHead.tsx` already emits per-page title, description, canonical, OG/Twitter, Dentist + Breadcrumb + FAQ + Service JSON-LD, and `robots`. Canonical is normalized to `https://smilz.net` with trailing slash via `src/lib/canonicalUrl.ts`.
- Home currently pulls its title from `settings.seo.default_title` (site setting) — not the exact string requested.
- Sitemap: dynamic script `scripts/generate-sitemap.mjs` + `_routes.mjs` (Supabase-backed) already emits `/sitemap.xml`. Three new routes need adding to `STATIC_ROUTES`.
- Existing SEO landing pages live under `src/pages/seo/*` (e.g. `DentalImplantsKolkata.tsx`) — good pattern to reuse.
- No sticky mobile "Book Appointment" CTA on service pages (only a global `StickyCtaBar` / `WhatsAppFAB`).
- No shared Before/After showcase component.

## Changes

### 1. Technical SEO polish

- **Home title override** — set Home's `SEOHead title` to the exact string `"Best Dentist in Garia, South Kolkata | Smilz Dental Clinic"` (bypass the settings default so the requested copy is guaranteed even before an admin edits site settings). `SEOHead` already avoids double-suffixing when the title contains "Smilz".
- **Canonical audit** — spot-check every top-level page (`Home`, `About`, `Services`, `ServiceDetail`, `Gallery`, `Contact`, `Blog`, `BlogPost`, `Referral`, the 5 SEO landings, and `BuiltPage`) still renders `<SEOHead>` so `normalizeCanonicalUrl` fires on each route. Any page missing it gets one added. No new library.
- **Alt-text sweep** — audit `Header`, `Footer`, `Home`, `About`, `Services`, `ServiceDetail`, `Gallery`, `ClinicSlider`, `GoogleReviewSlider`, `ServicesCarousel`, `PageHero`, and the new landing pages. Replace empty / generic `alt=""` / `alt="image"` with descriptive strings (e.g. `"Advanced dental operatory room at Smilz Dental Clinic Garia"`, `"Dr. Dibyendu Dutta consulting a patient at Smilz Garia"`). Keep decorative-only icons as `aria-hidden`.

### 2. Three new location-service landing pages

Structurally separate files (not builder-DB pages), so they ship in prerender + sitemap deterministically:

- `src/pages/seo/DentalImplantsKolkataService.tsx` → `/services/dental-implants-kolkata`
- `src/pages/seo/ClearAlignersGaria.tsx` → `/services/clear-aligners-garia`
- `src/pages/seo/PainlessRootCanal.tsx` → `/services/painless-root-canal`

Registered as **static routes** in `src/App.tsx` **before** the catch-all `/services/:serviceId`, so they take precedence over the dynamic slug route.

Each page composes the following shared building blocks (extracted into `src/components/seo/` for reuse):

1. `LandingHero` — H1 with location keyword, subhead, primary CTA to `/contact/`, secondary WhatsApp CTA, trust badges (Since 1999, 4.8★, 5000+ patients).
2. `TrustStrip` — icons + short benefit lines (painless, digital, ISO sterilization, EMI).
3. `WhyChooseUs` — 3-column card grid tailored to the treatment.
4. `TreatmentProcess` — 4-step numbered timeline.
5. `BeforeAfterShowcase` (new, shared) — grid of case cards. Each card:
   - Split image (before / after placeholder from `/public/placeholder.svg` with proper `alt`).
   - Label: procedure name + complexity chip ("Moderate", "Complex", "Full-mouth").
   - Short outcome caption.
6. `LocationFAQ` — shadcn `Accordion`. Question text rendered as `<h3>` inside `AccordionTrigger` (targets featured snippets). FAQs are also passed to `SEOHead.faqs` so `FAQPage` JSON-LD is emitted.
7. `StickyMobileCTA` (new, shared) — fixed bottom bar visible under `md`, two buttons: **Book Appointment** (scrolls to contact form / links to `/contact/`) and **WhatsApp Inquiry** (deep-links to `https://wa.me/918961775554?text=...`). Uses `bg-dental-green` per project memory. Desktop hidden.

Each page renders `<SEOHead>` with:
- Unique title (e.g. `"Dental Implants in Kolkata – Painless, Guided & Affordable | Smilz"`).
- Unique 150–160 char description using natural terms ("advanced dental care near Garia metro", "top implantologist in South Kolkata", "painless root canal in Garia").
- `breadcrumbs` (Home → Services → …).
- `service` prop → emits `MedicalProcedure` JSON-LD.
- `faqs` → emits `FAQPage` JSON-LD.

Copy tone: patient-centric, professional, avoids "post-operative sequelae"-style jargon. Uses "gentle", "same-day", "digitally guided", "near Garia metro", "trusted implantologist in South Kolkata".

### 3. Sitemap coverage

Add the three new paths to `STATIC_ROUTES` in `scripts/_routes.mjs` (priority `0.9`, changefreq `monthly`) so `scripts/generate-sitemap.mjs` and `scripts/prerender.mjs` both pick them up on next build. No other sitemap changes — the existing runtime `src/pages/Sitemap.tsx` already covers dynamic services/blog/builder pages, and the build-time XML is already the source of truth for crawlers.

### 4. Files touched

New:
- `src/pages/seo/DentalImplantsKolkataService.tsx`
- `src/pages/seo/ClearAlignersGaria.tsx`
- `src/pages/seo/PainlessRootCanal.tsx`
- `src/components/seo/LandingHero.tsx`
- `src/components/seo/BeforeAfterShowcase.tsx`
- `src/components/seo/StickyMobileCTA.tsx`
- `src/components/seo/LocationFAQ.tsx`

Edited:
- `src/App.tsx` — add 3 routes above `/services/:serviceId`.
- `src/pages/Home.tsx` — hardcode the requested H1/title override.
- `scripts/_routes.mjs` — add 3 static entries.
- Alt-text updates across the audit list above.

## Out of scope

- No changes to `SEOHead.tsx` internals, `canonicalUrl.ts`, `HelmetProvider` wiring, or the sitemap generator — they already meet the brief.
- No new dependencies. Uses existing shadcn `Accordion`, Tailwind, lucide icons, and current design tokens (Navy `#1A365D`, Gold, `bg-dental-green`).
- No admin/CMS changes; the three landings are code-owned for guaranteed prerender.
