"use client"

import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const links = [
  { label: "Why", href: "#why" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Guide", href: "/guide" },
]

/* Both of these are external state, not React state, so they are read through
   useSyncExternalStore. That keeps the server snapshot explicit and avoids
   setting state from inside an effect. Subscribe fns live out here so they stay
   referentially stable across renders. */
const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => window.removeEventListener("scroll", onChange)
}
const readScrolled = () => window.scrollY > 8
const notScrolled = () => false

const neverChanges = () => () => {}
const onClient = () => true
const onServer = () => false

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(neverChanges, onClient, onServer)

  const dark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={
        mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Switch theme"
      }
    >
      {/* which icon to show depends on the resolved theme, which the server
          can't know, so it waits for the client rather than mismatching */}
      {mounted && (dark ? <Sun /> : <Moon />)}
    </Button>
  )
}

const Navbar = () => {
  const scrolled = React.useSyncExternalStore(
    subscribeToScroll,
    readScrolled,
    notScrolled
  )
  const [open, setOpen] = React.useState(false)

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled && "border-b border-border bg-background/70 backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-14 w-full max-w-[1350px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-quantico text-xl font-semibold transition-opacity hover:opacity-70 sm:text-2xl"
        >
          korospace
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-1.5 font-mono text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="hidden h-9 px-3 font-mono text-sm md:inline-flex"
          >
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="hidden h-9 px-3 font-mono text-sm md:inline-flex"
          >
            <Link href="/signup">Get started</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-6">
              <SheetTitle className="font-quantico text-xl font-semibold">
                korospace
              </SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation
              </SheetDescription>

              <ul className="mt-8 flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-9 w-full font-mono text-sm"
                >
                  <Link href="/signin" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="h-9 w-full font-mono text-sm"
                >
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
