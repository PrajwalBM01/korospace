"use client"

import { motion, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"

/** Lime reads fine on the dark theme but washes out on white, so light mode
 *  gets a deeper shade of the same hue. Same pair the landing visuals use. */
const wire = "stroke-[oklch(0.6_0.19_131)] dark:stroke-primary"
const chip = "fill-[oklch(0.6_0.19_131)] dark:fill-primary"

const ease = [0.16, 1, 0.3, 1] as const

type Line = { w: number; marked?: boolean }

type NodeProps = {
  x: number
  y: number
  w: number
  h: number
  label: string
  lines: Line[]
  highlight?: boolean
  delay: number
}

const nodeIn = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay } },
})

/** A node card, drawn to scale inside the graph's viewBox. */
const GraphNode = ({
  x,
  y,
  w,
  h,
  label,
  lines,
  highlight,
  delay,
}: NodeProps) => (
  <motion.g variants={nodeIn(delay)}>
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
    {lines.map((line, i) => (
      <g key={i}>
        {/* the sentence you dragged over before branching it */}
        {line.marked && (
          <rect
            x={x + 8}
            y={y + 28.5 + i * 9}
            width={(w - 20) * line.w + 4}
            height={7.5}
            rx={2}
            className="fill-[#7ccf00]/35"
          />
        )}
        <rect
          x={x + 10}
          y={y + 32 + i * 9}
          width={(w - 20) * line.w}
          height={3.5}
          rx={1.75}
          className={line.marked ? "fill-foreground/40" : "fill-foreground/15"}
        />
      </g>
    ))}
  </motion.g>
)

/** A connection point, matching the square handles on the real canvas. */
const Handle = ({ cx, cy }: { cx: number; cy: number }) => (
  <rect
    x={cx - 3}
    y={cy - 5}
    width={6}
    height={10}
    rx={1.5}
    strokeWidth={2}
    className={`fill-card ${wire}`}
  />
)

const wires = [
  { d: "M124 47 C 144 47, 144 30, 164 30", delay: 0.2 },
  { d: "M124 47 C 140 47, 140 132, 156 132", delay: 0.34 },
  { d: "M282 30 C 296 30, 296 83, 310 83", delay: 0.62 },
  { d: "M274 132 C 292 132, 292 83, 310 83", delay: 0.72 },
]

const handles: [number, number][] = [
  [124, 47],
  [164, 30],
  [282, 30],
  [156, 132],
  [274, 132],
  [310, 83],
]

/**
 * The product in one picture: a reply gets selected, branches into its own
 * node, and both paths flow back down the wires into the node at the bottom.
 */
const BranchIllustration = () => {
  const still = useReducedMotion()

  return (
    <motion.svg
      viewBox="0 0 440 170"
      fill="none"
      aria-hidden="true"
      // initial={still ? false : "hidden"}
      // animate="show"
      className="absolute inset-0 h-full w-full"
    >
      <g strokeLinecap="round">
        {wires.map((w, i) => (
          <motion.path
            key={i}
            d={w.d}
            strokeWidth={2}
            className={wire}
            opacity={0.9}
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              show: {
                pathLength: 1,
                opacity: 0.9,
                transition: { duration: 0.7, ease, delay: w.delay },
              },
            }}
          />
        ))}

        {/* context, travelling down the wires it inherits from */}
        {!still &&
          wires.map((w, i) => (
            <motion.path
              key={`pulse-${i}`}
              d={w.d}
              strokeWidth={3}
              className={wire}
              style={{ pathLength: 0.16 }}
              initial={{ pathOffset: 0 }}
              animate={{ pathOffset: 1 }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 2.2,
                delay: 1.5 + i * 0.25,
                ease: "easeInOut",
              }}
            />
          ))}
      </g>

      <motion.g
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { delay: 0.9, duration: 0.4 } },
        }}
      >
        {handles.map(([cx, cy]) => (
          <Handle key={`${cx}-${cy}`} cx={cx} cy={cy} />
        ))}
      </motion.g>

      <GraphNode
        x={4}
        y={20}
        w={120}
        h={54}
        label="chat"
        lines={[{ w: 1 }, { w: 0.72, marked: true }]}
        delay={0.05}
      />
      <GraphNode
        x={164}
        y={4}
        w={118}
        h={52}
        label="chat"
        lines={[{ w: 0.85 }, { w: 0.6 }]}
        delay={0.4}
      />
      <GraphNode
        x={156}
        y={106}
        w={118}
        h={52}
        label="text"
        lines={[{ w: 0.9 }, { w: 0.5 }]}
        delay={0.52}
      />
      <GraphNode
        x={310}
        y={54}
        w={126}
        h={58}
        label="answer"
        lines={[{ w: 1 }, { w: 0.8 }, { w: 0.55 }]}
        highlight
        delay={0.85}
      />
    </motion.svg>
  )
}

export default BranchIllustration
