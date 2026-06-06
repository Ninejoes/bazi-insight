import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

      <section className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="glass-strong rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <input className="input-styled mb-3" defaultValue={f.q} />
                <textarea className="input-styled !h-24 py-3" defaultValue={f.a} />
              </div>
              <button
                onClick={() => setFaqs((s) => s.filter((x) => x.id !== f.id))}
                className="rounded-md border border-rose-400/30 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button className="rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
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
                setAdding(false);
              }}
            >
              <input className="input-styled" placeholder="คำถาม" />
              <textarea className="input-styled !h-32 py-3" placeholder="คำตอบ" />
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
