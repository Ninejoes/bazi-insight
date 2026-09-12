const SITE_NAME = "Likhitfa ลิขิตฟ้า";
const SITE_URL = "https://www.likhitfa.online";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg?v=20260912`;
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
}: SeoInput) {
  const canonical = canonicalUrl || `${SITE_URL}${path}`;
  const imageUrl = image.startsWith("http")
    ? image
    : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  const hasBrand = title.includes("Likhitfa") || title.includes("ลิขิตฟ้า");
  const fullTitle = hasBrand ? title : `${title} — ${SITE_NAME}`;
  const meta = [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },
    {
      name: "robots",
      content: noindex
        ? "noindex,nofollow"
        : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    },
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
    links: [{ rel: "canonical", href: canonical }],
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

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: ["Likhitfa", "ลิขิตฟ้า", "Likhitfa ดูดวง โหราศาสตร์"],
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    image: DEFAULT_IMAGE,
    description:
      "แพลตฟอร์มดูดวงและโหราศาสตร์ครบวงจร ดูดวงปาจื้อ 4 เสา (BaZi), ดูดวงไพ่ยิปซี, ทำนายฝันแม่นยำ, สีเสื้อมงคลประจำวัน, ฤกษ์มงคล, วิเคราะห์เบอร์มงคล, ตรวจปีชง, เซียมซี และวอลเปเปอร์สายมูพรีเมียม NineJoe",
    sameAs: ["https://ninejoe.online", "https://ninejoe.online/collections"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Thai"],
    },
  };
}

export function organizationJsonLd() {
  return jsonLd(organizationSchema());
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Likhitfa",
    url: SITE_URL,
    inLanguage: "th-TH",
    description:
      "เว็บดูดวงครบวงจรอันดับ 1 รวมศาสตร์พยากรณ์ชั้นสูง ดูดวงปาจื้อ 4 เสา ไพ่ยิปซี ทำนายฝัน สีเสื้อมงคล ปฏิทินฤกษ์ดี วิเคราะห์เบอร์มงคล แก้ปีชง เซียมซี และวอลเปเปอร์สายมู",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/articles?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function websiteJsonLd() {
  return jsonLd(websiteSchema());
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}

export function webApplicationSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${name} — ${SITE_NAME}`,
    url: `${SITE_URL}${path}`,
    description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "THB",
    },
  };
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
