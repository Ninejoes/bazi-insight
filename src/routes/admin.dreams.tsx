import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";

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

type Dream = {
  id: string;
  keyword: string;
  letter: string;
  category: string;
  meaning: string;
  numbers: string;
};

const seed: Dream[] = [
  {
    id: "1",
    keyword: "งู",
    letter: "ง",
    category: "สัตว์",
    meaning: "เนื้อคู่/คนรัก สิ่งศักดิ์สิทธิ์",
    numbers: "06, 56, 89",
  },
  {
    id: "2",
    keyword: "น้ำใส",
    letter: "น",
    category: "สิ่งของ/ธรรมชาติ",
    meaning: "โชคลาภและความสำเร็จ",
    numbers: "12, 21",
  },
  {
    id: "3",
    keyword: "พระสงฆ์",
    letter: "พ",
    category: "คน",
    meaning: "ได้รับการคุ้มครอง สิริมงคล",
    numbers: "09, 99",
  },
  {
    id: "4",
    keyword: "ฟันหัก",
    letter: "ฟ",
    category: "ร่างกาย",
    meaning: "ระวังการสูญเสีย",
    numbers: "13, 31",
  },
  {
    id: "5",
    keyword: "ทอง",
    letter: "ท",
    category: "สิ่งของ",
    meaning: "การเงินดี โชคลาภเข้า",
    numbers: "27, 72",
  },
];

const letters = "กขคงจฉชซญดตถทนบปผฝพฟภมยรลวศษสหฬอฮ".split("");

function AdminDreams() {
  const [items, setItems] = useState(seed);
  const [filterLetter, setFilterLetter] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Dream | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("likhitfa-admin-dreams");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const persist = (next: Dream[], message: string) => {
    setItems(next);
    window.localStorage.setItem("likhitfa-admin-dreams", JSON.stringify(next));
    setNotice(message);
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

      <section className="glass-strong overflow-x-auto rounded-3xl">
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
                    onClick={() =>
                      persist(
                        items.filter((x) => x.id !== d.id),
                        "ลบคำฝันแล้ว",
                      )
                    }
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
          onSave={(dream) => {
            persist([{ ...dream, id: String(Date.now()) }, ...items], "เพิ่มคำฝันแล้ว");
            setAdding(false);
          }}
        />
      )}

      {editing && (
        <DreamEditor
          title={`แก้ไข: ${editing.keyword}`}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(dream) => {
            persist(
              items.map((item) => (item.id === editing.id ? { ...dream, id: editing.id } : item)),
              "บันทึกคำฝันแล้ว",
            );
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
  onSave: (dream: Dream) => void;
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
