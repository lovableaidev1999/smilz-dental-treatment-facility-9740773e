import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { useGallery } from "@/integrations/supabase/hooks";
import { GenericSection } from "@/components/DynamicSections";
import StickyCtaBar from "@/components/StickyCtaBar";
import PageHero from "@/components/PageHero";
import type { PageSection } from "@/hooks/usePageContent";

const Gallery = () => {
  const { data: galleryItems, isLoading } = useGallery();
  const { data: settings } = useSiteSettings();
  const { sections } = usePageContent("gallery");
  const links = settings?.links;
  const KNOWN_IDS = ["hero"];

  let dynamicIndex = 0;

  const renderSection = (section: PageSection) => {
    switch (section.section_id) {
      case "hero":
        return (
          <PageHero
            key={section.id}
            title={section.heading ?? "Treatment Gallery"}
            subtitle={section.subheading ?? "Real results from real patients. See the transformations we deliver every day."}
            imageUrl={section.image_url}
            imageAlt={section.heading ?? "Smilz Treatment Gallery"}
            breadcrumbs={[{ label: "Home", to: "/" }, { label: "Gallery" }]}
            contact={settings?.contact}
          />
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
      <StickyCtaBar />
      <SEOHead
        title="Dental Treatment Gallery in Kolkata"
        description={`See real before & after dental treatment results at ${settings?.general?.clinic_name ?? "Smilz Dental Clinic"} Kolkata — smile makeovers, dental implants, veneers, braces, whitening and full-mouth rehabilitation cases by Dr. Dibyendu Dutta. Book your consultation today.`}
        keywords="dental before after Kolkata, smile makeover results"
        canonicalUrl={`${links?.website ?? "https://smilz.net"}/gallery`}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://smilz.net" },
          { name: "Gallery", url: `${links?.website ?? "https://smilz.net"}/gallery` },
        ]}
      />

      {sections.map(renderSection)}

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-2xl h-64 animate-pulse" />)}</div>
          ) : (galleryItems ?? []).length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No gallery items yet. Add them from the admin panel.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(galleryItems ?? []).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl overflow-hidden shadow-card group">
                  <div className="overflow-hidden"><img src={item.src} alt={item.alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} /></div>
                  <div className="p-5"><p className="text-sm text-foreground font-medium">{item.caption}</p></div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Gallery;
