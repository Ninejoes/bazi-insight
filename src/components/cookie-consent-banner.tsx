import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, Shield, Check, X, Sliders, ChevronRight, Lock } from "lucide-react";

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
};

const COOKIE_STORAGE_KEY = "likhitfa_cookie_consent_v1";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    preferences: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        // Show after a brief delay for smooth page entrance
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setPreferences({
            necessary: true,
            analytics: Boolean(parsed.analytics),
            preferences: Boolean(parsed.preferences),
          });
        }
      }
    } catch {
      setIsVisible(true);
    }

    // Allow opening cookie preferences from anywhere (e.g. footer link)
    const handleOpenEvent = () => {
      setIsModalOpen(true);
      setIsVisible(true);
    };

    window.addEventListener("open_cookie_preferences", handleOpenEvent);
    return () => {
      window.removeEventListener("open_cookie_preferences", handleOpenEvent);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          ...prefs,
          timestamp: new Date().toISOString(),
        }),
      );
      window.dispatchEvent(
        new CustomEvent("likhitfa_cookie_consent_changed", { detail: prefs }),
      );
    } catch {
      // ignore local storage errors
    }
    setPreferences(prefs);
    setIsVisible(false);
    setIsModalOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, preferences: true });
  };

  const handleRejectOptional = () => {
    saveConsent({ necessary: true, analytics: false, preferences: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible && !isModalOpen) return null;

  return (
    <>
      {/* Main Bottom Floating Banner */}
      {!isModalOpen && isVisible && (
        <aside
          role="dialog"
          aria-live="polite"
          aria-label="การตั้งค่าคุกกี้และความเป็นส่วนตัว"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
        >
          <div className="pointer-events-auto mx-auto max-w-4xl rounded-3xl border border-gold/35 bg-[oklch(0.12_0.02_60/0.95)] backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold">
                  <Cookie className="h-5 w-5 text-gold animate-pulse" />
                  <span className="font-display text-sm font-semibold tracking-wide text-foreground">
                    ความยินยอมในการใช้คุกกี้ (Cookie & Privacy Consent)
                  </span>
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-mono text-gold/90">
                    PDPA 2569
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  เว็บไซต์ Likhitfa (ลิขิตฟ้า) ใช้คุกกี้ที่จำเป็นเพื่อการทำงานของระบบพยากรณ์
                  และคุกกี้วิเคราะห์เพื่อปรับปรุงความแม่นยำและส่งมอบประสบการณ์ที่ดียิ่งขึ้น
                  ท่านสามารถเลือกยอมรับทั้งหมด หรือกำหนดความยินยอมได้ตามความต้องการ
                  อ่านเพิ่มเติมได้ที่{" "}
                  <Link
                    to="/terms"
                    className="text-gold underline underline-offset-2 hover:text-gold-light"
                  >
                    ข้อกำหนดการใช้งาน
                  </Link>{" "}
                  และ{" "}
                  <Link
                    to="/privacy"
                    className="text-gold underline underline-offset-2 hover:text-gold-light"
                  >
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/5 px-3.5 py-2 text-xs font-medium text-muted-foreground transition hover:border-gold/60 hover:text-foreground hover:bg-gold/10"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  ตั้งค่าคุกกี้
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
                >
                  เฉพาะที่จำเป็น
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold transition hover:scale-[1.02] active:scale-[0.99]"
                >
                  ยอมรับทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Customization Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-gold/30 bg-[oklch(0.12_0.02_60)] p-6 shadow-2xl text-foreground max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="font-display text-base font-semibold">
                    ตั้งค่าความยินยอมคุกกี้
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Likhitfa Privacy Center</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                เราเคารพในสิทธิความเป็นส่วนตัวของคุณ คุณสามารถเลือกเปิดหรือปิดการทำงานของคุกกี้แต่ละประเภทได้
                (ยกเว้นคุกกี้ที่จำเป็นต่อการทำงานของระบบ)
              </p>

              {/* 1. Necessary Cookies */}
              <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Lock className="h-4 w-4 text-gold" />
                    <span>คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary)</span>
                  </div>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    เปิดใช้งานตลอดเวลา
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์ เช่น การรักษาความปลอดภัย การเข้าสู่ระบบ
                  และการบันทึกเซสชันดูดวง ไม่สามารถปิดการใช้งานได้
                </p>
              </div>

              {/* 2. Analytics Cookies */}
              <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Sliders className="h-4 w-4 text-gold" />
                    <span>คุกกี้เพื่อการวิเคราะห์และสถิติ (Analytics)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[oklch(0.78_0.14_75)]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ช่วยให้เราเข้าใจพฤติกรรมการเข้าชมบริการดูดวง จำนวนผู้ใช้งาน
                  และปัญหาทางเทคนิค เพื่อนำมาปรับปรุงความเร็วและความแม่นยำของระบบ
                </p>
              </div>

              {/* 3. Preference Cookies */}
              <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Cookie className="h-4 w-4 text-gold" />
                    <span>คุกกี้เพื่อฟังก์ชันและจดจำค่า (Preferences)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, preferences: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[oklch(0.78_0.14_75)]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ช่วยจดจำการตั้งค่าส่วนบุคคล เช่น วันเดือนปีเกิดสำหรับการดูดวง ปฏิทินฤกษ์มงคล
                  และสถานะการเข้าสู่ระบบ เพื่อความสะดวกสบายในการใช้งานซ้ำ
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gold/20 mt-auto">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              >
                ปฏิเสธทั้งหมด
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium text-gold hover:bg-gold/20 transition"
                >
                  บันทึกการตั้งค่า
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold hover:scale-[1.02] transition"
                >
                  ยอมรับทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
