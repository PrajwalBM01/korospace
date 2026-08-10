"use server"
import prisma from "@/lib/prisma"
import {
  ActionResult,
  CreateNodeSchema,
  createNodeType,
  DeleteNodeSchema,
  deleteNodeType,
  UpdateNodePosSchema,
  updateNodePosType,
  updateTextNodeSchema,
  updateTextNodeType,
} from "@/types/nodeSchema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Prisma } from "@/app/generated/prisma/client"

export async function insertNode(data: createNodeType): Promise<ActionResult> {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  //input validation
  const validFields = CreateNodeSchema.safeParse(data)
  if (!validFields.success) return { ok: false, error: "Invalid node data." }

  //authz and db query
  try {
    await prisma.canvas.update({
      where: {
        id: validFields.data.canvasId,
        userId: session.user.id,
      },
      data: {
        nodes: {
          create: {
            id: validFields.data.nodeId,
            type: validFields.data.type,
            positionX: validFields.data.posX,
            positionY: validFields.data.posY,
            data: validFields.data.data,
          },
        },
      },
    })
    return { ok: true, msg: "Node created" }
  } catch (e) {
    console.error("error occueered", e)
    return { ok: false, error: "Cound not create the node" }
  }
}

//update
export async function updateNodePos(
  data: updateNodePosType
): Promise<ActionResult> {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  //validation
  const validateFileds = UpdateNodePosSchema.safeParse(data)
  if (!validateFileds.success) return { ok: false, error: "Invalid node data." }

  //authz and db query
  try {
    await prisma.node.update({
      where: {
        id: validateFileds.data.nodeId,
        canvas: { userId: session.user.id },
      },
      data: {
        positionX: validateFileds.data.posX,
        positionY: validateFileds.data.posY,
      },
    })
    return { ok: true, msg: "Node position updated" }
  } catch (e) {
    console.error("error occueered", e)
    return { ok: false, error: "Cound not update node position" }
  }
}

export async function updateTextNode(
  data: updateTextNodeType
): Promise<ActionResult> {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  //validation
  const validField = updateTextNodeSchema.safeParse(data)
  if (!validField.success) return { ok: false, error: "Invalid node data." }

  //authz and query
  try {
    await prisma.node.update({
      where: {
        id: validField.data.nodeId,
        canvas: { userId: session.user.id },
      },
      data: {
        data: validField.data.content,
      },
    })
    return { ok: true, msg: "Node data updated" }
  } catch (e) {
    console.error("error occueered", e)
    return { ok: false, error: "Cound not update the node data" }
  }
}

//delete
export async function deleteNode(data: deleteNodeType): Promise<ActionResult> {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  //validation
  const validateFileds = DeleteNodeSchema.safeParse(data)
  if (!validateFileds.success) return { ok: false, error: "Invalid node data." }

  //authz and query
  try {
    await prisma.node.delete({
      where: {
        id: validateFileds.data.nodeId,
        canvas: { userId: session.user.id },
      },
    })
    return { ok: true, msg: "Node deleted" }
  } catch (e) {
    console.error("delteing node", e)
    // if (e instanceof Prisma.PrismaClientKnownRequestError) {
    //   if (e.code === "P2025") return { ok: false, error: "Node not found" }
    // }
    console.error("error occueered", e)
    return { ok: false, error: "Cound not create the node" }
  }
}
