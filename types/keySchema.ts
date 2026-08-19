import { z } from "zod"
import { ModelProvider } from "@/app/generated/prisma/enums"

/** The providers the BYOK screen offers — a subset of Prisma's ModelProvider. */
export const BYOK_PROVIDERS = [
  ModelProvider.OPENROUTER,
  ModelProvider.GOOGLE,
  ModelProvider.ANTHROPIC,
  ModelProvider.OPENAI,
] as const

export const ByokProvider = z.enum(BYOK_PROVIDERS)

export type ByokProviderType = z.infer<typeof ByokProvider>

export const AddApiKey = z.object({
  provider: ByokProvider,
  key: z.string().min(1),
})

export type AddApiKeyType = z.infer<typeof AddApiKey>

/** UserProviderKey is unique per [userId, provider], so that is the address. */
export const RemoveApiKey = z.object({
  provider: ByokProvider,
})

export type RemoveApiKeyType = z.infer<typeof RemoveApiKey>
