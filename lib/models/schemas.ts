import { z } from "zod"

export type DirectModel = {
  id: string
  displayName: string | null
  description: string | null
  contextWindow: number | null
  maxOutputTokens: number | null
}

export const OpenRouterModelSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().nullish(),
  context_length: z.number().nullish(),

  architecture: z
    .object({
      input_modalities: z.array(z.string()).default([]),
      output_modalities: z.array(z.string()).default([]),
    })
    .nullish(),

  pricing: z
    .object({
      prompt: z.string().nullish(),
      completion: z.string().nullish(),
    })
    .nullish(),

  top_provider: z
    .object({
      context_length: z.number().nullish(),
      max_completion_tokens: z.number().nullish(),
    })
    .nullish(),
})

export const OpenRouterResponseSchema = z.object({
  data: z.array(OpenRouterModelSchema),
})

export type OpenRouterModel = z.infer<typeof OpenRouterModelSchema>

export const OpenAIResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      owned_by: z.string().nullish(),
    })
  ),
})

export const GoogleResponseSchema = z.object({
  models: z
    .array(
      z.object({
        name: z.string(),
        displayName: z.string().nullish(),
        description: z.string().nullish(),
        inputTokenLimit: z.number().nullish(),
        outputTokenLimit: z.number().nullish(),
        supportedGenerationMethods: z.array(z.string()).default([]),
      })
    )
    .default([]),
  nextPageToken: z.string().nullish(),
})

export const AnthropicResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      display_name: z.string().nullish(),
    })
  ),
  has_more: z.boolean().default(false),
  last_id: z.string().nullish(),
})
