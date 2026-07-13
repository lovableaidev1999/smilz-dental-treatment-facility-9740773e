import { Link } from "react-router-dom";
import { MapPin, Phone, Star, Quote, Calendar, MessageCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import LocationFAQ from "./LocationFAQ";
import StickyMobileCTA from "./StickyMobileCTA";

export interface HubTestimonial {
  name: string;
  area: string;
  quote: string;
  rating?: number;
}

export interface HubServiceLink {
  label: string;
  to: string;
  blurb: string;
}

export interface HubNeighborhood {
  name: string;
  note: string;
}

export interface LocationHubProps {
  slug: string; // path segment after /locations/
  areaLabel: string; // e.g. "Garia" or "South Kolkata"
  title: string;
  description: string;
  keywords?: string;
  eyebrow: string;
  h1: string;
  intro: string;
  heroImageAlt: string;
  heroImageSrc?: string;
  whatsappMessage: string;
  services: HubServiceLink[];
  neighborhoods: HubNeighborhood[];
  testimonials: HubTestimonial[];
  faqs: { q: string; a: string }[];
  relatedLinks?: { label: string; to: string }[];
}

const LocationHub = (props: LocationHubProps) => {
  const {
    slug, areaLabel, title, description, keywords, eyebrow, h1, intro,
    heroImageAlt, heroImageSrc = "/images/hero-dental.webp",
    whatsappMessage, services, neighborhoods, testimonials, faqs, relatedLinks,
  } = props;

  const url = `https://smilz.net/locations/${slug}/`;
  const wa = `https://wa.me/918961775554?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={url}
        breadcrumbs={[
          { name: "Home", url: "https://smilz.net/" },
          { name: "Locations", url: "https://smilz.net/locations/" },
          { name: areaLabel, url },
        ]}
        faqs={faqs}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f2547] to-[#1A365D] text-white">
        <div className="container mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight font-heading">
              {h1}
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/85 max-w-xl">
              {intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contact/"
                className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1A365D] hover:bg-amber-300 transition"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Book Appointment
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-dental-green px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp Inquiry
              </a>
              <a
                href="tel:+918961775554"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                +91 8961 77 5554
              </a>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4 text-amber-300" aria-hidden="true" />
              21 Garia Park, opposite Garia Park Club — near Garia (Kavi Subhash) metro
            </p>
          </div>
          <div>
            <img
              src={heroImageSrc}
              alt={heroImageAlt}
              width={640}
              height={480}
              loading="eager"
              className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-white/10 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services in this area */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]/70">
              Dental services offered in {areaLabel}
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
              Complete dental care, close to home
            </h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Link
                key={i}
                to={s.to}
                className="group rounded-xl bg-background p-6 shadow-sm ring-1 ring-border hover:shadow-md hover:ring-[#1A365D]/30 transition"
              >
                <h3 className="text-lg font-semibold text-[#1A365D] group-hover:underline">
                  {s.label}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.blurb}
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-dental-green">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods served */}
      <section className="section-padding bg-dental-surface">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]/70">
              Neighbourhoods We Serve
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
              Patients travel to us from across {areaLabel}
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((n, i) => (
              <li
                key={i}
                className="rounded-lg bg-background p-4 shadow-sm ring-1 ring-border"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-dental-green shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-base font-semibold text-[#1A365D]">{n.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{n.note}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]/70">
              Patient Stories
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
              What patients from {areaLabel} say
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className="relative rounded-xl bg-background p-6 shadow-sm ring-1 ring-border"
              >
                <Quote className="absolute -top-3 left-4 h-6 w-6 text-amber-400" aria-hidden="true" />
                <div className="flex gap-0.5 mb-3" aria-label={`Rated ${t.rating ?? 5} out of 5`}>
                  {Array.from({ length: t.rating ?? 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-[#1A365D]">{t.name}</span>
                  <span className="text-muted-foreground"> · {t.area}</span>
                </figcaption>
              </figure>
            ))}
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
              Related pages
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

      <div className="h-20 md:hidden" aria-hidden="true" />
      <StickyMobileCTA whatsappMessage={whatsappMessage} />
    </>
  );
};

export default LocationHub;
