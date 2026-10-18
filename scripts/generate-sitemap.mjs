import { writeFile } from "node:fs/promises";

const siteUrl = "https://www.likhitfa.online";
const lastmod = new Date().toISOString().slice(0, 10);
const sitemaps = [
  "/sitemap-static.xml",
  "/sitemap-articles-1.xml",
  "/sitemap-dreams-1.xml",
];

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (path) => `  <sitemap>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;

await writeFile(new URL("../public/sitemap.xml", import.meta.url), sitemapIndex);
console.log(`Generated public/sitemap.xml index with ${sitemaps.length} sitemaps`);
