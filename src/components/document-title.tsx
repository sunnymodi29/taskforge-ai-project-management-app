"use client";

import { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { resolveDocumentTitle } from "@/lib/document-title";
import { resolveProjectFromParam } from "@/lib/projects/route";
import { useAppStore } from "@/store/app-store";
import { useDataStore } from "@/store/data-store";

/** Keeps `document.title` in sync with the current route and loaded data. */
export function DocumentTitle() {
  const pathname = usePathname();
  const params = useParams();
  const currentProject = useAppStore((s) => s.currentProject);
  const issues = useDataStore((s) => s.issues);
  const sprints = useDataStore((s) => s.sprints);
  const projects = useDataStore((s) => s.projects);

  const title = useMemo(() => {
    const routeParam =
      typeof params.projectId === "string" ? params.projectId : undefined;
    const issueId =
      typeof params.issueId === "string" ? params.issueId : undefined;
    const sprintId =
      typeof params.sprintId === "string" ? params.sprintId : undefined;

    const project =
      (routeParam
        ? resolveProjectFromParam(projects, routeParam)
        : undefined) ?? (currentProject.id ? currentProject : undefined);

    const issue = issueId
      ? issues.find((i) => i.id === issueId)
      : undefined;
    const sprint = sprintId
      ? sprints.find((s) => s.id === sprintId)
      : undefined;

    return resolveDocumentTitle(pathname, {
      projectName: project?.name,
      projectKey: project?.key,
      issueKey: issue?.issueKey,
      sprintName: sprint?.name,
    });
  }, [
    pathname,
    params.projectId,
    params.issueId,
    params.sprintId,
    issues,
    sprints,
    projects,
    currentProject,
  ]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
