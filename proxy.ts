import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function proxy(request: NextRequest) {
  console.log("reaching proxy check")
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/api/chat/:path*",
}
