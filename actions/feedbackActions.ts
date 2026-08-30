"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { CreateFeedback, CreateFeedbackType } from "@/types/feedbackSchema"
import { ActionResult } from "@/types/nodeSchema"
import { consumeRateLimit } from "@/lib/limits/rate-limit"
import { FEEDBACK_DAILY } from "@/lib/limits/limits"

export async function sendFeedback(
  data: CreateFeedbackType
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { ok: false, error: "Please sign in again." }

  const validFields = CreateFeedback.safeParse(data)
  if (!validFields.success)
    return { ok: false, error: "Please fill in both fields." }

  // A signed-in user can otherwise loop this and fill the table.
  const { allowed } = await consumeRateLimit(
    "feedback",
    session.user.id,
    FEEDBACK_DAILY
  )
  if (!allowed)
    return {
      ok: false,
      error: "That's a few already today — thanks, try again tomorrow.",
    }

  try {
    await prisma.feedback.create({
      data: { ...validFields.data, userId: session.user.id },
    })
    return { ok: true, msg: "Thanks — got it." }
  } catch (e) {
    console.error("feedback_create_failed", e)
    return { ok: false, error: "Could not send that. Try again." }
  }
}
