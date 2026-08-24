import type { RateLimitRule } from "./rate-limit"


export const CHAT_BURST: RateLimitRule = { limit: 20, windowSeconds: 60 }

export const CHAT_PLATFORM_DAILY: RateLimitRule = {
  limit: 200,
  windowSeconds: 60 * 60 * 24,
}