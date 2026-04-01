import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO } from "@/lib/constants";
import { useService, useServices } from "@/integrations/supabase/hooks";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: service, isLoading, error } = useService(serviceId ?? "");
  const { data: allServices } = useServices();

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="container-narrow mx-auto animate-pulse space-y-6">
          <div className="h-10 bg-secondary rounded w-1/2" />
          <div className="h-6 bg-secondary rounded w-3/4" />
          <div className="h-40 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (error || !service) return <NotFound />;

  const otherServices = (allServices ?? []).filter((s) => s.slug !== serviceId);
  const faqs = Array.isArray(service.faqs) ? service.faqs as Array<{ q: string; a: string }> : [];

  return (
    <>
      <SEOHead
        title={`${service.title} in Garia, Kolkata`}
        description={`${service.short_desc} Expert ${service.title.toLowerCase()} by ${CLINIC_INFO.doctorName} at ${CLINIC_INFO.name}. Book now!`}
        keywords={service.keywords}
        canonicalUrl={`${CLINIC_INFO.website}/services/${service.slug}`}
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "Services", url: `${CLINIC_INFO.website}/services` },
          { name: service.title, url: `${CLINIC_INFO.website}/services/${service.slug}` },
        ]}
        faqs={faqs}
      />

      {/* Hero */}
      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/70 mb-6">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/services" className="hover:text-primary-foreground transition-colors">Services</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">{service.title}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{service.title}</h1>
          <p className="text-primary-foreground/85 max-w-2xl">{service.short_desc}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                  About {service.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">{service.description}</p>

                {/* FAQs */}
                {faqs.length > 0 && (
                  <div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-6">
                      Frequently Asked Questions
                    </h3>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <div key={i} className="bg-dental-surface rounded-xl p-6">
                          <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-primary text-primary-foreground rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-3">Book Your Appointment</h3>
                <p className="text-sm text-primary-foreground/80 mb-5">
                  Get expert {service.title.toLowerCase()} treatment at Smilz.
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${CLINIC_INFO.whatsapp}?text=Hi, I'm interested in ${service.title} treatment.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Us
                  </a>
                  <a
                    href={`tel:${CLINIC_INFO.phone}`}
                    className="flex items-center justify-center gap-2 w-full border border-primary-foreground/30 text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call {CLINIC_INFO.phoneFormatted}
                  </a>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-heading font-bold text-foreground mb-4">Other Services</h3>
                <ul className="space-y-2">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/services/${s.slug}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        {s.title}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
