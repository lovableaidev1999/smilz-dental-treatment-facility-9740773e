import LocationHub from "@/components/seo/LocationHub";

const GariaHub = () => (
  <LocationHub
    slug="garia"
    areaLabel="Garia"
    title="Dentist in Garia, Kolkata | Smilz Dental Clinic near Garia Metro"
    description="Trusted dentist in Garia, Kolkata since 1999. Painless dentistry, implants, aligners & root canal near Garia (Kavi Subhash) metro. Book at Smilz Dental Clinic."
    keywords="dentist Garia, dental clinic Garia, Garia metro dentist, best dentist Garia Kolkata"
    eyebrow="Location Hub · Garia"
    h1="Trusted Dentist in Garia — Advanced Dental Care Near Garia Metro"
    intro="Smilz Dental Treatment Facility has cared for families across Garia and surrounding neighbourhoods since 1999. Our clinic at 21 Garia Park is a short walk from Garia (Kavi Subhash) metro, with weekend and evening slots for working patients."
    heroImageAlt="Reception area at Smilz Dental Clinic near Garia metro, Kolkata"
    whatsappMessage="Hi Smilz Dental, I'd like to book an appointment at your Garia clinic."
    services={[
      { label: "Dental Implants", to: "/services/dental-implants-kolkata", blurb: "CBCT-guided single-tooth, multi-tooth and full-arch implants." },
      { label: "Painless Root Canal", to: "/services/painless-root-canal", blurb: "Single-visit rotary endodontics with modern anaesthesia." },
      { label: "Clear Aligners", to: "/services/clear-aligners-garia", blurb: "Nearly invisible teeth straightening, supervised in-clinic." },
      { label: "Braces & Orthodontics", to: "/braces-aligners-kolkata", blurb: "Metal, ceramic and self-ligating braces for teens and adults." },
      { label: "Smile Designing", to: "/services/smile-designing", blurb: "Veneers, whitening and cosmetic contouring for a natural, confident smile." },
      { label: "Preventive Care", to: "/services/preventive-dental-care", blurb: "Cleaning, scaling and check-ups to keep your family cavity-free." },
    ]}
    neighborhoods={[
      { name: "Garia Park & Garia Bazar", note: "Right at our doorstep — under 5 minutes from most Garia Park addresses." },
      { name: "Kavi Subhash / Garia Metro", note: "One metro exit away; parking available for two-wheelers and cars." },
      { name: "Patuli & Baishnabghata", note: "Reachable in 10–12 minutes by car or auto." },
      { name: "Naktala & Bansdroni", note: "Popular route for families driving down from South Kolkata." },
      { name: "Baghajatin", note: "Trusted by working professionals commuting via Baghajatin station." },
      { name: "Ramgarh & Boral", note: "A short auto ride to the clinic; evening slots for late finishes." },
    ]}
    testimonials={[
      { name: "Priyanka R.", area: "Garia Park", quote: "Dr. Dutta placed my dental implant with almost no discomfort. The clinic is spotless and the team explains every step in Bangla and English.", rating: 5 },
      { name: "Arindam S.", area: "Patuli", quote: "Best clinic near Garia metro. Got my root canal done in a single sitting — no pain, no repeat visits.", rating: 5 },
      { name: "Sohini M.", area: "Baghajatin", quote: "Switched to clear aligners after my earlier braces relapsed. Consistent reviews and honest advice throughout.", rating: 5 },
    ]}
    faqs={[
      { q: "How do I reach Smilz Dental from Garia metro?", a: "Exit Garia (Kavi Subhash) metro and walk toward Garia Park. The clinic is at 21 Garia Park, opposite Garia Park Club — roughly 6–8 minutes on foot, or a very short auto ride." },
      { q: "Do you offer emergency dental appointments in Garia?", a: "Yes. We reserve daily emergency slots for toothaches, broken teeth and post-treatment concerns. Call or WhatsApp on +91 8961775554 for the fastest triage." },
      { q: "Is there parking near the clinic?", a: "Yes — on-street parking is available directly outside the clinic on Garia Park, with additional space nearby for two-wheelers." },
      { q: "What are your clinic hours?", a: "We run two sessions Monday to Saturday — 9:00 AM to 1:00 PM and 5:00 PM to 9:00 PM. Sunday visits are available by prior appointment for emergencies." },
      { q: "Do you treat children at the Garia clinic?", a: "Yes. We offer pediatric dentistry including preventive check-ups, fluoride treatment, fillings and gentle behaviour management for anxious children." },
    ]}
    relatedLinks={[
      { label: "Dentist in South Kolkata", to: "/locations/south-kolkata" },
      { label: "Dental clinic in Garia, Kolkata", to: "/dental-clinic-in-garia-kolkata" },
      { label: "About Smilz Dental", to: "/about" },
      { label: "Contact & directions", to: "/contact" },
    ]}
  />
);

export default GariaHub;
