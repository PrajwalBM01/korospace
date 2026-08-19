import { ModelStatus } from "@/app/generated/prisma/enums"
import prisma from "../prisma"
import { Plan } from "./plan"

async function mapPool<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let cursor = 0
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        await fn(items[cursor++])
      }
    }
  )
  await Promise.all(workers)
}

export type WriteResult = {
  models: number
  routes: number
  reactivated: number
  deprecated: number
}

export async function applyPlan(plan: Plan): Promise<WriteResult> {
  const idBySlug = new Map<string, string>()

  //models
  await mapPool(plan.models, 10, async (m) => {
    const row = await prisma.model.upsert({
      where: { slug: m.slug },
      create: {
        slug: m.slug,
        authorName: m.authorName,
        description: m.description,
      },
      update: {
        authorName: m.authorName,
        description: m.description,
      },
      select: { id: true, slug: true },
    })
    idBySlug.set(row.slug, row.id)
  })

  //routes

  await mapPool(plan.routes, 10, async (r) => {
    const modelId = idBySlug.get(r.slug)
    if (!modelId) return

    const facts = {
      inputPricePerM: r.inputPricePerM,
      outputPricePerM: r.outputPricePerM,
      contextWindow: r.contextWindow,
      maxOutputTokens: r.maxOutputTokens,
    }

    await prisma.modelRoute.upsert({
      where: {
        provider_providerModelId: {
          provider: r.provider,
          providerModelId: r.providerModelId,
        },
      },
      create: {
        modelId,
        provider: r.provider,
        providerModelId: r.providerModelId,
        platformEnabled: false,
        byokEnabled: false,
        status: ModelStatus.ACTIVE,
        ...facts,
      },
      update: { modelId, ...facts },
    })
  })

  let reactivated = 0
  let deprecated = 0

  for (const provider of plan.syncedProviders) {
    const seen = plan.routes
      .filter((r) => r.provider === provider)
      .map((r) => r.providerModelId)

    if (seen.length === 0) continue

    const back = await prisma.modelRoute.updateMany({
      where: {
        provider,
        providerModelId: { in: seen },
        status: ModelStatus.DEPRECATED,
      },
      data: { status: ModelStatus.ACTIVE },
    })
    const gone = await prisma.modelRoute.updateMany({
      where: {
        provider,
        providerModelId: { notIn: seen },
        status: ModelStatus.ACTIVE,
      },
      data: { status: ModelStatus.DEPRECATED },
    })

    reactivated += back.count
    deprecated += gone.count
  }

  return {
    models: plan.models.length,
    routes: plan.routes.length,
    reactivated,
    deprecated,
  }
}
