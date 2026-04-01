import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO, SERVICES } from "@/lib/constants";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = SERVICES.find((s) => s.id === serviceId);

  if (!service) return <NotFound />;

  const otherServices = SERVICES.filter((s) => s.id !== serviceId);

  return (
    <>
      <SEOHead
        title={`${service.title} in Garia, Kolkata`}
        description={`${service.shortDesc} Expert ${service.title.toLowerCase()} by ${CLINIC_INFO.doctorName} at ${CLINIC_INFO.name}. Book now!`}
        keywords={service.keywords}
        canonicalUrl={`${CLINIC_INFO.website}/services/${service.id}`}
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "Services", url: `${CLINIC_INFO.website}/services` },
          { name: service.title, url: `${CLINIC_INFO.website}/services/${service.id}` },
        ]}
        faqs={service.faqs}
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
          <p className="text-primary-foreground/85 max-w-2xl">{service.shortDesc}</p>
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
                {service.faqs.length > 0 && (
                  <div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-6">
                      Frequently Asked Questions
                    </h3>
                    <div className="space-y-4">
                      {service.faqs.map((faq, i) => (
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
              {/* CTA Card */}
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

              {/* Other Services */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-heading font-bold text-foreground mb-4">Other Services</h3>
                <ul className="space-y-2">
                  {otherServices.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/services/${s.id}`}
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
