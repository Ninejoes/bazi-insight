import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/destiny-cardg")({
  beforeLoad: () => {
    throw redirect({ to: "/destiny-card", replace: true });
  },
});
