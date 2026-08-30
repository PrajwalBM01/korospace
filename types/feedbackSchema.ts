import { z } from "zod"

export const CreateFeedback = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
})

export type CreateFeedbackType = z.infer<typeof CreateFeedback>
