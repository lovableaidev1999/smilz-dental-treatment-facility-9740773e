import LocationServiceLanding from "@/components/seo/LocationServiceLanding";

const PainlessRootCanal = () => (
  <LocationServiceLanding
    slug="painless-root-canal"
    title="Painless Root Canal Treatment in South Kolkata | Smilz Dental Garia"
    description="Gentle, single-visit root canal treatment at Smilz Dental, Garia. Painless dentistry in South Kolkata using modern rotary endodontics and magnification."
    keywords="painless root canal Kolkata, single sitting RCT Garia, root canal South Kolkata, endodontist Garia"
    eyebrow="Painless Root Canal · South Kolkata"
    h1="Painless Root Canal Treatment in South Kolkata"
    subhead="Gentle, single-visit endodontics at our Garia clinic — advanced dental care near Garia metro that saves your natural tooth without the anxiety."
    serviceName="Painless Root Canal Treatment"
    serviceDescription="Single-visit, magnification-assisted rotary root canal treatment at Smilz Dental Clinic, Garia."
    heroImageAlt="Dentist performing a painless root canal treatment on a patient at Smilz Dental Clinic Garia"
    whatsappMessage="Hi Smilz Dental, I'm looking for a painless root canal treatment in South Kolkata."
    benefits={[
      "Single-visit treatment for most cases",
      "Rotary endodontics + magnification",
      "Truly painless, comfortable experience",
      "Same-day emergency appointments",
    ]}
    whyChooseUs={[
      {
        title: "Painless dentistry in South Kolkata",
        body: "Modern anaesthesia protocols, gentle handling and calm rooms mean most patients feel nothing beyond a mild pressure sensation during the procedure.",
      },
      {
        title: "Rotary endodontics with magnification",
        body: "Precision rotary files and dental loupes allow us to clean the tiniest canals thoroughly — reducing re-treatment risk and post-op flare-ups.",
      },
      {
        title: "Emergency slots near Garia metro",
        body: "Toothache that starts overnight can usually be seen the next morning at our clinic, minutes from Garia (Kavi Subhash) metro.",
      },
    ]}
    process={[
      { title: "Digital X-ray & diagnosis", body: "A quick RVG scan confirms the tooth needing treatment and the extent of infection." },
      { title: "Local anaesthesia", body: "Applied gently so the area is fully numb before treatment begins — you should feel no sharp pain." },
      { title: "Cleaning & shaping", body: "Infected pulp is removed and canals are cleaned using rotary files under magnification." },
      { title: "Sealing & crown", body: "The tooth is sealed the same day where possible and protected with a crown to restore full function." },
    ]}
    cases={[
      { procedure: "Single-visit molar RCT", complexity: "Straightforward", outcome: "Lower molar treated in a single sitting; patient back to normal chewing the next day.", beforeAlt: "Painful lower molar before painless root canal treatment at Smilz Dental Garia", afterAlt: "Restored lower molar after single-visit root canal at Smilz Dental Garia" },
      { procedure: "RCT with post-and-core", complexity: "Moderate", outcome: "Heavily broken-down premolar rebuilt with a post-and-core plus ceramic crown.", beforeAlt: "Broken-down premolar before root canal and post-and-core at Smilz Dental Kolkata", afterAlt: "Restored premolar with ceramic crown after root canal at Smilz Dental Kolkata" },
      { procedure: "Retreatment of failed RCT", complexity: "Complex", outcome: "Re-treatment of a previously failed root canal, saving the natural tooth from extraction.", beforeAlt: "Failing previously treated tooth before root canal retreatment at Smilz Dental Garia", afterAlt: "Successfully retreated tooth after endodontic revision at Smilz Dental Garia" },
    ]}
    faqs={[
      { q: "Is root canal treatment really painless?", a: "Yes — with modern anaesthesia the procedure itself is essentially painless. What people remember as painful is often the toothache before treatment, which the root canal actually resolves." },
      { q: "Can a root canal be completed in one visit?", a: "Most single-rooted and many multi-rooted cases at our Garia clinic are completed in a single sitting. Complex or acutely infected cases may need 2 visits." },
      { q: "How much does a root canal cost in South Kolkata?", a: "Root canal treatment at Smilz typically ranges from ₹4,500 to ₹8,500 per tooth depending on the number of canals. A crown, when needed, is quoted separately." },
      { q: "Do I need a crown after a root canal?", a: "Back teeth almost always need a crown afterwards to prevent fractures. Front teeth can sometimes be restored with a simple filling — we'll advise based on the tooth's condition." },
      { q: "How soon can I be seen for an emergency toothache?", a: "Emergency slots are usually available the same day or next morning at our clinic near Garia metro. Call or WhatsApp to be triaged quickly." },
    ]}
    relatedLinks={[
      { label: "Dental implants in Kolkata", to: "/services/dental-implants-kolkata" },
      { label: "Clear aligners in Garia", to: "/services/clear-aligners-garia" },
      { label: "All dental services", to: "/services" },
    ]}
  />
);

export default PainlessRootCanal;
