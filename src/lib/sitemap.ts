import { articles as staticArticles, type Article } from "./articles";
import { dreamSeed, type DreamRecord } from "./admin-content";
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
const maxCuratedDreamSitemapCount = 250;

const basePublicRoutes: SitemapEntry[] = [
  { loc: "/", lastmod: "2026-09-11", changefreq: "weekly", priority: "1.0" },
  { loc: "/bazi", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/tarot", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/dream", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/life-graph", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/brahma-wheel", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/love-compatibility", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/zodiac", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/daily-hub", lastmod: "2026-09-11", changefreq: "daily", priority: "0.9" },
  { loc: "/destiny-card", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.8" },
  { loc: "/lucky-colors", lastmod: "2026-09-11", changefreq: "daily", priority: "0.9" },
  { loc: "/auspicious-calendar", lastmod: "2026-09-11", changefreq: "daily", priority: "0.9" },
  { loc: "/phone-analysis", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/plate-analysis", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/name-analysis", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/naming", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/tai-sui", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.9" },
  { loc: "/virtual-shrine", lastmod: "2026-09-11", changefreq: "daily", priority: "0.9" },
  { loc: "/siamsi", lastmod: "2026-09-11", changefreq: "daily", priority: "0.9" },
  { loc: "/wallpaper", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.8" },
  { loc: "/lottery", lastmod: "2026-09-11", changefreq: "daily", priority: "0.8" },
  { loc: "/articles", lastmod: "2026-09-11", changefreq: "weekly", priority: "0.8" },
  { loc: "/about", lastmod: "2026-09-11", changefreq: "monthly", priority: "0.6" },
  { loc: "/contact", lastmod: "2026-09-11", changefreq: "monthly", priority: "0.6" },
  { loc: "/help", lastmod: "2026-09-11", changefreq: "monthly", priority: "0.6" },
  { loc: "/terms", lastmod: "2026-09-11", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy", lastmod: "2026-09-11", changefreq: "monthly", priority: "0.5" },
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

export function isCuratedArticleSlug(slug: string) {
  const clean = slug.trim();
  if (!clean) return false;
  if (/^seo-/i.test(clean)) return false;
  if (/--/.test(clean)) return false;
  if (/^dream-.*-\d+-\d+$/i.test(clean)) return false;
  return true;
}

export function isCuratedDreamKeyword(keyword: string) {
  const clean = keyword.trim();
  if (!clean) return false;
  if (clean.includes(" ")) return false;
  if (clean.startsWith("ฝันเห็น")) return false;
  return true;
}

export function staticSitemapEntries() {
  const tarotRoutes = tarotCategories.map((category) => ({
    loc: `/tarot/${category.slug}`,
    lastmod: "2026-09-06",
    changefreq: "weekly" as const,
    priority: category.slug === "daily" ? "0.8" : "0.7",
  }));
  return dedupeEntries([...basePublicRoutes, ...tarotRoutes]);
}

export function articleSitemapEntries(articles: SitemapArticle[] = []) {
  const combined: SitemapArticle[] = [
    ...staticArticles.map((article) => ({ slug: article.slug, date: article.date })),
    ...articles,
  ];
  const articleRoutes = combined
    .filter((article) => isCuratedArticleSlug(article.slug))
    .map((article) => ({
      loc: `/articles/${encodePathSegment(article.slug)}`,
      lastmod: normalizeDate(article.date) || "2026-09-06",
      changefreq: "weekly" as const,
      priority: "0.7",
    }));
  return dedupeEntries(articleRoutes);
}

export function dreamSitemapEntries(dreams: SitemapDream[] = []) {
  const curatedBase: SitemapDream[] = dreamSeed.map((dream) => ({
    keyword: dream.keyword,
    updatedAt: "2026-09-14",
  }));
  const filteredDynamic = dreams.filter((dream) => isCuratedDreamKeyword(dream.keyword));
  const combined = [...curatedBase, ...filteredDynamic];

  const dreamRoutes = combined.map((dream) => ({
    loc: `/dream/${encodePathSegment(dream.keyword)}`,
    lastmod: normalizeDate(dream.updatedAt) || "2026-09-14",
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
  return dedupeEntries(dreamRoutes).slice(0, maxCuratedDreamSitemapCount);
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
  const fallbackLastmod = new Date().toISOString().slice(0, 10);
  const body = entries
    .map((entry) => {
      const lastmod = normalizeDate(entry.lastmod) || fallbackLastmod;
      return `  <url>
    <loc>${xmlEscape(`${origin}${entry.loc}`)}</loc>
    <lastmod>${xmlEscape(lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
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
