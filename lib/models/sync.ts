import { buildPlan, type Plan } from "./plan"
import { applyPlan, type WriteResult } from "./write"
import { fetchOpenRouterModels } from "./providers/openrouter"
import { fetchAnthropicModels } from "./providers/anthropic"
import { fetchOpenAiModels } from "./providers/openai"
import { fetchGoogleModels } from "./providers/google"
import type { DirectModel } from "./schemas"

export type SyncOptions = {
  /** Build the plan, write nothing. */
  dryRun?: boolean
  /** Where progress goes. Defaults to console.log. */
  log?: (message: string) => void
}

export type SyncOutcome = {
  plan: Plan
  result: WriteResult | null
}

async function safe<T>(
  label: string,
  envVar: string,
  fn: (key: string) => Promise<T>,
  log: (m: string) => void
): Promise<T | null> {
  const key = process.env[envVar]
  if (!key) {
    log(`${label.padEnd(11)} skipped — ${envVar} not set`)
    return null
  }
  try {
    return await fn(key)
  } catch (error) {
    log(`${label.padEnd(11)} FAILED — ${(error as Error).message}`)
    return null
  }
}

export async function syncModels(
  options: SyncOptions = {}
): Promise<SyncOutcome> {
  const log = options.log ?? console.log

  const openrouter = await fetchOpenRouterModels()
  log(`OPENROUTER  ${openrouter.length} models`)

  const anthropic = await safe<DirectModel[]>("ANTHROPIC", "ANTHROPIC_API_KEY", fetchAnthropicModels, log)
  const openai    = await safe<DirectModel[]>("OPENAI",    "OPENAI_API_KEY",    fetchOpenAiModels,    log)
  const google    = await safe<DirectModel[]>("GOOGLE",    "GOOGLE_AI_API_KEY", fetchGoogleModels,    log)

  const plan = buildPlan({ openrouter, anthropic, openai, google })
  log(`PLAN  ${plan.models.length} models, ${plan.routes.length} routes`)

  if (options.dryRun) {
    log("(dry run — nothing written)")
    return { plan, result: null }
  }

  const result = await applyPlan(plan)
  log(
    `WROTE ${result.models} models, ${result.routes} routes ` +
      `(${result.reactivated} reactivated, ${result.deprecated} deprecated)`
  )

  return { plan, result }
}