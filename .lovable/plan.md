

## Diagnosis: Prerendering is NOT Working

I fetched the live HTML from smilz.net and confirmed that **all pages are serving loading skeletons instead of actual content**. Here's what Google sees:

- **Service pages**: Empty skeleton divs with `animate-pulse` classes -- no titles, no text, no FAQs
- **Blog pages**: Same -- skeleton cards with no actual blog post content
- **Homepage**: Appears to have similar issues

**Root Cause**: The Puppeteer prerender script waits for `networkidle0` and an `h1` selector, but the React components show loading skeletons while asynchronously fetching data from Supabase. By the time Puppeteer captures the HTML, it gets the skeleton state, not the fully-rendered content.

There are also structural problems:
1. **`puppeteer` is a regular dependency** (should be devDependency) -- it's being bundled into the frontend build unnecessarily
2. The `<head>` tag and all `<meta>` / `<title>` tags injected by `react-helmet-async` are being **stripped** because the script only writes `<body>` content
3. No verification that content actually loaded before capturing

## Plan

### 1. Fix the prerender script to wait for actual content

Replace the naive `waitForSelector("h1")` with proper content-readiness detection:
- Wait for loading skeletons to disappear (no `animate-pulse` elements)
- Wait for actual text content in the main area
- Add a fallback timeout with explicit warning if content never loads
- Preserve the full HTML document including `<head>` (SEO meta tags, JSON-LD schemas)

### 2. Move puppeteer to devDependencies

Move `puppeteer` from `dependencies` to `devDependencies` so it doesn't bloat the frontend bundle.

### 3. Add content verification logging

After capturing each page, log whether actual content was found (e.g., check for `h1` text, paragraph text) to catch failures early in CI.

### 4. Ensure `<head>` preservation

The current script writes `page.content()` which includes the full document, but the `<head>` from the Vite build gets replaced by Puppeteer's version. Ensure react-helmet-async's injected `<title>`, `<meta>`, and `<script type="application/ld+json">` tags are preserved in the output.

### Technical Details

**Key change in `scripts/prerender.mjs`**:
```javascript
// Instead of just waiting for h1:
await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

// Wait for skeletons to disappear (data loaded)
await page.waitForFunction(() => {
  const skeletons = document.querySelectorAll('.animate-pulse');
  const h1 = document.querySelector('h1');
  return skeletons.length === 0 && h1 && h1.textContent.trim().length > 0;
}, { timeout: 15000 }).catch(() => {
  console.warn(`[prerender] ⚠ Content may not have fully loaded for ${route}`);
});

// Additional wait for Helmet to inject meta tags
await page.waitForFunction(() => {
  const title = document.querySelector('title');
  return title && title.textContent && !title.textContent.includes('Vite');
}, { timeout: 5000 }).catch(() => {});
```

**Files to modify**:
- `scripts/prerender.mjs` -- fix wait logic, add content verification
- `package.json` -- move puppeteer to devDependencies

**No changes to any UI components, routing, auth, admin, or referral systems.**

