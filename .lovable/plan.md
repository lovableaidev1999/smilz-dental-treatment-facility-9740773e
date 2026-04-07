

## Why PageSpeed Is Low (68 on Mobile)

The PageSpeed report reveals these bottlenecks:

| Issue | Impact | Root Cause |
|-------|--------|------------|
| **LCP 8.5s** (red) | Biggest problem | Hero image (`hero-dental.jpg`) is imported via JS module, so it can't start loading until React boots. On slow 4G, this chain is: HTML → JS bundle → React render → image request. |
| **FCP 2.6s** (orange) | Slow first paint | CSS is inlined (good), but the app still needs the full JS bundle to render anything — there's no static HTML content. Google Fonts loaded via JS (`FontApplier`) adds another network hop. |
| **Image delivery** (1,568 KiB savings) | Large unoptimized images | `doctor.jpg` and `hero-dental.jpg` are bundled as full-resolution JPEGs with no WebP/AVIF conversion or responsive `srcset`. |
| **Framer Motion** on homepage | Blocks LCP | The hero section wraps content in `motion.div` with `initial={{ opacity: 0 }}`, meaning the LCP element starts invisible and fades in — Lighthouse counts the animation delay. |
| **Cache lifetimes** (1,163 KiB) | Repeat visit penalty | Hostinger likely serves assets without long-lived `Cache-Control` headers. |
| **Unused JS** (68 KiB) | Minor | Some tree-shaking opportunities in vendor chunks. |
| **Forced reflow** | Minor | Likely from `useIsMobile` or dynamic font application on mount. |

## Plan to Fix (Target: 85+ Mobile Performance)

### 1. Move hero + doctor images to `/public` with WebP versions
- Convert `hero-dental.jpg` and `doctor.jpg` to optimized WebP (quality 80, max 1200px wide for hero, 800px for doctor)
- Place in `public/images/` so they're directly addressable URLs
- Add `<link rel="preload">` in `index.html` for the hero image (using the final public path, not a Vite-hashed path)
- Update `Home.tsx` to reference `/images/hero-dental.webp` directly instead of importing

### 2. Add responsive `srcset` to hero image
- Provide 2 sizes: 600w (mobile) and 1200w (desktop)
- Use `sizes="100vw"` so the browser picks the right one
- This alone should cut ~1MB on mobile

### 3. Remove Framer Motion from hero section
- Replace `motion.div` with a plain `div` using CSS `animate-fade-up` class (already exists in the project)
- Keep Framer Motion for below-the-fold sections (about, reviews) — those don't affect LCP
- This eliminates the opacity:0 → 1 delay that Lighthouse penalizes

### 4. Preload Google Fonts properly
- The `FontApplier` component loads fonts via JS after React mounts — too late
- Move the font `<link>` to `index.html` `<head>` with `rel="preload"` (already partially there, but the JS-based `FontApplier` overrides it)
- Make `FontApplier` only apply the CSS variable, not re-create the link tag if the font is already Poppins

### 5. Add lazy loading for below-fold images
- `doctor.jpg` in the About section already has `loading="lazy"` (good)
- Service card images have `loading="lazy"` (good)
- Ensure review slider and other sections don't trigger unnecessary network requests on initial load

### 6. Improve cache headers via `.htaccess`
- Add `Cache-Control` headers for static assets (JS, CSS, images, fonts): `max-age=31536000, immutable` for hashed assets
- Add `Cache-Control: max-age=3600` for `index.html`

### Technical Details

**Files to modify:**
- `index.html` — add hero image `<link rel="preload">`, ensure font preload stays
- `src/pages/Home.tsx` — replace `motion.div` in hero with CSS animation, use public image paths with `srcset`
- `public/.htaccess` — add cache headers
- `vite.config.ts` — no changes needed (CSS inlining stays)

**New files:**
- `public/images/hero-dental.webp` (optimized, 1200px)
- `public/images/hero-dental-600.webp` (optimized, 600px mobile)
- `public/images/doctor.webp` (optimized, 800px)

**No breaking changes** — all visual layout, responsive behavior, and functionality remain identical. Only the delivery mechanism for above-the-fold assets changes.

