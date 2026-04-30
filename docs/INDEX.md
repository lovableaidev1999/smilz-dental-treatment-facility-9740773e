# Documentation Index

A central index of all Markdown documentation in this repository. Use this as the entry point when looking for project guides, technical references, or operational notes.

---

## 📌 Project Overview

- **[`README.md`](../README.md)** — Project README.
  Explains the **dual-backend Supabase setup**: the real database
  (`eukymrxxmvkchxfpjjuz`) used at runtime via hardcoded credentials in
  `src/integrations/supabase/client.ts`, vs. the empty Lovable Cloud project
  (`wleqgpofmfefvvksxkea`) that owns `.env` and the agent's DB tools. Read
  this **before** touching anything Supabase, `.env`, or DB-related.

---

## 🚚 Migration & Workspace

- **[`MoveWorkSpace.md`](../MoveWorkSpace.md)** — Step-by-step guide for
  migrating the project to a **fresh Lovable workspace without enabling
  Lovable Cloud**, so the external Supabase connects cleanly through the
  official Supabase integration. Includes pre-flight checklist, phased
  to-do list, the exact prompt to paste into the new project, rollback
  plan, and the list of things that will re-break the setup.

---

## 🛠️ Technical / Engineering Docs

- **[`docs/SEO-RENDERING.md`](./SEO-RENDERING.md)** — Details the
  **Puppeteer-based prerendering strategy** and the `_routes.mjs`
  pipeline used to make the React SPA crawlable by search engines.
  Covers how `scripts/prerender.mjs`, `scripts/generate-sitemap.mjs`,
  and `_routes.mjs` stay in sync so prerender output, sitemap, and
  robots.txt never drift.

- **[`docs/LOCATION-PAGES.md`](./LOCATION-PAGES.md)** — Documentation
  for the **hyperlocal SEO landing page generator**
  (`scripts/generate-location-pages.mjs`). Explains the
  `(intent × area)` matrix in `scripts/location-pages.config.mjs`,
  how pages are upserted into `page_layouts`, the URL pattern
  (e.g. `/best-dentist-in-garia/`), per-page overrides, and how
  generated pages flow through prerender + sitemap automatically.

---

## 🧭 Planning & Working Notes

- **[`.lovable/plan.md`](../.lovable/plan.md)** — Active implementation
  plan for the most recent feature work. Currently documents the
  CMS-editable `<PageHero />` rollout on the **Referral page**
  (`/referral`), wiring it through `usePageContent("referral")` and the
  shared `<PageHero />` component, mirroring the Gallery page pattern.

---

## 📂 This File

- **[`docs/INDEX.md`](./INDEX.md)** — You are here. The catalog of all
  Markdown documentation in the repo. Update this file whenever a new
  `.md` is added or an existing one is renamed/removed.
