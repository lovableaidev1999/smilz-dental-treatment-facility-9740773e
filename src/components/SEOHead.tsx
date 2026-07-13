import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { normalizeCanonicalUrl } from "@/lib/canonicalUrl";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ q: string; a: string }>;
  service?: {
    name: string;
    description: string;
    image?: string;
    url: string;
  };
  /**
   * LCP hero image to preload (only set on pages with an above-the-fold hero
   * to avoid wasting mobile bandwidth on pages that don't render it).
   */
  preloadHero?: {
    src: string;
    srcset?: string;
    sizes?: string;
    type?: string;
  };
  /** Optional extra JSON-LD blocks (e.g. from CMS-built location pages). */
  customJsonLd?: object[];
}

const SEOHead = ({
  title, description, keywords, canonicalUrl, ogImage, robots,
  type = "website", article, breadcrumbs, faqs, service, preloadHero, customJsonLd,
}: SEOHeadProps) => {
  const { data: settings } = useSiteSettings();
  const general = settings?.general;
  const contact = settings?.contact;
  const links = settings?.links;
  const coords = settings?.coordinates;

  const clinicName = general?.clinic_name ?? "Smilz Dental Treatment Facility";
  const website = links?.website ?? "https://smilz.net";
  const fullTitle = title.includes(clinicName) || title.includes("Smilz") ? title : `${title} | ${clinicName}`;
  // Always normalize: forces https://smilz.net, strips query/hash, adds trailing
  // slash, lowercases path — so duplicate routes (/about vs /about/, www vs apex,
  // preview domains, UTM params) all resolve to a single canonical URL.
  const url = normalizeCanonicalUrl(canonicalUrl);

  // Collect social sameAs links
  const sameAs = [
    links?.google_maps_url,
    links?.facebook,
    links?.instagram,
    links?.youtube,
  ].filter(Boolean);

  const heroImage = ogImage || "https://smilz.net/og-image.jpg";

  // Organization node — sitewide brand identity. Referenced by Article
  // publisher and by the Dentist LocalBusiness (parentOrganization).
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${website}/#organization`,
    name: clinicName,
    url: website,
    logo: {
      "@type": "ImageObject",
      url: `${website}/og-image.jpg`,
      width: 1200,
      height: 630,
    },
    image: [heroImage],
    email: contact?.email ?? "dr.d.dutta@gmail.com",
    telephone: `+91${contact?.phone ?? "8961775554"}`,
    foundingDate: (general?.year_established ?? 1999).toString(),
    founder: {
      "@type": "Person",
      name: general?.doctor_name ?? "Dr. Dibyendu Dutta",
      jobTitle: "Dentist",
    },
    ...(sameAs.length > 0 && { sameAs }),
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: `+91${contact?.phone ?? "8961775554"}`,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi", "Bengali"],
    }],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "LocalBusiness", "MedicalBusiness"],
    parentOrganization: { "@id": `${website}/#organization` },
    "@id": `${website}/#dentist`,
    name: clinicName,
    // Array form — recommended by Google's LocalBusiness rich-result rules.
    image: [heroImage],
    url: website,
    telephone: `+91${contact?.phone ?? "8961775554"}`,
    email: contact?.email ?? "dr.d.dutta@gmail.com",
    description: `${clinicName} – trusted dental clinic in Garia Park, South Kolkata since ${general?.year_established ?? 1999}. Led by ${general?.doctor_name ?? "Dr. Dibyendu Dutta"}.`,
    founder: {
      "@type": "Person",
      name: general?.doctor_name ?? "Dr. Dibyendu Dutta",
      jobTitle: "Dentist",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "21, Garia Park, Opposite Garia Park Club, Near Andrews College",
      addressLocality: "Garia, Kolkata",
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
      bestRating: 5,
      worstRating: 1,
      reviewCount: general?.review_count ?? 44,
    },
    foundingDate: (general?.year_established ?? 1999).toString(),
    priceRange: "$$",
    ...(sameAs.length > 0 && { sameAs }),
    areaServed: [
      { "@type": "Place", name: "Garia, Kolkata" },
      { "@type": "Place", name: "Garia Buddha Mandir, Kolkata" },
      { "@type": "Place", name: "Near Andrews College, Garia" },
      { "@type": "Place", name: "South Kolkata" },
      { "@type": "Place", name: "Kolkata" },
      { "@type": "Place", name: "Patuli" },
      { "@type": "Place", name: "Naktala" },
      { "@type": "Place", name: "Baghajatin" },
      { "@type": "Place", name: "Sonarpur" },
      { "@type": "Place", name: "Jadavpur" },
      { "@type": "Place", name: "Kavi Subhash Metro Area" },
      {
        "@type": "GeoCircle",
        geoMidpoint: { "@type": "GeoCoordinates", latitude: coords?.lat ?? 22.4625, longitude: coords?.lng ?? 88.3942 },
        geoRadius: "15000",
      },
    ],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${coords?.lat ?? 22.46966133744312},${coords?.lng ?? 88.37928013838973}`,
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
    currenciesAccepted: "INR",
  };

  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      // Normalize every breadcrumb URL so the ListItem `item` matches the
      // page's canonical form (forces https://smilz.net, trailing slash).
      // Fixes Google Rich Results "URL mismatch" warnings.
      item: normalizeCanonicalUrl(item.url),
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

  // Article schema for blog posts.
  // Uses ImageObject with dimensions and a fully-specified publisher.logo
  // so Google's Rich Results test raises no "missing recommended field"
  // warnings when featured_image is empty on legacy posts.
  const articleImage = ogImage || `${website}/og-image.jpg`;
  const articleSchema = type === "article" && article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: {
      "@type": "ImageObject",
      url: articleImage,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Person",
      name: article.author || general?.doctor_name || "Dr. Dibyendu Dutta",
    },
    publisher: {
      "@type": "Organization",
      name: clinicName,
      logo: {
        "@type": "ImageObject",
        url: `${website}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(article.section && { articleSection: article.section }),
  } : null;

  // MedicalBusiness Service schema for service detail pages
  const serviceSchema = service ? {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.name,
    description: service.description,
    url: service.url,
    ...(service.image && { image: service.image }),
    provider: {
      "@type": "Dentist",
      "@id": `${website}/#dentist`,
      name: clinicName,
    },
    howPerformed: "In-office procedure",
    status: "https://schema.org/ActiveActionStatus",
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={robots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      {preloadHero && (
        <link
          rel="preload"
          as="image"
          href={preloadHero.src}
          {...(preloadHero.type ? { type: preloadHero.type } : {})}
          {...(preloadHero.srcset ? { imagesrcset: preloadHero.srcset } : {})}
          {...(preloadHero.sizes ? { imagesizes: preloadHero.sizes } : {})}
          fetchPriority="high"
        />
      )}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={clinicName} />
      <meta property="og:image" content={ogImage || "https://smilz.net/og-image.jpg"} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || "https://smilz.net/og-image.jpg"} />
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.section && <meta property="article:section" content={article.section} />}
      <meta name="geo.region" content="IN-WB" />
      <meta name="geo.placename" content="Kolkata" />
      <meta name="geo.position" content={`${coords?.lat ?? 22.4625};${coords?.lng ?? 88.3942}`} />
      <meta name="ICBM" content={`${coords?.lat ?? 22.4625}, ${coords?.lng ?? 88.3942}`} />
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      {articleSchema && <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>}
      {serviceSchema && <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>}
      {customJsonLd?.map((block, i) => (
        <script key={`custom-ld-${i}`} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
