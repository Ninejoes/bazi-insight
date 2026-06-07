import { createFileRoute, Outlet } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/articles")({
  head: () =>
    seo({
      title: "บทความดูดวง",
      description: "รวมบทความปาจื้อ ไพ่ยิปซี ทำนายฝัน พิธีกรรมเสริมโชค และแนวทางอ่านดวงอย่างมีสติ",
      path: "/articles",
      keywords: ["บทความดูดวง", "ปาจื้อ", "ไพ่ยิปซี", "ทำนายฝัน", "ลิขิตฟ้า"],
    }),
  component: () => <Outlet />,
});
