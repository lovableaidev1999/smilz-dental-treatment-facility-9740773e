import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO } from "@/lib/constants";

const galleryItems = [
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/11-1024x1024.webp",
    alt: "Smile designing with Zirconia laminates before and after at Smilz Dental Kolkata",
    caption: "Smile designing with Zirconia laminates — changes the way you smile.",
  },
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/after-before-37-1024x788.webp",
    alt: "Scaling polishing and tooth whitening before and after treatment",
    caption: "Scaling, Polishing and Tooth Whitening — Before and After.",
  },
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/after-before-6-1-1024x788.webp",
    alt: "Zirconia Bridge dental treatment before after results",
    caption: "Zirconia Bridge — life-like esthetics with 15+ year warranty.",
  },
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/after-before-43.webp",
    alt: "Adult orthodontics braces before and after treatment Kolkata",
    caption: "Adult Orthodontia — achieve your dream smile at any age.",
  },
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/after-before-11-1-1024x788.png",
    alt: "Professional tooth whitening before and after results",
    caption: "Tooth Whitening — profound effect on personality.",
  },
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/after-before-17-1024x788.webp",
    alt: "Zirconia laminates smile designing correction results",
    caption: "Zirconia Laminates — used for smile designing/correction.",
  },
  {
    src: "https://smilz.net/wp-content/uploads/2024/12/after-before-30-1-1024x788.png",
    alt: "Dental treatment before and after comparison Smilz Dental",
    caption: "Before & After dental treatment at Smilz Dental.",
  },
];

const Gallery = () => {
  return (
    <>
      <SEOHead
        title="Before & After Gallery"
        description="See real before and after dental treatment results at Smilz Dental Kolkata. Smile designing, tooth whitening, Zirconia bridges, orthodontics, and more."
        keywords="dental before after Kolkata, smile makeover results"
        canonicalUrl={`${CLINIC_INFO.website}/gallery`}
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "Gallery", url: `${CLINIC_INFO.website}/gallery` },
        ]}
      />

      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Treatment Gallery</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">
            Real results from real patients. See the transformations we deliver every day.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {galleryItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-card group"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm text-foreground font-medium">{item.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;
