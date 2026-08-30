"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { sendFeedback } from "@/actions/feedbackActions"
import { useCanvasStore } from "@/store/canvasStore"

const TITLE_MAX = 120
const BODY_MAX = 2000

/**
 * Mounted once on the canvas. Both entry points - the pane context menu and
 * the settings sidebar - just flip `feedbackOpen`, because a dialog rendered
 * inside a context menu dies with the menu on select.
 */
const FeedbackDialog = () => {
  const { feedbackOpen, setFeedbackOpen } = useCanvasStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sending, setSending] = useState(false)

  const canSend = title.trim() !== "" && description.trim() !== "" && !sending

  const submit = async () => {
    if (!canSend) return

    setSending(true)
    const res = await sendFeedback({ title, description })
    setSending(false)

    if (!res.ok) {
      toast.error(res.error)
      return
    }

    setTitle("")
    setDescription("")
    setFeedbackOpen(false)
    toast.success(res.msg)
  }

  return (
    <Dialog
      open={feedbackOpen}
      onOpenChange={(open) => {
        // Anything typed survives a stray click outside - it is only
        // cleared once it has actually been sent.
        if (!sending) setFeedbackOpen(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a bug or request a feature</DialogTitle>
          <DialogDescription>
            Korospace is in beta. Tell us what broke or what is missing — it
            goes straight to us.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="feedback-title"
              className="px-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
            >
              Title
            </label>
            <Input
              id="feedback-title"
              value={title}
              maxLength={TITLE_MAX}
              disabled={sending}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Branching from a message loses the reply"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="feedback-description"
              className="px-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
            >
              Details
            </label>
            <Textarea
              id="feedback-description"
              value={description}
              maxLength={BODY_MAX}
              disabled={sending}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you do, what did you expect, what happened instead?"
              className="min-h-28"
            />
            <p className="px-0.5 text-right text-[10px] text-muted-foreground">
              {description.length}/{BODY_MAX}
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSend}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackDialog
