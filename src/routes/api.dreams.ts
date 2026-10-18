import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { dreamSeed, getCuratedDream, type DreamRecord } from "@/lib/admin-content";
import {
  getSupabaseConfig,
  json,
  requireAdmin,
  saveContentAuditEvent,
  supabaseRequest,
} from "@/lib/supabase-rest";
import { friendlyErrorMessage } from "@/lib/friendly-error";

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

const BLOCKED_DREAM_IDS = new Set(["9cc47d6f-0f65-4c3a-86ed-cbcb98e36622"]);
const BLOCKED_DREAM_CATEGORIES = new Set(["developer"]);

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
  return Math.min(limit, 1000);
}

function parseTotal(contentRange: string | null, fallback: number) {
  const total = contentRange?.match(/\/(\d+|\*)$/)?.[1];
  if (!total || total === "*") return fallback;
  return Number.parseInt(total, 10);
}

function buildDreamQuery({
  q,
  keyword,
  category,
  letter,
  page,
  limit,
  includeBlocked,
}: {
  q: string;
  keyword: string;
  category: string;
  letter: string;
  page: number;
  limit: number;
  includeBlocked: boolean;
}) {
  const effectiveLimit = keyword ? 1 : limit;
  const offset = keyword ? 0 : (page - 1) * limit;
  const params = new URLSearchParams({
    select: "*",
    order: "keyword.asc",
    limit: String(effectiveLimit),
    offset: String(offset),
  });

  if (!includeBlocked) {
    for (const id of BLOCKED_DREAM_IDS) params.set("id", `neq.${id}`);
    if (!category) {
      for (const blockedCategory of BLOCKED_DREAM_CATEGORIES) {
        params.set("category", `neq.${blockedCategory}`);
      }
    }
  }

  if (keyword) {
    params.set("keyword", `eq.${keyword}`);
  } else {
    if (category && category !== "ทั้งหมด") {
      params.set("category", `eq.${category}`);
    }
    if (letter && letter !== "ทั้งหมด") {
      params.set("letter", `eq.${letter}`);
    }
  }

  if (!keyword && q) {
    const pattern = `*${q.replace(/[,*()]/g, " ")}*`;
    params.set(
      "or",
      `(${[
        `keyword.ilike.${pattern}`,
        `category.ilike.${pattern}`,
        `meaning.ilike.${pattern}`,
        `numbers.ilike.${pattern}`,
        `time.ilike.${pattern}`,
        `advice.ilike.${pattern}`,
      ].join(",")})`,
    );
  }

  return `dreams?${params.toString()}`;
}

function filterCuratedDreams({
  q = "",
  category = "",
  letter = "",
}: {
  q?: string;
  category?: string;
  letter?: string;
}) {
  return dreamSeed.filter((item) => {
    if (category && category !== "ทั้งหมด" && item.category !== category) return false;
    if (letter && letter !== "ทั้งหมด" && item.letter !== letter) return false;
    if (q) {
      const needle = q.toLowerCase();
      return (
        item.keyword.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.meaning.toLowerCase().includes(needle) ||
        item.numbers.toLowerCase().includes(needle)
      );
    }
    return true;
  });
}

async function listDreams({
  q = "",
  keyword = "",
  category = "",
  letter = "",
  page = 1,
  limit = 20,
  includeBlocked = false,
} = {}) {
  const curatedMatch = keyword ? getCuratedDream(keyword) : undefined;

  if (!getSupabaseConfig()) {
    if (keyword) {
      const dreams = curatedMatch ? [curatedMatch] : [];
      return { source: "curated", dreams, page: 1, limit: 1, total: dreams.length, totalPages: 1 };
    }
    const filtered = filterCuratedDreams({ q, category, letter });
    const start = (page - 1) * limit;
    return {
      source: "curated",
      dreams: filtered.slice(start, start + limit),
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  }

  if (keyword) {
    const response = await supabaseRequest(
      buildDreamQuery({ q, keyword, category, letter, page: 1, limit: 1, includeBlocked }),
      { headers: { Prefer: "return=representation" } },
    );
    const rows = response ? ((await response.json().catch(() => [])) as DreamRow[]) : [];
    if (rows.length > 0) {
      return {
        source: "supabase",
        dreams: rows.map(normalizeDream),
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
      };
    }
    if (curatedMatch) {
      return {
        source: "curated",
        dreams: [curatedMatch],
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
      };
    }
    const prefixResponse = await supabaseRequest(
      `dreams?keyword=ilike.${encodeURIComponent(`${keyword}*`)}&select=*&order=keyword.asc&limit=1`,
    );
    const prefixRows = prefixResponse
      ? ((await prefixResponse.json().catch(() => [])) as DreamRow[])
      : [];
    return {
      source: "supabase",
      dreams: prefixRows.map(normalizeDream),
      page: 1,
      limit: 1,
      total: prefixRows.length,
      totalPages: 1,
    };
  }

  // When browsing without a search query, prioritize the 200 curated flagship dreams first
  if (!q && !includeBlocked) {
    const curatedList = filterCuratedDreams({ category, letter });
    const start = (page - 1) * limit;
    if (start < curatedList.length) {
      const slice = curatedList.slice(start, start + limit);
      return {
        source: "curated",
        dreams: slice,
        page,
        limit,
        total: curatedList.length,
        totalPages: Math.max(1, Math.ceil(curatedList.length / limit)),
      };
    }
  }

  const preferHeader = "count=estimated";
  const response = await supabaseRequest(
    buildDreamQuery({ q, keyword, category, letter, page, limit, includeBlocked }),
    {
      headers: { Prefer: preferHeader },
    },
  );
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  const rows = (await response.json().catch(() => [])) as DreamRow[];
  const total = parseTotal(response.headers.get("content-range"), rows.length);
  const supabaseDreams = rows.map(normalizeDream);

  if (q && page === 1) {
    const curatedMatches = filterCuratedDreams({ q, category, letter });
    const seenKeywords = new Set(curatedMatches.map((item) => item.keyword));
    const merged = [
      ...curatedMatches,
      ...supabaseDreams.filter((item) => !seenKeywords.has(item.keyword)),
    ].slice(0, limit);
    const effectiveTotal = Math.max(total, merged.length);
    return {
      source: "supabase",
      dreams: merged,
      page,
      limit,
      total: effectiveTotal,
      totalPages: Math.max(1, Math.ceil(effectiveTotal / limit)),
    };
  }

  return {
    source: "supabase",
    dreams: supabaseDreams,
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
          const category = (url.searchParams.get("category") || "").trim();
          const letter = (url.searchParams.get("letter") || "").trim();
          const page = clampPage(url.searchParams.get("page"));
          const limit = clampLimit(url.searchParams.get("limit"));
          let includeBlocked = false;
          if (url.searchParams.get("includeBlocked") === "1") {
            try {
              await requireAdmin(request);
              includeBlocked = true;
            } catch {
              includeBlocked = false;
            }
          }
          const cacheHeaders = includeBlocked
            ? { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
            : {
                "Cache-Control":
                  "public, max-age=60, s-maxage=86400, stale-while-revalidate=604800",
              };

          return json(
            {
              ok: true,
              ...(await listDreams({ q, keyword, category, letter, page, limit, includeBlocked })),
            },
            { headers: cacheHeaders },
          );
        } catch (error) {
          return json(
            {
              ok: false,
              error: friendlyErrorMessage(error, "โหลดข้อมูลทำนายฝันไม่สำเร็จ"),
            },
            { status: 502 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const user = await requireAdmin(request);
          const dream = normalizeDream(await request.json());
          const result = await saveDream(dream);
          await saveContentAuditEvent({
            request,
            user,
            action: "update",
            tableName: "dreams",
            recordId: dream.id,
            summary: dream.keyword,
            metadata: { letter: dream.letter, category: dream.category },
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "บันทึกคำฝันไม่สำเร็จ");
          return json(
            { ok: false, error: message },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          const user = await requireAdmin(request);
          const id = new URL(request.url).searchParams.get("id");
          if (!id) return json({ ok: false, error: "Missing id" }, { status: 400 });
          const result = await deleteDream(id);
          await saveContentAuditEvent({
            request,
            user,
            action: "delete",
            tableName: "dreams",
            recordId: id,
            summary: `Deleted dream ${id}`,
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "ลบคำฝันไม่สำเร็จ");
          return json(
            { ok: false, error: message },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
    },
  },
});
