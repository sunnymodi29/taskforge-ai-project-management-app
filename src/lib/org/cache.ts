import { cacheDel } from "@/lib/redis";

export async function invalidateBootstrapForUser(
  userId: string,
  organizationSlug?: string
): Promise<void> {
  if (organizationSlug) {
    await cacheDel(`bootstrap:${userId}:${organizationSlug}`);
    return;
  }
  // Best-effort: common pattern; without slug list we rely on short TTL
  await cacheDel(`bootstrap:${userId}:default`);
}
