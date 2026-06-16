import { randomUUID } from "node:crypto";
import {
  ADMIN_EMAIL,
  ADMIN_NAME,
  ADMIN_ROLE,
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

const rateLimitBuckets = new Map();
const BLOCKED_DREAM_IDS = new Set(["9cc47d6f-0f65-4c3a-86ed-cbcb98e36622"]);
const BLOCKED_DREAM_CATEGORIES = new Set(["developer"]);

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
  return send(res, 200, { ok: false, error: result.error || "Supabase request failed" });
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

function requireRateLimit(req, scope, limit, windowMs) {
  const now = Date.now();
  const key = `${scope}:${clientIp(req)}`;
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const waitSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    const error = new Error(`ส่งคำขอถี่เกินไป กรุณาลองใหม่อีกครั้งใน ${waitSeconds} วินาที`);
    error.statusCode = 429;
    throw error;
  }
}

async function saveAuthEvent(req, eventType, user = {}) {
  await rest("auth_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: user.id || null,
      email: user.email || "",
      event_type: eventType,
      role: roleOf(user),
      ip: String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "")
        .split(",")[0]
        .slice(0, 80),
      user_agent: String(req.headers["user-agent"] || "").slice(0, 500),
    }),
  });
}

async function saveContentAuditEvent(req, user = {}, event = {}) {
  try {
    await rest("content_audit_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        actor_user_id: user.id || null,
        actor_email: user.email || "",
        actor_role: roleOf(user),
        action: event.action || "update",
        table_name: event.tableName || "",
        record_id: String(event.recordId || "").slice(0, 160),
        summary: String(event.summary || "").slice(0, 500),
        metadata: event.metadata && typeof event.metadata === "object" ? event.metadata : {},
        ip: clientIp(req),
        user_agent: String(req.headers["user-agent"] || "").slice(0, 500),
      }),
    });
  } catch (error) {
    console.error("content audit log failed", error);
  }
}

function normalizeAuditEvent(row = {}) {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email || "",
    actorRole: row.actor_role || "",
    action: row.action || "",
    tableName: row.table_name || "",
    recordId: row.record_id || "",
    summary: row.summary || "",
    metadata: row.metadata || {},
    ip: row.ip || "",
    userAgent: row.user_agent || "",
    createdAt: row.created_at || "",
  };
}

function isMissingAuditTableError(resultOrError) {
  const message = String(resultOrError?.error || resultOrError?.message || resultOrError || "");
  return (
    message.includes("content_audit_events") &&
    (message.includes("Could not find the table") ||
      message.includes("schema cache") ||
      message.includes("PGRST205") ||
      message.includes("404"))
  );
}

function normalizeReading(row = {}) {
  const now = new Date().toISOString();
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    user_id: row.user_id || row.userId || null,
    email: String(row.email || "").trim().toLowerCase().slice(0, 160),
    type: String(row.type || "ปาจื้อ").slice(0, 40),
    title: String(row.title || "ผลดูดวง").slice(0, 200),
    result: String(row.result || "").slice(0, 1000),
    input: row.input && typeof row.input === "object" ? row.input : {},
    output: row.output && typeof row.output === "object" ? row.output : {},
    created_at: row.created_at || now,
    updated_at: row.updated_at || now,
  };
}

function toPublicReading(row = {}) {
  const reading = normalizeReading(row);
  return {
    id: reading.id,
    type: reading.type,
    title: reading.title,
    result: reading.result,
    date: String(reading.created_at || "").replace("T", " ").slice(0, 16),
    input: reading.input,
    output: reading.output,
    createdAt: reading.created_at,
  };
}

function normalizeLead(row = {}) {
  const now = new Date().toISOString();
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    name: String(row.name || "").slice(0, 120),
    gender: String(row.gender || "").slice(0, 40),
    birth_date: String(row.birthDate || row.birth_date || "").slice(0, 30),
    birth_time: String(row.birthTime || row.birth_time || "").slice(0, 20),
    source: String(row.source || "bazi-insight").slice(0, 80),
    reason: String(row.reason || "submit").slice(0, 80),
    updated_at: now,
  };
}

const GLO_LATEST_ENDPOINT = "https://www.glo.or.th/api/lottery/getLatestLottery";
const GLO_RESULT_ENDPOINT = "https://www.glo.or.th/api/checking/getLotteryResult";
const LOTTERY_PRIZE_KEYS = [
  "first",
  "near1",
  "second",
  "third",
  "fourth",
  "fifth",
  "last3f",
  "last3b",
  "last2",
];

function normalizeLotteryData(raw = {}) {
  if (!raw || typeof raw !== "object") return {};
  const output = {};
  for (const key of LOTTERY_PRIZE_KEYS) {
    const numberRows = raw[key]?.number || raw[key]?.numbers || raw[key] || [];
    const values = (Array.isArray(numberRows) ? numberRows : [numberRows])
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") return String(item);
        return String(item?.value || item?.number || item?.lotteryNumber || "").trim();
      })
      .filter(Boolean)
      .map((value) => ({ value }));
    if (values.length) output[key] = { number: values };
  }
  return output;
}

function hasLotteryData(data = {}) {
  return LOTTERY_PRIZE_KEYS.some((key) => (data[key]?.number || []).length > 0);
}

function getRecentLotteryDraws(limit = 12) {
  const draws = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() >= 16 ? 16 : 1);

  for (let i = 0; i < limit; i += 1) {
    draws.push({
      date: String(cursor.getDate()).padStart(2, "0"),
      month: String(cursor.getMonth() + 1).padStart(2, "0"),
      year: String(cursor.getFullYear()),
    });

    if (cursor.getDate() === 16) {
      cursor.setDate(1);
    } else {
      cursor.setMonth(cursor.getMonth() - 1);
      cursor.setDate(16);
    }
  }
  return draws;
}

function buildLotteryFrequency(history = []) {
  const frequency = { last2: {}, last3b: {}, last3f: {}, first: {} };
  for (const item of history) {
    for (const key of Object.keys(frequency)) {
      const numbers = item.data?.[key]?.number || [];
      for (const number of numbers) {
        const value = String(number.value || "").trim();
        if (value) frequency[key][value] = (frequency[key][value] || 0) + 1;
      }
    }
  }
  return frequency;
}

function extractLotteryData(payload = {}) {
  return (
    payload?.response?.result?.data ||
    payload?.response?.result?.lotteryResult ||
    payload?.response?.result ||
    payload?.data?.result?.data ||
    payload?.data?.result ||
    payload?.result?.data ||
    payload?.result ||
    payload?.data ||
    payload
  );
}

function cleanLotteryDraw(input = {}) {
  const now = new Date();
  const date = String(input.date || "").padStart(2, "0") === "16" ? "16" : "01";
  const monthNumber = Number.parseInt(String(input.month || now.getMonth() + 1), 10);
  const yearNumber = Number.parseInt(String(input.year || now.getFullYear()), 10);
  return {
    date,
    month: String(Number.isFinite(monthNumber) ? Math.min(12, Math.max(1, monthNumber)) : now.getMonth() + 1).padStart(2, "0"),
    year: String(Number.isFinite(yearNumber) ? Math.min(2099, Math.max(2020, yearNumber)) : now.getFullYear()),
  };
}

async function postGloLottery(endpoint, body = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Likhitfa/1.0",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text().catch(() => "");
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(`GLO API returned ${response.status}: ${String(text).slice(0, 200)}`);
  }
  return payload;
}

async function lottery(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return send(res, 405, { ok: false, error: "Method not allowed" });
  }

  const url = new URL(req.url || "/", "https://likhitfa.local");
  const body = req.method === "POST" ? await readBody(req) : {};
  const mode = String(body.mode || url.searchParams.get("mode") || "result");

  if (mode === "history") {
    const limit = Math.min(
      36,
      Math.max(1, Number.parseInt(String(body.limit || url.searchParams.get("limit") || "12"), 10) || 12),
    );
    const draws = getRecentLotteryDraws(limit);
    const settled = await Promise.allSettled(
      draws.map(async (date) => {
        const payload = await postGloLottery(GLO_RESULT_ENDPOINT, date);
        const data = normalizeLotteryData(extractLotteryData(payload));
        if (!hasLotteryData(data)) throw new Error("empty result");
        return { date, data };
      }),
    );
    const history = settled
      .filter((item) => item.status === "fulfilled")
      .map((item) => item.value);
    return send(res, 200, {
      ok: true,
      source: "glo",
      mode: "history",
      history,
      frequency: buildLotteryFrequency(history),
    });
  }

  if (mode === "latest") {
    const payload = await postGloLottery(GLO_LATEST_ENDPOINT, {});
    const data = normalizeLotteryData(extractLotteryData(payload));
    if (!hasLotteryData(data)) throw new Error("ไม่พบผลรางวัลงวดล่าสุดจาก GLO");
    return send(res, 200, { ok: true, source: "glo", mode: "latest", data, rawDate: payload?.response?.result?.date || null });
  }

  const draw = cleanLotteryDraw({
    date: body.date || url.searchParams.get("date"),
    month: body.month || url.searchParams.get("month"),
    year: body.year || url.searchParams.get("year"),
  });
  const payload = await postGloLottery(GLO_RESULT_ENDPOINT, draw);
  const data = normalizeLotteryData(extractLotteryData(payload));
  if (!hasLotteryData(data)) throw new Error("ไม่พบผลรางวัลงวดนี้จาก GLO");
  return send(res, 200, { ok: true, source: "glo", mode: "result", date: draw, data });
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
  requireRateLimit(req, "admin-login", 8, 15 * 60 * 1000);
  const body = await readBody(req);
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  if (email !== ADMIN_EMAIL || !password) {
    return send(res, 401, { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  }
  const { url, serviceKey } = requireConfig();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (adminPassword) {
    if (password !== adminPassword) {
      return send(res, 401, { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    await ensureAdmin(url, serviceKey, password);
  }
  const token = await signIn(url, serviceKey, email, password);
  if (token.user && roleOf(token.user) !== ADMIN_ROLE) {
    return send(res, 403, { ok: false, error: "บัญชีนี้ไม่มีสิทธิ์แอดมิน" });
  }
  await saveAuthEvent(req, "admin_login", token.user || { email, user_metadata: { role: ADMIN_ROLE } });
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
  await saveAuthEvent(req, "admin_session", user);
  return send(res, 200, {
    ok: true,
    session: {
      email: user.email,
      name: user.user_metadata?.name || ADMIN_NAME,
      role: ADMIN_ROLE,
    },
  });
}

async function adminUsers(req, res) {
  await requireAdmin(req);

  if (req.method === "GET") {
    const result = await rest("users?select=*&order=created_at.desc");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    const users = rows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      role: user.role || "User",
      status: user.status === "disabled" ? "Suspended" : "Active",
      joined: String(user.created_at || "").slice(0, 10),
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      provider: user.provider || "email",
    }));
    return send(res, 200, { ok: true, source: "supabase-public-users", users });
  }

  if (req.method === "PATCH") {
    const body = await readBody(req);
    const id = String(body.id || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = String(body.name || email || "User").trim().slice(0, 160);
    const isPrimaryAdmin = email === ADMIN_EMAIL;
    const role = isPrimaryAdmin ? ADMIN_ROLE : body.role === ADMIN_ROLE ? ADMIN_ROLE : "User";
    const status = isPrimaryAdmin
      ? "active"
      : body.status === "Suspended" || body.status === "disabled"
        ? "disabled"
        : "active";
    if (!id) return send(res, 400, { ok: false, error: "Missing user id" });

    const { url, serviceKey } = requireConfig();
    const publicResult = await rest(`users?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name,
        role,
        status,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!publicResult.ok) return sendRestError(res, publicResult);

    const authPayload = {
      user_metadata: { name, role },
      app_metadata: { role },
      ban_duration: status === "disabled" ? "876000h" : "none",
    };
    const authResponse = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: headers(serviceKey),
      body: JSON.stringify(authPayload),
    });
    if (!authResponse.ok) {
      const detail = await readText(authResponse);
      return send(res, 200, {
        ok: false,
        error: `Supabase Auth update failed ${authResponse.status}: ${detail}`,
      });
    }

    const rows = Array.isArray(publicResult.data) ? publicResult.data : [];
    const saved = rows[0] || { id, email, name, role, status };
    return send(res, 200, {
      ok: true,
      source: "supabase-public-users",
      user: {
        id: saved.id,
        email: saved.email || email,
        name: saved.name || name,
        role: saved.role || role,
        status: saved.status === "disabled" ? "Suspended" : "Active",
        joined: String(saved.created_at || "").slice(0, 10),
        createdAt: saved.created_at,
        lastSignInAt: saved.last_sign_in_at,
        provider: saved.provider || "email",
      },
    });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url, "https://likhitfa.local").searchParams.get("id") || "";
    const email = new URL(req.url, "https://likhitfa.local").searchParams.get("email") || "";
    if (!id) return send(res, 400, { ok: false, error: "Missing user id" });
    if (email.toLowerCase() === ADMIN_EMAIL) {
      return send(res, 400, { ok: false, error: "ไม่สามารถลบบัญชีแอดมินหลักได้" });
    }

    const { url, serviceKey } = requireConfig();
    const authResponse = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(serviceKey),
    });
    if (!authResponse.ok && authResponse.status !== 404) {
      const detail = await readText(authResponse);
      return send(res, 200, {
        ok: false,
        error: `Supabase Auth delete failed ${authResponse.status}: ${detail}`,
      });
    }

    const publicResult = await rest(`users?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!publicResult.ok) return sendRestError(res, publicResult);
    return send(res, 200, { ok: true, source: "supabase-public-users" });
  }

  return send(res, 405, { ok: false, error: "Method not allowed" });
}

async function userRegister(req, res) {
  requireRateLimit(req, "user-register", 8, 60 * 60 * 1000);
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
  await saveAuthEvent(req, "user_register", token.user || { email });
  return send(res, 200, { ok: true, session: toSession(token, { email }) });
}

async function userLogin(req, res) {
  requireRateLimit(req, "user-login", 20, 15 * 60 * 1000);
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
  await saveAuthEvent(req, "user_login", token.user || { email });
  return send(res, 200, { ok: true, session: toSession(token, { email }) });
}

async function userSession(req, res) {
  const { url, serviceKey } = requireConfig();
  const authorization = req.headers.authorization || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  const user = await verifyUser(url, serviceKey, token);
  await saveAuthEvent(req, "user_session", user);
  return send(res, 200, { ok: true, session: toSession({}, user) });
}

async function articles(req, res) {
  if (req.method === "GET") {
    const url = new URL(req.url, "https://likhitfa.local");
    const slug = url.searchParams.get("slug") || "";
    const q = (url.searchParams.get("q") || "").trim();
    const category = (url.searchParams.get("category") || "").trim();
    const page = clampPage(url.searchParams.get("page"));
    const limit = clampLimit(url.searchParams.get("limit"));
    const result = await rest(buildArticleQuery({ slug, q, category, page, limit }), {
      headers: { Prefer: "count=exact" },
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    const total = parseTotal(result.headers.get("content-range"), rows.length);
    return send(res, 200, {
      ok: true,
      source: "supabase",
      articles: rows.map(normalizeArticle),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }
  if (req.method === "POST") {
    const user = await requireAdmin(req);
    const article = normalizeArticle(await readBody(req));
    const result = await rest("articles?on_conflict=slug", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(articleToRow(article)),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    await saveContentAuditEvent(req, user, {
      action: "update",
      tableName: "articles",
      recordId: article.slug,
      summary: article.title,
      metadata: { category: article.category },
    });
    return send(res, 200, {
      ok: true,
      source: "supabase",
      article: normalizeArticle(rows[0] || article),
    });
  }
  if (req.method === "DELETE") {
    const user = await requireAdmin(req);
    const slug = new URL(req.url, "https://likhitfa.local").searchParams.get("slug");
    if (!slug) return send(res, 400, { ok: false, error: "Missing slug" });
    const result = await rest(`articles?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    await saveContentAuditEvent(req, user, {
      action: "delete",
      tableName: "articles",
      recordId: slug,
      summary: `Deleted article ${slug}`,
    });
    return send(res, 200, { ok: true, source: "supabase" });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

function buildArticleQuery({ slug, q, category, page, limit }) {
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

async function dreams(req, res) {
  if (req.method === "GET") {
    const url = new URL(req.url, "https://likhitfa.local");
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const keyword = (url.searchParams.get("keyword") || "").trim().toLowerCase();
    const category = (url.searchParams.get("category") || "").trim();
    const letter = (url.searchParams.get("letter") || "").trim();
    const page = clampPage(url.searchParams.get("page"));
    const limit = clampLimit(url.searchParams.get("limit"));
    let includeBlocked = false;
    if (url.searchParams.get("includeBlocked") === "1") {
      try {
        await requireAdmin(req);
        includeBlocked = true;
      } catch {
        includeBlocked = false;
      }
    }
    const result = await rest(buildDreamQuery({ q, keyword, category, letter, page, limit, includeBlocked }), {
      headers: { Prefer: "count=exact" },
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    const total = parseTotal(result.headers.get("content-range"), rows.length);
    return send(res, 200, {
      ok: true,
      source: "supabase",
      dreams: rows.map(normalizeDream),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }
  if (req.method === "POST") {
    const user = await requireAdmin(req);
    const dream = normalizeDream(await readBody(req));
    const result = await rest("dreams?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(dreamToRow(dream)),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    await saveContentAuditEvent(req, user, {
      action: "update",
      tableName: "dreams",
      recordId: dream.id,
      summary: dream.keyword,
      metadata: { letter: dream.letter, category: dream.category },
    });
    return send(res, 200, {
      ok: true,
      source: "supabase",
      dream: normalizeDream(rows[0] || dream),
    });
  }
  if (req.method === "DELETE") {
    const user = await requireAdmin(req);
    const id = new URL(req.url, "https://likhitfa.local").searchParams.get("id");
    if (!id) return send(res, 400, { ok: false, error: "Missing id" });
    const result = await rest(`dreams?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    await saveContentAuditEvent(req, user, {
      action: "delete",
      tableName: "dreams",
      recordId: id,
      summary: `Deleted dream ${id}`,
    });
    return send(res, 200, { ok: true, source: "supabase" });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

function clampPage(value) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function clampLimit(value) {
  const limit = Number.parseInt(value || "20", 10);
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(limit, 1000);
}

function parseTotal(contentRange, fallback) {
  const total = contentRange?.match(/\/(\d+|\*)$/)?.[1];
  if (!total || total === "*") return fallback;
  return Number.parseInt(total, 10);
}

function buildDreamQuery({ q, keyword, category, letter, page, limit, includeBlocked = false }) {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    select: "*",
    order: "keyword.asc",
    limit: String(limit),
    offset: String(offset),
  });

  if (!includeBlocked) {
    for (const id of BLOCKED_DREAM_IDS) params.set("id", `neq.${id}`);
    if (!category) {
      for (const blockedCategory of BLOCKED_DREAM_CATEGORIES) {
        params.set("category", `neq.${blockedCategory}`);
      }
    }
  }

  if (keyword) {
    params.set("keyword", `eq.${keyword}`);
  } else {
    if (category && category !== "ทั้งหมด") params.set("category", `eq.${category}`);
    if (letter && letter !== "ทั้งหมด") params.set("letter", `eq.${letter}`);
  }

  if (!keyword && q) {
    const pattern = `*${q.replace(/[,*()]/g, " ")}*`;
    params.set(
      "or",
      `(${[
        `keyword.ilike.${pattern}`,
        `category.ilike.${pattern}`,
        `meaning.ilike.${pattern}`,
        `numbers.ilike.${pattern}`,
        `time.ilike.${pattern}`,
        `advice.ilike.${pattern}`,
      ].join(",")})`,
    );
  }

  return `dreams?${params.toString()}`;
}

async function faqs(req, res) {
  if (req.method === "GET") {
    const result = await rest("faqs?select=*&order=sort_order.asc");
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, { ok: true, source: "supabase", faqs: rows.map(normalizeFaq) });
  }
  if (req.method === "POST") {
    const user = await requireAdmin(req);
    const body = await readBody(req);
    const faqs = (Array.isArray(body) ? body : body.faqs || []).map(normalizeFaq);
    const rows = faqs.map(faqToRow);
    const result = await rest("faqs?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(rows),
    });
    if (!result.ok) return sendRestError(res, result);
    const saved = Array.isArray(result.data) ? result.data : [];
    await saveContentAuditEvent(req, user, {
      action: "update",
      tableName: "faqs",
      recordId: "bulk",
      summary: `Saved ${faqs.length} FAQ items`,
      metadata: { ids: faqs.map((faq) => faq.id).slice(0, 50) },
    });
    return send(res, 200, { ok: true, source: "supabase", faqs: saved.map(normalizeFaq) });
  }
  if (req.method === "DELETE") {
    const user = await requireAdmin(req);
    const id = new URL(req.url, "https://likhitfa.local").searchParams.get("id");
    if (!id) return send(res, 400, { ok: false, error: "Missing id" });
    const result = await rest(`faqs?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    await saveContentAuditEvent(req, user, {
      action: "delete",
      tableName: "faqs",
      recordId: id,
      summary: `Deleted FAQ ${id}`,
    });
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
    const user = await requireAdmin(req);
    const content = normalizeContent(await readBody(req));
    const result = await rest("site_content?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: "main", ...content, updated_at: new Date().toISOString() }),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    await saveContentAuditEvent(req, user, {
      action: "update",
      tableName: "site_content",
      recordId: "main",
      summary: "Updated site content",
      metadata: { sections: Object.keys(content) },
    });
    return send(res, 200, {
      ok: true,
      source: "supabase",
      content: normalizeContent(rows[0] || content),
    });
  }
  return send(res, 405, { ok: false, error: "Method not allowed" });
}

async function auditEvents(req, res) {
  if (req.method !== "GET") return send(res, 405, { ok: false, error: "Method not allowed" });
  await requireAdmin(req);

  const url = new URL(req.url, "https://likhitfa.local");
  const page = clampPage(url.searchParams.get("page"));
  const limit = Math.min(clampLimit(url.searchParams.get("limit")), 100);
  const offset = (page - 1) * limit;
  const tableName = (url.searchParams.get("table") || "").trim();
  const action = (url.searchParams.get("action") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
    limit: String(limit),
    offset: String(offset),
  });

  if (tableName && tableName !== "all") params.set("table_name", `eq.${tableName}`);
  if (action && action !== "all") params.set("action", `eq.${action}`);
  if (q) {
    const pattern = `*${q.replace(/[,*()]/g, " ")}*`;
    params.set(
      "or",
      `(${[
        `actor_email.ilike.${pattern}`,
        `record_id.ilike.${pattern}`,
        `summary.ilike.${pattern}`,
        `ip.ilike.${pattern}`,
      ].join(",")})`,
    );
  }

  const result = await rest(`content_audit_events?${params.toString()}`, {
    headers: { Prefer: "count=exact" },
  });
  if (!result.ok && isMissingAuditTableError(result)) {
    return send(res, 200, {
      ok: true,
      source: "supabase",
      setupRequired: true,
      events: [],
      page,
      limit,
      total: 0,
      totalPages: 1,
      message: "ยังไม่ได้สร้างตาราง content_audit_events ใน Supabase",
    });
  }
  if (!result.ok) return sendRestError(res, result);
  const rows = Array.isArray(result.data) ? result.data : [];
  const total = parseTotal(result.headers.get("content-range"), rows.length);
  return send(res, 200, {
    ok: true,
    source: "supabase",
    events: rows.map(normalizeAuditEvent),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
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
    requireRateLimit(req, "contact-messages", 10, 15 * 60 * 1000);
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

async function readingHistory(req, res) {
  if (req.method === "GET") {
    const user = await requireUserFromAuth(req);
    const params = new URL(req.url, "https://likhitfa.local").searchParams;
    const type = params.get("type");
    let query = `reading_history?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc`;
    if (type) query += `&type=eq.${encodeURIComponent(type)}`;
    const result = await rest(query);
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase-public-reading-history",
      history: rows.map(toPublicReading),
    });
  }

  if (req.method === "POST") {
    const user = await verifyUserFromOptionalAuth(req);
    const payload = normalizeReading(await readBody(req));
    const row = {
      ...payload,
      user_id: user?.id || payload.user_id || null,
      email: user?.email || payload.email || "",
      updated_at: new Date().toISOString(),
    };
    const result = await rest("reading_history?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    });
    if (!result.ok) return sendRestError(res, result);
    const rows = Array.isArray(result.data) ? result.data : [];
    return send(res, 200, {
      ok: true,
      source: "supabase-public-reading-history",
      entry: toPublicReading(rows[0] || row),
    });
  }

  if (req.method === "DELETE") {
    const user = await requireUserFromAuth(req);
    const id = new URL(req.url, "https://likhitfa.local").searchParams.get("id");
    if (!id) return send(res, 400, { ok: false, error: "Missing id" });
    const filter = `reading_history?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}`;
    const result = await rest(filter, { method: "DELETE" });
    if (!result.ok) return sendRestError(res, result);
    return send(res, 200, { ok: true, source: "supabase-public-reading-history" });
  }

  return send(res, 405, { ok: false, error: "Method not allowed" });
}

async function leads(req, res) {
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed" });
  const lead = normalizeLead(await readBody(req));
  const result = await rest("leads?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ ...lead, created_at: new Date().toISOString() }),
  });
  if (!result.ok) return sendRestError(res, result);
  const rows = Array.isArray(result.data) ? result.data : [];
  return send(res, 200, {
    ok: true,
    source: "supabase",
    stored: "supabase",
    lead: normalizeLead(rows[0] || lead),
  });
}

async function verifyUserFromOptionalAuth(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  if (!token) return null;
  const { url, serviceKey } = requireConfig();
  return verifyUser(url, serviceKey, token);
}

async function requireUserFromAuth(req) {
  const user = await verifyUserFromOptionalAuth(req);
  if (!user?.id) throw new Error("กรุณาเข้าสู่ระบบก่อนดูประวัติการดูดวง");
  return user;
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
  const [users, articlesCount, dreamsCount, leadsCount, messagesCount, historyCount] = await Promise.all([
    countTable("users"),
    countTable("articles"),
    countTable("dreams"),
    countTable("leads"),
    countTable("contact_messages"),
    countTable("reading_history"),
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
        label: "ประวัติการดูดวง",
        value: historyCount.toLocaleString(),
        delta: "จากตาราง reading_history",
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
    if (route === "admin-users") return await adminUsers(req, res);
    if (route === "user-register" && req.method === "POST") return await userRegister(req, res);
    if (route === "user-login" && req.method === "POST") return await userLogin(req, res);
    if (route === "user-session" && req.method === "GET") return await userSession(req, res);
    if (route === "articles") return await articles(req, res);
    if (route === "dreams") return await dreams(req, res);
    if (route === "faqs") return await faqs(req, res);
    if (route === "site-content") return await siteContent(req, res);
    if (route === "audit-events") return await auditEvents(req, res);
    if (route === "contact-messages") return await contactMessages(req, res);
    if (route === "reading-history") return await readingHistory(req, res);
    if (route === "leads") return await leads(req, res);
    if (route === "lottery") return await lottery(req, res);
    if (route === "dashboard" && req.method === "GET") return await dashboard(res);
    return send(res, 404, { ok: false, error: `Unknown API route: ${route}` });
  } catch (error) {
    return send(res, error?.statusCode || 200, {
      ok: false,
      error: error instanceof Error ? error.message : "API ทำงานไม่สำเร็จ",
    });
  }
}
