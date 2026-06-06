import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { articles as seed, type Article } from "@/lib/articles";

export const Route = createFileRoute("/admin/articles")({
  head: () => ({ meta: [{ title: "จัดการบทความ — Admin" }] }),
  component: AdminArticles,
});

function AdminArticles() {
  const [items, setItems] = useState(seed);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">จัดการบทความ</h1>
          <p className="text-sm text-muted-foreground">เพิ่ม แก้ไข และเผยแพร่บทความ</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          + เพิ่มบทความ
        </button>
      </div>

      {creating && <Editor onClose={() => setCreating(false)} title="เพิ่มบทความใหม่" />}

      <section className="glass-strong overflow-hidden rounded-3xl">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-gold/10">
              <th className="px-4 py-3">หัวข้อ</th>
              <th className="px-4 py-3">หมวด</th>
              <th className="px-4 py-3">ผู้เขียน</th>
              <th className="px-4 py-3">วันที่</th>
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.slug} className="border-b border-gold/5 hover:bg-gold/5">
                <td className="px-4 py-3 text-foreground">{a.title}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold">
                    {a.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.author}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.date}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(a.slug)}
                    className="mr-2 rounded-md border border-gold/30 px-2 py-1 text-xs text-gold hover:bg-gold/10"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => setItems((s) => s.filter((x) => x.slug !== a.slug))}
                    className="rounded-md border border-rose-400/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-400/10"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editing && (
        <Editor
          onClose={() => setEditing(null)}
          title={`แก้ไข: ${items.find((x) => x.slug === editing)?.title}`}
          initial={items.find((x) => x.slug === editing)}
        />
      )}
    </div>
  );
}

function Editor({
  onClose,
  title,
  initial,
}: {
  onClose: () => void;
  title: string;
  initial?: Article;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-2xl rounded-3xl p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-foreground">{title}</h2>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-gold">
            ×
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="mt-5 space-y-4"
        >
          <input className="input-styled" placeholder="หัวข้อ" defaultValue={initial?.title} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input-styled" defaultValue={initial?.category}>
              <option>ปาจื้อ</option>
              <option>ไพ่ยิปซี</option>
              <option>ทำนายฝัน</option>
            </select>
            <input className="input-styled" placeholder="ผู้เขียน" defaultValue={initial?.author} />
          </div>
          <input className="input-styled" placeholder="URL รูปปก" defaultValue={initial?.cover} />
          <textarea
            className="input-styled !h-24 py-3"
            placeholder="เนื้อหาย่อ (Excerpt)"
            defaultValue={initial?.excerpt}
          />
          <textarea
            className="input-styled !h-56 py-3"
            placeholder="เนื้อหาบทความ (Markdown)"
            defaultValue={initial?.content?.join("\n\n")}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
}
