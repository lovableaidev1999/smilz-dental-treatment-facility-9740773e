import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { resolveResponsiveImage } from "@/lib/wpImageFallback";
import type { PageSection } from "@/hooks/usePageContent";

interface DynamicSectionsProps {
  sections: PageSection[];
  /** Section IDs that are already rendered by the page's custom layout */
  excludeIds: string[];
}

export const renderBodyParagraphs = (bodyText?: string | null) => {
  if (!bodyText) return null;
  const paras = bodyText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length === 0) return null;
  return paras.map((para, i) => <p key={i}>{para}</p>);
};

/**
 * Renders a single CMS section with a generic layout.
 * Use this when iterating through sections in sort_order.
 */
export const GenericSection = ({
  section,
  imageFirst = true,
}: {
  section: PageSection;
  imageFirst?: boolean;
}) => {
  const paragraphs = renderBodyParagraphs(section.body_text);
  const hasImage = !!section.image_url;

  if (!hasImage) {
    return (
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            {section.section_title && (
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
                {section.section_title}
              </p>
            )}
            {section.heading && (
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="text-lg text-foreground/80 mb-4">
                {section.subheading}
              </p>
            )}
            {paragraphs && (
              <div className="space-y-4 text-muted-foreground text-left">
                {paragraphs}
              </div>
            )}
            {section.button_text && section.button_link && (
              <div className="mt-6">
                <Button asChild>
                  <Link to={section.button_link}>{section.button_text}</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-narrow mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: imageFirst ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={!imageFirst ? "md:order-2" : undefined}
          >
            <img
              src={resolveResponsiveImage(section.image_url!, 800)}
              alt={`${section.section_title || section.heading || "Smilz Dental Clinic"} — dental care in Garia, South Kolkata`}
              className="rounded-2xl shadow-elevated w-full h-auto"
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: imageFirst ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={!imageFirst ? "md:order-1" : undefined}
          >
            {section.section_title && (
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
                {section.section_title}
              </p>
            )}
            {section.heading && (
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="text-lg text-foreground/80 mb-4">
                {section.subheading}
              </p>
            )}
            {paragraphs && (
              <div className="space-y-4 text-muted-foreground">
                {paragraphs}
              </div>
            )}
            {section.button_text && section.button_link && (
              <div className="mt-6">
                <Button asChild>
                  <Link to={section.button_link}>
                    {section.button_text}
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/**
 * Renders all non-excluded sections. Use this only when you don't need
 * sort-order interleaving with hardcoded sections.
 */
const DynamicSections = ({ sections, excludeIds }: DynamicSectionsProps) => {
  const extras = sections.filter((s) => !excludeIds.includes(s.section_id));
  if (extras.length === 0) return null;

  let dynamicIndex = 0;
  return (
    <>
      {extras.map((section) => {
        const imageFirst = dynamicIndex % 2 === 0;
        dynamicIndex++;
        return (
          <GenericSection
            key={section.id}
            section={section}
            imageFirst={imageFirst}
          />
        );
      })}
    </>
  );
};

export default DynamicSections;
