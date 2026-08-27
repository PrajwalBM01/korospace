import { z } from "zod"

/**
 * Every environment variable this app reads, validated once at boot.
 *
 * Import `env` instead of touching `process.env` so values are typed and
 * non-optional. Without this, a missing variable surfaces as an opaque
 * runtime error on whatever request happens to need it first.
 */
const EnvSchema = z.object({
  // --- database ---
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url().optional(),

  // --- secrets ---
  ENCRYPTION_KEY: z
    .string()
    .refine((v) => Buffer.from(v, "base64").length === 32, {
      message:
        "must decode to exactly 32 bytes (generate with: openssl rand -base64 32)",
    }),
  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  BETTER_AUTH_URL: z.url(),

  // --- oauth ---
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // --- platform model access ---
  OPENROUTER_API_KEY: z.string().min(1),

  // --- cron (required in production, see check below) ---
  CRON_SECRET: z.string().min(16).optional(),

  // --- model catalog sync: each provider is skipped when absent ---
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n")

  throw new Error(
    `Invalid environment variables:\n${details}\n\nSee .env.example for what each one is.`
  )
}

if (parsed.data.NODE_ENV === "production" && !parsed.data.CRON_SECRET) {
  throw new Error(
    "CRON_SECRET is required in production. Without it /api/cron/* fails " +
      "closed and the model catalog silently stops syncing."
  )
}

export const env = parsed.data