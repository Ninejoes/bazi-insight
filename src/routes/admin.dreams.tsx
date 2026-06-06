import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";
import { dreamSeed as seed, type DreamRecord as Dream } from "@/lib/admin-content";

export const Route = createFileRoute("/admin/dreams")({
  head: () =>
    seo({
      title: "จัดการทำนายฝัน — Admin",
      description: "เพิ่ม แก้ไข และลบคำฝัน เลขนำโชค และคำทำนายในระบบหลังบ้าน",
      path: "/admin/dreams",
      noindex: true,
    }),
  component: AdminDreams,
});

const letters = "กขคงจฉชซญดตถทนบปผฝพฟภมยรลวศษสหฬอฮ".split("");

function AdminDreams() {
  const [items, setItems] = useState(seed);
  const [filterLetter, setFilterLetter] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Dream | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDreams() {
      const response = await fetch("/api/dreams");
      const data = await response.json().catch(() => ({}));
      if (mounted && data.ok) {
        setItems(data.dreams || seed);
        setNotice(
          data.error
            ? `เชื่อมต่อ Supabase สำหรับทำนายฝันไม่ได้: ${data.error}`
            : data.source === "supabase"
              ? "เชื่อมต่อข้อมูลทำนายฝันจาก Supabase แล้ว"
              : "",
        );
      }
      if (mounted) setLoading(false);
    }

    void loadDreams();

    return () => {
      mounted = false;
    };
  }, []);

  const reload = async () => {
    const response = await fetch("/api/dreams");
    const data = await response.json().catch(() => ({}));
    if (data.ok) setItems(data.dreams || seed);
    if (data.error) setNotice(`เชื่อมต่อ Supabase สำหรับทำนายฝันไม่ได้: ${data.error}`);
  };

  const saveDream = async (dream: Dream, message: string) => {
    const response = await fetch("/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dream),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(data.error || "บันทึกคำฝันไม่สำเร็จ");
      return;
    }
    await reload();
    setNotice(message);
  };

  const removeDream = async (id: string) => {
    const response = await fetch(`/api/dreams?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(data.error || "ลบคำฝันไม่สำเร็จ");
      return;
    }
    await reload();
    setNotice("ลบคำฝันแล้ว");
  };

  const shown = filterLetter ? items.filter((i) => i.letter === filterLetter) : items;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">ทำนายฝัน</h1>
          <p className="text-sm text-muted-foreground">เพิ่ม แก้ไข ลบคำฝัน หมวดหมู่ และเลขเด็ด</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          + เพิ่มคำฝัน
        </button>
      </div>

      <section className="glass rounded-2xl p-4">
        <div className="text-xs text-muted-foreground mb-2">กรองตามอักษร ก-ฮ</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterLetter(null)}
            className={`rounded-md border px-2.5 py-1 text-xs ${!filterLetter ? "border-gold bg-gold/15 text-gold" : "border-gold/20 text-muted-foreground hover:text-gold"}`}
          >
            ทั้งหมด
          </button>
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => setFilterLetter(l)}
              className={`rounded-md border px-2.5 py-1 text-xs ${filterLetter === l ? "border-gold bg-gold/15 text-gold" : "border-gold/20 text-muted-foreground hover:text-gold"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}

      <section className="glass-strong max-w-full overflow-x-auto rounded-3xl">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            กำลังโหลดข้อมูลทำนายฝันจากระบบกลาง...
          </div>
        ) : null}
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-gold/10">
              <th className="px-4 py-3">คำฝัน</th>
              <th className="px-4 py-3">อักษร</th>
              <th className="px-4 py-3">หมวดหมู่</th>
              <th className="px-4 py-3">คำทำนาย</th>
              <th className="px-4 py-3">เลขเด็ด</th>
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => (
              <tr key={d.id} className="border-b border-gold/5 hover:bg-gold/5">
                <td className="px-4 py-3 text-foreground">{d.keyword}</td>
                <td className="px-4 py-3 text-gold">{d.letter}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.category}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.meaning}</td>
                <td className="px-4 py-3 text-xs font-mono text-gold">{d.numbers}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(d)}
                    className="mr-2 rounded-md border border-gold/30 px-2 py-1 text-xs text-gold hover:bg-gold/10"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => void removeDream(d.id)}
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

      {adding && (
        <DreamEditor
          title="เพิ่มคำฝัน"
          onClose={() => setAdding(false)}
          onSave={async (dream) => {
            await saveDream({ ...dream, id: String(Date.now()) }, "เพิ่มคำฝันแล้ว");
            setAdding(false);
          }}
        />
      )}

      {editing && (
        <DreamEditor
          title={`แก้ไข: ${editing.keyword}`}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (dream) => {
            await saveDream({ ...dream, id: editing.id }, "บันทึกคำฝันแล้ว");
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function DreamEditor({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: Dream;
  onClose: () => void;
  onSave: (dream: Dream) => void | Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-xl rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const keyword = String(form.get("keyword") || "").trim();
            onSave({
              id: initial?.id || "",
              keyword,
              letter: String(form.get("letter") || keyword.charAt(0)).slice(0, 1),
              category: String(form.get("category") || "สิ่งของ"),
              meaning: String(form.get("meaning") || ""),
              numbers: String(form.get("numbers") || ""),
              time: String(form.get("time") || "ไม่ระบุ"),
              advice: String(form.get("advice") || ""),
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              name="keyword"
              className="input-styled"
              placeholder="คำที่ค้นหา (เช่น งู)"
              defaultValue={initial?.keyword}
              required
            />
            <input
              name="letter"
              className="input-styled"
              placeholder="อักษรนำ (ก-ฮ)"
              maxLength={1}
              defaultValue={initial?.letter}
              required
            />
          </div>
          <select name="category" className="input-styled" defaultValue={initial?.category}>
            <option>สัตว์</option>
            <option>คน</option>
            <option>สิ่งของ</option>
            <option>สถานที่</option>
            <option>ธรรมชาติ</option>
            <option>ร่างกาย</option>
          </select>
          <textarea
            name="meaning"
            className="input-styled !h-24 py-3"
            placeholder="คำทำนาย"
            defaultValue={initial?.meaning}
            required
          />
          <input
            name="numbers"
            className="input-styled"
            placeholder="เลขเด็ด (คั่นด้วย ,)"
            defaultValue={initial?.numbers}
          />
          <input
            name="time"
            className="input-styled"
            placeholder="ช่วงเวลาฝัน"
            defaultValue={initial?.time}
          />
          <textarea
            name="advice"
            className="input-styled !h-24 py-3"
            placeholder="วิธีแก้เคล็ด / คำแนะนำ"
            defaultValue={initial?.advice}
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
