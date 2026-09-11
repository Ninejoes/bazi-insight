import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserX,
  FileCheck,
  Cookie,
  Mail,
  HelpCircle,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "นโยบายความเป็นส่วนตัว (PDPA)",
      description:
        "นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy) และการใช้คุกกี้ของ Likhitfa (ลิขิตฟ้า) ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)",
      path: "/privacy",
      keywords: ["นโยบายความเป็นส่วนตัว", "PDPA", "คุ้มครองข้อมูลส่วนบุคคล", "ลิขิตฟ้า"],
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const lastUpdated = "6 กันยายน 2569";

  const sections = [
    {
      id: "intro",
      title: "1. บทนำและขอบเขตของนโยบาย",
      icon: <Shield className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            <strong>Likhitfa ลิขิตฟ้า</strong> ("เรา") ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคล
            และความเป็นส่วนตัวของท่านในฐานะผู้ใช้งานเว็บไซต์{" "}
            <a href="https://www.likhitfa.online" className="text-gold underline">https://www.likhitfa.online</a>
          </p>
          <p>
            นโยบายความเป็นส่วนตัวฉบับนี้จัดทำขึ้นเพื่อชี้แจงแนวปฏิบัติเกี่ยวกับการเก็บรวบรวม ใช้
            เปิดเผย และคุ้มครองข้อมูลส่วนบุคคลของท่าน เพื่อให้สอดคล้องกับ{" "}
            <strong>พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</strong>{" "}
            และมาตรฐานสากล
          </p>
        </div>
      ),
    },
    {
      id: "data-collected",
      title: "2. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม",
      icon: <Database className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลเฉพาะเท่าที่จำเป็นต่อการให้บริการทางศาสตร์พยากรณ์ ได้แก่:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">ข้อมูลเพื่อการผูกดวงชะตา:</strong> วัน เดือน ปีเกิด
              เวลาเกิด เพศ และชื่อ เพื่อใช้ในการคำนวณปาจื้อ (八字) ธาตุกำเนิดดิถี และกราฟชีวิต
            </li>
            <li>
              <strong className="text-foreground">ข้อมูลบัญชีผู้ใช้งาน:</strong> ชื่อแสดง (Display Name),
              อีเมล, รหัสผ่านที่ผ่านการเข้ารหัสทางเดียว (Hashed Password), วันที่สมัครสมาชิก
            </li>
            <li>
              <strong className="text-foreground">ประวัติการดูดวงและบันทึกส่วนตัว:</strong> บันทึกการเปิดไพ่ยิปซี
              การค้นหาคำทำนายฝัน และประวัติการทำนายที่ท่านเลือกบันทึกไว้ในบัญชี
            </li>
            <li>
              <strong className="text-foreground">ข้อมูลเชิงเทคนิคและความปลอดภัย:</strong> IP Address,
              ประเภทบราวเซอร์, User-Agent, ข้อมูลการตั้งค่าคุกกี้ และเวลาเข้าชม เพื่อการป้องกันบอทและรักษาความมั่นคงปลอดภัย
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "purpose",
      title: "3. วัตถุประสงค์ในการประมวลผลข้อมูล",
      icon: <FileCheck className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>เราประมวลผลข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>คำนวณและแสดงผลการทำนายดวงจีน ปาจื้อ 4 เสาหลัก ไพ่ยิปซี กราฟชีวิต และวิเคราะห์ตัวเลข</li>
            <li>ให้บริการระบบสมาชิก บันทึกประวัติและข้อมูลโปรไฟล์ส่วนตัว</li>
            <li>ตอบข้อซักถาม ข้อเสนอแนะ หรือเรื่องร้องเรียนผ่านทางฟอร์มติดต่อเรา</li>
            <li>
              ตรวจจับ ป้องกัน และยับยั้งการโจมตีทางไซเบอร์ การสแปมบอท (ผ่านระบบ Likhitfa Shield)
              และการกระทำที่ผิดกฎหมาย
            </li>
            <li>วิเคราะห์สถิติเพื่อพัฒนาฟังก์ชันและการนำเสนอเนื้อหาให้ตรงใจผู้ใช้งาน</li>
          </ul>
          <p className="text-emerald-300 font-medium">
            * เราไม่มีนโยบายการนำข้อมูลส่วนบุคคลของท่านไปขาย แลกเปลี่ยน หรือให้เช่าแก่บุคคลภายนอกเพื่อผลประโยชน์เชิงพาณิชย์โดยเด็ดขาด
          </p>
        </div>
      ),
    },
    {
      id: "cookies",
      title: "4. นโยบายการใช้คุกกี้ (Cookies Policy)",
      icon: <Cookie className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            คุกกี้คือไฟล์ข้อความขนาดเล็กที่ถูกบันทึกลงในอุปกรณ์ของท่านเมื่อเข้าชมเว็บไซต์
            เราใช้งานคุกกี้เพื่อ:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>
              <strong>คุกกี้ที่จำเป็น (Strictly Necessary):</strong> รักษาความปลอดภัย การล็อกอิน และเซสชันการดูดวง
            </li>
            <li>
              <strong>คุกกี้เพื่อการวิเคราะห์ (Analytics):</strong> สถิติการเข้าชมหน้าเว็บและการตอบสนองของระบบ
            </li>
            <li>
              <strong>คุกกี้เพื่อการจดจำค่า (Preferences):</strong> จดจำวันเกิดและการตั้งค่าการใช้งานส่วนบุคคล
            </li>
          </ul>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open_cookie_preferences"))}
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20 transition"
            >
              <Cookie className="h-3.5 w-3.5" />
              คลิกที่นี่เพื่อจัดการความยินยอมคุกกี้ของคุณ
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      title: "5. มาตรการรักษาความปลอดภัยของข้อมูล",
      icon: <Lock className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            เราใช้มาตรการทางเทคนิคและการบริหารจัดการที่มีมาตรฐานสากลในการปกป้องข้อมูลของท่าน:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>การเชื่อมต่อทั้งหมดได้รับการเข้ารหัสด้วยโปรโตคอล HTTPS / TLS 1.3 ความปลอดภัยสูง</li>
            <li>
              จัดเก็บข้อมูลบนโครงสร้างพื้นฐานคลาวด์ Supabase พร้อมระบบควบคุมการเข้าถึงข้อมูลระดับแถว
              (Row-Level Security: RLS) ทำให้สมาชิกแต่ละท่านสามารถเข้าถึงได้เฉพาะประวัติของตนเองเท่านั้น
            </li>
            <li>
              รหัสผ่านถูกแฮชด้วยอัลกอริทึมเข้ารหัสทางเดียว (Bcrypt / Argon2) ไม่มีใครสามารถอ่านรหัสผ่านจริงได้
            </li>
            <li>
              ระบบไฟร์วอลล์และเกราะป้องกันการโจมตี Likhitfa Shield Anti-Bot และ Rate Limiting บล็อกคำขอที่ผิดปกติ
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "rights",
      title: "6. สิทธิของเจ้าของข้อมูลตามกฎหมาย PDPA",
      icon: <UserX className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิอันชอบธรรมดังต่อไปนี้:</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-card/30 p-3">
              <strong className="text-foreground block text-xs">สิทธิขอเข้าถึงและรับสำเนา</strong>
              <span className="text-[11px] text-muted-foreground">ขอตรวจสอบข้อมูลส่วนบุคคลของท่านที่เราเก็บรักษา</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-card/30 p-3">
              <strong className="text-foreground block text-xs">สิทธิขอแก้ไขข้อมูล</strong>
              <span className="text-[11px] text-muted-foreground">ขอแก้ไขข้อมูลที่ไม่ถูกต้อง ไม่สมบูรณ์ หรือไม่เป็นปัจจุบัน</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-card/30 p-3">
              <strong className="text-foreground block text-xs">สิทธิขอลบหรือทำลายข้อมูล</strong>
              <span className="text-[11px] text-muted-foreground">สามารถลบบัญชีและประวัติการดูดวงได้ทันทีที่หน้าโปรไฟล์</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-card/30 p-3">
              <strong className="text-foreground block text-xs">สิทธิขอถอนความยินยอม</strong>
              <span className="text-[11px] text-muted-foreground">สามารถถอนความยินยอมการใช้คุกกี้ได้ตลอดเวลา</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "7. การติดต่อเราและเจ้าหน้าที่คุ้มครองข้อมูล",
      icon: <Mail className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            หากท่านมีข้อสงสัย ข้อเสนอแนะ หรือประสงค์จะใช้สิทธิตามกฎหมาย PDPA
            สามารถติดต่อผู้ควบคุมข้อมูลส่วนบุคคลได้ที่:
          </p>
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 space-y-1.5 text-xs">
            <div className="font-semibold text-foreground">ทีมงานคุ้มครองข้อมูลส่วนบุคคล Likhitfa</div>
            <div>
              อีเมล:{" "}
              <a href="mailto:bg.chanon@gmail.com" className="text-gold underline font-mono">
                bg.chanon@gmail.com
              </a>
            </div>
            <div>เว็บไซต์: https://www.likhitfa.online</div>
            <div className="text-muted-foreground pt-1">
              เราจะพิจารณาและดำเนินการตามคำร้องขอของท่านภายในระยะเวลาที่กฎหมายกำหนด (ไม่เกิน 30 วัน)
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader subtitle="นโยบายความเป็นส่วนตัว" subtitleCn="隐私" />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">PRIVACY & PDPA</div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลและการใช้คุกกี้ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-xs text-gold/90">
            <span>ปรับปรุงล่าสุด: {lastUpdated}</span>
          </div>
        </section>

        {/* Content Layout with Sidebar */}
        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-gold/20 bg-card/40 p-4 space-y-2 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-gold/80 font-semibold mb-3">
                สารบัญนโยบาย
              </div>
              <nav className="space-y-1 text-xs">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-gold/10 transition truncate"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="pt-4 mt-4 border-t border-gold/15">
                <Link
                  to="/terms"
                  className="block text-xs text-muted-foreground hover:text-gold transition"
                >
                  → ดูข้อกำหนดการใช้งาน
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Articles */}
          <div className="lg:col-span-3 space-y-8">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-3xl border border-gold/20 bg-card/50 p-6 sm:p-7 shadow-elegant space-y-4"
              >
                <div className="flex items-center gap-2.5 text-foreground border-b border-gold/15 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    {section.icon}
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold">
                    {section.title}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-3">
                  {section.content}
                </div>
              </article>
            ))}

            {/* Bottom Contact Callout */}
            <div className="rounded-3xl border border-gold/30 bg-gold/[0.04] p-6 text-center space-y-3">
              <div className="font-display text-base font-semibold text-foreground">
                การจัดการและลบข้อมูลส่วนบุคคล
              </div>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                ท่านสามารถลบประวัติการดูดวง หรือขอลบบัญชีของท่านได้ตลอดเวลาด้วยตนเองผ่านเมนูโปรไฟล์
                หรือแจ้งให้ทีมงานดำเนินการได้ทันที
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/profile"
                  className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-medium text-foreground hover:bg-gold/15 transition"
                >
                  ไปที่หน้าโปรไฟล์ & ความเป็นส่วนตัว
                </Link>
                <Link
                  to="/contact"
                  className="rounded-xl bg-gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02]"
                >
                  ติดต่อเจ้าหน้าที่ DPO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
