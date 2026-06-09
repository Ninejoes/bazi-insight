import { createFileRoute, Outlet } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dream")({
  head: () =>
    seo({
      title: "ทำนายฝัน 解梦",
      description:
        "ค้นหาความหมายของความฝัน เลขนำโชค ช่วงเวลาฝันบอกเหตุ และวิธีแก้เคล็ดฝันร้าย",
      path: "/dream",
      keywords: ["ทำนายฝัน", "ฝันเห็น", "เลขเด็ด", "解梦", "ความหมายความฝัน"],
    }),
  component: () => <Outlet />,
});
