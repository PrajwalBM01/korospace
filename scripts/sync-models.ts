import "dotenv/config"
import { buildPlan } from "../lib/models/plan"
import { fetchOpenRouterModels } from "../lib/models/providers/openrouter"
import { fetchAnthropicModels } from "../lib/models/providers/anthropic"
import { fetchOpenAiModels } from "../lib/models/providers/openai"
import { fetchGoogleModels } from "../lib/models/providers/google"
import type { DirectModel } from "../lib/models/schemas"
import prisma from "@/lib/prisma"
import { applyPlan } from "@/lib/models/write"

const write = process.argv.includes("--write")

async function safe<T>(
  label: string,
  envVar: string,
  fn: (key: string) => Promise<T>
): Promise<T | null> {
  const key = process.env[envVar]
  if (!key) {
    console.log(`${label.padEnd(11)} skipped — ${envVar} not set`)
    return null
  }
  try {
    return await fn(key)
  } catch (error) {
    console.log(`${label.padEnd(11)} FAILED — ${(error as Error).message}`)
    return null
  }
}

const openrouter = await fetchOpenRouterModels()
console.log(`OPENROUTER  ${openrouter.length} models`)

const anthropic = await safe<DirectModel[]>(
  "ANTHROPIC",
  "ANTHROPIC_API_KEY",
  fetchAnthropicModels
)
const openai = await safe<DirectModel[]>(
  "OPENAI",
  "OPENAI_API_KEY",
  fetchOpenAiModels
)
const google = await safe<DirectModel[]>(
  "GOOGLE",
  "GOOGLE_AI_API_KEY",
  fetchGoogleModels
)

const plan = buildPlan({ openrouter, anthropic, google, openai })

//logs to check can be removed
// console.log(`\n${"=".repeat(78)}`)
// console.log(`PLAN: ${plan.models.length} models, ${plan.routes.length} routes`)
// console.log(`providers synced: ${plan.syncedProviders.join(", ")}`)
// console.log("=".repeat(78))

// const sample = [
//   ...plan.routes.filter((r) => r.provider === "OPENROUTER").slice(0, 6),
//   ...plan.routes.filter((r) => r.provider !== "OPENROUTER").slice(0, 9),
// ]

// console.log(
//   `\n${"provider".padEnd(11)} ${"model id".padEnd(38)} ${"in/M".padEnd(10)} ${"out/M".padEnd(10)} ctx`
// )
// for (const r of sample) {
//   console.log(
//     r.provider.padEnd(11),
//     r.providerModelId.padEnd(38),
//     (r.inputPricePerM ?? "—").padEnd(10),
//     (r.outputPricePerM ?? "—").padEnd(10),
//     r.contextWindow ?? "—"
//   )
// }

if (!write) {
  console.log("\n(dry run — nothing written. Pass --write to apply.)\n")
  process.exit(0)
}

try {
  const result = await applyPlan(plan)
  console.log(
    `\nWROTE ${result.models} models, ${result.routes} routes` +
      `  (${result.reactivated} reactivated, ${result.deprecated} deprecated)\n`
  )
} finally {
  await prisma.$disconnect()
}
