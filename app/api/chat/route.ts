import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from "ai"
import { NextRequest, NextResponse } from "next/server"
import {
  checkModelUsablity,
  getContext,
  getStreamModel,
  loadMessages,
} from "./helper"
import { saveAssistantMessage, saveUserMessage } from "@/actions/chatActions"
import { createId } from "@paralleldrive/cuid2"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import z from "zod"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { modelSchema } from "@/components/reactflow/nodes/index"
import { consumeRateLimit, refundRateLimit } from "@/lib/limits/rate-limit"
import {
  CHAT_BURST,
  CHAT_PLATFORM_USER_DAILY,
  CHAT_PLATFORM_GLOBAL_DAILY,
} from "@/lib/limits/limits"


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


export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const incoming = await req.json().catch(() => null)
  if (!incoming)
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 })

  const parsed = ChatRequestSchema.safeParse(incoming)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid Request" }, { status: 400 })
  }

  const { nodeId, message, modelDetails } = parsed.data

  const burst = await consumeRateLimit(
    "chat:burst",
    session.user.id,
    CHAT_BURST
  )

  if (!burst.allowed) {
    return NextResponse.json(
      {
        error: "You're sending messages too quickly. Try again in a moment.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(burst.retryAfterSeconds) },
      }
    )
  }

  const isAdmin = session.user.role === "admin"

  if (modelDetails.source === "PLATFORM" && !isAdmin) {
    const userDaily = await consumeRateLimit(
      "chat:platform:user:daily",
      session.user.id,
      CHAT_PLATFORM_USER_DAILY
    )

    if (!userDaily.allowed) {
      return NextResponse.json(
        {
          error: `You've used your ${CHAT_PLATFORM_USER_DAILY.limit} included messages for today. Add your own API key to keep going.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(userDaily.retryAfterSeconds) },
        }
      )
    }

    const globalDaily = await consumeRateLimit(
      "chat:platform:global:daily",
      "all",
      CHAT_PLATFORM_GLOBAL_DAILY
    )

    if (!globalDaily.allowed) {
      await refundRateLimit(
        "chat:platform:user:daily",
        session.user.id,
        CHAT_PLATFORM_USER_DAILY
      )

      return NextResponse.json(
        {
          error:
            "Daily capacity for included models is used up. Try again tomorrow, or add your own API key to keep going.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(globalDaily.retryAfterSeconds) },
        }
      )
    }
  }
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
  const { apiKey, modelId, provider } = modelUsablityCheck.data

  const streamModel = getStreamModel({ provider, modelId, apiKey })

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
    model: streamModel,
    instructions: system,
    messages: await convertToModelMessages(dbMessages),
    abortSignal: req.signal,
    onError: ({ error }) => {
      console.error("llm_error", {
        nodeId,
        userId: session.user.id,
        source: modelDetails.source,
        provider,
        modelId,
        message: error instanceof Error ? error.message : String(error),
      })
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: dbMessages,
      generateMessageId: () => aiId,
      onError: () => "The model could not respons, PLease try again",
      onEnd: async (endData) => {
        const text = endData.responseMessage.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("")
          .trim()

        if (!text) {
          await prisma.message.deleteMany({
            where: { id: message.id, nodeId },
          })
          return
        }

        await saveAssistantMessage(nodeId, {
          messageId: aiId,
          text: text,
        })
      },
    }),
  })
}
