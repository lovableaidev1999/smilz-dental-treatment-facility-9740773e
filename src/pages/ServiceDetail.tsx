import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useService, useServices } from "@/integrations/supabase/hooks";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: service, isLoading, error } = useService(serviceId ?? "");
  const { data: allServices } = useServices();
  const { data: settings } = useSiteSettings();

  const general = settings?.general;
  const contact = settings?.contact;
  const links = settings?.links;

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="container-narrow mx-auto animate-pulse space-y-6">
          <div className="h-10 bg-secondary rounded w-1/2" />
          <div className="h-6 bg-secondary rounded w-3/4" />
          <div className="h-64 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (error || !service) return <NotFound />;

  const otherServices = (allServices ?? []).filter((s) => s.slug !== serviceId);
  const faqs = Array.isArray(service.faqs) ? (service.faqs as Array<{ q: string; a: string }>) : [];

  const seoTitle = service.seo_title || `${service.title} in Garia, Kolkata | ${general?.clinic_name ?? "Smilz"}`;
  const seoDesc = service.seo_description || `${service.short_desc} Expert ${service.title.toLowerCase()} by ${general?.doctor_name ?? "Dr. Dibyendu Dutta"} at ${general?.clinic_name ?? "Smilz"}, Garia, South Kolkata. Call ${contact?.phone_formatted ?? "8961 77 5554"}. Book now!`;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        keywords={service.keywords || `${service.title.toLowerCase()} Kolkata, ${service.title.toLowerCase()} Garia, ${service.title.toLowerCase()} cost, best ${service.title.toLowerCase()} South Kolkata`}
        canonicalUrl={`${links?.website ?? "https://www.smilz.net"}/services/${service.slug}`}
        ogImage={service.featured_image}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://www.smilz.net" },
          { name: "Services", url: `${links?.website ?? "https://www.smilz.net"}/services` },
          { name: service.title, url: `${links?.website ?? "https://www.smilz.net"}/services/${service.slug}` },
        ]}
        faqs={faqs}
        service={{
          name: service.title,
          description: service.short_desc || service.description?.substring(0, 200) || "",
          image: service.featured_image,
          url: `${links?.website ?? "https://www.smilz.net"}/services/${service.slug}`,
        }}
      />

      {/* Hero with breadcrumb */}
      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/services" className="hover:text-primary-foreground transition-colors">Services</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">{service.title}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{service.title}</h1>
          <p className="text-primary-foreground/85 max-w-2xl text-lg">{service.short_desc}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I'm interested in ${service.title} treatment.`}
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

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Content Column */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Featured Image */}
                {service.featured_image && (
                  <div className="rounded-2xl overflow-hidden mb-8 shadow-elevated">
                    <img
                      src={service.featured_image}
                      alt={`${service.title} treatment at ${general?.clinic_name ?? "Smilz"} dental clinic in Garia, Kolkata`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                      width={800}
                      height={500}
                    />
                  </div>
                )}

                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                  About {service.title}
                </h2>
                <div className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
                  {service.description}
                </div>

                {/* FAQs */}
                {faqs.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-xl font-heading font-bold text-foreground mb-6">
                      Frequently Asked Questions about {service.title}
                    </h3>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-dental-surface rounded-xl p-6 border border-border"
                        >
                          <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Appointment CTA */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-6 sticky top-24">
                <h3 className="font-heading font-bold text-lg mb-3">Book Your Appointment</h3>
                <p className="text-sm text-primary-foreground/80 mb-5">
                  Get expert {service.title.toLowerCase()} treatment at {general?.clinic_name ?? "Smilz"}.
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}?text=Hi, I'm interested in ${service.title} treatment.`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp Us
                  </a>
                  <a
                    href={`tel:${contact?.phone ?? "8961775554"}`}
                    className="flex items-center justify-center gap-2 w-full border border-primary-foreground/30 text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
                  >
                    <Phone className="h-4 w-4" /> Call {contact?.phone_formatted ?? "8961 77 5554"}
                  </a>
                </div>
                <div className="mt-5 pt-5 border-t border-primary-foreground/20 space-y-3 text-sm text-primary-foreground/80">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{contact?.address ?? "21, Garia Park, South Kolkata - 700084"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Mon-Sat: 9AM-1PM & 5PM-9PM</span>
                  </div>
                </div>
              </div>

              {/* Other Services */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-heading font-bold text-foreground mb-4">Other Services</h3>
                <ul className="space-y-1">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/services/${s.slug}`}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {s.title} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;
