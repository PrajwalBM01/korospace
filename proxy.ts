import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  if (request.nextUrl.pathname === "/") {
    return sessionCookie
      ? NextResponse.redirect(new URL("/chat", request.url))
      : NextResponse.next()
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/api/chat/:path*"],
}