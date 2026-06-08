import { createFileRoute } from "@tanstack/react-router";
import { json, supabaseRequest, getSupabaseConfig } from "@/lib/supabase-rest";

type Kpi = { label: string; value: string; delta: string };
type TopPage = { page: string; views: number; pct: number };
type ServiceShare = { label: string; pct: number; color: string };

const emptyVisits = [0, 0, 0, 0, 0, 0, 0];

async function countTable(table: string) {
  const response = await supabaseRequest(`${table}?select=*`, {
    method: "HEAD",
    headers: { Prefer: "count=exact" },
  });
  if (!response)
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  const range = response.headers.get("content-range") || "";
  return Number(range.split("/")[1] || 0);
}

async function loadDashboard() {
  if (!getSupabaseConfig()) {
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  }

  const [users, articles, dreams, baziLeads, messages, history] = await Promise.all([
    countTable("users"),
    countTable("articles"),
    countTable("dreams"),
    countTable("leads"),
    countTable("contact_messages"),
    countTable("reading_history"),
  ]);

  const readings = dreams + articles + baziLeads;
  const topPagesBase: TopPage[] = [
    { page: "/dream", views: dreams, pct: 0 },
    { page: "/bazi", views: baziLeads, pct: 0 },
    { page: "/articles", views: articles, pct: 0 },
    { page: "/contact", views: messages, pct: 0 },
    { page: "/profile", views: users, pct: 0 },
  ];
  const maxViews = Math.max(...topPagesBase.map((page) => page.views), 0);
  const kpis: Kpi[] = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: users.toLocaleString(),
      delta: "จากตาราง public.users",
    },
    { label: "ข้อมูลทำนายฝัน", value: dreams.toLocaleString(), delta: "จากตาราง dreams" },
    { label: "ข้อความติดต่อ", value: messages.toLocaleString(), delta: "จากฟอร์ม contact" },
    { label: "ประวัติการดูดวง", value: history.toLocaleString(), delta: "จากตาราง reading_history" },
  ];
  const services: ServiceShare[] = [
    {
      label: "ไพ่ยิปซี",
      pct: readings ? Math.round((articles / readings) * 100) : 0,
      color: "bg-gradient-gold",
    },
    {
      label: "ปาจื้อ",
      pct: readings ? Math.round((baziLeads / readings) * 100) : 0,
      color: "bg-emerald-400/80",
    },
    {
      label: "ทำนายฝัน",
      pct: readings ? Math.round((dreams / readings) * 100) : 0,
      color: "bg-sky-400/80",
    },
  ];

  return {
    source: "supabase",
    kpis,
    visits: emptyVisits,
    services,
    topPages: topPagesBase.map((page) => ({
      ...page,
      pct: maxViews ? Math.round((page.views / maxViews) * 100) : 0,
    })),
  };
}

export const Route = createFileRoute("/api/dashboard")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => {
        try {
          return json({ ok: true, ...(await loadDashboard()) });
        } catch (error) {
          return json(
            {
              ok: false,
              error: error instanceof Error ? error.message : "โหลดแดชบอร์ดไม่สำเร็จ",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
