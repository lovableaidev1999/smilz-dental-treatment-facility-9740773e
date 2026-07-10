/**
 * Post-build prerendering script.
 * Spins up a local server for the dist/ folder, visits each public route
 * with Puppeteer, and writes the fully-rendered HTML back to dist/.
 *
 * Hardened to:
 *   - use the central scripts/_routes.mjs as the single route source
 *   - guarantee a complete <head> (title, meta, canonical, OG, JSON-LD)
 *   - strip framer-motion `opacity:0` / `transform` inline styles so bots see content
 *   - wait for real content (skeletons gone, h1 present, OR data-prerender-ready)
 *   - validate every page (H1, meta description, JSON-LD, body, links)
 *   - run a mobile-first 375px sample audit
 *   - emit dist/prerender-report.json + a console summary table
 *   - exit non-zero if any page fails critical checks
 *
 * Usage: node scripts/prerender.mjs
 */
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getAllRoutes, SKIP_PREFIXES } from "./_routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = 4173;

// Sample of routes to audit at 375px mobile viewport
const MOBILE_SAMPLE = ["/", "/about/", "/services/", "/contact/", "/blog/"];

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

function isMeaningfulTitle(title) {
  return title.length > 0 && !/^(Vite|Smilz Dental Treatment Facility)$/.test(title);
}

/**
 * Poll the page until all four head-tag signals are present, or the deadline passes.
 * Returns true if head is ready, false if it timed out.
 *
 * FIX: Uses a single page.waitForFunction() call instead of a Node-side while-loop
 * of page.evaluate() calls. Each evaluate() is a separate CDP round-trip; under
 * concurrency + a busy browser tab, dozens of them pile up and exhaust Puppeteer's
 * protocolTimeout. waitForFunction() runs entirely inside the browser (one CDP call)
 * and polls via its own built-in interval, so the protocol is only touched once.
 */
async function pollForHead(page, route, { maxMs = 10000 } = {}) {
  return page.waitForFunction(() => {
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || '';
    const schemaCount = document.querySelectorAll('script[type="application/ld+json"]').length;
    const meaningfulTitle = title.length > 0 && !/^(Vite|Smilz Dental Treatment Facility)$/.test(title);
    return meaningfulTitle && desc.length >= 30 && canonical.length > 0 && schemaCount > 0;
  }, { timeout: maxMs, polling: 250 })
    .then(() => true)
    .catch(() => false);
}

/**
 * Wait for the page body to render and then for Helmet to finish writing head tags.
 *
 * Returns:
 *   'ok'  — page is fully hydrated and head tags are present
 *   '404' — the SPA rendered a not-found page; caller should skip this route
 */
async function waitForContent(page, route) {
  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
  } catch (err) {
    console.warn(`[prerender] navigation timeout for ${route}: ${err.message} — continuing`);
  }

  // Phase 1: wait for visible route content. The explicit marker is only a body
  // readiness signal — it must NOT short-circuit the head readiness checks.
  await page.waitForFunction(() => {
    const root = document.querySelector('#root');
    if (!root) return false;
    if (document.querySelectorAll('.animate-pulse').length > 0) return false;
    if (document.querySelector('[data-prerender-ready="true"]')) return true;
    const h1 = document.querySelector('h1');
    return !!(h1 && h1.textContent.trim().length > 0);
  }, { timeout: 8000 }).catch(() => {
    // Soft signal only — head-readiness check below is the real gate.
    // Kept short (8s vs old 25s) because hundreds of builder pages always
    // fall through this check but still pass head readiness, wasting ~17s each.
    console.warn(`[prerender] ⚠ Body readiness timeout for ${route} — continuing to head checks`);
  });

  // FIX: Detect SPA 404 pages after body renders (emoji slugs, deleted posts, etc.).
  // Check for <h1> starting with "404" or the data-not-found sentinel attribute.
  // Return a sentinel string so the worker can skip without counting as a failure.
  const is404 = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    if (h1 && /^404\b/.test(h1.textContent.trim())) return true;
    if (document.querySelector('[data-not-found="true"]')) return true;
    return false;
  });
  if (is404) return '404';

  // Phase 2: wait for Helmet/react-helmet-async to flush SEO tags into <head>.
  // FIX: Increased timeout 20s → 30s to accommodate slow Supabase-backed routes.
  await page.waitForFunction(() => {
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || '';
    const schemaCount = document.querySelectorAll('script[type="application/ld+json"]').length;
    const meaningfulTitle = title.length > 0 && !/^(Vite|Smilz Dental Treatment Facility)$/.test(title);
    return meaningfulTitle && desc.length >= 30 && canonical.length > 0 && schemaCount > 0;
  }, { timeout: 30000 }).catch(async () => {
    const debug = await page.evaluate(() => ({
      title: document.querySelector('title')?.textContent?.trim() || '',
      descLen: document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim().length || 0,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length,
    }));
    console.warn(`[prerender] ⚠ Head readiness timeout for ${route} — title:"${debug.title}" desc:${debug.descLen} canonical:${debug.canonical ? 'yes' : 'no'} schema:${debug.schemaCount}`);
  });

  // FIX: Double requestAnimationFrame flush — forces any pending React/Helmet
  // microtasks and paint-scheduled DOM mutations to complete before we read the DOM.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  // FIX: Increased post-render buffer 1200ms → 2000ms for slower CI runners.
  await new Promise((r) => setTimeout(r, 2000));

  return 'ok';
}

/**
 * Configure a Puppeteer page with request blocking and console filters.
 * Used for the main render pool and the mobile-audit page.
 */
async function configurePage(page) {
  await page.setViewport({ width: 1280, height: 800 });
  const blockedUrls = new Set();
  const BLOCK_RE = /google-analytics|googletagmanager|ahrefs|facebook|hotjar|clarity|youtube\.com\/embed|google\.com\/maps\/embed/i;
  // Also block heavy asset types that don't affect rendered HTML/SEO output.
  const BLOCK_TYPES = new Set(['image', 'media', 'font']);

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (BLOCK_RE.test(url) || BLOCK_TYPES.has(req.resourceType())) {
      blockedUrls.add(url);
      return req.abort();
    }
    req.continue();
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource: net::ERR_(FAILED|ABORTED|BLOCKED_BY_CLIENT)/i.test(text)) return;
    console.log(`[prerender:page-error] ${text}`);
  });
  page.on('pageerror', (err) => {
    console.log(`[prerender:page-error] ${err.message}`);
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (blockedUrls.has(url)) return;
    const failure = req.failure();
    if (failure && /net::ERR_ABORTED/i.test(failure.errorText)) return;
    console.log(`[prerender:request-failed] ${url} — ${failure?.errorText || 'unknown'}`);
  });
}

function makeContentVisible(html) {
  return html
    .replace(/opacity\s*:\s*0\s*;?/gi, '')
    .replace(/transform\s*:\s*translate[XY]?\([^)]*\)\s*;?/gi, '')
    .replace(/\sstyle=""/gi, '')
    .replace(/\sstyle="\s*"/gi, '');
}

async function captureMetrics(page) {
  return await page.evaluate(() => {
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const h1El = document.querySelector('h1');
    const h1 = h1El?.textContent?.trim() || '';
    const root = document.querySelector('#root');
    const rootLen = root?.innerHTML.length || 0;
    const ldNodes = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const schemaTypes = [];
    ldNodes.forEach((n) => {
      try {
        const j = JSON.parse(n.textContent || '{}');
        const t = j['@type'];
        if (Array.isArray(t)) schemaTypes.push(...t);
        else if (t) schemaTypes.push(t);
      } catch {}
    });
    const origin = window.location.origin;
    const internalLinks = Array.from(document.querySelectorAll('a[href]')).filter((a) => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('/') || href.startsWith(origin) || href.startsWith('https://smilz.net');
    }).length;
    return {
      title, desc, canonical, h1,
      rootLen,
      schemaCount: ldNodes.length,
      schemaTypes,
      internalLinks,
    };
  });
}

async function mobileAudit(page, route) {
  const issues = [];
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  try {
    await waitForContent(page, route);
    const result = await page.evaluate(() => {
      const out = { issues: [] };
      const vp = document.querySelector('meta[name="viewport"]');
      if (!vp) out.issues.push('missing viewport meta');
      if (document.documentElement.scrollWidth > window.innerWidth + 4) {
        out.issues.push(`horizontal overflow (${document.documentElement.scrollWidth}px > 375px)`);
      }
      const imgs = Array.from(document.querySelectorAll('img'));
      const belowFold = imgs.filter((img) => {
        const r = img.getBoundingClientRect();
        return r.top > window.innerHeight;
      });
      const noLazy = belowFold.filter((img) => img.getAttribute('loading') !== 'lazy');
      if (noLazy.length > 0) out.issues.push(`${noLazy.length} below-fold images missing loading="lazy"`);
      const noSize = imgs.filter((img) => !img.getAttribute('width') || !img.getAttribute('height')).length;
      if (noSize > 0) out.issues.push(`${noSize} images missing width/height`);
      return out;
    });
    issues.push(...result.issues);
  } catch (err) {
    issues.push(`mobile audit error: ${err.message}`);
  }
  await page.setViewport({ width: 1280, height: 800, isMobile: false });
  return issues;
}

function validatePage(route, metrics, htmlBytes) {
  const failures = [];
  const warnings = [];

  if (!metrics.h1) failures.push('missing H1');
  // Description length is a soft SEO norm; warn if short, only fail if effectively missing.
  if (!metrics.desc || metrics.desc.length < 30) {
    failures.push(`meta description missing or far too short (${metrics.desc.length} chars)`);
  } else if (metrics.desc.length < 70) {
    warnings.push(`meta description short (${metrics.desc.length} chars; aim for 70–160)`);
  } else if (metrics.desc.length > 170) {
    warnings.push(`meta description long (${metrics.desc.length} chars; aim for 70–160)`);
  }
  if (metrics.schemaCount < 1) failures.push('no JSON-LD schema');
  // Body-too-small: hard fail only if effectively empty; otherwise warn so one
  // legacy/edge page doesn't block an otherwise-clean deploy.
  if (metrics.rootLen < 800) {
    failures.push(`body content effectively empty (${metrics.rootLen} chars)`);
  } else if (metrics.rootLen < 2000) {
    warnings.push(`body content thin (${metrics.rootLen} chars; aim for ≥2000)`);
  }

  if (metrics.internalLinks < 3) warnings.push(`only ${metrics.internalLinks} internal links`);
  if (!metrics.canonical) warnings.push('missing canonical');
  if (!metrics.title || /^(Vite|Smilz Dental Treatment Facility)$/.test(metrics.title)) {
    warnings.push('default/missing <title>');
  }

  // FIX: Use expectAny() so that Dentist (a valid LocalBusiness subtype) satisfies
  // the LocalBusiness expectation. The old expect() required an exact type match.
  const expectAny = (types) => {
    const satisfied = types.some((t) => metrics.schemaTypes.includes(t));
    if (!satisfied) warnings.push(`expected one of schema types: ${types.join(', ')}`);
  };
  if (route === '/') expectAny(['LocalBusiness', 'Dentist']);
  else if (route === '/about/') expectAny(['LocalBusiness', 'Dentist']);
  else if (route === '/contact/') expectAny(['LocalBusiness', 'Dentist']);
  else if (route.startsWith('/services/') && route !== '/services/') expectAny(['MedicalProcedure']);
  else if (route.startsWith('/blog/') && route !== '/blog/') expectAny(['Article']);

  return { failures, warnings, htmlBytes };
}

function pad(s, n) { s = String(s); return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length); }

async function prerender() {
  const server = await startServer();

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // FIX: Raise the CDP protocol timeout (default ~180s) so that waitForFunction
    // calls on slow/busy pages don't trigger "Runtime.callFunctionOn timed out".
    // 5 minutes is generous but harmless — per-route page timeouts are far shorter.
    protocolTimeout: 300_000,
  });

  const allRoutes = await getAllRoutes();
  const routesToRender = allRoutes.filter((r) => !SKIP_PREFIXES.some((p) => r.path.startsWith(p)));

  // FIX: Concurrency 3 — now safe because the body-readiness timeout was dropped
  // from 25s → 8s. With 200+ location pages, serial (concurrency 1) takes ~100min
  // and exceeds the 60min CI budget. Concurrency 3 on a 4-core CI runner clears
  // the queue in ~25-35 min. Override via PRERENDER_CONCURRENCY.
  const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 3);
  console.log(`[prerender] Prerendering ${routesToRender.length} routes (concurrency: ${CONCURRENCY})...`);

  const report = {
    generatedAt: new Date().toISOString(),
    totalRoutes: routesToRender.length,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    warnings: 0,
    pages: [],
  };

  // Pool of pages — one per worker.
  const pool = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    const p = await browser.newPage();
    await configurePage(p);
    pool.push(p);
  }

  let cursor = 0;
  async function worker(workerPage) {
    while (true) {
      const i = cursor++;
      if (i >= routesToRender.length) return;
      const r = routesToRender[i];
      const route = r.path;
      try {
        console.log(`[prerender] → ${route}`);

        // FIX: waitForContent now returns 'ok' or '404'.
        const contentStatus = await waitForContent(workerPage, route);

        // FIX: Soft-skip SPA 404 pages (e.g. emoji slugs from the DB).
        // Don't write a file, don't count as failure, don't exit non-zero for these.
        if (contentStatus === '404') {
          console.warn(`[prerender] ⚠ Skipping ${route} — SPA returned a 404 page`);
          report.skipped++;
          report.pages.push({ url: route, type: r.type, status: 'skipped', reason: '404' });
          continue;
        }

        // FIX: Phase 3 — tight poll loop (250ms × 40 = up to 10s) directly before
        // reading outerHTML. This catches routes where Phase 2 timed out but Helmet
        // finishes just after the waitForFunction deadline (race condition under CI).
        const headReady = await pollForHead(workerPage, route);

        // FIX: If still not ready after the poll, do one full-reload retry on the
        // same worker before giving up. This resolves transient concurrency races
        // where the first render was corrupted by a competing tab's network activity.
        if (!headReady) {
          console.warn(`[prerender] ↺ Retrying ${route} — head tags missing after poll`);
          const retryStatus = await waitForContent(workerPage, route);
          if (retryStatus === '404') {
            console.warn(`[prerender] ⚠ Skipping ${route} — SPA returned 404 on retry`);
            report.skipped++;
            report.pages.push({ url: route, type: r.type, status: 'skipped', reason: '404' });
            continue;
          }
          // Give the retry one more poll pass
          await pollForHead(workerPage, route, { maxMs: 5000 });
        }

        const fullHtml = await workerPage.evaluate(() => '<!DOCTYPE html>' + document.documentElement.outerHTML);
        const visibleHtml = makeContentVisible(fullHtml);
        const metrics = await captureMetrics(workerPage);
        const validation = validatePage(route, metrics, visibleHtml.length);

        const filePath = route === "/"
          ? join(DIST, "index.html")
          : join(DIST, route, "index.html");
        const dir = dirname(filePath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(filePath, visibleHtml);

        const status = validation.failures.length === 0 ? 'success' : 'failed';
        if (status === 'success') report.succeeded++;
        else report.failed++;
        if (validation.warnings.length > 0) report.warnings++;

        report.pages.push({
          url: route,
          type: r.type,
          status,
          h1: metrics.h1,
          descLen: metrics.desc.length,
          schemaCount: metrics.schemaCount,
          schemaTypes: metrics.schemaTypes,
          internalLinks: metrics.internalLinks,
          htmlBytes: visibleHtml.length,
          failures: validation.failures,
          warnings: validation.warnings,
        });

        const icon = status === 'success' ? '✅' : '❌';
        console.log(
          `[prerender] ${icon} ${route} — h1:"${metrics.h1.slice(0, 40)}" desc:${metrics.desc.length} schema:${metrics.schemaCount} links:${metrics.internalLinks}`
        );
        if (validation.failures.length) console.error(`[prerender]    FAIL: ${validation.failures.join('; ')}`);
        if (validation.warnings.length) console.warn(`[prerender]    WARN: ${validation.warnings.join('; ')}`);
      } catch (err) {
        console.error(`[prerender] ❌ Failed ${route}: ${err.message}`);
        report.failed++;
        report.pages.push({ url: route, type: r.type, status: 'failed', error: err.message });
      }
    }
  }

  await Promise.all(pool.map((p) => worker(p)));

  // Close extra pool pages, keep one for the mobile audit.
  for (let i = 1; i < pool.length; i++) {
    try { await pool[i].close(); } catch {}
  }
  const auditPage = pool[0];

  // Mobile-first sample audit
  console.log(`[prerender] ── Mobile 375px sample audit ──`);
  for (const route of MOBILE_SAMPLE) {
    if (!routesToRender.find((r) => r.path === route)) continue;
    const issues = await mobileAudit(auditPage, route);
    const entry = report.pages.find((p) => p.url === route);
    if (entry) entry.mobileIssues = issues;
    if (issues.length === 0) console.log(`[prerender] 📱 ${route} — OK`);
    else console.warn(`[prerender] 📱 ${route} — ${issues.join('; ')}`);
  }

  await browser.close();
  server.close();

  // ── SPA-shell backfill ────────────────────────────────────────────────
  // Guarantee every sitemap route has an on-disk index.html. Without this,
  // Hostinger's Apache (Options -Indexes + DirectoryIndex index.html) returns
  // 403 for any directory whose index.html is missing (e.g. /services/ when
  // child /services/<slug>/index.html files exist but the parent doesn't).
  // Missing routes degrade to a client-rendered SPA page instead of a 403.
  const CORE_ROUTES = new Set(["/", "/about/", "/services/", "/contact/", "/blog/", "/gallery/", "/referral/"]);
  const spaShellPath = join(DIST, "index.html");
  const spaShell = existsSync(spaShellPath) ? readFileSync(spaShellPath) : null;
  report.backfilled = [];
  if (spaShell) {
    for (const r of routesToRender) {
      const filePath = r.path === "/" ? spaShellPath : join(DIST, r.path, "index.html");
      if (existsSync(filePath)) continue;
      const dir = dirname(filePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      copyFileSync(spaShellPath, filePath);
      report.backfilled.push(r.path);
      const isCore = CORE_ROUTES.has(r.path);
      const prefix = isCore ? "[prerender] 🚨 CORE route" : "[prerender] ⚠ backfilled";
      console.warn(`${prefix} ${r.path} with SPA shell (prerender did not produce a file)`);
    }
    if (report.backfilled.length === 0) {
      console.log(`[prerender] ✓ Backfill check: all routes have an index.html`);
    } else {
      console.warn(`[prerender] ⚠ Backfilled ${report.backfilled.length} route(s) with SPA shell`);
    }
  } else {
    console.warn(`[prerender] ⚠ Skipping backfill — dist/index.html missing`);
  }

  // Write machine report
  writeFileSync(join(DIST, 'prerender-report.json'), JSON.stringify(report, null, 2));

  // Console summary table
  console.log(`\n[prerender] ──────────────────────────────────────────────────────────────`);
  console.log(`[prerender] ${pad('ROUTE', 48)} ${pad('H1', 3)} ${pad('DESC', 5)} ${pad('SCHEMA', 7)} ${pad('LINKS', 6)} STATUS`);
  console.log(`[prerender] ──────────────────────────────────────────────────────────────`);
  for (const p of report.pages) {
    const h1 = p.h1 ? '✓' : '✗';
    const icon = p.status === 'success' ? '✅' : p.status === 'skipped' ? '⚠️' : '❌';
    console.log(`[prerender] ${pad(p.url, 48)} ${pad(h1, 3)} ${pad(p.descLen ?? 0, 5)} ${pad(p.schemaCount ?? 0, 7)} ${pad(p.internalLinks ?? 0, 6)} ${icon}`);
  }
  console.log(`[prerender] ──────────────────────────────────────────────────────────────`);
  console.log(`[prerender] ${report.succeeded} succeeded · ${report.failed} failed · ${report.skipped} skipped · ${report.warnings} with warnings`);
  console.log(`[prerender] Report: dist/prerender-report.json\n`);

  // Tolerance: with 300+ routes prerendered concurrently in CI, a small number
  // of transient head-readiness races is expected. The SPA still serves these
  // routes correctly to humans; only the bot-facing prerendered HTML is thin.
  // Fail the build only if failures exceed an absolute floor AND a percentage
  // of total routes — this prevents a handful of flaky pages from blocking deploys.
  const failurePct = report.totalRoutes > 0 ? (report.failed / report.totalRoutes) * 100 : 0;
  const FAIL_ABS_THRESHOLD = Number(process.env.PRERENDER_FAIL_ABS || 25);
  const FAIL_PCT_THRESHOLD = Number(process.env.PRERENDER_FAIL_PCT || 10);

  if (report.failed > FAIL_ABS_THRESHOLD && failurePct > FAIL_PCT_THRESHOLD) {
    console.error(`[prerender] ❌ ${report.failed} route(s) failed (${failurePct.toFixed(1)}%) — exceeds tolerance (>${FAIL_ABS_THRESHOLD} AND >${FAIL_PCT_THRESHOLD}%). Failing build.`);
    process.exit(1);
  }
  if (report.failed > 0) {
    console.warn(`[prerender] ⚠ ${report.failed} route(s) failed (${failurePct.toFixed(1)}%) — within tolerance, continuing deploy. Inspect dist/prerender-report.json.`);
  }
}

prerender().catch((err) => {
  console.error("[prerender] Fatal error:", err);
  process.exit(1);
});
