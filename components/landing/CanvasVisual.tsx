import { Workflow } from "lucide-react"

type NodeProps = {
  x: number
  y: number
  w: number
  h: number
  label: string
  lines: number[]
  highlight?: boolean
}

/** A node card, drawn to scale inside the graph's viewBox. */
const wire = "stroke-[oklch(0.6_0.19_131)] dark:stroke-primary"
const chip = "fill-[oklch(0.6_0.19_131)] dark:fill-primary"

const GraphNode = ({ x, y, w, h, label, lines, highlight }: NodeProps) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={8}
      strokeWidth={1.5}
      className={
        highlight ? `fill-primary/15 ${wire}` : "fill-card stroke-border"
      }
    />
    <rect
      x={x + 10}
      y={y + 11}
      width={9}
      height={9}
      rx={2.5}
      className={highlight ? chip : "fill-foreground/30"}
    />
    <text
      x={x + 25}
      y={y + 19}
      fontSize={9}
      letterSpacing={0.4}
      className="fill-muted-foreground font-mono"
    >
      {label}
    </text>
    {lines.map((width, i) => (
      <rect
        key={i}
        x={x + 10}
        y={y + 32 + i * 9}
        width={(w - 20) * width}
        height={3.5}
        rx={1.75}
        className="fill-foreground/15"
      />
    ))}
  </g>
)

/** A connection point, matching the square handles on the real canvas. */
const Handle = ({ cx, cy }: { cx: number; cy: number }) => (
  <rect
    x={cx - 5}
    y={cy - 3}
    width={10}
    height={6}
    rx={1.5}
    strokeWidth={2}
    className={`fill-background ${wire}`}
  />
)

/**
 * The "after": the same conversation as a graph. Branches keep their own
 * thread, and the node at the bottom inherits every ancestor above it.
 */
const CanvasVisual = () => {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/70 px-3 py-2">
        <Workflow className="size-3.5 text-[oklch(0.55_0.17_131)] dark:text-primary" />
        <span className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
          one canvas
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="dots opacity-15" />
        <svg
          viewBox="0 0 260 440"
          fill="none"
          aria-hidden="true"
          className="relative h-full w-full p-2"
        >
          <g
            className={wire}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.9}
          >
            <path d="M80 78 C 80 100, 184 96, 184 126" />
            <path d="M80 78 C 80 140, 64 160, 64 226" />
            <path d="M184 182 C 184 280, 130 270, 130 338" />
            <path d="M64 282 C 64 310, 130 306, 130 338" />
          </g>

          <GraphNode
            x={22}
            y={22}
            w={116}
            h={56}
            label="chat"
            lines={[1, 0.7]}
          />
          <GraphNode
            x={126}
            y={126}
            w={116}
            h={56}
            label="branch"
            lines={[0.85, 1]}
          />
          <GraphNode
            x={6}
            y={226}
            w={116}
            h={56}
            label="note"
            lines={[1, 0.6]}
          />
          <GraphNode
            x={66}
            y={338}
            w={128}
            h={66}
            label="3 sources"
            lines={[1, 0.9, 0.55]}
            highlight
          />

          <Handle cx={80} cy={78} />
          <Handle cx={184} cy={126} />
          <Handle cx={184} cy={182} />
          <Handle cx={64} cy={226} />
          <Handle cx={64} cy={282} />
          <Handle cx={130} cy={338} />
        </svg>
      </div>

      <div className="shrink-0 border-t border-border/70 p-3">
        <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-2">
          <span className="truncate font-mono text-[0.65rem] text-foreground/80">
            context flows down the wires
          </span>
          <span className="ml-auto size-4 shrink-0 rounded-sm bg-primary/40" />
        </div>
      </div>
    </div>
  )
}

export default CanvasVisual
