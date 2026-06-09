import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { type DreamRecord } from "@/lib/admin-content";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";

type DreamRow = {
  id?: string;
  keyword?: string;
  letter?: string;
  category?: string;
  meaning?: string;
  numbers?: string;
  time?: string;
  advice?: string;
};

function normalizeDream(row: DreamRow): DreamRecord {
  const keyword = String(row.keyword || "").trim();
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    keyword,
    letter: String(row.letter || keyword.charAt(0)).slice(0, 1),
    category: String(row.category || "สิ่งของ").slice(0, 80),
    meaning: String(row.meaning || "").slice(0, 2000),
    numbers: String(row.numbers || "").slice(0, 200),
    time: String(row.time || "ไม่ระบุ").slice(0, 120),
    advice: String(row.advice || "").slice(0, 1000),
  };
}

function toRow(dream: DreamRecord) {
  return {
    id: dream.id,
    keyword: dream.keyword,
    letter: dream.letter,
    category: dream.category,
    meaning: dream.meaning,
    numbers: dream.numbers,
    time: dream.time,
    advice: dream.advice,
    updated_at: new Date().toISOString(),
  };
}

function dreamMatches(dream: DreamRecord, keyword: string) {
  return [dream.keyword, dream.category, dream.meaning, dream.numbers, dream.time, dream.advice]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
}

async function listDreams() {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest("dreams?select=*&order=keyword.asc");
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  const rows = (await response.json().catch(() => [])) as DreamRow[];
  return { source: "supabase", dreams: rows.map(normalizeDream) };
}

async function saveDream(payload: DreamRow) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const dream = normalizeDream(payload);

  const response = await supabaseRequest("dreams?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(toRow(dream)),
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  const rows = (await response.json().catch(() => [])) as DreamRow[];
  return { source: "supabase", dream: normalizeDream(rows[0] || dream) };
}

async function deleteDream(id: string) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest(`dreams?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  return { source: "supabase" };
}

export const Route = createFileRoute("/api/dreams")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const q = (url.searchParams.get("q") || "").trim().toLowerCase();
          const result = await listDreams();
          const dreams = q ? result.dreams.filter((dream) => dreamMatches(dream, q)) : result.dreams;
          return json({ ok: true, ...result, dreams });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "โหลดข้อมูลทำนายฝันไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          return json({ ok: true, ...(await saveDream(await request.json())) });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "บันทึกคำฝันไม่สำเร็จ" },
            { status: 502 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          const id = new URL(request.url).searchParams.get("id");
          if (!id) return json({ ok: false, error: "Missing id" }, { status: 400 });
          return json({ ok: true, ...(await deleteDream(id)) });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "ลบคำฝันไม่สำเร็จ" },
            { status: 502 },
          );
        }
      },
    },
  },
});
