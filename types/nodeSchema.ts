import { NodeType } from "@/app/generated/prisma/enums"
import { z } from "zod"
import type { Node } from "@/app/generated/prisma/client"
import {
  ChatNodeDataSchema,
  NodeDataTypes,
  TextNodeDataSchema,
  WebNodeDataSchema,
} from "@/components/reactflow/nodes/index"

export const UpdateNodePosSchema = z.object({
  nodeId: z.string(),
  posX: z.number(),
  posY: z.number(),
})

export type updateNodePosType = z.infer<typeof UpdateNodePosSchema>

const baseNodeFields = {
  canvasId: z.string(),
  nodeId: z.string(),
  posX: z.number(),
  posY: z.number(),
}

export const CreateNodeSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseNodeFields,
    type: z.literal(NodeType.text),
    data: TextNodeDataSchema,
  }),
  z.object({
    ...baseNodeFields,
    type: z.literal(NodeType.web),
    data: WebNodeDataSchema,
  }),
  z.object({
    ...baseNodeFields,
    type: z.literal(NodeType.chat),
    data: ChatNodeDataSchema.omit({ messages: true }),
  }),
])

export type createNodeType = z.infer<typeof CreateNodeSchema>

export const updateTextNodeSchema = z.object({
  nodeId: z.string(),
  content: TextNodeDataSchema,
})

export type updateTextNodeType = z.infer<typeof updateTextNodeSchema>

export const DeleteNodeSchema = z.object({
  nodeId: z.string(),
})

export type deleteNodeType = z.infer<typeof DeleteNodeSchema>

export const switchNodeModelSchema = z.object({
  nodeId: z.string(),
  data: ChatNodeDataSchema.omit({ messages: true }),
})

export type switchNodeModelType = z.infer<typeof switchNodeModelSchema>

export type ActionResult =
  { ok: true; msg: string } | { ok: false; error: string }

export const LOADING_PROPS = {
  node: {
    draggable: false,
    selectable: false,
    connectable: false,
    style: { opacity: 0.5, cursor: "not-allowed", pointerEvents: undefined },
  },
  edge: {
    style: { opacity: 0.2, strokeDasharray: "5, 5" },
    selectable: false,
  },
}

export const LOADED_PROPS = {
  node: {
    draggable: true,
    selectable: true,
    connectable: true,
    style: undefined,
  },
  edge: {
    style: undefined,
    selectable: true,
  },
}
