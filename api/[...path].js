import { randomUUID } from "node:crypto";
import {
  ADMIN_EMAIL,
  ADMIN_NAME,
  ADMIN_ROLE,
  DEFAULT_ADMIN_PASSWORD,
  articleToRow,
  cors,
  dreamToRow,
  faqToRow,
  findAuthUser,
  headers,
  normalizeArticle,
  normalizeDream,
  normalizeFaq,
  readBody,
  readText,
  requireAdmin,
  requireConfig,
  roleOf,
  send,
  signIn,
  toSession,
  verifyUser,
} from "./_supabase.js";

async function rest(path, init = {}) {
  try {
    const { url, serviceKey } = requireConfig();
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        ...(init.headers || {}),
      },
    });
    const text = await response.text().catch(() => "");
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `Supabase failed ${response.status}: ${text}`,
        data,
        headers: response.headers,
      };
    }
    return { ok: true, status: response.status, data, headers: response.headers };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      error: error instanceof Error ? error.message : "Supabase request failed",
      data: null,
      headers: new Headers(),
    };
  }
}

function sendRestError(res, result) {
  return send(res, 502, { ok: false, error: result.error || "Supabase request failed" });
}

function pathName(req) {
  const url = new URL(req.url || "/", "https://likhitfa.local");
  return url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
}

async function ensureAdmin(url, serviceKey, password) {
  const existing = await findAuthUser(url, serviceKey, ADMIN_EMAIL);
  if (existing?.id) {
    const response = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      headers: headers(serviceKey),
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { name: ADMIN_NAME, role: ADMIN_ROLE },
        app_metadata: { role: ADMIN_ROLE },
      }),
    });
    if (!response.ok) {
      const detail = await readText(response);
      throw new Error(`Supabase update admin failed ${response.status}: ${detail}`);
    }
    return;
  }

  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: headers(serviceKey),
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: ADMIN_ROLE },
      app_metadata: { role: ADMIN_ROLE },
    }),
  });
  if (!response.ok) {
    const detail = await readText(response);
    if (!/already|registered|exists|duplicate/i.test(detail)) {
      throw new Error(`Supabase create admin failed ${response.status}: ${detail}`);
    }
  }
}

async function adminLogin(req, res) {
  const body = await readBody(req);
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  if (email !== ADMIN_EMAIL || password !== adminPassword) {
    return send(res, 401, { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  }
  const { url, serviceKey } = requireConfig();
  await ensureAdmin(url, serviceKey, password);
  const token = await signIn(url, serviceKey, email, password);
  return send(res, 200, { ok: true, session: toSession(token, { email }) });
}

async function adminSession(req, res) {
  const { url, serviceKey } = requireConfig();
  const authorization = req.headers.authorization || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  const user = await verifyUser(url, serviceKey, token);
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || roleOf(user) !== ADMIN_ROLE) {
    return send(res, 401, { ok: false, error: "บัญชีนี้ไม่มีสิทธิ์แอดมิน" });
  }
  return send(res, 200, {
    ok: true,
    session: {
      email: user.email,
      name: user.user_metadata?.name || ADMIN_NAME,
      role: ADMIN_ROLE,
    },
  });
}

async function adminUsers(res) {
  const { url, serviceKey } = requireConfig();
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: headers(serviceKey),
  });
  if (!response.ok)
    throw new Error(`Supabase users failed ${response.status}: ${await readText(response)}`);
  const data = await response.json().catch(() => ({}));
  const users = (data.users || []).map((user) => ({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.displayName || user.email,
    role: roleOf(user),
    createdAt: user.created_at,
  }));
  return send(res, 200, { ok: true, source: "supabase", users });
}

async function userRegister(req, res) {
  const body = await readBody(req);
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const displayName = String(body.displayName || "").trim();
  if (!email || !email.includes("@"))
    return send(res, 400, { ok: false, error: "กรุณากรอกอีเมลให้ถูกต้อง" });
  if (!password || password.length < 8)
    return send(res, 400, { ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
  if (!displayName && !firstName)
    return send(res, 400, { ok: false, error: "กรุณากรอกชื่อหรือชื่อแสดง" });
  if (email === ADMIN_EMAIL)
    return send(res, 400, {
      ok: false,
      error: "อีเมลนี้เป็นบัญชีแอดมิน ใช้สมัครสมาชิกทั่วไปไม่ได้",
    });
  const { url, serviceKey } = requireConfig();
  const existing = await findAuthUser(url, serviceKey, email);
  if (existing)
    return send(res, 409, { ok: false, error: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ" });
  const name = displayName || `${firstName} ${lastName}`.trim() || email;
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: headers(serviceKey),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "User",
        firstName,
        lastName,
        displayName: displayName || name,
        birthDate: body.birthDate || "",
        gender: body.gender || "ไม่ระบุ",
      },
      app_metadata: { role: "User" },
    }),
  });
  if (!response.ok)
    throw new Error(`Supabase create user failed ${response.status}: ${await readText(response)}`);
  const token = await signIn(url, serviceKey, email, password);
  return send(res, 200, { ok: true, session: toSession(token, { email }) });
}

async function userLogin(req, res) {
  const body = await readBody(req);
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return send(res, 400, { ok: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" });
  const { url, serviceKey } = requireConfig();
  const token = await signIn(url, serviceKey, email, password);
  if (token.user && roleOf(token.user) !== "User") {
    return send(res, 403, { ok: false, error: "บัญชีนี้ไม่ใช่ผู้ใช้งานทั่วไป กรุณาใช้หน้าแอดมิน" });
  }
  return send(res, 200, { ok: true, session: toSession(token, { email }) });
}

async function userSession(req, res) {
  const { url, serviceKey } = requireConfig();
  const authorization = req.headers.authorization || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  const user = await verifyUser(url, serviceKey, token);
  return send(res, 200, { ok: true, session: toSession({}, user) });
}

async function articles(req, res) {
  if (req.method === "GET") {
    const slug = new URL(req.url, "https://likhitfa.local").searchParams.get("slug");
    const result = await rest("articles?select=*&order=date.desc");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    const articles = rows.map(normalizeArticle).filter((article) => !slug || article.slug === slug);
    return send(res, 200, { ok: true, source: "supabase", articles });
  }
  if (req.method === "POST") {
    const article = normalizeArticle(await readBody(req));
    const result = await rest("articles?on_conflict=slug", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(articleToRow(article)),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase",
      article: normalizeArticle(rows[0] || article),
    });
  }
  if (req.method === "DELETE") {
    const slug = new URL(req.url, "https://likhitfa.local").searchParams.get("slug");
    if (!slug) return send(res, 400, { ok: false, error: "Missing slug" });
    const result = await rest(`articles?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    return send(res, 200, { ok: true, source: "supabase" });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

async function dreams(req, res) {
  if (req.method === "GET") {
    const q = new URL(req.url, "https://likhitfa.local").searchParams.get("q")?.toLowerCase() || "";
    const result = await rest("dreams?select=*&order=keyword.asc");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    const dreams = rows
      .map(normalizeDream)
      .filter((dream) => !q || dream.keyword.toLowerCase().includes(q));
    return send(res, 200, { ok: true, source: "supabase", dreams });
  }
  if (req.method === "POST") {
    const dream = normalizeDream(await readBody(req));
    const result = await rest("dreams?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(dreamToRow(dream)),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase",
      dream: normalizeDream(rows[0] || dream),
    });
  }
  if (req.method === "DELETE") {
    const id = new URL(req.url, "https://likhitfa.local").searchParams.get("id");
    if (!id) return send(res, 400, { ok: false, error: "Missing id" });
    const result = await rest(`dreams?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    return send(res, 200, { ok: true, source: "supabase" });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

async function faqs(req, res) {
  if (req.method === "GET") {
    const result = await rest("faqs?select=*&order=sort_order.asc");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, { ok: true, source: "supabase", faqs: rows.map(normalizeFaq) });
  }
  if (req.method === "POST") {
    const body = await readBody(req);
    const rows = (Array.isArray(body) ? body : body.faqs || []).map(faqToRow);
    const result = await rest("faqs?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(rows),
    });
    if (!result.ok) return sendRestError(res, result);
    const saved = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, { ok: true, source: "supabase", faqs: saved.map(normalizeFaq) });
  }
  if (req.method === "DELETE") {
    const id = new URL(req.url, "https://likhitfa.local").searchParams.get("id");
    if (!id) return send(res, 400, { ok: false, error: "Missing id" });
    const result = await rest(`faqs?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    return send(res, 200, { ok: true, source: "supabase" });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

function normalizeContent(row = {}) {
  return {
    about: row.about || {},
    contact: row.contact || {},
  };
}

async function siteContent(req, res) {
  if (req.method === "GET") {
    const result = await rest("site_content?id=eq.main&select=*&limit=1");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    if (!rows[0]) throw new Error("ไม่พบข้อมูล site_content id=main ใน Supabase");
    return send(res, 200, { ok: true, source: "supabase", content: normalizeContent(rows[0]) });
  }
  if (req.method === "POST") {
    const content = normalizeContent(await readBody(req));
    const result = await rest("site_content?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: "main", ...content, updated_at: new Date().toISOString() }),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase",
      content: normalizeContent(rows[0] || content),
    });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

function normalizeMessage(row = {}) {
  const now = new Date().toISOString();
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    name: String(row.name || "")
      .trim()
      .slice(0, 120),
    email: String(row.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 160),
    subject: String(row.subject || "")
      .trim()
      .slice(0, 200),
    message: String(row.message || "")
      .trim()
      .slice(0, 3000),
    status: String(row.status || "new")
      .trim()
      .slice(0, 40),
    created_at: row.created_at || now,
    updated_at: row.updated_at || now,
  };
}

async function contactMessages(req, res) {
  if (req.method === "GET") {
    await requireAdmin(req);
    const result = await rest("contact_messages?select=*&order=created_at.desc&limit=200");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, { ok: true, source: "supabase", messages: rows.map(normalizeMessage) });
  }
  if (req.method === "POST") {
    const message = normalizeMessage(await readBody(req));
    if (!message.name || !message.email.includes("@") || !message.subject || !message.message) {
      return send(res, 400, { ok: false, error: "กรุณากรอกข้อมูลติดต่อให้ครบ" });
    }
    const result = await rest("contact_messages", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(message),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase",
      message: normalizeMessage(rows[0] || message),
    });
  }
  if (req.method === "PUT") {
    await requireAdmin(req);
    const body = await readBody(req);
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();
    if (!id || !["new", "read", "replied", "archived"].includes(status)) {
      return send(res, 400, { ok: false, error: "สถานะข้อความไม่ถูกต้อง" });
    }
    const result = await rest(`contact_messages?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase",
      message: normalizeMessage(rows[0] || body),
    });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

async function dashboard(res) {
  const countTable = async (table) => {
    const result = await rest(`${table}?select=*`, {
      method: "HEAD",
      headers: { Prefer: "count=exact" },
    });
    if (!result.ok) throw new Error(result.error);
    const range = result.headers.get("content-range") || "";
    return Number(range.split("/")[1] || 0);
  };
  const { url, serviceKey } = requireConfig();
  const usersResponse = await fetch(`${url}/auth/v1/admin/users?per_page=1`, {
    headers: headers(serviceKey),
  });
  const users = Number(usersResponse.headers.get("x-total-count") || 0);
  const [articlesCount, dreamsCount, leadsCount, messagesCount] = await Promise.all([
    countTable("articles"),
    countTable("dreams"),
    countTable("leads"),
    countTable("contact_messages"),
  ]);
  return send(res, 200, {
    ok: true,
    source: "supabase",
    kpis: [
      {
        label: "ผู้ใช้งานทั้งหมด",
        value: users.toLocaleString(),
        delta: "ข้อมูลจาก Supabase Auth",
      },
      { label: "ข้อมูลทำนายฝัน", value: dreamsCount.toLocaleString(), delta: "จากตาราง dreams" },
      { label: "ข้อความติดต่อ", value: messagesCount.toLocaleString(), delta: "จากฟอร์ม contact" },
      {
        label: "บทความที่เผยแพร่",
        value: articlesCount.toLocaleString(),
        delta: "จากตาราง articles",
      },
    ],
    visits: [0, 0, 0, 0, 0, 0, 0],
    services: [
      { label: "ไพ่ยิปซี", pct: 0, color: "bg-gradient-gold" },
      { label: "ปาจื้อ", pct: 0, color: "bg-emerald-400/80" },
      { label: "ทำนายฝัน", pct: 0, color: "bg-sky-400/80" },
    ],
    topPages: [
      { page: "/dream", views: dreamsCount, pct: 0 },
      { page: "/bazi", views: leadsCount, pct: 0 },
      { page: "/articles", views: articlesCount, pct: 0 },
      { page: "/contact", views: messagesCount, pct: 0 },
      { page: "/profile", views: users, pct: 0 },
    ],
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const route = pathName(req);
    if (route === "admin-login" && req.method === "POST") return await adminLogin(req, res);
    if (route === "admin-session" && req.method === "GET") return await adminSession(req, res);
    if (route === "admin-users" && req.method === "GET") return await adminUsers(res);
    if (route === "user-register" && req.method === "POST") return await userRegister(req, res);
    if (route === "user-login" && req.method === "POST") return await userLogin(req, res);
    if (route === "user-session" && req.method === "GET") return await userSession(req, res);
    if (route === "articles") return await articles(req, res);
    if (route === "dreams") return await dreams(req, res);
    if (route === "faqs") return await faqs(req, res);
    if (route === "site-content") return await siteContent(req, res);
    if (route === "contact-messages") return await contactMessages(req, res);
    if (route === "dashboard" && req.method === "GET") return await dashboard(res);
    return send(res, 404, { ok: false, error: `Unknown API route: ${route}` });
  } catch (error) {
    return send(res, 502, {
      ok: false,
      error: error instanceof Error ? error.message : "API ทำงานไม่สำเร็จ",
    });
  }
}
