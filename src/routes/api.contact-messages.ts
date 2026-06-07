import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";

const ADMIN_EMAIL = "admin@gmail.com";

type ContactMessage = {
  id?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type SupabaseUser = {
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function readBearer(request: Request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function supabaseHeaders(serviceKey: string, accessToken?: string) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${accessToken || serviceKey}`,
  };
}

function userRole(user: SupabaseUser) {
  const appRole = user.app_metadata?.role;
  const userMetadataRole = user.user_metadata?.role;
  return appRole === "Admin" || userMetadataRole === "Admin" ? "Admin" : "User";
}

async function requireAdmin(request: Request) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const accessToken = readBearer(request);
  if (!accessToken) throw new Error("ไม่มี session สำหรับตรวจสอบสิทธิ์แอดมิน");

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: supabaseHeaders(config.serviceKey, accessToken),
  });
  if (!response.ok) throw new Error("session แอดมินไม่ถูกต้องหรือหมดอายุ");

  const user = (await response.json().catch(() => ({}))) as SupabaseUser;
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || userRole(user) !== "Admin") {
    throw new Error("บัญชีนี้ไม่มีสิทธิ์แอดมิน");
  }
}

function normalizeMessage(payload: ContactMessage): Required<ContactMessage> {
  const now = new Date().toISOString();
  return {
    id: String(payload.id || randomUUID()).slice(0, 80),
    name: String(payload.name || "")
      .trim()
      .slice(0, 120),
    email: String(payload.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 160),
    subject: String(payload.subject || "")
      .trim()
      .slice(0, 200),
    message: String(payload.message || "")
      .trim()
      .slice(0, 3000),
    status: String(payload.status || "new")
      .trim()
      .slice(0, 40),
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
  };
}

function validateMessage(message: Required<ContactMessage>) {
  if (!message.name) return "กรุณากรอกชื่อ";
  if (!message.email || !message.email.includes("@")) return "กรุณากรอกอีเมลให้ถูกต้อง";
  if (!message.subject) return "กรุณากรอกหัวข้อ";
  if (!message.message) return "กรุณากรอกข้อความ";
  return "";
}

async function listMessages() {
  const response = await supabaseRequest(
    "contact_messages?select=*&order=created_at.desc&limit=200",
  );
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as ContactMessage[];
  return rows.map(normalizeMessage);
}

async function saveMessage(payload: ContactMessage) {
  const message = normalizeMessage(payload);
  const error = validateMessage(message);
  if (error) throw new Error(error);

  const response = await supabaseRequest("contact_messages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(message),
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as ContactMessage[];
  return normalizeMessage(rows[0] || message);
}

async function updateMessage(payload: ContactMessage) {
  const id = String(payload.id || "").trim();
  const status = String(payload.status || "").trim();
  if (!id) throw new Error("ไม่พบรหัสข้อความ");
  if (!["new", "read", "replied", "archived"].includes(status)) {
    throw new Error("สถานะข้อความไม่ถูกต้อง");
  }

  const response = await supabaseRequest(`contact_messages?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      status,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as ContactMessage[];
  return normalizeMessage(rows[0] || { id, status });
}

export const Route = createFileRoute("/api/contact-messages")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
          return json({ ok: true, source: "supabase", messages: await listMessages() });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "โหลดข้อความไม่สำเร็จ" },
            { status: 401 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          return json({
            ok: true,
            source: "supabase",
            message: await saveMessage(await request.json()),
          });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "ส่งข้อความไม่สำเร็จ" },
            { status: 502 },
          );
        }
      },
      PUT: async ({ request }) => {
        try {
          await requireAdmin(request);
          return json({
            ok: true,
            source: "supabase",
            message: await updateMessage(await request.json()),
          });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "อัปเดตข้อความไม่สำเร็จ" },
            { status: 401 },
          );
        }
      },
    },
  },
});
