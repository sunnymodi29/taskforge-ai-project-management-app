"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useDataStore } from "@/store/data-store";
import { resolveProjectFromParam } from "@/lib/projects/route";

export function ProjectRouteSync() {
  const pathname = usePathname();
  const projects = useDataStore((s) => s.projects);
  const hydrated = useDataStore((s) => s.hydrated);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);

  useEffect(() => {
    if (!hydrated || projects.length === 0) return;

    const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
    if (match) {
      const param = decodeURIComponent(match[1]);
      const project = resolveProjectFromParam(projects, param);
      if (project) setCurrentProject(project);
      return;
    }

    const current = useAppStore.getState().currentProject;
    const stillValid = projects.some((p) => p.id === current.id);
    if (!stillValid && projects[0]) {
      setCurrentProject(projects[0]);
    }
  }, [pathname, projects, hydrated, setCurrentProject]);

  return null;
}
