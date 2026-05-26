import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function withRateLimit(userId: string, route: string) {
  const { success } = await rateLimit(`${userId}:${route}`, {
    name: "api",
    requests: 120,
    window: "1 m",
  });
  if (!success) {
    throw new Error("FORBIDDEN: Rate limit exceeded");
  }
}
