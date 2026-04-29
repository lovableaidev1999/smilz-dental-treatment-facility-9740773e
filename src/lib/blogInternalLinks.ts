/**
 * Blog → Service / Referral internal-linking map.
 *
 * Maps blog post topics (matched by keywords against title + slug + tags +
 * category) to the single most-relevant service page. Used by BlogPost.tsx
 * to render a contextual "Recommended treatment" CTA — improving crawl
 * paths for Googlebot and conversion paths for readers.
 *
 * Rules are evaluated in order; FIRST match wins. Keep specific topics
 * (e.g. "guided implants") above generic ones (e.g. "implants").
 */

export interface ServiceLink {
  slug: string;
  title: string;
  /** CTA text shown in the recommendation card. */
  ctaLabel: string;
  /** One-line value-prop shown beneath the title. */
  blurb: string;
}

interface LinkRule {
  /** Keywords matched (case-insensitive) against title + slug + tags + category. */
  keywords: string[];
  service: ServiceLink;
}

const RULES: LinkRule[] = [
  // ── Most specific first ──────────────────────────────────────────
  {
    keywords: ["guided implant", "guided-implant"],
    service: {
      slug: "dental-implants-garia-kolkata",
      title: "Guided Dental Implants in Kolkata",
      ctaLabel: "Book a guided-implant consultation",
      blurb: "3D CBCT planning and surgical guides for flapless, painless, predictable implant placement.",
    },
  },
  {
    keywords: ["implant", "tooth replacement", "missing teeth", "all-on-4", "all on 4"],
    service: {
      slug: "dental-implants-garia-kolkata",
      title: "Dental Implants",
      ctaLabel: "Explore our dental-implant treatment",
      blurb: "Permanent tooth replacement with premium titanium implants — single tooth to full-mouth All-on-4.",
    },
  },
  {
    keywords: ["root canal", "rct", "endodontic", "tooth decay", "dental caries", "tooth pain"],
    service: {
      slug: "painless-root-canal-treatment",
      title: "Painless Root Canal Treatment",
      ctaLabel: "Book painless root canal treatment",
      blurb: "Save your natural tooth with single-sitting RCT using modern rotary endodontics.",
    },
  },
  {
    keywords: ["invisalign", "aligner", "clear aligner", "invisible braces"],
    service: {
      slug: "clear-aligners",
      title: "Clear Aligners",
      ctaLabel: "Get a clear-aligner consultation",
      blurb: "Invisible teeth straightening with personalised digital treatment plans and EMI options.",
    },
  },
  {
    keywords: ["braces", "orthodont", "crooked teeth", "best age for braces", "alternatives to braces"],
    service: {
      slug: "orthodontic-braces",
      title: "Orthodontic Braces",
      ctaLabel: "Book a free orthodontic consultation",
      blurb: "Metal, ceramic and self-ligating braces for teens and adults — EMI options available.",
    },
  },
  {
    keywords: ["veneer", "smile makeover", "cosmetic dent", "smile design"],
    service: {
      slug: "smile-designing",
      title: "Smile Designing & Veneers",
      ctaLabel: "Plan your smile makeover",
      blurb: "Porcelain veneers, whitening and digital smile previews tailored to your face.",
    },
  },
  {
    keywords: ["whitening", "tooth whitening", "teeth whitening", "bleach"],
    service: {
      slug: "tooth-whitening",
      title: "Professional Tooth Whitening",
      ctaLabel: "Book a whitening session",
      blurb: "Safe, in-clinic whitening for a brighter smile in under an hour.",
    },
  },
  {
    keywords: ["scaling", "polishing", "tartar", "plaque"],
    service: {
      slug: "scaling-polishing",
      title: "Scaling & Polishing",
      ctaLabel: "Book your cleaning appointment",
      blurb: "Ultrasonic scaling to remove tartar, plaque and stains for healthier gums.",
    },
  },
  {
    keywords: ["gum bleeding", "bleeding gum", "gingivitis", "periodontal", "gum disease"],
    service: {
      slug: "scaling-polishing",
      title: "Gum Care & Scaling",
      ctaLabel: "Treat bleeding gums",
      blurb: "Professional scaling and gum-disease treatment to stop bleeding and restore gum health.",
    },
  },
  {
    keywords: ["wisdom tooth", "extraction", "tooth removal", "oral surgery", "dental surgery"],
    service: {
      slug: "oral-dental-surgery",
      title: "Oral & Dental Surgery",
      ctaLabel: "Book a surgical consultation",
      blurb: "Wisdom-tooth removal, surgical extractions, gum surgery and emergency care.",
    },
  },
  {
    keywords: ["child", "children", "kids", "pediatric", "paediatric"],
    service: {
      slug: "pediatric-dentistry",
      title: "Pediatric Dentistry",
      ctaLabel: "Book a child's dental visit",
      blurb: "Gentle, child-friendly dental care including sealants, fluoride and habit guidance.",
    },
  },
  {
    keywords: ["crown", "bridge", "broken tooth"],
    service: {
      slug: "crown-bridge",
      title: "Crowns & Bridges",
      ctaLabel: "Plan your crown or bridge",
      blurb: "Premium zirconia, PFM and all-ceramic crowns to restore broken or treated teeth.",
    },
  },
  {
    keywords: ["dental gap", "teeth gap", "spacing"],
    service: {
      slug: "dental-gaps",
      title: "Closing Dental Gaps",
      ctaLabel: "Fix the gap in your smile",
      blurb: "Composite bonding, veneers, bridges and orthodontic options for natural-looking results.",
    },
  },
  {
    keywords: ["restorative", "rehabilitation", "full mouth rehab"],
    service: {
      slug: "restorative-dentistry",
      title: "Restorative Dentistry",
      ctaLabel: "Plan your restoration",
      blurb: "Comprehensive treatment plans to rebuild damaged, decayed or missing teeth.",
    },
  },
  {
    keywords: ["preventive", "prevention", "checkup", "check-up", "dental visit", "routine"],
    service: {
      slug: "preventive-dental-care",
      title: "Preventive Dental Care",
      ctaLabel: "Book a preventive check-up",
      blurb: "Routine exams, cleanings, fluoride and sealants to keep dental problems away.",
    },
  },
  {
    keywords: ["brushing", "flossing", "oral hygiene", "toothbrush", "toothpaste", "bad breath", "halitosis"],
    service: {
      slug: "preventive-dental-care",
      title: "Preventive Dental Care",
      ctaLabel: "Book a hygiene check",
      blurb: "Personalised hygiene guidance and professional cleaning for fresh breath and healthy teeth.",
    },
  },
  {
    keywords: ["diabetes", "diabetic", "heart", "cardiac"],
    service: {
      slug: "comprehensive-consultation",
      title: "Comprehensive Dental Consultation",
      ctaLabel: "Book a comprehensive consultation",
      blurb: "Specialised dental care for patients with diabetes, heart conditions and other systemic concerns.",
    },
  },
];

/** Generic fallback when no keyword rule matches. */
const FALLBACK: ServiceLink = {
  slug: "comprehensive-consultation",
  title: "Comprehensive Dental Consultation",
  ctaLabel: "Book a dental consultation",
  blurb: "Talk to Dr. Dibyendu Dutta about any dental concern — diagnosis, planning and transparent pricing.",
};

/**
 * Pick the best service link for a blog post by scanning its title, slug,
 * tags and category for known keywords.
 */
export function pickServiceForPost(post: {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  tags?: string[] | null;
}): ServiceLink {
  const haystack = [
    post.title ?? "",
    post.slug ?? "",
    post.category ?? "",
    ...(post.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      return rule.service;
    }
  }
  return FALLBACK;
}
