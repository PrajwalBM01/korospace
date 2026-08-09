"use server"

import { Prisma } from "@/app/generated/prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { UIMessage } from "ai"
import { headers } from "next/headers"

// export async function updateMessages(nodeId: string, message: UIMessage) {
//   //authN
//   const session = await auth.api.getSession({ headers: await headers() })
//   if (!session) {
//     throw new Error("Unauthorised: You must login")
//   }

//   const content = message.parts.find((part) => part.type === "text")
//   await prisma.message.create({
//     data: {
//       id: message.id,
//       nodeId: nodeId,
//       role: message.role,
//       content: content?.text ?? "No content",
//     },
//   })
// }

export async function saveUserMessage(
  nodeId: string,
  { messageId, text }: { messageId: string; text: string }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorised: You must login")
  }

  await prisma.message.create({
    data: { id: messageId, nodeId: nodeId, role: "user", content: text },
  })
}

export async function saveAssistantMessage(
  nodeId: string,
  { messageId, text }: { messageId: string; text: string }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorised: You must login")
  }
  await prisma.message.create({
    data: { id: messageId, nodeId: nodeId, role: "assistant", content: text },
  })
}
