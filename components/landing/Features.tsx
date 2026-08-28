"use client"

import { motion, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  BranchVisual,
  ContextFlowVisual,
  CutoffVisual,
  KeyVisual,
  ModelVisual,
  NodeTypesVisual,
} from "./FeatureVisuals"

const ease = [0.16, 1, 0.3, 1] as const

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

// const card: Variants = {
//   hidden: { opacity: 0, y: 26, scale: 0.98 },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { duration: 0.55, ease },
//   },
//   hover: { y: -5, transition: { duration: 0.25, ease } },
// }

/**
 * A bento tile. Tracks the cursor so the spotlight can follow it, and exposes a
 * "hover" variant that propagates into whatever visual it wraps.
 */
export const BentoCard = ({
  title,
  description,
  visual,
  className,
}: {
  title: string
  description: string
  visual: React.ReactNode
  className?: string
}) => {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  const trackCursor = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`)
    element.style.setProperty("--my", `${event.clientY - rect.top}px`)
  }

  return (
    <motion.div
      ref={ref}
      // variants={card}
      whileHover="hover"
      onMouseMove={trackCursor}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-[#7ccf00]/45",
        className
      )}
    >
      {/* spotlight, trailing the cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), oklch(0.75 0.2 131/0.2), transparent 65%)",
        }}
      />

      <div className="relative shrink-0">
        <h3 className="font-khand text-xl leading-tight font-semibold sm:text-2xl">
          {title}
        </h3>
        <p className="mt-1.5 font-mono text-xs leading-relaxed text-muted-foreground sm:text-[0.8rem]">
          {description}
        </p>
      </div>

      <div
        className={cn(
          "relative mt-5 min-h-0 flex-1",
          reduce ? "" : "transition-transform duration-300"
        )}
      >
        {visual}
      </div>
    </motion.div>
  )
}

const Features = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* The reveal is rendered server-side as opacity:0, so without JS to run
          the animation the section would never appear. */}
      {/* <noscript
        dangerouslySetInnerHTML={{
          __html: `<style>.js-reveal{opacity:1!important;transform:none!important}</style>`,
        }}
      /> */}
      {/* <div className="dots pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] opacity-[0.09]" /> */}

      <div className="relative mx-auto w-full max-w-[1350px] px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease }}
          className="js-reveal flex flex-col items-center text-center"
        >
          <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            features
          </span>
          <h2 className="mt-5 max-w-2xl font-khand text-3xl leading-tight font-semibold text-balance sm:text-4xl xl:text-5xl">
            Six things a scrolling chat window can&rsquo;t do.
          </h2>
        </motion.div>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:h-[40rem] lg:grid-cols-5 lg:grid-rows-[1.12fr_0.88fr]"
        >
          <BentoCard
            title="Branch from any reply"
            description="Highlight a sentence in an answer and branch it. You get a new node wired to the original, carrying the thread up to that point plus the text you picked."
            visual={<BranchVisual />}
            className="min-h-[19rem] sm:col-span-2 lg:col-span-2 lg:row-start-1 lg:min-h-0"
          />

          <BentoCard
            title="A model per node"
            description="Draft on a cheap one, reason on an expensive one."
            visual={<ModelVisual />}
            className="min-h-[15rem] sm:col-start-2 sm:row-start-2 sm:min-h-[17rem] lg:col-start-1 lg:row-start-2 lg:min-h-0"
          />

          <BentoCard
            title="Bring your own key"
            description="Add a provider key to unlock its models."
            visual={<KeyVisual />}
            className="min-h-[15rem] sm:col-start-2 sm:row-start-3 sm:min-h-[17rem] lg:col-start-2 lg:row-start-2 lg:min-h-0"
          />

          <BentoCard
            title="Context flows down the wires"
            description="A node walks its whole ancestor graph, oldest first, and inherits exactly what you connected to it. Nothing to copy across."
            visual={<ContextFlowVisual />}
            className="min-h-[34rem] sm:col-start-1 sm:row-span-2 sm:row-start-2 sm:min-h-0 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1"
          />

          <BentoCard
            title="Nodes for more than chat"
            description="Text nodes hold notes that become reference material for everything downstream of them."
            visual={<NodeTypesVisual />}
            className="min-h-[17rem] sm:col-span-2 sm:row-start-4 lg:col-span-2 lg:col-start-4 lg:row-start-1 lg:min-h-0"
          />

          <BentoCard
            title="Branches remember where they split"
            description="A branch sees the conversation as it was at the split, not whatever the parent went on to say afterwards."
            visual={<CutoffVisual />}
            className="min-h-[16rem] sm:col-span-2 sm:row-start-5 lg:col-span-2 lg:col-start-4 lg:row-start-2 lg:min-h-0"
          />
        </motion.div>
      </div>
    </section>
  )
}

export default Features
