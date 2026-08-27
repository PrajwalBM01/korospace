"use client"

import React, { useState } from "react"
import { Eye, EyeOff, KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removeApiKey, setApiKey } from "@/actions/keyActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ByokProviderType } from "@/types/keySchema"

type ProviderKey = ByokProviderType

const PROVIDERS: {
  key: ProviderKey
  name: string
  hint: string
  placeholder: string
}[] = [
  {
    key: "OPENROUTER",
    name: "OpenRouter",
    hint: "One key, every model",
    placeholder: "sk-or-v1-...",
  },
  {
    key: "GOOGLE",
    name: "Google",
    hint: "Gemini, via AI Studio",
    placeholder: "AIza...",
  },
  {
    key: "ANTHROPIC",
    name: "Anthropic",
    hint: "Claude, direct",
    placeholder: "sk-ant-...",
  },
  {
    key: "OPENAI",
    name: "OpenAI",
    hint: "GPT, direct",
    placeholder: "sk-proj-...",
  },
]

const emptyMap = <T,>(value: T) =>
  ({
    OPENROUTER: value,
    GOOGLE: value,
    ANTHROPIC: value,
    OPENAI: value,
  }) as Record<ProviderKey, T>

const NAMES = Object.fromEntries(
  PROVIDERS.map((p) => [p.key, p.name])
) as Record<ProviderKey, string>

/** A key added in this session can still be echoed back by its last four. */
const maskOf = (key: string) => `${"•".repeat(10)}${key.trim().slice(-4)}`

/** One loaded from the DB cannot — only its ciphertext is stored. */
const HIDDEN = "•".repeat(14)

const ByokForm = ({ savedProviders }: { savedProviders: ProviderKey[] }) => {
  const [drafts, setDrafts] = useState(emptyMap(""))
  const [revealed, setRevealed] = useState(emptyMap(false))
  const [saved, setSaved] = useState<Record<ProviderKey, string | null>>(() => {
    const initial = emptyMap<string | null>(null)
    for (const provider of savedProviders) initial[provider] = HIDDEN
    return initial
  })
  const [pending, setPending] = useState<ProviderKey | null>(null)

  const add = async (provider: ProviderKey) => {
    const key = drafts[provider].trim()
    if (!key || pending) return

    setPending(provider)
    const res = await setApiKey({ provider, key })
    setPending(null)

    if (!res.ok) {
      // The action verifies the key against the provider before storing it,
      // so res.error is usually specific - surface it rather than a generic.
      toast.error(res.error)
      return
    }

    setSaved((prev) => ({ ...prev, [provider]: maskOf(key) }))
    setDrafts((prev) => ({ ...prev, [provider]: "" }))
    setRevealed((prev) => ({ ...prev, [provider]: false }))
    toast.success(`${NAMES[provider]} key added`)
  }

  const remove = async (provider: ProviderKey) => {
    if (pending) return

    setPending(provider)
    const res = await removeApiKey({ provider })
    setPending(null)

    if (!res.ok) {
      toast.error(res.error)
      return
    }

    setSaved((prev) => ({ ...prev, [provider]: null }))
    toast.success(`${NAMES[provider]} key removed`)
  }

  const connected = PROVIDERS.filter((p) => saved[p.key]).length

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <header className="mb-5 flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          <KeyRound className="size-3.5" />
        </span>
        <div>
          <h1 className="font-heading text-sm font-semibold">
            Bring your own key
          </h1>
          <p className="text-xs text-muted-foreground">
            Add a provider key to unlock its models, remove it whenever you
            like. Every key is optional — providers you skip keep using platform
            models.
          </p>
        </div>
      </header>

      <div className="divide-y rounded-lg border bg-card">
        {PROVIDERS.map((provider) => {
          const mask = saved[provider.key]
          const draft = drafts[provider.key]
          const isRevealed = revealed[provider.key]

          return (
            <div
              key={provider.key}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3"
            >
              <label
                htmlFor={`key-${provider.key}`}
                className="flex min-w-0 items-center gap-2 sm:w-36"
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full transition-colors",
                    mask ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">
                    {provider.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {mask ? "Key added" : provider.hint}
                  </span>
                </span>
              </label>

              <div className="flex flex-1 items-center gap-1.5">
                {mask ? (
                  <p className="flex h-7 flex-1 items-center rounded-md border border-input bg-input/20 px-2 font-mono text-xs text-muted-foreground dark:bg-input/30">
                    {mask}
                  </p>
                ) : (
                  <div className="relative flex-1">
                    <Input
                      id={`key-${provider.key}`}
                      name={provider.key}
                      type={isRevealed ? "text" : "password"}
                      value={draft}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [provider.key]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          add(provider.key)
                        }
                      }}
                      placeholder={provider.placeholder}
                      autoComplete="off"
                      spellCheck={false}
                      className="pr-7 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((prev) => ({
                          ...prev,
                          [provider.key]: !prev[provider.key],
                        }))
                      }
                      aria-label={
                        isRevealed
                          ? `Hide ${provider.name} key`
                          : `Show ${provider.name} key`
                      }
                      className="absolute inset-y-0 right-0 flex w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {isRevealed ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {mask ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(provider.key)}
                    disabled={pending !== null}
                    aria-label={`Remove ${provider.name} key`}
                  >
                    <Trash2 data-icon="inline-start" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => add(provider.key)}
                    disabled={draft.trim() === "" || pending !== null}
                    aria-label={`Add ${provider.name} key`}
                  >
                    <Plus data-icon="inline-start" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0" />
          Encrypted at rest. Never shown again once added.
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {connected} of {PROVIDERS.length} connected
        </p>
      </div>
    </div>
  )
}

export default ByokForm
