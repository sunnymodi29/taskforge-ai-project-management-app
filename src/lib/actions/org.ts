"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectAccess, userHasOrganizationAccess } from "@/lib/auth/rbac";
import { invalidateBootstrapForUser } from "@/lib/org/cache";
import {
  ACTIVE_ORG_COOKIE,
  ACTIVE_PROJECT_COOKIE,
  orgCookieOptions,
  projectCookieOptions,
} from "@/lib/org/cookies";

export async function setActiveOrganization(
  organizationSlug: string,
  options?: { revalidate?: boolean },
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const org = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });
  if (!org) throw new Error("NOT_FOUND");

  const hasAccess = await userHasOrganizationAccess(session.user.id, org.id);
  if (!hasAccess) throw new Error("FORBIDDEN");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationSlug, orgCookieOptions());

  if (options?.revalidate === false) return;

  await invalidateBootstrapForUser(session.user.id, org.slug);
  revalidatePath("/dashboard", "layout");
}

export async function setActiveProject(
  projectKey: string,
  options?: { revalidate?: boolean },
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { key: projectKey.toUpperCase() },
    include: { organization: true },
  });
  if (!project) throw new Error("NOT_FOUND");

  await requireProjectAccess(session.user.id, project.id);

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROJECT_COOKIE, projectKey, projectCookieOptions());

  if (options?.revalidate === false) return;

  await invalidateBootstrapForUser(session.user.id, project.organization.slug);
  revalidatePath("/dashboard", "layout");
}
