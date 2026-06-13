import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import { type AboutContent } from "@/lib/admin-content";
import { friendlyErrorMessage } from "@/lib/friendly-error";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "เกี่ยวกับเรา",
      description:
        "ทำความรู้จัก Likhitfa แพลตฟอร์มดูดวงปาจื้อ ไพ่ยิปซี และทำนายฝันที่ออกแบบให้อ่านง่ายและน่าเชื่อถือ",
      path: "/about",
      keywords: ["เกี่ยวกับ Likhitfa", "ลิขิตฟ้า", "ดูดวงพรีเมียม"],
    }),
  component: AboutPage,
});

function AboutPage() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAbout() {
      const response = await fetch("/api/site-content");
      const data = await response.json().catch(() => ({}));
      if (!mounted) return;
      if (!response.ok || !data.ok) {
        setError(friendlyErrorMessage(data.error, "โหลดข้อมูลเกี่ยวกับเราไม่สำเร็จ"));
        return;
      }
      setAbout(data.content?.about || null);
    }

    void loadAbout();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle="เกี่ยวกับเรา" subtitleCn="关于" />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-12">
        <section className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">ABOUT</div>
          <h1 className="mt-2 font-display text-5xl text-foreground md:text-6xl">
            {about?.title || "เกี่ยวกับเรา"}
          </h1>
          {about ? (
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {about.description}
            </p>
          ) : (
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-rose-200 md:text-base">
              {error || "กำลังโหลดข้อมูลจากระบบกลาง..."}
            </p>
          )}
        </section>

        {about ? (
          <>
            <section className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  cn: "心",
                  th: "ตั้งใจ",
                  desc: "เราคัดสรรเนื้อหาจากตำราคลาสสิกและผู้เชี่ยวชาญที่ผ่านการรับรอง",
                },
                {
                  cn: "雅",
                  th: "งดงาม",
                  desc: "ทุกหน้าจอออกแบบด้วยมาตรฐานพรีเมียม ใส่ใจรายละเอียดทุกองค์ประกอบ",
                },
                {
                  cn: "易",
                  th: "ใช้ง่าย",
                  desc: "อ่านผลได้ทันทีแม้ไม่ใช่ผู้เชี่ยวชาญ พร้อมคำอธิบายในภาษาเข้าใจง่าย",
                },
              ].map((v) => (
                <div key={v.th} className="glass-strong rounded-3xl p-7 text-center">
                  <div className="font-cn text-5xl text-gold">{v.cn}</div>
                  <div className="mt-3 font-display text-2xl text-foreground">{v.th}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </section>

            <section className="mt-16 glass-strong rounded-3xl p-8 md:p-12">
              <h2 className="font-display text-3xl text-foreground">เรื่องราวของเรา</h2>
              <div className="gold-divider my-5 w-32" />
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {about.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="mt-16 grid gap-6 md:grid-cols-2">
              <div className="glass rounded-3xl p-7">
                <div className="text-[11px] uppercase tracking-[0.25em] text-gold">VISION</div>
                <h3 className="mt-2 font-display text-2xl text-foreground">วิสัยทัศน์</h3>
                <p className="mt-3 text-sm text-muted-foreground">{about.vision}</p>
              </div>
              <div className="glass rounded-3xl p-7">
                <div className="text-[11px] uppercase tracking-[0.25em] text-gold">MISSION</div>
                <h3 className="mt-2 font-display text-2xl text-foreground">พันธกิจ</h3>
                <p className="mt-3 text-sm text-muted-foreground">{about.mission}</p>
              </div>
            </section>
          </>
        ) : null}

        <section className="mt-16 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-8 py-3 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
          >
            ติดต่อทีมงาน →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
