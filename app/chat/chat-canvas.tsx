"use client"
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeMouseHandler,
  OnConnect,
  OnConnectEnd,
  OnNodeDrag,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ViewportPortal,
} from "@xyflow/react"
import { useTheme } from "next-themes"
import { appNodes, nodeTypes } from "../../components/reactflow/nodes"
import {
  deleteNode,
  insertNode,
  updateNodePos,
} from "../../actions/nodeActions"
import PaneContext from "@/components/reactflow/PaneContext"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createId } from "@paralleldrive/cuid2"
import { createNodeData } from "@/lib/node-data"
import { useParams } from "next/navigation"
import { insertEdge } from "@/actions/edgeActions"
import { cycleCheck } from "@/lib/canvasHelper"
import { toast } from "sonner"
import { SelectionInfo, useSelection } from "@/hooks/use-select"
import { MousePointerClick, Settings, Split } from "lucide-react"
import { useCanvasStore } from "@/store/canvasStore"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import RightSidebar from "@/components/RightSidebar"
import { LeftTrigger, RightTrigger } from "@/components/sidebarTriggers"
import LeftSidebar from "@/components/LeftSidebar"
import { Sheet } from "@/components/ui/sheet"
import ChatSidebar from "@/components/chat-sidebar"
import { disposeAllChats, disposeNodeChat } from "@/lib/chat-registry"

const handleNodeDrag: OnNodeDrag = async (event, node) => {
  await updateNodePos({
    nodeId: node.id,
    posX: node.position.x,
    posY: node.position.y,
  })
}

const page = ({
  rfnodes,
  rfedges,
}: {
  rfnodes: appNodes[]
  rfedges: Edge[]
}) => {
  const { id } = useParams<{ id: string }>()
  const [nodes, setNodes, onNodesChange] = useNodesState(rfnodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfedges)
  const { resolvedTheme } = useTheme()
  const { screenToFlowPosition, getEdges, getZoom, getNodes } = useReactFlow()
  const { selected, clear } = useSelection()
  const { isMouse, sideViewNodeId, closeSideView } =
    useCanvasStore()

  const freshStart = nodes.length === 0

  useEffect(() => () => disposeAllChats(), [id])

  const anchor = useMemo(
    () =>
      selected
        ? screenToFlowPosition({ x: selected.rect.right, y: selected.rect.top })
        : null,
    [selected, screenToFlowPosition]
  )

  const handleEdgeDrop: OnConnectEnd = useCallback(
    async (event, connectionState) => {
      if (!connectionState.isValid && connectionState.fromNode) {
        const nodeId = createId()
        const edgeId = createId()
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event
        const nodeData = createNodeData("chat")
        const positions = screenToFlowPosition({
          x: clientX,
          y: clientY,
        })

        await insertNode({
          nodeId: nodeId,
          canvasId: id,
          posX: positions.x,
          posY: positions.y,
          ...nodeData,
        })

        setNodes((nodes) =>
          nodes.concat({
            id: nodeId,
            position: positions,
            dragHandle: ".custom_drag_handle",
            ...nodeData,
          })
        )

        await insertEdge({
          id: edgeId,
          canvasId: id,
          sourceNodeId: connectionState.fromNode.id,
          targetNodeId: nodeId,
        })
        setEdges((eds) =>
          eds.concat({
            id: edgeId,
            source: connectionState.fromNode.id,
            target: nodeId,
            className: "custom-edge",
          })
        )
      }
    },
    [screenToFlowPosition]
  )

  const handleEdgeConnection: OnConnect = useCallback(
    async (connection) => {
      const { source, target } = connection
      const edges = getEdges()
      const formsCycle = cycleCheck(source, target, edges)
      const edgeId = createId()

      if (!source || !target) return

      if (source === target) {
        toast("Self Connection Not allowed")
        return
      }

      if (edges.some((e) => e.source === source && e.target === target)) {
        toast("No duplicate connection")
        return
      }

      if (formsCycle) {
        toast("Can not form a loop")
        return
      }

      await insertEdge({
        id: edgeId,
        canvasId: id,
        sourceNodeId: source,
        targetNodeId: target,
      })

      setEdges((eds) =>
        eds.concat({
          id: edgeId,
          source: source,
          target: target,
          className: "custom-edge",
        })
      )
    },
    [getEdges]
  )

  const handleBranching = useCallback(async (selected: SelectionInfo) => {
    const nodeId = createId()
    const nodeData = createNodeData("chat")
    const positions = screenToFlowPosition({
      x: selected.rect.x + 300,
      y: selected.rect.y,
    })
    const edgeId = createId()

    await insertNode({
      nodeId: nodeId,
      canvasId: id,
      posX: positions.x,
      posY: positions.y,
      ...nodeData,
    })

    setNodes((nodes) =>
      nodes.concat({
        id: nodeId,
        position: positions,
        dragHandle: ".custom_drag_handle",
        ...nodeData,
      })
    )

    await insertEdge({
      id: edgeId,
      canvasId: id,
      sourceNodeId: selected.nodeId,
      targetNodeId: nodeId,
      branchPointMessageId: selected.messageId,
      branchMessage: selected.text,
    })

    setEdges((edges) =>
      edges.concat({
        id: edgeId,
        source: selected.nodeId,
        target: nodeId,
        className: "custom-edge",
      })
    )
    clear()
  }, [])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // console.log("nodeclick", event, node)
      // // branchPostion.current = node.position
      // console.log(node.className)
    },
    []
  )

  return (
    <ReactFlow
      // onPointerUp={handleGlobalSelection}
      debug={true}

      onNodeClick={handleNodeClick}
      onNodeContextMenu={(e) => {
        e.preventDefault()
      }}
      onConnectEnd={handleEdgeDrop}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={handleNodeDrag}
      onNodesDelete={(nodes) => {
        nodes.map(async (n) => {
          if (n.id === sideViewNodeId) closeSideView()
          disposeNodeChat(n.id)
          await deleteNode({ nodeId: n.id })
        })
      }}
      onConnect={handleEdgeConnection}
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      maxZoom={5.0}
      minZoom={0.1}
      panOnScroll={!isMouse}
      panOnDrag={isMouse}
    >
      <Background />
      {freshStart && (
        <div className="pointer-events-none absolute z-10 flex h-full w-full items-center justify-center gap-2 text-foreground/40">
          <MousePointerClick strokeWidth={1.5} />{" "}
          <h1>Right click to add a new node</h1>
        </div>
      )}
      {/* roots left panel */}
      {/* this is for history and profile section, hidden for now */}
      {/* <LeftTrigger />
      <LeftSidebar /> */}

      {/* settings right panel */}
      <RightTrigger />
      <RightSidebar />

      <PaneContext />
      <MiniMap pannable zoomable />
      <Controls showInteractive={false} />

      {/* single sheet for the whole canvas - the open node id is the only state */}
      <Sheet
        open={sideViewNodeId !== null}
        onOpenChange={(open) => {
          if (!open) closeSideView()
        }}
      >
        {sideViewNodeId && (
          <ChatSidebar key={sideViewNodeId} nodeId={sideViewNodeId} />
        )}
      </Sheet>

      {selected && anchor && (
        <ViewportPortal>
          <div
            className="nodrag nopan pointer-events-auto z-9999 cursor-pointer"
            style={{ position: "absolute", left: anchor.x + 10, top: anchor.y }}
          >
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                handleBranching(selected)
              }}
              className="flex items-center gap-2 rounded-xl bg-primary p-2 text-black shadow"
            >
              <Split size={30} className="rotate-90" /> Branch
            </button>
          </div>
        </ViewportPortal>
      )}
    </ReactFlow>
  )
}

export default page
