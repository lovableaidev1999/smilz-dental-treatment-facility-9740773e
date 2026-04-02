import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { useServices } from "@/integrations/supabase/hooks";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const ServicesPage = () => {
  const { data: services, isLoading } = useServices();
  const { data: settings } = useSiteSettings();
  const { getSection } = usePageContent("services");

  const general = settings?.general;
  const contact = settings?.contact;
  const links = settings?.links;
  const hero = getSection("hero");
  const ctaSection = getSection("cta");

  const serviceFaqs = [
    { q: "How often should I have a dental check-up?", a: "Generally, it's recommended to have a check-up every six months. However, your dentist may suggest more frequent visits based on your individual needs." },
    { q: "Are your dental treatments painful?", a: "We prioritize patient comfort and use modern techniques to minimize discomfort. Many patients report little to no pain during procedures." },
    { q: "How long does teeth whitening last?", a: "Professional teeth whitening can last anywhere from 6 months to 2 years, depending on your lifestyle habits and oral hygiene routine." },
    { q: "Are dental implants safe?", a: "Yes, dental implants are a safe and effective solution for missing teeth. They've been used successfully for decades and have a high success rate." },
    { q: "How long does orthodontic treatment take?", a: "The duration varies depending on individual cases. On average, treatment can last anywhere from 6 months to 2 years." },
    { q: "Can you fix my chipped tooth?", a: "Absolutely! We offer various solutions for chipped teeth, including bonding, veneers, and crowns, depending on the extent of the damage." },
    { q: "Is it too late for me to get braces as an adult?", a: "It's never too late! We offer orthodontic solutions for all ages, including discreet options like clear aligners." },
    { q: "How can I prevent gum disease?", a: "Regular brushing, flossing, and dental check-ups are key. We can also provide personalized advice based on your oral health needs." },
    { q: "What's the difference between a crown and a veneer?", a: "A crown covers the entire tooth, while a veneer only covers the front surface. We can recommend the best option for your specific case." },
    { q: "Do you offer payment plans for more extensive treatments?", a: "Yes, we offer various payment options to make dental care more accessible. Our team can discuss these options with you during your consultation." },
  ];

  return (
    <>
      <SEOHead
        title="Dental Treatment Services in Garia, Kolkata | Smilz"
        description={`Comprehensive dental treatment services in Garia, South Kolkata — implants, root canal, orthodontics, cosmetic dentistry, pediatric care, clear aligners & more at ${general?.clinic_name ?? "Smilz Dental Treatment Facility"}. Call ${contact?.phone_formatted ?? "8961 77 5554"}.`}
        keywords="dental treatment services Kolkata, dental services Garia, dental implants Kolkata, root canal Garia, orthodontics South Kolkata, cosmetic dentistry Kolkata, pediatric dentist Garia, clear aligners Kolkata, teeth whitening Garia, smile designing Kolkata, dental clinic near me"
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://www.smilz.net" },
          { name: "Dental Treatment Services", url: `${links?.website ?? "https://www.smilz.net"}/services` },
        ]}
        faqs={serviceFaqs}
      />

      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <p className="text-dental-gold font-semibold text-sm uppercase tracking-wider mb-3">
            {general?.clinic_name ?? "Smilz Dental Treatment Facility"}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {hero?.heading ?? "Smilz Dental Treatment Services"}
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto text-lg">
            {hero?.subheading ?? `Comprehensive dental care services designed to address all your oral health needs, from routine check-ups to complex procedures. Call us at ${contact?.phone_formatted ?? "8961 77 5554"} or book an appointment.`}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a
              href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I would like to know about your dental services.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-4 w-4" /> Book Appointment
            </a>
            <a
              href={`tel:${contact?.phone ?? "8961775554"}`}
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              <Phone className="h-4 w-4" /> Call {contact?.phone_formatted ?? "8961 77 5554"}
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Our Dental Treatment Services</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              From preventive care to advanced procedures, we provide complete dental solutions for your entire family.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-card animate-pulse h-72" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(services ?? []).map((service, i) => (
                <motion.div
                  key={service.slug}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                >
                  <Link
                    to={`/services/${service.slug}`}
                    className="group block bg-card rounded-2xl shadow-card hover:shadow-hover hover:-translate-y-1.5 hover:border-primary/30 transition-all duration-300 h-full border border-border overflow-hidden"
                  >
                    {service.featured_image && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={service.featured_image}
                          alt={`${service.title} at ${general?.clinic_name ?? "Smilz"} - dental treatment services in Garia, Kolkata`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          width={400}
                          height={300}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {service.icon && (
                        <div className="text-4xl mb-3">{service.icon}</div>
                      )}
                      <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {service.short_desc}
                      </p>
                      <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Content Section */}
      <section className="section-padding bg-dental-surface">
        <div className="container-narrow mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
              Dental Treatment Services for All
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Are you dreaming of a perfect smile but worried about the cost? {general?.clinic_name ?? "Smilz Dental Treatment Facility"} offers 
              a wide range of high-quality treatments that won't break the bank. From routine check-ups to advanced procedures, we've got you covered. 
              Our team of experienced professionals uses cutting-edge technology to ensure maximum efficacy in every treatment. 
              Whether you need a simple cleaning or a complete smile makeover, we're here to help. Early detection and treatment 
              of oral health problems can save you from more extensive and expensive procedures down the road.
            </p>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {serviceFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-6 shadow-card border border-border"
                >
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="relative container-narrow mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            {ctaSection?.heading ?? "Start Your Dental Journey Now"}
          </h2>
          <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8">
            {ctaSection?.subheading ?? `Visit ${general?.clinic_name ?? "Smilz Dental Treatment Facility"} at ${contact?.address ?? "21, Garia Park, South Kolkata"} for comprehensive, affordable dental care since ${general?.year_established ?? 1999}.`}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I would like to book an appointment.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-4 w-4" /> {ctaSection?.button_text ?? "Book on WhatsApp"}
            </a>
            <a
              href={`tel:${contact?.phone ?? "8961775554"}`}
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              <Phone className="h-4 w-4" /> {contact?.phone_formatted ?? "8961 77 5554"}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
