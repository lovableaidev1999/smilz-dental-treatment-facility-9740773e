/**
 * Sanitizes HTML content by handling broken WordPress image URLs.
 * WordPress images from smilz.net/wp-content are no longer served correctly
 * (server returns HTML instead of image data).
 * 
 * This utility:
 * 1. Removes WordPress srcset attributes (they reference multiple broken URLs)
 * 2. Removes WordPress sizes attributes  
 * 3. Strips broken <img> tags that only reference wp-content URLs
 * 4. Cleans up empty <figure> and <picture> wrappers left behind
 */

const WP_CONTENT_PATTERN = /https?:\/\/smilz\.net\/wp-content\/[^\s"'<>)]+/gi;

/**
 * Remove entire <img> tags whose src points to wp-content
 * Also cleans up parent <figure> tags that become empty
 */
export function sanitizeWpImages(html: string): string {
  if (!html) return html;

  // Remove srcset and sizes attributes (they reference broken WP URLs)
  let cleaned = html.replace(/\s+srcset="[^"]*smilz\.net\/wp-content[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s+sizes="[^"]*"/gi, '');

  // Remove <img> tags whose src points to wp-content
  // This regex matches <img ... src="https://smilz.net/wp-content/..." ... />
  cleaned = cleaned.replace(
    /<img\s[^>]*src=["']https?:\/\/smilz\.net\/wp-content\/[^"']+["'][^>]*\/?>/gi,
    ''
  );

  // Clean up empty <figure> tags left behind
  cleaned = cleaned.replace(/<figure[^>]*>\s*<\/figure>/gi, '');

  // Clean up empty <a> tags that wrapped images
  cleaned = cleaned.replace(/<a\s[^>]*href=["']https?:\/\/smilz\.net\/wp-content\/[^"']+["'][^>]*>\s*<\/a>/gi, '');

  // Clean up empty paragraphs left behind
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');

  return cleaned;
}

/**
 * Check if HTML content contains any WordPress image references
 */
export function hasWpImages(html: string): boolean {
  if (!html) return false;
  return WP_CONTENT_PATTERN.test(html);
}
