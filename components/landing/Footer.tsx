import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import GetStarted from "./GetStarted"
import { githubUrl } from "@/lib/site"

type FooterLink = { label: string; href: string; external?: boolean }

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: "product",
    links: [
      { label: "Get started", href: "/signup" },
      { label: "Sign in", href: "/signin" },
      { label: "How to use", href: "/guide" },
    ],
  },
  {
    title: "legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "elsewhere",
    links: [
      { label: "X", href: "https://x.com/xshadowdev", external: true },
      { label: "Github", href: githubUrl, external: true },
      {
        label: "Linkedin",
        href: "https://www.linkedin.com/in/prajwalbm/",
        external: true,
      },
    ],
  },
]

const FooterLinks = ({
  title,
  links,
}: {
  title: string
  links: FooterLink[]
}) => (
  <div>
    <h3 className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
      {title}
    </h3>
    <ul className="mt-4 flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ) : (
            <Link
              href={link.href}
              className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
)

/** An uneven skyline, one column per letter, so the name is what emits the
 *  light. Heights are fixed rather than random so the shape stays stable
 *  between server and client render. */
const columnHeights = [20, 30, 55, 75, 100, 75, 55, 30, 20]

const Wordmark = () => (
  <div className="wordmark-slab relative w-full">
    <span className="sr-only">korospace</span>

    <div
      aria-hidden="true"
      className="relative h-[12rem] overflow-hidden select-none sm:h-[17rem] lg:h-[24rem]"
    >
      <div className="absolute inset-0 grid grid-cols-9">
        {columnHeights.map((height, i) => (
          <div key={i} className="relative">
            {i > 0 && (
              <div className="absolute inset-y-0 left-0 border-l border-dashed border-foreground/15" />
            )}
            <div
              className="wordmark-glow absolute inset-0"
              style={{
                WebkitMaskImage: `linear-gradient(to top, #000 ${height - 7}%, transparent ${height}%)`,
                maskImage: `linear-gradient(to top, #000 ${height - 7}%, transparent ${height}%)`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="wordmark-grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-4">
        {" "}
        <span className="font-quantico text-5xl font-bold">Korospace</span>
      </div>
      {/* knocked out of the light, in the slab's own colour */}
      {/* <div className="absolute inset-x-0 bottom-[0.085em] grid grid-cols-9 font-quantico text-[clamp(2rem,13.9vw,18rem)] leading-[0.8] font-bold text-background">
        {"KOROSPACE".split("").map((letter, i) => (
          <span
            key={i}
            className="text-center transition-transform duration-300 ease-out hover:-translate-y-[0.05em]"
          >
            {letter}
          </span>
        ))}
      </div> */}
    </div>
  </div>
)

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[1350px] px-5 sm:px-8">
        {/* closing pitch, and the details */}
        <div className="grid gap-10 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-0 lg:py-16">
          <div className="lg:pr-12">
            <h2 className="max-w-sm font-khand text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              Stop starting over.
            </h2>
            <p className="mt-3 max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
              Every tangent you dropped was a thread you didn&rsquo;t want to
              lose. Put them on a canvas instead.
            </p>
            <div className="mt-7 font-mono">
              <GetStarted text="Get started" className="text-md p-4" />
            </div>
            <p className="mt-3 font-mono text-[0.65rem] text-muted-foreground">
              Early access &middot; desktop only for now
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:border-l lg:border-border lg:pl-12">
            {groups.map((group) => (
              <FooterLinks key={group.title} {...group} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-5 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; 2026 korospace</span>

          <span>
            Built by{" "}
            <a
              href="https://x.com/xshadowdev"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              @xshadowdev
            </a>
          </span>
        </div>
      </div>

      <Wordmark />
    </footer>
  )
}

export default Footer
