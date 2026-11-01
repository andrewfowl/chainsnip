import { type NextRequest, NextResponse } from "next/server"
import { captureSnapshot, isAuthorizedCron } from "@/lib/scheduled-captures"

export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(request: NextRequest) {
  if (!isAuthorizedCron(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { snapshotId } = (await request.json().catch(() => ({}))) as { snapshotId?: string }
  if (!snapshotId) {
    return NextResponse.json({ error: "snapshotId is required" }, { status: 400 })
  }

  const result = await captureSnapshot(snapshotId)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
