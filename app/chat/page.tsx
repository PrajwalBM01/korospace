import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import React from "react"

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/signin")

  const canvasId =
    (await prisma.canvas.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })) ??
    (await prisma.canvas.create({
      data: {
        userId: session.user.id,
        title: "untitled canvas",
      },
    }))


  redirect(`/chat/${canvasId.id}`)

  return (
    <div className="flex h-dvh items-center justify-center">
      Preparing your canvas...
    </div>
  )
}

export default page
