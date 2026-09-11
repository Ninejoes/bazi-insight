import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { clearUserSession, readStoredUserSession, type UserSession } from "@/lib/user-session";
import {
  Sparkles,
  TrendingUp,
  Orbit,
  Layers,
  HeartHandshake,
  Sunrise,
  Moon,
  Scroll,
  CreditCard,
  Smartphone,
  PenTool,
  Ticket,
  Palette,
  CalendarDays,
  ShieldAlert,
  Image as ImageIcon,
  BookOpen,
  Building2,
  Mail,
  HelpCircle,
  Zap,
  Heart,
  Coins,
  Compass,
  Car,
} from "lucide-react";

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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
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
        <Link to="/" className="group flex items-center gap-3 shrink-0">
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
          <nav className="hidden items-center gap-1.5 lg:flex">
            {/* 1. หน้าหลัก */}
            <NavLink to="/" active={path === "/"}>
              หน้าหลัก
            </NavLink>

            {/* 2. บริการดูดวง Mega-Menu */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className={`relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-all ${
                  isActive("/bazi") ||
                  isActive("/tarot") ||
                  isActive("/dream") ||
                  isActive("/siamsi") ||
                  isActive("/virtual-shrine") ||
                  isActive("/life-graph") ||
                  isActive("/brahma-wheel") ||
                  isActive("/love-compatibility") ||
                  isActive("/zodiac") ||
                  isActive("/daily-hub")
                    ? "bg-gold/10 text-gold font-medium"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                <span>บริการดูดวง</span>
                <span className={`text-[10px] transition-transform duration-200 ${servicesOpen ? "rotate-180 text-gold" : "opacity-70"}`}>▾</span>
              </button>
              {servicesOpen && (
                <div className="absolute left-1/2 top-full z-50 w-[38rem] -translate-x-1/2 pt-2">
                  <div className="bg-[#0b0e17] overflow-hidden rounded-2xl border border-gold/35 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.98)] ring-1 ring-gold/25">
                    <div className="grid grid-cols-2 gap-3">
                      {/* คอลัมน์ 1: ชะตาชีวิต & ไพ่ */}
                      <div className="space-y-1">
                        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                          ศาสตร์ชะตาชีวิต & ราศี
                        </div>
                        <Link
                          to="/bazi"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Sparkles className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ปาจื้อ 八字
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              ดวงจีน 4 เสา วิเคราะห์ธาตุและวัยจร
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/life-graph"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              กราฟชีวิต 12 เรือน
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              พล็อตเส้นกราฟชีวิต & ช่วงอายุทองคำ
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/brahma-wheel"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Compass className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              กงล้อพรหมชาติ 12 ราศี
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              พยากรณ์ชะตาชีวิตโบราณ เวียนขวาชาย-ซ้ายหญิง
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/zodiac"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Orbit className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ดูดวง 12 ราศี 2569
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              เจาะลึก 4 ด้าน งาน เงิน รัก สุขภาพ
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/tarot"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Layers className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ไพ่ยิปซีพยากรณ์
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              เปิดไพ่ 78 ใบ ความรัก การงาน การเงิน
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* คอลัมน์ 2: จิตสัมผัส & เสี่ยงทาย */}
                      <div className="space-y-1">
                        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                          ความรัก & เสี่ยงทาย & เช็คดวง
                        </div>
                        <Link
                          to="/love-compatibility"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 group-hover:scale-110 transition-transform">
                            <HeartHandshake className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              สมพงษ์เนื้อคู่ & ความรัก
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              เช็คดวง 2 คน ธาตุสมพงษ์ & คะแนน %
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/daily-hub"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Sunrise className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              เช็คดวงเช้านี้ Daily Hub
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              สีมงคลวันนี้ ไพ่ประจำวัน & ทิศโชค
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/virtual-shrine"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Sparkles className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ไหว้พระออนไลน์เสมือนจริง
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              จุดธูปเทียน ขอพร 10 วัดดัง ทำบุญตรงเข้าวัด
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/dream"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Moon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ทำนายฝันมงคล
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              ถอดรหัสลางบอกเหตุ & เลขเด็ดแม่นยำ
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/siamsi"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                            <Scroll className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              เซียมซีออนไลน์ 28 ใบ
                            </div>
                            <div className="text-[11px] leading-tight text-muted-foreground">
                              เขย่าติ้วเสี่ยงทาย หลวงพ่อโสธร เจ้าพ่อเสือ
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Tarot Quick Links footer */}
                    <div className="mt-3 border-t border-gold/10 pt-2.5">
                      <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                        <span className="text-gold/70 font-medium">ดูดวงด่วน:</span>
                        <div className="flex items-center gap-1.5">
                          <Link to="/tarot/$type" params={{ type: "daily" }} className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] text-gold hover:bg-gold/20">รายวัน</Link>
                          <Link to="/tarot/$type" params={{ type: "love" }} className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] text-gold hover:bg-gold/20">ความรัก</Link>
                          <Link to="/tarot/$type" params={{ type: "finance" }} className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] text-gold hover:bg-gold/20">การเงิน</Link>
                          <Link to="/tarot" className="text-[11px] text-gold/80 hover:text-gold ml-1">ทั้งหมด →</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. เสริมดวง & ตัวเลข 2-Column Menu */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button
                type="button"
                className={`relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-all ${
                  isActive("/phone-analysis") ||
                  isActive("/plate-analysis") ||
                  isActive("/name-analysis") ||
                  isActive("/naming") ||
                  isActive("/destiny-card") ||
                  isActive("/lottery") ||
                  isActive("/lucky-colors") ||
                  isActive("/auspicious-calendar") ||
                  isActive("/tai-sui") ||
                  isActive("/wallpaper")
                    ? "bg-gold/10 text-gold font-medium"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                <span>เสริมดวง & ตัวเลข</span>
                <span className={`text-[10px] transition-transform duration-200 ${toolsOpen ? "rotate-180 text-gold" : "opacity-70"}`}>▾</span>
              </button>
              {toolsOpen && (
                <div className="absolute left-1/2 top-full z-50 w-[42rem] -translate-x-1/2 pt-2">
                  <div className="bg-[#0b0e17] overflow-hidden rounded-2xl border border-gold/35 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.98)] ring-1 ring-gold/25">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Col 1: ศาสตร์ตัวเลข & ชื่อ */}
                      <div className="space-y-1.5 border-r border-gold/10 pr-4">
                        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                          ศาสตร์ตัวเลข & ชื่อมงคล
                        </div>
                        <Link
                          to="/destiny-card"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <CreditCard className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              บัตรชะตาชีวิตดิจิทัล
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Destiny ID Card พรีเมียม 9:16
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/phone-analysis"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <Smartphone className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              เช็คเบอร์มงคล
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              วิเคราะห์คู่เลข 7 คู่ & ผลรวมคู่มงคล
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/plate-analysis"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <Car className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              วิเคราะห์ทะเบียนรถ
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              ทะเบียน 4 มิติ ผลรวม คู่เลข ธาตุสี และแก้เคล็ด
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/name-analysis"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <PenTool className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              วิเคราะห์ชื่อ-นามสกุล
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              เลขศาสตร์พลังดาว & ทักษาปกรณ์
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/naming"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <PenTool className="h-4 w-4 text-amber-400" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ระบบตั้งชื่อมงคล
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              คลังชื่อ 8 วันเกิด กรองกาลกิณี อักษรเดช-ศรี
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/lottery"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <Ticket className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              หวย & สถิติเลขเด็ด
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              ตรวจผลสลากกินแบ่ง สถิติ & ทำนายเลข
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Col 2: ฤกษ์ & เสริมมงคล */}
                      <div className="space-y-1.5">
                        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                          ฤกษ์มงคล & สายมู
                        </div>
                        <Link
                          to="/lucky-colors"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <Palette className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              สีเสื้อมงคลประจำวัน
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              ตารางสีงาน เงิน รัก และสีกาลกิณี
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/auspicious-calendar"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <CalendarDays className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ปฏิทินฤกษ์มงคล 2569
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              วันธงชัย ฤกษ์ออกรถ บ้านใหม่ เปิดร้าน
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/tai-sui"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <ShieldAlert className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              ตรวจปีชง 2569 & แก้ชง
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              เช็คปีชงมะเมีย วัดแก้ชง และบทสวด
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/wallpaper"
                          className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-gold/10"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-base text-gold group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                              วอลเปเปอร์สายมู 5 ธาตุ
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              ดาวน์โหลดภาพ HD จาก NineJoe Studio
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* NineJoe Featured Banner at bottom */}
                    <div className="mt-3 border-t border-gold/10 pt-2.5">
                      <a
                        href="https://ninejoe.online/collections"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl bg-gold/10 px-3 py-2 text-xs font-medium text-gold hover:bg-gold/20 transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-gold" />
                          <span>ชมคอลเลกชันวอลเปเปอร์มงคลกว่า 109+ ภาพ ที่ NineJoe Studio</span>
                        </span>
                        <span className="text-[10px]">เปิดดู ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. บทความ */}
            <NavLink to="/articles" active={isActive("/articles")}>
              บทความ
            </NavLink>

            {/* 5. เกี่ยวกับเรา Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <button
                type="button"
                className={`relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-all ${
                  isActive("/about") || isActive("/contact") || isActive("/help")
                    ? "bg-gold/10 text-gold font-medium"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                <span>เกี่ยวกับเรา</span>
                <span className={`text-[10px] transition-transform duration-200 ${aboutOpen ? "rotate-180 text-gold" : "opacity-70"}`}>▾</span>
              </button>
              {aboutOpen && (
                <div className="absolute right-0 top-full z-50 w-64 pt-2">
                  <div className="bg-[#0b0e17] overflow-hidden rounded-2xl border border-gold/35 p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] ring-1 ring-gold/25">
                    <Link
                      to="/about"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold transition"
                    >
                      <Building2 className="h-4 w-4 text-gold/80" />
                      <div>
                        <div className="font-medium leading-tight">เกี่ยวกับ Likhitfa</div>
                        <div className="text-[10px] text-muted-foreground">พันธกิจและทีมงาน</div>
                      </div>
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold transition"
                    >
                      <Mail className="h-4 w-4 text-gold/80" />
                      <div>
                        <div className="font-medium leading-tight">ติดต่อเรา</div>
                        <div className="text-[10px] text-muted-foreground">สอบถาม & ปรึกษา</div>
                      </div>
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-gold transition"
                    >
                      <HelpCircle className="h-4 w-4 text-gold/80" />
                      <div>
                        <div className="font-medium leading-tight">ศูนย์ช่วยเหลือ</div>
                        <div className="text-[10px] text-muted-foreground">คำถามที่พบบ่อย (FAQ)</div>
                      </div>
                    </Link>

                    <div className="my-1.5 h-px bg-gold/10" />

                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
                      พาร์ตเนอร์สตูดิโอ
                    </div>
                    <a
                      href="https://ninejoe.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-gold hover:bg-gold/10 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-gold" />
                        <span>NineJoe.online</span>
                      </div>
                      <span className="text-[10px] opacity-70">↗</span>
                    </a>
                    <a
                      href="https://ninejoe.online/collections"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-gold hover:bg-gold/10 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5 text-gold" />
                        <span>NineJoe Collections</span>
                      </div>
                      <span className="text-[10px] opacity-70">↗</span>
                    </a>
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
        <div className="lg:hidden">
          <div className="mx-4 mb-4 max-h-[80vh] overflow-y-auto rounded-2xl border border-gold/35 bg-[#0b0e17] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] ring-1 ring-gold/25">
            <MobileLink to="/" onClick={closeMobile}>
              หน้าหลัก
            </MobileLink>

            {/* Group 1: บริการดูดวง */}
            <div className="my-2 h-px bg-gold/10" />
            <MobileGroupTitle>
              <Sparkles className="mr-1.5 inline-block h-3.5 w-3.5 text-gold" />
              บริการดูดวง
            </MobileGroupTitle>
            <MobileLink to="/bazi" icon={<Sparkles className="h-4 w-4" />} onClick={closeMobile}>
              ปาจื้อ 八字 (ดวงจีน 4 เสา)
            </MobileLink>
            <MobileLink to="/life-graph" icon={<TrendingUp className="h-4 w-4" />} onClick={closeMobile}>
              กราฟชีวิต 12 เรือน
            </MobileLink>
            <MobileLink to="/brahma-wheel" icon={<Compass className="h-4 w-4" />} onClick={closeMobile}>
              กงล้อพรหมชาติ 12 ราศี
            </MobileLink>
            <MobileLink to="/zodiac" icon={<Orbit className="h-4 w-4" />} onClick={closeMobile}>
              ดูดวง 12 ราศี 2569
            </MobileLink>
            <MobileLink to="/love-compatibility" icon={<HeartHandshake className="h-4 w-4" />} onClick={closeMobile}>
              สมพงษ์เนื้อคู่ & ความรัก
            </MobileLink>
            <MobileLink to="/daily-hub" icon={<Sunrise className="h-4 w-4" />} onClick={closeMobile}>
              เช็คดวงเช้านี้ Daily Hub
            </MobileLink>
            <MobileLink to="/tarot" icon={<Layers className="h-4 w-4" />} onClick={closeMobile}>
              ไพ่ยิปซีพยากรณ์
            </MobileLink>
            <div className="ml-3 border-l border-gold/15 pl-3 space-y-0.5">
              <MobileTarotLink slug="daily" icon={<Sunrise className="h-3.5 w-3.5" />} title="ดวงรายวัน" onClick={closeMobile} />
              <MobileTarotLink slug="love" icon={<Heart className="h-3.5 w-3.5" />} title="ความรัก & คู่ครอง" onClick={closeMobile} />
              <MobileTarotLink slug="finance" icon={<Coins className="h-3.5 w-3.5" />} title="การเงิน & โชคลาภ" onClick={closeMobile} />
            </div>
            <MobileLink to="/dream" icon={<Moon className="h-4 w-4" />} onClick={closeMobile}>
              ทำนายฝันแม่นยำ & เลขเด็ด
            </MobileLink>
            <MobileLink to="/virtual-shrine" icon={<Sparkles className="h-4 w-4" />} onClick={closeMobile}>
              ไหว้พระออนไลน์ ขอพร 10 วัดดัง
            </MobileLink>
            <MobileLink to="/siamsi" icon={<Scroll className="h-4 w-4" />} onClick={closeMobile}>
              เซียมซีออนไลน์ 28 ใบ
            </MobileLink>

            {/* Group 2: เสริมดวง & ตัวเลข */}
            <div className="my-2 h-px bg-gold/10" />
            <MobileGroupTitle>
              <Sparkles className="mr-1.5 inline-block h-3.5 w-3.5 text-gold" />
              เสริมดวง & ตัวเลข
            </MobileGroupTitle>
            <MobileLink to="/destiny-card" icon={<CreditCard className="h-4 w-4" />} onClick={closeMobile}>
              บัตรชะตาชีวิตดิจิทัล
            </MobileLink>
            <MobileLink to="/phone-analysis" icon={<Smartphone className="h-4 w-4" />} onClick={closeMobile}>
              เช็คเบอร์มงคล
            </MobileLink>
            <MobileLink to="/plate-analysis" icon={<Car className="h-4 w-4" />} onClick={closeMobile}>
              วิเคราะห์ทะเบียนรถ
            </MobileLink>
            <MobileLink to="/name-analysis" icon={<PenTool className="h-4 w-4" />} onClick={closeMobile}>
              วิเคราะห์ชื่อ-นามสกุล
            </MobileLink>
            <MobileLink to="/naming" icon={<PenTool className="h-4 w-4 text-amber-400" />} onClick={closeMobile}>
              ระบบตั้งชื่อมงคล
            </MobileLink>
            <MobileLink to="/lottery" icon={<Ticket className="h-4 w-4" />} onClick={closeMobile}>
              หวย & เลขเด็ดสำนักดัง
            </MobileLink>
            <MobileLink to="/lucky-colors" icon={<Palette className="h-4 w-4" />} onClick={closeMobile}>
              สีเสื้อมงคลประจำวัน
            </MobileLink>
            <MobileLink to="/auspicious-calendar" icon={<CalendarDays className="h-4 w-4" />} onClick={closeMobile}>
              ปฏิทินฤกษ์มงคล 2569
            </MobileLink>
            <MobileLink to="/tai-sui" icon={<ShieldAlert className="h-4 w-4" />} onClick={closeMobile}>
              ตรวจปีชง 2569 & แก้ชง
            </MobileLink>
            <MobileLink to="/wallpaper" icon={<ImageIcon className="h-4 w-4" />} onClick={closeMobile}>
              วอลเปเปอร์สายมู 5 ธาตุ
            </MobileLink>

            {/* Group 3: ข้อมูล & สตูดิโอ */}
            <div className="my-2 h-px bg-gold/10" />
            <MobileGroupTitle>
              <BookOpen className="mr-1.5 inline-block h-3.5 w-3.5 text-gold" />
              ข้อมูล & พาร์ตเนอร์
            </MobileGroupTitle>
            <MobileLink to="/articles" icon={<BookOpen className="h-4 w-4" />} onClick={closeMobile}>
              บทความดูดวง
            </MobileLink>
            <MobileLink to="/about" icon={<Building2 className="h-4 w-4" />} onClick={closeMobile}>
              เกี่ยวกับเรา
            </MobileLink>
            <MobileLink to="/contact" icon={<Mail className="h-4 w-4" />} onClick={closeMobile}>
              ติดต่อเรา
            </MobileLink>
            <MobileLink to="/help" icon={<HelpCircle className="h-4 w-4" />} onClick={closeMobile}>
              ศูนย์ช่วยเหลือ (FAQ)
            </MobileLink>

            <div className="my-2.5 h-px bg-gold/10" />
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://ninejoe.online"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold shadow-gold hover:bg-gold hover:text-primary-foreground transition"
              >
                <Zap className="h-3.5 w-3.5 text-gold" />
                <span>NineJoe</span>
                <span className="text-[10px]">↗</span>
              </a>
              <a
                href="https://ninejoe.online/collections"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold shadow-gold hover:bg-gold hover:text-primary-foreground transition"
              >
                <ImageIcon className="h-3.5 w-3.5 text-gold" />
                <span>Wallpapers</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
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

function MobileGroupTitle({ children }: { children: ReactNode }) {
  return <div className="flex items-center px-3 pt-2 pb-1 text-[10px] tracking-[0.2em] text-gold/70">{children}</div>;
}

function MobileTarotLink({
  slug,
  icon,
  title,
  onClick,
}: {
  slug: string;
  icon: ReactNode;
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
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-gold/70">{icon}</span>
      <span>{title}</span>
    </Link>
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
  icon,
  children,
}: {
  to: string;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-gold/10 hover:text-gold"
    >
      {icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gold/80">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
