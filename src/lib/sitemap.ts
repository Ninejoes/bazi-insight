import { type Article } from "./articles";
import { type DreamRecord } from "./admin-content";
import { siteUrl } from "./seo";
import { tarotCategories } from "./tarot-cards";

export type SitemapArticle = Pick<Article, "slug" | "date">;
export type SitemapDream = Pick<DreamRecord, "keyword"> & { updatedAt?: string };

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

export type SitemapFile = {
  path: string;
  xml: string;
  urlCount: number;
};

const sitemapChunkSize = 5000;

const basePublicRoutes: SitemapEntry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/bazi", changefreq: "weekly", priority: "0.9" },
  { loc: "/tarot", changefreq: "weekly", priority: "0.9" },
  { loc: "/dream", changefreq: "weekly", priority: "0.9" },
  { loc: "/lottery", changefreq: "daily", priority: "0.8" },
  { loc: "/articles", changefreq: "weekly", priority: "0.8" },
  { loc: "/about", changefreq: "monthly", priority: "0.6" },
  { loc: "/contact", changefreq: "monthly", priority: "0.6" },
  { loc: "/help", changefreq: "monthly", priority: "0.6" },
];

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeSiteUrl(url = siteUrl) {
  return url.replace(/\/$/, "");
}

function normalizeDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function dedupeEntries(entries: SitemapEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value.trim());
}

function chunkEntries(entries: SitemapEntry[], size = sitemapChunkSize) {
  const chunks: SitemapEntry[][] = [];
  for (let index = 0; index < entries.length; index += size) {
    chunks.push(entries.slice(index, index + size));
  }
  return chunks;
}

export function staticSitemapEntries() {
  const tarotRoutes = tarotCategories.map((category) => ({
    loc: `/tarot/${category.slug}`,
    changefreq: "weekly" as const,
    priority: category.slug === "daily" ? "0.8" : "0.7",
  }));
  return dedupeEntries([...basePublicRoutes, ...tarotRoutes]);
}

export function articleSitemapEntries(articles: SitemapArticle[] = []) {
  const articleRoutes = articles.map((article) => ({
    loc: `/articles/${encodePathSegment(article.slug)}`,
    lastmod: normalizeDate(article.date),
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
  return dedupeEntries(articleRoutes);
}

export function dreamSitemapEntries(dreams: SitemapDream[] = []) {
  const dreamRoutes = dreams.map((dream) => ({
    loc: `/dream/${encodePathSegment(dream.keyword)}`,
    lastmod: normalizeDate(dream.updatedAt),
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
  return dedupeEntries(dreamRoutes);
}

export function publicSitemapEntries(articles: SitemapArticle[] = [], dreams: SitemapDream[] = []) {
  return dedupeEntries([
    ...staticSitemapEntries(),
    ...articleSitemapEntries(articles),
    ...dreamSitemapEntries(dreams),
  ]);
}

export function buildUrlsetXml(entries: SitemapEntry[], url = siteUrl) {
  const origin = normalizeSiteUrl(url);
  const body = entries
    .map((entry) => {
      const lastmod = normalizeDate(entry.lastmod);
      return `  <url>
    <loc>${xmlEscape(`${origin}${entry.loc}`)}</loc>
${lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` : ""}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function buildSitemapIndexXml(files: Pick<SitemapFile, "path">[], url = siteUrl) {
  const origin = normalizeSiteUrl(url);
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = files
    .map(
      (file) => `  <sitemap>
    <loc>${xmlEscape(`${origin}${file.path}`)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export function buildSitemapFiles(
  articles: SitemapArticle[] = [],
  url = siteUrl,
  dreams: SitemapDream[] = [],
) {
  const files: SitemapFile[] = [
    {
      path: "/sitemap-static.xml",
      xml: buildUrlsetXml(staticSitemapEntries(), url),
      urlCount: staticSitemapEntries().length,
    },
  ];

  chunkEntries(articleSitemapEntries(articles)).forEach((entries, index) => {
    files.push({
      path: `/sitemap-articles-${index + 1}.xml`,
      xml: buildUrlsetXml(entries, url),
      urlCount: entries.length,
    });
  });

  chunkEntries(dreamSitemapEntries(dreams)).forEach((entries, index) => {
    files.push({
      path: `/sitemap-dreams-${index + 1}.xml`,
      xml: buildUrlsetXml(entries, url),
      urlCount: entries.length,
    });
  });

  return files;
}

export function buildSitemapXml(
  articles: SitemapArticle[] = [],
  url = siteUrl,
  dreams: SitemapDream[] = [],
) {
  return buildUrlsetXml(publicSitemapEntries(articles, dreams), url);
}
