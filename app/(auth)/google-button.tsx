"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.6-5.2 3.6-8.8z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.4v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l3.9-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.4 6.6l3.9 3.1A7.2 7.2 0 0 1 12 4.8z"
    />
  </svg>
)

/**
 * Social sign-in. The same call creates the account on first use, so this
 * is identical on both the sign-in and sign-up pages - only the label moves.
 */
export const GoogleButton = ({ label }: { label: string }) => {
  const [pending, setPending] = useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        // Navigates away on success; no need to unset pending.
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/chat",
        })
        setPending(false)
      }}
      className="h-9 w-full gap-2 text-sm"
    >
      <GoogleMark />
      {pending ? "Redirecting…" : label}
    </Button>
  )
}
