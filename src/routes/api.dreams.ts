import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { dreamSeed, type DreamRecord } from "@/lib/admin-content";
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

let memoryDreams: DreamRecord[] = [...dreamSeed];

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

async function listDreams() {
  const configured = Boolean(getSupabaseConfig());
  try {
    const response = await supabaseRequest("dreams?select=*&order=keyword.asc");
    if (!response) return { source: "memory", dreams: memoryDreams };
    const rows = (await response.json().catch(() => [])) as DreamRow[];
    return { source: "supabase", dreams: rows.map(normalizeDream) };
  } catch (error) {
    return {
      source: "memory",
      dreams: memoryDreams,
      error: configured && error instanceof Error ? error.message : undefined,
    };
  }
}

async function saveDream(payload: DreamRow) {
  const configured = Boolean(getSupabaseConfig());
  const dream = normalizeDream(payload);
  memoryDreams = [dream, ...memoryDreams.filter((item) => item.id !== dream.id)];

  try {
    const response = await supabaseRequest("dreams?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(toRow(dream)),
    });
    if (!response) return { source: "memory", dream };
    const rows = (await response.json().catch(() => [])) as DreamRow[];
    return { source: "supabase", dream: normalizeDream(rows[0] || dream) };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory", dream };
  }
}

async function deleteDream(id: string) {
  const configured = Boolean(getSupabaseConfig());
  memoryDreams = memoryDreams.filter((item) => item.id !== id);

  try {
    const response = await supabaseRequest(`dreams?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response) return { source: "memory" };
    return { source: "supabase" };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory" };
  }
}

export const Route = createFileRoute("/api/dreams")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") || "").trim().toLowerCase();
        const result = await listDreams();
        const dreams = q
          ? result.dreams.filter((dream) => dream.keyword.toLowerCase().includes(q))
          : result.dreams;
        return json({ ok: true, ...result, dreams });
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
