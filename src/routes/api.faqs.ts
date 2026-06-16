import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { type FAQRecord } from "@/lib/admin-content";
import {
  getSupabaseConfig,
  json,
  requireAdmin,
  saveContentAuditEvent,
  supabaseRequest,
} from "@/lib/supabase-rest";
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
          const user = await requireAdmin(request);
          const body = await request.json();
          const rows = (Array.isArray(body) ? body : body.faqs) as FAQRow[] | undefined;
          const faqs = (rows || []).map(normalizeFaq);
          const result = await saveFaqs(faqs);
          await saveContentAuditEvent({
            request,
            user,
            action: "update",
            tableName: "faqs",
            recordId: "bulk",
            summary: `Saved ${faqs.length} FAQ items`,
            metadata: { ids: faqs.map((faq: FAQRecord) => faq.id).slice(0, 50) },
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "บันทึก FAQ ไม่สำเร็จ");
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
          const result = await deleteFaq(id);
          await saveContentAuditEvent({
            request,
            user,
            action: "delete",
            tableName: "faqs",
            recordId: id,
            summary: `Deleted FAQ ${id}`,
          });
          return json({ ok: true, ...result });
        } catch (error) {
          const message = friendlyErrorMessage(error, "ลบ FAQ ไม่สำเร็จ");
          return json(
            { ok: false, error: message },
            { status: message.includes("แอดมิน") || message.includes("session") ? 401 : 502 },
          );
        }
      },
    },
  },
});
