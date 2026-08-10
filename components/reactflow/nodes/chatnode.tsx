"use client"
import { cn } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useChat } from "@ai-sdk/react"
import { Handle, Node, NodeProps, Position, useReactFlow } from "@xyflow/react"
import React, { MouseEventHandler, useMemo, useState } from "react"
import type { chatNode } from "./index"
import ReactMarkDown from "react-markdown"
import {
  ArrowUp,
  BotMessageSquare,
  PanelRight,
  Split,
  Trash,
} from "lucide-react"
import { disposeNodeChat, getNodeChat } from "@/lib/chat-registry"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import remarkGfm from "remark-gfm"
import { deleteNode } from "@/actions/nodeActions"
import { useCanvasStore } from "@/store/canvasStore"
import { NodeStatusIndicator } from "@/components/node-status-indicator"
import { Button } from "@/components/ui/button"
import { DotmTriangle20 } from "@/components/ui/dotm-triangle-20"

const chatnode = (props: NodeProps<chatNode>) => {
  const { openSideView, sideViewNodeId, closeSideView } = useCanvasStore()
  const { deleteElements } = useReactFlow()
  const [input, setinput] = useState("")
  const chat = useMemo(
    () => getNodeChat(props.id, props.data.messages),
    [props.id]
  )
  const { messages, sendMessage, status } = useChat({ chat })

  return (
    <NodeStatusIndicator
      status={!props.draggable ? "loading" : undefined}
      variant="overlay"
    >
      <div
        className={cn(
          "group flex h-auto w-[550px] cursor-auto flex-col gap-2 rounded-xl bg-accent shadow-[0px_0px_5px_3px_rgba(0,0,0,0.1)]"
        )}
      >
        <div className="custom_drag_handle relative flex cursor-grab items-center justify-center rounded-t-xl bg-accent p-2 transition-colors duration-300 group-hover:bg-black/10 group-hover:dark:bg-background/40">
          <Handle
            type="target"
            position={Position.Left}
            id="target-a"
            isConnectableStart={false}
          />
          <div className="flex items-center justify-center gap-2 rounded-lg p-1 shadow-[0px_0px_2px_1px_rgba(0,0,0,0.1)] dark:border">
            <BotMessageSquare strokeWidth={1.5} />
            <h1 className="text-xl font-medium">CHAT</h1>
          </div>
          <div className="absolute right-4 flex items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div
              title="Sidebar"
              className="nodrag"
              onClick={() =>
                sideViewNodeId === props.id
                  ? closeSideView()
                  : openSideView(props.id)
              }
            >
              <PanelRight
                className={cn(
                  "cursor-pointer",
                  sideViewNodeId === props.id && "text-primary"
                )}
                strokeWidth={1.5}
                size={20}
              />
            </div>
            <div title="Delete">
              <Trash
                onClick={async () => {
                  if (sideViewNodeId === props.id) closeSideView()
                  disposeNodeChat(props.id)
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
        <div className="flex flex-col gap-2 p-2">
          <div
            className={cn(
              "stretch nodrag mx-auto flex h-auto min-h-50 w-full min-w-0 flex-col gap-2 p-1 select-text"
            )}
          >
            {messages.map((message, index) => (
              <div
                data-item-id={message.id}
                data-item-index={index}
                data-item-role={message.role}
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className={cn(
                            "relative min-w-0 overflow-hidden rounded-xl p-2 whitespace-pre-wrap",
                            message.role === "user"
                              ? "field-sizing-content w-2/3 bg-card"
                              : "text-start"
                          )}
                        >
                          <ReactMarkDown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                )
                                const isBlock = !!match

                                if (!isBlock) {
                                  return (
                                    <code
                                      className="rounded bg-black/10 px-1 py-0.5 font-mono text-sm dark:bg-white/10"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  )
                                }

                                return (
                                  <div className="my-2 max-w-full overflow-hidden rounded-lg border">
                                    <div className="flex items-center justify-between bg-black/80 px-3 py-1 text-xs text-white/70">
                                      <span>{match[1]}</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <SyntaxHighlighter
                                        language={match[1]}
                                        style={oneDark}
                                        customStyle={{
                                          margin: 0,
                                          borderRadius: 0,
                                        }}
                                        PreTag="div"
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    </div>
                                  </div>
                                )
                              },
                            }}
                          >
                            {part.text}
                          </ReactMarkDown>
                        </div>
                      )
                  }
                })}
              </div>
            ))}
            {status === "submitted" && (
              <DotmTriangle20
                size={25}
                dotSize={5}
                speed={1.45}
                pattern="full"
                color="oklch(0.841 0.238 128.85)"
                animated
                halo={0.15}
                opacityBase={0.05}
                opacityMid={0.18}
                opacityPeak={1}
              />
            )}
            {status === "error" && (
              <p className="text-xs text-destructive">Something went wrong</p>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage({ text: input.trim() })
              setinput("")
            }}
          >
            <textarea
              className="field-sizing-content h-auto max-h-30 min-h-20 w-full resize-none items-stretch overflow-y-auto rounded-b-md border-t-2 p-2 outline-0"
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (input.length < 1) return
                  e.currentTarget.form?.requestSubmit()
                }
              }}
              placeholder={
                messages.length === 0
                  ? "What shall we discuss?"
                  : "Write a message..."
              }
              onChange={(e) => setinput(e.currentTarget.value)}
            />
            <div className="flex items-center justify-between p-1">
              <div>
                <Select>
                  <SelectTrigger className="">
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-transparent">
                    <SelectGroup>
                      <SelectItem value="light">Gemini</SelectItem>
                      <SelectItem value="dark">claude</SelectItem>
                      <SelectItem value="system">chatgpt</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  disabled={
                    status === "submitted" ||
                    status === "streaming" ||
                    input.length < 1
                      ? true
                      : false
                  }
                  className="rounded-lg text-black"
                >
                  <ArrowUp size={25} />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </NodeStatusIndicator>
  )
}

export default chatnode
