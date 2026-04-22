/**
 * Maps broken WordPress image URLs to their migrated Supabase storage equivalents.
 * This lookup table was built from the media_library table which recorded original
 * filenames alongside migrated URLs during the bulk migration on 2026-04-02.
 */

const SB = "https://eukymrxxmvkchxfpjjuz.supabase.co/storage/v1/object/public/media";

const WP_TO_SUPABASE: Record<string, string> = {
  "2025-02-10-123458742462.png": `${SB}/migrated/services/1775120217670-sndgq8.png`,
  "odonto-2-1024x683.png":      `${SB}/migrated/services/1775120220666-o4k26g.png`,
  "dental-jewel.png":            `${SB}/migrated/services/1775120223435-h1hl28.png`,
  "122.jpg":                     `${SB}/migrated/services/1775120225359-h1mx61.jpg`,
  "aligners-819x1024.jpg":      `${SB}/migrated/services/1775120227488-osf8lq.jpg`,
  "odonto-44-1024x683.png":     `${SB}/migrated/services/1775120228968-zedckp.png`,
  "image1-1024x574.png":        `${SB}/migrated/services/1775120230851-b6w7pd.png`,
  "scaling.png":                 `${SB}/migrated/services/1775120232151-0c5jth.png`,
  "close-up-of-child-during-dental-checkup-SBI-300905764-1-1024x683.jpg": `${SB}/migrated/services/1775120233320-dlylx2.jpg`,
  "odonto-31-1.png":             `${SB}/migrated/services/1775120235371-2s5m1e.png`,
  "scaling-1024x1024.png":      `${SB}/migrated/services/1775120237223-od0a4l.png`,
  "Dental-Services-1024x1024.png": `${SB}/migrated/services/1775120239314-epxcpf.png`,
  "Imagem-Odontologia-alta-resolcao-501-1024x1024.jpg": `${SB}/migrated/services/1775120240903-4gqown.jpg`,
  "Dental-Services-1.png":      `${SB}/migrated/services/1775120242562-8uo3sr.png`,
  // Blog post images
  "KA709257-scaled.jpg":        `${SB}/migrated/blog_posts/1775120244307-ci7rhk.jpg`,
  "uploaded-image-15.jpeg":     `${SB}/migrated/blog_posts/1775120246238-ar0o0h.jpeg`,
  "uploaded-image.jpeg":        `${SB}/migrated/blog_posts/1775120247491-6p09ta.jpeg`,
  "Imagem-Odontologia-alta-resolcao-483-scaled.webp": `${SB}/migrated/blog_posts/1775120249086-yth8p6.webp`,
  "scalinPolishing.png":        `${SB}/migrated/blog_posts/1775120250328-q7czbt.png`,
  "Insta-1-1.png":              `${SB}/migrated/blog_posts/1775120252027-k3qtcj.png`,
  "Midnight-Blue-Orthodontics-Braces-Promotional-Instagram-Post.png": `${SB}/migrated/blog_posts/1775120253310-q88b8s.png`,
  "odonto-43.png":              `${SB}/migrated/blog_posts/1775120254519-snywap.png`,
  "13.png":                     `${SB}/migrated/blog_posts/1775120256131-lbzh3n.png`,
  "odonto-27.png":              `${SB}/migrated/blog_posts/1775120257683-kq456l.png`,
  "3-1-1.png":                  `${SB}/migrated/blog_posts/1775120259248-mq9lfg.png`,
  "15.png":                     `${SB}/migrated/blog_posts/1775120260685-x6o14x.png`,
  "121.png":                    `${SB}/migrated/blog_posts/1775120261933-xn8sxm.png`,
};

/**
 * Resolves a potentially broken WordPress image URL to its Supabase equivalent.
 * Returns the original URL if no mapping exists or it's not a WP URL.
 */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (!url.includes("smilz.net/wp-content")) return url;

  const filename = url.split("/").pop() ?? "";
  return WP_TO_SUPABASE[filename] ?? url;
}

/**
 * Replaces all WordPress image URLs in an HTML string with Supabase equivalents.
 */
export function resolveHtmlImages(html: string | null | undefined): string | undefined {
  if (!html) return undefined;
  return html.replace(
    /https?:\/\/smilz\.net\/wp-content\/uploads\/[^\s"'<>)]+/gi,
    (match) => {
      const filename = match.split("/").pop() ?? "";
      return WP_TO_SUPABASE[filename] ?? match;
    }
  );
}

/**
 * Returns a Supabase-transformed image URL (resized, WebP, quality 75).
 * Falls back to the original URL for non-Supabase storage URLs.
 *
 * Supabase Storage supports on-the-fly image transforms via the
 * /render/image/public/ endpoint. This dramatically reduces payload for
 * thumbnails (e.g. service icons displayed at 48×48 instead of 1024×1024).
 *
 * @param url      The original public Supabase storage URL
 * @param width    Target rendered width in CSS px (will be 2x for retina)
 * @param quality  WebP quality 1–100 (default 75)
 */
export function resolveResponsiveImage(
  url: string | null | undefined,
  width: number,
  quality = 75
): string | undefined {
  const resolved = resolveImageUrl(url);
  if (!resolved) return undefined;
  // Only Supabase storage URLs support the render/image transform endpoint.
  if (!resolved.includes("/storage/v1/object/public/")) return resolved;
  const transformed = resolved.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  // Request 2x the displayed width for crisp rendering on retina screens
  const renderWidth = Math.round(width * 2);
  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}width=${renderWidth}&quality=${quality}&resize=contain`;
}
