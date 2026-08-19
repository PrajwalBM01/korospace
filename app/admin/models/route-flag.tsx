"use client"

import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { setRouteFlag } from "@/actions/modelActions"

export function RouteFlag({
  routeId,
  field,
  enabled,
  label,
}: {
  routeId: string
  field: "platformEnabled" | "byokEnabled"
  enabled: boolean
  label: string
}) {
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(enabled)

  return (
    <Switch
      checked={optimistic}
      disabled={isPending}
      aria-label={label}
      onCheckedChange={(next) => {
        startTransition(async () => {
          setOptimistic(next) // show it immediately
          try {
            await setRouteFlag({ routeId, field, value: next })
          } catch {
            // The switch snaps back on its own — see below.
            toast.error("Could not save that change")
          }
        })
      }}
    />
  )
}