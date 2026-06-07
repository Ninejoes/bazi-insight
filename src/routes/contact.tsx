import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { siteContentSeed, type ContactContent } from "@/lib/admin-content";
import { useEffect, useState } from "react";

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
  const [contact, setContact] = useState<ContactContent>(siteContentSeed.contact);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadContact() {
      const response = await fetch("/api/site-content");
      const data = await response.json().catch(() => ({}));
      if (mounted && data.ok) setContact(data.content?.contact || siteContentSeed.contact);
    }

    void loadContact();

    return () => {
      mounted = false;
    };
  }, []);

  const channels = [
    { icon: "✉", label: "อีเมล", value: contact.email, link: `mailto:${contact.email}` },
    { icon: "☎", label: "โทรศัพท์", value: contact.phone, link: `tel:${contact.phone}` },
    { icon: "✦", label: "Line Official", value: contact.line, link: "#" },
    { icon: "✉", label: "ที่อยู่", value: contact.address },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="ติดต่อเรา" subtitleCn="联络" />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-12">
        <section className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">CONTACT</div>
          <h1 className="mt-2 font-display text-5xl text-foreground">ติดต่อเรา</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            ทีมงานพร้อมตอบทุกคำถาม คำแนะนำ และเรื่องร้องเรียน ภายใน 1-2 วันทำการ
          </p>
        </section>

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="glass-strong rounded-3xl p-7">
            <h2 className="font-display text-2xl text-foreground">ส่งข้อความถึงเรา</h2>
            {notice ? <div className="mt-3 text-sm text-emerald-200">{notice}</div> : null}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const response = await fetch("/api/contact-messages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: form.get("name"),
                    email: form.get("email"),
                    subject: form.get("subject"),
                    message: form.get("message"),
                  }),
                });
                const data = await response.json().catch(() => ({}));
                setNotice(
                  data.ok
                    ? "ส่งข้อความแล้ว ทีมงานจะติดต่อกลับ"
                    : data.error || "ส่งข้อความไม่สำเร็จ",
                );
                if (data.ok) e.currentTarget.reset();
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
              <button className="w-full rounded-xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground shadow-gold">
                ส่งข้อความ
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {channels.map((c) => (
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
            ))}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-gold/80">เวลาทำการ</div>
              <div className="mt-2 text-sm text-foreground">{contact.hoursWeekday}</div>
              <div className="text-sm text-muted-foreground">{contact.hoursSaturday}</div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
