import { createFileRoute } from "@tanstack/react-router";
import { siteContentSeed, type SiteContent } from "@/lib/admin-content";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";

type SiteContentRow = {
  id?: string;
  about?: SiteContent["about"];
  contact?: SiteContent["contact"];
};

function normalizeContent(row?: SiteContentRow | Partial<SiteContent>): SiteContent {
  return {
    about: { ...siteContentSeed.about, ...(row?.about || {}) },
    contact: { ...siteContentSeed.contact, ...(row?.contact || {}) },
  };
}

async function loadContent() {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const response = await supabaseRequest("site_content?id=eq.main&select=*&limit=1");
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as SiteContentRow[];
  if (!rows[0]) throw new Error("ไม่พบข้อมูล site_content id=main ใน Supabase");

  return { source: "supabase", content: normalizeContent(rows[0]) };
}

async function saveContent(content: SiteContent) {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const nextContent = normalizeContent(content);

  const response = await supabaseRequest("site_content?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      id: "main",
      about: nextContent.about,
      contact: nextContent.contact,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const rows = (await response.json().catch(() => [])) as SiteContentRow[];
  return { source: "supabase", content: normalizeContent(rows[0] || nextContent) };
}

export const Route = createFileRoute("/api/site-content")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => {
        try {
          return json({ ok: true, ...(await loadContent()) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "โหลดข้อมูลเว็บไซต์ไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = normalizeContent(await request.json());
          return json({ ok: true, ...(await saveContent(body)) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "บันทึกข้อมูลเว็บไซต์ไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
