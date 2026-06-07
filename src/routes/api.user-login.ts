import { createFileRoute } from "@tanstack/react-router";
import {
  getSupabaseAuthConfig,
  signInSupabaseUser,
  toUserSession,
  userRole,
} from "@/lib/supabase-auth";

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

export const Route = createFileRoute("/api/user-login")({
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

          if (!email || !password) {
            return json({ ok: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
          }

          const config = getSupabaseAuthConfig();
          if (!config) {
            if (process.env.NODE_ENV === "production") {
              throw new Error(
                "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
              );
            }
            return json({
              ok: true,
              session: {
                id: "local-user",
                email,
                name: email.split("@")[0],
                role: "User",
                mode: "local-dev",
              },
            });
          }

          const token = await signInSupabaseUser(config.url, config.serviceKey, email, password);
          if (token.user && userRole(token.user) !== "User") {
            return json(
              { ok: false, error: "บัญชีนี้ไม่ใช่ผู้ใช้งานทั่วไป กรุณาใช้หน้าแอดมิน" },
              { status: 403 },
            );
          }

          return json({ ok: true, session: toUserSession(token, { email }) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ",
            },
            { status: 401 },
          );
        }
      },
    },
  },
});
