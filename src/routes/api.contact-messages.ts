import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";

type ContactMessage = {
  id?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  created_at?: string;
};

let memoryMessages: Required<ContactMessage>[] = [];

function normalizeMessage(payload: ContactMessage): Required<ContactMessage> {
  return {
    id: String(payload.id || randomUUID()).slice(0, 80),
    name: String(payload.name || "").slice(0, 120),
    email: String(payload.email || "").slice(0, 160),
    subject: String(payload.subject || "").slice(0, 200),
    message: String(payload.message || "").slice(0, 3000),
    status: String(payload.status || "new").slice(0, 40),
    created_at: payload.created_at || new Date().toISOString(),
  };
}

async function listMessages() {
  const configured = Boolean(getSupabaseConfig());
  try {
    const response = await supabaseRequest(
      "contact_messages?select=*&order=created_at.desc&limit=100",
    );
    if (!response) return { source: "memory", messages: memoryMessages };
    const rows = (await response.json().catch(() => [])) as ContactMessage[];
    return { source: "supabase", messages: rows.map(normalizeMessage) };
  } catch (error) {
    return {
      source: "memory",
      messages: memoryMessages,
      error: configured && error instanceof Error ? error.message : undefined,
    };
  }
}

async function saveMessage(payload: ContactMessage) {
  const configured = Boolean(getSupabaseConfig());
  const message = normalizeMessage(payload);
  memoryMessages = [message, ...memoryMessages.filter((item) => item.id !== message.id)];

  try {
    const response = await supabaseRequest("contact_messages", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(message),
    });
    if (!response) return { source: "memory", message };
    const rows = (await response.json().catch(() => [])) as ContactMessage[];
    return { source: "supabase", message: normalizeMessage(rows[0] || message) };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory", message };
  }
}

export const Route = createFileRoute("/api/contact-messages")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => json({ ok: true, ...(await listMessages()) }),
      POST: async ({ request }) => {
        try {
          return json({ ok: true, ...(await saveMessage(await request.json())) });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "ส่งข้อความไม่สำเร็จ" },
            { status: 502 },
          );
        }
      },
    },
  },
});
