import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";

type LeadPayload = {
  id?: string;
  name?: string;
  gender?: string;
  birthDate?: string;
  birth_date?: string;
  birthTime?: string;
  birth_time?: string;
  source?: string;
  reason?: string;
};

function sanitizeLead(payload: LeadPayload = {}) {
  const now = new Date().toISOString();
  return {
    id: String(payload.id || randomUUID()).slice(0, 80),
    name: String(payload.name || "").slice(0, 120),
    gender: String(payload.gender || "").slice(0, 40),
    birth_date: String(payload.birthDate || payload.birth_date || "").slice(0, 30),
    birth_time: String(payload.birthTime || payload.birth_time || "").slice(0, 20),
    source: String(payload.source || "bazi-insight").slice(0, 80),
    reason: String(payload.reason || "submit").slice(0, 80),
    updated_at: now,
  };
}

async function saveToSupabase(lead: ReturnType<typeof sanitizeLead>) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { configured: false };
  }

  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/leads?on_conflict=id`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ ...lead, created_at: new Date().toISOString() }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase error ${response.status}: ${detail}`);
  }

  return { configured: true, rows: await response.json().catch(() => []) };
}

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

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      POST: async ({ request }) => {
        try {
          const lead = sanitizeLead(await request.json().catch(() => ({})));
          const result = await saveToSupabase(lead);
          return json({
            ok: true,
            stored: result.configured ? "supabase" : "browser-fallback",
            lead,
          });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
