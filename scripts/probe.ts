import "dotenv/config"
import { fetchOpenAiModels } from "@/lib/models/providers/openai"
import { fetchOpenRouterModels } from "../lib/models/providers/openrouter"
import { fetchGoogleModels } from "@/lib/models/providers/google"
import { fetchAnthropicModels } from "@/lib/models/providers/anthropic"

const or = await fetchOpenRouterModels()
console.log(`\nOPENROUTER  ${or.length} chat models`)
console.log(
  `            ${or.filter((m) => m.id.endsWith(":free")).length} free\n`
)

const direct = [
  { name: "ANTHROPIC", env: "ANTHROPIC_API_KEY", fetch: fetchAnthropicModels },
  { name: "OPENAI", env: "OPENAI_API_KEY", fetch: fetchOpenAiModels },
  { name: "GOOGLE", env: "GOOGLE_AI_API_KEY", fetch: fetchGoogleModels },
]

for (const p of direct) {
  const key = process.env[p.env]
  if (!key) {
    console.log(`${p.name.padEnd(11)} skipped — ${p.env} not set\n`)
    continue
  }

  try {
    const models = await p.fetch(key)
    console.log(`${p.name.padEnd(11)} ${models.length} models`)
    for (const m of models) {
      console.log(
        `            ${m.id.padEnd(42)} ctx=${m.contextWindow ?? "-"}`
      )
    }
    console.log()
  } catch (error) {
    console.log(`${p.name.padEnd(11)} FAILED — ${(error as Error).message}\n`)
  }
}
