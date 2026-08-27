"use client"
import React, { useMemo, useState } from "react"
import {
  ChevronDown,
  CircleCheck,
  KeyRound,
  Lock,
  Search,
  Sprout,
} from "lucide-react"

import { ModelProvider } from "@/app/generated/prisma/client"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DisplayModel, useModelCatalog } from "./ModelCatalogContext"
import { switchNodeModel } from "@/actions/nodeActions"
import { toast } from "sonner"
import { Source, modelType } from "@/components/reactflow/nodes/index"

const SOURCE_LABEL: Record<Source, string> = {
  PLATFORM: "korospace",
  BYOK: "BYOK",
}

const NAMES: Record<string, string> = {
  OPENROUTER: "OpenRouter",
  ANTHROPIC: "Anthropic",
  GOOGLE: "Google",
  OPENAI: "OpenAI",
}

const nameOf = (key: string) =>
  NAMES[key.toUpperCase()] ?? key.charAt(0).toUpperCase() + key.slice(1)

const isFree = (m: DisplayModel) =>
  (m.inputPricePerM ?? 0) === 0 && (m.outputPricePerM ?? 0) === 0

/** One short line under the model name. `description` is not in the payload. */

function Glyph({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-md border bg-muted text-[10px] font-semibold text-muted-foreground uppercase",
        className
      )}
    >
      {label.slice(0, 1)}
    </span>
  )
}
const getModelDetails = ({
  model,
  byokModels,
  platformModels,
}: {
  model: modelType
  byokModels: DisplayModel[]
  platformModels: DisplayModel[]
}): DisplayModel | null => {
  const sourceList = model.source === "PLATFORM" ? platformModels : byokModels
  return sourceList.find((m) => m.modelId === model.modelId) ?? null
}

/** Why a row cannot be picked, or null when it can. */
type LockReason = "key" | "plan" | null

const ModelSelector = ({
  onSelect,
  nodeId,
  model,
}: {
  onSelect?: (model: DisplayModel, source: Source) => void
  nodeId: string
  model: modelType
}) => {
  const { apikeys, byokModels, platformModels, tier } = useModelCatalog()

  const [open, setOpen] = useState(false)
  const [tabs, settabs] = useState<Source>("PLATFORM")
  const [group, setGroup] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<{
    model: DisplayModel
    source: Source
  } | null>(() => {
    const found = getModelDetails({ model, byokModels, platformModels })
    return found ? { model: found, source: model.source } : null
  })

  const list = tabs === "PLATFORM" ? platformModels : byokModels

  const hasKey = (provider: ModelProvider) =>
    apikeys.some((k) => k.provider === provider)

  const keyOf = (m: DisplayModel, source: Source) =>
    source === "PLATFORM" ? m.author : m.provider

  const groups = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of list) {
      const key = keyOf(m, tabs)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) =>
      nameOf(a[0]).localeCompare(nameOf(b[0]))
    )
  }, [list, tabs])

  const searching = query.trim().length > 0
  const activeGroup = group ?? groups[0]?.[0] ?? null

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = searching
      ? list.filter(
          (m) =>
            m.displayName.toLowerCase().includes(q) ||
            m.author.toLowerCase().includes(q) ||
            m.modelId.toLowerCase().includes(q)
        )
      : list.filter((m) => keyOf(m, tabs) === activeGroup)
    return [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [list, tabs, query, searching, activeGroup])

  const lockOf = (m: DisplayModel): LockReason => {
    if (tabs === "BYOK") return hasKey(m.provider) ? null : "key"
    return tier === "FREE" && !isFree(m) ? "plan" : null
  }

  const choose = async (m: DisplayModel) => {
    setOpen(false)
    const res = await switchNodeModel({
      data: {
        model: {
          modelId: m.modelId,
          source: tabs,
          author: m.author,
        },
      },
      nodeId: nodeId,
    })
    if (!res.ok) {
      toast.error("Could not switch the model")
      return
    }
    setSelected({ model: m, source: tabs })
    onSelect?.(m, tabs)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-between gap-1.5 border-none bg-transparent dark:bg-transparent"
        >
          {selected ? (
            <>
              <Glyph label={nameOf(keyOf(selected.model, selected.source))} />
              <span className="truncate">
                {SOURCE_LABEL[selected.source]} ·{" "}
                {nameOf(selected.model.author)} · {selected.model.displayName}
              </span>
            </>
          ) : (
            <>
              <span className="truncate">Select a model</span>
            </>
          )}
          <ChevronDown className="shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[380px] gap-0 overflow-hidden p-0"
      >
        {/* tabs */}
        <div className="grid grid-cols-2 border-b">
          {(["PLATFORM", "BYOK"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                settabs(tab)
                setGroup(null)
                setQuery("")
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                tabs === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "PLATFORM" ? (
                <Sprout className="size-3.5" />
              ) : (
                <KeyRound className="size-3.5" />
              )}
              {SOURCE_LABEL[tab]}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex h-[260px]">
          {/* provider rail */}
          <div className="w-[150px] shrink-0 overflow-y-auto border-r p-1.5">
            <p className="px-2 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Providers
            </p>

            {groups.map(([key, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setGroup(key)
                  setQuery("")
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                  !searching && key === activeGroup
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Glyph label={nameOf(key)} />
                <span className="flex-1 truncate text-left">{nameOf(key)}</span>
                {tabs === "BYOK" && !hasKey(key as ModelProvider) ? (
                  <span className="text-[9px] text-muted-foreground">
                    no key
                  </span>
                ) : (
                  <span className="text-[10px] tabular-nums opacity-50">
                    {count}
                  </span>
                )}
              </button>
            ))}

            {groups.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                Nothing here
              </p>
            )}
          </div>

          {/* model list */}
          <div className="flex-1 overflow-y-auto p-1.5">
            <p className="px-2 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Models
            </p>

            {visible.map((m) => {
              const lock = lockOf(m)
              const isCurrent =
                selected?.model.id === m.id && selected.source === tabs

              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={lock !== null}
                  onClick={async () => await choose(m)}
                  title={
                    lock === "plan"
                      ? "Paid model — upgrade your plan, or use your own key in BYOK"
                      : lock === "key"
                        ? `Add a ${nameOf(m.provider)} key to use this model`
                        : undefined
                  }
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                    isCurrent ? "bg-accent" : "hover:bg-accent/50",
                    lock !== null && "opacity-50"
                  )}
                >
                  <span className="min-w-0 flex-1 p-1">
                    <span className="block truncate text-xs font-medium">
                      {m.displayName}
                    </span>
                    {/* <span className="block truncate text-[10px] text-muted-foreground">
                      {blurbOf(m)}
                    </span> */}
                  </span>

                  {lock !== null ? (
                    <Lock className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                  ) : isCurrent ? (
                    <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  ) : null}
                </button>
              )
            })}

            {visible.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                {searching ? "No models match" : "No models here"}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ModelSelector
