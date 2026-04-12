import { useParams, Link } from "react-router-dom";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { resolveImageUrl } from "@/lib/wpImageFallback";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useService, useServices } from "@/integrations/supabase/hooks";
import NotFound from "./NotFound";
import ServiceHero from "@/components/service/ServiceHero";
import ServiceContent from "@/components/service/ServiceContent";
import ServiceSidebar from "@/components/service/ServiceSidebar";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: service, isLoading, error } = useService(serviceId ?? "");
  const { data: allServices } = useServices();
  const { data: settings } = useSiteSettings();
  const contentRef = useRef<HTMLDivElement>(null);

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
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/services/${service.slug}`}
        ogImage={service.featured_image}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://smilz.net" },
          { name: "Services", url: `${links?.website ?? "https://smilz.net"}/services` },
          { name: service.title, url: `${links?.website ?? "https://smilz.net"}/services/${service.slug}` },
        ]}
        faqs={faqs}
        service={{
          name: service.title,
          description: service.short_desc || service.description?.substring(0, 200) || "",
          image: service.featured_image,
          url: `${links?.website ?? "https://smilz.net"}/services/${service.slug}`,
        }}
      />

      <ServiceHero
        title={service.title}
        shortDesc={service.short_desc}
        contact={contact}
      />

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid lg:grid-cols-3 gap-12" ref={contentRef}>
            <ServiceContent
              service={service}
              faqs={faqs}
              clinicName={general?.clinic_name}
            />

            <ServiceSidebar
              serviceTitle={service.title}
              clinicName={general?.clinic_name}
              contact={contact}
              otherServices={otherServices}
              contentRef={contentRef}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;
