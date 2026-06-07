import { createFileRoute, Outlet } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/tarot")({
  head: () =>
    seo({
      title: "ดูดวงไพ่ยิปซี Tarot",
      description:
        "ดูดวงไพ่ยิปซีออนไลน์ เลือกหมวดรายวัน รายสัปดาห์ รายเดือน ความรัก การงาน การเงิน สุขภาพ และโชคลาภ",
      path: "/tarot",
      keywords: ["ดูดวงไพ่ยิปซี", "ไพ่ทาโรต์", "Tarot", "ไพ่ยิปซีออนไลน์"],
    }),
  component: () => <Outlet />,
});
