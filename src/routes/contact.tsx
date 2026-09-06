import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { type ContactContent } from "@/lib/admin-content";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { useEffect, useState, type ReactNode } from "react";
import { Mail, Phone, MessageSquare, MapPin, Zap } from "lucide-react";
import { SecurityShield } from "@/components/security-shield";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "ติดต่อเรา",
      description:
        "ติดต่อทีม Likhitfa สำหรับคำถาม ข้อเสนอแนะ การใช้งานระบบดูดวง หรือเรื่องข้อมูลส่วนบุคคล",
      path: "/contact",
      keywords: ["ติดต่อ Likhitfa", "ติดต่อดูดวง", "ลิขิตฟ้า"],
    }),
  component: ContactPage,
});

function ContactPage() {
  const [contact, setContact] = useState<ContactContent | null>(null);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [verifiedData, setVerifiedData] = useState<{ token: string; renderedAt: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadContact() {
      const response = await fetch("/api/site-content");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setLoadError(friendlyErrorMessage(data.error, "โหลดข้อมูลติดต่อไม่สำเร็จ"));
        return;
      }
      setContact(data.content?.contact || null);
    }

    void loadContact();

    return () => {
      mounted = false;
    };
  }, []);

  const channels = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "อีเมล",
      value: contact?.email || "contact@likhitfa.online",
      link: `mailto:${contact?.email || "contact@likhitfa.online"}`,
    },
    contact?.phone && contact.phone.trim() !== "-" && contact.phone.trim() !== ""
      ? { icon: <Phone className="h-5 w-5" />, label: "โทรศัพท์", value: contact.phone, link: `tel:${contact.phone}` }
      : null,
    contact?.line && contact.line.trim() !== "-" && contact.line.trim() !== ""
      ? {
          icon: <MessageSquare className="h-5 w-5" />,
          label: "Line Official",
          value: contact.line,
          link: `https://line.me/ti/p/${contact.line.replace(/^@/, "")}`,
        }
      : null,
    contact?.address && contact.address.trim() !== "-" && contact.address.trim() !== ""
      ? { icon: <MapPin className="h-5 w-5" />, label: "ที่อยู่", value: contact.address, link: undefined }
      : null,
    {
      icon: <Zap className="h-5 w-5" />,
      label: "พาร์ทเนอร์สตูดิโอ",
      value: "NineJoe.online — UX/UI Design, AI Prompts & วอลเปเปอร์",
      link: "https://ninejoe.online",
    },
  ].filter(Boolean) as { icon: ReactNode; label: string; value: string; link?: string }[];

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="ติดต่อเรา" subtitleCn="联络" />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-12">
        <section className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">CONTACT</div>
          <h1 className="mt-2 font-display text-5xl text-foreground">ติดต่อเรา</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            {loadError || "ทีมงานพร้อมตอบทุกคำถาม คำแนะนำ และเรื่องร้องเรียน ภายใน 1-2 วันทำการ"}
          </p>
        </section>

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="glass-strong rounded-3xl p-7">
            <h2 className="font-display text-2xl text-foreground">ส่งข้อความถึงเรา</h2>
            {notice ? <div className="mt-3 text-sm text-emerald-200">{notice}</div> : null}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!verifiedData) {
                  setNotice("กรุณาคลิกยืนยันความปลอดภัย (Likhitfa Shield) ด้านล่างก่อนส่งข้อความ");
                  return;
                }
                setSubmitting(true);
                setNotice("");
                const form = new FormData(e.currentTarget);
                try {
                  const response = await fetch("/api/contact-messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: form.get("name"),
                      email: form.get("email"),
                      subject: form.get("subject"),
                      message: form.get("message"),
                      _hp_website: form.get("_hp_website") || "",
                      _hp_company: form.get("_hp_company") || "",
                      _rendered_at: verifiedData.renderedAt,
                      _shield_token: verifiedData.token,
                    }),
                  });
                  const data = await response.json().catch(() => ({}));
                  setSubmitting(false);
                  if (data.ok) {
                    setNotice("ส่งข้อความเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
                    setVerifiedData(null);
                    e.currentTarget.reset();
                  } else {
                    setNotice(friendlyErrorMessage(data.error, "ส่งข้อความไม่สำเร็จ"));
                  }
                } catch {
                  setSubmitting(false);
                  setNotice("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
                }
              }}
              className="mt-5 space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="name" className="input-styled" placeholder="ชื่อ" required />
                <input
                  name="email"
                  className="input-styled"
                  placeholder="อีเมล"
                  type="email"
                  required
                />
              </div>
              <input name="subject" className="input-styled" placeholder="หัวข้อ" required />
              <textarea
                name="message"
                className="input-styled !h-36 py-3"
                placeholder="ข้อความ"
                required
              />

              <SecurityShield onVerify={setVerifiedData} />

              <button
                type="submit"
                disabled={submitting || !verifiedData}
                className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting
                  ? "กำลังส่งข้อความ..."
                  : !verifiedData
                    ? "กรุณายืนยันความปลอดภัยก่อนส่งข้อความ"
                    : "ส่งข้อความ"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {loadError ? (
              <div className="glass rounded-2xl p-5 text-sm text-rose-200">{loadError}</div>
            ) : null}
            {contact
              ? channels.map((c) => (
                  <a
                    key={c.label}
                    href={c.link ?? "#"}
                    className="glass flex items-center gap-4 rounded-2xl p-5 transition hover:bg-gold/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-xl text-primary-foreground">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gold/80">{c.label}</div>
                      <div className="text-sm text-foreground">{c.value}</div>
                    </div>
                  </a>
                ))
              : null}
            {contact ? (
              <div className="glass rounded-2xl p-5">
                <div className="text-xs uppercase tracking-wider text-gold/80">เวลาทำการ</div>
                <div className="mt-2 text-sm text-foreground">{contact.hoursWeekday}</div>
                <div className="text-sm text-muted-foreground">{contact.hoursSaturday}</div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
