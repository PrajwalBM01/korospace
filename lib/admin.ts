import "server-only"
import { headers } from "next/headers"
import { auth } from "./auth"
import { notFound } from "next/navigation"
import prisma from "./prisma"

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) notFound()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, banned: true },
  })

  if (!user) notFound()
  if (user.banned) notFound()
  if (user.role !== "admin") notFound()

  return user
}
