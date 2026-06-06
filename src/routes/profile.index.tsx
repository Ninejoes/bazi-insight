import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "โปรไฟล์ — Likhitfa" }] }),
  component: ProfileOverview,
});

const stats = [
  { label: "ครั้งที่ดูดวง", value: 24 },
  { label: "ไพ่ที่เปิดทั้งหมด", value: 112 },
  { label: "บทความที่บันทึก", value: 7 },
  { label: "วันที่ใช้งานต่อเนื่อง", value: 18 },
];

const shortcuts = [
  { to: "/bazi", label: "ดูดวงปาจื้อ", icon: "命" },
  { to: "/tarot", label: "เปิดไพ่ยิปซี", icon: "塔" },
  { to: "/dream", label: "ทำนายฝัน", icon: "梦" },
];

function ProfileOverview() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-3xl text-gold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-xl text-foreground">เริ่มดูดวงต่อ</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {shortcuts.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="ornate-border flex items-center gap-3 rounded-2xl bg-card/40 p-4 hover:bg-gold/10 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold font-cn text-2xl text-primary-foreground">
                {s.icon}
              </div>
              <div className="font-medium text-foreground">{s.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">ดูดวงล่าสุด</h2>
          <Link to="/profile/history" className="text-xs text-gold hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-gold/10">
          {[
            { title: "ไพ่ยิปซี · ความรัก", time: "วันนี้ 14:22", result: "Six of Cups" },
            { title: "ปาจื้อ · พยากรณ์ปี 2025", time: "เมื่อวาน 09:11", result: "ธาตุไฟแกร่ง" },
            { title: "ทำนายฝัน · งู", time: "3 วันก่อน", result: "เลข 56, 89" },
          ].map((h) => (
            <li key={h.title} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="text-foreground">{h.title}</div>
                <div className="text-xs text-muted-foreground">{h.time}</div>
              </div>
              <div className="text-xs text-gold">{h.result}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
