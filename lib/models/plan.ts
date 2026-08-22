import { ModelProvider } from "@/app/generated/prisma/enums"
import { DirectModel, OpenRouterModel } from "./schemas"
import { perMillion } from "./price"

export type PlannedModel = {
  modelName: string
  displayName: string
  author: string
  modelId: string
  description: string | null
  provider: ModelProvider
  inputPricePerM: string | null
  outputPricePerM: string | null
  contextWindow: number | null
  maxOutputTokens: number | null
}

export type Plan = {
  models: PlannedModel[]
  syncedProviders: ModelProvider[]
}

const getDisplayName = (raw: string | undefined) => {
  if (raw === undefined) {
    return null
  }

  const split = raw.split(":")
  if (split.length === 1) {
    return split[0].trim()
  }
  return split[1].trim()
}

const getAuthor = (raw: string | undefined) => {
  if (raw === undefined) {
    return null
  }

  const split = raw.split(":")
  if (split.length === 1) {
    return null
  }
  return split[0].trim().toLowerCase()
}

export function buildPlan(input: {
  openrouter: OpenRouterModel[] | null
  anthropic: DirectModel[] | null
  openai: DirectModel[] | null
  google: DirectModel[] | null
}): Plan {
  const models: PlannedModel[] = []
  const syncedProviders: ModelProvider[] = []

  const orById = new Map((input.openrouter ?? []).map((m) => [m.id, m]))

  if (input.openrouter) {
    for (const m of input.openrouter) {
      const name = `openrouter:${m.id}`

      models.push({
        modelName: name,
        modelId: m.id,
        displayName: getDisplayName(m.name) ?? m.id,
        author: getAuthor(m.name) ?? m.id.split("/")[0].toLowerCase(),
        description: m.description?.trim() || null,
        provider: ModelProvider.OPENROUTER,
        inputPricePerM: perMillion(m.pricing?.prompt),
        outputPricePerM: perMillion(m.pricing?.completion),
        contextWindow:
          m.top_provider?.context_length ?? m.context_length ?? null,
        maxOutputTokens: m.top_provider?.max_completion_tokens ?? null,
      })
    }
    syncedProviders.push(ModelProvider.OPENROUTER)
  }

  const direct = [
    {
      provider: ModelProvider.ANTHROPIC,
      author: ModelProvider.ANTHROPIC.toLowerCase(),
      list: input.anthropic,
    },
    {
      provider: ModelProvider.OPENAI,
      author: ModelProvider.OPENAI.toLowerCase(),
      list: input.openai,
    },
    {
      provider: ModelProvider.GOOGLE,
      author: ModelProvider.GOOGLE.toLowerCase(),
      list: input.google,
    },
  ]

  for (const source of direct) {
    if (!source.list) continue

    for (const m of source.list) {
      const name = `${source.author}:${m.id}`

      const or = orById.get(`${source.author}/${m.id}`)

      models.push({
        modelName: name,
        modelId: m.id,
        author: source.provider.toLowerCase(),
        displayName: m.displayName ?? m.id,
        description: m.description?.trim() || null,
        provider: source.provider,
        inputPricePerM: perMillion(or?.pricing?.prompt),
        outputPricePerM: perMillion(or?.pricing?.completion),
        contextWindow: m.contextWindow ?? or?.context_length ?? null,
        maxOutputTokens:
          m.maxOutputTokens ?? or?.top_provider?.max_completion_tokens ?? null,
      })
    }
    syncedProviders.push(source.provider)
  }

  return { models, syncedProviders }
}
