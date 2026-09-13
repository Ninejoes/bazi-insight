import { useEffect, useState, useRef } from "react";
import { Lock } from "lucide-react";

declare global {
  interface Window {
    __decodeLikhitfaWatermark?: (text: string) => string | null;
  }
}

function encodeZeroWidth(text: string): string {
  let binary = "";
  for (let i = 0; i < text.length; i++) {
    let b = text.charCodeAt(i).toString(2);
    while (b.length < 8) b = "0" + b;
    binary += b;
  }
  let zw = "\u200D";
  for (let i = 0; i < binary.length; i++) {
    zw += binary[i] === "0" ? "\u200B" : "\u200C";
  }
  return zw + "\u200D";
}

function decodeZeroWidth(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\u200D([\u200B\u200C]+)\u200D/);
  if (!match) return null;
  const bin = match[1].replace(/\u200B/g, "0").replace(/\u200C/g, "1");
  let str = "";
  for (let i = 0; i < bin.length; i += 8) {
    str += String.fromCharCode(parseInt(bin.substr(i, 8), 2));
  }
  return str;
}

export function ContentProtection() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showWarning = (message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToastMessage(message);
    timeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    // 0. Console ASCII Signature & Domain Integrity
    try {
      const badgeStyle =
        "background: #ffd700; color: #0a0a0c; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px; font-family: monospace;";
      const textStyle =
        "color: #94a3b8; font-size: 11px; line-height: 1.6; font-family: sans-serif;";
      const linkStyle =
        "color: #ffd700; font-weight: bold; font-size: 11px; text-decoration: underline;";

      console.log(
        "%c LIKHITFA | CELESTIAL ASTROLOGY %c\n" +
          "© 2026 Likhitfa. All Rights Reserved.\n" +
          "Bazi · Tarot · Shrine · Daily Horoscopes · Wallpapers\n" +
          "Official Platform: %chttps://www.likhitfa.online",
        badgeStyle,
        textStyle,
        linkStyle
      );

      window.__decodeLikhitfaWatermark = decodeZeroWidth;

      const host = window.location.hostname;
      const allowed = [
        "likhitfa.online",
        "www.likhitfa.online",
        "localhost",
        "127.0.0.1",
        ".vercel.app",
      ];
      const isAllowed = allowed.some((h) => host === h || host.endsWith(h));
      if (!isAllowed) {
        console.warn("⚠️ [Likhitfa Shield] Unauthorized mirror / scrape detected on: " + host);
      }
    } catch (err) {}

    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      showWarning("สงวนลิขสิทธิ์เนื้อหาและภาพมงคล © Likhitfa — ไม่อนุญาตให้คลิกขวาหรือคัดลอก");
    };

    // 2. Smart Copy Event with Invisible Watermark & Attribution
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : "";
      if (selectedText && selectedText.trim().length >= 35) {
        const invisibleSig = encodeZeroWidth("LIKHITFA-CELESTIAL-2026-ORIGINAL");
        const splitPoint = Math.min(15, Math.floor(selectedText.length / 2));
        const watermarkedText =
          selectedText.slice(0, splitPoint) + invisibleSig + selectedText.slice(splitPoint);

        const attribution =
          "\n\n--------------------------------------------------\n" +
          "🔮 คัดลอกและอ้างอิงจาก: Likhitfa ลิขิตฟ้า ดูดวง โหราศาสตร์ & ศาลเจ้าเสมือนจริง (https://www.likhitfa.online)\n" +
          "© 2026 Likhitfa. All Rights Reserved. สงวนลิขสิทธิ์ตามกฎหมาย\n" +
          "--------------------------------------------------";

        const finalCopiedText = watermarkedText + attribution;

        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", finalCopiedText);
          e.preventDefault();
          showWarning("คัดลอกข้อความสำเร็จ พร้อมระบุที่มา © Likhitfa");
        }
      }
    };

    // 3. Prevent Dragging Images to desktop/new tabs
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target instanceof HTMLImageElement || target?.tagName === "IMG") {
        e.preventDefault();
        showWarning("สงวนลิขสิทธิ์ภาพมงคล © Likhitfa — ไม่อนุญาตให้ดาวน์โหลดโดยไม่ได้รับอนุญาต");
      }
    };

    // 4. Block Keyboard Shortcuts (Inspect, View Source, Save, Print)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // F12 -> DevTools
      if (e.key === "F12") {
        e.preventDefault();
        showWarning("ระบบความปลอดภัย Likhitfa Shield — ไม่อนุญาตให้ตรวจสอบโค้ด");
        return;
      }

      // Inspect shortcuts
      if (
        isCtrlOrCmd &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "i" ||
          e.key === "J" ||
          e.key === "j" ||
          e.key === "C" ||
          e.key === "c")
      ) {
        e.preventDefault();
        showWarning("ระบบความปลอดภัย Likhitfa Shield — ไม่อนุญาตให้ตรวจสอบซอร์สโค้ด");
        return;
      }

      // Ctrl+U / Cmd+U -> View Source
      if (isCtrlOrCmd && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        showWarning("ระบบความปลอดภัย Likhitfa Shield — ไม่อนุญาตให้ดูซอร์สโค้ดหน้าเว็บ");
        return;
      }

      // Ctrl+S / Cmd+S -> Save Webpage
      if (isCtrlOrCmd && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        showWarning("ระบบความปลอดภัย Likhitfa Shield — ไม่อนุญาตให้บันทึกหน้าเว็บไซต์");
        return;
      }

      // Ctrl+P / Cmd+P -> Print Webpage
      if (isCtrlOrCmd && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        showWarning("ระบบความปลอดภัย Likhitfa Shield — ไม่อนุญาตให้พิมพ์หน้าเว็บไซต์");
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("copy", handleCopy, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("copy", handleCopy, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toastMessage) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none px-4 max-w-lg w-full transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-[oklch(0.12_0.02_60/0.96)] backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/90 text-foreground">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
          <Lock className="h-4 w-4" />
        </div>
        <div className="flex-1 text-xs sm:text-sm font-medium leading-tight text-gold/95">
          {toastMessage}
        </div>
      </div>
    </div>
  );
}
