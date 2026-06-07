import { createFileRoute } from "@tanstack/react-router";
import { json, supabaseRequest, getSupabaseConfig } from "@/lib/supabase-rest";
import { articles as articleSeed } from "@/lib/articles";
import { dreamSeed } from "@/lib/admin-content";

type Kpi = { label: string; value: string; delta: string };
type TopPage = { page: string; views: number; pct: number };
type ServiceShare = { label: string; pct: number; color: string };

const fallbackVisits = [42, 56, 38, 71, 64, 88, 76];
const fallbackTopPages: TopPage[] = [
  { page: "/tarot/daily", views: 0, pct: 92 },
  { page: "/tarot/love", views: 0, pct: 70 },
  { page: "/dream", views: 0, pct: 64 },
  { page: "/bazi", views: 0, pct: 55 },
  { page: "/articles", views: 0, pct: 24 },
];

async function countTable(table: string) {
  try {
    const response = await supabaseRequest(`${table}?select=*`, {
      method: "HEAD",
      headers: { Prefer: "count=exact" },
    });
    if (!response) return 0;
    const range = response.headers.get("content-range") || "";
    return Number(range.split("/")[1] || 0);
  } catch {
    return 0;
  }
}

async function countUsers() {
  const config = getSupabaseConfig();
  if (!config) return 1;

  const response = await fetch(`${config.url}/auth/v1/admin/users?per_page=1`, {
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
    },
  });
  if (!response.ok) return 0;
  const total = response.headers.get("x-total-count");
  if (total) return Number(total);
  const data = (await response.json().catch(() => ({}))) as { users?: unknown[] };
  return data.users?.length || 0;
}

async function loadDashboard() {
  const configured = Boolean(getSupabaseConfig());

  if (!configured) {
    const articles = articleSeed.length;
    const dreams = dreamSeed.length;
    const readings = dreams + articles;

    return {
      source: "memory",
      kpis: [
        { label: "ผู้ใช้งานทั้งหมด", value: "1", delta: "local dev admin user" },
        { label: "ข้อมูลทำนายฝัน", value: dreams.toLocaleString(), delta: "local fallback" },
        { label: "ข้อความติดต่อ", value: "0", delta: "local fallback" },
        { label: "บทความที่เผยแพร่", value: articles.toLocaleString(), delta: "local fallback" },
      ],
      visits: fallbackVisits,
      services: [
        {
          label: "ไพ่ยิปซี",
          pct: readings ? Math.round((articles / readings) * 100) : 0,
          color: "bg-gradient-gold",
        },
        { label: "ปาจื้อ", pct: 0, color: "bg-emerald-400/80" },
        {
          label: "ทำนายฝัน",
          pct: readings ? Math.round((dreams / readings) * 100) : 0,
          color: "bg-sky-400/80",
        },
      ],
      topPages: fallbackTopPages.map((page) => ({
        ...page,
        views: page.page === "/articles" ? articles : page.page === "/dream" ? dreams : 0,
      })),
    };
  }

  try {
    const [users, articles, dreams, baziLeads, messages] = await Promise.all([
      countUsers(),
      countTable("articles"),
      countTable("dreams"),
      countTable("leads"),
      countTable("contact_messages"),
    ]);

    const readings = dreams + articles + baziLeads;
    const kpis: Kpi[] = [
      {
        label: "ผู้ใช้งานทั้งหมด",
        value: users.toLocaleString(),
        delta: "ข้อมูลจาก Supabase Auth",
      },
      { label: "ข้อมูลทำนายฝัน", value: dreams.toLocaleString(), delta: "จากตาราง dreams" },
      { label: "ข้อความติดต่อ", value: messages.toLocaleString(), delta: "จากฟอร์ม contact" },
      { label: "บทความที่เผยแพร่", value: articles.toLocaleString(), delta: "จากตาราง articles" },
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
      source: configured ? "supabase" : "memory",
      kpis,
      visits: fallbackVisits,
      services,
      topPages: fallbackTopPages.map((page) => ({
        ...page,
        views:
          page.page === "/articles"
            ? articles
            : page.page === "/dream"
              ? dreams
              : page.page === "/bazi"
                ? baziLeads
                : 0,
      })),
    };
  } catch (error) {
    return {
      source: "fallback",
      error: configured && error instanceof Error ? error.message : undefined,
      kpis: [
        { label: "ผู้ใช้งานทั้งหมด", value: "0", delta: "รอเชื่อม Supabase" },
        { label: "ข้อมูลทำนายฝัน", value: "0", delta: "รอตาราง dreams" },
        { label: "ข้อความติดต่อ", value: "0", delta: "รอตาราง contact_messages" },
        { label: "บทความที่เผยแพร่", value: "0", delta: "รอตาราง articles" },
      ],
      visits: fallbackVisits,
      services: [
        { label: "ไพ่ยิปซี", pct: 0, color: "bg-gradient-gold" },
        { label: "ปาจื้อ", pct: 0, color: "bg-emerald-400/80" },
        { label: "ทำนายฝัน", pct: 0, color: "bg-sky-400/80" },
      ],
      topPages: fallbackTopPages,
    };
  }
}

export const Route = createFileRoute("/api/dashboard")({
  server: {
    handlers: {
      OPTIONS: async () => json(null, { status: 204 }),
      GET: async () => json({ ok: true, ...(await loadDashboard()) }),
    },
  },
});
