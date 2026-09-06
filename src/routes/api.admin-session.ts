import { createFileRoute } from "@tanstack/react-router";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { getAdminEmail } from "@/lib/supabase-rest";

type SupabaseUser = {
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function getAllowedOrigin(request?: Request): string {
  if (!request) return "";
  const origin = request.headers.get("origin") || "";
  if (!origin) return "";
  if (
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /^https?:\/\/([a-z0-9-]+\.)?likhitfa\.online$/.test(origin) ||
    /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/.test(origin)
  ) {
    return origin;
  }
  return "";
}

function json(body: unknown, init?: ResponseInit, request?: Request) {
  const origin = getAllowedOrigin(request);
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
  if (origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Vary"] = "Origin";
  }

  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
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
  if (user.email?.toLowerCase() !== getAdminEmail() || userRole(user) !== "Admin") {
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
      OPTIONS: async ({ request }) => json(null, { status: 204 }, request),
      GET: async ({ request }) => {
        try {
          const config = getSupabaseConfig();
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }

          return json(
            {
              ok: true,
              session: await verifySupabaseAdmin(config.url, config.serviceKey, readBearer(request)),
            },
            undefined,
            request,
          );
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "session แอดมินไม่ถูกต้อง"),
            },
            { status: 401 },
            request,
          );
        }
      },
    },
  },
});
