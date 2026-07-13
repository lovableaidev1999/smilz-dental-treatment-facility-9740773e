import { Link } from "react-router-dom";
import { CheckCircle2, MapPin } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LandingHero from "./LandingHero";
import BeforeAfterShowcase, { type CaseItem } from "./BeforeAfterShowcase";
import LocationFAQ from "./LocationFAQ";
import StickyMobileCTA from "./StickyMobileCTA";

interface Step {
  title: string;
  body: string;
}

interface WhyItem {
  title: string;
  body: string;
}

export interface LocationServiceLandingProps {
  slug: string; // e.g. "dental-implants-kolkata"
  title: string;
  description: string;
  keywords?: string;
  eyebrow: string;
  h1: string;
  subhead: string;
  serviceName: string;
  serviceDescription: string;
  heroImageAlt: string;
  heroImageSrc?: string;
  whatsappMessage: string;
  benefits: string[];
  whyChooseUs: WhyItem[];
  process: Step[];
  cases: CaseItem[];
  faqs: { q: string; a: string }[];
  relatedLinks?: { label: string; to: string }[];
}

const LocationServiceLanding = (props: LocationServiceLandingProps) => {
  const {
    slug, title, description, keywords, eyebrow, h1, subhead,
    serviceName, serviceDescription, heroImageAlt, heroImageSrc,
    whatsappMessage, benefits, whyChooseUs, process, cases, faqs, relatedLinks,
  } = props;

  const url = `https://smilz.net/services/${slug}/`;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={url}
        breadcrumbs={[
          { name: "Home", url: "https://smilz.net/" },
          { name: "Services", url: "https://smilz.net/services/" },
          { name: serviceName, url },
        ]}
        faqs={faqs}
        service={{
          name: serviceName,
          description: serviceDescription,
          url,
        }}
      />

      <LandingHero
        eyebrow={eyebrow}
        h1={h1}
        subhead={subhead}
        imageAlt={heroImageAlt}
        imageSrc={heroImageSrc}
        whatsappMessage={whatsappMessage}
      />

      {/* Trust strip */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-[#1A365D]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-dental-green shrink-0" aria-hidden="true" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]/70">
              Why patients across South Kolkata choose Smilz
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
              Advanced dental care near Garia metro
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {whyChooseUs.map((w, i) => (
              <div
                key={i}
                className="rounded-xl bg-background p-6 shadow-sm ring-1 ring-border hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-[#1A365D]">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment process */}
      <section className="section-padding bg-dental-surface">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]/70">
              Your Treatment Journey
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
              A gentle, guided process from start to finish
            </h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {process.map((s, i) => (
              <li
                key={i}
                className="relative rounded-xl bg-background p-6 shadow-sm ring-1 ring-border"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1A365D] text-white font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-[#1A365D]">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Before / After */}
      <BeforeAfterShowcase cases={cases} />

      {/* Location strip */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-[#1A365D] text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-6 w-6 text-amber-300 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold">
                  Trusted {serviceName.toLowerCase()} clinic near Garia metro
                </h2>
                <p className="mt-2 text-white/80 max-w-2xl">
                  Located at 21 Garia Park, opposite Garia Park Club and just a short walk from Garia Metro (Kavi Subhash). Convenient for patients across Patuli, Naktala, Baghajatin, Sonarpur and Jadavpur.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/contact/"
                className="inline-flex items-center rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1A365D] hover:bg-amber-300 transition"
              >
                Book a consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <LocationFAQ faqs={faqs} />

      {/* Related */}
      {relatedLinks && relatedLinks.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-heading font-semibold text-[#1A365D] mb-4">
              Related services
            </h2>
            <ul className="flex flex-wrap gap-3 text-sm">
              {relatedLinks.map((r, i) => (
                <li key={i}>
                  <Link
                    to={r.to}
                    className="inline-block rounded-full border border-border bg-background px-4 py-2 text-[#1A365D] hover:bg-dental-surface transition"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Bottom padding on mobile so sticky bar doesn't cover content */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      <StickyMobileCTA whatsappMessage={whatsappMessage} />
    </>
  );
};

export default LocationServiceLanding;
