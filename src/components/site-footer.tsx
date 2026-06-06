import { Link } from "@tanstack/react-router";
import { BrandMark } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-gold/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size={36} />
              <div>
                <div className="text-[10px] tracking-[0.3em] text-gold/80">LIKHITFA</div>
                <div className="font-display text-lg text-foreground">ลิขิตฟ้า</div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              ศาสตร์ดูดวงระดับพรีเมียม รวมปาจื้อ ไพ่ยิปซี และทำนายฝันไว้ในที่เดียว
            </p>
          </div>

          <FooterCol
            title="บริการดูดวง"
            links={[
              { to: "/bazi", label: "ปาจื้อ 八字" },
              { to: "/tarot", label: "ไพ่ยิปซี" },
              { to: "/dream", label: "ทำนายฝัน" },
            ]}
          />

          <FooterCol
            title="บริษัท"
            links={[
              { to: "/about", label: "เกี่ยวกับเรา" },
              { to: "/contact", label: "ติดต่อเรา" },
              { to: "/articles", label: "บทความ" },
            ]}
          />

          <FooterCol
            title="ผู้ใช้งาน"
            links={[
              { to: "/login", label: "เข้าสู่ระบบ" },
              { to: "/register", label: "สมัครสมาชิก" },
              { to: "/help", label: "ศูนย์ช่วยเหลือ" },
            ]}
          />
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            ผลทำนายเป็นแนวทางเพื่อทบทวนตนเอง ไม่ใช่คำตัดสินชีวิตหรือคำแนะนำด้านการแพทย์ การเงิน
            หรือกฎหมาย
          </p>
          <div className="font-cn text-sm text-gold/50">天 · 地 · 人 · 和</div>
          <div className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Likhitfa. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.25em] text-gold/70">{title}</div>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-muted-foreground hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
