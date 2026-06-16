import { randomUUID } from "node:crypto";

export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_NAME = "Admin";
export const ADMIN_ROLE = "Admin";

export function getSupabaseConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

export function requireConfig() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  return config;
}

export function headers(serviceKey, accessToken) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${accessToken || serviceKey}`,
  };
}

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export async function readText(response) {
  return response.text().catch(() => "");
}

export async function supabaseRequest(path, init = {}) {
  const { url, serviceKey } = requireConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers(serviceKey),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await readText(response);
    throw new Error(`Supabase failed ${response.status}: ${detail}`);
  }

  return response;
}

export function send(res, status, body) {
  res.status(status).json(body);
}

export function cors(res, methods = "GET, POST, PUT, DELETE, OPTIONS") {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

export function roleOf(user = {}) {
  return user.app_metadata?.role === ADMIN_ROLE || user.user_metadata?.role === ADMIN_ROLE
    ? ADMIN_ROLE
    : "User";
}

export function toSession(token = {}, fallback = {}) {
  const user = token.user || fallback || {};
  const meta = user.user_metadata || {};
  return {
    id: user.id || fallback.id,
    email: user.email || fallback.email || "",
    name: meta.name || meta.displayName || user.email || fallback.email || "",
    role: roleOf(user),
    accessToken: token.access_token,
    expiresAt: token.expires_in
      ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString()
      : undefined,
    mode: "supabase",
  };
}

export async function findAuthUser(url, serviceKey, email) {
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: headers(serviceKey),
  });
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  return data.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

export async function signIn(url, serviceKey, email, password) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(serviceKey),
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const detail = await readText(response);
    throw new Error(`Supabase sign in failed ${response.status}: ${detail}`);
  }
  return response.json();
}

export async function verifyUser(url, serviceKey, accessToken) {
  if (!accessToken) throw new Error("ไม่มี session สำหรับตรวจสอบสิทธิ์");
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: headers(serviceKey, accessToken),
  });
  if (!response.ok) throw new Error("session ไม่ถูกต้องหรือหมดอายุ");
  return response.json();
}

export async function requireAdmin(req) {
  const { url, serviceKey } = requireConfig();
  const authorization = req.headers.authorization || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  const user = await verifyUser(url, serviceKey, token);
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || roleOf(user) !== ADMIN_ROLE) {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์แอดมิน");
  }
  return user;
}

export function normalizeArticle(row = {}) {
  return {
    slug: String(row.slug || ""),
    title: String(row.title || ""),
    excerpt: String(row.excerpt || ""),
    category: String(row.category || "ปาจื้อ"),
    author: String(row.author || "Admin"),
    date: String(row.date || new Date().toISOString().slice(0, 10)),
    readMin: Number(row.readMin || row.read_min || 3),
    cover: String(row.cover || ""),
    coverAlt: String(row.coverAlt || row.cover_alt || row.title || ""),
    seoTitle: String(row.seoTitle || row.seo_title || row.title || ""),
    seoDescription: String(row.seoDescription || row.seo_description || row.excerpt || ""),
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    canonicalUrl: String(row.canonicalUrl || row.canonical_url || ""),
    content: Array.isArray(row.content)
      ? row.content
      : String(row.content || "")
          .split("\n\n")
          .filter(Boolean),
  };
}

export function articleToRow(article = {}) {
  const clean = normalizeArticle(article);
  return {
    slug: clean.slug,
    title: clean.title,
    excerpt: clean.excerpt,
    category: clean.category,
    author: clean.author,
    date: clean.date,
    read_min: clean.readMin,
    cover: clean.cover,
    cover_alt: clean.coverAlt,
    seo_title: clean.seoTitle,
    seo_description: clean.seoDescription,
    keywords: clean.keywords,
    canonical_url: clean.canonicalUrl,
    content: clean.content,
    updated_at: new Date().toISOString(),
  };
}

export function normalizeDream(row = {}) {
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    keyword: String(row.keyword || "").slice(0, 160),
    letter: String(row.letter || "").slice(0, 8),
    category: String(row.category || "สิ่งของ").slice(0, 80),
    meaning: String(row.meaning || "").slice(0, 2000),
    numbers: String(row.numbers || "").slice(0, 160),
    time: String(row.time || "ไม่ระบุ").slice(0, 120),
    advice: String(row.advice || "").slice(0, 2000),
  };
}

export function dreamToRow(dream = {}) {
  const clean = normalizeDream(dream);
  return {
    ...clean,
    updated_at: new Date().toISOString(),
  };
}

export function normalizeFaq(row = {}) {
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    q: String(row.q || "").slice(0, 500),
    a: String(row.a || "").slice(0, 2000),
    sortOrder: Number(row.sortOrder || row.sort_order || 999),
  };
}

export function faqToRow(faq = {}) {
  const clean = normalizeFaq(faq);
  return {
    id: clean.id,
    q: clean.q,
    a: clean.a,
    sort_order: clean.sortOrder,
    updated_at: new Date().toISOString(),
  };
}
