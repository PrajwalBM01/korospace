import { Bot, Split, Workflow } from "lucide-react"

import { cn } from "@/lib/utils"
import BranchIllustration from "./BranchIllustration"

const accent = "text-[oklch(0.55_0.17_131)] dark:text-primary"

const points = [
  { icon: Split, text: "Branch from any reply", rotate: true },
  { icon: Workflow, text: "Context flows down the wires" },
  { icon: Bot, text: "A model per node" },
]

/** Keeps punctuation from wrapping away from the word it follows. */
const Nowrap = ({ children }: { children: React.ReactNode }) => (
  <span className="whitespace-nowrap">{children}</span>
)

/** A word with a marker swipe under it, echoing the scribbles in the hero. */
const Marked = ({ children }: { children: React.ReactNode }) => (
  <span className="relative inline-block">
    <span className="relative z-10">{children}</span>
    <span
      aria-hidden="true"
      className="absolute inset-x-[-0.06em] bottom-[0.1em] z-0 h-[0.3em] -skew-x-12 bg-[#7ccf00]/60"
    />
  </span>
)

/**
 * The half of the auth card that sells the thing you're signing in to. Hidden
 * below lg, where the form gets the whole width to itself.
 */
const AuthShowcase = ({ className }: { className?: string }) => {
  return (
    <aside
      className={cn(
        "relative hidden overflow-hidden bg-muted/80 lg:flex lg:flex-col",
        className
      )}
    >
      <div className="dots pointer-events-none opacity-[0.12]" />

      <div className="relative flex min-h-0 flex-1 flex-col p-8 xl:p-10">
        <span className="w-fit rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
          korospace
        </span>

        <h2 className="mt-5 font-khand text-3xl leading-tight font-semibold text-balance xl:text-4xl">
          Follow the{" "}
          <Nowrap>
            <Marked>tangent</Marked>,
          </Nowrap>{" "}
          keep the{" "}
          <Nowrap>
            <Marked>thread</Marked>.
          </Nowrap>
        </h2>

        <div className="relative my-7 min-h-[12rem] flex-1">
          <BranchIllustration />
        </div>

        <ul className="space-y-2.5 font-mono text-xs">
          {points.map(({ icon: Icon, text, rotate }) => (
            <li key={text} className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  "size-3.5 shrink-0",
                  accent,
                  rotate && "rotate-90"
                )}
              />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default AuthShowcase
