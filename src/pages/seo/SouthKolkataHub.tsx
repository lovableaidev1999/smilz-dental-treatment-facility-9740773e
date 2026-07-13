import LocationHub from "@/components/seo/LocationHub";

const SouthKolkataHub = () => (
  <LocationHub
    slug="south-kolkata"
    areaLabel="South Kolkata"
    title="Best Dentist in South Kolkata | Smilz Dental Clinic, Garia"
    description="Trusted dental clinic serving South Kolkata since 1999. Implants, aligners, painless root canal and cosmetic dentistry at Smilz Dental, Garia. Book today."
    keywords="dentist South Kolkata, best dentist South Kolkata, dental clinic South Kolkata, top implantologist South Kolkata"
    eyebrow="Location Hub · South Kolkata"
    h1="Best Dentist in South Kolkata — Modern, Painless, Family-Friendly"
    intro="Patients from across South Kolkata — Garia, Jadavpur, Patuli, Naktala, Sonarpur, Baghajatin and Tollygunge — choose Smilz Dental for painless, digitally guided dentistry led by Dr. Dibyendu Dutta. 25+ years of trusted local practice."
    heroImageAlt="Modern dental treatment room at Smilz Dental Clinic serving South Kolkata"
    whatsappMessage="Hi Smilz Dental, I'd like to book a consultation at your South Kolkata clinic."
    services={[
      { label: "Dental Implants", to: "/services/dental-implants-kolkata", blurb: "Digitally guided implants with a top implantologist in South Kolkata." },
      { label: "Clear Aligners", to: "/services/clear-aligners-garia", blurb: "3D-planned invisible aligners for adults and teens." },
      { label: "Painless Root Canal", to: "/services/painless-root-canal", blurb: "Gentle, single-visit endodontics using rotary instruments." },
      { label: "Cosmetic Dentistry", to: "/services/cosmetic-dentistry", blurb: "Veneers, whitening and smile design for a natural finish." },
      { label: "Crown & Bridge", to: "/services/crown-bridge", blurb: "Precision ceramic crowns and bridges made to shade-match your smile." },
      { label: "Pediatric Dentistry", to: "/services/pediatric-dentistry", blurb: "Anxiety-free dental visits for children across South Kolkata." },
    ]}
    neighborhoods={[
      { name: "Garia & Garia Park", note: "Our home neighbourhood — walk-in convenient from the Garia metro side." },
      { name: "Jadavpur", note: "A 12–15 minute drive; popular route for students and professionals." },
      { name: "Tollygunge", note: "Direct road connectivity via Prince Anwar Shah Road bypass." },
      { name: "Naktala & Bansdroni", note: "Regularly visited by families for full-mouth rehabilitation." },
      { name: "Sonarpur & Rajpur", note: "One short train or metro hop from Garia (Kavi Subhash) station." },
      { name: "Patuli & Baghajatin", note: "Comfortable evening slots for post-work appointments." },
    ]}
    testimonials={[
      { name: "Rituparna D.", area: "Jadavpur", quote: "Travelled from Jadavpur for a smile makeover. The result looks completely natural — nothing rushed, everything explained.", rating: 5 },
      { name: "Debasish G.", area: "Tollygunge", quote: "Genuinely painless root canal — no exaggeration. Dr. Dutta is calm, thorough and doesn't over-treat.", rating: 5 },
      { name: "Ananya B.", area: "Sonarpur", quote: "Bring both my children here for pediatric visits. They actually look forward to their appointments now.", rating: 5 },
    ]}
    faqs={[
      { q: "Why is Smilz considered one of the best dental clinics in South Kolkata?", a: "25+ years of local practice, a top implantologist in-house, painless treatment protocols, transparent pricing and 4.8★ average patient ratings on Google." },
      { q: "Which areas of South Kolkata do you serve?", a: "We regularly see patients from Garia, Jadavpur, Tollygunge, Patuli, Naktala, Bansdroni, Sonarpur, Baghajatin and Rajpur — plus referrals from further afield." },
      { q: "Do you offer EMI or instalment options?", a: "Yes. EMI options are available for larger treatments such as full-mouth implants, orthodontics and smile design — details are shared during consultation." },
      { q: "Can I get a second opinion at your clinic?", a: "Absolutely. We routinely provide second opinions on implant, root canal and orthodontic plans — with digital X-rays and honest advice, no pressure to switch." },
      { q: "How quickly can I get an appointment?", a: "Most non-emergency consultations are available within 24–48 hours. Urgent cases are usually accommodated the same day at our Garia clinic." },
    ]}
    relatedLinks={[
      { label: "Dentist in Garia", to: "/locations/garia" },
      { label: "Best dentist in Kolkata", to: "/dentist-in-kolkata" },
      { label: "About Smilz Dental", to: "/about" },
      { label: "Contact & directions", to: "/contact" },
    ]}
  />
);

export default SouthKolkataHub;
