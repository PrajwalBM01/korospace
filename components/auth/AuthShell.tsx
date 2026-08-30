import Link from "next/link"

import { cn } from "@/lib/utils"
import AuthShowcase from "./AuthShowcase"

/** Change the product name in one place. */
export const APP_NAME = "korospace"

const AuthShell = ({
  showcase = "right",
  children,
}: {
  showcase?: "left" | "right"
  children: React.ReactNode
}) => {
  const onLeft = showcase === "left"

  return (
    <div className="mx-auto grid w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/50 shadow-2xl backdrop-blur-xl lg:min-h-[36rem] lg:max-w-5xl lg:grid-cols-2">
      <div
        className={cn(
          "flex flex-col justify-center p-6 sm:p-8 xl:p-10",
          onLeft && "lg:order-2"
        )}
      >
        <div className="mx-auto w-full max-w-sm">
          {children}
        </div>
      </div>

      <AuthShowcase
        className={cn(
          onLeft ? "lg:order-1 lg:border-r" : "lg:border-l",
          "border-border"
        )}
      />
    </div>
  )
}

export default AuthShell
