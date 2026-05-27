import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, requests: number, window: `${number} s` | `${number} m`) {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${name}:${requests}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        prefix: `trackezz:${name}`,
      })
    );
  }
  return limiters.get(key)!;
}

export async function rateLimit(
  identifier: string,
  options: { name?: string; requests?: number; window?: `${number} m` } = {}
): Promise<{ success: boolean; remaining?: number }> {
  const limiter = getLimiter(
    options.name ?? "api",
    options.requests ?? 100,
    options.window ?? "1 m"
  );

  if (!limiter) return { success: true };

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
