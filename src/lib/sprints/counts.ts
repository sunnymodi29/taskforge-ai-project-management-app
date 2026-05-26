import type { Issue, Sprint } from "@/types";

export function refreshSprintCounts(
  sprints: Sprint[],
  issues: Issue[],
  projectId?: string
): Sprint[] {
  const scoped = projectId
    ? sprints.filter((s) => s.projectId === projectId)
    : sprints;
  const scopedIds = new Set(scoped.map((s) => s.id));

  return sprints.map((sprint) => {
    if (projectId && !scopedIds.has(sprint.id)) return sprint;
    const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
    return {
      ...sprint,
      issueCount: sprintIssues.length,
      completedCount: sprintIssues.filter((i) => i.status === "done").length,
    };
  });
}
