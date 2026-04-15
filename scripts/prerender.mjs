/**
 * Post-build prerendering script.
 * Spins up a local server for the dist/ folder, visits each public route
 * with Puppeteer, and writes the fully-rendered HTML back to dist/.
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
  };

  const server = createServer((req, res) => {
    let filePath = join(DIST, req.url === "/" ? "/index.html" : req.url);
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
 * Uses multiple strategies to detect content readiness.
 */
async function waitForContent(page, route) {
  // Strategy 1: Wait for network to settle (API calls to Supabase)
  await page.goto(`http://localhost:${PORT}${route}`, {
    waitUntil: "networkidle0",
    timeout: 45000,
  });

  // Strategy 2: Wait for React to finish rendering — either:
  //   a) Skeletons disappear AND h1 has text, OR
  //   b) #root has substantial content (>500 chars of inner HTML)
  const contentReady = await page.waitForFunction(() => {
    const root = document.querySelector('#root');
    if (!root) return false;
    const rootLen = root.innerHTML.length;
    const skeletons = document.querySelectorAll('.animate-pulse');
    const h1 = document.querySelector('h1');

    // Condition A: No skeletons + h1 with text
    const condA = skeletons.length === 0 && h1 && h1.textContent.trim().length > 0;
    // Condition B: Substantial content rendered (covers pages without h1 initially)
    const condB = skeletons.length === 0 && rootLen > 2000;

    return condA || condB;
  }, { timeout: 25000 }).then(() => true).catch(() => false);

  if (!contentReady) {
    console.warn(`[prerender] ⚠ Content not fully ready for ${route} — capturing anyway`);
  }

  // Strategy 3: Wait for react-helmet-async to inject proper <title>
  await page.waitForFunction(() => {
    const title = document.querySelector('title');
    return title && title.textContent && !title.textContent.includes('Vite');
  }, { timeout: 8000 }).catch(() => {
    console.warn(`[prerender] ⚠ Helmet title not detected for ${route}`);
  });

  // Extra settle time for any final state updates
  await new Promise((r) => setTimeout(r, 1000));
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

  // Expose console logs from the page for debugging
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

      // Capture full HTML (includes <head> with meta tags, JSON-LD, etc.)
      const html = await page.content();

      // Verify content quality
      const h1Text = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent.trim() : '';
      });
      const rootLength = await page.evaluate(() => {
        const root = document.querySelector('#root');
        return root ? root.innerHTML.length : 0;
      });
      const hasJsonLd = html.includes('application/ld+json');
      const hasSkeletons = html.includes('animate-pulse');
      const contentLength = html.length;

      if (hasSkeletons) {
        console.warn(`[prerender] ⚠ ${route} — HTML still contains skeleton loaders!`);
      }
      if (!h1Text) {
        console.warn(`[prerender] ⚠ ${route} — No h1 text found`);
      }
      if (rootLength < 500) {
        console.warn(`[prerender] ⚠ ${route} — #root content very short (${rootLength} chars) — may be empty!`);
      }
      if (contentLength < 1000) {
        console.warn(`[prerender] ⚠ ${route} — Suspiciously short HTML (${contentLength} chars)`);
      }

      // Write the full document to dist/
      const filePath = route === "/"
        ? join(DIST, "index.html")
        : join(DIST, route, "index.html");

      const dir = dirname(filePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      const finalHtml = `<!DOCTYPE html>${html.replace(/^<!DOCTYPE html>/i, "")}`;
      writeFileSync(filePath, finalHtml);

      console.log(
        `[prerender] ✅ ${route} — h1: "${h1Text.slice(0, 50)}" | root: ${rootLength} chars | JSON-LD: ${hasJsonLd ? 'yes' : 'no'} | total: ${contentLength} chars`
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
