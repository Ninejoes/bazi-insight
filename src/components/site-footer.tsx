import { Link } from "@tanstack/react-router";
import { BrandMark } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-gold/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <BrandMark size={36} />
              <div>
                <div className="text-[10px] tracking-[0.3em] text-gold/80">LIKHITFA</div>
                <div className="font-display text-lg text-foreground">ลิขิตฟ้า</div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              ศาสตร์ดูดวงระดับพรีเมียม รวมปาจื้อ ไพ่ยิปซี ทำนายฝัน ฤกษ์มงคล และศาสตร์ตัวเลขไว้ในที่เดียว
            </p>
          </div>

          <FooterCol
            title="บริการดูดวง"
            links={[
              { to: "/bazi", label: "ปาจื้อ 八字" },
              { to: "/life-graph", label: "กราฟชีวิต 12 เรือน" },
              { to: "/brahma-wheel", label: "กงล้อพรหมชาติ" },
              { to: "/zodiac", label: "ดูดวง 12 ราศี 2569" },
              { to: "/love-compatibility", label: "สมพงษ์เนื้อคู่ & รัก" },
              { to: "/daily-hub", label: "เช็คดวงเช้านี้ Daily Hub" },
              { to: "/tarot", label: "ไพ่ยิปซี" },
              { to: "/dream", label: "ทำนายฝัน" },
              { to: "/virtual-shrine", label: "ไหว้พระออนไลน์" },
              { to: "/siamsi", label: "เซียมซีออนไลน์" },
              { to: "/wallpaper", label: "วอลเปเปอร์สายมู" },
            ]}
          />

          <FooterCol
            title="ตัวเลข & ฤกษ์ยาม"
            links={[
              { to: "/destiny-card", label: "บัตรชะตาชีวิตดิจิทัล" },
              { to: "/phone-analysis", label: "เช็คเบอร์มงคล" },
              { to: "/plate-analysis", label: "วิเคราะห์ทะเบียนรถ" },
              { to: "/naming", label: "ระบบตั้งชื่อมงคล" },
              { to: "/name-analysis", label: "วิเคราะห์ชื่อ-นามสกุล" },
              { to: "/lucky-colors", label: "สีเสื้อมงคลประจำวัน" },
              { to: "/auspicious-calendar", label: "ปฏิทินฤกษ์มงคล 2569" },
              { to: "/tai-sui", label: "ตรวจปีชง 2569 & แก้ชง" },
              { to: "/lottery", label: "หวย & สถิติเลขเด็ด" },
            ]}
          />

          <FooterCol
            title="บริษัท & พันธมิตร"
            links={[
              { to: "/about", label: "เกี่ยวกับเรา" },
              { to: "/contact", label: "ติดต่อเรา" },
              { to: "/articles", label: "บทความดูดวง" },
              { to: "https://ninejoe.online", label: "NineJoe.online ↗" },
              { to: "https://ninejoe.online/collections", label: "NineJoe Collections ↗" },
            ]}
          />

          <FooterCol
            title="ผู้ใช้งาน"
            links={[
              { to: "/login", label: "เข้าสู่ระบบ", rel: "nofollow" },
              { to: "/register", label: "สมัครสมาชิก", rel: "nofollow" },
              { to: "/help", label: "ศูนย์ช่วยเหลือ" },
              { to: "/terms", label: "ข้อกำหนดการใช้งาน" },
              { to: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
            ]}
          />
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            ผลทำนายเป็นแนวทางเพื่อทบทวนตนเอง ไม่ใช่คำตัดสินชีวิตหรือคำแนะนำด้านการแพทย์ การเงิน
            หรือกฎหมาย
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80 pt-1">
            <Link to="/terms" className="hover:text-gold transition">
              ข้อกำหนดการใช้งาน
            </Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-gold transition">
              นโยบายความเป็นส่วนตัว
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open_cookie_preferences"))}
              className="hover:text-gold transition cursor-pointer"
            >
              ตั้งค่าคุกกี้
            </button>
          </div>
          <div className="font-cn text-sm text-gold/50">天 · 地 · 人 · 和</div>
          <div className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Likhitfa. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string; rel?: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.25em] text-gold/70">{title}</div>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            {l.to.startsWith("http") ? (
              <a
                href={l.to}
                target="_blank"
                rel={l.rel || "noopener noreferrer"}
                className="text-sm text-muted-foreground hover:text-gold"
              >
                {l.label}
              </a>
            ) : (
              <Link to={l.to} rel={l.rel} className="text-sm text-muted-foreground hover:text-gold">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
