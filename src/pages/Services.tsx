import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO, SERVICES } from "@/lib/constants";

const serviceIcons: Record<string, string> = {
  "dental-implants": "🦷",
  "root-canal": "🔬",
  "orthodontics": "😬",
  "smile-designing": "✨",
  "tooth-whitening": "🌟",
  "scaling-polishing": "🪥",
};

const ServicesPage = () => {
  return (
    <>
      <SEOHead
        title="Dental Treatments & Services"
        description="Comprehensive dental treatments in Kolkata - implants, root canal, orthodontics, smile designing, teeth whitening, and more at Smilz Dental Treatment Facility."
        keywords="dental treatments Kolkata, dental services Garia"
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "Services", url: `${CLINIC_INFO.website}/services` },
        ]}
      />

      {/* Page Header */}
      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Our Dental Services</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">
            Complete dental solutions for all your needs — from routine care to advanced procedures, delivered with precision and care.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`/services/${service.id}`}
                  className="group block bg-card rounded-2xl p-8 shadow-card hover:shadow-hover transition-all duration-300 h-full border border-border hover:border-primary/30"
                >
                  <div className="text-5xl mb-5">{serviceIcons[service.id]}</div>
                  <h2 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-5">{service.shortDesc}</p>
                  <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
