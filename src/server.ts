import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { type Article } from "./lib/articles";
import { type DreamRecord } from "./lib/admin-content";
import { buildSitemapXml } from "./lib/sitemap";
import { siteUrl } from "./lib/seo";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
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

function withHtmlNoStore(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: noStoreHeaders(response.headers),
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

async function loadArticlesForSitemap(
  handler: ServerEntry,
  request: Request,
  env: unknown,
  ctx: unknown,
) {
  const url = new URL(request.url);
  const response = await handler.fetch(new Request(`${url.origin}/api/articles`), env, ctx);
  if (!response.ok) return undefined;
  const data = (await response.json().catch(() => null)) as { articles?: Article[] } | null;
  return Array.isArray(data?.articles) ? data.articles : undefined;
}

async function loadDreamsForSitemap(
  handler: ServerEntry,
  request: Request,
  env: unknown,
  ctx: unknown,
) {
  const url = new URL(request.url);
  const response = await handler.fetch(new Request(`${url.origin}/api/dreams`), env, ctx);
  if (!response.ok) return undefined;
  const data = (await response.json().catch(() => null)) as { dreams?: DreamRecord[] } | null;
  return Array.isArray(data?.dreams) ? data.dreams : undefined;
}

async function sitemapResponse(handler: ServerEntry, request: Request, env: unknown, ctx: unknown) {
  const [articles, dreams] = await Promise.all([
    loadArticlesForSitemap(handler, request, env, ctx),
    loadDreamsForSitemap(handler, request, env, ctx),
  ]);
  return new Response(buildSitemapXml(articles, siteUrl, dreams), { headers: xmlHeaders() });
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
      const handler = await getServerEntry();
      const url = new URL(request.url);
      if (url.pathname === "/sitemap.xml") return sitemapResponse(handler, request, env, ctx);
      if (url.pathname === "/robots.txt") return robotsResponse();
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
