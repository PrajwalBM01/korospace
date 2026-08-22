import { ModelCatalogProvider } from "@/components/reactflow/ModelCatalogContext"
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import React from "react"

const layout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  const userDetails = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      planTier: true,
      providerKeys: { select: { provider: true } },
    },
  })

  const displayModels = await prisma.modelRoute.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ platformEnabled: true }, { byokEnabled: true }],
    },
    omit: {
      description: true,
      updatedAt: true,
      createdAt: true,
      currency: true,
    },
  })

  const initialModels = displayModels.map((m) => ({
    ...m,
    inputPricePerM: m.inputPricePerM ? m.inputPricePerM.toNumber() : null,
    outputPricePerM: m.outputPricePerM ? m.outputPricePerM.toNumber() : null,
  }))

  return (
    <SidebarProvider defaultOpen={false}>
      <ModelCatalogProvider
        intialTier={userDetails?.planTier ?? "FREE"}
        intialApikeys={userDetails?.providerKeys ?? []}
        initialModels={initialModels}
      >
        <main className="h-full w-full">{children}</main>
      </ModelCatalogProvider>
    </SidebarProvider>
  )
}

export default layout
