const SITE_NAME = "Likhitfa ลิขิตฟ้า";
const SITE_URL = "https://www.likhitfa.online";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
export const googleAnalyticsId = "G-7F7B1DXGC1";
export const googleSearchVerification =
  import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ||
  import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_VERIFICATION ||
  "";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
  scripts?: Array<Record<string, string>>;
};

export function seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  keywords = [],
  publishedTime,
  modifiedTime,
  canonicalUrl,
  scripts = [],
}: SeoInput) {
  const canonical = canonicalUrl || `${SITE_URL}${path}`;
  const imageUrl = image.startsWith("http")
    ? image
    : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  const fullTitle = title.includes("Likhitfa") ? title : `${title} — ${SITE_NAME}`;
  const meta = [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },
    { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "th_TH" },
    { property: "og:type", content: type },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: imageUrl },
    { property: "og:image:secure_url", content: imageUrl },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  if (googleSearchVerification) {
    meta.push({ name: "google-site-verification", content: googleSearchVerification });
  }
  if (publishedTime) meta.push({ property: "article:published_time", content: publishedTime });
  if (modifiedTime) meta.push({ property: "article:modified_time", content: modifiedTime });

  return {
    meta,
    links: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hrefLang: "th-TH", href: canonical },
      { rel: "sitemap", type: "application/xml", href: `${SITE_URL}/sitemap.xml` },
    ],
    scripts,
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

export const siteUrl = SITE_URL;
export const siteName = SITE_NAME;
export const defaultImage = DEFAULT_IMAGE;

export function organizationJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ["Likhitfa", "ลิขิตฟ้า"],
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.jpg`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Thai"],
    },
  });
}

export function websiteJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Likhitfa",
    url: SITE_URL,
    inLanguage: "th-TH",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/articles?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}
