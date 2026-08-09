"use server"
import prisma from "@/lib/prisma"
import {
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

export async function insertNode(data: createNodeType) {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unathorised")
  }

  //input validation
  const validFields = CreateNodeSchema.safeParse(data)
  if (!validFields.success) {
    throw new Error("invalid input data")
  }

  //authz and db query
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
}

//update
export async function updateNodePos(data: updateNodePosType) {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unathorised")
  }

  //validation
  const validateFileds = UpdateNodePosSchema.safeParse(data)
  if (!validateFileds.success) {
    throw new Error("invalid input data")
  }

  //authz and db query
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
}

export async function updateTextNode(data: updateTextNodeType) {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unathorised")
  }

  //validation
  const validField = updateTextNodeSchema.safeParse(data)
  if (!validField.success) {
    throw new Error("invalid input data")
  }

  //authz and query
  await prisma.node.update({
    where: { id: validField.data.nodeId, canvas: { userId: session.user.id } },
    data: {
      data: validField.data.content,
    },
  })
}

//delete
export async function deleteNode(data: deleteNodeType) {
  //authN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unathorised")
  }

  //validation
  const validateFileds = DeleteNodeSchema.safeParse(data)
  if (!validateFileds.success) {
    throw new Error("invlaid input data")
  }

  //authz and query
  await prisma.node.delete({
    where: {
      id: validateFileds.data.nodeId,
      canvas: { userId: session.user.id },
    },
  })
}
