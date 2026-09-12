import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { faqSeed, type FAQRecord } from "@/lib/admin-content";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { useEffect, useState } from "react";
import { Sparkles, Compass, Settings, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () =>
    seo({
      title: "ศูนย์ช่วยเหลือ",
      description:
        "คำถามที่พบบ่อย คู่มือการใช้งานปาจื้อ ไพ่ยิปซี ทำนายฝัน บัญชีผู้ใช้ และความเป็นส่วนตัว",
      path: "/help",
      keywords: ["ศูนย์ช่วยเหลือ", "วิธีดูดวง", "คำถามที่พบบ่อย", "Likhitfa"],
    }),
  component: HelpPage,
});

const topics = [
  { icon: Sparkles, title: "เริ่มต้นใช้งาน", desc: "สมัครสมาชิก เข้าสู่ระบบ และตั้งค่าโปรไฟล์", keyword: "สมาชิก" },
  { icon: Compass, title: "การดูดวง", desc: "วิธีใช้งานปาจื้อ กราฟชีวิต เซียมซี และไหว้พระ", keyword: "ดูดวง" },
  { icon: Settings, title: "บัญชีและการตั้งค่า", desc: "ความปลอดภัย รหัสผ่าน และประวัติ", keyword: "บัญชี" },
  { icon: ShieldCheck, title: "ความเป็นส่วนตัว", desc: "PDPA การลบข้อมูล และนโยบายความเป็นส่วนตัว", keyword: "PDPA" },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQRecord[]>(faqSeed);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFaqs() {
      const response = await fetch("/api/faqs");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        // Safe fallback to faqSeed
        return;
      }
      if (Array.isArray(data.faqs) && data.faqs.length > 0) {
        setFaqs(data.faqs);
      }
    }

    void loadFaqs();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredFaqs = query.trim()
    ? faqs.filter((faq) => `${faq.q} ${faq.a}`.toLowerCase().includes(query.trim().toLowerCase()))
    : faqs;

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="ศูนย์ช่วยเหลือ" subtitleCn="帮助" />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-12">
        <section className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">HELP CENTER</div>
          <h1 className="mt-2 font-display text-5xl text-foreground">ศูนย์ช่วยเหลือ</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            {error || "ค้นหาคำตอบ หรือเลือกหมวดด้านล่างเพื่อกรองคำถาม"}
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedTopic(null);
              }}
              className="input-styled"
              placeholder="ค้นหา เช่น ดูดวง, สมาชิก, PDPA, ไหว้พระ"
            />
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => {
            const isSelected = selectedTopic === t.title;
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedTopic(null);
                    setQuery("");
                  } else {
                    setSelectedTopic(t.title);
                    setQuery(t.keyword);
                  }
                }}
                className={`flex flex-col text-left rounded-2xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-gold bg-gold/15 shadow-gold scale-[1.02]"
                    : "border-border/60 bg-card/40 hover:border-gold/40 hover:bg-gold/5"
                }`}
              >
                <div className={`mb-2 ${isSelected ? "text-gold" : "text-gold/80"}`}>
                  <t.icon className="h-7 w-7" />
                </div>
                <div className="mt-1 font-display text-lg font-semibold text-foreground flex items-center justify-between w-full">
                  <span>{t.title}</span>
                  {isSelected && <span className="text-[11px] text-gold font-normal">กำลังเลือก</span>}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </button>
            );
          })}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl text-foreground">คำถามที่พบบ่อย</h2>
          <div className="gold-divider my-5 w-24" />
          {error ? (
            <div className="glass rounded-2xl p-5 text-sm text-rose-200">{error}</div>
          ) : null}
          <div className="space-y-3">
            {filteredFaqs.map((f, i) => {
              const o = open === i;
              return (
                <div key={i} className="glass rounded-2xl">
                  <button
                    onClick={() => setOpen(o ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-foreground">{f.q}</span>
                    <span className={`text-gold transition ${o ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {o && (
                    <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12 glass-strong rounded-3xl p-8 text-center">
          <h3 className="font-display text-2xl text-foreground">ยังไม่ได้คำตอบที่ต้องการ?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            ทีมงานพร้อมช่วยเหลือคุณภายใน 1-2 วันทำการ
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-block rounded-xl bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
          >
            ติดต่อทีมงาน
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
