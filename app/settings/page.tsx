"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React, { useState } from "react"
import { ModelProvider as Providers } from "../generated/zod/schemas/enums/ModelProvider.schema"
import { ModelProvider } from "../generated/prisma/enums"
import { setApiKey } from "@/actions/keyActions"
import { toast } from "sonner"
const page = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-xl flex-col gap-4">
        <h1>Configerd keys</h1>

        <KeyInput provider={"ANTHROPIC"}></KeyInput>
        <KeyInput provider={"GOOGLE"}></KeyInput>
        <KeyInput provider={"OPENAI"}></KeyInput>
        <KeyInput provider={"OPENROUTER"}></KeyInput>
      </div>
    </div>
  )
}

export default page

const KeyInput = ({ provider }: { provider: Providers }) => {
  const [key, setKey] = useState("")
  const [status, setstatus] = useState("")

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await setApiKey({ provider: provider, key: key })
    if (!res.ok) {
      toast.error("failed to add api key")
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <form action="" onSubmit={handleSubmit} className="flex w-full gap-2">
        <h1>{provider}: </h1>
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          type="password"
          placeholder="*******************"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  )
}
