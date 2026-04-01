import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ q: string; a: string }>;
}

const SEOHead = ({
  title, description, keywords, canonicalUrl, ogImage,
  type = "website", article, breadcrumbs, faqs,
}: SEOHeadProps) => {
  const { data: settings } = useSiteSettings();
  const general = settings?.general;
  const contact = settings?.contact;
  const links = settings?.links;
  const coords = settings?.coordinates;

  const clinicName = general?.clinic_name ?? "Smilz Dental Treatment Facility";
  const website = links?.website ?? "https://www.smilz.net";
  const fullTitle = `${title} | ${clinicName}`;
  const url = canonicalUrl || website;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinicName,
    image: ogImage || `${website}/og-image.jpg`,
    url: website,
    telephone: contact?.phone ?? "8961775554",
    email: contact?.email ?? "dr.d.dutta@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "21, Garia Park",
      addressLocality: "Kolkata",
      addressRegion: "West Bengal",
      postalCode: "700084",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: coords?.lat ?? 22.4625,
      longitude: coords?.lng ?? 88.3942,
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "13:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "17:00", closes: "21:00" },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: general?.google_rating ?? 4.8,
      reviewCount: general?.review_count ?? 44,
    },
    foundingDate: (general?.year_established ?? 1999).toString(),
    priceRange: "$$",
  };

  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, i) => ({
      "@type": "ListItem", position: i + 1, name: item.name, item: item.url,
    })),
  } : null;

  const faqSchema = faqs?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question", name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={clinicName} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
    </Helmet>
  );
};

export default SEOHead;
