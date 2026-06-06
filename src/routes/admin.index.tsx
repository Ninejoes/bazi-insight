import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () =>
    seo({
      title: "Admin Dashboard",
      description: "แดชบอร์ดระบบหลังบ้าน Likhitfa",
      path: "/admin",
      noindex: true,
    }),
  component: AdminDashboard,
});

const kpis = [
  { label: "ผู้ใช้งานทั้งหมด", value: "12,482", delta: "+8.2%" },
  { label: "การดูดวงวันนี้", value: "1,284", delta: "+12.4%" },
  { label: "สมาชิกใหม่สัปดาห์นี้", value: "342", delta: "+4.1%" },
  { label: "บทความที่เผยแพร่", value: "86", delta: "+2" },
];

const topPages = [
  { page: "/tarot/daily", views: 4820, pct: 92 },
  { page: "/tarot/love", views: 3210, pct: 70 },
  { page: "/dream", views: 2980, pct: 64 },
  { page: "/bazi", views: 2410, pct: 55 },
  { page: "/tarot/finance", views: 1680, pct: 42 },
  { page: "/tarot/monthly", views: 1320, pct: 32 },
  { page: "/articles", views: 980, pct: 24 },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="glass-strong rounded-2xl p-5">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-2 font-display text-3xl text-foreground">{k.value}</div>
            <div className="mt-1 text-xs text-emerald-300">{k.delta} จากสัปดาห์ที่แล้ว</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-strong rounded-3xl p-6 lg:col-span-2">
          <h2 className="font-display text-xl text-foreground">การเข้าชม 7 วันล่าสุด</h2>
          <div className="mt-5 flex h-48 items-end gap-2">
            {[42, 56, 38, 71, 64, 88, 76].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-gold opacity-80"
                  style={{ height: `${v}%` }}
                />
                <div className="text-[10px] text-muted-foreground">
                  {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6">
          <h2 className="font-display text-xl text-foreground">การกระจายของบริการ</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "ไพ่ยิปซี", pct: 54, color: "bg-gradient-gold" },
              { label: "ปาจื้อ", pct: 28, color: "bg-emerald-400/80" },
              { label: "ทำนายฝัน", pct: 18, color: "bg-sky-400/80" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="text-gold">{s.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-card">
                  <div className={`h-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">หน้าที่มีผู้เข้าชมมากที่สุด</h2>
        <table className="mt-5 w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-gold/10">
              <th className="py-3">หน้า</th>
              <th className="py-3">การเข้าชม</th>
              <th className="py-3 w-1/3">สัดส่วน</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map((p) => (
              <tr key={p.page} className="border-b border-gold/5">
                <td className="py-3 text-foreground font-mono text-xs">{p.page}</td>
                <td className="py-3 text-foreground">{p.views.toLocaleString()}</td>
                <td className="py-3">
                  <div className="h-2 overflow-hidden rounded-full bg-card">
                    <div className="h-full bg-gradient-gold" style={{ width: `${p.pct}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
