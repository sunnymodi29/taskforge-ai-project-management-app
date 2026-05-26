"use client";

import { Loader } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

/** Blur + top progress bar while a sidebar route change is in flight. */
export function RouteTransitionLoader() {
  const routeTransition = useAppStore((s) => s.routeTransition);
  const projectSwitch = useAppStore((s) => s.projectSwitch);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  if (!routeTransition.active || projectSwitch.active) return null;

  return (
    <Loader
      className={cn(
        "right-0 top-0 bottom-0",
        sidebarCollapsed ? "left-14" : "left-60",
      )}
      aria-label="Loading page"
    />
  );
}
