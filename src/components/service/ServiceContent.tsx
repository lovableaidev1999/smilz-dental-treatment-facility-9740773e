import { motion } from "framer-motion";
import { resolveImageUrl } from "@/lib/wpImageFallback";

interface ServiceContentProps {
  service: {
    title: string;
    featured_image: string | null;
    description: string | null;
  };
  faqs: Array<{ q: string; a: string }>;
  clinicName?: string;
}

const ServiceContent = ({ service, faqs, clinicName }: ServiceContentProps) => (
  <div className="lg:col-span-2">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Featured Image */}
      {service.featured_image && (
        <div className="rounded-2xl overflow-hidden mb-8 shadow-elevated">
          <img
            src={resolveImageUrl(service.featured_image)}
            alt={`${service.title} treatment at ${clinicName ?? "Smilz"} dental clinic in Garia, Kolkata`}
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
);

export default ServiceContent;
