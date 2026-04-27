import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Initialize rate limiter (only if Upstash Redis is configured)
let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
    analytics: true,
  })
}

/**
 * Rate limit authentication requests
 * @param identifier - Email or IP address to rate limit by
 * @returns Object with limit info and success status
 */
export async function rateLimitAuthRequest(identifier: string) {
  if (!ratelimit) {
    // If Upstash is not configured, allow requests (no rate limiting)
    return { success: true, limit: null }
  }

  try {
    const limit = await ratelimit.limit(identifier)
    return { success: limit.success, limit }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // On error, allow the request to proceed
    return { success: true, limit: null }
  }
}
