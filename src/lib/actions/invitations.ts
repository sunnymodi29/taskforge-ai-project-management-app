"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  requireOrganizationMember,
  canInviteToProject,
  canManageProject,
  isOrgOwner,
} from "@/lib/auth/rbac";
import { serializeInvitation } from "@/lib/serializers";
import { invalidateBootstrapForUser } from "@/lib/org/cache";
import { sendBrevoEmail, buildProjectInviteEmail } from "@/lib/email/brevo";
import { notifyInvitationReceived } from "@/lib/notifications/service";
import type { Invitation, OrganizationRole, ProjectRole } from "@/types";

const INVITE_TTL_DAYS = 7;

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  );
}

/** Owner invites someone to create projects (org-level project_admin). */
export async function sendOrganizationProjectAdminInvitation(input: {
  organizationId: string;
  email: string;
}): Promise<Invitation> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
  });
  if (!org) throw new Error("NOT_FOUND");
  if (!isOrgOwner(session.user.id, org)) {
    throw new Error("FORBIDDEN: Only the organization owner can invite project admins");
  }

  const email = input.email.trim().toLowerCase();
  await validateNotDuplicateMember(email, input.organizationId);

  const inviter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      organizationId: input.organizationId,
      organizationRole: "project_admin",
      invitedById: session.user.id,
      expiresAt,
    },
    include: { invitedBy: true },
  });

  const inviteUrl = `${appOrigin()}/invite/${invitation.token}`;
  const { subject, html, text } = buildOrgAdminInviteEmail({
    inviteUrl,
    organizationName: org.name,
    inviterName: inviter?.name ?? inviter?.email ?? "Owner",
  });
  await sendBrevoEmail({ to: email, subject, htmlContent: html, textContent: text });

  await notifyInvitationReceived({
    invitationId: invitation.id,
    email,
    token: invitation.token,
    inviterId: session.user.id,
    organizationSlug: org.slug,
    organizationName: org.name,
    organizationRole: "project_admin",
  });

  await invalidateBootstrapForUser(session.user.id, org.slug);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/inbox");
  return serializeInvitation(invitation);
}

/** Owner or project admin invites to a specific project. */
export async function sendProjectInvitation(input: {
  projectId: string;
  email: string;
  role: ProjectRole;
}): Promise<Invitation> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    include: { organization: true },
  });
  if (!project) throw new Error("NOT_FOUND");

  const orgCtx = await requireOrganizationMember(
    session.user.id,
    project.organizationId
  );
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: session.user.id, projectId: project.id },
    },
  });

  if (
    !canInviteToProject(
      session.user.id,
      project.organization,
      orgCtx.member,
      projectMember
    )
  ) {
    throw new Error("FORBIDDEN: Cannot invite to this project");
  }

  const email = input.email.trim().toLowerCase();
  await validateNotDuplicateProjectMember(email, project.id);

  const inviter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      projectId: project.id,
      projectRole: input.role,
      invitedById: session.user.id,
      expiresAt,
    },
    include: { invitedBy: true },
  });

  const inviteUrl = `${appOrigin()}/invite/${invitation.token}`;
  const { subject, html, text } = buildProjectInviteEmail({
    inviteUrl,
    projectName: project.name,
    organizationName: project.organization.name,
    inviterName: inviter?.name ?? "A teammate",
    role: input.role,
  });
  await sendBrevoEmail({ to: email, subject, htmlContent: html, textContent: text });

  await notifyInvitationReceived({
    invitationId: invitation.id,
    email,
    token: invitation.token,
    inviterId: session.user.id,
    organizationSlug: project.organization.slug,
    organizationName: project.organization.name,
    projectName: project.name,
    projectRole: input.role,
  });

  await invalidateBootstrapForUser(session.user.id, project.organization.slug);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inbox");
  return serializeInvitation(invitation);
}

async function validateNotDuplicateMember(email: string, organizationId: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: user.id, organizationId },
      },
    });
    if (member) throw new Error("User is already in this organization");
  }
}

async function validateNotDuplicateProjectMember(email: string, projectId: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (member) throw new Error("User is already on this project");
  }
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { project: { include: { organization: true } } },
  });
  if (!invitation) throw new Error("NOT_FOUND");

  if (invitation.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: invitation.organizationId },
    });
    if (!org || !isOrgOwner(session.user.id, org)) {
      throw new Error("FORBIDDEN");
    }
  } else if (invitation.projectId && invitation.project) {
    const orgCtx = await requireOrganizationMember(
      session.user.id,
      invitation.project.organizationId
    );
    const pm = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: invitation.projectId,
        },
      },
    });
    if (
      !canManageProject(
        session.user.id,
        invitation.project.organization,
        orgCtx.member,
        pm
      )
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "expired" },
  });
  revalidatePath("/dashboard/settings");
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: true,
      project: { include: { organization: true } },
      invitedBy: true,
    },
  });
  if (!invitation) return null;
  if (invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    return { ...invitation, expired: true as const };
  }
  return { ...invitation, expired: false as const };
}

export async function acceptInvitation(token: string): Promise<{
  organizationSlug: string;
  projectKey?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: true,
      project: { include: { organization: true } },
    },
  });
  if (!invitation) throw new Error("NOT_FOUND");
  if (invitation.status !== "pending") throw new Error("Invitation invalid");
  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "expired" },
    });
    throw new Error("Invitation expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (
    !user?.email ||
    user.email.toLowerCase() !== invitation.email.toLowerCase()
  ) {
    throw new Error("Sign in with the invited email address");
  }

  let organizationSlug = "";
  let projectKey: string | undefined;

  await prisma.$transaction(async (tx) => {
    if (invitation.organizationId && invitation.organizationRole) {
      await tx.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: session.user!.id!,
            organizationId: invitation.organizationId,
          },
        },
        create: {
          userId: session.user!.id!,
          organizationId: invitation.organizationId,
          role: invitation.organizationRole,
        },
        update: { role: invitation.organizationRole },
      });
      organizationSlug = invitation.organization!.slug;
    }

    if (invitation.projectId && invitation.projectRole) {
      const project = invitation.project!;
      await tx.projectMember.upsert({
        where: {
          userId_projectId: {
            userId: session.user!.id!,
            projectId: invitation.projectId,
          },
        },
        create: {
          userId: session.user!.id!,
          projectId: invitation.projectId,
          role: invitation.projectRole,
        },
        update: { role: invitation.projectRole },
      });

      await tx.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: session.user!.id!,
            organizationId: project.organizationId,
          },
        },
        create: {
          userId: session.user!.id!,
          organizationId: project.organizationId,
          role: "project_admin",
        },
        update: {},
      });

      organizationSlug = project.organization.slug;
      projectKey = project.key;
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });
  });

  await invalidateBootstrapForUser(session.user.id, organizationSlug);
  revalidatePath("/dashboard", "layout");

  return { organizationSlug, projectKey };
}

function buildOrgAdminInviteEmail(params: {
  inviteUrl: string;
  organizationName: string;
  inviterName: string;
}) {
  const subject = `You're invited to manage projects at ${params.organizationName}`;
  const text = `${params.inviterName} invited you as a project admin at ${params.organizationName}.\n\nAccept: ${params.inviteUrl}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;padding:24px">
      <h2>Project admin invitation</h2>
      <p><strong>${params.inviterName}</strong> invited you to create and manage projects at <strong>${params.organizationName}</strong>.</p>
      <p><a href="${params.inviteUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accept invitation</a></p>
    </div>`;
  return { subject, html, text };
}

