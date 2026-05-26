"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isOrgOwner } from "@/lib/auth/rbac";
import { serializeOrganization } from "@/lib/serializers";
import { invalidateBootstrapForUser } from "@/lib/org/cache";
import type { Organization } from "@/types";

export async function updateOrganization(input: {
  organizationId: string;
  name: string;
}): Promise<Organization> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
  });
  if (!org) throw new Error("NOT_FOUND");

  if (!isOrgOwner(session.user.id, org)) {
    throw new Error("FORBIDDEN: Only the organization owner can update settings");
  }

  const name = input.name.trim();
  if (!name) throw new Error("Organization name is required");
  if (name.length > 100) throw new Error("Name must be 100 characters or less");

  const updated = await prisma.organization.update({
    where: { id: input.organizationId },
    data: { name },
  });

  await invalidateBootstrapForUser(session.user.id, org.slug);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");

  return serializeOrganization(updated);
}
