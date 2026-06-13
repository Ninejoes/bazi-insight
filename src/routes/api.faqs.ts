import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { type FAQRecord } from "@/lib/admin-content";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";
import { friendlyErrorMessage } from "@/lib/friendly-error";

type FAQRow = {
  id?: string;
  q?: string;
  a?: string;
  sort_order?: number;
  sortOrder?: number;
};

function normalizeFaq(row: FAQRow): FAQRecord {
  return {
    id: String(row.id || randomUUID()).slice(0, 80),
    q: String(row.q || "").slice(0, 500),
    a: String(row.a || "").slice(0, 2000),
    sortOrder: Number(row.sortOrder || row.sort_order || 999),
  };
}

function toRow(faq: FAQRecord) {
  return {
    id: faq.id,
    q: faq.q,
    a: faq.a,
    sort_order: faq.sortOrder,
    updated_at: new Date().toISOString(),
  };
}

async function listFaqs() {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest("faqs?select=*&order=sort_order.asc");
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as FAQRow[];
  return { source: "supabase", faqs: rows.map(normalizeFaq) };
}

async function saveFaqs(rows: FAQRow[]) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const faqs = rows.map(normalizeFaq);

  const response = await supabaseRequest("faqs?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(faqs.map(toRow)),
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const saved = (await response.json().catch(() => [])) as FAQRow[];
  return { source: "supabase", faqs: saved.map(normalizeFaq) };
}

async function deleteFaq(id: string) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest(`faqs?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }
  return { source: "supabase" };
}

export const Route = createFileRoute("/api/faqs")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => {
        try {
          return json({ ok: true, ...(await listFaqs()) });
        } catch (error) {
          return json(
            { ok: false, error: friendlyErrorMessage(error, "โหลด FAQ ไม่สำเร็จ") },
            { status: 502 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const rows = Array.isArray(body) ? body : body.faqs;
          return json({ ok: true, ...(await saveFaqs(rows || [])) });
        } catch (error) {
          return json(
            { ok: false, error: friendlyErrorMessage(error, "บันทึก FAQ ไม่สำเร็จ") },
            { status: 502 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          const id = new URL(request.url).searchParams.get("id");
          if (!id) return json({ ok: false, error: "Missing id" }, { status: 400 });
          return json({ ok: true, ...(await deleteFaq(id)) });
        } catch (error) {
          return json(
            { ok: false, error: friendlyErrorMessage(error, "ลบ FAQ ไม่สำเร็จ") },
            { status: 502 },
          );
        }
      },
    },
  },
});
