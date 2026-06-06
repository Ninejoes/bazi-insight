import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { tarotCategories } from "@/lib/tarot-cards";

interface SiteHeaderProps {
  subtitle?: string;
  subtitleCn?: string;
  showNav?: boolean;
}

export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-gradient-gold shadow-gold"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.55}
        height={size * 0.55}
        fill="none"
        stroke="oklch(0.18 0.02 60)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2 L12 22 M5 9 L19 9 M7 15 L17 15 M9 22 L15 22" />
        <circle cx="12" cy="5" r="1.4" fill="oklch(0.18 0.02 60)" />
      </svg>
    </div>
  );
}

export function SiteHeader({ subtitle, subtitleCn, showNav = true }: SiteHeaderProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);
  const [tarotOpen, setTarotOpen] = useState(false);

  const isActive = (prefix: string) => (prefix === "/" ? path === "/" : path.startsWith(prefix));

  return (
    <header className="relative z-30 border-b border-gold/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <BrandMark size={42} />
          <div className="leading-tight">
            <div className="text-[10px] tracking-[0.3em] text-gold/80">LIKHITFA</div>
            <div className="font-display text-lg font-semibold text-foreground md:text-xl">
              Likhitfa <span className="text-gold">ลิขิตฟ้า</span>
            </div>
            {subtitle && (
              <div className="hidden text-xs text-muted-foreground md:block">
                {subtitle}{" "}
                {subtitleCn && <span className="font-cn text-gold/70">{subtitleCn}</span>}
              </div>
            )}
          </div>
        </Link>

        {showNav && (
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" active={path === "/"}>
              หน้าหลัก
            </NavLink>
            <NavLink to="/bazi" active={isActive("/bazi")}>
              ปาจื้อ
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setTarotOpen(true)}
              onMouseLeave={() => setTarotOpen(false)}
            >
              <NavLink to="/tarot" active={isActive("/tarot")}>
                ไพ่ยิปซี <span className="ml-1 text-[10px] opacity-70">▾</span>
              </NavLink>
              {tarotOpen && (
                <div className="absolute right-0 top-full z-40 w-72 pt-2">
                  <div className="glass-strong overflow-hidden rounded-2xl p-2 shadow-elegant">
                    <Link
                      to="/tarot"
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span>เลือกหมวดทั้งหมด</span>
                      <span className="text-gold/60">→</span>
                    </Link>
                    <div className="my-1 h-px bg-gold/10" />
                    {tarotCategories.map((c) => (
                      <Link
                        key={c.slug}
                        to="/tarot/$type"
                        params={{ type: c.slug }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
                      >
                        <span className="text-base text-gold/80">{c.icon}</span>
                        <span>{c.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/dream" active={isActive("/dream")}>
              ทำนายฝัน
            </NavLink>
            <NavLink to="/articles" active={isActive("/articles")}>
              บทความ
            </NavLink>
            <NavLink to="/about" active={isActive("/about")}>
              เกี่ยวกับ
            </NavLink>
            <NavLink to="/help" active={isActive("/help")}>
              ช่วยเหลือ
            </NavLink>
          </nav>
        )}

        {showNav && (
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-gold"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
            >
              สมัครสมาชิก
            </Link>
          </div>
        )}

        {showNav && (
          <button
            onClick={() => setOpenMobile((o) => !o)}
            className="rounded-lg border border-gold/20 p-2 text-gold lg:hidden"
            aria-label="menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {openMobile ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        )}
      </div>

      {showNav && openMobile && (
        <div className="lg:hidden">
          <div className="mx-4 mb-4 rounded-2xl border border-gold/15 bg-card/90 p-3 backdrop-blur">
            <MobileLink to="/" onClick={() => setOpenMobile(false)}>
              หน้าหลัก
            </MobileLink>
            <MobileLink to="/bazi" onClick={() => setOpenMobile(false)}>
              ปาจื้อ
            </MobileLink>
            <MobileLink to="/tarot" onClick={() => setOpenMobile(false)}>
              ไพ่ยิปซี (ทุกหมวด)
            </MobileLink>
            <div className="ml-3 border-l border-gold/15 pl-3">
              {tarotCategories.map((c) => (
                <Link
                  key={c.slug}
                  to="/tarot/$type"
                  params={{ type: c.slug }}
                  onClick={() => setOpenMobile(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
                >
                  <span className="text-gold/70">{c.icon}</span>
                  {c.title}
                </Link>
              ))}
            </div>
            <MobileLink to="/dream" onClick={() => setOpenMobile(false)}>
              ทำนายฝัน
            </MobileLink>
            <MobileLink to="/articles" onClick={() => setOpenMobile(false)}>
              บทความ
            </MobileLink>
            <MobileLink to="/about" onClick={() => setOpenMobile(false)}>
              เกี่ยวกับเรา
            </MobileLink>
            <MobileLink to="/contact" onClick={() => setOpenMobile(false)}>
              ติดต่อ
            </MobileLink>
            <MobileLink to="/help" onClick={() => setOpenMobile(false)}>
              ช่วยเหลือ
            </MobileLink>
            <div className="my-2 h-px bg-gold/10" />
            <div className="flex gap-2 p-1">
              <Link
                to="/login"
                onClick={() => setOpenMobile(false)}
                className="flex-1 rounded-xl border border-gold/30 px-3 py-2 text-center text-sm text-gold"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                onClick={() => setOpenMobile(false)}
                className="flex-1 rounded-xl bg-gradient-gold px-3 py-2 text-center text-sm font-semibold text-primary-foreground shadow-gold"
              >
                สมัคร
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`relative rounded-full px-3.5 py-2 text-sm transition-all ${
        active ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-gold"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
    >
      {children}
    </Link>
  );
}
