import { create } from "zustand"
import { persist } from "zustand/middleware"

interface canvasState {
  isMouse: boolean
  sideViewNodeId: string | null

  setIsMouse: (value: boolean) => void
  openSideView: (nodeId: string) => void
  closeSideView: () => void
}

export const useCanvasStore = create<canvasState>()(
  persist(
    (set) => ({
      isMouse: true,
      sideViewNodeId: null,

      setIsMouse: (value) => set(() => ({ isMouse: value })),
      openSideView: (nodeId) => set(() => ({ sideViewNodeId: nodeId })),
      closeSideView: () => set(() => ({ sideViewNodeId: null })),
    }),
    {
      name: "mouse-sitting",
      partialize: (state) => ({ isMouse: state.isMouse }),
    }
  )
)
