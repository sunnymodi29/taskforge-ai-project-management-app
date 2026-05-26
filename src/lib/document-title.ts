const APP_NAME = "TaskForge AI";

const PROJECT_SECTION_LABELS: Record<string, string> = {
  board: "Board",
  list: "Issues",
  backlog: "Backlog",
  sprints: "Sprints",
  bugs: "Bugs",
  calendar: "Calendar",
  members: "Members",
  settings: "Settings",
};

export type DocumentTitleContext = {
  projectName?: string;
  projectKey?: string;
  issueKey?: string;
  sprintName?: string;
};

function joinTitle(...parts: string[]): string {
  return [...parts.filter(Boolean), APP_NAME].join(" | ");
}

/** Resolve browser tab title from pathname and loaded app data. */
export function resolveDocumentTitle(
  pathname: string,
  ctx: DocumentTitleContext = {},
): string {
  if (pathname === "/") {
    return APP_NAME;
  }
  if (pathname.startsWith("/login")) {
    return joinTitle("Sign in");
  }
  if (pathname.startsWith("/register")) {
    return joinTitle("Create account");
  }
  if (pathname.startsWith("/invite")) {
    return joinTitle("Invitation");
  }

  if (pathname === "/dashboard") {
    return joinTitle("Dashboard");
  }
  if (pathname === "/dashboard/my-tasks") {
    return joinTitle("My Tasks");
  }
  if (pathname === "/dashboard/inbox") {
    return joinTitle("Inbox");
  }
  if (pathname === "/dashboard/projects") {
    return joinTitle("Projects");
  }
  if (pathname === "/dashboard/analytics") {
    return joinTitle("Analytics");
  }
  if (pathname === "/dashboard/settings") {
    return joinTitle("Settings");
  }

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)(?:\/(.*))?$/);
  if (!projectMatch) {
    return joinTitle("Dashboard");
  }

  const [, routeParam, subpath = ""] = projectMatch;
  const projectLabel =
    ctx.projectName?.trim() || ctx.projectKey?.trim() || routeParam;

  const issueMatch = subpath.match(/^issues\/([^/]+)$/);
  if (issueMatch) {
    return joinTitle(ctx.issueKey ?? "Issue", projectLabel);
  }

  const sprintMatch = subpath.match(/^sprints\/([^/]+)$/);
  if (sprintMatch?.[1]) {
    return joinTitle(ctx.sprintName ?? "Sprint", projectLabel);
  }

  if (!subpath) {
    return joinTitle(projectLabel);
  }

  const section = subpath.split("/")[0] ?? "";
  const sectionLabel =
    PROJECT_SECTION_LABELS[section] ??
    section.charAt(0).toUpperCase() + section.slice(1);

  return joinTitle(sectionLabel, projectLabel);
}
