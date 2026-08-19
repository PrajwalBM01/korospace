import { getJson } from "../http"
import { AnthropicResponseSchema, DirectModel } from "../schemas"

export async function fetchAnthropicModels(apiKey: string): Promise<DirectModel[]> {
  const models: DirectModel[] = []
  let afterId: string | undefined

  do {
    const qs = new URLSearchParams({ limit: "1000" })
    if (afterId) qs.set("after_id", afterId)

    const page = AnthropicResponseSchema.parse(
      await getJson(`https://api.anthropic.com/v1/models?${qs}`, {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      })
    )

    for (const m of page.data) {
      models.push({
        id: m.id,
        displayName: m.display_name ?? null,
        description: null,
        contextWindow: null,   
        maxOutputTokens: null, 
      })
    }

    afterId = page.has_more ? (page.last_id ?? undefined) : undefined
  } while (afterId)

  return models
}