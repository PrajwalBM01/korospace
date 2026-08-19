import { getJson } from "../http"
import { DirectModel, OpenAIResponseSchema } from "../schemas"

const OPENAI_MODELS_URL = "https://api.openai.com/v1/models"
const NOT_CHAT =
  /(^whisper|^tts|^dall-e|^sora|^gpt-image|embedding|moderation|-tts|-audio|-realtime|-transcribe|^computer-use|search-preview|chat-latest|chatgpt-image-latest|codex|davinci|babbage)/

export async function fetchOpenAiModels(
  apikey: string
): Promise<DirectModel[]> {
  const raw = await getJson(OPENAI_MODELS_URL, {
    headers: {
      Authorization: `Bearer ${apikey}`,
    },
  })

  const { data } = OpenAIResponseSchema.parse(raw)

  return data
    .filter((m) => !NOT_CHAT.test(m.id))
    .map((m) => ({
      id: m.id,
      displayName: null,
      description: null,
      contextWindow: null,
      maxOutputTokens: null,
    }))
}
