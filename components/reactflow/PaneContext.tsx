"use client"
import React, { useEffect, useRef } from "react"
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { useReactFlow } from "@xyflow/react"
import { useParams } from "next/navigation"
import { NodeType } from "@/app/generated/prisma/enums"
import { createId } from "@paralleldrive/cuid2"
import { createNodeData } from "@/lib/node-data"
import { insertNode } from "@/actions/nodeActions"
import { useTheme } from "next-themes"
import { Button } from "../ui/button"
import {
  BotMessageSquare,
  Bug,
  Globe,
  Monitor,
  Moon,
  Sun,
  Text,
  Type,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { LOADED_PROPS, LOADING_PROPS } from "@/types/nodeSchema"
import { useCanvasStore } from "@/store/canvasStore"

const themeIcons = {
  light: <Sun />,
  dark: <Moon />,
  system: <Monitor />,
}

const PaneContext = () => {
  const { id } = useParams<{ id: string }>()
  const { screenToFlowPosition, addNodes, updateNode, deleteElements } =
    useReactFlow()
  const flowPositions = useRef({ x: 0, y: 0 })
  const { theme, setTheme, themes } = useTheme()
  const { setFeedbackOpen } = useCanvasStore()

  useEffect(() => {
    const getPosition = (e: MouseEvent) => {
      e.preventDefault()
      const flowPosition = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })
      flowPositions.current = { x: flowPosition.x, y: flowPosition.y }
    }
    window.addEventListener("contextmenu", getPosition)

    return () => window.removeEventListener("contextmenu", getPosition)
  }, [])

  const createNode = async (type: NodeType) => {
    const nodeId = createId()
    const data = createNodeData(type)

    addNodes({
      id: nodeId,
      dragHandle: ".custom_drag_handle",
      ...LOADING_PROPS.node,
      position: { x: flowPositions.current.x, y: flowPositions.current.y },
      ...data,
    })

    const res = await insertNode({
      canvasId: id,
      nodeId: nodeId,
      posX: flowPositions.current.x,
      posY: flowPositions.current.y,
      ...data,
    })

    if (!res.ok) {
      toast.error(res.error)
      await deleteElements({ nodes: [{ id: nodeId }], edges: [] })
      return
    }

    updateNode(nodeId, {
      ...LOADED_PROPS.node,
    })
  }

  return (
    <ContextMenuContent>
      <ContextMenuGroup>
        <ContextMenuLabel>Create Node</ContextMenuLabel>
        <ContextMenuItem
          onClick={async () => {
            await createNode("chat")
          }}
        >
          <BotMessageSquare /> Chat
        </ContextMenuItem>
        <ContextMenuItem
          onClick={async () => {
            await createNode("text")
          }}
        >
          <Type /> Text
        </ContextMenuItem>
        <ContextMenuItem
          disabled
          // onClick={() => {
          //   createNode("web")
          // }}
        >
          <Globe /> Web (upcoming)
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuLabel>Theme</ContextMenuLabel>
        <div className="flex w-full items-center justify-center gap-2">
          {themes.map((t) => (
            <Button
              onClick={() => setTheme(t)}
              disabled={theme === t}
              className={cn("bg-accent text-foreground hover:bg-card")}
              key={t}
            >
              {themeIcons[t as keyof typeof themeIcons]}
            </Button>
          ))}
        </div>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuItem
        onSelect={() => {
          // Let the menu finish unmounting first - opening a dialog in the
          // same tick can leave the body stuck with pointer-events: none.
          setTimeout(() => setFeedbackOpen(true), 0)
        }}
      >
        <Bug /> Report/Bug
      </ContextMenuItem>
    </ContextMenuContent>
  )
}

export default PaneContext
