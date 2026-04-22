/**
 * Canonical URL normalizer.
 *
 * Ensures every page emits ONE canonical URL regardless of how it is reached:
 * - Forces the production host (https://smilz.net), stripping `www.`, preview
 *   domains, http, ports, etc.
 * - Strips query strings and hash fragments (so `/blog?utm=x` → `/blog/`).
 * - Adds a trailing slash on non-root paths so the React app and the static
 *   `html-site/` mirror agree (`/about` → `/about/`).
 * - Lowercases the pathname.
 *
 * Use this anywhere a canonical URL is rendered (SEOHead, BuiltPage, etc.).
 */

const PROD_ORIGIN = "https://smilz.net";

const FILE_EXT_RE = /\.[a-z0-9]{2,5}$/i;

export function normalizeCanonicalUrl(input?: string, fallbackPath?: string): string {
  let pathname = "/";

  if (input) {
    try {
      // Accept full URLs or bare paths.
      const u = input.startsWith("http")
        ? new URL(input)
        : new URL(input, PROD_ORIGIN);
      pathname = u.pathname || "/";
    } catch {
      pathname = input.startsWith("/") ? input.split(/[?#]/)[0] : `/${input.split(/[?#]/)[0]}`;
    }
  } else if (fallbackPath) {
    pathname = fallbackPath.split(/[?#]/)[0] || "/";
  } else if (typeof window !== "undefined") {
    pathname = window.location.pathname.split(/[?#]/)[0] || "/";
  }

  // Lowercase the path (URLs are case-sensitive — we standardize to lowercase).
  pathname = pathname.toLowerCase();

  // Collapse duplicate slashes.
  pathname = pathname.replace(/\/{2,}/g, "/");

  // Ensure it starts with /
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;

  // Add trailing slash for non-root, non-file paths (matches static mirror).
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const looksLikeFile = FILE_EXT_RE.test(lastSegment);
  if (pathname !== "/" && !pathname.endsWith("/") && !looksLikeFile) {
    pathname = `${pathname}/`;
  }

  return `${PROD_ORIGIN}${pathname}`;
}
