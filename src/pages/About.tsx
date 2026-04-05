import { motion } from "framer-motion";
import { Award, Heart, Shield, Users, Phone, Clock, MapPin, Calendar } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import doctorImg from "@/assets/doctor.jpg";
import { GenericSection } from "@/components/DynamicSections";

const About = () => {
  const { data: settings } = useSiteSettings();
  const { sections } = usePageContent("about");
  const { data: galleryItems } = useGallery();

  const general = settings?.general;
  const contact = settings?.contact;
  const hours = settings?.hours;
  const links = settings?.links;
  const coordinates = settings?.coordinates;

  const KNOWN_IDS = ["hero", "doctor", "cta", "about_smilz"];
  let dynamicIndex = 0;

  const renderSection = (section: typeof sections[number]) => {
    switch (section.section_id) {
      case "hero":
        return (
          <section key={section.id} className="bg-gradient-primary text-primary-foreground section-padding">
            <div className="container-narrow mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                {section.heading ?? "About Us"}
              </h1>
              <p className="text-primary-foreground/85 max-w-xl mx-auto">
                {section.subheading ?? "Over 25 years of dedicated dental care in the heart of Garia, South Kolkata."}
              </p>
            </div>
          </section>
        );

      case "doctor":
        return (
          <section key={section.id} className="section-padding">
            <div className="container-narrow mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                <motion.img
                  src={section.image_url || doctorImg}
                  alt={`${general?.doctor_name ?? "Dr. Dibyendu Dutta"} - Dentist at ${general?.clinic_name ?? "Smilz"}`}
                  className="rounded-2xl shadow-elevated w-full"
                  loading="lazy"
                  width={800}
                  height={1024}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                />
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                    {section.heading ?? `Meet ${general?.doctor_name ?? "Dr. Dibyendu Dutta"}`}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    {section.body_text ? (
                      section.body_text.split("\n").map(p => p.trim()).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                      <>
                        <p>
                          With over 25 years of experience in dentistry, {general?.doctor_name ?? "Dr. Dibyendu Dutta"} founded{" "}
                          {general?.clinic_name ?? "Smilz Dental Treatment Facility"} in {general?.year_established ?? 1999} with a
                          vision to provide accessible, honest, and high-quality dental care to the community of South Kolkata.
                        </p>
                        <p>
                          Conveniently situated in the heart of Garia at <strong>{contact?.address ?? "21, Garia Park, Kolkata 700084"}</strong>,
                          our clinic is equipped with the latest dental technologies.
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Values Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Heart, title: "Patient-Centric", desc: "Every patient receives undivided attention and personalized care." },
                  { icon: Shield, title: "Honest Care", desc: "Transparent treatment plans with no unnecessary procedures." },
                  { icon: Award, title: "25+ Years", desc: `Trusted expertise serving Garia and South Kolkata since ${general?.year_established ?? 1999}.` },
                  { icon: Users, title: "Family Friendly", desc: "Comprehensive dental solutions for patients of all ages." },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl p-6 shadow-card text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );

      case "cta":
        return (
          <section key={section.id} className="section-padding bg-gradient-primary text-primary-foreground">
            <div className="container-narrow mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{section.heading ?? "Ready for a Healthier Smile?"}</h2>
                <p className="text-primary-foreground/85 max-w-lg mx-auto mb-8">{section.subheading ?? "Book your appointment today and experience the Smilz difference."}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="font-semibold">
                    <Link to={section.button_link ?? "/contact"}>
                      <Calendar className="mr-2 h-5 w-5" />{section.button_text ?? "Book Appointment"}
                    </Link>
                  </Button>
                  {contact?.whatsapp && (
                    <Button asChild size="lg" className="bg-dental-green text-primary-foreground hover:bg-dental-green/90 font-semibold">
                      <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        );

      case "about_smilz": {
        const paragraphs = section.body_text
          ? section.body_text.split("\n").map((p: string) => p.trim()).filter(Boolean)
          : [];

        return (
          <section key={section.id} className="section-padding">
            <div className="container-narrow mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  {section.image_url && (
                    <img
                      src={section.image_url}
                      alt={section.heading || "Smilz Dental Clinic"}
                      className="rounded-2xl shadow-elevated w-full"
                      loading="lazy"
                      width={800}
                      height={600}
                    />
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  {section.section_title && (
                    <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
                      {section.section_title}
                    </p>
                  )}
                  {section.heading && (
                    <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                      {section.heading}
                    </h2>
                  )}
                  {section.subheading && (
                    <p className="text-lg text-foreground/80 mb-4">
                      {section.subheading}
                    </p>
                  )}
                  {paragraphs.length > 0 && (
                    <div className="space-y-4 text-muted-foreground">
                      {paragraphs.map((para: string, i: number) => <p key={i}>{para}</p>)}
                    </div>
                  )}
                  {section.button_text && section.button_link && (
                    <div className="mt-6">
                      <Button asChild>
                        <Link to={section.button_link}>{section.button_text}</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </section>
        );
      }
      default: {
        const imageFirst = dynamicIndex % 2 === 0;
        dynamicIndex++;
        return <GenericSection key={section.id} section={section} imageFirst={imageFirst} />;
      }
    }
  };

  return (
    <>
      <SEOHead
        title={`About Us - ${general?.clinic_name ?? "Smilz Dental Treatment Facility"}`}
        description={`Learn about ${general?.clinic_name ?? "Smilz Dental Treatment Facility"}, led by ${general?.doctor_name ?? "Dr. Dibyendu Dutta"}. Trusted dental care in Garia, South Kolkata since ${general?.year_established ?? 1999}.`}
        keywords="best dentist Garia, Dr Dibyendu Dutta, dental clinic South Kolkata"
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/about`}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://smilz.net" },
          { name: "About Us", url: `${links?.website ?? "https://smilz.net"}/about` },
        ]}
      />

      {sections.map(renderSection)}

      {/* Clinic Info - always shown after all CMS sections */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow mx-auto">
          <motion.h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Visit Our Clinic
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div className="bg-card rounded-xl p-6 shadow-card text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4"><MapPin className="h-7 w-7 text-primary" /></div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Our Address</h3>
              <p className="text-muted-foreground text-sm">{contact?.address_full ?? contact?.address ?? "21, Garia Park, Kolkata 700084"}</p>
              {links?.google_maps_url && (
                <a href={links.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium mt-3 inline-block hover:underline">Get Directions →</a>
              )}
            </motion.div>
            <motion.div className="bg-card rounded-xl p-6 shadow-card text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4"><Clock className="h-7 w-7 text-primary" /></div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Clinic Timings</h3>
              <div className="text-muted-foreground text-sm space-y-1">
                <p><span className="font-medium text-foreground">Morning:</span> {hours?.morning ?? "9:00 AM – 1:00 PM"}</p>
                <p><span className="font-medium text-foreground">Evening:</span> {hours?.evening ?? "5:00 PM – 9:00 PM"}</p>
                <p className="mt-2">{hours?.days ?? "Monday – Saturday"}</p>
                <p className="text-destructive text-xs font-medium">{hours?.closed ?? "Sunday"} – Closed</p>
              </div>
            </motion.div>
            <motion.div className="bg-card rounded-xl p-6 shadow-card text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4"><Phone className="h-7 w-7 text-primary" /></div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Contact Numbers</h3>
              <div className="text-muted-foreground text-sm space-y-2">
                <p><span className="font-medium text-foreground">Appointment:</span> <a href={`tel:${contact?.phone ?? "8961775554"}`} className="text-primary hover:underline">{contact?.phone_formatted ?? contact?.phone ?? "8961 77 5554"}</a></p>
                <p><span className="font-medium text-foreground">Emergency:</span> <a href={`tel:${contact?.emergency ?? "9831070248"}`} className="text-primary hover:underline">{contact?.emergency ?? "9831070248"}</a></p>
                <p><span className="font-medium text-foreground">Email:</span> <a href={`mailto:${contact?.email ?? ""}`} className="text-primary hover:underline text-xs">{contact?.email ?? "dr.d.dutta@gmail.com"}</a></p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <motion.h2 className="text-3xl font-heading font-bold text-foreground text-center mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Find Us on the Map
          </motion.h2>
          <motion.div className="rounded-2xl overflow-hidden shadow-elevated aspect-video" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <iframe
              src="https://www.google.com/maps?q=Smilz+Dental+Treatment+Facility,+21+Garia+Park,+Kolkata+700084&z=16&output=embed"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title={`${general?.clinic_name ?? "Smilz"} Location`}
            />
          </motion.div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Smilz+Dental+Treatment+Facility,+21+Garia+Park,+Kolkata+700084"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="h-4 w-4" /> View in Google Maps
          </a>
        </div>
      </section>
    </>
  );
};

export default About;
