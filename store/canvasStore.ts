import { create } from "zustand"
import { persist } from "zustand/middleware"

interface canvasState {
  isMouse: boolean
  sideViewNodeId: string | null
  feedbackOpen: boolean

  setIsMouse: (value: boolean) => void
  openSideView: (nodeId: string) => void
  closeSideView: () => void
  setFeedbackOpen: (open: boolean) => void
}

export const useCanvasStore = create<canvasState>()(
  persist(
    (set) => ({
      isMouse: true,
      sideViewNodeId: null,
      feedbackOpen: false,

      setIsMouse: (value) => set(() => ({ isMouse: value })),
      openSideView: (nodeId) => set(() => ({ sideViewNodeId: nodeId })),
      closeSideView: () => set(() => ({ sideViewNodeId: null })),
      setFeedbackOpen: (open) => set(() => ({ feedbackOpen: open })),
    }),
    {
      name: "mouse-sitting",
      partialize: (state) => ({ isMouse: state.isMouse }),
    }
  )
)
