import { NextRequest, NextResponse } from "next/server"
import { getSessionByToken, getUserById } from "@/lib/auth"

// Simple session check endpoint
export async function GET(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value

  if (!token) {
    return NextResponse.json({ user: null })
  }

  const session = await getSessionByToken(token)
  if (!session) {
    return NextResponse.json({ user: null })
  }

  const user = await getUserById(session.user_id)
  return NextResponse.json({ user })
}

export async function POST() {
  return NextResponse.json({ error: "Use server actions for auth operations" }, { status: 400 })
}
