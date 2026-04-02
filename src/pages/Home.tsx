import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Shield, Clock, Award, ChevronRight, Phone } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import GoogleReviewSlider from "@/components/GoogleReviewSlider";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { useServices } from "@/integrations/supabase/hooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-dental.jpg";
import doctorImg from "@/assets/doctor.jpg";

const serviceIcons: Record<string, string> = {
  "dental-implants": "🦷",
  "root-canal": "🔬",
  "orthodontics": "😬",
  "smile-designing": "✨",
  "tooth-whitening": "🌟",
  "scaling-polishing": "🪥",
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Home = () => {
  const { data: settings } = useSiteSettings();
  const { getSection } = usePageContent("home");
  const { data: services, isLoading: servicesLoading } = useServices();

  const { data: reviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("is_active", true).order("sort_order");
      if (error) { console.warn("reviews table:", error.message); return []; }
      return data;
    },
  });

  const general = settings?.general;
  const contact = settings?.contact;
  const links = settings?.links;

  const hero = getSection("hero");
  const svcSection = getSection("services");
  const aboutSection = getSection("about");
  const reviewSection = getSection("reviews");
  const ctaSection = getSection("cta");

  return (
    <>
      <SEOHead
        title={settings?.seo?.default_title ?? "Best Dental Clinic in Garia, South Kolkata"}
        description={settings?.seo?.default_description ?? "Smilz Dental Treatment Facility - Trusted dental clinic in Garia Park, Kolkata since 1999."}
        keywords={settings?.seo?.default_keywords ?? "dental clinic Garia Kolkata, dentist South Kolkata"}
        breadcrumbs={[{ name: "Home", url: links?.website ?? "https://www.smilz.net" }]}
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero?.image_url || heroImg} alt={`Modern dental clinic interior at ${general?.clinic_name ?? "Smilz"}`} className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative container-narrow mx-auto px-4 py-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <p className="text-dental-gold font-semibold text-sm uppercase tracking-wider mb-4">
              {general?.tagline ?? "Bridging Gaps... Spreading Smiles!"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              {hero?.heading ?? <>Your Trusted <span className="text-dental-gold">Dental Partner</span> in South Kolkata</>}
            </h1>
            <p className="text-lg text-primary-foreground/85 mb-8 max-w-xl">
              {hero?.subheading ?? `Comprehensive, affordable dental care since ${general?.year_established ?? 1999}. From routine check-ups to advanced treatments, we deliver exceptional results with a gentle touch.`}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I would like to book an appointment.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity">
                {hero?.button_text ?? "Book Appointment"}
              </a>
              <a href={`tel:${contact?.phone ?? "8961775554"}`} className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold text-base hover:bg-primary-foreground/10 transition-colors">
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: Star, label: `${general?.google_rating ?? 4.8} Google Rating` },
                { icon: Clock, label: `Since ${general?.year_established ?? 1999}` },
                { icon: Shield, label: "Advanced Technology" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <Icon className="h-5 w-5 text-dental-gold" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-dental-surface">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">{svcSection?.body_text ?? "What We Offer"}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{svcSection?.heading ?? "Comprehensive Dental Services"}</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{svcSection?.subheading ?? "From preventive care to advanced procedures, we provide complete dental solutions for your entire family."}</p>
          </div>
          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="bg-card rounded-xl p-6 shadow-card animate-pulse h-48" />)}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(services ?? []).map((service, i) => (
                <motion.div key={service.slug} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
                  <Link to={`/services/${service.slug}`} className="group block bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-all duration-300 h-full">
                    <div className="text-4xl mb-4">{serviceIcons[service.slug] ?? "🦷"}</div>
                    <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.short_desc}</p>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Learn More <ChevronRight className="h-4 w-4" /></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <img src={aboutSection?.image_url || doctorImg} alt={`${general?.doctor_name ?? "Dr. Dibyendu Dutta"} at ${general?.clinic_name ?? "Smilz"}`} className="rounded-2xl shadow-elevated w-full" loading="lazy" width={800} height={1024} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">About Us</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{aboutSection?.heading ?? `Your Trusted Dental Partner Since ${general?.year_established ?? 1999}`}</h2>
              <p className="text-muted-foreground mb-4">
                {aboutSection?.body_text ?? `Located at ${contact?.address ?? "21, Garia Park, South Kolkata"}, ${general?.clinic_name ?? "Smilz Dental Treatment Facility"} has been a trusted name in dental care for over 25 years. Led by ${general?.doctor_name ?? "Dr. Dibyendu Dutta"}, we deliver top-notch dental services with precision, care, and honesty.`}
              </p>
              <ul className="space-y-3 mb-6">
                {["Comprehensive dental solutions for all ages", "Affordable pricing with transparent treatment plans", "Latest dental technology and equipment", "Personalized, appointment-based patient care"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground"><Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />{item}</li>
                ))}
              </ul>
              <Link to={aboutSection?.button_link ?? "/about"} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
                {aboutSection?.button_text ?? "Learn More About Us"} <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section-padding bg-dental-surface">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">{reviewSection?.subheading ?? "Patient Testimonials"}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{reviewSection?.heading ?? "What Our Patients Say"}</h2>
          </div>
          <GoogleReviewSlider reviews={reviews ?? []} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="relative container-narrow mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">{ctaSection?.heading ?? "Ready for a Healthier Smile?"}</h2>
          <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8">{ctaSection?.subheading ?? "Book your appointment today and experience the Smilz difference. Walk-ins welcome, appointments preferred."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I would like to book an appointment.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">{ctaSection?.button_text ?? "Book on WhatsApp"}</a>
            <a href={`tel:${contact?.phone ?? "8961775554"}`} className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Phone className="h-4 w-4" /> {contact?.phone_formatted ?? "8961 77 5554"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
