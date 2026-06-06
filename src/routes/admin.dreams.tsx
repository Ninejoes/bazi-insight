import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/dreams")({
  head: () => ({ meta: [{ title: "จัดการทำนายฝัน — Admin" }] }),
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

      <section className="glass-strong overflow-hidden rounded-3xl">
        <table className="w-full text-sm">
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
                  <button className="mr-2 rounded-md border border-gold/30 px-2 py-1 text-xs text-gold hover:bg-gold/10">
                    แก้ไข
                  </button>
                  <button
                    onClick={() => setItems((s) => s.filter((x) => x.id !== d.id))}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
          onClick={() => setAdding(false)}
        >
          <div
            className="glass-strong w-full max-w-xl rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl text-foreground">เพิ่มคำฝัน</h2>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setAdding(false);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <input className="input-styled" placeholder="คำที่ค้นหา (เช่น งู)" />
                <input className="input-styled" placeholder="อักษรนำ (ก-ฮ)" maxLength={1} />
              </div>
              <select className="input-styled">
                <option>สัตว์</option>
                <option>คน</option>
                <option>สิ่งของ</option>
                <option>สถานที่</option>
                <option>ธรรมชาติ</option>
                <option>ร่างกาย</option>
              </select>
              <textarea className="input-styled !h-24 py-3" placeholder="คำทำนาย" />
              <input className="input-styled" placeholder="เลขเด็ด (คั่นด้วย ,)" />
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
