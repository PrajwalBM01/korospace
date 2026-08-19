"use server"

import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SetRouteFlag = z.object({
  routeId: z.string().min(1),
  field: z.enum(["platformEnabled", "byokEnabled"]),
  value: z.boolean(),
})

export async function setRouteFlag(input: unknown) {
  await requireAdmin()

  const { routeId, field, value } = SetRouteFlag.parse(input)

  await prisma.modelRoute.update({
    where: { id: routeId },
    data: { [field]: value },
  })

  revalidatePath("/admin/models")
}
