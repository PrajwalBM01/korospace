"use client"
import React, { useMemo } from "react"
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { chatNode } from "./reactflow/nodes"
import { cn } from "@/lib/utils"
import ReactMarkDown from "react-markdown"
import { useReactFlow } from "@xyflow/react"
import { useChat } from "@ai-sdk/react"
import { getNodeChat } from "@/lib/chat-registry"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const ChatSidebar = ({ nodeId }: { nodeId: string }) => {
  const { getNode } = useReactFlow()
  const node = getNode(nodeId) as chatNode | undefined

  // same Chat instance the node uses -> live messages, incl. while streaming
  const chat = useMemo(
    () => getNodeChat(nodeId, node?.data.messages ?? []),
    [nodeId]
  )
  const { messages } = useChat({ chat })
  return (
    <SheetContent className="overflow-y-scroll bg-accent data-[side=right]:sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>CHAT</SheetTitle>
        <SheetDescription className="hidden">
          Chat history in side view
        </SheetDescription>
      </SheetHeader>
      <div
        className={cn(
          "stretch mx-auto flex w-full min-w-0 flex-col p-4 text-sm select-text",
          messages.length === 0 && "py-24"
        )}
      >
        {messages.map((message) => (
          <div
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
                        message.role === "user" ? "w-2/3 bg-card" : "text-start"
                      )}
                    >
                      <ReactMarkDown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
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
      </div>
    </SheetContent>
  )
}

export default ChatSidebar
