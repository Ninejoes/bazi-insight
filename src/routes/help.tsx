import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "ศูนย์ช่วยเหลือ — Likhitfa" },
      { name: "description", content: "คำถามที่พบบ่อยและคู่มือการใช้งาน" },
    ],
  }),
  component: HelpPage,
});

const topics = [
  { icon: "✦", title: "เริ่มต้นใช้งาน", desc: "สมัครสมาชิก เข้าสู่ระบบ และตั้งค่าโปรไฟล์" },
  { icon: "☷", title: "การดูดวง", desc: "วิธีใช้งานปาจื้อ ไพ่ยิปซี และทำนายฝัน" },
  { icon: "⚙", title: "บัญชีและการตั้งค่า", desc: "ความปลอดภัย รหัสผ่าน และการแจ้งเตือน" },
  { icon: "♢", title: "ความเป็นส่วนตัว", desc: "PDPA, การลบข้อมูล และนโยบายความเป็นส่วนตัว" },
];

const faqs = [
  {
    q: "การดูดวงในเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
    a: "ฟีเจอร์หลักทั้งหมดเปิดให้ใช้ฟรี ฟีเจอร์พรีเมียมบางส่วนจะมีการแจ้งราคาก่อนใช้งาน",
  },
  {
    q: "ข้อมูลส่วนตัวของฉันปลอดภัยหรือไม่?",
    a: "เราเก็บข้อมูลทั้งหมดด้วยการเข้ารหัสตามมาตรฐาน และปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
  },
  {
    q: "ฉันสามารถลบบัญชีของฉันได้หรือไม่?",
    a: "ได้ สามารถลบบัญชีและข้อมูลส่วนตัวทั้งหมดได้ที่หน้า โปรไฟล์ → ตั้งค่าและความเป็นส่วนตัว",
  },
  {
    q: "ผลทำนายแม่นยำแค่ไหน?",
    a: "ผลทำนายเป็นแนวทางเพื่อช่วยทบทวนตนเอง ไม่ควรใช้แทนคำแนะนำด้านการแพทย์ การเงิน หรือกฎหมาย",
  },
  {
    q: "ฉันลืมรหัสผ่าน ต้องทำอย่างไร?",
    a: "คลิก ‘ลืมรหัสผ่าน?’ ที่หน้าเข้าสู่ระบบ ระบบจะส่งลิงก์รีเซ็ตไปยังอีเมลของคุณ",
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="ศูนย์ช่วยเหลือ" subtitleCn="帮助" />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-12">
        <section className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">HELP CENTER</div>
          <h1 className="mt-2 font-display text-5xl text-foreground">ศูนย์ช่วยเหลือ</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            ค้นหาคำตอบ หรือเลือกหมวดด้านล่าง
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <input className="input-styled" placeholder="ค้นหา เช่น วิธีดูดวงไพ่ยิปซี" />
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => (
            <div key={t.title} className="glass-strong rounded-2xl p-5">
              <div className="text-3xl text-gold">{t.icon}</div>
              <div className="mt-2 font-display text-lg text-foreground">{t.title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl text-foreground">คำถามที่พบบ่อย</h2>
          <div className="gold-divider my-5 w-24" />
          <div className="space-y-3">
            {faqs.map((f, i) => {
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
