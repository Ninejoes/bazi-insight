import { writeFile } from "node:fs/promises";

const siteUrl = "https://www.likhitfa.online";
const lastmod = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/bazi", changefreq: "weekly", priority: "0.9" },
  { loc: "/tarot", changefreq: "weekly", priority: "0.9" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${siteUrl}${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

await writeFile(new URL("../outputs/sitemap.xml", import.meta.url), sitemap);
