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
    uniqueIntro:
      "Patients arriving via the Garia Buddha Mandir bus stop or the new Garia Metro terminus reach our clinic in under 10 minutes on foot.",
    uniqueAngle:
      "If you are in the Buddha Mandir area, the easiest route is straight down Raja S.C. Mallick Road towards Garia Park — we are opposite the Garia Park Club.",
  },
  {
    key: "garia-park",
    name: "Garia Park",
    landmarks: ["Garia Park", "Garia Park Club", "Andrews College"],
    nearby: ["Garia", "Naktala"],
    distanceFromClinicKm: 0.1,
    uniqueIntro:
      "Smilz Dental is literally across the road from Garia Park — the most convenient dental clinic for residents of the Garia Park colony and adjoining lanes.",
    uniqueAngle:
      "If you walk in Garia Park every morning, drop in for a quick scaling, consultation or follow-up — we keep dedicated walk-in slots for neighbourhood patients.",
  },
  {
    key: "near-andrews-college",
    name: "Andrews College area",
    landmarks: ["Andrews College", "Garia Park"],
    nearby: ["Garia", "Patuli"],
    distanceFromClinicKm: 0.2,
    uniqueIntro:
      "Students and faculty of Andrews College have visited Smilz Dental for over two decades for braces, wisdom-tooth extractions and routine check-ups.",
    uniqueAngle:
      "If you are in the Andrews College area, our clinic offers student-friendly evening hours and EMI options on braces and aligners.",
  },
  {
    key: "narendrapur",
    name: "Narendrapur",
    landmarks: ["Narendrapur Ramakrishna Mission", "Narendrapur Station"],
    nearby: ["Garia", "Sonarpur"],
    distanceFromClinicKm: 3.5,
    uniqueIntro:
      "Narendrapur families have trusted Smilz Dental for complex implant and full-mouth-rehabilitation cases for years — a 10-minute drive via Sonarpur Station Road.",
    uniqueAngle:
      "Patients from Narendrapur Ramakrishna Mission area frequently visit us for second opinions on implants and root-canal retreatment.",
  },
  {
    key: "sonarpur",
    name: "Sonarpur",
    landmarks: ["Sonarpur Station", "Rajpur Sonarpur Municipality"],
    nearby: ["Narendrapur", "Garia"],
    distanceFromClinicKm: 5.5,
    uniqueIntro:
      "Sonarpur residents choose Smilz Dental for advanced procedures unavailable locally — guided implant surgery, clear aligners and digital smile design.",
    uniqueAngle:
      "Patients from Sonarpur and Rajpur typically reach us in 15–20 minutes via the Garia bypass; ample on-street parking is available outside the clinic.",
  },
  {
    key: "baghajatin",
    name: "Baghajatin",
    landmarks: ["Baghajatin Station", "Baghajatin Bazaar"],
    nearby: ["Patuli", "Garia"],
    distanceFromClinicKm: 2.5,
    uniqueIntro:
      "From Baghajatin Station and Bazaar, Smilz Dental is a short auto ride down the Garia main road — a long-time favourite for Baghajatin families.",
    uniqueAngle:
      "If you are near Baghajatin colony, we are the nearest clinic offering single-visit root canals and same-day emergency care.",
  },
  {
    key: "patuli",
    name: "Patuli",
    landmarks: ["Patuli Lake", "Patuli Bus Stand"],
    nearby: ["Baghajatin", "Garia"],
    distanceFromClinicKm: 1.8,
    uniqueIntro:
      "Patuli residents are among our most regular visitors — the clinic is a 5-minute drive from Patuli Lake along the EM Bypass service road.",
    uniqueAngle:
      "If you walk around Patuli Jheel in the evenings, our extended evening hours (5–9 PM) make routine visits effortless.",
  },
  {
    key: "naktala",
    name: "Naktala",
    landmarks: ["Naktala Bazaar", "Naktala High School"],
    nearby: ["Garia", "Bansdroni"],
    distanceFromClinicKm: 1.2,
    uniqueIntro:
      "Naktala families have relied on Smilz Dental for paediatric dentistry, braces and family check-ups since the late 1990s.",
    uniqueAngle:
      "If you are near Naktala High School or Naktala Bazaar, our clinic is a quick 5-minute drive via Garia Main Road — we offer dedicated kids' slots after school hours.",
  },
  {
    key: "jadavpur",
    name: "Jadavpur",
    landmarks: ["Jadavpur University", "8B Bus Stand"],
    nearby: ["Baghajatin", "Garia"],
    distanceFromClinicKm: 4.0,
    uniqueIntro:
      "Jadavpur University students, faculty and 8B-route commuters visit Smilz Dental for affordable braces, aligners and wisdom-tooth care.",
    uniqueAngle:
      "From Jadavpur 8B bus stand take any Garia-bound bus or auto — we are 12–15 minutes away with EMI options on orthodontic treatments.",
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
