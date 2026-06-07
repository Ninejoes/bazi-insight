import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "admin@gmail.com";

type SupabaseUser = {
  id?: string;
  email?: string;
  created_at?: string;
  banned_until?: string;
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
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

function userName(user: SupabaseUser) {
  const metadataName = user.user_metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email?.split("@")[0] || "User";
}

function userRole(user: SupabaseUser) {
  const appRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  return appRole === "Admin" || userMetadataRole === "Admin" ? "Admin" : "User";
}

function userStatus(user: SupabaseUser) {
  if (!user.banned_until) return "Active";
  return new Date(user.banned_until).getTime() > Date.now() ? "Suspended" : "Active";
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

async function listSupabaseUsers(url: string, serviceKey: string) {
  const response = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: supabaseHeaders(serviceKey),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase users failed ${response.status}: ${detail}`);
  }

  const data = (await response.json().catch(() => ({}))) as SupabaseUsersResponse;
  return (data.users || []).map((user) => ({
    id: user.id || user.email || "unknown",
    name: userName(user),
    email: user.email || "",
    role: userRole(user),
    joined: user.created_at?.slice(0, 10) || "",
    status: userStatus(user),
  }));
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
            source: "supabase-auth",
            users: await listSupabaseUsers(config.url, config.serviceKey),
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "โหลดผู้ใช้งานไม่สำเร็จ",
            },
            { status: 401 },
          );
        }
      },
    },
  },
});
