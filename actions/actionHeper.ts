import crypto from "node:crypto"
import { AddApiKeyType } from "@/types/keySchema"
import { ActionResult } from "@/types/nodeSchema"
import { UserProviderKey } from "@/app/generated/prisma/client"
import { env } from "@/lib/env"

const MASTER = Buffer.from(env.ENCRYPTION_KEY, "base64")
const K_ENC = Buffer.from(
  crypto.hkdfSync(
    "sha256",
    MASTER,
    Buffer.alloc(0),
    Buffer.from("byok:enc:v1"),
    32
  )
)
const K_FPR = Buffer.from(
  crypto.hkdfSync(
    "sha256",
    MASTER,
    Buffer.alloc(0),
    Buffer.from("byok:fpr:v1"),
    32
  )
)

export function encryptKey(plain: string, userId: string, provider: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", K_ENC, iv)
  cipher.setAAD(Buffer.from(`${userId}:${provider}`, "utf8"))

  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])

  return {
    ciphertext: ct.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    fingerprint: crypto.createHmac("sha256", K_FPR).update(plain).digest("hex"),
  }
}

export function decryptKey(row: UserProviderKey) {
  const d = crypto.createDecipheriv(
    "aes-256-gcm",
    K_ENC,
    Buffer.from(row.iv, "base64")
  )
  d.setAAD(Buffer.from(`${row.userId}:${row.provider}`, "utf8"))
  d.setAuthTag(Buffer.from(row.authTag, "base64"))

  const apiKey = Buffer.concat([
    d.update(Buffer.from(row.ciphertext, "base64")),
    d.final(),
  ]).toString("utf8");

  return apiKey
}

export async function keyCheckHttp<T>(
  url: string,
  init: RequestInit = {},
  retries = 2
): Promise<ActionResult> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { accept: "application/json", ...init.headers },
        signal: AbortSignal.timeout(20_000),
      })

      //code faults, expected errors
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return { ok: false, error: "Could not verifiy your api key" }
      }

      //thier server issues
      if (!res.ok)
        //handel error
        return { ok: false, error: "Issue at the providers sercer" }

      return { ok: true, msg: "Good to go, key verified!" }
    } catch (error) {
      if (attempt >= retries)
        return { ok: false, error: "Something went wrong" }
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
    }
  }
}

export const checkApiStatus = async (
  data: AddApiKeyType
): Promise<ActionResult> => {
  switch (data.provider) {
    case "OPENROUTER":
      return await keyCheckHttp("https://openrouter.ai/api/v1/key", {
        headers: {
          Authorization: `Bearer ${data.key}`,
        },
      })
    case "OPENAI":
      return await keyCheckHttp("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${data.key}`,
        },
      })
    case "GOOGLE":
      return await keyCheckHttp(
        `https://generativelanguage.googleapis.com/v1beta/models`,
        { headers: { "x-goog-api-key": data.key } }
      )
    case "ANTHROPIC":
      return await keyCheckHttp(`https://api.anthropic.com/v1/models`, {
        headers: {
          "x-api-key": data.key,
          "anthropic-version": "2023-06-01",
        },
      })
    default:
      return { ok: false, error: "Invalid node data." }
  }
}
