import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, Clock, CheckCircle2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import StickyCtaBar from "@/components/StickyCtaBar";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface SeoLandingSection {
  heading: string;
  body: string | string[];
}

export interface SeoLandingProps {
  slug: string;
  title: string;
  description: string;
  keywords?: string;
  h1: string;
  intro: string;
  sections: SeoLandingSection[];
  bullets?: string[];
  faqs: Array<{ q: string; a: string }>;
  relatedLinks?: Array<{ label: string; to: string }>;
}

const renderBody = (body: string | string[]) => {
  if (Array.isArray(body)) {
    return body.map((p, i) => (
      <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
    ));
  }
  return <p className="text-muted-foreground leading-relaxed mb-4">{body}</p>;
};

const SeoLanding = ({
  slug, title, description, keywords, h1, intro, sections, bullets, faqs, relatedLinks,
}: SeoLandingProps) => {
  const { data: settings } = useSiteSettings();
  const contact = settings?.contact;
  const links = settings?.links;
  const website = links?.website ?? "https://smilz.net";

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={`${website}/${slug}`}
        breadcrumbs={[
          { name: "Home", url: website },
          { name: h1, url: `${website}/${slug}` },
        ]}
        faqs={faqs}
      />

      <StickyCtaBar />

      {/* Hero */}
      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{h1}</h1>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto text-lg">{intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-dental-green hover:bg-dental-green/90 text-white">
              <a href={`tel:+91${contact?.phone ?? "8961775554"}`}>
                <Phone className="mr-2 h-4 w-4" /> Call {contact?.phone_formatted ?? "8961 77 5554"}
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}`} target="_blank" rel="noopener">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section-padding">
        <div className="container-narrow mx-auto grid lg:grid-cols-3 gap-12 items-start">
          <article className="lg:col-span-2 prose prose-slate max-w-none">
            {sections.map((s, i) => (
              <div key={i} className="mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">{s.heading}</h2>
                {renderBody(s.body)}
              </div>
            ))}

            {bullets && bullets.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Why patients choose Smilz Dental Treatment Facility</h2>
                <ul className="space-y-2">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-dental-green mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {faqs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Frequently asked questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((f, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                      <AccordionContent>{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Visit our clinic</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata, West Bengal 700084</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <a href={`tel:+91${contact?.phone ?? "8961775554"}`} className="hover:text-primary">
                    +91 {contact?.phone_formatted ?? "8961 77 5554"}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Mon–Sat: 9 AM–1 PM, 5 PM–9 PM</span>
                </div>
              </div>
              <Button asChild className="w-full mt-5 bg-dental-green hover:bg-dental-green/90 text-white">
                <a href={`https://wa.me/${contact?.whatsapp ?? "918961775554"}`} target="_blank" rel="noopener">
                  Book an appointment
                </a>
              </Button>
            </div>

            {relatedLinks && relatedLinks.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Related services</h3>
                <ul className="space-y-2 text-sm">
                  {relatedLinks.map((l, i) => (
                    <li key={i}>
                      <Link to={l.to} className="text-primary hover:underline">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Hidden marker so prerender script knows content is ready */}
      <span data-prerender-ready="true" className="sr-only" aria-hidden="true" />
    </>
  );
};

export default SeoLanding;
