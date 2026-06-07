import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/profile/history")({
  head: () =>
    seo({
      title: "ประวัติการดูดวง",
      description: "ประวัติการดูดวงส่วนตัวของผู้ใช้งาน Likhitfa",
      path: "/profile/history",
      noindex: true,
    }),
  component: HistoryPage,
});

type Entry = { id: string; type: string; title: string; date: string; result: string };
const initial: Entry[] = [
  {
    id: "1",
    type: "ไพ่ยิปซี",
    title: "ความรัก",
    date: "2025-12-06 14:22",
    result: "Six of Cups · The Lovers",
  },
  {
    id: "2",
    type: "ปาจื้อ",
    title: "พยากรณ์ปี 2025",
    date: "2025-12-05 09:11",
    result: "ธาตุไฟแกร่ง",
  },
  { id: "3", type: "ทำนายฝัน", title: "ฝันเห็นงู", date: "2025-12-03 22:40", result: "เลข 56, 89" },
  {
    id: "4",
    type: "ไพ่ยิปซี",
    title: "การงาน",
    date: "2025-12-01 10:02",
    result: "King of Pentacles",
  },
  { id: "5", type: "ไพ่ยิปซี", title: "รายวัน", date: "2025-11-29 08:30", result: "The Sun" },
];

function HistoryPage() {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState("ทั้งหมด");
  const types = ["ทั้งหมด", "ไพ่ยิปซี", "ปาจื้อ", "ทำนายฝัน"];
  const shown = filter === "ทั้งหมด" ? items : items.filter((i) => i.type === filter);

  return (
    <section className="glass-strong rounded-3xl p-6 shadow-elegant">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-foreground">ประวัติการดูดวง</h2>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                filter === t
                  ? "bg-gradient-gold text-primary-foreground"
                  : "border border-gold/20 text-muted-foreground hover:text-gold"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-gold/10">
              <th className="px-3 py-3">ประเภท</th>
              <th className="px-3 py-3">หัวข้อ</th>
              <th className="px-3 py-3">วันที่</th>
              <th className="px-3 py-3">ผลที่ได้</th>
              <th className="px-3 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id} className="border-b border-gold/5 hover:bg-gold/5">
                <td className="px-3 py-3">
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold">
                    {e.type}
                  </span>
                </td>
                <td className="px-3 py-3 text-foreground">{e.title}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{e.date}</td>
                <td className="px-3 py-3 text-xs text-gold/90">{e.result}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => setItems((s) => s.filter((x) => x.id !== e.id))}
                    className="rounded-md border border-rose-400/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  ไม่มีรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
