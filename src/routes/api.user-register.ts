import { createFileRoute } from "@tanstack/react-router";
import {
  findSupabaseAuthUser,
  getSupabaseAuthConfig,
  readText,
  signInSupabaseUser,
  supabaseAuthHeaders,
  toUserSession,
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

function localSession(body: RegisterBody) {
  return {
    id: `local-user-${Date.now()}`,
    email: body.email,
    name: body.displayName || `${body.firstName} ${body.lastName}`.trim() || body.email,
    role: "User",
    mode: "local-dev",
    profile: {
      firstName: body.firstName,
      lastName: body.lastName,
      displayName: body.displayName,
      birthDate: body.birthDate,
      gender: body.gender,
    },
  };
}

type RegisterBody = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: string;
};

function normalizeBody(raw: Record<string, unknown>): RegisterBody {
  return {
    firstName: String(raw.firstName || "").trim(),
    lastName: String(raw.lastName || "").trim(),
    displayName: String(raw.displayName || "").trim(),
    email: String(raw.email || "")
      .trim()
      .toLowerCase(),
    password: String(raw.password || ""),
    birthDate: String(raw.birthDate || ""),
    gender: String(raw.gender || "ไม่ระบุ"),
  };
}

function validate(body: RegisterBody) {
  if (!body.email || !body.email.includes("@")) return "กรุณากรอกอีเมลให้ถูกต้อง";
  if (!body.password || body.password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  if (!body.displayName && !body.firstName) return "กรุณากรอกชื่อหรือชื่อแสดง";
  if (body.email === "admin@gmail.com") return "อีเมลนี้เป็นบัญชีแอดมิน ใช้สมัครสมาชิกทั่วไปไม่ได้";
  return "";
}

async function createSupabaseUser(url: string, serviceKey: string, body: RegisterBody) {
  const existing = await findSupabaseAuthUser(url, serviceKey, body.email);
  if (existing) throw new Error("อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ");

  const name = body.displayName || `${body.firstName} ${body.lastName}`.trim() || body.email;
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: supabaseAuthHeaders(serviceKey),
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "User",
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: body.displayName || name,
        birthDate: body.birthDate,
        gender: body.gender,
      },
      app_metadata: { role: "User" },
    }),
  });

  if (!response.ok) {
    const detail = await readText(response);
    throw new Error(`Supabase create user failed ${response.status}: ${detail}`);
  }
}

export const Route = createFileRoute("/api/user-register")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      POST: async ({ request }) => {
        try {
          const body = normalizeBody(
            (await request.json().catch(() => ({}))) as Record<string, unknown>,
          );
          const error = validate(body);
          if (error) return json({ ok: false, error }, { status: 400 });

          const config = getSupabaseAuthConfig();
          if (!config) {
            if (process.env.NODE_ENV === "production") {
              throw new Error(
                "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
              );
            }
            return json({ ok: true, session: localSession(body) });
          }

          await createSupabaseUser(config.url, config.serviceKey, body);
          const token = await signInSupabaseUser(
            config.url,
            config.serviceKey,
            body.email,
            body.password,
          );
          return json({ ok: true, session: toUserSession(token, { email: body.email }) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "สมัครสมาชิกไม่สำเร็จ",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
