"use client"
import React, { ChangeEvent, useCallback, useRef, useState } from "react"
import { Handle, NodeProps, Position, useReactFlow } from "@xyflow/react"
import { Input } from "@/components/ui/input"
import { textNode } from "./index"
import { deleteNode, updateTextNode } from "@/actions/nodeActions"
import { LoaderCircle, PanelRight, Text, Trash, Type } from "lucide-react"
import { NodeStatusIndicator } from "@/components/node-status-indicator"
import { toast } from "sonner"

const textnode = (props: NodeProps<textNode>) => {
  const [content, setcontent] = useState(props.data.content)
  const [title, settitle] = useState(props.data.title)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { deleteElements } = useReactFlow()
  const textRef = useRef<string>(content)

  const onInputChange = (
    event: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setcontent(event.target.value)
    timerRef.current = setTimeout(async () => {
      const res = await updateTextNode({
        nodeId: props.id,
        content: { title: props.data.title, content: event.target.value },
      })

      if (!res.ok) {
        toast.error("Could not update the text")
        setcontent(textRef.current)
        return
      }

      textRef.current = title
    }, 1000)
  }

  return (
    <NodeStatusIndicator
      status={!props.draggable ? "loading" : undefined}
      variant="overlay"
    >
      <div className="group h-auto min-h-50 w-[450px] rounded-xl bg-accent shadow-[0px_0px_5px_3px_rgba(0,0,0,0.1)]">
        <div className="custom_drag_handle relative flex cursor-grab items-center justify-between rounded-t-xl bg-accent p-2 transition-colors duration-300 group-hover:bg-black/10 group-hover:dark:bg-background/40">
          {/* <div className="rounded-lg border p-1">{props.data.title}</div> */}
          <div className="flex items-center justify-center gap-2 rounded-lg px-1 shadow-[0px_0px_2px_1px_rgba(0,0,0,0.1)] dark:border">
            <Type strokeWidth={1.5} />
            {/* <input
              type="text"
              className="field-sizing-content max-w-50 truncate rounded-sm text-xl font-medium outline-0 focus:outline-0"
              value={title.length === 0 ? "Untitled" : title}
              onChange={(e) => {
                settitle(e.target.value)
              }}
            /> */}
            <h1 className="text-xl font-medium">TEXT</h1>
          </div>
          <div className="flex items-center justify-center gap-2 px-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div title="Delete">
              <Trash
                onClick={async () => {
                  await deleteElements({ nodes: [{ id: props.id }], edges: [] })
                }}
                className="cursor-pointer"
                strokeWidth={1.5}
                size={20}
              />
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="source-b"
            isConnectable={props.isConnectable}
          />
        </div>
        <div className="p-2">
          <textarea
            className="nodrag field-sizing-content min-h-25 w-full resize-none overflow-visible outline-0"
            placeholder="Your text goes here"
            value={content}
            onChange={onInputChange}
          />
        </div>
      </div>
    </NodeStatusIndicator>
  )
}

export default textnode
