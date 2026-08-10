"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { CreateEdgeSchema, CreateEdgeType } from "@/types/edgeSchema"
import { ActionResult } from "@/types/nodeSchema"
import { headers } from "next/headers"

export async function insertEdge(data: CreateEdgeType): Promise<ActionResult> {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  //validation
  const validFields = CreateEdgeSchema.safeParse(data)
  if (!validFields.success) return { ok: false, error: "Invalid node data." }

  const n = await prisma.node.count({
    where: {
      canvasId: data.canvasId,
      id: { in: [data.sourceNodeId, data.targetNodeId] },
    },
  })
  if (n !== 2) return { ok: false, error: "Invalid node data." }

  try {
    await prisma.canvas.update({
      where: {
        id: validFields.data.canvasId,
        userId: session.user.id,
      },
      data: {
        edges: {
          create: {
            id: validFields.data.id,
            sourceNodeId: validFields.data.sourceNodeId,
            targetNodeId: validFields.data.targetNodeId,
            branchPointMessageId: validFields.data.branchPointMessageId,
            branchMessage: validFields.data.branchMessage,
          },
        },
      },
    })
    return { ok: true, msg: "Edge created" }
  } catch (e) {
    console.error("error occueered", e)
    return { ok: false, error: "Cound not create the edge" }
  }
}
