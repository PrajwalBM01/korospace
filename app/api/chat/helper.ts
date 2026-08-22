import { Edge, ModelProvider } from "@/app/generated/prisma/client"
import { modelType, TextNodeDataSchema } from "@/components/reactflow/nodes"
import prisma from "@/lib/prisma"
import { UIMessage } from "ai"
import { NextResponse } from "next/server"

export type ModelUsablityResult =
  | { ok: true; msg: string }
  | { ok: false; error: { msg: string; status: number } }

export async function loadMessages(nodeId: string): Promise<UIMessage[]> {
  const messages = await prisma.message.findMany({
    where: { nodeId: nodeId },
    orderBy: { createdAt: "asc" },
  })

  return messages.map((message) => {
    return {
      id: message.id,
      role: message.role,
      parts: [{ type: "text", text: message.content }],
    }
  })
}

const getCutoffs = (dbedges: Edge[]) => {
  const cutoffs = new Map<
    string,
    { messageId: string | null; highlight: string | null } | null
  >()

  for (const edge of dbedges) {
    if (edge.branchPointMessageId) {
      cutoffs.set(edge.sourceNodeId, {
        messageId: edge.branchPointMessageId,
        highlight: edge.branchMessage,
      })
    } else {
      cutoffs.set(edge.sourceNodeId, null)
    }
  }

  return cutoffs
}

const getAncestors = (nodeId: string, dbEdges: Edge[]): string[] => {
  const parentsMap = new Map<string, string[]>()

  for (const edge of dbEdges) {
    if (!parentsMap.has(edge.targetNodeId)) {
      parentsMap.set(edge.targetNodeId, [])
    }
    parentsMap.get(edge.targetNodeId)?.push(edge.sourceNodeId)
  }

  const visted = new Set<string>()
  const ancestors: string[] = []

  function dfs(current: string) {
    const parents = parentsMap.get(current) ?? []

    for (const parent of parents) {
      if (visted.has(parent)) continue

      visted.add(parent)

      dfs(parent)
      ancestors.push(parent)
    }
  }
  dfs(nodeId)
  return ancestors
}

export async function getContext(nodeId: string, dbMessages: UIMessage[]) {
  const nodeDetails = await prisma.node.findUnique({
    where: { id: nodeId },
    include: { incoming: true },
  })

  if (dbMessages.length <= 1 && nodeDetails?.incoming.length === 0) {
    return "You are a helpful assistant."
  }

  const dbEdges = await prisma.edge.findMany({
    where: { canvasId: nodeDetails?.canvasId },
  })

  const ancestors = getAncestors(nodeId, dbEdges)
  const cutoffs = getCutoffs(dbEdges)

  const connectedNodes = await prisma.node.findMany({
    where: {
      id: {
        in: ancestors,
      },
      canvasId: nodeDetails?.canvasId,
    },
    select: {
      id: true,
      type: true,
      data: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  const arrangeAncestors = new Map(connectedNodes.map((n) => [n.id, n]))

  let sources = ``

  for (const id of ancestors) {
    const node = arrangeAncestors.get(id)
    if (!node) continue

    //text node
    if (node.type === "text") {
      const data = TextNodeDataSchema.parse(node.data)
      sources += ` <source type=${node.type}>${data.content}</source>`
    }

    //chat node
    if (node.type === "chat") {
      let chatContent = ``
      const cutoff = cutoffs.get(node.id) ?? null
      const msgs = cutoff
        ? node.messages.slice(
            0,
            node.messages.findIndex((msg) => msg.id === cutoff.messageId) + 1
          )
        : node.messages

      for (const msg of msgs) {
        const content =
          msg.role === "assistant"
            ? msg.content
                .replace(/['"]\s*\+\s*[\n\r]*\s*['"]/g, "")
                .replace(/^'|'$/g, "")
                .replace(/###\s*/g, "")
                .replace(/\*\*/g, "")
                .replace(/\*\s+/g, "")
                .replace(/[\n\r]+/g, " ")
                .replace(/\s+/g, " ")
                .trim()
            : msg.content
        chatContent += `<block role=${msg.role}>${content}</block>`
        if (cutoff) {
          chatContent += `<highlight>${cutoff.highlight}</highlight>`
        }
      }
      sources += `<source type=${node.type} snapshot=${cutoff ? true : false}>${chatContent}</source>`
    }
  }

  return `The user works in a non-linear canvas where conversations and documents exist as connected nodes. The sources below are upstream of the current conversation and were connected by the user as relevant background. They are ordered from earliest to most immediate — later sources generally build on earlier ones.
  How to use them:
  - Treat sources as reference material, not as your own prior turns. Some were produced by other AI models or written by the user.
  - Never claim to have said something that appears in a source. If you need to refer to one, describe it by its title.
  - Sources marked snapshot="true" are point-in-time excerpts; the original conversation may have continued past what you see and highlight is what the user branched for.
  - The user chose to connect these, so assume relevance. If a question seems to reference something you cannot find, use your brain dont just think the referances are your ultimate resources.
  - Do not summarize the sources back to the user unless asked. Answer the question if asked for referance, just summerize what are all the knowdlge you have.
  <sources>
  ${sources}
  </sources>
  The conversation that follows is the current node's own thread — that is the live exchange you are participating in.
  `
}

export async function checkModelUsablity(
  modelDetails: modelType,
  userId: string
): Promise<ModelUsablityResult> {
  const modelExist = await prisma.modelRoute.findFirst({
    where: { modelId: modelDetails.modelId },
  })
  if (!modelExist) {
    return { ok: false, error: { msg: "Model does not found", status: 402 } }
  }

  //get user detials
  const userDetails = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planTier: true,
      providerKeys: true,
    },
  })

  //source verification
  if (modelDetails.source === "PLATFORM") {
    //enabled?
    if (!modelExist.platformEnabled) {
      return { ok: false, error: { msg: "Model does not found", status: 400 } }
    }

    //check user tier
    if (
      userDetails?.planTier === "FREE" &&
      !(
        Number(modelExist.inputPricePerM) === 0 &&
        Number(modelExist.outputPricePerM) === 0
      )
    ) {
      return {
        ok: false,
        error: { msg: "Get pro to access this model", status: 400 },
      }
    }
  }

  if (modelDetails.source === "BYOK") {
    //enabled?
    if (!modelExist.byokEnabled) {
      return { ok: false, error: { msg: "Model does not found", status: 402 } }
    }

    //key configerd?
    if (userDetails?.providerKeys.length === 0) {
      return { ok: false, error: { msg: "No keys configured", status: 400 } }
    }

    const keylist = userDetails?.providerKeys.map((k) => k.provider)
    const author = modelDetails.author.toUpperCase() as ModelProvider

    if (!keylist?.includes(author)) {
      return { ok: false, error: { msg: "key not configured", status: 400 } }
    }
  }

  return { ok: true, msg: "good to go" }
}
