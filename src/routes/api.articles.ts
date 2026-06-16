import { createFileRoute } from "@tanstack/react-router";
import { type Article } from "@/lib/articles";
import {
  json,
  requireAdmin,
  saveContentAuditEvent,
  supabaseRequest,
  getSupabaseConfig,
} from "@/lib/supabase-rest";
import { friendlyErrorMessage } from "@/lib/friendly-error";

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

function clampPage(value: string | null) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function clampLimit(value: string | null) {
  const limit = Number.parseInt(value || "20", 10);
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(limit, 1000);
}

function parseTotal(contentRange: string | null, fallback: number) {
  const total = contentRange?.match(/\/(\d+|\*)$/)?.[1];
  if (!total || total === "*") return fallback;
  return Number.parseInt(total, 10);
}

function buildArticleQuery({
  slug,
  q,
  category,
  page,
  limit,
}: {
  slug: string;
  q: string;
  category: string;
  page: number;
  limit: number;
}) {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    select: "*",
    order: "date.desc",
    limit: String(limit),
    offset: String(offset),
  });

  if (slug) {
    params.set("slug", `eq.${slug}`);
  }
  if (category && category !== "ทั้งหมด") {
    params.set("category", `eq.${category}`);
  }
  if (q) {
    const pattern = `*${q.replace(/[,*()]/g, " ")}*`;
    params.set(
      "or",
      `(${[
        `title.ilike.${pattern}`,
        `excerpt.ilike.${pattern}`,
        `category.ilike.${pattern}`,
        `author.ilike.${pattern}`,
        `seo_title.ilike.${pattern}`,
        `seo_description.ilike.${pattern}`,
      ].join(",")})`,
    );
  }

  return `articles?${params.toString()}`;
}

async function listArticles({ slug = "", q = "", category = "", page = 1, limit = 20 } = {}) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest(buildArticleQuery({ slug, q, category, page, limit }), {
    headers: { Prefer: "count=exact" },
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  const rows = (await response.json().catch(() => [])) as ArticleRow[];
  const total = parseTotal(response.headers.get("content-range"), rows.length);
  return {
    source: "supabase",
    articles: rows.map(normalizeArticle),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

async function saveArticle(article: Article) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest("articles?on_conflict=slug", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(toSupabaseRow(article)),
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  const rows = (await response.json().catch(() => [])) as ArticleRow[];
  return { source: "supabase", article: normalizeArticle(rows[0] || article) };
}

async function deleteArticle(slug: string) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest(`articles?slug=eq.${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  return { source: "supabase" };
}

export const Route = createFileRoute("/api/articles")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const slug = url.searchParams.get("slug") || "";
          const q = (url.searchParams.get("q") || "").trim();
          const category = (url.searchParams.get("category") || "").trim();
          const page = clampPage(url.searchParams.get("page"));
          const limit = clampLimit(url.searchParams.get("limit"));
          return json({
            ok: true,
            ...(await listArticles({ slug, q, category, page, limit })),
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "โหลดบทความไม่สำเร็จ"),
            },
            { status: 502 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const user = await requireAdmin(request);
          const article = normalizeArticle((await request.json()) as ArticleRow);
          const result = await saveArticle(article);
          await saveContentAuditEvent({
            request,
            user,
            action: "update",
            tableName: "articles",
            recordId: article.slug,
            summary: article.title,
            metadata: { category: article.category },
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "บันทึกบทความไม่สำเร็จ");
          return json(
            {
              ok: false,
              error: message,
            },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
      PUT: async ({ request }) => {
        try {
          const user = await requireAdmin(request);
          const article = normalizeArticle((await request.json()) as ArticleRow);
          const result = await saveArticle(article);
          await saveContentAuditEvent({
            request,
            user,
            action: "update",
            tableName: "articles",
            recordId: article.slug,
            summary: article.title,
            metadata: { category: article.category },
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "บันทึกบทความไม่สำเร็จ");
          return json(
            {
              ok: false,
              error: message,
            },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          const user = await requireAdmin(request);
          const url = new URL(request.url);
          const slug = url.searchParams.get("slug");
          if (!slug) return json({ ok: false, error: "Missing slug" }, { status: 400 });
          const result = await deleteArticle(slug);
          await saveContentAuditEvent({
            request,
            user,
            action: "delete",
            tableName: "articles",
            recordId: slug,
            summary: `Deleted article ${slug}`,
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "ลบบทความไม่สำเร็จ");
          return json(
            {
              ok: false,
              error: message,
            },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
    },
  },
});
