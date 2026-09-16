import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

function getRedis() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

function createLimiter(prefix: string, requests: number, window: `${number} m`) {
  const redis = getRedis();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
    analytics: true,
  });
}

const loginLimiter = createLimiter("lp:login", 5, "15 m");
const contactLimiter = createLimiter("lp:contact", 3, "60 m");

async function runLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rate-limit] Upstash Redis non configurato — rate limit disattivato.",
      );
    }
    return { success: true, remaining: 999, reset: Date.now() };
  }

  const result = await limiter.limit(key);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/** Login admin: 5 tentativi ogni 15 minuti per IP. */
export async function checkLoginRateLimit(ip: string) {
  return runLimit(loginLimiter, ip);
}

/** Form contatti: 3 invii ogni ora per IP (pronto per Resend). */
export async function checkContactRateLimit(ip: string) {
  return runLimit(contactLimiter, ip);
}
