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

async function fetchDynamicRoutes(page) {
  // Fetch service slugs
  const serviceRoutes = [];
  const blogRoutes = [];

  try {
    // Navigate to a page that loads services data, or fetch directly from Supabase
    // We'll use the Supabase REST API directly
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      // Fetch services
      const servicesResp = await fetch(
        `${supabaseUrl}/rest/v1/services?select=slug&is_active=eq.true`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (servicesResp.ok) {
        const services = await servicesResp.json();
        services.forEach((s) => serviceRoutes.push(`/services/${s.slug}`));
      }

      // Fetch blog posts
      const blogResp = await fetch(
        `${supabaseUrl}/rest/v1/blog_posts?select=slug&is_published=eq.true`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (blogResp.ok) {
        const posts = await blogResp.json();
        posts.forEach((p) => blogRoutes.push(`/blog/${p.slug}`));
      }
    }
  } catch (err) {
    console.warn("[prerender] Could not fetch dynamic routes:", err.message);
  }

  return [...serviceRoutes, ...blogRoutes];
}

async function prerender() {
  const server = await startServer();

  // Dynamic import puppeteer
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Get dynamic routes
  const dynamicRoutes = await fetchDynamicRoutes(page);
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

  console.log(`[prerender] Prerendering ${allRoutes.length} routes...`);

  for (const route of allRoutes) {
    if (SKIP_PREFIXES.some((p) => route.startsWith(p))) continue;

    try {
      const url = `http://localhost:${PORT}${route}`;
      console.log(`[prerender] → ${route}`);

      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait for React to render
      await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {});

      // Remove scripts that shouldn't be in prerendered output
      // Keep the module script for hydration
      const html = await page.content();

      // Write to dist
      const filePath = route === "/"
        ? join(DIST, "index.html")
        : join(DIST, route, "index.html");

      const dir = dirname(filePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      writeFileSync(filePath, `<!DOCTYPE html>${html.replace(/^<!DOCTYPE html>/i, "")}`);
    } catch (err) {
      console.warn(`[prerender] ✗ Failed ${route}: ${err.message}`);
    }
  }

  await browser.close();
  server.close();
  console.log(`[prerender] ✓ Done! Prerendered ${allRoutes.length} routes.`);
}

prerender().catch((err) => {
  console.error("[prerender] Fatal error:", err);
  process.exit(1);
});
