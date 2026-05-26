import { prisma } from "@/lib/db";
import { serializeIssue } from "@/lib/serializers";
import type { Issue } from "@/types";

export const issueInclude = {
  reporter: true,
  assignees: { include: { user: true } },
  labels: { include: { label: true } },
  project: { include: { lead: true } },
  sprint: true,
  epic: true,
  comments: {
    include: {
      author: true,
      reactions: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  attachments: { include: { uploadedBy: true } },
} as const;

export async function getIssues(
  organizationId: string,
  projectIds: string[]
): Promise<Issue[]> {
  if (projectIds.length === 0) return [];

  const issues = await prisma.issue.findMany({
    where: {
      projectId: { in: projectIds },
      project: { organizationId },
    },
    include: issueInclude,
    orderBy: { updatedAt: "desc" },
  });
  return issues.map(serializeIssue);
}

export async function getIssuesByProject(projectId: string): Promise<Issue[]> {
  const issues = await prisma.issue.findMany({
    where: { projectId },
    include: issueInclude,
    orderBy: { updatedAt: "desc" },
  });
  return issues.map(serializeIssue);
}

export async function getIssueById(id: string): Promise<Issue | null> {
  const issue = await prisma.issue.findUnique({
    where: { id },
    include: issueInclude,
  });
  return issue ? serializeIssue(issue) : null;
}
