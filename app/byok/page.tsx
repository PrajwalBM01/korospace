import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { ByokProviderType } from "@/types/keySchema"
import ByokForm from "./byok-form"

const ByokPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  // Only which providers are configured - never the key material itself.
  const keys = await prisma.userProviderKey.findMany({
    where: { userId: session.user.id },
    select: { provider: true },
  })

  return (
    <div className="w-full">
      <Link
        href="/chat"
        className="mx-auto flex w-full max-w-xl items-center gap-1.5 px-4 pt-8 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to canvas
      </Link>

      <ByokForm
        savedProviders={keys.map((k) => k.provider) as ByokProviderType[]}
      />
    </div>
  )
}

export default ByokPage
