"use client"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import dynamic from "next/dynamic"
import { Edge, ReactFlowProvider } from "@xyflow/react"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import { appNodes } from "@/components/reactflow/nodes"
import { Loader, MousePointerClick, Sheet } from "lucide-react"
import { useCanvasStore } from "@/store/canvasStore"
const Rfcanvas = dynamic(() => import("@/app/chat/chat-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-background">
      <Loader />
    </div>
  ),
})

export default function ChatCanvas({
  nodes,
  edges,
}: {
  nodes: appNodes[]
  edges: Edge[]
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative h-dvh w-full">
          {/* {state === "collapsed" && (
            <span className="absolute z-100 p-2">
              <SidebarTrigger />
            </span>
          )} */}
         
          <ReactFlowProvider>
            <Rfcanvas rfnodes={nodes} rfedges={edges} />
          </ReactFlowProvider>
        </div>
      </ContextMenuTrigger>
    </ContextMenu>
  )
}
