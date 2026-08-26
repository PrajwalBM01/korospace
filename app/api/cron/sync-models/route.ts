import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { syncModels } from "@/lib/models/sync"
import { env } from "@/lib/env"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function secretMatches(header: string | null): boolean {
  const secret = env.CRON_SECRET
  if (!secret || !header) return false

  const given = Buffer.from(header)
  const expected = Buffer.from(`Bearer ${secret}`)
  if (given.length !== expected.length) return false

  return crypto.timingSafeEqual(given, expected)
}

export async function GET(req: NextRequest) {
  if (!secretMatches(req.headers.get("authorization"))) {
    return new NextResponse("Not found", { status: 404 })
  }

  const lines: string[] = []

  try {
    const { result } = await syncModels({ log: (m) => lines.push(m) })
    console.log("[cron/sync-models]\n" + lines.join("\n"))
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[cron/sync-models] FAILED\n" + lines.join("\n"), error)
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
