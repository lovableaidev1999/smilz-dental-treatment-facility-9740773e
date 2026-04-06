import { Link } from "react-router-dom";
import { Star, Shield, Clock, Award, ChevronRight, Phone } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import GoogleReviewSlider from "@/components/GoogleReviewSlider";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { useServices } from "@/integrations/supabase/hooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GenericSection } from "@/components/DynamicSections";
import ServicesCarousel from "@/components/ServicesCarousel";
import type { PageSection } from "@/hooks/usePageContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const homepageFaqs = [
  {
    q: "What dental treatments are available at Smilz Dental Clinic?",
    a: "Smilz Dental Treatment Facility offers a wide range of services including dental implants, root canal treatment, smile designing, clear aligners, pediatric dentistry, and preventive dental care. The clinic focuses on advanced digital dentistry for precise and long-lasting results for patients in Kolkata and Howrah.",
  },
  {
    q: "Is dental treatment at Smilz painless and safe?",
    a: "Yes, Smilz Dental Clinic specializes in painless dentistry using modern techniques and advanced equipment. Strict sterilization protocols and safety standards are followed to ensure every treatment is comfortable, hygienic, and stress-free.",
  },
  {
    q: "How do I book an appointment at Smilz Dental Clinic?",
    a: "You can book an appointment at Smilz through the official website www.smilz.net, by calling the clinic directly, or via WhatsApp consultation. Flexible scheduling is available for patients from Kolkata, Howrah, and nearby areas.",
  },
  {
    q: "Why should I choose Smilz Dental Clinic over other dental clinics in Kolkata?",
    a: "Smilz stands out due to its use of advanced digital dentistry, experienced clinical expertise, and personalized patient care. The clinic specializes in precision treatments like guided dental implants and customized smile designing for superior results.",
  },
  {
    q: "Are dental implants at Smilz a permanent solution for missing teeth?",
    a: "Dental implants at Smilz are a long-term and reliable solution for replacing missing teeth. With guided implant technology, the clinic ensures accurate placement, faster healing, and natural-looking results.",
  },
];

const Home = () => {
  const { data: settings } = useSiteSettings();
  const { sections } = usePageContent("home");
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

  const KNOWN_IDS = ["hero", "services", "about", "reviews", "cta"];
  let dynamicIndex = 0;

  const renderSection = (section: PageSection) => {
    switch (section.section_id) {
      case "hero":
        return (
          <section key={section.id} className="relative min-h-[85vh] flex items-center overflow-hidden">
            <div className="absolute inset-0">
              <img src={section.image_url || "/images/hero-dental.jpg"} alt={`Modern dental clinic interior at ${general?.clinic_name ?? "Smilz"}`} className="w-full h-full object-cover" width={1920} height={1080} fetchPriority="high" decoding="async" />
              <div className="absolute inset-0 bg-gradient-hero" />
            </div>
            <div className="relative container-narrow mx-auto px-4 py-20">
              <div className="max-w-2xl animate-fade-in">
                <p className="text-dental-gold font-semibold text-sm uppercase tracking-wider mb-4">
                  {general?.tagline ?? "Bridging Gaps... Spreading Smiles!"}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
                  {section.heading ?? <>Your Trusted <span className="text-dental-gold">Dental Partner</span> in South Kolkata</>}
                </h1>
                <p className="text-lg text-primary-foreground/85 mb-8 max-w-xl">
                  {section.subheading ?? `Comprehensive, affordable dental care since ${general?.year_established ?? 1999}. From routine check-ups to advanced treatments, we deliver exceptional results with a gentle touch.`}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I would like to book an appointment.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity">
                    {section.button_text ?? "Book Appointment"}
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
              </div>
            </div>
          </section>
        );

      case "services":
        return (
          <section key={section.id} className="section-padding bg-dental-surface">
            <div className="container-narrow mx-auto">
              <div className="text-center mb-14">
                <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">{section.body_text ?? "What We Offer"}</p>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{section.heading ?? "Comprehensive Dental Services"}</h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{section.subheading ?? "From preventive care to advanced procedures, we provide complete dental solutions for your entire family."}</p>
              </div>
              {servicesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="bg-card rounded-xl p-6 shadow-card animate-pulse h-48" />)}</div>
              ) : (
                <ServicesCarousel
                  services={services ?? []}
                  bodyText={section.body_text}
                  displayType="carousel"
                />
              )}
            </div>
          </section>
        );

      case "about":
        return (
          <section key={section.id} className="section-padding">
            <div className="container-narrow mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in">
                  <img src={section.image_url || "/images/doctor.jpg"} alt={`${general?.doctor_name ?? "Dr. Dibyendu Dutta"} at ${general?.clinic_name ?? "Smilz"}`} className="rounded-2xl shadow-elevated w-full" loading="lazy" width={800} height={1024} />
                </div>
                <div className="animate-fade-in">
                  <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">About Us</p>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">{section.heading ?? `Your Trusted Dental Partner Since ${general?.year_established ?? 1999}`}</h2>
                  <p className="text-muted-foreground mb-4">
                    {section.body_text ?? `Located at ${contact?.address ?? "21, Garia Park, South Kolkata"}, ${general?.clinic_name ?? "Smilz Dental Treatment Facility"} has been a trusted name in dental care for over 25 years. Led by ${general?.doctor_name ?? "Dr. Dibyendu Dutta"}, we deliver top-notch dental services with precision, care, and honesty.`}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {["Comprehensive dental solutions for all ages", "Affordable pricing with transparent treatment plans", "Latest dental technology and equipment", "Personalized, appointment-based patient care"].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground"><Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />{item}</li>
                    ))}
                  </ul>
                  <Link to={section.button_link ?? "/about"} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
                    {section.button_text ?? "Learn More About Us"} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      case "reviews":
        return (
          <section key={section.id} className="section-padding bg-dental-surface">
            <div className="container-narrow mx-auto">
              <div className="text-center mb-10">
                <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">{section.subheading ?? "Patient Testimonials"}</p>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{section.heading ?? "What Our Patients Say"}</h2>
              </div>
              <GoogleReviewSlider reviews={reviews ?? []} />
            </div>
          </section>
        );

      case "cta":
        return (
          <section key={section.id} className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary" />
            <div className="relative container-narrow mx-auto text-center px-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">{section.heading ?? "Ready for a Healthier Smile?"}</h2>
              <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8">{section.subheading ?? "Book your appointment today and experience the Smilz difference. Walk-ins welcome, appointments preferred."}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I would like to book an appointment.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">{section.button_text ?? "Book on WhatsApp"}</a>
                <a href={`tel:${contact?.phone ?? "8961775554"}`} className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors">
                  <Phone className="h-4 w-4" /> {contact?.phone_formatted ?? "8961 77 5554"}
                </a>
              </div>
            </div>
          </section>
        );

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
        title={settings?.seo?.default_title ?? "Best Dental Clinic in Garia, South Kolkata"}
        description={settings?.seo?.default_description ?? "Smilz Dental Treatment Facility - Trusted dental clinic in Garia Park, Kolkata since 1999."}
        keywords={settings?.seo?.default_keywords ?? "dental clinic Garia Kolkata, dentist South Kolkata"}
        breadcrumbs={[{ name: "Home", url: links?.website ?? "https://smilz.net" }]}
        faqs={homepageFaqs}
      />

      {sections.map(renderSection)}

      {/* FAQ Section */}
      <section className="section-padding bg-dental-surface">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
              Common Questions
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Find answers to the most common questions about our dental treatments and services.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {homepageFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`home-faq-${i}`}>
                  <AccordionTrigger className="text-foreground font-medium text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;