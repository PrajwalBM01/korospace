import { BuiltInNode, Edge, Node, NodeTypes } from "@xyflow/react"
import chatnode from "./chatnode"
import type { Message as DbMessage } from "@/app/generated/prisma/client"
import textnode from "./textnode"
import webnode from "./webnode"
import { TypeOf, z } from "zod"
import { MessageSchema } from "@/app/generated/zod/schemas/models/Message.schema"

enum status {
  read,
  pending,
  failed,
  idle,
}

const sourceSchema = z.enum(["PLATFORM", "BYOK"])

export const modelSchema = z.object({
  source: sourceSchema,
  author: z.string(),
  modelId: z.string(),
})

export type Source = z.infer<typeof sourceSchema>
export type modelType = z.infer<typeof modelSchema>

//schemas
export const ChatNodeDataSchema = z.object({
  model: modelSchema.default({
    source: "PLATFORM",
    author: "openrouter",
    modelId: "openrouter/free",
  }),

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
