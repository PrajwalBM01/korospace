"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

const page = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Something went wrong")
      return
    }

    router.push("/chat")
  }

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="dots" />
      <div className="z-1 flex h-1/2 w-2xl flex-col items-center justify-center gap-2 rounded-xl bg-accent">
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex w-full max-w-xs flex-col items-center justify-center gap-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "logging in" : "Sign in"}
            </Button>
          </div>
        </form>
        <Button
          onClick={async () =>
            await authClient.signIn.social({
              provider: "google",
              callbackURL: "/chat",
            })
          }
        >
          Sign in with google
        </Button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>
    </div>
  )
}

export default page

{
  /* <div className="min-h-screen w-full bg-black relative">
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "#000000",
      backgroundImage: `
        radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)
      `,
      backgroundSize: "30px 30px",
      backgroundPosition: "0 0",
    }}
  />
     
</div> */
}
