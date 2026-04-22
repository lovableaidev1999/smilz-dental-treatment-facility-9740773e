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
    name: "Andrews College",
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
  {
    key: "tollygunge",
    name: "Tollygunge",
    landmarks: ["Tollygunge Metro", "Rabindra Sarobar", "Tollygunge Club"],
    nearby: ["Bansdroni", "Naktala", "Jadavpur"],
    distanceFromClinicKm: 6.2,
    uniqueIntro:
      "Tollygunge residents visit Smilz Dental for advanced cosmetic dentistry, smile designing and guided implant procedures unavailable at most local clinics.",
    uniqueAngle:
      "From Tollygunge Metro it is a 20-minute drive down Raja S.C. Mallick Road — patients regularly travel from Tollygunge Club and Rabindra Sarobar for our digital smile-design and full-mouth-rehab work.",
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
      "Looking for the best dentist in {area}? Smilz Dental, led by {doctor}, offers 25+ years of trusted dental care — implants, root canal, braces, aligners and cosmetic dentistry. {rating}★ Google rated. Book on {phone}.",
    angle: "expertise",
  },
  {
    key: "dentist-in",
    slugTemplate: "dentist-in-{area}",
    h1: "Dentist in {area}",
    title: "Dentist in {area} | {clinic}",
    description:
      "Need a dentist in {area}? Smilz Dental, led by {doctor}, delivers implants, painless root canal, braces, clear aligners and cosmetic dentistry under one roof. Rated {rating}★. Call {phone}.",
    angle: "general",
  },
  {
    key: "top-rated-dentist-in",
    slugTemplate: "top-rated-dentist-in-{area}",
    h1: "Top-Rated Dentist in {area}",
    title: "Top-Rated Dentist in {area} | Smilz Dental",
    description:
      "Smilz Dental serves {area} with {rating}★ on Google ({reviews}+ reviews). {doctor} provides expert implants, painless root canal, braces, aligners and cosmetic dentistry. Established 1999. Book on {phone}.",
    angle: "social-proof",
  },
  {
    key: "emergency-dentist-in",
    slugTemplate: "emergency-dentist-in-{area}",
    h1: "Emergency Dentist in {area}",
    title: "Emergency Dentist in {area} | Same-Day Care | Smilz",
    description:
      "Dental emergency in {area}? Smilz Dental offers same-day pain relief, emergency root canal, extractions, broken-tooth repair and swelling treatment by {doctor}. Call {phone} or WhatsApp now.",
    angle: "urgency",
  },
];

/**
 * Service × area variants. Each generates pages like
 * "dental-implants-in-garia", "root-canal-treatment-in-patuli".
 */
export const SERVICES = [
  {
    key: "dental-implants",
    name: "Dental Implants",
    serviceSlug: "dental-implants",
    h1: "Dental Implants in {area}",
    title: "Dental Implants in {area} | Smilz Dental Garia",
    description:
      "Looking for dental implants in {area}? {doctor} at Smilz Dental offers guided, painless implant placement with lifetime-grade titanium implants — single tooth, multiple teeth and full-mouth All-on-4. CBCT planning, EMI options, {rating}★ Google rated. Call {phone}.",
    schemaServiceType: "Dental Implant",
    body:
      "We provide single-tooth implants, multi-tooth bridges on implants and full-mouth All-on-4/All-on-6 rehabilitation using guided surgery for predictable results.",
  },
  {
    key: "root-canal-treatment",
    name: "Root Canal Treatment",
    serviceSlug: "painless-root-canal-treatment",
    h1: "Root Canal Treatment in {area}",
    title: "Root Canal Treatment in {area} | Painless RCT | Smilz",
    description:
      "Painless root canal treatment in {area} with single-visit options. {doctor} at Smilz Dental uses rotary endodontics, apex locators and digital radiographs for precise, comfortable RCT — most cases finished in one sitting with tooth-coloured crowns. Book on {phone}.",
    schemaServiceType: "Endodontic Therapy",
    body:
      "Our painless single-visit RCT uses modern rotary endodontics, apex locators and digital radiographs — most cases finish in one sitting with no post-op pain.",
  },
  {
    key: "braces-treatment",
    name: "Braces Treatment",
    serviceSlug: "orthodontic-braces",
    h1: "Braces Treatment in {area}",
    title: "Braces & Aligners in {area} | Smilz Dental Garia",
    description:
      "Braces and clear aligners in {area} with EMI options. Metal, ceramic, self-ligating and Invisalign-style invisible aligners by {doctor} for teens and adults. Free orthodontic consultation, monthly follow-ups and digital treatment previews. Book on {phone}.",
    schemaServiceType: "Orthodontics",
    body:
      "Choose from metal, ceramic, self-ligating braces or virtually invisible clear aligners. Treatment plans typically run 12–24 months with free monthly follow-ups.",
  },
  {
    key: "smile-designing",
    name: "Smile Designing",
    serviceSlug: "smile-designing",
    h1: "Smile Designing in {area}",
    title: "Smile Designing in {area} | Digital Smile Design | Smilz",
    description:
      "Smile designing in {area} with digital previews, porcelain veneers, professional whitening, gum contouring and cosmetic bonding. {doctor} crafts natural, camera-ready smiles tailored to your face — see your new smile before treatment begins. Call {phone}.",
    schemaServiceType: "Cosmetic Dentistry",
    body:
      "Our smile designing combines digital smile design (DSD) previews, porcelain veneers, professional whitening and gum contouring — letting you see your new smile before treatment begins.",
  },
  {
    key: "guided-implants",
    name: "Guided Implants",
    serviceSlug: "dental-implants",
    h1: "Guided Implants in {area}",
    title: "Guided Dental Implants in {area} | Smilz Dental",
    description:
      "Guided implant surgery in {area} using 3D CBCT planning and 3D-printed surgical guides for flapless, painless, predictable implant placement. {doctor}, 25+ years' experience — faster healing, less pain and millimetre-accurate positioning. Book on {phone}.",
    schemaServiceType: "Dental Implant",
    body:
      "Guided implant placement uses CBCT scans and 3D-printed surgical guides for flapless, minimally-invasive surgery — faster healing, less pain, and millimetre-accurate positioning.",
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

/**
 * Hero image — shown above the H1 on each generated landing page.
 * Re-uses optimized images already in /public/images so we don't bloat
 * the repo. Override per-intent or per-service if you have richer assets.
 */
export const HERO_IMAGE = {
  default: "/images/hero-dental.webp",
  intents: {
    "best-dentist-in": "/images/doctor.webp",
    "top-rated-dentist-in": "/images/doctor.webp",
    "emergency-dentist-in": "/images/hero-dental.webp",
    "dentist-in": "/images/hero-dental.webp",
  },
  services: {
    "dental-implants": "/images/hero-dental.webp",
    "root-canal-treatment": "/images/hero-dental.webp",
    "braces-treatment": "/images/hero-dental.webp",
    "smile-designing": "/images/hero-dental.webp",
    "guided-implants": "/images/hero-dental.webp",
  },
  forIntent(key) {
    return this.intents[key] || this.default;
  },
  forService(key) {
    return this.services[key] || this.default;
  },
};

/**
 * "Directions from {area}" — bus / auto / metro routes shown as a
 * scannable list (huge for "near me" intent + voice search).
 *
 * Add an `directions` array on any AREAS entry to override per-area;
 * otherwise the `default(area)` fallback below is used.
 */
export const DIRECTIONS = {
  default(area) {
    return [
      {
        mode: "By Auto",
        description: `Take any auto from ${area.name} heading toward Garia Park / Garia Buddha Mandir. Get off at Garia Park Club — the clinic is directly opposite, next to Andrews College.`,
        duration: `${Math.max(5, Math.round(area.distanceFromClinicKm * 4))} min`,
      },
      {
        mode: "By Bus",
        description: `Boarding from ${area.landmarks[0] || area.name}, take any Garia / Kamalgazi / Sonarpur-bound bus and alight at Garia Park stop. Walk 1 minute to the clinic.`,
        duration: `${Math.max(10, Math.round(area.distanceFromClinicKm * 6))} min`,
      },
      {
        mode: "By Metro",
        description: `The nearest station is Garia Bazar (Kavi Subhash extension) / Kavi Subhash Metro. From the station take a 5-minute auto to Garia Park Club — we are opposite.`,
        duration: `${Math.max(10, Math.round(area.distanceFromClinicKm * 5))} min`,
      },
      {
        mode: "By Car",
        description: `From ${area.name} drive via Raja S.C. Mallick Road towards Garia Park. Free street parking is available outside the clinic at 21, Garia Park.`,
        duration: `${Math.max(5, Math.round(area.distanceFromClinicKm * 3))} min`,
      },
    ];
  },
};
