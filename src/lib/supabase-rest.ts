import { friendlyErrorMessage } from "./friendly-error";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_ROLE = "Admin";

type SupabaseUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

type ContentAuditInput = {
  request: Request;
  user?: SupabaseUser;
  action: "create" | "update" | "delete";
  tableName: "articles" | "dreams" | "faqs" | "site_content";
  recordId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

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

export function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      ...(init?.headers || {}),
    },
  });
}

export async function supabaseRequest(path: string, init?: RequestInit) {
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
    throw new Error(friendlyErrorMessage(detail, "เชื่อมต่อฐานข้อมูลไม่สำเร็จ"));
  }

  return response;
}

function clientIp(request: Request) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

export async function saveContentAuditEvent({
  request,
  user,
  action,
  tableName,
  recordId,
  summary = "",
  metadata = {},
}: ContentAuditInput) {
  try {
    await supabaseRequest("content_audit_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        actor_user_id: user?.id || null,
        actor_email: user?.email || "",
        actor_role: user ? userRole(user) : "Admin",
        action,
        table_name: tableName,
        record_id: recordId,
        summary: summary.slice(0, 500),
        metadata,
        ip: clientIp(request),
        user_agent: (request.headers.get("user-agent") || "").slice(0, 500),
      }),
    });
  } catch (error) {
    console.error("content audit log failed", error);
  }
}

function readBearer(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function userRole(user: SupabaseUser) {
  const appRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  return appRole === ADMIN_ROLE || userMetadataRole === ADMIN_ROLE ? ADMIN_ROLE : "User";
}

export async function requireAdmin(request: Request) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const accessToken = readBearer(request);
  if (!accessToken) throw new Error("ต้องเข้าสู่ระบบแอดมินก่อนแก้ไขข้อมูล");

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) throw new Error("session แอดมินไม่ถูกต้องหรือหมดอายุ");

  const user = (await response.json().catch(() => ({}))) as SupabaseUser;
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || userRole(user) !== ADMIN_ROLE) {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์แอดมิน");
  }

  return user;
}
