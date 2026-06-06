import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/help")({
  head: () => ({ meta: [{ title: "ปรับแต่งศูนย์ช่วยเหลือ — Admin" }] }),
  component: AdminHelp,
});

type FAQ = { id: string; q: string; a: string };

const initial: FAQ[] = [
  {
    id: "1",
    q: "การดูดวงในเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
    a: "ฟีเจอร์หลักเปิดให้ใช้ฟรี ฟีเจอร์พรีเมียมจะแจ้งราคาก่อนใช้งาน",
  },
  {
    id: "2",
    q: "ข้อมูลส่วนตัวของฉันปลอดภัยหรือไม่?",
    a: "เราเก็บข้อมูลทั้งหมดด้วยการเข้ารหัส และปฏิบัติตาม PDPA",
  },
  {
    id: "3",
    q: "ฉันสามารถลบบัญชีของฉันได้หรือไม่?",
    a: "ได้ จากหน้า โปรไฟล์ → ตั้งค่าและความเป็นส่วนตัว",
  },
];

function AdminHelp() {
  const [faqs, setFaqs] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("likhitfa-admin-faqs");
    if (saved) setFaqs(JSON.parse(saved));
  }, []);

  const persist = (next: FAQ[], message: string) => {
    setFaqs(next);
    window.localStorage.setItem("likhitfa-admin-faqs", JSON.stringify(next));
    setNotice(message);
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
                onClick={() =>
                  persist(
                    faqs.filter((x) => x.id !== f.id),
                    "ลบคำถามแล้ว",
                  )
                }
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
          onClick={() => persist(faqs, "บันทึกคำถามทั้งหมดแล้ว")}
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
                persist(
                  [
                    ...faqs,
                    {
                      id: String(Date.now()),
                      q: String(form.get("q") || ""),
                      a: String(form.get("a") || ""),
                    },
                  ],
                  "เพิ่มคำถามแล้ว",
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
