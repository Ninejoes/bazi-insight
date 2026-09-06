import { useState, useEffect, useRef } from "react";
import { ShieldCheck, CheckCircle2, Loader2, Lock, AlertCircle } from "lucide-react";

export interface SecurityShieldProps {
  onVerify?: (data: { token: string; renderedAt: number }) => void;
  required?: boolean;
}

export function SecurityShield({ onVerify }: SecurityShieldProps) {
  const [renderedAt, setRenderedAt] = useState<number>(0);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    mountTimeRef.current = now;
    setRenderedAt(now);
  }, []);

  const handleVerify = (e: React.MouseEvent) => {
    if (verified || verifying) return;
    setError("");
    setVerifying(true);

    // Human telemetry checks
    const elapsed = Date.now() - mountTimeRef.current;
    
    // Check for headless automated browsers (Puppeteer, Playwright, Selenium)
    const isWebDriver = typeof navigator !== "undefined" && Boolean((navigator as unknown as { webdriver?: boolean }).webdriver);
    
    // Fake automated click without coordinate data or synthetic event
    const isSynthetic = e.clientX === 0 && e.clientY === 0 && e.screenX === 0;

    setTimeout(() => {
      if (isWebDriver) {
        setVerifying(false);
        setError("ระบบตรวจพบบราวเซอร์อัตโนมัติ การยืนยันถูกปฏิเสธ");
        return;
      }

      if (elapsed < 400 && isSynthetic) {
        setVerifying(false);
        setError("กรุณาลองใหม่อีกครั้ง");
        return;
      }

      const generatedToken = btoa(
        JSON.stringify({
          v: 1,
          t: Date.now(),
          el: elapsed,
          n: Math.random().toString(36).slice(2, 10),
        }),
      );

      setToken(generatedToken);
      setVerified(true);
      setVerifying(false);
      if (onVerify) {
        onVerify({ token: generatedToken, renderedAt: mountTimeRef.current });
      }
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.03] p-4 transition-all duration-300">
      {/* Honeypot traps: invisible to humans, irresistible to automated scraping bots */}
      <div
        className="sr-only"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <label htmlFor="_hp_website">Leave this empty</label>
        <input
          id="_hp_website"
          type="text"
          name="_hp_website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
        <label htmlFor="_hp_company">Leave this empty</label>
        <input
          id="_hp_company"
          type="text"
          name="_hp_company"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
        <input type="hidden" name="_rendered_at" value={renderedAt} />
        <input type="hidden" name="_shield_token" value={token} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span>ระบบความปลอดภัย Likhitfa Shield</span>
              <Lock className="h-3 w-3 text-gold/70" />
            </div>
            <div className="text-[11px] text-muted-foreground">
              การป้องกันบอทและการโจมตีแบบสแปม 2569
            </div>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-gold/60 font-mono">
          Anti-Bot v2
        </div>
      </div>

      {error ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-3.5">
        <button
          type="button"
          onClick={handleVerify}
          disabled={verified || verifying}
          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all ${
            verified
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 cursor-default"
              : verifying
                ? "border-gold/40 bg-gold/10 text-gold cursor-wait"
                : "border-gold/30 bg-background/50 text-muted-foreground hover:border-gold/60 hover:text-foreground hover:bg-gold/[0.07] cursor-pointer active:scale-[0.99]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                verified
                  ? "border-emerald-400 bg-emerald-500 text-white shadow-sm"
                  : verifying
                    ? "border-gold/60 bg-gold/20"
                    : "border-gold/40 bg-card group-hover:border-gold"
              }`}
            >
              {verified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              ) : verifying ? (
                <Loader2 className="h-3 w-3 animate-spin text-gold" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gold/40" />
              )}
            </div>
            <span className="font-medium">
              {verified
                ? "ยืนยันความปลอดภัยสำเร็จ (Verified Human)"
                : verifying
                  ? "กำลังวิเคราะห์สภาพแวดล้อมความปลอดภัย..."
                  : "คลิกเพื่อยืนยันว่าฉันไม่ใช่โปรแกรมอัตโนมัติ"}
            </span>
          </div>

          <span className="text-[10px] text-muted-foreground/80">
            {verified ? "✓ ปลอดภัย" : "คลิกที่นี่"}
          </span>
        </button>
      </div>
    </div>
  );
}
