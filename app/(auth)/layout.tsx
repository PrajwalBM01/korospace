import ColorblendsBg from "@/components/landing/ColorblendsBg"
import React from "react"

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <ColorblendsBg />
      <div className="pointer-events-none fixed inset-0 bg-background/50 backdrop-blur-lg" />

      <div className="z-10 w-full max-w-5xl">{children}</div>
    </div>
  )
}

export default AuthLayout
