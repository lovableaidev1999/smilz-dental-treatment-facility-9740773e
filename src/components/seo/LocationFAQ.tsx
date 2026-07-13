import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  q: string;
  a: string;
}

interface LocationFAQProps {
  heading?: string;
  intro?: string;
  faqs: FAQ[];
}

/**
 * FAQ accordion where each question is a real <h3> — helps Google
 * surface these blocks as featured snippets. FAQPage JSON-LD is
 * emitted separately via SEOHead.faqs.
 */
const LocationFAQ = ({
  heading = "Frequently Asked Questions",
  intro,
  faqs,
}: LocationFAQProps) => {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
            {heading}
          </h2>
          {intro && <p className="mt-3 text-muted-foreground">{intro}</p>}
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">
                <h3 className="text-base md:text-lg font-semibold text-[#1A365D] m-0">
                  {faq.q}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default LocationFAQ;
