# Hub-and-Spoke Local SEO — Revised Plan

Refactor the (intent × area) flat matrix into a **6-hub** architecture with **tier-filtered intent generation**, **automated hub↔spoke internal linking**, and a **footer-only navigation model** (no header menu changes — all spokes are reached via the 6 hub pages, which are themselves reached via a single "Areas We Serve" dropdown in the footer). All writes target the existing external Supabase project (`eukymrxxmvkchxfpjjuz`) — not Lovable Cloud.

---

## 1. Config refactor — `scripts/location-pages.config.mjs`

### 1a. New `HUBS` export — the 6 Master Hubs

```text
garia-core         → Garia & Core South        (slug: dentist-in-garia-core)
metro-corridor     → Metro Corridor            (slug: dentist-in-metro-corridor)
em-bypass-east     → EM Bypass & East          (slug: dentist-in-em-bypass-east)
central-south      → Central South             (slug: dentist-in-central-south)
southern-urban     → Southern Urban            (slug: dentist-in-southern-urban)
behala-west        → Behala / West             (slug: dentist-in-behala-west)
```

Shape: `{ key, name, slug, tagline, parentDescription, transitNote, neighborhoods: [areaKey...] }`.

### 1b. Extend every `AREAS` entry

Add: `parentHub`, `tier: "core" | "specialized"`, and a per-area `transitNote` (e.g. *"15 min via Metro to Kavi Subhash Station, then 5 min auto"*).

| Hub | Tier | Neighborhoods |
|---|---|---|
| garia-core | core | garia, garia-park, garia-buddha-mandir, near-andrews-college, narendrapur, sonarpur, baruipur*, kamalgazi*, mahamayatala*, patuli |
| metro-corridor | core | naktala, bansdroni*, kudghat*, tollygunge, haridevpur* |
| em-bypass-east | specialized | em-bypass*, ajaynagar*, santoshpur*, ruby-park*, anandapur*, kasba* |
| central-south | specialized | jadavpur, prince-anwar-shah-road*, golf-green*, bijoygarh*, salimpur* |
| southern-urban | specialized | dhakuria*, golpark*, gariahat*, ballygunge*, garfa* |
| behala-west | specialized | behala* |

(*= new neighborhoods to add; each gets `landmarks`, `nearby`, `distanceFromClinicKm`, `uniqueIntro`, `uniqueAngle`, `transitNote`.)

### 1c. Extend every `INTENTS` entry

Add `tierRequirement`. The 4 general-dentistry intents become `tierRequirement: "core"` (only generated for core-tier areas). The 5 high-ticket `SERVICES` (RCT, Implants, Braces, Aligners, Smile Designing) generate for **all** areas.

Result: ~17 core areas × 4 intents + 26 areas × 5 services + 6 hub pages ≈ **~204 pages**.

---

## 2. Generator refactor — `scripts/generate-location-pages.mjs`

### 2a. Tier filter

```text
if (area.tier === 'specialized' && intent.tierRequirement !== 'specialized') continue;
```

### 2b. New hub-page builder

Iterate `HUBS` and emit one page per hub (`template_type: "location-hub"`):
- H1: *"Dentist in {Hub Name} — South Kolkata"*
- **"Neighborhoods we serve in {Hub}"** grid → cards linking to each spoke (for specialized-tier areas with no `dentist-in-{area}` page, link to that area's strongest service spoke, e.g. `/dental-implants-in-jadavpur/`).
- **"Treatments we offer across {Hub}"** block → links to `/services/...`.
- JSON-LD: `Dentist`+`LocalBusiness` with `areaServed` = union of all neighborhoods/landmarks in the hub. Breadcrumb: `Home > Areas We Serve > {Hub}`.

### 2c. Spoke pages — automated hub backlink

Inside `buildLayout()` and `buildServiceLayout()`, add a section above the FAQ:

> *"Part of our **{Hub Name}** service area"* — CTA card linking back to `/dentist-in-{hub-slug}/`.

Breadcrumb JSON-LD becomes 3-level: `Home > {Hub Name} > {Spoke Page}`.

### 2d. Sibling-link cluster (replaces current `buildSiblingLinks`)

Currently each spoke links to **all** other areas. New behavior:
- Link only to **same-hub siblings** (max 8) — keeps PageRank concentrated within the hub cluster.
- Plus a single "Explore other areas of South Kolkata →" link to `/dentist-in-{hub}/` of 1–2 adjacent hubs.

### 2e. Transit data + mandatory FAQs

Promote the bus/metro/auto bullets higher in the body. Append two FAQs to every page:
- *"How do I reach Smilz Dental from {area}?"* — uses `transitNote`.
- *"Is there parking at the clinic?"* — fixed answer.

### 2f. Centralized `Dentist`/`LocalBusiness` schema helper

Extract the inlined JSON-LD into one function so address (`21, Garia Park, Kolkata 700084`), `openingHoursSpecification`, geo coords, and `aggregateRating` are byte-identical across all 200+ pages.

### 2g. Routing — no changes

`scripts/_routes.mjs` already pulls every published `page_layouts` row and emits `/{slug}/`. Hubs and spokes auto-flow into prerender + sitemap.

---

## 3. Site navigation — footer-only model

### 3a. Header — **no changes**

The header keeps its existing 6 nav links (Home, Services, About Us, Gallery, Insights, Contact). **No "Areas We Serve" dropdown is added to the header.**

### 3b. Footer — single "Areas We Serve" dropdown with the 6 hubs

The footer already has an `Areas We Serve` `<details>` block (`src/components/Footer.tsx`, lines 188-208) driven by `footer.areas_we_serve` from `site_settings`. Action:

1. **Replace** the current per-neighborhood list with **just the 6 master hubs**:
    ```text
    - Garia & Core South        → /dentist-in-garia-core/
    - Metro Corridor            → /dentist-in-metro-corridor/
    - EM Bypass & East          → /dentist-in-em-bypass-east/
    - Central South             → /dentist-in-central-south/
    - Southern Urban            → /dentist-in-southern-urban/
    - Behala / West             → /dentist-in-behala-west/
    ```
2. Update the `site_settings.footer.areas_we_serve` JSON in Supabase via a one-shot insert/update so the change is CMS-driven (no hardcoding) and admins can edit it later from Admin → Header & Footer.
3. Keep the existing `<details>` collapsible UI as-is — it already renders correctly on desktop and mobile.

### 3c. All other navigation flows through the hubs

- Spoke pages are reachable **only** from their parent hub's "Neighborhoods we serve" grid (and from sibling spokes within the same hub).
- Every hub page links to: its 4–10 spokes, all 5 high-ticket service pages, and the core site pages (Home, Services, About, Contact).
- Every spoke page links **back up** to its hub via the new "Part of our {Hub} service area" block.

This creates a clean two-level crawl tree: **Footer → Hub → Spoke**, with no menu clutter in the header and full SEO authority concentrated on the 6 hubs.

---

## 4. Visible breadcrumbs on rendered pages

`BuiltPage.tsx` already injects `seo.jsonLd` into `<SEOHead>`, so the new 3-level `BreadcrumbList` schema flows through automatically. For the **visible** trail on the page, I'll add a small inline-HTML breadcrumb block at the top of every hub/spoke layout (e.g. `Home › Garia & Core South › Best Dentist in Garia`) — no builder schema change needed.

---

## 5. Execution order (once approved)

1. Edit `scripts/location-pages.config.mjs` — add `HUBS`, extend AREAS (new neighborhoods + `parentHub`/`tier`/`transitNote`), tag INTENTS with `tierRequirement`.
2. Edit `scripts/generate-location-pages.mjs` — tier filter, hub-page builder, hub-backlink section on spokes, sibling-link rewiring (same-hub only), centralized schema helper, transit FAQs, visible breadcrumb block.
3. Update `site_settings.footer.areas_we_serve` in Supabase (single SQL/REST call) to the 6 hub entries.
4. Run `node scripts/generate-location-pages.mjs --dry-run` and report the page count + sample slugs for review.
5. After your "go", run the full upsert (writes to `eukymrxxmvkchxfpjjuz` using `SUPABASE_SERVICE_ROLE_KEY`).
6. Trigger the existing `rebuild-content.yml` GitHub Action so prerender + sitemap + Hostinger deploy pick up the ~200 pages.

---

## Technical details

- **Backend:** External Supabase project `eukymrxxmvkchxfpjjuz` (hardcoded in `generate-location-pages.mjs` and `_routes.mjs`). Lovable Cloud is **not** touched.
- **Idempotency:** existing `findExisting(slug)` + PATCH/POST flow reused — re-runs update rows in place by `page_slug`.
- **Page count delta:** ~12 → ~204 rows in `page_layouts`. Sitemap auto-grows via `_routes.mjs`.
- **No header changes** — `src/components/Header.tsx` is untouched.
- **Footer change is data-only** — no JSX edits needed; the existing `Areas We Serve` `<details>` block in `Footer.tsx` (lines 188-208) already renders whatever is in `footer.areas_we_serve`. We only update the Supabase row.
- **No DB schema migrations** — `page_layouts` columns already cover everything. New `template_type` value: `"location-hub"`.
- **Reserved-slug guard:** `BuiltPage.tsx` `RESERVED_SLUGS` doesn't collide with any new hub or spoke slugs.