"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { invalidateBootstrapForUser } from "@/lib/org/cache";
import { serializeNotification } from "@/lib/serializers";
import { issueInclude } from "@/lib/queries/issues";
import type { Notification } from "@/types";

async function revalidateInbox(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: { select: { slug: true } } },
  });
  const owned = await prisma.organization.findFirst({
    where: { ownerId: userId },
    select: { slug: true },
  });
  const slug = membership?.organization.slug ?? owned?.slug;
  if (slug) await invalidateBootstrapForUser(userId, slug);
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard");
}

export async function markNotificationRead(
  notificationId: string
): Promise<Notification> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("NOT_FOUND");
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
    include: {
      actor: true,
      issue: { include: issueInclude },
      invitation: { include: { invitedBy: true } },
    },
  });

  await revalidateInbox(session.user.id);
  return serializeNotification(notification);
}

export async function markAllNotificationsRead(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  await revalidateInbox(session.user.id);
  return result.count;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!existing || existing.userId !== session.user.id) {
    throw new Error("NOT_FOUND");
  }

  await prisma.notification.delete({ where: { id: notificationId } });
  await revalidateInbox(session.user.id);
}
