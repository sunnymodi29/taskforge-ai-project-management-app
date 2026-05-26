import type { ProjectRole, OrganizationRole } from "@/types";

export const PROJECT_ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: "project_admin", label: "Project admin" },
  { value: "member", label: "Member" },
];

export const ORG_ROLE_LABELS: Record<OrganizationRole, string> = {
  owner: "Owner",
  project_admin: "Project admin (can create projects)",
};
