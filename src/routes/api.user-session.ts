import { createFileRoute } from "@tanstack/react-router";
import {
  getSupabaseAuthConfig,
  readBearer,
  toUserSession,
  verifySupabaseUser,
} from "@/lib/supabase-auth";

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

export const Route = createFileRoute("/api/user-session")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const config = getSupabaseAuthConfig();
          const token = readBearer(request);
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }
          const user = await verifySupabaseUser(config.url, config.serviceKey, token);
          return json({ ok: true, session: toUserSession({}, user) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "session ผู้ใช้งานไม่ถูกต้อง",
            },
            { status: 401 },
          );
        }
      },
    },
  },
});
