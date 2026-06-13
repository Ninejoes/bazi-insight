import { createFileRoute } from "@tanstack/react-router";
import { json, supabaseRequest, getSupabaseConfig } from "@/lib/supabase-rest";
import { friendlyErrorMessage } from "@/lib/friendly-error";

type Kpi = { label: string; value: string; delta: string };
type TopPage = { page: string; views: number; pct: number };
type ServiceShare = { label: string; pct: number; color: string };
type ActivityRow = { created_at?: string; type?: string; source?: string };

const emptyVisits = [0, 0, 0, 0, 0, 0, 0];
const serviceColors: Record<string, string> = {
  ไพ่ยิปซี: "bg-gradient-gold",
  ปาจื้อ: "bg-emerald-400/80",
  ทำนายฝัน: "bg-sky-400/80",
};

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

async function listRows<T>(path: string) {
  const response = await supabaseRequest(path);
  if (!response)
    throw new Error("ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY บน server");
  return (await response.json().catch(() => [])) as T[];
}

function lastSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    return day;
  });
}

function dateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeVisits(rows: ActivityRow[]) {
  const days = lastSevenDays();
  const counts = days.map((day) => {
    const key = dateKey(day);
    return rows.filter((row) => dateKey(row.created_at || "") === key).length;
  });
  const max = Math.max(...counts, 0);
  return max ? counts.map((count) => Math.max(4, Math.round((count / max) * 100))) : emptyVisits;
}

function serviceShares(historyRows: ActivityRow[], fallback: { articles: number; dreams: number; baziLeads: number }) {
  const counts: Record<string, number> = {
    ไพ่ยิปซี: 0,
    ปาจื้อ: 0,
    ทำนายฝัน: 0,
  };

  for (const row of historyRows) {
    const value = String(row.type || row.source || "").toLowerCase();
    if (value.includes("ไพ่") || value.includes("tarot")) counts["ไพ่ยิปซี"] += 1;
    else if (value.includes("ปาจื้อ") || value.includes("bazi")) counts["ปาจื้อ"] += 1;
    else if (value.includes("ฝัน") || value.includes("dream")) counts["ทำนายฝัน"] += 1;
  }

  if (!Object.values(counts).some(Boolean)) {
    counts["ไพ่ยิปซี"] = fallback.articles;
    counts["ปาจื้อ"] = fallback.baziLeads;
    counts["ทำนายฝัน"] = fallback.dreams;
  }

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return Object.entries(counts).map(([label, value]) => ({
    label,
    pct: total ? Math.round((value / total) * 100) : 0,
    color: serviceColors[label] || "bg-gradient-gold",
  }));
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

  const since = lastSevenDays()[0].toISOString();
  const [historyRows, messageRows, leadRows] = await Promise.all([
    listRows<ActivityRow>(
      `reading_history?select=created_at,type&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc&limit=10000`,
    ),
    listRows<ActivityRow>(
      `contact_messages?select=created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc&limit=10000`,
    ),
    listRows<ActivityRow>(
      `leads?select=created_at,source&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc&limit=10000`,
    ),
  ]);

  const activityRows = [...historyRows, ...messageRows, ...leadRows];
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
  const services: ServiceShare[] = serviceShares(historyRows, { articles, dreams, baziLeads });

  return {
    source: "supabase",
    kpis,
    visits: normalizeVisits(activityRows),
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
              error: friendlyErrorMessage(error, "โหลดแดชบอร์ดไม่สำเร็จ"),
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
