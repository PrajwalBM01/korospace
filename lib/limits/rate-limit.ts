import "server-only"
import { createId } from "@paralleldrive/cuid2"
import prisma from "../prisma"

export type RateLimitRule = { limit: number; windowSeconds: number }

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

export async function consumeRateLimit(
  name: string,
  subject: string,
  { limit, windowSeconds }: RateLimitRule
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000
  const now = Date.now()
  const bucket = Math.floor(now / windowMs)
  const key = `${name}:${subject}:${bucket}`
  const expiresAt = new Date((bucket + 1) * windowMs)

  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
        INSERT INTO "ApiRateLimit" ("id", "key", "count", "expiresAt")
        VALUES (${createId()}, ${key}, 1, ${expiresAt})
        ON CONFLICT ("key")
          DO UPDATE SET "count" = "ApiRateLimit"."count" + 1
        RETURNING "count"
      `

    const count = Number(rows[0].count)

    if (Math.random() < 0.01) {
      prisma.apiRateLimit
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(() => {})
    }

    return {
      allowed: count <= limit,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((expiresAt.getTime() - now) / 1000)
      ),
    }
  } catch (error) {

    console.error("ratelimit_unavailable", { key, error })
    return { allowed: true, retryAfterSeconds: 0 }
  }
}
