import type { Session } from "next-auth";
import { prisma } from "@/lib/db";

/** Resolves the signed-in user's email for invite / RBAC checks (JWT may omit email). */
export async function resolveSessionEmail(
  session: Session | null,
): Promise<string | null> {
  if (!session?.user?.id) return null;

  const fromSession = session.user.email?.trim().toLowerCase();
  if (fromSession) return fromSession;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  return user?.email?.trim().toLowerCase() ?? null;
}
