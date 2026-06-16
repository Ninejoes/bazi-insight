import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_NAME = "Admin";
const ADMIN_ROLE = "Admin";

type SupabaseUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

type SupabaseUsersResponse = {
  users?: SupabaseUser[];
};

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function supabaseHeaders(serviceKey: string) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

async function readText(response: Response) {
  return response.text().catch(() => "");
}

async function findSupabaseUser(url: string, serviceKey: string, email: string) {
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: supabaseHeaders(serviceKey),
  });

  if (!response.ok) return null;

  const data = (await response.json().catch(() => ({}))) as SupabaseUsersResponse;
  return data.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function createSupabaseAdmin(
  url: string,
  serviceKey: string,
  email: string,
  password: string,
) {
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: supabaseHeaders(serviceKey),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: ADMIN_ROLE },
      app_metadata: { role: ADMIN_ROLE },
    }),
  });

  if (response.ok) return;

  const detail = await readText(response);
  if (/already|registered|exists|duplicate/i.test(detail)) return;
  throw new Error(friendlyErrorMessage(detail, "เตรียมบัญชีแอดมินไม่สำเร็จ"));
}

async function updateSupabaseAdminPassword(
  url: string,
  serviceKey: string,
  userId: string,
  password: string,
) {
  const response = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: supabaseHeaders(serviceKey),
    body: JSON.stringify({
      password,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: ADMIN_ROLE },
      app_metadata: { role: ADMIN_ROLE },
    }),
  });

  if (!response.ok) {
    const detail = await readText(response);
    throw new Error(friendlyErrorMessage(detail, "อัปเดตบัญชีแอดมินไม่สำเร็จ"));
  }
}

async function ensureSupabaseAdmin(
  url: string,
  serviceKey: string,
  email: string,
  password: string,
) {
  const existing = await findSupabaseUser(url, serviceKey, email);
  if (existing?.id) {
    await updateSupabaseAdminPassword(url, serviceKey, existing.id, password);
    return existing.id;
  }

  await createSupabaseAdmin(url, serviceKey, email, password);
  return (await findSupabaseUser(url, serviceKey, email))?.id || randomUUID();
}

async function signInWithSupabase(email: string, password: string) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const userId = adminPassword
    ? await ensureSupabaseAdmin(config.url, config.serviceKey, email, password)
    : undefined;
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceKey),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const detail = await readText(response);
    throw new Error(friendlyErrorMessage(detail, "ไม่สามารถเข้าสู่ระบบแอดมินได้"));
  }

  const data = await response.json().catch(() => ({}));
  const role = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
  if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL || role !== ADMIN_ROLE) {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์แอดมิน");
  }

  return {
    id: data.user?.id || userId,
    email: data.user?.email || email,
    name: data.user?.user_metadata?.name || ADMIN_NAME,
    role: ADMIN_ROLE,
    accessToken: data.access_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000).toISOString()
      : undefined,
    mode: "supabase",
  };
}

export const Route = createFileRoute("/api/admin-login")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            email?: string;
            password?: string;
          };
          const email = String(body.email || "")
            .trim()
            .toLowerCase();
          const password = String(body.password || "");

          if (email !== ADMIN_EMAIL || !password) {
            return json({ ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
          }
          const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
          if (adminPassword && password !== adminPassword) {
            return json({ ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
          }

          const supabaseSession = await signInWithSupabase(email, password);
          return json({
            ok: true,
            session: supabaseSession,
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "ไม่สามารถเข้าสู่ระบบแอดมินได้"),
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
