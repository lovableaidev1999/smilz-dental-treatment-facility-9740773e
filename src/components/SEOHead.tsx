import { Helmet } from "react-helmet-async";
import { CLINIC_INFO } from "@/lib/constants";

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
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  type = "website",
  article,
  breadcrumbs,
  faqs,
}: SEOHeadProps) => {
  const fullTitle = `${title} | ${CLINIC_INFO.name}`;
  const url = canonicalUrl || CLINIC_INFO.website;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: CLINIC_INFO.name,
    image: ogImage || `${CLINIC_INFO.website}/og-image.jpg`,
    url: CLINIC_INFO.website,
    telephone: CLINIC_INFO.phone,
    email: CLINIC_INFO.email,
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
      latitude: CLINIC_INFO.coordinates.lat,
      longitude: CLINIC_INFO.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "13:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "17:00",
        closes: "21:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: CLINIC_INFO.googleRating,
      reviewCount: CLINIC_INFO.reviewCount,
    },
    foundingDate: CLINIC_INFO.yearEstablished.toString(),
    priceRange: "$$",
  };

  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }
    : null;

  const faqSchema = faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={CLINIC_INFO.name} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Article meta */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.author && <meta property="article:author" content={article.author} />}

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
