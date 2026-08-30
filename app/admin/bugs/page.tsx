import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

export default async function AdminBugsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const q = params.q?.trim() || undefined

  const reports = await prisma.feedback.findMany({
    where: {
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  })

  const total = await prisma.feedback.count()

  return (
    <div className="mx-auto max-w-3xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} {total === 1 ? "report" : "reports"} from the beta
        </p>
      </header>

      {/* A plain GET form — no JavaScript involved at all. */}
      <form method="GET" className="mb-6 flex gap-2">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search reports…"
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
        {q && (
          <Button variant="ghost" asChild>
            <a href="/admin/bugs">Clear</a>
          </Button>
        )}
      </form>

      {reports.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {q ? `Nothing matches “${q}”.` : "Nothing reported yet."}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {reports.map((report) => (
          <li key={report.id} className="rounded-md border p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium">{report.title}</h2>
              <span className="shrink-0 text-xs text-muted-foreground">
                {dateFormat.format(report.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
              {report.description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {report.user.name}{" "}
              <span className="font-mono">{report.user.email}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
