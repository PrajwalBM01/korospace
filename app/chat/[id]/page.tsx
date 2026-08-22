import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import ChatCanvas from "./canvas-view"
import {
  appNodes,
  ChatNodeDataSchema,
  TextNodeDataSchema,
  WebNodeDataSchema,
} from "@/components/reactflow/nodes"
import type { Message, Node } from "@/app/generated/prisma/client"
import { Edge } from "@xyflow/react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export type NodeCombined = { messages: Message[] } & Node

const toAppNode = (n: NodeCombined): appNodes | null => {
  const baseProperties = {
    id: n.id,
    position: { x: n.positionX, y: n.positionY },
    dragHandle: ".custom_drag_handle",
  }

  switch (n.type) {
    case "text": {
      const parsed = TextNodeDataSchema.safeParse(n.data)
      if (!parsed.success) {
        console.error(`node ${n.id} has invalid data`, parsed.error.issues)
        return null
      }
      return {
        ...baseProperties,
        type: "text",
        data: { title: parsed.data.title, content: parsed.data.content },
      }
    }

    case "web": {
      const parsed = WebNodeDataSchema.safeParse(n.data)
      if (!parsed.success) {
        console.error(`node ${n.id} has invalid data`, parsed.error.issues)
        return null
      }
      return {
        ...baseProperties,
        type: "web",
        data: {
          title: parsed.data.title,
          url: parsed.data.url,
          status: parsed.data.status,
        },
      }
    }

    case "chat": {
      const parsed = ChatNodeDataSchema.safeParse(n.data)

      if (!parsed.success) {
        console.error(`node ${n.id} has invalid data`, parsed.error.issues)
        return null
      }
      return {
        ...baseProperties,
        type: "chat",
        data: {
          model: parsed.data.model,
          messages: n.messages,
        },
      }
    }
    default:
      return null
  }
}

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/signin")

  const canvasData = await prisma.canvas.findUnique({
    where: { id, userId: session.user.id },
    include: {
      nodes: { include: { messages: { orderBy: { createdAt: "asc" } } } },
      edges: true,
    },
  })

  if (!canvasData) redirect("/chat")

  const canvasNodes = canvasData.nodes
    .map(toAppNode)
    .filter((n): n is appNodes => n !== null)

  const canvasEdges: Edge[] = canvasData.edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    className: "custom-edge",
  }))

  return <ChatCanvas nodes={canvasNodes} edges={canvasEdges} />
}

export default page
