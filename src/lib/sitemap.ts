import { type Article } from "./articles";
import { siteUrl } from "./seo";
import { tarotCategories } from "./tarot-cards";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

const basePublicRoutes: SitemapEntry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/bazi", changefreq: "weekly", priority: "0.9" },
  { loc: "/tarot", changefreq: "weekly", priority: "0.9" },
  { loc: "/dream", changefreq: "weekly", priority: "0.9" },
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
  if (!value) return new Date().toISOString().slice(0, 10);
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

export function publicSitemapEntries(articles: Article[] = []) {
  const today = new Date().toISOString().slice(0, 10);
  const tarotRoutes = tarotCategories.map((category) => ({
    loc: `/tarot/${category.slug}`,
    lastmod: today,
    changefreq: "weekly" as const,
    priority: category.slug === "daily" ? "0.8" : "0.7",
  }));
  const articleRoutes = articles.map((article) => ({
    loc: `/articles/${article.slug}`,
    lastmod: normalizeDate(article.date),
    changefreq: "weekly" as const,
    priority: "0.7",
  }));

  return dedupeEntries([
    ...basePublicRoutes.map((entry) => ({ ...entry, lastmod: today })),
    ...tarotRoutes,
    ...articleRoutes,
  ]);
}

export function buildSitemapXml(articles: Article[] = [], url = siteUrl) {
  const origin = normalizeSiteUrl(url);
  const entries = publicSitemapEntries(articles);
  const body = entries
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(`${origin}${entry.loc}`)}</loc>
    <lastmod>${xmlEscape(normalizeDate(entry.lastmod))}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
