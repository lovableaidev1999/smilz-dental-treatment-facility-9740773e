import { Link } from "react-router-dom";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  /** Page title (renders as H1) */
  title: string;
  /** Optional eyebrow text shown above the heading */
  eyebrow?: string | null;
  /** Optional supporting paragraph */
  subtitle?: string | null;
  /** Background image URL (CMS-editable per page). Falls back to gradient when empty. */
  imageUrl?: string | null;
  /** Image alt text for accessibility */
  imageAlt?: string;
  /** Breadcrumb trail; the final item is the current page (no link) */
  breadcrumbs?: Crumb[];
  /** Show the WhatsApp + Call CTA buttons (default: true) */
  showCtas?: boolean;
  /** Contact info for CTA links */
  contact?: {
    whatsapp?: string;
    phone?: string;
    phone_formatted?: string;
  };
  /** Custom WhatsApp prefill message (defaults to a polite intro) */
  whatsappMessage?: string;
  /** Center the content (default: true) */
  centered?: boolean;
  /** Optional override for the primary CTA (replaces the default WhatsApp "Book Appointment" button) */
  primaryCta?: {
    label: string;
    href: string;
    /** Open in a new tab */
    external?: boolean;
  };
}

/**
 * Universal page hero with optional background image, gradient overlay,
 * breadcrumb, title, subtitle, and WhatsApp/Call CTAs.
 *
 * Matches the visual language of ServiceHero and the Home hero so every
 * page across the site shares one cohesive banner style. The background
 * image is CMS-editable via each page's `hero` section `image_url` field
 * in the admin panel — when empty the existing gradient hero is used.
 */
const PageHero = ({
  title,
  eyebrow,
  subtitle,
  imageUrl,
  imageAlt,
  breadcrumbs,
  showCtas = true,
  contact,
  whatsappMessage,
  centered = true,
  primaryCta,
}: PageHeroProps) => {
  const hasImage = !!imageUrl;
  const wa = contact?.whatsapp ?? "918961775554";
  const phone = contact?.phone ?? "8961775554";
  const phoneLabel = contact?.phone_formatted ?? "8961 77 5554";
  const waText = encodeURIComponent(
    whatsappMessage ?? `Hi, I'd like to know more about ${title}.`
  );

  return (
    <section className="relative overflow-hidden text-primary-foreground section-padding min-h-[420px] md:min-h-[480px] flex items-center">
      {/* Background: image + gradient overlay, or pure gradient fallback */}
      <div className="absolute inset-0 -z-10">
        {hasImage ? (
          <>
            <img
              src={imageUrl as string}
              alt={imageAlt ?? title}
              className="w-full h-full object-cover object-center"
              width={1600}
              height={600}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            {/* Solid primary tint to match other pages' hero look */}
            <div className="absolute inset-0 bg-primary/75" />
            {/* Subtle left-to-right depth gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-primary" />
        )}
      </div>

      <div className={`container-narrow mx-auto ${centered ? "text-center" : ""}`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className={`flex items-center gap-2 text-sm text-primary-foreground/70 mb-6 ${
              centered ? "justify-center" : ""
            }`}
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((c, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  {c.to && !isLast ? (
                    <Link to={c.to} className="hover:text-primary-foreground transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-primary-foreground" : ""}>{c.label}</span>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        {eyebrow && (
          <p className="text-dental-gold font-semibold text-sm uppercase tracking-wider mb-3">
            {eyebrow}
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{title}</h1>

        {subtitle && (
          <p
            className={`text-primary-foreground/85 text-lg ${
              centered ? "max-w-2xl mx-auto" : "max-w-2xl"
            }`}
          >
            {subtitle}
          </p>
        )}

        {showCtas && (
          <div
            className={`flex flex-wrap gap-4 mt-8 ${centered ? "justify-center" : ""}`}
          >
            {primaryCta ? (
              <a
                href={primaryCta.href}
                {...(primaryCta.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" /> {primaryCta.label}
              </a>
            ) : (
              <a
                href={`https://wa.me/${wa}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" /> Book Appointment
              </a>
            )}
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              <Phone className="h-4 w-4" /> Call {phoneLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
