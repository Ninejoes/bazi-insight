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

function clampPage(value: string | null) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function clampLimit(value: string | null) {
  const limit = Number.parseInt(value || "20", 10);
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(limit, 50);
}

function parseTotal(contentRange: string | null, fallback: number) {
  const total = contentRange?.match(/\/(\d+|\*)$/)?.[1];
  if (!total || total === "*") return fallback;
  return Number.parseInt(total, 10);
}

function buildDreamQuery({ q, keyword, page, limit }: { q: string; keyword: string; page: number; limit: number }) {
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    select: "*",
    order: "keyword.asc",
    limit: String(limit),
    offset: String(offset),
  });

  if (keyword) {
    params.set("keyword", `eq.${keyword}`);
  } else if (q) {
    const pattern = `*${q.replace(/[,*()]/g, " ")}*`;
    params.set(
      "or",
      [
        `keyword.ilike.${pattern}`,
        `category.ilike.${pattern}`,
        `meaning.ilike.${pattern}`,
        `numbers.ilike.${pattern}`,
        `time.ilike.${pattern}`,
        `advice.ilike.${pattern}`,
      ].join(","),
    );
  }

  return `dreams?${params.toString()}`;
}

async function listDreams({ q = "", keyword = "", page = 1, limit = 20 } = {}) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest(buildDreamQuery({ q, keyword, page, limit }), {
    headers: { Prefer: "count=exact" },
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  const rows = (await response.json().catch(() => [])) as DreamRow[];
  const total = parseTotal(response.headers.get("content-range"), rows.length);
  return {
    source: "supabase",
    dreams: rows.map(normalizeDream),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
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
          const keyword = (url.searchParams.get("keyword") || "").trim().toLowerCase();
          const page = clampPage(url.searchParams.get("page"));
          const limit = clampLimit(url.searchParams.get("limit"));
          return json({ ok: true, ...(await listDreams({ q, keyword, page, limit })) });
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
