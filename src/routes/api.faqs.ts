import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { faqSeed, type FAQRecord } from "@/lib/admin-content";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";

type FAQRow = {
  id?: string;
  q?: string;
  a?: string;
  sort_order?: number;
  sortOrder?: number;
};

let memoryFaqs: FAQRecord[] = [...faqSeed];

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
  const configured = Boolean(getSupabaseConfig());
  try {
    const response = await supabaseRequest("faqs?select=*&order=sort_order.asc");
    if (!response) return { source: "memory", faqs: memoryFaqs };
    const rows = (await response.json().catch(() => [])) as FAQRow[];
    return { source: "supabase", faqs: rows.map(normalizeFaq) };
  } catch (error) {
    return {
      source: "memory",
      faqs: memoryFaqs,
      error: configured && error instanceof Error ? error.message : undefined,
    };
  }
}

async function saveFaqs(rows: FAQRow[]) {
  const configured = Boolean(getSupabaseConfig());
  const faqs = rows.map(normalizeFaq);
  memoryFaqs = faqs;

  try {
    const response = await supabaseRequest("faqs?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(faqs.map(toRow)),
    });
    if (!response) return { source: "memory", faqs };
    const saved = (await response.json().catch(() => [])) as FAQRow[];
    return { source: "supabase", faqs: saved.map(normalizeFaq) };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory", faqs };
  }
}

async function deleteFaq(id: string) {
  const configured = Boolean(getSupabaseConfig());
  memoryFaqs = memoryFaqs.filter((item) => item.id !== id);
  try {
    const response = await supabaseRequest(`faqs?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response) return { source: "memory" };
    return { source: "supabase" };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory" };
  }
}

export const Route = createFileRoute("/api/faqs")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => json({ ok: true, ...(await listFaqs()) }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const rows = Array.isArray(body) ? body : body.faqs;
          return json({ ok: true, ...(await saveFaqs(rows || [])) });
        } catch (error) {
          return json(
            { ok: false, error: error instanceof Error ? error.message : "บันทึก FAQ ไม่สำเร็จ" },
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
            { ok: false, error: error instanceof Error ? error.message : "ลบ FAQ ไม่สำเร็จ" },
            { status: 502 },
          );
        }
      },
    },
  },
});
