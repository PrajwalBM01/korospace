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
  XYPosition,
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
import { LOADED_PROPS, LOADING_PROPS } from "@/types/nodeSchema"

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
  const {
    screenToFlowPosition,
    getEdges,
    getZoom,
    getNode,
    updateNode,
    deleteElements,
    updateEdge,
    fitView,
  } = useReactFlow()
  const { selected, clear } = useSelection()
  const { isMouse, sideViewNodeId, closeSideView } = useCanvasStore()
  const freshStart = nodes.length === 0
  const nodePosRef = useRef<XYPosition | null>(null)

  useEffect(() => () => disposeAllChats(), [id])

  const anchor = useMemo(
    () =>
      selected
        ? screenToFlowPosition({ x: selected.rect.right, y: selected.rect.top })
        : null,
    [selected, screenToFlowPosition]
  )

  const handleNodeDragStart: OnNodeDrag = useCallback(
    async (event, node) => {
      console.log("start event", event)
      console.log("start node", node.position)
      nodePosRef.current = { x: node.position.x, y: node.position.y }
    },
    [nodes]
  )

  const handleNodeDragStop: OnNodeDrag = useCallback(
    async (event, node) => {
      console.log("event", event)
      console.log("end node", node.position)

      const res = await updateNodePos({
        nodeId: node.id,
        posX: node.position.x,
        posY: node.position.y,
      })

      if (!res.ok) {
        toast.error("Unable to update node position")
        if (nodePosRef.current) {
          updateNode(node.id, {
            position: { x: nodePosRef.current.x, y: nodePosRef.current.y },
          })
          nodePosRef.current = null
        }
        return
      }
    },
    [nodes]
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

        setNodes((nodes) =>
          nodes.concat({
            id: nodeId,
            position: positions,
            dragHandle: ".custom_drag_handle",
            ...nodeData,
            ...LOADING_PROPS.node,
          })
        )

        setEdges((eds) =>
          eds.concat({
            id: edgeId,
            source: connectionState.fromNode.id,
            target: nodeId,
            className: "custom-edge",
            ...LOADING_PROPS.edge,
          })
        )

        const nodeRes = await insertNode({
          nodeId: nodeId,
          canvasId: id,
          posX: positions.x,
          posY: positions.y,
          ...nodeData,
        })

        if (!nodeRes.ok) {
          toast.error("Node creation failed")
          await deleteElements({
            nodes: [{ id: nodeId }],
            edges: [{ id: edgeId }],
          })
          return
        }

        const edgeRes = await insertEdge({
          id: edgeId,
          canvasId: id,
          sourceNodeId: connectionState.fromNode.id,
          targetNodeId: nodeId,
        })

        if (!edgeRes.ok) {
          toast.error("Node creation failed")
          await deleteElements({
            nodes: [{ id: nodeId }],
            edges: [{ id: edgeId }],
          })
          await deleteNode({ nodeId: nodeId })
          return
        }

        updateNode(nodeId, {
          ...LOADED_PROPS.node,
        })

        updateEdge(edgeId, {
          ...LOADED_PROPS.edge,
        })
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

      setEdges((eds) =>
        eds.concat({
          id: edgeId,
          source: source,
          target: target,
          className: "custom-edge",
          ...LOADING_PROPS.edge,
        })
      )

      const edgeRes = await insertEdge({
        id: edgeId,
        canvasId: id,
        sourceNodeId: source,
        targetNodeId: target,
      })

      if (!edgeRes.ok) {
        toast.error("Edge creation failed")
        await deleteElements({
          nodes: [],
          edges: [{ id: edgeId }],
        })
        return
      }

      updateEdge(edgeId, {
        ...LOADED_PROPS.edge,
      })
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

    setNodes((nodes) =>
      nodes.concat({
        id: nodeId,
        position: positions,
        dragHandle: ".custom_drag_handle",
        ...nodeData,
        ...LOADING_PROPS.node,
      })
    )

    setEdges((edges) =>
      edges.concat({
        id: edgeId,
        source: selected.nodeId,
        target: nodeId,
        className: "custom-edge",
        ...LOADING_PROPS.edge,
      })
    )

    const nodeRes = await insertNode({
      nodeId: nodeId,
      canvasId: id,
      posX: positions.x,
      posY: positions.y,
      ...nodeData,
    })

    if (!nodeRes.ok) {
      toast.error("Node creation failed")
      await deleteElements({
        nodes: [{ id: nodeId }],
        edges: [{ id: edgeId }],
      })
      return
    }

    const edgeRes = await insertEdge({
      id: edgeId,
      canvasId: id,
      sourceNodeId: selected.nodeId,
      targetNodeId: nodeId,
      branchPointMessageId: selected.messageId,
      branchMessage: selected.text,
    })

    if (!edgeRes.ok) {
      toast.error("Node creation failed")
      await deleteElements({
        nodes: [{ id: nodeId }],
        edges: [{ id: edgeId }],
      })
      await deleteNode({ nodeId: nodeId })
      return
    }

    updateNode(nodeId, {
      ...LOADED_PROPS.node,
    })

    updateEdge(edgeId, {
      ...LOADED_PROPS.edge,
    })

    clear()
  }, [])

  return (
    <ReactFlow
      debug={true}
      onNodeContextMenu={(e) => {
        e.preventDefault()
      }}
      onConnectEnd={handleEdgeDrop}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      onNodeClick={(event, node) => {
        fitView({
          nodes: [node],
          duration: 300,
          padding: 0.5,
        })
      }}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStart={handleNodeDragStart}
      onNodeDragStop={handleNodeDragStop}
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
