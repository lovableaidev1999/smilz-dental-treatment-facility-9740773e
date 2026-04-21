/**
 * Location landing-page seed configuration.
 *
 * Edit this file to add/remove areas, intents, or override copy for a
 * specific (intent, area) combination, then run:
 *
 *   node scripts/generate-location-pages.mjs
 *
 * The script will idempotently upsert one published page_layouts row per
 * (intent, area) at the slug listed below. Pages are automatically picked
 * up by scripts/_routes.mjs → prerender + sitemap + robots.
 */

export const CLINIC = {
  name: "Smilz Dental Treatment Facility",
  doctor: "Dr. Dibyendu Dutta",
  phone: "+918961775554",
  phoneDisplay: "+91 8961 77 5554",
  whatsapp: "918961775554",
  email: "dr.d.dutta@gmail.com",
  address: "21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata 700084",
  rating: 4.8,
  reviewCount: 44,
  yearEstablished: 1999,
  geo: { lat: 22.46966133744312, lng: 88.37928013838973 },
  primaryArea: "Garia, Kolkata",
};

/**
 * Areas — each becomes part of the slug + content. `landmarks` and
 * `nearby` weave into the body for hyperlocal relevance.
 */
export const AREAS = [
  {
    key: "garia",
    name: "Garia",
    landmarks: ["Garia Buddha Mandir", "Garia Park", "Garia Park Club", "Andrews College"],
    nearby: ["Naktala", "Patuli", "Baghajatin"],
    distanceFromClinicKm: 0,
    uniqueIntro:
      "Garia is the heart of our practice — Smilz Dental has served families across the Garia neighbourhood since 1999, just steps from Garia Park.",
    uniqueAngle:
      "If you live or work anywhere between Garia Bazaar, Garia Station and Kamdahari, our clinic is the closest fully-equipped dental facility with implant, root-canal and orthodontic specialists under one roof.",
  },
  {
    key: "garia-buddha-mandir",
    name: "Garia Buddha Mandir",
    landmarks: ["Garia Buddha Mandir", "Garia Metro Station"],
    nearby: ["Garia Park", "Naktala"],
    distanceFromClinicKm: 0.6,
  },
  {
    key: "garia-park",
    name: "Garia Park",
    landmarks: ["Garia Park", "Garia Park Club", "Andrews College"],
    nearby: ["Garia", "Naktala"],
    distanceFromClinicKm: 0.1,
  },
  {
    key: "near-andrews-college",
    name: "Andrews College area",
    landmarks: ["Andrews College", "Garia Park"],
    nearby: ["Garia", "Patuli"],
    distanceFromClinicKm: 0.2,
  },
  {
    key: "narendrapur",
    name: "Narendrapur",
    landmarks: ["Narendrapur Ramakrishna Mission", "Narendrapur Station"],
    nearby: ["Garia", "Sonarpur"],
    distanceFromClinicKm: 3.5,
  },
  {
    key: "sonarpur",
    name: "Sonarpur",
    landmarks: ["Sonarpur Station", "Rajpur Sonarpur Municipality"],
    nearby: ["Narendrapur", "Garia"],
    distanceFromClinicKm: 5.5,
  },
  {
    key: "baghajatin",
    name: "Baghajatin",
    landmarks: ["Baghajatin Station", "Baghajatin Bazaar"],
    nearby: ["Patuli", "Garia"],
    distanceFromClinicKm: 2.5,
  },
  {
    key: "patuli",
    name: "Patuli",
    landmarks: ["Patuli Lake", "Patuli Bus Stand"],
    nearby: ["Baghajatin", "Garia"],
    distanceFromClinicKm: 1.8,
  },
  {
    key: "naktala",
    name: "Naktala",
    landmarks: ["Naktala Bazaar", "Naktala High School"],
    nearby: ["Garia", "Bansdroni"],
    distanceFromClinicKm: 1.2,
  },
  {
    key: "jadavpur",
    name: "Jadavpur",
    landmarks: ["Jadavpur University", "8B Bus Stand"],
    nearby: ["Baghajatin", "Garia"],
    distanceFromClinicKm: 4.0,
  },
];

/**
 * Intent variants — each becomes a slug prefix and shapes the H1, title,
 * description, and FAQ angle.
 */
export const INTENTS = [
  {
    key: "best-dentist-in",
    slugTemplate: "best-dentist-in-{area}",
    h1: "Best Dentist in {area}",
    title: "Best Dentist in {area} | {clinic}",
    description:
      "Looking for the best dentist in {area}? Smilz, led by {doctor}, offers 25+ years of trusted dental care — implants, root canal, braces & more. {rating}★ Google rated.",
    angle: "expertise",
  },
  {
    key: "dentist-near-me-in",
    slugTemplate: "dentist-near-me-in-{area}",
    h1: "Dentist Near Me in {area}",
    title: "Dentist Near Me in {area} | Smilz Dental Garia",
    description:
      "Searching for a dentist near you in {area}? Smilz Dental in Garia is just {distance} away — modern clinic, painless treatments, walk-ins welcome. Call {phone}.",
    angle: "proximity",
  },
  {
    key: "highest-rated-dentist-in",
    slugTemplate: "highest-rated-dentist-in-{area}",
    h1: "Highest Google-Rated Dentist in {area}",
    title: "Highest Google-Rated Dentist in {area} | Smilz Dental",
    description:
      "Smilz Dental serves {area} with the highest Google rating ({rating}★, {reviews}+ reviews). {doctor} provides world-class implants, braces & cosmetic dentistry.",
    angle: "social-proof",
  },
  {
    key: "emergency-dentist-in",
    slugTemplate: "emergency-dentist-in-{area}",
    h1: "Emergency Dentist in {area}",
    title: "Emergency Dentist in {area} | Same-Day Care | Smilz",
    description:
      "Dental emergency in {area}? Smilz Dental offers same-day pain relief, emergency root canal & extractions. Call {phone} or WhatsApp now — open Mon–Sat.",
    angle: "urgency",
  },
];

/**
 * Optional per-pair overrides. Key format: "{intentKey}:{areaKey}".
 * Anything you set here wins over the templated defaults.
 *
 * Example:
 *   "best-dentist-in:garia": { h1: "The Most Trusted Dentist in Garia, Kolkata" }
 */
export const OVERRIDES = {};
