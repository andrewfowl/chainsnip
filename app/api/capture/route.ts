import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { getTimezone, runCapture } from "@/lib/capture"

export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(request: NextRequest) {
  let body: { url?: string; archiveId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // SECURITY: derive the user from the session cookie, never from the request
  // body, so a client cannot write screenshots into another user's namespace.
  const sessionUser = await getCurrentUserFromSession()

  const result = await runCapture({
    url: body.url ?? "",
    archiveId: body.archiveId ?? "",
    userFolder: sessionUser?.id || "anonymous",
    timezone: getTimezone(request.headers),
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { ok: _ok, ...payload } = result
  return NextResponse.json({ success: true, ...payload })
}
