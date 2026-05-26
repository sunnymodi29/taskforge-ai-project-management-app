import { z } from "zod";
import { prisma } from "@/lib/db";
import { issueInclude } from "@/lib/queries/issues";
import { serializeIssue, toDbIssueStatus } from "@/lib/serializers";
import { requireApiUser, withRateLimit } from "@/lib/api/auth";
import { requireProjectAccess } from "@/lib/auth/rbac";
import { handleApiError, jsonOk } from "@/lib/api/response";
import type { IssueStatus } from "@/types";

const patchSchema = z.object({
  status: z
    .enum(["backlog", "todo", "in-progress", "in-review", "done", "cancelled"])
    .optional(),
  title: z.string().min(1).max(500).optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ issueId: string }> }
) {
  try {
    const user = await requireApiUser();
    const { issueId } = await params;
    await withRateLimit(user.id!, `issue:${issueId}`);

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: issueInclude,
    });

    if (!issue) {
      return handleApiError(new Error("NOT_FOUND: Issue not found"));
    }

    await requireProjectAccess(user.id!, issue.projectId);
    return jsonOk(serializeIssue(issue));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ issueId: string }> }
) {
  try {
    const user = await requireApiUser();
    const { issueId } = await params;
    await withRateLimit(user.id!, `issue:patch:${issueId}`);

    const existing = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { projectId: true },
    });

    if (!existing) {
      return handleApiError(new Error("NOT_FOUND: Issue not found"));
    }

    await requireProjectAccess(user.id!, existing.projectId);

    const body = patchSchema.parse(await request.json());

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.priority && { priority: body.priority }),
        ...(body.status && { status: toDbIssueStatus(body.status as IssueStatus) }),
      },
      include: issueInclude,
    });

    return jsonOk(serializeIssue(issue));
  } catch (error) {
    return handleApiError(error);
  }
}
