import { prisma } from "@/lib/db";
import { invalidateBootstrapForUser } from "@/lib/org/cache";
import type { NotificationType } from "@/generated/prisma/client";

export interface CreateNotificationInput {
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  message: string;
  issueId?: string;
  invitationId?: string;
  organizationSlug?: string;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  if (input.userId === input.actorId) return;

  await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      title: input.title,
      message: input.message,
      issueId: input.issueId,
      invitationId: input.invitationId,
    },
  });

  if (input.organizationSlug) {
    await invalidateBootstrapForUser(input.userId, input.organizationSlug);
  }
}

export async function notifyUsers(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  const unique = [...new Set(userIds)].filter((id) => id !== input.actorId);
  await Promise.all(
    unique.map((userId) => createNotification({ ...input, userId }))
  );
}

export async function notifyInvitationReceived(params: {
  invitationId: string;
  email: string;
  token: string;
  inviterId: string;
  organizationSlug: string;
  organizationName?: string;
  projectName?: string;
  projectRole?: string;
  organizationRole?: string;
}): Promise<void> {
  const recipient = await prisma.user.findUnique({
    where: { email: params.email.toLowerCase() },
    select: { id: true },
  });
  if (!recipient || recipient.id === params.inviterId) return;

  const existing = await prisma.notification.findFirst({
    where: {
      userId: recipient.id,
      invitationId: params.invitationId,
      type: "invitation",
    },
  });
  if (existing) return;

  const isProject = Boolean(params.projectName);
  const title = isProject
    ? `Invitation to ${params.projectName}`
    : `Invitation to ${params.organizationName ?? "organization"}`;
  const message = isProject
    ? `invited you to join as ${params.projectRole?.replace("_", " ") ?? "member"}`
    : `invited you to create and manage projects`;

  await createNotification({
    userId: recipient.id,
    actorId: params.inviterId,
    type: "invitation",
    title,
    message,
    invitationId: params.invitationId,
    organizationSlug: params.organizationSlug,
  });
}

export async function notifyIssueAssigned(params: {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  assigneeIds: string[];
  actorId: string;
  organizationSlug: string;
}): Promise<void> {
  await notifyUsers(params.assigneeIds, {
    actorId: params.actorId,
    type: "assign",
    title: "Assigned to you",
    message: `${params.issueKey}: ${params.issueTitle}`,
    issueId: params.issueId,
    organizationSlug: params.organizationSlug,
  });
}

export async function notifyIssueComment(params: {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  recipientIds: string[];
  actorId: string;
  organizationSlug: string;
  isReply?: boolean;
}): Promise<void> {
  await notifyUsers(params.recipientIds, {
    actorId: params.actorId,
    type: "comment",
    title: params.isReply ? "New reply" : "New comment",
    message: `on ${params.issueKey}: ${params.issueTitle}`,
    issueId: params.issueId,
    organizationSlug: params.organizationSlug,
  });
}

export async function notifyIssueStatusChange(params: {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  statusLabel: string;
  recipientIds: string[];
  actorId: string;
  organizationSlug: string;
}): Promise<void> {
  await notifyUsers(params.recipientIds, {
    actorId: params.actorId,
    type: "status_change",
    title: "Status updated",
    message: `${params.issueKey} → ${params.statusLabel}`,
    issueId: params.issueId,
    organizationSlug: params.organizationSlug,
  });
}
