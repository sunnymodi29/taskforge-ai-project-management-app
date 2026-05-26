import type { Issue, IssueStatus } from "@/types";

/** Client-side helpers — pass data from useDataStore */
export function getIssuesByStatus(issues: Issue[], status: IssueStatus, projectId: string) {
  return issues.filter((i) => i.status === status && i.projectId === projectId);
}

export function getIssuesByProject(issues: Issue[], projectId: string) {
  return issues.filter((i) => i.projectId === projectId);
}

export function getIssuesBySprint(issues: Issue[], sprintId: string) {
  return issues.filter((i) => i.sprintId === sprintId);
}

export function getMyIssues(issues: Issue[], userId: string) {
  return issues.filter((i) => i.assigneeIds.includes(userId));
}

export function getUnreadNotificationCount(notifications: { read: boolean }[]) {
  return notifications.filter((n) => !n.read).length;
}
