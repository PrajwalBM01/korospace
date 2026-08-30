"use client"

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  Cpu,
  GitBranch,
  Hash,
  Info,
  Key,
  Link2,
  Monitor,
  MousePointerClick,
  Move,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/landing/Navbar"
import { cn } from "@/lib/utils"

/** Lime washes out on white, so light mode gets a deeper shade of the hue. */
const accent = "text-[oklch(0.55_0.17_131)] dark:text-primary"

type GuideSection = {
  id: string
  icon: React.ElementType
  title: string
  summary: string
  steps: string[]
  /** Caveats and pointers to the FAQ, which owns every "why does it do that". */
  note?: React.ReactNode
  /** Optional. No URL, no player — drop one in and the section grows one. */
  videoUrl?: string
}

/** Sends people to the FAQ rather than re-explaining mechanics here. This page
 *  stays procedural: what to click, not what happens underneath. */
const FaqLink = ({ children }: { children: React.ReactNode }) => (
  <Link
    href="/#faq"
    className={cn("underline underline-offset-4 hover:opacity-70", accent)}
  >
    {children}
  </Link>
)

const sections: GuideSection[] = [
  {
    id: "getting-in",
    videoUrl: "",
    icon: BookOpen,
    title: "Getting in",
    summary: "Make an account and land on your canvas.",
    steps: [
      "Open the sign-up page and enter your name, email and a password — or press “Continue with Google”.",
      "You go straight to a canvas. korospace makes one for you, so there is nothing to set up first.",
      "That canvas is where everything happens: you add nodes to it and wire them together.",
    ],
  },
  {
    id: "moving-around",
    icon: Move,
    title: "Moving around",
    summary: "Pan, zoom, and find your way around a canvas that has grown.",
    steps: [
      "Drag any empty part of the canvas to pan.",
      "Scroll to zoom in and out.",
      "Use the minimap in the corner to jump across a large canvas.",
      "The controls beside the minimap zoom in, zoom out, and fit everything back on screen.",
      "Double-click a node to zoom straight to it.",
    ],
  },
  {
    id: "adding-nodes",
    icon: MousePointerClick,
    title: "Adding and removing nodes",
    summary:
      "Two ways to put a node on the canvas, and one way to take it off.",
    steps: [
      "Right-click any empty part of the canvas to open the create menu, then choose Chat or Text.",
      "Or drag a wire out from a node’s side handle and let go over empty space — you get a new chat node, already connected to the one you dragged from.",
      "To remove a node, click the trash icon in its header.",
    ],
    note: (
      <>
        The create menu has a third option, <strong>Web</strong>, which is
        greyed out. It is not built yet — the{" "}
        <FaqLink>FAQ explains what is still rough</FaqLink>.
      </>
    ),
  },
  {
    id: "node-types",
    icon: Boxes,
    title: "Chat nodes and text nodes",
    summary: "What each kind of node is for.",
    steps: [
      "A chat node is a conversation with a model. Type in the box at the bottom, press Enter to send, Shift+Enter for a new line.",
      "Replies stream in as they are written, and the conversation stays in that node.",
      "A text node is a plain note. Anything you type into it becomes reference material for any node you wire it into.",
    ],
    note: (
      <>
        Text nodes are the quickest way to give several chat nodes the same
        background without pasting it into each one —{" "}
        <FaqLink>see how context reaches a node</FaqLink>.
      </>
    ),
  },
  {
    id: "models",
    icon: Cpu,
    title: "Choosing a model",
    summary: "Set which model answers, one node at a time.",
    steps: [
      "Open a chat node and use the model selector in its header.",
      "Pick a model. That node uses it for everything you send afterwards.",
      "Every node keeps its own choice, so you can run a different model in each one on the same canvas.",
    ],
    note: (
      <>
        Which models you can reach depends on your plan and on whether you have
        added your own key —{" "}
        <FaqLink>see whether you need your own API key</FaqLink>.
      </>
    ),
  },
  {
    id: "branching",
    icon: GitBranch,
    title: "Branching a reply",
    summary: "Follow a tangent without losing the thread you were on.",
    steps: [
      "Drag across the part of a reply you want to dig into, the way you would select any text.",
      "A Branch button appears next to your selection. Click it.",
      "A new chat node appears beside the original, already wired to it, carrying the conversation up to that point plus the text you highlighted.",
      "Carry on in the new node. The thread you came from is untouched.",
    ],
    note: (
      <>
        A branch only sees the conversation as it was where you split it —{" "}
        <FaqLink>
          see what happens if the parent keeps talking afterwards
        </FaqLink>
        .
      </>
    ),
  },
  {
    id: "wiring",
    icon: Link2,
    title: "Wiring nodes together",
    summary: "Hand one node’s contents to another.",
    steps: [
      "Every node has a handle on its left and right edge.",
      "Drag from one node’s handle onto another node’s handle to connect them.",
      "The node you drop onto now receives everything from the node you dragged from.",
      "A node can take several inputs at once, so wire in as many sources as you need.",
    ],
    note: (
      <>
        Everything upstream flows down, oldest first —{" "}
        <FaqLink>see exactly what a node sends to the model</FaqLink>.
      </>
    ),
  },
  {
    id: "byok",
    icon: Key,
    title: "Using your own API keys",
    summary: "Unlock a provider’s models by paying for them yourself.",
    steps: [
      "Go to the BYOK page at /byok.",
      "Choose your provider: OpenRouter, Anthropic, OpenAI or Google.",
      "Paste the key and save. It is checked against the provider before it is stored, so a wrong key fails straight away.",
      "That provider’s models now appear in the model selector. You can remove a key from the same page whenever you like.",
    ],
    note: (
      <>
        Keys are encrypted before they are stored and never come back to the
        browser — <FaqLink>see what happens to your API key</FaqLink>.
      </>
    ),
  },
]

const SectionVideo = ({ url, title }: { url: string; title: string }) => (
  <div className="mb-7 overflow-hidden rounded-xl border border-border bg-muted">
    <iframe
      src={url}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video w-full"
    />
  </div>
)

export default function GuidePage() {
  // Starts empty on purpose: nothing is highlighted until the observer reports,
  // so a deep link lands on the right entry instead of always on the first.
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // whichever visible section sits highest on the page wins
        const top = sections.find((section) => visible.has(section.id))
        if (top) setActiveId(top.id)
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
    )

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null)

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1350px] gap-0 pt-14">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-border px-4 py-10 lg:flex">
          <p className="mb-3 px-3 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            Contents
          </p>
          <nav className="flex flex-col gap-0.5">
            {sections.map(({ id, title, icon: Icon }, i) => (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  activeId === id
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0", activeId === id && accent)}
                />
                <span className="truncate">{title}</span>
                <span className="ml-auto font-mono text-[0.65rem] text-muted-foreground/60 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-5 pt-10 pb-28 sm:px-8 lg:px-14">
          <header className="max-w-[37rem]">
            <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              guide
            </span>
            <h1 className="mt-5 font-khand text-4xl leading-tight font-semibold text-balance sm:text-5xl">
              How to use korospace
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Eight short things to learn, in the order you will need them. Each
              one is just the clicks — the <FaqLink>FAQ</FaqLink> covers why any
              of it works the way it does.
            </p>

            <div className="mt-7 flex gap-3 rounded-xl border border-border bg-card/60 p-4">
              <Monitor
                className={cn("mt-0.5 size-4 shrink-0", accent)}
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  You will need a desktop to follow along.
                </span>{" "}
                The canvas is built around a mouse — right-click to add nodes,
                drag to connect them, select text to branch. This page reads
                fine on a phone, but the app itself does not work on one yet.
              </p>
            </div>
          </header>

          {/* jump nav for anything narrower than the sidebar breakpoint */}
          <div className="-mx-5 mt-10 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:hidden">
            <div className="flex w-max gap-2 pb-2">
              {sections.map(({ id, title, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
                    activeId === id
                      ? "border-border bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {title}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-20">
            {sections.map((section, i) => {
              const {
                id,
                icon: Icon,
                title,
                summary,
                steps,
                note,
                videoUrl,
              } = section
              const prev = sections[i - 1]
              const next = sections[i + 1]

              return (
                <section
                  key={id}
                  id={id}
                  className="max-w-[37rem] scroll-mt-24"
                >
                  <div className="group mb-5 flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                      <Icon className={cn("size-4", accent)} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="flex items-center gap-2 font-khand text-2xl leading-tight font-semibold sm:text-3xl">
                        {title}
                        <a
                          href={`#${id}`}
                          aria-label={`Link to ${title}`}
                          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <Hash className="size-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      </h2>
                    </div>
                  </div>

                  <p className="mb-7 leading-relaxed text-muted-foreground">
                    {summary}
                  </p>

                  {videoUrl && <SectionVideo url={videoUrl} title={title} />}

                  <ol className="flex flex-col gap-4">
                    {steps.map((step, si) => (
                      <li key={si} className="flex gap-3.5">
                        <span
                          className={cn(
                            "mt-px flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-[0.7rem] font-semibold tabular-nums",
                            accent
                          )}
                        >
                          {si + 1}
                        </span>
                        <span className="text-[0.95rem] leading-relaxed">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>

                  {note && (
                    <div className="mt-6 flex gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
                      <Info
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {note}
                      </p>
                    </div>
                  )}

                  <nav className="mt-8 flex items-stretch gap-3 border-t border-border pt-5">
                    {prev ? (
                      <a
                        href={`#${prev.id}`}
                        className="group flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                          <ArrowLeft className="size-3" />
                          Previous
                        </span>
                        <span className="truncate text-sm font-medium">
                          {prev.title}
                        </span>
                      </a>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {next ? (
                      <a
                        href={`#${next.id}`}
                        className="group flex min-w-0 flex-1 flex-col items-end gap-0.5 rounded-lg border border-border p-3 text-right transition-colors hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                          Next
                          <ArrowRight className="size-3" />
                        </span>
                        <span className="truncate text-sm font-medium">
                          {next.title}
                        </span>
                      </a>
                    ) : (
                      <div className="flex-1" />
                    )}
                  </nav>
                </section>
              )
            })}
          </div>

          <div className="mt-20 max-w-[37rem] rounded-xl border border-border bg-card/60 p-6">
            <h2 className="font-khand text-2xl font-semibold">
              That is the whole thing.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Everything else is a combination of those eight. If something here
              did not answer your question, the <FaqLink>FAQ</FaqLink> goes into
              why the pieces behave the way they do.
            </p>
            <Link
              href="/chat"
              className={cn(
                "mt-5 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:opacity-70",
                accent
              )}
            >
              Open your canvas
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
