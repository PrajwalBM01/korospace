"use client"
import { Chat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import type { ChatNodeData } from "@/components/reactflow/nodes"

type DbMessages = ChatNodeData["messages"]

export const toUiMessage = (messages: DbMessages): UIMessage[] =>
  messages?.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }))

/**
 * One Chat instance per node id. useChat({ chat }) shares state between every
 * consumer of the same instance, so the node and the side view stay in sync
 * (including while a response is streaming).
 */

const chats = new Map<string, Chat<UIMessage>>()

export const getNodeChat = (nodeId: string, initial: DbMessages) => {
  let chat = chats.get(nodeId)

  if (!chat) {
    chat = new Chat<UIMessage>({
      id: nodeId,
      messages: toUiMessage(initial),
      transport: new DefaultChatTransport({
        prepareSendMessagesRequest: ({ body, messages }) => ({
          body: {
            nodeId,
            message: messages[messages.length - 1],
            ...body,
          },
        }),
      }),
    })
    chats.set(nodeId, chat)
  }

  return chat
}

export const disposeNodeChat = (nodeId: string) => {
  chats.delete(nodeId)
}

export const disposeAllChats = () => chats.clear()
