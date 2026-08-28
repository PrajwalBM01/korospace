import { CornerDownRight } from "lucide-react"
import CanvasVisual from "./CanvasVisual"
import GetStarted from "./GetStarted"
import ThreadVisual from "./ThreadVisual"

/** Lime reads fine on the dark theme but washes out on white, so light mode
 *  gets a deeper shade of the same hue. */
export const accent = "text-[oklch(0.55_0.17_131)] dark:text-primary"

export const points = [
  {
    problem: "You chase a tangent.",
    solution:
      "Select the reply and branch it. The tangent becomes its own node, and the thread you were on stays exactly where you left it.",
  },
  {
    problem: "You open a new chat and paste the context back in by hand.",
    solution:
      "Drag a wire instead. Every node inherits the full history of everything upstream of it, oldest first.",
  },
  {
    problem: "You switch models and the conversation doesn't come with you.",
    solution:
      "Pick a model per node. Draft on a cheap one, reason on an expensive one, on the same canvas with the same context.",
  },
]

/** A word with a marker swipe under it, echoing the scribbles in the hero. */
export const Marked = ({ children }: { children: React.ReactNode }) => (
  <span className="relative inline-block">
    <span className="relative z-10">{children}</span>
    <span
      aria-hidden="true"
      className="absolute inset-x-[-0.06em] bottom-[0.1em] z-0 h-[0.3em] -skew-x-12 bg-[#7ccf00]/60"
    />
  </span>
)
