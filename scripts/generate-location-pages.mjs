#!/usr/bin/env node
/**
 * Location-landing-page generator.
 *
 * Reads scripts/location-pages.config.mjs, materializes one page per
 * (intent × area) combination, and upserts it into the page_layouts
 * Supabase table as a published row. Pages are then automatically
 * picked up by:
 *   - scripts/_routes.mjs   (prerender + sitemap)
 *   - public/robots.txt     (already allows /)
 *
 * Idempotent: re-running updates the existing rows in place using
 * page_slug as the natural key (a unique index/constraint on page_slug
 * is assumed; if absent the script still works via select-then-update).
 *
 * Required env:
 *   SUPABASE_URL                (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY   (preferred — bypasses RLS for upsert)
 *   or SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY (only works if RLS allows)
 *
 * Usage:
 *   node scripts/generate-location-pages.mjs
 *   node scripts/generate-location-pages.mjs --dry-run
 *   node scripts/generate-location-pages.mjs --only=best-dentist-in:garia
 */
import { AREAS, INTENTS, SERVICES, OVERRIDES, CLINIC } from "./location-pages.config.mjs";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

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

// ─── content builders ─────────────────────────────────────────────────

/**
 * Build sibling cross-link HTML so each location page links to other
 * areas (same intent) and to its service-area variants. Builds an
 * internal-link cluster Google can crawl for topical authority.
 */
function buildSiblingLinks({ currentArea, currentIntentKey }) {
  // Other areas — same intent
  const siblingAreas = AREAS.filter((a) => a.key !== currentArea.key).slice(0, 8);
  const intentSlug = currentIntentKey || "dentist-in";
  const siblingAreaLinks = siblingAreas
    .map(
      (a) =>
        `<li><a href="/${intentSlug}-${a.key}/">${intentSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} ${a.name}</a></li>`,
    )
    .join("");

  // Service variants for this area
  const serviceVariantLinks = SERVICES.map(
    (s) =>
      `<li><a href="/${s.key}-in-${currentArea.key}/">${s.name} in ${currentArea.name}</a></li>`,
  ).join("");

  return `
    <div class="grid md:grid-cols-2 gap-6 mt-4">
      <div>
        <h3>Dentists in nearby areas</h3>
        <ul>${siblingAreaLinks}</ul>
      </div>
      <div>
        <h3>Treatments for ${currentArea.name} patients</h3>
        <ul>${serviceVariantLinks}</ul>
      </div>
    </div>
  `;
}

function buildLayout({ intent, area, vars, h1, description }) {
  const landmarks = area.landmarks.slice(0, 4).join(", ");
  const nearby = area.nearby.join(", ");

  // A simple, builder-compatible block tree. Falls back to <Hero/Text/CTA>
  // primitives that the existing VisualRenderer already understands.
  return [
    {
      id: id(),
      type: "section",
      props: {
        background: "bg-gradient-to-br from-primary/5 via-background to-accent/5",
        padding: "lg",
      },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 1, align: "center", text: h1 },
        },
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
              <p>Patients from ${nearby} frequently visit us for second opinions, complex implant cases and orthodontic treatment. If you are near ${area.landmarks[0] || area.name}, you can walk in or book a same-day slot by phone or WhatsApp.</p>
              <p>Whether you're searching for a <em>dentist in ${area.name}</em>, the <em>best dentist in ${area.name}</em>, or a <em>top-rated dentist near ${nearby}</em>, our team delivers world-class care across implants, root canal, orthodontics, cosmetic dentistry and emergency treatment — all under one roof.</p>
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
    {
      id: id(),
      type: "section",
      props: { padding: "lg", background: "bg-muted/40" },
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
    {
      id: id(),
      type: "section",
      props: { padding: "lg" },
      children: [
        {
          id: id(),
          type: "heading",
          props: { level: 2, text: `How to reach Smilz Dental from ${area.name}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <p>Our clinic is located at <strong>${CLINIC.address}</strong>, approximately <strong>${area.distanceFromClinicKm} km</strong> from central ${area.name}. Look for landmarks: ${landmarks}. Patients commute easily from ${nearby}.</p>
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
          props: { level: 2, text: `Areas we serve near ${area.name}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: buildSiblingLinks({ currentArea: area, currentIntentKey: intent.key }),
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
            items: buildFaqs(intent, area, vars),
          },
        },
      ],
    },
  ];
}

function buildFaqs(intent, area, vars) {
  const base = [
    {
      q: `Who is the best dentist in ${area.name}?`,
      a: `${CLINIC.doctor} at ${CLINIC.name} is widely considered one of the best dentists serving ${area.name}, with 25+ years of experience and a ${CLINIC.rating}★ Google rating from ${CLINIC.reviewCount}+ patients.`,
    },
    {
      q: `How far is Smilz Dental from ${area.name}?`,
      a: `Our clinic at ${CLINIC.address} is approximately ${area.distanceFromClinicKm} km from ${area.name}. Most patients reach us within 10–15 minutes by car or auto.`,
    },
    {
      q: `Do you accept walk-in patients from ${area.name}?`,
      a: `Yes. While appointments are recommended, we accommodate walk-ins and same-day emergency cases. Call ${CLINIC.phoneDisplay} or WhatsApp ${CLINIC.phoneDisplay} before visiting.`,
    },
    {
      q: `What treatments do you offer for patients in ${area.name}?`,
      a: `We provide the full range of modern dentistry — implants, root canal, braces & aligners, cosmetic dentistry, paediatric care, and emergency treatments — all from our Garia clinic.`,
    },
  ];
  if (intent.angle === "urgency") {
    base.unshift({
      q: `Is there an emergency dentist available in ${area.name}?`,
      a: `Yes. Smilz Dental offers same-day emergency appointments for severe pain, swelling, broken teeth and trauma. Call ${CLINIC.phoneDisplay} immediately — we serve ${area.name} and surrounding areas.`,
    });
  }
  return base;
}

function buildSeo({ intent, area, vars, title, description, slug }) {
  const url = `${SITE}/${slug}/`;
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: CLINIC.name,
    image: `${SITE}/og-image.jpg`,
    "@id": `${SITE}/#dentist`,
    url,
    telephone: CLINIC.phone,
    email: CLINIC.email,
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
    areaServed: [
      area.name,
      ...area.landmarks,
      ...area.nearby,
      "Garia",
      "South Kolkata",
    ].map((n) => ({ "@type": "Place", name: n })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: area.name, item: url },
    ],
  };
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
    jsonLd: [localBusiness, breadcrumbs],
  };
}

// ─── service × area page builders ─────────────────────────────────────
function buildServiceLayout({ service, area, h1, description }) {
  const landmarks = area.landmarks.slice(0, 4).join(", ");
  const nearby = area.nearby.join(", ");
  return [
    {
      id: id(),
      type: "section",
      props: {
        background: "bg-gradient-to-br from-primary/5 via-background to-accent/5",
        padding: "lg",
      },
      children: [
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
          props: { level: 2, text: `How to reach Smilz Dental from ${area.name}` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: `
              <p>Our clinic is located at <strong>${CLINIC.address}</strong>, approximately <strong>${area.distanceFromClinicKm} km</strong> from central ${area.name}. Look for landmarks: ${landmarks}. Patients commute easily from ${nearby}.</p>
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
          props: { level: 2, text: `Also serving nearby areas` },
        },
        {
          id: id(),
          type: "text",
          props: {
            html: buildSiblingLinks({ currentArea: area, currentIntentKey: "dentist-in" }),
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
            items: [
              {
                q: `How much does ${service.name.toLowerCase()} cost in ${area.name}?`,
                a: `${service.name} pricing at Smilz Dental depends on case complexity and materials chosen. We offer transparent quotes after a free consultation and EMI options for ${area.name} patients.`,
              },
              {
                q: `Is ${service.name.toLowerCase()} painful?`,
                a: `No. ${CLINIC.doctor} uses modern painless protocols, profound local anaesthesia and gentle techniques. Most patients report minimal to no discomfort during and after treatment.`,
              },
              {
                q: `How far is the clinic from ${area.name}?`,
                a: `Our clinic at ${CLINIC.address} is approximately ${area.distanceFromClinicKm} km from ${area.name}, typically a 10–15 minute drive.`,
              },
              {
                q: `Do you take walk-in ${service.name.toLowerCase()} consultations?`,
                a: `Yes — call ${CLINIC.phoneDisplay} or WhatsApp us. We reserve daily slots for new ${service.name.toLowerCase()} consultations from ${area.name} and nearby areas.`,
              },
            ],
          },
        },
      ],
    },
  ];
}

function buildServiceSeo({ service, area, title, description, slug }) {
  const url = `${SITE}/${slug}/`;
  const dentist = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: CLINIC.name,
    image: `${SITE}/og-image.jpg`,
    "@id": `${SITE}/#dentist`,
    url,
    telephone: CLINIC.phone,
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
    areaServed: [area.name, ...area.landmarks, ...area.nearby, "Garia", "South Kolkata"].map(
      (n) => ({ "@type": "Place", name: n }),
    ),
  };
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
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE}/services/` },
      { "@type": "ListItem", position: 3, name: `${service.name} in ${area.name}`, item: url },
    ],
  };
  return {
    title,
    description,
    canonical: url,
    ogImage: `${SITE}/og-image.jpg`,
    jsonLd: [dentist, serviceLd, breadcrumbs],
  };
}

// ─── page generation ──────────────────────────────────────────────────
function generatePages() {
  const pages = [];

  // Intent × area pages
  for (const intent of INTENTS) {
    for (const area of AREAS) {
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

      const blocks = buildLayout({ intent, area, vars, h1, description });
      const seo = buildSeo({ intent, area, vars, title, description, slug });

      const layout_json = [
        { _seo: { title, description, ogImage: seo.ogImage, jsonLd: seo.jsonLd } },
        ...blocks,
      ];

      pages.push({
        page_slug: slug,
        page_title: h1,
        layout_json,
        is_published: true,
        is_template: false,
        template_type: "location-landing",
      });
    }
  }

  // Service × area pages
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
      const seo = buildServiceSeo({ service, area, title, description, slug });

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
    {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    },
  );
  if (!r.ok) throw new Error(`lookup failed for ${slug}: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  return rows[0]?.id || null;
}

async function upsertPage(page) {
  const existingId = await findExisting(page.page_slug);
  const body = {
    ...page,
    updated_at: new Date().toISOString(),
  };

  if (existingId) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/page_layouts?id=eq.${existingId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(body),
      },
    );
    if (!r.ok) throw new Error(`update ${page.page_slug}: ${r.status} ${await r.text()}`);
    return "updated";
  } else {
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
}

// ─── main ─────────────────────────────────────────────────────────────
async function main() {
  const pages = generatePages();
  console.log(`[locations] Generated ${pages.length} location landing pages`);

  if (DRY_RUN) {
    for (const p of pages.slice(0, 5)) {
      console.log(` - /${p.page_slug}/  →  "${p.page_title}"`);
    }
    if (pages.length > 5) console.log(`   …and ${pages.length - 5} more`);
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
      console.log(` ${action === "inserted" ? "+" : "~"} /${page.page_slug}/`);
    } catch (err) {
      failed++;
      console.error(` x /${page.page_slug}/  →  ${err.message}`);
    }
  }

  console.log(
    `\n[locations] Done — ${inserted} inserted, ${updated} updated, ${failed} failed`,
  );
  console.log(
    `[locations] These pages will be auto-included in the next prerender + sitemap build.`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("[locations] Fatal:", e);
  process.exit(1);
});
