import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { buildSitemapXml, type SitemapArticle, type SitemapDream } from "./lib/sitemap";
import { siteUrl } from "./lib/seo";
import { getSupabaseConfig, supabaseRequest } from "./lib/supabase-rest";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let sitemapCache: { xml: string; expiresAt: number } | undefined;
let sitemapRefreshPromise: Promise<string> | undefined;

const sitemapCacheMs = 60 * 60 * 1000;
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
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      select,
      limit: String(sitemapPageLimit),
      offset: String(offset),
    });
    params.set("order", order);

    const response = await supabaseRequest(`${table}?${params.toString()}`);
    if (!response) return undefined;

    const pageRows = (await response.json().catch(() => [])) as T[];
    if (!Array.isArray(pageRows)) return rows.length ? rows : undefined;

    rows.push(...pageRows);
    if (pageRows.length < sitemapPageLimit) break;
    offset += sitemapPageLimit;
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

function noStoreHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  next.set("Pragma", "no-cache");
  next.set("Expires", "0");
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

async function withHtmlNoStore(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const headers = noStoreHeaders(response.headers);
  if (response.status === 404 || response.status === 410) {
    headers.set("X-Robots-Tag", "noindex, follow");
    const html = await response.text();
    return new Response(injectNoindexIntoErrorHtml(html), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function xmlHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Content-Type", "application/xml; charset=utf-8");
  next.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=86400");
  return next;
}

function textHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Content-Type", "text/plain; charset=utf-8");
  next.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=86400");
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
  return buildSitemapXml(articles, siteUrl, dreams);
}

async function getCachedSitemapXml() {
  const now = Date.now();
  if (sitemapCache && sitemapCache.expiresAt > now) return sitemapCache.xml;

  if (!sitemapRefreshPromise) {
    sitemapRefreshPromise = buildFreshSitemapXml()
      .then((xml) => {
        sitemapCache = { xml, expiresAt: Date.now() + sitemapCacheMs };
        return xml;
      })
      .finally(() => {
        sitemapRefreshPromise = undefined;
      });
  }

  if (sitemapCache) return sitemapCache.xml;
  return sitemapRefreshPromise;
}

async function sitemapResponse() {
  return new Response(await getCachedSitemapXml(), { headers: xmlHeaders() });
}

function robotsResponse() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /admin-login",
      "Disallow: /login",
      "Disallow: /register",
      "Disallow: /profile",
      "Disallow: /api/",
      "",
      "Allow: /api/articles",
      "Allow: /api/dreams",
      "Allow: /api/faqs",
      "Allow: /api/site-content",
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
      if (url.pathname === "/sitemap.xml") return sitemapResponse();
      if (url.pathname === "/robots.txt") return robotsResponse();
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withHtmlNoStore(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: noStoreHeaders({ "content-type": "text/html; charset=utf-8" }),
      });
    }
  },
};
