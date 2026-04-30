#!/usr/bin/env node
/**
 * Hub-and-Spoke location landing page generator.
 *
 * Generates 3 kinds of rows in `page_layouts`:
 *   1. Hub pages       — one per HUB (template_type: "location-hub")
 *   2. Intent spokes   — for CORE-tier areas only (template_type: "location-landing")
 *   3. Service spokes  — for ALL areas (template_type: "service-location-landing")
 *
 * Internal-link topology:
 *   - Hub page → all its spokes + 5 service spokes
 *   - Spoke page → backlink to its parent hub + max 8 same-hub siblings
 *   - Each spoke gets 3-level BreadcrumbList (Home > Hub > Spoke)
 *
 * Idempotent: upserts by page_slug.
 *
 * Required env (only when actually writing):
 *   SUPABASE_URL                 (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY    (preferred — bypasses RLS)
 *
 * Usage:
 *   node scripts/generate-location-pages.mjs
 *   node scripts/generate-location-pages.mjs --dry-run
 *   node scripts/generate-location-pages.mjs --only=best-dentist-in:garia
 *   node scripts/generate-location-pages.mjs --only=hub:garia-core
 */
import {
  AREAS,
  INTENTS,
  SERVICES,
  HUBS,
  OVERRIDES,
  CLINIC,
  HERO_IMAGE,
  DIRECTIONS,
} from "./location-pages.config.mjs";

// External Supabase project (eukymrxxmvkchxfpjjuz). Env vars only override.
const REAL_SUPABASE_URL = "https://eukymrxxmvkchxfpjjuz.supabase.co";
const REAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1a3ltcnh4bXZrY2h4ZnBqanV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzg1NTksImV4cCI6MjA5MDYxNDU1OX0.rtXAdsH4BDwRd4zBScoB-sleoQAPTeWPZsExBcM79Fc";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || REAL_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  REAL_SUPABASE_ANON_KEY;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1];

const SITE = "https://smilz.net";

// ─── helpers ──────────────────────────────────────────────────────────
const fill = (tpl, vars) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const id = () =>
  "blk-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

const titleCase = (s) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const HUB_BY_KEY = Object.fromEntries(HUBS.map((h) => [h.key, h]));
const AREAS_BY_KEY = Object.fromEntries(AREAS.map((a) => [a.key, a]));

// Best landing-page slug for an area (used by hub "Neighborhoods we serve" cards).
// Core-tier → /dentist-in-{area}/ ;  Specialized → strongest service spoke.
function spokeUrlForArea(area) {
  if (area.tier === "core") return `/dentist-in-${area.key}/`;
  // Prefer dental-implants as the marquee service spoke for specialized areas.
  return `/dental-implants-in-${area.key}/`;
}

function spokeLabelForArea(area) {
  if (area.tier === "core") return `Dentist in ${area.name}`;
  return `Dental care in ${area.name}`;
}

// ─── shared schema helpers (single source of truth) ───────────────────
function dentistSchema({ url, areaServedNames }) {
  return {
    "@context": "https://schema.org",
    "@type": ["Dentist", "LocalBusiness"],
    name: CLINIC.name,
    image: `${SITE}/og-image.jpg`,
    "@id": `${SITE}/#dentist`,
    url,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "21, Garia Park, Opposite Garia Park Club, Near Andrews College",
      addressLocality: "Garia, Kolkata",
      addressRegion: "West Bengal",
      postalCode: "700084",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CLINIC.geo.lat,
      longitude: CLINIC.geo.lng,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: CLINIC.rating,
      reviewCount: CLINIC.reviewCount,
    },
    areaServed: [...new Set(areaServedNames)].map((n) => ({ "@type": "Place", name: n })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

function faqSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => f.question && f.answer)
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
  };
}

// ─── content fragment helpers ─────────────────────────────────────────
function breadcrumbHtml(trail) {
  // trail = [{name, href}]
  const parts = trail.map((t, i) => {
    const isLast = i === trail.length - 1;
    if (isLast || !t.href) {
      return `<span aria-current="page">${t.name}</span>`;
    }
    return `<a href="${t.href}">${t.name}</a>`;
  });
  return `
    <nav aria-label="Breadcrumb" class="text-sm text-muted-foreground mb-4">
      ${parts.join(' <span aria-hidden="true">›</span> ')}
    </nav>
  `;
}

function buildDirectionsHtml(area) {
  const routes =
    area.directions && area.directions.length ? area.directions : DIRECTIONS.default(area);
  const items = routes
    .map(
      (r) =>
        `<li><strong>${r.mode}:</strong> ${r.description}${
          r.duration ? ` <em>(${r.duration})</em>` : ""
        }</li>`,
    )
    .join("");
  return `
    <p>Reaching Smilz Dental from <strong>${area.name}</strong> is straightforward — pick the route that suits you:</p>
    <ul>${items}</ul>
    <p>Need help finding us? Call <a href="tel:${CLINIC.phone}">${CLINIC.phoneDisplay}</a> and our reception will guide you turn-by-turn.</p>
  `;
}

// Same-hub sibling cluster — replaces the old all-areas link list.
function buildSameHubSiblings({ currentArea, currentIntentKey }) {
  const hub = HUB_BY_KEY[currentArea.parentHub];
  if (!hub) return "";
  const siblings = hub.neighborhoods
    .map((k) => AREAS_BY_KEY[k])
    .filter((a) => a && a.key !== currentArea.key)
    .slice(0, 8);

  const intentSlug = currentIntentKey || "dentist-in";
  const sameHubLinks = siblings
    .map((a) => {
      // Use the same intent slug only if the sibling is core-tier (intents are core-only).
      // Otherwise fall back to its strongest spoke URL.
      const url =
        a.tier === "core" ? `/${intentSlug}-${a.key}/` : spokeUrlForArea(a);
      const label = a.tier === "core" ? `${titleCase(intentSlug)} ${a.name}` : spokeLabelForArea(a);
      return `<li><a href="${url}">${label}</a></li>`;
    })
    .join("");

  // 1–2 adjacent hubs for cross-hub discovery (next + previous in HUBS order).
  const idx = HUBS.findIndex((h) => h.key === hub.key);
  const adjacent = [HUBS[(idx + 1) % HUBS.length], HUBS[(idx - 1 + HUBS.length) % HUBS.length]]
    .filter((h, i, arr) => h && h.key !== hub.key && arr.findIndex((x) => x.key === h.key) === i)
    .slice(0, 2);
  const adjacentLinks = adjacent
    .map((h) => `<li><a href="/${h.slug}/">Explore ${h.name} →</a></li>`)
    .join("");

  return `
    <div class="grid md:grid-cols-2 gap-6 mt-4">
      <div>
        <h3>Other neighborhoods in ${hub.name}</h3>
        <ul>${sameHubLinks}</ul>
      </div>
      <div>
        <h3>Explore other areas of South Kolkata</h3>
        <ul>${adjacentLinks}</ul>
      </div>
    </div>
  `;
}

// "Part of our {Hub} service area" backlink card.
function buildHubBacklinkBlock(area) {
  const hub = HUB_BY_KEY[area.parentHub];
  if (!hub) return null;
  return {
    id: id(),
    type: "section",
    props: { padding: "md", background: "bg-primary/5" },
    children: [
      {
        id: id(),
        type: "text",
        props: {
          align: "center",
          html: `
            <p class="text-base">
              📍 <strong>Part of our ${hub.name} service area.</strong>
              See all neighborhoods we serve here →
              <a href="/${hub.slug}/" class="font-semibold underline">Dentist in ${hub.name}</a>
            </p>
          `,
        },
      },
    ],
  };
}

// Transit + parking FAQs appended to every spoke.
function buildTransitFaqs(area) {
  return [
    {
      question: `How do I reach Smilz Dental from ${area.name}?`,
      answer:
        (area.transitNote ? area.transitNote + " " : "") +
        `The clinic is at ${CLINIC.address}, opposite Garia Park Club, next to Andrews College.`,
    },
    {
      question: `Is there parking at the clinic?`,
      answer:
        "Yes — free on-street parking is available directly outside the clinic at 21, Garia Park. Two-wheelers can park at the gate.",
    },
  ];
}

// ─── INTENT × AREA spoke layout ───────────────────────────────────────
function buildLayout({ intent, area, h1, description }) {
  const landmarks = area.landmarks.slice(0, 4).join(", ");
  const nearby = area.nearby.join(", ");
  const hub = HUB_BY_KEY[area.parentHub];

  const breadcrumbBlock = {
    id: id(),
    type: "text",
    props: {
      html: breadcrumbHtml([
        { name: "Home", href: "/" },
        { name: hub ? hub.name : "Areas", href: hub ? `/${hub.slug}/` : "/" },
        { name: h1 },
      ]),
    },
  };

  const blocks = [
    {
      id: id(),
      type: "section",
      props: {
        background: "bg-gradient-to-br from-primary/5 via-background to-accent/5",
        padding: "lg",
      },
      children: [
        breadcrumbBlock,
        {
          id: id(),
          type: "image",
          props: {
            src: HERO_IMAGE.forIntent(intent.key),
            alt: `${h1} — ${CLINIC.name}, Garia Kolkata`,
            objectFit: "cover",
            borderRadius: "1rem",
            width: 1200,
            height: 500,
          },
        },
        { id: id(), type: "heading", props: { level: 1, align: "center", text: h1 } },
        {
          id: id(),
          type: "text",
          props: {
            align: "center",
            html: `<p class="text-lg text-muted-foreground max-w-3xl mx-auto">${description}</p>`,
          },
        },
        {
          id: id(),
          type: "cta-row",
          props: {
            align: "center",
            buttons: [
              { label: "Book Appointment", href: `tel:${CLINIC.phone}`, variant: "default" },
              { label: "WhatsApp Us", href: `https://wa.me/${CLINIC.whatsapp}`, variant: "outline" },
            ],
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Why patients in ${area.name} choose Smilz Dental` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <p>${CLINIC.name}, led by ${CLINIC.doctor} (BDS, 25+ years' experience), is a trusted dental clinic serving ${area.name} and the wider South Kolkata neighbourhood. Our flagship clinic at <strong>${CLINIC.address}</strong> is just <strong>${area.distanceFromClinicKm} km</strong> from ${area.name}, with easy access from ${landmarks}.</p>
              ${area.uniqueIntro ? `<p>${area.uniqueIntro}</p>` : ""}
              ${area.uniqueAngle ? `<p>${area.uniqueAngle}</p>` : ""}
              <p>Patients from ${nearby} frequently visit us for second opinions, complex implant cases and orthodontic treatment.</p>
              <ul>
                <li><strong>${CLINIC.rating}★ Google rating</strong> with ${CLINIC.reviewCount}+ verified patient reviews.</li>
                <li>Established in <strong>${CLINIC.yearEstablished}</strong> — over 25 years serving ${area.name} and Garia.</li>
                <li>Painless, internationally accredited protocols and modern sterilization.</li>
                <li>Same-day emergency appointments — call <strong>${CLINIC.phoneDisplay}</strong>.</li>
              </ul>
            `,
          },
        },
      ],
    },
    // Transit / Directions promoted high in the body.
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `How to reach us from ${area.name}` },
        },
        { id: id(), type: "text", props: { html: buildDirectionsHtml(area) } },
        {
          id: id(),
          type: "google-map",
          props: {
            embedUrl: `https://www.google.com/maps?q=${CLINIC.geo.lat},${CLINIC.geo.lng}&z=15&output=embed`,
            height: 400,
            title: `${CLINIC.name} location near ${area.name}`,
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Treatments available for ${area.name} patients` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <ul>
                <li><a href="/services/dental-implants/">Dental Implants</a> — permanent tooth replacement.</li>
                <li><a href="/services/painless-root-canal-treatment/">Painless Root Canal</a> — single-visit options.</li>
                <li><a href="/services/orthodontic-braces/">Braces &amp; Clear Aligners</a> — including Invisalign.</li>
                <li><a href="/services/smile-designing/">Smile Designing</a> — virtual preview before treatment.</li>
                <li><a href="/services/tooth-whitening/">Tooth Whitening</a> — safe in-clinic results.</li>
                <li><a href="/services/scaling-polishing/">Scaling &amp; Polishing</a> — routine cleaning.</li>
                <li><a href="/services/pediatric-dentistry/">Children's Dentistry</a> — gentle care for kids.</li>
              </ul>
              <p><a href="/services/">See all dental services</a> &middot; <a href="/about/">About the clinic</a> &middot; <a href="/contact/">Contact &amp; directions</a></p>
            `,
          },
        },
      ],
    },
    buildHubBacklinkBlock(area),
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Areas near ${area.name} we also serve` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: buildSameHubSiblings({ currentArea: area, currentIntentKey: intent.key }),
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
      children: [
        {
          id: id(),
          type: "faq",
          props: {
            title: `Frequently asked questions — ${area.name}`,
            items: buildIntentFaqs(intent, area),
          },
        },
      ],
    },
  ].filter(Boolean);

  return blocks;
}

function buildIntentFaqs(intent, area) {
  const base = [
    {
      question: `Who is the best dentist in ${area.name}?`,
      answer: `${CLINIC.doctor} at ${CLINIC.name} is widely considered one of the best dentists serving ${area.name}, with 25+ years of experience and a ${CLINIC.rating}★ Google rating from ${CLINIC.reviewCount}+ patients.`,
    },
    {
      question: `How far is Smilz Dental from ${area.name}?`,
      answer: `Our clinic at ${CLINIC.address} is approximately ${area.distanceFromClinicKm} km from ${area.name}. Most patients reach us within 10–15 minutes by car or auto.`,
    },
    {
      question: `Do you accept walk-in patients from ${area.name}?`,
      answer: `Yes. While appointments are recommended, we accommodate walk-ins and same-day emergency cases. Call ${CLINIC.phoneDisplay} or WhatsApp ${CLINIC.phoneDisplay} before visiting.`,
    },
    {
      question: `What treatments do you offer for patients in ${area.name}?`,
      answer: `We provide the full range of modern dentistry — implants, root canal, braces & aligners, cosmetic dentistry, paediatric care, and emergency treatments — all from our Garia clinic.`,
    },
  ];
  if (intent.angle === "urgency") {
    base.unshift({
      question: `Is there an emergency dentist available in ${area.name}?`,
      answer: `Yes. Smilz Dental offers same-day emergency appointments for severe pain, swelling, broken teeth and trauma. Call ${CLINIC.phoneDisplay} immediately — we serve ${area.name} and surrounding areas.`,
    });
  }
  // Transit + parking always last.
  return [...base, ...buildTransitFaqs(area)];
}

function buildIntentSeo({ intent, area, title, description, slug, faqs }) {
  const url = `${SITE}/${slug}/`;
  const hub = HUB_BY_KEY[area.parentHub];
  const areaServed = [
    area.name,
    ...area.landmarks,
    ...area.nearby,
    hub ? hub.name : "South Kolkata",
    "Garia",
    "South Kolkata",
  ];
  const trail = [
    { name: "Home", item: `${SITE}/` },
    { name: hub ? hub.name : "Areas", item: hub ? `${SITE}/${hub.slug}/` : `${SITE}/` },
    { name: `${intent.h1.replace("{area}", area.name)}`, item: url },
  ];
  const ld = [
    dentistSchema({ url, areaServedNames: areaServed }),
    breadcrumbSchema(trail),
  ];
  const fp = faqSchema(faqs);
  if (fp) ld.push(fp);
  return {
    title,
    description,
    keywords: [
      `${intent.key.replace(/-/g, " ")} ${area.name}`,
      `dentist ${area.name}`,
      `dentist near me ${area.name}`,
      `dental clinic ${area.name}`,
      ...area.landmarks.map((l) => `dentist near ${l}`),
    ].join(", "),
    canonical: url,
    ogImage: `${SITE}/og-image.jpg`,
    robots: "index, follow",
    jsonLd: ld,
  };
}

// ─── SERVICE × AREA spoke layout ──────────────────────────────────────
function buildServiceLayout({ service, area, h1, description }) {
  const landmarks = area.landmarks.slice(0, 4).join(", ");
  const nearby = area.nearby.join(", ");
  const hub = HUB_BY_KEY[area.parentHub];

  const breadcrumbBlock = {
    id: id(),
    type: "text",
    props: {
      html: breadcrumbHtml([
        { name: "Home", href: "/" },
        { name: hub ? hub.name : "Areas", href: hub ? `/${hub.slug}/` : "/" },
        { name: h1 },
      ]),
    },
  };

  return [
    {
      id: id(),
      type: "section",
      props: {
        background: "bg-gradient-to-br from-primary/5 via-background to-accent/5",
        padding: "lg",
      },
      children: [
        breadcrumbBlock,
        {
          id: id(),
          type: "image",
          props: {
            src: HERO_IMAGE.forService(service.key),
            alt: `${h1} — ${CLINIC.name}, Garia Kolkata`,
            objectFit: "cover",
            borderRadius: "1rem",
            width: 1200,
            height: 500,
          },
        },
        { id: id(), type: "heading", props: { level: 1, align: "center", text: h1 } },
        {
          id: id(),
          type: "text",
          props: {
            align: "center",
            html: `<p class="text-lg text-muted-foreground max-w-3xl mx-auto">${description}</p>`,
          },
        },
        {
          id: id(),
          type: "cta-row",
          props: {
            align: "center",
            buttons: [
              { label: "Book Consultation", href: `tel:${CLINIC.phone}`, variant: "default" },
              { label: "WhatsApp Us", href: `https://wa.me/${CLINIC.whatsapp}`, variant: "outline" },
            ],
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `${service.name} for patients in ${area.name}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <p>${CLINIC.name} provides specialist <a href="/services/${service.serviceSlug}/"><strong>${service.name}</strong></a> for patients in ${area.name} and surrounding areas. Our clinic at <strong>${CLINIC.address}</strong> is just <strong>${area.distanceFromClinicKm} km</strong> from ${area.name}, easily reached via ${landmarks}.</p>
              ${area.uniqueIntro ? `<p>${area.uniqueIntro}</p>` : ""}
              <p>${service.body}</p>
              <p>${area.uniqueAngle || ""} Patients from ${nearby} regularly choose Smilz Dental for ${service.name.toLowerCase()} thanks to ${CLINIC.doctor}'s 25+ years of experience and our ${CLINIC.rating}★ Google rating (${CLINIC.reviewCount}+ reviews).</p>
              <ul>
                <li>Procedure performed by ${CLINIC.doctor}, BDS — 25+ years of clinical experience.</li>
                <li>Modern equipment, digital imaging and internationally accredited sterilization.</li>
                <li>EMI and transparent pricing — no hidden charges.</li>
                <li>Same-day emergency appointments available for ${area.name} patients.</li>
              </ul>
              <p><strong>Related services:</strong>
                <a href="/services/dental-implants/">Dental Implants</a> ·
                <a href="/services/painless-root-canal-treatment/">Root Canal</a> ·
                <a href="/services/orthodontic-braces/">Braces &amp; Aligners</a> ·
                <a href="/services/smile-designing/">Smile Designing</a> ·
                <a href="/services/">All services</a>
              </p>
            `,
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `How to reach us from ${area.name}` },
        },
        { id: id(), type: "text", props: { html: buildDirectionsHtml(area) } },
        {
          id: id(),
          type: "google-map",
          props: {
            embedUrl: `https://www.google.com/maps?q=${CLINIC.geo.lat},${CLINIC.geo.lng}&z=15&output=embed`,
            height: 400,
            title: `${CLINIC.name} location near ${area.name}`,
          },
        },
      ],
    },
    buildHubBacklinkBlock(area),
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Also serving nearby areas in ${HUB_BY_KEY[area.parentHub]?.name || "South Kolkata"}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: buildSameHubSiblings({ currentArea: area, currentIntentKey: "dentist-in" }),
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
      children: [
        {
          id: id(),
          type: "faq",
          props: {
            title: `${service.name} in ${area.name} — FAQs`,
            items: buildServiceFaqs(service, area),
          },
        },
      ],
    },
  ].filter(Boolean);
}

function buildServiceFaqs(service, area) {
  const base = [
    {
      question: `How much does ${service.name.toLowerCase()} cost in ${area.name}?`,
      answer: `${service.name} pricing at Smilz Dental depends on case complexity and materials chosen. We offer transparent quotes after a free consultation and EMI options for ${area.name} patients.`,
    },
    {
      question: `Is ${service.name.toLowerCase()} painful?`,
      answer: `No. ${CLINIC.doctor} uses modern painless protocols, profound local anaesthesia and gentle techniques. Most patients report minimal to no discomfort during and after treatment.`,
    },
    {
      question: `How far is the clinic from ${area.name}?`,
      answer: `Our clinic at ${CLINIC.address} is approximately ${area.distanceFromClinicKm} km from ${area.name}, typically a 10–15 minute drive.`,
    },
    {
      question: `Do you take walk-in ${service.name.toLowerCase()} consultations?`,
      answer: `Yes — call ${CLINIC.phoneDisplay} or WhatsApp us. We reserve daily slots for new ${service.name.toLowerCase()} consultations from ${area.name} and nearby areas.`,
    },
  ];
  return [...base, ...buildTransitFaqs(area)];
}

function buildServiceSeo({ service, area, title, description, slug, faqs }) {
  const url = `${SITE}/${slug}/`;
  const hub = HUB_BY_KEY[area.parentHub];
  const areaServed = [
    area.name,
    ...area.landmarks,
    ...area.nearby,
    hub ? hub.name : "South Kolkata",
    "Garia",
    "South Kolkata",
  ];
  const trail = [
    { name: "Home", item: `${SITE}/` },
    { name: hub ? hub.name : "Areas", item: hub ? `${SITE}/${hub.slug}/` : `${SITE}/` },
    { name: `${service.name} in ${area.name}`, item: url },
  ];
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.name,
    procedureType: service.schemaServiceType,
    bodyLocation: "Mouth",
    provider: { "@id": `${SITE}/#dentist` },
    url,
    areaServed: { "@type": "Place", name: area.name },
  };
  const ld = [
    dentistSchema({ url, areaServedNames: areaServed }),
    serviceLd,
    breadcrumbSchema(trail),
  ];
  const fp = faqSchema(faqs);
  if (fp) ld.push(fp);
  return {
    title,
    description,
    canonical: url,
    ogImage: `${SITE}/og-image.jpg`,
    robots: "index, follow",
    jsonLd: ld,
  };
}

// ─── HUB pages ────────────────────────────────────────────────────────
function buildHubLayout(hub) {
  const childAreas = hub.neighborhoods
    .map((k) => AREAS_BY_KEY[k])
    .filter(Boolean);

  const cardsHtml = childAreas
    .map(
      (a) => `
        <li>
          <a href="${spokeUrlForArea(a)}" class="block p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition">
            <strong class="block text-base">${a.name}</strong>
            <span class="text-sm text-muted-foreground">${spokeLabelForArea(a)} →</span>
          </a>
        </li>
      `,
    )
    .join("");

  const breadcrumbBlock = {
    id: id(),
    type: "text",
    props: {
      html: breadcrumbHtml([
        { name: "Home", href: "/" },
        { name: "Areas We Serve" },
        { name: hub.name },
      ]),
    },
  };

  const h1 = `Dentist in ${hub.name} — South Kolkata`;
  const description = `Smilz Dental serves the entire ${hub.name} area: ${childAreas
    .map((a) => a.name)
    .join(", ")}. ${CLINIC.doctor} offers implants, painless RCT, braces, aligners and cosmetic dentistry. ${CLINIC.rating}★ Google rated. Call ${CLINIC.phoneDisplay}.`;

  return [
    {
      id: id(),
      type: "section",
      props: {
        background: "bg-gradient-to-br from-primary/5 via-background to-accent/5",
        padding: "lg",
      },
      children: [
        breadcrumbBlock,
        {
          id: id(),
          type: "image",
          props: {
            src: HERO_IMAGE.forHub(),
            alt: `${h1} — ${CLINIC.name}`,
            objectFit: "cover",
            borderRadius: "1rem",
            width: 1200,
            height: 500,
          },
        },
        { id: id(), type: "heading", props: { level: 1, align: "center", text: h1 } },
        {
          id: id(),
          type: "text",
          props: {
            align: "center",
            html: `<p class="text-lg text-muted-foreground max-w-3xl mx-auto">${hub.tagline}</p>
                   <p class="text-base text-muted-foreground max-w-3xl mx-auto mt-2">${description}</p>`,
          },
        },
        {
          id: id(),
          type: "cta-row",
          props: {
            align: "center",
            buttons: [
              { label: "Book Appointment", href: `tel:${CLINIC.phone}`, variant: "default" },
              { label: "WhatsApp Us", href: `https://wa.me/${CLINIC.whatsapp}`, variant: "outline" },
            ],
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Neighborhoods we serve in ${hub.name}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `<ul class="grid sm:grid-cols-2 md:grid-cols-3 gap-3 list-none p-0">${cardsHtml}</ul>`,
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Treatments we offer across ${hub.name}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <ul>
                <li><a href="/services/dental-implants/">Dental Implants</a> — single-tooth, multi-tooth and All-on-4 full-mouth.</li>
                <li><a href="/services/painless-root-canal-treatment/">Painless Root Canal Treatment</a> — single-visit RCT.</li>
                <li><a href="/services/orthodontic-braces/">Braces &amp; Clear Aligners</a> — metal, ceramic, self-ligating, Invisalign-style.</li>
                <li><a href="/services/smile-designing/">Smile Designing</a> — digital previews, veneers, whitening.</li>
                <li><a href="/services/">All dental services →</a></li>
              </ul>
              <p><strong>Transit note:</strong> ${hub.transitNote}</p>
            `,
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `Visit our clinic` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <p>Our flagship clinic is at <strong>${CLINIC.address}</strong>. Walk-ins welcome; same-day emergency appointments available.</p>
              <p><strong>Hours:</strong> Mon – Sat, 9:00 AM – 1:00 PM and 5:00 PM – 9:00 PM. Closed Sunday. <strong>Phone:</strong> <a href="tel:${CLINIC.phone}">${CLINIC.phoneDisplay}</a>.</p>
            `,
          },
        },
        {
          id: id(),
          type: "google-map",
          props: {
            embedUrl: `https://www.google.com/maps?q=${CLINIC.geo.lat},${CLINIC.geo.lng}&z=15&output=embed`,
            height: 400,
            title: `${CLINIC.name} location`,
          },
        },
      ],
    },
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
      children: [
        {
          id: id(),
          type: "faq",
          props: {
            title: `Frequently asked questions — ${hub.name}`,
            items: buildHubFaqs(hub, childAreas),
          },
        },
      ],
    },
  ];
}

function buildHubFaqs(hub, childAreas) {
  return [
    {
      question: `Which neighborhoods does Smilz Dental serve in ${hub.name}?`,
      answer: `We serve ${childAreas.map((a) => a.name).join(", ")} and the surrounding South Kolkata locality from our clinic at ${CLINIC.address}.`,
    },
    {
      question: `How do I reach the clinic from ${hub.name}?`,
      answer: hub.transitNote,
    },
    {
      question: `Is there parking?`,
      answer:
        "Yes — free on-street parking is available directly outside the clinic at 21, Garia Park.",
    },
    {
      question: `What are the clinic hours?`,
      answer:
        "Mon–Sat, 9:00 AM – 1:00 PM and 5:00 PM – 9:00 PM. Closed Sunday. Same-day emergency appointments available.",
    },
  ];
}

function buildHubSeo(hub, childAreas) {
  const url = `${SITE}/${hub.slug}/`;
  const title = `Dentist in ${hub.name} | Smilz Dental Garia, South Kolkata`;
  const description = `Smilz Dental serves ${hub.name}: ${childAreas
    .map((a) => a.name)
    .slice(0, 6)
    .join(", ")}. ${CLINIC.doctor} — implants, painless RCT, braces, aligners, cosmetic dentistry. ${CLINIC.rating}★ Google. Call ${CLINIC.phoneDisplay}.`;
  const areaServed = [
    hub.name,
    ...childAreas.map((a) => a.name),
    ...childAreas.flatMap((a) => a.landmarks || []),
    "South Kolkata",
    "Garia",
  ];
  const faqs = buildHubFaqs(hub, childAreas);
  const trail = [
    { name: "Home", item: `${SITE}/` },
    { name: "Areas We Serve", item: `${SITE}/` },
    { name: hub.name, item: url },
  ];
  const ld = [
    dentistSchema({ url, areaServedNames: areaServed }),
    breadcrumbSchema(trail),
  ];
  const fp = faqSchema(faqs);
  if (fp) ld.push(fp);
  return { title, description, canonical: url, ogImage: `${SITE}/og-image.jpg`, robots: "index, follow", jsonLd: ld };
}

// ─── page generation ──────────────────────────────────────────────────
function generatePages() {
  const pages = [];

  // 1. HUB pages
  for (const hub of HUBS) {
    const pairKey = `hub:${hub.key}`;
    if (ONLY && ONLY !== pairKey) continue;
    const childAreas = hub.neighborhoods.map((k) => AREAS_BY_KEY[k]).filter(Boolean);
    const blocks = buildHubLayout(hub);
    const seo = buildHubSeo(hub, childAreas);
    pages.push({
      page_slug: hub.slug,
      page_title: `Dentist in ${hub.name}`,
      layout_json: [
        { _seo: { title: seo.title, description: seo.description, ogImage: seo.ogImage, jsonLd: seo.jsonLd } },
        ...blocks,
      ],
      is_published: true,
      is_template: false,
      template_type: "location-hub",
    });
  }

  // 2. Intent × CORE-tier area pages
  for (const intent of INTENTS) {
    for (const area of AREAS) {
      // Tier filter: skip specialized areas for general-dentistry intents.
      if (area.tier === "specialized" && intent.tierRequirement !== "specialized") continue;

      const pairKey = `${intent.key}:${area.key}`;
      if (ONLY && ONLY !== pairKey) continue;

      const vars = {
        area: area.name,
        clinic: CLINIC.name,
        doctor: CLINIC.doctor,
        phone: CLINIC.phoneDisplay,
        rating: String(CLINIC.rating),
        reviews: String(CLINIC.reviewCount),
        distance: `${area.distanceFromClinicKm} km`,
      };

      const ov = OVERRIDES[pairKey] || {};
      const slug = ov.slug || slugify(fill(intent.slugTemplate, { area: area.key }));
      const h1 = ov.h1 || fill(intent.h1, vars);
      const title = ov.title || fill(intent.title, vars);
      const description = ov.description || fill(intent.description, vars);

      const blocks = buildLayout({ intent, area, h1, description });
      const faqs = buildIntentFaqs(intent, area);
      const seo = buildIntentSeo({ intent, area, title, description, slug, faqs });

      pages.push({
        page_slug: slug,
        page_title: h1,
        layout_json: [
          { _seo: { title, description, ogImage: seo.ogImage, jsonLd: seo.jsonLd } },
          ...blocks,
        ],
        is_published: true,
        is_template: false,
        template_type: "location-landing",
      });
    }
  }

  // 3. Service × ALL areas
  for (const service of SERVICES) {
    for (const area of AREAS) {
      const pairKey = `${service.key}:${area.key}`;
      if (ONLY && ONLY !== pairKey) continue;

      const vars = {
        area: area.name,
        clinic: CLINIC.name,
        doctor: CLINIC.doctor,
        phone: CLINIC.phoneDisplay,
        rating: String(CLINIC.rating),
        reviews: String(CLINIC.reviewCount),
      };
      const ov = OVERRIDES[pairKey] || {};
      const slug = ov.slug || slugify(`${service.key}-in-${area.key}`);
      const h1 = ov.h1 || fill(service.h1, vars);
      const title = ov.title || fill(service.title, vars);
      const description = ov.description || fill(service.description, vars);

      const blocks = buildServiceLayout({ service, area, h1, description });
      const faqs = buildServiceFaqs(service, area);
      const seo = buildServiceSeo({ service, area, title, description, slug, faqs });

      pages.push({
        page_slug: slug,
        page_title: h1,
        layout_json: [
          { _seo: { title, description, ogImage: seo.ogImage, jsonLd: seo.jsonLd } },
          ...blocks,
        ],
        is_published: true,
        is_template: false,
        template_type: "service-location-landing",
      });
    }
  }

  return pages;
}

// ─── Supabase upsert ──────────────────────────────────────────────────
async function findExisting(slug) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/page_layouts?select=id&page_slug=eq.${encodeURIComponent(slug)}`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
  );
  if (!r.ok) throw new Error(`lookup failed for ${slug}: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  return rows[0]?.id || null;
}

async function upsertPage(page) {
  const existingId = await findExisting(page.page_slug);
  const body = { ...page, updated_at: new Date().toISOString() };

  if (existingId) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/page_layouts?id=eq.${existingId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`update ${page.page_slug}: ${r.status} ${await r.text()}`);
    return "updated";
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/page_layouts`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`insert ${page.page_slug}: ${r.status} ${await r.text()}`);
  return "inserted";
}

// ─── main ─────────────────────────────────────────────────────────────
async function main() {
  const pages = generatePages();
  // Quick breakdown by template_type for visibility.
  const counts = pages.reduce((m, p) => {
    m[p.template_type] = (m[p.template_type] || 0) + 1;
    return m;
  }, {});
  console.log(`[locations] Generated ${pages.length} pages:`, counts);

  if (DRY_RUN) {
    for (const p of pages.slice(0, 12)) {
      console.log(` - [${p.template_type}] /${p.page_slug}/  →  "${p.page_title}"`);
    }
    if (pages.length > 12) console.log(`   …and ${pages.length - 12} more`);
    console.log(`[locations] Dry run — no writes performed.`);
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "[locations] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (or anon key). Aborting.",
    );
    process.exit(1);
  }

  let inserted = 0,
    updated = 0,
    failed = 0;
  for (const page of pages) {
    try {
      const action = await upsertPage(page);
      if (action === "inserted") inserted++;
      else updated++;
      console.log(` ${action === "inserted" ? "+" : "~"} [${page.template_type}] /${page.page_slug}/`);
    } catch (err) {
      failed++;
      console.error(` x /${page.page_slug}/  →  ${err.message}`);
    }
  }

  console.log(`\n[locations] Done — ${inserted} inserted, ${updated} updated, ${failed} failed`);
  console.log(`[locations] These pages will be auto-included in the next prerender + sitemap build.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("[locations] Fatal:", e);
  process.exit(1);
});
