import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import {
  getSupabaseAuthConfig,
  readBearer,
  supabaseAuthHeaders,
  verifySupabaseUser,
} from "@/lib/supabase-auth";

type ReadingRow = {
  id?: string;
  user_id?: string | null;
  email?: string;
  type?: string;
  title?: string;
  result?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

type VerifiedUser = Awaited<ReturnType<typeof verifySupabaseUser>> & {
  id: string;
};

function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      ...(init?.headers || {}),
    },
  });
}

function normalizeReading(row: ReadingRow = {}) {
  const now = new Date().toISOString();
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    user_id: row.user_id || null,
    email: String(row.email || "").trim().toLowerCase().slice(0, 160),
    type: String(row.type || "ปาจื้อ").slice(0, 40),
    title: String(row.title || "ผลดูดวง").slice(0, 200),
    result: String(row.result || "").slice(0, 1000),
    input: row.input && typeof row.input === "object" ? row.input : {},
    output: row.output && typeof row.output === "object" ? row.output : {},
    created_at: row.created_at || now,
    updated_at: row.updated_at || now,
  };
}

function publicReading(row: ReadingRow = {}) {
  const reading = normalizeReading(row);
  return {
    id: reading.id,
    type: reading.type,
    title: reading.title,
    result: reading.result,
    date: String(reading.created_at || "").replace("T", " ").slice(0, 16),
    input: reading.input,
    output: reading.output,
    createdAt: reading.created_at,
  };
}

async function supabaseRest(
  url: string,
  serviceKey: string,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...supabaseAuthHeaders(serviceKey),
      ...(init.headers || {}),
    },
  });
  const text = await response.text().catch(() => "");
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`Supabase reading_history failed ${response.status}: ${text}`);
  return data;
}

async function optionalUser(url: string, serviceKey: string, request: Request) {
  const token = readBearer(request);
  if (!token) return null;
  return verifySupabaseUser(url, serviceKey, token);
}

async function requiredUser(url: string, serviceKey: string, request: Request): Promise<VerifiedUser> {
  const user = await optionalUser(url, serviceKey, request);
  if (!user?.id) throw new Error("กรุณาเข้าสู่ระบบก่อนดูประวัติการดูดวง");
  return user as VerifiedUser;
}

export const Route = createFileRoute("/api/reading-history")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const config = getSupabaseAuthConfig();
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }
          const user = await requiredUser(config.url, config.serviceKey, request);
          const rows = (await supabaseRest(
            config.url,
            config.serviceKey,
            `reading_history?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc`,
          )) as ReadingRow[];
          return json({ ok: true, source: "supabase-public-reading-history", history: rows.map(publicReading) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "โหลดประวัติไม่สำเร็จ",
            },
            { status: 500 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const config = getSupabaseAuthConfig();
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }
          const user = await optionalUser(config.url, config.serviceKey, request);
          const body = normalizeReading((await request.json().catch(() => ({}))) as ReadingRow);
          const row = {
            ...body,
            user_id: user?.id || body.user_id || null,
            email: user?.email || body.email || "",
            updated_at: new Date().toISOString(),
          };
          const rows = (await supabaseRest(config.url, config.serviceKey, "reading_history?on_conflict=id", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify(row),
          })) as ReadingRow[];
          return json({
            ok: true,
            source: "supabase-public-reading-history",
            entry: publicReading(rows[0] || row),
          });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "บันทึกประวัติไม่สำเร็จ",
            },
            { status: 500 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          const config = getSupabaseAuthConfig();
          if (!config) {
            throw new Error(
              "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server",
            );
          }
          const user = await requiredUser(config.url, config.serviceKey, request);
          const id = new URL(request.url).searchParams.get("id");
          if (!id) return json({ ok: false, error: "Missing id" }, { status: 400 });
          const filter = `reading_history?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}`;
          await supabaseRest(config.url, config.serviceKey, filter, { method: "DELETE" });
          return json({ ok: true, source: "supabase-public-reading-history" });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "ลบประวัติไม่สำเร็จ",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
