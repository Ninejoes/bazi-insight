import { createFileRoute } from "@tanstack/react-router";
import { siteContentSeed, type SiteContent } from "@/lib/admin-content";
import { getSupabaseConfig, json, supabaseRequest } from "@/lib/supabase-rest";

type SiteContentRow = {
  id?: string;
  about?: SiteContent["about"];
  contact?: SiteContent["contact"];
};

let memoryContent: SiteContent = siteContentSeed;

function normalizeContent(row?: SiteContentRow | Partial<SiteContent>): SiteContent {
  return {
    about: { ...siteContentSeed.about, ...(row?.about || {}) },
    contact: { ...siteContentSeed.contact, ...(row?.contact || {}) },
  };
}

async function loadContent() {
  const configured = Boolean(getSupabaseConfig());
  try {
    const response = await supabaseRequest("site_content?id=eq.main&select=*&limit=1");
    if (!response) return { source: "memory", content: memoryContent };
    const rows = (await response.json().catch(() => [])) as SiteContentRow[];
    const content = normalizeContent(rows[0]);
    return { source: "supabase", content };
  } catch (error) {
    return {
      source: "memory",
      content: memoryContent,
      error: configured && error instanceof Error ? error.message : undefined,
    };
  }
}

async function saveContent(content: SiteContent) {
  const configured = Boolean(getSupabaseConfig());
  memoryContent = normalizeContent(content);

  try {
    const response = await supabaseRequest("site_content?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        id: "main",
        about: memoryContent.about,
        contact: memoryContent.contact,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response) return { source: "memory", content: memoryContent };
    const rows = (await response.json().catch(() => [])) as SiteContentRow[];
    return { source: "supabase", content: normalizeContent(rows[0]) };
  } catch (error) {
    if (configured) throw error;
    return { source: "memory", content: memoryContent };
  }
}

export const Route = createFileRoute("/api/site-content")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => json({ ok: true, ...(await loadContent()) }),
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
