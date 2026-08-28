"use client"

import { Bot, FileText, Globe, KeyRound, Lock, Split } from "lucide-react"
import { motion } from "motion/react"
import type { TargetAndTransition, Variants } from "motion/react"

/** Lime washes out on white, so light mode gets a deeper shade of the hue. */
const wire = "stroke-[oklch(0.6_0.19_131)] dark:stroke-primary"
const limeText = "text-[oklch(0.55_0.17_131)] dark:text-primary"

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Parts of a visual hold still through the entrance stagger and only move when
 * the card around them is hovered, so `hidden` and `show` are both the resting
 * state and the card's "hover" label is what drives them.
 */
const onHover = (
  rest: TargetAndTransition,
  hover: TargetAndTransition
): Variants => ({ hidden: rest, show: rest, hover })

const Bar = ({ w, dim = false }: { w: string; dim?: boolean }) => (
  <div
    className={`h-1.5 rounded-full ${dim ? "bg-foreground/10" : "bg-foreground/20"} ${w}`}
  />
)

/* A - branch from any reply */

export const BranchVisual = () => (
  <div className="relative h-full min-h-[8.5rem] w-full">
    <div className="absolute inset-y-1 left-0 flex w-[57%] flex-col gap-2 rounded-lg border border-border bg-background/50 p-3">
      <Bar w="w-full" />
      <Bar w="w-5/6" />

      {/* the sentence you drag over */}
      <div className="relative py-0.5">
        <motion.span
          aria-hidden="true"
          variants={onHover(
            { scaleX: 0 },
            { scaleX: 1, transition: { duration: 0.35, ease } }
          )}
          style={{ originX: 0 }}
          className="absolute inset-y-0 left-0 w-[88%] rounded-sm bg-[#7ccf00]/35"
        />
        <div className="relative h-1.5 w-[88%] rounded-full bg-foreground/30" />
      </div>

      <Bar w="w-2/3" dim />

      <motion.span
        variants={onHover(
          { opacity: 0, y: 4, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { delay: 0.18, duration: 0.3, ease },
          }
        )}
        className={`mt-auto inline-flex w-fit items-center gap-1 rounded-md border border-[#7ccf00]/50 bg-[#7ccf00]/10 px-1.5 py-0.5 font-mono text-[0.6rem] ${limeText}`}
      >
        <Split className="size-2.5 rotate-90" />
        Branch
      </motion.span>
    </div>

    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <motion.path
        d="M57 55 C 68 55, 66 26, 78 26"
        strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className={wire}
        variants={onHover(
          { pathLength: 0, opacity: 0 },
          { pathLength: 1, opacity: 1, transition: { duration: 0.4, ease } }
        )}
      />
    </svg>

    <motion.div
      variants={onHover(
        { opacity: 0, scale: 0.92, x: -8 },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          transition: { delay: 0.22, duration: 0.35, ease },
        }
      )}
      className="absolute top-2 right-0 flex w-[38%] flex-col gap-2 rounded-lg border border-[#7ccf00]/50 bg-[#7ccf00]/[0.07] p-2.5"
    >
      <span
        className={`font-mono text-[0.55rem] tracking-wider uppercase ${limeText}`}
      >
        new branch
      </span>
      <Bar w="w-full" />
      <Bar w="w-3/5" dim />
    </motion.div>
  </div>
)

/* B1 - a model per node */

const providers = ["openrouter", "anthropic", "google"]

export const ModelVisual = () => (
  <div className="rounded-lg border border-border bg-background/50 p-1.5">
    <div className="relative">
      <motion.div
        variants={onHover(
          { y: 0 },
          { y: 28, transition: { duration: 0.4, ease } }
        )}
        className="absolute inset-x-0 top-0 h-7 rounded-md border border-[#7ccf00]/50 bg-[#7ccf00]/10"
      />
      {providers.map((provider) => (
        <div
          key={provider}
          className="relative flex h-7 items-center gap-2 px-2 font-mono text-[0.65rem] text-muted-foreground"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-foreground/30" />
          <span className="truncate">{provider}</span>
        </div>
      ))}
    </div>
  </div>
)

/* B2 - bring your own key */

export const KeyVisual = () => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2">
      <KeyRound className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate font-mono text-[0.65rem] text-muted-foreground">
        sk-••••••••••
      </span>
      <motion.span
        variants={onHover(
          { rotate: 0, scale: 1 },
          { rotate: -14, scale: 1.2, transition: { duration: 0.3, ease } }
        )}
        className="ml-auto shrink-0"
      >
        <Lock className={`size-3.5 ${limeText}`} />
      </motion.span>
    </div>
    <motion.span
      variants={onHover(
        { opacity: 0, y: -4 },
        { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.3, ease } }
      )}
      className={`w-fit rounded-md border border-[#7ccf00]/40 bg-[#7ccf00]/10 px-1.5 py-0.5 font-mono text-[0.55rem] ${limeText}`}
    >
      encrypted at rest
    </motion.span>
  </div>
)

/* C - context flows down the wires */

/** The spine everything drains into. Nodes sit either side of it so no wire
 *  ever has to cross one. */
const trunk = "M100 30 L100 292"

const connectors = [
  "M88 33 C95 33, 100 36, 100 43",
  "M112 129 C105 129, 100 132, 100 139",
  "M88 225 C95 225, 100 228, 100 235",
]

type FlowNode = { x: number; y: number; w: number; h: number; label: string }

const flowNodes: FlowNode[] = [
  { x: 6, y: 14, w: 82, h: 38, label: "chat" },
  { x: 112, y: 110, w: 82, h: 38, label: "note" },
  { x: 6, y: 206, w: 82, h: 38, label: "chat" },
]

/** Where a connector meets a node, drawn like the handles on the real canvas. */
const handles = [
  { cx: 88, cy: 33 },
  { cx: 112, cy: 129 },
  { cx: 88, cy: 225 },
]

export const ContextFlowVisual = () => {
  return (
    <svg
      viewBox="0 0 200 380"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <g className="stroke-border" strokeWidth={1.5}>
        <path d={trunk} />
        {connectors.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Context, travelling down the spine. Plain path on a CSS animation:
          `pathLength` is a reserved prop on motion.path that would overwrite
          the dash pattern this effect is built from. */}
      <path
        d={trunk}
        pathLength={1}
        strokeWidth={2.5}
        strokeLinecap="round"
        className={`wire-flow ${wire}`}
      />

      {flowNodes.map((node) => (
        <g key={node.label + node.y}>
          <rect
            x={node.x}
            y={node.y}
            width={node.w}
            height={node.h}
            rx={8}
            strokeWidth={1.5}
            className="fill-card stroke-border"
          />
          <rect
            x={node.x + 9}
            y={node.y + 10}
            width={8}
            height={8}
            rx={2.5}
            className="fill-foreground/30"
          />
          <text
            x={node.x + 23}
            y={node.y + 17}
            fontSize={8.5}
            letterSpacing={0.4}
            className="fill-muted-foreground font-mono"
          >
            {node.label}
          </text>
          <rect
            x={node.x + 9}
            y={node.y + 27}
            width={node.w - 18}
            height={3}
            rx={1.5}
            className="fill-foreground/15"
          />
        </g>
      ))}

      {handles.map((h) => (
        <rect
          key={`${h.cx}-${h.cy}`}
          x={h.cx - 3}
          y={h.cy - 5}
          width={6}
          height={10}
          rx={1.5}
          strokeWidth={2}
          className={`fill-background ${wire}`}
        />
      ))}

      {/* the node everything upstream feeds into */}
      <rect
        x={30}
        y={292}
        width={140}
        height={72}
        rx={9}
        strokeWidth={1.5}
        className={`fill-primary/15 ${wire}`}
      />
      <text
        x={42}
        y={313}
        fontSize={9}
        letterSpacing={0.3}
        className={`fill-current font-mono ${limeText}`}
      >
        &lt;sources&gt;
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={42}
          y={324 + i * 9}
          width={112 - i * 26}
          height={3}
          rx={1.5}
          className="fill-foreground/20"
        />
      ))}
    </svg>
  )
}

/* D - nodes for more than chat */

const nodeTypes = [
  { icon: Bot, label: "chat", desc: "talks to a model" },
  { icon: FileText, label: "text", desc: "a note things downstream can read" },
  { icon: Globe, label: "web", desc: "pulls a page in", soon: true },
]

export const NodeTypesVisual = () => (
  <div className="grid h-full grid-cols-3 gap-2">
    {nodeTypes.map((type, i) => (
      <motion.div
        key={type.label}
        variants={onHover(
          { y: 0 },
          { y: -5, transition: { delay: i * 0.06, duration: 0.3, ease } }
        )}
        className={`flex flex-col gap-1.5 rounded-lg border p-2.5 ${
          type.soon
            ? "border-dashed border-border bg-background/30"
            : "border-border bg-background/50"
        }`}
      >
        <type.icon
          className={`size-3.5 ${type.soon ? "text-muted-foreground/50" : limeText}`}
        />
        <span
          className={`font-mono text-[0.7rem] ${type.soon ? "text-muted-foreground/60" : ""}`}
        >
          {type.label}
        </span>
        <span className="font-mono text-[0.6rem] leading-snug text-muted-foreground/70">
          {type.soon ? "not shipped yet" : type.desc}
        </span>
      </motion.div>
    ))}
  </div>
)

/* E - branches remember where they split */

const beforeSplit = [12, 50, 88]
const afterSplit = [126, 164, 202, 240]

export const CutoffVisual = () => (
  <svg
    viewBox="0 0 320 110"
    fill="none"
    aria-hidden="true"
    className="absolute inset-0 h-full w-full"
  >
    <text
      x={12}
      y={13}
      fontSize={7.5}
      className="fill-muted-foreground font-mono"
    >
      parent
    </text>
    {beforeSplit.map((x) => (
      <rect
        key={x}
        x={x}
        y={22}
        width={26}
        height={11}
        rx={4}
        className="fill-foreground/25"
      />
    ))}
    {afterSplit.map((x, i) => (
      <motion.rect
        key={x}
        x={x}
        y={22}
        width={26}
        height={11}
        rx={4}
        className="fill-foreground/25"
        variants={onHover(
          { opacity: 1 },
          { opacity: 0.2, transition: { delay: i * 0.04, duration: 0.3, ease } }
        )}
      />
    ))}

    {/* the point the branch was cut at */}
    <line
      x1={118}
      y1={16}
      x2={118}
      y2={86}
      strokeWidth={1.5}
      className={`wire-ants ${wire}`}
    />
    <text
      x={118}
      y={102}
      fontSize={7.5}
      textAnchor="middle"
      className={`fill-current font-mono ${limeText}`}
    >
      split
    </text>

    <text
      x={12}
      y={61}
      fontSize={7.5}
      className="fill-muted-foreground font-mono"
    >
      branch
    </text>
    {beforeSplit.map((x) => (
      <rect
        key={x}
        x={x}
        y={68}
        width={26}
        height={11}
        rx={4}
        className="fill-foreground/25"
      />
    ))}
    {[126, 164].map((x, i) => (
      <motion.rect
        key={x}
        x={x}
        y={68}
        width={26}
        height={11}
        rx={4}
        strokeWidth={1}
        className={`fill-primary/70 ${wire}`}
        variants={onHover(
          { opacity: 0.75 },
          {
            opacity: 1,
            transition: { delay: 0.1 + i * 0.08, duration: 0.3, ease },
          }
        )}
      />
    ))}
  </svg>
)
