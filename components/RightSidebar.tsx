"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Bug,
  ChevronRight,
  Inbox,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Mouse,
  Shield,
  Sun,
  Touchpad,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "./ui/sidebar"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { useCanvasStore } from "@/store/canvasStore"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { GitHub } from "./ui/github"
import { githubUrl } from "@/lib/site"

/** Small caps label that opens each section. */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
    {children}
  </p>
)

type Option<T extends string> = {
  value: T
  label: string
  icon: React.ReactNode
}

/**
 * Segmented picker. Real buttons in a radiogroup rather than clickable
 * divs, so it is reachable by keyboard and announced correctly.
 */
function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (next: T) => void
  options: Option<T>[]
  label: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-lg border bg-card p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
              "[&_svg]:size-3.5 [&_svg]:shrink-0",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** One tappable row that navigates somewhere. */
const NavRow = ({
  href,
  icon,
  title,
  hint,
  external,
}: {
  href: string
  icon: React.ReactNode
  title: string
  hint: string
  external?: boolean
}) => (
  <Link
    target={external ? "_blank" : "_self"}
    href={href}
    className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
  >
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground [&_svg]:size-3.5">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-medium">{title}</span>
      <span className="block truncate text-[10px] text-muted-foreground">
        {hint}
      </span>
    </span>
    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
  </Link>
)

/** Same row, but it runs something instead of navigating. */
const ActionRow = ({
  onClick,
  icon,
  title,
  hint,
}: {
  onClick: () => void
  icon: React.ReactNode
  title: string
  hint: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
  >
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground [&_svg]:size-3.5">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-medium">{title}</span>
      <span className="block truncate text-[10px] text-muted-foreground">
        {hint}
      </span>
    </span>
    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
  </button>
)

const RightSidebar = () => {
  const { isMouse, setIsMouse, setFeedbackOpen } = useCanvasStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [signingOut, setSigningOut] = useState(false)

  const user = session?.user
  const isAdmin = user?.role === "admin"
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()

  const signOut = async () => {
    setSigningOut(true)
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/signin") },
    })
    setSigningOut(false)
  }

  return (
    <Sidebar side="right" variant="floating">
      <SidebarHeader className="gap-0 p-2 pb-1">
        <div className="flex items-center justify-between">
          <p className="px-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Settings
          </p>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-2">
        {/* who you are */}
        <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5">
          {isPending ? (
            <>
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </>
          ) : (
            <>
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {initial}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-medium">
                    {user?.name ?? "Signed in"}
                  </span>
                  {isAdmin && (
                    <span className="shrink-0 rounded-sm border px-1 text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                      Admin
                    </span>
                  )}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </>
          )}
        </div>

        {/* account */}
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Account</SectionLabel>
          <NavRow
            href="/byok"
            icon={<KeyRound strokeWidth={1.5} />}
            title="API keys"
            hint="Bring your own key to unlock more models"
          />
          {isAdmin && (
            <NavRow
              href="/admin/models"
              icon={<Shield strokeWidth={1.5} />}
              title="Model catalog"
              hint="Enable models for the platform and BYOK"
            />
          )}
          {isAdmin && (
            <NavRow
              href="/admin/bugs"
              icon={<Inbox strokeWidth={1.5} />}
              title="Feedback inbox"
              hint="What people have reported during the beta"
            />
          )}
        </div>

        {/* beta feedback */}
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Beta</SectionLabel>
          <ActionRow
            onClick={() => setFeedbackOpen(true)}
            icon={<Bug strokeWidth={1.5} />}
            title="Report a bug"
            hint="Or tell us about a feature you want"
          />
        </div>

        {/* canvas controls */}
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Pointer</SectionLabel>
          <Segmented
            label="Pointer type"
            value={isMouse ? "mouse" : "touchpad"}
            onChange={(next) => setIsMouse(next === "mouse")}
            options={[
              {
                value: "mouse",
                label: "Mouse",
                icon: <Mouse strokeWidth={1.5} />,
              },
              {
                value: "touchpad",
                label: "Touchpad",
                icon: <Touchpad strokeWidth={1.5} />,
              },
            ]}
          />
          <p className="px-0.5 text-[10px] text-muted-foreground">
            {isMouse
              ? "Drag the canvas to pan, scroll to zoom."
              : "Two-finger scroll to pan, pinch to zoom."}
          </p>
        </div>

        {/* appearance */}
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Theme</SectionLabel>
          <Segmented
            label="Colour theme"
            value={(theme ?? "system") as "light" | "dark" | "system"}
            onChange={setTheme}
            options={[
              {
                value: "light",
                label: "Light",
                icon: <Sun strokeWidth={1.5} />,
              },
              {
                value: "dark",
                label: "Dark",
                icon: <Moon strokeWidth={1.5} />,
              },
              {
                value: "system",
                label: "Auto",
                icon: <Monitor strokeWidth={1.5} />,
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Open source</SectionLabel>
          <NavRow
            external
            href={githubUrl}
            icon={<GitHub />}
            title="Star on GitHub"
            hint="Korospace is open source — a star helps a lot"
          />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          onClick={signOut}
          disabled={signingOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut data-icon="inline-start" strokeWidth={1.5} />
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default RightSidebar
