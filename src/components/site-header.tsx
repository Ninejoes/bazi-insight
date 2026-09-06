import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { tarotCategories } from "@/lib/tarot-cards";
import { clearUserSession, readStoredUserSession, type UserSession } from "@/lib/user-session";

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
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const [tarotOpen, setTarotOpen] = useState(false);
  const [numbersOpen, setNumbersOpen] = useState(false);
  const [auspiciousOpen, setAuspiciousOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const isActive = (prefix: string) => (prefix === "/" ? path === "/" : path.startsWith(prefix));
  const closeMobile = () => setOpenMobile(false);
  const logout = () => {
    clearUserSession();
    setUserSession(null);
    setOpenMobile(false);
    void navigate({ to: "/" });
  };

  useEffect(() => {
    const syncSession = () => setUserSession(readStoredUserSession());
    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener("focus", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("focus", syncSession);
    };
  }, [path]);

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
          <nav className="hidden items-center gap-1 xl:flex">
            <NavLink to="/" active={path === "/"}>
              หน้าหลัก
            </NavLink>
            <NavLink to="/bazi" active={isActive("/bazi")}>
              ปาจื้อ
            </NavLink>

            {/* ไพ่ยิปซี */}
            <div
              className="relative"
              onMouseEnter={() => setTarotOpen(true)}
              onMouseLeave={() => setTarotOpen(false)}
            >
              <NavLink to="/tarot" active={isActive("/tarot")}>
                ไพ่ยิปซี <span className="ml-0.5 text-[10px] opacity-70">▾</span>
              </NavLink>
              {tarotOpen && (
                <div className="absolute left-1/2 top-full z-40 w-[28rem] -translate-x-1/2 pt-2">
                  <div className="glass-strong overflow-hidden rounded-2xl p-3 shadow-elegant">
                    <Link
                      to="/tarot"
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span>หน้าไพ่ยิปซีทั้งหมด</span>
                      <span className="text-gold/60">→</span>
                    </Link>
                    <div className="my-1 h-px bg-gold/10" />
                    <DropdownSection title="ดูดวงตามช่วงเวลา">
                      {tarotCategories.slice(0, 3).map((c) => (
                        <DropdownLink key={c.slug} slug={c.slug} icon={c.icon} title={c.title} />
                      ))}
                    </DropdownSection>
                    <DropdownSection title="การดูดวงแบบเฉพาะเจาะจง">
                      <div className="grid grid-cols-2 gap-1">
                        {tarotCategories.slice(3).map((c) => (
                          <DropdownLink key={c.slug} slug={c.slug} icon={c.icon} title={c.title} />
                        ))}
                      </div>
                    </DropdownSection>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/dream" active={isActive("/dream")}>
              ทำนายฝัน
            </NavLink>

            {/* ศาสตร์ตัวเลข & ชื่อ */}
            <div
              className="relative"
              onMouseEnter={() => setNumbersOpen(true)}
              onMouseLeave={() => setNumbersOpen(false)}
            >
              <button
                type="button"
                className={`relative rounded-full px-3 py-2 text-sm transition-all ${
                  isActive("/phone-analysis") || isActive("/name-analysis") || isActive("/lottery")
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                ตัวเลข & ชื่อ <span className="ml-0.5 text-[10px] opacity-70">▾</span>
              </button>
              {numbersOpen && (
                <div className="absolute left-1/2 top-full z-40 w-72 -translate-x-1/2 pt-2">
                  <div className="glass-strong overflow-hidden rounded-2xl p-3 shadow-elegant">
                    <Link
                      to="/phone-analysis"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">📱</span>
                      <div>
                        <div className="font-medium">เช็คเบอร์มงคล</div>
                        <div className="text-[10px] text-muted-foreground">วิเคราะห์คู่เลข 7 คู่ & ผลรวม</div>
                      </div>
                    </Link>
                    <Link
                      to="/name-analysis"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">✍️</span>
                      <div>
                        <div className="font-medium">วิเคราะห์ชื่อ-นามสกุล</div>
                        <div className="text-[10px] text-muted-foreground">เลขศาสตร์พลังดาว & ทักษาปกรณ์</div>
                      </div>
                    </Link>
                    <Link
                      to="/lottery"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">🎰</span>
                      <div>
                        <div className="font-medium">หวย & เลขเด็ด</div>
                        <div className="text-[10px] text-muted-foreground">ตรวจผลหวย สถิติ & ทำนาย</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* เสริมดวง & ฤกษ์มงคล */}
            <div
              className="relative"
              onMouseEnter={() => setAuspiciousOpen(true)}
              onMouseLeave={() => setAuspiciousOpen(false)}
            >
              <button
                type="button"
                className={`relative rounded-full px-3 py-2 text-sm transition-all ${
                  isActive("/lucky-colors") ||
                  isActive("/auspicious-calendar") ||
                  isActive("/tai-sui") ||
                  isActive("/siamsi") ||
                  isActive("/wallpaper")
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                เสริมดวง & ฤกษ์ <span className="ml-0.5 text-[10px] opacity-70">▾</span>
              </button>
              {auspiciousOpen && (
                <div className="absolute left-1/2 top-full z-40 w-80 -translate-x-1/2 pt-2">
                  <div className="glass-strong overflow-hidden rounded-2xl p-3 shadow-elegant">
                    <Link
                      to="/lucky-colors"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">🎨</span>
                      <div>
                        <div className="font-medium">สีเสื้อมงคลประจำวัน</div>
                        <div className="text-[10px] text-muted-foreground">ตารางสีเสริมงาน เงิน รัก กาลกิณี</div>
                      </div>
                    </Link>
                    <Link
                      to="/auspicious-calendar"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">📅</span>
                      <div>
                        <div className="font-medium">ปฏิทินฤกษ์มงคล 2569</div>
                        <div className="text-[10px] text-muted-foreground">วันธงชัย ฤกษ์ออกรถ บ้านใหม่ เปิดร้าน</div>
                      </div>
                    </Link>
                    <Link
                      to="/tai-sui"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">🧧</span>
                      <div>
                        <div className="font-medium">ตรวจปีชง 2569 & วิธีแก้ชง</div>
                        <div className="text-[10px] text-muted-foreground">เช็คปีมะเมีย วัดแก้ชง และบทสวด</div>
                      </div>
                    </Link>
                    <Link
                      to="/siamsi"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">🎋</span>
                      <div>
                        <div className="font-medium">เซียมซีออนไลน์ 28 ใบ</div>
                        <div className="text-[10px] text-muted-foreground">เขย่าติ้วเสี่ยงทาย เจ้าพ่อเสือ หลวงพ่อโสธร</div>
                      </div>
                    </Link>
                    <Link
                      to="/wallpaper"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      <span className="text-lg">📱</span>
                      <div>
                        <div className="font-medium">วอลเปเปอร์สายมูตามธาตุ</div>
                        <div className="text-[10px] text-muted-foreground">ดาวน์โหลดวอลเปเปอร์ 5 ธาตุปาจื้อ HD ฟรี</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/articles" active={isActive("/articles")}>
              บทความ
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                className={`relative rounded-full px-3 py-2 text-sm transition-all ${
                  isActive("/about") || isActive("/help")
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                เพิ่มเติม <span className="ml-0.5 text-[10px] opacity-70">▾</span>
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full z-40 w-48 pt-2">
                  <div className="glass-strong overflow-hidden rounded-2xl p-2 shadow-elegant">
                    <Link
                      to="/about"
                      className="block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      เกี่ยวกับเรา
                    </Link>
                    <Link
                      to="/contact"
                      className="block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      ติดต่อเรา
                    </Link>
                    <Link
                      to="/help"
                      className="block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
                    >
                      ศูนย์ช่วยเหลือ
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {showNav && (
          <div className="hidden items-center gap-2 lg:flex">
            {userSession ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-full bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
                >
                  โปรไฟล์
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-rose-400/30 px-4 py-2 text-sm text-rose-100 hover:bg-rose-400/10"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  rel="nofollow"
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-gold"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  rel="nofollow"
                  className="rounded-full bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
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
        <div className="xl:hidden">
          <div className="mx-4 mb-4 max-h-[80vh] overflow-y-auto rounded-2xl border border-gold/15 bg-card/95 p-3 backdrop-blur shadow-2xl">
            <MobileLink to="/" onClick={closeMobile}>
              หน้าหลัก
            </MobileLink>
            <MobileLink to="/bazi" onClick={closeMobile}>
              ปาจื้อ 八字
            </MobileLink>
            <MobileLink to="/tarot" onClick={closeMobile}>
              ไพ่ยิปซี
            </MobileLink>
            <div className="ml-3 border-l border-gold/15 pl-3">
              <MobileGroupTitle>ดูดวงตามช่วงเวลา</MobileGroupTitle>
              {tarotCategories.slice(0, 3).map((c) => (
                <MobileTarotLink key={c.slug} slug={c.slug} icon={c.icon} title={c.title} onClick={closeMobile} />
              ))}
            </div>
            <MobileLink to="/dream" onClick={closeMobile}>
              ทำนายฝัน
            </MobileLink>

            <div className="my-2 h-px bg-gold/10" />
            <MobileGroupTitle>ศาสตร์ตัวเลข & ชื่อ</MobileGroupTitle>
            <MobileLink to="/phone-analysis" onClick={closeMobile}>
              📱 เช็คเบอร์มงคล
            </MobileLink>
            <MobileLink to="/name-analysis" onClick={closeMobile}>
              ✍️ วิเคราะห์ชื่อ-นามสกุล
            </MobileLink>
            <MobileLink to="/lottery" onClick={closeMobile}>
              🎰 หวย & เลขเด็ด
            </MobileLink>

            <div className="my-2 h-px bg-gold/10" />
            <MobileGroupTitle>เสริมดวง & ฤกษ์มงคล</MobileGroupTitle>
            <MobileLink to="/lucky-colors" onClick={closeMobile}>
              🎨 สีเสื้อมงคลประจำวัน
            </MobileLink>
            <MobileLink to="/auspicious-calendar" onClick={closeMobile}>
              📅 ปฏิทินฤกษ์มงคล 2569
            </MobileLink>
            <MobileLink to="/tai-sui" onClick={closeMobile}>
              🧧 ตรวจปีชง 2569 & แก้ชง
            </MobileLink>
            <MobileLink to="/siamsi" onClick={closeMobile}>
              🎋 เซียมซีออนไลน์ 28 ใบ
            </MobileLink>
            <MobileLink to="/wallpaper" onClick={closeMobile}>
              📱 วอลเปเปอร์สายมู 5 ธาตุ
            </MobileLink>

            <div className="my-2 h-px bg-gold/10" />
            <MobileLink to="/articles" onClick={closeMobile}>
              บทความดูดวง
            </MobileLink>
            <MobileLink to="/about" onClick={closeMobile}>
              เกี่ยวกับเรา
            </MobileLink>
            <MobileLink to="/contact" onClick={closeMobile}>
              ติดต่อเรา
            </MobileLink>
            <MobileLink to="/help" onClick={closeMobile}>
              ศูนย์ช่วยเหลือ
            </MobileLink>
            <div className="my-2 h-px bg-gold/10" />
            {userSession ? (
              <div className="grid gap-2 p-1">
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="rounded-xl bg-gradient-gold px-3 py-2 text-center text-sm font-semibold text-primary-foreground shadow-gold"
                >
                  โปรไฟล์
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-rose-400/30 px-3 py-2 text-center text-sm text-rose-100"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex gap-2 p-1">
                <Link
                  to="/login"
                  rel="nofollow"
                  onClick={closeMobile}
                  className="flex-1 rounded-xl border border-gold/30 px-3 py-2 text-center text-sm text-gold"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  rel="nofollow"
                  onClick={closeMobile}
                  className="flex-1 rounded-xl bg-gradient-gold px-3 py-2 text-center text-sm font-semibold text-primary-foreground shadow-gold"
                >
                  สมัคร
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-1.5">
      <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/65">
        {title}
      </div>
      {children}
    </div>
  );
}

function DropdownLink({ slug, icon, title }: { slug: string; icon: string; title: string }) {
  return (
    <Link
      to="/tarot/$type"
      params={{ type: slug }}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
    >
      <span className="text-base text-gold/80">{icon}</span>
      <span>{title}</span>
    </Link>
  );
}

function LotteryDropdownLink({ hash, label }: { hash: string; label: string }) {
  return (
    <a
      href={`/lottery#${hash}`}
      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
    >
      <span>{label}</span>
      <span className="text-gold/50">→</span>
    </a>
  );
}

function MobileGroupTitle({ children }: { children: ReactNode }) {
  return <div className="px-3 pt-2 pb-1 text-[10px] tracking-[0.2em] text-gold/60">{children}</div>;
}

function MobileTarotLink({
  slug,
  icon,
  title,
  onClick,
}: {
  slug: string;
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <Link
      to="/tarot/$type"
      params={{ type: slug }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
    >
      <span className="text-gold/70">{icon}</span>
      {title}
    </Link>
  );
}

function MobileHashLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold"
    >
      {children}
    </a>
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
