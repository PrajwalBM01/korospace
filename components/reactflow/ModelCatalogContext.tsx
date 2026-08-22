"use client"

import {
  ModelProvider,
  ModelRoute,
  PlanTier,
} from "@/app/generated/prisma/client"
import React, { createContext, useContext, useMemo } from "react"

type Model = Omit<
  ModelRoute,
  "description" | "updatedAt" | "createdAt" | "currency"
>

export type DisplayModel = Omit<Model, "inputPricePerM" | "outputPricePerM"> & {
  inputPricePerM: number | null
  outputPricePerM: number | null
}

type ProviderKeys = {
  provider: ModelProvider
}

interface ModelCatlogContextType {
  models: DisplayModel[]
  tier: PlanTier
  apikeys: ProviderKeys[]
  platformModels: DisplayModel[]
  byokModels: DisplayModel[]
}

export const ModelCatlogContext = createContext<
  ModelCatlogContextType | undefined
>(undefined)

export function ModelCatalogProvider({
  children,
  initialModels,
  intialTier,
  intialApikeys,
}: {
  children: React.ReactNode
  initialModels: DisplayModel[]
  intialTier: PlanTier
  intialApikeys: ProviderKeys[] | []
}) {
  const value = useMemo(() => {
    const platformModels = initialModels.filter((m) => m.platformEnabled)
    const byokModels = initialModels.filter((m) => m.byokEnabled)
    return {
      models: initialModels,
      tier: intialTier,
      apikeys: intialApikeys,
      platformModels: platformModels,
      byokModels: byokModels,
    }
  }, [])
  return (
    <ModelCatlogContext.Provider value={value}>
      {children}
    </ModelCatlogContext.Provider>
  )
}

export const useModelCatalog = () => {
  const ctx = useContext(ModelCatlogContext)
  if (!ctx) {
    throw new Error("useModelCatalog must be used inside <ChatSidebarContext>")
  }
  return ctx
}
