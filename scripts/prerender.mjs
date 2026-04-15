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

async function prerender() {
  const server = await startServer();

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

  console.log(`[prerender] Prerendering ${allRoutes.length} routes...`);

  let successCount = 0;
  let failCount = 0;

  for (const route of allRoutes) {
    if (SKIP_PREFIXES.some((p) => route.startsWith(p))) continue;

    try {
      const url = `http://localhost:${PORT}${route}`;
      console.log(`[prerender] → ${route}`);

      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // 1. Wait for loading skeletons to disappear and real content to appear
      await page.waitForFunction(() => {
        const skeletons = document.querySelectorAll('.animate-pulse');
        const h1 = document.querySelector('h1');
        return skeletons.length === 0 && h1 && h1.textContent.trim().length > 0;
      }, { timeout: 15000 }).catch(() => {
        console.warn(`[prerender] ⚠ Skeletons may still be present for ${route}`);
      });

      // 2. Wait for react-helmet-async to inject proper <title>
      await page.waitForFunction(() => {
        const title = document.querySelector('title');
        return title && title.textContent && !title.textContent.includes('Vite');
      }, { timeout: 5000 }).catch(() => {
        console.warn(`[prerender] ⚠ Helmet title not detected for ${route}`);
      });

      // 3. Small extra delay for any final renders
      await new Promise((r) => setTimeout(r, 500));

      // 4. Capture full HTML (includes <head> with meta tags, JSON-LD, etc.)
      const html = await page.content();

      // 5. Verify content quality
      const h1Text = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent.trim() : '';
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
      if (contentLength < 1000) {
        console.warn(`[prerender] ⚠ ${route} — Suspiciously short HTML (${contentLength} chars)`);
      }

      // 6. Write the full document to dist/
      const filePath = route === "/"
        ? join(DIST, "index.html")
        : join(DIST, route, "index.html");

      const dir = dirname(filePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      const finalHtml = `<!DOCTYPE html>${html.replace(/^<!DOCTYPE html>/i, "")}`;
      writeFileSync(filePath, finalHtml);

      console.log(
        `[prerender] ✅ ${route} — h1: "${h1Text.slice(0, 50)}" | JSON-LD: ${hasJsonLd ? 'yes' : 'no'} | ${contentLength} chars`
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
