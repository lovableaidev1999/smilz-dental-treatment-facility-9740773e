import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageContent } from "@/hooks/usePageContent";
import { useGallery } from "@/integrations/supabase/hooks";

const Gallery = () => {
  const { data: galleryItems, isLoading } = useGallery();
  const { data: settings } = useSiteSettings();
  const { getSection } = usePageContent("gallery");
  const links = settings?.links;
  const hero = getSection("hero");

  return (
    <>
      <SEOHead
        title="Before & After Gallery"
        description={`See real before and after dental treatment results at ${settings?.general?.clinic_name ?? "Smilz Dental"} Kolkata.`}
        keywords="dental before after Kolkata, smile makeover results"
        canonicalUrl={`${links?.website ?? "https://www.smilz.net"}/gallery`}
        breadcrumbs={[
          { name: "Home", url: links?.website ?? "https://www.smilz.net" },
          { name: "Gallery", url: `${links?.website ?? "https://www.smilz.net"}/gallery` },
        ]}
      />

      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{hero?.heading ?? "Treatment Gallery"}</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">{hero?.subheading ?? "Real results from real patients. See the transformations we deliver every day."}</p>
        </div>
      </section>

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
                  <div className="overflow-hidden"><img src={item.src} alt={item.alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /></div>
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
