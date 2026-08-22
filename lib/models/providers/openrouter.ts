import { getJson } from "../http"
import { OpenRouterModel, OpenRouterResponseSchema } from "../schemas"

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"

function isChatModel(m: OpenRouterModel): boolean {
  const out = m.architecture?.output_modalities ?? []
  const inp = m.architecture?.input_modalities ?? []

  if (m.id.endsWith(":batch")) return false

  return (
    out.length > 0 &&
    out.includes("text") && // can be any, but should inculde text, we might use other models in future
    inp.includes("text") // must accept text going in
  )
}

const EXCLUDE = [
  "xiaomi",
  "tencent",
  "deepseek",
  "nex-agi",
  "aion-labs",
  "nvidia",
  "liquid",
]

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const raw = await getJson(OPENROUTER_MODELS_URL)
  const { data } = OpenRouterResponseSchema.parse(raw)
  return data
    .filter(isChatModel)
    .filter((m) => !m.id.startsWith("~"))
    .filter((m) => !EXCLUDE.includes(m.id.split("/")[0]))
}
