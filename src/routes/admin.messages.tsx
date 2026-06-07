import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/messages")({
  head: () =>
    seo({
      title: "ข้อความติดต่อ — Admin",
      description: "อ่านข้อความที่ส่งจากฟอร์มติดต่อ Likhitfa",
      path: "/admin/messages",
      noindex: true,
    }),
  component: AdminMessages,
});

const ADMIN_SESSION_KEY = "likhitfa-admin-session-v2";
const statuses = [
  { value: "all", label: "ทั้งหมด" },
  { value: "new", label: "ใหม่" },
  { value: "read", label: "อ่านแล้ว" },
  { value: "replied", label: "ตอบแล้ว" },
  { value: "archived", label: "เก็บถาวร" },
] as const;

type Status = (typeof statuses)[number]["value"];
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: Exclude<Status, "all">;
  created_at: string;
  updated_at: string;
};

function adminHeaders(): Record<string, string> {
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  const session = raw ? JSON.parse(raw) : null;
  return session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
}

function statusLabel(status: ContactMessage["status"]) {
  return statuses.find((item) => item.value === status)?.label || status;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminMessages() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [status, setStatus] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/contact-messages", {
        headers: adminHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "โหลดข้อความไม่สำเร็จ");

      const messages = (data.messages || []) as ContactMessage[];
      setItems(messages);
      setSelected((current) => {
        if (!current) return messages[0] || null;
        return messages.find((item) => item.id === current.id) || messages[0] || null;
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "โหลดข้อความไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [items, search, status]);

  const updateStatus = async (message: ContactMessage, nextStatus: ContactMessage["status"]) => {
    const response = await fetch("/api/contact-messages", {
      method: "PUT",
      headers: {
        ...adminHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: message.id, status: nextStatus }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setNotice(data.error || "อัปเดตข้อความไม่สำเร็จ");
      return;
    }

    const nextMessage = data.message as ContactMessage;
    setItems((current) => current.map((item) => (item.id === nextMessage.id ? nextMessage : item)));
    setSelected(nextMessage);
    setNotice(`อัปเดตสถานะเป็น ${statusLabel(nextMessage.status)} แล้ว`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">ข้อความ</h1>
          <p className="text-sm text-muted-foreground">
            อ่านข้อมูลจริงจากฟอร์มติดต่อในหน้า /contact และบันทึกใน Supabase
          </p>
        </div>
        <button
          onClick={() => void loadMessages()}
          className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10"
        >
          รีเฟรชข้อความ
        </button>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <input
          className="input-styled"
          placeholder="ค้นหาชื่อ อีเมล หัวข้อ หรือข้อความ"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="input-styled"
          value={status}
          onChange={(event) => setStatus(event.target.value as Status)}
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-gold/10 bg-gold/5 p-6 text-sm text-muted-foreground">
          กำลังโหลดข้อความจาก Supabase...
        </div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-3xl border border-gold/10 bg-card/70 p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีข้อความติดต่อ
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <div className="space-y-3">
            {filtered.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelected(message)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected?.id === message.id
                    ? "border-gold/50 bg-gold/10"
                    : "border-gold/10 bg-card/70 hover:border-gold/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {message.subject}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {message.name} · {message.email}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold">
                    {statusLabel(message.status)}
                  </span>
                </div>
                <div className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                  {message.message}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  {formatDate(message.created_at)}
                </div>
              </button>
            ))}
          </div>

          <article className="glass-strong rounded-3xl p-6">
            {selected ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-gold/70">
                      CONTACT MESSAGE
                    </div>
                    <h2 className="mt-2 font-display text-2xl text-foreground">
                      {selected.subject}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ส่งเมื่อ {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <select
                    className="input-styled w-full lg:w-48"
                    value={selected.status}
                    onChange={(event) =>
                      void updateStatus(selected, event.target.value as ContactMessage["status"])
                    }
                  >
                    {statuses
                      .filter((item) => item.value !== "all")
                      .map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="ชื่อ" value={selected.name} />
                  <Info label="อีเมล" value={selected.email} />
                </div>

                <div className="rounded-2xl border border-gold/10 bg-[oklch(0.10_0.018_260)] p-5">
                  <div className="mb-2 text-xs text-muted-foreground">ข้อความ</div>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {selected.message}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                    className="rounded-xl bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold"
                  >
                    ตอบทางอีเมล
                  </a>
                  <button
                    onClick={() => void updateStatus(selected, "archived")}
                    className="rounded-xl border border-gold/20 px-4 py-2 text-sm text-gold hover:bg-gold/10"
                  >
                    เก็บถาวร
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                เลือกข้อความเพื่ออ่านรายละเอียด
              </div>
            )}
          </article>
        </section>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gold/10 bg-[oklch(0.10_0.018_260)] p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm text-foreground">{value}</div>
    </div>
  );
}
