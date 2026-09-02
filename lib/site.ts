function resolveSiteUrl() {
    // 1. Explicit override always wins — custom domain, ngrok tunnel, whatever
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    }
  
    // 2. Production → the stable custom domain
    if (
      process.env.VERCEL_ENV === "production" &&
      process.env.VERCEL_PROJECT_PRODUCTION_URL
    ) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    }
  
    // 3. Preview (your dev branch) → branch URL is stable; deploy URL is the fallback
    if (process.env.VERCEL_ENV === "preview") {
      const host = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL
      if (host) return `https://${host}`
    }
  
    // 4. Local
    return `http://localhost:${process.env.PORT ?? 3000}`
  }
  
  export const siteUrl = resolveSiteUrl()
  export const isProduction = process.env.VERCEL_ENV === "production"

  export const githubUrl = "https://github.com/PrajwalBM01/korospace"