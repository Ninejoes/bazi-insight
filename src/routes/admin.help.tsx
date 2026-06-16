import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";
import { type FAQRecord as FAQ } from "@/lib/admin-content";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { adminAuthHeaders } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/help")({
  head: () =>
    seo({
      title: "ปรับแต่งศูนย์ช่วยเหลือ — Admin",
      description: "จัดการคำถามที่พบบ่อยและเนื้อหาศูนย์ช่วยเหลือ",
      path: "/admin/help",
      noindex: true,
    }),
  component: AdminHelp,
});

function AdminHelp() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadFaqs() {
      const response = await fetch("/api/faqs");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setNotice(friendlyErrorMessage(data.error, "โหลด FAQ ไม่สำเร็จ"));
        setLoading(false);
        return;
      }

      if (mounted && data.ok) {
        setFaqs(data.faqs || []);
        setNotice(
          data.error
            ? friendlyErrorMessage(data.error, "เชื่อมต่อศูนย์ช่วยเหลือไม่ได้")
            : data.source === "supabase"
              ? "เชื่อมต่อ FAQ จาก Supabase แล้ว"
              : "",
        );
      }
      if (mounted) setLoading(false);
    }

    void loadFaqs();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (next: FAQ[], message: string) => {
    const normalized = next.map((faq, index) => ({ ...faq, sortOrder: index + 1 }));
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
      body: JSON.stringify({ faqs: normalized }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(friendlyErrorMessage(data.error, "บันทึก FAQ ไม่สำเร็จ"));
      return;
    }
    setFaqs(data.faqs || normalized);
    setNotice(message);
  };

  const removeFaq = async (id: string) => {
    const response = await fetch(`/api/faqs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: adminAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(friendlyErrorMessage(data.error, "ลบ FAQ ไม่สำเร็จ"));
      return;
    }
    setFaqs((items) => items.filter((item) => item.id !== id));
    setNotice("ลบคำถามแล้ว");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">ศูนย์ช่วยเหลือ</h1>
          <p className="text-sm text-muted-foreground">จัดการคำถามที่พบบ่อย</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          + เพิ่มคำถาม
        </button>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gold/10 bg-gold/5 px-4 py-3 text-sm text-muted-foreground">
          กำลังโหลด FAQ จากระบบกลาง...
        </div>
      ) : null}

      <section className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="glass-strong rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <input
                  className="input-styled mb-3"
                  value={f.q}
                  onChange={(e) =>
                    setFaqs((items) =>
                      items.map((item) =>
                        item.id === f.id ? { ...item, q: e.target.value } : item,
                      ),
                    )
                  }
                />
                <textarea
                  className="input-styled !h-24 py-3"
                  value={f.a}
                  onChange={(e) =>
                    setFaqs((items) =>
                      items.map((item) =>
                        item.id === f.id ? { ...item, a: e.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
              <button
                onClick={() => void removeFaq(f.id)}
                className="rounded-md border border-rose-400/30 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => void persist(faqs, "บันทึกคำถามทั้งหมดแล้ว และซิงก์ไปหน้า public แล้ว")}
          className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          บันทึกทั้งหมด
        </button>
      </div>

      {adding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
          onClick={() => setAdding(false)}
        >
          <div
            className="glass-strong w-full max-w-xl rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl text-foreground">เพิ่มคำถาม</h2>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void persist(
                  [
                    ...faqs,
                    {
                      id: String(Date.now()),
                      q: String(form.get("q") || ""),
                      a: String(form.get("a") || ""),
                      sortOrder: faqs.length + 1,
                    },
                  ],
                  "เพิ่มคำถามแล้ว และซิงก์ไปหน้า public แล้ว",
                );
                setAdding(false);
              }}
            >
              <input name="q" className="input-styled" placeholder="คำถาม" required />
              <textarea name="a" className="input-styled !h-32 py-3" placeholder="คำตอบ" required />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-xl border border-gold/20 px-5 py-2 text-sm"
                >
                  ยกเลิก
                </button>
                <button className="rounded-xl bg-gradient-gold px-6 py-2 text-sm font-semibold text-primary-foreground shadow-gold">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
