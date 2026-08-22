import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from "ai"
import { NextRequest, NextResponse } from "next/server"
import { checkModelUsablity, getContext, loadMessages } from "./helper"
import { saveAssistantMessage, saveUserMessage } from "@/actions/chatActions"
import { createId } from "@paralleldrive/cuid2"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import z from "zod"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { modelSchema } from "@/components/reactflow/nodes/index"

export const runtime = "nodejs"

const ChatRequestSchema = z.object({
  nodeId: z.string().min(1),
  message: z.object({
    id: z.string(),
    parts: z
      .array(
        z.object({
          type: z.literal("text"),
          text: z.string().trim().min(1),
        })
      )
      .min(1)
      .max(1),
  }),
  modelDetails: modelSchema,
})

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const incoming = await req.json().catch(() => null)
  if (!incoming)
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 })
  console.log(incoming)

  const parsed = ChatRequestSchema.safeParse(incoming)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid Request" }, { status: 400 })
  }

  const { nodeId, message, modelDetails } = parsed.data

  console.log(nodeId, message, modelDetails)

  const modelUsablityCheck = await checkModelUsablity(
    modelDetails,
    session.user.id
  )

  if (!modelUsablityCheck.ok) {
    return NextResponse.json(
      { error: modelUsablityCheck.error.msg },
      { status: modelUsablityCheck.error.status }
    )
  }

  const canUseModel = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planTier: true, providerKeys: true },
  })

  const node = await prisma.node.findFirst({
    where: { id: nodeId, canvas: { userId: session.user.id } },
    select: { id: true, canvasId: true },
  })
  if (!node)
    return NextResponse.json({ error: "Node not found" }, { status: 404 })

  try {
    await saveUserMessage(nodeId, {
      messageId: message.id,
      text: message.parts[0].text,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
  }

  const dbMessages = await loadMessages(nodeId)

  //context
  const system = await getContext(nodeId, dbMessages)

  const aiId = createId()

  const result = streamText({
    model: openrouter.chat("openrouter/free"),
    instructions: system,
    messages: await convertToModelMessages(dbMessages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: dbMessages,
      generateMessageId: () => aiId,
      onEnd: async (endData) => {
        const text = endData.responseMessage.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("")
          .trim()

        if (!text) return

        await saveAssistantMessage(nodeId, {
          messageId: aiId,
          text: text,
        })
      },
    }),
  })
}
