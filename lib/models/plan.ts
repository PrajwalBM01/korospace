import { ModelProvider } from "@/app/generated/prisma/enums"
import { DirectModel, OpenRouterModel } from "./schemas"
import { perMillion } from "./price"

export type PlannedModel = {
  slug: string
  authorName: string
  description: string | null
}

export type PlannedRoute = {
  slug: string // links back to the model above
  provider: ModelProvider
  providerModelId: string
  inputPricePerM: string | null
  outputPricePerM: string | null
  contextWindow: number | null
  maxOutputTokens: number | null
}

export type Plan = {
  models: PlannedModel[]
  routes: PlannedRoute[]
  /** Only these providers may be reconciled later. See the note below. */
  syncedProviders: ModelProvider[]
}

export function buildPlan(input: {
  openrouter: OpenRouterModel[] | null
  anthropic: DirectModel[] | null
  openai: DirectModel[] | null
  google: DirectModel[] | null
}): Plan {
  const models: PlannedModel[] = []
  const routes: PlannedRoute[] = []
  const syncedProviders: ModelProvider[] = []

  const orById = new Map((input.openrouter ?? []).map((m) => [m.id, m]))

  if (input.openrouter) {
    for (const m of input.openrouter) {
      const slug = `openrouter:${m.id}`

      models.push({
        slug,
        authorName: m.id.replace(/^~/, "").split("/")[0],
        description: m.description?.trim() || null,
      })

      routes.push({
        slug,
        provider: ModelProvider.OPENROUTER,
        providerModelId: m.id,
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
      author: "anthropic",
      list: input.anthropic,
    },
    { provider: ModelProvider.OPENAI, author: "openai", list: input.openai },
    { provider: ModelProvider.GOOGLE, author: "google", list: input.google },
  ]

  for (const source of direct) {
    if (!source.list) continue

    for (const m of source.list) {
      const slug = `${source.author}/${m.id}`

      const or = orById.get(`${source.author}:${m.id}`)

      models.push({
        slug,
        authorName: source.author,
        description: m.description?.trim() || null,
      })

      routes.push({
        slug,
        provider: source.provider,
        providerModelId: m.id,
        inputPricePerM: perMillion(or?.pricing?.prompt),
        outputPricePerM: perMillion(or?.pricing?.completion),
        contextWindow: m.contextWindow ?? or?.context_length ?? null,
        maxOutputTokens:
          m.maxOutputTokens ?? or?.top_provider?.max_completion_tokens ?? null,
      })
    }
    syncedProviders.push(source.provider)
  }

  return { models, routes, syncedProviders }
}
