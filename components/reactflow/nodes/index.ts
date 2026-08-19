import { BuiltInNode, Edge, Node, NodeTypes } from "@xyflow/react"
import chatnode from "./chatnode"
import type { Message as DbMessage } from "@/app/generated/prisma/client"
import textnode from "./textnode"
import webnode from "./webnode"
import { z } from "zod"
import { MessageSchema } from "@/app/generated/zod/schemas/models/Message.schema"

enum status {
  read,
  pending,
  failed,
  idle,
}

// export type chatNode = Node<
//   {
//     title: string
//     messages: DbMessage[] | []
//     nodeData: { model: string } | null
//   },
//   "chat"
// >

// export type webNode = Node<
//   {
//     title: string
//     nodeData: {
//       url: string
//       status: status
//       content: string
//       fetchedAt: Date
//     } | null
//   },
//   "web"
// >

//schemas
export const ChatNodeDataSchema = z.object({
  title: z.string().default("Untitled"),
  model: z.string().default("gemini-2.5-flash"),
  messages: z.array(MessageSchema).default([]),
})

export const TextNodeDataSchema = z.object({
  title: z.string().default("Untited"),
  content: z.string().default(""),
})

export const WebNodeDataSchema = z.object({
  title: z.string().default("Untitled"),
  url: z.string().default(""),
  status: z.enum(status).default(status.idle),
})

export const NodeDataTypes = [TextNodeDataSchema, WebNodeDataSchema]

//node data types
export type TextNodeData = z.infer<typeof TextNodeDataSchema>
export type WebNodeData = z.infer<typeof WebNodeDataSchema>
export type ChatNodeData = z.infer<typeof ChatNodeDataSchema>

export type NodeData = TextNodeData | WebNodeData | ChatNodeData
//register custom nodes
export type textNode = Node<TextNodeData, "text">
export type webNode = Node<WebNodeData, "web">
export type chatNode = Node<ChatNodeData, "chat">

export type appNodes = textNode | webNode | chatNode

export const nodeTypes = {
  chat: chatnode,
  text: textnode,
  web: webnode,
} satisfies NodeTypes
