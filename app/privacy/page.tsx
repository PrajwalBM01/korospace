import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy — korospace",
  robots: { index: false, follow: true },
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 py-16 sm:px-8 sm:py-24">
      <Link
        href="/"
        className="font-quantico text-xl font-semibold transition-opacity hover:opacity-70"
      >
        korospace
      </Link>

      <h1 className="mt-12 font-khand text-4xl leading-tight font-semibold sm:text-5xl">
        Privacy
      </h1>

      <div className="mt-6 flex flex-col gap-4 font-mono text-sm leading-relaxed text-muted-foreground">
        <p>
          This policy hasn&rsquo;t been written yet. korospace is in early
          access and the legal pages are still to come.
        </p>
        <p>
          Until it&rsquo;s here, the short version of how the product actually
          behaves: your canvas and its contents are scoped to your account,
          context never crosses from one canvas to another, and provider API
          keys you add are encrypted before storage and are never sent back to
          the browser.
        </p>
        <p>
          If you need something specific answered before then, ask{" "}
          <a
            href="https://x.com/xshadowdev"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            @xshadowdev
          </a>
          .
        </p>
      </div>

      <Link
        href="/"
        className="mt-12 font-mono text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Back to the site
      </Link>
    </main>
  )
}
