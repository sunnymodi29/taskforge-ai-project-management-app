"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/app-store";

const MIN_VISIBLE_MS = 380;
const MAX_VISIBLE_MS = 12_000;

export function ProjectSwitchSync() {
  const pathname = usePathname();
  const projectSwitch = useAppStore((s) => s.projectSwitch);
  const endProjectSwitch = useAppStore((s) => s.endProjectSwitch);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectSwitch.active || !projectSwitch.targetPrefix) return;

    const reached =
      pathname === projectSwitch.targetPrefix ||
      pathname.startsWith(`${projectSwitch.targetPrefix}/`);

    if (!reached) return;

    const elapsed = Date.now() - projectSwitch.startedAt;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => {
      endProjectSwitch();
      endTimerRef.current = null;
    }, delay);

    return () => {
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
    };
  }, [
    pathname,
    projectSwitch.active,
    projectSwitch.targetPrefix,
    projectSwitch.startedAt,
    endProjectSwitch,
  ]);

  useEffect(() => {
    if (!projectSwitch.active) return;

    const failSafe = setTimeout(() => {
      endProjectSwitch();
    }, MAX_VISIBLE_MS);

    return () => clearTimeout(failSafe);
  }, [projectSwitch.active, endProjectSwitch]);

  return null;
}
