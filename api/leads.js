import { randomUUID } from "node:crypto";

function sanitizeLead(payload = {}) {
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

async function saveToSupabase(lead) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
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

  return { rows: await response.json().catch(() => []) };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const lead = sanitizeLead(req.body);
    await saveToSupabase(lead);
    res.status(200).json({ ok: true, stored: "supabase", lead });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
