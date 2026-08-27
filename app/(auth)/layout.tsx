import Link from "next/link"
import React from "react"

/** Change the product name in one place. */
export const APP_NAME = "korospace"

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="dots opacity-40" />
      {/* fades the dot grid out toward the centre so the card sits on calm ground */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,var(--background)_25%,transparent_70%)]" />

      <div className="z-10 flex w-full max-w-sm flex-col items-center">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="12" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path d="M8.2 7.2 15.8 11M8.2 16.8 15.8 13" />
            </svg>
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {children}
      </div>
    </div>
  )
}

export default AuthLayout
