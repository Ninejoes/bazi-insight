import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useState } from "react";
import { articles as seed, type Article } from "@/lib/articles";

export const Route = createFileRoute("/admin/articles")({
  head: () =>
    seo({
      title: "จัดการบทความ — Admin",
      description: "เพิ่ม แก้ไข ลบ และจัดการบทความในระบบหลังบ้าน",
      path: "/admin/articles",
      noindex: true,
    }),
  component: AdminArticles,
});

function AdminArticles() {
  const [items, setItems] = useState<Article[]>(seed);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      const response = await fetch("/api/articles");
      const data = await response.json().catch(() => ({}));
      if (mounted && data.ok) {
        setItems(data.articles || []);
        setNotice(
          data.error
            ? `เชื่อมต่อ Supabase สำหรับบทความไม่ได้: ${data.error}`
            : data.source === "supabase"
              ? "เชื่อมต่อบทความจาก Supabase แล้ว"
              : "",
        );
      }
      if (mounted) setLoading(false);
    }

    void loadArticles();

    return () => {
      mounted = false;
    };
  }, []);

  const reload = async () => {
    const response = await fetch("/api/articles");
    const data = await response.json().catch(() => ({}));
    if (data.ok) {
      setItems(data.articles || []);
      if (data.error) setNotice(`เชื่อมต่อ Supabase สำหรับบทความไม่ได้: ${data.error}`);
    }
  };

  const saveArticle = async (article: Article, message: string) => {
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(data.error || "บันทึกบทความไม่สำเร็จ");
      return;
    }
    await reload();
    setNotice(message);
  };

  const removeArticle = async (slug: string) => {
    const response = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(data.error || "ลบบทความไม่สำเร็จ");
      return;
    }
    await reload();
    setNotice("ลบบทความแล้ว");
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl text-foreground">จัดการบทความ</h1>
          <p className="text-sm text-muted-foreground">เพิ่ม แก้ไข และเผยแพร่บทความ</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="shrink-0 rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
        >
          + เพิ่มบทความ
        </button>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}

      {creating && (
        <Editor
          onClose={() => setCreating(false)}
          title="เพิ่มบทความใหม่"
          onSave={async (article) => {
            await saveArticle(article, "เพิ่มบทความแล้ว และซิงก์ไปหน้า public แล้ว");
            setCreating(false);
          }}
        />
      )}

      <section className="glass-strong max-w-full overflow-x-auto rounded-3xl">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            กำลังโหลดบทความจากระบบกลาง...
          </div>
        ) : null}
        <table className="w-full min-w-[760px] text-sm">
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
                    onClick={() => void removeArticle(a.slug)}
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
          onSave={async (article) => {
            await saveArticle(article, "บันทึกบทความแล้ว และซิงก์ไปหน้า public แล้ว");
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Editor({
  onClose,
  title,
  initial,
  onSave,
}: {
  onClose: () => void;
  title: string;
  initial?: Article;
  onSave: (article: Article) => void | Promise<void>;
}) {
  const makeSlug = (titleValue: string) =>
    titleValue
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9ก-๙-]/g, "")
      .slice(0, 80) || `article-${Date.now()}`;

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
            const form = new FormData(e.currentTarget);
            const titleValue = String(form.get("title") || "").trim();
            onSave({
              slug: initial?.slug || makeSlug(titleValue),
              title: titleValue,
              category: String(form.get("category") || "ปาจื้อ"),
              author: String(form.get("author") || "Admin"),
              cover: String(form.get("cover") || ""),
              excerpt: String(form.get("excerpt") || ""),
              content: String(form.get("content") || "")
                .split(/\n\s*\n/)
                .map((part) => part.trim())
                .filter(Boolean),
              date: initial?.date || new Date().toISOString().slice(0, 10),
              readMin: initial?.readMin || 3,
            });
          }}
          className="mt-5 space-y-4"
        >
          <input
            name="title"
            className="input-styled"
            placeholder="หัวข้อ"
            defaultValue={initial?.title}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select name="category" className="input-styled" defaultValue={initial?.category}>
              <option>ปาจื้อ</option>
              <option>ไพ่ยิปซี</option>
              <option>ทำนายฝัน</option>
            </select>
            <input
              name="author"
              className="input-styled"
              placeholder="ผู้เขียน"
              defaultValue={initial?.author || "Admin"}
            />
          </div>
          <input
            name="cover"
            className="input-styled"
            placeholder="URL รูปปก"
            defaultValue={initial?.cover}
          />
          <textarea
            name="excerpt"
            className="input-styled !h-24 py-3"
            placeholder="เนื้อหาย่อ (Excerpt)"
            defaultValue={initial?.excerpt}
          />
          <textarea
            name="content"
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
