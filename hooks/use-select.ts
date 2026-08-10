import { GetZoom } from "@xyflow/system"
import { useCallback, useEffect, useState } from "react"

export type SelectionInfo = {
  text: string
  nodeId: string
  messageId: string | null
  messageRole: string | null
  rect: {
    top: number
    left: number
    right: number
    bottom: number
    x: number
    y: number
  }
}

const ELEMENT_NODE = 1

const resolveTarget = (range: Range) => {
  const container = range.commonAncestorContainer
  const el =
    container.nodeType === ELEMENT_NODE
      ? (container as HTMLElement)
      : container.parentElement

  if (!el) return null

  const flowNode = el.closest<HTMLElement>(".react-flow__node")
  const nodeId = flowNode?.dataset.id
  if (!nodeId) return null

  const messageEl = el.closest<HTMLElement>("[data-item-id]")
  return {
    nodeId,
    messageId: messageEl?.dataset.itemId ?? null,
    messageRole: messageEl?.dataset.itemRole ?? null,
  }
}

export function useSelection() {
  const [selected, setSelected] = useState<SelectionInfo | null>(null)

  useEffect(() => {
    const read = () => {
      const sel = document.getSelection()

      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setSelected(null)
        return
      }

      const text = sel.toString().trim()
      if (!text) {
        setSelected(null)
        return
      }
      const cleanedText = text.replace(/\n+/g, " ")

      const range = sel.getRangeAt(0)
      const target = resolveTarget(range)
      if (!target || target.messageRole !== "assistant") {
        setSelected(null)
        return
      }

      const { top, left, right, bottom, x, y } = range.getBoundingClientRect()
      setSelected({
        text: cleanedText,
        rect: { top, left, right, bottom, x, y },
        ...target,
      })
    }

    const onPointerUp = () => requestAnimationFrame(read)
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.key.startsWith("Arrow") || e.key === "a") read()
    }
    const onSelectionChange = () => {
      const sel = document.getSelection()
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) setSelected(null)
    }

    document.addEventListener("pointerup", onPointerUp)
    document.addEventListener("keyup", onKeyUp)
    document.addEventListener("selectionchange", onSelectionChange)

    return () => {
      document.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("keyup", onKeyUp)
      document.removeEventListener("selectionchange", onSelectionChange)
    }
  }, [])

  const clear = useCallback(() => {
    document.getSelection()?.removeAllRanges()
    setSelected(null)
  }, [])

  return { selected, clear }
}
