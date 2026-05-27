import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  canCreateProject,
  getAccessibleProjectIds,
  isOrgOwner,
  userHasOrganizationAccess,
} from "@/lib/auth/rbac";
import { cacheGet, cacheSet } from "@/lib/redis";
import {
  serializeUser,
  serializeOrganization,
  serializeOrganizationMember,
  serializeProject,
  serializeProjectMember,
  serializeSprint,
  serializeEpic,
  serializeNotification,
  serializeActivityLog,
  serializeInvitation,
  serializeAIConversation,
} from "@/lib/serializers";
import { getIssues, issueInclude } from "@/lib/queries/issues";
import { ACTIVE_ORG_COOKIE, ACTIVE_PROJECT_COOKIE } from "@/lib/org/cookies";
import type {
  User,
  Organization,
  OrganizationMember,
  Project,
  ProjectMember,
  Issue,
  Sprint,
  Epic,
  Label,
  Notification,
  ActivityLog,
  Invitation,
  AIConversation,
  UserPermissions,
} from "@/types";

export interface BootstrapData {
  currentUser: User;
  organization: Organization;
  organizationMembers: OrganizationMember[];
  permissions: UserPermissions;
  projects: Project[];
  projectMembers: ProjectMember[];
  issues: Issue[];
  sprints: Sprint[];
  epics: Epic[];
  labels: Label[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  invitations: Invitation[];
  aiConversations: AIConversation[];
}

async function resolveOrganizationForUser(userId: string) {
  const invitedMembership = await prisma.organizationMember.findFirst({
    where: { userId, organization: { ownerId: { not: userId } } },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  if (invitedMembership) return invitedMembership.organization;

  const projectOnly = await prisma.projectMember.findFirst({
    where: { userId, project: { organization: { ownerId: { not: userId } } } },
    include: { project: { include: { organization: true } } },
    orderBy: { createdAt: "desc" },
  });
  if (projectOnly) return projectOnly.project.organization;

  const owned = await prisma.organization.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (owned) return owned;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.organization ?? null;
}

export async function getBootstrapData(
  organizationSlug?: string | null,
  userId?: string
): Promise<BootstrapData> {
  const session = await auth();
  const resolvedUserId = userId ?? session?.user?.id;
  if (!resolvedUserId) throw new Error("Unauthorized");

  const cookieStore = await cookies();
  const orgSlugFromCookie = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const effectiveOrgSlug = organizationSlug ?? orgSlugFromCookie ?? null;

  let org = effectiveOrgSlug
    ? await prisma.organization.findUnique({ where: { slug: effectiveOrgSlug } })
    : null;

  if (org && !(await userHasOrganizationAccess(resolvedUserId, org.id))) {
    org = null;
  }

  if (!org) {
    org = await resolveOrganizationForUser(resolvedUserId);
  }
  if (!org) {
    throw new Error("No organization. Complete registration or accept an invitation.");
  }

  const cacheKey = `bootstrap:${resolvedUserId}:${org.slug}`;
  const cached = await cacheGet<BootstrapData>(cacheKey);
  if (cached) return cached;

  const currentUser = await prisma.user.findUnique({
    where: { id: resolvedUserId },
  });
  if (!currentUser) throw new Error("User not found");

  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: resolvedUserId,
        organizationId: org.id,
      },
    },
    include: { user: true },
  });

  const hasOrgAccess = await userHasOrganizationAccess(resolvedUserId, org.id);
  if (!hasOrgAccess) {
    throw new Error("FORBIDDEN: Not a member of this organization");
  }

  const accessible = await getAccessibleProjectIds(resolvedUserId, org.id);
  const projectWhere =
    accessible === "all"
      ? { organizationId: org.id }
      : { organizationId: org.id, id: { in: accessible } };

  const projectIds =
    accessible === "all"
      ? (
          await prisma.project.findMany({
            where: { organizationId: org.id },
            select: { id: true },
          })
        ).map((p) => p.id)
      : accessible;

  const projectKeyCookie = cookieStore.get(ACTIVE_PROJECT_COOKIE)?.value;
  let activeProject = projectKeyCookie
    ? await prisma.project.findFirst({
        where: {
          organizationId: org.id,
          key: projectKeyCookie,
          ...(accessible !== "all" ? { id: { in: accessible } } : {}),
        },
      })
    : null;

  if (!activeProject && projectIds.length > 0) {
    activeProject = await prisma.project.findFirst({
      where: { id: projectIds[0] },
    });
  }

  const [
    orgMembers,
    projects,
    projectMembers,
    issues,
    sprints,
    epics,
    labels,
    notifications,
    activityLogs,
    invitations,
    aiConversations,
  ] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId: org.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.project.findMany({
      where: projectWhere,
      include: {
        lead: true,
        _count: { select: { issues: true, members: true } },
      },
      orderBy: { name: "asc" },
    }),
    projectIds.length > 0
      ? prisma.projectMember.findMany({
          where: { projectId: { in: projectIds } },
          include: { user: true },
        })
      : Promise.resolve([]),
    projectIds.length > 0
      ? getIssues(org.id, projectIds)
      : Promise.resolve([]),
    projectIds.length > 0
      ? prisma.sprint.findMany({
          where: { projectId: { in: projectIds } },
          include: {
            _count: { select: { issues: true } },
            issues: { select: { status: true } },
          },
          orderBy: { startDate: "asc" },
        })
      : Promise.resolve([]),
    projectIds.length > 0
      ? prisma.epic.findMany({
          where: { projectId: { in: projectIds } },
          include: { issues: { select: { status: true } } },
        })
      : Promise.resolve([]),
    projectIds.length > 0
      ? prisma.label.findMany({ where: { projectId: { in: projectIds } } })
      : Promise.resolve([]),
    prisma.notification.findMany({
      where: { userId: currentUser.id },
      include: {
        actor: true,
        issue: { include: issueInclude },
        invitation: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    projectIds.length > 0
      ? prisma.activityLog.findMany({
          where: { projectId: { in: projectIds } },
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
    prisma.invitation.findMany({
      where: {
        OR: [
          { organizationId: org.id, status: "pending" },
          { projectId: { in: projectIds }, status: "pending" },
        ],
      },
      include: { invitedBy: true },
    }),
    projectIds.length > 0
      ? prisma.aIConversation.findMany({
          where: { projectId: { in: projectIds } },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : Promise.resolve([]),
  ]);

  const owner = isOrgOwner(resolvedUserId, org);
  const isOrgProjectAdmin = orgMember?.role === "project_admin";
  const permissions: UserPermissions = {
    isOrgOwner: owner,
    isOrgProjectAdmin: isOrgProjectAdmin,
    canCreateProject: canCreateProject(resolvedUserId, org, orgMember),
    canInviteOrgProjectAdmin: owner,
  };

  const serializedProjects = projects.map((p) => serializeProject(p));

  if (activeProject && !serializedProjects.some((p) => p.id === activeProject!.id)) {
    activeProject = null;
  }

  const result: BootstrapData = {
    currentUser: serializeUser(currentUser),
    organization: serializeOrganization(org),
    organizationMembers: orgMembers.map(serializeOrganizationMember),
    permissions,
    projects: serializedProjects,
    projectMembers: projectMembers.map(serializeProjectMember),
    issues,
    sprints: sprints.map(serializeSprint),
    epics: epics.map(serializeEpic),
    labels: labels.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      projectId: l.projectId,
    })),
    notifications: notifications.map(serializeNotification),
    activityLogs: activityLogs.map(serializeActivityLog),
    invitations: invitations.map((inv) => serializeInvitation(inv)),
    aiConversations: aiConversations.map(serializeAIConversation),
  };

  await cacheSet(cacheKey, result, 120);
  return result;
}

export async function getAnalyticsData() {
  const { computeOrgAnalytics, toLegacyAnalytics } = await import(
    "@/lib/analytics/compute"
  );
  const data = await getBootstrapData();
  return toLegacyAnalytics(computeOrgAnalytics(data));
}
