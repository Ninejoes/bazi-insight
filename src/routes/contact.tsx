import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "ติดต่อเรา — Likhitfa" },
      { name: "description", content: "ช่องทางติดต่อทีม Likhitfa" },
    ],
  }),
  component: ContactPage,
});

const channels = [
  { icon: "✉", label: "อีเมล", value: "hello@likhitfa.com", link: "mailto:hello@likhitfa.com" },
  { icon: "☎", label: "โทรศัพท์", value: "02-123-4567", link: "tel:021234567" },
  { icon: "✦", label: "Line Official", value: "@likhitfa", link: "#" },
  { icon: "✉", label: "ที่อยู่", value: "ชั้น 12 อาคารฟ้าลิขิต ถ.สุขุมวิท กรุงเทพฯ 10110" },
];

function ContactPage() {
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
            <form onSubmit={(e) => e.preventDefault()} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input-styled" placeholder="ชื่อ" />
                <input className="input-styled" placeholder="อีเมล" type="email" />
              </div>
              <input className="input-styled" placeholder="หัวข้อ" />
              <textarea className="input-styled !h-36 py-3" placeholder="ข้อความ" />
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
              <div className="mt-2 text-sm text-foreground">จันทร์ - ศุกร์ · 09:00 - 18:00</div>
              <div className="text-sm text-muted-foreground">เสาร์ · 10:00 - 16:00</div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
