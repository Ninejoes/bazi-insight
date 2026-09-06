import { useEffect, useState, useRef } from "react";
import { ShieldAlert, Lock, AlertCircle } from "lucide-react";

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
    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Allow right-click inside editable input fields so users can paste/edit
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

    // 2. Prevent Copy Event (Ctrl+C / Cmd+C / Selection copy)
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      showWarning("สงวนลิขสิทธิ์เนื้อหา © Likhitfa — ไม่อนุญาตให้คัดลอกข้อความ");
    };

    // 3. Prevent Dragging Images to desktop/new tabs
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target instanceof HTMLImageElement || target?.tagName === "IMG") {
        e.preventDefault();
        showWarning("สงวนลิขสิทธิ์ภาพมงคล © Likhitfa — ไม่อนุญาตให้ดาวน์โหลดโดยไม่ได้รับอนุญาต");
      }
    };

    // 4. Block Keyboard Shortcuts (Inspect, View Source, Save, Print, Cut)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // F12 -> DevTools
      if (e.key === "F12") {
        e.preventDefault();
        showWarning("ระบบความปลอดภัย Likhitfa Shield — ไม่อนุญาตให้ตรวจสอบโค้ด");
        return;
      }

      // Ctrl+Shift+I / Cmd+Opt+I -> Inspect
      // Ctrl+Shift+J / Cmd+Opt+J -> Console
      // Ctrl+Shift+C / Cmd+Opt+C -> Element Selector
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

      // Ctrl+C / Cmd+C -> Copy (outside input fields)
      if (isCtrlOrCmd && (e.key === "c" || e.key === "C") && !isInput) {
        e.preventDefault();
        showWarning("สงวนลิขสิทธิ์เนื้อหา © Likhitfa — ไม่อนุญาตให้คัดลอกข้อความ");
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
