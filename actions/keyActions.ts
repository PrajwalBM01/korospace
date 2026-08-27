"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  AddApiKey,
  AddApiKeyType,
  RemoveApiKey,
  RemoveApiKeyType,
} from "@/types/keySchema"
import { ActionResult } from "@/types/nodeSchema"
import { headers } from "next/headers"
import { checkApiStatus, encryptKey } from "./actionHeper"

export async function setApiKey(data: AddApiKeyType): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  const userId = session.user.id

  const validFields = AddApiKey.safeParse(data)
  if (!validFields.success) return { ok: false, error: "Invalid node data." }

  const provider = validFields.data.provider

  const plainkey = String(validFields.data.key).trim()

  const res = await checkApiStatus({
    key: plainkey,
    provider: provider,
  })

  if (!res.ok) {
    return res
  }

  const ecryptedData = encryptKey(plainkey, userId, provider)

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        providerKeys: {
          upsert: {
            where: { userId_provider: { userId, provider } },
            create: {
              provider,
              ...ecryptedData,
              isValid: true,
            },
            update: {
              ...ecryptedData,
              isValid: true,
            },
          },
        },
      },
    })
    return { ok: true, msg: "API KEY set successful" }
  } catch (e) {
    console.error("error occueered", e)
    return { ok: false, error: "Could not set api key" }
  }
}

export async function removeApiKey(
  data: RemoveApiKeyType
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  const validFields = RemoveApiKey.safeParse(data)
  if (!validFields.success) return { ok: false, error: "Invalid provider." }

  try {
    // deleteMany, not delete: a key that is already gone is not an error,
    // and the userId in the filter is what makes this safe to call with a
    // client-supplied provider.
    await prisma.userProviderKey.deleteMany({
      where: {
        userId: session.user.id,
        provider: validFields.data.provider,
      },
    })
    return { ok: true, msg: "Key removed" }
  } catch (e) {
    console.error("removeApiKey failed", e)
    return { ok: false, error: "Could not remove the key" }
  }
}
