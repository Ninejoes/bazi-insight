import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  buildSitemapFiles,
  buildSitemapIndexXml,
  type SitemapArticle,
  type SitemapDream,
  type SitemapFile,
} from "./lib/sitemap";
import { siteUrl } from "./lib/seo";
import { getSupabaseConfig, supabaseRequest } from "./lib/supabase-rest";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let sitemapCache: { files: Map<string, string>; expiresAt: number } | undefined;
let sitemapRefreshPromise: Promise<Map<string, string>> | undefined;

const sitemapCacheMs = 15 * 60 * 1000;
const sitemapPageLimit = 1000;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function loadSupabaseSitemapRows<T extends Record<string, unknown>>({
  table,
  select,
  order,
}: {
  table: string;
  select: string;
  order: string;
}) {
  const rows: T[] = [];
  const pageSize = sitemapPageLimit;

  const firstParams = new URLSearchParams({
    select,
    limit: String(pageSize),
    offset: "0",
  });
  firstParams.set("order", order);

  const firstResponse = await supabaseRequest(`${table}?${firstParams.toString()}`, {
    headers: { Prefer: "count=exact" },
  });
  if (!firstResponse) return undefined;

  const firstRows = (await firstResponse.json().catch(() => [])) as T[];
  if (!Array.isArray(firstRows)) return undefined;
  rows.push(...firstRows);

  if (firstRows.length < pageSize) {
    return rows;
  }

  const contentRange = firstResponse.headers.get("content-range") || "";
  const totalCountMatch = contentRange.match(/\/(\d+)$/);
  const totalCount = totalCountMatch ? parseInt(totalCountMatch[1], 10) : NaN;

  if (Number.isFinite(totalCount) && totalCount > pageSize) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const offsets: number[] = [];
    for (let i = 1; i < totalPages; i++) {
      offsets.push(i * pageSize);
    }

    const batchSize = 6;
    for (let i = 0; i < offsets.length; i += batchSize) {
      const batchOffsets = offsets.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batchOffsets.map(async (offset) => {
          const params = new URLSearchParams({
            select,
            limit: String(pageSize),
            offset: String(offset),
          });
          params.set("order", order);
          const response = await supabaseRequest(`${table}?${params.toString()}`);
          if (!response) return [];
          const data = (await response.json().catch(() => [])) as T[];
          return Array.isArray(data) ? data : [];
        }),
      );
      for (const pageRows of batchResults) {
        rows.push(...pageRows);
      }
    }
  } else {
    let offset = pageSize;
    while (true) {
      const params = new URLSearchParams({
        select,
        limit: String(pageSize),
        offset: String(offset),
      });
      params.set("order", order);

      const response = await supabaseRequest(`${table}?${params.toString()}`);
      if (!response) break;

      const pageRows = (await response.json().catch(() => [])) as T[];
      if (!Array.isArray(pageRows) || pageRows.length === 0) break;

      rows.push(...pageRows);
      if (pageRows.length < pageSize) break;
      offset += pageSize;
    }
  }

  return rows;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: noStoreHeaders({ "content-type": "text/html; charset=utf-8" }),
  });
}

function applySecurityHeaders(headers: Headers) {
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function noStoreHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  next.set("Pragma", "no-cache");
  next.set("Expires", "0");
  applySecurityHeaders(next);
  return next;
}

function injectNoindexIntoErrorHtml(html: string) {
  const withoutCanonical = html.replace(
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi,
    "",
  );
  const noindexMeta = '<meta name="robots" content="noindex,follow"/>';

  if (/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i.test(withoutCanonical)) {
    return withoutCanonical.replace(
      /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i,
      noindexMeta,
    );
  }

  return withoutCanonical.replace(/<head([^>]*)>/i, `<head$1>${noindexMeta}`);
}

function isPrivateRoute(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname === "/login" ||
    pathname === "/register"
  );
}

function publicSsrHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  );
  applySecurityHeaders(next);
  return next;
}

async function withHtmlCache(response: Response, pathname: string) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    const headers = new Headers(response.headers);
    applySecurityHeaders(headers);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (response.status === 404 || response.status === 410) {
    const headers = noStoreHeaders(response.headers);
    headers.set("X-Robots-Tag", "noindex, follow");
    const html = await response.text();
    return new Response(injectNoindexIntoErrorHtml(html), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (response.status >= 400 || isPrivateRoute(pathname)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: noStoreHeaders(response.headers),
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: publicSsrHeaders(response.headers),
  });
}

function xmlHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Content-Type", "application/xml; charset=utf-8");
  next.set(
    "Cache-Control",
    "public, max-age=600, s-maxage=1800, stale-while-revalidate=86400",
  );
  return next;
}

function textHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Content-Type", "text/plain; charset=utf-8");
  next.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );
  return next;
}

async function loadArticlesForSitemap() {
  if (!getSupabaseConfig()) return undefined;

  const rows = await loadSupabaseSitemapRows<{ slug?: string; date?: string }>({
    table: "articles",
    select: "slug,date",
    order: "date.desc",
  });

  return rows
    ?.map((row): SitemapArticle | null => {
      const slug = String(row.slug || "").trim();
      if (!slug) return null;
      return { slug, date: String(row.date || "") };
    })
    .filter((row): row is SitemapArticle => Boolean(row));
}

async function loadDreamsForSitemap() {
  if (!getSupabaseConfig()) return undefined;

  const rows = await loadSupabaseSitemapRows<{ keyword?: string; updated_at?: string }>({
    table: "dreams",
    select: "keyword,updated_at",
    order: "keyword.asc",
  });

  return rows
    ?.map((row): SitemapDream | null => {
      const keyword = String(row.keyword || "").trim();
      if (!keyword) return null;
      return { keyword, updatedAt: String(row.updated_at || "") };
    })
    .filter((row): row is SitemapDream => Boolean(row));
}

async function buildFreshSitemapXml() {
  const [articles, dreams] = await Promise.all([loadArticlesForSitemap(), loadDreamsForSitemap()]);
  const sitemapFiles = buildSitemapFiles(articles, siteUrl, dreams);
  return buildSitemapFileMap(sitemapFiles);
}

function buildSitemapFileMap(sitemapFiles: SitemapFile[]) {
  const files = new Map<string, string>();
  files.set("/sitemap.xml", buildSitemapIndexXml(sitemapFiles, siteUrl));
  for (const sitemapFile of sitemapFiles) {
    files.set(sitemapFile.path, sitemapFile.xml);
  }
  return files;
}

async function getCachedSitemapFiles() {
  const now = Date.now();
  if (sitemapCache && sitemapCache.expiresAt > now) return sitemapCache.files;

  if (!sitemapRefreshPromise) {
    sitemapRefreshPromise = buildFreshSitemapXml()
      .then((files) => {
        sitemapCache = { files, expiresAt: Date.now() + sitemapCacheMs };
        return files;
      })
      .finally(() => {
        sitemapRefreshPromise = undefined;
      });
  }

  if (sitemapCache) return sitemapCache.files;
  return sitemapRefreshPromise;
}

async function sitemapResponse(pathname: string) {
  const files = await getCachedSitemapFiles();
  const xml = files.get(pathname);
  if (!xml) {
    return new Response("Sitemap not found", {
      status: 404,
      headers: textHeaders({ "X-Robots-Tag": "noindex, follow" }),
    });
  }
  return new Response(xml, { headers: xmlHeaders() });
}

const BLOCKED_AI_SCRAPERS = [
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /claude-web/i,
  /anthropic-ai/i,
  /ccbot/i,
  /bytespider/i,
  /diffbot/i,
  /perplexitybot/i,
  /cohere-ai/i,
  /meta-externalagent/i,
  /facebookbot/i,
  /omgilibot/i,
  /imagesiftbot/i,
  /scrapy/i,
  /httrack/i,
  /sitesucker/i,
  /teleportpro/i,
  /webcopier/i,
  /offline explorer/i,
];

function checkBotShield(request: Request, pathname: string): Response | null {
  const ua = request.headers.get("user-agent") || "";

  // Check known AI scraping bots and site cloners
  if (ua) {
    for (const pattern of BLOCKED_AI_SCRAPERS) {
      if (pattern.test(ua)) {
        return new Response(
          "403 Forbidden: Automated AI scraping and content harvesting are strictly prohibited on Likhitfa.",
          {
            status: 403,
            headers: textHeaders({ "X-Robots-Tag": "noindex, nofollow" }),
          },
        );
      }
    }
  }

  // Protect internal API endpoints from direct scraper/script dumping
  if (pathname.startsWith("/api/")) {
    const isWebhookOrCron =
      pathname === "/api/cron-auto-article" ||
      pathname === "/api/auto-article";

    if (!isWebhookOrCron) {
      const secFetchSite = request.headers.get("sec-fetch-site");
      const referer = request.headers.get("referer") || "";
      const isSameOriginBrowser =
        secFetchSite === "same-origin" ||
        referer.includes("likhitfa.online") ||
        referer.includes("localhost");

      const isScriptScraper =
        !ua ||
        /python-requests|aiohttp|wget|httpie|scrapy|postman|insomnia|go-http-client|axios|node-fetch/i.test(
          ua,
        );

      if (!isSameOriginBrowser && isScriptScraper) {
        return new Response(
          JSON.stringify({ error: "Forbidden: API access restricted to authenticated clients." }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "X-Robots-Tag": "noindex, nofollow",
            },
          },
        );
      }
    }
  }

  return null;
}

function robotsResponse() {
  return new Response(
    [
      "# Likhitfa Robots.txt — https://www.likhitfa.online",
      "# Allowed Search Engines (SEO)",
      "User-agent: Googlebot",
      "Allow: /",
      "",
      "User-agent: Googlebot-Image",
      "Allow: /",
      "",
      "User-agent: Bingbot",
      "Allow: /",
      "",
      "User-agent: Slurp",
      "Allow: /",
      "",
      "User-agent: DuckDuckBot",
      "Allow: /",
      "",
      "User-agent: Baiduspider",
      "Allow: /",
      "",
      "User-agent: Yandex",
      "Allow: /",
      "",
      "# Block AI crawlers, scrapers, and LLM training bots",
      "User-agent: GPTBot",
      "Disallow: /",
      "",
      "User-agent: ChatGPT-User",
      "Disallow: /",
      "",
      "User-agent: CCBot",
      "Disallow: /",
      "",
      "User-agent: ClaudeBot",
      "Disallow: /",
      "",
      "User-agent: Claude-Web",
      "Disallow: /",
      "",
      "User-agent: anthropic-ai",
      "Disallow: /",
      "",
      "User-agent: Bytespider",
      "Disallow: /",
      "",
      "User-agent: Diffbot",
      "Disallow: /",
      "",
      "User-agent: PerplexityBot",
      "Disallow: /",
      "",
      "User-agent: cohere-ai",
      "Disallow: /",
      "",
      "User-agent: Meta-ExternalAgent",
      "Disallow: /",
      "",
      "User-agent: FacebookBot",
      "Disallow: /",
      "",
      "User-agent: Omgilibot",
      "Disallow: /",
      "",
      "User-agent: ImagesiftBot",
      "Disallow: /",
      "",
      "# Block automated website copiers and offline harvesters",
      "User-agent: Scrapy",
      "Disallow: /",
      "",
      "User-agent: HTTrack",
      "Disallow: /",
      "",
      "User-agent: Wget",
      "Disallow: /",
      "",
      "User-agent: SiteSucker",
      "Disallow: /",
      "",
      "User-agent: TeleportPro",
      "Disallow: /",
      "",
      "User-agent: WebCopier",
      "Disallow: /",
      "",
      "User-agent: Offline Explorer",
      "Disallow: /",
      "",
      "# Default rules for other search engines",
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /admin-login",
      "Disallow: /login",
      "Disallow: /register",
      "Disallow: /profile",
      "Disallow: /api/",
      "",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      "",
    ].join("\n"),
    { headers: textHeaders() },
  );
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/sitemap.xml" || /^\/sitemap-[\w-]+\.xml$/.test(url.pathname)) {
        return sitemapResponse(url.pathname);
      }
      if (url.pathname === "/robots.txt") return robotsResponse();

      const shieldBlock = checkBotShield(request, url.pathname);
      if (shieldBlock) return shieldBlock;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withHtmlCache(await normalizeCatastrophicSsrResponse(response), url.pathname);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: noStoreHeaders({ "content-type": "text/html; charset=utf-8" }),
      });
    }
  },
};
