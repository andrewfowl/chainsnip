import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected route prefixes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/projects", "/create"]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the request is for a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get the session cookie
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      // Redirect to login if no session token
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/create/:path*"],
}
