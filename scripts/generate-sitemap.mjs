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
