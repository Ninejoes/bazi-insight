import { createFileRoute } from "@tanstack/react-router";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const ADMIN_EMAIL = "admin@gmail.com";

type SupabaseUser = {
  id?: string;
  email?: string;
  banned_until?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

type PublicUserRow = {
  id?: string;
  email?: string;
  name?: string;
  role?: "Admin" | "User";
  status?: "active" | "disabled";
  provider?: string;
  last_sign_in_at?: string;
  created_at?: string;
};

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
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

function supabaseHeaders(serviceKey: string, accessToken?: string) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${accessToken || serviceKey}`,
  };
}

function readBearer(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function userRole(user: SupabaseUser) {
  const appRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  return appRole === "Admin" || userMetadataRole === "Admin" ? "Admin" : "User";
}

async function requireAdmin(url: string, serviceKey: string, accessToken: string) {
  if (!accessToken) throw new Error("ไม่มี session สำหรับตรวจสอบสิทธิ์แอดมิน");

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: supabaseHeaders(serviceKey, accessToken),
  });

  if (!response.ok) throw new Error("session แอดมินไม่ถูกต้องหรือหมดอายุ");

  const user = (await response.json().catch(() => ({}))) as SupabaseUser;
  const role = userRole(user);
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || role !== "Admin") {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์แอดมิน");
  }
}

async function listPublicUsers(url: string, serviceKey: string) {
  const response = await fetch(`${url}/rest/v1/users?select=*&order=created_at.desc`, {
    headers: supabaseHeaders(serviceKey),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(friendlyErrorMessage(detail, "เชื่อมต่อข้อมูลผู้ใช้งานไม่สำเร็จ"));
  }

  const rows = (await response.json().catch(() => [])) as PublicUserRow[];
  return rows.map((user) => ({
    id: user.id || user.email || "unknown",
    name: user.name || user.email || "User",
    email: user.email || "",
    role: user.role || "User",
    joined: user.created_at?.slice(0, 10) || "",
    status: user.status === "disabled" ? "Suspended" : "Active",
    provider: user.provider || "email",
    lastSignInAt: user.last_sign_in_at,
  }));
}

async function findAuthUser(url: string, serviceKey: string, email: string) {
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: supabaseHeaders(serviceKey),
  });
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  return (
    data.users?.find((user: SupabaseUser) => user.email?.toLowerCase() === email.toLowerCase()) ||
    null
  );
}

async function createUser(url: string, serviceKey: string, payload: Record<string, unknown>) {
  const email = String(payload.email || "")
    .trim()
    .toLowerCase();
  const password = String(payload.password || "");
  const name = String(payload.name || email || "User")
    .trim()
    .slice(0, 160);
  const role = payload.role === "Admin" ? "Admin" : "User";
  const status =
    payload.status === "Suspended" || payload.status === "disabled" ? "disabled" : "active";

  if (!email || !email.includes("@")) throw new Error("กรุณากรอกอีเมลให้ถูกต้อง");
  if (!password || password.length < 8) throw new Error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  if (email === ADMIN_EMAIL) throw new Error("บัญชีแอดมินหลักมีอยู่แล้ว");

  const existing = await findAuthUser(url, serviceKey, email);
  if (existing) throw new Error("อีเมลนี้มีบัญชีอยู่แล้ว");

  const authResponse = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: supabaseHeaders(serviceKey),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, displayName: name },
      app_metadata: { role },
    }),
  });
  if (!authResponse.ok) {
    const detail = await authResponse.text().catch(() => "");
    throw new Error(`Supabase Auth create failed ${authResponse.status}: ${detail}`);
  }

  const authUser = (await authResponse.json().catch(() => ({}))) as SupabaseUser & {
    user?: SupabaseUser;
  };
  const id = authUser.id || authUser.user?.id;
  if (!id) throw new Error("สร้างบัญชีแล้วแต่ไม่พบ user id จาก Supabase Auth");

  if (status === "disabled") {
    await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: supabaseHeaders(serviceKey),
      body: JSON.stringify({ ban_duration: "876000h" }),
    }).catch(() => null);
  }

  const publicResponse = await fetch(`${url}/rest/v1/users?on_conflict=id`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(serviceKey),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id,
      email,
      name,
      role,
      status,
      provider: "email",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
  if (!publicResponse.ok) {
    const detail = await publicResponse.text().catch(() => "");
    throw new Error(friendlyErrorMessage(detail, "บันทึกผู้ใช้งานไม่สำเร็จ"));
  }

  const rows = (await publicResponse.json().catch(() => [])) as PublicUserRow[];
  const user = rows[0] || { id, email, name, role, status, provider: "email" };
  return {
    id: user.id || id,
    name: user.name || name,
    email: user.email || email,
    role: user.role || role,
    joined: user.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    status: user.status === "disabled" ? "Suspended" : "Active",
    provider: user.provider || "email",
  };
}

export const Route = createFileRoute("/api/admin-users")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const config = getSupabaseConfig();
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }

          await requireAdmin(config.url, config.serviceKey, readBearer(request));
          return json({
            ok: true,
            source: "supabase-public-users",
            users: await listPublicUsers(config.url, config.serviceKey),
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "โหลดผู้ใช้งานไม่สำเร็จ"),
            },
            { status: 401 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const config = getSupabaseConfig();
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }

          await requireAdmin(config.url, config.serviceKey, readBearer(request));
          return json({
            ok: true,
            source: "supabase-public-users",
            user: await createUser(config.url, config.serviceKey, await request.json()),
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "สร้างผู้ใช้งานไม่สำเร็จ"),
            },
            { status: 400 },
          );
        }
      },
    },
  },
});
