import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useMemo, useRef, useState, useEffect } from "react";
import type { Article } from "@/lib/articles";

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
  const [items, setItems] = useState<Article[]>([]);
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
        setNotice(data.source === "supabase" ? "เชื่อมต่อบทความจาก Supabase แล้ว" : "");
      } else if (mounted) {
        setItems([]);
        setNotice(data.error || "โหลดบทความจาก Supabase ไม่สำเร็จ");
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
    } else {
      setItems([]);
      setNotice(data.error || "โหลดบทความจาก Supabase ไม่สำเร็จ");
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
              <th className="px-4 py-3">SEO</th>
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
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      a.seoTitle && a.seoDescription
                        ? "bg-emerald-400/10 text-emerald-200"
                        : "bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {a.seoTitle && a.seoDescription ? "พร้อม" : "ยังไม่ครบ"}
                  </span>
                </td>
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
        {!loading && items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            ยังไม่มีบทความจาก Supabase
          </div>
        ) : null}
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
  const [titleValue, setTitleValue] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [category, setCategory] = useState(initial?.category || "ปาจื้อ");
  const [author, setAuthor] = useState(initial?.author || "Admin");
  const [cover, setCover] = useState(initial?.cover || "");
  const [coverAlt, setCoverAlt] = useState(initial?.coverAlt || initial?.title || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || initial?.title || "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.seoDescription || initial?.excerpt || "",
  );
  const [keywords, setKeywords] = useState((initial?.keywords || []).join(", "));
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl || "");
  const [content, setContent] = useState(initial?.content?.join("\n\n") || "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const urlPreview = slug || makeSlug(titleValue || "article");
  const readMin = Math.max(
    1,
    Math.ceil(
      content
        .replace(/[#*_>`\-[\]()]/g, " ")
        .split(/\s+/)
        .filter(Boolean).length / 220,
    ),
  );
  const categoryHint = useMemo(
    () =>
      ({
        ปาจื้อ: "เหมาะกับโครง: บทนำ, หลักการ, วิธีอ่านดวง, ตัวอย่าง, ข้อควรระวัง",
        ไพ่ยิปซี: "เหมาะกับโครง: คำถาม, วิธีวางไพ่, ความหมายไพ่, ตัวอย่างการอ่าน",
        ทำนายฝัน: "เหมาะกับโครง: ความหมายฝัน, เลขที่เกี่ยวข้อง, บริบท, คำเตือนการใช้เลข",
      })[category] || "จัดหัวข้อให้ตรงกับเจตนาของบทความ",
    [category],
  );

  const insertMarkdown = (before: string, after = "", placeholder = "ข้อความ") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setContent(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur md:p-6"
      onClick={onClose}
    >
      <div
        className="glass-strong my-4 w-full max-w-6xl rounded-3xl p-5 shadow-elegant md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-foreground">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              ฟอร์มนี้รองรับ Markdown, URL, alt text, meta title, meta description และ keywords
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-gold">
            ×
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const finalTitle = titleValue.trim();
            const finalSlug = slug.trim() || makeSlug(finalTitle);
            onSave({
              slug: finalSlug,
              title: finalTitle,
              category,
              author: author.trim() || "Admin",
              cover: cover.trim(),
              coverAlt: coverAlt.trim() || finalTitle,
              excerpt: excerpt.trim(),
              seoTitle: seoTitle.trim() || finalTitle,
              seoDescription: seoDescription.trim() || excerpt.trim(),
              keywords: keywords
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean),
              canonicalUrl: canonicalUrl.trim(),
              content: content
                .split(/\n\s*\n/)
                .map((part) => part.trim())
                .filter(Boolean),
              date: initial?.date || new Date().toISOString().slice(0, 10),
              readMin,
            });
          }}
          className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-4">
            <input
              className="input-styled"
              placeholder="หัวข้อบทความ"
              value={titleValue}
              onChange={(event) => {
                const next = event.target.value;
                setTitleValue(next);
                if (!initial?.slug) setSlug(makeSlug(next));
                if (!seoTitle || seoTitle === titleValue) setSeoTitle(next);
                if (!coverAlt || coverAlt === titleValue) setCoverAlt(next);
              }}
              required
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                className="input-styled"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>ปาจื้อ</option>
                <option>ไพ่ยิปซี</option>
                <option>ทำนายฝัน</option>
              </select>
              <input
                className="input-styled sm:col-span-2"
                placeholder="ผู้เขียน"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
            </div>
            <div className="rounded-2xl border border-gold/15 bg-gold/5 px-4 py-3 text-xs text-gold/80">
              {categoryHint}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
              <input
                className="input-styled"
                placeholder="URL slug เช่น bazi-101"
                value={slug}
                onChange={(event) => setSlug(makeSlug(event.target.value))}
              />
              <div className="rounded-xl border border-border bg-card/40 px-3 py-2 text-[11px] text-muted-foreground">
                /articles/
                <span className="break-all text-gold">{urlPreview}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input-styled"
                placeholder="URL รูปปก"
                value={cover}
                onChange={(event) => setCover(event.target.value)}
              />
              <input
                className="input-styled"
                placeholder="Alt text รูปปก"
                value={coverAlt}
                onChange={(event) => setCoverAlt(event.target.value)}
              />
            </div>
            <textarea
              className="input-styled !h-24 py-3"
              placeholder="เนื้อหาย่อ (Excerpt)"
              value={excerpt}
              onChange={(event) => {
                const next = event.target.value;
                setExcerpt(next);
                if (!seoDescription || seoDescription === excerpt) setSeoDescription(next);
              }}
            />
            <div className="overflow-hidden rounded-2xl border border-border bg-card/30">
              <div className="flex flex-wrap gap-2 border-b border-border p-2">
                <ToolbarButton
                  label="หัวข้อ"
                  onClick={() => insertMarkdown("## ", "", "หัวข้อย่อย")}
                />
                <ToolbarButton label="ตัวหนา" onClick={() => insertMarkdown("**", "**")} />
                <ToolbarButton label="ตัวเอียง" onClick={() => insertMarkdown("*", "*")} />
                <ToolbarButton
                  label="ลิงก์"
                  onClick={() => insertMarkdown("[", "](https://)", "ข้อความลิงก์")}
                />
                <ToolbarButton label="รายการ" onClick={() => insertMarkdown("- ", "", "รายการ")} />
                <ToolbarButton label="คำคม" onClick={() => insertMarkdown("> ", "", "คำคม")} />
              </div>
              <textarea
                ref={textareaRef}
                className="h-80 w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="เขียนบทความด้วย Markdown เช่น ## หัวข้อ, **ตัวหนา**, *ตัวเอียง*, [ลิงก์](https://...)"
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/30 p-4">
              <h3 className="font-display text-xl text-foreground">SEO</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <input
                    className="input-styled"
                    placeholder="SEO Title"
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                  />
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {seoTitle.length}/60 ตัวอักษร
                  </div>
                </div>
                <div>
                  <textarea
                    className="input-styled !h-24 py-3"
                    placeholder="Meta Description"
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                  />
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {seoDescription.length}/160 ตัวอักษร
                  </div>
                </div>
                <input
                  className="input-styled"
                  placeholder="Keywords คั่นด้วย comma"
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                />
                <input
                  className="input-styled"
                  placeholder="Canonical URL ถ้ามี"
                  value={canonicalUrl}
                  onChange={(event) => setCanonicalUrl(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/30 p-4">
              <h3 className="font-display text-xl text-foreground">Preview</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-gold/15 bg-background/50">
                {cover ? (
                  <img
                    src={cover}
                    alt={coverAlt || titleValue}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
                    ยังไม่มีรูปปก
                  </div>
                )}
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gold">{category}</div>
                  <div className="mt-1 line-clamp-2 font-display text-xl text-foreground">
                    {titleValue || "หัวข้อบทความ"}
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                    {excerpt || "เนื้อหาย่อจะแสดงตรงนี้"}
                  </p>
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    {author || "Admin"} · {readMin} นาที
                  </div>
                </div>
              </div>
            </div>

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
          </aside>
        </form>
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-gold/20 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-gold/50 hover:text-gold"
    >
      {label}
    </button>
  );
}
