/**
 * Location landing-page seed configuration — Hub & Spoke architecture.
 *
 * 6 Master Hubs, each with multiple neighborhood "spokes". Areas are tagged
 * `tier: "core" | "specialized"`:
 *   - core         → general-dentistry intents (best/dentist-in/top-rated/emergency)
 *                    AND all 5 high-ticket services
 *   - specialized  → ONLY high-ticket services (implants, RCT, braces, aligners,
 *                    smile design)
 *
 * Run:  node scripts/generate-location-pages.mjs
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

// ─── 6 Master Hubs ────────────────────────────────────────────────────
export const HUBS = [
  {
    key: "garia-core",
    name: "Garia & Core South",
    slug: "dentist-in-garia-core",
    tagline: "Our home turf — Garia, Sonarpur, Narendrapur, Patuli and surrounding lanes.",
    transitNote:
      "All neighborhoods in this hub are within 6 km of the clinic at 21, Garia Park, with direct bus, auto and Metro (Kavi Subhash) access.",
    neighborhoods: [
      "garia",
      "garia-park",
      "garia-buddha-mandir",
      "near-andrews-college",
      "narendrapur",
      "sonarpur",
      "baruipur",
      "kamalgazi",
      "mahamayatala",
      "patuli",
    ],
  },
  {
    key: "metro-corridor",
    name: "Metro Corridor",
    slug: "dentist-in-metro-corridor",
    tagline: "Along the Kavi Subhash Metro line — Naktala, Bansdroni, Kudghat, Tollygunge.",
    transitNote:
      "Direct Metro access via the Kavi Subhash extension makes this corridor a quick 15–25 minute ride to Garia Bazar Metro, then 5 min to the clinic.",
    neighborhoods: ["naktala", "bansdroni", "kudghat", "tollygunge", "haridevpur"],
  },
  {
    key: "em-bypass-east",
    name: "EM Bypass & East",
    slug: "dentist-in-em-bypass-east",
    tagline: "EM Bypass corridor — Ajaynagar, Santoshpur, Ruby, Anandapur, Kasba.",
    transitNote:
      "Driving via the EM Bypass reaches the clinic in 15–25 minutes; Ruby crossing to Garia Park is a single straight run.",
    neighborhoods: [
      "em-bypass",
      "ajaynagar",
      "santoshpur",
      "ruby-park",
      "anandapur",
      "kasba",
    ],
  },
  {
    key: "central-south",
    name: "Central South",
    slug: "dentist-in-central-south",
    tagline: "Jadavpur, Prince Anwar Shah Road, Golf Green, Bijoygarh, Salimpur.",
    transitNote:
      "Reach us in 15–20 minutes via Raja S.C. Mallick Road or Prince Anwar Shah Road; Jadavpur 8B bus stand is a direct auto route.",
    neighborhoods: [
      "jadavpur",
      "prince-anwar-shah-road",
      "golf-green",
      "bijoygarh",
      "salimpur",
    ],
  },
  {
    key: "southern-urban",
    name: "Southern Urban",
    slug: "dentist-in-southern-urban",
    tagline: "Dhakuria, Golpark, Gariahat, Ballygunge, Garfa.",
    transitNote:
      "From the Gariahat–Ballygunge belt, take any Garia-bound bus or auto down Gariahat Road / Prince Anwar Shah Road — 25–30 minutes by car.",
    neighborhoods: ["dhakuria", "golpark", "gariahat", "ballygunge", "garfa"],
  },
  {
    key: "behala-west",
    name: "Behala / West",
    slug: "dentist-in-behala-west",
    tagline: "Behala and the western South Kolkata belt.",
    transitNote:
      "Patients from Behala typically reach us in 35–45 minutes via Tollygunge / James Long Sarani; we are happy to arrange consult-by-WhatsApp before you travel.",
    neighborhoods: ["behala"],
  },
];

// ─── Areas (spokes) ───────────────────────────────────────────────────
// tier: "core" → general-dentistry pages allowed; "specialized" → services only
export const AREAS = [
  // ── garia-core (CORE) ──
  {
    key: "garia",
    name: "Garia",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Garia Buddha Mandir", "Garia Park", "Garia Park Club", "Andrews College"],
    nearby: ["Naktala", "Patuli", "Baghajatin"],
    distanceFromClinicKm: 0,
    transitNote: "On foot — the clinic is at the heart of Garia, opposite Garia Park Club.",
    uniqueIntro:
      "Garia is the heart of our practice — Smilz Dental has served families across the Garia neighbourhood since 1999, just steps from Garia Park.",
    uniqueAngle:
      "If you live or work anywhere between Garia Bazaar, Garia Station and Kamdahari, our clinic is the closest fully-equipped dental facility with implant, root-canal and orthodontic specialists under one roof.",
  },
  {
    key: "garia-park",
    name: "Garia Park",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Garia Park", "Garia Park Club", "Andrews College"],
    nearby: ["Garia", "Naktala"],
    distanceFromClinicKm: 0.1,
    transitNote: "Literally across the road — 1-minute walk from anywhere on Garia Park lanes.",
    uniqueIntro:
      "Smilz Dental is literally across the road from Garia Park — the most convenient dental clinic for residents of the Garia Park colony and adjoining lanes.",
    uniqueAngle:
      "If you walk in Garia Park every morning, drop in for a quick scaling, consultation or follow-up — we keep dedicated walk-in slots for neighbourhood patients.",
  },
  {
    key: "garia-buddha-mandir",
    name: "Garia Buddha Mandir",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Garia Buddha Mandir", "Garia Metro Station"],
    nearby: ["Garia Park", "Naktala"],
    distanceFromClinicKm: 0.6,
    transitNote: "5-minute walk down Raja S.C. Mallick Road, or one stop by auto.",
    uniqueIntro:
      "Patients arriving via the Garia Buddha Mandir bus stop or the new Garia Metro terminus reach our clinic in under 10 minutes on foot.",
    uniqueAngle:
      "If you are in the Buddha Mandir area, the easiest route is straight down Raja S.C. Mallick Road towards Garia Park — we are opposite the Garia Park Club.",
  },
  {
    key: "near-andrews-college",
    name: "Andrews College",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Andrews College", "Garia Park"],
    nearby: ["Garia", "Patuli"],
    distanceFromClinicKm: 0.2,
    transitNote: "Directly adjacent to the clinic — a 2-minute walk from Andrews College gate.",
    uniqueIntro:
      "Students and faculty of Andrews College have visited Smilz Dental for over two decades for braces, wisdom-tooth extractions and routine check-ups.",
    uniqueAngle:
      "If you are in the Andrews College area, our clinic offers student-friendly evening hours and EMI options on braces and aligners.",
  },
  {
    key: "narendrapur",
    name: "Narendrapur",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Narendrapur Ramakrishna Mission", "Narendrapur Station"],
    nearby: ["Garia", "Sonarpur"],
    distanceFromClinicKm: 3.5,
    transitNote: "10–12 minutes by car via Sonarpur Station Road; frequent autos to Garia Park.",
    uniqueIntro:
      "Narendrapur families have trusted Smilz Dental for complex implant and full-mouth-rehabilitation cases for years — a 10-minute drive via Sonarpur Station Road.",
    uniqueAngle:
      "Patients from Narendrapur Ramakrishna Mission area frequently visit us for second opinions on implants and root-canal retreatment.",
  },
  {
    key: "sonarpur",
    name: "Sonarpur",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Sonarpur Station", "Rajpur Sonarpur Municipality"],
    nearby: ["Narendrapur", "Garia"],
    distanceFromClinicKm: 5.5,
    transitNote: "15–20 minutes via Garia bypass; ample on-street parking outside the clinic.",
    uniqueIntro:
      "Sonarpur residents choose Smilz Dental for advanced procedures unavailable locally — guided implant surgery, clear aligners and digital smile design.",
    uniqueAngle:
      "Patients from Sonarpur and Rajpur typically reach us in 15–20 minutes via the Garia bypass; ample on-street parking is available outside the clinic.",
  },
  {
    key: "baruipur",
    name: "Baruipur",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Baruipur Station", "Baruipur Court"],
    nearby: ["Sonarpur", "Narendrapur"],
    distanceFromClinicKm: 12,
    transitNote:
      "30–40 minutes by car via Baruipur Bypass; local trains to Sonarpur then 15-min auto.",
    uniqueIntro:
      "Baruipur families travel to Smilz Dental for advanced implant and orthodontic care not yet available in their immediate locality.",
    uniqueAngle:
      "We coordinate consults via WhatsApp and consolidate visits so Baruipur patients minimise travel for multi-appointment treatments like implants and braces.",
  },
  {
    key: "kamalgazi",
    name: "Kamalgazi",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Kamalgazi More", "Kamalgazi Bypass"],
    nearby: ["Narendrapur", "Sonarpur"],
    distanceFromClinicKm: 4,
    transitNote: "10–15 minutes via the EM Bypass / Garia connector; frequent autos.",
    uniqueIntro:
      "Kamalgazi residents reach Smilz Dental in under 15 minutes — a popular choice for families seeking implants, aligners and complete dental care.",
    uniqueAngle:
      "Patients from Kamalgazi More and the surrounding Bypass colonies regularly visit us for orthodontic and cosmetic dentistry consultations.",
  },
  {
    key: "mahamayatala",
    name: "Mahamayatala",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Mahamayatala Crossing", "Boral More"],
    nearby: ["Garia", "Kamalgazi"],
    distanceFromClinicKm: 2.8,
    transitNote: "8–12 minutes by auto via Garia Main Road.",
    uniqueIntro:
      "Mahamayatala patients have been part of our practice for over two decades — short, predictable commute via Garia Main Road.",
    uniqueAngle:
      "If you live near Mahamayatala Crossing, our clinic is the closest one-stop facility for implants, RCT and orthodontics.",
  },
  {
    key: "patuli",
    name: "Patuli",
    parentHub: "garia-core",
    tier: "core",
    landmarks: ["Patuli Lake", "Patuli Bus Stand"],
    nearby: ["Baghajatin", "Garia"],
    distanceFromClinicKm: 1.8,
    transitNote: "5-minute drive along the EM Bypass service road.",
    uniqueIntro:
      "Patuli residents are among our most regular visitors — the clinic is a 5-minute drive from Patuli Lake along the EM Bypass service road.",
    uniqueAngle:
      "If you walk around Patuli Jheel in the evenings, our extended evening hours (5–9 PM) make routine visits effortless.",
  },

  // ── metro-corridor (CORE) ──
  {
    key: "naktala",
    name: "Naktala",
    parentHub: "metro-corridor",
    tier: "core",
    landmarks: ["Naktala Bazaar", "Naktala High School"],
    nearby: ["Garia", "Bansdroni"],
    distanceFromClinicKm: 1.2,
    transitNote: "5-minute drive via Garia Main Road; one Metro stop from Garia Bazar.",
    uniqueIntro:
      "Naktala families have relied on Smilz Dental for paediatric dentistry, braces and family check-ups since the late 1990s.",
    uniqueAngle:
      "If you are near Naktala High School or Naktala Bazaar, our clinic is a quick 5-minute drive via Garia Main Road — we offer dedicated kids' slots after school hours.",
  },
  {
    key: "bansdroni",
    name: "Bansdroni",
    parentHub: "metro-corridor",
    tier: "core",
    landmarks: ["Bansdroni Metro", "Bansdroni Bazaar"],
    nearby: ["Naktala", "Kudghat"],
    distanceFromClinicKm: 3,
    transitNote: "10 minutes via the Metro to Garia Bazar, then 5-min auto.",
    uniqueIntro:
      "Bansdroni residents have direct Metro access to our clinic — a single ride to Garia Bazar followed by a short auto.",
    uniqueAngle:
      "Patients from Bansdroni regularly visit for orthodontic care and adult implants with predictable, traffic-free Metro commutes.",
  },
  {
    key: "kudghat",
    name: "Kudghat",
    parentHub: "metro-corridor",
    tier: "core",
    landmarks: ["Kudghat Metro Station"],
    nearby: ["Bansdroni", "Tollygunge"],
    distanceFromClinicKm: 4.5,
    transitNote: "Two Metro stops to Garia Bazar plus a 5-minute auto.",
    uniqueIntro:
      "Kudghat residents reach Smilz Dental car-free via the Kavi Subhash Metro extension — ideal for elderly patients and routine follow-ups.",
    uniqueAngle:
      "We accept advance Metro-friendly appointments so Kudghat patients can plan their travel windows.",
  },
  {
    key: "tollygunge",
    name: "Tollygunge",
    parentHub: "metro-corridor",
    tier: "core",
    landmarks: ["Tollygunge Metro", "Rabindra Sarobar", "Tollygunge Club"],
    nearby: ["Bansdroni", "Naktala", "Jadavpur"],
    distanceFromClinicKm: 6.2,
    transitNote: "20-minute drive down Raja S.C. Mallick Road, or Metro to Garia Bazar.",
    uniqueIntro:
      "Tollygunge residents visit Smilz Dental for advanced cosmetic dentistry, smile designing and guided implant procedures unavailable at most local clinics.",
    uniqueAngle:
      "From Tollygunge Metro it is a 20-minute drive down Raja S.C. Mallick Road — patients regularly travel from Tollygunge Club and Rabindra Sarobar for our digital smile-design and full-mouth-rehab work.",
  },
  {
    key: "haridevpur",
    name: "Haridevpur",
    parentHub: "metro-corridor",
    tier: "core",
    landmarks: ["Haridevpur Bazaar", "Haridevpur Police Station"],
    nearby: ["Tollygunge", "Bansdroni"],
    distanceFromClinicKm: 7,
    transitNote: "25-minute drive via Tollygunge / James Long Sarani.",
    uniqueIntro:
      "Haridevpur families travel to Smilz Dental for full-mouth rehabilitation, smile makeovers and complex orthodontic cases.",
    uniqueAngle:
      "We schedule combined consults so Haridevpur patients can complete planning and imaging in a single visit.",
  },

  // ── em-bypass-east (SPECIALIZED) ──
  {
    key: "em-bypass",
    name: "EM Bypass",
    parentHub: "em-bypass-east",
    tier: "specialized",
    landmarks: ["Science City", "Ruby Crossing"],
    nearby: ["Anandapur", "Ruby Park"],
    distanceFromClinicKm: 6,
    transitNote: "20 minutes straight down the Bypass to Garia Park.",
    uniqueIntro:
      "EM Bypass residents reach Smilz Dental in a straight 20-minute drive — the natural choice for advanced implants and full-mouth rehab.",
    uniqueAngle:
      "We offer Bypass patients consolidated single-day workups (CBCT + planning + initial procedure) to minimise repeat travel.",
  },
  {
    key: "ajaynagar",
    name: "Ajaynagar",
    parentHub: "em-bypass-east",
    tier: "specialized",
    landmarks: ["Ajaynagar Bus Stop", "Ruby Hospital"],
    nearby: ["Anandapur", "Kalikapur"],
    distanceFromClinicKm: 5,
    transitNote: "15–20 minutes via the EM Bypass.",
    uniqueIntro:
      "Ajaynagar patients regularly choose Smilz Dental for guided implants and Invisalign-style aligners.",
    uniqueAngle:
      "Our digital workflow and CBCT planning allow Ajaynagar patients to complete implant cases in fewer visits.",
  },
  {
    key: "santoshpur",
    name: "Santoshpur",
    parentHub: "em-bypass-east",
    tier: "specialized",
    landmarks: ["Santoshpur Lake", "Santoshpur Bazaar"],
    nearby: ["Jadavpur", "EM Bypass"],
    distanceFromClinicKm: 5.5,
    transitNote: "20-minute drive via Bypass / Garia Main Road.",
    uniqueIntro:
      "Santoshpur families visit us for cosmetic dentistry, smile designing and complete orthodontic care.",
    uniqueAngle:
      "Patients from Santoshpur appreciate our transparent EMI plans on long-duration treatments like braces and aligners.",
  },
  {
    key: "ruby-park",
    name: "Ruby Park",
    parentHub: "em-bypass-east",
    tier: "specialized",
    landmarks: ["Ruby Hospital", "Ruby Crossing"],
    nearby: ["Anandapur", "Kasba"],
    distanceFromClinicKm: 6.5,
    transitNote: "20–25 minutes straight south on the EM Bypass.",
    uniqueIntro:
      "Ruby Park residents come to Smilz Dental for advanced restorative dentistry — implants, RCT and full-mouth rehab.",
    uniqueAngle:
      "We coordinate with referring physicians at Ruby Hospital for medically-complex dental cases.",
  },
  {
    key: "anandapur",
    name: "Anandapur",
    parentHub: "em-bypass-east",
    tier: "specialized",
    landmarks: ["Anandapur Crossing", "Eastern Metropolitan Bypass"],
    nearby: ["Ajaynagar", "Ruby Park"],
    distanceFromClinicKm: 6,
    transitNote: "20-minute drive via the Bypass.",
    uniqueIntro:
      "Anandapur professionals choose Smilz Dental for clear aligners and cosmetic dentistry that fit demanding schedules.",
    uniqueAngle:
      "Evening 5–9 PM appointments make Smilz Dental practical for Anandapur's working professionals.",
  },
  {
    key: "kasba",
    name: "Kasba",
    parentHub: "em-bypass-east",
    tier: "specialized",
    landmarks: ["Kasba Golpark", "Acropolis Mall"],
    nearby: ["Ruby Park", "Ballygunge"],
    distanceFromClinicKm: 7.5,
    transitNote: "25-minute drive via Bypass / Prince Anwar Shah Road.",
    uniqueIntro:
      "Kasba families visit Smilz Dental for orthodontics, cosmetic dentistry and second-opinion implant consults.",
    uniqueAngle:
      "We provide written quotes and CBCT-based plans so Kasba patients can compare and decide confidently.",
  },

  // ── central-south (SPECIALIZED) ──
  {
    key: "jadavpur",
    name: "Jadavpur",
    parentHub: "central-south",
    tier: "specialized",
    landmarks: ["Jadavpur University", "8B Bus Stand"],
    nearby: ["Baghajatin", "Garia"],
    distanceFromClinicKm: 4.0,
    transitNote: "12–15 minutes by bus or auto via Raja S.C. Mallick Road.",
    uniqueIntro:
      "Jadavpur University students, faculty and 8B-route commuters visit Smilz Dental for affordable braces, aligners and wisdom-tooth care.",
    uniqueAngle:
      "From Jadavpur 8B bus stand take any Garia-bound bus or auto — we are 12–15 minutes away with EMI options on orthodontic treatments.",
  },
  {
    key: "prince-anwar-shah-road",
    name: "Prince Anwar Shah Road",
    parentHub: "central-south",
    tier: "specialized",
    landmarks: ["South City Mall", "Prince Anwar Shah Road Crossing"],
    nearby: ["Jadavpur", "Golf Green"],
    distanceFromClinicKm: 5,
    transitNote: "15–20 minutes by car via Prince Anwar Shah Road.",
    uniqueIntro:
      "Residents of the Prince Anwar Shah Road belt regularly visit Smilz Dental for premium cosmetic and implant work.",
    uniqueAngle:
      "We offer same-day digital smile previews so PASR patients can visualise treatment outcomes before committing.",
  },
  {
    key: "golf-green",
    name: "Golf Green",
    parentHub: "central-south",
    tier: "specialized",
    landmarks: ["Golf Green Central Park", "Jodhpur Park"],
    nearby: ["Jadavpur", "Tollygunge"],
    distanceFromClinicKm: 5.5,
    transitNote: "15–20 minutes by car via Raja S.C. Mallick Road.",
    uniqueIntro:
      "Golf Green families have visited Smilz Dental across generations for orthodontics, cosmetic and restorative care.",
    uniqueAngle:
      "Patients from Golf Green often combine routine check-ups with their parents' implant follow-ups in single visits.",
  },
  {
    key: "bijoygarh",
    name: "Bijoygarh",
    parentHub: "central-south",
    tier: "specialized",
    landmarks: ["Bijoygarh Bazaar", "Jadavpur 8B"],
    nearby: ["Jadavpur", "Garfa"],
    distanceFromClinicKm: 4.5,
    transitNote: "15-minute auto ride via Garia Main Road.",
    uniqueIntro:
      "Bijoygarh residents reach Smilz Dental quickly for braces, RCT and cosmetic dentistry.",
    uniqueAngle:
      "We schedule weekend slots specifically for Bijoygarh families balancing school and work.",
  },
  {
    key: "salimpur",
    name: "Salimpur",
    parentHub: "central-south",
    tier: "specialized",
    landmarks: ["Salimpur Road", "Dhakuria Lake"],
    nearby: ["Dhakuria", "Jadavpur"],
    distanceFromClinicKm: 5,
    transitNote: "15–18 minutes by car via Dhakuria–Garia route.",
    uniqueIntro:
      "Salimpur patients trust Smilz Dental for transparent quotes and predictable orthodontic and implant outcomes.",
    uniqueAngle:
      "Free initial orthodontic consultations make planning straightforward for Salimpur families.",
  },

  // ── southern-urban (SPECIALIZED) ──
  {
    key: "dhakuria",
    name: "Dhakuria",
    parentHub: "southern-urban",
    tier: "specialized",
    landmarks: ["Dhakuria Lake", "Dhakuria Station"],
    nearby: ["Salimpur", "Golpark"],
    distanceFromClinicKm: 6,
    transitNote: "20-minute drive via Gariahat Road / Garia Main Road.",
    uniqueIntro:
      "Dhakuria residents visit Smilz Dental for full-mouth rehab, implants and aligners.",
    uniqueAngle:
      "We provide pre-visit WhatsApp consults so Dhakuria patients arrive with a clear plan in hand.",
  },
  {
    key: "golpark",
    name: "Golpark",
    parentHub: "southern-urban",
    tier: "specialized",
    landmarks: ["Golpark Crossing", "Ramakrishna Mission Institute of Culture"],
    nearby: ["Gariahat", "Dhakuria"],
    distanceFromClinicKm: 7,
    transitNote: "25-minute drive via Gariahat Road.",
    uniqueIntro:
      "Golpark patients come to Smilz Dental for premium cosmetic dentistry and complete implant rehabilitation.",
    uniqueAngle:
      "Our digital smile-design previews and CBCT-guided implants are popular with Golpark's discerning patients.",
  },
  {
    key: "gariahat",
    name: "Gariahat",
    parentHub: "southern-urban",
    tier: "specialized",
    landmarks: ["Gariahat Crossing", "Gariahat Market"],
    nearby: ["Ballygunge", "Golpark"],
    distanceFromClinicKm: 7.5,
    transitNote: "25–30 minutes via Gariahat Road / Prince Anwar Shah Road.",
    uniqueIntro:
      "Gariahat families regularly travel to Smilz Dental for advanced cosmetic and restorative work.",
    uniqueAngle:
      "We consolidate appointments to make Gariahat patients' visits efficient and worth the travel.",
  },
  {
    key: "ballygunge",
    name: "Ballygunge",
    parentHub: "southern-urban",
    tier: "specialized",
    landmarks: ["Ballygunge Phari", "Ballygunge Station"],
    nearby: ["Gariahat", "Kasba"],
    distanceFromClinicKm: 8,
    transitNote: "25–30 minutes by car via Prince Anwar Shah Road.",
    uniqueIntro:
      "Ballygunge patients trust Smilz Dental for premium implant and orthodontic care delivered with transparent pricing.",
    uniqueAngle:
      "Detailed written treatment plans help Ballygunge patients make informed decisions on long-duration cases.",
  },
  {
    key: "garfa",
    name: "Garfa",
    parentHub: "southern-urban",
    tier: "specialized",
    landmarks: ["Garfa Main Road", "Garfa Bazaar"],
    nearby: ["Jadavpur", "Santoshpur"],
    distanceFromClinicKm: 4,
    transitNote: "12–15 minutes by auto via Garia Main Road.",
    uniqueIntro:
      "Garfa residents reach Smilz Dental quickly for braces, implants and cosmetic dentistry.",
    uniqueAngle:
      "Evening and weekend slots make our clinic practical for working Garfa families.",
  },

  // ── behala-west (SPECIALIZED) ──
  {
    key: "behala",
    name: "Behala",
    parentHub: "behala-west",
    tier: "specialized",
    landmarks: ["Behala Chowrasta", "Behala Tram Depot"],
    nearby: ["Tollygunge", "Haridevpur"],
    distanceFromClinicKm: 12,
    transitNote: "35–45 minutes via Tollygunge / James Long Sarani.",
    uniqueIntro:
      "Behala patients travel to Smilz Dental for advanced implant and full-mouth rehabilitation by Dr. Dibyendu Dutta.",
    uniqueAngle:
      "We offer pre-visit WhatsApp consults and consolidated appointment days so Behala patients minimise their commute.",
  },
];

// ─── Intent variants (general dentistry) — CORE-tier areas only ───────
export const INTENTS = [
  {
    key: "best-dentist-in",
    slugTemplate: "best-dentist-in-{area}",
    h1: "Best Dentist in {area}",
    title: "Best Dentist in {area} | Smilz Dental Garia",
    description:
      "Looking for the best dentist in {area}? Smilz Dental, led by {doctor}, offers 25+ years of trusted dental care — implants, root canal, braces, aligners and cosmetic dentistry. {rating}★ Google rated. Book on {phone}.",
    angle: "expertise",
    tierRequirement: "core",
  },
  {
    key: "dentist-in",
    slugTemplate: "dentist-in-{area}",
    h1: "Dentist in {area}",
    title: "Dentist in {area} | {clinic}",
    description:
      "Need a dentist in {area}? Smilz Dental, led by {doctor}, delivers implants, painless root canal, braces, clear aligners and cosmetic dentistry under one roof. Rated {rating}★. Call {phone}.",
    angle: "general",
    tierRequirement: "core",
  },
  {
    key: "top-rated-dentist-in",
    slugTemplate: "top-rated-dentist-in-{area}",
    h1: "Top-Rated Dentist in {area}",
    title: "Top-Rated Dentist in {area} | Smilz Dental",
    description:
      "Smilz Dental serves {area} with {rating}★ on Google ({reviews}+ reviews). {doctor} provides expert implants, painless root canal, braces, aligners and cosmetic dentistry. Established 1999. Book on {phone}.",
    angle: "social-proof",
    tierRequirement: "core",
  },
  {
    key: "emergency-dentist-in",
    slugTemplate: "emergency-dentist-in-{area}",
    h1: "Emergency Dentist in {area}",
    title: "Emergency Dentist in {area} | Same-Day Care | Smilz",
    description:
      "Dental emergency in {area}? Smilz Dental offers same-day pain relief, emergency root canal, extractions, broken-tooth repair and swelling treatment by {doctor}. Call {phone} or WhatsApp now.",
    angle: "urgency",
    tierRequirement: "core",
  },
];

// ─── Service variants — generated for ALL areas (core + specialized) ──
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
    title: "Root Canal in {area} | Painless RCT | Smilz Dental",
    description:
      "Painless single-visit root canal in {area}. {doctor} at Smilz Dental uses rotary endodontics, apex locators and digital X-rays — finished with tooth-coloured crowns. Call {phone}.",
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
      "Braces and clear aligners in {area} with EMI options. Metal, ceramic, self-ligating and Invisalign-style invisible aligners by {doctor} for teens and adults. Free orthodontic consultation. Book on {phone}.",
    schemaServiceType: "Orthodontics",
    body:
      "Choose from metal, ceramic, self-ligating braces or virtually invisible clear aligners. Treatment plans typically run 12–24 months with free monthly follow-ups.",
  },
  {
    key: "smile-designing",
    name: "Smile Designing",
    serviceSlug: "smile-designing",
    h1: "Smile Designing in {area}",
    title: "Smile Designing in {area} | Smilz Dental Garia",
    description:
      "Smile designing in {area} with digital previews, porcelain veneers, professional whitening and gum contouring. {doctor} crafts natural, camera-ready smiles tailored to your face. Call {phone}.",
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
      "Guided implant surgery in {area} using 3D CBCT planning and surgical guides for flapless, painless, predictable placement by {doctor} — faster healing, millimetre-accurate. Call {phone}.",
    schemaServiceType: "Dental Implant",
    body:
      "Guided implant placement uses CBCT scans and 3D-printed surgical guides for flapless, minimally-invasive surgery — faster healing, less pain, and millimetre-accurate positioning.",
  },
];

// ─── Per-pair overrides ───────────────────────────────────────────────
export const OVERRIDES = {
  "best-dentist-in:garia": {
    description:
      "Looking for the best dentist in Garia? Smilz Dental, led by Dr. Dibyendu Dutta, has served Garia families since 1999 — implants, painless root canal, braces, aligners and cosmetic dentistry under one roof. 4.8★ Google rated. Call +91 8961 77 5554.",
  },
  "braces-treatment:sonarpur": {
    description:
      "Braces and clear aligners in Sonarpur with EMI options. Metal, ceramic, self-ligating and invisible aligners by Dr. Dibyendu Dutta for teens and adults — free consultation, monthly follow-ups. Call +91 8961 77 5554 to book.",
  },
  "guided-implants:garia-park": {
    description:
      "Guided implant surgery in Garia Park using 3D CBCT planning and surgical guides for flapless, painless, predictable placement by Dr. Dibyendu Dutta. 25+ years' experience — millimetre-accurate. Call +91 8961 77 5554.",
  },
};

// ─── Hero images ──────────────────────────────────────────────────────
export const HERO_IMAGE = {
  default: "/images/hero-dental.webp",
  hub: "/images/hero-dental.webp",
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
  forHub() {
    return this.hub;
  },
};

// ─── Directions ───────────────────────────────────────────────────────
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
