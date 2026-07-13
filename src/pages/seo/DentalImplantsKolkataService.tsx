import LocationServiceLanding from "@/components/seo/LocationServiceLanding";

const DentalImplantsKolkataService = () => (
  <LocationServiceLanding
    slug="dental-implants-kolkata"
    title="Dental Implants in Kolkata – Painless, Digitally Guided | Smilz Garia"
    description="Advanced dental implants near Garia metro, South Kolkata. Same-day consultation, CBCT-guided placement, and gentle recovery with a trusted implantologist since 1999."
    keywords="dental implants Kolkata, dental implants Garia, top implantologist South Kolkata, single tooth implant, all-on-4 Kolkata"
    eyebrow="Dental Implants · South Kolkata"
    h1="Dental Implants in Kolkata — Rebuilt Smiles, Naturally"
    subhead="Digitally guided implant placement at our Garia clinic, delivered by a top implantologist in South Kolkata. Comfortable, precise, and built to last."
    serviceName="Dental Implants"
    serviceDescription="CBCT-guided dental implant placement for single-tooth, multi-tooth and full-arch cases at Smilz Dental, Garia."
    heroImageAlt="Advanced dental operatory room at Smilz Dental Clinic Garia used for guided dental implant procedures"
    whatsappMessage="Hi Smilz Dental, I'd like to know more about dental implants in Kolkata."
    benefits={[
      "CBCT-guided precision placement",
      "Gentle, painless procedure",
      "Same-week consultation slots",
      "EMI options for full-mouth cases",
    ]}
    whyChooseUs={[
      {
        title: "A top implantologist in South Kolkata",
        body: "Led by Dr. Dibyendu Dutta with 25+ years of clinical experience and thousands of implant placements across Garia, Patuli and greater South Kolkata.",
      },
      {
        title: "Digitally guided, minimally invasive",
        body: "Every case is planned on a 3D CBCT scan so the implant fits your bone exactly — less surgery, faster healing, more predictable results.",
      },
      {
        title: "Long-term care, not one-off surgery",
        body: "You get lifetime follow-ups, hygiene reviews and a written implant passport. We look after the implant for as long as you have it.",
      },
    ]}
    process={[
      { title: "Consultation & 3D scan", body: "Digital X-ray and CBCT to plan bone and nerve position before treatment begins." },
      { title: "Guided implant placement", body: "A short, comfortable procedure under local anaesthesia — most patients return to work the next day." },
      { title: "Healing phase", body: "3–6 months of osseointegration while you function normally with a natural-looking temporary tooth." },
      { title: "Final crown fit", body: "A custom-crafted crown is fitted so the new tooth blends seamlessly with your smile." },
    ]}
    cases={[
      { procedure: "Single anterior implant", complexity: "Moderate", outcome: "Front tooth replaced after trauma — natural shade match, gum contour preserved.", beforeAlt: "Patient smile before single anterior dental implant at Smilz Dental Garia", afterAlt: "Patient smile after single anterior dental implant restoration at Smilz Dental Garia" },
      { procedure: "Two adjacent posterior implants", complexity: "Moderate", outcome: "Two missing molars restored with implant-supported crowns for full chewing function.", beforeAlt: "Missing posterior teeth before implant treatment at Smilz Dental Kolkata", afterAlt: "Restored posterior teeth after implant crowns at Smilz Dental Kolkata" },
      { procedure: "All-on-4 upper arch", complexity: "Full-mouth", outcome: "Complete upper arch rehabilitated with a fixed hybrid bridge on four implants.", beforeAlt: "Edentulous upper arch before All-on-4 implant rehabilitation at Smilz Dental Garia", afterAlt: "Restored upper arch after All-on-4 fixed bridge at Smilz Dental Garia" },
    ]}
    faqs={[
      { q: "How much do dental implants cost in Kolkata?", a: "Single-tooth implants at Smilz typically range from ₹25,000 to ₹55,000, including implant, abutment and porcelain crown. Full-arch All-on-4 cases start from ₹2,50,000. You receive a written treatment plan with transparent pricing before you commit." },
      { q: "Is the implant procedure painful?", a: "The procedure itself is performed under local anaesthesia and is not painful. Most patients report only mild soreness for 2–3 days afterward, easily managed with simple painkillers." },
      { q: "How long do dental implants last?", a: "With good oral hygiene and regular reviews, implants can last 20+ years or a lifetime. The crown on top may need replacement after 10–15 years." },
      { q: "How close is your clinic to Garia metro?", a: "The clinic is at 21 Garia Park, a short walk from Garia (Kavi Subhash) metro station and easily reached from Patuli, Naktala, Baghajatin, Sonarpur and Jadavpur." },
      { q: "Can I get dental implants if I have diabetes?", a: "Well-controlled diabetes is not a contraindication. We review your medical history and, where needed, coordinate with your physician before starting treatment." },
    ]}
    relatedLinks={[
      { label: "Clear aligners in Garia", to: "/services/clear-aligners-garia" },
      { label: "Painless root canal", to: "/services/painless-root-canal" },
      { label: "All dental services", to: "/services" },
    ]}
  />
);

export default DentalImplantsKolkataService;
