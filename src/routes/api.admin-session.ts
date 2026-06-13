import { createFileRoute } from "@tanstack/react-router";
import { friendlyErrorMessage } from "@/lib/friendly-error";

const ADMIN_EMAIL = "admin@gmail.com";

type SupabaseUser = {
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
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

async function verifySupabaseAdmin(url: string, serviceKey: string, accessToken: string) {
  if (!accessToken) throw new Error("ไม่มี session สำหรับตรวจสอบสิทธิ์แอดมิน");

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) throw new Error("session แอดมินไม่ถูกต้องหรือหมดอายุ");

  const user = (await response.json().catch(() => ({}))) as SupabaseUser;
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || userRole(user) !== "Admin") {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์แอดมิน");
  }

  return {
    email: user.email,
    name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Admin",
    role: "Admin",
  };
}

export const Route = createFileRoute("/api/admin-session")({
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

          return json({
            ok: true,
            session: await verifySupabaseAdmin(config.url, config.serviceKey, readBearer(request)),
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "session แอดมินไม่ถูกต้อง"),
            },
            { status: 401 },
          );
        }
      },
    },
  },
});
