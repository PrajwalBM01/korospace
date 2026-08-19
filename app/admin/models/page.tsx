import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"
import { ModelProvider, ModelStatus } from "@/app/generated/prisma/enums"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RouteFlag } from "./route-flag"

export const dynamic = "force-dynamic"

const PROVIDERS = ["OPENROUTER", "ANTHROPIC", "OPENAI", "GOOGLE"] as const
const FILTERS = ["free", "enabled"] as const
const WEEK = 7 * 24 * 60 * 60 * 1000

function formatPrice(value: unknown): string {
  if (value === null || value === undefined) return "—"
  const n = Number(value)
  return n === 0 ? "Free" : `$${n.toFixed(2)}`
}

function buildHref(next: { provider?: string; q?: string; filter?: string }) {
  const sp = new URLSearchParams()
  if (next.provider) sp.set("provider", next.provider)
  if (next.q) sp.set("q", next.q)
  if (next.filter) sp.set("filter", next.filter)
  const query = sp.toString()
  return query ? `/admin/models?${query}` : "/admin/models"
}

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provider?: string; filter?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const q = params.q?.trim() || undefined
  const provider = PROVIDERS.find((p) => p === params.provider)
  const filter = FILTERS.find((f) => f === params.filter)

  const scope = {
    status: { not: ModelStatus.RETIRED },
    ...(provider && { provider }),
  }

  const routes = await prisma.modelRoute.findMany({
    where: {
      ...scope,
      ...(q && { providerModelId: { contains: q, mode: "insensitive" } }),
      ...(filter === "free" && { inputPricePerM: 0, outputPricePerM: 0 }),
      ...(filter === "enabled" && {
        OR: [{ platformEnabled: true }, { byokEnabled: true }],
      }),
    },
    orderBy: [{ provider: "asc" }, { providerModelId: "asc" }],
    select: {
      id: true,
      provider: true,
      providerModelId: true,
      inputPricePerM: true,
      outputPricePerM: true,
      contextWindow: true,
      platformEnabled: true,
      byokEnabled: true,
      createdAt: true,
    },
  })

  const total = await prisma.modelRoute.count({ where: scope })
  const enabled = await prisma.modelRoute.count({
    where: { ...scope, OR: [{ platformEnabled: true }, { byokEnabled: true }] },
  })
  const free = await prisma.modelRoute.count({
    where: { ...scope, inputPricePerM: 0, outputPricePerM: 0 },
  })
  const groups = PROVIDERS.map((p) => ({
    provider: p,
    rows: routes.filter((r) => r.provider === p),
  })).filter((g) => g.rows.length > 0)

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Model control panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enabled} of {total} routes enabled on the platform
        </p>
      </header>

      {/* A plain GET form — no JavaScript involved at all. */}
      <form method="GET" className="mb-4 flex gap-2">
        {provider && <input type="hidden" name="provider" value={provider} />}
        {filter && <input type="hidden" name="filter" value={filter} />}
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search model id…"
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
        {(q || provider || filter) && (
          <Button variant="ghost" asChild>
            <a href="/admin/models">Clear all</a>
          </Button>
        )}
      </form>

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <a
          href={buildHref({ q, filter })}
          className={`rounded-md border px-3 py-1 ${!provider ? "bg-muted font-medium" : ""}`}
        >
          All
        </a>
        {PROVIDERS.map((p) => (
          <a
            key={p}
            href={buildHref({ provider: p, q, filter })}
            className={`rounded-md border px-3 py-1 ${provider === p ? "bg-muted font-medium" : ""}`}
          >
            {p.toLowerCase()}
          </a>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />

        {/* Clicking an active filter clears it. */}
        <a
          href={buildHref({
            provider,
            q,
            filter: filter === "free" ? undefined : "free",
          })}
          className={`rounded-md border px-3 py-1 ${filter === "free" ? "bg-muted font-medium" : ""}`}
        >
          Free ({free})
        </a>
        <a
          href={buildHref({
            provider,
            q,
            filter: filter === "enabled" ? undefined : "enabled",
          })}
          className={`rounded-md border px-3 py-1 ${filter === "enabled" ? "bg-muted font-medium" : ""}`}
        >
          Enabled ({enabled})
        </a>
      </nav>

      {routes.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nothing matches “{q}”.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.provider} className="mb-10">
          <h2 className="mb-2 text-xs font-semibold tracking-wider uppercase">
            {group.provider}{" "}
            <span className="font-normal text-muted-foreground">
              ({group.rows.length})
            </span>
          </h2>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Model</th>
                  <th className="px-3 py-2 font-medium">In / M</th>
                  <th className="px-3 py-2 font-medium">Out / M</th>
                  <th className="px-3 py-2 font-medium">Context</th>
                  <th className="px-3 py-2 font-medium">Platform</th>
                  <th className="px-3 py-2 font-medium">BYOK</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">
                      {r.providerModelId}
                      {Date.now() - r.createdAt.getTime() < WEEK && (
                        <span className="ml-2 rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {formatPrice(r.inputPricePerM)}
                    </td>
                    <td className="px-3 py-2">
                      {formatPrice(r.outputPricePerM)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.contextWindow?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <RouteFlag
                        routeId={r.id}
                        field="platformEnabled"
                        enabled={r.platformEnabled}
                        label={`Platform key: ${r.providerModelId}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <RouteFlag
                        routeId={r.id}
                        field="byokEnabled"
                        enabled={r.byokEnabled}
                        label={`BYOK: ${r.providerModelId}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
