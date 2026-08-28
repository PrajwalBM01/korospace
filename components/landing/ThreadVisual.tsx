import { MessagesSquare } from "lucide-react"

/**
 * The "before": one conversation, one direction. Everything you asked
 * earlier scrolls off the top and the only way back is up.
 */
const messages: { role: "you" | "ai"; lines: string[]; tangent?: boolean }[] = [
  { role: "you", lines: ["w-3/4"] },
  { role: "ai", lines: ["w-full", "w-11/12", "w-2/3"] },
  { role: "you", lines: ["w-1/2"] },
  { role: "ai", lines: ["w-full", "w-5/6", "w-full", "w-1/3"], tangent: true },
  { role: "you", lines: ["w-2/3"] },
  { role: "ai", lines: ["w-full", "w-3/4", "w-11/12"] },
  { role: "you", lines: ["w-1/2"] },
  { role: "ai", lines: ["w-full", "w-5/6"] },
]

const ThreadVisual = () => {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/70 px-3 py-2">
        <MessagesSquare className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
          one thread
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 p-3">
          {/* the single rail every message has to live on */}
          <div className="absolute top-0 bottom-3 left-4 w-px -translate-x-1/2 bg-border" />

          <div className="space-y-2.5">
            {messages.map((message, i) => (
              <div key={i} className="relative flex gap-3">
                <span className="relative z-10 mt-2 size-2 shrink-0 rounded-full bg-border ring-4 ring-card" />
                <div
                  className={
                    message.role === "you"
                      ? "max-w-[72%] min-w-0 flex-1 space-y-1.5 rounded-md border border-dashed border-border/80 p-2.5"
                      : "min-w-0 flex-1 space-y-1.5 rounded-md border border-border bg-muted/50 p-2.5"
                  }
                >
                  {message.tangent && (
                    <span className="block font-mono text-[0.6rem] tracking-wider text-muted-foreground/80 uppercase">
                      tangent · dropped
                    </span>
                  )}
                  {message.lines.map((width, j) => (
                    <div
                      key={j}
                      className={`h-1.5 rounded-full bg-foreground/15 ${width}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* everything you asked earlier, gone up and out */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-card via-card/85 to-transparent" />
        <div className="absolute inset-x-0 top-3 flex justify-center px-3">
          <span className="rounded-full border border-border bg-background/90 px-2.5 py-1 text-center font-mono text-[0.6rem] text-muted-foreground">
            ↑ what you actually asked, 38 messages up
          </span>
        </div>
      </div>

      <div className="shrink-0 border-t border-border/70 p-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-2.5 py-2">
          <span className="truncate font-mono text-[0.65rem] text-muted-foreground/70">
            ask something else…
          </span>
          <span className="ml-auto size-4 shrink-0 rounded-sm bg-muted" />
        </div>
      </div>
    </div>
  )
}

export default ThreadVisual
