import type { RateLimitRule } from "./rate-limit"

export const CHAT_BURST: RateLimitRule = { limit: 20, windowSeconds: 60 }


const ONE_DAY = 60 * 60 * 24

export const CHAT_PLATFORM_USER_DAILY: RateLimitRule = {
  limit: 5,
  windowSeconds: ONE_DAY,
}

export const CHAT_PLATFORM_GLOBAL_DAILY: RateLimitRule = {
  limit: 50,
  windowSeconds: ONE_DAY,
}
