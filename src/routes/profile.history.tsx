import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { readStoredUserSession } from "@/lib/user-session";
import { useEffect, useState } from "react";

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

function HistoryPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const types = ["ทั้งหมด", "ไพ่ยิปซี", "ปาจื้อ", "ทำนายฝัน"];
  const shown = filter === "ทั้งหมด" ? items : items.filter((i) => i.type === filter);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setLoading(true);
      setError("");
      try {
        const session = readStoredUserSession();
        const response = await fetch("/api/reading-history", {
          headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(friendlyErrorMessage(data.error, "โหลดประวัติการดูดวงไม่สำเร็จ"));
        }
        if (mounted) setItems(data.history || []);
      } catch (loadError) {
        if (mounted) {
          setError(friendlyErrorMessage(loadError, "โหลดประวัติการดูดวงไม่สำเร็จ"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const removeEntry = async (id: string) => {
    const session = readStoredUserSession();
    const response = await fetch(`/api/reading-history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setError(friendlyErrorMessage(data.error, "ลบประวัติไม่สำเร็จ"));
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  };

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

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

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
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  กำลังโหลดประวัติจาก Supabase...
                </td>
              </tr>
            )}
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
                    onClick={() => void removeEntry(e.id)}
                    className="rounded-md border border-rose-400/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {!loading && shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  ไม่มีรายการในฐานข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
