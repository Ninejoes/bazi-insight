import { createFileRoute } from "@tanstack/react-router";
import { articles as seed, type Article } from "@/lib/articles";

type ArticleRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  read_min?: number;
  readMin?: number;
  cover: string;
  cover_alt?: string;
  coverAlt?: string;
  seo_title?: string;
  seoTitle?: string;
  seo_description?: string;
  seoDescription?: string;
  keywords?: string[] | string;
  canonical_url?: string;
  canonicalUrl?: string;
  content: string[] | string;
};

let memoryArticles: Article[] = [...seed];

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...(init?.headers || {}),
    },
  });
}

function getSupabaseConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

function normalizeArticle(row: ArticleRow): Article {
  const content = Array.isArray(row.content)
    ? row.content
    : String(row.content || "")
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean);
  const keywords = Array.isArray(row.keywords)
    ? row.keywords
    : String(row.keywords || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    date: row.date,
    readMin: Number(row.readMin || row.read_min || 3),
    cover: row.cover,
    coverAlt: row.coverAlt || row.cover_alt || "",
    seoTitle: row.seoTitle || row.seo_title || "",
    seoDescription: row.seoDescription || row.seo_description || "",
    keywords,
    canonicalUrl: row.canonicalUrl || row.canonical_url || "",
    content,
  };
}

function toSupabaseRow(article: Article) {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    author: article.author,
    date: article.date,
    read_min: article.readMin,
    cover: article.cover,
    cover_alt: article.coverAlt || "",
    seo_title: article.seoTitle || "",
    seo_description: article.seoDescription || "",
    keywords: article.keywords || [],
    canonical_url: article.canonicalUrl || "",
    content: article.content,
    updated_at: new Date().toISOString(),
  };
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const config = getSupabaseConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase articles failed ${response.status}: ${detail}`);
  }

  return response;
}

async function listArticles() {
  const configured = Boolean(getSupabaseConfig());

  try {
    const response = await supabaseRequest("articles?select=*&order=date.desc");
    if (!response) return { source: "memory", articles: memoryArticles };
    const rows = (await response.json().catch(() => [])) as ArticleRow[];
    return { source: "supabase", articles: rows.map(normalizeArticle) };
  } catch (error) {
    if (configured) {
      return {
        source: "memory",
        articles: memoryArticles,
        error: error instanceof Error ? error.message : "Supabase articles failed",
      };
    }
    return { source: "memory", articles: memoryArticles };
  }
}

async function saveArticle(article: Article) {
  const configured = Boolean(getSupabaseConfig());
  memoryArticles = [article, ...memoryArticles.filter((item) => item.slug !== article.slug)];

  try {
    const response = await supabaseRequest("articles?on_conflict=slug", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(toSupabaseRow(article)),
    });
    if (!response) return { source: "memory", article };
    const rows = (await response.json().catch(() => [])) as ArticleRow[];
    return { source: "supabase", article: normalizeArticle(rows[0] || article) };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory", article };
  }
}

async function deleteArticle(slug: string) {
  const configured = Boolean(getSupabaseConfig());
  memoryArticles = memoryArticles.filter((item) => item.slug !== slug);

  try {
    const response = await supabaseRequest(`articles?slug=eq.${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (!response) return { source: "memory" };
    return { source: "supabase" };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory" };
  }
}

export const Route = createFileRoute("/api/articles")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const result = await listArticles();
        const articles = slug
          ? result.articles.filter((article) => article.slug === slug)
          : result.articles;
        return json({ ok: true, source: result.source, articles, error: result.error });
      },
      POST: async ({ request }) => {
        try {
          const article = normalizeArticle((await request.json()) as ArticleRow);
          return json({ ok: true, ...(await saveArticle(article)) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "บันทึกบทความไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
      PUT: async ({ request }) => {
        try {
          const article = normalizeArticle((await request.json()) as ArticleRow);
          return json({ ok: true, ...(await saveArticle(article)) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "บันทึกบทความไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const slug = url.searchParams.get("slug");
          if (!slug) return json({ ok: false, error: "Missing slug" }, { status: 400 });
          return json({ ok: true, ...(await deleteArticle(slug)) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "ลบบทความไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
