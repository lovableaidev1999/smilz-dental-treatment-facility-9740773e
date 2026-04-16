/**
 * Post-build prerendering script.
 * Spins up a local server for the dist/ folder, visits each public route
 * with Puppeteer, and writes the fully-rendered HTML back to dist/.
 *
 * Hardened to:
 *   - guarantee a complete <head> (title, meta, canonical, OG, JSON-LD)
 *   - strip framer-motion `opacity:0` / `transform` inline styles so bots see content
 *   - wait for real content (skeletons gone, h1 present, OR data-prerender-ready)
 *   - fall back gracefully when networkidle never fires
 *
 * Usage: node scripts/prerender.mjs
 */
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = 4173;

// Static routes to prerender
const STATIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/gallery",
  "/blog",
  // SEO landing pages
  "/dentist-in-kolkata",
  "/dental-clinic-in-garia-kolkata",
  "/root-canal-treatment-kolkata",
  "/dental-implants-kolkata",
  "/braces-aligners-kolkata",
];

// Routes to SKIP (admin, referral, etc.)
const SKIP_PREFIXES = ["/admin", "/login", "/referral", "/preview"];

/**
 * Serve the dist folder as a static SPA server (fallback to index.html).
 */
function startServer() {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
    ".xml": "application/xml",
  };

  const server = createServer((req, res) => {
    let filePath = join(DIST, req.url === "/" ? "/index.html" : req.url.split("?")[0]);
    // Don't override the real sitemap.xml with index.html
    if (filePath.endsWith("/")) filePath = join(filePath, "index.html");
    if (!existsSync(filePath) || !filePath.includes(".")) {
      filePath = join(DIST, "index.html");
    }
    const ext = "." + filePath.split(".").pop();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[prerender] Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function fetchDynamicRoutes() {
  const serviceRoutes = [];
  const blogRoutes = [];

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

      const servicesResp = await fetch(
        `${supabaseUrl}/rest/v1/services?select=slug&is_active=eq.true`,
        { headers }
      );
      if (servicesResp.ok) {
        const services = await servicesResp.json();
        services.forEach((s) => serviceRoutes.push(`/services/${s.slug}`));
      }

      const blogResp = await fetch(
        `${supabaseUrl}/rest/v1/blog_posts?select=slug&is_published=eq.true`,
        { headers }
      );
      if (blogResp.ok) {
        const posts = await blogResp.json();
        posts.forEach((p) => blogRoutes.push(`/blog/${p.slug}`));
      }
    } else {
      console.warn("[prerender] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — skipping dynamic routes");
    }
  } catch (err) {
    console.warn("[prerender] Could not fetch dynamic routes:", err.message);
  }

  return [...serviceRoutes, ...blogRoutes];
}

/**
 * Wait for the page to be fully rendered with actual content.
 */
async function waitForContent(page, route) {
  // Use domcontentloaded first (more forgiving) then poll for real content.
  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
  } catch (err) {
    console.warn(`[prerender] networkidle2 timeout for ${route}: ${err.message} — continuing`);
  }

  // Wait for content readiness:
  //   a) explicit data-prerender-ready attribute, OR
  //   b) skeletons gone AND h1 has text, OR
  //   c) substantial #root content (>2000 chars)
  await page.waitForFunction(() => {
    if (document.querySelector('[data-prerender-ready="true"]')) return true;
    const root = document.querySelector('#root');
    if (!root) return false;
    const skeletons = document.querySelectorAll('.animate-pulse');
    const h1 = document.querySelector('h1');
    const hasH1 = h1 && h1.textContent.trim().length > 0;
    if (skeletons.length === 0 && hasH1) return true;
    if (skeletons.length === 0 && root.innerHTML.length > 2000) return true;
    return false;
  }, { timeout: 30000 }).catch(() => {
    console.warn(`[prerender] ⚠ Content readiness timeout for ${route} — capturing anyway`);
  });

  // Wait for react-helmet-async to inject the real <title>
  await page.waitForFunction(() => {
    const t = document.querySelector('title');
    return t && t.textContent && t.textContent.trim().length > 0
      && !/^(Vite|Smilz Dental Treatment Facility)$/.test(t.textContent.trim());
  }, { timeout: 8000 }).catch(() => {
    console.warn(`[prerender] ⚠ Helmet title not detected for ${route} — using existing title`);
  });

  // Final settle
  await new Promise((r) => setTimeout(r, 1200));
}

/**
 * Strip framer-motion invisible inline styles so bots see content.
 * Removes opacity:0 and transform translate values from inline `style` attrs.
 */
function makeContentVisible(html) {
  return html
    // Remove opacity:0 (with any whitespace/quoting variation)
    .replace(/opacity\s*:\s*0\s*;?/gi, '')
    // Remove inline transforms used by framer-motion (translateX/Y values)
    .replace(/transform\s*:\s*translate[XY]?\([^)]*\)\s*;?/gi, '')
    // Clean up empty style attributes left behind
    .replace(/\sstyle=""/gi, '')
    .replace(/\sstyle="\s*"/gi, '');
}

async function prerender() {
  const server = await startServer();

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // Block heavy third-party requests that delay networkidle
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (/google-analytics|googletagmanager|ahrefs|facebook|hotjar|clarity|youtube\.com\/embed|google\.com\/maps\/embed/i.test(url)) {
      return req.abort();
    }
    req.continue();
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[prerender:page-error] ${msg.text()}`);
    }
  });

  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

  console.log(`[prerender] Prerendering ${allRoutes.length} routes...`);

  let successCount = 0;
  let failCount = 0;

  for (const route of allRoutes) {
    if (SKIP_PREFIXES.some((p) => route.startsWith(p))) continue;

    try {
      console.log(`[prerender] → ${route}`);

      await waitForContent(page, route);

      // Capture full document. Reconstruct from doctype + outerHTML to GUARANTEE <head> survives.
      const fullHtml = await page.evaluate(() => {
        return '<!DOCTYPE html>' + document.documentElement.outerHTML;
      });

      // Quality checks
      const headInfo = await page.evaluate(() => {
        const title = document.querySelector('title')?.textContent || '';
        const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
        const h1 = document.querySelector('h1')?.textContent?.trim() || '';
        const rootLen = document.querySelector('#root')?.innerHTML.length || 0;
        const jsonLd = document.querySelectorAll('script[type="application/ld+json"]').length;
        return { title, desc, canonical, h1, rootLen, jsonLd };
      });

      if (!headInfo.title) console.warn(`[prerender] ⚠ ${route} — missing <title>`);
      if (!headInfo.desc) console.warn(`[prerender] ⚠ ${route} — missing meta description`);
      if (!headInfo.canonical) console.warn(`[prerender] ⚠ ${route} — missing canonical`);
      if (!headInfo.h1) console.warn(`[prerender] ⚠ ${route} — no h1 text`);
      if (headInfo.rootLen < 500) console.warn(`[prerender] ⚠ ${route} — root very short (${headInfo.rootLen})`);
      if (fullHtml.includes('animate-pulse')) console.warn(`[prerender] ⚠ ${route} — skeleton loaders still present`);

      // Strip invisible framer-motion inline styles
      const visibleHtml = makeContentVisible(fullHtml);

      // Write to dist/
      const filePath = route === "/"
        ? join(DIST, "index.html")
        : join(DIST, route, "index.html");

      const dir = dirname(filePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, visibleHtml);

      console.log(
        `[prerender] ✅ ${route} — title:"${headInfo.title.slice(0, 40)}" h1:"${headInfo.h1.slice(0, 40)}" root:${headInfo.rootLen} jsonLd:${headInfo.jsonLd} html:${visibleHtml.length}`
      );
      successCount++;
    } catch (err) {
      console.error(`[prerender] ❌ Failed ${route}: ${err.message}`);
      failCount++;
    }
  }

  await browser.close();
  server.close();
  console.log(`[prerender] ✓ Done! ${successCount} succeeded, ${failCount} failed out of ${allRoutes.length} routes.`);

  if (failCount > 0) {
    console.warn(`[prerender] ⚠ ${failCount} routes failed — check logs above.`);
  }
}

prerender().catch((err) => {
  console.error("[prerender] Fatal error:", err);
  process.exit(1);
});
