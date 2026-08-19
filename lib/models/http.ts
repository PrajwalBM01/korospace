export async function getJson<T>(
  url: string,
  init: RequestInit = {},
  retries = 2
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { accept: "application/json", ...init.headers },
        signal: AbortSignal.timeout(20_000),
      })

      //code faults, expected errors
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        const body = (await res.text()).slice(0, 300)
        throw new Error(`GET ${url} → ${res.status} ${res.statusText}\n${body}`)
      }

      //thier server issues
      if (!res.ok)
        throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)

      return (await res.json()) as T
    } catch (error) {
      if (attempt >= retries) throw error
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
    }
  }
}
