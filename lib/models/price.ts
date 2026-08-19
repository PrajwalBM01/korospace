export function perMillion(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.trim() === "") return null

  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return null

  return (n * 1_000_000).toFixed(4)
}
