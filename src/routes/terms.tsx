import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seo } from "@/lib/seo";
import {
  FileText,
  ShieldAlert,
  Sparkles,
  Lock,
  Scale,
  HelpCircle,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Cookie,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo({
      title: "ข้อกำหนดและเงื่อนไขการใช้งาน",
      description:
        "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ Likhitfa (ลิขิตฟ้า) ขอบเขตการให้บริการดูดวง ศาสตร์พยากรณ์ และการคุ้มครองข้อมูลส่วนบุคคล",
      path: "/terms",
      keywords: ["ข้อกำหนดการใช้งาน", "เงื่อนไขการใช้งาน", "Terms of Service", "ลิขิตฟ้า"],
    }),
  component: TermsPage,
});

function TermsPage() {
  const lastUpdated = "6 กันยายน 2569";

  const sections = [
    {
      id: "acceptance",
      title: "1. การยอมรับข้อกำหนดและเงื่อนไข",
      icon: <CheckCircle2 className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            ยินดีต้อนรับสู่ <strong>Likhitfa ลิขิตฟ้า</strong> (ซึ่งต่อไปนี้จะเรียกว่า "เว็บไซต์", "ระบบ" หรือ "เรา")
            เมื่อท่านเข้าชม ใช้งาน หรือสมัครสมาชิกในเว็บไซต์{" "}
            <a href="https://www.likhitfa.online" className="text-gold underline">https://www.likhitfa.online</a>{" "}
            ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงที่จะผูกพันตนเองตามข้อกำหนดและเงื่อนไขฉบับนี้
            รวมถึงนโยบายความเป็นส่วนตัว (Privacy Policy) และนโยบายคุกกี้ของเราทั้งหมด
          </p>
          <p>
            หากท่านไม่ยอมรับข้อกำหนดและเงื่อนไขเหล่านี้ ไม่ว่าทั้งหมดหรือบางส่วน กรุณายุติการเข้าชมและการใช้งานเว็บไซต์ทันที
          </p>
        </div>
      ),
    },
    {
      id: "disclaimer",
      title: "2. ข้อสงวนสิทธิ์สำคัญทางโหราศาสตร์และความเชื่อส่วนบุคคล",
      icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-100 block mb-1">⚠️ คำเตือนและข้อสงวนสิทธิ์สำคัญ (Astrology Disclaimer):</strong>
            ผลการวิเคราะห์ดวงชะตา การผูกดวงจีนปาจื้อ (八字) ไพ่ยิปซี (Tarot) ทำนายฝัน กราฟชีวิต เลขศาสตร์
            และศาสตร์พยากรณ์อื่นๆ บนเว็บไซต์นี้ เป็นความเชื่อส่วนบุคคลและศาสตร์สถิติโบราณ
            จัดทำขึ้นเพื่อให้เป็นเครื่องมือในการทบทวนตนเอง สร้างแรงบันดาลใจ และเสริมสร้างสิริมงคลในชีวิตเท่านั้น
          </div>
          <p>
            คำพยากรณ์และข้อมูลบนเว็บไซต์นี้ <strong>ไม่ใช่และไม่สามารถใช้ทดแทน</strong>{" "}
            คำแนะนำ คำวินิจฉัย หรือคำปรึกษาจากผู้ประกอบวิชาชีพเฉพาะทาง ได้แก่:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>คำแนะนำทางการแพทย์ สุขภาพจิต หรือการรักษาโรค</li>
            <li>คำปรึกษาทางกฎหมาย คดีความ หรือข้อพิพาท</li>
            <li>คำแนะนำการวางแผนการเงิน การลงทุน หรือความเสี่ยงทางธุรกิจ</li>
          </ul>
          <p>
            การตัดสินใจใดๆ ในชีวิตประจำวัน การลงทุน การประกอบอาชีพ หรือความสัมพันธ์
            ถือเป็นวิจารณญาณและความรับผิดชอบของตัวท่านเองแต่เพียงผู้เดียว เว็บไซต์จะไม่รับผิดชอบต่อความเสียหายใดๆ
            ทั้งทางตรงและทางอ้อมอันเนื่องมาจากการปฏิบัติตามคำพยากรณ์
          </p>
        </div>
      ),
    },
    {
      id: "accounts",
      title: "3. บัญชีผู้ใช้งานและการรักษาความปลอดภัย",
      icon: <UserCheck className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            ในการใช้งานบางฟีเจอร์ เช่น การบันทึกประวัติการดูดวง การดูดวงส่วนบุคคล และการจัดการโปรไฟล์
            ท่านอาจต้องลงทะเบียนสมัครสมาชิก โดยท่านตกลงที่จะ:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>ให้ข้อมูลที่ถูกต้อง แท้จริง และเป็นปัจจุบันในการลงทะเบียน</li>
            <li>เก็บรักษารหัสผ่านและข้อมูลรับรองความปลอดภัยเป็นความลับอย่างเคร่งครัด</li>
            <li>ไม่เปิดเผยหรือยินยอมให้บุคคลอื่นเข้าใช้งานบัญชีของท่าน</li>
            <li>แจ้งให้เราทราบทันทีหากพบการเข้าถึงบัญชีโดยไม่ได้รับอนุญาตหรือมีข้อสงสัยว่ารหัสผ่านรั่วไหล</li>
          </ul>
          <p>
            เราขอสงวนสิทธิ์ในการระงับ หรือยกเลิกบัญชีผู้ใช้งานที่ให้ข้อมูลเท็จ ละเมิดข้อกำหนด
            หรือมีพฤติกรรมที่ไม่เหมาะสมโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      title: "4. สิทธิในทรัพย์สินทางปัญญา",
      icon: <Sparkles className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            ทรัพย์สินทางปัญญาทั้งหมดบนเว็บไซต์ Likhitfa ได้แก่ โค้ดโปรแกรม ข้อความ บทความ คำทำนาย
            อินเทอร์เฟซผู้ใช้ โลโก้ งานออกแบบตราประทับมงคล รวมถึงรูปภาพวอลเปเปอร์สายมูและศิลปะมงคล
            จาก <strong>NineJoe Studio (<a href="https://ninejoe.online" className="text-gold underline">NineJoe.online</a>)</strong>{" "}
            ถือเป็นลิขสิทธิ์และทรัพย์สินทางปัญญาของ Likhitfa และพาร์ทเนอร์อย่างถูกต้องตามกฎหมาย
          </p>
          <p>
            ท่านได้รับอนุญาตให้เข้าชม ใช้งานระบบ และดาวน์โหลดภาพวอลเปเปอร์เพื่อการใช้งานส่วนตัว (Personal Use Only)
            โดย <strong>ห้ามมิให้</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>คัดลอก ดัดแปลง แจกจ่าย หรือนำภาพและเนื้อหาไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</li>
            <li>นำระบบคำนวณปาจื้อ ฐานข้อมูลความฝัน หรือไพ่ยิปซีไปทำวิศวกรรมย้อนกลับ (Reverse Engineering)</li>
            <li>แอบอ้าง ลบ หรือแก้ไขเครื่องหมายการค้า ลายน้ำ หรือข้อความแสดงสิทธิ์ความเป็นเจ้าของ</li>
          </ul>
        </div>
      ),
    },
    {
      id: "prohibited-conduct",
      title: "5. ข้อห้ามและพฤติกรรมที่ไม่พึงประสงค์",
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
      content: (
        <div className="space-y-3">
          <p>ในการใช้งานเว็บไซต์ Likhitfa ท่านตกลงว่าจะไม่กระทำการใดๆ ดังต่อไปนี้:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>ใช้โปรแกรมอัตโนมัติ (Bots, Scrapers, Crawlers) กวาดข้อมูลหรือส่งคำร้องขอสแปม (Spam) เข้าสู่ฟอร์มและ API ของระบบ</li>
            <li>พยายามเจาะระบบ ข้ามผ่านระบบความปลอดภัย หรือเจตนากระทำการ Denial of Service (DoS/DDoS)</li>
            <li>ส่งข้อความติดต่อที่มีลักษณะคุกคาม หยาบคาย ละเมิดกฎหมาย โฆษณาผิดกฎหมาย หรือมีเนื้อหาที่มีมัลแวร์</li>
            <li>พยายามเข้าถึงบัญชีผู้ดูแลระบบ หรือข้อมูลส่วนบุคคลของสมาชิกท่านอื่นโดยมิชอบ</li>
          </ul>
          <p>
            เว็บไซต์ได้ติดตั้งระบบป้องกัน <strong>Likhitfa Shield Anti-Bot v2</strong> ตรวจจับการโจมตี
            และจะดำเนินคดีตาม พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์อย่างถึงที่สุดหากพบการบุกรุก
          </p>
        </div>
      ),
    },
    {
      id: "privacy-cookies",
      title: "6. การคุ้มครองข้อมูลส่วนบุคคลและคุกกี้ (PDPA)",
      icon: <Cookie className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            เราให้ความสำคัญสูงสุดต่อการรักษาความปลอดภัยของข้อมูลส่วนบุคคลของท่าน
            การเก็บรวบรวม ใช้ และประมวลผลข้อมูล (เช่น วันเดือนปีเกิด เวลาเกิด เพื่อคำนวณดวงชะตา)
            เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
          <p>
            เว็บไซต์มีการใช้งานคุกกี้ (Cookies) เพื่ออำนวยความสะดวกในการเข้าใช้งานระบบ
            รักษาความปลอดภัย และจดจำผลทำนายของท่าน ท่านสามารถศึกษารายละเอียดและจัดการความยินยอมได้ที่{" "}
            <Link to="/privacy" className="text-gold underline">นโยบายความเป็นส่วนตัว</Link>{" "}
            หรือกดปุ่ม "ตั้งค่าคุกกี้" บนแบนเนอร์ด้านล่าง
          </p>
        </div>
      ),
    },
    {
      id: "liability",
      title: "7. ข้อจำกัดความรับผิดชอบ (Limitation of Liability)",
      icon: <Scale className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            เว็บไซต์ให้บริการบนพื้นฐาน "ตามสภาพที่เป็นอยู่" (As Is) และ "ตามที่มีอยู่" (As Available)
            เราพยายามอย่างเต็มที่ในการรักษาเสถียรภาพ ความต่อเนื่อง และความถูกต้องของระบบ
            อย่างไรก็ตาม เราไม่สามารถรับประกันได้ว่าการให้บริการจะปราศจากข้อผิดพลาด การหยุดชะงัก หรือไวรัสโดยสิ้นเชิง
          </p>
          <p>
            ไม่ว่าในกรณีใดๆ Likhitfa ผู้พัฒนา และพันธมิตร จะไม่รับผิดชอบต่อความสูญหายของข้อมูล
            ผลกำไร การหยุดชะงักของธุรกิจ หรือความเสียหายใดๆ ไม่ว่าทางตรงหรือทางอ้อม
            ที่เกิดจากการใช้งานหรือไม่สามารถใช้งานเว็บไซต์นี้ได้
          </p>
        </div>
      ),
    },
    {
      id: "modifications",
      title: "8. การแก้ไขเปลี่ยนแปลงข้อกำหนด",
      icon: <FileText className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            เราขอสงวนสิทธิ์ในการแก้ไข ปรับปรุง หรือเพิ่มเติมข้อกำหนดและเงื่อนไขฉบับนี้ได้ตลอดเวลาตามความเหมาะสม
            การเปลี่ยนแปลงจะมีผลบังคับใช้ทันทีที่ประกาศลงบนเว็บไซต์นี้
          </p>
          <p>
            การที่ท่านยังคงเข้าใช้งานเว็บไซต์หลังจากการประกาศเปลี่ยนแปลง
            ถือว่าท่านได้ยอมรับข้อกำหนดฉบับปรับปรุงใหม่โดยสมบูรณ์แล้ว
            เราแนะนำให้ท่านตรวจสอบหน้านี้เป็นระยะเพื่อรับทราบการเปลี่ยนแปลง
          </p>
        </div>
      ),
    },
    {
      id: "contact",
      title: "9. กฎหมายที่ใช้บังคับและช่องทางการติดต่อ",
      icon: <Mail className="h-4 w-4 text-gold" />,
      content: (
        <div className="space-y-3">
          <p>
            ข้อกำหนดและเงื่อนไขฉบับนี้อยู่ภายใต้การบังคับใช้และการตีความตามกฎหมายแห่งราชอาณาจักรไทย
            ข้อพิพาทใดๆ ที่เกิดขึ้นจากการใช้งานเว็บไซต์นี้ให้อยู่ในเขตอำนาจของศาลไทย
          </p>
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 space-y-1 text-xs">
            <div className="font-semibold text-foreground">หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการใช้งาน:</div>
            <div className="text-muted-foreground">อีเมลติดต่อฝ่ายกฎหมายและความเป็นส่วนตัว:</div>
            <a href="mailto:contact@likhitfa.online" className="text-gold underline font-mono">
              contact@likhitfa.online
            </a>
            <div className="text-muted-foreground mt-2">
              หรือติดต่อผ่านหน้าฟอร์ม:{" "}
              <Link to="/contact" className="text-gold underline">
                หน้าติดต่อเรา Likhitfa
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader subtitle="ข้อกำหนดการใช้งาน" subtitleCn="条款" />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Header Hero */}
        <section className="text-center space-y-3">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/70">LEGAL & TERMS</div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            ข้อตกลงและเงื่อนไขการให้บริการของเว็บไซต์ Likhitfa (ลิขิตฟ้า)
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1 text-xs text-gold/90">
            <span>ปรับปรุงล่าสุด: {lastUpdated}</span>
          </div>
        </section>

        {/* Content Layout with Sidebar Navigation */}
        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-gold/20 bg-card/40 p-4 space-y-2 backdrop-blur-md">
              <div className="text-xs uppercase tracking-wider text-gold/80 font-semibold mb-3">
                หัวข้อข้อกำหนด
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
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open_cookie_preferences"))}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition"
                >
                  <Cookie className="h-3.5 w-3.5" />
                  <span>จัดการความยินยอมคุกกี้</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Legal Content */}
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

            {/* Bottom Footer Actions */}
            <div className="rounded-3xl border border-gold/30 bg-gold/[0.04] p-6 text-center space-y-3">
              <div className="font-display text-base font-semibold text-foreground">
                ต้องการสอบถามเพิ่มเติมเกี่ยวกับข้อกำหนดหรือนโยบาย?
              </div>
              <p className="text-xs text-muted-foreground">
                ทีมงานลิขิตฟ้ายินดีให้คำแนะนำและช่วยเหลือในทุกข้อสงสัย
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/privacy"
                  className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-medium text-foreground hover:bg-gold/15 transition"
                >
                  อ่านนโยบายความเป็นส่วนตัว (PDPA)
                </Link>
                <Link
                  to="/contact"
                  className="rounded-xl bg-gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02]"
                >
                  ติดต่อทีมงาน
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
