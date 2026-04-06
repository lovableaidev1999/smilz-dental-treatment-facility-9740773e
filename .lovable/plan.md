

## Performance Optimization — Implementation Plan

### Overview
Optimize the site's PageSpeed score by reducing JS bundle size on the critical path, fixing data-fetching inefficiencies, and moving images out of the JS bundle. The key constraint is that **no images must break** — all existing image references will be preserved with correct paths.

### Steps

#### 1. Move hero images to `/public/images/` (keep originals as fallback)
- Copy `src/assets/hero-dental.jpg` and `src/assets/doctor.jpg` to `public/images/`
- Keep `src/assets/logo.webp` as-is (small file, used in Header)
- Update `Home.tsx` and `About.tsx` to use string paths (`"/images/hero-dental.jpg"`, `"/images/doctor.jpg"`) instead of ES imports
- Update `index.html` preload to `href="/images/hero-dental.jpg"`
- **Safety**: The `src/assets/` originals stay in place so no other references break; only the imports in Home/About change

#### 2. Replace framer-motion with CSS animations on public pages
- **Home.tsx**: Replace `motion.div` in hero (line 85) with a plain `<div className="animate-fade-up">`, and in about section (lines 147-164) with `<div className="animate-fade-up">`
- **About.tsx**: Replace `motion.div` wrappers with CSS animation classes
- Remove `import { motion } from "framer-motion"` from both files
- Remove unused `fadeUp` constant from Home.tsx
- framer-motion remains in the `motion` chunk for admin/builder use but won't load on public pages

#### 3. Fix usePageContent caching & remove realtime on public pages
- In `usePageContent.tsx`: Change `staleTime: 0` → `5 * 60 * 1000`, remove `refetchOnMount: "always"` and `refetchOnWindowFocus: true`
- Remove the entire `useEffect` block that creates a Supabase realtime channel (lines 46-67) — this is only useful for admin live editing, not public visitors
- The admin pages that need live updates already have their own mechanisms

#### 4. Fix useSiteSettings caching & remove realtime on public pages
- Same treatment: `staleTime: 0` → `5 * 60 * 1000`, remove `refetchOnMount: "always"` and `refetchOnWindowFocus: true`
- Remove the realtime subscription `useEffect` (lines 136-156)
- Keep `useUpdateSetting` mutation's `onSuccess` invalidation for admin usage

#### 5. Prefetch site_settings in Layout
- In `Layout.tsx`, call `useSiteSettings()` so the query starts fetching as soon as the layout mounts, before child pages need it
- This eliminates the waterfall where Header, Home, Footer all independently trigger the same query

#### 6. Optimize Vite chunking — isolate admin-only deps
- In `vite.config.ts`, add an `admin` manual chunk containing heavy admin-only libraries: `@tiptap/*`, `@dnd-kit/*`, `recharts`, `react-markdown`
- This ensures these libraries are never accidentally pulled into public page bundles

#### 7. Verify after changes
- Use browser tools to check the homepage loads correctly with all images visible
- Run a performance profile to measure improvement

### Files to modify
| File | Change |
|------|--------|
| `public/images/` | Copy hero-dental.jpg and doctor.jpg here |
| `src/pages/Home.tsx` | Replace framer-motion with CSS classes, use static image paths |
| `src/pages/About.tsx` | Replace framer-motion with CSS classes, use static image path |
| `src/hooks/usePageContent.tsx` | Fix caching, remove realtime subscription |
| `src/hooks/useSiteSettings.tsx` | Fix caching, remove realtime subscription |
| `src/components/Layout.tsx` | Add useSiteSettings() prefetch call |
| `vite.config.ts` | Add admin chunk for TipTap/dnd-kit/recharts |
| `index.html` | Update preload path to `/images/hero-dental.jpg` |

### Risk mitigation
- Original `src/assets/` files are NOT deleted — only the imports in Home.tsx and About.tsx change to use `/public/images/` paths
- `logo.webp` stays imported as-is in Header (it's small)
- All other image references throughout the app remain unchanged

