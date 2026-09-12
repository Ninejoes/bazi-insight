import { writeFile } from "node:fs/promises";

const siteUrl = "https://www.likhitfa.online";
const lastmod = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/bazi", changefreq: "weekly", priority: "0.9" },
  { loc: "/tarot", changefreq: "weekly", priority: "0.9" },
  { loc: "/tarot/daily", changefreq: "weekly", priority: "0.8" },
  { loc: "/tarot/weekly", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/monthly", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/career", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/finance", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/love", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/health", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/family", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/study", changefreq: "weekly", priority: "0.7" },
  { loc: "/tarot/luck", changefreq: "weekly", priority: "0.7" },
  { loc: "/dream", changefreq: "weekly", priority: "0.9" },
  { loc: "/life-graph", changefreq: "weekly", priority: "0.9" },
  { loc: "/brahma-wheel", changefreq: "weekly", priority: "0.9" },
  { loc: "/love-compatibility", changefreq: "weekly", priority: "0.9" },
  { loc: "/zodiac", changefreq: "weekly", priority: "0.9" },
  { loc: "/daily-hub", changefreq: "daily", priority: "0.9" },
  { loc: "/destiny-card", changefreq: "weekly", priority: "0.8" },
  { loc: "/lucky-colors", changefreq: "daily", priority: "0.9" },
  { loc: "/auspicious-calendar", changefreq: "daily", priority: "0.9" },
  { loc: "/phone-analysis", changefreq: "weekly", priority: "0.9" },
  { loc: "/plate-analysis", changefreq: "weekly", priority: "0.9" },
  { loc: "/name-analysis", changefreq: "weekly", priority: "0.9" },
  { loc: "/naming", changefreq: "weekly", priority: "0.9" },
  { loc: "/tai-sui", changefreq: "weekly", priority: "0.9" },
  { loc: "/virtual-shrine", changefreq: "daily", priority: "0.9" },
  { loc: "/siamsi", changefreq: "daily", priority: "0.9" },
  { loc: "/wallpaper", changefreq: "weekly", priority: "0.8" },
  { loc: "/lottery", changefreq: "daily", priority: "0.8" },
  { loc: "/articles", changefreq: "weekly", priority: "0.8" },
  { loc: "/articles/bazi-101", changefreq: "weekly", priority: "0.7" },
  { loc: "/articles/tarot-spread-beginner", changefreq: "weekly", priority: "0.7" },
  { loc: "/articles/dream-numbers", changefreq: "weekly", priority: "0.7" },
  { loc: "/articles/monthly-energy-guide", changefreq: "weekly", priority: "0.7" },
  { loc: "/articles/luck-rituals", changefreq: "weekly", priority: "0.7" },
  { loc: "/articles/love-tarot-guide", changefreq: "weekly", priority: "0.7" },
  { loc: "/about", changefreq: "monthly", priority: "0.6" },
  { loc: "/contact", changefreq: "monthly", priority: "0.6" },
  { loc: "/help", changefreq: "monthly", priority: "0.6" },
  { loc: "/terms", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.5" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${siteUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(new URL("../public/sitemap.xml", import.meta.url), sitemap);
console.log(`Generated public/sitemap.xml with ${urls.length} URLs`);
