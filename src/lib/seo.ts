const SITE_NAME = "Likhitfa ลิขิตฟ้า";
const SITE_URL = "https://www.likhitfa.online";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

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
  const fullTitle = title.includes("Likhitfa") ? title : `${title} — ${SITE_NAME}`;
  const meta = [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },
    { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

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
