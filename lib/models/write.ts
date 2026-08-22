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
  reactivated: number
  deprecated: number
}

export async function applyPlan(plan: Plan): Promise<WriteResult> {
  //models
  await mapPool(plan.models, 10, async (m) => {
    await prisma.modelRoute.upsert({
      where: { modelName: m.modelName },
      create: {
        modelId: m.modelId,
        modelName: m.modelName,
        displayName: m.displayName,
        author: m.author,
        description: m.description,
        provider: m.provider,
        inputPricePerM: m.inputPricePerM,
        outputPricePerM: m.outputPricePerM,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        platformEnabled: false,
        byokEnabled: false,
        status: ModelStatus.ACTIVE,
      },
      update: {
        modelName: m.modelName,
        displayName: m.displayName,
        author: m.author,
        description: m.description,
        inputPricePerM: m.inputPricePerM,
        outputPricePerM: m.outputPricePerM,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
      },
    })
  })

  let reactivated = 0
  let deprecated = 0

  for (const provider of plan.syncedProviders) {
    const seen = plan.models
      .filter((m) => m.provider === provider)
      .map((m) => m.modelId)

    if (seen.length === 0) continue

    const back = await prisma.modelRoute.updateMany({
      where: {
        provider,
        modelId: { in: seen },
        status: ModelStatus.DEPRECATED,
      },
      data: { status: ModelStatus.ACTIVE },
    })
    const gone = await prisma.modelRoute.updateMany({
      where: {
        provider,
        modelId: { notIn: seen },
        status: ModelStatus.ACTIVE,
      },
      data: { status: ModelStatus.DEPRECATED },
    })

    reactivated += back.count
    deprecated += gone.count
  }

  return {
    models: plan.models.length,
    reactivated,
    deprecated,
  }
}
