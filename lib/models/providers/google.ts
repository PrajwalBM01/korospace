import { getJson } from "../http"
import { DirectModel, GoogleResponseSchema } from "../schemas"

const NOT_CHAT =
  /(-tts$|-image|^imagen|^veo|^lyria|nano-banana|native-audio|^aqa|latest|robotics|antigravity)/

export async function fetchGoogleModels(
  apiKey: string
): Promise<DirectModel[]> {
  const models: DirectModel[] = []
  let pageToken: string | undefined

  do {
    const qs = new URLSearchParams({ pageSize: "1000" })
    if (pageToken) qs.set("pageToken", pageToken)

    const page = GoogleResponseSchema.parse(
      await getJson(
        `https://generativelanguage.googleapis.com/v1beta/models?${qs}`,
        { headers: { "x-goog-api-key": apiKey } }
      )
    )

    const filteredModels = page.models.filter((m) => !NOT_CHAT.test(m.name))

    for (const m of filteredModels) {
      if (!m.supportedGenerationMethods.includes("generateContent")) continue

      models.push({
        id: m.name.replace(/^models\//, ""),
        displayName: m.displayName ?? null,
        description: m.description ?? null,
        contextWindow: m.inputTokenLimit ?? null,
        maxOutputTokens: m.outputTokenLimit ?? null,
      })
    }

    pageToken = page.nextPageToken ?? undefined
  } while (pageToken)

  return models
}
